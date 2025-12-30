/**
 * E2E tests for employee upload workflow
 * Tests the complete flow from file selection to viewing employees in the grid
 *
 * Converted from Cypress test: cypress/e2e/upload-flow.cy.ts
 */

import { test, expect } from "../fixtures";
import { uploadExcelFile } from "../helpers";
import * as path from "path";

test.describe("Employee Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Visit the application
    await page.goto("/");

    // Verify we start with no data (enhanced empty state)
    await expect(page.getByText("No Employees Loaded")).toBeVisible();
  });

  test("should upload Excel file and view employees in the grid", async ({
    page,
  }) => {
    // Use helper function to upload file
    await uploadExcelFile(page, "sample-employees.xlsx");

    // Verify grid is visible
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify employees are loaded (we created 15 employees in the fixture)
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    const count = await employeeCards.count();
    expect(count).toBeGreaterThanOrEqual(10);

    // Verify employee cards are visible in the grid (data-independent)
    await expect(employeeCards.first()).toBeVisible();
    await expect(employeeCards.nth(1)).toBeVisible();
    await expect(employeeCards.nth(2)).toBeVisible();

    // Verify grid box 9 (Stars) is populated with at least one employee
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const box9Employees = gridBox9.locator('[data-testid^="employee-card-"]');
    const box9Count = await box9Employees.count();
    expect(box9Count).toBeGreaterThan(0);
  });

  test("should show error for invalid file format", async ({ page }) => {
    // Click empty state import button
    await page.locator('[data-testid="upload-file-button"]').click();

    // Create and select an invalid file (text file)
    const invalidFileContent = Buffer.from("This is not an Excel file");
    await page.locator("#file-upload-input").setInputFiles({
      name: "invalid.txt",
      mimeType: "text/plain",
      buffer: invalidFileContent,
    });

    // Should show error message
    await expect(page.getByText(/please select an excel file/i)).toBeVisible();

    // Upload button should be disabled or show error
    await expect(
      page.locator('[data-testid="upload-submit-button"]')
    ).toBeDisabled();
  });

  test("should display employee count in grid boxes after upload", async ({
    page,
  }) => {
    // Upload the sample file using helper
    await uploadExcelFile(page, "sample-employees.xlsx");

    // Verify grid boxes are populated with employees
    // Box 9 (High Performance, High Potential - Stars) should have employees
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const box9Employees = gridBox9.locator('[data-testid^="employee-card-"]');
    const box9Count = await box9Employees.count();
    expect(box9Count).toBeGreaterThan(0);

    // Verify employee cards contain job title information (data-independent)
    const firstEmployee = box9Employees.first();
    const employeeText = await firstEmployee.textContent();
    expect(employeeText).toBeTruthy();
    expect(employeeText!.length).toBeGreaterThan(10); // Should have name + title

    // Verify total employee count is displayed (15 employees in our fixture)
    const employeeCountDisplay = page.locator('[data-testid="employee-count"]');
    await expect(employeeCountDisplay).toBeVisible();
    await expect(employeeCountDisplay).toContainText(/\d+/);
  });
});
