/**
 * Data loading helpers for Playwright E2E tests
 *
 * These helpers provide convenient ways to load different test datasets
 * using the sample data generation API.
 */

import { Page, expect } from "@playwright/test";

/**
 * Cache to track if sample data has been loaded in the current page context.
 * Maps page URL to loaded state to avoid redundant data loading.
 * This is reset between test workers but persists within serial test suites.
 */
const sampleDataCache = new WeakMap<Page, boolean>();

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
 * **Performance Optimization:**
 * When used in serial test suites (test.describe.configure({ mode: 'serial' })),
 * this function caches the loaded state and skips redundant API calls.
 * For isolated tests, it loads data normally each time.
 *
 * @param page - Playwright page object
 * @param size - Number of employees to generate (default: 200)
 * @param options - Optional configuration
 * @param options.skipCache - Force reload even if data is cached (default: false)
 *
 * @example
 * ```typescript
 * // In serial test suite (optimized)
 * test.describe.configure({ mode: 'serial' });
 * test.beforeAll(async ({ page }) => {
 *   await page.goto('/');
 *   await loadSampleData(page);
 * });
 *
 * // In isolated test (default)
 * test.beforeEach(async ({ page }) => {
 *   await page.goto('/');
 *   await loadSampleData(page);
 * });
 * ```
 */
export async function loadSampleData(
  page: Page,
  size: number = 200,
  options: { skipCache?: boolean } = {}
): Promise<void> {
  // Check cache unless explicitly told to skip
  if (!options.skipCache && sampleDataCache.has(page)) {
    // Data already loaded in this page context
    // Verify both grid AND employee cards are present to ensure data is fresh
    const gridVisible = await page
      .locator('[data-testid="nine-box-grid"]')
      .isVisible()
      .catch(() => false);

    const cardsCount = await page
      .locator('[data-testid^="employee-card-"]')
      .count()
      .catch(() => 0);

    // Cache is valid if grid is visible AND we have at least 90% of expected employees
    // (allows for small variations in data generation)
    if (gridVisible && cardsCount >= size * 0.9) {
      // Cache is valid, skip reload
      return;
    }
    // Grid not visible or insufficient cards, cache is stale, clear and proceed with load
    sampleDataCache.delete(page);
  }

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
  // Increased timeout as sample data generation can take time
  await expect(
    page.locator('[data-testid="load-sample-dialog"]')
  ).not.toBeVisible({
    timeout: 30000, // Increased from 15s to 30s for slower CI environments
  });

  // Verify grid displays employees
  await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

  // Wait for employee cards to load
  await page.waitForSelector('[data-testid^="employee-card-"]', {
    timeout: 5000,
  });

  // Wait for React to finish rendering and network activity to settle
  await page.waitForLoadState("networkidle");

  // Verify at least one employee card is fully interactive (not loading)
  const firstCard = page.locator('[data-testid^="employee-card-"]').first();
  await expect(firstCard).toBeVisible({ timeout: 5000 });

  // Wait for sessionId to be set (filter button becomes enabled)
  // This ensures the full application state is ready before proceeding
  const filterButton = page.locator('[data-testid="filter-button"]');
  await expect(filterButton).toBeEnabled({ timeout: 5000 });

  // CRITICAL: Verify that we have the expected number of employee cards
  // This ensures the frontend has fully loaded all employees from the backend
  // Wait up to 5 seconds for at least 90% of expected employees to be present
  const expectedCount = size;
  const minAcceptableCount = Math.floor(expectedCount * 0.9);

  await expect(async () => {
    const cardCount = await page
      .locator('[data-testid^="employee-card-"]')
      .count();
    if (cardCount < minAcceptableCount) {
      throw new Error(
        `Expected at least ${minAcceptableCount} employees, but found ${cardCount}`
      );
    }
  }).toPass({ timeout: 5000, intervals: [100, 250, 500] });

  // Mark as cached for this page context
  sampleDataCache.set(page, true);
}

/**
 * Load sample data from empty state button
 *
 * This is different from loadSampleData() which uses the File menu.
 * Use this helper for Test 1.1 which specifically tests the empty state button.
 *
 * Clicks the "Load Sample Data (200 employees)" button in the empty state,
 * then waits for data to load and grid to populate.
 *
 * Note: The empty state button always loads 200 employees (hardcoded in UI).
 *
 * @param page - Playwright page object
 *
 * @example
 * ```typescript
 * test('loads sample data from empty state', async ({ page }) => {
 *   await page.goto('/');
 *   await loadSampleDataFromEmptyState(page);
 *   // Grid should now show employees
 * });
 * ```
 */
export async function loadSampleDataFromEmptyState(page: Page): Promise<void> {
  // Navigate to app if not already there
  const currentUrl = page.url();
  if (!currentUrl.includes("localhost")) {
    await page.goto("/");
  }

  // Click the empty state "Load Sample Data (200 employees)" button
  await page.locator('[data-testid="load-sample-data-button"]').click();

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

  // Wait for React to finish rendering and network activity to settle
  await page.waitForLoadState("networkidle");

  // Verify at least one employee card is fully interactive (not loading)
  const firstCard = page.locator('[data-testid^="employee-card-"]').first();
  await expect(firstCard).toBeVisible({ timeout: 5000 });

  // Wait for sessionId to be set (filter button becomes enabled)
  // This ensures the full application state is ready before proceeding
  const filterButton = page.locator('[data-testid="filter-button"]');
  await expect(filterButton).toBeEnabled({ timeout: 5000 });

  // Mark as cached for this page context
  sampleDataCache.set(page, true);
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
