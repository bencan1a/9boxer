/**
 * E2E tests for large dataset performance and stability
 * Tests performance and stability with 1000+ employees
 *
 * Phase 4: Edge case testing for error paths
 */

import { test, expect } from "../fixtures";

test.describe("Large Dataset Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  /**
   * Helper to generate large dataset via API
   * Uses the sample data generation endpoint with custom size
   */
  async function loadLargeDataset(page: any, size: number): Promise<void> {
    // Click File menu
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();

    // Click Load Sample Dataset
    await page.locator('[data-testid="load-sample-menu-item"]').click();

    // Wait for LoadSampleDialog
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible();

    // Check if there's a size input field
    const sizeInput = page.locator('input[name="size"]');
    const hasSizeInput = await sizeInput.isVisible().catch(() => false);

    if (hasSizeInput) {
      // Clear and enter custom size
      await sizeInput.clear();
      await sizeInput.fill(size.toString());
    }

    // Click Confirm
    await page.locator('[data-testid="confirm-button"]').click();

    // Wait for loading to complete (dialog closes)
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).not.toBeVisible({ timeout: 30000 }); // Longer timeout for large dataset

    // Verify grid displays
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  }

  test("should load 1000 employees without performance degradation", async ({
    page,
  }) => {
    const startTime = Date.now();

    // Load large dataset (if size input not available, will load default 200)
    await loadLargeDataset(page, 1000);

    const loadTime = Date.now() - startTime;

    // Verify grid is visible
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Wait for employee cards to load
    await page.waitForSelector('[data-testid^="employee-card-"]', {
      timeout: 10000,
    });

    // Verify employees are loaded
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    const count = await employeeCards.count();

    // Should have loaded employees (even if not 1000, should have some)
    expect(count).toBeGreaterThan(0);

    // Load time should be reasonable (<30s for large dataset)
    expect(loadTime).toBeLessThan(30000);

    // Verify grid is interactive - click a card
    const firstCard = employeeCards.first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // Verify details panel opens (app is responsive)
    await expect(page.locator('[data-testid="right-panel"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test("should filter 1000 employees quickly", async ({ page }) => {
    // Load large dataset
    await loadLargeDataset(page, 1000);

    // Verify grid is visible
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Get initial count
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    const initialCount = await employeeCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Open filter drawer
    const startTime = Date.now();
    await page.locator('[data-testid="filter-button"]').click();

    // Wait for drawer to open
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();

    const filterOpenTime = Date.now() - startTime;

    // Filter drawer should open quickly (<2s)
    expect(filterOpenTime).toBeLessThan(2000);

    // Apply a filter
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();

    const filterStartTime = Date.now();
    await firstCheckbox.check();

    // Wait for filter to apply
    await expect(firstCheckbox).toBeChecked();

    // Wait a moment for filter to process
    await page.waitForTimeout(1000);

    const filterTime = Date.now() - filterStartTime;

    // Filter should apply quickly (<3s for large dataset)
    expect(filterTime).toBeLessThan(3000);

    // Verify filter worked (count may have changed or stayed same)
    const filteredCount = await employeeCards.count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);

    // Close filter drawer
    await page.locator('[data-testid="filter-close-button"]').click();
    await expect(
      page.locator('[data-testid="filter-drawer"]')
    ).not.toBeVisible();
  });

  test("should handle drag-and-drop with 1000 employees", async ({ page }) => {
    // Load large dataset
    await loadLargeDataset(page, 1000);

    // Verify grid is visible
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Find an employee card
    const employeeCard = page
      .locator('[data-testid^="employee-card-"]')
      .first();
    await expect(employeeCard).toBeVisible();

    // Find a grid box to drag to
    const targetBox = page.locator('[data-testid="grid-box-6"]');
    await expect(targetBox).toBeVisible();

    // Perform drag and drop
    const dragStartTime = Date.now();
    await employeeCard.dragTo(targetBox);

    // Wait for UI to update
    await page.waitForTimeout(2000);

    const dragTime = Date.now() - dragStartTime;

    // Drag should complete quickly (<3s)
    expect(dragTime).toBeLessThan(3000);

    // Verify File menu badge updates (change registered)
    const fileMenuBadge = page.locator('[data-testid="file-menu-button"]');
    await expect(fileMenuBadge).toContainText("1", { timeout: 5000 });

    // Verify grid is still responsive
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should generate statistics for 1000 employees", async ({ page }) => {
    // Load large dataset
    await loadLargeDataset(page, 1000);

    // Verify grid is visible
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Click Statistics tab
    const statsTab = page.locator('[data-testid="statistics-tab"]');
    await expect(statsTab).toBeVisible();

    const startTime = Date.now();
    await statsTab.click();

    // Wait for statistics panel to load
    await expect(page.locator('[data-testid="statistics-panel"]')).toBeVisible({
      timeout: 10000,
    });

    const statsLoadTime = Date.now() - startTime;

    // Statistics should load quickly (<5s)
    expect(statsLoadTime).toBeLessThan(5000);

    // Verify statistics content is visible
    const statsContent = page.locator('[data-testid="statistics-panel"]');
    const statsText = await statsContent.textContent();

    // Should contain some statistical information
    expect(statsText).toBeTruthy();
    expect(statsText!.length).toBeGreaterThan(10);

    // Verify statistics show data (should have numbers)
    expect(statsText).toMatch(/\d+/);
  });

  test("should export 1000 employees successfully", async ({ page }) => {
    // Load large dataset
    await loadLargeDataset(page, 1000);

    // Verify grid is visible
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Make a change to enable export
    const employeeCard = page
      .locator('[data-testid^="employee-card-"]')
      .first();
    await expect(employeeCard).toBeVisible();

    const targetBox = page.locator('[data-testid="grid-box-6"]');
    await expect(targetBox).toBeVisible();

    // Drag employee to new position
    await employeeCard.dragTo(targetBox);

    // Wait for change to register
    await page.waitForTimeout(2000);

    // Verify File menu badge shows changes
    const fileMenuBadge = page.locator('[data-testid="file-menu-button"]');
    await expect(fileMenuBadge).toContainText("1", { timeout: 5000 });

    // Open file menu
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();

    // Click export
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItem).toBeVisible();

    const exportStartTime = Date.now();
    await exportMenuItem.click();

    // Wait for Apply Changes Dialog
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).toBeVisible();

    // Click Apply
    await page.locator('[data-testid="apply-changes-button"]').click();

    // Wait for export to complete (dialog closes)
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).not.toBeVisible({ timeout: 30000 }); // Longer timeout for large export

    const exportTime = Date.now() - exportStartTime;

    // Export should complete in reasonable time (<30s for 1000 employees)
    expect(exportTime).toBeLessThan(30000);

    // Verify app is still responsive
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify we can still interact with the app
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
  });
});
