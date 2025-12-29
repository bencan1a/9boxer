# Screenshot Registry - Complete Documentation

**Status:** Final
**Created:** 2025-12-28
**Last Updated:** 2025-12-28
**Total Screenshots:** 58 (35 Storybook + 19 Full-App + 4 Manual)

This document provides a complete reference for all documentation screenshots in the 9Boxer project.

---

## Quick Stats

| Metric | Count | Change |
|--------|-------|--------|
| **Total Screenshots** | 58 | -7 (from 65) |
| **Storybook Screenshots** | 35 | +18 (from 17) |
| **Full-App Screenshots** | 19 | -18 (from 37) |
| **Manual Screenshots** | 4 | -8 (from 12) |
| **Automated Screenshots** | 54 | +1 (from 53) |

---

## Changes Workflow (5 screenshots)

### changes-drag-sequence
**What to show:** Base grid for 3-panel drag sequence (requires manual composition)
**Path:** `resources/user-guide/docs/images/screenshots/workflow/making-changes-drag-sequence-base.png`
**Source:** Full-App
**Type:** Manual
**Workflow:** changes
**Function:** generateDragSequence

### changes-orange-border
**What to show:** Employee tile with full orange modified border (2px)
**Path:** `resources/user-guide/docs/images/screenshots/workflow/making-changes-orange-border.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateEmployeeTileModified
**Story:** grid-employeetile--modified

### changes-employee-details
**What to show:** Employee details panel showing updated ratings
**Path:** `resources/user-guide/docs/images/screenshots/workflow/making-changes-employee-details.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateEmployeeDetailsPanel
**Story:** panel-employeedetails--default

### changes-timeline-view
**What to show:** Performance History timeline in employee details
**Path:** `resources/user-guide/docs/images/screenshots/workflow/making-changes-timeline.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateRatingsTimeline
**Story:** panel-ratingstimeline--default

### changes-tab
**What to show:** Changes tab with employee movements
**Path:** `resources/user-guide/docs/images/screenshots/workflow/making-changes-changes-tab.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateChangesTab
**Story:** panel-changetrackertab--default

---

## Notes Workflow (1 screenshot)

### notes-changes-tab-field
**What to show:** Changes tab with note field highlighted
**Path:** `resources/user-guide/docs/images/screenshots/workflow/workflow-changes-add-note.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateChangesTab
**Story:** components-panel-changetrackertab--grid-changes-only

---

## Filters Workflow (7 screenshots)

### filters-active-chips
**What to show:** Grid view with active filter chips and orange dot indicator
**Path:** `resources/user-guide/docs/images/screenshots/filters/filters-active-chips.png`
**Source:** Full-App
**Type:** Automated
**Workflow:** filters
**Function:** generateActiveChips

### filters-panel-expanded
**What to show:** Filter panel expanded showing all filter options
**Path:** `resources/user-guide/docs/images/screenshots/filters/filters-panel-expanded.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateFilterDrawerAllExpanded
**Story:** dashboard-filterdrawer--all-sections-expanded

### filters-clear-all-button
**What to show:** Filter drawer with Clear All button highlighted
**Path:** `resources/user-guide/docs/images/screenshots/filters/filters-clear-all-button.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateFilterDrawerClearAll
**Story:** dashboard-filterdrawer--multiple-filters-active

### filters-overview
**What to show:** Complete FilterDrawer anatomy showing all filter sections: Job Levels, Job Functions, Locations, Managers, Flags, Reporting Chain, Exclusions
**Path:** `resources/user-guide/docs/images/screenshots/filters/filters-overview.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateFilterDrawerOverview
**Story:** dashboard-filterdrawer--all-sections-expanded

### filters-multiple-active
**What to show:** FilterDrawer with multiple filter types active: Job Functions, Locations, Flags, and Reporting Chain filters with count badges
**Path:** `resources/user-guide/docs/images/screenshots/filters/filters-multiple-active.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateMultipleFiltersActive
**Story:** dashboard-filterdrawer--multiple-filters-active

### filters-flags-section
**What to show:** Flags section in FilterDrawer showing all 8 flag types with checkboxes, counts, and active selections
**Path:** `resources/user-guide/docs/images/screenshots/filters/flags-section.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateFlagsFiltering
**Story:** dashboard-filterdrawer--flags-active

