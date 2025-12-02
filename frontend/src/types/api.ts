/**
 * API request and response types
 */

import { Employee } from "./employee";
import { EmployeeMove } from "./session";

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  user_id: string;
  username: string;
}

// Session types
export interface UploadResponse {
  session_id: string;
  employee_count: number;
  filename: string;
  uploaded_at: string;
}

export interface SessionStatusResponse {
  session_id: string;
  active: boolean;
  employee_count: number;
  changes_count: number;
  uploaded_filename: string;
  created_at: string;
}

// Employee types
export interface EmployeesResponse {
  employees: Employee[];
  total: number;
  filtered: number;
}

export interface MoveRequest {
  performance: string; // "Low", "Medium", "High"
  potential: string; // "Low", "Medium", "High"
}

export interface MoveResponse {
  employee: Employee;
  change: EmployeeMove;
  success: boolean;
}

export interface FilterOptionsResponse {
  levels: string[];
  job_profiles: string[];
  managers: string[];
  management_chains: {
    chain_04: string[];
    chain_05: string[];
    chain_06: string[];
  };
}

// Statistics types
export interface PositionDistribution {
  grid_position: number;
  position_label: string;
  count: number;
  percentage: number;
}

export interface StatisticsResponse {
  total_employees: number;
  modified_employees: number;
  high_performers: number;
  distribution: PositionDistribution[];
}
