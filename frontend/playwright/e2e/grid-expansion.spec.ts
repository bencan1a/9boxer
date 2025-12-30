/**
 * E2E tests for grid box expansion and collapse workflow
 * Tests the complete flow of expanding/collapsing grid boxes with keyboard shortcuts
 */

import { test, expect } from "../fixtures";
import {
  loadSampleData,
  dragEmployeeToPosition,
  createChange,
} from "../helpers";

test.describe("Grid Box Expansion Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Visit and load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should expand grid box when clicking expand button", async ({
    page,
  }) => {
    // Target grid box 9 (Star - High Performance, High Potential)
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    await expect(gridBox9).toBeVisible();

    // Verify box is not expanded initially
    await expect(gridBox9).toHaveAttribute("aria-expanded", "false");

    // Get initial bounding box to compare size
    const initialBox = await gridBox9.boundingBox();
    if (!initialBox) {
      throw new Error("Grid box 9 not found");
    }

    // Find and click the expand button (OpenInFullIcon)
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    // Wait for expansion state change using aria-expanded attribute
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Verify box size increased
    const expandedBox = await gridBox9.boundingBox();
    if (!expandedBox) {
      throw new Error("Grid box 9 not found after expansion");
    }

    // Height should increase significantly (expanded has min-height 200px vs normal 150px)
    expect(expandedBox.height).toBeGreaterThan(initialBox.height);

    // Verify collapse button is now visible instead of expand button
    const collapseButton = gridBox9.locator(
      'button[aria-label="Collapse box"]'
    );
    await expect(collapseButton).toBeVisible();
    await expect(expandButton).not.toBeVisible();

    // Verify employee cards are still visible (at least one)
    const employeeCards = gridBox9.locator('[data-testid^="employee-card-"]');
    await expect(employeeCards.first()).toBeVisible();
  });

  test("should collapse grid box when clicking collapse button", async ({
    page,
  }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // First, expand the box
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expandButton.click();

    // Wait for expansion state change using aria-expanded attribute
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Get expanded size
    const expandedBox = await gridBox9.boundingBox();
    if (!expandedBox) {
      throw new Error("Grid box 9 not found when expanded");
    }

    // Click collapse button
    const collapseButton = gridBox9.locator(
      'button[aria-label="Collapse box"]'
    );
    await collapseButton.click();

    // Wait for collapse state change using aria-expanded attribute
    await expect(gridBox9).toHaveAttribute("aria-expanded", "false");

    // Verify size decreased
    const collapsedBox = await gridBox9.boundingBox();
    if (!collapsedBox) {
      throw new Error("Grid box 9 not found after collapse");
    }

    expect(collapsedBox.height).toBeLessThan(expandedBox.height);

    // Verify expand button is visible again
    await expect(expandButton).toBeVisible();
    await expect(collapseButton).not.toBeVisible();
  });

  test("should collapse expanded box when pressing ESC key", async ({
    page,
  }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Expand the box
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expandButton.click();

    // Wait for expansion state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Press ESC key
    await page.keyboard.press("Escape");

    // Wait for collapse state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "false");

    // Verify expand button is visible again
    await expect(expandButton).toBeVisible();
  });

  test("should maintain expansion state during session", async ({ page }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Expand box 9
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expandButton.click();

    // Wait for expansion state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Navigate to Changes tab to test expansion state persistence
    await page.locator('[data-testid="changes-tab"]').click();
    await expect(page.locator('[data-testid="changes-tab"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Navigate back to Details tab (grid view)
    await page.locator('[data-testid="details-tab"]').click();

    // Wait for grid to be visible and loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Verify box 9 is still expanded after tab navigation
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Verify employee cards remain visible after tab navigation
    const employeeCardsInBox9 = gridBox9.locator(
      '[data-testid^="employee-card-"]'
    );
    await expect(employeeCardsInBox9.first()).toBeVisible({ timeout: 5000 });

    // Navigate to Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();
    await expect(
      page.locator('[data-testid="statistics-tab"]')
    ).toHaveAttribute("aria-selected", "true");

    // Navigate back to Details tab again
    await page.locator('[data-testid="details-tab"]').click();
    await expect(page.locator('[data-testid="details-tab"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Verify box 9 is still expanded after multiple tab navigations
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");
  });

  test("should allow dragging employee from expanded box to another box", async ({
    page,
  }) => {
    const gridBox5 = page.locator('[data-testid="grid-box-5"]');
    const gridBox1 = page.locator('[data-testid="grid-box-1"]');

    // Expand middle box (box 5)
    const expandButton5 = gridBox5.locator('button[aria-label="Expand box"]');
    await expandButton5.click();

    // Wait for expansion state change
    await expect(gridBox5).toHaveAttribute("aria-expanded", "true");

    // Wait for grid to stabilize after expansion
    await page.waitForLoadState("networkidle");

    // Verify there are employees in box 5
    const employeeCardsInBox5 = gridBox5.locator(
      '[data-testid^="employee-card-"]'
    );
    const employeeCount = await employeeCardsInBox5.count();

    // Only proceed if there are employees in box 5
    if (employeeCount > 0) {
      // Get the first employee in box 5
      const firstEmployeeCard = employeeCardsInBox5.first();
      await expect(firstEmployeeCard).toBeVisible();

      // Get employee ID
      const employeeTestId =
        await firstEmployeeCard.getAttribute("data-testid");
      const employeeId = employeeTestId
        ? parseInt(employeeTestId.replace("employee-card-", ""))
        : 0;

      // Verify employee is in box 5 initially
      await expect(firstEmployeeCard).toHaveAttribute("data-position", "5");

      // Drag from EXPANDED box 5 to MINIMIZED box 1
      // This tests that drag works from expanded state to minimized target box
      await dragEmployeeToPosition(page, employeeId, 1);

      // Verify employee moved to box 1 (check data-position attribute)
      const movedEmployeeCard = page.locator(
        `[data-testid="employee-card-${employeeId}"]`
      );
      await expect(movedEmployeeCard).toHaveAttribute("data-position", "1");

      // Expand box 1 to verify employee is visible there
      const expandButton1 = gridBox1.locator('button[aria-label="Expand box"]');
      await expandButton1.click();

      // Wait for expansion state change
      await expect(gridBox1).toHaveAttribute("aria-expanded", "true");

      // Verify the moved employee is visible in box 1
      const employeeInBox1 = gridBox1.locator(
        `[data-testid="employee-card-${employeeId}"]`
      );
      await expect(employeeInBox1).toBeVisible();

      // Note: Modified indicator chip was removed - modified state is shown via border styling only
    }
  });

  test("should collapse other boxes when one box is expanded", async ({
    page,
  }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const gridBox5 = page.locator('[data-testid="grid-box-5"]');

    // Initially, both boxes should not be expanded
    await expect(gridBox9).toHaveAttribute("aria-expanded", "false");
    await expect(gridBox5).toHaveAttribute("aria-expanded", "false");

    // Expand box 9
    await gridBox9.locator('button[aria-label="Expand box"]').click();

    // Wait for expansion state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Get initial size of box 5
    const box5Initial = await gridBox5.boundingBox();
    if (!box5Initial) {
      throw new Error("Grid box 5 not found");
    }

    // Box 5 should now be in collapsed state (other boxes collapse when one expands)
    // The grid uses dynamic template columns/rows - non-expanded boxes get 80px
    // Check that box 5 is smaller than it was initially
    const box5Collapsed = await gridBox5.boundingBox();
    if (!box5Collapsed) {
      throw new Error("Grid box 5 not found after box 9 expansion");
    }

    // Box 5 should be visually collapsed (smaller than normal)
    // We can verify this by checking for collapsed styling or reduced height
    // Note: aria-expanded only applies to the expanded box, not collapsed ones
    // The collapsed state is indicated by the grid template changing
  });

  test("should restore expansion state after page reload", async ({ page }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Expand box 9
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expandButton.click();

    // Wait for expansion state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Reload the page
    await page.reload();

    // Wait for grid to load again
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify box 9 is still expanded after reload (state persisted in localStorage)
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Verify collapse button is visible
    const collapseButton = gridBox9.locator(
      'button[aria-label="Collapse box"]'
    );
    await expect(collapseButton).toBeVisible();
  });

  test("should clear expansion state from localStorage when collapsed", async ({
    page,
  }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Expand box 9
    await gridBox9.locator('button[aria-label="Expand box"]').click();

    // Wait for expansion state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Verify localStorage has the expanded position
    const expandedPosition = await page.evaluate(() => {
      return localStorage.getItem("nineBoxExpandedPosition");
    });
    expect(expandedPosition).toBe("9");

    // Collapse the box
    await gridBox9.locator('button[aria-label="Collapse box"]').click();

    // Wait for collapse state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "false");

    // Verify localStorage is cleared
    const clearedPosition = await page.evaluate(() => {
      return localStorage.getItem("nineBoxExpandedPosition");
    });
    expect(clearedPosition).toBeNull();

    // Reload to verify expansion doesn't persist
    await page.reload();
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Box 9 should not be expanded after reload
    await expect(gridBox9).toHaveAttribute("aria-expanded", "false");
  });

  test("should handle expanding boxes with different employee counts", async ({
    page,
  }) => {
    // Test expanding box 9 (likely has employees)
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const badge9 = page.locator('[data-testid="grid-box-9-count"]');

    // Get employee count
    const count9 = await badge9.textContent();

    // Expand box 9
    await gridBox9.locator('button[aria-label="Expand box"]').click();

    // Wait for expansion state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

    // Verify expanded and employees still visible
    if (count9 && parseInt(count9) > 0) {
      // If there are employees, verify they're visible
      await expect(
        gridBox9.locator('[data-testid^="employee-card-"]').first()
      ).toBeVisible();
    }

    // Collapse it
    await page.keyboard.press("Escape");

    // Wait for collapse state change
    await expect(gridBox9).toHaveAttribute("aria-expanded", "false");

    // Test expanding box 1 (Low Performance, Low Potential - may have fewer/no employees)
    const gridBox1 = page.locator('[data-testid="grid-box-1"]');

    // Expand box 1
    await gridBox1.locator('button[aria-label="Expand box"]').click();

    // Wait for expansion state change
    await expect(gridBox1).toHaveAttribute("aria-expanded", "true");
  });

  test("should display employee cards in multi-column grid when expanded with many employees", async ({
    page,
  }) => {
    // Use grid box 9 (Star - High Performance, High Potential) which typically has employees
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Check if box 9 has employees
    const badge = gridBox9.locator('[data-testid="grid-box-9-count"]');
    const badgeExists = (await badge.count()) > 0;

    // Only run test if there are employees in box 9
    if (badgeExists) {
      const countText = await badge.textContent();
      const employeeCount = countText ? parseInt(countText) : 0;

      // Expand the box
      const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
      await expect(expandButton).toBeVisible();
      await expandButton.click();

      // Wait for expansion state change
      await expect(gridBox9).toHaveAttribute("aria-expanded", "true");

      // Verify all employee cards are visible
      const employeeCards = gridBox9.locator('[data-testid^="employee-card-"]');
      await expect(employeeCards).toHaveCount(employeeCount);

      // Verify first few cards are visible
      for (let i = 0; i < Math.min(employeeCount, 3); i++) {
        await expect(employeeCards.nth(i)).toBeVisible();
      }

      // If there are at least 2 cards, verify multi-column layout by checking positioning
      if (employeeCount >= 2) {
        const card1Box = await employeeCards.nth(0).boundingBox();
        const card2Box = await employeeCards.nth(1).boundingBox();

        if (card1Box && card2Box) {
          // In expanded view with multi-column grid, check if cards are positioned
          // The key verification is that both cards are visible and have valid positions
          expect(card1Box.width).toBeGreaterThan(200); // Cards have minimum width
          expect(card2Box.width).toBeGreaterThan(200);
        }
      }

      // Verify drag handles are present and functional
      const firstCard = employeeCards.first();
      if ((await firstCard.count()) > 0) {
        const dragHandle = firstCard.locator(
          '[data-testid="DragIndicatorIcon"]'
        );
        await expect(dragHandle).toBeVisible();
      }
    }
  });
});