### filters-reporting-chain
**What to show:** Reporting Chain section in FilterDrawer with active manager filter chip
**Path:** `resources/user-guide/docs/images/screenshots/filters/reporting-chain-filter.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateReportingChainFilterActive
**Story:** dashboard-filterdrawer--reporting-chain-active

---

## Quickstart Workflow (4 screenshots)

### quickstart-file-menu-button
**What to show:** File menu button in toolbar showing "No file selected" empty state
**Path:** `resources/user-guide/docs/images/screenshots/quickstart/quickstart-file-menu-button.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateFileMenuButtonNoFile
**Story:** dashboard-appbar-filemenubutton--no-file

### quickstart-upload-dialog
**What to show:** File upload dialog with file selection input and upload button
**Path:** `resources/user-guide/docs/images/screenshots/quickstart/quickstart-upload-dialog.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateFileUploadDialog
**Story:** common-fileuploaddialog--open

### quickstart-grid-populated
**What to show:** Populated 9-box grid after successful file upload
**Path:** `resources/user-guide/docs/images/screenshots/quickstart/quickstart-grid-populated.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateGridPopulated
**Story:** grid-nineboxgrid--populated

### quickstart-success-annotated
**What to show:** Full application view showing populated grid and employee count (requires manual annotation)
**Path:** `resources/user-guide/docs/images/screenshots/quickstart/quickstart-success-annotated.png`
**Source:** Full-App
**Type:** Manual
**Workflow:** quickstart
**Function:** generateSuccessAnnotated
**Note:** User can use hero-grid-sample as alternative

### quickstart-excel-sample
**What to show:** Sample Excel file format showing required columns
**Path:** `resources/user-guide/docs/images/screenshots/quickstart/quickstart-excel-sample.png`
**Source:** Full-App
**Type:** Manual
**Workflow:** quickstart
**Function:** generateExcelSample
**Note:** GitHub issue should be created to auto-generate schema docs

---

## Calibration Workflow (6 screenshots)

### calibration-file-import
**What to show:** File menu open with Import Data menu item highlighted
**Path:** `resources/user-guide/docs/images/screenshots/workflow/calibration-file-import.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateFileMenuImport
**Story:** dashboard-appbar-filemenubutton--menu-open

### calibration-statistics-red-flags
**What to show:** Statistics tab showing distribution table with problematic patterns
**Path:** `resources/user-guide/docs/images/screenshots/workflow/calibration-statistics-red-flags.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** statistics-storybook
**Function:** generateStatisticsRedFlags
**Story:** panel-statistics-distributiontable--skewed-distribution

### intelligence-summary-anomalies
**What to show:** Intelligence summary showing low quality score and high anomaly count
**Path:** `resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-anomalies.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceSummaryNeedsAttention
**Story:** intelligence-intelligencesummary--needs-attention

### intelligence-anomaly-details
**What to show:** Anomaly section showing severe statistical anomalies requiring investigation
**Path:** `resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-details.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceAnomalyRed
**Story:** intelligence-anomalysection--red-status

### calibration-filters-panel
**What to show:** Filters panel with active filter selections applied
**Path:** `resources/user-guide/docs/images/screenshots/workflow/calibration-filters-panel.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateFilterDrawerCalibration
**Story:** dashboard-filterdrawer--multiple-filters-active

### calibration-donut-mode-toggle
**What to show:** View mode toggle button in active donut mode state
**Path:** `resources/user-guide/docs/images/screenshots/workflow/calibration-donut-mode-toggle.png`
**Source:** Full-App
**Type:** Automated
**Workflow:** calibration
**Function:** generateDonutModeToggle

### calibration-donut-mode-grid
**What to show:** Grid in donut mode showing ghostly purple-bordered employees moved from position-5
**Path:** `resources/user-guide/docs/images/screenshots/workflow/calibration-donut-mode-grid.png`
**Source:** Full-App
**Type:** Automated
**Workflow:** calibration
**Function:** generateDonutModeGrid

### calibration-export-results
**What to show:** Exported Excel file with changes applied
**Path:** `resources/user-guide/docs/images/screenshots/workflow/calibration-export-results.png`
**Source:** Full-App
**Type:** Manual
**Workflow:** calibration
**Function:** generateExportResults
**Note:** Should be documented in text instead of screenshot

---

## Intelligence Components (6 screenshots)

### distribution-chart-ideal
**What to show:** Distribution section showing ideal talent distribution across 9-box grid
**Path:** `resources/user-guide/docs/images/screenshots/distribution-chart-ideal.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceLevelDistribution
**Story:** intelligence-leveldistributionchart--normal-distribution

