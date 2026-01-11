# Working with Employee Data

9Boxer works with Excel files containing employee performance and potential data. This guide covers file requirements, the upload process, and what happens when you save changes.

---

## Getting Your Data

9Boxer uses standard Excel files, typically from Workday exports or other HRIS systems. Ask your HR Business Partner for a "People List" export that includes:

- Employee ID and name
- Current performance and potential ratings
- Organizational hierarchy columns for filtering (department, manager, job level)

!!! tip "Try the Sample First"
    Download the sample dataset from **File menu → Download Sample File** to explore 9Boxer before uploading your own data.

---

## Required Columns

Your Excel file must have these four columns:

| Column Name | Description | Valid Values |
|-------------|-------------|--------------|
| `Employee ID` | Unique identifier | Any unique number |
| `Worker` | Employee's full name | Text |
| `Current Performance` | Performance rating | `Low`, `Medium`, or `High` |
| `Current Potential` | Growth capacity rating | `Low`, `Medium`, or `High` |

Column names are case-insensitive (`Employee ID`, `employee id`, and `EMPLOYEE ID` all work).

---

## Optional Columns

These columns enable filtering and provide additional context:

**Job Information:**

| Column Name | Purpose |
|-------------|---------|
| `Job Profile` | Parsed for job function and location |
| `Job Level - Primary Position` | Filter by job level |
| `Business Title` | Displayed in details panel |
| `Hire Date` | Used to calculate tenure |
| `Tenure Category` | Filter by tenure range |

??? info "Job Profile Format"
    Format: `<title>, <job function>-<location code>`

    Example: `Senior Software Engineer, Engineering-USA`

    9Boxer parses this to extract job function (`Engineering`) and location (`USA`) for filtering.

??? info "Valid Tenure Categories"
    `0 - 3 Months`, `7 - 9 Months`, `10 - 12 Months`, `13 - 18 Months`, `19 - 24 Months`, `2 - 3 Years`, `3 - 5 Years`, `5 - 10 Years`, `10 - 15 Years`

**Organization:**

| Column Name | Purpose |
|-------------|---------|
| `Direct Manager` | Filter by manager |
| `Management Chain - Level 04/05/06` | Filter by skip-level managers |

**Historical:**

| Column Name | Purpose |
|-------------|---------|
| `2023 Completed Performance Rating` | Shown in timeline |
| `2024 Completed Performance Rating` | Shown in timeline |

!!! info "Extra Columns Preserved"
    9Boxer preserves all columns when you export—even ones it doesn't display. Your original data stays intact.

---

## Uploading Your File

1. **Click File menu → Upload File**
2. **Select your Excel file** (.xlsx or .xls)
3. **Wait for processing** - Success notification appears when complete
4. **Verify the upload** - Employees appear on the grid organized by ratings

---

## File Requirements

**Supported Formats:**

- `.xlsx` - Excel 2007+ (recommended)
- `.xls` - Excel 97-2003

**Size Limit:** 10MB maximum

If your file is too large, remove unnecessary columns, historical data, or embedded images.

---

## What Happens When You Apply Changes

When you move employees and click **Apply Changes**, 9Boxer updates your Excel file with the new ratings and adds tracking columns.

### Export Options

| Option | What Happens |
|--------|--------------|
| **Update original file** | Saves changes back to your original file |
| **Save to different file** | Creates a new file, original stays untouched |

### Columns 9Boxer Adds

| Column Name | Description | Example |
|-------------|-------------|---------|
| `Modified in Session` | `Yes` if employee was moved | `Yes` |
| `Modification Date` | Timestamp of last change | `2024-12-30 14:32:15` |
| `9Boxer Change Description` | What changed | `Moved from Core Talent [M,M] to Star [H,H]` |
| `9Boxer Change Notes` | Your notes | `Promoted to team lead` |

If you used Donut Mode, additional columns track those exploratory placements separately.

---

## Common Upload Errors

### "Missing required columns"

Your file is missing `Employee ID`, `Worker`, `Current Performance`, or `Current Potential`.

**Fix:** Ensure columns are in row 1 with no extra spaces.

### "Invalid Performance or Potential values"

Ratings must be exactly `Low`, `Medium`, or `High`:

- ❌ `L`, `M`, `H` (abbreviations not supported)
- ❌ `1`, `2`, `3` (numbers not supported)
- ❌ Empty cells (all employees need ratings)

### "No sheet found containing employee data"

**Fix:** Ensure data is on Sheet 1, header row is row 1, and required columns exist.

### File is read-only or locked

9Boxer automatically switches to "Save to different file" mode. Your work is never lost.

### Upload succeeds but grid is empty

Check if filters are active (orange dot on Filters button) or if employees are excluded.

---

## Best Practices

**Before Uploading:**

- Validate column names and rating values in Excel
- Remove duplicate Employee IDs
- Keep a backup of your original file

**Version Control:**

Create meaningful file versions:
```
talent-ratings-Q4-baseline.xlsx
talent-ratings-Q4-post-calibration.xlsx
talent-ratings-Q4-final.xlsx
```

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| Get sample data | File menu → Download Sample File |
| Upload my data | File menu → Upload File → Select Excel file |
| Save my changes | File menu → Apply Changes → Choose option |
| See required columns | `Employee ID`, `Worker`, `Current Performance`, `Current Potential` |
| Track who was changed | Check `Modified in Session` column in export |

---

## Next Steps

- [Understanding the Grid](understanding-grid.md) - Learn what each position means
- [Working with Employees](working-with-employees.md) - View details and move employees
- [Tracking Changes](tracking-changes.md) - Add notes to document decisions
