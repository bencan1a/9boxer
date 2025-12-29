/**
 * E2E tests for drag-and-drop with visual feedback
 * Tests visual indicators and state changes during employee movement
 */

import { test, expect } from "../fixtures";
import { loadSampleData, dragEmployeeToPosition } from "../helpers";
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

test.describe("Drag-and-Drop Visual Feedback Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Load sample data
    await loadSampleData(page);

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should move employee and show visual feedback", async ({ page }) => {
    // Find any employee in the grid
    const { employeeCard, employeeId, boxNumber } = await findAnyEmployee(page);

    // Verify employee is visible in their current position
    await expect(employeeCard).toBeVisible();
    await expect(employeeCard).toHaveAttribute(
      "data-position",
      boxNumber.toString()
    );

    // Note: Modified indicator chip was removed - modified state is now shown via border styling only

    // Choose a target box different from current position
    const targetBox = boxNumber === 6 ? 3 : 6;

    // Get initial counts for source and target boxes
    const sourceCountBefore = page.locator(
      `[data-testid="grid-box-${boxNumber}-count"]`
    );
    const sourceInitialCount = await sourceCountBefore.textContent();

    const targetCountBefore = page.locator(
      `[data-testid="grid-box-${targetBox}-count"]`
    );
    const targetInitialCount = await targetCountBefore.textContent();

    // Move employee to target box
    await dragEmployeeToPosition(page, parseInt(employeeId), targetBox);

    // Re-find employee by ID after drag (locator is scoped to original box)
    const movedCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );

    // Verify employee now appears in target box
    await expect(movedCard).toHaveAttribute(
      "data-position",
      targetBox.toString()
    );

    // Note: Modified state is shown via border styling, not a testable indicator element
    // Visual feedback is verified through border changes (tested in visual regression tests)

    // Verify box counts changed
    const sourceCountAfter = page.locator(
      `[data-testid="grid-box-${boxNumber}-count"]`
    );
    const targetCountAfter = page.locator(
      `[data-testid="grid-box-${targetBox}-count"]`
    );

    // Source box should have decreased by 1
    const sourceFinalCount = await sourceCountAfter.textContent();
    expect(parseInt(sourceFinalCount || "0")).toBe(
      parseInt(sourceInitialCount || "0") - 1
    );

    // Target box should have increased by 1
    const targetFinalCount = await targetCountAfter.textContent();
    expect(parseInt(targetFinalCount || "0")).toBe(
      parseInt(targetInitialCount || "0") + 1
    );
  });

  test("should enable export button and show badge after movement", async ({
    page,
  }) => {
    // Verify file menu badge is not visible initially (no changes)
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    // Badge should be invisible initially (no changes)
    // Check the MUI Badge content element (the pill)
    const badgePill = fileMenuBadge.locator(".MuiBadge-badge");
    await expect(badgePill).toHaveClass(/MuiBadge-invisible/);

    // Verify export menu item is hidden when no changes
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    const exportMenuItemBefore = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItemBefore).not.toBeVisible();
    await page.keyboard.press("Escape");

    // Find any employee and move them
    const { employeeId, boxNumber } = await findAnyEmployee(page);
    const targetBox = boxNumber === 6 ? 3 : 6;
    await dragEmployeeToPosition(page, parseInt(employeeId), targetBox);

    // Verify file menu badge becomes visible (showing 1 change)
    await expect(badgePill).not.toHaveClass(/MuiBadge-invisible/);
    await expect(fileMenuBadge).toContainText("1");

    // Open file menu and verify export menu item is now visible and enabled
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    const exportMenuItemAfterDrag = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItemAfterDrag).toBeVisible();
    await expect(exportMenuItemAfterDrag).toBeEnabled();
    await expect(exportMenuItemAfterDrag).toContainText("Apply 1 Change");

    // Close menu
    await page.keyboard.press("Escape");
  });

  test("should remove visual indicators when employee is moved back to original position", async ({
    page,
  }) => {
    // Find any employee and record their original position
    const { employeeCard, employeeId, boxNumber } = await findAnyEmployee(page);
    const originalBox = boxNumber;
    const targetBox = boxNumber === 6 ? 3 : 6;

    // Move employee to target box
    await dragEmployeeToPosition(page, parseInt(employeeId), targetBox);

    // Note: Modified indicator chip no longer exists - state is shown via border styling only

    // Wait for network to be idle for consecutive drags
    await page.waitForLoadState("networkidle");

    // Move employee back to original position - skip API wait and don't expect modified indicator
    await dragEmployeeToPosition(page, parseInt(employeeId), originalBox, {
      skipApiWait: true,
      expectModified: false,
    });

    // Re-find employee by ID after second drag (locator is scoped to intermediate box)
    const movedBackCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );

    // Verify employee is back in original box
    await expect(movedBackCard).toHaveAttribute(
      "data-position",
      originalBox.toString()
    );

    // Note: Modified state is no longer visible via indicator chip (removed)
    // The border styling also returns to normal (tested in visual regression tests)

    // Verify file menu badge is no longer visible (no changes)
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    // Badge should be invisible again (no changes)
    // Check the MUI Badge content element (the pill)
    const badgePill = fileMenuBadge.locator(".MuiBadge-badge");
    await expect(badgePill).toHaveClass(/MuiBadge-invisible/);

    // Verify export menu item is hidden when no changes (conditionally rendered)
    await page.locator('[data-testid="file-menu-button"]').click();
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItem).not.toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("should show visual feedback during drag operation", async ({
    page,
  }) => {
    // Find any employee in the grid
    const { employeeCard, boxNumber } = await findAnyEmployee(page);
    await expect(employeeCard).toBeVisible();

    // Get initial opacity
    const initialOpacity = await employeeCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.opacity;
    });
    expect(parseFloat(initialOpacity)).toBe(1);

    // Start dragging (move to card and mouse down)
    const cardBox = await employeeCard.boundingBox();
    if (!cardBox) {
      throw new Error("Employee card not found");
    }

    // Get target box (choose different from current box)
    const targetBoxNumber = boxNumber === 6 ? 3 : 6;
    const targetBox = page.locator(
      `[data-testid="grid-box-${targetBoxNumber}"]`
    );
    const targetBoxBounds = await targetBox.boundingBox();
    if (!targetBoxBounds) {
      throw new Error("Target box not found");
    }

    // Calculate positions
    const startX = cardBox.x + cardBox.width / 2;
    const startY = cardBox.y + cardBox.height / 2;
    const endX = targetBoxBounds.x + targetBoxBounds.width / 2;
    const endY = targetBoxBounds.y + targetBoxBounds.height / 2;

    // Move to drag handle area (left side)
    await page.mouse.move(cardBox.x + 12, startY);
    await page.mouse.down();

    // Check opacity changed during drag (should be 0.5 per EmployeeTile.tsx)
    const dragOpacity = await employeeCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.opacity;
    });
    expect(parseFloat(dragOpacity)).toBe(0.5);

    // Move to target in steps (more realistic and triggers dnd-kit properly)
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      const y = startY + (endY - startY) * (i / steps);
      await page.mouse.move(x, y);
    }

    // Check target box shows drag-over state (border should change)
    const targetBoxElement = targetBox;
    const borderColor = await targetBoxElement.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.borderColor;
    });
    // Border should be primary color when dragging over
    expect(borderColor).not.toBe("rgba(0, 0, 0, 0.12)"); // Not default divider color

    // Drop
    await page.mouse.up();

    // Verify opacity returns to normal after drop (auto-retrying)
    const finalOpacity = await employeeCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.opacity;
    });
    expect(parseFloat(finalOpacity)).toBe(1);
  });
});
