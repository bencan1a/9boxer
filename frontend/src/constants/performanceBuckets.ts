/**
 * Performance bucket mappings for grid positions
 *
 * These define which grid positions fall into each performance category.
 * This provides a single source of truth for position-to-performance mapping,
 * eliminating duplication across the application.
 */

/**
 * Performance bucket positions
 * Maps performance categories to their corresponding grid positions
 */
export const PERFORMANCE_BUCKETS = {
  High: [9, 8, 6],
  Medium: [7, 5, 3],
  Low: [4, 2, 1],
} as const;

/**
 * Grid position to performance category mapping
 * Maps individual grid positions (1-9) to their performance category
 */
export const GRID_POSITION_PERFORMANCE_MAP: Record<number, string> = {
  9: "High",
  8: "High",
  6: "High",
  7: "Medium",
  5: "Medium",
  3: "Medium",
  4: "Low",
  2: "Low",
  1: "Low",
};

/**
 * Get performance category for a grid position
 *
 * @param gridPosition - Grid position (1-9)
 * @returns Performance category ("High", "Medium", or "Low"), or undefined if invalid
 *
 * @example
 * ```ts
 * getPerformanceCategory(9) // "High"
 * getPerformanceCategory(5) // "Medium"
 * getPerformanceCategory(1) // "Low"
 * getPerformanceCategory(10) // undefined
 * ```
 */
export function getPerformanceCategory(
  gridPosition: number
): string | undefined {
  return GRID_POSITION_PERFORMANCE_MAP[gridPosition];
}

/**
 * Check if a position is in a specific performance bucket
 *
 * @param gridPosition - Grid position (1-9)
 * @param category - Performance category to check
 * @returns True if the position is in the specified category
 *
 * @example
 * ```ts
 * isInPerformanceBucket(9, "High") // true
 * isInPerformanceBucket(5, "High") // false
 * ```
 */
export function isInPerformanceBucket(
  gridPosition: number,
  category: keyof typeof PERFORMANCE_BUCKETS
): boolean {
  // Type assertion needed because TypeScript's readonly tuple type requires exact literal matches
  // This is safe because gridPosition is validated at runtime by includes()
  return (PERFORMANCE_BUCKETS[category] as readonly number[]).includes(
    gridPosition
  );
}
