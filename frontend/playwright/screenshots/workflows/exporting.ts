/**
 * Exporting Screenshot Workflow
 *
 * Generates screenshots for the export workflow showing how users can
 * apply changes and export updated data to Excel.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";
import { ensureChangesExist } from "../../helpers/assertions";

/**
 * Generate file menu Apply Changes screenshot
 *
 * Shows the File menu open with the "Apply Changes" option highlighted.
 * This demonstrates how users commit their changes before exporting.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFileMenuApplyChanges(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure sample data is loaded
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Ensure we have changes to apply
  await ensureChangesExist(page, 2);

  // Wait for UI to settle
  await waitForUiSettle(page, 0.3);

  // Open File menu
  const fileMenuButton = page.locator('[data-testid="file-menu-button"]');
  await fileMenuButton.waitFor({ state: "visible", timeout: 5000 });
  await fileMenuButton.click();

  // Wait for menu animation (Material-UI Popover)
  await page.waitForTimeout(300);

  // Wait for Apply Changes menu item to be visible
  const applyChangesItem = page.locator(
    '[data-testid="apply-changes-menu-item"]',
  );
  await applyChangesItem.waitFor({ state: "visible", timeout: 3000 });

  // Capture the menu with Apply Changes option
  const fileMenu = page.locator('[role="menu"]').first();
  await fileMenu.screenshot({ path: outputPath });
}

/**
 * Generate Excel file with new columns screenshot (manual capture required)
 *
 * This screenshot shows the exported Excel file with new columns added.
 * Since this involves opening Excel outside the browser, it requires manual capture.
 *
 * Manual steps:
 * 1. Export file from application
 * 2. Open in Excel
 * 3. Highlight new columns (Performance, Potential, Position)
 * 4. Capture screenshot showing the spreadsheet with new data
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateExcelFileNewColumns(
  page: Page,
  outputPath: string,
): Promise<void> {
  // This is a placeholder for manual screenshot workflow
  // The actual screenshot must be captured manually in Excel
  console.log(
    "MANUAL SCREENSHOT REQUIRED: Excel file with new columns\n" +
      "Steps:\n" +
      "1. Export changes from application\n" +
      "2. Open exported Excel file\n" +
      "3. Highlight Performance, Potential, and Position columns\n" +
      "4. Capture screenshot\n" +
      `5. Save to: ${outputPath}`,
  );

  // Create a placeholder file to indicate manual work needed
  // This will be replaced with the actual Excel screenshot
  await page.screenshot({ path: outputPath });
}
