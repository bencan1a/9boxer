# Screenshot Manifest

**Created:** 2024-12-20
**Purpose:** Comprehensive list of all required screenshots for documentation redesign
**Last Updated:** 2024-12-20

---

## Summary

**Phase 1 Screenshots:** 20 total (8 captured, 9 failed, 2 manual, 1 not attempted)
**Phase 2 Screenshots:** 16 new (0 captured yet, 12 automated, 3 manual, 1 semi-auto)
**Total Screenshots Required:** 36 screenshots
**Tool Status:** Extended with 16 new Phase 2 methods

---

## Quick Reference Table

| # | Filename | Page | Status | File Size | Annotation Status |
|---|----------|------|--------|-----------|-------------------|
| 1 | quickstart-excel-sample.png | quickstart.md | MANUAL NEEDED | N/A | Pending |
| 2 | quickstart-file-menu-button.png | quickstart.md | FAILED | N/A | Pending |
| 3 | quickstart-upload-dialog.png | quickstart.md | CAPTURED | 113.9 KB | Needs annotations |
| 4 | quickstart-grid-populated.png | quickstart.md | CAPTURED | 70.2 KB | Needs annotations |
| 5 | quickstart-success-annotated.png | quickstart.md | CAPTURED | 113.9 KB | Needs annotations |
| 6 | workflow-grid-axes-labeled.png | getting-started.md | CAPTURED | 70.2 KB | Needs annotations |
| 7 | workflow-statistics-tab.png | getting-started.md | FAILED | N/A | Pending |
| 8 | workflow-drag-drop-sequence-1.png | getting-started.md | FAILED | N/A | Pending |
| 9 | workflow-drag-drop-sequence-2.png | getting-started.md | CAPTURED | 70.2 KB | Needs annotations |
| 10 | workflow-drag-drop-sequence-3.png | getting-started.md | FAILED | N/A | Pending |
| 11 | workflow-employee-modified.png | getting-started.md | FAILED | N/A | Pending |
| 12 | workflow-employee-timeline.png | getting-started.md | FAILED | N/A | Pending |
| 13 | workflow-changes-tab.png | getting-started.md | FAILED | N/A | Pending |
| 14 | workflow-apply-button.png | getting-started.md | FAILED | N/A | Pending |
| 15 | workflow-export-excel-1.png | getting-started.md | NOT CAPTURED | N/A | Pending |
| 16 | workflow-export-excel-2.png | getting-started.md | MANUAL NEEDED | N/A | Pending |
| 17 | hero-grid-sample.png | index.md | CAPTURED | 70.2 KB | Clean (no annotations) |
| 18 | index-quick-win-preview.png | index.md | CAPTURED | 113.9 KB | Needs annotations |
| 19 | grid-normal.png | (original) | CAPTURED | 68.5 KB | Complete |
| 20 | employee-tile-normal.png | (original) | FAILED | N/A | Pending |

---

## Detailed Screenshot Specifications

### Quickstart Page Screenshots (5)

#### 1. quickstart-excel-sample.png
**Location:** `docs/images/screenshots/quickstart/`
**Used in:** `docs/quickstart.md` - Step showing Excel file format
**Status:** MANUAL CAPTURE REQUIRED
**Dimensions:** 1800px width (detail callout)

**Description:**
Sample Excel spreadsheet showing the 4 required columns with annotations highlighting column headers.

**Alt Text:**
```markdown
![Sample Excel spreadsheet showing the 4 required columns highlighted in green: Employee ID, Worker, Performance, and Potential. Each column header is numbered 1-4. First 10 rows of sample employee data are visible.](images/screenshots/quickstart/quickstart-excel-sample.png)
```

**Capture Instructions:**
- Open `resources/Sample_People_List.xlsx` in Excel
- Zoom to 120-150%
- Show first 5-10 rows
- Screenshot entire window

**Annotations Required:**
- Green highlight boxes around 4 column headers
- Blue numbered callouts 1-4
- Text: "Your Excel file needs these 4 columns with exact names"

---

#### 2. quickstart-file-menu-button.png
**Location:** `docs/images/screenshots/quickstart/`
**Used in:** `docs/quickstart.md` - Showing where to upload
**Status:** FAILED - selector issue (app-bar not found)
**Dimensions:** Partial UI (1800px width)

