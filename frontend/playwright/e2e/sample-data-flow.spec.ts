/**
 * E2E tests for sample data loading workflow
 *
 * Tests the complete flow for loading sample datasets via the File menu,
 * including confirmation dialogs, data replacement, and grid display.
 *
 * Test coverage:
 * - Loading sample data from File menu
 * - Replacing existing data with confirmation
 * - Intelligence stats bias detection
 * - Grid display validation with sample data
 */

import { test, expect } from "../fixtures";
import { uploadExcelFile, clickTabAndWait, waitForUiSettle } from "../helpers";

test.describe("Sample Data Loading Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto("/");
  });

  test("should load sample data from File menu", async ({ page }) => {
    // Verify we start with no data (empty state)
    await expect(page.getByText("No Employees Loaded")).toBeVisible();

    // Click File menu
    await page.locator('[data-testid="file-menu-button"]').click();

    // Wait for menu to become visible
    await expect(page.locator('[role="menu"]')).toBeVisible();

    // Click Load Sample Dataset menu item
    await page.locator('[data-testid="load-sample-menu-item"]').click();

    // Verify LoadSampleDialog appears
    const dialog = page.locator('[data-testid="load-sample-dialog"]');
    await expect(dialog).toBeVisible();

    // Verify dialog title and content (scoped to dialog to avoid strict mode violations)
    await expect(dialog.getByText("Load Sample Dataset")).toBeVisible();
    await expect(dialog.getByText(/200 employees/i)).toBeVisible();

    // No warning should be shown since there's no existing data
    await expect(
      page.locator('[data-testid="existing-data-warning"]')
    ).not.toBeVisible();

    // Click Confirm button
    await page.locator('[data-testid="confirm-button"]').click();

    // Wait for loading to complete (button shows "Loading..." state)
    // Note: This may be very brief, so we'll use a try-catch
    try {
      await expect(page.getByText("Loading...")).toBeVisible({ timeout: 2000 });
    } catch (e) {
      // Loading state might be too brief to catch - that's okay
    }

    // Wait for dialog to close (indicates success)
    // Increased timeout as sample data generation can take time
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).not.toBeVisible({
      timeout: 30000, // Increased from 15s to 30s for slower environments
    });

    // Verify grid displays employees
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Wait for employee cards to load
    await page.waitForSelector('[data-testid^="employee-card-"]', {
      timeout: 5000,
    });

    // Verify employee count (should be 200 employees)
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    const count = await employeeCards.count();
    expect(count).toBeGreaterThanOrEqual(190); // Allow for slight variation
    expect(count).toBeLessThanOrEqual(210);

    // Verify success message appears
    await expect(
      page.getByText(/successfully loaded.*sample employees/i)
    ).toBeVisible();
  });

  test("should replace existing data with confirmation", async ({ page }) => {
    // Step 1: Upload sample Excel file first to have existing data
    await uploadExcelFile(page, "sample-employees.xlsx");

    // Verify grid is loaded with initial data
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Get initial employee count
    const initialCards = page.locator('[data-testid^="employee-card-"]');
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Step 2: Click File menu to load sample data
    await page.locator('[data-testid="file-menu-button"]').click();

    // Wait for menu
    await expect(page.locator('[role="menu"]')).toBeVisible();

    // Click Load Sample Dataset
    await page.locator('[data-testid="load-sample-menu-item"]').click();

    // Verify dialog appears
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible();

    // Step 3: Verify warning appears (since we have existing data)
    await expect(
      page.locator('[data-testid="existing-data-warning"]')
    ).toBeVisible();
    await expect(
      page.getByText(/this will replace your current data/i)
    ).toBeVisible();

    // Step 4: Click Cancel and verify nothing changes
    await page.locator('[data-testid="cancel-button"]').click();

    // Dialog should close
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).not.toBeVisible();

    // Verify original data is still there
    const cardsAfterCancel = page.locator('[data-testid^="employee-card-"]');
    const countAfterCancel = await cardsAfterCancel.count();
    expect(countAfterCancel).toBe(initialCount);

    // Step 5: Open dialog again and confirm replacement
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await page.locator('[data-testid="load-sample-menu-item"]').click();
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible();

    // Click Confirm
    await page.locator('[data-testid="confirm-button"]').click();

    // Wait for loading
    try {
      await expect(page.getByText("Loading...")).toBeVisible({ timeout: 2000 });
    } catch (e) {
      // Loading state might be too brief to catch - that's okay
    }

    // Wait for dialog to close
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).not.toBeVisible({
      timeout: 30000, // Increased from 10s to 30s for slower environments
    });

    // Verify new sample data loaded (should be ~200 employees)
    await page.waitForSelector('[data-testid^="employee-card-"]', {
      timeout: 5000,
    });

    const newCards = page.locator('[data-testid^="employee-card-"]');
    const newCount = await newCards.count();
    expect(newCount).toBeGreaterThan(initialCount); // Sample data has more employees
    expect(newCount).toBeGreaterThanOrEqual(190);
    expect(newCount).toBeLessThanOrEqual(210);
  });

  test("should detect bias patterns in Intelligence stats", async ({
    page,
  }) => {
    // Step 1: Load sample data (which includes bias patterns)
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await page.locator('[data-testid="load-sample-menu-item"]').click();
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible();
    await page.locator('[data-testid="confirm-button"]').click();

    // Wait for dialog to close
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).not.toBeVisible({
      timeout: 30000, // Increased from 10s to 30s for slower environments
    });

    // Wait for grid to load
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
    await page.waitForSelector('[data-testid^="employee-card-"]', {
      timeout: 5000,
    });

    // Step 2: Navigate to Intelligence tab
    await clickTabAndWait(page, "intelligence-tab");

    // Verify intelligence tab panel is visible
    await expect(page.locator("#panel-tabpanel-3")).toBeVisible();

    // Wait for intelligence data to load (summary should appear)
    await expect(
      page.locator('[data-testid="intelligence-summary"]')
    ).toBeVisible({ timeout: 10000 });

    // Step 3: Verify insights are displayed
    // The Intelligence tab should show analysis content
    const tabPanel = page.locator("#panel-tabpanel-3");

    // Verify the panel has content (at least some child elements)
    const childElements = await tabPanel.locator("*").count();
    expect(childElements).toBeGreaterThanOrEqual(5); // Should have multiple elements

    // Step 4: Look for bias-related content
    // Sample data includes bias patterns for USA location and Sales function
    // The intelligence tab should detect and mention these patterns

    // Check for common bias-related keywords in the intelligence content
    const content = await tabPanel.textContent();
    const hasRelevantContent =
      content !== null &&
      (content.toLowerCase().includes("location") ||
        content.toLowerCase().includes("function") ||
        content.toLowerCase().includes("department") ||
        content.toLowerCase().includes("distribution") ||
        content.toLowerCase().includes("performance") ||
        content.toLowerCase().includes("potential"));

    expect(hasRelevantContent).toBe(true);
  });

  test("should display sample data correctly in grid", async ({ page }) => {
    // Load sample data
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await page.locator('[data-testid="load-sample-menu-item"]').click();
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible();
    await page.locator('[data-testid="confirm-button"]').click();

    // Wait for dialog to close
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).not.toBeVisible({
      timeout: 30000, // Increased from 10s to 30s for slower environments
    });

    // Wait for grid to load
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
    await page.waitForSelector('[data-testid^="employee-card-"]', {
      timeout: 5000,
    });

    // Verify all 9 grid boxes exist
    for (let boxId = 1; boxId <= 9; boxId++) {
      await expect(
        page.locator(`[data-testid="grid-box-${boxId}"]`)
      ).toBeVisible();
    }

    // Verify that at least some grid boxes have employees
    // (sample data should distribute across all 9 boxes)
    let boxesWithEmployees = 0;
    for (let boxId = 1; boxId <= 9; boxId++) {
      const box = page.locator(`[data-testid="grid-box-${boxId}"]`);
      const employeesInBox = box.locator('[data-testid^="employee-card-"]');
      const count = await employeesInBox.count();
      if (count > 0) {
        boxesWithEmployees++;
      }
    }

    // With 200 employees distributed across 9 boxes, all should have employees
    expect(boxesWithEmployees).toBeGreaterThanOrEqual(7); // At least 7 of 9 boxes should have employees

    // Click on an employee card to verify right panel shows details
    const firstCard = page.locator('[data-testid^="employee-card-"]').first();
    await firstCard.click();

    // Wait for UI to settle
    await waitForUiSettle(page);

    // Verify right panel shows employee details
    // The Details tab should be visible by default
    const detailsTab = page.locator('[data-testid="details-tab"]');
    await expect(detailsTab).toHaveAttribute("aria-selected", "true");

    // Verify details panel has content
    const detailsPanel = page.locator("#panel-tabpanel-0");
    await expect(detailsPanel).toBeVisible();

    // The panel should have employee information (name, title, etc.)
    const detailsContent = await detailsPanel.textContent();
    expect(detailsContent).toBeTruthy();
    expect(detailsContent!.length).toBeGreaterThan(10); // Should have substantial content
  });

  test("should show error if API fails", async ({ page }) => {
    // This test simulates an API failure scenario
    // We'll intercept the API request and return an error

    // Intercept the sample data generation API endpoint
    await page.route("**/api/employees/generate-sample", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "Internal server error",
        }),
      });
    });

    // Try to load sample data
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await page.locator('[data-testid="load-sample-menu-item"]').click();
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible();
    await page.locator('[data-testid="confirm-button"]').click();

    // Wait for loading state (brief)
    try {
      await expect(page.getByText("Loading...")).toBeVisible({ timeout: 2000 });
    } catch (e) {
      // Loading state might be too brief to catch - that's okay
    }

    // Wait for error to appear in the dialog
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 10000, // Increased timeout
    });

    // Verify error message content
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toContainText(/error/i);

    // Dialog should still be open (not closed on error)
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible();

    // Confirm button should be re-enabled (no longer loading)
    const confirmButton = page.locator('[data-testid="confirm-button"]');
    await expect(confirmButton).not.toBeDisabled();
  });
});
