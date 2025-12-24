/**
 * Employee Details Screenshot Workflow
 *
 * Generates screenshots for employee details panel showing comprehensive
 * employee information, ratings, and performance data.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import {
  closeAllDialogsAndOverlays,
  waitForUiSettle,
  clickTabAndWait,
} from "../../helpers/ui";

/**
 * Generate expanded employee details panel screenshot
 *
 * Shows the full employee details panel with all sections visible including:
 * - Employee name and role
 * - Current ratings (Performance, Potential)
 * - Position in 9-box grid
 * - Performance history
 * - Notes and comments
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateDetailsPanelExpanded(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure sample data is loaded
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click on an employee to open details
  const firstEmployee = page.locator('[data-testid^="employee-card-"]').first();
  await firstEmployee.waitFor({ state: "visible", timeout: 5000 });
  await firstEmployee.click();

  // Wait for panel to expand
  await waitForUiSettle(page, 0.5);

  // Ensure Details tab is active
  const detailsTab = page.locator('[data-testid="details-tab"]');
  if ((await detailsTab.count()) > 0) {
    const isActive = await detailsTab.getAttribute("aria-selected");
    if (isActive !== "true") {
      await clickTabAndWait(page, "details-tab", 0.5);
    }
  }

  // Wait for all details to load
  await waitForUiSettle(page, 0.3);

  // Capture the expanded right panel
  const rightPanel = page.locator('[data-testid="right-panel"]');
  await rightPanel.waitFor({ state: "visible", timeout: 5000 });
  await rightPanel.screenshot({ path: outputPath });
}
