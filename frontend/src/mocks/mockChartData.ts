/**
 * Mock chart data for DeviationChart and LevelDistributionChart
 * Used in Storybook stories and testing
 */

import { ManagerDeviation as APIManagerDeviation } from "../types/api";

/**
 * Types matching the chart component interfaces
 */
export interface AnomalyDeviation {
  category: string;
  observed_high_pct: number;
  expected_high_pct: number;
  z_score: number;
  p_value?: number;
  sample_size: number;
  is_significant: boolean;
}

export interface LevelDistribution {
  level: string;
  low_pct: number;
  low_count: number;
  medium_pct: number;
  medium_count: number;
  high_pct: number;
  high_count: number;
  total: number;
}

/**
 * Helper to create a deviation data point
 */
export const createDeviation = (
  category: string,
  observedHighPct: number,
  expectedHighPct: number = 25,
  sampleSize: number = 100
): AnomalyDeviation => {
  // Calculate z-score based on difference
  const diff = observedHighPct - expectedHighPct;
  const stdError = Math.sqrt(
    (expectedHighPct * (100 - expectedHighPct)) / sampleSize
  );
  const zScore = diff / stdError;

  // Calculate p-value approximation (two-tailed test)
  const pValue =
    Math.abs(zScore) > 2.58
      ? 0.001
      : Math.abs(zScore) > 1.96
        ? 0.05
        : Math.abs(zScore) > 1.64
          ? 0.1
          : 0.2;

  // Determine significance (p < 0.05)
  const isSignificant = Math.abs(zScore) > 1.96;

  return {
    category,
    observed_high_pct: observedHighPct,
    expected_high_pct: expectedHighPct,
    z_score: zScore,
    p_value: pValue,
    sample_size: sampleSize,
    is_significant: isSignificant,
  };
};

/**
 * Helper to create a level distribution data point
 */
export const createLevelDistribution = (
  level: string,
  lowCount: number,
  mediumCount: number,
  highCount: number
): LevelDistribution => {
  const total = lowCount + mediumCount + highCount;
  return {
    level,
    low_pct: total === 0 ? 0 : (lowCount / total) * 100,
    low_count: lowCount,
    medium_pct: total === 0 ? 0 : (mediumCount / total) * 100,
    medium_count: mediumCount,
    high_pct: total === 0 ? 0 : (highCount / total) * 100,
    high_count: highCount,
    total,
  };
};

// ============================================================================
// DeviationChart Mock Data
// ============================================================================

/**
 * Small dataset (3-5 categories)
 */
export const mockDeviationSmall: AnomalyDeviation[] = [
  createDeviation("Engineering", 32, 25, 80),
  createDeviation("Sales", 18, 25, 60),
  createDeviation("Marketing", 26, 25, 40),
];

/**
 * Medium dataset (6-10 categories)
 */
export const mockDeviationMedium: AnomalyDeviation[] = [
  createDeviation("Engineering", 35, 25, 120),
  createDeviation("Sales", 15, 25, 80),
  createDeviation("Marketing", 28, 25, 60),
  createDeviation("Product", 22, 25, 50),
  createDeviation("Design", 30, 25, 40),
  createDeviation("Operations", 20, 25, 70),
  createDeviation("Finance", 24, 25, 45),
  createDeviation("HR", 26, 25, 30),
];

/**
 * Large dataset (15+ categories)
 */
export const mockDeviationLarge: AnomalyDeviation[] = [
  createDeviation("Engineering", 35, 25, 150),
  createDeviation("Sales", 15, 25, 100),
  createDeviation("Marketing", 28, 25, 80),
  createDeviation("Product", 22, 25, 60),
  createDeviation("Design", 30, 25, 50),
  createDeviation("Operations", 20, 25, 90),
  createDeviation("Finance", 24, 25, 55),
  createDeviation("HR", 26, 25, 40),
  createDeviation("Customer Success", 18, 25, 70),
  createDeviation("Legal", 23, 25, 25),
  createDeviation("IT", 27, 25, 45),
  createDeviation("Data Science", 38, 25, 35),
  createDeviation("QA", 21, 25, 50),
  createDeviation("DevOps", 29, 25, 40),
  createDeviation("Security", 31, 25, 30),
  createDeviation("Research", 40, 25, 20),
];

/**
 * All non-significant (all green bars)
 */
