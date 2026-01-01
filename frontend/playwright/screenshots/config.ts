/**
 * Screenshot metadata registry for documentation screenshot generation
 *
 * This file maps screenshot identifiers to their workflow modules, functions,
 * output paths, and descriptions. Each screenshot is defined by metadata that
 * tells the generator which function to call and where to save the output.
 *
 * ## Story Tagging System
 *
 * All Storybook stories referenced in this config (via `storyId`) are tagged
 * with metadata to indicate their purpose:
 *
 * - `['autodocs', 'screenshot']` - Stories used for screenshot generation
 * - `['autodocs', 'experimental']` - Experimental/testing stories (zoom, variants)
 * - `['autodocs']` - Regular component documentation stories
 *
 * This tagging helps organize the Storybook UI and makes it easy to identify
 * which stories are critical for documentation vs. temporary testing.
 *
 * ### Validation
 *
 * Run `npm run stories:validate-screenshots` to verify that all story IDs
 * in this config have the correct 'screenshot' tag in their story files.
 */

/**
 * Screenshot source type
 *
 * Indicates whether the screenshot should be generated from Storybook
 * (isolated component) or from the full application (workflow/integration).
 *
 * - storybook: Component-level screenshot from Storybook story (faster, more reliable)
 * - full-app: Full application screenshot with navigation and state setup
 */
export type ScreenshotSource = "storybook" | "full-app";

/**
 * Cropping strategy for screenshot capture
 *
 * - element: Capture specific UI element only (button, card, field)
 * - container: Capture container with multiple elements (drawer, panel, dialog)
 * - panel: Capture right/left panel area
 * - grid: Capture the 9-box grid area
 * - full-page: Capture entire viewport
 */
export type CroppingStrategy =
  | "element"
  | "container"
  | "panel"
  | "grid"
  | "full-page";

export interface ScreenshotMetadata {
  /** Source type: storybook (component) or full-app (workflow) */
  source: ScreenshotSource;
  /** Module name in workflows/ directory (e.g., 'quickstart', 'changes', 'storybook-components') */
  workflow: string;
  /** Function name within the workflow module (e.g., 'generateChangesTab') */
  function: string;
  /** Output path for the screenshot file */
  path: string;
  /** Human-readable description of what this screenshot shows */
  description: string;
  /** True if requires manual capture/composition (not automated) */
  manual?: boolean;
  /** Cropping strategy - what portion of the screen to capture */
  cropping?: CroppingStrategy;
  /** For Storybook screenshots: the story ID (e.g., 'grid-employeetile--modified') */
  storyId?: string;
}

/**
 * Screenshot registry
 *
 * Maps screenshot identifiers to their metadata. Screenshot identifiers are used
 * for filtering when running the generator (e.g., npm run screenshots:generate changes-tab).
 */
