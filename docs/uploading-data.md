# Uploading Employee Data

Learn how to prepare and upload your employee data to 9Boxer. This guide covers Excel file requirements, the upload process, and troubleshooting common upload errors.

---

## Excel File Requirements

Your Excel file must contain specific columns with exact names (case-sensitive) for 9Boxer to process your employee data correctly.

### Required Columns

These columns **must** be present in your Excel file:

| Column Name | Description | Valid Values |
|-------------|-------------|--------------|
| `Employee ID` | Unique identifier for each employee | Any unique string or number |
| `Worker` | Full name of the employee | Text (e.g., "John Doe") |
| `Performance` | Current performance rating | `Low`, `Medium`, or `High` |
| `Potential` | Future growth capacity rating | `Low`, `Medium`, or `High` |

!!! warning "Case-Sensitive Column Names"
    Column names must match exactly as shown above. Capitalization matters!

    - ✅ Correct: `Employee ID`, `Worker`, `Performance`, `Potential`
    - ❌ Wrong: `employee id`, `worker`, `performance`, `potential`
    - ❌ Wrong: `EmployeeID`, `Name`, `Perf`, `Pot`

### Optional Columns

These columns are optional but provide additional context and filtering capabilities:

| Column Name | Description | Example Values |
|-------------|-------------|----------------|
| `Job Level - Primary Position` | Job level or grade | `IC`, `Manager`, `Director`, `VP`, `MT2`, `MT5`, `MT6` |
| `Business Title` | Job title or function | `Software Engineer`, `Sales Manager`, `Product Designer` |
| `Job Title` | Alternative job title field | Any text |
| `Manager` | Manager's name | `Alice Smith` |
| `Organization Name - Level 01` | Top-level organizational unit | `Engineering`, `Sales`, `Marketing` |
| `Organization Name - Level 02` | Second-level organizational unit | `Backend Engineering`, `Enterprise Sales` |

!!! tip "Additional Columns Preserved"
    You can include any other columns in your Excel file. 9Boxer will preserve all columns when you export, even if they're not used by the application.

---

## File Format Requirements

### Supported File Types

- `.xlsx` - Excel 2007 and later (recommended)
- `.xls` - Excel 97-2003

!!! note "CSV Files Not Supported"
    9Boxer does not support `.csv` files. You must use Excel format (.xlsx or .xls).

### File Size Limit

- **Maximum file size**: 10MB
- If your file exceeds this limit, consider:
    - Removing unnecessary columns
    - Splitting into multiple files
    - Removing historical data or unused rows

---

## Excel File Templates

### Minimum Format (Required Columns Only)

```
Employee ID | Worker       | Performance | Potential
1           | John Doe     | High        | High
2           | Jane Smith   | Medium      | High
3           | Bob Johnson  | High        | Medium
4           | Alice Brown  | Low         | Medium
5           | Charlie Lee  | Medium      | Low
```

### Complete Format (With Optional Columns)

```
Employee ID | Worker       | Performance | Potential | Job Level - Primary Position | Business Title      | Manager      | Organization Name - Level 01
1           | John Doe     | High        | High      | IC                            | Senior Engineer     | Alice Smith  | Engineering
2           | Jane Smith   | Medium      | High      | Manager                       | Engineering Manager | Bob Jones    | Engineering
3           | Bob Johnson  | High        | Medium    | IC                            | Product Designer    | Carol White  | Design
4           | Alice Brown  | Low         | Medium    | IC                            | Sales Associate     | Dave Black   | Sales
5           | Charlie Lee  | Medium      | Low       | Manager                       | Marketing Manager   | Eve Green    | Marketing
```

!!! tip "Sample File Available"
    9Boxer includes a sample file (`Sample_People_List.xlsx`) bundled with the application. Use this as a template or for testing.

---

## Upload Process

Follow these steps to upload your employee data:

### Step 1: Prepare Your File

1. **Open your Excel file** and verify it contains the required columns
2. **Check column names** match exactly (case-sensitive)
3. **Verify data values**:
    - Performance and Potential must be `Low`, `Medium`, or `High`
    - Employee IDs must be unique
    - No completely empty rows
4. **Save your file** in `.xlsx` or `.xls` format

### Step 2: Upload to 9Boxer

1. **Click the "Upload" button** in the top application bar
2. **Select your file** using the file picker dialog
    - Navigate to your Excel file location
    - Select the file
    - Click "Open"
3. **Wait for upload to complete**
    - Progress indicator appears during upload
    - Success notification appears when complete

### Step 3: Verify Upload Success

After a successful upload, you should see:

- ✅ Success notification message
- ✅ Employee tiles appear on the 9-box grid
- ✅ Employee count displayed in the top bar (e.g., "150 employees")
- ✅ Grid boxes populated based on performance/potential ratings

!!! success "Upload Successful"
    You should see a green success notification and your employees arranged on the grid.

---

## What Happens After Upload

When you upload a file:

1. **All employees are placed on the grid** based on their Performance and Potential ratings
2. **Employee count is updated** in the top bar
3. **Previous session data is cleared** (upload replaces the current session)
4. **Grid organizes automatically** into 9 boxes (3×3 matrix)
5. **Filters are reset** to show all employees

