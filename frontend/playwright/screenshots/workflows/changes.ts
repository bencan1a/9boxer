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
import {
  ensureChangesExist,
  getEmployeeIdFromCard,
} from "../../helpers/assertions";
import { dragEmployeeToPosition } from "../../helpers/dragAndDrop";

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

  // Get first employee to move
  const sourceCard = page.locator('[data-testid^="employee-card-"]').first();
  const employeeId = await getEmployeeIdFromCard(sourceCard);

  // Get current position to choose a different target
  const currentPosition = await sourceCard.getAttribute("data-position");
  const currentPosNum = parseInt(currentPosition || "9", 10);

  // Choose a target position different from current (use position 6 if not already there)
  const targetPosition = currentPosNum === 6 ? 3 : 6;

  // Perform drag using reliable manual mouse events
  // This matches the pattern from drag-drop-visual.spec.ts that works
  await dragEmployeeToPosition(page, employeeId, targetPosition, {
    expectModified: true,
  });

  // Wait for visual indicators to appear
  await waitForUiSettle(page, 0.5);

  // Capture close-up of the employee card
  // Should show orange left border and modified badge
  const movedCard = page.locator(`[data-testid="employee-card-${employeeId}"]`);
  await movedCard.screenshot({
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

  // Additional wait for changes to register in UI state
  await waitForUiSettle(page, 0.5);

  // Click Changes tab to show populated table
  await clickTabAndWait(page, "changes-tab", 0.8);

  // Try to verify badge is visible (optional check for screenshot quality)
  const changesBadge = page.locator('[data-testid="changes-tab-badge"]');
  try {
    await expect(changesBadge).toBeVisible({ timeout: 5000 });
    const badgeText = await changesBadge.textContent();
    const changeCount = parseInt(badgeText?.trim() || "0", 10);
    console.log(`✓ Changes badge shows: ${changeCount} changes`);

    if (changeCount < 3) {
      console.warn(
        `Warning: Badge shows ${changeCount} changes (expected >= 3). ` +
          "Screenshot may not show ideal state.",
      );
    }
  } catch (error) {
    console.warn(
      "Warning: Changes badge not found. Proceeding with screenshot anyway.",
    );
  }

  // Capture right panel showing changes
  // The changes should be visible even if badge verification failed
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
