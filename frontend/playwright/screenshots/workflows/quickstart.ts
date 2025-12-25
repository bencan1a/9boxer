/**
 * Quickstart Screenshot Workflow
 *
 * Generates screenshots for the quickstart guide showing basic file upload workflow.
 * These screenshots demonstrate the initial user experience from empty state to populated grid.
 */

import { Page } from "@playwright/test";
import {
  resetToEmptyState,
  closeAllDialogsAndOverlays,
  waitForUiSettle,
} from "../../helpers/ui";
import { loadSampleData } from "../../helpers/fixtures";
import {
  verifyDialogVisible,
  verifyGridPopulated,
  waitForCssTransition,
  CSS_TRANSITION_DURATIONS,
} from "../../helpers/visualValidation";

/**
 * Generate File Menu Button screenshot
 *
 * Shows the File menu button in the toolbar in EMPTY state (before any file upload).
 * This demonstrates the "No file selected" initial state for quickstart guide.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateFileMenuButton(page, 'docs/images/screenshots/quickstart-file-menu-button.png');
 * ```
 */
export async function generateFileMenuButton(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Reset to empty state FIRST (no file loaded)
  await resetToEmptyState(page);

  // Wait for app bar to be present
  const appBar = page.locator('[data-testid="app-bar"]');
  await appBar.waitFor({ state: "attached", timeout: 10000 });

  // Capture the toolbar/app bar area showing "No file selected"
  await appBar.screenshot({ path: outputPath });
}

/**
 * Generate Upload Dialog screenshot
 *
 * Shows the file upload dialog UI with file selection input, upload button,
 * and instructions/help text.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateUploadDialog(page, 'docs/images/screenshots/quickstart-upload-dialog.png');
 * ```
 */
export async function generateUploadDialog(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Navigate to homepage
  await page.goto("http://localhost:5173");
  // Wait for React app to fully mount and hydrate
  await page.waitForTimeout(1000);

  // Click empty state import button to open dialog
  const emptyStateButton = page.locator(
    '[data-testid="empty-state-import-button"]',
  );
  if (await emptyStateButton.isVisible()) {
    await emptyStateButton.click();
  } else {
    // Use file menu if no empty state (fallback path)
    await page.locator('[data-testid="file-menu-button"]').click();
    // Wait for menu animation (Material-UI Popover: ~300ms)
    await waitForCssTransition(
      page.locator('[data-testid="file-menu"]'),
      CSS_TRANSITION_DURATIONS.short
    );
    // Click Import Data menu item
    await page.locator('[data-testid="import-data-menu-item"]').click();
  }

  // CRITICAL: Verify dialog is fully visible and animation complete
  // This prevents capturing mid-animation state
  await verifyDialogVisible(page, "file-upload-dialog");
  console.log("✓ File upload dialog verified (visible and settled)");

  // Capture the dialog
  const dialog = page.locator('[data-testid="file-upload-dialog"]');
  await dialog.screenshot({ path: outputPath });

  // Close dialog after capturing to prevent blocking subsequent screenshots
  await closeAllDialogsAndOverlays(page);
}

/**
 * Generate Grid Populated screenshot
 *
 * Shows the grid AFTER successful upload (no dialog overlay).
 * Demonstrates the final populated state with employee cards in the 9-box grid.
 *
 * IMPORTANT: This screenshot may follow quickstart-file-menu-button which calls
 * resetToEmptyState() and clears all data. We must reload data here.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateGridPopulated(page, 'docs/images/screenshots/quickstart-grid-populated.png');
 * ```
 */
export async function generateGridPopulated(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Reload sample data (previous screenshot may have cleared state)
  await loadSampleData(page);

  // Ensure dialog is closed (if upload just happened)
  await closeAllDialogsAndOverlays(page);

  // Wait for all API calls to complete (employee data loaded)
  // Grid uses virtualization which may take extra time to stabilize
  await waitForUiSettle(page, 0.5);

  // CRITICAL: Verify grid has minimum employees before capturing
  // This ensures we don't capture empty or sparsely populated grid
  const employeeCount = await verifyGridPopulated(page, 5);
  console.log(`✓ Grid verified with ${employeeCount} employees`);

  // Capture the populated grid (no dialog overlay)
  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.screenshot({ path: outputPath });
}

/**
 * Generate Success Annotated screenshot
 *
 * Shows the success state with the full application view including grid and employee count.
 *
 * NOTE: This screenshot captures the base image. Manual annotation post-processing required:
 * 1. Add callout arrow pointing to 3x3 grid structure
 * 2. Add callout arrow pointing to employee tiles (blue cards)
 * 3. Add callout arrow pointing to employee count in right panel
 *
 * Tools like Snagit, Skitch, or Photoshop can add these annotations.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateSuccessAnnotated(page, 'docs/images/screenshots/quickstart-success-annotated.png');
 * ```
 */
export async function generateSuccessAnnotated(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  const count = await employeeCards.count();
  if (count === 0) {
    await loadSampleData(page);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to settle
  await waitForUiSettle(page, 0.5);

  // Verify grid is populated before capturing base image
  const employeeCount = await verifyGridPopulated(page, 5);
  console.log(`✓ Success state verified with ${employeeCount} employees`);

  // Capture full page view showing grid and employee count
  // Manual annotations will be added to highlight:
  // - The 3x3 grid structure
  // - Employee tile examples
  // - Employee count display
  await page.screenshot({ path: outputPath, fullPage: true });
}

/**
 * Generate Excel sample file screenshot (manual capture required)
 *
 * Shows the sample Excel file format with required columns highlighted.
 * This demonstrates to users what format their input file should follow.
 *
 * NOTE: This screenshot requires manual capture:
 * 1. Open Sample_People_List.xlsx in Excel
 * 2. Highlight required columns (Name, Performance, Potential)
 * 3. Capture screenshot showing the spreadsheet structure
 * 4. Save to output path
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateExcelSample(
  page: Page,
  outputPath: string,
): Promise<void> {
  // This is a placeholder for manual screenshot workflow
  // The actual screenshot must be captured manually from Excel
  console.log(
    "MANUAL SCREENSHOT REQUIRED: Sample Excel file format\n" +
      "Steps:\n" +
      "1. Open resources/Sample_People_List.xlsx in Excel\n" +
      "2. Highlight required columns (Name, Performance, Potential)\n" +
      "3. Capture screenshot showing spreadsheet structure\n" +
      `4. Save to: ${outputPath}`,
  );

  // Return without error to allow generator to continue
  // Manual screenshots are tracked separately
}
