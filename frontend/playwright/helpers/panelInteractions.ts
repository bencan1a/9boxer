/**
 * Panel and Grid Interaction helpers for E2E tests
 *
 * Provides helper functions for:
 * - Right panel toggle, resize, and tab switching
 * - Grid box expansion/collapse
 *
 * All functions use state-based waits (NO arbitrary timeouts).
 */

import { Page, expect } from "@playwright/test";

/**
 * Toggle the right panel (collapse/expand)
 *
 * Clicks the panel toggle button. Does not verify the resulting state.
 * Use verifyPanelCollapsed() or verifyPanelExpanded() to verify state.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await toggleRightPanel(page);
 * await verifyPanelCollapsed(page);
 * ```
 */
export async function toggleRightPanel(page: Page): Promise<void> {
  const toggleButton = page.locator('[data-testid="panel-toggle-button"]');
  await toggleButton.click();
}

/**
 * Verify that the right panel is collapsed
 *
 * Checks that the panel's width is less than 10px using boundingBox().
 * Uses state-based wait pattern with expect().toPass().
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await toggleRightPanel(page);
 * await verifyPanelCollapsed(page);
 * ```
 */
export async function verifyPanelCollapsed(page: Page): Promise<void> {
  const rightPanel = page.locator('[data-testid="right-panel"]');

  await expect(async () => {
    const panelBox = await rightPanel.boundingBox();
    if (!panelBox) {
      throw new Error("Right panel not found in DOM");
    }
    expect(panelBox.width).toBeLessThan(10);
  }).toPass({ timeout: 3000 });
}

/**
 * Verify that the right panel is expanded
 *
 * Checks that the panel's width is greater than 200px using boundingBox().
 * Uses state-based wait pattern with expect().toPass().
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await toggleRightPanel(page);
 * await verifyPanelExpanded(page);
 * ```
 */
export async function verifyPanelExpanded(page: Page): Promise<void> {
  const rightPanel = page.locator('[data-testid="right-panel"]');

  await expect(async () => {
    const panelBox = await rightPanel.boundingBox();
    if (!panelBox) {
      throw new Error("Right panel not found in DOM");
    }
    expect(panelBox.width).toBeGreaterThan(200);
  }).toPass({ timeout: 3000 });
}

/**
 * Resize the right panel to a target width
 *
 * Drags the panel resize handle to achieve the target width.
 * Uses state-based wait to verify resize completed.
 *
 * @param page - Playwright Page object
 * @param targetWidth - Desired panel width in pixels
 * @param tolerance - Acceptable difference from target (default: 20px)
 *
 * @example
 * ```typescript
 * await resizePanelToWidth(page, 400);
 * ```
 */
export async function resizePanelToWidth(
  page: Page,
  targetWidth: number,
  tolerance: number = 20,
  skipVerification: boolean = false
): Promise<void> {
  const rightPanel = page.locator('[data-testid="right-panel"]');
  const resizeHandle = page.locator('[data-testid="panel-resize-handle"]');

  // Wait for resize handle to be visible
  await expect(resizeHandle).toBeVisible({ timeout: 3000 });

  // Get initial dimensions
  const initialBox = await rightPanel.boundingBox();
  if (!initialBox) {
    throw new Error("Right panel not found in DOM");
  }

  const initialWidth = initialBox.width;
  const dragDistance = initialWidth - targetWidth;

  // Get handle position for drag
  const handleBox = await resizeHandle.boundingBox();
  if (!handleBox) {
    throw new Error("Resize handle not found in DOM");
  }

  const handleX = handleBox.x + handleBox.width / 2;
  const handleY = handleBox.y + handleBox.height / 2;

  // Perform drag operation with explicit positioning
  // Move to handle center first, then perform drag
  await page.mouse.move(handleX, handleY);
  await page.mouse.down();
  // Move in small steps to ensure drag is detected
  const targetX = handleX - dragDistance;
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const x = handleX + ((targetX - handleX) * i) / steps;
    await page.mouse.move(x, handleY);
  }
  await page.mouse.up();

  // Wait for resize to complete (state-based wait) - skip if requested
  if (!skipVerification) {
    await expect(async () => {
      const newBox = await rightPanel.boundingBox();
      if (!newBox) {
        throw new Error("Right panel not found after resize");
      }
      const actualWidth = newBox.width;
      const difference = Math.abs(actualWidth - targetWidth);
      expect(difference).toBeLessThan(tolerance);
    }).toPass({ timeout: 3000 });
  }
}

