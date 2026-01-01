/**
 * App Load Performance Tests
 *
 * Tests to measure and validate the initial application load performance.
 * Ensures the app starts quickly and becomes interactive within acceptable time.
 *
 * Performance Targets:
 * - Initial page load: <3000ms (time to interactive)
 * - Backend connection established: <5000ms
 * - First meaningful paint: <2000ms
 */

import { test, expect } from "@playwright/test";

test.describe("App Load Performance Tests", () => {
  test("should load application within performance budget", async ({
    page,
  }) => {
    // Start timing
    const startTime = Date.now();

    // Navigate to the app
    await page.goto("/");

    // Wait for the app to be interactive (grid visible means app is loaded)
    await page.waitForSelector('[data-testid="nine-box-grid"]', {
      timeout: 10000,
    });

    const loadTime = Date.now() - startTime;

    console.log(`✓ App loaded in ${loadTime}ms (target: <3000ms)`);

    // App should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify critical UI elements are present
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="app-bar"]')).toBeVisible();
  });

  test("should establish backend connection quickly", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    // Wait for initial backend connection
    // The app should show the grid or appropriate state when backend is ready
    await page.waitForSelector('[data-testid="nine-box-grid"]', {
      timeout: 10000,
    });

    const connectionTime = Date.now() - startTime;

    console.log(`✓ Backend connected in ${connectionTime}ms (target: <5000ms)`);

    // Backend connection should be established within 5 seconds
    expect(connectionTime).toBeLessThan(5000);

    // Verify no error messages
    const errorMessages = page.locator('[role="alert"]');
    await expect(errorMessages).toHaveCount(0);
  });

  test("should measure initial render metrics", async ({ page }) => {
    await page.goto("/");

    // Get navigation timing metrics
    const metrics = await page.evaluate(() => {
      const navTiming = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      return {
        domContentLoaded: navTiming.domContentLoadedEventEnd,
        domInteractive: navTiming.domInteractive,
        loadComplete: navTiming.loadEventEnd,
        domainLookup: navTiming.domainLookupEnd - navTiming.domainLookupStart,
        tcpHandshake:
          navTiming.connectEnd -
          navTiming.connectStart -
          navTiming.secureConnectionStart,
        responseTime: navTiming.responseEnd - navTiming.requestStart,
        domProcessing:
          navTiming.domComplete - navTiming.domContentLoadedEventEnd,
      };
    });

    console.log("Navigation Timing Metrics:");
    console.log(
      `  DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`
    );
    console.log(`  DOM Interactive: ${metrics.domInteractive.toFixed(2)}ms`);
    console.log(`  Load Complete: ${metrics.loadComplete.toFixed(2)}ms`);
    console.log(`  Domain Lookup: ${metrics.domainLookup.toFixed(2)}ms`);
    console.log(`  Response Time: ${metrics.responseTime.toFixed(2)}ms`);
    console.log(`  DOM Processing: ${metrics.domProcessing.toFixed(2)}ms`);

    // Verify metrics are reasonable
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
  });

  test("should not block main thread during initial load", async ({ page }) => {
    await page.goto("/");

    // Get long tasks (tasks that block main thread for >50ms)
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const tasks: any[] = [];

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              tasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });

        observer.observe({ entryTypes: ["longtask"] });

        // Collect for 3 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(tasks);
        }, 3000);
      });
    });

    console.log(`Long tasks detected: ${(longTasks as any[]).length}`);

    if ((longTasks as any[]).length > 0) {
      console.log("Long task details:");
      (longTasks as any[]).forEach((task, i) => {
        console.log(
          `  Task ${i + 1}: ${task.duration.toFixed(2)}ms at ${task.startTime.toFixed(2)}ms`
        );
      });
    }

    // Should have minimal long tasks (< 5) during initial load
    expect((longTasks as any[]).length).toBeLessThan(5);
  });

  test("should measure JavaScript bundle parse and execution time", async ({
    page,
  }) => {
    await page.goto("/");

    // Get resource timing for JavaScript files
    const jsMetrics = await page.evaluate(() => {
      const resources = performance
        .getEntriesByType("resource")
        .filter(
          (r) =>
            (r as PerformanceResourceTiming).initiatorType === "script" ||
            r.name.includes(".js")
        );

      return resources.map((r) => {
        const resource = r as PerformanceResourceTiming;
        return {
          name: r.name.split("/").pop(),
          duration: resource.duration,
          transferSize: resource.transferSize || 0,
        };
      });
    });

    console.log(`JavaScript resources loaded: ${jsMetrics.length}`);

    let totalJsTime = 0;
    let totalJsSize = 0;

    jsMetrics.forEach((js: any) => {
      console.log(
        `  ${js.name}: ${js.duration.toFixed(2)}ms (${(js.transferSize / 1024).toFixed(2)}KB)`
      );
      totalJsTime += js.duration;
      totalJsSize += js.transferSize;
    });

    console.log(
      `  Total JS time: ${totalJsTime.toFixed(2)}ms, Total size: ${(totalJsSize / 1024).toFixed(2)}KB`
    );

    // Total JS load time should be reasonable (< 2000ms)
    expect(totalJsTime).toBeLessThan(2000);
  });

  test("should render first meaningful content quickly", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    // Wait for first meaningful content (app bar is good proxy)
    await page.waitForSelector('[data-testid="app-bar"]', { timeout: 5000 });

    const firstPaintTime = Date.now() - startTime;

    console.log(
      `✓ First meaningful paint in ${firstPaintTime}ms (target: <2000ms)`
    );

    // First meaningful paint should be fast
    expect(firstPaintTime).toBeLessThan(2000);

    // Verify content is visible
    await expect(page.locator('[data-testid="app-bar"]')).toBeVisible();
  });

  test("should load and render without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto("/");

    // Wait for app to load
    await page.waitForSelector('[data-testid="nine-box-grid"]', {
      timeout: 10000,
    });

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log("Console errors during load:");
      consoleErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

    if (pageErrors.length > 0) {
      console.log("Page errors during load:");
      pageErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

    // Should have no errors during load
    expect(consoleErrors).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });
});