**Description:**
File menu button in empty state, before any data is loaded.

**Alt Text:**
```markdown
![File menu button in the top-left area showing 'No file selected' state, highlighted with red box and numbered '1'.](images/screenshots/quickstart/quickstart-file-menu-button.png)
```

**Capture Instructions:**
- Open 9Boxer with no data loaded
- Capture toolbar area showing File menu button
- Ensure button shows "No file selected" state

**Annotations Required:**
- Red highlight box around File menu button
- Blue numbered callout "1"
- Red arrow pointing to button
- Text: "Click here to import your data"

**Fix Needed:** Update selector from `[data-testid="app-bar"]` to correct selector

---

#### 3. quickstart-upload-dialog.png
**Location:** `docs/images/screenshots/quickstart/`
**Used in:** `docs/quickstart.md` - Upload process
**Status:** ✅ CAPTURED (113.9 KB)
**Dimensions:** Partial UI (1800px width)

**Description:**
File upload dialog showing file selection interface.

**Alt Text:**
```markdown
![File upload dialog with file selection input highlighted (numbered "1") and Upload button highlighted (numbered "2").](images/screenshots/quickstart/quickstart-upload-dialog.png)
```

**Annotations Required:**
- Red boxes around: file input (1), Upload button (2)
- Blue numbered callouts
- Text labels explaining each step

---

#### 4. quickstart-grid-populated.png
**Location:** `docs/images/screenshots/quickstart/`
**Used in:** `docs/quickstart.md` - Success state
**Status:** ✅ CAPTURED (70.2 KB)
**Dimensions:** Grid element (2400px viewport)

**Description:**
Populated 9-box grid after successful data upload.

**Alt Text:**
```markdown
![9-box grid populated with employee tiles after successful upload. Annotations highlight the 3x3 grid structure, employee tiles, and employee count.](images/screenshots/quickstart/quickstart-grid-populated.png)
```

**Annotations Required:**
- Red boxes around: grid, employee tile, employee count
- Blue numbered callouts 1-3
- Text labels
- Optional axis labels

---

#### 5. quickstart-success-annotated.png
**Location:** `docs/images/screenshots/quickstart/`
**Used in:** `docs/quickstart.md` - Final success confirmation
**Status:** ✅ CAPTURED (113.9 KB)
**Dimensions:** Full page (2400x1600)

**Description:**
Success state with checkmarks showing upload completion.

**Alt Text:**
```markdown
![Successful upload state showing 9-box grid with green checkmarks highlighting: grid structure, employee count, and organized positioning.](images/screenshots/quickstart/quickstart-success-annotated.png)
```

**Annotations Required:**
- Green checkmarks (3) pointing to key success indicators
- Text labels with ✓ symbols
- Optional: Success banner "Success! Your data is loaded"

---

### Getting Started / Workflow Screenshots (11)

#### 6. workflow-grid-axes-labeled.png
**Location:** `docs/images/screenshots/workflow/`
**Used in:** `docs/getting-started.md` - Understanding the grid
**Status:** ✅ CAPTURED (70.2 KB)
**Dimensions:** Grid element (2400px)

**Description:**
Grid with annotated axes showing Performance and Potential dimensions.

**Alt Text:**
```markdown
![9-box grid with annotated axes. Horizontal axis shows Performance (Low to High), vertical axis shows Potential (Low to High).](images/screenshots/workflow/workflow-grid-axes-labeled.png)
```

**Annotations Required:**
- Horizontal arrow: "Performance: LOW → MEDIUM → HIGH"
- Vertical arrow: "Potential: LOW ↑ MEDIUM ↑ HIGH"

---

#### 7. workflow-statistics-tab.png
**Location:** `docs/images/screenshots/workflow/`
**Used in:** `docs/getting-started.md` - Reviewing distribution
**Status:** FAILED - dialog was blocking interaction
**Dimensions:** Right panel (1800px)

**Description:**
Statistics tab showing employee distribution across grid positions.

**Alt Text:**
```markdown
![Statistics tab in right panel showing distribution table with employee counts and percentages for each grid position.](images/screenshots/workflow/workflow-statistics-tab.png)
```

