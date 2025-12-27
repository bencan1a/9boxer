/**
 * Visual Regression Tests for Documentation Screenshots
 *
 * This test suite validates documentation screenshots against baselines to catch
 * unintended visual regressions. It's designed to work with the automated screenshot
 * regeneration system (Phase 2) to ensure screenshot quality.
 *
 * Phase: 3.1 - Visual Regression Testing
 * Related: Issues #61, #54, #55
 */

import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { screenshotConfig, ScreenshotMetadata } from "../screenshots/config";

/**
 * Configuration for visual regression testing
 */
const VISUAL_REGRESSION_CONFIG = {
  // 5% diff tolerance as specified in Phase 3 design
  maxDiffPixelRatio: 0.05,
  // Threshold for color difference (0-1 scale, 0.2 = 20%)
  threshold: 0.2,
  // Baseline directory
  baselineDir: path.resolve(__dirname, "__baselines__"),
};

/**
 * Helper: Load screenshot from documentation output directory
 *
 * @param screenshotPath - Relative path from project root
 * @returns Buffer containing the screenshot
 */
function loadDocumentationScreenshot(screenshotPath: string): Buffer {
  const fullPath = path.resolve(__dirname, "../../..", screenshotPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Screenshot not found: ${fullPath}`);
  }

  return fs.readFileSync(fullPath);
}

/**
 * Helper: Check if screenshot exists in documentation output
 *
 * @param screenshotPath - Relative path from project root
 * @returns True if screenshot exists
 */
function screenshotExists(screenshotPath: string): boolean {
  const fullPath = path.resolve(__dirname, "../../..", screenshotPath);
  return fs.existsSync(fullPath);
}

/**
 * Test suite for automated documentation screenshots
 *
 * Tests only automated screenshots (not manual ones) against baselines.
 * Manual screenshots are excluded as they require manual composition.
 */
test.describe("Documentation Screenshot Visual Regression", () => {
  test.describe.configure({ mode: "parallel" });

  // Filter to only automated screenshots (exclude manual ones)
  const automatedScreenshots = Object.entries(screenshotConfig).filter(
    ([_, metadata]) => !metadata.manual
  );

  test.beforeAll(() => {
    console.log(
      `\n📸 Testing ${automatedScreenshots.length} automated screenshots (${Object.keys(screenshotConfig).length - automatedScreenshots.length} manual screenshots excluded)\n`
    );
  });

  // Generate a test for each automated screenshot
  for (const [screenshotId, metadata] of automatedScreenshots) {
    test(`${screenshotId} matches baseline`, async ({ page }) => {
      // Skip if screenshot doesn't exist yet (might be new)
      if (!screenshotExists(metadata.path)) {
        test.skip(
          true,
          `Screenshot not yet generated: ${metadata.path}. Run: npm run screenshots:generate ${screenshotId}`
        );
        return;
      }

      // Load the current documentation screenshot
      const screenshot = loadDocumentationScreenshot(metadata.path);

      // Compare against baseline using Playwright's visual comparison
      // The baseline will be stored in __baselines__/ directory
      await expect(screenshot).toMatchSnapshot(`${screenshotId}-baseline.png`, {
        maxDiffPixelRatio: VISUAL_REGRESSION_CONFIG.maxDiffPixelRatio,
        threshold: VISUAL_REGRESSION_CONFIG.threshold,
      });
    });
  }

  /**
   * Metadata validation test
   *
   * Ensures all automated screenshots have required metadata fields
   */
  test("all automated screenshots have valid metadata", () => {
    for (const [screenshotId, metadata] of automatedScreenshots) {
      expect(metadata.source, `${screenshotId} missing source`).toBeTruthy();
      expect(
        metadata.workflow,
        `${screenshotId} missing workflow`
      ).toBeTruthy();
      expect(
        metadata.function,
        `${screenshotId} missing function`
      ).toBeTruthy();
      expect(metadata.path, `${screenshotId} missing path`).toBeTruthy();
      expect(
        metadata.description,
        `${screenshotId} missing description`
      ).toBeTruthy();
    }
  });

  /**
   * File existence test
   *
   * Lists all screenshots that don't exist yet (need to be generated)
   */
  test("document missing screenshots", () => {
    const missing: string[] = [];

    for (const [screenshotId, metadata] of automatedScreenshots) {
      if (!screenshotExists(metadata.path)) {
        missing.push(screenshotId);
      }
    }

    if (missing.length > 0) {
      console.log(
        `\n⚠️  Missing ${missing.length} screenshot(s). Generate with:\n`
      );
      console.log(`   npm run screenshots:generate ${missing.join(" ")}\n`);
    }

    // This test passes - it's just documenting missing screenshots
    expect(true).toBe(true);
  });
});

/**
 * Test suite for screenshot dimensions validation
 *
 * Validates that screenshots match their expected dimensions (if defined)
 */
test.describe("Screenshot Dimensions Validation", () => {
  const screenshotsWithDimensions = Object.entries(screenshotConfig).filter(
    ([_, metadata]) => metadata.dimensions && !metadata.manual
  );

  if (screenshotsWithDimensions.length === 0) {
    test.skip("No screenshots with dimension constraints", () => {});
  }

  for (const [screenshotId, metadata] of screenshotsWithDimensions) {
    test(`${screenshotId} dimensions are valid`, async () => {
      if (!screenshotExists(metadata.path)) {
        test.skip(true, `Screenshot not yet generated: ${metadata.path}`);
        return;
      }

      // Load screenshot to check dimensions
      const screenshot = loadDocumentationScreenshot(metadata.path);
      const { PNG } = await import("pngjs");
      const png = PNG.sync.read(screenshot);

      const dims = metadata.dimensions!;

      // Check minimum width
      if (dims.minWidth) {
        expect(
          png.width,
          `${screenshotId} width ${png.width} is less than minimum ${dims.minWidth}`
        ).toBeGreaterThanOrEqual(dims.minWidth);
      }

      // Check maximum width
      if (dims.maxWidth) {
        expect(
          png.width,
          `${screenshotId} width ${png.width} exceeds maximum ${dims.maxWidth}`
        ).toBeLessThanOrEqual(dims.maxWidth);
      }

      // Check minimum height
      if (dims.minHeight) {
        expect(
          png.height,
          `${screenshotId} height ${png.height} is less than minimum ${dims.minHeight}`
        ).toBeGreaterThanOrEqual(dims.minHeight);
      }

      // Check maximum height
      if (dims.maxHeight) {
        expect(
          png.height,
          `${screenshotId} height ${png.height} exceeds maximum ${dims.maxHeight}`
        ).toBeLessThanOrEqual(dims.maxHeight);
      }

      // Check exact width
      if (dims.exactWidth) {
        expect(
          png.width,
          `${screenshotId} width ${png.width} must be exactly ${dims.exactWidth}`
        ).toBe(dims.exactWidth);
      }

      // Check exact height
      if (dims.exactHeight) {
        expect(
          png.height,
          `${screenshotId} height ${png.height} must be exactly ${dims.exactHeight}`
        ).toBe(dims.exactHeight);
      }
    });
  }
});

/**
 * Test suite for visual diff report generation metadata
 *
 * Tracks which screenshots have changed for reporting purposes
 */
test.describe("Visual Diff Metadata Collection", () => {
  test("generate visual diff summary", () => {
    const summary = {
      totalScreenshots: Object.keys(screenshotConfig).length,
      automatedScreenshots: Object.entries(screenshotConfig).filter(
        ([_, m]) => !m.manual
      ).length,
      manualScreenshots: Object.entries(screenshotConfig).filter(
        ([_, m]) => m.manual
      ).length,
      storybookScreenshots: Object.entries(screenshotConfig).filter(
        ([_, m]) => m.source === "storybook"
      ).length,
      fullAppScreenshots: Object.entries(screenshotConfig).filter(
        ([_, m]) => m.source === "full-app"
      ).length,
    };

    console.log("\n📊 Screenshot Summary:");
    console.log(`   Total: ${summary.totalScreenshots}`);
    console.log(`   Automated: ${summary.automatedScreenshots}`);
    console.log(`   Manual: ${summary.manualScreenshots}`);
    console.log(`   Storybook: ${summary.storybookScreenshots}`);
    console.log(`   Full-App: ${summary.fullAppScreenshots}`);

    expect(summary.totalScreenshots).toBeGreaterThan(0);
  });
});
