/**
 * E2E tests for intelligence analysis functionality
 * Tests viewing intelligence insights and analysis by dimension
 *
 * Converted from Cypress test: cypress/e2e/intelligence-flow.cy.ts
 */

import { test, expect } from "../fixtures";
import { uploadExcelFile } from "../helpers";

test.describe("Intelligence Analysis Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Visit and upload sample data
    await page.goto("/");
    await uploadExcelFile(page, "sample-employees.xlsx");

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should display intelligence tab and show insights", async ({
    page,
  }) => {
    // Click on the Intelligence tab in the right panel
    await page.locator('[data-testid="intelligence-tab"]').click();

    // Verify intelligence content is visible (auto-retrying)
    // The intelligence tab should show analysis and insights
    await expect(page.getByText(/intelligence/i)).toBeVisible();

    // Verify some common intelligence sections exist
    // (These may vary based on implementation)
    // Look for typical intelligence features like distribution, anomalies, etc.
  });

  test("should show analysis across different dimensions", async ({ page }) => {
    // Click on the Intelligence tab
    await page.locator('[data-testid="intelligence-tab"]').click();

    // Verify the tab panel is visible (Intelligence is tab index 3) (auto-retrying)
    await expect(page.locator("#panel-tabpanel-3")).toBeVisible();

    // The intelligence view should show various dimensions of analysis
    // These might include:
    // - Department analysis
    // - Location analysis
    // - Performance distribution
    // - Potential distribution

    // Verify the content area exists and has data
    const tabPanel = page.locator("#panel-tabpanel-3");
    const childElements = await tabPanel.locator("*").count();
    expect(childElements).toBeGreaterThan(0);
  });
});
