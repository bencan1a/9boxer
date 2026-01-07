/**
 * E2E Core Tests - Section 4: Filtering (Tests 4.1-4.5)
 *
 * Validates filter functionality based on the test specification in
 * /workspaces/9boxer/e2e-test-specification.md (lines 298-397)
 *
 * Tests:
 * - 4.1: Open Filters Panel
 * - 4.2: Apply Location Filter
 * - 4.3: Filters Button Shows Active State
 * - 4.4: Employee Count Updates with Filter
 * - 4.5: Clear Filters
 */

import { test, expect } from "../fixtures";
import {
  loadSampleData,
  openFilterDrawer,
  expandFilterSection,
  getVisibleEmployeeCount,
} from "../helpers";

test.describe("Section 4: Filtering Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Verify grid is loaded with employees
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    await expect(employeeCards.first()).toBeVisible();
  });

  /**
   * Test 4.1 - Open Filters Panel
   *
   * Success Criteria:
   * - ✅ Filter drawer/panel opens from left side
   * - ✅ Filter categories are visible (Location, Function, Level, etc.)
   * - ✅ All filter options are displayed
   * - ✅ "Clear All" button is visible
   * - ✅ Panel can be closed (X button or outside click)
   */
  test("4.1 - Open Filters Panel", async ({ page }) => {
    // Click the "Filters" button in toolbar
    await page.locator('[data-testid="filter-button"]').click();

    // ✅ Filter drawer/panel opens from left side
    const filterDrawer = page.locator('[data-testid="filter-drawer"]');
    await expect(filterDrawer).toBeVisible();

    // ✅ Filter categories are visible
    // Job Levels section
    await expect(
      page.locator('[data-testid="filter-accordion-job-levels"]')
    ).toBeVisible();

    // Job Functions section
    await expect(
      page.locator('[data-testid="filter-accordion-job-functions"]')
    ).toBeVisible();

    // Locations section
    await expect(
      page.locator('[data-testid="filter-accordion-locations"]')
    ).toBeVisible();

    // Managers section
    await expect(
      page.locator('[data-testid="filter-accordion-managers"]')
    ).toBeVisible();

    // ✅ All filter options are displayed
    // Check that at least one checkbox is visible (sections are expanded by default)
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);

    // ✅ "Clear All" button is visible
    await expect(
      page.locator('[data-testid="clear-filter-button"]')
    ).toBeVisible();

    // ✅ Panel can be closed with X button
    await page.locator('[data-testid="filter-close-button"]').click();
    await expect(filterDrawer).not.toBeVisible();
  });

  /**
   * Test 4.2 - Apply Location Filter
   *
   * Success Criteria:
   * - ✅ Grid updates to show only USA employees
   * - ✅ Employee count updates (e.g., "45 of 200 employees")
   * - ✅ Non-USA employees are hidden/removed from grid
   * - ✅ USA filter shows as selected/active in panel
   * - ✅ Grid boxes update counts accordingly
   */
  test("4.2 - Apply Location Filter", async ({ page }) => {
    // Get initial employee count
    const initialCount = await getVisibleEmployeeCount(page);
    expect(initialCount).toBeGreaterThanOrEqual(190); // Should have ~200 employees

    // Open filter drawer
    await openFilterDrawer(page);

    // Expand Location section (accordion is collapsed by default)
    await expandFilterSection(page, "locations");

    // Under "Location" section, select "USA"
    // The checkbox test ID follows pattern: filter-checkbox-locations-usa
    const usaCheckbox = page.locator(
      '[data-testid="filter-checkbox-locations-usa"]'
    );
    await usaCheckbox.check();

    // ✅ USA filter shows as selected/active in panel
    await expect(usaCheckbox).toBeChecked();

    // Close drawer to see results
    await page.locator('[data-testid="filter-close-button"]').click();

    // Wait for grid to update
    await page.waitForLoadState("networkidle");

    // ✅ Grid updates to show only USA employees
    // ✅ Non-USA employees are hidden/removed from grid
    const filteredCount = await getVisibleEmployeeCount(page);
    expect(filteredCount).toBeLessThan(initialCount); // Should be fewer than all employees
    expect(filteredCount).toBeGreaterThan(0); // But should have some USA employees

    // ✅ Employee count updates (e.g., "45 of 200 employees")
    // The count display should show filtered vs total
    const countPattern = new RegExp(
      `${filteredCount}\\s+of\\s+${initialCount}`
    );
    await expect(page.getByText(countPattern)).toBeVisible();

    // ✅ Grid boxes update counts accordingly
    // VIRTUALIZATION-AWARE: Verify that the grid still shows employee cards
    // (at least some cards should be visible if filtered count > 0)
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    const visibleCards = await employeeCards.count();
    expect(visibleCards).toBeGreaterThan(0); // At least 1 card visible
    expect(visibleCards).toBeLessThanOrEqual(filteredCount); // But not more than the filtered total
  });

  /**
   * Test 4.3 - Filters Button Shows Active State
   *
   * Success Criteria:
   * - ✅ Filters button displays orange dot or indicator
   * - ✅ Indicator is clearly visible and distinct from inactive state
   * - ✅ Indicator persists while filters remain active
   * - ✅ Indicator disappears when all filters are cleared
   */
  test("4.3 - Filters Button Shows Active State", async ({ page }) => {
    // Verify filter-info is initially not visible (no filters active)
    const filterInfo = page.locator('[data-testid="filter-info"]');
    await expect(filterInfo).not.toBeVisible();

    // Apply a filter (Location: USA)
    await openFilterDrawer(page);
    await expandFilterSection(page, "locations");
    const usaCheckbox = page.locator(
      '[data-testid="filter-checkbox-locations-usa"]'
    );
    await usaCheckbox.check();
    await expect(usaCheckbox).toBeChecked();

    // Close filters panel
    await page.locator('[data-testid="filter-close-button"]').click();
    await expect(
      page.locator('[data-testid="filter-drawer"]')
    ).not.toBeVisible();

    // ✅ Filters button displays filter indicator
    // ✅ Indicator is clearly visible and distinct from inactive state
    // filter-info should be visible when filters are active
    await expect(filterInfo).toBeVisible();

    // ✅ Indicator persists while filters remain active
    // Open and close drawer again - filter-info should still be visible
    await openFilterDrawer(page);
    await page.locator('[data-testid="filter-close-button"]').click();
    await expect(filterInfo).toBeVisible();

    // ✅ Indicator disappears when all filters are cleared
    await openFilterDrawer(page);
    await page.locator('[data-testid="clear-filter-button"]').click();
    await page.locator('[data-testid="filter-close-button"]').click();

    // filter-info should not be visible again after clearing
    await expect(filterInfo).not.toBeVisible();
  });

  /**
   * Test 4.4 - Employee Count Updates with Filter
   *
   * Success Criteria:
   * - ✅ Count shows filtered employees vs. total (e.g., "45 of 200 employees")
   * - ✅ Count updates immediately when filter is applied
   * - ✅ Count is accurate (matches visible employees)
   * - ✅ Count returns to total when filters are cleared
   */
  test("4.4 - Employee Count Updates with Filter", async ({ page }) => {
    // Note total employee count display
    const initialCount = await getVisibleEmployeeCount(page);
    expect(initialCount).toBeGreaterThanOrEqual(190); // ~200 employees

    // Verify initial count shows total (just the number)
    const employeeCount = page.locator('[data-testid="employee-count"]');
    await expect(employeeCount).toHaveText(String(initialCount));

    // Apply a filter (Location: USA)
    await openFilterDrawer(page);
    await expandFilterSection(page, "locations");
    const usaCheckbox = page.locator(
      '[data-testid="filter-checkbox-locations-usa"]'
    );
    await usaCheckbox.check();
    await page.locator('[data-testid="filter-close-button"]').click();

    // Wait for grid to update
    await page.waitForLoadState("networkidle");

    // ✅ Count updates immediately when filter is applied
    const filteredCount = await getVisibleEmployeeCount(page);

    // ✅ Count shows filtered employees vs. total (e.g., "45 of 200")
    await expect(employeeCount).toHaveText(
      `${filteredCount} of ${initialCount}`
    );

    // ✅ Count is accurate (matches visible employees)
    // VIRTUALIZATION-AWARE: We can't count all cards in DOM, but verify some cards are visible
    const visibleCards = await page
      .locator('[data-testid^="employee-card-"]')
      .count();
    expect(visibleCards).toBeGreaterThan(0); // At least 1 card visible
    expect(visibleCards).toBeLessThanOrEqual(filteredCount); // But not more than the filtered total

    // ✅ Count returns to total when filters are cleared
    await openFilterDrawer(page);
    await page.locator('[data-testid="clear-filter-button"]').click();
    await page.locator('[data-testid="filter-close-button"]').click();

    // Wait for grid to update
    await page.waitForLoadState("networkidle");

    // Should show all employees again
    const finalCount = await getVisibleEmployeeCount(page);
    expect(finalCount).toBe(initialCount);

    // Count display should show just total (no "of")
    await expect(employeeCount).toHaveText(String(finalCount));
  });

  /**
   * Test 4.5 - Clear Filters
   *
   * Success Criteria:
   * - ✅ All filter selections are cleared
   * - ✅ Grid shows all 200 employees again
   * - ✅ Employee count returns to "200 employees"
   * - ✅ Filters button active indicator disappears
   * - ✅ No filters show as selected in panel
   */
  test("4.5 - Clear Filters", async ({ page }) => {
    const initialCount = await getVisibleEmployeeCount(page);

    // Apply multiple filters
    await openFilterDrawer(page);

    // Expand Location section and select USA
    await expandFilterSection(page, "locations");
    const usaCheckbox = page.locator(
      '[data-testid="filter-checkbox-locations-usa"]'
    );
    await usaCheckbox.check();
    await expect(usaCheckbox).toBeChecked();

    // Expand Job Levels section and select a job level (first available)
    await expandFilterSection(page, "job-levels");
    const firstLevelCheckbox = page
      .locator('[data-testid^="filter-checkbox-job-levels-"]')
      .first();
    await firstLevelCheckbox.check();
    await expect(firstLevelCheckbox).toBeChecked();

    // Close drawer to see filter effects
    await page.locator('[data-testid="filter-close-button"]').click();

    // Wait for filters to apply
    await page.waitForLoadState("networkidle");

    // Verify filters are active
    const filteredCount = await getVisibleEmployeeCount(page);
    expect(filteredCount).toBeLessThan(initialCount);

    // Verify filter indicator is visible
    const filterInfo = page.locator('[data-testid="filter-info"]');
    await expect(filterInfo).toBeVisible();

    // Open filters panel and click "Clear All"
    await openFilterDrawer(page);
    await page.locator('[data-testid="clear-filter-button"]').click();

    // ✅ All filter selections are cleared
    // ✅ No filters show as selected in panel
    await expect(usaCheckbox).not.toBeChecked();
    await expect(firstLevelCheckbox).not.toBeChecked();

    // Close drawer
    await page.locator('[data-testid="filter-close-button"]').click();

    // Wait for grid to update
    await page.waitForLoadState("networkidle");

    // ✅ Grid shows all employees again
    const finalCount = await getVisibleEmployeeCount(page);
    expect(finalCount).toBe(initialCount);

    // ✅ Employee count returns to total
    const employeeCount = page.locator('[data-testid="employee-count"]');
    await expect(employeeCount).toHaveText(String(finalCount));

    // ✅ Filters button active indicator disappears
    await expect(filterInfo).not.toBeVisible();
  });
});
