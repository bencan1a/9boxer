/**
 * Reorganize Right Panel stories for better clarity
 *
 * Changes:
 * - App/Panel/* → App/Right Panel/*
 * - Components/Panel/* → App/Right Panel/*
 * - Components/Events/* → App/Right Panel/Events/*
 */

import * as fs from "fs";
import { glob } from "glob";

// Mapping of old title prefixes to new prefixes
const titleMappings: Record<string, string> = {
  "App/Panel": "App/Right Panel",
  "Components/Panel": "App/Right Panel",
  "Components/Events": "App/Right Panel/Events",
};

async function updateStoryTitles() {
  console.log("🔄 Reorganizing Right Panel story titles...\n");

  const storyFiles = await glob("src/**/*.stories.tsx", {
    cwd: process.cwd(),
    absolute: true,
  });

  let updatedCount = 0;

  for (const filePath of storyFiles) {
    let content = fs.readFileSync(filePath, "utf-8");
    const original = content;

    // Extract current title
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    if (!titleMatch) {
      continue;
    }

    const currentTitle = titleMatch[1];

    // Check if any prefix matches
    for (const [oldPrefix, newPrefix] of Object.entries(titleMappings)) {
      if (currentTitle.startsWith(oldPrefix)) {
        const newTitle = currentTitle.replace(oldPrefix, newPrefix);

        content = content.replace(
          /title:\s*["']([^"']+)["']/,
          `title: "${newTitle}"`
        );

        if (content !== original) {
          fs.writeFileSync(filePath, content, "utf-8");
          updatedCount++;
          console.log(`✓ ${currentTitle}`);
          console.log(`  → ${newTitle}\n`);
        }
        break;
      }
    }
  }

  console.log("=".repeat(60));
  console.log(`✅ Updated ${updatedCount} story files`);
  console.log("=".repeat(60));

  console.log("\nNew Right Panel structure:");
  console.log("App/");
  console.log("  └── Right Panel/");
  console.log("      ├── EmployeeDetails");
  console.log("      ├── EmployeeFlags");
  console.log("      ├── RatingsTimeline");
  console.log("      ├── ManagementChain");
  console.log("      ├── ChangeTrackerTab");
  console.log("      ├── EmployeeChangesSummary");
  console.log("      ├── DistributionChart");
  console.log("      ├── Events/");
  console.log("      │   └── EventDisplay");
  console.log("      └── Statistics/");
  console.log("          ├── StatisticCard");
  console.log("          ├── StatisticsSummary");
  console.log("          ├── ColoredPercentageBar");
  console.log("          ├── DistributionRow");
  console.log("          ├── DistributionTable");
  console.log("          └── GroupingIndicator");
}

updateStoryTitles();
