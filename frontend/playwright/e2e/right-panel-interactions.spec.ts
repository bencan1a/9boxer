/**
 * E2E tests for Right Panel Interactions
 * Tests panel toggle, tab switching, resize functionality, and visibility
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

test.describe("Right Panel Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and load sample data for each test (ensures isolation)
    await page.goto("/");
    await loadSampleData(page);

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test.describe("Panel Visibility and Toggle", () => {
    test("should display right panel by default", async ({ page }) => {
      // Verify right panel is visible
      const rightPanel = page.locator('[data-testid="right-panel"]');
      await expect(rightPanel).toBeVisible();

      // Verify default tab (Details) is visible
      const detailsTab = page.locator('[data-testid="details-tab"]');
      await expect(detailsTab).toBeVisible();
    });

    test("should toggle panel visibility when clicking toggle button", async ({
      page,
    }) => {
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const toggleButton = page.locator('[data-testid="panel-toggle-button"]');

      // Verify panel is initially visible
      await expect(rightPanel).toBeVisible();
      await expect(toggleButton).toBeVisible();

      // Click toggle to collapse panel
      await toggleButton.click();

      // Wait for panel to collapse (auto-retry until width < 10px)
      await expect(async () => {
        const panelBox = await rightPanel.boundingBox();
        expect(panelBox).not.toBeNull();
        expect(panelBox!.width).toBeLessThan(10); // Collapsed panels have minimal width
      }).toPass();

      // Click toggle to expand panel
      await toggleButton.click();

      // Wait for panel to expand (auto-retry until width > 200px)
      await expect(async () => {
        const expandedBox = await rightPanel.boundingBox();
        expect(expandedBox).not.toBeNull();
        expect(expandedBox!.width).toBeGreaterThan(200); // Expanded panel has substantial width
      }).toPass();

      // Verify panel is visible again
      await expect(rightPanel).toBeVisible();
    });

    test("should maintain toggle button visibility when panel is collapsed", async ({
      page,
    }) => {
      const toggleButton = page.locator('[data-testid="panel-toggle-button"]');

      // Toggle panel closed
      await toggleButton.click();

      // Verify toggle button is still visible
      await expect(toggleButton).toBeVisible();

      // Toggle panel open
      await toggleButton.click();

      // Verify toggle button is still visible
      await expect(toggleButton).toBeVisible();
    });
  });

  test.describe("Tab Navigation", () => {
    test("should switch between all four tabs", async ({ page }) => {
      const detailsTab = page.locator('[data-testid="details-tab"]');
      const changesTab = page.locator('[data-testid="changes-tab"]');
      const statisticsTab = page.locator('[data-testid="statistics-tab"]');
      const intelligenceTab = page.locator('[data-testid="intelligence-tab"]');

      // Verify Details tab is active by default
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('[data-testid="tab-panel-0"]')).toBeVisible();

      // Switch to Changes tab
      await changesTab.click();
      await expect(changesTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('[data-testid="tab-panel-1"]')).toBeVisible();

      // Switch to Statistics tab
      await statisticsTab.click();
      await expect(statisticsTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('[data-testid="tab-panel-2"]')).toBeVisible();

      // Switch to Intelligence tab
      await intelligenceTab.click();
      await expect(intelligenceTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('[data-testid="tab-panel-3"]')).toBeVisible();

      // Switch back to Details tab
      await detailsTab.click();
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('[data-testid="tab-panel-0"]')).toBeVisible();
    });

    test("should show only active tab panel content", async ({ page }) => {
      const detailsTab = page.locator('[data-testid="details-tab"]');
      const changesTab = page.locator('[data-testid="changes-tab"]');

      const detailsPanel = page.locator('[data-testid="tab-panel-0"]');
      const changesPanel = page.locator('[data-testid="tab-panel-1"]');

      // Verify only Details panel is visible initially
      await expect(detailsPanel).toBeVisible();
      await expect(changesPanel).toHaveAttribute("hidden", "");

      // Switch to Changes tab
      await changesTab.click();
      await expect(changesTab).toHaveAttribute("aria-selected", "true");

      // Verify only Changes panel is visible
      await expect(detailsPanel).toHaveAttribute("hidden", "");
      await expect(changesPanel).toBeVisible();

      // Switch back to Details
      await detailsTab.click();
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");

      // Verify only Details panel is visible again
      await expect(detailsPanel).toBeVisible();
      await expect(changesPanel).toHaveAttribute("hidden", "");
    });

    test("should persist tab selection when panel is toggled", async ({
      page,
    }) => {
      const statisticsTab = page.locator('[data-testid="statistics-tab"]');
      const toggleButton = page.locator('[data-testid="panel-toggle-button"]');
      const rightPanel = page.locator('[data-testid="right-panel"]');

      // Switch to Statistics tab
      await statisticsTab.click();
      await expect(statisticsTab).toHaveAttribute("aria-selected", "true");

      // Collapse panel
      await toggleButton.click();

      // Wait for panel to collapse (auto-retry until width < 10px)
      await expect(async () => {
        const collapsedBox = await rightPanel.boundingBox();
        expect(collapsedBox).not.toBeNull();
        expect(collapsedBox!.width).toBeLessThan(10);
      }).toPass();

      // Expand panel
      await toggleButton.click();

      // Wait for panel to expand
      await expect(async () => {
        const expandedBox = await rightPanel.boundingBox();
        expect(expandedBox).not.toBeNull();
        expect(expandedBox!.width).toBeGreaterThan(200);
      }).toPass();

      await expect(rightPanel).toBeVisible();

      // Verify Statistics tab is still selected
      await expect(statisticsTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('[data-testid="tab-panel-2"]')).toBeVisible();
    });
  });

  test.describe("Panel with Employee Selection", () => {
    test("should update Details tab when selecting different employees", async ({
      page,
    }) => {
      // Find and click first employee
      const { employeeCard: firstEmployee } = await findAnyEmployee(page);
      await firstEmployee.click();

      // Verify first employee details are shown
      const detailsPanel = page.locator('[data-testid="tab-panel-0"]');
      // Just verify the details panel shows content (name will vary)
      const headings = detailsPanel.locator("h2, h3, h4, h5, h6");
      await expect(headings.first()).toBeVisible();

      // Find and click a different employee from a different box
      let differentBoxNumber = 0;
      let differentEmployee: Locator | undefined;

      // Look for an employee in a different box
      for (const box of [9, 8, 6, 5, 7, 4, 3, 2, 1]) {
        const gridBox = page.locator(`[data-testid="grid-box-${box}"]`);
        const employees = gridBox.locator('[data-testid^="employee-card-"]');
        const count = await employees.count();

        if (count > 1) {
          // Get second employee in same box
          differentEmployee = employees.nth(1);
          differentBoxNumber = box;
          break;
        }
      }

      if (!differentEmployee) {
        // Fallback: just find any other employee
        const allEmployees = page.locator('[data-testid^="employee-card-"]');
        differentEmployee = allEmployees.nth(1);
      }

      await differentEmployee.click();

      // Verify second employee details are shown (name will depend on test data)
      // Just verify that the panel updated by checking it's still visible
      await expect(detailsPanel).toBeVisible();
      await expect(headings.first()).toBeVisible();
    });

    test("should show tab panels when employee is selected", async ({
      page,
    }) => {
      // Find and click any employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      // Verify all tabs are accessible
      const detailsTab = page.locator('[data-testid="details-tab"]');
      const changesTab = page.locator('[data-testid="changes-tab"]');
      const statisticsTab = page.locator('[data-testid="statistics-tab"]');
      const intelligenceTab = page.locator('[data-testid="intelligence-tab"]');

      await expect(detailsTab).toBeVisible();
      await expect(changesTab).toBeVisible();
      await expect(statisticsTab).toBeVisible();
      await expect(intelligenceTab).toBeVisible();
    });
  });

  test.describe("Panel Resize", () => {
    test("should display resize handle", async ({ page }) => {
      const resizeHandle = page.locator('[data-testid="panel-resize-handle"]');
      await expect(resizeHandle).toBeVisible();
    });

    test("should allow panel resizing via drag", async ({ page }) => {
      const resizeHandle = page.locator('[data-testid="panel-resize-handle"]');
      const rightPanel = page.locator('[data-testid="right-panel"]');

      // Get initial panel width
      const initialBox = await rightPanel.boundingBox();
      expect(initialBox).not.toBeNull();
      const initialWidth = initialBox!.width;

      // Drag resize handle to the left (expand panel)
      await resizeHandle.hover();
      await page.mouse.down();
      await page.mouse.move(
        initialBox!.x - 100,
        initialBox!.y + initialBox!.height / 2
      );
      await page.mouse.up();

      // Get new panel width - verify it changed
      await expect(async () => {
        const newBox = await rightPanel.boundingBox();
        expect(newBox).not.toBeNull();
        const newWidth = newBox!.width;
        expect(Math.abs(newWidth - initialWidth)).toBeGreaterThan(50);
      }).toPass();
    });

    test("should maintain panel width after tab switching", async ({
      page,
    }) => {
      const resizeHandle = page.locator('[data-testid="panel-resize-handle"]');
      const rightPanel = page.locator('[data-testid="right-panel"]');
      const changesTab = page.locator('[data-testid="changes-tab"]');

      // Resize panel
      const initialBox = await rightPanel.boundingBox();
      await resizeHandle.hover();
      await page.mouse.down();
      await page.mouse.move(
        initialBox!.x - 100,
        initialBox!.y + initialBox!.height / 2
      );
      await page.mouse.up();

      // Wait for panel resize to complete (event-driven)
      await expect(async () => {
        const resizedBox = await rightPanel.boundingBox();
        expect(resizedBox).not.toBeNull();
        // Verify width has changed significantly from initial
        expect(Math.abs(resizedBox!.width - initialBox!.width)).toBeGreaterThan(
          50
        );
      }).toPass();
      const resizedBox = await rightPanel.boundingBox();
      const resizedWidth = resizedBox!.width;

      // Switch tab
      await changesTab.click();
      await expect(changesTab).toHaveAttribute("aria-selected", "true");

      // Wait for tab content to be visible (event-driven)
      await expect(page.locator('[data-testid="tab-panel-1"]')).toBeVisible();

      // Verify width is maintained
      const afterTabBox = await rightPanel.boundingBox();
      expect(Math.abs(afterTabBox!.width - resizedWidth)).toBeLessThan(5);
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA attributes on tabs", async ({ page }) => {
      const detailsTab = page.locator('[data-testid="details-tab"]');
      const changesTab = page.locator('[data-testid="changes-tab"]');

      // Verify ARIA attributes
      await expect(detailsTab).toHaveAttribute("role", "tab");
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");
      await expect(changesTab).toHaveAttribute("role", "tab");
      await expect(changesTab).toHaveAttribute("aria-selected", "false");

      // Verify aria-controls and id attributes
      const detailsAriaControls =
        await detailsTab.getAttribute("aria-controls");
      expect(detailsAriaControls).toBe("panel-tabpanel-0");
    });

    test("should have proper ARIA attributes on tab panels", async ({
      page,
    }) => {
      const detailsPanel = page.locator('[data-testid="tab-panel-0"]');

      // Verify tab panel attributes
      await expect(detailsPanel).toHaveAttribute("role", "tabpanel");
      await expect(detailsPanel).toHaveAttribute("id", "panel-tabpanel-0");
      await expect(detailsPanel).toHaveAttribute(
        "aria-labelledby",
        "panel-tab-0"
      );
    });

    test("should support keyboard navigation for tabs", async ({ page }) => {
      const detailsTab = page.locator('[data-testid="details-tab"]');
      const changesTab = page.locator('[data-testid="changes-tab"]');

      // Focus on Details tab
      await detailsTab.focus();
      await expect(detailsTab).toBeFocused();

      // Press ArrowRight to move to Changes tab
      await page.keyboard.press("ArrowRight");
      await expect(changesTab).toBeFocused();

      // Press Enter to activate tab
      await page.keyboard.press("Enter");
      await expect(changesTab).toHaveAttribute("aria-selected", "true");
    });
  });
});
