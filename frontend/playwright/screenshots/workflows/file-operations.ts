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
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";
import { captureStorybookScreenshot } from "../storybook-screenshot";

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
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  // Navigate to app and load sample data
  await page.goto("http://localhost:5173");
  await waitForUiSettle(page, 1.0);

  // Click Load Sample Data button
  const loadSampleButton = page.locator(
    '[data-testid="load-sample-data-button"]'
  );
  await loadSampleButton.click();
  await waitForUiSettle(page, 0.3);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click the File menu button to open dropdown
  await page.waitForTimeout(500);
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
 * Note: Uses Storybook story for reliable, fast screenshot generation.
 */
export async function generateUnsavedChangesDialog(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dialogs-unsavedchangesdialog--multiple-changes",
    outputPath,
    theme: "light",
    waitTime: 800, // Dialog has animations
    selector: '[role="dialog"]', // Dialog renders in portal
  });
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
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dialogs-applychangesdialog--default",
    outputPath,
    theme: "light",
    waitTime: 800, // Dialog has animations
    selector: '[role="dialog"]', // Dialog renders in portal
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
  const { navigateToStory } = await import("../storybook-screenshot");
  const fs = await import("fs");
  const path = await import("path");

  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  // Navigate to Storybook Default story
  await navigateToStory(
    page,
    "app-dialogs-applychangesdialog--default",
    "light"
  );

  // Wait for dialog to be visible
  await page.waitForSelector('[role="dialog"]', { state: "visible" });
  await page.waitForTimeout(800);

  // Click the checkbox to show save-as mode
  const checkbox = page.locator('[data-testid="save-as-new-checkbox"]');
  await checkbox.click();
  await page.waitForTimeout(500);

  // Capture the dialog
  const dialog = page.locator('[role="dialog"]');
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  await dialog.screenshot({
    path: outputPath,
  });

  console.log(
    `  ✓ Captured from Storybook with checkbox: app-dialogs-applychangesdialog--default (light theme)`
  );
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
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dialogs-applychangesdialog--with-error",
    outputPath,
    theme: "light",
    waitTime: 800, // Dialog has animations
    selector: '[role="dialog"]', // Dialog renders in portal
  });
}
