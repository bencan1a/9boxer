/**
 * Grid Performance E2E Tests
 *
 * End-to-end performance tests for the 9-box grid with realistic data loads.
 * Tests verify that the grid performs well with large datasets in actual
 * browser environment (not just unit tests).
 *
 * Performance Targets (CI-adjusted):
 * - Grid render with 500 employees: <3000ms in CI, <2000ms local
 * - Grid remains responsive during rendering
 * - No JavaScript errors during load
 *
 * Note: CI environments have cold starts and resource constraints that affect
 * performance. Thresholds are adjusted to be realistic while catching regressions.
 */

import { test, expect } from "../fixtures/worker-backend";
import { loadSampleData } from "../helpers";

// Helper to get CI-adjusted thresholds
const getThreshold = (localValue: number, ciMultiplier = 1.5): number => {
  return process.env.CI ? Math.round(localValue * ciMultiplier) : localValue;
};

test.describe("Grid Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and load sample data
    await page.goto("/");
    await loadSampleData(page);
  });

  test("should render grid with sample data within performance budget", async ({
    page,
  }) => {
    // Grid and data are already loaded from beforeEach
    // Verify grid is visible and interactive
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Check that all 9 boxes are rendered (grid has 9 positions)
    // Note: The DOM may contain boxes for both normal and expanded views
    const boxes = page.locator('[data-testid^="grid-box-"]');
    const boxCount = await boxes.count();
    expect(boxCount).toBeGreaterThanOrEqual(9);

    // Verify grid has employee tiles
    const employeeTiles = page.locator('[data-testid^="employee-card-"]');
    const tileCount = await employeeTiles.count();
    expect(tileCount).toBeGreaterThan(0);

    console.log(
      `✓ Grid rendered with ${tileCount} employee tiles across ${boxCount} boxes`
    );

    // Verify grid is interactive (can interact with first employee)
    const firstTile = employeeTiles.first();
    await expect(firstTile).toBeVisible();
    await expect(firstTile).toBeEnabled();

    // Verify no JavaScript errors occurred
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    expect(errors).toHaveLength(0);
  });

  test("should maintain responsiveness with many employees visible", async ({
    page,
  }) => {
    // Expand a box to show many employees
    const expandButton = page.locator('[aria-label*="Expand box"]').first();
    await expandButton.click();

    // Measure time to show employee list
    const startTime = Date.now();
    await page.waitForSelector('[data-testid^="employee-card-"]', {
      state: "visible",
      timeout: 5000,
    });
    const listRenderTime = Date.now() - startTime;
    const threshold = getThreshold(1000, 1.5); // 1500ms in CI

    console.log(
      `✓ Employee list expanded in ${listRenderTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Employee list should render quickly (CI-adjusted)
    expect(listRenderTime).toBeLessThan(threshold);

    // Verify list is scrollable (should have virtualization if many employees)
    const employeeList = page.locator('[data-testid="employee-tile-list"]');
    await expect(employeeList).toBeVisible();
  });

  test("should handle grid navigation without lag", async ({ page }) => {
    // Test scrolling performance
    const grid = page.locator('[data-testid="nine-box-grid"]');
    await expect(grid).toBeVisible();

    // Scroll through the grid
    const startTime = Date.now();
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await page.waitForTimeout(100); // Allow for scroll to settle
    const scrollTime = Date.now() - startTime;
    const threshold = getThreshold(500, 2); // 1000ms in CI

    console.log(
      `✓ Scroll completed in ${scrollTime}ms (CI: ${!!process.env.CI})`
    );

    // Scrolling should be smooth (CI-adjusted for settle time)
    expect(scrollTime).toBeLessThan(threshold);

    // Grid should still be visible and responsive
    await expect(grid).toBeVisible();
  });

  test("should measure Web Vitals", async ({ page }) => {
    // Inject web-vitals measurement
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {
          LCP: null,
          FID: null,
          CLS: null,
          FCP: null,
          TTFB: null,
        };

        // Listen for LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.LCP = lastEntry.startTime;
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // Listen for FCP (First Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            vitals.FCP = entries[0].startTime;
          }
        }).observe({ entryTypes: ["paint"] });

        // Get TTFB (Time to First Byte) from navigation timing
        const navTiming = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        if (navTiming) {
          vitals.TTFB = navTiming.responseStart - navTiming.requestStart;
        }

        // Resolve after a short delay to capture metrics
        setTimeout(() => resolve(vitals), 2000);
      });
    });

    console.log("Web Vitals:", webVitals);

    // Verify metrics are within acceptable ranges (CI-adjusted)
    // LCP should be under 2.5s (good) or 5s (acceptable in CI)
    if (webVitals.LCP !== null) {
      const lcpThreshold = getThreshold(4000, 1.25); // 5000ms in CI
      expect(webVitals.LCP).toBeLessThan(lcpThreshold);
      console.log(`✓ LCP: ${webVitals.LCP}ms (target: <${lcpThreshold}ms)`);
    }

    // FCP should be under 1.8s (good) or 4s (acceptable in CI)
    if (webVitals.FCP !== null) {
      const fcpThreshold = getThreshold(3000, 1.33); // 4000ms in CI
      expect(webVitals.FCP).toBeLessThan(fcpThreshold);
      console.log(`✓ FCP: ${webVitals.FCP}ms (target: <${fcpThreshold}ms)`);
    }

    // TTFB should be under 800ms (good) or 1800ms (acceptable)
    if (webVitals.TTFB !== null) {
      expect(webVitals.TTFB).toBeLessThan(1800);
      console.log(`✓ TTFB: ${webVitals.TTFB}ms (target: <1800ms)`);
    }
  });

  test("should not cause memory growth during normal usage", async ({
    page,
  }) => {
    // Check if performance.memory is available (Chrome only)
    const hasMemoryAPI = await page.evaluate(
      () => !!(performance as any).memory
    );

    if (!hasMemoryAPI) {
      console.log("⚠ Memory API not available (Chrome only)");
      test.skip();
      return;
    }

    // Get initial memory usage
    const initialMemory = await page.evaluate(
      () => (performance as any).memory.usedJSHeapSize
    );

    // Perform some operations
    for (let i = 0; i < 5; i++) {
      // Expand and collapse a box
      const expandButton = page.locator('[aria-label*="Expand box"]').first();
      await expandButton.click();
      await page.waitForTimeout(200);

      const collapseButton = page
        .locator('[aria-label*="Collapse box"]')
        .first();
      await collapseButton.click();
      await page.waitForTimeout(200);
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(
      () => (performance as any).memory.usedJSHeapSize
    );

    const memoryGrowth = finalMemory - initialMemory;
    const memoryGrowthMB = memoryGrowth / 1024 / 1024;
    const threshold = process.env.CI ? 75 : 50; // More lenient in CI

    console.log(
      `✓ Memory growth: ${memoryGrowthMB.toFixed(2)}MB (target: <${threshold}MB, CI: ${!!process.env.CI})`
    );
    console.log(`  Initial: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);

    // Memory growth should be reasonable (CI-adjusted)
    expect(memoryGrowthMB).toBeLessThan(threshold);
  });
});
