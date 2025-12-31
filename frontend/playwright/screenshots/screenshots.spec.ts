/**
 * Screenshot Generation Tests
 *
 * This file wraps the screenshot generation workflow as Playwright tests.
 * This allows us to use Playwright's built-in test runner and HTML reporter
 * with embedded traces for debugging.
 *
 * Run with:
 *   npx playwright test --project=screenshots
 *   npx playwright show-report
 */

import { test, expect } from "@playwright/test";
import { getAutomatedScreenshots } from "./config";
import * as path from "path";
import * as fs from "fs";

// Import all workflow modules at the top
import * as storybookComponents from "./workflows/storybook-components";
import * as fileOperations from "./workflows/file-operations";
import * as filtersStorybook from "./workflows/filters-storybook";
import * as statisticsStorybook from "./workflows/statistics-storybook";
import * as intelligence from "./workflows/intelligence";
import * as calibration from "./workflows/calibration";
import * as changes from "./workflows/changes";
import * as detailsPanelEnhancements from "./workflows/details-panel-enhancements";
import * as viewControls from "./workflows/view-controls";

// Map workflow names to modules
const workflowModules: Record<string, any> = {
  "storybook-components": storybookComponents,
  "file-operations": fileOperations,
  "filters-storybook": filtersStorybook,
  "statistics-storybook": statisticsStorybook,
  intelligence,
  calibration,
  changes,
  "details-panel-enhancements": detailsPanelEnhancements,
  "view-controls": viewControls,
};

// Get all automated screenshots
const screenshots = getAutomatedScreenshots();

// Create a test for each screenshot
for (const [name, metadata] of Object.entries(screenshots)) {
  test(name, async ({ page }) => {
    // Get the workflow module
    const workflowModule = workflowModules[metadata.workflow];
    if (!workflowModule) {
      throw new Error(`Workflow module ${metadata.workflow} not found`);
    }

    // Get the screenshot function
    const screenshotFn = workflowModule[metadata.function];
    if (!screenshotFn) {
      throw new Error(
        `Screenshot function ${metadata.function} not found in ${metadata.workflow}`
      );
    }

    // Ensure output directory exists
    const projectRoot = path.resolve(__dirname, "../../..");
    const outputPath = path.join(projectRoot, metadata.path);
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    // Call the workflow function
    await screenshotFn(page, outputPath);

    // Validate screenshot was created
    expect(fs.existsSync(outputPath)).toBeTruthy();
    const stats = fs.statSync(outputPath);
    expect(stats.size).toBeGreaterThan(0);
  });
}
