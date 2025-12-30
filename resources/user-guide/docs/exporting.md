# Exporting Your Changes

Export your modified employee data to Excel to save your work and share updated talent ratings.

!!! info "Apply Changes = Save Your Work"
    When you click **File menu → Apply X Changes**, a dialog appears with two options:
    - **Update original file** (default) - Saves changes back to your original Excel file
    - **Save to different file** - Creates a new file with a different name/location

    Choose the option that fits your workflow. The terms "apply changes" and "export" both mean saving your work to an Excel file.

!!! danger "Critical: No Auto-Save"
    The application does **NOT** auto-save your changes. You **MUST** export to save your work before closing the app, or all changes will be lost.

---

<details>
<summary>📋 Quick Reference (Click to expand)</summary>

**How to Apply Changes:**
- Make changes → Review Changes tab → File menu → Apply X Changes
- Choose: Update original file OR Save to different file
- Original file updated (or new file created based on your choice)

**Finding Your File:**
- **Update original**: Changes saved to the same file you loaded
- **Save to different**: You choose the location and filename in the dialog
- Recent files list (File menu) shows recently used files for quick access

**What's Included:**
- All original columns + updated Performance/Potential ratings
- Added columns: Modified in Session, Modification Date, Change Description, Change Notes
- Donut columns (if Donut Mode used): Position, Label, Change Description, Notes
- ALL employees included (even excluded ones with flag)

**Common Issues:**
- No modifications to export = Haven't moved any employees yet
- Can't find file = Check downloads folder and browser download history
- Missing columns = Donut columns only appear if Donut Mode used

**Best Practices:**
- Export frequently (no auto-save!)
- Add notes before exporting
- Review Changes tab first
- Use exported file as input for future sessions

