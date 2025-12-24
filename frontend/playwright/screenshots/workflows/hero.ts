/**
 * Hero and Index Screenshot Workflow
 *
 * Generates hero images and preview screenshots for the documentation index page.
 * These are high-level overview screenshots that showcase the application.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";

/**
 * Generate hero grid screenshot
 *
 * Creates a full-width hero image showing the populated grid with sample data.
 * This is the main visual used on documentation landing pages.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateHeroGrid(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Load sample data with good distribution
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to settle
  await waitForUiSettle(page, 1.0);

  // Verify grid is populated
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  await employeeCards.first().waitFor({ state: "visible", timeout: 5000 });

  // Capture full page for hero image
  await page.screenshot({ path: outputPath, fullPage: true });
}

/**
 * Generate quick win preview screenshot
 *
 * Creates a preview image for the index page showing a quick win scenario.
 * Demonstrates immediate value users can get from the application.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateQuickWinPreview(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Load sample data
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to settle
  await waitForUiSettle(page, 0.5);

  // Verify grid is populated
  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.waitFor({ state: "visible", timeout: 5000 });

  // Capture the grid area (focused view for preview)
  await grid.screenshot({ path: outputPath });
}
