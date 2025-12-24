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
  changes: EmployeeMove[];
  uploaded_filename: string;
  created_at: string;
  donut_mode_active: boolean;
}

export interface DonutModeToggleResponse {
  donut_mode_active: boolean;
  session_id: string;
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

export interface MoveDonutRequest {
  performance: string; // "Low", "Medium", "High"
  potential: string; // "Low", "Medium", "High"
  notes?: string;
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
  count: number;
  percentage: number;
}

export interface StatisticsResponse {
  total_employees: number;
  modified_employees: number;
  high_performers: number;
  distribution: PositionDistribution[];
}

// Intelligence types
export interface AnomalyDeviation {
  category: string;
  observed_high_pct: number;
  expected_high_pct: number;
  z_score: number;
  sample_size: number;
  is_significant: boolean;
}

export interface DimensionAnalysis {
  chi_square: number;
  p_value: number;
  effect_size: number;
  degrees_of_freedom: number;
  sample_size: number;
  status: "green" | "yellow" | "red";
  deviations: AnomalyDeviation[];
  interpretation: string;
}

export interface IntelligenceData {
  quality_score: number;
  anomaly_count: {
    green: number;
    yellow: number;
    red: number;
  };
  location_analysis: DimensionAnalysis;
  function_analysis: DimensionAnalysis;
  level_analysis: DimensionAnalysis;
  tenure_analysis: DimensionAnalysis;
}
