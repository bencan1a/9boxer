/**
 * Script to add screenshot metadata to individual stories
 *
 * This script adds `parameters: { screenshot: { enabled: true, id: 'screenshot-name' } }`
 * to specific stories that are used for documentation screenshot generation.
 *
 * This makes it easy to identify which exact stories are screenshot-critical,
 * not just which files contain screenshot stories.
 *
 * Usage: tsx scripts/add-screenshot-metadata.ts
 */

import * as fs from "fs";
import * as path from "path";
import { screenshotConfig } from "../playwright/screenshots/config";

interface StoryMapping {
  storyId: string;
  screenshotId: string;
  storyName: string;
  filePath: string | null;
}

function convertTitleToStoryId(title: string, storyName: string): string {
  const titlePart = title.toLowerCase().replace(/\//g, "-");
  const storyPart = storyName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")
    .replace(/_/g, "-");
  return `${titlePart}--${storyPart}`;
}

function extractTitleFromFile(content: string): string | null {
  const match = content.match(/title:\s*["']([^"']+)["']/);
  return match ? match[1] : null;
}

function findStoryInFile(
  content: string,
  storyId: string,
  title: string
): string | null {
  // Extract all story exports
  const storyExports = content.matchAll(/export\s+const\s+(\w+):\s*Story/g);

  for (const match of storyExports) {
    const storyName = match[1];
    const expectedId = convertTitleToStoryId(title, storyName);

    if (expectedId === storyId) {
      return storyName;
    }
  }

  return null;
}

function findAllStoryFiles(): Map<string, string> {
  const storyFiles = new Map<string, string>();

  function scanDir(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith(".stories.tsx")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const title = extractTitleFromFile(content);
        if (title) {
          storyFiles.set(title, fullPath);
        }
      }
    }
  }

  scanDir(path.join(process.cwd(), "src"));
  return storyFiles;
}

function createStoryMappings(): StoryMapping[] {
  const storyFiles = findAllStoryFiles();
  const mappings: StoryMapping[] = [];

  // Get all screenshot entries with storyId
  for (const [screenshotId, metadata] of Object.entries(screenshotConfig)) {
    if (!metadata.storyId) continue;

    const storyId = metadata.storyId;

    // Try to find the file by matching story ID pattern
    for (const [title, filePath] of storyFiles.entries()) {
      const content = fs.readFileSync(filePath, "utf-8");
      const storyName = findStoryInFile(content, storyId, title);

      if (storyName) {
        mappings.push({
          storyId,
          screenshotId,
          storyName,
          filePath,
        });
        break;
      }
    }

    // If not found, add with null filePath
    if (!mappings.some((m) => m.storyId === storyId)) {
      const parts = storyId.split("--");
      const storyName =
        parts[1]
          ?.split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join("") || "Unknown";

      mappings.push({
        storyId,
        screenshotId,
        storyName,
        filePath: null,
      });
    }
  }

  return mappings;
}

function addScreenshotMetadataToStory(
  content: string,
  storyName: string,
  screenshotId: string
): string {
  // Find the story export
  const storyRegex = new RegExp(
    `(export\\s+const\\s+${storyName}:\\s*Story\\s*=\\s*\\{)([^}]*(?:\\{[^}]*\\}[^}]*)*)\\}`,
    "s"
  );

  const match = content.match(storyRegex);
  if (!match) {
    console.warn(`Could not find story export for ${storyName}`);
    return content;
  }

  const storyContent = match[2];

  // Check if screenshot metadata already exists
  if (storyContent.includes("screenshot:")) {
    console.log(`    (already has screenshot metadata)`);
    return content;
  }

  // Check if parameters already exists
  if (storyContent.includes("parameters:")) {
    // Add screenshot metadata to existing parameters
    const updated = content.replace(
      new RegExp(
        `(export\\s+const\\s+${storyName}:[^{]*\\{[^}]*parameters:\\s*\\{)`,
        "s"
      ),
      `$1\n    screenshot: { enabled: true, id: '${screenshotId}' },`
    );
    return updated;
  } else {
    // Add parameters object with screenshot metadata
    const updated = content.replace(
      new RegExp(
        `(export\\s+const\\s+${storyName}:\\s*Story\\s*=\\s*\\{)`,
        "s"
      ),
      `$1\n  parameters: {\n    screenshot: { enabled: true, id: '${screenshotId}' },\n  },`
    );
    return updated;
  }
}

function main() {
  console.log("📸 Adding screenshot metadata to individual stories...\n");

  const mappings = createStoryMappings();

  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;

  // Group by file
  const fileGroups = new Map<string, StoryMapping[]>();
  for (const mapping of mappings) {
    if (!mapping.filePath) {
      notFoundCount++;
      console.log(`⚠️  Story not found: ${mapping.storyId}`);
      continue;
    }

    if (!fileGroups.has(mapping.filePath)) {
      fileGroups.set(mapping.filePath, []);
    }
    fileGroups.get(mapping.filePath)!.push(mapping);
  }

  // Process each file
  for (const [filePath, stories] of fileGroups.entries()) {
    const relativePath = path.relative(process.cwd(), filePath);

    try {
      let content = fs.readFileSync(filePath, "utf-8");
      let modified = false;

      for (const story of stories) {
        const updated = addScreenshotMetadataToStory(
          content,
          story.storyName,
          story.screenshotId
        );

        if (updated !== content) {
          content = updated;
          modified = true;
          console.log(
            `  ✓ ${story.storyName} → screenshot: ${story.screenshotId}`
          );
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, "utf-8");
        successCount += stories.length;
        console.log(`✓ ${relativePath} (${stories.length} stories)\n`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${relativePath}:`, error);
      errorCount += stories.length;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary");
  console.log("=".repeat(60));
  console.log(`Total screenshot references: ${mappings.length}`);
  console.log(`✓ Successfully added metadata: ${successCount}`);
  console.log(`⚠️  Stories not found: ${notFoundCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log("=".repeat(60));
}

main();
