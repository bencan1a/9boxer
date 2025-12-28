/**
 * Screenshot metadata registry for documentation screenshot generation
 *
 * This file maps screenshot identifiers to their workflow modules, functions,
 * output paths, and descriptions. Each screenshot is defined by metadata that
 * tells the generator which function to call and where to save the output.
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

/**
 * Expected dimensions for screenshot validation
 */
export interface ExpectedDimensions {
  /** Minimum width in pixels */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Exact width (if screenshot should be precise width) */
  exactWidth?: number;
  /** Exact height (if screenshot should be precise height) */
  exactHeight?: number;
}

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
  /** Expected dimensions for validation (helps catch incorrect captures) */
  dimensions?: ExpectedDimensions;
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
    function: "generateEmployeeDetailsPanel",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-employee-details.png",
    description: "Employee details panel showing updated ratings",
    storyId: "panel-employeedetails--default",
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

  // Notes workflow screenshots (3 screenshots)
  "notes-changes-tab-field": {
    source: "full-app",
    workflow: "notes",
    function: "generateChangesTabField",
    path: "resources/user-guide/docs/images/screenshots/workflow/workflow-changes-add-note.png",
    description: "Changes tab with note field highlighted",
  },
  "notes-good-example": {
    source: "full-app",
    workflow: "notes",
    function: "generateGoodExample",
    path: "resources/user-guide/docs/images/screenshots/workflow/workflow-changes-good-note.png",
    description: "Changes tab with well-written note example",
  },
  "notes-export-excel": {
    source: "full-app",
    workflow: "notes",
    function: "generateExportExcel",
    path: "resources/user-guide/docs/images/screenshots/workflow/workflow-changes-notes-in-excel.png",
    description: "Excel export with notes column (manual capture required)",
    manual: true,
  },

  // Filters workflow screenshots (4 screenshots)
  "filters-active-chips": {
    source: "full-app",
    workflow: "filters",
    function: "generateActiveChips",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-active-chips.png",
    description: "Grid view with active filter chips and orange dot indicator",
    cropping: "full-page",
    dimensions: { exactWidth: 1400, exactHeight: 900 },
  },
  "filters-panel-expanded": {
    source: "full-app",
    workflow: "filters",
    function: "generatePanelExpanded",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-panel-expanded.png",
    description: "Filter panel expanded showing all filter options",
    cropping: "container",
    dimensions: { minWidth: 250, maxWidth: 400, minHeight: 300 },
  },
  "filters-before-after": {
    source: "full-app",
    workflow: "filters",
    function: "generateBeforeAfter",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-before-state.png",
    description:
      "Before/after filtering comparison (requires manual 2-panel composition)",
    manual: true,
    cropping: "grid",
    dimensions: { minWidth: 800, minHeight: 600 },
  },
  "filters-clear-all-button": {
    source: "full-app",
    workflow: "filters",
    function: "generateClearAllButton",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-clear-all-button.png",
    description: "Filter drawer with Clear All button highlighted",
    cropping: "container",
    dimensions: { minWidth: 250, maxWidth: 400, minHeight: 300 },
  },

  // Quickstart workflow screenshots (4 screenshots)
  "quickstart-file-menu-button": {
    source: "full-app",
    workflow: "quickstart",
    function: "generateFileMenuButton",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-file-menu-button.png",
    description:
      'File menu button in toolbar showing "No file selected" empty state',
    cropping: "element",
    dimensions: { minWidth: 300, maxWidth: 1400, minHeight: 60, maxHeight: 80 },
  },
  "quickstart-upload-dialog": {
    source: "full-app",
    workflow: "quickstart",
    function: "generateUploadDialog",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-upload-dialog.png",
    description:
      "File upload dialog with file selection input and upload button",
    cropping: "container",
    dimensions: {
      minWidth: 260,
      maxWidth: 1500,
      minHeight: 200,
      maxHeight: 1000,
    },
    source: "full-app",
  },
  "quickstart-grid-populated": {
    source: "full-app",
    workflow: "quickstart",
    function: "generateGridPopulated",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-grid-populated.png",
    description: "Populated 9-box grid after successful file upload",
    cropping: "grid",
    dimensions: { minWidth: 800, minHeight: 600 },
  },
  "quickstart-success-annotated": {
    source: "full-app",
    workflow: "quickstart",
    function: "generateSuccessAnnotated",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-success-annotated.png",
    description:
      "Full application view showing populated grid and employee count (requires manual annotation)",
    manual: true,
    cropping: "full-page",
    dimensions: { exactWidth: 1400, exactHeight: 900 },
  },

  // Calibration workflow screenshots (6 screenshots)
  "calibration-file-import": {
    source: "full-app",
    workflow: "calibration",
    function: "generateFileImport",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-file-import.png",
    description: "File menu open with Import Data menu item highlighted",
  },
  "calibration-statistics-red-flags": {
    source: "full-app",
    workflow: "calibration",
    function: "generateStatisticsRedFlags",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-statistics-red-flags.png",
    description:
      "Statistics tab showing distribution table with problematic patterns",
  },
  "calibration-intelligence-anomalies": {
    source: "full-app",
    workflow: "intelligence",
    function: "generateIntelligenceAnomalies",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-intelligence-anomalies.png",
    description:
      "Intelligence tab showing AI-powered anomaly detection results with populated anomalies and insights sections",
    cropping: "panel",
    dimensions: { minWidth: 300, minHeight: 400 },
  },
  "distribution-chart-ideal": {
    source: "full-app",
    workflow: "intelligence",
    function: "captureDistributionChartIdeal",
    path: "resources/user-guide/docs/images/screenshots/distribution-chart-ideal.png",
    description:
      "Distribution section showing ideal talent distribution across 9-box grid",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 300 },
  },
  "calibration-filters-panel": {
    source: "full-app",
    workflow: "calibration",
    function: "generateFiltersPanel",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-filters-panel.png",
    description: "Filters panel with active filter selections applied",
  },
  "calibration-donut-mode-toggle": {
    source: "full-app",
    workflow: "calibration",
    function: "generateDonutModeToggle",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-donut-mode-toggle.png",
    description: "View mode toggle button in active donut mode state",
  },
  "calibration-donut-mode-grid": {
    source: "full-app",
    workflow: "calibration",
    function: "generateDonutModeGrid",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-donut-mode-grid.png",
    description:
      "Grid in donut mode showing ghostly purple-bordered employees moved from position-5",
  },
  "calibration-export-results": {
    source: "full-app",
    workflow: "calibration",
    function: "generateExportResults",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-export-results.png",
    description: "Exported Excel file with changes applied",
    manual: true,
  },

  // Statistics workflow screenshots (3 screenshots)
  "statistics-panel-distribution": {
    source: "full-app",
    workflow: "statistics",
    function: "generatePanelDistribution",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-panel-distribution.png",
    description: "Statistics panel showing employee distribution across boxes",
  },
  "statistics-ideal-actual-comparison": {
    source: "full-app",
    workflow: "statistics",
    function: "generateIdealActualComparison",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-ideal-actual-comparison.png",
    description: "Ideal vs actual distribution comparison chart",
  },
  "statistics-trend-indicators": {
    source: "full-app",
    workflow: "statistics",
    function: "generateTrendIndicators",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-trend-indicators.png",
    description: "Trend indicators showing distribution changes over time",
  },

  // Donut mode screenshots (2 screenshots)
  "donut-mode-active-layout": {
    source: "full-app",
    workflow: "donut",
    function: "generateActiveLayout",
    path: "resources/user-guide/docs/images/screenshots/donut/donut-mode-active-layout.png",
    description: "Active donut mode layout with concentric circles",
  },
  "donut-mode-toggle-comparison": {
    source: "full-app",
    workflow: "donut",
    function: "generateToggleComparison",
    path: "resources/user-guide/docs/images/screenshots/donut/donut-mode-toggle-comparison.png",
    description: "Side-by-side normal vs donut mode comparison",
    manual: true,
  },

  // Grid and basic UI screenshots (2 screenshots)
  "grid-normal": {
    source: "full-app",
    workflow: "grid",
    function: "generateGridNormal",
    path: "resources/user-guide/docs/images/screenshots/grid-normal.png",
    description: "Standard 9-box grid with employee tiles",
  },
  "employee-tile-normal": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileNormal",
    path: "resources/user-guide/docs/images/screenshots/employee-tile-normal.png",
    description: "Individual employee tile showing name and role",
    storyId: "grid-employeetile--default",
  },

  // Hero and index images (2 screenshots)
  "hero-grid-sample": {
    source: "full-app",
    workflow: "hero",
    function: "generateHeroGrid",
    path: "resources/user-guide/docs/images/screenshots/hero-grid-sample.png",
    description: "Hero image showing full grid with sample data",
  },
  "index-quick-win-preview": {
    source: "full-app",
    workflow: "hero",
    function: "generateQuickWinPreview",
    path: "resources/user-guide/docs/images/screenshots/index-quick-win-preview.png",
    description: "Quick win preview for index page",
  },

  // Additional features screenshots (5 screenshots)
  "changes-panel-entries": {
    source: "full-app",
    workflow: "changes",
    function: "generatePanelEntries",
    path: "resources/user-guide/docs/images/screenshots/changes-panel-entries.png",
    description: "Changes panel with multiple employee movement entries",
  },
  "timeline-employee-history": {
    source: "full-app",
    workflow: "timeline",
    function: "generateEmployeeHistory",
    path: "resources/user-guide/docs/images/screenshots/timeline-employee-history.png",
    description: "Employee movement timeline showing historical positions",
  },
  "employee-details-panel-expanded": {
    source: "full-app",
    workflow: "employees",
    function: "generateDetailsPanelExpanded",
    path: "resources/user-guide/docs/images/screenshots/employee-details-panel-expanded.png",
    description: "Expanded employee details panel with all information",
  },
  "file-menu-apply-changes": {
    source: "full-app",
    workflow: "exporting",
    function: "generateFileMenuApplyChanges",
    path: "resources/user-guide/docs/images/screenshots/file-menu-apply-changes.png",
    description: "File menu with Apply Changes option highlighted",
  },
  "excel-file-new-columns": {
    source: "full-app",
    workflow: "exporting",
    function: "generateExcelFileNewColumns",
    path: "resources/user-guide/docs/images/screenshots/excel-file-new-columns.png",
    description: "Excel file showing new columns after export",
    manual: true,
  },

  // Notes donut mode (1 screenshot)
  "notes-donut-mode": {
    source: "full-app",
    workflow: "notes",
    function: "generateDonutMode",
    path: "resources/user-guide/docs/images/screenshots/notes/notes-donut-mode.png",
    description: "Notes visible in donut mode employee hover tooltip",
  },

  // Quickstart Excel sample (already defined above but adding here for completeness)
  "quickstart-excel-sample": {
    source: "full-app",
    workflow: "quickstart",
    function: "generateExcelSample",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-excel-sample.png",
    description: "Sample Excel file format showing required columns",
    manual: true,
  },

  // Zoom controls screenshot (1 screenshot)
  "zoom-controls": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateZoomControls",
    path: "resources/user-guide/docs/images/screenshots/zoom-controls.png",
    description:
      "Zoom controls in bottom-left corner showing +/- buttons, percentage, and full-screen toggle",
    storyId: "common-zoomcontrols--default",
  },

  // ViewControls consolidation screenshots (6 screenshots)
  "view-controls-main-interface": {
    source: "full-app",
    workflow: "view-controls",
    function: "generateMainInterface",
    path: "resources/user-guide/docs/images/screenshots/view-controls/main-interface.png",
    description:
      "Main dashboard showing new simplified AppBar and floating ViewControls in top-right",
    cropping: "full-page",
    dimensions: { minWidth: 1200, minHeight: 800 },
  },
  "view-controls-grid-view": {
    source: "full-app",
    workflow: "view-controls",
    function: "generateViewControlsGrid",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-grid.png",
    description:
      "Closeup of ViewControls toolbar with Grid view active, showing toggle, zoom controls, and fullscreen button",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 60 },
  },
  "view-controls-donut-view": {
    source: "full-app",
    workflow: "view-controls",
    function: "generateViewControlsDonut",
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
    source: "full-app",
    workflow: "view-controls",
    function: "generateSimplifiedAppBar",
    path: "resources/user-guide/docs/images/screenshots/view-controls/simplified-appbar.png",
    description:
      "Simplified AppBar showing only Logo, File menu, Help button, and Settings button",
    cropping: "element",
    dimensions: { minWidth: 800, minHeight: 64 },
  },
  "view-controls-fullscreen": {
    source: "full-app",
    workflow: "view-controls",
    function: "generateFullscreenMode",
    path: "resources/user-guide/docs/images/screenshots/view-controls/fullscreen-mode.png",
    description:
      "Application in fullscreen mode (note: actual fullscreen requires F11, this shows pre-fullscreen view)",
    cropping: "full-page",
    dimensions: { minWidth: 1200, minHeight: 800 },
  },

  // Details Panel enhancements screenshots (6 screenshots)
  "details-current-assessment": {
    source: "storybook",
    workflow: "details-panel-enhancements",
    function: "generateCurrentAssessmentEnhanced",
    path: "resources/user-guide/docs/images/screenshots/details-panel/current-assessment-enhanced.png",
    description:
      "Enhanced Current Assessment section showing box name, grid coordinates, color-coded performance/potential chips",
    storyId: "panel-employeedetails--default",
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
    source: "full-app",
    workflow: "details-panel-enhancements",
    function: "generateFlagBadges",
    path: "resources/user-guide/docs/images/screenshots/details-panel/flag-badges.png",
    description:
      "Employee tiles showing individual colored flag badges (16px circular) in top-right corner",
    cropping: "container",
    dimensions: { minWidth: 230, minHeight: 220 },
  },
  "details-flag-filtering": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFlagsFiltering",
    path: "resources/user-guide/docs/images/screenshots/details-panel/flag-filtering.png",
    description:
      "FilterDrawer showing Flags section with checkboxes, employee counts, and active selections",
    storyId: "dashboard-filterdrawer--flags-active",
    cropping: "container",
    dimensions: { minWidth: 275, minHeight: 400 },
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
  "details-reporting-chain-filter-active": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateReportingChainFilterActive",
    path: "resources/user-guide/docs/images/screenshots/details-panel/reporting-chain-filter-active.png",
    description:
      "Active reporting chain filter shown in FilterDrawer with manager chip and dismiss button",
    storyId: "dashboard-filterdrawer--reporting-chain-active",
    cropping: "container",
    dimensions: { minWidth: 275, minHeight: 400 },
  },

  // FilterDrawer screenshots (4 new screenshots)
  "filters-overview": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFilterDrawerOverview",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-overview.png",
    description:
      "Complete FilterDrawer anatomy showing all filter sections: Job Levels, Job Functions, Locations, Managers, Flags, Reporting Chain, Exclusions",
    storyId: "dashboard-filterdrawer--all-sections-expanded",
    cropping: "container",
    dimensions: { minWidth: 275, minHeight: 600 },
  },
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
    storyId: "dashboard-filterdrawer--flags-active",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 400 },
  },
  "filters-reporting-chain": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateReportingChainFilterActive",
    path: "resources/user-guide/docs/images/screenshots/filters/reporting-chain-filter.png",
    description:
      "Reporting Chain section in FilterDrawer with active manager filter chip",
    storyId: "dashboard-filterdrawer--reporting-chain-active",
    cropping: "container",
    dimensions: { minWidth: 300, minHeight: 200 },
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
