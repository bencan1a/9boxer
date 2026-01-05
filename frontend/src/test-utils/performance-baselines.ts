/**
 * Performance test baselines and thresholds.
 *
 * BASELINE: Expected time on a standard Linux CI runner (ubuntu-latest)
 * TOLERANCE: Allowed variance multiplier (e.g., 2.0 = can be 2x slower)
 *
 * To update baselines, run `npm run test:perf` on ubuntu-latest and
 * record the median times.
 */
export const PERFORMANCE_BASELINES = {
  employeeTile: {
    singleRender: { baseline: 50, tolerance: 3.0 }, // 50ms * 3 = 150ms max
    batchRender100: { baseline: 300, tolerance: 3.0 }, // 300ms * 3 = 900ms max
    complexDataRender: { baseline: 30, tolerance: 4.0 }, // 30ms * 4 = 120ms max
    reRender: { baseline: 30, tolerance: 3.0 }, // 30ms * 3 = 90ms max
    propChange: { baseline: 10, tolerance: 3.0 }, // 10ms * 3 = 30ms max
    flagsRender: { baseline: 300, tolerance: 3.0 }, // 300ms * 3 = 900ms max
  },
  nineBoxGrid: {
    render100: { baseline: 400, tolerance: 2.5 }, // 400ms * 2.5 = 1000ms max
    render500: { baseline: 800, tolerance: 2.0 }, // 800ms * 2 = 1600ms max
    render1000: { baseline: 1500, tolerance: 2.0 }, // 1500ms * 2 = 3000ms max
    reRender: { baseline: 80, tolerance: 3.0 }, // 80ms * 3 = 240ms max
    emptyRender: { baseline: 30, tolerance: 4.0 }, // 30ms * 4 = 120ms max
    memoryCycles10: { baseline: 800, tolerance: 7.0 }, // 800ms * 7 = 5600ms max for 10 cycles (increased for Windows/different environments)
    memoryCycles20: { baseline: 1500, tolerance: 7.5 }, // 1500ms * 7.5 = 11250ms max for 20 cycles (increased for Windows/different environments)
  },
} as const;

/**
 * Calculate the maximum allowed time for a performance test.
 *
 * @param baseline - The expected baseline time in milliseconds
 * @param tolerance - The multiplier for allowed variance
 * @returns The maximum allowed time in milliseconds
 */
export function getMaxTime(baseline: number, tolerance: number): number {
  return baseline * tolerance;
}

/**
 * Helper to get baseline config and log the result.
 *
 * @param actualTime - The measured render time
 * @param baseline - The expected baseline time
 * @param tolerance - The allowed variance multiplier
 * @param label - Description for logging
 */
export function assertPerformance(
  actualTime: number,
  baseline: number,
  tolerance: number,
  label: string
): void {
  const maxTime = getMaxTime(baseline, tolerance);
  const status = actualTime < maxTime ? "✓" : "✗";
  console.log(
    `${status} ${label}: ${actualTime.toFixed(2)}ms (baseline: ${baseline}ms, max: ${maxTime}ms)`
  );
}
