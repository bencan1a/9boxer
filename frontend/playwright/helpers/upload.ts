import { Page, expect } from '@playwright/test';
import * as path from 'path';

/**
 * Upload an Excel file through the file upload dialog
 *
 * This helper replicates the Cypress `cy.uploadExcelFile()` custom command.
 * It handles the complete upload flow:
 * 1. Clicks the upload button in the app bar
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
export async function uploadExcelFile(page: Page, fileName: string): Promise<void> {
  // Click the upload button in the app bar
  await page.locator('[data-testid="upload-button"]').click();

  // Wait for the dialog to open
  await expect(page.locator('[data-testid="file-upload-dialog"]')).toBeVisible();

  // Construct the path to the fixture file
  const fixturePath = path.join(__dirname, '..', 'fixtures', fileName);

  // Select the file using the file input
  await page.locator('#file-upload-input').setInputFiles(fixturePath);

  // Click the upload button in the dialog
  await page.locator('[data-testid="upload-submit-button"]').click();

  // Wait for upload to complete (dialog should close)
  await expect(page.locator('[data-testid="file-upload-dialog"]')).not.toBeVisible({ timeout: 10000 });
}
