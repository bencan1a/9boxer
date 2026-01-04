/**
 * Export validation helpers for Playwright E2E tests
 *
 * Provides helpers for validating exported Excel files.
 * Uses the exceljs library to read and verify Excel file contents.
 */

import { expect } from "@playwright/test";
import * as ExcelJS from "exceljs";

/**
 * Type definition for Excel row data
 */
interface EmployeeRow {
  "Employee ID": number | string;
  Worker: string;
  Performance: string;
  Potential: string;
  "Modified in Session"?: string;
  "9Boxer Change Notes"?: string;
  [key: string]: unknown; // Allow other columns
}

/**
 * Parse an Excel file and return rows as an array of objects
 *
 * @param filePath - Absolute path to the Excel file
 * @returns Array of employee row data
 */
async function parseExcelFile(filePath: string): Promise<EmployeeRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const rows: EmployeeRow[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // First row is headers
      // Iterate through all cells in the header row to get all column names
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber > 0) {
          headers[colNumber - 1] = String(cell.value ?? "");
        }
      });
    } else {
      // Data rows - iterate through all columns defined by headers
      const rowData: Record<string, unknown> = {};
      headers.forEach((header, i) => {
        // Get cell value at column index (i + 1 because ExcelJS is 1-indexed)
        const cell = row.getCell(i + 1);
        rowData[header] = cell.value;
      });
      rows.push(rowData as EmployeeRow);
    }
  });

  return rows;
}

/**
 * Wait for exported file to be created
 *
 * Useful when export is slow and file might not be immediately available.
 * Polls for file existence with configurable timeout.
 *
 * @param filePath - Absolute path to the exported file
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 *
 * @example
 * ```typescript
 * test('wait for slow export', async ({ page }) => {
 *   await clickExport(page);
 *   const exportPath = '/path/to/file.xlsx';
 *
 *   // Wait up to 10 seconds for file to be created
 *   await waitForExportedFile(exportPath);
 *
 *   // Now verify the file contents
 *   await verifyExportedEmployeeRating(exportPath, 1, 'High', 'High');
 * });
 * ```
 *
 * @throws Error if file not created within timeout period
 */
export async function waitForExportedFile(
  filePath: string,
  timeout: number = 10000
): Promise<void> {
  const fs = await import("fs/promises");
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      await fs.access(filePath);
      return; // File exists
    } catch {
      // File doesn't exist yet, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(`File not created within ${timeout}ms: ${filePath}`);
}

/**
 * Verify an exported employee's Performance and Potential ratings
 *
 * Reads the exported Excel file and verifies that the specified employee
 * has the expected Performance and Potential values.
 *
 * @param filePath - Absolute path to the exported Excel file
 * @param employeeId - Employee ID to find in the file
 * @param expectedPerformance - Expected Performance rating ("Low", "Medium", "High")
 * @param expectedPotential - Expected Potential rating ("Low", "Medium", "High")
 *
 * @example
 * ```typescript
 * test('exported file has updated ratings', async ({ page }) => {
 *   await loadSampleData(page);
 *   const employeeId = await getFirstEmployeeId(page);
 *
 *   // Move employee to High Performance, High Potential
 *   await dragEmployeeToPosition(page, employeeId, 9);
 *
 *   // Export and verify
 *   await clickExport(page);
 *   const exportPath = '/path/to/modified_file.xlsx';
 *   await verifyExportedEmployeeRating(exportPath, employeeId, 'High', 'High');
 * });
 * ```
 *
 * @throws Error if employee not found or ratings don't match
 */
export async function verifyExportedEmployeeRating(
  filePath: string,
  employeeId: number,
  expectedPerformance: string,
  expectedPotential: string
): Promise<void> {
  // Read Excel file using exceljs
  const data = await parseExcelFile(filePath);

  // Find employee by ID (compare as numbers to handle leading zeros)
  const employee = data.find(
    (row) =>
      parseInt(row["Employee ID"].toString(), 10) ===
      parseInt(employeeId.toString(), 10)
  );

  if (!employee) {
    throw new Error(
      `Employee ${employeeId} not found in exported file ${filePath}`
    );
  }

  // Verify Performance rating
  expect(employee.Performance).toBe(expectedPerformance);

  // Verify Potential rating
  expect(employee.Potential).toBe(expectedPotential);
}

