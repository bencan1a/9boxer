/**
 * Mock anomaly data for Storybook and testing
 */

import type {
  Anomaly,
  AnomalySeverity,
  AnomalyType,
} from "../types/intelligence";

/**
 * Create a mock anomaly with specified parameters
 */
export const createMockAnomaly = (
  id: string,
  type: AnomalyType,
  severity: AnomalySeverity,
  title: string,
  description: string,
  affectedCount: number = 5,
  suggestion?: string,
  confidence: number = 0.85
): Anomaly => ({
  id,
  type,
  severity,
  title,
  description,
  affectedEmployees: Array.from(
    { length: affectedCount },
    (_, i) => `emp-${id}-${i}`
  ),
  suggestion,
  confidence,
});

/**
 * Location anomaly: Too many employees in one location
 */
export const mockLocationAnomaly: Anomaly = createMockAnomaly(
  "loc-001",
  "location",
  "warning",
  "Concentration in New York Office",
  "65% of high performers are located in the New York office, significantly higher than expected (25%). This may indicate regional bias in performance assessments.",
  12,
  "Review performance evaluation criteria across locations to ensure consistency.",
  0.92
);

/**
 * Function anomaly: Entire department in wrong box
 */
export const mockFunctionAnomaly: Anomaly = createMockAnomaly(
  "func-001",
  "function",
  "critical",
  "Sales Team Underrepresented in High Performance",
  "Only 5% of Sales team members are rated as high performers, compared to 30% expected. This is statistically significant (p < 0.01).",
  8,
  "Investigate sales team performance metrics and consider adjusting evaluation criteria for sales-specific KPIs.",
  0.95
);

/**
 * Distribution anomaly: Statistically unlikely distribution
 */
export const mockDistributionAnomaly: Anomaly = createMockAnomaly(
  "dist-001",
  "distribution",
  "critical",
  "90% Concentrated in Top-Right Quadrant",
  "An unusually high proportion of employees (90%) are placed in the high performance/high potential box. Expected distribution is approximately 11%.",
  45,
  "Review calibration process to ensure proper differentiation across the 9-box grid.",
  0.98
);

/**
 * Outlier anomaly: Single employee seems misplaced
 */
export const mockOutlierAnomaly: Anomaly = createMockAnomaly(
  "out-001",
  "outlier",
  "info",
  "Senior Engineer in Low Performance Box",
  "A Senior Principal Engineer with 15+ years tenure is placed in the low performance/low potential box, which is unusual for this job level.",
  1,
  "Review this employee's recent performance data and consider if additional context is needed.",
  0.73
);

/**
 * Mixed severity anomalies for testing
 */
export const mockMixedAnomalies: Anomaly[] = [
  mockFunctionAnomaly,
  mockLocationAnomaly,
  createMockAnomaly(
    "ten-001",
    "function",
    "info",
    "New Hires Showing Strong Potential",
    "Employees with less than 1 year tenure show 35% high potential rating, compared to 25% baseline.",
    7,
    "Continue monitoring and ensure proper onboarding support.",
    0.78
  ),
];

/**
 * No anomalies (empty state)
 */
export const mockNoAnomalies: Anomaly[] = [];

/**
 * Many anomalies (stress test)
 */
export const mockManyAnomalies: Anomaly[] = [
  mockFunctionAnomaly,
  mockLocationAnomaly,
  mockDistributionAnomaly,
  mockOutlierAnomaly,
  createMockAnomaly(
    "loc-002",
    "location",
    "warning",
    "Remote Workers Underrated",
    "Remote employees show 15% lower high performance ratings than on-site workers.",
    14,
    "Ensure remote work is not negatively impacting performance assessments.",
    0.88
  ),
  createMockAnomaly(
    "func-002",
    "function",
    "info",
    "Engineering High Performer Trend",
    "Engineering function shows 5% above average high performer rate.",
    10,
    undefined,
    0.82
  ),
  createMockAnomaly(
    "ten-002",
    "outlier",
    "critical",
    "Long-Tenured Employees in Low Box",
    "12 employees with 10+ years tenure are rated low performance/low potential.",
    12,
    "Review whether tenure is being properly considered in assessments.",
    0.91
  ),
];

/**
 * Factory function to create custom anomalies for testing
 */
export const createCustomAnomaly = (
  overrides: Partial<Anomaly> = {}
): Anomaly => ({
  id: `custom-${Date.now()}`,
  type: "location",
  severity: "info",
  title: "Custom Anomaly",
  description: "This is a custom anomaly for testing.",
  affectedEmployees: ["emp-1", "emp-2", "emp-3"],
  confidence: 0.8,
  ...overrides,
});
