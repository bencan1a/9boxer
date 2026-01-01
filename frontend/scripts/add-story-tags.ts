/**
 * Script to add metadata tags to Storybook stories
 *
 * This script categorizes stories into:
 * - Screenshot stories: Used for documentation screenshot generation
 * - Experimental stories: Testing new features (zoom, variants, etc.)
 * - Production stories: Regular component documentation
 *
 * Usage: tsx scripts/add-story-tags.ts
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// Story IDs used for screenshot generation (extracted from playwright/screenshots/config.ts)
const SCREENSHOT_STORY_IDS = new Set([
  "grid-employeetile--modified",
  "panel-employeedetails--with-changes",
  "panel-ratingstimeline--default",
  "panel-changetrackertab--default",
  "components-panel-changetrackertab--grid-changes-only",
  "dashboard-appbar-pureappbar--with-active-filters",
  "dashboard-filterdrawer--all-sections-expanded",
  "dashboard-filtersection--custom-content",
  "dashboard-appbar-filemenubutton--no-file",
  "common-fileuploaddialog--open",
  "grid-nineboxgrid--populated",
  "components-emptystate--default",
  "dialogs-loadsampledialog--no-existing-data",
  "panel-employeedetails--default",
  "panel-ratingstimeline--with-history",
  "intelligence-anomalysection--red-status",
  "panel-statistics-distributiontable--balanced-distribution",
  "dashboard-appbar-filemenubutton--menu-open",
  "intelligence-intelligencesummary--needs-attention",
  "intelligence-leveldistributionchart--normal-distribution",
  "intelligence-intelligencesummary--excellent-quality",
  "intelligence-anomalysection--green-status",
  "intelligence-deviationchart--mixed-significance",
  "common-viewcontrols--donut-view-active",
  "panel-statistics-statisticssummary--default",
  "grid-nineboxgrid--donut-mode",
  "grid-employeetile--default",
  "common-viewcontrols--grid-view-active",
  "settings-settingsdialog--open",
  "dashboard-appbar-pureappbar--file-loaded",
  "panel-employeedetails--default-with-padding",
  "panel-employeeflags--with-multiple-flags",
  "grid-employeetile--with-flags",
  "panel-managementchain--with-manager",
  "dashboard-filterdrawer--multiple-filters-active",
  "dashboard-filterdrawer--flags-active",
  "dashboard-filterdrawer--reporting-chain-active",
  "dialogs-applychangesdialog--default",
  "dialogs-applychangesdialog--with-error",
  "dashboard-dashboardemptystate--default",
]);

// Patterns that indicate experimental stories
const EXPERIMENTAL_PATTERNS = [
  /🔍/, // Emoji indicator for experimental
  /🔬/, // Microscope emoji
  /ZoomLevels/i,
  /OriginalPosition/i,
  /Experimental/i,
  /_Interactive$/,
  /_Comparison$/,
  /_DensityTest$/,
  /_TokenMatrix$/,
  /_AllVariants$/,
];

interface StoryInfo {
  title: string;
  storyNames: string[];
  hasScreenshotStories: boolean;
  hasExperimentalStories: boolean;
  currentTags: string[];
}

function convertTitleToStoryId(title: string, storyName: string): string {
  // Convert title like "Grid/EmployeeTile" to "grid-employeetile"
  const titlePart = title.toLowerCase().replace(/\//g, "-");
  // Convert story name from PascalCase to kebab-case
  const storyPart = storyName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")
    .replace(/_/g, "-");
  return `${titlePart}--${storyPart}`;
}

function isExperimentalStory(storyName: string, storyContent: string): boolean {
  return EXPERIMENTAL_PATTERNS.some(
    (pattern) => pattern.test(storyName) || pattern.test(storyContent)
  );
}

function extractStoryInfo(filePath: string): StoryInfo | null {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract title from meta object
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  if (!titleMatch) {
    console.warn(`⚠️  No title found in ${filePath}`);
    return null;
  }
  const title = titleMatch[1];

  // Extract current tags
  const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);
  const currentTags = tagsMatch
    ? tagsMatch[1].split(",").map((t) => t.trim().replace(/["']/g, ""))
    : [];

  // Extract story exports (e.g., "export const Default: Story = {")
  const storyMatches = content.matchAll(/export\s+const\s+(\w+):\s*Story/g);
  const storyNames = Array.from(storyMatches).map((match) => match[1]);

  // Check if any stories are used for screenshots
  const hasScreenshotStories = storyNames.some((storyName) => {
    const storyId = convertTitleToStoryId(title, storyName);
    return SCREENSHOT_STORY_IDS.has(storyId);
  });

  // Check if any stories are experimental
  const hasExperimentalStories = storyNames.some((storyName) => {
    // Get the story content
    const storyContentMatch = content.match(
      new RegExp(`export const ${storyName}[^}]+\\}`, "s")
    );
    const storyContent = storyContentMatch ? storyContentMatch[0] : "";
    return isExperimentalStory(storyName, storyContent);
  });

  return {
    title,
    storyNames,
    hasScreenshotStories,
    hasExperimentalStories,
    currentTags,
  };
}

function determineNewTags(info: StoryInfo): string[] {
  const tags = new Set<string>(["autodocs"]);

  if (info.hasScreenshotStories) {
    tags.add("screenshot");
  }

  if (info.hasExperimentalStories) {
    tags.add("experimental");
  }

  return Array.from(tags);
}

function updateStoryFile(filePath: string, newTags: string[]): boolean {
  let content = fs.readFileSync(filePath, "utf-8");
  const tagsString = newTags.map((t) => `"${t}"`).join(", ");

  // Check if tags already exist
  const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);

  if (tagsMatch) {
    // Replace existing tags
    content = content.replace(/tags:\s*\[[^\]]+\]/, `tags: [${tagsString}]`);
  } else {
    // Add tags after parameters (if exists) or after component
    const hasParameters = content.includes("parameters:");

    if (hasParameters) {
      // Add tags after parameters block
      content = content.replace(
        /(parameters:\s*\{[^}]+\},?)/,
        `$1\n  tags: [${tagsString}],`
      );
    } else {
      // Add tags after component
      content = content.replace(
        /(component:\s*\w+,?)/,
        `$1\n  tags: [${tagsString}],`
      );
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  return true;
}

async function main() {
  console.log("📋 Adding metadata tags to Storybook stories...\n");

  // Find all story files
  const storyFiles = await glob("src/**/*.stories.tsx", {
    cwd: path.join(__dirname, ".."),
    absolute: true,
  });

  console.log(`Found ${storyFiles.length} story files\n`);

  let updatedCount = 0;
  let errorCount = 0;
  const summary = {
    screenshot: 0,
    experimental: 0,
    production: 0,
  };

  for (const filePath of storyFiles) {
    const relativePath = path.relative(process.cwd(), filePath);

    try {
      const info = extractStoryInfo(filePath);
      if (!info) {
        errorCount++;
        continue;
      }

      const newTags = determineNewTags(info);
      const currentTagsStr = info.currentTags.join(", ");
      const newTagsStr = newTags.join(", ");

      // Skip if tags are already correct
      if (currentTagsStr === newTagsStr) {
        console.log(`✓ ${relativePath} (already tagged: ${newTagsStr})`);
        continue;
      }

      // Update the file
      updateStoryFile(filePath, newTags);
      updatedCount++;

      // Track categories
      if (newTags.includes("screenshot")) summary.screenshot++;
      if (newTags.includes("experimental")) summary.experimental++;
      if (
        !newTags.includes("screenshot") &&
        !newTags.includes("experimental")
      ) {
        summary.production++;
      }

      console.log(`✓ ${relativePath}`);
      console.log(`  Old tags: [${currentTagsStr || "none"}]`);
      console.log(`  New tags: [${newTagsStr}]`);
      console.log();
    } catch (error) {
      console.error(`✗ Error processing ${relativePath}:`, error);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary");
  console.log("=".repeat(60));
  console.log(`Total files: ${storyFiles.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\nCategories:`);
  console.log(`  📸 Screenshot stories: ${summary.screenshot}`);
  console.log(`  🔬 Experimental stories: ${summary.experimental}`);
  console.log(`  ✨ Production stories: ${summary.production}`);
  console.log("=".repeat(60));
}

main().catch(console.error);
