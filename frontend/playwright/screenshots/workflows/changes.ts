/**
 * Screenshot workflows for "Making Changes" documentation
 *
 * Generates screenshots demonstrating the change-tracking workflow:
 * - Drag and drop to modify employee positions
 * - Visual feedback (orange borders, badges)
 * - Employee details panel
 * - Performance history timeline
 * - Changes tab with movement tracking
 *
 * All functions reuse shared helpers from frontend/playwright/helpers/
 * to ensure consistency with E2E tests.
 */

import { Page, expect } from "@playwright/test";
import { uploadExcelFile } from "../../helpers/upload";
import {
  closeAllDialogsAndOverlays,
  clickTabAndWait,
  waitForUiSettle,
} from "../../helpers/ui";
import { ensureChangesExist } from "../../helpers/assertions";

/**
 * Generate base grid for 3-panel drag sequence (requires manual composition)
 *
 * This generates a base screenshot showing the grid. Manual post-processing required:
 * 1. Panel 1: Add arrow/highlight showing click on employee tile
 * 2. Panel 2: Show dragging state (semi-transparent tile being dragged)
 * 3. Panel 3: Show dropped state in new position
 *
 * Tools like Photoshop, Figma, or Snagit can create the 3-panel composite.
 * The base grid provides a clean starting point for annotation.
 */
export async function generateDragSequence(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Load sample data
  await uploadExcelFile(page, "sample-employees.xlsx");
  await waitForUiSettle(page, 1.0);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Capture the grid
  await page.locator('[data-testid="nine-box-grid"]').screenshot({
    path: outputPath,
  });
}

/**
 * Generate employee tile with VISIBLE orange modified border and badge
 *
 * CRITICAL: Must show the orange left border that indicates modification.
 *
 * This screenshot demonstrates the visual feedback system that shows users
 * which employees have been modified. The orange border is a key UX element.
 *
 * The method performs an actual drag operation to trigger the modification
 * state, then waits for all visual indicators to appear before capturing.
 */
export async function generateOrangeBorder(
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

  // Perform drag to trigger modification state with orange border
  const sourceCard = page.locator('[data-testid^="employee-card-"]').first();
  const targetBox = page.locator('[data-testid^="grid-box-"]').nth(1);

  await sourceCard.dragTo(targetBox);
  await waitForUiSettle(page, 0.5);

  // Capture close-up of the first employee card
  // Should show orange left border and modified badge
  await sourceCard.screenshot({
    path: outputPath,
  });
}

/**
 * Generate employee details panel showing updated ratings
 */
export async function generateEmployeeDetails(
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

  // Click on an employee to open details
  const firstEmployee = page.locator('[data-testid^="employee-card-"]').first();
  await firstEmployee.click();
  await waitForUiSettle(page, 0.5);

  // Make sure Details tab is active
  const detailsTab = page.locator('[data-testid="details-tab"]');
  if ((await detailsTab.count()) > 0) {
    await detailsTab.click();
    await waitForUiSettle(page, 0.3);
  }

  // Capture the right panel with details
  await page.locator('[data-testid="right-panel"]').screenshot({
    path: outputPath,
  });
}

/**
 * Generate Performance History timeline in employee details
 */
export async function generateTimelineView(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded and employee is selected
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await uploadExcelFile(page, "Sample_People_List.xlsx");
    await waitForUiSettle(page, 1.0);

    // Select first employee
    await page.locator('[data-testid^="employee-card-"]').first().click();
    await waitForUiSettle(page, 0.5);
  }

  // Scroll to timeline section if needed
  const timeline = page.locator('[data-testid="performance-timeline"]');

  // If timeline not found, try alternate selector
  const timelineOrHeading =
    (await timeline.count()) > 0
      ? timeline
      : page.locator('text="Performance History"');

  if ((await timelineOrHeading.count()) > 0) {
    await timelineOrHeading.first().scrollIntoViewIfNeeded();
    await waitForUiSettle(page, 0.3);
  }

  // Capture the timeline section
  await page.locator('[data-testid="right-panel"]').screenshot({
    path: outputPath,
  });
}

/**
 * Generate Changes tab with ACTUAL employee movements (not empty state)
 *
 * CRITICAL: Must show populated table with employee movements, not "No changes yet".
 *
 * This screenshot demonstrates the tracking feature, so it requires actual
 * change data to be meaningful. The method intelligently creates changes
 * if none exist from prior operations.
 */
export async function generateChangesTab(
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

  // CRITICAL: Ensure we have changes to display
  await ensureChangesExist(page, 3);

  // Click Changes tab to show populated table
  await clickTabAndWait(page, "changes-tab", 0.8);

  // CRITICAL: Verify changes are actually visible in the table
  const changesBadge = page.locator('[data-testid="changes-tab-badge"]');
  await expect(changesBadge).toBeVisible({ timeout: 3000 });

  // Verify badge shows correct count
  const badgeText = await changesBadge.textContent();
  const changeCount = parseInt(badgeText?.trim() || "0", 10);

  if (changeCount < 3) {
    throw new Error(
      `Expected at least 3 changes, but badge shows ${changeCount}. ` +
        "Screenshot would show incorrect state.",
    );
  }

  // Capture right panel showing changes
  await page.locator('[data-testid="right-panel"]').screenshot({
    path: outputPath,
  });
}

/**
 * Generate Changes panel entries screenshot
 *
 * Shows the changes panel with multiple employee movement entries listed.
 * Demonstrates the change tracking interface with several tracked movements.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generatePanelEntries(
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

  // Ensure we have multiple changes to display
  await ensureChangesExist(page, 5);

  // Click Changes tab
  await clickTabAndWait(page, "changes-tab", 0.8);

  // Verify we have change entries
  const changesBadge = page.locator('[data-testid="changes-tab-badge"]');
  await expect(changesBadge).toBeVisible({ timeout: 3000 });

  // Capture the right panel showing changes list
  await page.locator('[data-testid="right-panel"]').screenshot({
    path: outputPath,
  });
}
