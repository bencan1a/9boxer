/**
 * TrackableEvent types for unified employee change tracking
 */

export interface BaseEvent {
  event_id: string;
  employee_id: number;
  employee_name: string;
  timestamp: string;
  notes?: string | null;
}

export interface GridMoveEvent extends BaseEvent {
  event_type: "grid_move";
  old_position: number;
  new_position: number;
  old_performance: string;
  new_performance: string;
  old_potential: string;
  new_potential: string;
}

export interface DonutMoveEvent extends BaseEvent {
  event_type: "donut_move";
  old_position: number;
  new_position: number;
  old_performance: string;
  new_performance: string;
  old_potential: string;
  new_potential: string;
}

export interface FlagAddEvent extends BaseEvent {
  event_type: "flag_add";
  flag: string;
}

export interface FlagRemoveEvent extends BaseEvent {
  event_type: "flag_remove";
  flag: string;
}

// Discriminated union for type safety
export type TrackableEvent =
  | GridMoveEvent
  | DonutMoveEvent
  | FlagAddEvent
  | FlagRemoveEvent;

// Type guard helpers
export function isGridMoveEvent(event: TrackableEvent): event is GridMoveEvent {
  return event.event_type === "grid_move";
}

export function isDonutMoveEvent(
  event: TrackableEvent
): event is DonutMoveEvent {
  return event.event_type === "donut_move";
}

export function isFlagAddEvent(event: TrackableEvent): event is FlagAddEvent {
  return event.event_type === "flag_add";
}

export function isFlagRemoveEvent(
  event: TrackableEvent
): event is FlagRemoveEvent {
  return event.event_type === "flag_remove";
}
