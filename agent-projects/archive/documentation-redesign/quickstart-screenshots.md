# Quickstart Page - Screenshot Specifications

**Document Version:** 1.0
**Created:** 2024-12-20
**For:** Task 1.1 - Quickstart Page
**Page:** `docs/quickstart.md`

---

## Overview

This document specifies the **5 required screenshots** for the Quickstart page, following the standards defined in `screenshot-specifications.md`.

Each screenshot below includes:

- **Filename** - Following the naming convention
- **UI State Description** - Exact state to capture
- **Annotation Requirements** - Red boxes, callouts, arrows, labels
- **Alt Text** - Descriptive text for accessibility
- **Priority** - Critical path indicators

---

## Screenshot 1: Sample Excel File

**Filename:** `quickstart-excel-sample.png`

**UI State:**

- Open `Sample_People_List.xlsx` in Microsoft Excel or LibreOffice Calc
- Show first 5-10 rows of data
- Ensure columns A-D are visible (Employee ID, Worker, Performance, Potential)
- Zoom to comfortable reading size (120-150%)

**Annotations:**

1. **Green highlight boxes** (3px border, #4CAF50, no fill) around:
   - Column header "Employee ID" (cell A1)
   - Column header "Worker" (cell B1)
   - Column header "Performance" (cell C1)
   - Column header "Potential" (cell D1)
2. **Numbered callouts** (blue circles with white numbers):
   - "1" pointing to Employee ID column
   - "2" pointing to Worker column
   - "3" pointing to Performance column
   - "4" pointing to Potential column
3. **Text annotation** (white on semi-transparent black):
   - Top of image: "Your Excel file needs these 4 columns with exact names"

**Alt Text:**

> Sample Excel spreadsheet showing the 4 required columns highlighted in green: Employee ID, Worker, Performance, and Potential. Each column header is numbered 1-4. First 10 rows of sample employee data are visible.

**Priority:** CRITICAL - This is the first thing users see

---

## Screenshot 2: File Menu Button (Initial State)

**Filename:** `quickstart-file-menu-button.png`

**UI State:**

- 9Boxer application freshly opened (no data loaded)
- File menu button shows "No file selected"
- No badge on button (0 changes)
- Standard window size (1600x1000px)
- Capture top-left area of app showing app bar with File menu

**Annotations:**

1. **Red highlight box** (3px border, #FF0000, no fill):
   - Around the File menu button (entire button including folder icon)
2. **Numbered callout** (blue circle with white "1"):
   - Top-right of the button
3. **Arrow** (red, 4px, curved):
   - Pointing from annotation text to File menu button
4. **Text annotation** (white on semi-transparent black):
   - "Click here to import your data"

**Alt Text:**

> File menu button in the top-left area of the 9Boxer application toolbar, showing 'No file selected' state. Button is highlighted with a red box and numbered callout '1', with an arrow and label 'Click here to import your data'.

**Priority:** CRITICAL - Primary action for users

---

## Screenshot 3: File Upload Dialog

**Filename:** `quickstart-upload-dialog.png`

**UI State:**

- File menu dropdown is open
- "Import Data" menu item is visible
- ALTERNATIVE STATE: File upload dialog is open with file selected
  - Dialog shows file picker or selected file
  - "Import" button is visible and enabled

**Annotations:**

For **Menu State**:

1. **Red highlight box** around "Import Data" menu item
2. **Numbered callout** "2" next to menu item
3. **Text annotation**: "Select Import Data"

For **Dialog State** (preferred):

1. **Red highlight box** around selected Excel file in file picker area
2. **Red highlight box** around "Import" button
3. **Numbered callouts**:
   - "1" pointing to file selection area
   - "2" pointing to Import button
4. **Text annotations**:
   - "Choose your Excel file" (near file picker)
   - "Click Import to load your data" (near Import button)

**Alt Text:**

> File upload dialog showing Excel file selection interface. The file picker area is highlighted with a red box and numbered '1', with annotation 'Choose your Excel file'. The Import button is highlighted with a red box and numbered '2', with annotation 'Click Import to load your data'.

**Priority:** CRITICAL - Essential step in workflow

---

## Screenshot 4: Grid Populated with Employees

**Filename:** `quickstart-grid-populated.png`

**UI State:**

- Data successfully uploaded (use Sample_People_List.xlsx)
- 9-box grid is fully visible with employee tiles
- All 9 boxes visible (3x3 grid)
- Right panel showing employee count
- No filters active (no orange dot on Filters button)
- Standard view (not expanded boxes)
- Capture full application window

**Annotations:**

1. **Red highlight boxes** (thin, 2px) around:
   - The entire 3x3 grid structure
   - Employee count indicator in right panel
2. **Numbered callouts**:
   - "1" pointing to the grid structure
   - "2" pointing to an employee tile (pick one in top-right box)
   - "3" pointing to employee count
3. **Text annotations**:
   - "Your 9-box talent grid" (near grid)
   - "Employee tiles" (near highlighted tile)
   - "Total employee count" (near count indicator)
4. **Axis labels** (if not already visible in UI):
   - "Performance →" along bottom (horizontal axis)
   - "Potential ↑" along left side (vertical axis)

**Alt Text:**

> 9-box grid populated with employee tiles after successful upload. The grid shows employees organized in 9 boxes by Performance (horizontal axis) and Potential (vertical axis). Annotations highlight: (1) the 3x3 grid structure, (2) an example employee tile, and (3) the employee count in the right panel showing total number of employees.

**Priority:** CRITICAL - The "success" moment for users

---

## Screenshot 5: Success State Annotated

**Filename:** `quickstart-success-annotated.png`

**UI State:**

- Same as Screenshot 4 (populated grid)
- Full application visible
- All UI elements in successful state

**Annotations:**

1. **Green checkmarks** (✓, 24px, #4CAF50, white circle background):
   - Checkmark pointing to the grid
   - Checkmark pointing to employee tiles within boxes
   - Checkmark pointing to employee count
2. **Text annotations** (white on semi-transparent black):
   - "✓ 3×3 grid with employee tiles"
   - "✓ Your employee count displayed"
   - "✓ Employees organized by performance and potential"
3. **Success banner** (optional, green background, white text):
   - Top of image: "Success! Your data is loaded"

**Alt Text:**

> Successful upload state showing the 9-box grid with green checkmarks highlighting three key success indicators: (1) the 3×3 grid structure with employee tiles, (2) the employee count displayed in the interface, and (3) employees correctly organized by their performance and potential ratings. Success message at top reads 'Success! Your data is loaded'.

**Priority:** CRITICAL - Confirms success to user

---

## Production Notes

### Screenshot Capture Order

Recommended order to minimize setup/teardown:

1. **Screenshot 1** - Capture Excel file first (separate application)
2. **Screenshot 2** - Open 9Boxer (empty state) and capture File menu
3. **Screenshot 3** - Click File menu, capture dialog
4. **Screenshot 4** - Complete upload, capture populated grid
5. **Screenshot 5** - Add success annotations to Screenshot 4 (same base image)

### Sample Data Requirements

- Use `resources/Sample_People_List.xlsx` for all screenshots
- Ensure sample has realistic distribution across all 9 boxes
- If using custom sample data, use realistic but fictional names:
  - Sarah Chen, Marcus Johnson, Emma Rodriguez, etc.
  - Mix of genders and culturally diverse names
  - Avoid any real employee data

### Technical Specifications

All screenshots must follow these specs (from `screenshot-specifications.md`):

- **Format:** PNG with transparency
- **Resolution:** 2400px width, 144 DPI (2x for retina)
- **File size:** Optimized, ideally <500KB each
- **Storage:** `docs/images/screenshots/quickstart/` folder

### Annotation Colors

Strict color palette:

- **Red highlights:** #FF0000
- **Green success:** #4CAF50
- **Blue callouts:** #1976D2
- **White text:** #FFFFFF
- **Black background:** #000000 @ 60% opacity

### Accessibility Checklist

For each screenshot:

- [ ] Alt text is complete and descriptive
- [ ] Annotations use high-contrast colors
- [ ] Text is readable at 16px minimum
- [ ] No reliance on color alone (use shapes + text)

---

## Screenshot Manifest

Quick reference table:

| # | Filename | Subject | State | Annotations |
|---|----------|---------|-------|-------------|
| 1 | `quickstart-excel-sample.png` | Excel file | 4 columns visible | Green boxes + numbers |
| 2 | `quickstart-file-menu-button.png` | File menu button | Empty app | Red box + callout "1" |
| 3 | `quickstart-upload-dialog.png` | Upload dialog | File selected | Red boxes + callouts |
| 4 | `quickstart-grid-populated.png` | Grid view | Data loaded | Red boxes + labels |
| 5 | `quickstart-success-annotated.png` | Success state | Data loaded | Green checkmarks |

---

## Integration Checklist

Before considering screenshots complete:

- [ ] All 5 screenshots captured at correct resolution
- [ ] All annotations applied per specifications
- [ ] All files named correctly
- [ ] All files optimized (<500KB each)
- [ ] All files saved to `docs/images/screenshots/quickstart/`
- [ ] All alt text added to `docs/quickstart.md`
- [ ] All screenshots render correctly in MkDocs preview
- [ ] Annotations are legible when scaled down 50%

---

**Next Steps:**

1. Create screenshots following these specifications (Task 1.5)
2. Save to appropriate folder structure
3. Update `docs/quickstart.md` with final image references
4. Validate rendering in MkDocs

---

*Screenshot Specifications for Quickstart Page*
*Version 1.0 | December 2024 | 9Boxer Documentation Redesign*