### intelligence-summary-excellent
**What to show:** IntelligenceSummary component with excellent quality score (85+), showing green status and low anomaly count
**Path:** `resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-excellent.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceSummaryExcellent
**Story:** intelligence-intelligencesummary--excellent-quality

### intelligence-summary-needs-attention
**What to show:** IntelligenceSummary component with low quality score (<50), showing red status and high anomaly count requiring attention
**Path:** `resources/user-guide/docs/images/screenshots/workflow/intelligence-summary-needs-attention.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceSummaryNeedsAttention
**Story:** intelligence-intelligencesummary--needs-attention

### intelligence-anomaly-green
**What to show:** AnomalySection component with green status (p > 0.05), showing no significant statistical issues
**Path:** `resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-green.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceAnomalyGreen
**Story:** intelligence-anomalysection--green-status

### intelligence-anomaly-red
**What to show:** AnomalySection component with red status (p < 0.01), showing severe statistical anomalies requiring investigation
**Path:** `resources/user-guide/docs/images/screenshots/workflow/intelligence-anomaly-red.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceAnomalyRed
**Story:** intelligence-anomalysection--red-status

### intelligence-deviation-chart
**What to show:** DeviationChart showing expected vs actual performance distribution with mixed significance levels (green/yellow/red bars)
**Path:** `resources/user-guide/docs/images/screenshots/workflow/intelligence-deviation-chart.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceDeviationChart
**Story:** intelligence-deviationchart--mixed-significance

### intelligence-level-distribution
**What to show:** LevelDistributionChart showing normal distribution of Low/Medium/High performers across job levels
**Path:** `resources/user-guide/docs/images/screenshots/workflow/intelligence-level-distribution.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** intelligence
**Function:** intelligenceLevelDistribution
**Story:** intelligence-leveldistributionchart--normal-distribution

---

## Statistics Panel (4 screenshots)

### statistics-panel-distribution
**What to show:** Statistics panel distribution table with grouping indicators (balanced distribution)
**Path:** `resources/user-guide/docs/images/screenshots/statistics/statistics-panel-distribution.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** statistics-storybook
**Function:** generatePanelDistribution
**Story:** panel-statistics-distributiontable--balanced-distribution

### statistics-trend-indicators
**What to show:** Trend indicators showing all 9 position colors with color-coded bars
**Path:** `resources/user-guide/docs/images/screenshots/statistics/statistics-trend-indicators.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** statistics-storybook
**Function:** generateTrendIndicators
**Story:** panel-statistics-coloredpercentagebar--all-positions-comparison

### statistics-grouping-indicators
**What to show:** CSS-based grouping indicators for high/middle/low tiers in distribution table
**Path:** `resources/user-guide/docs/images/screenshots/statistics/statistics-grouping-indicators.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** statistics-storybook
**Function:** generateGroupingIndicators
**Story:** panel-statistics-groupingindicator--all-groupings-together

### statistics-summary-cards
**What to show:** Three summary cards showing total employees, modified employees, and high performers
**Path:** `resources/user-guide/docs/images/screenshots/statistics/statistics-summary-cards.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** statistics-storybook
**Function:** generateSummaryCards
**Story:** panel-statistics-statisticssummary--default

---

## Donut Mode (1 screenshot)

