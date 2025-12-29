/**
 * E2E tests for change tracking workflow
 * Tests the complete flow of moving employees, viewing changes, and adding notes
 */

import { test, expect } from "../fixtures";
import {
  loadSampleData,
  dragEmployeeToPosition,
  clickTabAndWait,
  getBadgeCount,
  waitForUiSettle,
  t,
} from "../helpers";
import * as path from "path";
import * as fs from "fs";
import type { Page, Locator } from "@playwright/test";

/**
 * Helper to find any employee in the grid
 * Returns the first employee found in any box (prioritizing likely populated boxes)
 */
async function findAnyEmployee(page: Page): Promise<{
  employeeCard: Locator;
  employeeId: string;
  boxNumber: number;
}> {
  // Check boxes in order of likelihood (high performers first)
  for (const box of [9, 8, 6, 5, 7, 4, 3, 2, 1]) {
    const gridBox = page.locator(`[data-testid="grid-box-${box}"]`);
    const employees = gridBox.locator('[data-testid^="employee-card-"]');
    const count = await employees.count();

    if (count > 0) {
      const firstEmployee = employees.first();
      const testId = await firstEmployee.getAttribute("data-testid");
      const employeeId = testId?.replace("employee-card-", "") || "";
      return {
        employeeCard: firstEmployee,
        employeeId,
        boxNumber: box,
      };
    }
  }

  throw new Error("No employees found in any grid box");
}

