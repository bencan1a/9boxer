/**
 * Language Switching Test Suite
 *
 * Tests internationalization (i18n) functionality including:
 * - Language selector availability
 * - Switching between English and Spanish
 * - UI text updates when language changes
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile } from '../helpers';

test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session and start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display language selector in app bar', async ({ page }) => {
    // Upload file to get to main interface
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Check for language selector icon/button
    const languageSelector = page.locator('svg').filter({ hasText: /^$/ }).first(); // Language icon
    await expect(languageSelector).toBeVisible();
  });

  test('should switch from English to Spanish and update UI text', async ({ page }) => {
    // Upload file to get to main interface
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify initial language is English - check for English text
    await expect(page.getByText('Import Data', { exact: false })).toBeVisible();
    
    // Find and open language selector (MUI Select component)
    const languageSelect = page.locator('[role="combobox"]').first();
    await languageSelect.click();
    await page.waitForTimeout(300);

    // Select Spanish option
    const spanishOption = page.getByRole('option', { name: /Español|Spanish/i });
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();
    await page.waitForTimeout(500);

    // Verify UI text has changed to Spanish
    // Check tab labels
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Detalles');
    await expect(page.locator('[data-testid="changes-tab"]')).toContainText('Cambios');
    await expect(page.locator('[data-testid="statistics-tab"]')).toContainText('Estadísticas');
    await expect(page.locator('[data-testid="intelligence-tab"]')).toContainText('Inteligencia');

    // Check filter button
    await page.locator('[data-testid="filter-button"]').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Filtros')).toBeVisible();
    
    // Check filter sections
    await expect(page.getByText('Niveles de Trabajo')).toBeVisible();
    await expect(page.getByText('Funciones de Trabajo')).toBeVisible();
    await expect(page.getByText('Ubicaciones')).toBeVisible();
    await expect(page.getByText('Gerentes')).toBeVisible();

    // Close filter drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('should switch from Spanish back to English', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Switch to Spanish first
    const languageSelect = page.locator('[role="combobox"]').first();
    await languageSelect.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: /Español|Spanish/i }).click();
    await page.waitForTimeout(500);

    // Verify Spanish
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Detalles');

    // Switch back to English
    await languageSelect.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: /English|Inglés/i }).click();
    await page.waitForTimeout(500);

    // Verify English is back
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Details');
    await expect(page.locator('[data-testid="changes-tab"]')).toContainText('Changes');
    await expect(page.locator('[data-testid="statistics-tab"]')).toContainText('Statistics');
  });

  test('should persist language preference across page reloads', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Switch to Spanish
    const languageSelect = page.locator('[role="combobox"]').first();
    await languageSelect.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: /Español|Spanish/i }).click();
    await page.waitForTimeout(500);

    // Verify Spanish
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Detalles');

    // Reload page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify Spanish is still active
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Detalles');
    await expect(page.locator('[data-testid="changes-tab"]')).toContainText('Cambios');
  });

  test('should update employee count text when switching languages', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Check English employee count
    const employeeCount = page.locator('[data-testid="employee-count"]');
    await expect(employeeCount).toBeVisible();
    const englishText = await employeeCount.textContent();
    expect(englishText).toContain('employee');

    // Switch to Spanish
    const languageSelect = page.locator('[role="combobox"]').first();
    await languageSelect.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: /Español|Spanish/i }).click();
    await page.waitForTimeout(500);

    // Check Spanish employee count
    const spanishText = await employeeCount.textContent();
    expect(spanishText).toContain('empleado');
  });
});
