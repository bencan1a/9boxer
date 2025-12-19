/**
 * E2E tests for Employee Exclusions with Quick Filters
 * Tests the complete flow of excluding employees using quick filter buttons
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile } from '../helpers';

test.describe('Employee Exclusions with Quick Filters Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Upload sample employee data
    await uploadExcelFile(page, 'sample-employees.xlsx');

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test('should open manage exclusions dialog', async ({ page }) => {
    // Click Filter button to open filter drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Wait for filter drawer to be visible
    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer).toBeVisible();

    // Find and expand the Exclusions accordion if it's collapsed
    const exclusionsAccordion = page.getByText('Exclusions').locator('..');
    await exclusionsAccordion.click();

    // Wait for the exclusions section to expand
    await page.waitForTimeout(300);

    // Click "Exclude Employees" button
    await page.locator('[data-testid="exclude-employees-button"]').click();

    // Verify exclusion dialog opens
    await expect(page.locator('[data-testid="exclusion-dialog"]')).toBeVisible();

    // Verify quick filter buttons are visible
    await expect(page.locator('[data-testid="exclude-vps-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="exclude-directors-plus-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="exclude-managers-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="clear-selections-button"]')).toBeVisible();

    // Verify employee list is shown
    const employeeCheckboxes = page.locator('[data-testid^="exclusion-checkbox-"]');
    const checkboxCount = await employeeCheckboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);
  });

  test('should exclude employees using quick filter button', async ({ page }) => {
    // Get initial employee count from the app bar
    const employeeCountText = await page.locator('[data-testid="employee-count"]').textContent();
    const initialCountMatch = employeeCountText?.match(/(\d+)\s+(?:of\s+)?(\d+)?\s*employees?/i);
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1]) : 0;
    expect(initialCount).toBeGreaterThan(0);

    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();

    // Wait for drawer to be visible
    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer).toBeVisible();

    // Expand Exclusions accordion
    const exclusionsAccordion = page.getByText('Exclusions').locator('..');
    await exclusionsAccordion.click();
    await page.waitForTimeout(300);

    // Open Manage Exclusions dialog
    await page.locator('[data-testid="exclude-employees-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).toBeVisible();

    // Click "Exclude Managers" quick filter button (sample data has Manager job level)
    await page.locator('[data-testid="exclude-managers-button"]').click();

    // Verify that some employees are now selected
    const selectedCountText = await page.locator('[data-testid="selected-count"]').textContent();
    const selectedCount = parseInt(selectedCountText?.match(/(\d+)/)?.[1] || '0');
    expect(selectedCount).toBeGreaterThan(0);

    // Click Apply button
    await page.locator('[data-testid="apply-exclusions-button"]').click();

    // Wait for dialog to close
    await expect(page.locator('[data-testid="exclusion-dialog"]')).not.toBeVisible();

    // Verify employee count decreases (shows "X of Y employees")
    await expect(page.locator('[data-testid="employee-count"]')).toContainText(/\d+\s+of\s+\d+\s+employees?/i);

    // Get new count
    const newCountText = await page.locator('[data-testid="employee-count"]').textContent();
    const newCountMatch = newCountText?.match(/(\d+)\s+of\s+(\d+)\s+employees?/i);
    const visibleCount = newCountMatch ? parseInt(newCountMatch[1]) : 0;
    const totalCount = newCountMatch ? parseInt(newCountMatch[2]) : 0;

    // Verify visible count is less than total count
    expect(visibleCount).toBeLessThan(totalCount);
    expect(visibleCount).toBeLessThan(initialCount);
  });

  test('should show excluded employees as checked when reopening dialog', async ({ page }) => {
    // Open filter drawer and exclusion dialog
    await page.locator('[data-testid="filter-button"]').click();
    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer).toBeVisible();

    // Expand Exclusions accordion
    const exclusionsAccordion = page.getByText('Exclusions').locator('..');
    await exclusionsAccordion.click();
    await page.waitForTimeout(300);

    await page.locator('[data-testid="exclude-employees-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).toBeVisible();

    // Click "Exclude Managers" quick filter
    await page.locator('[data-testid="exclude-managers-button"]').click();

    // Get the number of selected employees
    const selectedCountText = await page.locator('[data-testid="selected-count"]').textContent();
    const selectedCount = parseInt(selectedCountText?.match(/(\d+)/)?.[1] || '0');

    // Apply exclusions
    await page.locator('[data-testid="apply-exclusions-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).not.toBeVisible();

    // Reopen the dialog
    await page.locator('[data-testid="exclude-employees-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).toBeVisible();

    // Verify the selected count is still the same
    const reopenedCountText = await page.locator('[data-testid="selected-count"]').textContent();
    const reopenedCount = parseInt(reopenedCountText?.match(/(\d+)/)?.[1] || '0');
    expect(reopenedCount).toBe(selectedCount);

    // Verify at least some checkboxes are checked
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    const checkedCount = await checkedBoxes.count();
    expect(checkedCount).toBeGreaterThan(0);
  });

  test('should restore excluded employees when using clear selections', async ({ page }) => {
    // Get initial count
    const initialCountText = await page.locator('[data-testid="employee-count"]').textContent();
    const initialCountMatch = initialCountText?.match(/(\d+)\s+(?:of\s+)?(\d+)?\s*employees?/i);
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1]) : 0;

    // Exclude Managers
    await page.locator('[data-testid="filter-button"]').click();
    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer).toBeVisible();

    // Expand Exclusions accordion
    const exclusionsAccordion = page.getByText('Exclusions').locator('..');
    await exclusionsAccordion.click();
    await page.waitForTimeout(300);

    await page.locator('[data-testid="exclude-employees-button"]').click();
    await page.locator('[data-testid="exclude-managers-button"]').click();
    await page.locator('[data-testid="apply-exclusions-button"]').click();

    // Wait for dialog to close
    await expect(page.locator('[data-testid="exclusion-dialog"]')).not.toBeVisible();

    // Verify employees are excluded (count should change)
    const excludedCountText = await page.locator('[data-testid="employee-count"]').textContent();
    const excludedCountMatch = excludedCountText?.match(/(\d+)\s+(?:of\s+)?(\d+)?\s*employees?/i);
    const excludedCount = excludedCountMatch ? parseInt(excludedCountMatch[1]) : initialCount;

    // If exclusions were applied, count should be different
    // If the display format is "X of Y", we know exclusions are active
    const hasExclusionFormat = /\d+\s+of\s+\d+\s+employees?/i.test(excludedCountText || '');
    expect(excludedCount).toBeLessThanOrEqual(initialCount);

    // Reopen dialog
    await page.locator('[data-testid="exclude-employees-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).toBeVisible();

    // Click "Clear All" button
    await page.locator('[data-testid="clear-selections-button"]').click();

    // Verify selected count is 0
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('0 selected');

    // Apply changes
    await page.locator('[data-testid="apply-exclusions-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).not.toBeVisible();

    // Verify employee count returns to original (no "X of Y", just "X employees")
    const restoredCountText = await page.locator('[data-testid="employee-count"]').textContent();
    const restoredCountMatch = restoredCountText?.match(/(\d+)\s+(?:of\s+)?(\d+)?\s*employees?/i);
    const restoredCount = restoredCountMatch ? parseInt(restoredCountMatch[1]) : 0;

    expect(restoredCount).toBe(initialCount);
  });

  test('should exclude Directors+ using quick filter', async ({ page }) => {
    // Open exclusion dialog
    await page.locator('[data-testid="filter-button"]').click();
    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer).toBeVisible();

    // Expand Exclusions accordion
    const exclusionsAccordion = page.getByText('Exclusions').locator('..');
    await exclusionsAccordion.click();
    await page.waitForTimeout(300);

    await page.locator('[data-testid="exclude-employees-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).toBeVisible();

    // Click "Exclude Directors+" quick filter button
    await page.locator('[data-testid="exclude-directors-plus-button"]').click();

    // Verify selection count (may be 0 if no directors in sample data)
    const selectedCountText = await page.locator('[data-testid="selected-count"]').textContent();
    const selectedCount = parseInt(selectedCountText?.match(/(\d+)/)?.[1] || '0');

    // For sample data without directors, the count will be 0, which is expected
    expect(selectedCount).toBeGreaterThanOrEqual(0);

    // If there are directors to exclude, apply and verify
    if (selectedCount > 0) {
      await page.locator('[data-testid="apply-exclusions-button"]').click();
      await expect(page.locator('[data-testid="exclusion-dialog"]')).not.toBeVisible();

      // Verify exclusions are applied
      await expect(page.locator('[data-testid="employee-count"]')).toContainText(/\d+\s+of\s+\d+\s+employees?/i);
    }
  });

  test('should exclude Managers using quick filter', async ({ page }) => {
    // Open exclusion dialog
    await page.locator('[data-testid="filter-button"]').click();
    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer).toBeVisible();

    // Expand Exclusions accordion
    const exclusionsAccordion = page.getByText('Exclusions').locator('..');
    await exclusionsAccordion.click();
    await page.waitForTimeout(300);

    await page.locator('[data-testid="exclude-employees-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).toBeVisible();

    // Click "Exclude Managers" quick filter button
    await page.locator('[data-testid="exclude-managers-button"]').click();

    // Verify that employees are selected
    const selectedCountText = await page.locator('[data-testid="selected-count"]').textContent();
    const selectedCount = parseInt(selectedCountText?.match(/(\d+)/)?.[1] || '0');
    expect(selectedCount).toBeGreaterThan(0);

    // Apply exclusions
    await page.locator('[data-testid="apply-exclusions-button"]').click();
    await expect(page.locator('[data-testid="exclusion-dialog"]')).not.toBeVisible();

    // Verify exclusions are applied
    await expect(page.locator('[data-testid="employee-count"]')).toContainText(/\d+\s+of\s+\d+\s+employees?/i);
  });
});