**Annotations Required:**
- Red box around Statistics tab
- Numbered callout "1"
- Red box around distribution data
- Text: "View your talent distribution here"

**Fix Needed:** Close dialog before clicking tab

---

#### 8-10. workflow-drag-drop-sequence-[1-3].png
**Location:** `docs/images/screenshots/workflow/`
**Used in:** `docs/getting-started.md` - How to move employees
**Status:**
- Panel 1: FAILED
- Panel 2: ✅ CAPTURED (70.2 KB) - needs annotations
- Panel 3: FAILED
**Dimensions:** Grid element (2400px)

**Description:**
Three-panel sequence showing drag-and-drop workflow.

**Alt Text:**
```markdown
![Three-panel sequence showing drag-drop: (1) clicking employee, (2) dragging with motion arrow, (3) dropped with yellow highlight.](images/screenshots/workflow/workflow-drag-drop-sequence.png)
```

**Annotations Required:**
- Panel 1: Red box, "1. Click and hold"
- Panel 2: Motion arrow, target highlight, "2. Drag to new box"
- Panel 3: Yellow highlight, "3. Release to drop"

**Fix Needed:** Recapture panels 1 and 3

---

#### 11. workflow-employee-modified.png
**Location:** `docs/images/screenshots/workflow/`
**Used in:** `docs/getting-started.md` - Modified state indicator
**Status:** FAILED
**Dimensions:** Detail callout (1200px)

**Description:**
Close-up of employee tile with yellow highlight indicating modification.

**Alt Text:**
```markdown
![Employee tile with yellow highlight. Arrow points to yellow color with label "Yellow = modified in this session".](images/screenshots/workflow/workflow-employee-modified.png)
```

**Annotations Required:**
- Red box around yellow tile
- Arrow pointing to yellow background
- Text: "Yellow = modified in this session"

---

#### 12. workflow-employee-timeline.png
**Location:** `docs/images/screenshots/workflow/`
**Used in:** `docs/getting-started.md` - Viewing change history
**Status:** FAILED
**Dimensions:** Right panel (1800px)

**Description:**
Employee details panel showing timeline of movements.

**Alt Text:**
```markdown
![Employee details panel showing timeline with previous and new position entries and timestamps.](images/screenshots/workflow/workflow-employee-timeline.png)
```

**Annotations Required:**
- Red box around timeline section
- Arrows to "Previous position" and "New position"
- Text: "Timeline shows your changes"

---

#### 13. workflow-changes-tab.png
**Location:** `docs/images/screenshots/workflow/`
**Used in:** `docs/getting-started.md` - Adding notes
**Status:** FAILED - dialog blocking
**Dimensions:** Right panel (1800px)

**Description:**
Changes tab with notes field for documenting changes.

**Alt Text:**
```markdown
![Changes tab selected (numbered '1') with notes field highlighted (numbered '2') showing example note.](images/screenshots/workflow/workflow-changes-tab.png)
```

**Annotations Required:**
- Red boxes around: Changes tab (1), Notes field (2)
- Example note text
- Text: "Add your explanation here"

---

#### 14. workflow-apply-button.png
**Location:** `docs/images/screenshots/workflow/`
**Used in:** `docs/getting-started.md` - Exporting changes
**Status:** FAILED - selector issue
**Dimensions:** Toolbar area (1200px)

**Description:**
Export button with badge showing change count.

**Alt Text:**
```markdown
![Export button with badge showing "3" changes. Arrow points to badge.](images/screenshots/workflow/workflow-apply-button.png)
```

**Annotations Required:**
- Red box around Export button
- Arrow to badge
- Text: "Badge shows how many changes you've made"

---

#### 15-16. workflow-export-excel-[1-2].png
**Location:** `docs/images/screenshots/workflow/`
**Used in:** `docs/getting-started.md` - Export results
**Status:**
- excel-1: NOT CAPTURED (export dialog)
- excel-2: MANUAL EXCEL SCREENSHOT NEEDED
**Dimensions:** 1800px

**Description:**
- Panel 1: Export dialog (if exists)
- Panel 2: Exported Excel with new columns

**Alt Text (Panel 2):**
```markdown
![Exported Excel showing new columns "Modified in Session" (numbered '1') and "9Boxer Change Notes" (numbered '2') with yellow-highlighted modified rows.](images/screenshots/workflow/workflow-export-excel-2.png)
```