test.describe("Change Tracking Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Visit and load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should show empty state when no changes have been made", async ({
    page,
  }) => {
    // Navigate to Changes tab
    await clickTabAndWait(page, "changes-tab");

    // Verify empty state is visible
    await expect(
      page.locator('[data-testid="change-tracker-empty"]')
    ).toBeVisible();
    await expect(
      page.getByText(t("panel.changeTrackerTab.noChanges"))
    ).toBeVisible();
    await expect(
      page.getByText(t("panel.changeTrackerTab.moveEmployeesHint"))
    ).toBeVisible();
  });

  test("should display change in Changes tab after moving employee", async ({
    page,
  }) => {
    // Find any employee in the grid
    const { employeeCard, employeeId, boxNumber } = await findAnyEmployee(page);

    // Verify employee is visible in their current position
    await expect(employeeCard).toBeVisible();
    await expect(employeeCard).toHaveAttribute(
      "data-position",
      boxNumber.toString()
    );

    // Choose a target box different from current position
    const targetBox = boxNumber === 6 ? 3 : 6;

    // Move employee to target box
    await dragEmployeeToPosition(page, parseInt(employeeId), targetBox);

    // Navigate to Changes tab
    await clickTabAndWait(page, "changes-tab");

    // Verify change tracker view is visible
    await expect(
      page.locator('[data-testid="change-tracker-view"]')
    ).toBeVisible();

    // Verify the change row exists for the employee
    const changeRow = page.locator(`[data-testid="change-row-${employeeId}"]`);
    await expect(changeRow).toBeVisible();

    // Verify movement chips are shown (should show from and to boxes)
    // We don't verify specific box names as they depend on which employee was selected
    await expect(changeRow.locator(".MuiChip-root").first()).toBeVisible();
    await expect(changeRow.locator(".MuiChip-root").nth(1)).toBeVisible();
  });

  test("should allow user to add and save notes for a change", async ({
    page,
  }) => {
    // Find any employee in the grid
    const { employeeId, boxNumber } = await findAnyEmployee(page);

    // Choose a target box different from current position
    const targetBox = boxNumber === 6 ? 3 : 6;

    // Move employee to target box
    await dragEmployeeToPosition(page, parseInt(employeeId), targetBox);

    // Navigate to Changes tab
    await clickTabAndWait(page, "changes-tab");

    // Verify change row exists
    const changeRow = page.locator(`[data-testid="change-row-${employeeId}"]`);
    await expect(changeRow).toBeVisible();

    // Find the notes field (TextField contains the actual textarea, excluding the hidden auto-sizing one)
    const notesField = page.locator(
      `textarea[data-testid="change-notes-${employeeId}"]:not([readonly])`
    );
    await expect(notesField).toBeVisible();

    // Type notes
    const testNotes =
      "Promoted to senior role after excellent performance review";
    await notesField.click();
    await notesField.fill(testNotes);

    // Blur the field to trigger save
    await page.locator('[data-testid="change-tracker-view"]').click();

    // Verify notes are saved (auto-retrying assertion)
    await expect(notesField).toHaveValue(testNotes, { timeout: 5000 });
  });

  test("should remove change from tracker when employee is moved back to original position", async ({
    page,
  }) => {
    // Find any employee in the grid
    const { employeeId, boxNumber } = await findAnyEmployee(page);
    const originalBox = boxNumber;

    // Choose a target box different from current position
    const targetBox = boxNumber === 6 ? 3 : 6;

    // Move employee to target box
    await dragEmployeeToPosition(page, parseInt(employeeId), targetBox);

    // Verify change appears
    await clickTabAndWait(page, "changes-tab");
    await expect(
      page.locator(`[data-testid="change-row-${employeeId}"]`)
    ).toBeVisible();

    // Go back to grid and move employee back to original position
    await clickTabAndWait(page, "details-tab", 1.0);

    // Move back to original position - skip API wait and don't expect modified indicator
    await dragEmployeeToPosition(page, parseInt(employeeId), originalBox, {
      skipApiWait: true,
      expectModified: false,
    });

    // Verify change is removed
    await clickTabAndWait(page, "changes-tab");

    // Should show empty state again
    await expect(
      page.locator('[data-testid="change-tracker-empty"]')
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="change-row-${employeeId}"]`)
    ).not.toBeVisible();
  });

  test("should show single entry with net change when employee is moved multiple times", async ({
    page,
  }) => {
    // Find any employee in the grid
    const { employeeId, boxNumber } = await findAnyEmployee(page);

    // Choose intermediate and final target boxes
    const intermediateBox = boxNumber === 6 ? 3 : 6;
    const finalBox = boxNumber === 3 ? 1 : 3;

    // First move: original box to intermediate box
    await dragEmployeeToPosition(page, parseInt(employeeId), intermediateBox);

    // Second move: intermediate box to final box
    await dragEmployeeToPosition(page, parseInt(employeeId), finalBox);

    // Verify only one change entry exists (net change from original to final)
    await clickTabAndWait(page, "changes-tab");

    // Should only have one change row for this employee
    const changeRows = page.locator(
      `[data-testid^="change-row-${employeeId}"]`
    );
    await expect(changeRows).toHaveCount(1);

    // Verify the change row exists and shows movement chips
    const changeRow = page.locator(`[data-testid="change-row-${employeeId}"]`);
    await expect(changeRow.locator(".MuiChip-root").first()).toBeVisible();
    await expect(changeRow.locator(".MuiChip-root").nth(1)).toBeVisible();
  });

  test("should export modified employees with notes to Excel", async ({
    page,
  }) => {
    // Move an employee
    await dragEmployeeToPosition(page, 1, 6);

    // Add notes
    await clickTabAndWait(page, "changes-tab");

    const testNotes = "Ready for leadership development program";
    const notesField = page.locator(
      'textarea[data-testid="change-notes-1"]:not([readonly])'
    );
    await notesField.click();
    await notesField.fill(testNotes);
    await page.locator('[data-testid="change-tracker-view"]').click(); // Blur to save
    await waitForUiSettle(page, 0.5);

    // Navigate back to grid
    await clickTabAndWait(page, "details-tab");

    // Verify file menu badge shows changes (use Playwright's retry logic)
    await expect(page.locator('[data-testid="file-menu-badge"]')).toContainText(
      "1"
    );

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Open file menu and click export menu item
    await page.locator('[data-testid="file-menu-button"]').click();
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItem).toBeEnabled();
    await exportMenuItem.click();

    // Wait for download to complete
    const download = await downloadPromise;

    // Verify filename pattern
    expect(download.suggestedFilename()).toMatch(/modified_.*\.xlsx$/);

    // Save the downloaded file temporarily
    const downloadPath = path.join(
      __dirname,
      "..",
      "tmp",
      download.suggestedFilename()
    );

    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    await download.saveAs(downloadPath);

    // Verify file exists
    expect(fs.existsSync(downloadPath)).toBeTruthy();

    // Note: Verifying Excel content would require additional libraries (xlsx, exceljs)
    // For now, we verify the file was downloaded with the correct name
    // The backend tests should verify the actual Excel content structure

    // Clean up
    if (fs.existsSync(downloadPath)) {
      fs.unlinkSync(downloadPath);
    }
  });
});
