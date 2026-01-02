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

/**
 * Quality rating for screenshot assessment
 *
 * - good: Screenshot meets all visual quality standards
 * - needs-improvement: Screenshot exists but needs fixes (viewport, theme, etc.)
 * - poor: Screenshot has significant issues (wrong content, broken)
 * - pending: Screenshot placeholder added, story/workflow not yet created
 */
export type ScreenshotQuality =
  | "good"
  | "needs-improvement"
  | "poor"
  | "pending";

/**
 * Known issues that can affect screenshot quality
 */
export type ScreenshotIssue =
  | "light-mode"
  | "excessive-whitespace"
  | "wrong-content"
  | "poor-cropping"
  | "missing-padding";

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
  /** Cropping strategy - what portion of the screen to capture */
  cropping?: CroppingStrategy;
  /** For Storybook screenshots: the story ID (e.g., 'grid-employeetile--modified') */
  storyId?: string;

  // Quality assessment fields (added for screenshot inventory tracking)
  /** User-facing caption describing what this screenshot is intended to show */
  caption?: string;
  /** Quality assessment: good, needs-improvement, or poor */
  quality?: ScreenshotQuality;
  /** List of identified quality issues */
  issues?: ScreenshotIssue[];
  /** Detailed explanation of what's wrong and what should change */
  issueExplanation?: string;
  /** Documentation pages that reference this screenshot */
  usedIn?: string[];
}

/**
 * Screenshot registry
 *
 * Maps screenshot identifiers to their metadata. Screenshot identifiers are used
 * for filtering when running the generator (e.g., npm run screenshots:generate changes-tab).
 */
