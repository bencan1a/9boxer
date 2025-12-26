/**
 * Mock insight data for Storybook and testing
 */

import type { Insight, InsightType, BoxPosition } from "../types/intelligence";

/**
 * Create a mock insight with specified parameters
 */
export const createMockInsight = (
  id: string,
  type: InsightType,
  text: string,
  confidence: number = 0.85,
  actionLabel?: string,
  metadata?: {
    employeeCount?: number;
    affectedBoxes?: BoxPosition[];
  }
): Insight => ({
  id,
  type,
  text,
  confidence,
  actionLabel,
  metadata,
});

/**
 * High confidence recommendation
 */
export const mockRecommendationHigh: Insight = createMockInsight(
  "rec-001",
  "recommendation",
  "Consider creating a succession plan for the 8 employees in the high performance/high potential box (position 9). These are your key talent assets.",
  0.95,
  "View High Performers",
  {
    employeeCount: 8,
    affectedBoxes: [9],
  }
);

/**
 * Medium confidence recommendation
 */
export const mockRecommendationMedium: Insight = createMockInsight(
  "rec-002",
  "recommendation",
  "The 5 employees in the high potential/low performance box (position 7) may benefit from targeted coaching and mentorship programs to improve their performance.",
  0.72,
  "View Development Candidates",
  {
    employeeCount: 5,
    affectedBoxes: [7],
  }
);

/**
 * Low confidence recommendation
 */
export const mockRecommendationLow: Insight = createMockInsight(
  "rec-003",
  "recommendation",
  "Consider reviewing the performance criteria for employees in positions 1-3, as there may be opportunities for improvement with proper support.",
  0.58,
  "Export List",
  {
    employeeCount: 12,
    affectedBoxes: [1, 2, 3],
  }
);

/**
 * Observation insight
 */
export const mockObservation: Insight = createMockInsight(
  "obs-001",
  "observation",
  "Your talent distribution shows a healthy spread across the grid with 11% in the top-right box, which aligns with industry standards.",
  0.89,
  undefined,
  {
    employeeCount: 50,
    affectedBoxes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  }
);

/**
 * Warning insight
 */
export const mockWarning: Insight = createMockInsight(
  "warn-001",
  "warning",
  "Only 2 employees are rated in the bottom-left box (position 1). Consider whether this accurately reflects your talent distribution or if there's grade inflation.",
  0.81,
  "Review Low Performers",
  {
    employeeCount: 2,
    affectedBoxes: [1],
  }
);

/**
 * Mixed insights for testing
 */
export const mockMixedInsights: Insight[] = [
  mockRecommendationHigh,
  mockObservation,
  createMockInsight(
    "rec-004",
    "recommendation",
    "Consider promoting or providing stretch assignments to the 3 employees in position 6 (high performance/medium potential) to test their readiness for advancement.",
    0.88,
    "View Candidates",
    {
      employeeCount: 3,
      affectedBoxes: [6],
    }
  ),
];

/**
 * No insights (empty state)
 */
export const mockNoInsights: Insight[] = [];

/**
 * Many insights (full panel)
 */
export const mockManyInsights: Insight[] = [
  mockRecommendationHigh,
  mockRecommendationMedium,
  mockObservation,
  mockWarning,
  createMockInsight(
    "obs-002",
    "observation",
    "Your engineering team shows stronger performance ratings than other functions, with 35% in high-performance boxes.",
    0.84,
    undefined,
    { employeeCount: 18 }
  ),
  createMockInsight(
    "rec-005",
    "recommendation",
    "The 7 employees in position 4 (low performance/medium potential) may need performance improvement plans or role adjustments.",
    0.76,
    "View At-Risk Employees",
    {
      employeeCount: 7,
      affectedBoxes: [4],
    }
  ),
  createMockInsight(
    "warn-002",
    "warning",
    "There's a notable absence of employees in positions 2 and 3. This may indicate reluctance to rate people in low-performance categories.",
    0.79,
    undefined,
    {
      employeeCount: 0,
      affectedBoxes: [2, 3],
    }
  ),
];

/**
 * Factory function to create custom insights for testing
 */
export const createCustomInsight = (
  overrides: Partial<Insight> = {}
): Insight => ({
  id: `custom-${Date.now()}`,
  type: "observation",
  text: "This is a custom insight for testing.",
  confidence: 0.8,
  ...overrides,
});