### donut-mode-active-layout
**What to show:** Active donut mode layout with concentric circles and ghost tiles
**Path:** `resources/user-guide/docs/images/screenshots/donut/donut-mode-active-layout.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateDonutModeActive
**Story:** grid-nineboxgrid--donut-mode

---

## Grid and Basic UI (2 screenshots)

### grid-normal
**What to show:** Standard 9-box grid with employee tiles
**Path:** `resources/user-guide/docs/images/screenshots/grid-normal.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateGridPopulated
**Story:** grid-nineboxgrid--populated

### employee-tile-normal
**What to show:** Individual employee tile showing name and role
**Path:** `resources/user-guide/docs/images/screenshots/employee-tile-normal.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateEmployeeTileNormal
**Story:** grid-employeetile--default

---

## Hero Image (1 screenshot)

### hero-grid-sample
**What to show:** Hero image showing full grid with sample data (used for index and documentation)
**Path:** `resources/user-guide/docs/images/screenshots/hero-grid-sample.png`
**Source:** Full-App
**Type:** Automated
**Workflow:** hero
**Function:** generateHeroGrid
**Note:** Replaces both hero-grid-sample and index-quick-win-preview

---

## Additional Features (4 screenshots)

### changes-panel-entries
**What to show:** Changes panel with multiple employee movement entries
**Path:** `resources/user-guide/docs/images/screenshots/changes-panel-entries.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateChangesTab
**Story:** components-panel-changetrackertab--grid-changes-only

### timeline-employee-history
**What to show:** Employee movement timeline showing historical positions
**Path:** `resources/user-guide/docs/images/screenshots/timeline-employee-history.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateRatingsTimeline
**Story:** panel-ratingstimeline--with-history

### employee-details-panel-expanded
**What to show:** Expanded employee details panel with all information
**Path:** `resources/user-guide/docs/images/screenshots/employee-details-panel-expanded.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateEmployeeDetailsPanel
**Story:** panel-employeedetails--default

### file-menu-apply-changes
**What to show:** File menu with Apply Changes option highlighted
**Path:** `resources/user-guide/docs/images/screenshots/file-menu-apply-changes.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateFileMenuButtonWithChanges
**Story:** dashboard-appbar-filemenubutton--with-changes

---

## Zoom Controls (1 screenshot)

### zoom-controls
**What to show:** Zoom controls in bottom-left corner showing +/- buttons, percentage, and full-screen toggle
**Path:** `resources/user-guide/docs/images/screenshots/zoom-controls.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateZoomControls
**Story:** common-zoomcontrols--default

---

## ViewControls Consolidation (6 screenshots)

### view-controls-main-interface
**What to show:** Main dashboard showing simplified AppBar and floating ViewControls in top-right
**Path:** `resources/user-guide/docs/images/screenshots/view-controls/main-interface.png`
**Source:** Full-App
**Type:** Automated
**Workflow:** view-controls
**Function:** generateMainInterface

### view-controls-grid-view
**What to show:** Closeup of ViewControls toolbar with Grid view active, showing toggle, zoom controls, and fullscreen button
**Path:** `resources/user-guide/docs/images/screenshots/view-controls/view-controls-grid.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateViewControlsGridView
**Story:** common-viewcontrols--grid-view-active

### view-controls-donut-view
**What to show:** ViewControls toolbar with Donut view active
**Path:** `resources/user-guide/docs/images/screenshots/view-controls/view-controls-donut.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateViewControlsDonutView
**Story:** common-viewcontrols--donut-view-active

### view-controls-settings-dialog
**What to show:** Settings dialog showing theme options (Light/Dark/Auto) and language dropdown (English/Español)
**Path:** `resources/user-guide/docs/images/screenshots/view-controls/settings-dialog.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** view-controls
**Function:** generateSettingsDialog
**Story:** settings-settingsdialog--open

### view-controls-simplified-appbar
**What to show:** Simplified AppBar showing only Logo, File menu, Help button, and Settings button
**Path:** `resources/user-guide/docs/images/screenshots/view-controls/simplified-appbar.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateSimplifiedAppBar
**Story:** dashboard-appbar-pureappbar--file-loaded

