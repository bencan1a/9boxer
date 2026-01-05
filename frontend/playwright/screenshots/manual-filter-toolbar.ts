/**
 * Manual FilterToolbar Screenshot Generation
 *
 * Simple script to generate FilterToolbar screenshots directly from Storybook
 * without using the complex screenshot infrastructure.
 */

import { chromium } from "@playwright/test";
import * as path from "path";

async function generateScreenshots() {
  console.log("Starting manual screenshot generation...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  });
  const page = await context.newPage();

  const storybookUrl = "http://localhost:6006";
  const outputDir = path.join(
    __dirname,
    "../../..",
    "resources/user-guide/docs/images/screenshots"
  );

  try {
    // Screenshot 1: Expanded Default
    console.log("\n1. Generating filter-toolbar-expanded.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-common-filtertoolbar--expanded-default&viewMode=story`
    );
    await page.waitForTimeout(2000); // Wait for component to render

    // Find and screenshot just the toolbar component
    const toolbar1 = page.locator(".filter-toolbar").first();
    if (await toolbar1.isVisible()) {
      await toolbar1.screenshot({
        path: path.join(outputDir, "toolbar/filter-toolbar-expanded.png"),
      });
      console.log("✓ Saved toolbar/filter-toolbar-expanded.png");
    } else {
      console.log("✗ FilterToolbar not found, trying alternative selector...");
      await page.screenshot({
        path: path.join(outputDir, "toolbar/filter-toolbar-expanded.png"),
        clip: { x: 0, y: 0, width: 400, height: 120 },
      });
    }

    // Screenshot 2: With Active Filters
    console.log("\n2. Generating filter-toolbar-with-active-filters.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-common-filtertoolbar--with-active-filters&viewMode=story`
    );
    await page.waitForTimeout(2000);

    const toolbar2 = page.locator(".filter-toolbar").first();
    if (await toolbar2.isVisible()) {
      await toolbar2.screenshot({
        path: path.join(
          outputDir,
          "toolbar/filter-toolbar-with-active-filters.png"
        ),
      });
      console.log("✓ Saved toolbar/filter-toolbar-with-active-filters.png");
    } else {
      await page.screenshot({
        path: path.join(
          outputDir,
          "toolbar/filter-toolbar-with-active-filters.png"
        ),
        clip: { x: 0, y: 0, width: 450, height: 120 },
      });
    }

    // Screenshot 3: Search Results (with interaction)
    console.log("\n3. Generating filter-toolbar-search-autocomplete.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-common-filtertoolbar--with-search-results&viewMode=story`
    );
    await page.waitForTimeout(2000);

    // Try to trigger search manually
    const searchInput = page
      .locator('input[placeholder*="Search"], input[type="search"]')
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill("sarah");
      await page.waitForTimeout(1000); // Wait for autocomplete
    }

    const toolbar3 = page.locator(".filter-toolbar").first();
    if (await toolbar3.isVisible()) {
      await toolbar3.screenshot({
        path: path.join(
          outputDir,
          "toolbar/filter-toolbar-search-autocomplete.png"
        ),
      });
      console.log("✓ Saved toolbar/filter-toolbar-search-autocomplete.png");
    } else {
      await page.screenshot({
        path: path.join(
          outputDir,
          "toolbar/filter-toolbar-search-autocomplete.png"
        ),
        clip: { x: 0, y: 0, width: 450, height: 300 },
      });
    }

    console.log("\n✓ All screenshots generated successfully!");
  } catch (error) {
    console.error("Error generating screenshots:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

generateScreenshots().catch(console.error);
