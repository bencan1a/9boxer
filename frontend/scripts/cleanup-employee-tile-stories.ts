/**
 * Cleanup EmployeeTile stories - keep only 5 required stories
 *
 * Keeps:
 * 1. Default
 * 2. Modified (Normal Mode)
 * 3. Modified (Donut Mode)
 * 4. WithFlags
 * 5. ZoomLevels_Interactive
 *
 * Removes all others including OriginalPosition variants
 */

import * as fs from "fs";
import * as path from "path";

const STORIES_TO_KEEP = new Set([
  "Default",
  "Modified",
  "DonutModified",
  "WithFlags",
  "ZoomLevels_Interactive",
]);

function removeStory(content: string, storyName: string): string {
  // Find the story block including its JSDoc comment
  const storyPattern = new RegExp(
    `(/\\*\\*[^*]*\\*/\\s*)?export const ${storyName}: Story = \\{[^}]*(?:\\{[^}]*\\}[^}]*)*\\};?\\n*`,
    "gs"
  );

  return content.replace(storyPattern, "");
}

function main() {
  const filePath = path.join(
    process.cwd(),
    "src/components/grid/EmployeeTile.stories.tsx"
  );
  let content = fs.readFileSync(filePath, "utf-8");

  // Find all story exports
  const storyMatches = content.matchAll(/export const (\w+): Story/g);
  const allStories = Array.from(storyMatches).map((m) => m[1]);

  console.log(`Found ${allStories.length} stories total\n`);

  const storiesToRemove = allStories.filter(
    (name) => !STORIES_TO_KEEP.has(name)
  );

  console.log(`Removing ${storiesToRemove.length} stories:\n`);

  for (const storyName of storiesToRemove) {
    console.log(`  ❌ ${storyName}`);
    content = removeStory(content, storyName);
  }

  console.log(`\nKeeping ${STORIES_TO_KEEP.size} stories:\n`);
  for (const storyName of STORIES_TO_KEEP) {
    console.log(`  ✅ ${storyName}`);
  }

  // Remove "experimental" tag from meta since zoom is now production
  content = content.replace(
    /tags: \["autodocs", "experimental"\]/,
    'tags: ["autodocs"]'
  );

  // Clean up any excessive blank lines
  content = content.replace(/\n\n\n+/g, "\n\n");

  fs.writeFileSync(filePath, content, "utf-8");

  console.log(
    `\n✅ Cleanup complete! ${STORIES_TO_KEEP.size} stories remaining.`
  );
}

main();
