# Manual Screenshots Documentation

This document lists the 8 screenshots that require manual creation or composition. These screenshots cannot be fully automated because they require:
- Excel file views (requires Excel/LibreOffice)
- Multi-panel compositions (requires image editing)
- Annotations and callouts (requires image editing software)

## Manual Screenshot List

### 1. `quickstart-excel-sample`
**Path**: `resources/user-guide/docs/images/screenshots/quickstart/quickstart-excel-sample.png`

**Description**: Sample Excel file format showing required columns

**Why Manual**: Requires screenshot of Excel/LibreOffice showing the file open with columns visible

**Instructions**:
1. Open `resources/Sample_People_List.xlsx` in Excel or LibreOffice Calc
2. Adjust column widths to show all headers clearly
3. Ensure first 10-15 rows are visible
4. Capture screenshot showing:
   - Required columns: employee_id, employee_name, performance, potential
   - Optional columns: level, manager, job_profile, etc.
5. Crop to show just the spreadsheet content (no menu bars)
6. Save as PNG

**Recommended Tool**: Excel, LibreOffice Calc, or Numbers

---

### 2. `calibration-export-results`
**Path**: `resources/user-guide/docs/images/screenshots/workflow/calibration-export-results.png`

**Description**: Exported Excel file with changes applied

**Why Manual**: Requires screenshot of Excel file showing updated ratings after export

**Instructions**:
1. Complete calibration workflow (load data, make changes, export)
2. Open exported Excel file in Excel/LibreOffice
3. Ensure columns show:
   - Original ratings (performance, potential)
   - New updated ratings
   - Change indicators or notes if applicable
4. Capture screenshot showing changed values
5. Optional: Highlight changed cells with subtle color or border
6. Save as PNG

**Recommended Tool**: Excel or LibreOffice Calc

---

### 3. `changes-drag-sequence`
**Path**: `resources/user-guide/docs/images/screenshots/workflow/making-changes-drag-sequence-base.png`

**Description**: Base grid for 3-panel drag sequence (requires manual composition)

**Why Manual**: Requires creating a 3-panel before/during/after composition showing drag operation

**Instructions**:
1. Generate or capture 3 sequential screenshots:
   - **Panel 1**: Employee selected/highlighted before drag
   - **Panel 2**: Employee being dragged (in motion)
   - **Panel 3**: Employee dropped in new box
2. Use image editing software to create 3-panel horizontal composition:
   - Arrange panels side-by-side with small gaps
   - Add subtle numbers (1, 2, 3) in corners
   - Optional: Add arrow annotations showing drag direction
3. Ensure consistent viewport size across all 3 panels
4. Save composite as PNG

**Recommended Tool**: Figma, Photoshop, GIMP, or Affinity Photo

**Note**: The automated workflow generates the base grid state. Manual work involves capturing the drag states and compositing.

---

### 4. `notes-export-excel`
**Path**: `resources/user-guide/docs/images/screenshots/workflow/workflow-changes-notes-in-excel.png`

**Description**: Excel export with notes column (manual capture required)

**Why Manual**: Requires screenshot of Excel file showing notes column

**Instructions**:
1. Add notes to several employee changes in the app
2. Export to Excel
3. Open exported file in Excel/LibreOffice
4. Ensure notes column is visible and contains sample notes
5. Adjust column width to show full note text
6. Capture screenshot showing:
   - Employee names
   - Changed ratings
   - Notes column with meaningful examples
7. Save as PNG

**Recommended Tool**: Excel or LibreOffice Calc

---

### 5. `filters-before-after`
**Path**: `resources/user-guide/docs/images/screenshots/filters/filters-before-state.png`

**Description**: Before/after filtering comparison (requires manual 2-panel composition)

**Why Manual**: Requires side-by-side comparison showing impact of filters

**Instructions**:
1. Capture 2 screenshots:
   - **Before**: Grid with all employees visible (no filters)
   - **After**: Grid with filters applied showing reduced set
2. Use image editing software to create 2-panel horizontal composition:
   - Left panel: Before state
   - Right panel: After state
   - Add labels "Before" and "After" above each panel
   - Optional: Add arrow or "→" between panels
3. Ensure both panels have same viewport size
4. Save composite as PNG

**Recommended Tool**: Figma, Photoshop, GIMP, or Affinity Photo

---

### 6. `donut-mode-toggle-comparison`
**Path**: `resources/user-guide/docs/images/screenshots/donut/donut-mode-toggle-comparison.png`

**Description**: Side-by-side normal vs donut mode comparison

**Why Manual**: Requires 2-panel composition showing mode differences

**Instructions**:
1. Capture 2 screenshots of the same data:
   - **Left panel**: Normal grid mode
   - **Right panel**: Donut mode
2. Use image editing software to create 2-panel horizontal composition:
   - Arrange side-by-side with small gap
   - Add labels "Normal Mode" and "Donut Mode"
   - Ensure same employee data in both views
   - Optional: Highlight the mode toggle button in each
3. Save composite as PNG

**Recommended Tool**: Figma, Photoshop, GIMP, or Affinity Photo

---

