/**
 * Employee data types matching backend models
 */

export enum PerformanceLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum PotentialLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export interface HistoricalRating {
  year: number;
  rating: string; // "Strong", "Solid", "Leading", etc.
}

export interface Employee {
  // Identifiers
  employee_id: number;
  name: string;

  // Job Information
  business_title: string;
  job_title: string;
  job_profile: string;
  job_level: string; // MT1, MT2, MT4, MT5, MT6

  // Management
  manager: string;
  management_chain_04: string | null;
  management_chain_05: string | null;
  management_chain_06: string | null;

  // Tenure
  hire_date: string; // ISO date string
  tenure_category: string;
  time_in_job_profile: string;

  // Current Performance (editable via drag-drop)
  performance: PerformanceLevel;
  potential: PotentialLevel;
  grid_position: number; // 1-9
  position_label: string; // "Top Talent [H,H]", etc.
  talent_indicator: string;

  // Historical Performance
  ratings_history: HistoricalRating[];

  // Development
  development_focus: string | null;
  development_action: string | null;
  notes: string | null;
  promotion_status: string | null;

  // Metadata
  modified_in_session: boolean;
  last_modified: string | null; // ISO datetime string
}
