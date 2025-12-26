/**
 * E2E tests for change tracking workflow
 * Tests the complete flow of moving employees, viewing changes, and adding notes
 */

import { test, expect } from "@playwright/test";
import {
  uploadExcelFile,
  dragEmployeeToPosition,
  clickTabAndWait,
  getBadgeCount,
  waitForUiSettle,
} from "../helpers";
import * as path from "path";
import * as fs from "fs";

test.describe("Change Tracking Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Visit and upload sample data
    await page.goto("/");
    await uploadExcelFile(page, "sample-employees.xlsx");

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
    await expect(page.getByText("No changes yet")).toBeVisible();
    await expect(
      page.getByText("Move employees to track changes here")
    ).toBeVisible();
  });

  test("should display change in Changes tab after moving employee", async ({
    page,
  }) => {
    // Verify Alice Smith (employee_id: 1) is in position 9
    const aliceCard = page.locator('[data-testid="employee-card-1"]');
    await expect(aliceCard).toHaveAttribute("data-position", "9");

    // Move employee from position 9 to position 6 using drag and drop
    await dragEmployeeToPosition(page, 1, 6);

    // Navigate to Changes tab
    await clickTabAndWait(page, "changes-tab");

    // Verify change tracker view is visible
    await expect(
      page.locator('[data-testid="change-tracker-view"]')
    ).toBeVisible();

    // Verify the change row exists for employee ID 1
    const changeRow = page.locator('[data-testid="change-row-1"]');
    await expect(changeRow).toBeVisible();

    // Verify employee name is shown
    await expect(changeRow.getByText("Alice Smith")).toBeVisible();

    // Verify movement chips are shown (from Star to High Impact)
    await expect(changeRow.getByText(/Star/)).toBeVisible();
    await expect(changeRow.getByText(/High Impact/)).toBeVisible();
  });

  test("should allow user to add and save notes for a change", async ({
    page,
  }) => {
    // Move employee using drag and drop
    await dragEmployeeToPosition(page, 1, 6);

    // Navigate to Changes tab
    await clickTabAndWait(page, "changes-tab");

    // Verify change row exists
    const changeRow = page.locator('[data-testid="change-row-1"]');
    await expect(changeRow).toBeVisible();

    // Find the notes field (TextField contains the actual textarea, excluding the hidden auto-sizing one)
    const notesField = page.locator(
      '[data-testid="change-notes-1"] textarea:not([readonly])'
    );
    await expect(notesField).toBeVisible();

    // Type notes
    const testNotes =
      "Promoted to senior role after excellent performance review";
    await notesField.click();
    await notesField.fill(testNotes);

    // Blur the field to trigger save
    await page.locator('[data-testid="change-tracker-view"]').click();

    // Wait a moment for the save to complete
    await page.waitForTimeout(500);

    // Verify notes are visible in the field
    await expect(notesField).toHaveValue(testNotes);
  });

  test("should remove change from tracker when employee is moved back to original position", async ({
    page,
  }) => {
    // Move employee from position 9 to position 6
    await dragEmployeeToPosition(page, 1, 6);

    // Verify change appears
    await clickTabAndWait(page, "changes-tab");
    await expect(page.locator('[data-testid="change-row-1"]')).toBeVisible();

    // Go back to grid and move employee back to original position (9)
    await clickTabAndWait(page, "details-tab", 1.0);

    // Move back to original position - skip API wait and don't expect modified indicator
    await dragEmployeeToPosition(page, 1, 9, {
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
      page.locator('[data-testid="change-row-1"]')
    ).not.toBeVisible();
  });

  test("should show single entry with net change when employee is moved multiple times", async ({
    page,
  }) => {
    // Move employee from position 9 -> 6 -> 3
    // First move: 9 to 6
    await dragEmployeeToPosition(page, 1, 6);

    // Second move: 6 to 3
    await dragEmployeeToPosition(page, 1, 3);

    // Verify only one change entry exists (net change: 9 -> 3)
    await clickTabAndWait(page, "changes-tab");

    // Should only have one change row for this employee
    const changeRows = page.locator('[data-testid^="change-row-1"]');
    await expect(changeRows).toHaveCount(1);

    // Verify it shows net change from Star (9) to Workhorse (3)
    const changeRow = page.locator('[data-testid="change-row-1"]');
    await expect(changeRow.getByText(/Star/)).toBeVisible();
    await expect(changeRow.getByText(/Workhorse/)).toBeVisible();
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
      '[data-testid="change-notes-1"] textarea:not([readonly])'
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