**Annotations Required:**
- Red boxes around new column headers
- Numbered callouts 1-2
- Yellow highlight on modified rows
- Text: "New columns show your changes and notes"

---

### Index/Home Page Screenshots (2)

#### 17. hero-grid-sample.png
**Location:** `docs/images/screenshots/index/`
**Used in:** `docs/index.md` - Hero image
**Status:** ✅ CAPTURED (70.2 KB)
**Dimensions:** Grid element (2400px)

**Description:**
Clean, professional view of populated grid - NO ANNOTATIONS.

**Alt Text:**
```markdown
![Sample 9-box grid showing employees organized by performance and potential.](images/screenshots/index/hero-grid-sample.png)
```

**Annotations Required:** NONE (clean hero image)

---

#### 18. index-quick-win-preview.png
**Location:** `docs/images/screenshots/index/`
**Used in:** `docs/index.md` - Quick win preview
**Status:** ✅ CAPTURED (113.9 KB)
**Dimensions:** Full page (2400x1600)

**Description:**
Success state showing "Your grid in 2 minutes" with success indicators.

**Alt Text:**
```markdown
![Annotated grid with checkmarks highlighting: populated grid, employee count, and automatic positioning. Success message: "Success in 2 minutes!".](images/screenshots/index/index-quick-win-preview.png)
```

**Annotations Required:**
- Green checkmarks (3)
- Text: "Your team visualized", "15 employees loaded", "Everyone positioned automatically"
- Optional: Success corner banner "✅ Success in 2 minutes!"

---

### Original Screenshots (2)

#### 19. grid-normal.png
**Location:** `docs/images/screenshots/`
**Used in:** (original test screenshot)
**Status:** ✅ CAPTURED (68.5 KB)
**Description:** Standard grid view

---

#### 20. employee-tile-normal.png
**Location:** `docs/images/screenshots/`
**Used in:** (original test screenshot)
**Status:** FAILED
**Description:** Close-up of employee tile

---

## Files by Directory

### `docs/images/screenshots/quickstart/`
1. quickstart-excel-sample.png (MANUAL)
2. quickstart-file-menu-button.png (FAILED)
3. quickstart-upload-dialog.png (✅ 113.9 KB)
4. quickstart-grid-populated.png (✅ 70.2 KB)
5. quickstart-success-annotated.png (✅ 113.9 KB)

### `docs/images/screenshots/workflow/`
1. workflow-grid-axes-labeled.png (✅ 70.2 KB)
2. workflow-statistics-tab.png (FAILED)
3. workflow-drag-drop-sequence-1.png (FAILED)
4. workflow-drag-drop-sequence-2.png (✅ 70.2 KB)
5. workflow-drag-drop-sequence-3.png (FAILED)
6. workflow-employee-modified.png (FAILED)
7. workflow-employee-timeline.png (FAILED)
8. workflow-changes-tab.png (FAILED)
9. workflow-apply-button.png (FAILED)
10. workflow-export-excel-1.png (NOT CAPTURED)
11. workflow-export-excel-2.png (MANUAL)

### `docs/images/screenshots/index/`
1. hero-grid-sample.png (✅ 70.2 KB)
2. index-quick-win-preview.png (✅ 113.9 KB)

### `docs/images/screenshots/` (root)
1. grid-normal.png (✅ 68.5 KB)
2. employee-tile-normal.png (FAILED)

---

## Completion Status

### By Status:
- ✅ **Successfully Captured:** 8 screenshots
- ❌ **Failed/Needs Recapture:** 9 screenshots
- 📝 **Manual Capture Required:** 2 screenshots (Excel files)
- ⏳ **Total Pending:** 11 screenshots

### Progress:
- **Quickstart:** 3/5 captured (60%)
- **Workflow:** 2/11 captured (18%)
- **Index:** 2/2 captured (100%)
- **Overall:** 8/20 captured (40%)

---

## Next Actions

### High Priority:
1. Fix selector issues in screenshot tool
2. Add dialog-closing logic before tab interactions
3. Re-run tool to capture failed screenshots
4. Manually capture 2 Excel screenshots

### Medium Priority:
5. Annotate all 8 successfully captured screenshots
6. Optimize file sizes (ensure all < 500KB)

