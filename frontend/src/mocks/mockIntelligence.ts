/**
 * Mock data for Intelligence tab components
 * Provides realistic statistical scenarios for DimensionAnalysis and ManagerAnalysis
 */

import type {
  DimensionAnalysis,
  AnomalyDeviation,
  ManagerAnalysis,
  ManagerDeviation,
} from "../types/api";
import { createManagerDeviation } from "./mockChartData";

/**
 * Creates a mock deviation with realistic statistical values
 */
const createDeviation = (
  category: string,
  observedHighPct: number,
  expectedHighPct: number,
  sampleSize: number,
  isSignificant: boolean
): AnomalyDeviation => {
  // Calculate z-score based on observed vs expected difference
  const diff = observedHighPct - expectedHighPct;
  const zScore =
    diff / Math.sqrt((expectedHighPct * (100 - expectedHighPct)) / sampleSize);

  return {
    category,
    observed_high_pct: observedHighPct,
    expected_high_pct: expectedHighPct,
    z_score: zScore,
    sample_size: sampleSize,
    is_significant: isSignificant,
  };
};

/**
 * Green status - No significant issues (p > 0.05)
 */
export const mockGreenAnalysis: DimensionAnalysis = {
  chi_square: 3.84,
  p_value: 0.427, // > 0.05, not significant
  effect_size: 0.08, // Small effect size
  degrees_of_freedom: 4,
  sample_size: 150,
  status: "green",
  deviations: [
    createDeviation("New York", 31.5, 33.0, 40, false),
    createDeviation("San Francisco", 34.2, 33.0, 35, false),
    createDeviation("Chicago", 32.8, 33.0, 38, false),
    createDeviation("Austin", 33.1, 33.0, 22, false),
    createDeviation("Remote", 32.5, 33.0, 15, false),
  ],
  interpretation:
    "No significant deviations detected in performance distribution across locations. The distribution appears balanced and within expected ranges.",
};

/**
 * Yellow status - Moderate anomaly (p < 0.05 but p >= 0.01)
 */
export const mockYellowAnalysis: DimensionAnalysis = {
  chi_square: 11.47,
  p_value: 0.022, // < 0.05 but >= 0.01, moderate significance
  effect_size: 0.24, // Medium effect size
  degrees_of_freedom: 5,
  sample_size: 200,
  status: "yellow",
  deviations: [
    createDeviation("Engineering", 42.5, 33.0, 80, true),
    createDeviation("Sales", 28.3, 33.0, 45, false),
    createDeviation("Marketing", 31.8, 33.0, 30, false),
    createDeviation("Operations", 35.2, 33.0, 25, false),
    createDeviation("Finance", 29.5, 33.0, 12, false),
    createDeviation("HR", 33.7, 33.0, 8, false),
  ],
  interpretation:
    "Moderate anomaly detected: Engineering shows higher than expected proportion of high performers (42.5% vs 33.0% expected). This may warrant further investigation to understand contributing factors.",
};

/**
 * Red status - Severe anomaly (p < 0.01)
 */
export const mockRedAnalysis: DimensionAnalysis = {
  chi_square: 24.73,
  p_value: 0.0003, // < 0.001, highly significant
  effect_size: 0.48, // Large effect size
  degrees_of_freedom: 6,
  sample_size: 250,
  status: "red",
  deviations: [
    createDeviation("IC (Individual Contributor)", 25.4, 33.0, 120, true),
    createDeviation("Team Lead", 38.2, 33.0, 55, false),
    createDeviation("Manager", 48.7, 33.0, 40, true),
    createDeviation("Senior Manager", 52.3, 33.0, 20, true),
    createDeviation("Director", 45.8, 33.0, 10, false),
    createDeviation("VP", 55.0, 33.0, 3, false),
    createDeviation("C-Level", 50.0, 33.0, 2, false),
  ],
  interpretation:
    "Severe anomaly detected: Significant bias toward higher performance ratings at senior levels. Individual contributors show 25.4% high performers vs 33.0% expected, while Managers and Senior Managers show 48.7% and 52.3% respectively. This suggests potential rating inflation at higher levels or systemic bias in performance evaluation.",
};

