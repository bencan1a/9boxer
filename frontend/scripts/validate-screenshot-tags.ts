/**
 * Validation script for screenshot story tags
 *
 * Ensures all story IDs referenced in playwright/screenshots/config.ts
 * have the 'screenshot' tag in their corresponding story files.
 *
 * Usage: tsx scripts/validate-screenshot-tags.ts
 */

import * as fs from "fs";
import * as path from "path";
import { screenshotConfig } from "../playwright/screenshots/config";

interface ValidationResult {
  storyId: string;
  storyFile: string | null;
  hasScreenshotTag: boolean;
  tags: string[];
  error?: string;
}

function storyIdToFilePath(storyId: string): string | null {
  // Convert story ID like "grid-employeetile--modified" to file path
  // Format: "category-componentname--storyname"
  const parts = storyId.split("--");
  if (parts.length !== 2) {
    return null;
  }

  const titlePart = parts[0]; // e.g., "grid-employeetile"
  const titleSegments = titlePart.split("-");

  // Try to reconstruct the file path
  // Common patterns:
  // - "grid-employeetile" -> "grid/EmployeeTile.stories.tsx"
  // - "common-viewcontrols" -> "common/ViewControls.stories.tsx"
  // - "dashboard-appbar-pureappbar" -> "dashboard/PureAppBar.stories.tsx"
  // - "panel-statistics-distributiontable" -> "panel/statistics/DistributionTable.stories.tsx"

  // Convert kebab-case to PascalCase for component name
  const toPascalCase = (str: string) =>
    str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

  // Try different path combinations
  const possiblePaths: string[] = [];

  if (titleSegments.length === 2) {
    // Simple case: category-component
    const [category, component] = titleSegments;
    possiblePaths.push(
      `src/components/${category}/${toPascalCase(component)}.stories.tsx`
    );
  } else if (titleSegments.length === 3) {
    // Could be: category-subcategory-component OR special cases
    const [seg1, seg2, seg3] = titleSegments;

    // Try: category/subcategory/Component.stories.tsx
    possiblePaths.push(
      `src/components/${seg1}/${seg2}/${toPascalCase(seg3)}.stories.tsx`
    );

    // Try: category/Seg2Seg3.stories.tsx (compound name)
    possiblePaths.push(
      `src/components/${seg1}/${toPascalCase(seg2 + "-" + seg3)}.stories.tsx`
    );
  } else if (titleSegments.length === 4) {
    // Likely: category-subcategory-subsubcategory-component
    const [seg1, seg2, seg3, seg4] = titleSegments;
    possiblePaths.push(
      `src/components/${seg1}/${seg2}/${seg3}/${toPascalCase(seg4)}.stories.tsx`
    );
  } else if (titleSegments.length > 4) {
    // Very nested or compound component name
    const category = titleSegments[0];
    const componentName = titleSegments.slice(1).join("-");
    possiblePaths.push(
      `src/components/${category}/${toPascalCase(componentName)}.stories.tsx`
    );
  }

  // Special cases
  if (storyId.startsWith("components-emptystate")) {
    possiblePaths.unshift("src/components/common/EmptyState.stories.tsx");
  }
  if (storyId.startsWith("dashboard-dashboardemptystate")) {
    possiblePaths.unshift(
      "src/components/dashboard/DashboardEmptyState.stories.tsx"
    );
  }

  // Find the first path that exists
  for (const filePath of possiblePaths) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      return filePath;
    }
  }

  return null;
}

function extractTagsFromStoryFile(filePath: string): string[] {
  const fullPath = path.join(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, "utf-8");

  const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);
  if (!tagsMatch) {
    return [];
  }

  return tagsMatch[1]
    .split(",")
    .map((t) => t.trim().replace(/["']/g, ""))
    .filter(Boolean);
}

function validateScreenshotTags(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Get all screenshot entries with storyId
  const screenshotEntries = Object.entries(screenshotConfig).filter(
    ([_, metadata]) => metadata.storyId
  );

  for (const [screenshotId, metadata] of screenshotEntries) {
    const storyId = metadata.storyId!;
    const storyFile = storyIdToFilePath(storyId);

    if (!storyFile) {
      results.push({
        storyId,
        storyFile: null,
        hasScreenshotTag: false,
        tags: [],
        error: `Could not find story file for ${storyId}`,
      });
      continue;
    }

    try {
      const tags = extractTagsFromStoryFile(storyFile);
      const hasScreenshotTag = tags.includes("screenshot");

      results.push({
        storyId,
        storyFile,
        hasScreenshotTag,
        tags,
      });
    } catch (error) {
      results.push({
        storyId,
        storyFile,
        hasScreenshotTag: false,
        tags: [],
        error: `Error reading file: ${error}`,
      });
    }
  }

  return results;
}

function main() {
  console.log("🔍 Validating screenshot story tags...\n");

  const results = validateScreenshotTags();

  const missing = results.filter((r) => !r.hasScreenshotTag);
  const errors = results.filter((r) => r.error);
  const valid = results.filter((r) => r.hasScreenshotTag && !r.error);

  // Print errors
  if (errors.length > 0) {
    console.log("❌ Errors:\n");
    for (const result of errors) {
      console.log(`  ${result.storyId}`);
      console.log(`    Error: ${result.error}\n`);
    }
  }

  // Print missing tags
  if (missing.length > 0 && missing.some((r) => !r.error)) {
    console.log('⚠️  Stories missing "screenshot" tag:\n');
    for (const result of missing.filter((r) => !r.error)) {
      console.log(`  ${result.storyId}`);
      console.log(`    File: ${result.storyFile}`);
      console.log(`    Tags: [${result.tags.join(", ")}]`);
      console.log(`    Expected: Should include "screenshot"\n`);
    }
  }

  // Summary
  console.log("=".repeat(60));
  console.log("📊 Summary");
  console.log("=".repeat(60));
  console.log(`Total screenshot stories: ${results.length}`);
  console.log(`✓ Valid (with "screenshot" tag): ${valid.length}`);
  console.log(
    `⚠️  Missing "screenshot" tag: ${missing.filter((r) => !r.error).length}`
  );
  console.log(`❌ Errors: ${errors.length}`);
  console.log("=".repeat(60));

  // Exit with error if validation failed
  if (missing.length > 0 || errors.length > 0) {
    process.exit(1);
  }

  console.log('\n✅ All screenshot stories have the correct "screenshot" tag!');
}

main();
