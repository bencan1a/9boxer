/**
 * App Load Performance Tests
 *
 * Tests to measure and validate the initial application load performance.
 * Ensures the app starts quickly and becomes interactive within acceptable time.
 *
 * Performance Targets (CI-adjusted):
 * - Initial page load: <5000ms in CI, <3000ms local (time to empty state)
 * - Backend connection established: <7000ms in CI, <5000ms local
 * - First meaningful paint: <3000ms in CI, <2000ms local
 * - Data load time: <10000ms in CI, <7000ms local
 *
 * Note: CI environments have additional overhead from cold starts, resource sharing,
 * and virtualization. Thresholds are adjusted to be realistic while still catching
 * true performance regressions.
 */

import { test, expect } from "../fixtures/worker-backend";
import { loadSampleData } from "../helpers";

// Helper to get CI-adjusted thresholds
const getThreshold = (localValue: number, ciMultiplier = 1.5): number => {
  return process.env.CI ? Math.round(localValue * ciMultiplier) : localValue;
};

test.describe("App Load Performance Tests", () => {
  test("should load application within performance budget", async ({
    page,
  }) => {
    // Start timing
    const startTime = Date.now();

    // Navigate to the app
    await page.goto("/");

    // Wait for the app to be interactive (empty state visible means app is loaded)
    await page.waitForSelector('[data-testid="app-bar"]', {
      timeout: 10000,
    });

    const loadTime = Date.now() - startTime;
    const threshold = getThreshold(3000, 1.67); // 5000ms in CI

    console.log(
      `✓ App loaded to empty state in ${loadTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // App should load within threshold (3s local, 5s CI)
    expect(loadTime).toBeLessThan(threshold);

    // Verify critical UI elements are present
    await expect(page.locator('[data-testid="app-bar"]')).toBeVisible();

    // Verify we're in empty state (no grid with data yet)
    const emptyStateMessage = page.getByText("No Employees Loaded");
    await expect(emptyStateMessage).toBeVisible();
  });

  test("should establish backend connection quickly", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    // Wait for initial backend connection
    // The app should show the app bar and be ready to interact
    await page.waitForSelector('[data-testid="app-bar"]', {
      timeout: 10000,
    });

    // Wait for file menu button to be enabled (indicates backend is connected)
    await expect(page.locator('[data-testid="file-menu-button"]')).toBeEnabled({
      timeout: 5000,
    });

    const connectionTime = Date.now() - startTime;
    const threshold = getThreshold(5000, 1.4); // 7000ms in CI

    console.log(
      `✓ Backend connected in ${connectionTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Backend connection should be established within threshold (5s local, 7s CI)
    expect(connectionTime).toBeLessThan(threshold);

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
          navTiming.secureConnectionStart > 0
            ? navTiming.connectEnd - navTiming.secureConnectionStart
            : navTiming.connectEnd - navTiming.connectStart,
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

    // Verify metrics are reasonable (CI-adjusted)
    expect(metrics.domContentLoaded).toBeLessThan(getThreshold(3000, 1.33)); // 4000ms in CI
    expect(metrics.loadComplete).toBeLessThan(getThreshold(5000, 1.4)); // 7000ms in CI
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

    // Should have minimal long tasks during initial load (CI has more overhead)
    const maxLongTasks = process.env.CI ? 10 : 5;
    expect((longTasks as any[]).length).toBeLessThan(maxLongTasks);
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

    // Total JS load time should be reasonable (CI-adjusted)
    // Note: In dev mode with 250+ resources, totals can be higher
    // Increased threshold to account for variability in cumulative load times
    expect(totalJsTime).toBeLessThan(getThreshold(15000, 1.5)); // 22500ms in CI
  });

  test("should render first meaningful content quickly", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    // Wait for first meaningful content (app bar is good proxy)
    await page.waitForSelector('[data-testid="app-bar"]', { timeout: 5000 });

    const firstPaintTime = Date.now() - startTime;
    const threshold = getThreshold(2000, 1.5); // 3000ms in CI

    console.log(
      `✓ First meaningful paint in ${firstPaintTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // First meaningful paint should be fast (CI-adjusted)
    expect(firstPaintTime).toBeLessThan(threshold);

    // Verify content is visible
    await expect(page.locator('[data-testid="app-bar"]')).toBeVisible();
  });

  test("should load sample data within performance budget", async ({
    page,
  }) => {
    await page.goto("/");

    // Start timing from when user clicks load sample data
    const startTime = Date.now();

    // Load sample data
    await loadSampleData(page);

    const dataLoadTime = Date.now() - startTime;
    const threshold = getThreshold(7000, 1.43); // 10000ms in CI

    console.log(
      `✓ Sample data loaded in ${dataLoadTime}ms (target: <${threshold}ms, CI: ${!!process.env.CI})`
    );

    // Data should load within threshold (7s local, 10s CI)
    expect(dataLoadTime).toBeLessThan(threshold);

    // Verify grid is now visible with data
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify employees are visible
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    await expect(employeeCards.first()).toBeVisible();
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

    // Wait for app to load (app bar visible)
    await page.waitForSelector('[data-testid="app-bar"]', {
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