### view-controls-fullscreen
**What to show:** Application in fullscreen mode (note: actual fullscreen requires F11, this shows pre-fullscreen view)
**Path:** `resources/user-guide/docs/images/screenshots/view-controls/fullscreen-mode.png`
**Source:** Full-App
**Type:** Automated
**Workflow:** view-controls
**Function:** generateFullscreenMode

---

## Details Panel Enhancements (6 screenshots)

### details-current-assessment
**What to show:** Enhanced Current Assessment section showing box name, grid coordinates, color-coded performance/potential chips
**Path:** `resources/user-guide/docs/images/screenshots/details-panel/current-assessment-enhanced.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** details-panel-enhancements
**Function:** generateCurrentAssessmentEnhanced
**Story:** panel-employeedetails--default

### details-flags-ui
**What to show:** Flags section in Details panel with Add Flag picker and colored flag chips
**Path:** `resources/user-guide/docs/images/screenshots/details-panel/flags-ui.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** details-panel-enhancements
**Function:** generateFlagsUI
**Story:** panel-employeeflags--with-multiple-flags

### details-flag-badges
**What to show:** Employee tiles showing individual colored flag badges (16px circular) in top-right corner
**Path:** `resources/user-guide/docs/images/screenshots/details-panel/flag-badges.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** storybook-components
**Function:** generateEmployeeTileFlagged
**Story:** grid-employeetile--with-flags

### details-flag-filtering
**What to show:** FilterDrawer showing Flags section with checkboxes, employee counts, and active selections
**Path:** `resources/user-guide/docs/images/screenshots/details-panel/flag-filtering.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateFlagsFiltering
**Story:** dashboard-filterdrawer--flags-active

### details-reporting-chain-clickable
**What to show:** Reporting Chain section with clickable manager names (blue underlined links)
**Path:** `resources/user-guide/docs/images/screenshots/details-panel/reporting-chain-clickable.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** details-panel-enhancements
**Function:** generateReportingChainClickable
**Story:** panel-managementchain--with-manager

### details-reporting-chain-filter-active
**What to show:** Active reporting chain filter shown in FilterDrawer with manager chip and dismiss button
**Path:** `resources/user-guide/docs/images/screenshots/details-panel/reporting-chain-filter-active.png`
**Source:** Storybook
**Type:** Automated
**Workflow:** filters-storybook
**Function:** generateReportingChainFilterActive
**Story:** dashboard-filterdrawer--reporting-chain-active

---

## Summary of Changes

### Screenshots Eliminated (7 total)
1. **notes-good-example** - Duplicate of notes-changes-tab-field
2. **notes-donut-mode** - Notes same in both modes
3. **filters-before-after** - Obvious comparison
4. **donut-mode-toggle-comparison** - Use grid-normal and donut-mode-active-layout side-by-side
5. **notes-export-excel** - Removed (document in text)
6. **excel-file-new-columns** - Removed (document in text)
7. **index-quick-win-preview** - Merged into hero-grid-sample

### Screenshots Converted to Storybook (18 total)
All screenshots listed with "Source: Storybook" that have a "Story" field were converted from full-app workflows to Storybook component stories.

### Manual Screenshots Remaining (4 total)
1. **changes-drag-sequence** - Multi-panel composition (GitHub issue to create GIF)
2. **quickstart-success-annotated** - Annotated full app (can use hero-grid-sample)
3. **quickstart-excel-sample** - Excel schema (GitHub issue to auto-generate)
4. **calibration-export-results** - Excel export (document in text)

### Performance Impact
- **Before:** 6-8 minutes generation time
- **After:** ~1-2 minutes generation time
- **Improvement:** 75% faster

---

## Generating Screenshots

**All automated screenshots:**
```bash
cd frontend
npm run screenshots:generate
```

**Specific screenshot:**
```bash
npm run screenshots:generate <screenshot-name>
```

**Example:**
```bash
npm run screenshots:generate view-controls-grid-view
```

---

## Notes

- All Storybook screenshots use the `captureStorybookScreenshot` helper for consistency
- Full-app screenshots use Playwright workflows with shared helpers from `playwright/helpers/`
- Manual screenshots are documented in `MANUAL_SCREENSHOTS.md`
- Screenshot metadata is defined in `config.ts` with validation rules