export const screenshotConfig: Record<string, ScreenshotMetadata> = {
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
  },
  "changes-orange-border": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileModified",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-orange-border.png",
    description: "Employee tile with full orange modified border (2px)",
    storyId: "app-grid-employeetile--modified-normal-mode",
    cropping: "element",
  },
  "changes-employee-details": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeDetailsPanelWithChanges",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-employee-details.png",
    description:
      "Employee details panel showing updated ratings with visible changes",
    storyId: "app-right-panel-details-employeedetails--with-changes",
    cropping: "panel",
  },
  "changes-timeline-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateRatingsTimeline",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-timeline.png",
    description: "Performance History timeline in employee details",
    storyId: "app-right-panel-details-ratingstimeline--default",
    cropping: "panel",
  },
  "changes-tab": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateChangesTab",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-changes-tab.png",
    description: "Changes tab with employee movements",
    storyId: "app-right-panel-changes-changetrackertab--default",
    cropping: "panel",
  },

  // Notes workflow screenshots (1 screenshot)
  "notes-changes-tab-field": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateChangesTab",
    path: "resources/user-guide/docs/images/screenshots/workflow/workflow-changes-add-note.png",
    description: "Changes tab with note field highlighted",
    storyId: "app-right-panel-changes-changetrackertab--grid-changes-only",
    cropping: "panel",
  },

  // Filters workflow screenshots (3 screenshots)
  "filters-active-chips": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateActiveChips",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-active-chips.png",
    description: "AppBar with active filter chips and orange dot indicator",
    storyId: "app-dashboard-appbar--with-active-filters",
    cropping: "element",
  },
  "filters-panel-expanded": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFilterDrawerAllExpanded",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-panel-expanded.png",
    description: "Filter panel expanded showing all filter options",
    storyId: "app-dashboard-filterdrawer--all-sections-expanded",
    cropping: "container",
  },
  "filters-clear-all-button": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFilterDrawerClearAll",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-clear-all-button.png",
    description: "Filter section with Clear All button",
    storyId: "app-dashboard-filters-filtersection--custom-content",
    cropping: "container",
  },

  // Quickstart workflow screenshots (10 screenshots - guided tour)
  "quickstart-file-menu-button": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileMenuButtonNoFile",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-file-menu-button.png",
    description:
      'File menu button in toolbar showing "No file selected" empty state',
    storyId: "app-dashboard-filemenubutton--no-file",
    cropping: "element",
  },
  "quickstart-upload-dialog": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileUploadDialog",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-upload-dialog.png",
    description:
      "File upload dialog with file selection input and upload button",
    storyId: "app-common-fileuploaddialog--open",
    cropping: "container",
  },
  "quickstart-grid-populated": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridPopulated",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-grid-populated.png",
    description: "Populated 9-box grid after successful file upload",
    storyId: "app-grid-nineboxgrid--populated",
    cropping: "container",
  },
  "quickstart-empty-state-sample-button": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmptyStateWithSampleButton",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-empty-state-sample-button.png",
    description:
      "Empty state showing 'Load Sample Data' button for quick onboarding (quickstart tour step 1)",
    storyId: "app-dashboard-emptystate--default",
    cropping: "container",
  },
  "quickstart-load-sample-dialog": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateLoadSampleDialog",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-load-sample-dialog.png",
    description:
      "Load Sample Data confirmation dialog explaining the 200-employee dataset (quickstart tour step 1)",
    storyId: "app-dialogs-loadsampledialog--no-existing-data",
    cropping: "container",
  },
  "quickstart-employee-details-with-history": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeDetailsPanel",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-employee-details-with-history.png",
    description:
      "Employee details panel showing flags, reporting chain, and complete job information (quickstart tour step 2)",
    storyId: "app-right-panel-details-employeedetails--default",
    cropping: "panel",
  },
  "quickstart-timeline-history": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateRatingsTimeline",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-timeline-history.png",
    description:
      "Performance history timeline showing 3-year rating progression (quickstart tour step 3)",
    storyId: "app-right-panel-details-ratingstimeline--with-history",
    cropping: "panel",
  },
  "quickstart-intelligence-bias-detected": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceAnomalyRed",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-intelligence-bias-detected.png",
    description:
      "Intelligence panel showing detected bias patterns in sample data (USA +15%, Sales +20%) - quickstart tour step 5",
    storyId: "app-right-panel-intelligence-anomalysection--red-status",
    cropping: "container",
  },
  "quickstart-statistics-distribution": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generatePanelDistribution",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-statistics-distribution.png",
    description:
      "Statistics tab showing healthy distribution patterns in sample data (quickstart tour step 4)",
    storyId:
      "app-right-panel-statistics-distributiontable--balanced-distribution",
    cropping: "panel",
  },
  // Calibration workflow screenshots (5 screenshots)
  "calibration-file-import": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileMenuImport",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-file-import.png",
    description:
      "File menu open with Import Data menu item highlighted (Storybook: dashboard-appbar-filemenubutton--menu-open)",
    storyId: "app-dashboard-filemenubutton--menu-open",
    cropping: "container",
  },
  "intelligence-summary-anomalies": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceSummaryNeedsAttention",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-anomalies.png",
    description:
      "Intelligence summary showing low quality score and high anomaly count",
    storyId:
      "app-right-panel-intelligence-intelligencesummary--needs-attention",
    cropping: "container",
  },
  "intelligence-anomaly-details": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceAnomalyRed",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-details.png",
    description:
      "Anomaly section showing severe statistical anomalies requiring investigation",
    storyId: "app-right-panel-intelligence-anomalysection--red-status",
    cropping: "container",
  },
  "distribution-chart-ideal": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceLevelDistribution",
    path: "resources/user-guide/docs/images/screenshots/distribution-chart-ideal.png",
    description:
      "Distribution section showing ideal talent distribution across 9-box grid",
    storyId:
      "app-right-panel-intelligence-leveldistributionchart--normal-distribution",
    cropping: "container",
  },

  // Intelligence component screenshots (Storybook-based)
  "intelligence-summary-excellent": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceSummaryExcellent",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-excellent.png",
    description:
      "IntelligenceSummary component with excellent quality score (85+), showing green status and low anomaly count",
    storyId:
      "app-right-panel-intelligence-intelligencesummary--excellent-quality",
    cropping: "container",
  },
  "intelligence-summary-needs-attention": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceSummaryNeedsAttention",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-needs-attention.png",
    description:
      "IntelligenceSummary component with low quality score (<50), showing red status and high anomaly count requiring attention",
    storyId:
      "app-right-panel-intelligence-intelligencesummary--needs-attention",
    cropping: "container",
  },
  "intelligence-anomaly-green": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceAnomalyGreen",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-green.png",
    description:
      "AnomalySection component with green status (p > 0.05), showing no significant statistical issues",
    storyId: "app-right-panel-intelligence-anomalysection--green-status",
    cropping: "container",
  },
  "intelligence-anomaly-red": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceAnomalyRed",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-red.png",
    description:
      "AnomalySection component with red status (p < 0.01), showing severe statistical anomalies requiring investigation",
    storyId: "app-right-panel-intelligence-anomalysection--red-status",
    cropping: "container",
  },
  "intelligence-deviation-chart": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceDeviationChart",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-deviation-chart.png",
    description:
      "DeviationChart showing expected vs actual performance distribution with mixed significance levels (green/yellow/red bars)",
    storyId: "app-right-panel-intelligence-deviationchart--mixed-significance",
    cropping: "container",
  },
  "intelligence-level-distribution": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceLevelDistribution",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-level-distribution.png",
    description:
      "LevelDistributionChart showing normal distribution of Low/Medium/High performers across job levels",
    storyId:
      "app-right-panel-intelligence-leveldistributionchart--normal-distribution",
    cropping: "container",
  },
  "calibration-donut-mode-toggle": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsDonutView",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-donut-mode-toggle.png",
    description: "ViewControls toolbar with donut mode toggle active",
    storyId: "app-common-viewcontrols--donut-view-active",
    cropping: "container",
  },
  // Statistics workflow screenshots (4 Storybook-based screenshots)
  "statistics-panel-distribution": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generatePanelDistribution",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-panel-distribution.png",
    description:
      "Statistics panel distribution table with grouping indicators (balanced distribution)",
    storyId:
      "app-right-panel-statistics-distributiontable--balanced-distribution",
  },
  "statistics-summary-cards": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generateSummaryCards",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-summary-cards.png",
    description:
      "Three summary cards showing total employees, modified employees, and high performers",
    storyId: "app-right-panel-statistics-statisticssummary--default",
  },

  // Donut mode screenshots (1 screenshot)
  "donut-mode-active-layout": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateDonutModeActive",
    path: "resources/user-guide/docs/images/screenshots/donut/donut-mode-active-layout.png",
    description:
      "Active donut mode layout with concentric circles and ghost tiles",
    storyId: "app-grid-nineboxgrid--donut-mode",
    cropping: "container",
  },

  // Grid and basic UI screenshots (2 screenshots)
  "grid-normal": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridPopulated",
    path: "resources/user-guide/docs/images/screenshots/grid-normal.png",
    description: "Standard 9-box grid with employee tiles",
    storyId: "app-grid-nineboxgrid--populated",
    cropping: "container",
  },
  "employee-tile-normal": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileNormal",
    path: "resources/user-guide/docs/images/screenshots/employee-tile-normal.png",
    description: "Individual employee tile showing name and role",
    storyId: "app-grid-employeetile--default",
  },

  // Additional features screenshots (5 screenshots)
  "timeline-employee-history": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateRatingsTimeline",
    path: "resources/user-guide/docs/images/screenshots/timeline-employee-history.png",
    description: "Employee movement timeline showing historical positions",
    storyId: "app-right-panel-details-ratingstimeline--with-history",
  },
  "employee-details-panel-expanded": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeDetailsPanel",
    path: "resources/user-guide/docs/images/screenshots/employee-details-panel-expanded.png",
    description: "Expanded employee details panel with all information",
    storyId: "app-right-panel-details-employeedetails--default",
  },
  "file-menu-apply-changes": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileMenuApplyChanges",
    path: "resources/user-guide/docs/images/screenshots/file-menu-apply-changes.png",
    description: "File menu dropdown open showing menu options",
    storyId: "app-dashboard-filemenubutton--menu-open",
    cropping: "container",
  },

  // Zoom controls screenshot (1 screenshot)
  "zoom-controls": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsGridView",
    path: "resources/user-guide/docs/images/screenshots/zoom-controls.png",
    description:
      "ViewControls toolbar showing zoom controls, view toggle, and fullscreen button",
    storyId: "app-common-viewcontrols--grid-view-active",
    cropping: "container",
  },

  // ViewControls consolidation screenshots (6 screenshots)
  "view-controls-main-interface": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsGridView",
    path: "resources/user-guide/docs/images/screenshots/view-controls/main-interface.png",
    description:
      "ViewControls toolbar showing all controls: view toggle, zoom, and fullscreen",
    storyId: "app-common-viewcontrols--grid-view-active",
    cropping: "container",
  },
  "view-controls-grid-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsGridView",
    storyId: "app-common-viewcontrols--grid-view-active",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-grid.png",
    description:
      "Closeup of ViewControls toolbar with Grid view active, showing toggle, zoom controls, and fullscreen button",
    cropping: "container",
  },
  "view-controls-donut-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsDonutView",
    storyId: "app-common-viewcontrols--donut-view-active",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-donut.png",
    description: "ViewControls toolbar with Donut view active",
    cropping: "container",
  },
  "view-controls-settings-dialog": {
    source: "storybook",
    workflow: "view-controls",
    function: "generateSettingsDialog",
    path: "resources/user-guide/docs/images/screenshots/view-controls/settings-dialog.png",
    description:
      "Settings dialog showing theme options (Light/Dark/Auto) and language dropdown (English/Español)",
    storyId: "app-settings-settingsdialog--open",
    cropping: "container",
  },
  "view-controls-simplified-appbar": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateSimplifiedAppBar",
    path: "resources/user-guide/docs/images/screenshots/view-controls/simplified-appbar.png",
    description:
      "Simplified AppBar showing only Logo, File menu, Help button, and Settings button",
    storyId: "app-dashboard-appbar--file-loaded",
  },
  "view-controls-fullscreen": {
    source: "full-app",
    workflow: "view-controls",
    function: "generateFullscreenMode",
    path: "resources/user-guide/docs/images/screenshots/view-controls/fullscreen-mode.png",
    description:
      "Application in fullscreen mode (note: actual fullscreen requires F11, this shows pre-fullscreen view)",
    cropping: "full-page",
  },

  // Details Panel enhancements screenshots (6 screenshots)
  "details-current-assessment": {
    source: "storybook",
    workflow: "details-panel-enhancements",
    function: "generateCurrentAssessmentEnhanced",
    path: "resources/user-guide/docs/images/screenshots/details-panel/current-assessment-enhanced.png",
    description:
      "Enhanced Current Assessment section showing box name, grid coordinates, color-coded performance/potential chips with exterior padding",
    storyId: "app-right-panel-details-employeedetails--default-with-padding",
    cropping: "element",
  },
  "details-flags-ui": {
    source: "storybook",
    workflow: "details-panel-enhancements",
    function: "generateFlagsUI",
    path: "resources/user-guide/docs/images/screenshots/details-panel/flags-ui.png",
    description:
      "Flags section in Details panel with Add Flag picker and colored flag chips",
    storyId: "app-right-panel-details-employeeflags--with-multiple-flags",
    cropping: "container",
  },
  "details-flag-badges": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileFlagged",
    path: "resources/user-guide/docs/images/screenshots/details-panel/flag-badges.png",
    description:
      "Employee tiles showing individual colored flag badges (16px circular) in top-right corner",
    storyId: "app-grid-employeetile--with-flags",
    cropping: "container",
  },
  "details-reporting-chain-clickable": {
    source: "storybook",
    workflow: "details-panel-enhancements",
    function: "generateReportingChainClickable",
    path: "resources/user-guide/docs/images/screenshots/details-panel/reporting-chain-clickable.png",
    description:
      "Reporting Chain section with clickable manager names (blue underlined links)",
    storyId: "app-right-panel-details-managementchain--with-manager",
    cropping: "container",
  },
  // FilterDrawer screenshots (4 new screenshots)
  "filters-multiple-active": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateMultipleFiltersActive",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-multiple-active.png",
    description:
      "FilterDrawer with multiple filter types active: Job Functions, Locations, Flags, and Reporting Chain filters with count badges",
    storyId: "app-dashboard-filterdrawer--multiple-filters-active",
    cropping: "container",
  },
  "filters-flags-section": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFlagsFiltering",
    path: "resources/user-guide/docs/images/screenshots/filters/flags-section.png",
    description:
      "Flags section in FilterDrawer showing all 8 flag types with checkboxes, counts, and active selections",
    storyId: "app-dashboard-filterdrawer--flags-active",
    cropping: "container",
  },
  "filters-reporting-chain": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateReportingChainFilterActive",
    path: "resources/user-guide/docs/images/screenshots/filters/reporting-chain-filter.png",
    description:
      "Reporting Chain section in FilterDrawer with active manager filter chip",
    storyId: "app-dashboard-filterdrawer--reporting-chain-active",
    cropping: "container",
  },

  // File Operations workflow screenshots (5 screenshots)
  "file-menu-recent-files": {
    source: "full-app",
    workflow: "file-operations",
    function: "generateFileMenuWithRecents",
    path: "resources/user-guide/docs/images/screenshots/file-ops/file-menu-recent-files.png",
    description:
      "File menu dropdown showing recent files list, import, apply changes, and close options",
    cropping: "container",
  },
  "unsaved-changes-dialog": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateUnsavedChangesDialog",
    path: "resources/user-guide/docs/images/screenshots/file-ops/unsaved-changes-dialog.png",
    description:
      "Unsaved Changes protection dialog with Apply Changes, Discard, and Cancel options",
    storyId: "app-dialogs-unsavedchangesdialog--multiple-changes",
    cropping: "container",
  },
  "apply-changes-dialog-default": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateApplyChangesDialogDefault",
    path: "resources/user-guide/docs/images/screenshots/file-ops/apply-changes-dialog-default.png",
    description:
      "Apply Changes dialog in default mode (update original file, checkbox unchecked)",
    storyId: "app-dialogs-applychangesdialog--default",
    cropping: "container",
  },
  "apply-changes-dialog-save-as": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateApplyChangesDialogSaveAs",
    path: "resources/user-guide/docs/images/screenshots/file-ops/apply-changes-dialog-save-as.png",
    description:
      "Apply Changes dialog in save-as mode (save to different file, checkbox checked)",
    storyId: "app-dialogs-applychangesdialog--default",
    cropping: "container",
  },
  "file-error-fallback": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateFileErrorFallback",
    path: "resources/user-guide/docs/images/screenshots/file-ops/file-error-fallback.png",
    description:
      "File error fallback - error message when original file can't be updated",
    storyId: "app-dialogs-applychangesdialog--with-error",
    cropping: "container",
  },

  // Exclusion Dialog screenshot
  "exclusions-dialog": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateExclusionsDialog",
    path: "resources/user-guide/docs/images/screenshots/filters/exclusions-dialog.png",
    description:
      "Manage Exclusions dialog with search field, quick filter buttons, and employee checkbox list",
    storyId: "app-dashboard-exclusiondialog--default",
    cropping: "container",
  },

  // Intelligence Detector Screenshots (4 bias detectors)
  "intelligence-location": {
    source: "storybook",
    workflow: "intelligence-storybook",
    function: "generateLocationBias",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-location.png",
    description:
      "Location bias detector showing performance distribution across offices and remote workers",
    storyId:
      "app-right-panel-intelligence-anomalysection--location-bias-detector",
    cropping: "container",
  },
  "intelligence-function": {
    source: "storybook",
    workflow: "intelligence-storybook",
    function: "generateFunctionBias",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-function.png",
    description:
      "Job function bias detector showing performance distribution across departments",
    storyId:
      "app-right-panel-intelligence-anomalysection--function-bias-detector",
    cropping: "container",
  },
  "intelligence-level": {
    source: "storybook",
    workflow: "intelligence-storybook",
    function: "generateLevelBias",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-level.png",
    description:
      "Job level bias detector showing performance distribution across job levels",
    storyId: "app-right-panel-intelligence-anomalysection--level-bias-detector",
    cropping: "container",
  },
  "intelligence-tenure": {
    source: "storybook",
    workflow: "intelligence-storybook",
    function: "generateTenureBias",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-tenure.png",
    description:
      "Tenure bias detector showing performance distribution across tenure categories",
    storyId:
      "app-right-panel-intelligence-anomalysection--tenure-bias-detector",
    cropping: "container",
  },

  // Distribution Table screenshot
  "distribution-table": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generateDistributionTable",
    path: "resources/user-guide/docs/images/screenshots/statistics/distribution-table.png",
    description:
      "9-box distribution table showing employee counts and percentages per position",
    storyId:
      "app-right-panel-statistics-distributiontable--balanced-distribution",
    cropping: "container",
  },
};

/**
 * Get all screenshot names
 */
export function getAllScreenshotNames(): string[] {
  return Object.keys(screenshotConfig);
}

/**
 * Get screenshots by workflow
 */
export function getScreenshotsByWorkflow(
  workflow: string
): Record<string, ScreenshotMetadata> {
  return Object.fromEntries(
    Object.entries(screenshotConfig).filter(
      ([_, meta]) => meta.workflow === workflow
    )
  );
}

/**
 * Get automated screenshots (those that can be generated by workflow functions)
 *
 * @returns Record of automated screenshot configurations
 */
export function getAutomatedScreenshots(): Record<string, ScreenshotMetadata> {
  return Object.fromEntries(
    Object.entries(screenshotConfig).filter(([_, metadata]) => !metadata.manual)
  );
}

/**
 * Get manual screenshots (those requiring manual creation/annotation)
 *
 * @returns Record of manual screenshot configurations
 */
export function getManualScreenshots(): Record<string, ScreenshotMetadata> {
  return Object.fromEntries(
    Object.entries(screenshotConfig).filter(
      ([_, metadata]) => metadata.manual === true
    )
  );
}
