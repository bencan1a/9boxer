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
    await expect(page.getByText("No File Loaded")).toBeVisible();
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

    // Verify specific employees are present (from test fixture)
    await expect(page.getByText("Alice Smith")).toBeVisible(); // Stars box
    await expect(page.getByText("Bob Johnson")).toBeVisible(); // Stars box
    await expect(page.getByText("Carol Williams")).toBeVisible(); // High Potential box

    // Verify grid boxes are populated
    await expect(page.locator('[data-testid="grid-box-9"]')).toContainText(
      "Alice Smith"
    );
  });

  test("should show error for invalid file format", async ({ page }) => {
    // Click empty state import button
    await page.locator('[data-testid="empty-state-import-button"]').click();

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
    // Box 9 (High Performance, High Potential - Stars) should have Alice Smith and Bob Johnson
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    await expect(gridBox9.getByText("Alice Smith")).toBeVisible();
    await expect(gridBox9.getByText("Bob Johnson")).toBeVisible();

    // Verify we can see employee job titles
    await expect(gridBox9.getByText("Senior Engineer")).toBeVisible();
    await expect(gridBox9.getByText("Engineering Manager")).toBeVisible();

    // Verify total employee count in app bar (15 employees in our fixture)
    await expect(page.getByText(/15/)).toBeVisible();
  });
});
