/**
 * Test 8: Empty State UI Tests
 *
 * Tests the empty state UI that appears when no data is loaded.
 * Verifies that the Load Sample and Upload buttons are visible and functional.
 *
 * Test Coverage:
 * - 8.1: Empty state shows Load Sample button
 * - 8.2: Empty state shows Upload button
 * - 8.3: Empty state disappears after data loaded
 */

import { test, expect } from "../fixtures";
import { loadSampleData } from "../helpers";

test.describe("Empty State UI Tests", () => {
  /**
   * Test 8.1 - Empty state shows Load Sample button
   *
   * Success Criteria:
   * ✅ Empty state heading is visible
   * ✅ "Load Sample Data" button is visible and enabled
   * ✅ Button has correct label text
   */
  test("8.1 - should show Load Sample Data button in empty state", async ({
    page,
  }) => {
    // Arrange: Navigate to app with no data loaded
    await page.goto("/");

    // Assert: Verify empty state heading visible
    const emptyStateHeading = page.getByRole("heading", {
      name: /no employees loaded/i,
    });
    await expect(emptyStateHeading).toBeVisible({ timeout: 3000 });

    // Assert: Verify Load Sample Data button visible
    const loadSampleButton = page.locator(
      '[data-testid="load-sample-data-button"]'
    );
    await expect(loadSampleButton).toBeVisible();

    // Assert: Verify button is enabled
    await expect(loadSampleButton).toBeEnabled();

    // Assert: Verify button has correct text (200 employees)
    await expect(loadSampleButton).toContainText(/load sample data/i);
    await expect(loadSampleButton).toContainText(/200/i);
  });

  /**
   * Test 8.2 - Empty state shows Upload button
   *
   * Success Criteria:
   * ✅ "Upload File" button is visible and enabled
   * ✅ Clicking button opens file upload dialog
   */
  test("8.2 - should show Upload File button in empty state", async ({
    page,
  }) => {
    // Arrange: Navigate to app with no data loaded
    await page.goto("/");

    // Assert: Verify Upload File button visible
    const uploadButton = page.locator('[data-testid="upload-file-button"]');
    await expect(uploadButton).toBeVisible({ timeout: 3000 });

    // Assert: Verify button is enabled
    await expect(uploadButton).toBeEnabled();

    // Act: Click upload button
    await uploadButton.click();

    // Assert: Verify file upload dialog opens
    const uploadDialog = page.locator('[data-testid="file-upload-dialog"]');
    await expect(uploadDialog).toBeVisible({ timeout: 3000 });

    // Cleanup: Close dialog
    await page.keyboard.press("Escape");
  });

  /**
   * Test 8.3 - Empty state disappears after data loaded
   *
   * Success Criteria:
   * ✅ Empty state is visible initially
   * ✅ After loading data, empty state is NOT visible
   * ✅ Grid becomes visible after loading data
   */
  test("8.3 - should hide empty state after loading data", async ({ page }) => {
    // Arrange: Navigate to app with no data loaded
    await page.goto("/");

    // Assert: Verify empty state is visible initially
    const emptyStateHeading = page.getByRole("heading", {
      name: /no employees loaded/i,
    });
    await expect(emptyStateHeading).toBeVisible({ timeout: 3000 });

    // Act: Load sample data
    await loadSampleData(page);

    // Assert: Verify empty state is NOT visible
    await expect(emptyStateHeading).not.toBeVisible({ timeout: 3000 });

    // Assert: Verify grid IS visible
    const grid = page.locator('[data-testid="nine-box-grid"]');
    await expect(grid).toBeVisible();

    // Assert: Verify employee cards are visible
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    await expect(employeeCards.first()).toBeVisible();
  });
});
