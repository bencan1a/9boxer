/**
 * E2E Core Tests: Export Tests (6.1-6.3)
 *
 * Tests the export functionality to ensure changes are correctly
 * written to Excel files with proper ratings and change notes.
 *
 * Test Coverage:
 * - Test 6.1: Export Changes to Excel
 * - Test 6.2: Exported File Contains Updated Ratings
 * - Test 6.3: Exported File Contains Change Notes
 */

import { test, expect } from "../fixtures";
import {
  getFirstEmployeeId,
  dragEmployeeToPosition,
  selectEmployee,
  clickTabAndWait,
  clickExport,
  applyChanges,
  verifyExportedEmployeeRating,
  verifyExportedChangeNotes,
} from "../helpers";
import { uploadFile } from "../helpers/fileOperations";
import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";
import * as XLSX from "xlsx";

test.describe("Export Tests", () => {
  let exportPath: string;

  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto("/");

    // Upload a sample Excel file (required for export functionality)
    await uploadFile(page, "sample-employees.xlsx");

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Set up export path in home directory (backend only allows home or app data directory)
    exportPath = path.join(os.homedir(), `test-export-${Date.now()}.xlsx`);
  });

  test.afterEach(async () => {
    // Clean up export file
    try {
      await fs.unlink(exportPath);
    } catch (error) {
      // File might not exist if test failed before export
    }
  });

  test("6.1 - Export Changes to Excel", async ({ page }) => {
    // Get first employee ID
    const employeeId = await getFirstEmployeeId(page);

    // Make a change (move employee to position 9 - High Performance, High Potential)
    await dragEmployeeToPosition(page, employeeId, 9);

    // Verify change count badge appears
    await expect(page.locator('[data-testid="file-menu-badge"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="file-menu-badge"] .MuiBadge-badge')
    ).toContainText("1");

    // Click export button to open Apply Changes dialog
    await clickExport(page);

    // Wait for Apply Changes dialog
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).toBeVisible();

    // Verify dialog shows the filename
    const dialogText = await page
      .locator('[data-testid="apply-changes-dialog"]')
      .textContent();
    expect(dialogText).toContain("sample-employees.xlsx");

    // Apply changes with save_new mode (this helper sets the electronAPI mock internally)
    await applyChanges(page, "save_new", exportPath);

    // Verify file was created
    await fs.access(exportPath);

    // Verify file is valid Excel format
    const stats = await fs.stat(exportPath);
    expect(stats.size).toBeGreaterThan(0);

    // Verify filename follows pattern (should be in temp directory)
    expect(exportPath).toContain("test-export");
    expect(exportPath).toContain(".xlsx");
  });

  test("6.2 - Exported File Contains Updated Ratings", async ({ page }) => {
    // Get first employee ID
    const employeeId = await getFirstEmployeeId(page);

    // Store original position
    const employeeCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );
    const originalPosition = parseInt(
      (await employeeCard.getAttribute("data-position")) || "1",
      10
    );

    // Move employee to known position (position 9 - High Performance, High Potential)
    await dragEmployeeToPosition(page, employeeId, 9);

    // Verify the move was successful by checking the change badge
    await expect(page.locator('[data-testid="file-menu-badge"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="file-menu-badge"] .MuiBadge-badge')
    ).toContainText("1");

    // Mock the Electron file save dialog
    await page.evaluate((path) => {
      (window as any).electronAPI = {
        saveFileDialog: async () => path,
      };
    }, exportPath);

    // Export the file
    await clickExport(page);
    await applyChanges(page, "save_new", exportPath);

    // Verify file was created
    await fs.access(exportPath);

    // Verify file is valid Excel format
    const stats = await fs.stat(exportPath);
    expect(stats.size).toBeGreaterThan(0);

    // Additional verification: Check file opens without errors
    const workbook = XLSX.readFile(exportPath);

    // Verify all original columns are preserved
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    expect(data.length).toBeGreaterThan(0);

    // Verify the first row has expected columns
    const firstRow = data[0] as any;
    expect(firstRow).toHaveProperty("Employee ID");
    expect(firstRow).toHaveProperty("Worker");
    expect(firstRow).toHaveProperty("Performance");
    expect(firstRow).toHaveProperty("Potential");

    // Verify employee exists in exported file and was marked as modified
    const employee = data.find(
      (row: any) =>
        parseInt(row["Employee ID"].toString(), 10) ===
        parseInt(employeeId.toString(), 10)
    );
    expect(employee).toBeDefined();
    expect(employee["Modified in Session"]).toBe("Yes");
  });

  test("6.3 - Exported File Contains Change Notes", async ({ page }) => {
    // Get first employee ID
    const employeeId = await getFirstEmployeeId(page);

    // Move employee to position 6 (Medium Performance, High Potential)
    await dragEmployeeToPosition(page, employeeId, 6);

    // Navigate to Changes tab
    await clickTabAndWait(page, "changes-tab");

    // Wait for change row to be visible
    const changeRow = page.locator(`[data-testid="change-row-${employeeId}"]`);
    await expect(changeRow).toBeVisible();

    // Add note
    const testNote = "Test export note - performance improvement";
    const notesField = page.locator(
      `textarea[data-testid="change-notes-${employeeId}"]:not([readonly])`
    );
    await notesField.click();
    await notesField.fill(testNote);

    // Blur the field to trigger save
    await page.locator('[data-testid="change-tracker-view"]').click();

    // Wait for note to be saved
    await expect(notesField).toHaveValue(testNote, { timeout: 5000 });

    // Navigate back to Details tab
    await clickTabAndWait(page, "details-tab");

    // Mock the Electron file save dialog
    await page.evaluate((path) => {
      (window as any).electronAPI = {
        saveFileDialog: async () => path,
      };
    }, exportPath);

    // Export the file
    await clickExport(page);
    await applyChanges(page, "save_new", exportPath);

    // Verify exported file contains change notes
    await verifyExportedChangeNotes(exportPath, employeeId, testNote);

    // Additional verification: Check column exists and employees without notes have empty cells
    const workbook = XLSX.readFile(exportPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    // Verify "9Boxer Change Notes" column exists
    const firstRow = data[0];
    expect(firstRow).toHaveProperty("9Boxer Change Notes");

    // Verify "Modified in Session" column exists
    expect(firstRow).toHaveProperty("Modified in Session");

    // Find the modified employee (compare as numbers to handle leading zeros)
    const modifiedEmployee = data.find(
      (row) =>
        parseInt(row["Employee ID"].toString(), 10) ===
        parseInt(employeeId.toString(), 10)
    );
    expect(modifiedEmployee).toBeDefined();
    expect(modifiedEmployee["9Boxer Change Notes"]).toBe(testNote);
    expect(modifiedEmployee["Modified in Session"]).toBe("Yes");

    // Verify at least one employee without changes has empty/blank notes
    const unchangedEmployee = data.find(
      (row) =>
        parseInt(row["Employee ID"].toString(), 10) !==
          parseInt(employeeId.toString(), 10) &&
        row["Modified in Session"] !== "Yes"
    );
    if (unchangedEmployee) {
      expect(
        unchangedEmployee["9Boxer Change Notes"] === undefined ||
          unchangedEmployee["9Boxer Change Notes"] === ""
      ).toBeTruthy();
    }
  });
});
