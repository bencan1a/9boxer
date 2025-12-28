/**
 * Language Switching Test Suite
 *
 * Tests internationalization (i18n) functionality including:
 * - Language selector availability in Settings dialog
 * - Switching between English and Spanish via Settings
 * - UI text updates when language changes
 * - Language preference persistence across reloads
 */

import { test, expect } from "../fixtures";
import { uploadExcelFile } from "../helpers";

test.describe("Language Switching", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session and start fresh
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display language selector in settings dialog", async ({
    page,
  }) => {
    // Upload file to get to main interface
    await uploadExcelFile(page, "sample-employees.xlsx");
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Open settings dialog
    await page.locator('[data-testid="settings-button"]').click();

    // Check for language selector in settings dialog
    const languageSelector = page.locator('[data-testid="language-select"]');
    await expect(languageSelector).toBeVisible();

    // Close settings dialog
    await page.keyboard.press("Escape");
  });

  test("should switch from English to Spanish and update UI text", async ({
    page,
  }) => {
    // Upload file to get to main interface
    await uploadExcelFile(page, "sample-employees.xlsx");
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify initial language is English - check for visible English tab text
    await expect(page.locator('[data-testid="details-tab"]')).toContainText(
      "Details"
    );

    // Open settings dialog
    await page.locator('[data-testid="settings-button"]').click();

    // Find and click language selector in settings dialog
    const languageSelect = page.locator('[data-testid="language-select"]');
    await expect(languageSelect).toBeVisible();
    await languageSelect.click();

    // Select Spanish option
    const spanishOption = page.getByRole("option", {
      name: /Español|Spanish/i,
    });
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();

    // Close settings dialog
    await page.keyboard.press("Escape");

    // Wait for language change to complete by checking for Spanish text
    await expect(page.locator('[data-testid="details-tab"]')).toContainText(
      "Detalles",
      { timeout: 5000 }
    );

    // Verify UI text has changed to Spanish
    // Check tab labels
    await expect(page.locator('[data-testid="changes-tab"]')).toContainText(
      "Cambios"
    );
    await expect(page.locator('[data-testid="statistics-tab"]')).toContainText(
      "Estadísticas"
    );
    await expect(
      page.locator('[data-testid="intelligence-tab"]')
    ).toContainText("Inteligencia");

    // Check filter button
    await page.locator('[data-testid="filter-button"]').click();

    // Wait for filter drawer to open by checking for Spanish filter title heading
    await expect(page.getByRole("heading", { name: "Filtros" })).toBeVisible();

    // Check filter sections
    await expect(page.getByText("Niveles de Trabajo")).toBeVisible();
    await expect(page.getByText("Funciones de Trabajo")).toBeVisible();
    await expect(page.getByText("Ubicaciones")).toBeVisible();
    await expect(page.getByText("Gerentes")).toBeVisible();

    // Close filter drawer
    await page.keyboard.press("Escape");

    // Wait for drawer to close
    await expect(
      page.getByRole("heading", { name: "Filtros" })
    ).not.toBeVisible();
  });

  test("should switch from Spanish back to English", async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, "sample-employees.xlsx");
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Open settings dialog and switch to Spanish first
    await page.locator('[data-testid="settings-button"]').click();

    const languageSelect = page.locator('[data-testid="language-select"]');
    await expect(languageSelect).toBeVisible();
    await languageSelect.click();

    const spanishOption = page.getByRole("option", {
      name: /Español|Spanish/i,
    });
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();

    // Close settings dialog
    await page.keyboard.press("Escape");

    // Wait for Spanish to be active
    await expect(page.locator('[data-testid="details-tab"]')).toContainText(
      "Detalles",
      { timeout: 5000 }
    );

    // Open settings dialog again to switch back to English
    await page.locator('[data-testid="settings-button"]').click();
    await languageSelect.click();

    const englishOption = page.getByRole("option", { name: /English|Inglés/i });
    await expect(englishOption).toBeVisible();
    await englishOption.click();

    // Close settings dialog
    await page.keyboard.press("Escape");

    // Wait for English to be active
    await expect(page.locator('[data-testid="details-tab"]')).toContainText(
      "Details",
      { timeout: 5000 }
    );

    // Verify English is back
    await expect(page.locator('[data-testid="changes-tab"]')).toContainText(
      "Changes"
    );
    await expect(page.locator('[data-testid="statistics-tab"]')).toContainText(
      "Statistics"
    );
  });

  test("should persist language preference across page reloads", async ({
    page,
  }) => {
    // Upload file
    await uploadExcelFile(page, "sample-employees.xlsx");
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Open settings dialog and switch to Spanish
    await page.locator('[data-testid="settings-button"]').click();

    const languageSelect = page.locator('[data-testid="language-select"]');
    await expect(languageSelect).toBeVisible();
    await languageSelect.click();

    const spanishOption = page.getByRole("option", {
      name: /Español|Spanish/i,
    });
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();

    // Close settings dialog
    await page.keyboard.press("Escape");

    // Wait for Spanish to be active
    await expect(page.locator('[data-testid="details-tab"]')).toContainText(
      "Detalles",
      { timeout: 5000 }
    );

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify Spanish is still active after reload
    await expect(page.locator('[data-testid="details-tab"]')).toContainText(
      "Detalles",
      { timeout: 5000 }
    );
    await expect(page.locator('[data-testid="changes-tab"]')).toContainText(
      "Cambios"
    );
  });

  test("should update employee count text when switching languages", async ({
    page,
  }) => {
    // Upload file
    await uploadExcelFile(page, "sample-employees.xlsx");
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Check English employee count
    const employeeCount = page.locator('[data-testid="employee-count"]');
    await expect(employeeCount).toBeVisible();
    const englishText = await employeeCount.textContent();
    expect(englishText).toContain("employee");

    // Open settings dialog and switch to Spanish
    await page.locator('[data-testid="settings-button"]').click();

    const languageSelect = page.locator('[data-testid="language-select"]');
    await expect(languageSelect).toBeVisible();
    await languageSelect.click();

    const spanishOption = page.getByRole("option", {
      name: /Español|Spanish/i,
    });
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();

    // Close settings dialog
    await page.keyboard.press("Escape");

    // Wait for Spanish text to appear in employee count
    await expect(employeeCount).toContainText(/empleado/, { timeout: 5000 });

    // Verify Spanish employee count text
    const spanishText = await employeeCount.textContent();
    expect(spanishText).toContain("empleado");
  });
});
