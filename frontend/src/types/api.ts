/**
 * API request and response types
 */

import { Employee } from "./employee";
import { TrackableEvent } from "./events";

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
  session_id: string | null;
  active: boolean;
  employee_count: number;
  changes_count: number;
  events: TrackableEvent[];
  uploaded_filename: string | null;
  created_at: string | null;
  donut_mode_active?: boolean;
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
  change: TrackableEvent;
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

// Calibration Summary types
export interface DataOverview {
  total_employees: number;
  by_level: Record<string, number>;
  by_function: Record<string, number>;
  by_location: Record<string, number>;
  stars_count: number;
  stars_percentage: number;
  center_box_count: number;
  center_box_percentage: number;
  lower_performers_count: number;
  lower_performers_percentage: number;
  high_performers_count: number;
  high_performers_percentage: number;
}

export interface LevelTimeBreakdown {
  level: string;
  employee_count: number;
  minutes: number;
  percentage: number;
}

export interface TimeAllocation {
  estimated_duration_minutes: number;
  breakdown_by_level: LevelTimeBreakdown[];
  suggested_sequence: string[];
}

export interface InsightSourceData {
  z_score?: number;
  p_value?: number;
  observed_pct?: number;
  expected_pct?: number;
  center_count?: number;
  center_pct?: number;
  recommended_max_pct?: number;
  total_minutes?: number;
  by_level?: Record<string, number>;
  category?: string;
  categories_affected?: string[];
}

export type InsightType =
  | "anomaly"
  | "focus_area"
  | "recommendation"
  | "time_allocation";
export type InsightCategory =
  | "location"
  | "function"
  | "level"
  | "tenure"
  | "distribution"
  | "time";
export type InsightPriority = "high" | "medium" | "low";

export interface Insight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  affected_count: number;
  source_data: InsightSourceData;
}

export interface CalibrationSummaryData {
  data_overview: DataOverview;
  time_allocation: TimeAllocation;
  insights: Insight[];
}

export interface LLMAvailability {
  available: boolean;
  reason: string | null;
}

export interface LLMSummaryResult {
  summary: string;
  key_recommendations: string[];
  discussion_points: string[];
  model_used: string;
}

export interface GenerateSummaryRequest {
  selected_insight_ids: string[];
}