### Low Priority:
7. Create combined drag-drop sequence image (optional)
8. Generate WebP versions for smaller file sizes (optional)

---

## Phase 2 Screenshots (New - Task 2.6)

### Task 2.1: Calibration Workflow (7 screenshots)

| # | Filename | Method | Automation | Status | Notes |
|---|----------|--------|------------|--------|-------|
| 21 | calibration-file-import.png | `capture_calibration_file_import()` | ✅ Automated | 🔄 Ready | File menu with Import highlighted |
| 22 | calibration-statistics-red-flags.png | `capture_calibration_statistics_red_flags()` | ✅ Automated | 🔄 Ready | Distribution table - needs annotation for red flags |
| 23 | calibration-intelligence-anomalies.png | `capture_calibration_intelligence_anomalies()` | ✅ Automated | 🔄 Ready | Intelligence tab anomalies - needs annotation |
| 24 | calibration-filters-panel.png | `capture_calibration_filters_panel()` | ✅ Automated | 🔄 Ready | Filters with Performance=High |
| 25 | calibration-donut-mode-toggle.png | `capture_calibration_donut_mode_toggle()` | ✅ Automated | 🔄 Ready | Toggle button in active state |
| 26 | calibration-donut-mode-grid.png | `capture_calibration_donut_mode_grid()` | ⚠️ Semi-auto | 🔄 Ready | Needs manual drag setup for ghostly effect |
| 27 | calibration-export-results.png | `capture_calibration_export_results()` | ❌ Manual | 🔧 Manual | Excel file screenshot |

**Annotation Requirements:**
- **Statistics:** Orange warning boxes on problematic percentages, labels explaining issues
- **Intelligence:** Red boxes on anomalies, numbered callouts, explanatory labels
- **Filters:** Red highlight boxes, numbered callouts showing workflow
- **Donut Toggle:** Red box, arrow, text labels
- **Donut Grid:** Multiple callouts (ghostly appearance, purple border, badges)

### Task 2.2: Making Changes (5 screenshots)

| # | Filename | Method | Automation | Status | Notes |
|---|----------|--------|------------|--------|-------|
| 28 | making-changes-drag-sequence.png | `capture_changes_drag_sequence()` | ⚠️ Base only | 🔧 Manual | 3-panel composite - manual composition needed |
| 29 | making-changes-orange-border.png | `capture_changes_orange_border()` | ✅ Automated | 🔄 Ready | Close-up of modified tile with orange border |
| 30 | making-changes-employee-details.png | `capture_changes_employee_details()` | ✅ Automated | 🔄 Ready | Details panel with updated ratings |
| 31 | making-changes-timeline.png | `capture_changes_timeline_view()` | ✅ Automated | 🔄 Ready | Performance history timeline |
| 32 | making-changes-changes-tab.png | `capture_changes_tab()` | ✅ Automated | 🔄 Ready | Movement tracker table |

**Annotation Requirements:**
- **Drag Sequence:** 3-panel composition, numbered callouts (1-2-3), arrows, labels
- **Orange Border:** Red arrow to border, red circle on Modified badge, color swatch
- **Employee Details:** Red box on ratings, red arrow to Details tab
- **Timeline:** Red arrow to current year, optional green dot highlight
- **Changes Tab:** Red box on Movement column, red arrow to Notes field

### Task 2.3: Adding Notes (4 screenshots)

| # | Filename | Method | Automation | Status | Notes |
|---|----------|--------|------------|--------|-------|
| 33 | workflow-changes-add-note.png | `capture_notes_changes_tab_field()` | ✅ Automated | 🔄 Ready | Changes tab with note field highlighted |
| 34 | workflow-note-good-example.png | `capture_notes_good_example()` | ✅ Automated | 🔄 Ready | Well-written note with annotation |
| 35 | export-excel-notes-column.png | `capture_notes_export_excel()` | ❌ Manual | 🔧 Manual | Excel showing 9Boxer Change Notes column |
| 36 | workflow-donut-notes-example.png | `capture_notes_donut_mode()` | ✅ Automated | 🔄 Ready | Donut Changes tab (optional) |

