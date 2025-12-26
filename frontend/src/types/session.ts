/**
 * Session data types matching backend models
 */

import { Employee } from "./employee";
import { TrackableEvent } from "./events";

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

  // Event tracking (replaces change tracking)
  events: TrackableEvent[];
  donut_events: TrackableEvent[];
}
