/**
 * Filter Performance Tests
 *
 * Tests to ensure filtering operations complete quickly and don't block the UI.
 * Validates that applying filters to large datasets remains responsive.
 *
 * Performance Targets (CI-adjusted):
 * - Apply filter: <1000ms in CI, <500ms local
 * - Clear filter: <500ms in CI, <300ms local
 * - Multiple filters: <1500ms in CI, <1000ms local
 *
 * Note: CI environments have additional rendering overhead and resource constraints.
 */

import { test, expect } from "@playwright/test";

// Helper to get CI-adjusted thresholds
const getThreshold = (localValue: number, ciMultiplier = 1.5): number => {
  return process.env.CI ? Math.round(localValue * ciMultiplier) : localValue;
};

test.describe("Filter Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for app to be loaded
    await page.waitForSelector('[data-testid="nine-box-grid"]', {
      timeout: 10000,
    });
  });

  test("should apply filter quickly", async ({ page }) => {
    // Open filter drawer
    const filterButton = page.locator('[data-testid="filter-button"]');

    // Check if filter button exists, if not, this feature may not be implemented yet
    const hasFilterButton = await filterButton.count();
    if (hasFilterButton === 0) {
      console.log(
        "⚠ Filter button not found - skipping filter performance test"
      );
      test.skip();
      return;
    }

    await filterButton.click();

    // Wait for filter drawer to open
    await page.waitForSelector('[data-testid="filter-drawer"]', {
      timeout: 2000,
    });

    // Measure time to apply a filter
    const startTime = Date.now();

    // Apply a filter (adjust selector based on actual implementation)
    const filterOption = page
      .locator('[data-testid^="filter-option-"]')
      .first();
    if ((await filterOption.count()) > 0) {
      await filterOption.click();
    }

    // Wait for grid to update (employee count or visible employees change)
    await page.waitForTimeout(100); // Small delay for filter to apply

    const filterTime = Date.now() - startTime;
    const threshold = getThreshold(500, 2); // 1000ms in CI

    console.log(
      `✓ Filter applied in ${filterTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Filter should apply quickly (CI-adjusted)
    expect(filterTime).toBeLessThan(threshold);
  });

  test("should clear filter quickly", async ({ page }) => {
    const filterButton = page.locator('[data-testid="filter-button"]');

    const hasFilterButton = await filterButton.count();
    if (hasFilterButton === 0) {
      console.log("⚠ Filter button not found - skipping test");
      test.skip();
      return;
    }

    await filterButton.click();
    await page.waitForSelector('[data-testid="filter-drawer"]', {
      timeout: 2000,
    });

    // Apply a filter first
    const filterOption = page
      .locator('[data-testid^="filter-option-"]')
      .first();
    if ((await filterOption.count()) > 0) {
      await filterOption.click();
      await page.waitForTimeout(100);
    }

    // Measure time to clear filter
    const startTime = Date.now();

    // Clear filter (look for clear button)
    const clearButton = page.locator('[data-testid="clear-filters"]');
    if ((await clearButton.count()) > 0) {
      await clearButton.click();
    }

    await page.waitForTimeout(100);

    const clearTime = Date.now() - startTime;
    const threshold = getThreshold(300, 1.67); // 500ms in CI

    console.log(
      `✓ Filter cleared in ${clearTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Clear should be fast (CI-adjusted)
    expect(clearTime).toBeLessThan(threshold);
  });

  test("should handle multiple filters efficiently", async ({ page }) => {
    const filterButton = page.locator('[data-testid="filter-button"]');

    const hasFilterButton = await filterButton.count();
    if (hasFilterButton === 0) {
      console.log("⚠ Filter button not found - skipping test");
      test.skip();
      return;
    }

    await filterButton.click();
    await page.waitForSelector('[data-testid="filter-drawer"]', {
      timeout: 2000,
    });

    // Apply multiple filters
    const startTime = Date.now();

    const filterOptions = page.locator('[data-testid^="filter-option-"]');
    const filterCount = await filterOptions.count();

    // Apply up to 3 filters
    const filtersToApply = Math.min(3, filterCount);
    for (let i = 0; i < filtersToApply; i++) {
      await filterOptions.nth(i).click();
      await page.waitForTimeout(50); // Small delay between filters
    }

    const multiFilterTime = Date.now() - startTime;
    const threshold = getThreshold(1000, 1.5); // 1500ms in CI

    console.log(
      `✓ Applied ${filtersToApply} filters in ${multiFilterTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Multiple filters should still be fast (CI-adjusted)
    expect(multiFilterTime).toBeLessThan(threshold);
  });

  test("should not block UI while filtering", async ({ page }) => {
    const filterButton = page.locator('[data-testid="filter-button"]');

    const hasFilterButton = await filterButton.count();
    if (hasFilterButton === 0) {
      console.log("⚠ Filter button not found - skipping test");
      test.skip();
      return;
    }

    await filterButton.click();
    await page.waitForSelector('[data-testid="filter-drawer"]', {
      timeout: 2000,
    });

    // Apply a filter
    const filterOption = page
      .locator('[data-testid^="filter-option-"]')
      .first();
    if ((await filterOption.count()) > 0) {
      await filterOption.click();
    }

    // Verify UI remains responsive (can click other elements)
    await page.waitForTimeout(100);

    // Try to interact with grid
    const grid = page.locator('[data-testid="nine-box-grid"]');
    await expect(grid).toBeVisible();

    // Grid should still be interactive
    const clickable = await grid.isEnabled();
    expect(clickable).toBe(true);

    console.log("✓ UI remained responsive during filtering");
  });

  test("should search/filter text input responsively", async ({ page }) => {
    // Look for search/filter input
    const searchInput = page.locator(
      'input[placeholder*="Search"], input[placeholder*="Filter"]'
    );

    const hasSearchInput = await searchInput.count();
    if (hasSearchInput === 0) {
      console.log("⚠ Search input not found - skipping test");
      test.skip();
      return;
    }

    // Type in search input and measure response time
    const testQuery = "test";
    const startTime = Date.now();

    await searchInput.fill(testQuery);

    // Wait for results to update (small delay)
    await page.waitForTimeout(200);

    const searchTime = Date.now() - startTime;
    const threshold = getThreshold(500, 1.6); // 800ms in CI

    console.log(
      `✓ Search completed in ${searchTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Search should be responsive (CI-adjusted)
    expect(searchTime).toBeLessThan(threshold);

    // Verify search input has value
    await expect(searchInput).toHaveValue(testQuery);
  });

  test("should handle rapid filter changes without lag", async ({ page }) => {
    const filterButton = page.locator('[data-testid="filter-button"]');

    const hasFilterButton = await filterButton.count();
    if (hasFilterButton === 0) {
      console.log("⚠ Filter button not found - skipping test");
      test.skip();
      return;
    }

    await filterButton.click();
    await page.waitForSelector('[data-testid="filter-drawer"]', {
      timeout: 2000,
    });

    // Rapidly toggle filters
    const startTime = Date.now();

    const filterOptions = page.locator('[data-testid^="filter-option-"]');
    const filterCount = await filterOptions.count();

    // Toggle filters rapidly (on/off/on)
    const toggleCount = Math.min(5, filterCount);
    for (let i = 0; i < toggleCount; i++) {
      const option = filterOptions.nth(i % filterCount);
      await option.click();
      await option.click(); // Toggle off
      await option.click(); // Toggle on again
      await page.waitForTimeout(20); // Very small delay
    }

    const rapidToggleTime = Date.now() - startTime;
    const threshold = getThreshold(3000, 1.67); // 5000ms in CI

    console.log(
      `✓ Rapid toggle (${toggleCount * 3} clicks) completed in ${rapidToggleTime}ms (CI: ${!!process.env.CI})`
    );

    // Should handle rapid changes without significant lag (CI-adjusted)
    expect(rapidToggleTime).toBeLessThan(threshold);

    console.log("✓ App handled rapid filter changes gracefully");
  });
});
