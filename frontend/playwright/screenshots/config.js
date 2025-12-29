"use strict";
/**
 * Screenshot metadata registry for documentation screenshot generation
 *
 * This file maps screenshot identifiers to their workflow modules, functions,
 * output paths, and descriptions. Each screenshot is defined by metadata that
 * tells the generator which function to call and where to save the output.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenshotConfig = void 0;
exports.getAllScreenshotNames = getAllScreenshotNames;
exports.getScreenshotsByWorkflow = getScreenshotsByWorkflow;
exports.getAutomatedScreenshots = getAutomatedScreenshots;
exports.getManualScreenshots = getManualScreenshots;
/**
 * Screenshot registry
 *
 * Maps screenshot identifiers to their metadata. Screenshot identifiers are used
 * for filtering when running the generator (e.g., npm run screenshots:generate changes-tab).
 */
exports.screenshotConfig = {
  // Changes workflow screenshots (5 screenshots)
  "changes-drag-sequence": {
    source: "full-app",
    workflow: "changes",
    function: "generateDragSequence",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-drag-sequence-base.png",
    description:
      "Base grid for 3-panel drag sequence (requires manual composition)",
    manual: true,
    cropping: "grid",
    dimensions: { minWidth: 800, minHeight: 600 },
  },
  "changes-orange-border": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileModified",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-orange-border.png",
    description: "Employee tile with full orange modified border (2px)",
    storyId: "grid-employeetile--modified",
    cropping: "element",
    dimensions: { minWidth: 150, maxWidth: 290, minHeight: 80, maxHeight: 150 },
  },
  "changes-employee-details": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeDetailsPanelWithChanges",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-employee-details.png",
    description:
      "Employee details panel showing updated ratings with visible changes",
    storyId: "panel-employeedetails--with-changes",
    cropping: "panel",
    dimensions: { minWidth: 300, maxWidth: 500, minHeight: 400 },
  },
  "changes-timeline-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateRatingsTimeline",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-timeline.png",
    description: "Performance History timeline in employee details",
    storyId: "panel-ratingstimeline--default",
    cropping: "panel",
    dimensions: { minWidth: 300, maxWidth: 500, minHeight: 400 },
  },
  "changes-tab": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateChangesTab",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-changes-tab.png",
    description: "Changes tab with employee movements",
    storyId: "panel-changetrackertab--default",
    cropping: "panel",
    dimensions: { minWidth: 300, maxWidth: 500, minHeight: 300 },
  },
  // Notes workflow screenshots (1 screenshot)
  "notes-changes-tab-field": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateChangesTab",
    path: "resources/user-guide/docs/images/screenshots/workflow/workflow-changes-add-note.png",
    description: "Changes tab with note field highlighted",
    storyId:
      "components-panel-changetrackertab--single-change-with-empty-notes",
    cropping: "panel",
    dimensions: { minWidth: 300, maxWidth: 500, minHeight: 300 },
  },
  // Filters workflow screenshots (3 screenshots)
  "filters-active-chips": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateActiveChips",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-active-chips.png",
    description: "AppBar with active filter chips and orange dot indicator",
    storyId: "dashboard-appbar-pureappbar--with-active-filters",
    cropping: "element",
    dimensions: {
      minWidth: 300,
      maxWidth: 1400,
      minHeight: 60,
      maxHeight: 100,
    },
  },
  "filters-panel-expanded": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFilterDrawerAllExpanded",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-panel-expanded.png",
    description: "Filter panel expanded showing all filter options",
    storyId: "dashboard-filterdrawer--all-sections-expanded",
    cropping: "container",
    dimensions: { minWidth: 250, maxWidth: 400, minHeight: 300 },
  },
  "filters-clear-all-button": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFilterDrawerClearAll",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-clear-all-button.png",
    description: "Filter section with Clear All button (dark theme)",
    storyId: "dashboard-filterdrawer--location-filters",
    cropping: "container",
    dimensions: { minWidth: 250, maxWidth: 400, minHeight: 300 },
  },
  // Quickstart workflow screenshots (4 screenshots)
  "quickstart-file-menu-button": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileMenuButtonNoFile",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-file-menu-button.png",
    description:
      'File menu button in toolbar showing "No file selected" empty state',
    storyId: "dashboard-appbar-filemenubutton--no-file",
    cropping: "element",
    dimensions: { minWidth: 300, maxWidth: 1400, minHeight: 60, maxHeight: 80 },
  },
  "quickstart-upload-dialog": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileUploadDialog",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-upload-dialog.png",
    description:
      "File upload dialog with file selection input and upload button",
    storyId: "common-fileuploaddialog--open",
    cropping: "container",
    dimensions: {
      minWidth: 260,
      maxWidth: 1500,
      minHeight: 200,
      maxHeight: 1000,
    },
  },
  "quickstart-grid-populated": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridPopulated",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-grid-populated.png",
    description: "Populated 9-box grid after successful file upload",
    storyId: "grid-nineboxgrid--populated",
    cropping: "container",
    dimensions: { minWidth: 800, minHeight: 800 },
  },
  // Calibration workflow screenshots (3 screenshots)
  "calibration-file-import": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileMenuImport",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-file-import.png",
    description:
      "File menu open with Import Data menu item highlighted (Storybook: dashboard-appbar-filemenubutton--menu-open)",
  },
  "calibration-statistics-red-flags": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generateStatisticsRedFlags",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-statistics-red-flags.png",
    description:
      "Statistics tab showing distribution table with problematic patterns",
    storyId: "panel-statistics-distributiontable--skewed-distribution",
    cropping: "container",
  },
  "intelligence-summary-anomalies": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceSummaryNeedsAttention",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-anomalies.png",
    description:
      "Intelligence summary showing low quality score and high anomaly count",
    storyId: "intelligence-intelligencesummary--needs-attention",
    cropping: "container",
  },
  "intelligence-anomaly-details": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceAnomalyRed",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-details.png",
    description:
      "Anomaly section showing severe statistical anomalies requiring investigation",
    storyId: "intelligence-anomalysection--red-status",
    cropping: "container",
  },
  "distribution-chart-ideal": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceLevelDistribution",
    path: "resources/user-guide/docs/images/screenshots/distribution-chart-ideal.png",
    description:
      "Distribution section showing ideal talent distribution across 9-box grid",
    storyId: "intelligence-leveldistributionchart--normal-distribution",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 300 },
  },
  // Intelligence component screenshots (Storybook-based)
  "intelligence-summary-excellent": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceSummaryExcellent",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-excellent.png",
    description:
      "IntelligenceSummary component with excellent quality score (85+), showing green status and low anomaly count",
    storyId: "intelligence-intelligencesummary--excellent-quality",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 150 },
  },
  "intelligence-summary-needs-attention": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceSummaryNeedsAttention",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-needs-attention.png",
    description:
      "IntelligenceSummary component with low quality score (<50), showing red status and high anomaly count requiring attention",
    storyId: "intelligence-intelligencesummary--needs-attention",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 150 },
  },
  "intelligence-anomaly-green": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceAnomalyGreen",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-green.png",
    description:
      "AnomalySection component with green status (p > 0.05), showing no significant statistical issues",
    storyId: "intelligence-anomalysection--green-status",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 300 },
  },
  "intelligence-anomaly-red": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceAnomalyRed",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-red.png",
    description:
      "AnomalySection component with red status (p < 0.01), showing severe statistical anomalies requiring investigation",
    storyId: "intelligence-anomalysection--red-status",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 300 },
  },
  "intelligence-level-distribution": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceLevelDistribution",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-level-distribution.png",
    description:
      "LevelDistributionChart showing normal distribution of Low/Medium/High performers across job levels",
    storyId: "intelligence-leveldistributionchart--normal-distribution",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 250 },
  },
  "calibration-donut-mode-toggle": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsDonutView",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-donut-mode-toggle.png",
    description: "ViewControls toolbar with donut mode toggle active",
    storyId: "common-viewcontrols--donut-view-active",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 60 },
  },
  "calibration-donut-mode-grid": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateDonutModeActive",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-donut-mode-grid.png",
    description:
      "Grid in donut mode showing ghostly purple-bordered employees moved from position-5",
    storyId: "grid-nineboxgrid--donut-mode",
    cropping: "container",
    dimensions: { minWidth: 800, minHeight: 800 },
  },
  // Statistics workflow screenshots (2 Storybook-based screenshots)
  "statistics-panel-distribution": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generatePanelDistribution",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-panel-distribution.png",
    description:
      "Statistics panel distribution table with grouping indicators (balanced distribution)",
    storyId: "panel-statistics-distributiontable--balanced-distribution",
  },
  "statistics-summary-cards": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generateSummaryCards",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-summary-cards.png",
    description:
      "Three summary cards showing total employees, modified employees, and high performers",
    storyId: "panel-statistics-statisticssummary--default",
  },
  // Donut mode screenshots (1 screenshot)
  "donut-mode-active-layout": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateDonutModeActive",
    path: "resources/user-guide/docs/images/screenshots/donut/donut-mode-active-layout.png",
    description:
      "Active donut mode layout with concentric circles and ghost tiles",
    storyId: "grid-nineboxgrid--donut-mode",
    cropping: "container",
    dimensions: { minWidth: 800, minHeight: 800 },
  },
  // Grid and basic UI screenshots (2 screenshots)
  "grid-normal": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridPopulated",
    path: "resources/user-guide/docs/images/screenshots/grid-normal.png",
    description: "Standard 9-box grid with employee tiles",
    storyId: "grid-nineboxgrid--populated",
    cropping: "container",
    dimensions: { minWidth: 800, minHeight: 800 },
  },
  "employee-tile-normal": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileNormal",
    path: "resources/user-guide/docs/images/screenshots/employee-tile-normal.png",
    description: "Individual employee tile showing name and role",
    storyId: "grid-employeetile--default",
  },
  // Additional features screenshots (5 screenshots)
  "timeline-employee-history": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateRatingsTimeline",
    path: "resources/user-guide/docs/images/screenshots/timeline-employee-history.png",
    description: "Employee movement timeline showing historical positions",
    storyId: "panel-ratingstimeline--with-history",
  },
  "employee-details-panel-expanded": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeDetailsPanel",
    path: "resources/user-guide/docs/images/screenshots/employee-details-panel-expanded.png",
    description: "Expanded employee details panel with all information",
    storyId: "panel-employeedetails--default",
  },
  "file-menu-apply-changes": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileMenuApplyChanges",
    path: "resources/user-guide/docs/images/screenshots/file-menu-apply-changes.png",
    description: "File menu dropdown open showing Apply Changes option",
    storyId: "dashboard-appbar-filemenubutton--menu-open-with-changes",
    cropping: "container",
    dimensions: { minWidth: 200, minHeight: 200 },
  },
  // Zoom controls screenshot (1 screenshot)
  "zoom-controls": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsGridView",
    path: "resources/user-guide/docs/images/screenshots/zoom-controls.png",
    description:
      "ViewControls toolbar showing zoom controls, view toggle, and fullscreen button",
    storyId: "common-viewcontrols--grid-view-active",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 60 },
  },
  // ViewControls consolidation screenshots (6 screenshots)
  "view-controls-main-interface": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsGridView",
    path: "resources/user-guide/docs/images/screenshots/view-controls/main-interface.png",
    description:
      "ViewControls toolbar showing all controls: view toggle, zoom, and fullscreen",
    storyId: "common-viewcontrols--grid-view-active",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 60 },
  },
  "view-controls-grid-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsGridView",
    storyId: "common-viewcontrols--grid-view-active",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-grid.png",
    description:
      "Closeup of ViewControls toolbar with Grid view active, showing toggle, zoom controls, and fullscreen button",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 60 },
  },
  "view-controls-donut-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsDonutView",
    storyId: "common-viewcontrols--donut-view-active",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-donut.png",
    description: "ViewControls toolbar with Donut view active",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 60 },
  },
  "view-controls-settings-dialog": {
    source: "storybook",
    workflow: "view-controls",
    function: "generateSettingsDialog",
    path: "resources/user-guide/docs/images/screenshots/view-controls/settings-dialog.png",
    description:
      "Settings dialog showing theme options (Light/Dark/Auto) and language dropdown (English/Español)",
    storyId: "settings-settingsdialog--open",
    cropping: "container",
    dimensions: { minWidth: 400, minHeight: 300 },
  },
  "view-controls-simplified-appbar": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateSimplifiedAppBar",
    path: "resources/user-guide/docs/images/screenshots/view-controls/simplified-appbar.png",
    description:
      "Simplified AppBar showing only Logo, File menu, Help button, and Settings button",
    storyId: "dashboard-appbar-pureappbar--file-loaded",
  },
  "view-controls-fullscreen": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridNormalFullView",
    path: "resources/user-guide/docs/images/screenshots/view-controls/fullscreen-mode.png",
    description:
      "Application in fullscreen mode (note: actual fullscreen requires F11, this shows pre-fullscreen view)",
    storyId: "grid-nineboxgrid--populated",
    cropping: "container",
    dimensions: { minWidth: 1200, minHeight: 1000 },
  },
  // Details Panel enhancements screenshots (6 screenshots)
  "details-current-assessment": {
    source: "storybook",
    workflow: "details-panel-enhancements",
    function: "generateCurrentAssessmentEnhanced",
    path: "resources/user-guide/docs/images/screenshots/details-panel/current-assessment-enhanced.png",
    description:
      "Enhanced Current Assessment section showing box name, grid coordinates, color-coded performance/potential chips with exterior padding",
    storyId: "panel-employeedetails--default-with-padding",
    cropping: "element",
    dimensions: { minWidth: 300, minHeight: 150 },
  },
  "details-flags-ui": {
    source: "storybook",
    workflow: "details-panel-enhancements",
    function: "generateFlagsUI",
    path: "resources/user-guide/docs/images/screenshots/details-panel/flags-ui.png",
    description:
      "Flags section in Details panel with Add Flag picker and colored flag chips",
    storyId: "panel-employeeflags--with-multiple-flags",
    cropping: "container",
    dimensions: { minWidth: 275, minHeight: 120 },
  },
  "details-flag-badges": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileFlagged",
    path: "resources/user-guide/docs/images/screenshots/details-panel/flag-badges.png",
    description:
      "Employee tiles showing individual colored flag badges (16px circular) in top-right corner",
    storyId: "grid-employeetile--with-flags",
    cropping: "container",
    dimensions: { minWidth: 230, minHeight: 220 },
  },
  "details-reporting-chain-clickable": {
    source: "storybook",
    workflow: "details-panel-enhancements",
    function: "generateReportingChainClickable",
    path: "resources/user-guide/docs/images/screenshots/details-panel/reporting-chain-clickable.png",
    description:
      "Reporting Chain section with clickable manager names (blue underlined links)",
    storyId: "panel-managementchain--with-manager",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 200 },
  },
  // FilterDrawer screenshots (4 new screenshots)
  "filters-multiple-active": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateMultipleFiltersActive",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-multiple-active.png",
    description:
      "FilterDrawer with multiple filter types active: Job Functions, Locations, Flags, and Reporting Chain filters with count badges",
    storyId: "dashboard-filterdrawer--multiple-filters-active",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 600 },
  },
  "filters-flags-section": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFlagsFiltering",
    path: "resources/user-guide/docs/images/screenshots/filters/flags-section.png",
    description:
      "Flags section in FilterDrawer showing all 8 flag types with checkboxes, counts, and active selections",
    storyId: "dashboard-filters-flagfilters--multiple-flags-selected",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 400 },
  },
  "filters-reporting-chain": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateReportingChainFilterActive",
    path: "resources/user-guide/docs/images/screenshots/filters/reporting-chain-filter.png",
    description:
      "Reporting Chain section in FilterDrawer with active manager filter chip (dark theme)",
    storyId: "dashboard-filters-reportingchainfilter--with-employee-count",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 200 },
  },
};
/**
 * Get all screenshot names
 */
function getAllScreenshotNames() {
  return Object.keys(exports.screenshotConfig);
}
/**
 * Get screenshots by workflow
 */
function getScreenshotsByWorkflow(workflow) {
  return Object.fromEntries(
    Object.entries(exports.screenshotConfig).filter(function (_a) {
      var _ = _a[0],
        meta = _a[1];
      return meta.workflow === workflow;
    })
  );
}
/**
 * Get automated screenshots (those that can be generated by workflow functions)
 *
 * @returns Record of automated screenshot configurations
 */
function getAutomatedScreenshots() {
  return Object.fromEntries(
    Object.entries(exports.screenshotConfig).filter(function (_a) {
      var _ = _a[0],
        metadata = _a[1];
      return !metadata.manual;
    })
  );
}
/**
 * Get manual screenshots (those requiring manual creation/annotation)
 *
 * @returns Record of manual screenshot configurations
 */
function getManualScreenshots() {
  return Object.fromEntries(
    Object.entries(exports.screenshotConfig).filter(function (_a) {
      var _ = _a[0],
        metadata = _a[1];
      return metadata.manual === true;
    })
  );
}