!!! warning "Upload Replaces Current Session"
    Uploading a new file completely replaces your current session. Make sure to export any changes before uploading a new file!

---

## Sample File Information

9Boxer includes a sample file to help you get started:

- **File name**: `Sample_People_List.xlsx`
- **Location**: Bundled with the application (check the resources folder or Help menu)
- **Contents**: Example employee data demonstrating the correct format
- **Use case**: Learning, testing, or as a template for your own data

Use this file to:

- Learn how the grid works
- Test features like drag-and-drop and filtering
- Understand the required column structure
- Create your own template by replacing the sample data

---

## Upload Errors and Solutions

### "Please select an Excel file (.xlsx or .xls)"

**Problem**: The file you selected is not in Excel format.

**Solution**:
- Your file must be `.xlsx` or `.xls` format, not `.csv`, `.txt`, or other formats
- If you have a CSV file, open it in Excel and save as `.xlsx`

---

### "File size must be less than 10MB"

**Problem**: Your Excel file exceeds the 10MB size limit.

**Solution**:

1. **Remove unnecessary columns** from your Excel file
2. **Remove historical data** or unused rows
3. **Remove images or embedded objects** in the Excel file
4. **Split into multiple files** if you have a very large organization
5. **Compress data** by removing formatting, formulas, or hidden sheets

---

### "Missing required columns"

**Problem**: Your Excel file is missing one or more of the required columns.

**Solution**:

1. **Check for all four required columns**:
    - `Employee ID`
    - `Worker`
    - `Performance`
    - `Potential`
2. **Verify column names are spelled exactly** as shown (case-sensitive)
3. **Ensure columns are in the first row** (header row)
4. **Check for extra spaces** before or after column names

---

### "No sheet found containing employee data"

**Problem**: 9Boxer couldn't find a sheet with the required columns in your Excel file.

**Solution**:

1. **Ensure the data is on the first sheet** of your workbook
2. **Check column names match exactly** (case-sensitive):
    - ✅ `Employee ID` (with space, capital E and I)
    - ❌ `EmployeeID` or `employee_id` or `EMPLOYEE ID`
3. **Verify the header row** is the first row of the sheet
4. **Remove empty sheets** that might be confusing the parser

---

### "Invalid Performance or Potential values"

**Problem**: Some rows contain Performance or Potential values that are not `Low`, `Medium`, or `High`.

**Solution**:

1. **Check all Performance values** are exactly: `Low`, `Medium`, or `High`
2. **Check all Potential values** are exactly: `Low`, `Medium`, or `High`
3. **Common errors**:
    - ❌ `L`, `M`, `H` (abbreviations not supported)
    - ❌ `low`, `medium`, `high` (must be capitalized)
    - ❌ `1`, `2`, `3` (numbers not supported)
    - ❌ Empty cells (all rows must have values)

---

### Upload Succeeds But No Employees Appear

**Problem**: Upload completes successfully, but the grid is empty.

**Possible causes and solutions**:

1. **Check filters are not active**
    - Look for an orange dot on the "Filters" button
    - Click "Filters" and clear all filters
2. **Check exclusions**
    - Open "Manage Exclusions" in the Filters menu
    - Ensure no employees are excluded
3. **Verify employee count**
    - Check the top bar for employee count (e.g., "0 of 150 employees")
    - If count is zero, filters or exclusions are hiding everyone
4. **Try uploading again**
    - Restart the application
    - Re-upload your file

---

## Replacing Existing Data

To upload a new file and replace your current session:

1. **Export your current changes** (if any) by clicking "Apply"
2. **Click "Upload"** button to select a new file
3. **Confirm the upload** (current session will be cleared)
4. **New file data replaces** all previous employees

!!! warning "Current Session Cleared"
    Uploading a new file will erase all current employees and changes. Always export before uploading a new file!

---

## Best Practices

### Before Uploading

- ✅ **Validate your data** in Excel before uploading
- ✅ **Check for duplicates** in the Employee ID column
- ✅ **Verify spelling** of column names
- ✅ **Remove test data** or incomplete rows
- ✅ **Backup your original file** before making changes

### During Upload

- ✅ **Wait for confirmation** before taking other actions
- ✅ **Check the employee count** matches your expectations
- ✅ **Verify the grid** shows employees in correct positions

### After Upload

- ✅ **Review the grid distribution** to spot any data issues
- ✅ **Click a few employees** to verify details are correct
- ✅ **Test filters** to ensure organizational data loaded correctly
- ✅ **Export a backup** before making extensive changes

---

## Next Steps

Now that you've uploaded your data, you're ready to:

- [Understand the Grid](understanding-grid.md) - Learn about the 9-box grid positions and what they mean
- [Working with Employees](working-with-employees.md) - View details and move employees
- [Filters](filters.md) - Focus on specific groups using advanced filters
- [Statistics](statistics.md) - View distribution data and analytics

---

**Need more help?** Check the [Troubleshooting](troubleshooting.md) page for additional solutions.
