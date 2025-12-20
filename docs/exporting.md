# Exporting Your Changes

Export your modified employee data to Excel to save your work and share updated talent ratings.

!!! danger "Critical: No Auto-Save"
    The application does **NOT** auto-save your changes. You **MUST** export to save your work before closing the app, or all changes will be lost.

---

## When to Export

Export your changes when you:

- Have moved employees to their correct boxes
- Want to save your current session
- Are ready to share updated ratings with HR or leadership
- Need a backup before making more changes
- Are finished with a calibration session

**Best Practice:** Export frequently during long sessions to avoid losing work.

---

## Export Process

Follow these steps to export your changes:

### Step 1: Make Changes

- Drag employees to different boxes on the grid
- The "Apply" button badge shows how many changes you've made

### Step 2: Review Changes

- Click the **"Changes"** tab in the right panel
- Verify all employee movements are correct
- Add notes documenting why each change was made (recommended)

### Step 3: Click "Apply"

1. Click the **"Apply"** button in the top application bar
2. The button badge displays the number of pending changes
3. File downloads automatically to your default download folder

### Step 4: Verify Export

- Check your download folder for the exported file
- File name format: `modified_[original_filename].xlsx`
- Example: `modified_employee_data_2024.xlsx`

!!! success "Export Complete"
    Your changes are now saved to the new Excel file. Your original file remains completely unchanged.

---

## What's in the Export

The exported Excel file contains all employee data plus additional columns tracking your changes.

### Original Data Preserved

All data from your original file is preserved:

- **All original columns** (Employee ID, Worker, Job Level, Manager, etc.)
- **Updated Performance ratings** (based on new grid position)
- **Updated Potential ratings** (based on new grid position)
- **All additional columns** from your original file

!!! info "Original File Unchanged"
    Your original Excel file is never modified. The export creates a new file with updated ratings.

### Regular Change Tracking Columns

These columns are added to track regular employee movements:

| Column Name | Description | Example Value |
|-------------|-------------|---------------|
| **Modified in Session** | Indicates if employee was moved | `Yes` or empty |
| **Modification Date** | Timestamp of last movement | `2024-12-20 14:32:15` |
| **9Boxer Change Description** | Formatted description of the movement | `Moved from Core Talent [M,M] to Star [H,H]` |
| **9Boxer Change Notes** | Your notes explaining the change | `Promoted to manager role in Q4, strong leadership` |

**Regular change columns explained:**

- **Modified in Session**: Shows "Yes" for any employee you moved, empty for unchanged employees
- **Modification Date**: Exact timestamp when you last moved that employee
- **9Boxer Change Description**: Human-readable description of the change (from → to)
- **9Boxer Change Notes**: Any notes you added in the Changes tab documenting why the change was made

### Donut Exercise Columns

If you used [Donut Mode](donut-mode.md), four additional columns are added:

| Column Name | Description | Example Value |
|-------------|-------------|---------------|
| **Donut Exercise Position** | Position number (1-9) from donut exercise | `9` |
| **Donut Exercise Label** | Box label from donut exercise | `Star [H,H]` |
| **Donut Exercise Change Description** | Formatted donut movement description | `Donut: Moved from Core Talent [M,M] to High Potential [M,H]` |
| **Donut Exercise Notes** | Your donut exercise notes | `Actually exceeds expectations, should be High Performer` |

**Donut columns explained:**

- **Donut Exercise Position**: The position number (1-9) where you placed the employee during the donut exercise
- **Donut Exercise Label**: The human-readable label for that position (e.g., "Star [H,H]")
- **Donut Exercise Change Description**: Formatted text showing the donut placement movement
- **Donut Exercise Notes**: Your notes added during the donut exercise explaining the exploratory placement

!!! info "Regular vs. Donut Changes"
    - **Regular changes** affect the actual Performance and Potential columns (real talent decisions)
    - **Donut exercise data** appears in separate columns and does NOT change actual ratings (exploratory data)
    - An employee can have both regular changes AND donut exercise data in the same export

**For employees with donut placements:**

- All four donut columns are populated
- The regular Performance/Potential columns show their ACTUAL ratings (unchanged by donut exercise)
- This gives you both actual ratings and exercise findings side-by-side

**For employees without donut placements:**

- The four donut columns are empty
- Only employees you placed in Donut Mode have donut data

### Excluded Employees

!!! warning "Excluded Employees ARE Included in Export"
    All employees are included in the export, even those you excluded from the grid view.

    Excluded employees are marked with an "Excluded" flag so you can identify them.

