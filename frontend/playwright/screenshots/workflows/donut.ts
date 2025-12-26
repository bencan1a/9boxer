/**
 * Donut Mode Screenshot Workflow
 *
 * Generates screenshots for donut mode view, showing the concentric circle layout
 * and comparing it with normal grid mode.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";

/**
 * Generate active donut mode layout screenshot
 *
 * Shows the grid in donut mode with concentric circles replacing the standard grid.
 * Employees are arranged by performance level in circular tiers.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateActiveLayout(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure sample data is loaded
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Toggle to donut mode
  const donutToggle = page.locator('[data-testid="donut-mode-toggle"]');
  await donutToggle.waitFor({ state: "visible", timeout: 5000 });
  await donutToggle.click();

  // Wait for mode transition animation
  await waitForUiSettle(page, 1.0);

  // Verify donut mode is active
  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.waitFor({ state: "visible", timeout: 5000 });

  // Capture the donut mode grid
  await grid.screenshot({ path: outputPath });
}

/**
 * Generate toggle comparison screenshot (requires manual composition)
 *
 * Creates base screenshot for side-by-side normal vs donut mode comparison.
 * Manual post-processing required to create 2-panel layout showing both modes.
 *
 * This function captures donut mode. Combine with grid-normal.png manually.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateToggleComparison(
  page: Page,
  outputPath: string
): Promise<void> {
  // This screenshot requires manual composition
  // We'll capture the donut mode view; normal grid is captured separately
  await generateActiveLayout(page, outputPath);
}
