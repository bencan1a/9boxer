/**
 * E2E tests for export functionality
 * Tests exporting modified employee data to Excel
 *
 * Converted from Cypress test: cypress/e2e/export-flow.cy.ts
 */

import { test, expect } from "../fixtures";
import { loadSampleData, dragEmployeeToPosition } from "../helpers";

test.describe("Export Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Visit and load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should hide export menu item when no modifications have been made", async ({
    page,
  }) => {
    // File menu badge should not be visible when no changes
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    const badgePill = fileMenuBadge.locator(".MuiBadge-badge");
    await expect(badgePill).toHaveClass(/MuiBadge-invisible/);

    // Open file menu
    await page.locator('[data-testid="file-menu-button"]').click();

    // Export menu item should be hidden when no changes (new UX behavior)
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItem).not.toBeVisible();

    // Close menu
    await page.keyboard.press("Escape");
  });

  test("should show file menu badge and export item when modifications exist", async ({
    page,
  }) => {
    // File menu badge should not be visible initially
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    const badgePill = fileMenuBadge.locator(".MuiBadge-badge");
    await expect(badgePill).toHaveClass(/MuiBadge-invisible/);

    // Make a modification: move an employee
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const firstEmployee = gridBox9
      .locator('[data-testid^="employee-card-"]')
      .first();
    const employeeId = await firstEmployee.getAttribute("data-testid");
    const id = parseInt(employeeId?.replace("employee-card-", "") || "0");

    // Drag employee to a different position using proper helper
    await dragEmployeeToPosition(page, id, 6);

    // File menu badge should now be visible
    await expect(badgePill).not.toHaveClass(/MuiBadge-invisible/);
    await expect(badgePill).toContainText("1");

    // Open file menu and verify export menu item is now visible
    await page.locator('[data-testid="file-menu-button"]').click();
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItem).toBeVisible();
    await expect(exportMenuItem).toBeEnabled();
    await expect(exportMenuItem).toContainText("Apply 1 Change");

    // Close menu
    await page.keyboard.press("Escape");
  });
});