This ensures you don't accidentally lose employee data when exporting.

---

## Complete Column Reference

The exported Excel file contains these columns (in addition to your original columns):

### Original Columns (Preserved)

All columns from your uploaded file, including:

- `Employee ID`
- `Worker`
- `Performance` (updated based on grid position)
- `Potential` (updated based on grid position)
- `Job Level - Primary Position`
- `Business Title`
- `Manager`
- `Organization Name - Level 01`, `Level 02`, etc.
- Any other columns from your original file

### Added Columns (Regular Changes)

| Column | Always Present? | Description |
|--------|-----------------|-------------|
| `Modified in Session` | Yes | "Yes" if employee was moved, empty otherwise |
| `Modification Date` | Yes | Timestamp of last movement |
| `9Boxer Change Description` | Yes | Formatted movement description |
| `9Boxer Change Notes` | Yes | Your notes explaining the change |

### Added Columns (Donut Exercise)

| Column | When Present? | Description |
|--------|---------------|-------------|
| `Donut Exercise Position` | Only if Donut Mode used | Position number (1-9) from donut exercise |
| `Donut Exercise Label` | Only if Donut Mode used | Box label (e.g., "Star [H,H]") |
| `Donut Exercise Change Description` | Only if Donut Mode used | Donut movement description |
| `Donut Exercise Notes` | Only if Donut Mode used | Your donut exercise notes |

!!! example "Sample Export Row"
    **Original data:**
    - Employee ID: 12345
    - Worker: John Doe
    - Original Position: Core Talent [M,M]

    **After moving to Star [H,H] and adding note:**
    - Performance: High (updated)
    - Potential: High (updated)
    - Modified in Session: Yes
    - Modification Date: 2024-12-20 14:32:15
    - 9Boxer Change Description: Moved from Core Talent [M,M] to Star [H,H]
    - 9Boxer Change Notes: Promoted to manager role in Q4, strong leadership

---

## After Export

Once your export completes:

- **Changes are saved** to the new Excel file
- **You can continue working** - Make more changes in the application
- **Export again** - Each time you click "Apply", a new file is created
- **Use exported file as input** - Upload the exported file to start a new session with updated ratings

!!! tip "Versioning Your Exports"
    Since each export creates a new file, you can maintain multiple versions of your talent data:

    - `modified_talent_2024_q1.xlsx`
    - `modified_talent_2024_q2.xlsx`
    - `modified_talent_2024_calibration_session.xlsx`

---

## Export Errors and Solutions

### "No modifications to export"

**Problem:** You haven't moved any employees yet.

**Solution:** Drag at least one employee to a new box before exporting.

### "Export failed"

**Possible causes:**

- Download folder is full
- No write permissions to download location
- Disk space issues

**Solutions:**

1. Check your download folder has available space
2. Ensure you have write permissions to your download directory
3. Try closing and reopening the application
4. Try exporting to a different browser if using web version

### Can't find exported file

**Problem:** Export succeeded but can't locate the file.

**Solutions:**

1. Check your browser's default download folder
2. Search your computer for files starting with `modified_`
3. Check browser download history
4. Try exporting again and watch where the file saves

### Export is missing columns

**Problem:** Expected columns are missing from export.

**Possible causes:**

- Donut columns only appear if you used Donut Mode
- Some columns may be hidden in Excel

**Solutions:**

1. Check if columns are hidden (Excel: Home → Format → Unhide Columns)
2. Verify you used Donut Mode if expecting donut columns
3. Re-upload your file and export again

---

## Best Practices for Exporting

1. **Export frequently** - Save your work after every major set of changes (remember: no auto-save!)
2. **Add notes before exporting** - Document why you made each change in the Changes tab
3. **Review before exporting** - Check the Changes tab to ensure all movements are correct
4. **Verify the export** - Open the exported file to confirm changes saved correctly
5. **Keep milestone versions** - Export at key points (quarterly, after calibration sessions, etc.)
6. **Store exports securely** - These files contain sensitive employee performance data
7. **Use exported files as input** - Upload the modified file to continue working in a future session

---

## Related Topics

- [Tracking Changes](tracking-changes.md) - Add notes to document your changes before exporting
- [Donut Mode](donut-mode.md) - Learn about donut exercise columns in exports
- [Tips & Best Practices](tips.md) - Session management and export workflow tips
- [Troubleshooting](troubleshooting.md) - Solutions for common export issues