/**
 * Verify an exported employee's change notes
 *
 * Reads the exported Excel file and verifies that the specified employee
 * has the expected change note in the "9Boxer Change Notes" column and
 * is marked as "Yes" in the "Modified in Session" column.
 *
 * @param filePath - Absolute path to the exported Excel file
 * @param employeeId - Employee ID to find in the file
 * @param expectedNote - Expected note text
 *
 * @example
 * ```typescript
 * test('exported file includes change notes', async ({ page }) => {
 *   await loadSampleData(page);
 *   const employeeId = await getFirstEmployeeId(page);
 *
 *   // Move employee and add note
 *   await dragEmployeeToPosition(page, employeeId, 9);
 *   await selectEmployee(page, employeeId);
 *   await clickTabAndWait(page, 'changes-tab');
 *   await page.locator('[data-testid="change-notes"]').fill('Promoted to senior role');
 *
 *   // Export and verify
 *   await clickExport(page);
 *   const exportPath = '/path/to/modified_file.xlsx';
 *   await verifyExportedChangeNotes(exportPath, employeeId, 'Promoted to senior role');
 * });
 * ```
 *
 * @throws Error if employee not found, note doesn't match, or not marked as modified
 */
export async function verifyExportedChangeNotes(
  filePath: string,
  employeeId: number,
  expectedNote: string
): Promise<void> {
  // Read Excel file using exceljs
  const data = await parseExcelFile(filePath);

  // Find employee by ID (compare as numbers to handle leading zeros)
  const employee = data.find(
    (row) =>
      parseInt(row["Employee ID"].toString(), 10) ===
      parseInt(employeeId.toString(), 10)
  );

  if (!employee) {
    throw new Error(
      `Employee ${employeeId} not found in exported file ${filePath}`
    );
  }

  // Verify "9Boxer Change Notes" column exists and matches
  expect(employee["9Boxer Change Notes"]).toBe(expectedNote);

  // Verify "Modified in Session" column is "Yes"
  expect(employee["Modified in Session"]).toBe("Yes");
}

/**
 * Verify multiple employees in exported file
 *
 * Convenience helper to verify multiple employees at once.
 * Optimized to read the file once and validate all employees from the in-memory data.
 *
 * @param filePath - Absolute path to the exported Excel file
 * @param employees - Array of employee verification data
 *
 * @example
 * ```typescript
 * await verifyExportedEmployees('/path/to/file.xlsx', [
 *   { id: 1, performance: 'High', potential: 'High' },
 *   { id: 2, performance: 'Medium', potential: 'Low' },
 * ]);
 * ```
 *
 * @throws Error if any employee not found or ratings don't match
 */
export async function verifyExportedEmployees(
  filePath: string,
  employees: Array<{
    id: number;
    performance: string;
    potential: string;
  }>
): Promise<void> {
  // Read file once
  const allData = await readExportedFile(filePath);

  // Validate each employee from the in-memory data
  for (const emp of employees) {
    const employee = allData.find(
      (row) =>
        parseInt(row["Employee ID"].toString(), 10) ===
        parseInt(emp.id.toString(), 10)
    );

    if (!employee) {
      throw new Error(
        `Employee ${emp.id} not found in exported file ${filePath}`
      );
    }

    expect(employee.Performance).toBe(emp.performance);
    expect(employee.Potential).toBe(emp.potential);
  }
}

/**
 * Get all employee data from exported file
 *
 * Reads the entire Excel file and returns all rows as an array.
 * Useful for custom validation logic.
 *
 * @param filePath - Absolute path to the exported Excel file
 * @returns Array of employee row data
 *
 * @example
 * ```typescript
 * const employees = await readExportedFile('/path/to/file.xlsx');
 * expect(employees).toHaveLength(200);
 * expect(employees.filter(e => e['Modified in Session'] === 'Yes')).toHaveLength(3);
 * ```
 */
export async function readExportedFile(
  filePath: string
): Promise<EmployeeRow[]> {
  return parseExcelFile(filePath);
}

/**
 * Verify exported file has expected column headers
 *
 * Checks that all required columns exist in the exported file.
 *
 * @param filePath - Absolute path to the exported Excel file
 * @param expectedColumns - Array of expected column names
 *
 * @example
 * ```typescript
 * await verifyExportedColumns('/path/to/file.xlsx', [
 *   'Employee ID',
 *   'Worker',
 *   'Performance',
 *   'Potential',
 *   'Modified in Session',
 *   '9Boxer Change Notes'
 * ]);
 * ```
 */
export async function verifyExportedColumns(
  filePath: string,
  expectedColumns: string[]
): Promise<void> {
  const data = await parseExcelFile(filePath);

  if (data.length === 0) {
    throw new Error(`Exported file ${filePath} has no data rows`);
  }

  const actualColumns = Object.keys(data[0]);

  for (const expectedCol of expectedColumns) {
    expect(actualColumns).toContain(expectedCol);
  }
}
