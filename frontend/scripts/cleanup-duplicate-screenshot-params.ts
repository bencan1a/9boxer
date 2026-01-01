/**
 * Cleanup script to remove duplicate screenshot parameters
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

async function main() {
  const storyFiles = await glob("src/**/*.stories.tsx", {
    cwd: process.cwd(),
    absolute: true,
  });

  let fixedCount = 0;

  for (const filePath of storyFiles) {
    let content = fs.readFileSync(filePath, "utf-8");
    const original = content;

    // Remove duplicate screenshot parameters
    // Pattern: screenshot: { ... },\n    screenshot: { ... },
    content = content.replace(
      /screenshot:\s*\{[^}]+\},\s*\n\s*screenshot:\s*\{[^}]+\},/g,
      (match) => {
        // Keep only the first occurrence
        const first = match.match(/screenshot:\s*\{[^}]+\},/);
        return first ? first[0] : match;
      }
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf-8");
      fixedCount++;
      console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
    }
  }

  console.log(
    `\nFixed ${fixedCount} files with duplicate screenshot parameters`
  );
}

main();
