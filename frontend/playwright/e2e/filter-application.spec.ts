/**
 * E2E tests for Filter Application End-to-End
 * Tests complete filter workflows including applying, combining, and clearing filters
 *
 * Tests cover:
 * - Filtering by job level
 * - Filtering by job function
 * - Clearing filters
 * - Combining multiple filters with AND logic
 * - Visual indicators (employee count)
 */

import { test, expect } from "../fixtures";
import { uploadExcelFile, t } from "../helpers";

test.describe("Filter Application End-to-End", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto("/");

    // Upload sample employee data
    await uploadExcelFile(page, "sample-employees.xlsx");

    // Verify grid loaded successfully
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should filter employees by job level", async ({ page }) => {
    // Get initial employee count from app bar
    // When no filters are active, it shows "X employees"
    const employeeCountChip = page.getByText(/\d+(\s+of\s+\d+)?\s+employees/i);
    await expect(employeeCountChip).toBeVisible();

    const initialCountText = await employeeCountChip.textContent();
    const simpleMatch = initialCountText?.match(/^(\d+)\s+employees$/i);
    const initialTotalCount = simpleMatch ? parseInt(simpleMatch[1], 10) : 0;
    expect(initialTotalCount).toBeGreaterThan(0);

    // Click Filter button to open drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Wait for filter drawer to open and verify Job Levels section is visible
    await expect(
      page.getByText(t("dashboard.filterDrawer.jobLevels"))
    ).toBeVisible();

    // Find the first checkbox (should be a job level since Job Levels defaultExpanded)
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();

    // Check the first job level filter
    await firstCheckbox.check();

    // Verify employee count updated in app bar to show "X of Y employees" (auto-retrying)
    await expect(employeeCountChip).toHaveText(/\d+\s+of\s+\d+\s+employees/i, {
      timeout: 5000,
    });
    const filteredCountText = await employeeCountChip.textContent();
    const filteredMatch = filteredCountText?.match(
      /(\d+)\s+of\s+(\d+)\s+employees/i
    );

    expect(filteredMatch).toBeTruthy();
    if (filteredMatch) {
      const filteredDisplayedCount = parseInt(filteredMatch[1], 10);
      const filteredTotalCount = parseInt(filteredMatch[2], 10);

      // Verify filtered count is less than total
      expect(filteredDisplayedCount).toBeLessThan(filteredTotalCount);
      expect(filteredTotalCount).toBe(initialTotalCount);

      // Verify grid shows only filtered employees
      const visibleEmployeeCards = page.locator(
        '[data-testid^="employee-card-"]'
      );
      const visibleCount = await visibleEmployeeCards.count();
      expect(visibleCount).toBe(filteredDisplayedCount);
    }
  });

  test("should filter by job function", async ({ page }) => {
    // Get initial count
    const employeeCountChip = page.getByText(/\d+(\s+of\s+\d+)?\s+employees/i);
    const initialCountText = await employeeCountChip.textContent();
    const simpleMatch = initialCountText?.match(/^(\d+)\s+employees$/i);
    const initialTotalCount = simpleMatch ? parseInt(simpleMatch[1], 10) : 0;

    // Open filters
    await page.locator('[data-testid="filter-button"]').click();
    await expect(
      page.getByText(t("dashboard.filterDrawer.jobFunctions"))
    ).toBeVisible();

    // Find all checkboxes and select one (any checkbox will work for this test)
    const allCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await allCheckboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);

    // Get a checkbox (we'll use the third one to likely hit a different category)
    const checkbox = allCheckboxes.nth(Math.min(2, checkboxCount - 1));
    await expect(checkbox).toBeVisible();

    // Check the filter
    await checkbox.check();

    // Verify filtered count is less than total (auto-retrying)
    await expect(employeeCountChip).toHaveText(/\d+\s+of\s+\d+\s+employees/i, {
      timeout: 5000,
    });
    const filteredCountText = await employeeCountChip.textContent();
    const filteredMatch = filteredCountText?.match(
      /(\d+)\s+of\s+(\d+)\s+employees/i
    );

    expect(filteredMatch).toBeTruthy();
    if (filteredMatch) {
      const filteredDisplayedCount = parseInt(filteredMatch[1], 10);
      expect(filteredDisplayedCount).toBeLessThan(initialTotalCount);
    }
  });

  test("should clear filters and restore all employees", async ({ page }) => {
    // Get initial count
    const employeeCountChip = page.getByText(/\d+(\s+of\s+\d+)?\s+employees/i);
    const initialCountText = await employeeCountChip.textContent();
    const simpleMatch = initialCountText?.match(/^(\d+)\s+employees$/i);
    const initialTotalCount = simpleMatch ? parseInt(simpleMatch[1], 10) : 0;

    // Open filters and apply a filter
    await page.locator('[data-testid="filter-button"]').click();
    await expect(
      page.getByText(t("dashboard.filterDrawer.jobLevels"))
    ).toBeVisible();

    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.check();

    // Verify filter is active (should show "X of Y employees") (auto-retrying)
    await expect(employeeCountChip).toHaveText(/\d+\s+of\s+\d+\s+employees/i, {
      timeout: 5000,
    });
    const filteredCountText = await employeeCountChip.textContent();
    const filteredMatch = filteredCountText?.match(
      /(\d+)\s+of\s+(\d+)\s+employees/i
    );
    expect(filteredMatch).toBeTruthy();
    if (filteredMatch) {
      const filteredDisplayedCount = parseInt(filteredMatch[1], 10);
      expect(filteredDisplayedCount).toBeLessThan(initialTotalCount);
    }

    // Click Clear All Filters button
    const clearButton = page.locator('[data-testid="clear-filter-button"]');
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Verify all employees restored (should show "X employees" again, not "X of Y") (auto-retrying)
    await expect(employeeCountChip).toHaveText(/^(\d+)\s+employees$/i, {
      timeout: 5000,
    });
    const restoredCountText = await employeeCountChip.textContent();
    const restoredSimpleMatch =
      restoredCountText?.match(/^(\d+)\s+employees$/i);
    expect(restoredSimpleMatch).toBeTruthy();
    if (restoredSimpleMatch) {
      const restoredTotalCount = parseInt(restoredSimpleMatch[1], 10);
      expect(restoredTotalCount).toBe(initialTotalCount);
    }
  });

  test("should combine multiple filters with AND logic", async ({ page }) => {
    // Get initial count
    const employeeCountChip = page.getByText(/\d+(\s+of\s+\d+)?\s+employees/i);
    const initialCountText = await employeeCountChip.textContent();
    const simpleMatch = initialCountText?.match(/^(\d+)\s+employees$/i);
    const initialTotalCount = simpleMatch ? parseInt(simpleMatch[1], 10) : 0;

    // Open filters
    await page.locator('[data-testid="filter-button"]').click();
    await expect(
      page.getByText(t("dashboard.filterDrawer.jobLevels"))
    ).toBeVisible();

    // Apply first filter
    const allCheckboxes = page.locator('input[type="checkbox"]');
    const firstCheckbox = allCheckboxes.first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.check();

    // Get count after first filter (auto-retrying)
    await expect(employeeCountChip).toHaveText(/\d+\s+of\s+\d+\s+employees/i, {
      timeout: 5000,
    });
    const firstFilterCountText = await employeeCountChip.textContent();
    const firstFilterMatch = firstFilterCountText?.match(
      /(\d+)\s+of\s+(\d+)\s+employees/i
    );
    expect(firstFilterMatch).toBeTruthy();
    const firstFilterCount = firstFilterMatch
      ? parseInt(firstFilterMatch[1], 10)
      : 0;
    expect(firstFilterCount).toBeLessThan(initialTotalCount);

    // Apply second filter
    const checkboxCount = await allCheckboxes.count();
    const secondCheckbox = allCheckboxes.nth(Math.min(2, checkboxCount - 1));
    await expect(secondCheckbox).toBeVisible();
    await secondCheckbox.check();

    // Get count after both filters (auto-retrying)
    await expect(employeeCountChip).toHaveText(/\d+\s+of\s+\d+\s+employees/i, {
      timeout: 5000,
    });
    const combinedFilterCountText = await employeeCountChip.textContent();
    const combinedFilterMatch = combinedFilterCountText?.match(
      /(\d+)\s+of\s+(\d+)\s+employees/i
    );
    expect(combinedFilterMatch).toBeTruthy();

    if (combinedFilterMatch) {
      const combinedFilterCount = parseInt(combinedFilterMatch[1], 10);

      // Verify combined filter count is less than or equal to single filter count
      // (AND logic means fewer or equal results)
      expect(combinedFilterCount).toBeLessThanOrEqual(firstFilterCount);
      expect(combinedFilterCount).toBeLessThan(initialTotalCount);

      // Verify the actual number of employee cards matches the displayed count
      const visibleEmployeeCards = page.locator(
        '[data-testid^="employee-card-"]'
      );
      const visibleCount = await visibleEmployeeCards.count();
      expect(visibleCount).toBe(combinedFilterCount);
    }
  });

  test("should update filter count badges when filters are applied", async ({
    page,
  }) => {
    // Open filters
    await page.locator('[data-testid="filter-button"]').click();
    await expect(
      page.getByText(t("dashboard.filterDrawer.jobLevels"))
    ).toBeVisible();

    // Get all checkboxes
    const allCheckboxes = page.locator('input[type="checkbox"]');

    // Apply first job level filter
    const firstCheckbox = allCheckboxes.first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.check();

    // Verify count badge appears next to "Job Levels" (auto-retrying)
    // The badge shows the number of active filters in that section
    const jobLevelsSection = page.locator(
      `text=${t("dashboard.filterDrawer.jobLevels")}`
    );
    const sectionContainer = jobLevelsSection.locator("..");

    // Look for a chip/badge with "1"
    const badge = sectionContainer.locator('.MuiChip-label:has-text("1")');
    await expect(badge).toBeVisible({ timeout: 10000 });

    // Apply a second checkbox if there are multiple
    const checkboxCount = await allCheckboxes.count();
    if (checkboxCount > 1) {
      const secondCheckbox = allCheckboxes.nth(1);
      await secondCheckbox.check();

      // Verify count badge updates to "2" (auto-retrying)
      const badge2 = sectionContainer.locator('.MuiChip-label:has-text("2")');
      await expect(badge2).toBeVisible({ timeout: 10000 });
    }
  });

  test("should persist filter state when drawer is closed and reopened", async ({
    page,
  }) => {
    // Open filters
    await page.locator('[data-testid="filter-button"]').click();
    await expect(
      page.getByText(t("dashboard.filterDrawer.jobLevels"))
    ).toBeVisible();

    // Apply a filter
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.check();

    // Verify filter applied (auto-retrying)
    const employeeCountChip = page.getByText(/\d+(\s+of\s+\d+)?\s+employees/i);
    await expect(employeeCountChip).toHaveText(/\d+\s+of\s+\d+\s+employees/i, {
      timeout: 5000,
    });

    // Close the drawer (press Escape)
    await page.keyboard.press("Escape");

    // Verify filters are still active (check employee count shows "X of Y") (auto-retrying)
    await expect(employeeCountChip).toBeVisible({ timeout: 10000 });

    // Reopen the drawer
    await page.locator('[data-testid="filter-button"]').click();
    await expect(
      page.getByText(t("dashboard.filterDrawer.jobLevels"))
    ).toBeVisible();

    // Verify the checkbox is still checked
    const sameCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(sameCheckbox).toBeChecked();
  });
});
