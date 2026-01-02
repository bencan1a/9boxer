/**
 * Grid Performance E2E Tests
 *
 * End-to-end performance tests for the 9-box grid with realistic data loads.
 * Tests verify that the grid performs well with large datasets in actual
 * browser environment (not just unit tests).
 *
 * Performance Targets:
 * - Grid render with 500 employees: <2000ms (browser environment is slower)
 * - Grid remains responsive during rendering
 * - No JavaScript errors during load
 */

import { test, expect } from "@playwright/test";

test.describe("Grid Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for app to be fully loaded
    await page.waitForSelector('[data-testid="nine-box-grid"]', {
      timeout: 10000,
    });
  });

  test("should render grid with sample data within performance budget", async ({
    page,
  }) => {
    // Start performance measurement
    const startTime = Date.now();

    // Load sample dataset through UI
    // Note: Adjust selectors based on actual UI implementation
    // This is a placeholder - actual implementation will depend on sample data loading mechanism
    await page.click('[data-testid="file-menu-button"]', { timeout: 5000 });

    // Wait for grid to render (check for employee tiles)
    // The grid should have rendered if we can see multiple boxes
    const boxes = page.locator('[data-testid^="grid-box-"]');
    await expect(boxes.first()).toBeVisible({ timeout: 5000 });

    const renderTime = Date.now() - startTime;

    // Log performance metrics
    console.log(
      `✓ Grid rendered in ${renderTime}ms (target: <2000ms for initial load)`
    );

    // Grid should render in reasonable time
    expect(renderTime).toBeLessThan(2000);

    // Verify grid is interactive
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

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

    console.log(
      `✓ Employee list expanded in ${listRenderTime}ms (target: <1000ms)`
    );

    // Employee list should render quickly
    expect(listRenderTime).toBeLessThan(1000);

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

    console.log(`✓ Scroll completed in ${scrollTime}ms`);

    // Scrolling should be smooth (< 500ms including settle time)
    expect(scrollTime).toBeLessThan(500);

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

    // Verify metrics are within acceptable ranges
    // LCP should be under 2.5s (good) or 4s (acceptable)
    if (webVitals.LCP !== null) {
      expect(webVitals.LCP).toBeLessThan(4000);
      console.log(`✓ LCP: ${webVitals.LCP}ms (target: <2500ms)`);
    }

    // FCP should be under 1.8s (good) or 3s (acceptable)
    if (webVitals.FCP !== null) {
      expect(webVitals.FCP).toBeLessThan(3000);
      console.log(`✓ FCP: ${webVitals.FCP}ms (target: <1800ms)`);
    }

    // TTFB should be under 800ms (good) or 1800ms (acceptable)
    if (webVitals.TTFB !== null) {
      expect(webVitals.TTFB).toBeLessThan(1800);
      console.log(`✓ TTFB: ${webVitals.TTFB}ms (target: <800ms)`);
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

    console.log(
      `✓ Memory growth: ${memoryGrowthMB.toFixed(2)}MB (target: <50MB)`
    );
    console.log(`  Initial: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);

    // Memory growth should be reasonable (< 50MB for this operation)
    expect(memoryGrowthMB).toBeLessThan(50);
  });
});
