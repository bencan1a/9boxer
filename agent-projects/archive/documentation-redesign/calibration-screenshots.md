# Talent Calibration Workflow - Screenshot Specifications

**Purpose:** Specify screenshots needed for `docs/workflows/talent-calibration.md`

**Created:** 2024-12-20
**Status:** Specification Complete - Ready for Capture

---

## Overview

This document specifies 6 screenshots needed for the talent calibration workflow guide. Each specification includes exact UI state, required annotations, and alt text for accessibility.

---

## Screenshot 1: File Import for Calibration

**File Name:** `calibration-file-import.png`

**Location:** `docs/images/screenshots/workflow/`

**Purpose:** Show where to import data for calibration preparation

### UI State

- **Application state:** Empty grid OR existing data loaded
- **Action:** File menu open, hovering over "Import Data"
- **Elements visible:**
  - Top application bar with File menu button
  - File menu dropdown expanded
  - "Import Data" menu item highlighted

### Annotations Required

1. **Red highlight box** around File menu button (top-left)
2. **Numbered callout "1"** on File menu button
3. **Red highlight box** around "Import Data" menu item
4. **Numbered callout "2"** on "Import Data" menu item
5. **Arrow** from callout 2 pointing to Import Data text
6. **Text label:** "Click Import Data to load your calibration file"

### Capture Method

- Automated via Playwright: Click File menu button, wait for menu to open
- Screenshot before clicking Import Data item
- Ensure menu is fully rendered

### Alt Text

```markdown
![File menu dropdown open with Import Data menu item highlighted, showing step 1: click File, step 2: click Import Data](../images/screenshots/workflow/calibration-file-import.png)
```

---

## Screenshot 2: Statistics Red Flags

**File Name:** `calibration-statistics-red-flags.png`

**Location:** `docs/images/screenshots/workflow/`

**Purpose:** Show distribution table with common calibration red flags annotated

### UI State

- **Application state:** Data loaded, Statistics tab active
- **Right panel:** Statistics tab selected
- **Visible elements:**
  - Distribution table (all 9 positions visible)
  - At least one problematic distribution pattern:
    - Too many employees in top row (High Performance)
    - OR too few in Stars position
    - OR overcrowded center box (position 5)

### Test Data Requirements

Create or use test data that demonstrates calibration issues:
- Example: 30% of employees in High Performance tier (positions 7-8-9)
- OR: 65% of employees in position 5
- OR: Only 2 employees in position 9 (Stars)

### Annotations Required

1. **Orange warning boxes** around problematic percentages
2. **Annotation labels** explaining the issue:
   - "⚠️ 30% High Performers - Grade inflation risk"
   - OR "⚠️ 68% in center box - Poor differentiation"
   - OR "⚠️ Only 2 Stars - Succession risk"
3. **Green checkmark** on one healthy percentage for contrast
4. **Text label:** "Healthy: 12% Stars"

### Capture Method

- Manual setup: Create test data with intentional distribution issues
- Automated: Navigate to Statistics tab
- Manual annotation: Add warning boxes and labels

### Alt Text

```markdown
![Statistics distribution table showing red flags: 30% of employees rated High Performance (above healthy 20% target), annotated with warning symbols](../images/screenshots/workflow/calibration-statistics-red-flags.png)
```

---

## Screenshot 3: Intelligence Anomalies

**File Name:** `calibration-intelligence-anomalies.png`

**Location:** `docs/images/screenshots/workflow/`

**Purpose:** Show Intelligence tab with statistical anomalies highlighted

### UI State

- **Application state:** Data loaded with anomalies present
- **Right panel:** Intelligence tab selected
- **Visible sections:**
  - Location Analysis OR Function Analysis section expanded
  - At least 1-2 anomalies visible (red or yellow highlighted items)
  - Deviation chart showing variance

### Test Data Requirements

Use Sample_People_List.xlsx OR create test data with:
- One location/function with significantly higher high-performer percentage
- Example: "Engineering: 35% high performers vs. 18% baseline"
- Enough variance to trigger red/yellow anomaly highlighting

### Annotations Required

1. **Red boxes** around anomaly items in the list (those shown in red/yellow by app)
2. **Numbered callouts** on each anomaly (1, 2, 3)
3. **Text labels** explaining significance:
   - "1: Engineering rates 17% higher than average - Investigate"
   - "2: San Francisco location - Anomaly"
