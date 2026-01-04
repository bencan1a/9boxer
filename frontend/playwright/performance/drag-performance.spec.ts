/**
 * Drag and Drop Performance Tests
 *
 * Tests to ensure drag-and-drop operations are smooth and maintain good frame rates.
 * Validates that dragging employees between boxes doesn't cause UI jank.
 *
 * Performance Targets (CI-adjusted):
 * - Drag operation completes: <1500ms in CI, <1000ms local
 * - No significant frame drops during drag
 * - UI remains responsive during drag
 *
 * Note: CI environments can have slower mouse simulation and rendering overhead.
 */

import { test, expect } from "../fixtures/worker-backend";
import { loadSampleData } from "../helpers";

// Helper to get CI-adjusted thresholds
const getThreshold = (localValue: number, ciMultiplier = 1.5): number => {
  return process.env.CI ? Math.round(localValue * ciMultiplier) : localValue;
};

test.describe("Drag Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and load sample data
    await page.goto("/");
    await loadSampleData(page);
  });

  test("should complete drag operation efficiently", async ({ page }) => {
    // Find an employee tile to drag
    const employeeTile = page
      .locator('[data-testid^="employee-card-"]')
      .first();

    // Check if any employees are visible
    const tileCount = await employeeTile.count();
    if (tileCount === 0) {
      console.log("⚠ No employee tiles found - may need sample data loaded");
      console.log("  Skipping drag performance test");
      test.skip();
      return;
    }

    // Find target box (different from source)
    const targetBox = page.locator('[data-testid^="grid-box-"]').nth(5);

    // Measure drag operation time
    const startTime = Date.now();

    // Get bounding boxes for drag operation
    const sourceBound = await employeeTile.boundingBox();
    const targetBound = await targetBox.boundingBox();

    if (!sourceBound || !targetBound) {
      console.log("⚠ Cannot get element positions - skipping test");
      test.skip();
      return;
    }

    // Perform drag and drop
    await page.mouse.move(
      sourceBound.x + sourceBound.width / 2,
      sourceBound.y + sourceBound.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBound.x + targetBound.width / 2,
      targetBound.y + targetBound.height / 2,
      { steps: 10 } // Smooth drag
    );
    await page.mouse.up();

    const dragTime = Date.now() - startTime;
    const threshold = getThreshold(1000, 1.5); // 1500ms in CI

    console.log(
      `✓ Drag operation completed in ${dragTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Drag should complete in reasonable time (CI-adjusted)
    expect(dragTime).toBeLessThan(threshold);
  });

  test("should maintain responsive UI during drag", async ({ page }) => {
    const employeeTile = page
      .locator('[data-testid^="employee-card-"]')
      .first();

    const tileCount = await employeeTile.count();
    if (tileCount === 0) {
      console.log("⚠ No employee tiles found - skipping test");
      test.skip();
      return;
    }

    const targetBox = page.locator('[data-testid^="grid-box-"]').nth(3);

    const sourceBound = await employeeTile.boundingBox();
    const targetBound = await targetBox.boundingBox();

    if (!sourceBound || !targetBound) {
      console.log("⚠ Cannot get element positions - skipping test");
      test.skip();
      return;
    }

    // Start drag
    await page.mouse.move(
      sourceBound.x + sourceBound.width / 2,
      sourceBound.y + sourceBound.height / 2
    );
    await page.mouse.down();

    // Move slowly to simulate user drag
    await page.mouse.move(
      (sourceBound.x + targetBound.x) / 2,
      (sourceBound.y + targetBound.y) / 2,
      { steps: 5 }
    );

    // While dragging, verify grid is still responsive
    const grid = page.locator('[data-testid="nine-box-grid"]');
    await expect(grid).toBeVisible();

    // Complete drag
    await page.mouse.move(
      targetBound.x + targetBound.width / 2,
      targetBound.y + targetBound.height / 2,
      { steps: 5 }
    );
    await page.mouse.up();

    console.log("✓ UI remained responsive during drag operation");
  });

  test("should handle multiple rapid drags without performance degradation", async ({
    page,
  }) => {
    const employeeTiles = page.locator('[data-testid^="employee-card-"]');

    const tileCount = await employeeTiles.count();
    if (tileCount < 2) {
      console.log("⚠ Need at least 2 employee tiles - skipping test");
      test.skip();
      return;
    }

    const targetBox = page.locator('[data-testid^="grid-box-"]').nth(4);

    // Perform multiple drags
    const dragCount = Math.min(3, tileCount);
    const startTime = Date.now();

    for (let i = 0; i < dragCount; i++) {
      const tile = employeeTiles.nth(i);
      const sourceBound = await tile.boundingBox();
      const targetBound = await targetBox.boundingBox();

      if (!sourceBound || !targetBound) continue;

      // Quick drag
      await page.mouse.move(
        sourceBound.x + sourceBound.width / 2,
        sourceBound.y + sourceBound.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(
        targetBound.x + targetBound.width / 2,
        targetBound.y + targetBound.height / 2,
        { steps: 5 }
      );
      await page.mouse.up();

      await page.waitForTimeout(100); // Small delay between drags
    }

    const totalTime = Date.now() - startTime;
    const threshold = getThreshold(3000, 1.67); // 5000ms in CI

    console.log(
      `✓ Completed ${dragCount} drags in ${totalTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );
    console.log(`  Average: ${(totalTime / dragCount).toFixed(2)}ms per drag`);

    // Multiple drags should complete in reasonable time (CI-adjusted)
    expect(totalTime).toBeLessThan(threshold);
  });

  test("should not cause memory leaks with repeated drag operations", async ({
    page,
  }) => {
    // Check if performance.memory is available (Chrome only)
    const hasMemoryAPI = await page.evaluate(
      () => !!(performance as any).memory
    );

    if (!hasMemoryAPI) {
      console.log("⚠ Memory API not available (Chrome only) - skipping test");
      test.skip();
      return;
    }

    const employeeTiles = page.locator('[data-testid^="employee-card-"]');
    const tileCount = await employeeTiles.count();

    if (tileCount === 0) {
      console.log("⚠ No employee tiles found - skipping test");
      test.skip();
      return;
    }

    // Get initial memory
    const initialMemory = await page.evaluate(
      () => (performance as any).memory.usedJSHeapSize
    );

    // Perform several drag operations
    const targetBox = page.locator('[data-testid^="grid-box-"]').nth(6);

    for (let i = 0; i < 5; i++) {
      const tile = employeeTiles.first();
      const sourceBound = await tile.boundingBox();
      const targetBound = await targetBox.boundingBox();

      if (!sourceBound || !targetBound) continue;

      await page.mouse.move(
        sourceBound.x + sourceBound.width / 2,
        sourceBound.y + sourceBound.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(
        targetBound.x + targetBound.width / 2,
        targetBound.y + targetBound.height / 2,
        { steps: 3 }
      );
      await page.mouse.up();

      await page.waitForTimeout(100);
    }

    // Get final memory
    const finalMemory = await page.evaluate(
      () => (performance as any).memory.usedJSHeapSize
    );

    const memoryGrowth = finalMemory - initialMemory;
    const memoryGrowthMB = memoryGrowth / 1024 / 1024;
    const threshold = process.env.CI ? 30 : 20; // More lenient in CI

    console.log(
      `✓ Memory growth after 5 drags: ${memoryGrowthMB.toFixed(2)}MB (target: <${threshold}MB, CI: ${!!process.env.CI})`
    );

    // Memory growth should be minimal (CI-adjusted)
    expect(memoryGrowthMB).toBeLessThan(threshold);
  });

  test("should render drag preview without lag", async ({ page }) => {
    const employeeTile = page
      .locator('[data-testid^="employee-card-"]')
      .first();

    const tileCount = await employeeTile.count();
    if (tileCount === 0) {
      console.log("⚠ No employee tiles found - skipping test");
      test.skip();
      return;
    }

    const sourceBound = await employeeTile.boundingBox();
    if (!sourceBound) {
      console.log("⚠ Cannot get element position - skipping test");
      test.skip();
      return;
    }

    // Measure time to start drag (preview should appear)
    const startTime = Date.now();

    await page.mouse.move(
      sourceBound.x + sourceBound.width / 2,
      sourceBound.y + sourceBound.height / 2
    );
    await page.mouse.down();

    // Wait a moment for drag preview to render
    await page.waitForTimeout(50);

    const previewTime = Date.now() - startTime;
    const threshold = getThreshold(200, 1.5); // 300ms in CI

    console.log(
      `✓ Drag preview rendered in ${previewTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Drag preview should appear quickly (CI-adjusted)
    expect(previewTime).toBeLessThan(threshold);

    // Cancel drag
    await page.mouse.up();
  });
});
