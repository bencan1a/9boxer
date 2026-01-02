# Pending Screenshots Implementation Project

**Purpose:** Create the 33 missing Storybook stories and workflow functions to generate pending documentation screenshots.

**Status:** Ready for implementation
**Created:** January 2025

---

## Project Overview

The Core Features documentation audit identified 33 screenshots that need to be created. Each screenshot has:
- A placeholder in the documentation page
- An entry in `config.ts` with `quality: "pending"`
- A `storyId` placeholder indicating which Storybook story is needed

### Deliverables

1. **Storybook Stories** - Create/update stories for each pending screenshot
2. **Workflow Functions** - Create generator functions in `workflows/` directory
3. **Screenshot Generation** - Generate all pending screenshots
4. **Gallery Update** - Regenerate screenshot gallery for user review
5. **User Signoff** - Get approval on generated screenshots

---

## Quality Requirements (CRITICAL)

All screenshots MUST follow these standards (from `screenshot-guide.md`):

| Requirement | Standard |
|------------|----------|
| **Theme** | Dark mode only (`&globals=colorScheme:dark`) |
| **Viewport** | Adaptive - size to content, not fixed |
| **Whitespace** | Minimal - crop closely to intended object |
| **Padding** | 10px on all sides |
| **Framing** | Focus on the object in question as closely as possible |
| **Caption** | Must have clear description (already in config.ts) |

### Story Tagging Requirements

Every screenshot story needs:
```typescript
export const MyStory: Story = {
  tags: ["screenshot"],  // Required tag
  parameters: {
    screenshot: {
      enabled: true,
      id: 'unique-screenshot-id'
    },
  },
  // args...
};
```

---

## Implementation Process

### For Each Pending Screenshot:

1. **Check if story exists** - Look for existing story with matching `storyId`
2. **Create/update story** - Add story with proper tagging and mock data
3. **Create workflow function** - Add function to appropriate workflow file
4. **Generate screenshot** - Run `npm run screenshots:generate <id>`
5. **Verify quality** - Check against quality requirements
6. **Update config.ts** - Change `quality: "pending"` → `quality: "good"`

### Key Files

| File | Purpose |
|------|---------|
| `frontend/playwright/screenshots/config.ts` | Screenshot registry |
| `frontend/playwright/screenshots/workflows/*.ts` | Workflow functions |
| `frontend/src/components/**/*.stories.tsx` | Storybook stories |
| `frontend/playwright/screenshots/storybook-screenshot.ts` | Capture helper |

---

## Pending Screenshots by Page (33 total)

### Understanding the Grid (4 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `grid-basic-layout` | `app-grid-nineboxgrid--populated` | Full 9-box grid with axis labels showing all 9 positions | container |
| `grid-color-coding-boxes` | `app-grid-nineboxgrid--populated` | Grid view emphasizing background color scheme (green/yellow/orange rows) | container |
| `grid-employee-tile-states` | `composite` | Composite of 4 tile states: default, orange border, purple border, flags | element |
| `grid-box-expanded` | `app-grid-gridbox--expanded` | Single grid box expanded showing multi-column layout | element |

**Notes:**
- `grid-employee-tile-states` requires manual composition from multiple screenshots
- First two use same story but may need different viewport/framing

---

### Filters (3 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `filters-logic-or-example` | `app-dashboard-filterdrawer--multiple-selections-or` | Job Functions with Engineering + Sales checked | container |
| `filters-logic-and-example` | `app-dashboard-filterdrawer--multiple-categories-and` | Selections across categories (function + performance) | container |
| `filters-active-indicator` | full-app | AppBar showing Filters button with orange dot + employee count | element |

**Notes:**
- Need to create new FilterDrawer story variants for OR and AND logic examples
- `filters-active-indicator` needs full-app workflow to show toolbar context

---

### Donut Mode (2 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `donut-mode-employee-tile-purple` | `app-grid-employeetile--donut-mode` | Single tile with purple border and original position indicator | element |
| `donut-mode-changes-tabs-toggle` | `app-right-panel-changes-changetrackertab--with-donut-mode` | Changes panel showing both Regular/Donut tabs | panel |

**Notes:**
- `app-grid-employeetile--donut-mode` story exists - verify it shows purple border correctly
- Need ChangeTrackerTab story variant that shows the tab toggle interface

---

### Statistics (4 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `statistics-tab-location` | `app-right-panel-tabs--statistics-selected` | Full panel view with Statistics tab highlighted | panel |
| `statistics-grouping-dropdown` | `app-right-panel-statistics-distributiontable--grouping-menu-open` | Panel with grouping selector expanded | panel |
| `statistics-grouped-distribution` | `app-right-panel-statistics-distributiontable--grouped-by-department` | Distribution table grouped by department | panel |
| `statistics-with-filters` | full-app | Statistics panel with filter context visible | panel |

**Notes:**
- Need to create story variants for grouping dropdown states
- `statistics-with-filters` needs full-app to show filter + statistics together

---

