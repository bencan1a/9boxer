# Working with Employee Data

9Boxer works with Excel files containing employee performance and potential data. This guide covers everything about your data: where to get it, what format it needs, and what happens when you save your changes.

---

## Where to Get Your Data

9Boxer uses the same Excel format you typically get from Workday exports or other HRIS systems. If your organization uses Workday, your HR Business Partner (HRBP) can provide a "People List" export that works directly with 9Boxer.

**Ask your HRBP for:**

- A Workday export with employee performance and potential ratings
- Make sure it includes Employee ID, name, and current ratings
- Request any organizational hierarchy columns you need for filtering (department, manager, job level)

!!! tip "Don't Have Data Yet?"
    Download the sample dataset from **File menu → Download Sample File** to explore 9Boxer's features. The sample includes 15 realistic employees across Engineering, Sales, Marketing, and Product teams.

---

## Sample Dataset as Your Template

The bundled sample file (`sample-employees.xlsx`) demonstrates the exact format 9Boxer expects. Use it as a template when preparing your own data.

**To get the sample file:**

1. Open **File menu** (top-left)
2. Click **Download Sample File**
3. Open the downloaded Excel file to see the structure

The sample data includes employees across all 9 grid positions, giving you a complete picture of how the grid works.

---

## Column Reference

Your Excel file needs specific columns for 9Boxer to work. The tables below show all supported columns organized by category.

### Required Columns (Input)

These four columns **must** be present for 9Boxer to load your file:

| Column Name | Description | Valid Values | How 9Boxer Uses It |
|-------------|-------------|--------------|-------------------|
| `Employee ID` | Unique identifier for each employee | Any unique string or number | Uniquely identifies employees across sessions; used for change tracking |
| `Worker` | Employee's full name | Text | Displayed on employee tiles and in the details panel |
| `Performance` | Current performance rating | `Low`, `Medium`, `High` | Determines horizontal position on the 9-box grid (left to right) |
| `Potential` | Growth capacity rating | `Low`, `Medium`, `High` | Determines vertical position on the 9-box grid (bottom to top) |

### Optional Columns (Input)

These columns enable filtering and provide additional context:

**Job Information:**

| Column Name | Description | How 9Boxer Uses It | Example |
|-------------|-------------|-------------------|---------|
| `Job Level - Primary Position` | Job level or grade designation | Available as a filter option; displayed in employee details | `IC`, `Manager`, `Director` |
| `Business Title` | Official job title | Displayed in employee details panel; used for job function analysis | `Senior Software Engineer` |
| `Job Title` | Alternative job title field | Fallback if Business Title not available; displayed in details | `Staff Engineer` |

**Organization:**

| Column Name | Description | How 9Boxer Uses It | Example |
|-------------|-------------|-------------------|---------|
| `Manager` | Direct manager's name | Available as a filter option to view specific manager's teams | `David Chen` |
| `Organization Name - Level 01` | Top-level organizational unit | Primary filter for viewing by department or division | `Engineering` |
| `Organization Name - Level 02` | Second-level organizational unit | Filter for viewing by sub-department | `Backend Engineering` |
| `Organization Name - Level 03` | Third-level organizational unit | Filter for viewing by team | `Platform Team` |

**Historical Ratings:**

| Column Name | Description | How 9Boxer Uses It | Example |
|-------------|-------------|-------------------|---------|
| `2023 Completed Performance Rating` | Performance rating from 2023 review cycle | Displayed in employee timeline to show rating trends | `High` |
| `2024 Completed Performance Rating` | Performance rating from 2024 review cycle | Displayed in employee timeline to show rating trends | `Medium` |

!!! info "Additional Columns Preserved"
    You can include any other columns in your Excel file. 9Boxer preserves all columns when you export, even if it doesn't display them in the app. This means your original data (hire date, location, compensation band, etc.) remains intact.

### Sample Data Example

Here's what a typical employee dataset looks like:

| Employee ID | Worker | Performance | Potential | Job Level | Business Title | Manager | Organization |
|-------------|--------|-------------|-----------|-----------|----------------|---------|--------------|
| 1 | Alice Smith | High | High | IC | Senior Engineer | David Chen | Engineering |
| 2 | Bob Johnson | High | High | Manager | Engineering Manager | David Chen | Engineering |
| 3 | Carol Williams | Medium | High | IC | Product Manager | Emily Rodriguez | Product |
| 7 | Grace Taylor | High | Medium | Manager | Sales Manager | Henry Kim | Sales |
| 15 | Olivia Harris | Low | Low | IC | Intern | David Chen | Engineering |

---

## What Happens When You Apply Changes

When you move employees on the grid and click **Apply Changes**, 9Boxer updates your Excel file with the new ratings and adds tracking columns. You have two options:

### Update Options

| Option | What Happens | Best For |
|--------|--------------|----------|
| **Update original file** (default) | Saves changes back to your original Excel file | Iterative work sessions |
| **Save to different file** | Creates a new file, original stays untouched | Creating milestone versions, backups |

### Columns 9Boxer Adds

When you export, 9Boxer adds these tracking columns to your data:

