/**
 * Temporary test file for debugging screenshot workflows
 *
 * This allows you to debug screenshot generation functions as regular
 * Playwright tests in VS Code's testing panel.
 *
 * Usage:
 * 1. Make sure backend and frontend servers are running
 * 2. Set breakpoints in the workflow files (notes.ts, filters.ts, changes.ts)
 * 3. Right-click test in VS Code Testing panel → "Debug Test"
 * 4. Or run: npx playwright test debug-screenshot-workflow.spec.ts --debug
 * 5. Delete this file when done debugging
 */

import { test } from "@playwright/test";
import {
  generateGoodExample,
  generateChangesTabField,
} from "../screenshots/workflows/notes";
import { generateActiveChips } from "../screenshots/workflows/filters";
import { generateTimelineView } from "../screenshots/workflows/changes";

test.describe("Debug Screenshot Workflows", () => {
  // Navigate to app before each test
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("debug notes-good-example", async ({ page }) => {
    const outputPath = "playwright/screenshots/debug-notes-good-example.png";
    await generateGoodExample(page, outputPath);
    console.log(`Screenshot saved to: ${outputPath}`);
  });

  test("debug notes-changes-tab-field", async ({ page }) => {
    const outputPath = "playwright/screenshots/debug-notes-field.png";
    await generateChangesTabField(page, outputPath);
    console.log(`Screenshot saved to: ${outputPath}`);
  });

  test("debug filters-active-chips", async ({ page }) => {
    const outputPath = "playwright/screenshots/debug-filters-active-chips.png";
    await generateActiveChips(page, outputPath);
    console.log(`Screenshot saved to: ${outputPath}`);
  });

  test("debug changes-timeline-view", async ({ page }) => {
    const outputPath = "playwright/screenshots/debug-timeline.png";
    await generateTimelineView(page, outputPath);
    console.log(`Screenshot saved to: ${outputPath}`);
  });
});
