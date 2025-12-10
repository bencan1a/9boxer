/**
 * API client service using Axios
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import {
  LoginRequest,
  TokenResponse,
  UserResponse,
  UploadResponse,
  SessionStatusResponse,
  EmployeesResponse,
  MoveRequest,
  MoveResponse,
  FilterOptionsResponse,
  StatisticsResponse,
  IntelligenceData,
} from "../types/api";
import { Employee } from "../types/employee";
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../config";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add Authorization header
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and activity tracking
    this.client.interceptors.response.use(
      (response) => {
        // Record activity on successful API call to extend session
        const { recordActivity, isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          recordActivity();
        }
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token, expiration, and activity, then redirect to login
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_expires_at");
          localStorage.removeItem("auth_last_activity");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== Auth Methods ====================

  async login(username: string, password: string): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>("/api/auth/login", {
      username,
      password,
    } as LoginRequest);
    return response.data;
  }

  async logout(): Promise<{ success: boolean }> {
    const response = await this.client.post<{ success: boolean }>(
      "/api/auth/logout"
    );
    return response.data;
  }

  async me(): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>("/api/auth/me");
    return response.data;
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
