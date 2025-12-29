/**
 * Data loading helpers for Playwright E2E tests
 *
 * These helpers provide convenient ways to load different test datasets
 * using the sample data generation API.
 */

import { Page, expect } from "@playwright/test";

/**
 * Load sample data using the sample data generation API
 *
 * Generates 200 realistic employees with:
 * - Complete organizational hierarchies
 * - Performance history over 3 years
 * - Statistical bias patterns for intelligence testing
 * - All job levels, locations, and grid positions
 *
 * This is faster and more consistent than uploading Excel files.
 * For tests that specifically need to test Excel upload functionality,
 * use uploadExcelFile() directly.
 *
 * @param page - Playwright page object
 * @param size - Number of employees to generate (default: 200)
 *
 * @example
 * ```typescript
 * test('grid displays employees', async ({ page }) => {
 *   await loadSampleData(page);
 *   await expect(page.locator('[data-testid^="employee-card-"]')).toHaveCount(200, { timeout: 10000 });
 * });
 * ```
 */
export async function loadSampleData(
  page: Page,
  size: number = 200
): Promise<void> {
  // Navigate to app if not already there
  const currentUrl = page.url();
  if (!currentUrl.includes("localhost")) {
    await page.goto("/");
  }

  // Click File menu
  await page.locator('[data-testid="file-menu-button"]').click();

  // Wait for menu to become visible
  await expect(page.locator('[role="menu"]')).toBeVisible();

  // Click Load Sample Dataset menu item
  await page.locator('[data-testid="load-sample-menu-item"]').click();

  // Verify LoadSampleDialog appears
  await expect(
    page.locator('[data-testid="load-sample-dialog"]')
  ).toBeVisible();

  // Click Confirm button
  await page.locator('[data-testid="confirm-button"]').click();

  // Wait for loading to complete (dialog closes)
  await expect(
    page.locator('[data-testid="load-sample-dialog"]')
  ).not.toBeVisible({
    timeout: 10000,
  });

  // Verify grid displays employees
  await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

  // Wait for employee cards to load
  await page.waitForSelector('[data-testid^="employee-card-"]', {
    timeout: 5000,
  });
}

/**
 * Load calibration sample data
 *
 * Alias for loadSampleData() with larger dataset.
 * Ideal for statistics, intelligence, and calibration workflow tests.
 *
 * @param page - Playwright page object
 *
 * @example
 * ```typescript
 * test('calibration workflow', async ({ page }) => {
 *   await loadCalibrationData(page);
 *   await clickTabAndWait(page, 'intelligence-tab');
 *   // Test calibration features...
 * });
 * ```
 */
export async function loadCalibrationData(page: Page): Promise<void> {
  await loadSampleData(page, 200);
}
