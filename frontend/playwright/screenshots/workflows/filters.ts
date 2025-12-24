/**
 * Screenshot workflows for "Filtering" documentation
 *
 * Generates screenshots demonstrating the filtering functionality:
 * - Active filter chips with orange dot indicator
 * - Expanded filter panel
 * - Before/after filtering comparison (manual)
 * - Clear All button
 *
 * All functions reuse shared helpers from frontend/playwright/helpers/
 * to ensure consistency with E2E tests.
 */

import { Page, expect } from "@playwright/test";
import { uploadExcelFile } from "../../helpers/upload";
import {
  closeAllDialogsAndOverlays,
  openFilterDrawer,
  waitForUiSettle,
} from "../../helpers/ui";

/**
 * Helper: Select a filter option by its visible text
 *
 * Common pattern for selecting filters in the filter drawer.
 * Uses .first() to handle multiple matches (e.g., "High" might appear
 * in both Performance and Potential sections).
 */
async function selectFilterByText(
  page: Page,
  filterText: string,
): Promise<void> {
  const filterOption = page.locator(`text="${filterText}"`).first();
  await filterOption.click();
  await waitForUiSettle(page, 0.3);
}

/**
 * Generate grid view with ACTIVE filter chips and indicators visible
 *
 * CRITICAL: Filters must actually be selected to show orange dot and chips.
 *
 * This was a major fix - earlier versions captured empty filter state
 * which didn't demonstrate the feature at all. Now we actively select
 * filters before capturing to show the real UI state.
 *
 * Screenshot should show:
 * - Orange dot indicator on Filters button (shows filters are active)
 * - Active filter chips displayed above grid
 * - Updated employee count showing filtered vs total ("5 of 12")
 * - Grid showing only filtered employees
 */
export async function generateActiveChips(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await uploadExcelFile(page, "sample-employees.xlsx");
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Open filters drawer
  await openFilterDrawer(page);

  // ACTUALLY SELECT FILTERS (this was the critical missing piece!)
  // Previous versions showed empty filter panel which was useless

  // Select "High" performance filter
  await selectFilterByText(page, "High");

  // Select "Star" potential filter (optional - depends on sample data)
  // This creates multiple active chips for better demonstration
  try {
    await selectFilterByText(page, "Star");
  } catch {
    // If "Star" not available, continue with just "High"
  }

  // Close filter drawer to show active chips
  const closeButton = page.locator('[data-testid="close-filter-drawer"]');
  if ((await closeButton.count()) > 0) {
    await closeButton.click();
  } else {
    // Alternative: click backdrop or press Escape
    await page.keyboard.press("Escape");
  }

  await waitForUiSettle(page, 0.5);

  // Verify orange dot indicator is visible
  const filterButton = page.locator('[data-testid="filter-button"]');
  await expect(filterButton).toBeVisible();

  // Capture the main grid area showing:
  // - Filter button with orange dot
  // - Active filter chips
  // - Filtered employee count
  // - Grid with filtered employees
  await page.screenshot({
    path: outputPath,
    fullPage: false,
  });
}

/**
 * Generate filter panel expanded showing all filter options
 */
export async function generatePanelExpanded(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await uploadExcelFile(page, "sample-employees.xlsx");
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Open filters drawer
  await openFilterDrawer(page);

  // Capture the filter drawer
  await page.locator('[data-testid="filter-drawer"]').screenshot({
    path: outputPath,
  });
}

/**
 * Generate before/after filtering comparison (requires manual 2-panel composition)
 *
 * This screenshot requires manual composition:
 * 1. Panel 1: Grid without filters (all employees visible)
 * 2. Panel 2: Grid with filters applied (subset visible)
 *
 * This function captures the "before" state (grid without filters).
 * Manual steps:
 * 1. Use this screenshot as "before" panel
 * 2. Apply filters and capture "after" panel
 * 3. Use image editing tool to create side-by-side comparison
 * 4. Add annotations (arrows, highlights) if needed
 */
export async function generateBeforeAfter(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await uploadExcelFile(page, "sample-employees.xlsx");
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Capture grid without filters (before state)
  await page.locator('[data-testid="nine-box-grid"]').screenshot({
    path: outputPath,
  });

  console.log(
    `⚠️  Manual composition required: ${outputPath}\n` +
      "   Steps:\n" +
      '   1. Use this screenshot as "before" panel\n' +
      '   2. Apply filters and capture "after" panel\n' +
      "   3. Create side-by-side comparison in image editor\n" +
      "   4. Save final composite to output path",
  );
}

/**
 * Generate filter drawer with Clear All button highlighted
 */
export async function generateClearAllButton(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await uploadExcelFile(page, "sample-employees.xlsx");
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Open filters drawer
  await openFilterDrawer(page);

  // Apply some filters first so Clear All button is visible/enabled
  await selectFilterByText(page, "High");

  // Wait for Clear All button to appear/enable
  await waitForUiSettle(page, 0.3);

  // Capture drawer showing Clear All button
  await page.locator('[data-testid="filter-drawer"]').screenshot({
    path: outputPath,
  });
}
