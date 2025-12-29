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

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
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
import {
  verifyModifiedIndicator,
  verifyBadgeCount,
  verifyGridPopulated,
  waitForCssTransition,
  CSS_TRANSITION_DURATIONS,
} from "../../helpers/visualValidation";

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
  outputPath: string
): Promise<void> {
  // Load sample data
  await loadSampleData(page);
  await waitForUiSettle(page, 1.0);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Verify grid is populated before capture
  await verifyGridPopulated(page, 5);

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
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
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

  // Get the moved card reference
  const movedCard = page.locator(`[data-testid="employee-card-${employeeId}"]`);

  // Wait for CSS transition to complete (orange border animation)
  await waitForCssTransition(movedCard, CSS_TRANSITION_DURATIONS.standard);

  // CRITICAL: Verify orange border and badge are visible before capture
  // This ensures screenshot actually shows the visual indicators
  await verifyModifiedIndicator(movedCard);

  console.log(`✓ Orange border and badge verified on employee ${employeeId}`);

  // Capture close-up of the employee card
  // Now guaranteed to show orange left border and modified badge
  await movedCard.screenshot({
    path: outputPath,
  });
}

/**
 * Generate employee details panel showing updated ratings
 */
export async function generateEmployeeDetails(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
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
 *
 * Timeline shows STATIC historical ratings imported from Excel file,
 * not dynamic changes from current session. The sample-employees.xlsx
 * file includes historical ratings columns (2023, 2024) to populate the timeline.
 */
export async function generateTimelineView(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click on any employee to open details panel
  // Historical ratings come from imported Excel data, not session changes
  const firstEmployee = page.locator('[data-testid^="employee-card-"]').first();
  await firstEmployee.click();
  await waitForUiSettle(page, 0.5);

  // Scroll to Performance History section
  const performanceHistory = page.locator(
    '[data-testid="performance-history"]'
  );
  if ((await performanceHistory.count()) > 0) {
    await performanceHistory.scrollIntoViewIfNeeded();
    await waitForUiSettle(page, 0.3);
  }

  // Capture right panel showing timeline
  const rightPanel = page.locator('[data-testid="right-panel"]');
  await rightPanel.screenshot({ path: outputPath });
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
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
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

  // CRITICAL: Verify badge shows minimum change count before capture
  // This ensures screenshot shows populated state, not empty "No changes yet"
  const changesBadge = page.locator('[data-testid="file-menu-badge"]');
  const changeCount = await verifyBadgeCount(changesBadge, 3);
  console.log(`✓ Changes tab verified with ${changeCount} changes`);

  // Capture right panel showing changes
  // Now guaranteed to show populated changes table
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
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Ensure we have multiple changes to display
  await ensureChangesExist(page, 5);

  // Click Changes tab
  await clickTabAndWait(page, "changes-tab", 0.8);

  // Verify we have sufficient change entries for good screenshot
  const changesBadge = page.locator('[data-testid="file-menu-badge"]');
  const changeCount = await verifyBadgeCount(changesBadge, 5);
  console.log(`✓ Changes panel verified with ${changeCount} entries`);

  // Capture the right panel showing changes list
  await page.locator('[data-testid="right-panel"]').screenshot({
    path: outputPath,
  });
}