export const screenshotConfig: Record<string, ScreenshotMetadata> = {
  // Changes workflow screenshots (4 screenshots)
  "changes-orange-border": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileModified",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-orange-border.png",
    description: "Employee tile with full orange modified border (2px)",
    storyId: "app-grid-employeetile--modified-normal-mode",
    cropping: "element",
    caption:
      "Employee tile with orange border indicating the employee has been modified",
    quality: "good",
    usedIn: ["quickstart.md", "workflows/making-changes.md"],
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
    caption:
      "Employee details panel showing 'Modified in Session' badge and recent changes",
    quality: "good",
    usedIn: ["workflows/making-changes.md"],
  },
  "changes-timeline-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateRatingsTimeline",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-timeline.png",
    description: "Performance History timeline in employee details",
    storyId: "app-right-panel-details-ratingstimeline--default",
    cropping: "panel",
    caption:
      "Performance History timeline showing multi-year rating progression",
    quality: "good",
    usedIn: ["workflows/making-changes.md"],
  },
  "changes-tab": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateChangesTab",
    path: "resources/user-guide/docs/images/screenshots/workflow/making-changes-changes-tab.png",
    description: "Changes tab with employee movements",
    storyId: "app-right-panel-changes-changetrackertab--default",
    cropping: "panel",
    caption:
      "Changes tab showing table of employee movements with from/to positions",
    quality: "good",
    usedIn: ["workflows/making-changes.md"],
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
    caption:
      "Changes tab showing how to add notes to document rating change decisions",
    quality: "good",
    usedIn: ["tracking-changes.md", "workflows/adding-notes.md"],
  },

  // Filters workflow screenshots (3 screenshots)
  // REMOVED: filters-active-chips - unused (no documentation references)
  "filters-panel-expanded": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFilterDrawerAllExpanded",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-panel-expanded.png",
    description: "Filter panel expanded showing all filter options",
    storyId: "app-dashboard-filterdrawer--all-sections-expanded",
    cropping: "container",
    caption:
      "Filter panel showing Job Levels, Job Functions, and Locations filter sections",
    quality: "good",
    usedIn: [
      "filters.md",
      "quickstart.md",
      "getting-started.md",
      "workflows/talent-calibration.md",
      "workflows/identifying-flight-risks.md",
    ],
  },
  // REMOVED: filters-clear-all-button - unused (no documentation references)

  // Quickstart workflow screenshots (10 screenshots - guided tour)
  // REMOVED: quickstart-file-menu-button - unused (no documentation references)
  // REMOVED: quickstart-upload-dialog - unused (no documentation references)
  "quickstart-grid-populated": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridPopulated",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-grid-populated.png",
    description: "Populated 9-box grid after successful file upload",
    storyId: "app-grid-nineboxgrid--populated",
    cropping: "container",
    caption:
      "9-box grid showing employees distributed across performance and potential boxes",
    quality: "good",
    usedIn: ["quickstart.md", "getting-started.md"],
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
    caption: "Empty state with Load Sample Data and Upload Excel File buttons",
    quality: "good",
    usedIn: ["quickstart.md"],
  },
  // REMOVED: quickstart-load-sample-dialog - unused (no documentation references)
  "quickstart-employee-details-with-history": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeDetailsPanel",
    path: "resources/user-guide/docs/images/screenshots/quickstart/quickstart-employee-details-with-history.png",
    description:
      "Employee details panel showing flags, reporting chain, and complete job information (quickstart tour step 2)",
    storyId: "app-right-panel-details-employeedetails--default",
    cropping: "panel",
    caption:
      "Employee details panel showing job info, flags, and current assessment",
    quality: "good",
    usedIn: ["quickstart.md"],
  },
  // REMOVED: quickstart-timeline-history - unused (no documentation references)
  // REMOVED: quickstart-intelligence-bias-detected - duplicate of intelligence-anomaly-red (same storyId)
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
    caption:
      "Statistics panel showing employee distribution across 9-box positions",
    quality: "good",
  },
  // Calibration workflow screenshots (5 screenshots)
  "calibration-file-import": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateFileMenuImport",
    path: "resources/user-guide/docs/images/screenshots/workflow/calibration-file-import.png",
    description:
      "File menu open with Import Data menu item highlighted (cropped to menu only)",
    storyId: "app-dashboard-filemenubutton--menu-open",
    cropping: "element",
    caption: "File menu dropdown showing Import Data option",
    quality: "good",
    usedIn: ["workflows/talent-calibration.md"],
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
    caption:
      "Intelligence summary showing quality score and anomaly indicators",
    quality: "good",
    usedIn: [
      "intelligence.md",
      "getting-started.md",
      "best-practices.md",
      "workflows/talent-calibration.md",
      "workflows/analyzing-distribution.md",
    ],
  },
  // REMOVED: intelligence-anomaly-details - duplicate of intelligence-anomaly-red (same storyId)
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
    caption: "Stacked bar chart showing performance distribution by job level",
    quality: "good",
    usedIn: ["statistics.md"],
  },

  // Intelligence component screenshots (Storybook-based)
  // REMOVED: intelligence-summary-excellent - unused (no documentation references)
  // REMOVED: intelligence-summary-needs-attention - unused (no documentation references)
  // REMOVED: intelligence-anomaly-green - unused (no documentation references)
  "intelligence-anomaly-red": {
    source: "storybook",
    workflow: "intelligence",
    function: "intelligenceAnomalyRed",
    path: "resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-red.png",
    description:
      "AnomalySection component with red status (p < 0.01), showing severe statistical anomalies requiring investigation",
    storyId: "app-right-panel-intelligence-anomalysection--red-status",
    cropping: "container",
    caption: "Anomaly card showing red severe status requiring investigation",
    quality: "good",
    usedIn: ["intelligence.md", "quickstart.md"],
  },
  // REMOVED: intelligence-deviation-chart - unused (no documentation references)
  // REMOVED: intelligence-level-distribution - unused (no documentation references)
  // REMOVED: calibration-donut-mode-toggle - unused (no documentation references)
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
    caption:
      "Distribution table showing employee counts and percentages by position",
    quality: "good",
    usedIn: [
      "statistics.md",
      "quickstart.md",
      "getting-started.md",
      "workflows/talent-calibration.md",
      "workflows/analyzing-distribution.md",
    ],
  },
  // REMOVED: statistics-summary-cards - unused (no documentation references)

  // Donut mode screenshots - Note: donut-mode-active-layout is a duplicate of donut-mode-grid-normal (same storyId)
  // REMOVED: donut-mode-active-layout - duplicate of donut-mode-grid-normal (same storyId: app-grid-nineboxgrid--donut-mode)

  // Grid and basic UI screenshots
  // REMOVED: grid-normal - duplicate of quickstart-grid-populated (same storyId)
  // REMOVED: employee-tile-normal - unused (no documentation references)

  // Additional features screenshots
  // REMOVED: timeline-employee-history - duplicate of quickstart-timeline-history (same storyId)
  // REMOVED: employee-details-panel-expanded - duplicate of quickstart-employee-details-with-history (same storyId)
  // REMOVED: file-menu-apply-changes - unused (no documentation references, exporting-file-menu-apply-changes is used instead)

  // Zoom controls screenshot
  // REMOVED: zoom-controls - unused (no documentation references)

  // ViewControls consolidation screenshots
  // REMOVED: view-controls-main-interface - unused (no documentation references)
  "view-controls-grid-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsGridView",
    storyId: "app-common-viewcontrols--grid-view-active",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-grid.png",
    description:
      "Closeup of ViewControls toolbar with Grid view active, showing toggle, zoom controls, and fullscreen button",
    cropping: "container",
    caption: "View controls with grid view mode selected",
    quality: "good",
    usedIn: ["settings.md"],
  },
  "view-controls-donut-view": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsDonutView",
    storyId: "app-common-viewcontrols--donut-view-active",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-donut.png",
    description: "ViewControls toolbar with Donut view active",
    cropping: "container",
    caption: "View controls with donut view mode selected",
    quality: "good",
    usedIn: ["donut-mode.md"],
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
    caption: "Settings dialog showing appearance and language preferences",
    quality: "good",
    usedIn: ["settings.md"],
  },
  // REMOVED: view-controls-simplified-appbar - unused (no documentation references)
  // REMOVED: view-controls-fullscreen - unused (no documentation references)

  // Details Panel enhancements screenshots
  // REMOVED: details-current-assessment - unused (no documentation references)
  // REMOVED: details-flags-ui - unused (no documentation references)
  // REMOVED: details-flag-badges - unused (no documentation references)
  // REMOVED: details-reporting-chain-clickable - unused (no documentation references)
  // FilterDrawer screenshots
  // REMOVED: filters-multiple-active - unused (no documentation references)
  "filters-flags-section": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFlagsFiltering",
    path: "resources/user-guide/docs/images/screenshots/filters/flags-section.png",
    description:
      "Flags section in FilterDrawer showing all 8 flag types with checkboxes, counts, and active selections",
    storyId: "app-dashboard-filterdrawer--flags-active",
    cropping: "container",
    caption: "Flags filter section showing available flag types with counts",
    quality: "good",
    usedIn: ["filters.md"],
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
    caption: "Reporting chain filter chip showing filtered manager",
    quality: "good",
    usedIn: ["filters.md"],
  },

  // File Operations workflow screenshots
  // REMOVED: file-menu-recent-files - unused (no documentation references)
  "unsaved-changes-dialog": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateUnsavedChangesDialog",
    path: "resources/user-guide/docs/images/screenshots/file-ops/unsaved-changes-dialog.png",
    description:
      "Unsaved Changes protection dialog with Apply Changes, Discard, and Cancel options",
    storyId: "app-dialogs-unsavedchangesdialog--multiple-changes",
    cropping: "container",
    caption: "Warning dialog showing unsaved changes with action options",
    quality: "good",
    usedIn: ["troubleshooting.md"],
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
    caption: "Apply Changes dialog for exporting changes to Excel",
    quality: "good",
    usedIn: ["exporting.md"],
  },
  // REMOVED: apply-changes-dialog-save-as - unused (no documentation references)
  "file-error-fallback": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateFileErrorFallback",
    path: "resources/user-guide/docs/images/screenshots/file-ops/file-error-fallback.png",
    description:
      "File error fallback - error message when original file can't be updated",
    storyId: "app-dialogs-applychangesdialog--with-error",
    cropping: "container",
    caption: "Error dialog shown when original file cannot be updated",
    quality: "good",
    usedIn: ["troubleshooting.md"],
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
    caption: "Exclusions dialog for managing which employees to hide from view",
    quality: "good",
    usedIn: ["filters.md"],
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
    caption:
      "Location bias analysis showing expected vs actual performance by location",
    quality: "good",
    usedIn: ["intelligence.md"],
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
    caption:
      "Job function bias analysis showing performance distribution by department",
    quality: "good",
    usedIn: ["intelligence.md"],
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
    caption:
      "Job level bias analysis showing performance patterns across seniority levels",
    quality: "good",
    usedIn: ["intelligence.md"],
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
    caption:
      "Tenure bias analysis showing performance patterns by years of service",
    quality: "good",
    usedIn: ["intelligence.md"],
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
    caption:
      "Distribution table showing counts and percentages for each 9-box position",
    quality: "good",
    usedIn: ["statistics.md"],
  },

  // Additional screenshots found in documentation audit
  "donut-mode-grid-normal": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateDonutModeGrid",
    path: "resources/user-guide/docs/images/screenshots/donut-mode/donut-mode-grid-normal.png",
    description: "Grid in donut mode showing employee tiles",
    storyId: "app-grid-nineboxgrid--donut-mode",
    cropping: "container",
    caption: "9-box grid displayed in donut mode for center-box validation",
    quality: "good",
    usedIn: ["donut-mode.md"],
  },
  "workflow-donut-notes-example": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateDonutChangesTab",
    path: "resources/user-guide/docs/images/screenshots/workflow/workflow-donut-notes-example.png",
    description:
      "Donut changes tab showing tracked movements with calibration notes",
    storyId: "app-right-panel-changes-changetrackertab--donut-changes",
    cropping: "panel",
    caption: "Changes tab showing donut mode movements with descriptive notes",
    quality: "good",
    usedIn: ["donut-mode.md"],
  },
  "workflow-changes-good-note": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateChangesTabWithNotes",
    path: "resources/user-guide/docs/images/screenshots/workflow/workflow-changes-good-note.png",
    description:
      "Changes tab showing employee movements with well-documented notes",
    storyId: "app-right-panel-changes-changetrackertab--grid-changes-only",
    cropping: "panel",
    caption: "Changes tab with detailed notes documenting rating decisions",
    quality: "good",
    usedIn: ["best-practices.md", "tracking-changes.md"],
  },
  "workflow-grid-axes-labeled": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridWithAxesLabeled",
    path: "resources/user-guide/docs/images/screenshots/workflow/workflow-grid-axes-labeled.png",
    description: "9-box grid with Performance and Potential axes labeled",
    storyId: "app-grid-nineboxgrid--populated",
    cropping: "container",
    caption:
      "Annotated grid showing Performance (horizontal) and Potential (vertical) axes",
    quality: "good",
    usedIn: ["new-to-9box.md"],
  },
  // REMOVED: calibration-filters-panel - duplicate of filters-panel-expanded (same storyId)
  "exporting-file-menu-apply-changes": {
    source: "full-app",
    workflow: "file-operations",
    function: "generateFileMenuApplyChanges",
    path: "resources/user-guide/docs/images/screenshots/exporting/file-menu-apply-changes.png",
    description: "File menu with Apply Changes option highlighted",
    cropping: "container",
    caption: "File menu showing Apply Changes option for exporting to Excel",
    quality: "good",
    usedIn: ["getting-started.md"],
  },
  // REMOVED: filters-overview - duplicate of filters-panel-expanded (same storyId)

  // ==========================================================================
  // NEW SCREENSHOTS - Pending creation (from Core Features documentation audit)
  // ==========================================================================

  // Grid screenshots (understanding-grid.md)
  "grid-basic-layout": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridBasicLayout",
    path: "resources/user-guide/docs/images/screenshots/grid/grid-basic-layout.png",
    description:
      "Full 9-box grid with axis labels (Performance: Low/Medium/High, Potential: Low/Medium/High) and all 9 position names visible",
    storyId: "app-grid-nineboxgrid--populated",
    cropping: "container",
    caption:
      "The 9-box grid showing Performance (horizontal) and Potential (vertical) axes with all 9 positions labeled",
    quality: "good",
    usedIn: ["understanding-grid.md"],
  },
  "grid-color-coding-boxes": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridColorCoding",
    path: "resources/user-guide/docs/images/screenshots/grid/grid-color-coding-boxes.png",
    description:
      "Grid view emphasizing the background color scheme - green top row, yellow/amber middle row, orange bottom row",
    storyId: "app-grid-nineboxgrid--populated",
    cropping: "container",
    caption:
      "9-box grid highlighting the color coding: green (high potential), yellow (medium potential), orange (low potential)",
    quality: "good",
    usedIn: ["understanding-grid.md"],
  },
  "grid-employee-tile-states": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileStates",
    path: "resources/user-guide/docs/images/screenshots/grid/grid-employee-tile-states.png",
    description:
      "Composite showing 4 different employee tile states: default blue, orange border (modified), purple border (donut), and flag chips",
    storyId: "app-grid-employeetile--all-states-composite",
    cropping: "element",
    caption:
      "Examples of employee tile visual states: default blue, orange border (modified), purple border (donut mode), and flag chips",
    quality: "good",
    usedIn: ["understanding-grid.md"],
  },
  "grid-box-expanded": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridBoxExpanded",
    path: "resources/user-guide/docs/images/screenshots/grid/grid-box-expanded.png",
    description:
      "Single grid box (Position 5) expanded to show multi-column layout with expand/collapse icon visible",
    storyId: "app-grid-gridbox--expanded",
    cropping: "element",
    caption:
      "A grid box in expanded state showing employees arranged in multiple columns",
    quality: "good",
    usedIn: ["understanding-grid.md"],
  },

  // Filters screenshots (filters.md)
  "filters-logic-or-example": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFiltersOrLogic",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-logic-or-example.png",
    description:
      "Filter drawer showing Job Functions section with Engineering and Sales both checked to illustrate OR behavior",
    storyId: "app-dashboard-filterdrawer--multiple-selections-or",
    cropping: "container",
    caption:
      "Filter drawer with multiple selections in one category demonstrating OR logic",
    quality: "good",
    usedIn: ["filters.md"],
  },
  "filters-logic-and-example": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFiltersAndLogic",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-logic-and-example.png",
    description:
      "Filter drawer showing selections in two different categories (Job Function + Performance) to illustrate AND behavior",
    storyId: "app-dashboard-filterdrawer--multiple-categories-and",
    cropping: "container",
    caption:
      "Filter drawer with selections across categories demonstrating AND logic",
    quality: "good",
    usedIn: ["filters.md"],
  },
  "filters-active-indicator": {
    source: "storybook",
    workflow: "filters-storybook",
    function: "generateFiltersActiveIndicator",
    path: "resources/user-guide/docs/images/screenshots/filters/filters-active-indicator.png",
    description:
      "AppBar/toolbar area showing Filters button with orange dot badge and employee count showing filtered vs total",
    storyId: "app-dashboard-appbar--with-active-filters",
    cropping: "element",
    caption:
      "Filters button with orange dot indicator and employee count showing filtered results",
    quality: "good",
    usedIn: ["filters.md"],
  },

  // Donut Mode screenshots (donut-mode.md)
  "donut-mode-employee-tile-purple": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateDonutModeTilePurple",
    path: "resources/user-guide/docs/images/screenshots/donut-mode/donut-mode-employee-tile-purple.png",
    description:
      "Single employee tile showing the purple border and visual indication of original Position 5 placement",
    storyId: "app-grid-employeetile--donut-mode",
    cropping: "element",
    caption:
      "Employee tile with purple border and original position indicator showing donut placement",
    quality: "good",
    usedIn: ["donut-mode.md"],
  },
  "donut-mode-changes-tabs-toggle": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateDonutModeTabsToggle",
    path: "resources/user-guide/docs/images/screenshots/donut-mode/donut-mode-changes-tabs-toggle.png",
    description:
      "Changes tab interface showing both tab options (Regular Changes and Donut Changes)",
    storyId: "app-right-panel-changes-changetrackertab--with-donut-mode",
    cropping: "panel",
    caption:
      "Changes panel showing the two tabs: Regular Changes and Donut Changes",
    quality: "good",
    usedIn: ["donut-mode.md"],
  },

  // Statistics screenshots (statistics.md)
  "statistics-tab-location": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generateStatisticsTabLocation",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-tab-location.png",
    description:
      "Full right panel view with the Statistics tab highlighted, showing where users click to access statistics",
    storyId: "app-right-panel-tabs--statistics-selected",
    cropping: "panel",
    caption:
      "Right panel showing the Statistics tab location among the panel tabs",
    quality: "good",
    usedIn: ["statistics.md"],
  },
  "statistics-grouping-dropdown": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generateStatisticsGroupingDropdown",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-grouping-dropdown.png",
    description:
      "Statistics panel with the grouping selector expanded to show all available grouping dimensions (Department, Manager, Location, Job Level)",
    storyId: "app-right-panel-statistics-distributiontable--grouping-menu-open",
    cropping: "panel",
    caption:
      "Statistics panel with grouping dropdown menu open showing options",
    quality: "good",
    usedIn: ["statistics.md"],
  },
  "statistics-grouped-distribution": {
    source: "storybook",
    workflow: "statistics-storybook",
    function: "generateStatisticsGroupedDistribution",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-grouped-distribution.png",
    description:
      "Statistics panel showing the distribution table when grouped by Department, with sections showing different group breakdowns",
    storyId:
      "app-right-panel-statistics-distributiontable--grouped-by-department",
    cropping: "panel",
    caption: "Statistics showing distribution grouped by department",
    quality: "good",
    usedIn: ["statistics.md"],
  },
  "statistics-with-filters": {
    source: "full-app",
    workflow: "statistics-storybook",
    function: "generateStatisticsWithFilters",
    path: "resources/user-guide/docs/images/screenshots/statistics/statistics-with-filters.png",
    description:
      "Statistics panel with filter context visible, showing how distribution changes when filters are active",
    cropping: "panel",
    caption: "Statistics panel showing distribution for a filtered subset",
    quality: "good",
    usedIn: ["statistics.md"],
  },

  // ==========================================================================
  // NEW SCREENSHOTS - Working with Employees (from Core Features audit)
  // ==========================================================================

  "employee-details-full-panel": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeDetailsFullPanel",
    path: "resources/user-guide/docs/images/screenshots/details/employee-details-full-panel.png",
    description:
      "Complete employee details panel showing all sections: ratings, job info, flags, org chain, and timeline",
    storyId: "app-right-panel-details-employeedetails--default",
    cropping: "panel",
    caption:
      "Employee details panel showing all employee information including ratings, job info, flags, and timeline",
    quality: "good",
    usedIn: ["working-with-employees.md"],
  },
  "employee-tile-modified-border": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileModifiedBorder",
    path: "resources/user-guide/docs/images/screenshots/grid/employee-tile-modified-border.png",
    description:
      "Single employee tile showing the orange left border indicating the employee was modified in the current session",
    storyId: "app-grid-employeetile--modified-normal-mode",
    cropping: "element",
    caption:
      "Employee tile with orange left border indicating it was modified in the current session",
    quality: "good",
    usedIn: ["working-with-employees.md"],
  },
  "employee-timeline-history": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTimelineHistory",
    path: "resources/user-guide/docs/images/screenshots/details/employee-timeline-history.png",
    description:
      "Timeline section in Details tab showing chronological history of rating changes with dates and positions",
    storyId: "app-right-panel-details-ratingstimeline--with-history",
    cropping: "element",
    caption:
      "Timeline section in Details tab showing chronological movement history",
    quality: "good",
    usedIn: ["working-with-employees.md"],
  },
  "employee-flags-section": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeFlagsSection",
    path: "resources/user-guide/docs/images/screenshots/details/employee-flags-section.png",
    description:
      "Flags section in Details tab showing existing flag chips and Add Flag dropdown menu open",
    storyId: "app-right-panel-details-flagselector--dropdown-open",
    cropping: "element",
    caption:
      "Flags section showing existing flag chips and Add Flag dropdown menu",
    quality: "good",
    usedIn: ["working-with-employees.md"],
  },

  // ==========================================================================
  // NEW SCREENSHOTS - Tracking Changes (from Core Features audit)
  // ==========================================================================

  "apply-button-with-badge": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateApplyButtonWithBadge",
    path: "resources/user-guide/docs/images/screenshots/toolbar/apply-button-with-badge.png",
    description:
      "Apply button in toolbar showing badge with number of pending changes (e.g., '5' in red badge)",
    storyId: "app-dashboard-filemenubutton--with-changes-badge",
    cropping: "element",
    caption:
      "Apply button in toolbar showing badge with number of pending changes",
    quality: "good",
    usedIn: ["tracking-changes.md"],
  },
  "employee-tile-big-mover-flag": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateEmployeeTileBigMoverFlag",
    path: "resources/user-guide/docs/images/screenshots/grid/employee-tile-big-mover-flag.png",
    description:
      "Employee tile showing the Big Mover flag chip (cyan color) indicating significant tier change",
    storyId: "app-grid-employeetile--with-big-mover-flag",
    cropping: "element",
    caption:
      "Employee tile with Big Mover flag chip indicating significant tier change",
    quality: "good",
    usedIn: ["tracking-changes.md"],
  },
  "grid-change-indicators": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateGridChangeIndicators",
    path: "resources/user-guide/docs/images/screenshots/grid/grid-change-indicators.png",
    description:
      "Grid view showing multiple visual indicators: orange borders on modified tiles and Big Mover flags",
    storyId: "app-grid-nineboxgrid--with-changes",
    cropping: "grid",
    caption:
      "Grid showing visual indicators: orange borders on modified tiles and Big Mover flags",
    quality: "good",
    usedIn: ["tracking-changes.md"],
  },

  // ==========================================================================
  // NEW SCREENSHOTS - Intelligence (from Core Features audit)
  // ==========================================================================

  "intelligence-tab-location": {
    source: "storybook",
    workflow: "intelligence-storybook",
    function: "generateIntelligenceTabLocation",
    path: "resources/user-guide/docs/images/screenshots/intelligence/intelligence-tab-location.png",
    description:
      "Right panel header showing all four tabs with Intelligence tab (fourth) highlighted",
    storyId: "app-right-panel-tabs--intelligence-selected",
    cropping: "element",
    caption:
      "Right panel showing the Intelligence tab location among the panel tabs",
    quality: "good",
    usedIn: ["intelligence.md"],
  },
  "intelligence-quality-score": {
    source: "storybook",
    workflow: "intelligence-storybook",
    function: "generateIntelligenceQualityScore",
    path: "resources/user-guide/docs/images/screenshots/intelligence/intelligence-quality-score.png",
    description:
      "Quality score display at top of Intelligence panel showing overall score (0-100) with color indicator",
    storyId: "app-right-panel-intelligence-qualityscore--needs-attention",
    cropping: "element",
    caption:
      "Quality score display at top of Intelligence panel showing overall data health rating",
    quality: "good",
    usedIn: ["intelligence.md"],
  },
  "intelligence-anomaly-card-detail": {
    source: "storybook",
    workflow: "intelligence-storybook",
    function: "generateIntelligenceAnomalyCardDetail",
    path: "resources/user-guide/docs/images/screenshots/intelligence/intelligence-anomaly-card-detail.png",
    description:
      "Detailed anomaly card view showing dimension, expected vs actual counts, deviation amount, and affected categories",
    storyId: "app-right-panel-intelligence-anomalysection--red-status",
    cropping: "container",
    caption:
      "Anomaly card detail view showing expected vs actual counts and deviation metrics",
    quality: "good",
    usedIn: ["intelligence.md"],
  },

  // ==========================================================================
  // NEW SCREENSHOTS - Exporting (from Core Features audit)
  // ==========================================================================

  "file-menu-apply-button": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateFileMenuApplyButton",
    path: "resources/user-guide/docs/images/screenshots/file-ops/file-menu-apply-button.png",
    description:
      "File menu dropdown with Apply Changes button visible and highlighted, showing change count",
    storyId: "app-dashboard-filemenubutton--menu-open-with-changes",
    cropping: "element",
    caption: "File menu showing Apply Changes button with pending change count",
    quality: "good",
    usedIn: ["exporting.md"],
  },
  "apply-changes-save-as-option": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateApplyChangesSaveAsOption",
    path: "resources/user-guide/docs/images/screenshots/file-ops/apply-changes-save-as-option.png",
    description:
      "Apply Changes dialog with 'Save to different file' checkbox checked, showing file path input",
    storyId: "app-dialogs-applychangesdialog--save-as-mode",
    cropping: "container",
    caption: "Apply Changes dialog with Save to different file option selected",
    quality: "good",
    usedIn: ["exporting.md"],
  },
  "file-menu-recent-files": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateFileMenuRecentFiles",
    path: "resources/user-guide/docs/images/screenshots/file-ops/file-menu-recent-files.png",
    description:
      "File menu dropdown showing Recent Files submenu with list of previously opened files",
    storyId: "app-dashboard-filemenubutton--menu-open-with-recent-files",
    cropping: "element",
    caption: "Recent Files list in File menu showing previously accessed files",
    quality: "good",
    usedIn: ["exporting.md"],
  },
  "export-success-message": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateExportSuccessMessage",
    path: "resources/user-guide/docs/images/screenshots/file-ops/export-success-message.png",
    description:
      "Success notification/toast showing export completed with file path and action buttons",
    storyId: "app-common-notification--export-success",
    cropping: "element",
    caption: "Export complete confirmation showing successful save",
    quality: "good",
    usedIn: ["exporting.md"],
  },
  "exported-excel-columns": {
    source: "storybook",
    workflow: "file-operations",
    function: "generateExportedExcelColumns",
    path: "resources/user-guide/docs/images/screenshots/file-ops/exported-excel-columns.png",
    description:
      "Mock Excel view showing the 4 9Boxer columns added during export",
    storyId: "app-common-mockexcelview--exported-columns",
    cropping: "element",
    caption:
      "Exported Excel file showing change tracking columns added by 9Boxer",
    quality: "good",
    usedIn: ["exporting.md"],
  },

  // ==========================================================================
  // NEW SCREENSHOTS - Settings & View Controls (from Core Features audit)
  // ==========================================================================

  "settings-gear-icon-location": {
    source: "storybook",
    workflow: "view-controls",
    function: "generateSettingsGearIconLocation",
    path: "resources/user-guide/docs/images/screenshots/view-controls/settings-gear-icon-location.png",
    description:
      "AppBar/header area showing the gear icon location in the top-right corner with visual emphasis",
    storyId: "app-dashboard-appbar--default",
    cropping: "element",
    caption: "Gear icon location in the top-right corner of the application",
    quality: "good",
    usedIn: ["settings.md"],
  },
  "settings-theme-selector": {
    source: "storybook",
    workflow: "view-controls",
    function: "generateSettingsThemeSelector",
    path: "resources/user-guide/docs/images/screenshots/view-controls/settings-theme-selector.png",
    description:
      "Settings dialog focused on the Theme Mode section showing Light/Dark/Auto options",
    storyId: "app-settings-settingsdialog--open",
    cropping: "element",
    caption: "Theme mode selector showing Light, Dark, and Auto options",
    quality: "good",
    usedIn: ["settings.md"],
  },
  "view-controls-zoom": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsZoom",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-zoom.png",
    description:
      "Close-up of zoom controls in ViewControls toolbar showing minus, reset, plus buttons and percentage",
    storyId: "app-common-viewcontrols--grid-view-active",
    cropping: "element",
    caption:
      "Zoom controls close-up showing minus, reset, and plus buttons with percentage display",
    quality: "good",
    usedIn: ["settings.md"],
  },
  "view-controls-fullscreen": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsFullscreen",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-fullscreen.png",
    description: "Close-up of fullscreen toggle button in ViewControls toolbar",
    storyId: "app-common-viewcontrols--grid-view-active",
    cropping: "element",
    caption: "Fullscreen toggle button in the view controls toolbar",
    quality: "good",
    usedIn: ["settings.md"],
  },
  "view-controls-mode-toggle": {
    source: "storybook",
    workflow: "storybook-components",
    function: "generateViewControlsModeToggle",
    path: "resources/user-guide/docs/images/screenshots/view-controls/view-controls-mode-toggle.png",
    description:
      "Close-up of view mode toggle showing Grid and Donut mode buttons",
    storyId: "app-common-viewcontrols--grid-view-active",
    cropping: "element",
    caption: "View mode toggle showing Grid and Donut mode buttons",
    quality: "good",
    usedIn: ["settings.md"],
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
 * Get all screenshots (all screenshots are now automated)
 *
 * @returns Record of all screenshot configurations
 */
export function getAutomatedScreenshots(): Record<string, ScreenshotMetadata> {
  return { ...screenshotConfig };
}

/**
 * Get screenshots that are NOT referenced in any documentation
 * (candidates for removal to reduce maintenance burden)
 *
 * @returns Record of unused screenshot configurations
 */
export function getUnusedScreenshots(): Record<string, ScreenshotMetadata> {
  return Object.fromEntries(
    Object.entries(screenshotConfig).filter(
      ([_, metadata]) => !metadata.usedIn || metadata.usedIn.length === 0
    )
  );
}

/**
 * Get screenshots by quality assessment
 *
 * @param quality The quality rating to filter by
 * @returns Record of screenshot configurations matching the quality
 */
export function getScreenshotsByQuality(
  quality: ScreenshotQuality
): Record<string, ScreenshotMetadata> {
  return Object.fromEntries(
    Object.entries(screenshotConfig).filter(
      ([_, metadata]) => metadata.quality === quality
    )
  );
}

/**
 * Get screenshots with a specific issue
 *
 * @param issue The issue to filter by
 * @returns Record of screenshot configurations with the specified issue
 */
export function getScreenshotsByIssue(
  issue: ScreenshotIssue
): Record<string, ScreenshotMetadata> {
  return Object.fromEntries(
    Object.entries(screenshotConfig).filter(([_, metadata]) =>
      metadata.issues?.includes(issue)
    )
  );
}

/**
 * Get summary statistics for screenshot quality
 */
export function getScreenshotQualitySummary(): {
  total: number;
  good: number;
  needsImprovement: number;
  poor: number;
  pending: number;
  withLightMode: number;
  withWrongContent: number;
  unused: number;
} {
  const entries = Object.values(screenshotConfig);
  return {
    total: entries.length,
    good: entries.filter((m) => m.quality === "good").length,
    needsImprovement: entries.filter((m) => m.quality === "needs-improvement")
      .length,
    poor: entries.filter((m) => m.quality === "poor").length,
    pending: entries.filter((m) => m.quality === "pending").length,
    withLightMode: entries.filter((m) => m.issues?.includes("light-mode"))
      .length,
    withWrongContent: entries.filter((m) => m.issues?.includes("wrong-content"))
      .length,
    unused: entries.filter((m) => !m.usedIn || m.usedIn.length === 0).length,
  };
}

/**
 * Get pending screenshots (placeholders without stories yet)
 *
 * @returns Record of pending screenshot configurations
 */
export function getPendingScreenshots(): Record<string, ScreenshotMetadata> {
  return Object.fromEntries(
    Object.entries(screenshotConfig).filter(
      ([_, metadata]) => metadata.quality === "pending"
    )
  );
}