[See detailed export process below ↓](#export-process)

</details>

---

## When to Use This

### Common Scenarios

You'll want to export when:

- **Saving your work** - Export after every major set of changes to avoid losing progress (the app does NOT auto-save!)
- **After calibration meetings** - Export final ratings with notes to share with HR and leadership ([see Preparing for Talent Calibration](workflows/talent-calibration.md))
- **Creating backups** - Export milestone versions before making more changes (e.g., pre-calibration, post-calibration)
- **Sharing results** - Generate Excel files with updated ratings and notes to send to stakeholders
- **Continuing later** - Export your work so you can re-import and continue in a future session

### Related Workflows

- [Preparing for Talent Calibration](workflows/talent-calibration.md) - Export both pre-meeting baseline and post-meeting results
- [Making Your First Changes](workflows/making-changes.md) - Save your work after making rating adjustments
- [Adding Notes & Documentation](workflows/adding-notes.md) - Export includes all your documented notes in the Excel file

### Real-World Example

> 📋 **Scenario**
>
> After a 90-minute calibration meeting, Amanda has made 34 rating changes with detailed notes. She clicks "Apply" to export `talent-ratings-post-calibration-2024-Q4.xlsx` with all changes and notes included. She shares this file with HR to update the HRIS system and with managers so they can communicate changes to their teams.

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

> 📋 **Real-World Scenario**
>
> After a 90-minute calibration meeting, Sarah has made 34 rating changes with detailed notes. She clicks "Apply" to export the file as `talent-ratings-post-calibration-2024-Q4.xlsx`. She shares this file with HR to update the HRIS system and with managers so they can communicate changes to their teams. The exported file includes all changes and notes for complete transparency.

Follow these steps to export your changes:

### Step 1: Make Changes

- Drag employees to different boxes on the grid
- The "Apply" button badge shows how many changes you've made

### Step 2: Review Changes

- Click the **"Changes"** tab in the right panel
- Verify all employee movements are correct
- Add notes documenting why each change was made (recommended)

### Step 3: Apply Changes

1. Open the **File menu** (top-left of application bar)
2. Click **"Apply X Changes"** (where X is the number of pending changes)
3. The **Apply Changes Dialog** appears with two options:

![Apply Changes dialog in default state showing "Update original file" option selected, with filename "sample-data-modified.xlsx" displayed, checkboxes for "Include change notes" and "Include donut placements" both checked, and Apply Changes button ready to save modifications back to the original Excel file](images/screenshots/file-ops/apply-changes-dialog-default.png)

The default Apply Changes dialog updates your original file. This is the quickest option for iterative work sessions.

**Option 1: Update original file** (default)
- Your changes save back to the file you originally loaded
- Original file is updated with new ratings and change tracking columns
- Quick and convenient for iterative work

**Option 2: Save to different file**
- Check the **"Save to a different file instead"** checkbox
- Choose a new location and filename using the file dialog
- Original file remains untouched
- Useful for creating milestone versions or backups

![Apply Changes dialog with "Save to a different file instead" checkbox selected, showing file browser interface for choosing export location and custom filename, with Apply Changes button ready to create new Excel file at selected destination while leaving original file untouched](images/screenshots/file-ops/apply-changes-dialog-save-as.png)

When you check "Save to a different file," you can choose a new location and filename. This creates a milestone version while keeping your original intact.

### Export Options Comparison

Choose the right export option based on your workflow needs:

| Feature | Update Original File | Save to Different File |
|---------|---------------------|------------------------|
| **What Happens** | Overwrites your original Excel file with changes | Creates new file at location you choose |
| **Original File** | Gets updated with new ratings | Remains completely untouched |
| **Best For** | Iterative work sessions | Creating milestone versions or backups |
| **File Location** | Same location as original | You choose location and filename |
| **Filename** | Same as original | You choose custom filename |
| **Use When** | Continuing work on same dataset | Creating pre/post-calibration versions |
| **Risk** | Overwrites original (can't undo) | No risk - original preserved |
| **Speed** | Fastest - one click | Slightly slower - choose location |
| **Common Scenarios** | Daily calibration work | "talent-ratings-Q4-pre-calibration.xlsx" vs "talent-ratings-Q4-post-calibration.xlsx" |
| **Version Control** | Manual (save copies before major changes) | Built-in (each export is separate file) |
| **Backup Strategy** | Save copies before exporting | Automatic - originals never touched |
| **Recommended If** | You want simplicity and speed | You want safety and versioning |

**When to use each option:**

| Your Goal | Recommended Option | Why |
|-----------|-------------------|-----|
| Quick save during calibration meeting | Update Original File | Fastest - keeps workflow simple |
| Create backup before major changes | Save to Different File | Preserves pre-change version |
| Share results with stakeholders | Save to Different File | Custom filename like "talent-review-2024-Q4-final.xlsx" |
| Continue working on same dataset | Update Original File | Keeps everything in one file |
| Create quarterly snapshots | Save to Different File | Build version history (Q1, Q2, Q3, Q4 files) |
| Test different scenarios | Save to Different File | Compare multiple versions side-by-side |
| Single-session work | Update Original File | No need for multiple files |
| Multi-session collaborative work | Save to Different File | Track "before" and "after" states clearly |

!!! tip "Best Practice: Backup Before Big Changes"
    Before major calibration sessions, use "Save to Different File" to create a backup like "talent-ratings-backup-2024-12-30.xlsx". Then work with "Update Original File" during the session. This gives you both speed and safety.

4. Click **"Apply Changes"** to proceed
5. File is saved to the chosen location

### Step 4: Verify Export

- **If you updated original**: Open your original file to verify changes
- **If you saved to different file**: Navigate to the location you chose
- Check that updated ratings and change tracking columns are present

!!! success "Changes Saved"
    Your changes are now saved to the Excel file! You can continue working or close the application.

!!! info "Read-Only File Protection"
    If your original file is read-only or can't be updated, 9Boxer automatically falls back to "Save to different file" mode and prompts you to choose a new location. This ensures your work is never lost.

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

> 📋 **Real-World Scenario**
>
> Priya exports her talent review results to create a development plan. In the Excel file, she filters for all rows where "Modified in Session" = "Yes" to see only the 18 employees who changed ratings. The "9Boxer Change Notes" column shows her detailed rationale for each change, which she uses to explain decisions to department heads.

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

1. **If you chose "Update original file"**: The file is in the same location as your original file
2. **If you chose "Save to different file"**: Check the location you selected in the save dialog
3. Check the **Recent Files** list in the File menu - it shows recently used files
4. Try applying changes again and carefully note which option you select

### Export is missing columns

**Problem:** Expected columns are missing from export.

**Possible causes:**

- Donut columns only appear if you used Donut Mode
- Some columns may be hidden in Excel

**Solutions:**

1. Check if columns are hidden (Excel: Home → Format → Unhide Columns)
2. Verify you used Donut Mode if expecting donut columns
3. Re-upload your file and export again

### File is read-only or can't be updated

**Problem:** Original file can't be updated (read-only, locked, or deleted).

**What happens:**

- 9Boxer automatically detects this issue
- Fallback: Switches to "Save to different file" mode
- You'll be prompted to choose a new location
- Your work is never lost!

**Solutions:**

1. Follow the prompt to save to a new location
2. After saving, close the read-only file and work with the new file
3. Or: Remove read-only attribute from original file before applying changes

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

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| Save my changes | File menu → Apply X Changes → Choose update or save option → Apply |
| Update my original file | File menu → Apply X Changes → Keep "Update original file" selected → Apply |
| Save to a new file | File menu → Apply X Changes → Check "Save to different file" → Choose location → Apply |
| Check how many changes to export | Look at Apply button badge or File menu "Apply X Changes" text |
| Add notes before exporting | Click employees → Changes tab → Add notes → Then export |
| Review changes before exporting | Click Changes tab in right panel to see all movements |
| Find my exported file (updated original) | Same location as your original file |
| Find my exported file (new file) | Location you chose in save dialog |
| See what's in the export | All original columns + Performance/Potential updates + 4 change tracking columns |
| Check if excluded employees export | Yes - all employees (even excluded) are in the export |
| Include donut exercise data | Donut columns auto-appear if you used Donut Mode |
| Use export for next session | Upload the exported file to continue with updated ratings |

---

## Related Topics

- [Tracking Changes](tracking-changes.md) - Add notes to document your changes before exporting
- [Donut Mode](donut-mode.md) - Learn about donut exercise columns in exports
- [Tips & Best Practices](tips.md) - Session management and export workflow tips
- [Troubleshooting](troubleshooting.md) - Solutions for common export issues
