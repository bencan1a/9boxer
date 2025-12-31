/**
 * Test 12: Statistics Accuracy Tests
 *
 * Tests accuracy of statistics calculations in the Statistics tab.
 * Verifies distribution table percentages sum to 100% and are mathematically correct.
 *
 * Test Coverage:
 * - 12.1: Distribution table with percentages (sum to 100%)
 */

import { test, expect } from "../fixtures";
import {
  loadSampleData,
  selectFirstEmployee,
  switchPanelTab,
  getDistributionData,
  verifyDistributionPercentagesSum,
} from "../helpers";

test.describe("Statistics Accuracy Tests", () => {
  /**
   * Test 12.1 - Distribution table with percentages (sum to 100%)
   *
   * Success Criteria:
   * ✅ Can open Statistics tab
   * ✅ Distribution table is visible with position, count, and percentage columns
   * ✅ All percentages sum to 100% (within ±1% tolerance for rounding)
   * ✅ Each row has valid percentage (0-100%)
   * ✅ Count and percentage are mathematically consistent
   */
  test("12.1 - should display distribution table with percentages summing to 100%", async ({
    page,
  }) => {
    // Arrange: Load sample data and open Statistics tab
    await page.goto("/");
    await loadSampleData(page);
    await selectFirstEmployee(page);

    // Act: Switch to Statistics tab
    await switchPanelTab(page, "statistics");

    // Assert: Verify Statistics tab is active
    const statisticsTab = page.locator('[data-testid="statistics-tab"]');
    await expect(statisticsTab).toHaveAttribute("aria-selected", "true");

    // Wait for any table to appear first (Statistics tab loads async)
    await expect(page.locator("table").first()).toBeVisible({ timeout: 5000 });

    // Assert: Verify table has required columns (wait for each to be visible)
    await expect(
      page.getByRole("columnheader", { name: /^position$/i })
    ).toBeVisible({ timeout: 3000 });
    await expect(
      page.getByRole("columnheader", { name: /^count$/i })
    ).toBeVisible({ timeout: 3000 });
    await expect(
      page.getByRole("columnheader", { name: /^percentage$/i })
    ).toBeVisible({ timeout: 3000 });

    // Get distribution data
    const distributionData = await getDistributionData(page);

    // Assert: Verify we have data rows (should have 9 positions in nine-box grid)
    expect(distributionData.length).toBeGreaterThan(0);
    expect(distributionData.length).toBeLessThanOrEqual(9);

    // Assert: Verify each row has valid percentage (0-100%)
    for (const row of distributionData) {
      expect(row.percentage).toBeGreaterThanOrEqual(0);
      expect(row.percentage).toBeLessThanOrEqual(100);
      expect(row.count).toBeGreaterThanOrEqual(0);
    }

    // Assert: Verify percentages sum to 100% (±1% tolerance for rounding)
    await verifyDistributionPercentagesSum(page, 1.0);

    // Additional validation: Verify count and percentage are mathematically consistent
    const totalCount = distributionData.reduce(
      (sum, row) => sum + row.count,
      0
    );
    for (const row of distributionData) {
      if (totalCount > 0) {
        const expectedPercentage = (row.count / totalCount) * 100;
        // Allow ±1% tolerance for rounding differences
        expect(Math.abs(row.percentage - expectedPercentage)).toBeLessThan(1.5);
      }
    }
  });
});
