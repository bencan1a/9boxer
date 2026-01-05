/**
 * High-Quality Screenshot Generation for FilterToolbar and OrgTreeFilter
 *
 * Generates properly cropped screenshots that meet documentation quality guidelines:
 * - No excessive whitespace
 * - Light theme
 * - Component boundaries only
 * - Proper rendering wait times
 */

import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function generateAllFilterScreenshots() {
  console.log("🎨 Starting high-quality screenshot generation...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  const storybookUrl = "http://localhost:6006";
  const outputDir = path.join(
    __dirname,
    "../../..",
    "resources/user-guide/docs/images/screenshots"
  );

  // Ensure output directories exist
  fs.mkdirSync(path.join(outputDir, "toolbar"), { recursive: true });
  fs.mkdirSync(path.join(outputDir, "filters"), { recursive: true });

  try {
    // =================================================================
    // FILTER TOOLBAR SCREENSHOTS (3)
    // =================================================================

    console.log("📸 FilterToolbar Screenshots\n");

    // 1. Filter Toolbar - Expanded Default
    console.log("1/6 Generating filter-toolbar-expanded.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-common-filtertoolbar--expanded-default&viewMode=story&theme=light`
    );
    await page.waitForTimeout(2000);

    // Try multiple selectors to find the toolbar
    const toolbarSelectors = [
      '[data-testid="filter-toolbar"]',
      ".filter-toolbar",
      '[class*="FilterToolbar"]',
      "#storybook-root > div > div",
    ];

    let toolbar1Found = false;
    for (const selector of toolbarSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box && box.width > 50 && box.height > 30) {
          await element.screenshot({
            path: path.join(outputDir, "toolbar/filter-toolbar-expanded.png"),
          });
          console.log(`   ✓ Captured using selector: ${selector}`);
          console.log(
            `   ✓ Size: ${Math.round(box.width)}x${Math.round(box.height)}px\n`
          );
          toolbar1Found = true;
          break;
        }
      }
    }

    if (!toolbar1Found) {
      console.log("   ⚠ Using fallback clipping\n");
      await page.screenshot({
        path: path.join(outputDir, "toolbar/filter-toolbar-expanded.png"),
        clip: { x: 20, y: 20, width: 380, height: 100 },
      });
    }

    // 2. Filter Toolbar - With Active Filters
    console.log("2/6 Generating filter-toolbar-with-active-filters.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-common-filtertoolbar--with-active-filters&viewMode=story&theme=light`
    );
    await page.waitForTimeout(2000);

    let toolbar2Found = false;
    for (const selector of toolbarSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box && box.width > 50 && box.height > 30) {
          await element.screenshot({
            path: path.join(
              outputDir,
              "toolbar/filter-toolbar-with-active-filters.png"
            ),
          });
          console.log(`   ✓ Captured using selector: ${selector}`);
          console.log(
            `   ✓ Size: ${Math.round(box.width)}x${Math.round(box.height)}px\n`
          );
          toolbar2Found = true;
          break;
        }
      }
    }

    if (!toolbar2Found) {
      console.log("   ⚠ Using fallback clipping\n");
      await page.screenshot({
        path: path.join(
          outputDir,
          "toolbar/filter-toolbar-with-active-filters.png"
        ),
        clip: { x: 20, y: 20, width: 420, height: 100 },
      });
    }

    // 3. Filter Toolbar - Search Autocomplete
    console.log("3/6 Generating filter-toolbar-search-autocomplete.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-common-filtertoolbar--with-search-results&viewMode=story&theme=light`
    );
    await page.waitForTimeout(2000);

    // Try to interact with search if needed
    const searchInput = page
      .locator('input[placeholder*="Search"], input[placeholder*="employee"]')
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill("sarah");
      await page.waitForTimeout(1000);
    }

    let toolbar3Found = false;
    for (const selector of toolbarSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box && box.width > 50) {
          await element.screenshot({
            path: path.join(
              outputDir,
              "toolbar/filter-toolbar-search-autocomplete.png"
            ),
          });
          console.log(`   ✓ Captured using selector: ${selector}`);
          console.log(
            `   ✓ Size: ${Math.round(box.width)}x${Math.round(box.height)}px\n`
          );
          toolbar3Found = true;
          break;
        }
      }
    }

    if (!toolbar3Found) {
      console.log("   ⚠ Using fallback clipping\n");
      await page.screenshot({
        path: path.join(
          outputDir,
          "toolbar/filter-toolbar-search-autocomplete.png"
        ),
        clip: { x: 20, y: 20, width: 420, height: 320 },
      });
    }

    // =================================================================
    // ORG TREE FILTER SCREENSHOTS (3)
    // =================================================================

    console.log("📸 OrgTreeFilter Screenshots\n");

    const treeSelectors = [
      '[data-testid="org-tree-filter"]',
      ".org-tree-filter",
      '[class*="OrgTree"]',
      '[role="tree"]',
      "#storybook-root > div",
    ];

    // 4. Org Tree Filter - Expanded
    console.log("4/6 Generating org-tree-filter-expanded.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-dashboard-filters-orgtreefilter--tree-expanded&viewMode=story&theme=light`
    );
    await page.waitForTimeout(2500);

    let tree1Found = false;
    for (const selector of treeSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box && box.width > 100 && box.height > 100) {
          await element.screenshot({
            path: path.join(outputDir, "filters/org-tree-filter-expanded.png"),
          });
          console.log(`   ✓ Captured using selector: ${selector}`);
          console.log(
            `   ✓ Size: ${Math.round(box.width)}x${Math.round(box.height)}px\n`
          );
          tree1Found = true;
          break;
        }
      }
    }

    if (!tree1Found) {
      console.log("   ⚠ Using fallback clipping\n");
      await page.screenshot({
        path: path.join(outputDir, "filters/org-tree-filter-expanded.png"),
        clip: { x: 20, y: 20, width: 320, height: 400 },
      });
    }

    // 5. Org Tree Filter - Search
    console.log("5/6 Generating org-tree-filter-search.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-dashboard-filters-orgtreefilter--search-results&viewMode=story&theme=light`
    );
    await page.waitForTimeout(2500);

    let tree2Found = false;
    for (const selector of treeSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box && box.width > 100 && box.height > 100) {
          await element.screenshot({
            path: path.join(outputDir, "filters/org-tree-filter-search.png"),
          });
          console.log(`   ✓ Captured using selector: ${selector}`);
          console.log(
            `   ✓ Size: ${Math.round(box.width)}x${Math.round(box.height)}px\n`
          );
          tree2Found = true;
          break;
        }
      }
    }

    if (!tree2Found) {
      console.log("   ⚠ Using fallback clipping\n");
      await page.screenshot({
        path: path.join(outputDir, "filters/org-tree-filter-search.png"),
        clip: { x: 20, y: 20, width: 320, height: 400 },
      });
    }

    // 6. Org Tree Filter - Multi-Select
    console.log("6/6 Generating org-tree-filter-multi-select.png...");
    await page.goto(
      `${storybookUrl}/iframe.html?id=app-dashboard-filters-orgtreefilter--multi-select&viewMode=story&theme=light`
    );
    await page.waitForTimeout(2500);

    let tree3Found = false;
    for (const selector of treeSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box && box.width > 100 && box.height > 100) {
          await element.screenshot({
            path: path.join(outputDir, "filters/org-tree-multi-select.png"),
          });
          console.log(`   ✓ Captured using selector: ${selector}`);
          console.log(
            `   ✓ Size: ${Math.round(box.width)}x${Math.round(box.height)}px\n`
          );
          tree3Found = true;
          break;
        }
      }
    }

    if (!tree3Found) {
      console.log("   ⚠ Using fallback clipping\n");
      await page.screenshot({
        path: path.join(outputDir, "filters/org-tree-multi-select.png"),
        clip: { x: 20, y: 20, width: 320, height: 400 },
      });
    }

    console.log("✅ All screenshots generated successfully!\n");

    // Print summary
    console.log("📊 Screenshot Summary:");
    console.log("   FilterToolbar: 3 screenshots");
    console.log("   OrgTreeFilter: 3 screenshots");
    console.log("   Total: 6 screenshots\n");

    console.log("📂 Output directory:");
    console.log(`   ${outputDir}\n`);
  } catch (error) {
    console.error("❌ Error generating screenshots:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

generateAllFilterScreenshots().catch(console.error);
