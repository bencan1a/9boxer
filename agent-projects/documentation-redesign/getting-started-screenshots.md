# Getting Started Page - Screenshot Specifications

**Page:** `docs/getting-started.md`
**Total Screenshots Required:** 8
**Purpose:** Visual guidance for the complete 10-minute workflow tutorial

---

## Screenshot List

### 1. Excel Sample File
**Filename:** `upload-excel-sample.png`
**Location in page:** Step 1 - Upload Your Employee Data
**Size:** 1800px wide (detail callout)

**UI State to Capture:**
- Open `Sample_People_List.xlsx` in Excel
- Zoom to show first 5-10 rows clearly
- Show all 4 required columns visible

**Required Columns Visible:**
- Employee ID
- Worker
- Performance
- Potential

**Annotations:**
- Red highlight box around column headers
- Numbered callouts (1-4) on each required column
- Label: "These 4 columns are required (exact names)"

**Alt Text:**
```
Excel spreadsheet showing the 4 required columns highlighted with red boxes and numbered callouts: 1) Employee ID, 2) Worker, 3) Performance, 4) Potential. Sample data shows employees with High/Medium/Low ratings.
```

---

### 2. Upload Dialog
**Filename:** `upload-dialog.png`
**Location in page:** Step 1 - Upload Your File
**Size:** 1800px wide (partial UI)

**UI State to Capture:**
- File upload dialog open (after clicking "File → Import Data" or empty state button)
- File picker showing, ready to select file
- "Upload" button visible in dialog

**Annotations:**
- Red highlight box around file selection area
- Numbered callout "1" on file input
- Numbered callout "2" on Upload button
- Label: "Select your Excel file, then click Upload"

**Alt Text:**
```
File upload dialog with file selection input highlighted (numbered "1") and Upload button highlighted (numbered "2"). Dialog shows instructions to select an Excel file.
```

---

### 3. Grid Populated with Employees
**Filename:** `grid-populated.png`
**Location in page:** Step 1 - Success Check
**Size:** 2400px wide (full application)

**UI State to Capture:**
- Grid fully loaded with sample employees
- All 9 boxes visible
- Employee count visible in top bar (e.g., "15 employees")
- At least 10-15 employee tiles visible across boxes

**Annotations:**
- Green checkmark pointing to grid
- Green checkmark pointing to employee count
- Green checkmark pointing to employee tiles
- Label: "Success! Your employees are on the grid"

**Alt Text:**
```
9-box grid populated with employee tiles after successful upload. Three green checkmarks highlight: 1) the complete 3x3 grid, 2) employee count showing "15 employees" in top bar, 3) employee tiles organized in boxes. Success message visible.
```

---

### 4. Grid with Axes Labeled
**Filename:** `grid-axes-labeled.png`
**Location in page:** Step 2 - The 3×3 Grid Layout
**Size:** 2400px wide (full grid)

**UI State to Capture:**
- Grid with employees visible
- Clear view of all 9 boxes
- Grid structure clearly visible

**Annotations:**
- Horizontal arrow below grid labeled "Performance" with markers: "LOW → MEDIUM → HIGH"
- Vertical arrow left of grid labeled "Potential" with markers: "LOW ↑ MEDIUM ↑ HIGH"
- Both axes labeled with semi-transparent overlay
- Optional: Light overlay highlighting the 9 positions

**Alt Text:**
```
9-box grid with annotated axes. Horizontal axis at bottom shows "Performance" from Low to High (left to right). Vertical axis on left shows "Potential" from Low to High (bottom to top). Grid contains employee tiles organized by these two dimensions.
```

---

### 5. Statistics Tab Distribution
**Filename:** `statistics-distribution.png`
**Location in page:** Step 2 - Check Your Distribution
**Size:** 1800px wide (partial UI - right panel)

**UI State to Capture:**
- Right panel open with Statistics tab selected
- Distribution table visible showing counts per position
- Distribution chart/visualization visible (if shown)
- Clear view of percentages or counts

**Annotations:**
- Red highlight box around Statistics tab
- Numbered callout "1" on tab
- Red highlight box around distribution data
- Label: "View your talent distribution here"

**Alt Text:**
```
Statistics tab in right panel showing distribution table. Tab is highlighted with red box and numbered "1". Distribution data shows employee counts across the 9 grid positions, with percentages for each box. Chart visualizes the distribution.
```

---

### 6. Drag and Drop Sequence
**Filename:** `drag-drop-sequence.png`
**Location in page:** Step 3 - How to Move an Employee
**Size:** 2400px wide (three-panel sequence)

**UI State to Capture - Three Panels:**

**Panel 1: Click and Hold**
- Employee tile highlighted (ready to drag)
- Mouse cursor visible over tile
- Annotation: "1. Click and hold"

**Panel 2: Dragging**
- Employee tile semi-transparent, being dragged
- Motion arrow showing direction
- Target box highlighted
- Annotation: "2. Drag to new box"

**Panel 3: Dropped**
- Employee tile in new position
- Yellow highlight on tile (modified indicator)
- Annotation: "3. Release to drop"

**Annotations:**
- Each panel numbered (1, 2, 3) in blue circles
- Motion arrow in panel 2 (red, curved)
- Yellow highlight visible in panel 3
- Overall label: "Drag and drop is simple - just click, drag, and release"

**Alt Text:**
```
Three-panel sequence showing drag and drop workflow. Panel 1 shows clicking and holding employee tile (numbered "1"). Panel 2 shows dragging tile to target box with motion arrow (numbered "2"). Panel 3 shows employee in new position with yellow highlight indicating modification (numbered "3").
```

---