/**
 * Small sample size scenario (< 30 total)
 */
export const mockSmallSampleAnalysis: DimensionAnalysis = {
  chi_square: 2.14,
  p_value: 0.543,
  effect_size: 0.21,
  degrees_of_freedom: 3,
  sample_size: 24,
  status: "green",
  deviations: [
    createDeviation("Team A", 37.5, 33.0, 8, false),
    createDeviation("Team B", 28.6, 33.0, 7, false),
    createDeviation("Team C", 33.3, 33.0, 6, false),
    createDeviation("Team D", 33.3, 33.0, 3, false),
  ],
  interpretation:
    "Note: Small sample size (n=24) limits statistical power. No significant deviations detected, but results should be interpreted with caution due to limited data.",
};

/**
 * Large sample size scenario (1000+)
 */
export const mockLargeSampleAnalysis: DimensionAnalysis = {
  chi_square: 35.62,
  p_value: 0.000012, // Very small p-value
  effect_size: 0.19, // Small-medium effect size but highly significant due to large n
  degrees_of_freedom: 8,
  sample_size: 1240,
  status: "red",
  deviations: [
    createDeviation("0-1 years", 28.5, 33.0, 185, true),
    createDeviation("1-3 years", 31.2, 33.0, 220, false),
    createDeviation("3-5 years", 34.8, 33.0, 195, false),
    createDeviation("5-7 years", 36.1, 33.0, 165, true),
    createDeviation("7-10 years", 35.4, 33.0, 142, false),
    createDeviation("10-15 years", 32.8, 33.0, 128, false),
    createDeviation("15-20 years", 31.5, 33.0, 95, false),
    createDeviation("20-25 years", 30.2, 33.0, 68, false),
    createDeviation("25+ years", 29.8, 33.0, 42, false),
  ],
  interpretation:
    "With a large sample size (n=1240), even small deviations can be statistically significant. New hires (0-1 years) show lower high performer rates (28.5% vs 33.0%), while mid-tenure employees (5-7 years) show slightly higher rates (36.1% vs 33.0%). These patterns may reflect onboarding curves and career development trajectories.",
};

/**
 * Analysis with all non-significant deviations (all green bars)
 */
export const mockAllNonSignificant: DimensionAnalysis = {
  chi_square: 1.23,
  p_value: 0.873,
  effect_size: 0.04,
  degrees_of_freedom: 3,
  sample_size: 180,
  status: "green",
  deviations: [
    createDeviation("Product A", 33.5, 33.0, 60, false),
    createDeviation("Product B", 32.8, 33.0, 55, false),
    createDeviation("Product C", 33.2, 33.0, 45, false),
    createDeviation("Product D", 32.5, 33.0, 20, false),
  ],
  interpretation:
    "Performance distribution is well-balanced across all product lines. No significant deviations detected - ratings appear consistent and fair across teams.",
};

/**
 * Analysis with mixed significance levels (green/yellow/red bars)
 */
export const mockMixedSignificance: DimensionAnalysis = {
  chi_square: 18.94,
  p_value: 0.008,
  effect_size: 0.32,
  degrees_of_freedom: 7,
  sample_size: 280,
  status: "red",
  deviations: [
    createDeviation("Dept A", 48.5, 33.0, 62, true), // Highly significant
    createDeviation("Dept B", 39.2, 33.0, 51, true), // Significant
    createDeviation("Dept C", 33.5, 33.0, 45, false), // Not significant
    createDeviation("Dept D", 31.8, 33.0, 38, false), // Not significant
    createDeviation("Dept E", 25.4, 33.0, 35, true), // Significant
    createDeviation("Dept F", 32.2, 33.0, 28, false), // Not significant
    createDeviation("Dept G", 22.7, 33.0, 15, true), // Highly significant
    createDeviation("Dept H", 34.1, 33.0, 6, false), // Not significant
  ],
  interpretation:
    "Mixed performance distribution detected: Departments A and B show significantly higher high performer rates, while Departments E and G show significantly lower rates. This suggests inconsistency in evaluation standards across departments.",
};

