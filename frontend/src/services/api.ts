/**
 * API client service using Axios
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
} from "../types/api";
import { Employee } from "../types/employee";
import { EmployeeMove } from "../types/session";
import { API_BASE_URL } from "../config";

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

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
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

  // ==================== Session Methods ====================

  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

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
    const response = await this.client.get<SessionStatusResponse>(
      "/api/session/status"
    );
    return response.data;
  }

  async clearSession(): Promise<{ success: boolean }> {
    const response = await this.client.delete<{ success: boolean }>(
      "/api/session/clear"
    );
    return response.data;
  }

  async exportSession(): Promise<Blob> {
    const response = await this.client.post("/api/session/export", null, {
      responseType: "blob",
    });
    return response.data;
  }

  async updateChangeNotes(employeeId: number, notes: string): Promise<EmployeeMove> {
    const response = await this.client.patch<EmployeeMove>(
      `/api/session/changes/${employeeId}/notes`,
      { notes }
    );
    return response.data;
  }

  async updateDonutChangeNotes(employeeId: number, notes: string): Promise<EmployeeMove> {
    const response = await this.client.patch<EmployeeMove>(
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

    const response = await this.client.get<EmployeesResponse>("/api/employees", {
      params,
    });
    return response.data;
  }

  async getEmployeeById(id: number): Promise<Employee> {
    const response = await this.client.get<Employee>(`/api/employees/${id}`);
    return response.data;
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
    const response = await this.client.get<FilterOptionsResponse>(
      "/api/employees/filter-options"
    );
    return response.data;
  }

  // ==================== Statistics Methods ====================

  async getStatistics(): Promise<StatisticsResponse> {
    const response = await this.client.get<StatisticsResponse>("/api/statistics");
    return response.data;
  }

  // ==================== Intelligence Methods ====================

  async getIntelligence(): Promise<IntelligenceData> {
    const response = await this.client.get<IntelligenceData>("/api/intelligence");
    return response.data;
  }
}

export const apiClient = new ApiClient();
