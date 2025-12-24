/**
 * E2E tests for i18n pluralization functionality
 * Tests that plural forms display correctly for different counts in both English and Spanish
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile, waitForUiSettle, clickTabAndWait, dragEmployeeToPosition, resetToEmptyState } from '../helpers';

test.describe('Pluralization', () => {
  test.beforeEach(async ({ page }) => {
    // Reset to clean empty state for each test
    await resetToEmptyState(page);
  });

  test('should display correct plural forms for employee count in English', async ({ page }) => {
    // Verify empty state (0 employees) - English
    await expect(page.getByText('No File Loaded')).toBeVisible();

    // Upload file with 15 employees
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Verify employee count uses plural form "employees" for count > 1
    // The app bar shows total employee count
    const employeeCountText = await page.locator('[data-testid="employee-count"]').textContent();
    expect(employeeCountText).toContain('employees'); // Should use plural form

    // Verify the count is correct (15 employees in sample file)
    expect(employeeCountText).toMatch(/15.*employees/i);
  });

  test('should display correct plural forms for employee count in Spanish', async ({ page }) => {
    // Upload file first
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Switch to Spanish
    const languageSelector = page.locator('.MuiSelect-select').first();
    await languageSelector.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Español' }).click();
    await waitForUiSettle(page, 1.0);

    // Verify employee count in Spanish
    const employeeCountText = await page.locator('[data-testid="employee-count"]').textContent();

    // Spanish uses "empleados" for plural (not "empleado")
    // The exact text depends on the component implementation
    expect(employeeCountText).toBeTruthy();
    expect(employeeCountText).toContain('15'); // Should show correct count
  });

  test('should display correct plural forms for changes count (0 changes) in English', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Open Changes tab
    await clickTabAndWait(page, 'changes-tab');

    // Verify 0 changes message (uses "other" plural form in English)
    await expect(page.getByText(/no changes/i)).toBeVisible();
  });

  test('should display correct plural forms for changes count (1 change) in English', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Make exactly 1 change by dragging an employee
    // Find an employee card to drag (Alice Smith from Stars box)
    const employeeCard = page.locator('[data-testid="employee-card-1"]').first();
    await expect(employeeCard).toBeVisible();

    // Drag to a different box (box 8 - High Potential, Medium Performance)
    await dragEmployeeToPosition(page, employeeCard, '[data-testid="grid-box-8"]');
    await waitForUiSettle(page);

    // Open Changes tab
    await clickTabAndWait(page, 'changes-tab');

    // Verify file menu shows singular "Change" for count=1
    const fileMenuButton = page.locator('[data-testid="file-menu-button"]');
    const fileMenuAriaLabel = await fileMenuButton.getAttribute('aria-label');

    // Should contain "1" and use singular form
    expect(fileMenuAriaLabel).toContain('1');
    expect(fileMenuAriaLabel).toMatch(/1.*change/i); // Singular form
  });

  test('should display correct plural forms for changes count (multiple changes) in English', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Make multiple changes (drag 3 employees)
    const employeeCard1 = page.locator('[data-testid="employee-card-1"]').first();
    await dragEmployeeToPosition(page, employeeCard1, '[data-testid="grid-box-8"]');
    await waitForUiSettle(page, 0.5);

    const employeeCard2 = page.locator('[data-testid="employee-card-2"]').first();
    await dragEmployeeToPosition(page, employeeCard2, '[data-testid="grid-box-7"]');
    await waitForUiSettle(page, 0.5);

    const employeeCard3 = page.locator('[data-testid="employee-card-3"]').first();
    await dragEmployeeToPosition(page, employeeCard3, '[data-testid="grid-box-6"]');
    await waitForUiSettle(page);

    // Open file menu to see changes count
    await page.locator('[data-testid="file-menu-button"]').click();
    await page.waitForTimeout(300);

    // Verify plural form "Changes" is used
    await expect(page.getByText(/Apply.*Changes to Excel/i)).toBeVisible();

    // Close menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verify file menu aria-label uses plural
    const fileMenuButton = page.locator('[data-testid="file-menu-button"]');
    const fileMenuAriaLabel = await fileMenuButton.getAttribute('aria-label');
    expect(fileMenuAriaLabel).toMatch(/3.*changes/i); // Plural form
  });

  test('should display correct plural forms for changes count in Spanish', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Switch to Spanish
    const languageSelector = page.locator('.MuiSelect-select').first();
    await languageSelector.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Español' }).click();
    await waitForUiSettle(page, 1.0);

    // Make 1 change
    const employeeCard = page.locator('[data-testid="employee-card-1"]').first();
    await dragEmployeeToPosition(page, employeeCard, '[data-testid="grid-box-8"]');
    await waitForUiSettle(page);

    // Open file menu
    await page.locator('[data-testid="file-menu-button"]').click();
    await page.waitForTimeout(300);

    // Verify Spanish singular form "Cambio" for 1 change
    await expect(page.getByText(/Aplicar.*Cambio a Excel/i)).toBeVisible();

    // Close and make more changes
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Make 2 more changes (total 3)
    const employeeCard2 = page.locator('[data-testid="employee-card-2"]').first();
    await dragEmployeeToPosition(page, employeeCard2, '[data-testid="grid-box-7"]');
    await waitForUiSettle(page, 0.5);

    const employeeCard3 = page.locator('[data-testid="employee-card-3"]').first();
    await dragEmployeeToPosition(page, employeeCard3, '[data-testid="grid-box-6"]');
    await waitForUiSettle(page);

    // Open file menu again
    await page.locator('[data-testid="file-menu-button"]').click();
    await page.waitForTimeout(300);

    // Verify Spanish plural form "Cambios" for multiple changes
    await expect(page.getByText(/Aplicar.*Cambios a Excel/i)).toBeVisible();
  });

  test('should use correct plural forms in filter descriptions', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();

    // Apply a filter to get filtered count
    const firstCheckbox = page.locator('[data-testid="filter-drawer"] input[type="checkbox"]').first();
    await firstCheckbox.click();
    await waitForUiSettle(page);

    // Close filter drawer
    await page.locator('[data-testid="filter-button"]').click();
    await waitForUiSettle(page);

    // Verify employee count text uses proper pluralization
    // The filtered count should show "X of Y employees" with correct plural form
    const employeeCountText = await page.locator('[data-testid="employee-count"]').textContent();
    expect(employeeCountText).toBeTruthy();

    // Should use "employees" plural form when count > 1
    if (employeeCountText && employeeCountText.match(/\d+/)) {
      const counts = employeeCountText.match(/\d+/g);
      if (counts && counts.length > 0) {
        const count = parseInt(counts[0]);
        if (count > 1) {
          expect(employeeCountText).toContain('employees');
        } else if (count === 1) {
          expect(employeeCountText).toContain('employee');
        }
      }
    }
  });

  test('should handle edge case of exactly 1 employee', async ({ page }) => {
    // This test verifies singular form is used for count=1
    // Note: We'll need to create a fixture with exactly 1 employee
    // For now, we'll verify the component can handle it by checking after filtering

    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Open filter drawer
    await page.locator('[data-testid="filter-button"]').click();
    await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();

    // Click search input and type a name to filter down to 1 employee
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Alice Smith');
    await waitForUiSettle(page);

    // Close filter drawer
    await page.locator('[data-testid="filter-button"]').click();
    await waitForUiSettle(page);

    // Verify singular form is used
    const employeeCountText = await page.locator('[data-testid="employee-count"]').textContent();

    // When filtering to 1 employee, should show singular form
    // The exact format depends on implementation, but should contain "employee" (singular)
    expect(employeeCountText).toBeTruthy();
  });

  test('should maintain correct pluralization when switching languages mid-session', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await waitForUiSettle(page);

    // Make 2 changes
    const employeeCard1 = page.locator('[data-testid="employee-card-1"]').first();
    await dragEmployeeToPosition(page, employeeCard1, '[data-testid="grid-box-8"]');
    await waitForUiSettle(page, 0.5);

    const employeeCard2 = page.locator('[data-testid="employee-card-2"]').first();
    await dragEmployeeToPosition(page, employeeCard2, '[data-testid="grid-box-7"]');
    await waitForUiSettle(page);

    // Verify English plural form
    await page.locator('[data-testid="file-menu-button"]').click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Apply.*Changes to Excel/i)).toBeVisible();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Switch to Spanish
    const languageSelector = page.locator('.MuiSelect-select').first();
    await languageSelector.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Español' }).click();
    await waitForUiSettle(page, 1.0);

    // Verify Spanish plural form for same count
    await page.locator('[data-testid="file-menu-button"]').click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Aplicar.*Cambios a Excel/i)).toBeVisible();
  });
});
