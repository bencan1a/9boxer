/**
 * Flag constants and utilities for employee tagging
 */

/* eslint-disable no-restricted-syntax */
// This file defines semantic flag colors that are part of the design system
// Each flag has a specific meaning (e.g., red for risk, blue for promotion)
// and these colors should remain consistent across the application

export interface FlagDefinition {
  key: string;
  displayName: string;
  color: string;
}

/**
 * Available employee flags
 */
export const FLAGS: Record<string, FlagDefinition> = {
  promotion_ready: {
    key: "promotion_ready",
    displayName: "Promotion Ready",
    color: "#1976d2", // Blue
  },
  flagged_for_discussion: {
    key: "flagged_for_discussion",
    displayName: "Flagged for Discussion",
    color: "#ff9800", // Orange
  },
  flight_risk: {
    key: "flight_risk",
    displayName: "Flight Risk",
    color: "#f44336", // Red
  },
  new_hire: {
    key: "new_hire",
    displayName: "New Hire",
    color: "#4caf50", // Green
  },
  succession_candidate: {
    key: "succession_candidate",
    displayName: "Succession Candidate",
    color: "#9c27b0", // Purple
  },
  pip: {
    key: "pip",
    displayName: "Performance Improvement Plan",
    color: "#f44336", // Red
  },
  high_retention_priority: {
    key: "high_retention_priority",
    displayName: "High Retention Priority",
    color: "#ffc107", // Gold
  },
  ready_for_lateral_move: {
    key: "ready_for_lateral_move",
    displayName: "Ready for Lateral Move",
    color: "#009688", // Teal
  },
  big_mover: {
    key: "big_mover",
    displayName: "Big Mover",
    color: "#00BCD4", // Cyan
  },
  medium_mover: {
    key: "medium_mover",
    displayName: "Medium Mover",
    color: "#7986CB", // Indigo
  },
};

/**
 * Flags computed by the backend from movement between calibrations rather than
 * assigned by a user. They are injected into an employee's flags array so they
 * filter like any other flag, but they must never be sent back on an update -
 * the API rejects them as invalid, and they would be recomputed anyway.
 */
export const DERIVED_FLAGS: ReadonlySet<string> = new Set([
  "big_mover",
  "medium_mover",
]);

/**
 * Check whether a flag is computed rather than user-assigned
 */
export const isDerivedFlag = (key: string): boolean => DERIVED_FLAGS.has(key);

/**
 * Strip computed flags, leaving only the user-assigned ones safe to persist
 */
export const toPersistableFlags = (flags: string[]): string[] =>
  flags.filter((flag) => !isDerivedFlag(flag));

/**
 * Get all flag definitions as an array
 */
export const getAllFlags = (): FlagDefinition[] => {
  return Object.values(FLAGS);
};

/**
 * Get flag definition by key
 */
export const getFlagDefinition = (key: string): FlagDefinition | undefined => {
  return FLAGS[key];
};

/**
 * Get flag display name by key
 */
export const getFlagDisplayName = (key: string): string => {
  return FLAGS[key]?.displayName || key;
};

/**
 * Get flag color by key
 */
export const getFlagColor = (key: string): string => {
  return FLAGS[key]?.color || "#757575"; // Default grey
};
