/**
 * Filter operation helpers for Playwright E2E tests
 *
 * Provides helpers for applying, clearing, and verifying filters.
 */

import { Page, expect } from "@playwright/test";
import { openFilterDrawer } from "./ui";

/**
 * Internal helper to select a filter by type and value
 *
 * @param page - Playwright Page object
 * @param filterType - Type of filter ("location" or "function")
 * @param value - Value to select
 */
async function selectFilter(
  page: Page,
  filterType: "location" | "function",
  value: string
): Promise<void> {
  await openFilterDrawer(page);

  // Find and check the checkbox
  const checkbox = page.locator(
    `[data-testid="filter-${filterType}-${value}"]`
  );
  await checkbox.check();

  // Verify checkbox is checked
  await expect(checkbox).toBeChecked();

  // Wait for grid to update (network idle)
  await page.waitForLoadState("networkidle");
}

/**
 * Select a location filter
 *
 * Opens the filter drawer, selects the specified location,
 * and verifies the filter is applied.
 *
 * @param page - Playwright Page object
 * @param location - Location name to filter (e.g., "USA", "Canada")
 *
 * @example
 * ```typescript
 * test('filter by location', async ({ page }) => {
 *   await loadSampleData(page);
 *   await selectLocationFilter(page, 'USA');
 *   // Grid now shows only USA employees
 * });
 * ```
 */
export async function selectLocationFilter(
  page: Page,
  location: string
): Promise<void> {
  await selectFilter(page, "location", location);
}

/**
 * Select a function filter
 *
 * Opens the filter drawer, selects the specified function,
 * and verifies the filter is applied.
 *
 * @param page - Playwright Page object
 * @param func - Function name to filter (e.g., "Engineering", "Sales")
 *
 * @example
 * ```typescript
 * test('filter by function', async ({ page }) => {
 *   await loadSampleData(page);
 *   await selectFunctionFilter(page, 'Engineering');
 *   // Grid now shows only Engineering employees
 * });
 * ```
 */
export async function selectFunctionFilter(
  page: Page,
  func: string
): Promise<void> {
  await selectFilter(page, "function", func);
}

/**
 * Clear all active filters
 *
 * Opens the filter drawer, clicks "Clear All" button,
 * and verifies all filters are cleared.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * test('clear filters', async ({ page }) => {
 *   await loadSampleData(page);
 *   await selectLocationFilter(page, 'USA');
 *   await clearAllFilters(page);
 *   // All employees visible again
 * });
 * ```
 */
export async function clearAllFilters(page: Page): Promise<void> {
  await openFilterDrawer(page);

  // Click "Clear All" button
  await page.locator('[data-testid="clear-filter-button"]').click();

  // Verify filter button no longer shows active state
  const filterButton = page.locator('[data-testid="filter-button"]');
  await expect(filterButton).not.toHaveAttribute("data-active", "true");

  // Wait for grid to update
  await page.waitForLoadState("networkidle");
}

/**
 * Verify filter button shows active state
 *
 * Checks that the filter button has an active indicator
 * (orange dot or data-active attribute).
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await selectLocationFilter(page, 'USA');
 * await expectFilterActive(page);
 * ```
 */
export async function expectFilterActive(page: Page): Promise<void> {
  const filterButton = page.locator('[data-testid="filter-button"]');

  // Check for data-active attribute
  await expect(filterButton).toHaveAttribute("data-active", "true");
}

/**
 * Get the count of visible employee cards
 *
 * Returns the number of employee cards currently visible in the grid.
 * Useful for verifying filter results.
 *
 * @param page - Playwright Page object
 * @returns Number of visible employees
 *
 * @example
 * ```typescript
 * await selectLocationFilter(page, 'USA');
 * const count = await getVisibleEmployeeCount(page);
 * expect(count).toBeLessThan(200); // Filtered subset
 * ```
 */
export async function getVisibleEmployeeCount(page: Page): Promise<number> {
  const cards = page.locator('[data-testid^="employee-card-"]');
  return await cards.count();
}

/**
 * Verify employee count display shows filtered count
 *
 * Checks that the employee count indicator shows
 * "X of Y employees" format when filters are active.
 *
 * @param page - Playwright Page object
 * @param filtered - Number of filtered employees
 * @param total - Total number of employees
 *
 * @example
 * ```typescript
 * await selectLocationFilter(page, 'USA');
 * await expectEmployeeCountDisplay(page, 45, 200);
 * // Display shows "45 of 200 employees"
 * ```
 */
export async function expectEmployeeCountDisplay(
  page: Page,
  filtered: number,
  total: number
): Promise<void> {
  const countDisplay = page.locator('[data-testid="employee-count"]');
  await expect(countDisplay).toHaveText(`${filtered} of ${total} employees`);
}
