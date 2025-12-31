/**
 * Test 11: Zoom Controls Tests
 *
 * Tests zoom in/out/reset functionality and zoom level persistence.
 * Verifies zoom controls update displayed percentage and persist across reloads.
 *
 * Test Coverage:
 * - 11.1: Zoom in/out/reset buttons
 * - 11.2: Zoom persistence across reloads
 */

import { test, expect } from "../fixtures";
import {
  loadSampleData,
  zoomIn,
  zoomOut,
  resetZoom,
  getZoomLevel,
  verifyZoomLevel,
} from "../helpers";

test.describe("Zoom Controls Tests", () => {
  /**
   * Test 11.1 - Zoom in/out/reset buttons
   *
   * Success Criteria:
   * ✅ Can zoom in (percentage increases)
   * ✅ Can zoom out (percentage decreases)
   * ✅ Can reset zoom to 100%
   * ✅ Zoom percentage updates correctly after each action
   */
  test("11.1 - should zoom in, out, and reset", async ({ page }) => {
    // Arrange: Load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Assert: Verify initial zoom level is 100%
    await verifyZoomLevel(page, 100);
    const initialZoom = await getZoomLevel(page);
    expect(initialZoom).toBe(100);

    // Act: Zoom in
    await zoomIn(page);

    // Assert: Verify zoom level increased
    const zoomedInLevel = await getZoomLevel(page);
    expect(zoomedInLevel).toBeGreaterThan(initialZoom);

    // Act: Zoom out twice to go below 100%
    await zoomOut(page);
    await zoomOut(page);

    // Assert: Verify zoom level decreased
    const zoomedOutLevel = await getZoomLevel(page);
    expect(zoomedOutLevel).toBeLessThan(initialZoom);

    // Act: Reset zoom
    await resetZoom(page);

    // Assert: Verify zoom level is back to 100%
    await verifyZoomLevel(page, 100);
    const finalZoom = await getZoomLevel(page);
    expect(finalZoom).toBe(100);
  });

  /**
   * Test 11.2 - Zoom persistence across reloads
   *
   * Success Criteria:
   * ✅ Can zoom to specific level
   * ✅ After page reload, zoom level is preserved
   * ✅ Zoom percentage displays correctly after reload
   */
  test("11.2 - should persist zoom level across page reloads", async ({
    page,
  }) => {
    // Arrange: Load sample data
    await page.goto("/");
    await loadSampleData(page);

    // Act: Zoom in multiple times to reach higher zoom level
    await zoomIn(page);
    await zoomIn(page);
    await zoomIn(page);

    // Get zoom level before reload
    const zoomBeforeReload = await getZoomLevel(page);
    expect(zoomBeforeReload).toBeGreaterThan(100);

    // Act: Reload page
    await page.reload();

    // Wait for grid to load after reload
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible({
      timeout: 10000,
    });

    // Assert: Verify zoom level persisted after reload
    const zoomAfterReload = await getZoomLevel(page);
    expect(zoomAfterReload).toBe(zoomBeforeReload);

    // Assert: Verify zoom percentage display is still correct
    await verifyZoomLevel(page, zoomBeforeReload);
  });
});
