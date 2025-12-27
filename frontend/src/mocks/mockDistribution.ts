/**
 * Mock distribution data for Storybook and testing
 */

import type { DistributionData, DistributionSegment, BoxPosition } from "../types/intelligence";

/**
 * Create a distribution segment
 */
export const createSegment = (
  position: BoxPosition,
  count: number,
  total: number,
  label: string
): DistributionSegment => ({
  position,
  count,
  percentage: total === 0 ? 0 : (count / total) * 100,
  label,
});

/**
 * Ideal 9-box distribution
 * Based on standard talent management best practices
 */
export const mockIdealDistribution: DistributionData = {
  segments: [
    createSegment(1, 5, 100, "Low/Low"), // Bottom-left: 5%
    createSegment(2, 10, 100, "Med/Low"), // Bottom-center: 10%
    createSegment(3, 5, 100, "High/Low"), // Bottom-right: 5%
    createSegment(4, 10, 100, "Low/Med"), // Middle-left: 10%
    createSegment(5, 40, 100, "Med/Med"), // Center: 40%
    createSegment(6, 10, 100, "High/Med"), // Middle-right: 10%
    createSegment(7, 5, 100, "Low/High"), // Top-left: 5%
    createSegment(8, 10, 100, "Med/High"), // Top-center: 10%
    createSegment(9, 5, 100, "High/High"), // Top-right: 5%
  ],
  total: 100,
  idealPercentages: {
    "1": 5,
    "2": 10,
    "3": 5,
    "4": 10,
    "5": 40,
    "6": 10,
    "7": 5,
    "8": 10,
    "9": 5,
  },
};

/**
 * Skewed distribution - Too many in top-right
 */
export const mockSkewedDistribution: DistributionData = {
  segments: [
    createSegment(1, 1, 100, "Low/Low"), // 1%
    createSegment(2, 2, 100, "Med/Low"), // 2%
    createSegment(3, 2, 100, "High/Low"), // 2%
    createSegment(4, 3, 100, "Low/Med"), // 3%
    createSegment(5, 15, 100, "Med/Med"), // 15%
    createSegment(6, 12, 100, "High/Med"), // 12%
    createSegment(7, 5, 100, "Low/High"), // 5%
    createSegment(8, 15, 100, "Med/High"), // 15%
    createSegment(9, 45, 100, "High/High"), // 45% - way too high!
  ],
  total: 100,
  idealPercentages: mockIdealDistribution.idealPercentages,
};

/**
 * Concentrated distribution - Most in center
 */
export const mockConcentratedDistribution: DistributionData = {
  segments: [
    createSegment(1, 2, 100, "Low/Low"),
    createSegment(2, 5, 100, "Med/Low"),
    createSegment(3, 2, 100, "High/Low"),
    createSegment(4, 8, 100, "Low/Med"),
    createSegment(5, 65, 100, "Med/Med"), // 65% in center!
    createSegment(6, 8, 100, "High/Med"),
    createSegment(7, 2, 100, "Low/High"),
    createSegment(8, 6, 100, "Med/High"),
    createSegment(9, 2, 100, "High/High"),
  ],
  total: 100,
  idealPercentages: mockIdealDistribution.idealPercentages,
};

/**
 * Balanced distribution - Fairly distributed
 */
export const mockBalancedDistribution: DistributionData = {
  segments: [
    createSegment(1, 8, 100, "Low/Low"),
    createSegment(2, 10, 100, "Med/Low"),
    createSegment(3, 8, 100, "High/Low"),
    createSegment(4, 10, 100, "Low/Med"),
    createSegment(5, 30, 100, "Med/Med"),
    createSegment(6, 10, 100, "High/Med"),
    createSegment(7, 8, 100, "Low/High"),
    createSegment(8, 10, 100, "Med/High"),
    createSegment(9, 6, 100, "High/High"),
  ],
  total: 100,
  idealPercentages: mockIdealDistribution.idealPercentages,
};

/**
 * Empty distribution
 */
export const mockEmptyDistribution: DistributionData = {
  segments: [
    createSegment(1, 0, 0, "Low/Low"),
    createSegment(2, 0, 0, "Med/Low"),
    createSegment(3, 0, 0, "High/Low"),
    createSegment(4, 0, 0, "Low/Med"),
    createSegment(5, 0, 0, "Med/Med"),
    createSegment(6, 0, 0, "High/Med"),
    createSegment(7, 0, 0, "Low/High"),
    createSegment(8, 0, 0, "Med/High"),
    createSegment(9, 0, 0, "High/High"),
  ],
  total: 0,
  idealPercentages: mockIdealDistribution.idealPercentages,
};

/**
 * Small dataset distribution (10 employees)
 */
export const mockSmallDistribution: DistributionData = {
  segments: [
    createSegment(1, 0, 10, "Low/Low"),
    createSegment(2, 1, 10, "Med/Low"),
    createSegment(3, 0, 10, "High/Low"),
    createSegment(4, 1, 10, "Low/Med"),
    createSegment(5, 5, 10, "Med/Med"),
    createSegment(6, 1, 10, "High/Med"),
    createSegment(7, 0, 10, "Low/High"),
    createSegment(8, 1, 10, "Med/High"),
    createSegment(9, 1, 10, "High/High"),
  ],
  total: 10,
  idealPercentages: mockIdealDistribution.idealPercentages,
};

/**
 * Factory function to create custom distributions
 */
export const createCustomDistribution = (
  counts: number[] // Array of 9 counts, positions 1-9
): DistributionData => {
  if (counts.length !== 9) {
    throw new Error("Must provide exactly 9 counts for positions 1-9");
  }

  const total = counts.reduce((sum, count) => sum + count, 0);
  const labels = [
    "Low/Low",
    "Med/Low",
    "High/Low",
    "Low/Med",
    "Med/Med",
    "High/Med",
    "Low/High",
    "Med/High",
    "High/High",
  ];

  return {
    segments: counts.map((count, index) =>
      createSegment((index + 1) as BoxPosition, count, total, labels[index])
    ),
    total,
    idealPercentages: mockIdealDistribution.idealPercentages,
  };
};