export const mockDeviationAllGreen: AnomalyDeviation[] = [
  createDeviation("Engineering", 26, 25, 100),
  createDeviation("Sales", 24, 25, 100),
  createDeviation("Marketing", 25, 25, 100),
  createDeviation("Product", 24, 25, 100),
  createDeviation("Design", 26, 25, 100),
];

/**
 * Mixed significance (green/yellow/red bars)
 */
export const mockDeviationMixed: AnomalyDeviation[] = [
  createDeviation("Engineering", 45, 25, 120), // Red - highly significant
  createDeviation("Sales", 15, 25, 100), // Red - highly significant
  createDeviation("Marketing", 32, 25, 80), // Yellow - moderately significant
  createDeviation("Product", 26, 25, 90), // Green - not significant
  createDeviation("Design", 23, 25, 70), // Green - not significant
  createDeviation("Operations", 18, 25, 110), // Yellow - moderately significant
];

/**
 * All highly significant (all red bars)
 */
export const mockDeviationAllRed: AnomalyDeviation[] = [
  createDeviation("Engineering", 50, 25, 150),
  createDeviation("Sales", 10, 25, 120),
  createDeviation("Marketing", 5, 25, 100),
  createDeviation("Product", 55, 25, 80),
  createDeviation("Design", 60, 25, 60),
];

/**
 * Empty state
 */
export const mockDeviationEmpty: AnomalyDeviation[] = [];

/**
 * Single category
 */
export const mockDeviationSingle: AnomalyDeviation[] = [
  createDeviation("Engineering", 45, 25, 200),
];

/**
 * Long category names (test text wrapping)
 */
export const mockDeviationLongNames: AnomalyDeviation[] = [
  createDeviation("Engineering & Technology Development", 35, 25, 100),
  createDeviation("Sales & Business Development", 18, 25, 80),
  createDeviation("Marketing & Communications", 28, 25, 70),
  createDeviation("Product Management & Strategy", 22, 25, 60),
  createDeviation("User Experience & Design", 30, 25, 50),
  createDeviation("Operations & Infrastructure", 20, 25, 90),
];

// ============================================================================
// LevelDistributionChart Mock Data
// ============================================================================

/**
 * Normal distribution (balanced Low/Med/High)
 */
export const mockLevelDistributionNormal: LevelDistribution[] = [
  createLevelDistribution("MT1", 2, 8, 5),
  createLevelDistribution("MT2", 3, 10, 7),
  createLevelDistribution("MT3", 4, 15, 10),
  createLevelDistribution("MT4", 5, 12, 8),
  createLevelDistribution("MT5", 3, 8, 6),
  createLevelDistribution("MT6", 2, 5, 4),
];

/**
 * Skewed toward high performers
 */
export const mockLevelDistributionHighSkew: LevelDistribution[] = [
  createLevelDistribution("MT1", 1, 3, 12),
  createLevelDistribution("MT2", 2, 5, 18),
  createLevelDistribution("MT3", 1, 4, 20),
  createLevelDistribution("MT4", 2, 6, 15),
  createLevelDistribution("MT5", 1, 3, 10),
  createLevelDistribution("MT6", 0, 2, 8),
];

/**
 * Skewed toward low performers
 */
export const mockLevelDistributionLowSkew: LevelDistribution[] = [
  createLevelDistribution("MT1", 15, 5, 2),
  createLevelDistribution("MT2", 18, 8, 3),
  createLevelDistribution("MT3", 20, 6, 2),
  createLevelDistribution("MT4", 12, 7, 4),
  createLevelDistribution("MT5", 10, 4, 1),
  createLevelDistribution("MT6", 8, 3, 1),
];

/**
 * Few levels (3-4)
 */
export const mockLevelDistributionFew: LevelDistribution[] = [
  createLevelDistribution("Junior", 8, 15, 7),
  createLevelDistribution("Mid-Level", 6, 20, 14),
  createLevelDistribution("Senior", 4, 12, 18),
];

/**
 * Many levels (10-12)
 */
export const mockLevelDistributionMany: LevelDistribution[] = [
  createLevelDistribution("IC1", 2, 4, 2),
  createLevelDistribution("IC2", 3, 6, 4),
  createLevelDistribution("IC3", 4, 8, 5),
  createLevelDistribution("IC4", 5, 10, 7),
  createLevelDistribution("IC5", 4, 9, 8),
  createLevelDistribution("IC6", 3, 7, 6),
  createLevelDistribution("M1", 2, 5, 4),
  createLevelDistribution("M2", 3, 6, 5),
  createLevelDistribution("M3", 2, 5, 6),
  createLevelDistribution("M4", 1, 4, 5),
  createLevelDistribution("M5", 1, 3, 4),
  createLevelDistribution("M6", 0, 2, 3),
];

