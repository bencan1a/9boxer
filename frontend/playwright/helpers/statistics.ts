/**
 * Statistics helpers for E2E tests
 *
 * Provides helper functions for:
 * - Extracting distribution table data
 * - Verifying distribution percentages sum to 100%
 *
 * All functions use state-based waits (NO arbitrary timeouts).
 */

import { Page, expect } from "@playwright/test";

/**
 * Distribution row data structure
 */
export interface DistributionRow {
  position: string;
  count: number;
  percentage: number;
}

/**
 * Get distribution table data from Statistics tab
 *
 * Extracts all rows from the distribution table including position name,
 * employee count, and percentage.
 *
 * Note: This function assumes the Statistics tab is already active.
 * Use switchPanelTab(page, 'statistics') first if needed.
 *
 * @param page - Playwright Page object
 * @returns Array of distribution rows
 *
 * @example
 * ```typescript
 * await switchPanelTab(page, 'statistics');
 * const data = await getDistributionData(page);
 * expect(data).toHaveLength(9); // 9 grid positions
 * ```
 */
export async function getDistributionData(
  page: Page
): Promise<DistributionRow[]> {
  // Wait for distribution table to be visible
  // First wait for any table to appear
  await expect(page.locator("table").first()).toBeVisible({ timeout: 5000 });

  // Then locate the specific distribution table (has Position column)
  const table = page
    .locator("table")
    .filter({ has: page.getByRole("columnheader", { name: /position/i }) });
  await expect(table).toBeVisible({ timeout: 3000 });

  // Get all table rows (excluding header)
  const rows = table.locator("tbody tr");
  const rowCount = await rows.count();

  const distributionData: DistributionRow[] = [];

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);

    // Extract position name from first cell (row header or first td)
    const positionCell = row.locator("th, td").first();
    const positionText = await positionCell.textContent();

    // Extract count from second column (index 1)
    const countCell = row.locator("td").nth(0); // First td after th
    const countText = await countCell.textContent();

    // Extract percentage from third column (index 2)
    const percentageCell = row.locator("td").nth(1); // Second td after th
    const percentageText = await percentageCell.textContent();

    // Parse values
    const position = positionText?.trim() || "";
    const count = parseInt(countText?.trim() || "0", 10);

    // Parse percentage (remove % sign)
    const percentageMatch = percentageText?.match(/([\d.]+)%/);
    const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : 0;

    distributionData.push({
      position,
      count,
      percentage,
    });
  }

  return distributionData;
}

/**
 * Verify that distribution percentages sum to 100%
 *
 * Gets the distribution data and verifies that all percentages sum to 100%
 * within the specified tolerance.
 *
 * @param page - Playwright Page object
 * @param tolerance - Acceptable difference from 100% (default: 1.0%)
 *
 * @example
 * ```typescript
 * await switchPanelTab(page, 'statistics');
 * await verifyDistributionPercentagesSum(page);
 * ```
 */
export async function verifyDistributionPercentagesSum(
  page: Page,
  tolerance: number = 1.0
): Promise<void> {
  const data = await getDistributionData(page);

  // Sum all percentages
  const sum = data.reduce((total, row) => total + row.percentage, 0);

  // Verify sum is approximately 100%
  const difference = Math.abs(sum - 100);
  expect(difference).toBeLessThanOrEqual(tolerance);
}
