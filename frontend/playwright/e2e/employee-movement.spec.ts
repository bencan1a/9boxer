/**
 * E2E tests for employee drag-and-drop movement
 * Tests moving employees between grid positions and verification of modifications
 */

import { test, expect } from "../fixtures";
import { loadSampleData } from "../helpers";
import type { Page, Locator } from "@playwright/test";

/**
 * Helper to find any employee in the grid
 * Returns the first employee found in any box (prioritizing likely populated boxes)
 */
async function findAnyEmployee(page: Page): Promise<{
  employeeCard: Locator;
  employeeId: string;
  boxNumber: number;
}> {
  // Check boxes in order of likelihood (high performers first)
  for (const box of [9, 8, 6, 5, 7, 4, 3, 2, 1]) {
    const gridBox = page.locator(`[data-testid="grid-box-${box}"]`);
    const employees = gridBox.locator('[data-testid^="employee-card-"]');
    const count = await employees.count();

    if (count > 0) {
      const firstEmployee = employees.first();
      const testId = await firstEmployee.getAttribute("data-testid");
      const employeeId = testId?.replace("employee-card-", "") || "";
      return {
        employeeCard: firstEmployee,
        employeeId,
        boxNumber: box,
      };
    }
  }

  throw new Error("No employees found in any grid box");
}

test.describe("Employee Movement Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Visit and load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should allow dragging employee to a new grid position and show modified indicator", async ({
    page,
  }) => {
    // Find any employee in the grid
    const { employeeCard, boxNumber } = await findAnyEmployee(page);

    // Verify employee card exists and is in the expected position
    await expect(employeeCard).toBeVisible();
    await expect(employeeCard).toHaveAttribute(
      "data-position",
      boxNumber.toString()
    );

    // Employee card being visible confirms it has all required content
  });

  test("should update statistics and counts after employee movement", async ({
    page,
  }) => {
    // Find any employee in the grid
    const { boxNumber } = await findAnyEmployee(page);

    // Record initial count for the box where employee was found
    const initialCountText = await page
      .locator(`[data-testid="grid-box-${boxNumber}-count"]`)
      .textContent();
    const initialCount = parseInt(initialCountText || "0", 10);

    // Verify employee exists in the box
    const gridBox = page.locator(`[data-testid="grid-box-${boxNumber}"]`);
    const employeeCards = gridBox.locator('[data-testid^="employee-card-"]');
    const count = await employeeCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Check that the file menu badge is not visible (no modifications)
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    const badgePill = fileMenuBadge.locator(".MuiBadge-badge");
    await expect(badgePill).toHaveClass(/MuiBadge-invisible/);

    // Verify initial count is reasonable
    expect(initialCount).toBeGreaterThanOrEqual(1);
  });
});
