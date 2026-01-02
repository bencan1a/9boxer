/**
 * API client service using Axios
 *
 * This client uses a dynamic base URL that is initialized at runtime.
 * In Electron mode, the base URL is obtained from the main process to support
 * dynamic port selection when there are port conflicts.
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import {
  UploadResponse,
  SessionStatusResponse,
  EmployeesResponse,
  MoveRequest,
  MoveResponse,
  FilterOptionsResponse,
  StatisticsResponse,
  IntelligenceData,
  DonutModeToggleResponse,
  MoveDonutRequest,
  CalibrationSummaryData,
  LLMAvailability,
  LLMSummaryResult,
  GenerateSummaryRequest,
} from "../types/api";
import { Employee } from "../types/employee";
import { TrackableEvent } from "../types/events";
import { getApiBaseUrl } from "../config";

/**
 * Custom error class that preserves backend error details
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Retry an operation with exponential backoff.
 * Only retries on connection errors (not HTTP 4xx/5xx errors).
 *
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds for exponential backoff (default: 1000ms)
 * @returns Result of the operation
 * @throws The last error if all retries are exhausted
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Only retry on connection errors (no response), not on HTTP errors (4xx/5xx)
      const isAxiosError = axios.isAxiosError(error);
      const hasResponse = isAxiosError && error.response !== undefined;
      const isApiErrorWithStatus =
        error instanceof ApiError && error.statusCode !== undefined;

      if (hasResponse || isApiErrorWithStatus) {
        // Don't retry on HTTP errors (client/server errors)
        throw error;
      }

      // This is a connection error (network issue, timeout, etc.)
      // Calculate delay with exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      const isLastAttempt = attempt === maxRetries - 1;

      if (!isLastAttempt) {
        console.log(
          `[API Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`,
          error instanceof Error ? error.message : String(error)
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(
          `[API Retry] All ${maxRetries} attempts failed`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  // All retries exhausted, throw the last error
  throw lastError!;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Initialize with dynamic base URL from config
    // The base URL is set by initializeConfig() before the API client is used
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor to extract backend error details
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ detail?: string }>) => {
        // Extract backend error detail if available
        const detail = error.response?.data?.detail;
        const statusCode = error.response?.status;

        // Create informative error message
        let message = error.message;
        if (detail) {
          message = detail;
        } else if (statusCode) {
          message = `Request failed with status ${statusCode}`;
        }

        throw new ApiError(message, statusCode, detail);
      }
    );
  }

  /**
   * Update the API client's base URL
   *
   * This method allows updating the base URL after initialization,
   * which is useful when the backend restarts on a different port.
   *
   * @param baseURL - The new base URL to use
   */
  updateBaseUrl(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
    console.log(`[ApiClient] Base URL updated to: ${baseURL}`);
  }

  /**
   * Generic GET request with retry logic
   *
   * This method provides a generic way to make GET requests with the same
   * retry logic that other API methods use via withRetry().
   *
   * @param url - The URL path to request (relative to base URL)
   * @returns Promise with the response data
   */
  async get<T>(url: string): Promise<T> {
    return withRetry(async () => {
      const response = await this.client.get<T>(url);
      return response.data;
    });
  }

  // ==================== Session Methods ====================

  async upload(file: File, filePath?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // Include original file path if provided (for Electron app)
    if (filePath) {
      formData.append("original_file_path", filePath);
    }

    const response = await this.client.post<UploadResponse>(
      "/api/session/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async getSessionStatus(): Promise<SessionStatusResponse> {
    return withRetry(async () => {
      const response = await this.client.get<SessionStatusResponse>(
        "/api/session/status"
      );
      return response.data;
    });
  }

  async clearSession(): Promise<{ success: boolean }> {
    const response = await this.client.delete<{ success: boolean }>(
      "/api/session/clear"
    );
    return response.data;
  }

  async closeSession(): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
    }>("/api/session/close");
    return response.data;
  }

  async exportSession(request?: {
    mode?: "update_original" | "save_new";
    new_path?: string;
  }): Promise<{
    success: boolean;
    message?: string;
    file_path?: string;
    error?: string;
    fallback_to_save_new?: boolean;
  }> {
    const response = await this.client.post<{
      success: boolean;
      message?: string;
      file_path?: string;
      error?: string;
      fallback_to_save_new?: boolean;
    }>("/api/session/export", request || { mode: "update_original" });
    return response.data;
  }

  async updateChangeNotes(
    employeeId: number,
    notes: string
  ): Promise<TrackableEvent> {
    const response = await this.client.patch<TrackableEvent>(
      `/api/session/changes/${employeeId}/notes`,
      { notes }
    );
    return response.data;
  }

  async updateDonutChangeNotes(
    employeeId: number,
    notes: string
  ): Promise<TrackableEvent> {
    const response = await this.client.patch<TrackableEvent>(
      `/api/session/donut-changes/${employeeId}/notes`,
      { notes }
    );
    return response.data;
  }

  async toggleDonutMode(enabled: boolean): Promise<DonutModeToggleResponse> {
    const response = await this.client.post<DonutModeToggleResponse>(
      "/api/session/toggle-donut-mode",
      { enabled }
    );
    return response.data;
  }

  // ==================== Employee Methods ====================

  async getEmployees(filters?: {
    levels?: string[];
    job_profiles?: string[];
    managers?: string[];
    chain_levels?: string[];
    exclude_ids?: number[];
    performance?: string[];
    potential?: string[];
  }): Promise<EmployeesResponse> {
    return withRetry(async () => {
      const params = new URLSearchParams();

      if (filters?.levels?.length) {
        params.append("levels", filters.levels.join(","));
      }
      if (filters?.job_profiles?.length) {
        params.append("job_profiles", filters.job_profiles.join(","));
      }
      if (filters?.managers?.length) {
        params.append("managers", filters.managers.join(","));
      }
      if (filters?.chain_levels?.length) {
        params.append("chain_levels", filters.chain_levels.join(","));
      }
      if (filters?.exclude_ids?.length) {
        params.append("exclude_ids", filters.exclude_ids.join(","));
      }
      if (filters?.performance?.length) {
        params.append("performance", filters.performance.join(","));
      }
      if (filters?.potential?.length) {
        params.append("potential", filters.potential.join(","));
      }

      const response = await this.client.get<EmployeesResponse>(
        "/api/employees",
        {
          params,
        }
      );
      return response.data;
    });
  }

  async getEmployeeById(id: number): Promise<Employee> {
    return withRetry(async () => {
      const response = await this.client.get<Employee>(`/api/employees/${id}`);
      return response.data;
    });
  }

  async moveEmployee(
    employeeId: number,
    performance: string,
    potential: string
  ): Promise<MoveResponse> {
    const response = await this.client.patch<MoveResponse>(
      `/api/employees/${employeeId}/move`,
      {
        performance,
        potential,
      } as MoveRequest
    );
    return response.data;
  }

  async moveEmployeeDonut(
    employeeId: number,
    performance: string,
    potential: string,
    notes?: string
  ): Promise<MoveResponse> {
    const response = await this.client.patch<MoveResponse>(
      `/api/employees/${employeeId}/move-donut`,
      {
        performance,
        potential,
        notes,
      } as MoveDonutRequest
    );
    return response.data;
  }

  async updateEmployee(
    employeeId: number,
    updates: Partial<Employee>
  ): Promise<{ employee: Employee }> {
    const response = await this.client.patch<{ employee: Employee }>(
      `/api/employees/${employeeId}`,
      updates
    );
    return response.data;
  }

  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return withRetry(async () => {
      const response = await this.client.get<FilterOptionsResponse>(
        "/api/employees/filter-options"
      );
      return response.data;
    });
  }

  async generateSampleData(
    size: number,
    include_bias: boolean,
    seed?: number
  ): Promise<{
    employees: Employee[];
    metadata: {
      total: number;
      bias_patterns?: string[];
      locations: string[];
      functions: string[];
    };
    session_id: string;
    filename: string;
  }> {
    const response = await this.client.post("/api/employees/generate-sample", {
      size,
      include_bias,
      seed,
    });
    return response.data;
  }

  // ==================== Statistics Methods ====================

  async getStatistics(): Promise<StatisticsResponse> {
    return withRetry(async () => {
      const response =
        await this.client.get<StatisticsResponse>("/api/statistics");
      return response.data;
    });
  }

  // ==================== Intelligence Methods ====================

  async getIntelligence(): Promise<IntelligenceData> {
    return withRetry(async () => {
      const response =
        await this.client.get<IntelligenceData>("/api/intelligence");
      return response.data;
    });
  }

  // ==================== Calibration Summary Methods ====================

  async getCalibrationSummary(): Promise<CalibrationSummaryData> {
    return withRetry(async () => {
      const response = await this.client.get<CalibrationSummaryData>(
        "/api/calibration-summary"
      );
      return response.data;
    });
  }

  async checkLLMAvailability(): Promise<LLMAvailability> {
    const response = await this.client.get<LLMAvailability>(
      "/api/calibration-summary/llm-availability"
    );
    return response.data;
  }

  async generateLLMSummary(
    selectedInsightIds: string[]
  ): Promise<LLMSummaryResult> {
    const response = await this.client.post<LLMSummaryResult>(
      "/api/calibration-summary/generate-summary",
      { selected_insight_ids: selectedInsightIds } as GenerateSummaryRequest
    );
    return response.data;
  }

  // ==================== Preferences Methods ====================

  async getRecentFiles(): Promise<RecentFile[]> {
    const response = await this.client.get<RecentFile[]>(
      "/api/preferences/recent-files"
    );
    return response.data;
  }

  async addRecentFile(
    path: string,
    name: string
  ): Promise<{ success: boolean }> {
    const response = await this.client.post<{ success: boolean }>(
      "/api/preferences/recent-files",
      {
        path,
        name,
      }
    );
    return response.data;
  }

  async clearRecentFiles(): Promise<{ success: boolean }> {
    const response = await this.client.delete<{ success: boolean }>(
      "/api/preferences/recent-files"
    );
    return response.data;
  }
}

export interface RecentFile {
  path: string;
  name: string;
  lastAccessed: number;
}

export const apiClient = new ApiClient();
