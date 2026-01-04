/**
 * Final Right Panel reorganization
 *
 * New structure:
 * App/
 *   Right Panel/
 *     Details/        (EmployeeDetails, EmployeeFlags, RatingsTimeline, ManagementChain)
 *     Changes/        (ChangeTrackerTab, EmployeeChangesSummary, EventDisplay)
 *     Statistics/     (All stats + DistributionChart)
 *     Intelligence/   (Moved from App/Intelligence)
 */

import * as fs from "fs";
import { glob } from "glob";

// Mapping of old title prefixes to new prefixes
const titleMappings: Record<string, string> = {
  // Move Intelligence under Right Panel
  "App/Intelligence/AnomalySection":
    "App/Right Panel/Intelligence/AnomalySection",
  "App/Intelligence/DeviationChart":
    "App/Right Panel/Intelligence/DeviationChart",
  "App/Intelligence/IntelligenceSummary":
    "App/Right Panel/Intelligence/IntelligenceSummary",
  "App/Intelligence/LevelDistributionChart":
    "App/Right Panel/Intelligence/LevelDistributionChart",

  // Group employee details under Details
  "App/Right Panel/EmployeeDetails": "App/Right Panel/Details/EmployeeDetails",
  "App/Right Panel/EmployeeFlags": "App/Right Panel/Details/EmployeeFlags",
  "App/Right Panel/RatingsTimeline": "App/Right Panel/Details/RatingsTimeline",
  "App/Right Panel/ManagementChain": "App/Right Panel/Details/ManagementChain",

  // Group change tracking under Changes
  "App/Right Panel/ChangeTrackerTab":
    "App/Right Panel/Changes/ChangeTrackerTab",
  "App/Right Panel/EmployeeChangesSummary":
    "App/Right Panel/Changes/EmployeeChangesSummary",
  "App/Right Panel/Events/EventDisplay": "App/Right Panel/Changes/EventDisplay",

  // Move DistributionChart into Statistics
  "App/Right Panel/DistributionChart":
    "App/Right Panel/Statistics/DistributionChart",
};

async function updateStoryTitles() {
  console.log("🔄 Final Right Panel reorganization...\n");

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
    const newTitle = titleMappings[currentTitle];

    if (newTitle) {
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
    }
  }

  console.log("=".repeat(60));
  console.log(`✅ Updated ${updatedCount} story files`);
  console.log("=".repeat(60));

  console.log("\nFinal Right Panel structure:");
  console.log("App/");
  console.log("  └── Right Panel/");
  console.log("      ├── Details/");
  console.log("      │   ├── EmployeeDetails");
  console.log("      │   ├── EmployeeFlags");
  console.log("      │   ├── RatingsTimeline");
  console.log("      │   └── ManagementChain");
  console.log("      ├── Changes/");
  console.log("      │   ├── ChangeTrackerTab");
  console.log("      │   ├── EmployeeChangesSummary");
  console.log("      │   └── EventDisplay");
  console.log("      ├── Statistics/");
  console.log("      │   ├── DistributionChart");
  console.log("      │   ├── StatisticCard");
  console.log("      │   ├── StatisticsSummary");
  console.log("      │   ├── ColoredPercentageBar");
  console.log("      │   ├── DistributionRow");
  console.log("      │   ├── DistributionTable");
  console.log("      │   └── GroupingIndicator");
  console.log("      └── Intelligence/");
  console.log("          ├── AnomalySection");
  console.log("          ├── DeviationChart");
  console.log("          ├── IntelligenceSummary");
  console.log("          └── LevelDistributionChart");
}

updateStoryTitles();
