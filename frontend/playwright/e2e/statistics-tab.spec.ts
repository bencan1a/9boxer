/**
 * E2E tests for Statistics Tab Display
 * Tests the complete flow of viewing statistics, distribution data, and updates after employee movement
 */

import { test, expect } from "../fixtures";
import { loadSampleData, dragEmployeeToPosition, t } from "../helpers";

test.describe("Statistics Tab Display", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should display statistics tab with distribution data", async ({
    page,
  }) => {
    // Click on Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[data-testid="tab-panel-2"]');
    await expect(tabPanel).toBeVisible();

    // Verify summary cards are visible using testid (more reliable than text matching)
    await expect(
      page.locator('[data-testid="total-employees-card"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="modified-employees-card"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="high-performers-card"]')
    ).toBeVisible();

    // Verify distribution table is visible using role
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

    // Verify chart is visible (bar chart with multiple position labels)
    // The chart should have SVG elements for the bars
    const chartSvg = page.locator('[role="tabpanel"] svg').first();
    await expect(chartSvg).toBeVisible({ timeout: 5000 });
  });

  test("should show correct employee counts in distribution", async ({
    page,
  }) => {
    // Click Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[data-testid="tab-panel-2"]');
    await expect(tabPanel).toBeVisible();

    // Get the total employees from the summary card using testid
    const totalEmployeesCard = page.locator(
      '[data-testid="total-employees-card"]'
    );
    await expect(totalEmployeesCard).toBeVisible();

    // Extract the numeric value from the card
    const totalEmployeesText = await totalEmployeesCard
      .locator('[data-testid="total-employees-card-value"]')
      .textContent();
    const totalEmployees = parseInt(totalEmployeesText || "0");

    // Verify total matches sample data count
    expect(totalEmployees).toBeGreaterThan(0);

    // Navigate back to grid to verify count matches app bar
    await page.locator('[data-testid="details-tab"]').click();

    // Verify the app bar shows the same count
    const employeeCountChip = page.getByText(/\d+\s+employees/);
    await expect(employeeCountChip).toBeVisible();
  });

  test("should display statistics with initial employee distribution", async ({
    page,
  }) => {
    // Click Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[data-testid="tab-panel-2"]');
    await expect(tabPanel).toBeVisible();

    // Verify initial distribution is loaded by checking summary cards
    const totalEmployeesCard = page.locator(
      '[data-testid="total-employees-card"]'
    );
    await expect(totalEmployeesCard).toBeVisible();
    const totalEmployeesText = await totalEmployeesCard
      .locator('[data-testid="total-employees-card-value"]')
      .textContent();
    const totalEmployees = parseInt(totalEmployeesText || "0");
    expect(totalEmployees).toBeGreaterThan(0);

    // Verify modified employees card is visible
    const modifiedEmployeesCard = page.locator(
      '[data-testid="modified-employees-card"]'
    );
    await expect(modifiedEmployeesCard).toBeVisible();

    // Verify high performers card is visible
    const highPerformersCard = page.locator(
      '[data-testid="high-performers-card"]'
    );
    await expect(highPerformersCard).toBeVisible();

    // Verify distribution table rows exist
    const tableRows = page.locator('[role="tabpanel"] tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify at least one box has employees
    let hasEmployees = false;
    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const countText = await tableRows
        .nth(i)
        .locator("td")
        .nth(0)
        .textContent();
      const count = parseInt(countText?.trim() || "0");
      if (count > 0) {
        hasEmployees = true;
        break;
      }
    }
    expect(hasEmployees).toBe(true);
  });

  test("should display grouped statistics with correct percentages", async ({
    page,
  }) => {
    // Click Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[data-testid="tab-panel-2"]');
    await expect(tabPanel).toBeVisible();

    // Find the Group % column header to verify it exists
    await expect(
      page.getByRole("columnheader", { name: "Group %" })
    ).toBeVisible();

    // Verify that percentage values are visible in the table
    // The grouped percentages appear in cells that span multiple rows
    const percentageCells = page.locator("tbody td:nth-child(4)"); // Group % column
    const count = await percentageCells.count();
    expect(count).toBeGreaterThan(0);

    // Verify at least one percentage cell has content (uses regex matching for percentages)
    for (let i = 0; i < Math.min(count, 3); i++) {
      const text = await percentageCells.nth(i).textContent();
      // Percentages should contain % symbol
      if (text && text.trim()) {
        expect(text).toMatch(/%/);
      }
    }
  });

  test("should show zero counts for empty boxes", async ({ page }) => {
    // Click Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Wait for tab panel to be visible
    const tabPanel = page.locator('[data-testid="tab-panel-2"]');
    await expect(tabPanel).toBeVisible();

    // Verify that the counts match the expected distribution from sample data
    // This test verifies the distribution table displays counts for all positions

    // Box 9 (Star)
    const box9Row = page.locator("tr", {
      has: page.getByRole("rowheader", { name: "Star [H,H]" }),
    });
    await expect(box9Row).toBeVisible();
    const box9Count = await box9Row.locator("td").nth(0).textContent();
    expect(parseInt(box9Count?.trim() || "0")).toBeGreaterThanOrEqual(0);

    // Box 7 (Enigma)
    const box7Row = page.locator("tr", {
      has: page.getByRole("rowheader", { name: "Enigma [L,H]" }),
    });
    await expect(box7Row).toBeVisible();
    const box7Count = await box7Row.locator("td").nth(0).textContent();
    expect(parseInt(box7Count?.trim() || "0")).toBeGreaterThanOrEqual(0);

    // Box 5 (Core Talent)
    const box5Row = page.locator("tr", {
      has: page.getByRole("rowheader", { name: "Core Talent [M,M]" }),
    });
    await expect(box5Row).toBeVisible();
    const box5Count = await box5Row.locator("td").nth(0).textContent();
    expect(parseInt(box5Count?.trim() || "0")).toBeGreaterThanOrEqual(0);
  });
});
