# Phase 2 Screenshot Capture - Quick Reference

**Created:** 2024-12-20
**Task:** 2.6 - Complete Remaining Screenshots
**Status:** Ready to Run

---

## Quick Start

### 1. Start Servers

**Terminal 1 - Backend:**
```bash
cd c:\Git_Repos\9boxer\backend
..\.venv\Scripts\python.exe -m uvicorn ninebox.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd c:\Git_Repos\9boxer\frontend
npm run dev
```

Wait for both servers to be ready (backend at http://localhost:8000, frontend at http://localhost:5173)

### 2. Run Screenshot Tool

**Terminal 3 - Screenshots:**
```bash
cd c:\Git_Repos\9boxer
.venv\Scripts\python.exe tools\generate_docs_screenshots.py --viewport 2400x1600 --screenshots calibration-file-import,calibration-statistics-red-flags,calibration-intelligence-anomalies,calibration-filters-panel,calibration-donut-mode-toggle,calibration-donut-mode-grid,changes-orange-border,changes-employee-details,changes-timeline-view,changes-tab,notes-changes-tab-field,notes-good-example,notes-donut-mode
```

This will capture **13 automated screenshots** in one run.

---

## Screenshots by Group

### Calibration Workflow (6 automated)

```bash
.venv\Scripts\python.exe tools\generate_docs_screenshots.py --viewport 2400x1600 --screenshots calibration-file-import,calibration-statistics-red-flags,calibration-intelligence-anomalies,calibration-filters-panel,calibration-donut-mode-toggle,calibration-donut-mode-grid
```

**Expected Output:**
- `workflow/calibration-file-import.png` - File menu open
- `workflow/calibration-statistics-red-flags.png` - Distribution table
- `workflow/calibration-intelligence-anomalies.png` - Intelligence tab
- `workflow/calibration-filters-panel.png` - Filters drawer
- `workflow/calibration-donut-mode-toggle.png` - Toggle button
- `workflow/calibration-donut-mode-grid.png` - Donut mode grid

### Making Changes (4 automated)

```bash
.venv\Scripts\python.exe tools\generate_docs_screenshots.py --viewport 2400x1600 --screenshots changes-orange-border,changes-employee-details,changes-timeline-view,changes-tab
```

**Expected Output:**
- `workflow/making-changes-orange-border.png` - Modified tile
- `workflow/making-changes-employee-details.png` - Details panel
- `workflow/making-changes-timeline.png` - Timeline view
- `workflow/making-changes-changes-tab.png` - Changes tab

**Note:** `changes-drag-sequence` creates a base file for manual 3-panel composition

### Adding Notes (3 automated)

```bash
.venv\Scripts\python.exe tools\generate_docs_screenshots.py --viewport 2400x1600 --screenshots notes-changes-tab-field,notes-good-example,notes-donut-mode
```

**Expected Output:**
- `workflow/workflow-changes-add-note.png` - Note field
- `workflow/workflow-note-good-example.png` - Good note example
- `workflow/workflow-donut-notes-example.png` - Donut notes (optional)

---

## Manual Captures Required

After automated captures, perform these manual tasks:

### 1. Excel Export Screenshots (3 files)

**File 1:** `calibration-export-results.png`
1. In 9Boxer: Make 3-5 changes and add calibration notes
2. File → Apply X Changes to Excel
3. Open exported Excel file
4. Show columns: Employee ID, Worker, Performance, Potential, Modified in Session, 9Boxer Change Notes
5. Zoom to 120%
6. Screenshot showing 3-5 rows
7. Crop and save to `docs/images/screenshots/workflow/calibration-export-results.png`

**File 2:** `export-excel-notes-column.png`
1. Same as above, but focus on 9Boxer Change Notes column
2. Save to `docs/images/screenshots/workflow/export-excel-notes-column.png`

**File 3:** `quickstart-excel-sample.png` (Phase 1, if not done)
1. Open `resources/Sample_People_List.xlsx`
2. Show first 10 rows with 4 columns
3. Save to `docs/images/screenshots/quickstart/quickstart-excel-sample.png`

### 2. 3-Panel Drag Sequence Composite

**File:** `making-changes-drag-sequence.png`

Option 1 - Use automated base:
1. Run: `--screenshots changes-drag-sequence` (creates base grid)
2. Manually capture mid-drag state
3. Use existing `making-changes-orange-border.png` for panel 3
4. Combine in image editor (2400px wide: 800+800+800)
5. Add numbered callouts (1-2-3)

Option 2 - Fully manual:
1. Capture grid with employee ready to drag
2. Capture mid-drag state (harder)
3. Capture post-drop with orange border
4. Combine and annotate

---

## Annotation Workflow

### Tools Needed
- Image editor: Snagit, GIMP, Greenshot, or Photoshop
- File optimizer: TinyPNG or similar

### Annotation Standards
- Red boxes: 3px #FF0000 - clickable elements
- Orange boxes: 3px #FF9800 - warnings
- Green boxes: 3px #4CAF50 - success
- Blue callouts: 40px circle #1976D2 - numbers
- Arrows: 4px red - direction
- Text: 16px Roboto white on black 50% opacity

### Per-Screenshot Annotations

**Calibration screenshots:**
- File Import: Red boxes + numbered callouts (1-2)
- Statistics: Orange boxes on problematic %, warning labels
- Intelligence: Red boxes + callouts on anomalies
- Filters: Red boxes + callouts showing filter workflow
- Donut Toggle: Red box + arrow + text label
- Donut Grid: Multiple callouts (ghostly, purple, badges)

**Making Changes screenshots:**
- Drag Sequence: 3 panels with numbered callouts (1-2-3)
- Orange Border: Arrow to border + circle on badge
- Employee Details: Box on ratings + arrow to tab
- Timeline: Arrow to current year + green dot
- Changes Tab: Box on movement + arrow to notes

**Adding Notes screenshots:**
- Note Field: Blue callouts (1-2) + red boxes
- Good Example: Green checkmark + highlight
- Excel Notes: Red boxes on headers + blue callouts
- Donut Notes: Red box on tab + purple accent

---

## Validation Checklist

After capturing and annotating each screenshot:

### File Checks
- [ ] Filename matches specification exactly
- [ ] Saved in correct directory (`docs/images/screenshots/workflow/` or `quickstart/`)
- [ ] File size <500KB (optimize if needed)
- [ ] PNG format with transparency if needed
- [ ] Resolution 2400px width minimum

### Content Checks
- [ ] All UI elements fully rendered
- [ ] No loading spinners or transient states
- [ ] Realistic but anonymous data
- [ ] Consistent theme across related screenshots
- [ ] Text readable at 100% zoom

### Annotation Checks
- [ ] Follows style guide (colors, sizes, fonts)
- [ ] Numbered callouts in logical sequence
- [ ] Text labels clear and concise
- [ ] Annotations don't obscure critical elements
- [ ] Descriptive alt text prepared

### Integration Checks
- [ ] Image path in markdown is correct
- [ ] Alt text added to markdown
- [ ] MkDocs builds without warnings
- [ ] Image renders correctly in browser
- [ ] No broken links

---

## Expected Results

### Automated Capture (13 screenshots)
**Estimated time:** 3-5 minutes for tool to run
**Success rate:** 75-90% expected (some may fail on first run due to timing)

### Manual Captures (3-4 screenshots)
**Estimated time:** 15-30 minutes total
- Excel screenshots: 10-15 minutes (3 files)
- Drag sequence composite: 5-15 minutes (1 file)

### Annotation (16 screenshots)
**Estimated time:** 2-3 hours total
- Simple annotations: 5-10 minutes each (9 screenshots)
- Complex annotations: 10-20 minutes each (7 screenshots)

### Total Time Estimate
**5-8 hours** for complete Phase 2 screenshot capture, annotation, and integration

---

## Troubleshooting

### Tool fails to start
- **Issue:** Module not found errors
- **Fix:** Ensure virtual environment is activated and playwright installed
  ```bash
  .venv\Scripts\activate
  pip install playwright httpx
  playwright install chromium
  ```

### Screenshots fail to capture
- **Issue:** Timeout or element not found
- **Fix:** Check that both servers are running, try increasing wait times in code

### File menu doesn't open
- **Issue:** Dialog is blocking interaction
- **Fix:** Close dialog first (tool includes `close_dialogs()` calls)

### Excel screenshots unclear
- **Issue:** Text too small or blurry
- **Fix:** Zoom Excel to 120-150%, use higher DPI display, crop closer

### File sizes too large
- **Issue:** PNGs over 500KB
- **Fix:** Use TinyPNG.com or similar optimizer, or save as WebP format

---

## Post-Capture Actions

### 1. Update Documentation Files

Add image references to markdown files:

**docs/workflows/talent-calibration.md:**
- Add 6-7 calibration screenshot references

**docs/workflows/making-changes.md:**
- Add 5 making-changes screenshot references

**docs/workflows/adding-notes.md:**
- Add 3-4 adding-notes screenshot references

### 2. Build and Test

```bash
cd c:\Git_Repos\9boxer
mkdocs build --strict
mkdocs serve
```

Open http://localhost:8000 and verify:
- All images load correctly
- Annotations are clear and helpful
- Alt text is descriptive
- No broken image links

### 3. Update Manifest

Mark screenshots as completed in:
`agent-projects/documentation-redesign/screenshot-manifest.md`

---

## Success Criteria

Task 2.6 is complete when:

- ✅ Screenshot tool extended with 16 methods (DONE)
- ⏳ 12+ screenshots captured automatically
- ⏳ 3-4 manual screenshots captured
- ⏳ All screenshots annotated per specifications
- ⏳ All images optimized (<500KB)
- ⏳ All images integrated into documentation
- ⏳ MkDocs builds without errors
- ⏳ All images render correctly

---

**Next Action:** Start servers and run screenshot tool
**Estimated Completion:** 5-8 hours from start to finish

---

*Quick Reference v1.0 | 2024-12-20*
