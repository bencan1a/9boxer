/**
 * Screenshot workflows for "File Operations" documentation
 *
 * Generates screenshots demonstrating the file handling workflow:
 * - File menu with recent files list
 * - Unsaved Changes dialog (protection before discarding work)
 * - Apply Changes dialog (update original vs save-as-new)
 * - File error handling (read-only fallback)
 *
 * All functions reuse shared helpers from frontend/playwright/helpers/
 * to ensure consistency with E2E tests.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";
import { ensureChangesExist } from "../../helpers/assertions";
import {
  waitForCssTransition,
  CSS_TRANSITION_DURATIONS,
} from "../../helpers/visualValidation";

/**
 * Generate File menu with recent files list
 *
 * Shows the File menu dropdown with:
 * - Import Data option
 * - Load Sample Dataset option
 * - Recent Files section with file list
 * - Apply X Changes option (if changes exist)
 * - Close File option
 * - Clear Recent Files option
 *
 * Note: Recent files list may be empty if no files have been loaded yet.
 * This captures whatever state exists in localStorage.
 */
export async function generateFileMenuWithRecents(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data using the helper (follows best practices)
  await loadSampleData(page);
  await waitForUiSettle(page, 0.5);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click the File menu button to open dropdown
  const fileMenuButton = page.locator('[data-testid="file-menu-button"]');
  await fileMenuButton.click();

  // Wait for menu to become visible (state-based wait)
  await page
    .locator('[role="menu"]')
    .waitFor({ state: "visible", timeout: 5000 });
  await waitForUiSettle(page, 0.3);

  // Capture the File menu dropdown
  const fileMenu = page.locator('[role="menu"]');
  await fileMenu.screenshot({
    path: outputPath,
  });

  // Close the menu after capture
  await page.keyboard.press("Escape");
}

/**
 * Generate Unsaved Changes dialog
 *
 * Shows the protection dialog that appears when user tries to:
 * - Import new data
 * - Load sample data
 * - Close file
 *
 * Dialog displays three options:
 * - Apply Changes (save work first)
 * - Discard Changes (lose all changes)
 * - Cancel (return to work)
 *
 * Requires actual changes to exist to trigger the dialog.
 */
export async function generateUnsavedChangesDialog(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data
  await loadSampleData(page);
  await waitForUiSettle(page, 0.5);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Create changes to trigger unsaved changes protection
  await ensureChangesExist(page, 2);
  await waitForUiSettle(page, 0.5);

  // Trigger unsaved changes dialog by trying to load sample data again
  // Open File menu
  const fileMenuButton = page.locator('[data-testid="file-menu-button"]');
  await fileMenuButton.click();

  // Wait for menu to be visible (state-based wait)
  await page
    .locator('[role="menu"]')
    .waitFor({ state: "visible", timeout: 5000 });

  // Click "Load Sample Dataset" which should trigger unsaved changes dialog
  const loadSampleMenuItem = page.locator(
    '[data-testid="load-sample-menu-item"]'
  );
  await loadSampleMenuItem.click();

  // Wait for dialog to appear (state-based wait, not arbitrary timeout)
  const dialog = page
    .locator('[role="dialog"]')
    .filter({ hasText: "Unsaved Changes" });
  await dialog.waitFor({ state: "visible", timeout: 5000 });
  await waitForUiSettle(page, 0.3);

  // Capture the unsaved changes dialog
  await dialog.screenshot({
    path: outputPath,
  });

  // Close dialog
  await page.keyboard.press("Escape");
}

/**
 * Generate Apply Changes dialog in default mode (update original file)
 *
 * Shows the dialog that appears when user applies changes with:
 * - Title showing change count
 * - "Update original file" option (default, unchecked checkbox)
 * - File path display
 * - Apply Changes button
 * - Cancel button
 *
 * Note: This captures the Storybook story since Apply Changes dialog
 * requires a file session which is complex to set up in screenshot workflow.
 */
export async function generateApplyChangesDialogDefault(
  page: Page,
  outputPath: string
): Promise<void> {
  // Navigate to Storybook story for Apply Changes Dialog
  await page.goto(
    "http://localhost:6006/iframe.html?id=dialogs-applychangesdialog--default&viewMode=story"
  );
  await waitForUiSettle(page, 1.0);

  // Capture the dialog
  const dialog = page.locator('[data-testid="apply-changes-dialog"]');
  await dialog.screenshot({
    path: outputPath,
  });
}

/**
 * Generate Apply Changes dialog in save-as mode (save to different file)
 *
 * Shows the dialog with:
 * - Checkbox CHECKED for "Save to a different file instead"
 * - Browse button enabled for choosing new location
 * - Different messaging about creating new file
 *
 * This demonstrates the alternative save workflow for creating
 * milestone versions or backups.
 *
 * Note: Uses Default Storybook story and manually clicks checkbox.
 */
export async function generateApplyChangesDialogSaveAs(
  page: Page,
  outputPath: string
): Promise<void> {
  // Navigate to Storybook Default story
  await page.goto(
    "http://localhost:6006/iframe.html?id=dialogs-applychangesdialog--default&viewMode=story"
  );
  await waitForUiSettle(page, 1.0);

  // Click the checkbox to show save-as mode
  const checkbox = page.locator('[data-testid="save-as-new-checkbox"]');
  await checkbox.click();
  await waitForUiSettle(page, 0.5);

  // Capture the dialog
  const dialog = page.locator('[data-testid="apply-changes-dialog"]');
  await dialog.screenshot({
    path: outputPath,
  });
}

/**
 * Generate file error fallback screenshot
 *
 * Shows the behavior when original file can't be updated (read-only, locked, deleted).
 * The app automatically falls back to "save to different file" mode.
 *
 * Note: Uses the WithError Storybook story which shows the error message and fallback.
 */
export async function generateFileErrorFallback(
  page: Page,
  outputPath: string
): Promise<void> {
  // Navigate to WithError Storybook story
  await page.goto(
    "http://localhost:6006/iframe.html?id=dialogs-applychangesdialog--with-error&viewMode=story"
  );
  await waitForUiSettle(page, 1.0);

  // Capture the dialog with error message
  const dialog = page.locator('[data-testid="apply-changes-dialog"]');
  await dialog.screenshot({
    path: outputPath,
  });
}
