/**
 * Reorganize Storybook story titles to match app component hierarchy
 *
 * New hierarchy:
 * App/
 *   Grid/
 *   Dashboard/
 *   Right Panel/
 *   Intelligence/
 *   Dialogs/
 *   Common/
 * Design System/
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// Mapping of old titles to new titles
const titleMappings: Record<string, string> = {
  // Grid components (top priority - main feature)
  "Grid/NineBoxGrid": "App/Grid/NineBoxGrid",
  "Grid/EmployeeTile": "App/Grid/EmployeeTile",
  "Grid/EmployeeTileList": "App/Grid/EmployeeTileList",
  "Grid/GridBox": "App/Grid/GridBox",
  "Grid/BoxHeader": "App/Grid/BoxHeader",
  "Grid/Axis": "App/Grid/Axis",

  // Dashboard components
  "Dashboard/AppBar/PureAppBar": "App/Dashboard/AppBar",
  "Dashboard/AppBar/HelpButton": "App/Dashboard/HelpButton",
  "Dashboard/PureAppBar": "App/Dashboard/AppBar",
  "Dashboard/FileMenuButton": "App/Dashboard/FileMenuButton",
  "Dashboard/FileNameDisplay": "App/Dashboard/FileNameDisplay",
  "Dashboard/FilterDrawer": "App/Dashboard/FilterDrawer",
  "Dashboard/ChangeIndicator": "App/Dashboard/ChangeIndicator",
  "Dashboard/DashboardEmptyState": "App/Dashboard/EmptyState",

  // Dashboard filters
  "Dashboard/FilterSection": "App/Dashboard/Filters/FilterSection",
  "Dashboard/Filters/GridPositionFilter":
    "App/Dashboard/Filters/GridPositionFilter",
  "Dashboard/Filters/ReportingChainFilter":
    "App/Dashboard/Filters/ReportingChainFilter",
  "Dashboard/Filters/FlagFilters": "App/Dashboard/Filters/FlagFilters",
  "Dashboard/Filters/FilterSection": "App/Dashboard/Filters/FilterSection",
  "Dashboard/Filters/ExclusionList": "App/Dashboard/Filters/ExclusionList",

  // Right Panel - Details (employee information)
  "Panel/EmployeeDetails": "App/Right Panel/Details/EmployeeDetails",
  "Panel/EmployeeFlags": "App/Right Panel/Details/EmployeeFlags",
  "Panel/RatingsTimeline": "App/Right Panel/Details/RatingsTimeline",
  "Panel/ManagementChain": "App/Right Panel/Details/ManagementChain",

  // Right Panel - Changes (change tracking and events)
  "Panel/ChangeTrackerTab": "App/Right Panel/Changes/ChangeTrackerTab",
  "Panel/EmployeeChangesSummary":
    "App/Right Panel/Changes/EmployeeChangesSummary",
  "Components/Panel/EmployeeChangesSummary":
    "App/Right Panel/Changes/EmployeeChangesSummary",
  "Components/Panel/ChangeTrackerTab":
    "App/Right Panel/Changes/ChangeTrackerTab",
  "Events/EventDisplay": "App/Right Panel/Changes/EventDisplay",
  "Components/Events/EventDisplay": "App/Right Panel/Changes/EventDisplay",

  // Right Panel - Statistics (grid distribution and metrics)
  "Panel/DistributionChart": "App/Right Panel/Statistics/DistributionChart",
  "Panel/Statistics/ColoredPercentageBar":
    "App/Right Panel/Statistics/ColoredPercentageBar",
  "Panel/Statistics/DistributionRow":
    "App/Right Panel/Statistics/DistributionRow",
  "Panel/Statistics/DistributionTable":
    "App/Right Panel/Statistics/DistributionTable",
  "Panel/Statistics/GroupingIndicator":
    "App/Right Panel/Statistics/GroupingIndicator",
  "Panel/Statistics/StatisticCard": "App/Right Panel/Statistics/StatisticCard",
  "Panel/Statistics/StatisticsSummary":
    "App/Right Panel/Statistics/StatisticsSummary",

  // Right Panel - Intelligence (analytics and insights)
  "Intelligence/AnomalySection": "App/Right Panel/Intelligence/AnomalySection",
  "Intelligence/DeviationChart": "App/Right Panel/Intelligence/DeviationChart",
  "Intelligence/IntelligenceSummary":
    "App/Right Panel/Intelligence/IntelligenceSummary",
  "Intelligence/LevelDistributionChart":
    "App/Right Panel/Intelligence/LevelDistributionChart",

  // Intelligence atoms
  "Intelligence/Atoms/AnomalyCard": "App/Intelligence/Atoms/AnomalyCard",
  "Intelligence/Atoms/InsightCard": "App/Intelligence/Atoms/InsightCard",

  // Intelligence sections
  "Intelligence/Sections/AnomaliesSection":
    "App/Intelligence/Sections/AnomaliesSection",
  "Intelligence/Sections/DistributionSection":
    "App/Intelligence/Sections/DistributionSection",
  "Intelligence/Sections/InsightsSection":
    "App/Intelligence/Sections/InsightsSection",

  // Dialogs
  "Dialogs/ApplyChangesDialog": "App/Dialogs/ApplyChangesDialog",
  "Dialogs/LoadSampleDialog": "App/Dialogs/LoadSampleDialog",
  "Dialogs/UnsavedChangesDialog": "App/Dialogs/UnsavedChangesDialog",

  // Common components
  "Common/EmptyState": "App/Common/EmptyState",
  "Common/FileUploadDialog": "App/Common/FileUploadDialog",
  "Common/LoadingSpinner": "App/Common/LoadingSpinner",
  "Common/ZoomControls": "App/Common/ZoomControls",
  "Common/ViewControls": "App/Common/ViewControls",
  "Common/ConfirmDialog": "App/Common/ConfirmDialog",
  "Common/LanguageSelector": "App/Common/LanguageSelector",
  "Common/ConnectionStatus": "App/Common/ConnectionStatus",
  "Common/ErrorBoundary": "App/Common/ErrorBoundary",

  // Settings
  "Settings/SettingsDialog": "App/Settings/SettingsDialog",

  // Branding
  "Branding/Logo": "App/Branding/Logo",

  // Design System (move ThemeTest here)
  ThemeTest: "Design System/Theme",

  // Any old "Components/*" paths
  "Components/EmptyState": "App/Common/EmptyState",
};

async function updateStoryTitles() {
  console.log("🔄 Reorganizing story titles to match app hierarchy...\n");

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
      console.log(
        `⚠️  No title found in ${path.relative(process.cwd(), filePath)}`
      );
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

  console.log("\nNew Storybook navigation structure:");
  console.log("App/");
  console.log(
    "  ├── Grid/              (NineBoxGrid, EmployeeTile, GridBox, ...)"
  );
  console.log("  ├── Dashboard/         (AppBar, Filters, ...)");
  console.log("  ├── Right Panel/");
  console.log("  │   ├── Details/       (EmployeeDetails, EmployeeFlags, ...)");
  console.log(
    "  │   ├── Changes/       (ChangeTrackerTab, EmployeeChangesSummary, EventDisplay)"
  );
  console.log(
    "  │   ├── Statistics/    (DistributionChart, StatisticCard, ...)"
  );
  console.log("  │   └── Intelligence/  (AnomalySection, DeviationChart, ...)");
  console.log(
    "  ├── Dialogs/           (ApplyChangesDialog, LoadSampleDialog, ...)"
  );
  console.log("  ├── Common/            (EmptyState, FileUploadDialog, ...)");
  console.log("  ├── Branding/          (Logo)");
  console.log("  └── Settings/");
  console.log("\nDesign System/");
  console.log("  └── Theme");
}

updateStoryTitles();
