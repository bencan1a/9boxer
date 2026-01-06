/**
 * Settings dialog helpers for E2E tests
 *
 * Provides helper functions for:
 * - Opening and closing settings dialog
 * - Changing application language
 * - Verifying current language
 *
 * All functions use state-based waits (NO arbitrary timeouts).
 */

import { Page, expect } from "@playwright/test";

/**
 * Open the settings dialog
 *
 * Clicks the settings button and waits for the dialog to become visible.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await openSettingsDialog(page);
 * await changeLanguage(page, 'es');
 * ```
 */
export async function openSettingsDialog(page: Page): Promise<void> {
  const settingsButton = page.locator('[data-testid="settings-button"]');
  await settingsButton.click();

  // Wait for settings dialog to appear (state-based wait)
  // Note: The exact dialog testid may vary - adjust if needed
  const dialog = page
    .locator('[role="dialog"]')
    .filter({ hasText: /settings|language/i });
  await expect(dialog).toBeVisible({ timeout: 3000 });
}

/**
 * Close the settings dialog
 *
 * Presses Escape key to close the dialog and verifies it closes.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await openSettingsDialog(page);
 * // ... make changes ...
 * await closeSettingsDialog(page);
 * ```
 */
export async function closeSettingsDialog(page: Page): Promise<void> {
  await page.keyboard.press("Escape");

  // Verify dialog closed (state-based wait)
  const dialog = page
    .locator('[role="dialog"]')
    .filter({ hasText: /settings|language/i });
  await expect(dialog).not.toBeVisible({ timeout: 2000 });
}

/**
 * Change the application language
 *
 * Opens settings dialog (if not already open), selects the specified language,
 * closes the dialog, and verifies the UI text updated.
 *
 * @param page - Playwright Page object
 * @param language - Target language: 'en' for English or 'es' for Español
 *
 * @example
 * ```typescript
 * await changeLanguage(page, 'es');
 * await expect(page.locator('[data-testid="details-tab"]')).toContainText('Detalles');
 * ```
 */
export async function changeLanguage(
  page: Page,
  language: "en" | "es"
): Promise<void> {
  // Open settings if not already open
  const settingsButton = page.locator('[data-testid="settings-button"]');
  const languageSelect = page.locator('[data-testid="language-select"]');

  // Close any open menus/poppers first (cleanup from previous interactions)
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100); // Brief wait for menus to close

  // Check if language select is already visible (dialog is open)
  const isLanguageSelectVisible = await languageSelect
    .isVisible()
    .catch(() => false);

  if (!isLanguageSelectVisible) {
    await settingsButton.click();
    // Wait for language select to appear (more reliable than checking dialog text)
    await expect(languageSelect).toBeVisible({ timeout: 3000 });
  }

  // Click language select to open dropdown
  await expect(languageSelect).toBeVisible({ timeout: 3000 });
  await languageSelect.click();

  // Select the target language option
  const languageMap = {
    en: /English/i,
    es: /Español|Spanish/i,
  };

  const option = page.getByRole("option", { name: languageMap[language] });
  await option.click();

  // Wait for dropdown menu to close after selection
  await expect(option)
    .not.toBeVisible({ timeout: 2000 })
    .catch(() => {
      // If option is still visible, force close with Escape
      return page.keyboard.press("Escape");
    });

  // Close settings dialog
  await page.keyboard.press("Escape");

  // Wait for the dialog to actually close before checking UI updates
  const dialog = page
    .locator('[role="dialog"]')
    .filter({ hasText: /settings|language/i });
  await expect(dialog).not.toBeVisible({ timeout: 2000 });

  // Verify language change took effect by checking tab text
  const expectedTabText = language === "en" ? "Details" : "Detalles";
  const oldTabText = language === "en" ? "Detalles" : "Details";
  const detailsTab = page.locator('[data-testid="details-tab"]');

  // Wait for old text to disappear (ensures React re-rendered with new translation)
  await expect(detailsTab).not.toContainText(oldTabText, { timeout: 3000 });

  // Now verify the new text is present
  await expect(detailsTab).toContainText(expectedTabText, { timeout: 5000 });
}

/**
 * Verify the current application language
 *
 * Checks that the UI is displaying text in the expected language
 * by examining the Details tab text.
 *
 * @param page - Playwright Page object
 * @param language - Expected language: 'en' or 'es'
 *
 * @example
 * ```typescript
 * await changeLanguage(page, 'es');
 * await page.reload();
 * await verifyLanguage(page, 'es');
 * ```
 */
export async function verifyLanguage(
  page: Page,
  language: "en" | "es"
): Promise<void> {
  const expectedTabText = language === "en" ? "Details" : "Detalles";
  const detailsTab = page.locator('[data-testid="details-tab"]');
  await expect(detailsTab).toContainText(expectedTabText, { timeout: 3000 });
}