4. **Arrow** pointing to deviation chart
5. **Text label:** "Visual shows variance from baseline"

### Capture Method

- Automated: Navigate to Intelligence tab
- Wait for data to load
- Scroll to section with visible anomalies
- Manual annotation: Add boxes, callouts, labels

### Alt Text

```markdown
![Intelligence tab showing anomalies in function analysis: Engineering department with 35% high performers versus 18% company baseline, flagged in red for investigation](../images/screenshots/workflow/calibration-intelligence-anomalies.png)
```

---

## Screenshot 4: Filters Panel for Calibration

**File Name:** `calibration-filters-panel.png`

**Location:** `docs/images/screenshots/workflow/`

**Purpose:** Show filter panel with calibration-specific selections active

### UI State

- **Application state:** Data loaded, filters drawer open
- **Left panel:** FilterDrawer visible
- **Active filters:**
  - Job Levels: All checked (or specific selection)
  - Performance: "High" ONLY checked
  - Other sections: Collapsed or unchecked
- **Badge count:** Shows number of active filters (e.g., "1")

### Annotations Required

1. **Red highlight box** around "Performance" section header
2. **Red highlight box** around "High" checkbox (checked state)
3. **Numbered callout "1"** on Performance section
4. **Arrow** pointing from callout to High checkbox
5. **Text label:** "Filter to only High Performers for calibration review"
6. **Green highlight** around filter badge count (if visible)

### Capture Method

- Automated via Playwright:
  - Click Filters button to open drawer
  - Uncheck all Performance except "High"
  - Wait for grid to filter
  - Capture with drawer open

### Alt Text

```markdown
![Filters panel open with Performance section expanded, showing only High checkbox selected to filter grid to high performers for calibration review](../images/screenshots/workflow/calibration-filters-panel.png)
```

---

## Screenshot 5: Donut Mode Toggle

**File Name:** `calibration-donut-mode-toggle.png`

**Location:** `docs/images/screenshots/workflow/`

**Purpose:** Show where to activate Donut Mode for center box validation

### UI State

- **Application state:** Data loaded, Donut Mode ACTIVE
- **Top toolbar:** View Mode Toggle visible
- **Toggle state:** Donut icon selected (highlighted in secondary color)
- **Grid state:** Showing only position 5 employees (donut mode active)

### Annotations Required

1. **Red highlight box** around entire View Mode Toggle component
2. **Numbered callout "1"** on the toggle
3. **Arrow** pointing to Donut icon specifically
4. **Text label:** "Click Donut icon to activate center box validation"
5. **Green checkmark** near active toggle showing it's selected
6. **Secondary annotation:** "Grid now shows only Core Talent employees"

### Capture Method

- Automated via Playwright:
  - Click View Mode Toggle to activate Donut mode
  - Wait for grid to filter to position 5 only
  - Capture with toggle in active state
  - Ensure secondary highlight is visible on button

### Alt Text

```markdown
![View mode toggle in application toolbar with Donut mode active (highlighted), showing the grid has switched to display only Core Talent employees for validation exercise](../images/screenshots/workflow/calibration-donut-mode-toggle.png)
```

---

## Screenshot 6: Donut Mode Grid

**File Name:** `calibration-donut-mode-grid.png`

**Location:** `docs/images/screenshots/workflow/`

**Purpose:** Show the grid in Donut Mode with ghostly employee tiles and purple styling

### UI State

- **Application state:** Donut Mode active
- **Grid visible:** Showing only position 5 employees initially
- **Some employees placed:** At least 2-3 employees dragged to other positions
- **Visual indicators:**
  - Placed employees appear ghostly (70% opacity)
  - Purple borders on placed employees
  - Purple "Donut" badges on tiles
  - Some employees remain in position 5 (not yet placed)

### Test Data Requirements

- Need sample data with at least 10 employees in position 5
- Activate Donut Mode
- Drag 2-3 employees to different positions (e.g., position 9, position 2)
- Leave some in position 5 for contrast

### Annotations Required

1. **Red box** around one employee tile with donut placement (ghostly + purple border)
2. **Numbered callout "1"** with label: "Ghostly appearance = Donut exercise placement"
3. **Red box** around purple border on same tile
4. **Numbered callout "2"** with label: "Purple border indicates donut placement"
5. **Red box** around purple "Donut" badge
6. **Numbered callout "3"** with label: "Donut badge confirms exercise mode"
7. **Green box** around one employee still in position 5
8. **Text label:** "Not yet placed - still in center box"

