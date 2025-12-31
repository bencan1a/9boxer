/**
 * Flag constants and utilities for employee tagging
 */

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
};

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