### 7. Employee Modified with Yellow Highlight
**Filename:** `employee-modified-yellow.png`
**Location in page:** Step 3 - After moving (and Step 6 panel 3)
**Size:** 1200px wide (detail callout)

**UI State to Capture:**
- Single employee tile with yellow background/border
- Tile clearly showing modified state
- Surrounding context (part of grid box)

**Annotations:**
- Red highlight box around yellow tile
- Arrow pointing to yellow color
- Label: "Yellow = modified in this session"

**Alt Text:**
```
Employee tile with yellow highlight indicating it has been moved during the current session. Red box and arrow point to the yellow background color, with label explaining "Yellow = modified in this session".
```

---

### 8. Employee Details Timeline
**Filename:** `employee-timeline.png`
**Location in page:** Step 3 - Review What Changed
**Size:** 1800px wide (partial UI - right panel)

**UI State to Capture:**
- Employee details panel open
- Timeline/history section visible
- Shows previous and new position
- Timestamp of change visible

**Annotations:**
- Red highlight box around timeline section
- Arrow pointing to "Previous position" entry
- Arrow pointing to "New position" entry
- Label: "Timeline shows your changes"

**Alt Text:**
```
Employee details panel showing timeline of movements. Timeline section highlighted with red box, showing employee's previous position and new position with timestamps. Arrows point to key entries in the timeline.
```

---

### 9. Changes Tab with Note Field
**Filename:** `changes-add-note.png`
**Location in page:** Step 4 - How to Add a Note
**Size:** 1800px wide (partial UI - right panel)

**UI State to Capture:**
- Right panel with Changes tab selected
- Notes field visible and ready for input
- Example note partially typed or shown
- Clear view of the note-taking interface

**Annotations:**
- Red highlight box around Changes tab
- Numbered callout "1" on tab
- Red highlight box around Notes field
- Numbered callout "2" on field
- Example text in field: "Promoted to Senior Engineer Q4 2024, consistently exceeds deliverables"
- Label: "Add your explanation here"

**Alt Text:**
```
Changes tab selected in right panel (highlighted with red box numbered "1"). Notes field highlighted with red box numbered "2", showing example note: "Promoted to Senior Engineer Q4 2024, consistently exceeds deliverables". Label indicates where to type explanations.
```

---

### 10. Export Button with Badge
**Filename:** `export-button-with-badge.png`
**Location in page:** Step 5 - How to Export
**Size:** 1200px wide (detail callout - top bar)

**UI State to Capture:**
- Export button in top-right corner
- Badge showing number of changes (e.g., "3")
- Button clearly visible and clickable state

**Annotations:**
- Red highlight box around Export button
- Arrow pointing to badge count
- Label: "Badge shows how many changes you've made"

**Alt Text:**
```
Export button in top-right corner with badge showing "3" changes. Red highlight box surrounds button, arrow points to badge, label reads "Badge shows how many changes you've made".
```

---

### 11. Exported Excel with New Columns
**Filename:** `export-excel-columns.png`
**Location in page:** Step 5 - What's in the Export?
**Size:** 1800px wide (Excel window)

**UI State to Capture:**
- Exported Excel file open
- Original columns visible PLUS new columns
- "Modified in Session" column visible (showing "Yes" for changed rows)
- "9Boxer Change Notes" column visible (showing example notes)
- At least 3-5 rows visible with data

**Annotations:**
- Red highlight box around "Modified in Session" column header
- Red highlight box around "9Boxer Change Notes" column header
- Numbered callout "1" and "2" on these columns
- Yellow highlight on a row that was modified
- Label: "New columns show your changes and notes"

**Alt Text:**
```
Exported Excel file showing original employee data plus two new columns highlighted with red boxes: "Modified in Session" (numbered "1") showing "Yes" for changed employees, and "9Boxer Change Notes" (numbered "2") showing explanatory notes. Modified rows have yellow highlight.
```

---

## Summary

**Total Screenshots:** 11 (some used in multiple places)

**Distribution:**
- Step 1 (Upload): 3 screenshots
- Step 2 (Review): 2 screenshots
- Step 3 (Change): 3 screenshots
- Step 4 (Document): 1 screenshot
- Step 5 (Export): 2 screenshots

**Annotation Requirements:**
- Red highlight boxes for clickable elements
- Blue numbered callouts for sequences
- Green checkmarks for success indicators
- Yellow highlights for modified states
- Arrows for pointing/direction
- Text labels for explanations

**Common Elements:**
- All use 2x resolution (144 DPI)
- Saved as PNG with alpha channel
- Optimized file size (<500KB where possible)
- Stored in `docs/images/screenshots/`
- Descriptive alt text for accessibility

---

## Notes for Screenshot Capture

### Data Preparation
- Use `frontend/playwright/fixtures/sample-employees.xlsx` for consistent data
- Ensure at least 15 employees across different positions
- Use realistic but fictional names (Alice Smith, Bob Johnson, etc.)
- Include variety of job titles and departments

### Application State
- Start with clean state (no filters active)
- Use default theme (light mode for consistency)
- Ensure window is standard size (not maximized)
- No active dialogs or overlays unless required for screenshot

### Capture Process
1. Start backend and frontend servers
2. Upload sample data
3. Navigate to required UI state
4. Capture screenshot at 2x resolution
5. Annotate using standards in screenshot-specifications.md
6. Optimize file size
7. Save with proper naming convention

### Testing
- Verify each screenshot matches the described UI state
- Check that annotations are clear and helpful
- Confirm alt text is descriptive
- Test rendering in MkDocs preview

---

**Document Version:** 1.0
**Created:** December 2024
**For Task:** 1.2 - Revise Getting Started Page
