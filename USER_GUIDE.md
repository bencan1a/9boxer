# 9-Box Performance Review System - User Guide

A comprehensive guide to using the 9-Box Performance Review System.

## Table of Contents
- [Getting Started](#getting-started)
- [Login](#login)
- [Uploading Employee Data](#uploading-employee-data)
- [Understanding the 9-Box Grid](#understanding-the-9-box-grid)
- [Working with Employees](#working-with-employees)
- [Filtering and Exclusions](#filtering-and-exclusions)
- [Viewing Statistics](#viewing-statistics)
- [Exporting Your Changes](#exporting-your-changes)
- [Tips and Best Practices](#tips-and-best-practices)

## Getting Started

The 9-Box Performance Review System helps visualize and manage employee talent by plotting them on a grid based on:
- **Performance** (Current performance in role)
- **Potential** (Future growth capacity)

### Accessing the Application

1. Open your web browser
2. Navigate to the application URL (e.g., http://localhost:3000)
3. You'll see the login screen

## Login

### Default Credentials
- **Username**: `bencan`
- **Password**: `password`

### Logging In
1. Enter your username in the "Username" field
2. Enter your password in the "Password" field
3. Click the "Sign In" button
4. Upon successful login, you'll be redirected to the dashboard

### After Login
- You'll see the main application bar at the top
- The 9-box grid will be empty until you upload data
- Buttons available: Upload, Filters, Apply, Logout

## Uploading Employee Data

### Excel File Requirements

Your Excel file must contain these columns:
- `employee_id` - Unique identifier for each employee
- `employee_name` - Full name of the employee
- `performance` - Performance rating (Low, Medium, High)
- `potential` - Potential rating (Low, Medium, High)

Optional columns:
- `level` - Job level (e.g., IC, Manager, VP)
- `job_profile` - Job title or role
- `manager` - Manager's name
- `chain_level_1`, `chain_level_2`, etc. - Organizational hierarchy

### Upload Process

1. **Click "Upload" button** in the top bar
2. **Select your file**:
   - Click "Select File" in the dialog
   - Browse to your Excel file (.xlsx or .xls)
   - File must be less than 10MB
3. **Upload**:
   - Click "Upload" button
   - Wait for the upload to complete
   - You'll see a success message
4. **View results**:
   - The grid will populate with employee tiles
   - Employee count appears in the top bar

### Upload Errors

Common errors and solutions:

**"Please select an Excel file (.xlsx or .xls)"**
- Ensure your file has the correct extension
- Not .csv, .txt, or other formats

**"File size must be less than 10MB"**
- Your file is too large
- Remove unnecessary data or split into multiple files

**"Missing required columns"**
- Ensure your file has all required columns
- Check spelling and capitalization

## Understanding the 9-Box Grid

### Grid Layout

The grid is organized as a 3x3 matrix:

```
           LOW          MEDIUM          HIGH
        PERFORMANCE   PERFORMANCE   PERFORMANCE

HIGH    Enigma/       High           Stars
POT.    Question      Potential      (Top Talent)
        Mark

MED.    Under-        Core           High
POT.    Performer     Performer      Performer

LOW     Too New to    Solid          Strong
POT.    Rate/Problem  Performer      Performer
```

### Box Categories

**Stars (High Performance, High Potential)**
- Top performers ready for bigger roles
- Succession planning candidates
- Retention priorities

**High Potential (Medium Performance, High Potential)**
- Future leaders
- Need development and experience
- Fast-track candidates

**High Performer (High Performance, Medium Potential)**
- Excellent in current role
- May not want advancement
- Key contributors

**Core Performer (Medium Performance, Medium Potential)**
- Solid, reliable employees
- Meet expectations
- Backbone of organization

**And so on...**

### Color Coding

- **Green boxes** (top row): High potential employees
- **Yellow boxes** (middle row): Medium potential
- **Orange boxes** (bottom row): Lower potential or new hires
- **Blue employee tiles**: Default
- **Yellow highlight**: Modified position (dragged to new box)

## Working with Employees

### Viewing Employee Details

1. **Click on any employee tile**
2. **Right panel opens** with two tabs:
   - **Details**: Employee information
   - **Statistics**: Performance distribution

#### Details Tab Shows:
- Employee name and ID
- Current performance rating
- Current potential rating
- Job level
- Job profile
- Manager
- Organizational chain levels
- **Timeline**: History of all movements

#### Timeline
- Shows when employee was moved
- Displays old and new positions
- Timestamp for each change
- Helps track career progression

### Moving Employees

#### Drag and Drop
1. **Click and hold** on an employee tile
2. **Drag** to the desired box
3. **Release** to drop
4. Tile turns **yellow** to indicate change
5. Badge on "Apply" button shows number of changes

#### What Happens When You Move
- Employee's performance and potential ratings update
- Change is recorded in the timeline
- Modified indicator (yellow highlight) appears
- Change count increases in top bar

### Selecting Employees

- Click any employee tile to select
- Selected employee details appear in right panel
- Click again or click another employee to change selection
- Click outside to deselect

## Filtering and Exclusions

### Using Filters

1. **Click "Filters" button** in top bar
2. **Filter drawer opens** on the right
3. **Available filters**:
   - Performance levels
   - Potential levels
   - Job levels
   - Job profiles
   - Managers
   - Chain levels

#### Applying Filters
1. Select checkboxes for criteria you want
2. Multiple selections are combined (OR logic within category)
3. Different categories are combined (AND logic between categories)
4. Click outside or use filters button to close
5. Grid updates automatically

#### Filter Indicator
- Orange dot appears on Filters button when active
- Employee count shows "X of Y employees"
- Filtered employees are hidden from grid

#### Clearing Filters
- Uncheck all boxes
- Or click "Clear All" (if available)

### Employee Exclusions

For temporarily hiding specific employees:

1. **Click "Filters" button**
2. **Scroll to bottom** of filter drawer
3. **Click "Manage Exclusions"**
4. **Exclusion dialog opens**

#### Exclusion Dialog Features

**All Employees Tab**
- Shows complete list of employees
- Search box to find employees
- Checkbox next to each name
- Check to exclude, uncheck to include

**Quick Filters Tab**
- Pre-defined filter combinations
- Examples:
  - "Exclude all Low performers"
  - "Exclude VPs and above"
  - "Show only High Potential"
- One-click application

#### Using Exclusions
1. Select employees to exclude
2. Or use a quick filter
3. Click "Apply"
4. Excluded employees disappear from grid
5. Employee count updates

#### Managing Exclusions
- Excluded employees are hidden, not deleted
- Can be re-included at any time
- Exclusions persist during session
- Cleared when you upload new file or logout

## Viewing Statistics

### Statistics Tab

1. **Select any employee** (or none for global stats)
2. **Click "Statistics" tab** in right panel
3. **View distribution data**

### What You'll See

#### Distribution Table
- Rows: Performance levels (High, Medium, Low)
- Columns: Potential levels (High, Medium, Low)
- Numbers in cells: Employee count in each box
- Percentages: Proportion of total

#### Distribution Chart
- Visual bar chart representation
- Each box shows as a colored bar
- Height represents number of employees
- Hover for exact numbers

### Interpreting Statistics

**Ideal Distribution** (rough guideline):
- 10-15% in top-right (Stars)
- 15-20% in High Potential boxes
- 50-60% in Core/Solid Performer boxes
- 10-20% in lower boxes

**Red Flags**:
- Too many in bottom-left (under-performers)
- Too few in top rows (succession risk)
- Skewed heavily to one side

## Exporting Your Changes

### When to Export

After you've:
- Moved employees to correct boxes
- Reviewed your changes
- Ready to save modifications

### Export Process

1. **Make changes** by dragging employees
2. **Check badge** on Apply button (shows change count)
3. **Click "Apply" button**
4. **File downloads** automatically
   - Named: `modified_[original_filename].xlsx`
   - Contains all employees with updated ratings
   - Preserves all original columns

### What's in the Export

- All employee data from original file
- Updated performance ratings
- Updated potential ratings
- Original columns preserved
- New columns (if any) preserved

### After Export

- Changes are saved to the file
- Original file remains unchanged
- Can continue making more changes
- Each export creates a new file

### Export Errors

**"No modifications to export"**
- You haven't moved any employees
- Make at least one change first

**"Export failed"**
- Check your internet connection
- Try again
- Contact support if persistent

## Tips and Best Practices

### General Usage

1. **Review before moving**: Click employee to view details first
2. **Use filters strategically**: Focus on one group at a time
3. **Check timeline**: Review employee history before changing
4. **Save frequently**: Export after major changes
5. **Document reasons**: Keep notes on why employees were moved

### Performance Reviews

1. **Start with stars**: Identify top talent first
2. **Review under-performers**: Action plans needed?
3. **Look for patterns**: Departments or managers with issues
4. **Calibrate ratings**: Are ratings consistent across teams?
5. **Plan development**: Use grid to identify training needs

### Collaboration

1. **Share screen**: Review grid with managers
2. **Discuss movements**: Explain rationale for changes
3. **Export versions**: Save before/after for comparison
4. **Keep records**: Export at key milestones

### Data Quality

1. **Verify uploads**: Check employee count after upload
2. **Update regularly**: Re-upload with latest data
3. **Clean data**: Fix issues in Excel before upload
4. **Backup originals**: Keep copy of source file

### Session Management

1. **One file at a time**: Uploading new file replaces current session
2. **Session cleared on logout**: Export changes first
3. **No auto-save**: Must manually export
4. **Refresh caution**: Changes lost if page refreshed without export

### Security

1. **Logout when done**: Click Logout button
2. **Don't share credentials**: Each user should have own account
3. **Secure downloads**: Exported files contain sensitive data
4. **Delete old exports**: Clean up downloaded files

## Keyboard Shortcuts

Currently no keyboard shortcuts implemented. Future versions may include:
- Arrow keys to navigate employees
- Enter to select employee
- Esc to close dialogs
- Ctrl+S to export

## Troubleshooting

### Can't login
- Check username and password spelling
- Ensure Caps Lock is off
- Contact administrator if forgot password

### File won't upload
- Check file format (.xlsx or .xls)
- Verify file size (< 10MB)
- Ensure required columns exist
- Try different browser

### Employees don't appear
- Check if filters are active (orange dot)
- Verify file upload succeeded
- Refresh page and re-upload

### Can't drag employees
- Ensure you clicked and held on tile
- Try different browser
- Check if page is fully loaded

### Changes not saving
- Must click "Apply" to export
- Check download folder for exported file
- Verify export completed successfully

### Right panel won't open
- Click directly on employee tile
- Ensure employee is not filtered out
- Try refreshing page

## Getting Help

### In-Application Help
- Hover over elements for tooltips
- Error messages provide guidance
- Success notifications confirm actions

### Additional Resources
- **README.md**: Technical setup and development
- **DEPLOYMENT.md**: Installation and configuration
- **API Documentation**: http://localhost:8000/docs

### Support Contacts
- Check documentation first
- Review common errors above
- Submit issue on GitHub
- Contact system administrator

## Appendix: Excel File Template

### Minimum Required Format

```
employee_id | employee_name | performance | potential
1           | John Doe      | High        | High
2           | Jane Smith    | Medium      | High
3           | Bob Johnson   | High        | Medium
```

### Complete Format

```
employee_id | employee_name | performance | potential | level | job_profile | manager | chain_level_1 | chain_level_2
1           | John Doe      | High        | High      | IC    | Engineer    | Alice   | Engineering   | Product
2           | Jane Smith    | Medium      | High      | Mgr   | Manager     | Bob     | Sales         | Revenue
```

### Valid Values

**Performance**: Low, Medium, High
**Potential**: Low, Medium, High
**Level**: Any text (IC, Manager, VP, etc.)
**Other columns**: Any text

---

**Version**: 1.0
**Last Updated**: December 2024
**Questions?** Contact your system administrator
