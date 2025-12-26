/**
 * Timeline Screenshot Workflow
 *
 * Generates screenshots for employee performance history timeline,
 * showing historical position changes and performance trends.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";

/**
 * Generate employee history timeline screenshot
 *
 * Shows the performance history timeline for an employee displaying:
 * - Historical positions in the 9-box grid
 * - Date of each position change
 * - Visual timeline representation
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmployeeHistory(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data with historical information
  // Using Sample_People_List.xlsx which has historical data
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  const count = await employeeCards.count();

  if (count === 0) {
    await loadSampleData(page, "Sample_People_List.xlsx");
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click on an employee to open details
  const firstEmployee = page.locator('[data-testid^="employee-card-"]').first();
  await firstEmployee.waitFor({ state: "visible", timeout: 5000 });
  await firstEmployee.click();

  // Wait for panel to expand
  await waitForUiSettle(page, 0.5);

  // Look for timeline section
  const timeline = page.locator('[data-testid="performance-timeline"]');

  if ((await timeline.count()) > 0) {
    // Scroll timeline into view
    await timeline.scrollIntoViewIfNeeded();
    await waitForUiSettle(page, 0.3);

    // Capture just the timeline section
    await timeline.screenshot({ path: outputPath });
  } else {
    // Fallback: capture entire right panel
    const rightPanel = page.locator('[data-testid="right-panel"]');
    await rightPanel.screenshot({ path: outputPath });
  }
}
