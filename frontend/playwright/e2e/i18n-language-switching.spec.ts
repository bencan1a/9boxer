/**
 * E2E tests for i18n language switching functionality
 * Tests the language selector component and UI translation updates
 */

import { test, expect } from '@playwright/test';
import { waitForUiSettle } from '../helpers';

test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Visit the application and wait for it to load
    await page.goto('/');
    await waitForUiSettle(page);
  });

  test('should default to English language on empty state', async ({ page }) => {
    // Verify empty state is visible (indicates app loaded)
    await expect(page.getByText('No File Loaded')).toBeVisible();

    // Verify English UI elements are visible
    await expect(page.getByText('Help')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();

    // Check language selector shows English
    const languageSelector = page.locator('.MuiSelect-select').first();
    await expect(languageSelector).toContainText('English');

    // Verify localStorage has English set (or is empty, defaulting to English)
    const storedLanguage = await page.evaluate(() => {
      return localStorage.getItem('9boxer-language');
    });
    expect(storedLanguage === null || storedLanguage === 'en').toBe(true);
  });

  test('should switch to Spanish and update UI text', async ({ page }) => {
    // Verify we start in English
    await expect(page.getByText('No File Loaded')).toBeVisible();

    // Find language selector dropdown (MUI Select component)
    const languageSelector = page.locator('.MuiSelect-select').first();
    await expect(languageSelector).toBeVisible();
    await expect(languageSelector).toContainText('English');

    // Click to open language selector
    await languageSelector.click();
    await page.waitForTimeout(300); // Wait for MUI menu animation

    // Select Spanish from dropdown
    await page.getByRole('option', { name: 'Español' }).click();
    await waitForUiSettle(page, 1.0); // Wait for language change and re-render

    // Verify UI updates to Spanish
    await expect(page.getByText('Ayuda')).toBeVisible();
    await expect(page.getByText('Configuración')).toBeVisible();

    // Verify language selector shows Spanish
    const updatedSelector = page.locator('.MuiSelect-select').first();
    await expect(updatedSelector).toContainText('Español');

    // Verify localStorage persists the language preference
    const storedLanguage = await page.evaluate(() => {
      return localStorage.getItem('9boxer-language');
    });
    expect(storedLanguage).toBe('es');
  });

  test('should switch back to English from Spanish', async ({ page }) => {
    // First switch to Spanish
    const languageSelector = page.locator('.MuiSelect-select').first();
    await languageSelector.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Español' }).click();
    await waitForUiSettle(page, 1.0);

    // Verify we're in Spanish
    await expect(page.getByText('Ayuda')).toBeVisible();

    // Switch back to English
    const spanishSelector = page.locator('.MuiSelect-select').first();
    await spanishSelector.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'English' }).click();
    await waitForUiSettle(page, 1.0);

    // Verify UI updates back to English
    await expect(page.getByText('Help')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();

    // Verify language selector shows English
    const updatedSelector = page.locator('.MuiSelect-select').first();
    await expect(updatedSelector).toContainText('English');

    // Verify localStorage updated
    const storedLanguage = await page.evaluate(() => {
      return localStorage.getItem('9boxer-language');
    });
    expect(storedLanguage).toBe('en');
  });

  test('should persist language preference across page reload', async ({ page }) => {
    // Switch to Spanish
    const languageSelector = page.locator('.MuiSelect-select').first();
    await languageSelector.click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Español' }).click();
    await waitForUiSettle(page, 1.0);

    // Verify Spanish is active
    await expect(page.getByText('Ayuda')).toBeVisible();

    // Reload the page
    await page.reload();
    await waitForUiSettle(page, 1.0);

    // Verify Spanish is still active after reload
    await expect(page.getByText('Ayuda')).toBeVisible();
    await expect(page.getByText('Configuración')).toBeVisible();

    // Verify language selector still shows Spanish
    const reloadedSelector = page.locator('.MuiSelect-select').first();
    await expect(reloadedSelector).toContainText('Español');
  });
});
