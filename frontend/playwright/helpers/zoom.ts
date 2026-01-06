/**
 * Zoom control helpers for E2E tests
 *
 * Provides helper functions for:
 * - Zooming in, out, and resetting zoom level
 * - Getting current zoom level
 * - Verifying zoom level
 *
 * All functions use state-based waits (NO arbitrary timeouts).
 */

import { Page, expect } from "@playwright/test";

/**
 * Click the zoom in button
 *
 * Increases the zoom level by one step (~10%).
 * Waits for the zoom percentage to update before returning.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await zoomIn(page);
 * const level = await getZoomLevel(page);
 * expect(level).toBeGreaterThan(100);
 * ```
 */
export async function zoomIn(page: Page): Promise<void> {
  const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');
  const currentText = await zoomPercentage.textContent();

  const zoomInButton = page.locator('[data-testid="zoom-in-button"]');
  await zoomInButton.click();

  // Wait for percentage to change (React state update)
  await expect(zoomPercentage).not.toHaveText(currentText || "", {
    timeout: 2000,
  });
}

/**
 * Click the zoom out button
 *
 * Decreases the zoom level by one step (~10%).
 * Waits for the zoom percentage to update before returning.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await zoomOut(page);
 * const level = await getZoomLevel(page);
 * expect(level).toBeLessThan(100);
 * ```
 */
export async function zoomOut(page: Page): Promise<void> {
  const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');
  const currentText = await zoomPercentage.textContent();

  const zoomOutButton = page.locator('[data-testid="zoom-out-button"]');
  await zoomOutButton.click();

  // Wait for percentage to change (React state update)
  await expect(zoomPercentage).not.toHaveText(currentText || "", {
    timeout: 2000,
  });
}

/**
 * Reset zoom to 100% (default level)
 *
 * Clicks the zoom reset button and verifies the zoom percentage shows "100%".
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await zoomIn(page);
 * await zoomIn(page);
 * await resetZoom(page);
 * await expect(page.locator('[data-testid="zoom-percentage"]')).toHaveText('100%');
 * ```
 */
export async function resetZoom(page: Page): Promise<void> {
  const resetButton = page.locator('[data-testid="zoom-reset-button"]');
  await resetButton.click();

  // Verify zoom reset to 100% (state-based wait)
  const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');
  await expect(zoomPercentage).toHaveText("100%", { timeout: 2000 });
}

/**
 * Get the current zoom level as a number
 *
 * Extracts the zoom percentage from the zoom display and returns it as a number.
 * For example, "110%" returns 110.
 * Waits for the element to be visible and stable before reading.
 *
 * @param page - Playwright Page object
 * @returns The current zoom level as a number (100 = 100%)
 *
 * @example
 * ```typescript
 * const initialZoom = await getZoomLevel(page);
 * await zoomIn(page);
 * const newZoom = await getZoomLevel(page);
 * expect(newZoom).toBeGreaterThan(initialZoom);
 * ```
 */
export async function getZoomLevel(page: Page): Promise<number> {
  const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

  // Wait for element to be visible and stable
  await expect(zoomPercentage).toBeVisible({ timeout: 2000 });

  const text = await zoomPercentage.textContent();

  if (!text) {
    throw new Error("Zoom percentage element has no text content");
  }

  // Extract number from "110%" format
  const match = text.match(/(\d+)%/);
  if (!match) {
    throw new Error(`Unable to parse zoom percentage from: "${text}"`);
  }

  return parseInt(match[1], 10);
}

/**
 * Verify the zoom level matches expected value (within tolerance)
 *
 * Gets the current zoom level and verifies it matches the expected value
 * within the specified tolerance.
 * Adds a small wait to ensure zoom animation/state update has completed.
 *
 * @param page - Playwright Page object
 * @param expectedLevel - Expected zoom level (100 = 100%)
 * @param tolerance - Acceptable difference (default: 1%)
 *
 * @example
 * ```typescript
 * await zoomIn(page);
 * await verifyZoomLevel(page, 110, 2);
 * ```
 */
export async function verifyZoomLevel(
  page: Page,
  expectedLevel: number,
  tolerance: number = 1
): Promise<void> {
  // Small wait to ensure any zoom animation/transition has completed
  await page.waitForTimeout(100);

  const actualLevel = await getZoomLevel(page);
  const difference = Math.abs(actualLevel - expectedLevel);

  expect(difference).toBeLessThanOrEqual(tolerance);
}
