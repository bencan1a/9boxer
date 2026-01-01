# Exporting Your Changes

Export your modified employee data to Excel to save your work and share updated talent ratings.

---

## How to Export

1. **Make changes** - Drag employees to new positions on the grid
2. **Open File menu** (top-left)
3. **Click "Apply X Changes"** (X = number of pending changes)
4. **Choose an option**:
    - **Update original file** - Saves back to your original Excel file
    - **Save to different file** - Creates a new file (preserves original)
5. **Click Apply Changes**

![Apply Changes dialog](images/screenshots/file-ops/apply-changes-dialog-default.png)

!!! success "Done"
    Your changes are saved to Excel. The file includes updated ratings plus change tracking columns.

---

## Export Options

| Option | What Happens | Best For |
|--------|-------------|----------|
| **Update original file** | Overwrites your original file | Quick saves, iterative work |
| **Save to different file** | Creates new file, original untouched | Backups, versioning, milestones |

!!! tip "Best Practice"
    Before major calibration sessions, use "Save to different file" to create a backup first.

---

## What's Exported

### Your Original Data

All columns from your uploaded file are preserved, with Performance and Potential updated to reflect grid positions.

### Change Tracking Columns

These columns are added for employees you moved:

| Column | Description | Example |
|--------|-------------|---------|
| `Modified in Session` | "Yes" if employee was moved | `Yes` |
| `Modification Date` | When the change was made | `2024-12-20 14:32:15` |
| `9Boxer Change Description` | What changed | `Moved from Core Talent [M,M] to Star [H,H]` |
| `9Boxer Change Notes` | Your notes | `Promoted to manager role Q4` |

### Donut Exercise Columns

If you used [Donut Mode](donut-mode.md), four additional columns appear:

| Column | Description |
|--------|-------------|
| `Donut Exercise Position` | Position number (1-9) |
| `Donut Exercise Label` | Box label (e.g., "Star [H,H]") |
| `Donut Exercise Change Description` | Donut movement description |
| `Donut Exercise Notes` | Your donut exercise notes |

!!! note "Donut vs Regular"
    Donut columns are separate from regular changes. Actual Performance/Potential ratings are NOT changed by donut placements.

### Excluded Employees

All employees are included in the export, even those you excluded from the grid view. Excluded employees are marked with an "Excluded" flag.

---

## After Exporting

- **Continue working** - Make more changes and export again
- **Use as input** - Upload the exported file to start a new session with updated ratings
- **Share** - Send the file to HR, leadership, or stakeholders

---

## Troubleshooting

### "No modifications to export"

You haven't moved any employees yet. Drag at least one employee to a new box.

### Can't find exported file

- **Update original**: Check the same location as your original file
- **Save to different**: Check the location you selected in the save dialog
- Check the **Recent Files** list in File menu

### File is read-only

9Boxer automatically switches to "Save to different file" mode. Your work is never lost.

### Missing donut columns

Donut columns only appear if you used Donut Mode.

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| Save my changes | File menu → Apply X Changes → Apply |
| Update original file | Keep "Update original file" selected → Apply |
| Save to new file | Check "Save to different file" → Choose location → Apply |
| Check change count | Look at Apply button badge |
| Add notes before export | Click employees → Changes tab → Notes field |
| Include donut data | Auto-included if you used Donut Mode |
| Find excluded employees | All included in export with "Excluded" flag |

---

## Next Steps

- [Tracking Changes](tracking-changes.md) - Add notes before exporting
- [Donut Mode](donut-mode.md) - How donut data appears in exports
- [Employee Data](employee-data.md) - Column reference
