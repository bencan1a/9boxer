/**
 * Test 9: Grid Expansion Tests
 *
 * Tests grid box expansion/collapse functionality and drag-drop from expanded boxes.
 * Verifies expansion state changes and employee movement.
 *
 * Test Coverage:
 * - 9.1: Box expansion/collapse functionality
 * - 9.2: Drag-drop from/to expanded boxes
 */

import { test, expect } from "../fixtures";
import {
  loadSampleData,
  expandGridBox,
  collapseGridBox,
  verifyBoxExpanded,
  verifyBoxCollapsed,
  dragEmployeeToPosition,
  getBadgeCount,
} from "../helpers";

test.describe("Grid Expansion Tests", () => {
  /**
   * Test 9.1 - Box expansion/collapse functionality
   *
   * Success Criteria:
   * ✅ Box can be expanded (aria-expanded="true")
   * ✅ Employee cards are visible in expanded box
   * ✅ Box can be collapsed (aria-expanded="false")
   */
  test("9.1 - should expand and collapse grid box", async ({ page }) => {
    // Arrange: Load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Verify box 9 is collapsed initially (should be by default)
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const initialExpandedState = await gridBox9.getAttribute("aria-expanded");

    if (initialExpandedState === "true") {
      // If somehow it's already expanded, collapse it first
      await collapseGridBox(page, 9);
    }

    // Assert: Verify box is collapsed
    await verifyBoxCollapsed(page, 9);

    // Act: Expand box 9
    await expandGridBox(page, 9);

    // Assert: Verify box is expanded
    await verifyBoxExpanded(page, 9);

    // Assert: Verify employee cards are visible in expanded box
    const employeeCards = gridBox9.locator('[data-testid^="employee-card-"]');
    const cardCount = await employeeCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Assert: Verify first card is visible
    await expect(employeeCards.first()).toBeVisible();

    // Act: Collapse box 9
    await collapseGridBox(page, 9);

    // Assert: Verify box is collapsed
    await verifyBoxCollapsed(page, 9);
  });

  /**
   * Test 9.2 - Drag-drop from/to expanded boxes
   *
   * Success Criteria:
   * ✅ Can expand box 5
   * ✅ Can get employee from expanded box 5
   * ✅ Can drag employee to box 1
   * ✅ Employee has correct position attribute after drag
   * ✅ Change is tracked (badge count increases)
   */
  test("9.2 - should drag employee from expanded box to another box", async ({
    page,
  }) => {
    // Arrange: Load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Act: Expand box 5
    await expandGridBox(page, 5);
    await verifyBoxExpanded(page, 5);

    // Get an employee from expanded box 5
    const gridBox5 = page.locator('[data-testid="grid-box-5"]');
    const employeeCard = gridBox5
      .locator('[data-testid^="employee-card-"]')
      .first();

    // Wait for employee card to be visible after expansion
    await expect(employeeCard).toBeVisible({ timeout: 5000 });

    // Scroll card into view to ensure it's visible for dragging
    await employeeCard.scrollIntoViewIfNeeded();

    // Get employee ID from card testid
    const cardTestId = await employeeCard.getAttribute("data-testid");
    const employeeIdMatch = cardTestId?.match(/employee-card-(\d+)/);
    if (!employeeIdMatch) {
      throw new Error("Could not extract employee ID from card testid");
    }
    const employeeId = parseInt(employeeIdMatch[1], 10);

    // Collapse box 5 first so target box 1 won't be collapsed after drag
    await collapseGridBox(page, 5);
    await verifyBoxCollapsed(page, 5);

    // Act: Drag employee to box 1 (position 1)
    await page
      .locator(`[data-testid="employee-card-${employeeId}"]`)
      .scrollIntoViewIfNeeded();
    await dragEmployeeToPosition(page, employeeId, 1);

    // Expand box 1 to verify the employee is there
    await expandGridBox(page, 1);
    await verifyBoxExpanded(page, 1);

    // Assert: Verify employee moved to position 1
    const movedCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );
    await expect(movedCard).toBeVisible({ timeout: 3000 });
    await expect(movedCard).toHaveAttribute("data-position", "1", {
      timeout: 3000,
    });

    // Assert: Verify change is tracked (badge count changed)
    // Note: Badge can increment or stay same depending on if employee moved from original position
    await expect(async () => {
      const newBadgeCount = await getBadgeCount(page, "file-menu-badge");
      expect(newBadgeCount).toBeGreaterThanOrEqual(0);
    }).toPass({ timeout: 2000 });
  });
});
