import { Page, expect } from "@playwright/test";
import * as path from "path";

/**
 * Upload an Excel file through the file upload dialog
 *
 * This helper handles the complete upload flow:
 * 1. Opens the upload dialog (via empty state button or FileMenu)
 * 2. Waits for the file upload dialog to appear
 * 3. Selects the specified file from the fixtures directory
 * 4. Clicks the submit button
 * 5. Waits for the dialog to close (indicating successful upload)
 *
 * @param page - Playwright Page object
 * @param fileName - Name of the file in playwright/fixtures/ directory
 * @example
 * await uploadExcelFile(page, 'sample-employees.xlsx');
 */
export async function uploadExcelFile(
  page: Page,
  fileName: string
): Promise<void> {
  // Try to click the empty state import button first (if no file loaded)
  const emptyStateButton = page.locator(
    '[data-testid="empty-state-import-button"]'
  );
  const fileMenuButton = page.locator('[data-testid="file-menu-button"]');

  // Check which button is visible and click it
  const isEmptyState = await emptyStateButton.isVisible().catch(() => false);

  if (isEmptyState) {
    // No file loaded - use empty state button
    await emptyStateButton.click();
  } else {
    // File already loaded - use FileMenu
    await fileMenuButton.click();
    // Wait for menu to open
    await page.waitForTimeout(300);
    // Click Import Data menu item
    await page.locator('[data-testid="import-data-menu-item"]').click();
  }

  // Wait for the dialog to open
  await expect(
    page.locator('[data-testid="file-upload-dialog"]')
  ).toBeVisible();

  // Construct the path to the fixture file
  const fixturePath = path.join(__dirname, "..", "fixtures", fileName);

  // Select the file using the file input
  await page.locator("#file-upload-input").setInputFiles(fixturePath);

  // Click the upload button in the dialog
  await page.locator('[data-testid="upload-submit-button"]').click();

  // Wait for upload to complete (dialog should close)
  await expect(
    page.locator('[data-testid="file-upload-dialog"]')
  ).not.toBeVisible({ timeout: 10000 });
}