### Working with Employees (4 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `employee-details-full-panel` | `app-right-panel-details-employeedetails--default` | Complete details panel with all sections | panel |
| `employee-tile-modified-border` | `app-grid-employeetile--modified-normal-mode` | Single tile with orange left border | element |
| `employee-timeline-history` | `app-right-panel-details-ratingstimeline--with-history` | Timeline section showing movement history | element |
| `employee-flags-section` | `app-right-panel-details-flagselector--dropdown-open` | Flags section with Add Flag dropdown open | element |

**Notes:**
- `employee-tile-modified-border` may already exist (check `changes-orange-border`)
- Need FlagSelector story with dropdown in open state

---

### Tracking Changes (3 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `apply-button-with-badge` | `app-dashboard-filemenubutton--with-changes-badge` | FileMenu button showing badge with change count | element |
| `employee-tile-big-mover-flag` | `app-grid-employeetile--with-big-mover-flag` | Single tile with Big Mover flag chip | element |
| `grid-change-indicators` | `app-grid-nineboxgrid--with-changes` | Grid showing orange borders and Big Mover flags | grid |

**Notes:**
- Need FileMenuButton story with badge count
- Need EmployeeTile story with Big Mover flag
- Need NineBoxGrid story showing multiple changed employees

---

### Intelligence (3 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `intelligence-tab-location` | `app-right-panel-tabs--intelligence-selected` | Panel header with Intelligence tab highlighted | element |
| `intelligence-quality-score` | `app-right-panel-intelligence-qualityscore--needs-attention` | Quality score display at top of panel | element |
| `intelligence-anomaly-card-detail` | `app-right-panel-intelligence-anomalysection--red-status` | Detailed anomaly card with metrics | container |

**Notes:**
- Need RightPanelTabs story showing Intelligence selected
- May need QualityScore component story if not separate from IntelligenceSummary

---

### Exporting (5 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `file-menu-apply-button` | `app-dashboard-filemenubutton--menu-open-with-changes` | File menu with Apply Changes visible | element |
| `apply-changes-save-as-option` | `app-dialogs-applychangesdialog--save-as-mode` | Apply Changes dialog with Save As checkbox checked | container |
| `file-menu-recent-files` | `app-dashboard-filemenubutton--menu-open-with-recent-files` | File menu showing Recent Files submenu | element |
| `export-success-message` | `app-common-notification--export-success` | Success toast notification | element |
| `exported-excel-columns` | manual | Excel file showing added columns | full-page |

**Notes:**
- Need FileMenuButton story variants for menu states
- Need ApplyChangesDialog story with Save As mode
- Need notification/toast component story
- `exported-excel-columns` is MANUAL - requires actual Excel screenshot

---

### Settings & View Controls (5 screenshots)

| Screenshot ID | Story ID | Description | Cropping |
|--------------|----------|-------------|----------|
| `settings-gear-icon-location` | `app-dashboard-appbar--default` | AppBar showing gear icon location | element |
| `settings-theme-selector` | `app-settings-settingsdialog--open` | Settings dialog theme section | element |
| `view-controls-zoom` | `app-common-viewcontrols--grid-view-active` | Close-up of zoom controls | element |
| `view-controls-fullscreen` | `app-common-viewcontrols--grid-view-active` | Close-up of fullscreen toggle | element |
| `view-controls-mode-toggle` | `app-common-viewcontrols--grid-view-active` | Close-up of Grid/Donut toggle | element |

**Notes:**
- Last three use same story but crop to different elements
- Need AppBar story if not already available
- May need to create cropping functions that isolate specific controls

---

## Story Creation Checklist

### New Stories Needed (approximate)

| Component | Story Variant Needed |
|-----------|---------------------|
| FilterDrawer | `--multiple-selections-or`, `--multiple-categories-and` |
| ChangeTrackerTab | `--with-donut-mode` (showing tab toggle) |
| DistributionTable | `--grouping-menu-open`, `--grouped-by-department` |
| FlagSelector | `--dropdown-open` |
| FileMenuButton | `--with-changes-badge`, `--menu-open-with-changes`, `--menu-open-with-recent-files` |
| EmployeeTile | `--with-big-mover-flag` |
| NineBoxGrid | `--with-changes` |
| RightPanelTabs | `--statistics-selected`, `--intelligence-selected` |
| QualityScore | `--needs-attention` (if separate component) |
| ApplyChangesDialog | `--save-as-mode` |
| Notification | `--export-success` |
| AppBar | `--default` (if not already) |
| GridBox | `--expanded` |

---

## Workflow Functions to Create

Add to `frontend/playwright/screenshots/workflows/storybook-components.ts`:

```typescript
// Understanding the Grid
export async function generateGridBasicLayout(page: Page, outputPath: string)
export async function generateGridColorCoding(page: Page, outputPath: string)
export async function generateGridEmployeeTileStates(page: Page, outputPath: string) // composite
export async function generateGridBoxExpanded(page: Page, outputPath: string)

// Filters
export async function generateFiltersOrLogic(page: Page, outputPath: string)
export async function generateFiltersAndLogic(page: Page, outputPath: string)
export async function generateFiltersActiveIndicator(page: Page, outputPath: string) // full-app

// Donut Mode
export async function generateDonutModeTilePurple(page: Page, outputPath: string)
export async function generateDonutModeTabsToggle(page: Page, outputPath: string)

// Statistics
export async function generateStatisticsTabLocation(page: Page, outputPath: string)
export async function generateStatisticsGroupingDropdown(page: Page, outputPath: string)
export async function generateStatisticsGroupedDistribution(page: Page, outputPath: string)
export async function generateStatisticsWithFilters(page: Page, outputPath: string) // full-app

// Working with Employees
export async function generateEmployeeDetailsFullPanel(page: Page, outputPath: string)
export async function generateEmployeeTileModifiedBorder(page: Page, outputPath: string)
export async function generateEmployeeTimelineHistory(page: Page, outputPath: string)
export async function generateEmployeeFlagsSection(page: Page, outputPath: string)

// Tracking Changes
export async function generateApplyButtonWithBadge(page: Page, outputPath: string)
export async function generateEmployeeTileBigMoverFlag(page: Page, outputPath: string)
export async function generateGridChangeIndicators(page: Page, outputPath: string)

// Intelligence
export async function generateIntelligenceTabLocation(page: Page, outputPath: string)
export async function generateIntelligenceQualityScore(page: Page, outputPath: string)
export async function generateIntelligenceAnomalyCardDetail(page: Page, outputPath: string)

// Exporting
export async function generateFileMenuApplyButton(page: Page, outputPath: string)
export async function generateApplyChangesSaveAsOption(page: Page, outputPath: string)
export async function generateFileMenuRecentFiles(page: Page, outputPath: string)
export async function generateExportSuccessMessage(page: Page, outputPath: string)

// Settings & View Controls
export async function generateSettingsGearIconLocation(page: Page, outputPath: string)
export async function generateSettingsThemeSelector(page: Page, outputPath: string)
export async function generateViewControlsZoom(page: Page, outputPath: string)
export async function generateViewControlsFullscreen(page: Page, outputPath: string)
export async function generateViewControlsModeToggle(page: Page, outputPath: string)
```

---

## Agent Task Breakdown

### Suggested Agent Assignments

**Agent 1: Grid & Basic Components**
- `grid-basic-layout`
- `grid-color-coding-boxes`
- `grid-box-expanded`
- `grid-employee-tile-states` (composite - may need manual)

**Agent 2: Filters & Donut Mode**
- `filters-logic-or-example`
- `filters-logic-and-example`
- `filters-active-indicator`
- `donut-mode-employee-tile-purple`
- `donut-mode-changes-tabs-toggle`

**Agent 3: Statistics & Intelligence**
- `statistics-tab-location`
- `statistics-grouping-dropdown`
- `statistics-grouped-distribution`
- `statistics-with-filters`
- `intelligence-tab-location`
- `intelligence-quality-score`
- `intelligence-anomaly-card-detail`

**Agent 4: Employee & Changes**
- `employee-details-full-panel`
- `employee-tile-modified-border`
- `employee-timeline-history`
- `employee-flags-section`
- `apply-button-with-badge`
- `employee-tile-big-mover-flag`
- `grid-change-indicators`

**Agent 5: Export & Settings**
- `file-menu-apply-button`
- `apply-changes-save-as-option`
- `file-menu-recent-files`
- `export-success-message`
- `settings-gear-icon-location`
- `settings-theme-selector`
- `view-controls-zoom`
- `view-controls-fullscreen`
- `view-controls-mode-toggle`

---

## Verification Steps

### Before User Signoff

1. **Generate all screenshots**: `npm run screenshots:generate`
2. **Regenerate gallery**: `python tools/screenshot_gallery.py`
3. **Visual review**: Check each screenshot against quality requirements
4. **Update config.ts**: Change `quality: "pending"` → `quality: "good"` for passing screenshots
5. **Flag issues**: Any screenshots needing fixes should remain `"pending"` with `issues` array

### Signoff Criteria

- [ ] All 33 screenshots generated
- [ ] All use dark mode
- [ ] All have minimal whitespace
- [ ] All are properly cropped/framed
- [ ] Gallery updated and accessible
- [ ] Config.ts updated with quality assessments
- [ ] Manual screenshots identified and documented

---

## Commands Reference

```bash
# Generate specific screenshot
cd frontend && npm run screenshots:generate grid-basic-layout

# Generate all pending screenshots
cd frontend && npm run screenshots:generate

# Regenerate gallery
python tools/screenshot_gallery.py

# Check pending screenshots
grep -c '"pending"' frontend/playwright/screenshots/config.ts

# Validate story tags
cd frontend && npx tsx scripts/validate-screenshot-tags.ts
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Screenshots completed | 33/33 (100%) |
| Quality: "good" | 32/33 (96%+) |
| Manual screenshots | 1 (exported-excel-columns) |
| User signoff | Approved |

---

## Related Documentation

- [Screenshot Guide](../contributing/screenshot-guide.md) - Visual quality standards
- [HOWTO.md](../../frontend/playwright/screenshots/HOWTO.md) - Generation process
- [config.ts](../../frontend/playwright/screenshots/config.ts) - Screenshot registry