/**
 * Single category edge case
 */
export const mockSingleCategory: DimensionAnalysis = {
  chi_square: 0.0,
  p_value: 1.0,
  effect_size: 0.0,
  degrees_of_freedom: 0,
  sample_size: 45,
  status: "green",
  deviations: [createDeviation("All Employees", 33.3, 33.0, 45, false)],
  interpretation:
    "Single category analysis - no comparative deviations possible. Overall high performer rate (33.3%) aligns with expected baseline (33.0%).",
};

/**
 * Empty deviations edge case
 */
export const mockEmptyDeviations: DimensionAnalysis = {
  chi_square: 0.0,
  p_value: 1.0,
  effect_size: 0.0,
  degrees_of_freedom: 0,
  sample_size: 0,
  status: "green",
  deviations: [],
  interpretation:
    "Insufficient data for statistical analysis. Please ensure employees have valid data for this dimension.",
};

/**
 * Analysis with very long category names (for testing text wrapping)
 */
export const mockLongCategoryNames: DimensionAnalysis = {
  chi_square: 8.52,
  p_value: 0.074,
  effect_size: 0.18,
  degrees_of_freedom: 4,
  sample_size: 165,
  status: "green",
  deviations: [
    createDeviation(
      "Enterprise Solutions and Strategic Partnerships Division",
      35.2,
      33.0,
      55,
      false
    ),
    createDeviation(
      "Customer Success and Technical Support Operations",
      31.8,
      33.0,
      48,
      false
    ),
    createDeviation(
      "Research and Development Innovation Lab",
      34.5,
      33.0,
      38,
      false
    ),
    createDeviation("Marketing and Communications Team", 31.2, 33.0, 24, false),
  ],
  interpretation:
    "No significant deviations detected across departments. Performance distribution appears balanced despite varying team sizes and functions.",
};

// =============================================================================
// Manager Analysis Mocks
// =============================================================================

/**
 * Green status - Well-calibrated managers (close to 20/70/10 baseline)
 */
export const mockGreenManagerAnalysis: ManagerAnalysis = {
  chi_square: 0.0,
  p_value: 0.85,
  effect_size: 0.05,
  degrees_of_freedom: 0,
  sample_size: 150,
  status: "green",
  deviations: [
    createManagerDeviation("Manager A", 20, 20.0, 70.0, 10.0),
    createManagerDeviation("Manager B", 18, 22.2, 66.7, 11.1),
    createManagerDeviation("Manager C", 22, 18.2, 72.7, 9.1),
  ],
  interpretation:
    "Manager rating distributions are generally aligned with the 20/70/10 baseline. No significant anomalies detected.",
};

/**
 * Yellow status - Moderate manager bias detected
 */
export const mockYellowManagerAnalysis: ManagerAnalysis = {
  chi_square: 0.0,
  p_value: 0.032,
  effect_size: 0.25,
  degrees_of_freedom: 0,
  sample_size: 150,
  status: "yellow",
  deviations: [
    createManagerDeviation("Slightly High Manager", 20, 28.0, 65.0, 7.0),
    createManagerDeviation("Well Calibrated", 22, 18.2, 72.7, 9.1),
    createManagerDeviation("Slightly Low Manager", 19, 15.8, 73.7, 10.5),
  ],
  interpretation:
    "Notable manager rating pattern detected (p=0.0320, medium effect). Slightly High Manager (team size: 20): 28.0% high performers (vs 20% baseline, above by 8.0%). Total deviation: 16.0% (z=1.79). Small sample sizes limit statistical significance.",
};

/**
 * Red status - Severe manager bias detected
 */