**Annotation Requirements:**
- **Changes Tab Field:** Blue numbered callouts (1-2), red boxes on tab and field
- **Good Example:** Green checkmark, green highlight, optional callout bubbles
- **Export Excel:** Red boxes on column headers, blue callouts, yellow highlight on "Yes"
- **Donut Mode:** Red box on tab, blue callout, purple accent

### Phase 2 Summary

**Automated Capture:** 12 screenshots (can run now)
**Manual Capture:** 3 screenshots (Excel files, 3-panel composite)
**Semi-Automated:** 1 screenshot (donut grid - needs manual drag interaction)

**Tool Methods Added:** 16 new screenshot capture methods
**File Locations:** All in `docs/images/screenshots/workflow/`

---

## Manual Capture Instructions

### Excel File Screenshots (3 total)

**Required Excel Screenshots:**
1. `quickstart-excel-sample.png` (Phase 1) - Sample Excel file before upload
2. `calibration-export-results.png` (Phase 2.1) - Exported Excel with calibration notes
3. `export-excel-notes-column.png` (Phase 2.3) - Excel showing 9Boxer Change Notes column

**Process:**
1. For calibration/notes Excel: Export file from 9Boxer after making changes and adding detailed notes
2. Open in Microsoft Excel
3. Arrange columns to show: Employee ID, Worker, Performance, Potential, Modified in Session, 9Boxer Change Notes
4. Ensure 3-5 rows visible with realistic example data
5. Zoom to 120-150% for readability
6. Capture screenshot showing relevant columns
7. Crop to focus on data (remove Excel ribbon if desired)
8. Save as PNG in `docs/images/screenshots/workflow/` or `quickstart/`
9. Optimize with TinyPNG (<500KB)

### 3-Panel Drag Sequence Composite

**File:** `making-changes-drag-sequence.png`

**Process:**
1. Tool provides base grid state (`making-changes-drag-sequence-base.png`)
2. Manually capture mid-drag state (harder to automate - requires mouse-down state)
3. Capture post-drop state with orange border (tool can provide)
4. Use image editor to combine 3 images side-by-side:
   - Panel 1: Click and hold (800px width)
   - Panel 2: Dragging with arrow (800px width)
   - Panel 3: Dropped with orange border (800px width)
   - Total composite: 2400px width
5. Add annotations: numbered callouts (1-2-3), arrows, labels
6. Save as single PNG file

---

## Automated Capture Usage

### Running the Screenshot Tool

```bash
# Start backend (Terminal 1)
cd c:\Git_Repos\9boxer\backend
../.venv/Scripts/python.exe -m uvicorn ninebox.main:app --reload

# Start frontend (Terminal 2)
cd c:\Git_Repos\9boxer\frontend
npm run dev

# Run screenshot tool - ALL screenshots (Terminal 3)
cd c:\Git_Repos\9boxer
.venv\Scripts\python.exe tools\generate_docs_screenshots.py --viewport 2400x1600

# Or capture specific Phase 2 screenshots
.venv\Scripts\python.exe tools\generate_docs_screenshots.py --screenshots calibration-file-import,calibration-statistics-red-flags,calibration-intelligence-anomalies,calibration-filters-panel,calibration-donut-mode-toggle,calibration-donut-mode-grid

# Or capture by group
.venv\Scripts\python.exe tools\generate_docs_screenshots.py --screenshots changes-orange-border,changes-employee-details,changes-timeline-view,changes-tab

.venv\Scripts\python.exe tools\generate_docs_screenshots.py --screenshots notes-changes-tab-field,notes-good-example,notes-donut-mode
```

### Available Phase 2 Screenshot Names

**Calibration (7):**
- `calibration-file-import`
- `calibration-statistics-red-flags`
- `calibration-intelligence-anomalies`
- `calibration-filters-panel`
- `calibration-donut-mode-toggle`
- `calibration-donut-mode-grid`
- `calibration-export-results` (manual)

**Making Changes (5):**
- `changes-drag-sequence` (base only, manual composite)
- `changes-orange-border`
- `changes-employee-details`
- `changes-timeline-view`
- `changes-tab`

**Adding Notes (4):**
- `notes-changes-tab-field`
- `notes-good-example`
- `notes-export-excel` (manual)
- `notes-donut-mode`

---

*Last Updated: 2024-12-20 (Phase 2 methods added)*
