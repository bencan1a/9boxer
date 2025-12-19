/**
 * Session data types matching backend models
 */

import { Employee, PerformanceLevel, PotentialLevel } from "./employee";

export interface EmployeeMove {
  employee_id: number;
  employee_name: string;
  timestamp: string; // ISO datetime string
  old_performance: PerformanceLevel;
  old_potential: PotentialLevel;
  new_performance: PerformanceLevel;
  new_potential: PotentialLevel;
  old_position: number;
  new_position: number;
  notes?: string | null;
}

export interface SessionState {
  session_id: string;
  user_id: string;
  created_at: string; // ISO datetime string

  // Original uploaded data
  original_employees: Employee[];
  original_filename: string;
  original_file_path: string;

  // Current state (with modifications)
  current_employees: Employee[];

  // Change tracking
  changes: EmployeeMove[];
}