### 7. `excel-file-new-columns`
**Path**: `resources/user-guide/docs/images/screenshots/excel-file-new-columns.png`

**Description**: Excel file showing new columns after export

**Why Manual**: Requires screenshot of Excel file highlighting new columns

**Instructions**:
1. Export data from app after making changes
2. Open exported Excel file in Excel/LibreOffice
3. Identify new columns added by the app:
   - `new_performance` (or similar)
   - `new_potential` (or similar)
   - `changed` (boolean/indicator)
   - `notes` (if present)
4. Capture screenshot showing:
   - Original columns (employee_id, employee_name, performance, potential)
   - New columns side-by-side for comparison
5. Optional: Highlight new column headers with subtle color
6. Save as PNG

**Recommended Tool**: Excel or LibreOffice Calc

---

### 8. `quickstart-success-annotated`
**Path**: `resources/user-guide/docs/images/screenshots/quickstart/quickstart-success-annotated.png`

**Description**: Full application view showing populated grid and employee count (requires manual annotation)

**Why Manual**: Requires adding callout annotations to highlight key UI elements

**Instructions**:
1. Capture full application screenshot after successful file upload:
   - Grid populated with employee tiles
   - Toolbar showing file name
   - Employee count visible
2. Use image editing software to add annotations:
   - Arrow or callout pointing to file name in toolbar
   - Arrow or callout pointing to employee count
   - Arrow or callout pointing to populated grid
   - Optional: Add text labels explaining each element
3. Use consistent annotation style:
   - Color: Bright but not overwhelming (orange, blue, or red)
   - Font: Clear, readable sans-serif
   - Arrows: Simple, clean style
4. Save annotated version as PNG

**Recommended Tool**: Figma, Photoshop, GIMP, Affinity Photo, or Snagit

---

## Best Practices for Manual Screenshots

### Image Quality
- **Resolution**: Capture at 1400x900 viewport (matches automated screenshots)
- **Format**: Save as PNG (lossless compression)
- **File Size**: Optimize to <500KB when possible (use tools like TinyPNG)
- **DPI**: 72 DPI for web use

### Composition Guidelines
- **Alignment**: Use grids/guides to ensure pixel-perfect alignment
- **Spacing**: Maintain consistent gaps between panels (8-16px recommended)
- **Labels**: Use clear, concise text labels for panel identifiers
- **Backgrounds**: Use subtle backgrounds or white space, avoid distracting patterns

### Annotation Guidelines
- **Color**: Use brand colors or high-contrast colors (avoid neon)
- **Font**: Sans-serif, 14-16px minimum for readability
- **Arrows**: Simple, single-color, with clear direction
- **Callouts**: Brief text, positioned to avoid covering important UI elements
- **Consistency**: Use same style across all annotated screenshots

### Excel Screenshots
- **Column Widths**: Adjust to show full content without truncation
- **Row Visibility**: Show 10-15 rows minimum for context
- **Headers**: Always include column headers in view
- **Zoom**: Use 100% zoom for clarity
- **Clean Data**: Use realistic but not sensitive data

### Tools Recommendations

**For Excel/Spreadsheet Screenshots**:
- Microsoft Excel (Windows/macOS)
- LibreOffice Calc (free, cross-platform)
- Google Sheets (web-based, free)

**For Image Composition & Editing**:
- **Professional**: Figma (free for individuals), Adobe Photoshop, Affinity Photo
- **Free**: GIMP, Paint.NET (Windows), Pixlr (web-based)
- **Quick Annotations**: Snagit, Greenshot (Windows), Skitch (macOS)

**For Screenshot Capture**:
- **Windows**: Snipping Tool, Greenshot, ShareX
- **macOS**: Command+Shift+4, CleanShot X, Shottr
- **Linux**: Flameshot, Shutter, GNOME Screenshot

## Regenerating Manual Screenshots

Manual screenshots should be regenerated when:
- UI design changes significantly
- Excel export format changes
- Workflow steps change
- Image quality needs improvement
- New branding or color scheme is adopted

**Frequency**: Review and update manual screenshots quarterly or after major releases.

## Automation Opportunities

Some manual screenshots could potentially be automated in the future:
- **Excel views**: Could use headless LibreOffice or Excel automation APIs
- **Annotations**: Could use programmatic image editing (Canvas, Sharp)
- **Compositions**: Could use automated layout tools

However, manual creation often provides better quality and flexibility for:
- Artistic composition decisions
- Context-aware annotation placement
- Highlighting specific details
- Responsive design adjustments

## Questions or Issues?

If you encounter issues with manual screenshots:
1. Check this documentation for updated instructions
2. Review existing screenshots for style consistency
3. Consult the Screenshot Guide (`docs/contributing/screenshot-guide.md`)
4. Ask in team chat or create GitHub issue

## Related Documentation

- [Screenshot Generator README](README.md) - Automated screenshot system
- [Screenshot Configuration](config.ts) - Complete screenshot registry
- [Screenshot Guide](../../../docs/contributing/screenshot-guide.md) - Style standards
- [User Guide](../../../resources/user-guide/) - Where screenshots are used
