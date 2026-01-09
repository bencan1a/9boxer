/**
 * API client service using native fetch API
 *
 * This client uses a dynamic base URL that is initialized at runtime.
 * In Electron mode, the base URL is obtained from the main process to support
 * dynamic port selection when there are port conflicts.
 */

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
 * Check if an error is a network/connection error (not an HTTP error)
 */
function isConnectionError(error: unknown): boolean {
  // ApiError with statusCode means we got an HTTP response (not a connection error)
  if (error instanceof ApiError && error.statusCode !== undefined) {
    return false;
  }
  // TypeError is thrown by fetch for network errors
  if (error instanceof TypeError) {
    return true;
  }
  return false;
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
      if (!isConnectionError(error)) {
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
  private baseURL: string;

  constructor() {
    // Initialize with dynamic base URL from config
    // The base URL is set by initializeConfig() before the API client is used
    this.baseURL = getApiBaseUrl();
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
    this.baseURL = baseURL;
    console.log(`[ApiClient] Base URL updated to: ${baseURL}`);
  }

  /**
   * Internal fetch wrapper that handles common error processing
   */
  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const fullUrl = `${this.baseURL}${url}`;

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      // Handle HTTP errors
      if (!response.ok) {
        // Try to extract backend error detail
        let detail: string | undefined;
        let message = `Request failed with status ${response.status}`;

        try {
          const errorData = await response.json();
          if (errorData.detail) {
            detail = errorData.detail;
            message = errorData.detail;
          }
        } catch {
          // If JSON parsing fails, use status text
          message = response.statusText || message;
        }

        throw new ApiError(message, response.status, detail);
      }

      // Parse JSON response
      return await response.json();
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }
      // Wrap other errors (network errors, etc.)
      throw error;
    }
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
      return this.fetch<T>(url, { method: "GET" });
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

    // Note: Don't set Content-Type for FormData, browser will set it with boundary
    const fullUrl = `${this.baseURL}/api/session/upload`;
    const response = await fetch(fullUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let detail: string | undefined;
      let message = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          detail = errorData.detail;
          message = errorData.detail;
        }
      } catch {
        message = response.statusText || message;
      }
      throw new ApiError(message, response.status, detail);
    }

    return await response.json();
  }

  async getSessionStatus(): Promise<SessionStatusResponse> {
    return withRetry(async () => {
      return this.fetch<SessionStatusResponse>("/api/session/status", {
        method: "GET",
      });
    });
  }

  async clearSession(): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>("/api/session/clear", {
      method: "DELETE",
    });
  }

  async closeSession(): Promise<{ success: boolean; message: string }> {
    return this.fetch<{ success: boolean; message: string }>(
      "/api/session/close",
      { method: "POST" }
    );
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
    return this.fetch<{
      success: boolean;
      message?: string;
      file_path?: string;
      error?: string;
      fallback_to_save_new?: boolean;
    }>("/api/session/export", {
      method: "POST",
      body: JSON.stringify(request || { mode: "update_original" }),
    });
  }

  async updateChangeNotes(
    employeeId: number,
    notes: string
  ): Promise<TrackableEvent> {
    return this.fetch<TrackableEvent>(
      `/api/session/changes/${employeeId}/notes`,
      {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      }
    );
  }

  async updateDonutChangeNotes(
    employeeId: number,
    notes: string
  ): Promise<TrackableEvent> {
    return this.fetch<TrackableEvent>(
      `/api/session/donut-changes/${employeeId}/notes`,
      {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      }
    );
  }

  async toggleDonutMode(enabled: boolean): Promise<DonutModeToggleResponse> {
    return this.fetch<DonutModeToggleResponse>(
      "/api/session/toggle-donut-mode",
      {
        method: "POST",
        body: JSON.stringify({ enabled }),
      }
    );
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

      const url = params.toString()
        ? `/api/employees?${params.toString()}`
        : "/api/employees";

      return this.fetch<EmployeesResponse>(url, { method: "GET" });
    });
  }

  async getEmployeeById(id: number): Promise<Employee> {
    return withRetry(async () => {
      return this.fetch<Employee>(`/api/employees/${id}`, { method: "GET" });
    });
  }

  async moveEmployee(
    employeeId: number,
    performance: string,
    potential: string
  ): Promise<MoveResponse> {
    return this.fetch<MoveResponse>(`/api/employees/${employeeId}/move`, {
      method: "PATCH",
      body: JSON.stringify({
        performance,
        potential,
      } as MoveRequest),
    });
  }

  async moveEmployeeDonut(
    employeeId: number,
    performance: string,
    potential: string,
    notes?: string
  ): Promise<MoveResponse> {
    return this.fetch<MoveResponse>(`/api/employees/${employeeId}/move-donut`, {
      method: "PATCH",
      body: JSON.stringify({
        performance,
        potential,
        notes,
      } as MoveDonutRequest),
    });
  }

  async updateEmployee(
    employeeId: number,
    updates: Partial<Employee>
  ): Promise<{ employee: Employee }> {
    return this.fetch<{ employee: Employee }>(`/api/employees/${employeeId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return withRetry(async () => {
      return this.fetch<FilterOptionsResponse>(
        "/api/employees/filter-options",
        { method: "GET" }
      );
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
    return this.fetch("/api/employees/generate-sample", {
      method: "POST",
      body: JSON.stringify({
        size,
        include_bias,
        seed,
      }),
    });
  }

  // ==================== Statistics Methods ====================

  async getStatistics(): Promise<StatisticsResponse> {
    return withRetry(async () => {
      return this.fetch<StatisticsResponse>("/api/statistics", {
        method: "GET",
      });
    });
  }

  // ==================== Intelligence Methods ====================

  async getIntelligence(): Promise<IntelligenceData> {
    return withRetry(async () => {
      return this.fetch<IntelligenceData>("/api/intelligence", {
        method: "GET",
      });
    });
  }

  // ==================== Calibration Summary Methods ====================

  async getCalibrationSummary(params?: {
    useAgent?: boolean;
  }): Promise<CalibrationSummaryData> {
    const { useAgent = true } = params || {};

    return withRetry(async () => {
      // Build query string if useAgent is explicitly false
      const queryParams = new URLSearchParams();
      if (!useAgent) {
        queryParams.append("use_agent", "false");
      }

      const url = queryParams.toString()
        ? `/api/calibration-summary?${queryParams.toString()}`
        : "/api/calibration-summary";

      return this.fetch<CalibrationSummaryData>(url, { method: "GET" });
    });
  }

  async checkLLMAvailability(): Promise<LLMAvailability> {
    return this.fetch<LLMAvailability>(
      "/api/calibration-summary/llm-availability",
      { method: "GET" }
    );
  }

  async generateLLMSummary(
    selectedInsightIds: string[]
  ): Promise<LLMSummaryResult> {
    return this.fetch<LLMSummaryResult>(
      "/api/calibration-summary/generate-summary",
      {
        method: "POST",
        body: JSON.stringify({
          selected_insight_ids: selectedInsightIds,
        } as GenerateSummaryRequest),
      }
    );
  }

  // ==================== Preferences Methods ====================

  async getRecentFiles(): Promise<RecentFile[]> {
    return this.fetch<RecentFile[]>("/api/preferences/recent-files", {
      method: "GET",
    });
  }

  async addRecentFile(
    path: string,
    name: string
  ): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>("/api/preferences/recent-files", {
      method: "POST",
      body: JSON.stringify({
        path,
        name,
      }),
    });
  }

  async clearRecentFiles(): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>("/api/preferences/recent-files", {
      method: "DELETE",
    });
  }
}

export interface RecentFile {
  path: string;
  name: string;
  lastAccessed: number;
}

export const apiClient = new ApiClient();
