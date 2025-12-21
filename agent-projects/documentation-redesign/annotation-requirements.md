# Screenshot Annotation Requirements

**Created:** 2024-12-20
**Purpose:** Document which screenshots need manual annotations

---

## Overview

This document specifies which captured screenshots require manual annotation, and what annotations are needed. All annotations should follow the standards in `screenshot-specifications.md`.

## Annotation Standards Reference

**Colors:**
- Red highlight boxes: `#FF0000`, 3px border
- Blue callout circles: `#1976D2`, 40px diameter
- Green success indicators: `#4CAF50`
- White text: `#FFFFFF` on `#000000 @ 60%` background
- Red arrows: `#FF0000`, 4px width

---

## Screenshots Requiring Annotations

### 1. Quickstart Excel Sample (MANUAL CAPTURE NEEDED)

**File:** `quickstart-excel-sample.png`
**Status:** NOT YET CAPTURED (requires manual Excel screenshot)

**What to capture:**
- Open `resources/Sample_People_List.xlsx` in Microsoft Excel or LibreOffice Calc
- Show first 5-10 rows
- Zoom to 120-150% for clarity

**Annotations needed:**
1. **Green highlight boxes** (3px, #4CAF50) around column headers:
   - Employee ID (A1)
   - Worker (B1)
   - Performance (C1)
   - Potential (D1)
2. **Numbered blue callouts** (1-4) pointing to each column
3. **Text annotation** at top: "Your Excel file needs these 4 columns with exact names"

**Alt text:**
```
Sample Excel spreadsheet showing the 4 required columns highlighted in green: Employee ID, Worker, Performance, and Potential. Each column header is numbered 1-4. First 10 rows of sample employee data are visible.
```

---

### 2. Quickstart File Menu Button

**File:** `quickstart-file-menu-button.png`
**Status:** FAILED TO CAPTURE (app-bar testid not found)

**Workaround:** Capture manually or fix selector

**Annotations needed:**
1. **Red highlight box** around File menu button
2. **Blue numbered callout** "1" at top-right of button
3. **Red curved arrow** pointing from text to button
4. **Text annotation**: "Click here to import your data"

**Alt text:**
```
File menu button in the top-left area of the 9Boxer application toolbar, showing 'No file selected' state. Button is highlighted with a red box and numbered callout '1', with an arrow and label 'Click here to import your data'.
```

---

### 3. Quickstart Upload Dialog

**File:** `quickstart-upload-dialog.png`
**Status:** CAPTURED (113.9 KB)

**Annotations needed:**
1. **Red highlight box** around file selection input area
2. **Red highlight box** around Upload/Import button
3. **Blue numbered callouts:**
   - "1" pointing to file input
   - "2" pointing to Upload button
4. **Text annotations:**
   - "Choose your Excel file" (near file picker)
   - "Click Import to load your data" (near button)

**Alt text:**
```
File upload dialog with file selection input highlighted (numbered "1") and Upload button highlighted (numbered "2"). Dialog shows instructions to select an Excel file.
```

---

### 4. Quickstart Grid Populated

**File:** `quickstart-grid-populated.png`
**Status:** CAPTURED (70.2 KB)

**Annotations needed:**
1. **Red thin boxes** (2px) around:
   - The entire 3x3 grid structure
   - Employee count indicator
2. **Blue numbered callouts:**
   - "1" pointing to grid
   - "2" pointing to an employee tile (pick one in top-right)
   - "3" pointing to employee count
3. **Text annotations:**
   - "Your 9-box talent grid"
   - "Employee tiles"
   - "Total employee count"
4. **Axis labels** (if not in UI):
   - "Performance →" along bottom
   - "Potential ↑" along left

**Alt text:**
```
9-box grid populated with employee tiles after successful upload. Annotations highlight: (1) the 3x3 grid structure, (2) an example employee tile, and (3) the employee count showing total employees.
```

---

### 5. Quickstart Success Annotated

**File:** `quickstart-success-annotated.png`
**Status:** CAPTURED (113.9 KB) - needs annotations

**Annotations needed:**
1. **Green checkmarks** (✓, 24px) pointing to:
   - The grid
   - Employee tiles within boxes
   - Employee count
2. **Text annotations** (white on green or semi-transparent black):
   - "✓ 3×3 grid with employee tiles"
   - "✓ Your employee count displayed"
   - "✓ Employees organized by performance and potential"
3. **Optional success banner** (green bg): "Success! Your data is loaded"

**Alt text:**
```
Successful upload state showing the 9-box grid with green checkmarks highlighting: (1) the 3×3 grid with tiles, (2) employee count, and (3) employees organized by ratings. Success message reads 'Success! Your data is loaded'.
```

---

### 6. Workflow Grid Axes Labeled

**File:** `workflow-grid-axes-labeled.png`
**Status:** CAPTURED (70.2 KB)

**Annotations needed:**
1. **Horizontal arrow** below grid labeled "Performance"
   - Markers: LOW → MEDIUM → HIGH
2. **Vertical arrow** on left labeled "Potential"
   - Markers: LOW ↑ MEDIUM ↑ HIGH
3. **Semi-transparent overlay** for clarity
4. **Optional:** Light highlighting of the 9 positions

**Alt text:**
```
9-box grid with annotated axes. Horizontal axis shows "Performance" from Low to High. Vertical axis shows "Potential" from Low to High. Grid contains employee tiles organized by these dimensions.
```

---

### 7. Workflow Drag-Drop Sequence (3 panels)

**Files:**
- `workflow-drag-drop-sequence-1.png` - NOT YET CAPTURED
- `workflow-drag-drop-sequence-2.png` - CAPTURED (70.2 KB) but needs annotations
- `workflow-drag-drop-sequence-3.png` - NOT YET CAPTURED

**Panel 1: Click and Hold**
- Annotation: "1. Click and hold"
- Red box around employee tile
- Blue callout "1"

**Panel 2: Dragging**
- Annotation: "2. Drag to new box"
- Motion arrow showing direction (red, curved, 4px)
- Target box highlighted
- Semi-transparent dragging tile
- Blue callout "2"

**Panel 3: Dropped**
- Annotation: "3. Release to drop"
- Yellow highlight on moved employee
- Blue callout "3"

**Overall label:** "Drag and drop is simple - just click, drag, and release"

**Alt text:**
```
Three-panel sequence showing drag and drop workflow. Panel 1: clicking employee tile. Panel 2: dragging to target box with motion arrow. Panel 3: employee in new position with yellow highlight.
```

---

### 8. Other Screenshots Needing Manual Capture

**Workflow Export Excel Screenshot:**
- `workflow-export-excel-2.png` - MANUAL EXCEL SCREENSHOT NEEDED
- Show exported Excel file with new columns
- Highlight "Modified in Session" and "9Boxer Change Notes" columns
- Yellow highlight on modified rows

**File Menu Button:**
- `quickstart-file-menu-button.png` - Needs recapture with correct selector

**Statistics Tab:**
- `workflow-statistics-tab.png` - Failed (dialog was blocking), needs recapture

**Changes Tab:**
- `workflow-changes-tab.png` - Failed (dialog was blocking), needs recapture

**Apply/Export Button:**
- `workflow-apply-button.png` - Failed (app-bar selector not found)

**Employee Timeline:**
- `workflow-employee-timeline.png` - Failed, needs recapture

**Employee Modified:**
- `workflow-employee-modified.png` - Failed, needs recapture

**Drag-Drop Sequences:**
- `workflow-drag-drop-sequence-1.png` - Failed
- `workflow-drag-drop-sequence-3.png` - Failed

**Employee Tile Normal:**
- `employee-tile-normal.png` - Failed

---

## Successfully Captured (No Annotations Needed)

These screenshots are clean bases for annotation:

1. `grid-normal.png` (68.5 KB) - Original grid screenshot
2. `index/hero-grid-sample.png` (70.2 KB) - Clean hero image (NO annotations)
3. `index/index-quick-win-preview.png` (113.9 KB) - Needs success annotations

---

## Annotation Workflow

### Tools Recommended:
- **Snagit** (paid, professional) - Best for consistent annotations
- **Greenshot** (free, Windows) - Good for basic needs
- **GIMP** (free, cross-platform) - For complex edits

### Process:
1. Open screenshot in annotation tool
2. Add required annotations per specifications above
3. Save as PNG with original filename
4. Optimize file size (use TinyPNG or similar)
5. Verify file size < 500KB
6. Update this document to mark as complete

---

## Completion Checklist

### Quickstart Screenshots:
- [ ] quickstart-excel-sample.png (MANUAL CAPTURE + ANNOTATE)
- [ ] quickstart-file-menu-button.png (RECAPTURE + ANNOTATE)
- [x] quickstart-upload-dialog.png (ANNOTATE ONLY)
- [x] quickstart-grid-populated.png (ANNOTATE ONLY)
- [x] quickstart-success-annotated.png (ANNOTATE ONLY)

### Workflow Screenshots:
- [x] workflow-grid-axes-labeled.png (ANNOTATE ONLY)
- [ ] workflow-statistics-tab.png (RECAPTURE + ANNOTATE)
- [ ] workflow-drag-drop-sequence-1.png (RECAPTURE + ANNOTATE)
- [x] workflow-drag-drop-sequence-2.png (ANNOTATE ONLY)
- [ ] workflow-drag-drop-sequence-3.png (RECAPTURE + ANNOTATE)
- [ ] workflow-employee-modified.png (RECAPTURE + ANNOTATE)
- [ ] workflow-employee-timeline.png (RECAPTURE + ANNOTATE)
- [ ] workflow-changes-tab.png (RECAPTURE + ANNOTATE)
- [ ] workflow-apply-button.png (RECAPTURE + ANNOTATE)
- [ ] workflow-export-excel-1.png (NOT CAPTURED)
- [ ] workflow-export-excel-2.png (MANUAL EXCEL SCREENSHOT)

### Index/Home Screenshots:
- [x] index/hero-grid-sample.png (NO ANNOTATION - clean hero)
- [x] index/index-quick-win-preview.png (ANNOTATE ONLY)

---

## Next Steps

1. Fix screenshot tool selectors for failed captures
2. Re-run tool to capture missing screenshots
3. Manually capture Excel screenshots
4. Annotate all screenshots per specifications
5. Verify all files < 500KB
6. Update screenshot manifest with completion status

---

*Last Updated: 2024-12-20*
