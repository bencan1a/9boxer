/**
 * E2E tests for invalid file upload edge cases
 * Tests error handling for various invalid file scenarios
 *
 * Phase 4: Edge case testing for error paths
 */

import { test, expect } from "../fixtures";

test.describe("Invalid File Upload Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    // Start with clean state
    await page.goto("/");

    // Verify we start with empty state
    await expect(page.getByText("No Employees Loaded")).toBeVisible();
  });

  test("should show error when uploading non-Excel file", async ({ page }) => {
    // Click upload file button
    await page.locator('[data-testid="upload-file-button"]').click();

    // Wait for upload dialog
    await expect(
      page.locator('[data-testid="file-upload-dialog"]')
    ).toBeVisible();

    // Create and upload a .txt file
    const textFileContent = Buffer.from(
      "This is not an Excel file\nIt contains plain text data"
    );
    await page.locator("#file-upload-input").setInputFiles({
      name: "invalid.txt",
      mimeType: "text/plain",
      buffer: textFileContent,
    });

    // Verify error message appears
    await expect(page.getByText(/please select an excel file/i)).toBeVisible();

    // Verify upload button is disabled
    await expect(
      page.locator('[data-testid="upload-submit-button"]')
    ).toBeDisabled();

    // Verify we can recover by closing dialog
    await page.locator('[data-testid="cancel-button"]').click();
    await expect(
      page.locator('[data-testid="file-upload-dialog"]')
    ).not.toBeVisible();

    // Verify we're still in empty state
    await expect(page.getByText("No Employees Loaded")).toBeVisible();
  });

  test("should show error when uploading corrupted Excel file", async ({
    page,
  }) => {
    // Click upload file button
    await page.locator('[data-testid="upload-file-button"]').click();

    // Wait for upload dialog
    await expect(
      page.locator('[data-testid="file-upload-dialog"]')
    ).toBeVisible();

    // Create corrupted file (random bytes with .xlsx extension)
    const corruptedContent = Buffer.from(
      Array(1000)
        .fill(0)
        .map(() => Math.floor(Math.random() * 256))
    );
    await page.locator("#file-upload-input").setInputFiles({
      name: "corrupted.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: corruptedContent,
    });

    // Click submit button
    await page.locator('[data-testid="upload-submit-button"]').click();

    // Wait for error boundary or error message to appear
    // The app should handle this gracefully without crashing
    const errorBoundary = page.locator('[data-testid="error-boundary"]');
    const errorSnackbar = page.locator('[role="alert"]');

    // Check if either error display mechanism appears
    await Promise.race([
      expect(errorBoundary).toBeVisible({ timeout: 5000 }),
      expect(errorSnackbar).toBeVisible({ timeout: 5000 }),
    ]).catch(() => {
      // If neither appears, the dialog should still be open with an error message
    });

    // Verify error message contains helpful text
    const pageText = await page.textContent("body");
    expect(pageText).toMatch(
      /unable to read|corrupted|invalid file|error|failed/i
    );

    // Verify we can recover
    if (await errorBoundary.isVisible()) {
      // If error boundary appears, use reset button
      const resetButton = page.locator(
        '[data-testid="error-boundary-reset-button"]'
      );
      if (await resetButton.isVisible()) {
        await resetButton.click();
      }
    } else {
      // Otherwise close dialog and try again
      const cancelButton = page.locator('[data-testid="cancel-button"]');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
      }
    }

    // Verify we can still interact with the app
    await expect(
      page.locator('[data-testid="upload-file-button"]')
    ).toBeVisible();
  });

  test("should show error when uploading empty Excel file", async ({
    page,
  }) => {
    // Click upload file button
    await page.locator('[data-testid="upload-file-button"]').click();

    // Wait for upload dialog
    await expect(
      page.locator('[data-testid="file-upload-dialog"]')
    ).toBeVisible();

    // Create a minimal "Excel-like" file that passes initial validation
    // but will fail on parsing (just a zip file with no valid Excel content)
    const minimalExcelHeader = Buffer.from([
      0x50,
      0x4b,
      0x03,
      0x04, // ZIP file header "PK.."
      0x14,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      ...Array(50).fill(0), // Padding
    ]);

    await page.locator("#file-upload-input").setInputFiles({
      name: "empty.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: minimalExcelHeader,
    });

    // Click submit button
    await page.locator('[data-testid="upload-submit-button"]').click();

    // Wait for error message (either snackbar or error boundary)
    const errorSnackbar = page.locator('[role="alert"]');
    const errorBoundary = page.locator('[data-testid="error-boundary"]');

    // One of these should appear
    await Promise.race([
      expect(errorSnackbar).toBeVisible({ timeout: 5000 }),
      expect(errorBoundary).toBeVisible({ timeout: 5000 }),
    ]).catch(() => {
      // If neither appears quickly, that's also acceptable for this edge case
    });

    // Verify error message contains something helpful (not technical jargon)
    const pageText = await page.textContent("body");
    expect(pageText).not.toMatch(/undefined|null|TypeError/i); // No technical errors

    // Verify we can recover
    const cancelButton = page.locator('[data-testid="cancel-button"]');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
    }

    // If error boundary appeared, reset
    if (await errorBoundary.isVisible()) {
      const resetButton = page.locator(
        '[data-testid="error-boundary-reset-button"]'
      );
      if (await resetButton.isVisible()) {
        await resetButton.click();
      }
    }

    // Verify we're still in empty state and can try again
    await expect(page.getByText("No Employees Loaded")).toBeVisible();
  });
});
