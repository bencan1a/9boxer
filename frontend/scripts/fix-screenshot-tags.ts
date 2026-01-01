/**
 * Fix screenshot tags - move from file-level to story-level
 *
 * Removes "screenshot" from meta.tags and adds it to individual stories
 * that have parameters.screenshot metadata
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

async function main() {
  console.log("🔧 Fixing screenshot tags (file-level → story-level)...\n");

  const storyFiles = await glob("src/**/*.stories.tsx", {
    cwd: process.cwd(),
    absolute: true,
  });

  let filesFixed = 0;

  for (const filePath of storyFiles) {
    let content = fs.readFileSync(filePath, "utf-8");
    const original = content;

    // Step 1: Remove "screenshot" from file-level tags
    content = content.replace(
      /tags:\s*\[([^\]]*"screenshot"[^\]]*)\]/,
      (match, tagsContent) => {
        const tags = tagsContent
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => !t.includes("screenshot"))
          .filter(Boolean);
        return `tags: [${tags.join(", ")}]`;
      }
    );

    // Step 2: Add "screenshot" tag to individual stories that have screenshot parameters
    const storyMatches = content.matchAll(
      /export const (\w+): Story = \{[^}]*parameters:\s*\{[^}]*screenshot:\s*\{[^}]*enabled:\s*true[^}]*\}[^}]*\}[^}]*\}/gs
    );

    for (const match of storyMatches) {
      const storyName = match[1];
      const storyBlock = match[0];

      // Check if this story already has tags
      if (storyBlock.includes("tags:")) {
        // Add "screenshot" to existing tags
        content = content.replace(
          new RegExp(
            `(export const ${storyName}: Story = \\{[^}]*tags:\\s*\\[)([^\\]]*)`,
            "s"
          ),
          `$1$2, "screenshot"`
        );
      } else {
        // Add tags array with "screenshot"
        content = content.replace(
          new RegExp(`(export const ${storyName}: Story = \\{)`, "s"),
          `$1\n  tags: ["screenshot"],`
        );
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf-8");
      filesFixed++;
      console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
    }
  }

  console.log(`\n✅ Fixed ${filesFixed} files`);
}

main();
