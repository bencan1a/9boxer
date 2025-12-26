/**
 * Grid Screenshot Workflow
 *
 * Generates screenshots showing basic grid layouts and employee tile examples.
 * These are foundational screenshots used throughout the documentation.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";

/**
 * Generate standard 9-box grid screenshot
 *
 * Shows the normal grid layout with employee tiles distributed across boxes.
 * This is a foundational screenshot used to introduce the grid concept.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateGridNormal(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure sample data is loaded
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to settle
  await waitForUiSettle(page, 0.5);

  // Verify grid has employees
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  await employeeCards.first().waitFor({ state: "visible", timeout: 5000 });

  // Capture the grid
  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.screenshot({ path: outputPath });
}

/**
 * Generate individual employee tile screenshot
 *
 * Shows a close-up of a single employee tile with name and role visible.
 * Used to demonstrate the basic employee card UI component.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmployeeTileNormal(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure sample data is loaded
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to settle
  await waitForUiSettle(page, 0.5);

  // Get the first employee card
  const firstCard = page.locator('[data-testid^="employee-card-"]').first();
  await firstCard.waitFor({ state: "visible", timeout: 5000 });

  // Capture close-up of the employee tile
  await firstCard.screenshot({ path: outputPath });
}