/**
 * Switch to a specific panel tab
 *
 * Clicks the specified tab and verifies it becomes active (aria-selected="true").
 *
 * @param page - Playwright Page object
 * @param tabName - Name of tab: 'details', 'changes', 'statistics', or 'intelligence'
 *
 * @example
 * ```typescript
 * await switchPanelTab(page, 'statistics');
 * await expect(page.locator('[data-testid="tab-panel-2"]')).toBeVisible();
 * ```
 */
export async function switchPanelTab(
  page: Page,
  tabName: "details" | "changes" | "statistics" | "intelligence"
): Promise<void> {
  // Map tab name to testid
  const tabTestId = `${tabName}-tab`;

  const tab = page.locator(`[data-testid="${tabTestId}"]`);
  await tab.click();

  // Verify tab became active
  await expect(tab).toHaveAttribute("aria-selected", "true", { timeout: 2000 });
}

/**
 * Expand a specific grid box
 *
 * Clicks the expand button on the specified box and verifies it expands.
 *
 * @param page - Playwright Page object
 * @param boxNumber - Grid box number (1-9)
 *
 * @example
 * ```typescript
 * await expandGridBox(page, 9);
 * await verifyBoxExpanded(page, 9);
 * ```
 */
export async function expandGridBox(
  page: Page,
  boxNumber: number
): Promise<void> {
  const gridBox = page.locator(`[data-testid="grid-box-${boxNumber}"]`);
  const expandButton = gridBox.locator('button[aria-label="Expand box"]');

  await expandButton.click();

  // Verify box expanded (state-based wait)
  await expect(gridBox).toHaveAttribute("aria-expanded", "true", {
    timeout: 2000,
  });
}

/**
 * Collapse a specific grid box
 *
 * Clicks the collapse button (or presses Escape) and verifies box collapses.
 *
 * @param page - Playwright Page object
 * @param boxNumber - Grid box number (1-9)
 *
 * @example
 * ```typescript
 * await collapseGridBox(page, 9);
 * await verifyBoxCollapsed(page, 9);
 * ```
 */
export async function collapseGridBox(
  page: Page,
  boxNumber: number
): Promise<void> {
  const gridBox = page.locator(`[data-testid="grid-box-${boxNumber}"]`);

  // Try clicking collapse button first
  const collapseButton = gridBox.locator('button[aria-label="Collapse box"]');
  const isCollapseButtonVisible = await collapseButton
    .isVisible()
    .catch(() => false);

  if (isCollapseButtonVisible) {
    await collapseButton.click();
  } else {
    // Fall back to ESC key
    await page.keyboard.press("Escape");
  }

  // Verify box collapsed (state-based wait)
  await expect(gridBox).toHaveAttribute("aria-expanded", "false", {
    timeout: 2000,
  });
}

/**
 * Verify that a grid box is expanded
 *
 * Checks that the box has aria-expanded="true" attribute.
 *
 * @param page - Playwright Page object
 * @param boxNumber - Grid box number (1-9)
 *
 * @example
 * ```typescript
 * await expandGridBox(page, 5);
 * await verifyBoxExpanded(page, 5);
 * ```
 */
export async function verifyBoxExpanded(
  page: Page,
  boxNumber: number
): Promise<void> {
  const gridBox = page.locator(`[data-testid="grid-box-${boxNumber}"]`);
  await expect(gridBox).toHaveAttribute("aria-expanded", "true");
}

/**
 * Verify that a grid box is collapsed
 *
 * Checks that the box has aria-expanded="false" attribute.
 *
 * @param page - Playwright Page object
 * @param boxNumber - Grid box number (1-9)
 *
 * @example
 * ```typescript
 * await collapseGridBox(page, 5);
 * await verifyBoxCollapsed(page, 5);
 * ```
 */
export async function verifyBoxCollapsed(
  page: Page,
  boxNumber: number
): Promise<void> {
  const gridBox = page.locator(`[data-testid="grid-box-${boxNumber}"]`);
  await expect(gridBox).toHaveAttribute("aria-expanded", "false");
}
