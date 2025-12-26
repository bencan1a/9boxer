/**
 * Screenshot workflows for "Filtering" documentation
 *
 * Generates screenshots demonstrating the filtering functionality:
 * - Active filter indicator (orange dot badge)
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
import {
  verifyFilterActive,
  waitForCssTransition,
  CSS_TRANSITION_DURATIONS,
} from "../../helpers/visualValidation";

/**
 * Helper: Select first available filter checkbox
 *
 * Uses specific testid selector to target actual filter checkboxes,
 * not accordion expand icons or other checkboxes in the drawer.
 * Fixed per Phase 3 debugging findings.
 */
async function selectFirstAvailableFilter(page: Page): Promise<void> {
  const firstCheckbox = page
    .locator('[data-testid^="filter-checkbox-job-levels-"]')
    .first();
  await firstCheckbox.check();
  await waitForUiSettle(page, 0.3);
}

/**
 * Generate grid view with ACTIVE filter indicator visible
 *
 * CRITICAL: Filters must actually be selected to show orange dot badge.
 *
 * This was a major fix - earlier versions captured empty filter state
 * which didn't demonstrate the feature at all. Now we actively select
 * filters before capturing to show the real UI state.
 *
 * Screenshot should show:
 * - Orange dot badge on Filters button (primary indicator that filters are active)
 * - Updated employee count showing filtered vs total ("5 of 12")
 * - Grid showing only filtered employees
 *
 * Note: Function name kept as "generateActiveChips" for backwards compatibility,
 * but filter chips UI element was removed in recent UX updates. Only the orange
 * dot badge indicator is now shown.
 */
export async function generateActiveChips(
  page: Page,
  outputPath: string
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

  // CRITICAL: Wait for drawer open animation to complete before clicking
  // Otherwise backdrop intercepts pointer events
  await waitForCssTransition(
    page.locator('[data-testid="filter-drawer"]'),
    CSS_TRANSITION_DURATIONS.enteringScreen
  );

  // ACTUALLY SELECT FILTERS (this was the critical missing piece!)
  // Previous versions showed empty filter panel which was useless

  // Select first available filter checkbox (uses specific testid per Phase 3 fix)
  await selectFirstAvailableFilter(page);

  // Wait longer for filter state to update
  await waitForUiSettle(page, 0.8);

  // Try to select a second filter for multiple chips demonstration
  try {
    const secondCheckbox = page
      .locator('[data-testid^="filter-checkbox-job-levels-"]')
      .nth(1);
    if (await secondCheckbox.isVisible()) {
      await secondCheckbox.check();
      await waitForUiSettle(page, 0.5);
    }
  } catch {
    // If second filter not available, continue with just one
  }

  // Close filter drawer to show active chips
  // Use data-testid from E2E tests
  const closeButton = page.locator('[data-testid="filter-close-button"]');
  if ((await closeButton.count()) > 0) {
    await closeButton.click();
  } else {
    // Alternative: press Escape
    await page.keyboard.press("Escape");
  }

  // Wait for drawer to close (auto-retrying assertion)
  // Note: Don't use waitForCssTransition here because temporary drawers get removed from DOM
  await expect(page.locator('[data-testid="filter-drawer"]')).not.toBeVisible();

  // CRITICAL: Verify orange dot indicator is visible on filter button
  // This is the key visual element that shows filters are active
  await verifyFilterActive(page);
  console.log("✓ Filter button orange dot indicator verified");

  // Capture the main grid area showing:
  // - Filter button with orange dot (shows filters are active)
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
  outputPath: string
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

  // Wait for drawer open animation to complete
  const filterDrawer = page.locator('[data-testid="filter-drawer"]');
  await filterDrawer.waitFor({ state: "visible" });
  await waitForCssTransition(
    filterDrawer,
    CSS_TRANSITION_DURATIONS.enteringScreen
  );

  // Capture the filter drawer
  await filterDrawer.screenshot({
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
  outputPath: string
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
      "   4. Save final composite to output path"
  );
}

/**
 * Generate filter drawer with Clear All button highlighted
 */
export async function generateClearAllButton(
  page: Page,
  outputPath: string
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

  // Wait for drawer open animation
  const filterDrawer = page.locator('[data-testid="filter-drawer"]');
  await waitForCssTransition(
    filterDrawer,
    CSS_TRANSITION_DURATIONS.enteringScreen
  );

  // Apply some filters first so Clear All button is visible/enabled
  // Use checkbox selector to match E2E test pattern
  await selectFirstAvailableFilter(page);

  // Wait for Clear All button to appear/enable
  await waitForUiSettle(page, 0.3);

  // Verify Clear All button is visible and enabled
  const clearButton = page.locator('[data-testid="clear-filter-button"]');
  await expect(clearButton).toBeVisible();
  const isEnabled = await clearButton.isEnabled();
  if (!isEnabled) {
    throw new Error(
      "Clear All button is not enabled. " +
        "Screenshot may not show the intended state."
    );
  }
  console.log("✓ Clear All button verified (visible and enabled)");

  // Capture drawer showing Clear All button
  await filterDrawer.screenshot({
    path: outputPath,
  });

  // Close drawer after capturing to prevent blocking subsequent screenshots
  await closeAllDialogsAndOverlays(page);
}
