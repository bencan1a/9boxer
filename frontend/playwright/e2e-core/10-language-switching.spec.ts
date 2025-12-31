/**
 * Test 10: Language Switching Tests
 *
 * Tests application language switching between English and Spanish.
 * Verifies UI text updates and language persistence across reloads.
 *
 * Test Coverage:
 * - 10.1: EN↔ES switching
 * - 10.2: Language persistence across reloads
 */

import { test, expect } from "../fixtures";
import { loadSampleData, changeLanguage, verifyLanguage } from "../helpers";

test.describe("Language Switching Tests", () => {
  /**
   * Test 10.1 - EN↔ES switching
   *
   * Success Criteria:
   * ✅ Can switch from English to Spanish
   * ✅ Tab labels update to Spanish (Detalles, Cambios, Estadísticas, Inteligencia)
   * ✅ Can switch back to English
   * ✅ Tab labels return to English (Details, Changes, Statistics, Intelligence)
   */
  test("10.1 - should switch between English and Spanish", async ({ page }) => {
    // Arrange: Load sample data (in English by default)
    await page.goto("/");
    await loadSampleData(page);

    // Assert: Verify initial language is English
    const detailsTab = page.locator('[data-testid="details-tab"]');
    await expect(detailsTab).toContainText("Details");

    // Act: Switch to Spanish
    await changeLanguage(page, "es");

    // Assert: Verify tab labels updated to Spanish
    await expect(detailsTab).toContainText("Detalles", { timeout: 5000 });

    const changesTab = page.locator('[data-testid="changes-tab"]');
    await expect(changesTab).toContainText("Cambios");

    const statisticsTab = page.locator('[data-testid="statistics-tab"]');
    await expect(statisticsTab).toContainText("Estadísticas");

    const intelligenceTab = page.locator('[data-testid="intelligence-tab"]');
    await expect(intelligenceTab).toContainText("Inteligencia");

    // Act: Switch back to English
    await changeLanguage(page, "en");

    // Assert: Verify tab labels returned to English
    await expect(detailsTab).toContainText("Details", { timeout: 5000 });
    await expect(changesTab).toContainText("Changes");
    await expect(statisticsTab).toContainText("Statistics");
    await expect(intelligenceTab).toContainText("Intelligence");
  });

  /**
   * Test 10.2 - Language persistence across reloads
   *
   * Success Criteria:
   * ✅ Can switch to Spanish
   * ✅ After page reload, language is still Spanish
   * ✅ Tab labels remain in Spanish after reload
   */
  test("10.2 - should persist language selection across page reloads", async ({
    page,
  }) => {
    // Arrange: Load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Act: Switch to Spanish
    await changeLanguage(page, "es");

    // Assert: Verify Spanish is active
    await verifyLanguage(page, "es");

    // Act: Reload page
    await page.reload();

    // Wait for grid to load after reload
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible({
      timeout: 10000,
    });

    // Assert: Verify language is still Spanish after reload
    await verifyLanguage(page, "es");

    // Assert: Verify other tab labels are still in Spanish
    const changesTab = page.locator('[data-testid="changes-tab"]');
    await expect(changesTab).toContainText("Cambios");

    const statisticsTab = page.locator('[data-testid="statistics-tab"]');
    await expect(statisticsTab).toContainText("Estadísticas");
  });
});