/**
 * Empty state
 */
export const mockLevelDistributionEmpty: LevelDistribution[] = [];

/**
 * Single level
 */
export const mockLevelDistributionSingle: LevelDistribution[] = [
  createLevelDistribution("MT3", 10, 25, 15),
];

/**
 * Very small sample sizes
 */
export const mockLevelDistributionSmallSamples: LevelDistribution[] = [
  createLevelDistribution("MT1", 1, 1, 1),
  createLevelDistribution("MT2", 0, 2, 1),
  createLevelDistribution("MT3", 1, 1, 0),
  createLevelDistribution("MT4", 0, 1, 2),
  createLevelDistribution("MT5", 2, 0, 1),
];

/**
 * Different baseline percentages (15%)
 */
export const mockLevelDistributionLowBaseline: LevelDistribution[] = [
  createLevelDistribution("MT1", 5, 8, 2),
  createLevelDistribution("MT2", 6, 12, 3),
  createLevelDistribution("MT3", 8, 15, 4),
  createLevelDistribution("MT4", 7, 10, 3),
  createLevelDistribution("MT5", 4, 6, 2),
  createLevelDistribution("MT6", 3, 4, 1),
];

/**
 * Different baseline percentages (40%)
 */
export const mockLevelDistributionHighBaseline: LevelDistribution[] = [
  createLevelDistribution("MT1", 2, 3, 10),
  createLevelDistribution("MT2", 3, 5, 17),
  createLevelDistribution("MT3", 2, 4, 19),
  createLevelDistribution("MT4", 3, 6, 16),
  createLevelDistribution("MT5", 1, 4, 12),
  createLevelDistribution("MT6", 1, 2, 9),
];

/**
 * Long level names (test text wrapping)
 */
export const mockLevelDistributionLongNames: LevelDistribution[] = [
  createLevelDistribution("Associate Software Engineer I", 3, 8, 4),
  createLevelDistribution("Associate Software Engineer II", 4, 10, 6),
  createLevelDistribution("Senior Software Engineer I", 5, 12, 8),
  createLevelDistribution("Senior Software Engineer II", 4, 10, 10),
  createLevelDistribution("Principal Software Engineer", 2, 6, 7),
  createLevelDistribution("Distinguished Engineer", 1, 3, 5),
];

/**
 * Manager Deviation Data for Manager Distribution Chart
 * Baseline: 20% High / 70% Medium / 10% Low
 */

// Re-export the API type for backward compatibility
export type ManagerDeviation = APIManagerDeviation;

/**
 * Helper to create a manager deviation data point
 */
export const createManagerDeviation = (
  managerName: string,
  teamSize: number,
  highPct: number,
  mediumPct: number,
  lowPct: number,
  employeeIds: number[] = []
): ManagerDeviation => {
  const BASELINE_HIGH = 20.0;
  const BASELINE_MEDIUM = 70.0;
  const BASELINE_LOW = 10.0;

  const high_deviation = highPct - BASELINE_HIGH;
  const medium_deviation = mediumPct - BASELINE_MEDIUM;
  const low_deviation = lowPct - BASELINE_LOW;
  const total_deviation =
    Math.abs(high_deviation) +
    Math.abs(medium_deviation) +
    Math.abs(low_deviation);

  // Simplified z-score calculation (heuristic for ranking)
  const scale_factor = Math.sqrt(teamSize);
  const max_deviation_value = Math.max(
    Math.abs(high_deviation),
    Math.abs(medium_deviation),
    Math.abs(low_deviation)
  );
  const z_score = max_deviation_value / (10.0 / scale_factor);

  return {
    category: managerName,
    team_size: teamSize,
    employee_ids: employeeIds,
    high_pct: highPct,
    medium_pct: mediumPct,
    low_pct: lowPct,
    high_deviation,
    medium_deviation,
    low_deviation,
    total_deviation,
    z_score,
    is_significant: Math.abs(z_score) >= 2.0,
  };
};

/**
 * Small dataset with 3 managers
 */
export const mockManagerDeviationSmall: ManagerDeviation[] = [
  createManagerDeviation("Engineering Manager", 19, 47.4, 47.4, 5.3, []),
  createManagerDeviation("VP Product", 15, 6.7, 73.3, 20.0, []),
  createManagerDeviation("Director Sales", 21, 33.3, 61.9, 4.8, []),
];