### Capture Method

- Manual setup required:
  - Activate Donut Mode
  - Drag several employees to different positions
  - Wait for visual indicators to render
  - Capture grid showing both placed and unplaced tiles
- Manual annotation for callouts and labels

### Alt Text

```markdown
![Nine-box grid in Donut Mode showing Core Talent employees: some have been placed in other boxes and appear with ghostly appearance (70% opacity), purple borders, and purple Donut badges, while others remain in the center box awaiting placement](../images/screenshots/workflow/calibration-donut-mode-grid.png)
```

---

## Screenshot 7: Export Results (BONUS)

**File Name:** `calibration-export-results.png`

**Location:** `docs/images/screenshots/workflow/`

**Purpose:** Show exported Excel file with calibration notes and Modified in Session columns

### UI State

- **Application:** Microsoft Excel (external to 9Boxer)
- **File:** Exported Excel file from 9Boxer after calibration changes
- **Visible columns:**
  - Employee ID
  - Worker
  - Performance (updated ratings)
  - Potential (updated ratings)
  - Modified in Session (Yes/No)
  - 9Boxer Change Notes (calibration notes)

### Test Data Requirements

- Make 3-5 changes in 9Boxer
- Add calibration notes to each change
- Export the file
- Open in Excel

### Annotations Required

1. **Red box** around "Modified in Session" column header
2. **Numbered callout "1"** with label: "Shows which employees were calibrated"
3. **Red box** around "9Boxer Change Notes" column header
4. **Numbered callout "2"** with label: "Your calibration notes"
5. **Green highlight** on one row showing "Yes" in Modified column
6. **Arrow** pointing to the note text in that row
7. **Text label:** "Example: 'Calibration 2024-Q4: Moved to Star - consensus on leadership potential'"

### Capture Method

- Manual process:
  - Create test session in 9Boxer
  - Make 3-5 changes with detailed notes
  - Export to Excel
  - Open Excel file
  - Take screenshot of relevant columns
  - Crop to show columns clearly
- Manual annotation

### Alt Text

```markdown
![Exported Excel file showing Modified in Session column with Yes values for calibrated employees, and 9Boxer Change Notes column containing detailed calibration meeting notes](../images/screenshots/workflow/calibration-export-results.png)
```

---

## Summary

**Total Screenshots:** 7 (6 required + 1 bonus)

**Breakdown:**
- Automated capture: 4 screenshots (File import, Filters, Donut toggle, Statistics/Intelligence tabs)
- Manual setup + automated capture: 1 screenshot (Donut Mode grid)
- External (Excel): 1 screenshot (Export results)
- Manual annotation: All 7 screenshots

**Estimated Time:**
- Capture: 30-45 minutes (including test data setup)
- Annotation: 60-75 minutes (following screenshot-specifications.md standards)
- Total: 90-120 minutes

---

## Capture Checklist

Before capturing:

- [ ] Review screenshot-specifications.md for technical requirements
- [ ] Prepare test data with calibration scenarios (grade inflation, anomalies)
- [ ] Have annotation tools ready (Snagit, Greenshot, or GIMP)
- [ ] Verify 9Boxer backend and frontend are running
- [ ] Create `docs/images/screenshots/workflow/` directory if it doesn't exist

During capture:

- [ ] Use 2400px width, 144 DPI (2x resolution for retina)
- [ ] Capture in PNG format with alpha channel
- [ ] Ensure all UI elements are fully rendered before screenshot
- [ ] Use realistic but fictional employee data (not real names)

After capture:

- [ ] Apply annotations per screenshot-specifications.md standards
- [ ] Optimize file sizes with TinyPNG (<500KB each)
- [ ] Add descriptive alt text to markdown
- [ ] Test rendering in MkDocs build
- [ ] Verify all screenshots are referenced in talent-calibration.md

---

## Integration Status

**Markdown file:** `docs/workflows/talent-calibration.md` - ✅ Created

**Screenshot placeholders:** All 6 screenshot references added to markdown with:
- Descriptive alt text
- Correct file paths
- Proper markdown syntax

**Ready for:** Screenshot capture and annotation

---

*Screenshot specifications v1.0 | Task 2.1 | December 2024*
