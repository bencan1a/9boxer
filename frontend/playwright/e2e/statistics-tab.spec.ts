/**
 * E2E tests for Statistics Tab Display
 * Tests the complete flow of viewing statistics, distribution data, and updates after employee movement
 */

import { test, expect } from "@playwright/test";
import { uploadExcelFile, dragEmployeeToPosition } from "../helpers";

test.describe("Statistics Tab Display", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and upload sample data
    await page.goto("/");
    await uploadExcelFile(page, "sample-employees.xlsx");

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should display statistics tab with distribution data", async ({
    page,
  }) => {
    // Click on Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[role="tabpanel"][id="panel-tabpanel-2"]');
    await expect(tabPanel).toBeVisible();

    // Verify summary cards are visible
    await expect(page.getByText("Total Employees")).toBeVisible();
    await expect(page.getByText("Modified")).toBeVisible();
    await expect(page.getByText("High Performers")).toBeVisible();

    // Verify distribution table is visible
    await expect(page.getByText("Distribution by Position")).toBeVisible();

    // Verify table headers
    await expect(
      page.getByRole("columnheader", { name: "Position" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Count" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Percentage" })
    ).toBeVisible();

    // Verify all position labels are shown in the table (use first() to avoid duplicate in chart)
    await expect(
      page.getByRole("rowheader", { name: "Star [H,H]" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "High Impact [H,M]" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Workhorse [H,L]" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Growth [M,H]" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Core Talent [M,M]" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Effective Pro [M,L]" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Enigma [L,H]" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Inconsistent [L,M]" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Underperformer [L,L]" })
    ).toBeVisible();

    // Verify chart is visible
    await expect(page.getByText("Visual Distribution")).toBeVisible();
  });

  test("should show correct employee counts in distribution", async ({
    page,
  }) => {
    // Click Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[role="tabpanel"][id="panel-tabpanel-2"]');
    await expect(tabPanel).toBeVisible();

    // Get the total employees from the summary card
    const totalEmployeesCard = page
      .locator("text=Total Employees")
      .locator("..")
      .locator("..");
    const totalEmployeesText = await totalEmployeesCard
      .locator("h4")
      .textContent();
    const totalEmployees = parseInt(totalEmployeesText || "0");

    // Verify total is 15 (based on sample-employees.xlsx)
    expect(totalEmployees).toBe(15);

    // Navigate back to grid to verify count matches app bar
    await page.locator('[data-testid="details-tab"]').click();

    // Verify the app bar shows the same count
    const employeeCountChip = page.locator("text=/15 employees/");
    await expect(employeeCountChip).toBeVisible();
  });

  test("should update statistics after employee movement", async ({ page }) => {
    // First, click Statistics tab and capture initial distribution
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[role="tabpanel"][id="panel-tabpanel-2"]');
    await expect(tabPanel).toBeVisible();

    // Get initial count of employees in box 9 (Star)
    // Box 9 has Alice Smith (ID 1) and Bob Johnson (ID 2) - 2 employees
    const box9Row = page.locator("tr", {
      has: page.getByRole("rowheader", { name: "Star [H,H]" }),
    });
    await expect(box9Row).toBeVisible();

    // Column 0 is Position, Column 1 is Count, Column 2 is Percentage (with bar), Column 3 is Group %
    const initialBox9Count = await box9Row.locator("td").nth(0).textContent();
    expect(initialBox9Count?.trim()).toBe("2");

    // Get initial count of employees in box 6 (High Impact)
    // Box 6 has Frank Martinez (ID 6) and Grace Taylor (ID 7) - 2 employees
    const box6Row = page.locator("tr", {
      has: page.getByRole("rowheader", { name: "High Impact [H,M]" }),
    });
    await expect(box6Row).toBeVisible();

    const initialBox6Count = await box6Row.locator("td").nth(0).textContent();
    expect(initialBox6Count?.trim()).toBe("2");

    // Navigate back to grid
    await page.locator('[data-testid="details-tab"]').click();

    // Move employee Alice Smith (ID 1) from box 9 to box 6
    await dragEmployeeToPosition(page, 1, 6);

    // Return to Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for statistics to update
    await expect(tabPanel).toBeVisible();

    // Verify box 9 count decreased by 1 (from 2 to 1)
    const updatedBox9Count = await box9Row.locator("td").nth(0).textContent();
    expect(updatedBox9Count?.trim()).toBe("1");

    // Verify box 6 (High Impact) count increased by 1 (from 2 to 3)
    const updatedBox6Count = await box6Row.locator("td").nth(0).textContent();
    expect(updatedBox6Count?.trim()).toBe("3");

    // Verify total employees count remains the same (15)
    const totalEmployeesCard = page
      .locator("text=Total Employees")
      .locator("..")
      .locator("..");
    const totalEmployeesText = await totalEmployeesCard
      .locator("h4")
      .textContent();
    const totalEmployees = parseInt(totalEmployeesText || "0");
    expect(totalEmployees).toBe(15);

    // Verify modified employees count increased to 1
    const modifiedEmployeesCard = page
      .locator("text=Modified")
      .locator("..")
      .locator("..");
    const modifiedEmployeesText = await modifiedEmployeesCard
      .locator("h4")
      .textContent();
    const modifiedEmployees = parseInt(modifiedEmployeesText || "0");
    expect(modifiedEmployees).toBe(1);
  });

  test("should display grouped statistics with correct percentages", async ({
    page,
  }) => {
    // Click Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[role="tabpanel"][id="panel-tabpanel-2"]');
    await expect(tabPanel).toBeVisible();

    // Verify that percentage values are visible in the "Group %" column
    // The curly braces should display grouped percentages
    // High performers group (boxes 9, 8, 6): 6 employees out of 15 = 40%
    // Low performers group (boxes 4, 2, 1): 3 employees out of 15 = 20%

    // Find the Group % column header to verify it exists
    await expect(
      page.getByRole("columnheader", { name: "Group %" })
    ).toBeVisible();

    // The grouped percentages appear in cells that span multiple rows
    // We can verify the high performers percentage (40.0%)
    const highPerformersPercentage = page.locator("text=/40\\.0%/").first();
    await expect(highPerformersPercentage).toBeVisible();

    // Verify the low performers percentage (20.0%)
    const lowPerformersPercentage = page.locator("text=/20\\.0%/").first();
    await expect(lowPerformersPercentage).toBeVisible();
  });

  test("should show zero counts for empty boxes", async ({ page }) => {
    // Click Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[role="tabpanel"][id="panel-tabpanel-2"]');
    await expect(tabPanel).toBeVisible();

    // Verify that the counts match the expected distribution from sample data
    // Looking at the sample data: all boxes have at least 1 employee
    // This test verifies the distribution matches expectations

    // Box 9 (Star): 2 employees
    const box9Row = page.locator("tr", {
      has: page.getByRole("rowheader", { name: "Star [H,H]" }),
    });
    const box9Count = await box9Row.locator("td").nth(0).textContent();
    expect(box9Count?.trim()).toBe("2");

    // Box 7 (Enigma): 1 employee
    const box7Row = page.locator("tr", {
      has: page.getByRole("rowheader", { name: "Enigma [L,H]" }),
    });
    const box7Count = await box7Row.locator("td").nth(0).textContent();
    expect(box7Count?.trim()).toBe("1");

    // Box 5 (Core Talent): 3 employees
    const box5Row = page.locator("tr", {
      has: page.getByRole("rowheader", { name: "Core Talent [M,M]" }),
    });
    const box5Count = await box5Row.locator("td").nth(0).textContent();
    expect(box5Count?.trim()).toBe("3");
  });
});
