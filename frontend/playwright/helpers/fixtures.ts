/**
 * Data loading helpers for Playwright E2E tests
 *
 * These helpers provide convenient ways to load different test datasets
 * using the existing upload helper.
 */

import { Page } from "@playwright/test";
import { uploadExcelFile } from "./upload";

/**
 * Load calibration sample data
 *
 * Uses calibration-sample.xlsx with realistic distribution.
 * Ideal for statistics, intelligence, calibration workflow tests.
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
  await uploadExcelFile(page, "calibration-sample.xlsx");
}

/**
 * Load basic sample data
 *
 * Uses sample-employees.xlsx with simple employee data.
 * Ideal for basic grid, quickstart, general feature tests.
 *
 * @param page - Playwright page object
 *
 * @example
 * ```typescript
 * test('grid displays employees', async ({ page }) => {
 *   await loadSampleData(page);
 *   await expect(page.locator('[data-testid^="employee-card-"]')).toHaveCount(15);
 * });
 * ```
 */
export async function loadSampleData(page: Page): Promise<void> {
  await uploadExcelFile(page, "sample-employees.xlsx");
}
