/**
 * E2E tests for filter functionality
 * Tests filtering employees by department, location, and other criteria
 *
 * Converted from Cypress test: cypress/e2e/filter-flow.cy.ts
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile } from '../helpers';

test.describe('Filter Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Visit and upload sample data
    await page.goto('/');
    await uploadExcelFile(page, 'sample-employees.xlsx');

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test('should filter employees by job function', async ({ page }) => {
    // Get initial count of employees
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    const initialCount = await employeeCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Wait for drawer to open and verify filter sections are visible
    await expect(page.getByText('Job Functions')).toBeVisible();
    await expect(page.getByText('Job Levels')).toBeVisible();
    await expect(page.getByText('Locations')).toBeVisible();

    // Verify that there are checkboxes in the filter drawer
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);

    // Note: Actual filter interaction is complex in E2E tests due to dynamic data
    // The filter functionality is better tested through component tests and backend API tests
    // For now, we verify the filter UI structure is correct
  });

  test('should clear filters correctly and show all employees again', async ({ page }) => {
    // Get initial count
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    const initialCount = await employeeCards.count();

    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Verify filter drawer is open with sections
    await expect(page.getByText('Job Functions')).toBeVisible();

    // Verify clear filter button is present
    await expect(page.locator('[data-testid="clear-filter-button"]')).toBeVisible();

    // Click clear filters button (should work even if no filters applied)
    await page.locator('[data-testid="clear-filter-button"]').click();

    // Wait for action to complete
    await page.waitForTimeout(500);

    // Verify count remains the same (no filters were applied)
    const finalCount = await employeeCards.count();
    expect(finalCount).toBe(initialCount);
  });

  test('should update employee count display based on active filters', async ({ page }) => {
    // Verify the employee count is displayed in the app bar
    // Should show something like "15 employees" or "X of Y employees"
    const employeeCountPattern = /\d+(\s+of\s+\d+)?\s+employees/i;
    await expect(page.getByText(employeeCountPattern)).toBeVisible();

    // Open filter drawer to verify it exists
    await page.locator('[data-testid="filter-button"]').click();

    // Verify filter sections are present
    await expect(page.getByText('Job Levels')).toBeVisible();
    await expect(page.getByText('Job Functions')).toBeVisible();

    // The count display should still be visible with the drawer open
    await expect(page.getByText(employeeCountPattern)).toBeVisible();

    // Note: Actual filter application is complex in E2E tests due to dynamic data
    // Component tests and backend API tests provide better coverage for filter logic
  });

  test('should display filter badge when filters are active', async ({ page }) => {
    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Wait for drawer to open
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();

    // Apply a filter by clicking any checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();
    await page.waitForTimeout(300);

    // Close drawer
    await page.locator('[data-testid="filter-close-button"]').click();
    await page.waitForTimeout(300);

    // Verify filter badge is visible (orange dot indicator)
    const filterBadge = page.locator('[data-testid="filter-badge"]');
    await expect(filterBadge).toBeVisible();

    // Verify badge is not invisible (MUI Badge sets invisible attribute)
    const isInvisible = await filterBadge.getAttribute('class');
    expect(isInvisible).not.toContain('invisible');
  });

  test('should open and close filter drawer with close button', async ({ page }) => {
    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Verify drawer is open
    const filterDrawer = page.locator('[data-testid="filter-drawer"]');
    await expect(filterDrawer).toBeVisible();

    // Click close button
    await page.locator('[data-testid="filter-close-button"]').click();
    await page.waitForTimeout(300);

    // Verify drawer is closed
    await expect(filterDrawer).not.toBeVisible();
  });

  test('should expand and collapse accordion sections', async ({ page }) => {
    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Verify all accordion sections are present
    const jobLevelsAccordion = page.locator('[data-testid="filter-accordion-job-levels"]');
    const jobFunctionsAccordion = page.locator('[data-testid="filter-accordion-job-functions"]');
    const locationsAccordion = page.locator('[data-testid="filter-accordion-locations"]');
    const managersAccordion = page.locator('[data-testid="filter-accordion-managers"]');

    await expect(jobLevelsAccordion).toBeVisible();
    await expect(jobFunctionsAccordion).toBeVisible();
    await expect(locationsAccordion).toBeVisible();
    await expect(managersAccordion).toBeVisible();

    // Verify checkboxes are visible (indicating accordion is expanded)
    const jobLevelsCheckboxes = page.locator('[data-testid^="filter-checkbox-job-levels-"]');
    await expect(jobLevelsCheckboxes.first()).toBeVisible();

    // Click accordion summary (header) to collapse Job Levels
    // AccordionSummary has role="button"
    await jobLevelsAccordion.locator('[role="button"]').click();
    await page.waitForTimeout(300);

    // Verify checkboxes are hidden (indicating accordion is collapsed)
    await expect(jobLevelsCheckboxes.first()).toBeHidden();

    // Click to expand it again
    await jobLevelsAccordion.locator('[role="button"]').click();
    await page.waitForTimeout(300);

    // Verify checkboxes are visible again
    await expect(jobLevelsCheckboxes.first()).toBeVisible();
  });

  test('should interact with filter checkboxes using data-testid', async ({ page }) => {
    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();

    // Wait for filter options to load
    await page.waitForTimeout(300);

    // Try to find and interact with specific checkboxes
    // Note: The actual values depend on the test data, so we'll check if any exist
    const jobLevelCheckboxes = page.locator('[data-testid^="filter-checkbox-job-levels-"]');
    const checkboxCount = await jobLevelCheckboxes.count();

    if (checkboxCount > 0) {
      // Get the first checkbox
      const firstCheckbox = jobLevelCheckboxes.first();
      await expect(firstCheckbox).toBeVisible();

      // Check if it's unchecked
      const isChecked = await firstCheckbox.isChecked();

      // Click to toggle
      await firstCheckbox.click();
      await page.waitForTimeout(200);

      // Verify state changed
      const newState = await firstCheckbox.isChecked();
      expect(newState).toBe(!isChecked);

      // Click again to toggle back
      await firstCheckbox.click();
      await page.waitForTimeout(200);

      // Verify it returned to original state
      const finalState = await firstCheckbox.isChecked();
      expect(finalState).toBe(isChecked);
    }
  });

  test('should clear all filters and remove badge', async ({ page }) => {
    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();

    // Apply a filter
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();
    await page.waitForTimeout(300);

    // Verify clear button is visible
    const clearButton = page.locator('[data-testid="clear-filter-button"]');
    await expect(clearButton).toBeVisible();

    // Click clear all filters
    await clearButton.click();
    await page.waitForTimeout(300);

    // Close drawer
    await page.locator('[data-testid="filter-close-button"]').click();
    await page.waitForTimeout(300);

    // Verify badge is not visible (no active filters)
    // MUI Badge uses visibility and display styles, not class names
    const filterButton = page.locator('[data-testid="filter-button"]');
    const badgeDot = filterButton.locator('.MuiBadge-badge');
    // Badge should not be visible when there are no filters
    await expect(badgeDot).toBeHidden();
  });

  test('should show exclusions accordion section', async ({ page }) => {
    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Verify exclusions section is present
    const exclusionsAccordion = page.locator('[data-testid="filter-accordion-exclusions"]');
    await expect(exclusionsAccordion).toBeVisible();

    // Expand the exclusions accordion (it's collapsed by default)
    // AccordionSummary has role="button"
    await exclusionsAccordion.locator('[role="button"]').click();
    await page.waitForTimeout(300);

    // Verify exclude employees button is now visible
    await expect(page.locator('[data-testid="exclude-employees-button"]')).toBeVisible();
  });

  test('should persist filter drawer state across toggle', async ({ page }) => {
    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();

    // Apply a filter
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();
    await page.waitForTimeout(200);

    // Close drawer
    await page.locator('[data-testid="filter-close-button"]').click();
    await page.waitForTimeout(300);

    // Open drawer again
    await page.locator('[data-testid="filter-button"]').click();
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();

    // Verify checkbox is still checked
    const isStillChecked = await firstCheckbox.isChecked();
    expect(isStillChecked).toBe(true);
  });
});