/**
 * Medium dataset with 6 managers
 */
export const mockManagerDeviationMedium: ManagerDeviation[] = [
  createManagerDeviation("Engineering Manager", 19, 47.4, 47.4, 5.3, []),
  createManagerDeviation("VP Product", 15, 6.7, 73.3, 20.0, []),
  createManagerDeviation("Director Sales", 21, 33.3, 61.9, 4.8, []),
  createManagerDeviation("Product Manager", 18, 22.2, 66.7, 11.1, []),
  createManagerDeviation("VP Engineering", 25, 24.0, 68.0, 8.0, []),
  createManagerDeviation("Director Marketing", 12, 16.7, 75.0, 8.3, []),
];

/**
 * Large dataset with 10 managers
 */
export const mockManagerDeviationLarge: ManagerDeviation[] = [
  createManagerDeviation("Engineering Manager", 19, 47.4, 47.4, 5.3, []),
  createManagerDeviation("VP Product", 15, 6.7, 73.3, 20.0, []),
  createManagerDeviation("Director Sales", 21, 33.3, 61.9, 4.8, []),
  createManagerDeviation("Product Manager", 18, 22.2, 66.7, 11.1, []),
  createManagerDeviation("VP Engineering", 25, 24.0, 68.0, 8.0, []),
  createManagerDeviation("Director Marketing", 12, 16.7, 75.0, 8.3, []),
  createManagerDeviation("Operations Manager", 14, 28.6, 64.3, 7.1, []),
  createManagerDeviation("Sales Manager", 16, 18.8, 68.8, 12.5, []),
  createManagerDeviation("HR Manager", 11, 27.3, 63.6, 9.1, []),
  createManagerDeviation("Director Operations", 20, 15.0, 70.0, 15.0, []),
];

/**
 * All managers well-calibrated (close to 20/70/10 baseline)
 */
export const mockManagerDeviationAllGood: ManagerDeviation[] = [
  createManagerDeviation("Manager A", 20, 20.0, 70.0, 10.0, []),
  createManagerDeviation("Manager B", 18, 22.2, 66.7, 11.1, []),
  createManagerDeviation("Manager C", 22, 18.2, 72.7, 9.1, []),
  createManagerDeviation("Manager D", 15, 20.0, 73.3, 6.7, []),
];

/**
 * Mixed significance levels
 */
export const mockManagerDeviationMixed: ManagerDeviation[] = [
  createManagerDeviation("High Bias Manager", 20, 50.0, 45.0, 5.0, []),
  createManagerDeviation("Low Bias Manager", 18, 5.6, 77.8, 16.7, []),
  createManagerDeviation("Well Calibrated", 22, 18.2, 72.7, 9.1, []),
  createManagerDeviation("Slightly High", 15, 26.7, 66.7, 6.7, []),
  createManagerDeviation("Slightly Low", 19, 15.8, 73.7, 10.5, []),
];

/**
 * All highly anomalous managers
 */
export const mockManagerDeviationAllBad: ManagerDeviation[] = [
  createManagerDeviation("Too Generous", 20, 65.0, 30.0, 5.0, []),
  createManagerDeviation("Too Harsh", 18, 0.0, 72.2, 27.8, []),
  createManagerDeviation("All Medium", 22, 4.5, 95.5, 0.0, []),
  createManagerDeviation("Inverted Pyramid", 15, 13.3, 20.0, 66.7, []),
];

/**
 * Empty state
 */
export const mockManagerDeviationEmpty: ManagerDeviation[] = [];

/**
 * Single manager only
 */
export const mockManagerDeviationSingle: ManagerDeviation[] = [
  createManagerDeviation("Engineering Manager", 19, 47.4, 47.4, 5.3, []),
];

/**
 * Long manager names (test text wrapping)
 */
export const mockManagerDeviationLongNames: ManagerDeviation[] = [
  createManagerDeviation(
    "Senior Vice President of Engineering Operations",
    20,
    45.0,
    50.0,
    5.0,
    []
  ),
  createManagerDeviation(
    "Director of Global Product Management and Strategy",
    18,
    10.0,
    75.0,
    15.0,
    []
  ),
  createManagerDeviation(
    "Chief Technology Officer and Head of Innovation",
    15,
    30.0,
    65.0,
    5.0,
    []
  ),
];
