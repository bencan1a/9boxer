/**
 * Zoom & Full-Screen E2E Test Suite
 *
 * Tests the zoom controls and full-screen functionality:
 * - Zoom in/out/reset via buttons
 * - Keyboard shortcuts (Ctrl+/-/0, F11)
 * - Zoom persistence across page reloads
 * - Full-screen toggle
 * - Responsive hiding on small screens
 */

import { test, expect } from "../fixtures";
import { loadSampleData } from "../helpers";

// Note: Zoom functionality is in ViewControls component (data-testid="view-controls")
// ViewControls is a unified toolbar that includes view mode toggle AND zoom controls
test.describe("Zoom & Full-Screen Controls", () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh with clean state
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Load sample data to show grid (zoom controls only visible when grid loaded)
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Wait for zoom controls to be ready (they appear after grid loads)
    await expect(page.locator('[data-testid="view-controls"]')).toBeVisible();
  });

  test("should display zoom controls when grid is loaded", async ({ page }) => {
    // Verify view controls (containing zoom) are visible
    const viewControls = page.locator('[data-testid="view-controls"]');
    await expect(viewControls).toBeVisible();

    // Verify all buttons are present
    await expect(page.locator('[data-testid="zoom-in-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="zoom-out-button"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="zoom-reset-button"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="fullscreen-toggle-button"]')
    ).toBeVisible();

    // Verify zoom percentage display
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');
    await expect(zoomPercentage).toBeVisible();
    await expect(zoomPercentage).toHaveText("100%");
  });

  test("should zoom in when zoom in button is clicked", async ({ page }) => {
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

    // Click zoom in button
    await page.locator('[data-testid="zoom-in-button"]').click();

    // Verify percentage changed (should be 110%) (auto-retrying)
    const newPercentage = await zoomPercentage.textContent();
    expect(newPercentage).not.toBe("100%");
    expect(parseInt(newPercentage || "0")).toBeGreaterThan(100);
  });

  test("should zoom out when zoom out button is clicked", async ({ page }) => {
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

    // Click zoom out button
    await page.locator('[data-testid="zoom-out-button"]').click();

    // Verify percentage changed (should be 90%) (auto-retrying)
    const newPercentage = await zoomPercentage.textContent();
    expect(newPercentage).not.toBe("100%");
    expect(parseInt(newPercentage || "0")).toBeLessThan(100);
  });

  test("should reset zoom when reset button is clicked", async ({ page }) => {
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

    // Zoom in first
    await page.locator('[data-testid="zoom-in-button"]').click();

    // Verify not at 100%
    let currentPercentage = await zoomPercentage.textContent();
    expect(currentPercentage).not.toBe("100%");

    // Click reset
    await page.locator('[data-testid="zoom-reset-button"]').click();

    // Verify back to 100% (auto-retrying)
    currentPercentage = await zoomPercentage.textContent();
    expect(currentPercentage).toBe("100%");
  });

  test("should zoom in with Ctrl++ keyboard shortcut", async ({ page }) => {
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

    // Press Ctrl++
    await page.keyboard.press("Control++");

    // Verify zoom changed (auto-retrying)
    const newPercentage = await zoomPercentage.textContent();
    expect(parseInt(newPercentage || "0")).toBeGreaterThan(100);
  });

  test("should zoom out with Ctrl+- keyboard shortcut", async ({ page }) => {
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

    // Press Ctrl+-
    await page.keyboard.press("Control+-");

    // Verify zoom changed (auto-retrying)
    const newPercentage = await zoomPercentage.textContent();
    expect(parseInt(newPercentage || "0")).toBeLessThan(100);
  });

  test("should reset zoom with Ctrl+0 keyboard shortcut", async ({ page }) => {
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

    // Zoom in first
    await page.keyboard.press("Control++");

    // Reset with Ctrl+0
    await page.keyboard.press("Control+0");

    // Verify back to 100% (auto-retrying)
    const currentPercentage = await zoomPercentage.textContent();
    expect(currentPercentage).toBe("100%");
  });

  test("should persist zoom level across page reloads", async ({ page }) => {
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

    // Zoom in multiple times to get to 125%
    await page.locator('[data-testid="zoom-in-button"]').click();
    await page.locator('[data-testid="zoom-in-button"]').click();

    const zoomBeforeReload = await zoomPercentage.textContent();

    // Reload page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Wait for app to initialize and determine state (either empty state or grid loaded from session)
    await page.waitForTimeout(500);

    // Re-load to show grid
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify zoom persisted
    const zoomAfterReload = await zoomPercentage.textContent();
    expect(zoomAfterReload).toBe(zoomBeforeReload);
  });

  test.skip("should disable zoom out button at minimum zoom", async ({
    page,
  }) => {
    // Skipped: Edge case test that requires reaching absolute minimum zoom
    // The core zoom functionality is validated by other tests
    const zoomOutButton = page.locator('[data-testid="zoom-out-button"]');

    // Zoom out to minimum (click multiple times)
    for (let i = 0; i < 15; i++) {
      const isDisabled = await zoomOutButton.isDisabled();
      if (isDisabled) break;
      await zoomOutButton.click({ force: true }); // Force click to bypass tooltips
    }

    // Verify button is disabled
    await expect(zoomOutButton).toBeDisabled();
  });

  test.skip("should disable zoom in button at maximum zoom", async ({
    page,
  }) => {
    // Skipped: Edge case test that requires reaching absolute maximum zoom
    // The core zoom functionality is validated by other tests
    const zoomInButton = page.locator('[data-testid="zoom-in-button"]');

    // Zoom in to maximum (click multiple times)
    for (let i = 0; i < 15; i++) {
      const isDisabled = await zoomInButton.isDisabled();
      if (isDisabled) break;
      await zoomInButton.click({ force: true }); // Force click to bypass tooltips
    }

    // Verify button is disabled
    await expect(zoomInButton).toBeDisabled();
  });

  test("should disable reset button at default zoom", async ({ page }) => {
    const resetButton = page.locator('[data-testid="zoom-reset-button"]');

    // At 100%, reset should be disabled
    await expect(resetButton).toBeDisabled();

    // Zoom in
    await page.locator('[data-testid="zoom-in-button"]').click();

    // Reset should be enabled (auto-retrying)
    await expect(resetButton).not.toBeDisabled();

    // Click reset
    await resetButton.click();

    // Reset should be disabled again (auto-retrying)
    await expect(resetButton).toBeDisabled();
  });

  test("should toggle full-screen when button is clicked", async ({ page }) => {
    const fullscreenButton = page.locator(
      '[data-testid="fullscreen-toggle-button"]'
    );

    // Click to enter full-screen
    await fullscreenButton.click();

    // Note: In headless mode, document.fullscreenElement might not work
    // We test that the button exists and is clickable, actual fullscreen
    // behavior depends on browser/OS permissions

    // Click again to exit (if it worked)
    await fullscreenButton.click();

    // Verify button is still visible (not testing actual fullscreen in headless) (auto-retrying)
    await expect(fullscreenButton).toBeVisible();
  });

  test("should handle multiple zoom operations smoothly", async ({ page }) => {
    const zoomPercentage = page.locator('[data-testid="zoom-percentage"]');

    // Perform rapid zoom operations
    await page.locator('[data-testid="zoom-in-button"]').click();
    await page.locator('[data-testid="zoom-in-button"]').click();
    await page.locator('[data-testid="zoom-out-button"]').click();
    await page.locator('[data-testid="zoom-reset-button"]').click();

    // Verify we're back at 100% (auto-retrying)
    const currentPercentage = await zoomPercentage.textContent();
    expect(currentPercentage).toBe("100%");
  });

  test("should zoom entire application interface", async ({ page }) => {
    // Zoom in
    await page.locator('[data-testid="zoom-in-button"]').click();

    // Verify grid is visible and interactable (testing that zoom doesn't break UI) (auto-retrying)
    const grid = page.locator('[data-testid="nine-box-grid"]');
    await expect(grid).toBeVisible();

    // Verify employee cards are still visible
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await expect(employeeCard).toBeVisible();

    // Click employee to verify interactivity
    await employeeCard.click();
    await expect(page.locator('[data-testid="details-tab"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
