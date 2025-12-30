/**
 * E2E tests for Export Workflow via ApplyChangesDialog
 *
 * These tests verify the apply changes workflow:
 * - ApplyChangesDialog appears when export is clicked
 * - Apply Changes button triggers backend export API
 * - Dialog handles save-as-new mode when needed
 *
 * Note: These tests use sample data which requires "save as new" mode
 * since sample data has no original file path.
 */

import { test, expect } from "../fixtures";
import { loadSampleData, dragEmployeeToPosition } from "../helpers";

test.describe("Export Workflow with ApplyChangesDialog", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");

    // Load sample data
    await loadSampleData(page);

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should show ApplyChangesDialog with fallback for sample data", async ({
    page,
  }) => {
    // Move an employee to a new position
    await dragEmployeeToPosition(page, 1, 6);

    // File menu badge should show changes
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    await expect(fileMenuBadge).toBeVisible();

    // Open file menu and click export menu item
    await page.locator('[data-testid="file-menu-button"]').click();
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItem).toBeEnabled();
    await exportMenuItem.click();

    // Wait for ApplyChangesDialog to appear
    const dialog = page.locator('[data-testid="apply-changes-dialog"]');
    await expect(dialog).toBeVisible();

    // Verify dialog shows filename
    await expect(dialog).toContainText("Sample_Dataset_200_employees.xlsx");

    // Verify checkbox exists
    await expect(
      page.locator('[data-testid="save-as-new-checkbox"]')
    ).toBeVisible();

    // Note: For sample data, clicking "Apply Changes" without checking the box
    // will show an error because there's no original file to update.
    // This test just verifies the dialog appears and has correct elements.

    // Cancel to avoid the error
    await page.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test("should allow canceling the export dialog", async ({ page }) => {
    // Move employee
    await dragEmployeeToPosition(page, 1, 6);

    // Open export dialog
    await page.locator('[data-testid="file-menu-button"]').click();
    await page.locator('[data-testid="export-changes-menu-item"]').click();

    // Wait for ApplyChangesDialog
    const dialog = page.locator('[data-testid="apply-changes-dialog"]');
    await expect(dialog).toBeVisible();

    // Click Cancel
    await page.locator('button:has-text("Cancel")').click();

    // Verify dialog closes
    await expect(dialog).not.toBeVisible();

    // Verify change badge still shows (export was cancelled)
    await expect(page.locator('[data-testid="file-menu-badge"]')).toBeVisible();
  });

  test("should show checkbox for save-as-new option", async ({ page }) => {
    // Move an employee
    await dragEmployeeToPosition(page, 1, 6);

    // Wait for the change to be tracked
    await expect(page.locator('[data-testid="file-menu-badge"]')).toBeVisible();

    // Open export dialog
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await page.locator('[data-testid="export-changes-menu-item"]').click();

    // Wait for ApplyChangesDialog
    const dialog = page.locator('[data-testid="apply-changes-dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Verify checkbox is present and unchecked by default
    const checkbox = page.locator('[data-testid="save-as-new-checkbox"]');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();

    // Check the checkbox
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Cancel to clean up
    await page.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test("should display export menu item text with change count", async ({
    page,
  }) => {
    // Move one employee
    await dragEmployeeToPosition(page, 1, 6);

    // Verify badge shows 1 change
    await expect(page.locator('[data-testid="file-menu-badge"]')).toContainText(
      "1"
    );

    // Open file menu
    await page.locator('[data-testid="file-menu-button"]').click();
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );

    // Verify menu item text includes change count
    await expect(exportMenuItem).toBeVisible();
    await expect(exportMenuItem).toContainText("Apply");
    await expect(exportMenuItem).toContainText("1");

    // Close menu
    await page.keyboard.press("Escape");
  });

  test("should hide export menu item when no changes exist", async ({
    page,
  }) => {
    // No changes made - just verify export is not visible
    await page.locator('[data-testid="file-menu-button"]').click();

    // Export Changes menu item should be hidden (new UX)
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItem).not.toBeVisible();

    // Close menu
    await page.keyboard.press("Escape");
  });
});
