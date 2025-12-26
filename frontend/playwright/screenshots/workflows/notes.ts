/**
 * Screenshot workflows for "Adding Notes" documentation
 *
 * Generates screenshots demonstrating the note-taking functionality:
 * - Note fields in Changes tab
 * - Good note examples
 * - Excel export with notes column (manual)
 *
 * All functions reuse shared helpers from frontend/playwright/helpers/
 * to ensure consistency with E2E tests.
 */

import { Page } from "@playwright/test";
import { uploadExcelFile } from "../../helpers/upload";
import {
  closeAllDialogsAndOverlays,
  clickTabAndWait,
  waitForUiSettle,
} from "../../helpers/ui";
import { ensureChangesExist } from "../../helpers/assertions";
import {
  verifyBadgeCount,
  waitForCssTransition,
  CSS_TRANSITION_DURATIONS,
} from "../../helpers/visualValidation";

/**
 * Generate Changes tab with note field highlighted
 *
 * CRITICAL FIX: Must ensure changes exist before capturing Changes tab,
 * otherwise we capture empty "No changes yet" state which doesn't demonstrate
 * the notes feature at all.
 */
export async function generateChangesTabField(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await uploadExcelFile(page, "sample-employees.xlsx");
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // CRITICAL: Ensure at least 1 change exists so we can show the Notes field
  // Without this, we capture empty state which is useless for documentation
  await ensureChangesExist(page, 1);

  // Additional wait for changes to register in UI state
  await waitForUiSettle(page, 0.5);

  // Click Changes tab
  await clickTabAndWait(page, "changes-tab", 0.8);

  // Verify changes are visible before capturing
  const changesBadge = page.locator('[data-testid="file-menu-badge"]');
  const changeCount = await verifyBadgeCount(changesBadge, 1);
  console.log(
    `✓ Changes tab verified with ${changeCount} change(s) showing note field`
  );

  // Capture right panel with note field
  await page.locator('[data-testid="right-panel"]').screenshot({
    path: outputPath,
  });
}

/**
 * Generate Changes tab with well-written note example
 *
 * CRITICAL FIX: Must ensure changes exist before trying to add notes.
 * Note fields only appear when changes exist, so without this we capture
 * empty state.
 */
export async function generateGoodExample(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await uploadExcelFile(page, "sample-employees.xlsx");
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // CRITICAL: Ensure at least 1 change exists so note field will be available
  await ensureChangesExist(page, 1);

  // Additional wait for changes to register in UI state
  await waitForUiSettle(page, 0.5);

  // Navigate to Changes tab
  await clickTabAndWait(page, "changes-tab", 0.8);

  // Verify changes are visible
  const changesBadge = page.locator('[data-testid="file-menu-badge"]');
  await verifyBadgeCount(changesBadge, 1);

  // Try to find and fill a note field
  // The testid is on the FormControl wrapper, need to get the actual textarea inside
  const noteFieldWrapper = page
    .locator('[data-testid^="change-notes-"]')
    .first();
  if ((await noteFieldWrapper.count()) > 0) {
    const exampleNote =
      "Moved to High Potential based on Q4 2024 leadership demonstrated in " +
      "cross-functional API project. Successfully managed team of 5 engineers " +
      "and delivered ahead of schedule. Action: Enroll in leadership development " +
      "program Q1 2025.";

    // Find the textarea within the FormControl
    const noteField = noteFieldWrapper.locator("textarea").first();
    await noteField.fill(exampleNote);

    // Wait for input to settle
    await waitForUiSettle(page, 0.3);
    console.log("✓ Good note example filled successfully");

    // Capture right panel showing note
    await page.locator('[data-testid="right-panel"]').screenshot({
      path: outputPath,
    });
  } else {
    throw new Error("Note field not found. Cannot capture good note example.");
  }
}

/**
 * Placeholder for Excel export with notes column (manual capture required)
 *
 * This screenshot requires:
 * 1. Exporting data to Excel
 * 2. Opening the file in Excel/Sheets
 * 3. Capturing screenshot showing notes column
 *
 * Manual steps:
 * 1. Load data and add notes to some changes
 * 2. Click File > Export Data
 * 3. Open exported Excel file
 * 4. Take screenshot showing the Notes column with example data
 * 5. Save to: resources/user-guide/docs/images/screenshots/workflow/workflow-changes-notes-in-excel.png
 */
export async function generateExportExcel(
  page: Page,
  outputPath: string
): Promise<void> {
  // This is a placeholder - actual screenshot must be captured manually
  // The function exists to maintain consistent interface with other workflows
  console.log(
    `⚠️  Manual screenshot required: ${outputPath}\n` +
      "   Steps:\n" +
      "   1. Load data and add notes to changes\n" +
      "   2. Export to Excel (File > Export Data)\n" +
      "   3. Open Excel file and screenshot Notes column\n" +
      "   4. Save to output path"
  );

  // Return without error to allow generator to continue
  // Manual screenshots are tracked separately in results
}

/**
 * Generate notes visible in donut mode employee hover tooltip
 *
 * Shows how notes appear when hovering over employees in donut mode.
 * Demonstrates that notes are accessible even in the alternative view layout.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateDonutMode(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await uploadExcelFile(page, "sample-employees.xlsx");
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Ensure changes with notes exist
  await ensureChangesExist(page, 1);

  // Add a note to the first change
  await clickTabAndWait(page, "changes-tab", 0.5);
  const noteFieldWrapper = page
    .locator('[data-testid^="change-notes-"]')
    .first();
  if ((await noteFieldWrapper.count()) > 0) {
    const noteField = noteFieldWrapper.locator("textarea").first();
    await noteField.fill("Example note for donut mode demonstration");
    await waitForUiSettle(page, 0.3);
  }

  // Switch to donut mode
  const donutToggle = page.locator('[data-testid="donut-mode-toggle"]');
  await donutToggle.waitFor({ state: "visible", timeout: 5000 });
  await donutToggle.click();

  // Wait for donut mode transition
  await waitForCssTransition(
    page.locator('[data-testid="nine-box-grid"]'),
    CSS_TRANSITION_DURATIONS.complex
  );
  console.log("✓ Donut mode activated");

  // Hover over an employee to show tooltip with note
  const firstEmployee = page.locator('[data-testid^="employee-card-"]').first();
  await firstEmployee.hover();

  // Wait for tooltip to appear
  await waitForUiSettle(page, 0.5);

  // Capture the grid with tooltip
  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.screenshot({ path: outputPath });
}