export const mockRedManagerAnalysis: ManagerAnalysis = {
  chi_square: 0.0,
  p_value: 0.0001,
  effect_size: 0.52,
  degrees_of_freedom: 0,
  sample_size: 150,
  status: "red",
  deviations: [
    createManagerDeviation("High Bias Manager", 20, 50.0, 45.0, 5.0),
    createManagerDeviation("Low Bias Manager", 18, 5.6, 77.8, 16.7),
    createManagerDeviation("Well Calibrated", 22, 18.2, 72.7, 9.1),
  ],
  interpretation:
    "Manager rating bias detected (2 managers with significant deviations) (p=0.0001, large effect). High Bias Manager (team size: 20): 50.0% high performers (vs 20% baseline, above by 30.0%). Total deviation: 60.0% (z=6.71).",
};

// =============================================================================
// Full IntelligenceData Mocks for IntelligenceSummary Component
// =============================================================================

import type { IntelligenceData } from "../types/api";

/**
 * Excellent quality intelligence data (score 85+)
 * All green status, no significant anomalies
 */
export const mockExcellentIntelligence: IntelligenceData = {
  quality_score: 92,
  anomaly_count: {
    green: 5,
    yellow: 0,
    red: 0,
  },
  location_analysis: mockAllNonSignificant,
  function_analysis: mockGreenAnalysis,
  level_analysis: mockGreenAnalysis,
  tenure_analysis: mockGreenAnalysis,
  manager_analysis: mockGreenManagerAnalysis,
};

/**
 * Good quality intelligence data (score 65-84)
 * Some yellow status, moderate anomalies
 */
export const mockGoodIntelligence: IntelligenceData = {
  quality_score: 73,
  anomaly_count: {
    green: 2,
    yellow: 3,
    red: 0,
  },
  location_analysis: mockYellowAnalysis,
  function_analysis: mockGreenAnalysis,
  level_analysis: mockYellowAnalysis,
  tenure_analysis: mockGreenAnalysis,
  manager_analysis: mockYellowManagerAnalysis,
};

/**
 * Needs attention intelligence data (score < 50)
 * Multiple red status, significant anomalies
 */
export const mockNeedsAttentionIntelligence: IntelligenceData = {
  quality_score: 42,
  anomaly_count: {
    green: 0,
    yellow: 1,
    red: 4,
  },
  location_analysis: mockRedAnalysis,
  function_analysis: mockRedAnalysis,
  level_analysis: mockYellowAnalysis,
  tenure_analysis: mockRedAnalysis,
  manager_analysis: mockRedManagerAnalysis,
};

/**
 * High anomaly count (20+ anomalies)
 * Testing display with many items
 */
export const mockHighAnomalyCount: IntelligenceData = {
  quality_score: 35,
  anomaly_count: {
    green: 1,
    yellow: 8,
    red: 16,
  },
  location_analysis: mockMixedSignificance,
  function_analysis: mockRedAnalysis,
  level_analysis: mockRedAnalysis,
  tenure_analysis: mockLargeSampleAnalysis,
  manager_analysis: mockRedManagerAnalysis,
};

/**
 * Low anomaly count (0-3 anomalies)
 * Mostly green, very healthy
 */
export const mockLowAnomalyCount: IntelligenceData = {
  quality_score: 95,
  anomaly_count: {
    green: 5,
    yellow: 0,
    red: 0,
  },
  location_analysis: mockGreenAnalysis,
  function_analysis: mockAllNonSignificant,
  level_analysis: mockGreenAnalysis,
  tenure_analysis: mockSmallSampleAnalysis,
  manager_analysis: mockGreenManagerAnalysis,
};

/**
 * Mixed quality (default story data)
 * Realistic mix of green, yellow, red
 */
export const mockMixedIntelligence: IntelligenceData = {
  quality_score: 67,
  anomaly_count: {
    green: 1,
    yellow: 3,
    red: 1,
  },
  location_analysis: mockYellowAnalysis,
  function_analysis: mockRedAnalysis,
  level_analysis: mockYellowAnalysis,
  tenure_analysis: mockGreenAnalysis,
  manager_analysis: mockYellowManagerAnalysis,
};