| Column Name | What It Contains | Example Value |
|-------------|------------------|---------------|
| `Performance` | Updated rating (if changed) | `High` (was `Medium`) |
| `Potential` | Updated rating (if changed) | `High` (was `Medium`) |
| `Modified in Session` | Flag indicating this employee was moved | `Yes` or empty |
| `Modification Date` | Timestamp of the last change | `2024-12-30 14:32:15` |
| `9Boxer Change Description` | Human-readable summary of the move | `Moved from Core Talent [M,M] to Star [H,H]` |
| `9Boxer Change Notes` | Your notes explaining the change | `Promoted Q4, strong leadership` |

**If you used Donut Mode**, four additional columns track your exploratory placements:

| Column Name | What It Contains | Example Value |
|-------------|------------------|---------------|
| `Donut Exercise Position` | Position number (1-9) from exercise | `9` |
| `Donut Exercise Label` | Box label from exercise | `Star [H,H]` |
| `Donut Exercise Change Description` | Summary of donut placement | `Donut: Moved from Core Talent [M,M] to Star [H,H]` |
| `Donut Exercise Notes` | Your donut exercise notes | `Actually exceeds expectations` |

!!! info "Donut Data is Separate"
    Donut exercise columns track your exploratory "what-if" placements. They don't change the actual Performance and Potential ratings - those only change from regular grid moves.

### Example: Before and After Export

**Your original file:**

| Employee ID | Worker | Performance | Potential | Manager |
|-------------|--------|-------------|-----------|---------|
| 101 | Sarah Kim | Medium | Medium | Alex Chen |

**After moving Sarah to Star [H,H] and adding a note:**

| Employee ID | Worker | Performance | Potential | Manager | Modified in Session | Modification Date | 9Boxer Change Description | 9Boxer Change Notes |
|-------------|--------|-------------|-----------|---------|---------------------|-------------------|---------------------------|---------------------|
| 101 | Sarah Kim | High | High | Alex Chen | Yes | 2024-12-30 14:32:15 | Moved from Core Talent [M,M] to Star [H,H] | Promoted to team lead, exceeded all Q4 targets |

---

## File Format Requirements

### Supported Formats

- `.xlsx` - Excel 2007 and later (recommended)
- `.xls` - Excel 97-2003

!!! note "CSV Files Not Supported"
    9Boxer requires Excel format. If you have a CSV, open it in Excel and save as `.xlsx` before uploading.

### File Size Limit

Maximum file size is **10MB**. If your file is larger:

- Remove unnecessary columns (keeping only what you need for filtering)
- Remove historical data or unused rows
- Remove embedded images or objects
- Split large organizations into multiple files

---

## Common Data Issues

### "Missing required columns"

Your file is missing `Employee ID`, `Worker`, `Performance`, or `Potential`. Check:

- Columns are in the header row (row 1)
- No extra spaces before or after column names

### "Invalid Performance or Potential values"

Ratings must be exactly `Low`, `Medium`, or `High`:

- ❌ `L`, `M`, `H` (abbreviations not supported)
- ❌ `low`, `medium`, `high` (capitalization matters)
- ❌ `1`, `2`, `3` (numbers not supported)
- ❌ Empty cells (all employees need ratings)

### "No sheet found containing employee data"

9Boxer looks for required columns on the first sheet. Make sure:

- Your data is on Sheet 1 (not hidden sheets)
- Header row is row 1 (not row 2 or below)
- Required columns exist with exact names

### File is read-only or locked

If your original file can't be updated:

- 9Boxer automatically switches to "Save to different file" mode
- You'll be prompted to choose a new location
- Your work is never lost

---

## Best Practices

### Preparing Your Data

- **Validate before uploading** - Check column names and rating values in Excel first
- **Remove duplicates** - Each Employee ID should be unique
- **Clean up empty rows** - Remove any blank rows in your data
- **Keep a backup** - Save a copy of your original file before uploading

### Working with Exports

- **Add notes before exporting** - Document why you made each change
- **Export at milestones** - Save versions like `talent-Q4-pre-calibration.xlsx` and `talent-Q4-post-calibration.xlsx`
- **Use exports as input** - Upload your exported file to continue working in a future session
- **Store securely** - These files contain sensitive performance data

### Version Control Strategy

Create meaningful file versions:

```
talent-ratings-2024-Q4-baseline.xlsx      (before calibration)
talent-ratings-2024-Q4-post-calibration.xlsx   (after meeting)
talent-ratings-2024-Q4-final.xlsx         (HR-approved version)
```

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| Get sample data | File menu → Download Sample File |
| Upload my data | File menu → Upload File → Select Excel file |
| Save my changes | File menu → Apply X Changes → Choose option |
| Update original file | Apply Changes → Keep "Update original file" selected |
| Create a new version | Apply Changes → Check "Save to different file" |
| See what columns are required | `Employee ID`, `Worker`, `Performance`, `Potential` |
| Keep my extra columns | They're preserved automatically |
| Track who was changed | Check "Modified in Session" column in export |
| See change history | Check "9Boxer Change Description" and notes columns |

---

## Related Topics

- [Quickstart](quickstart.md) - Get started with the sample data in 2 minutes
- [Understanding the Grid](understanding-grid.md) - Learn what each grid position means
- [Tracking Changes](tracking-changes.md) - Add notes and review your changes
- [Troubleshooting](troubleshooting.md) - Solutions for common issues
