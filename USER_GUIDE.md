# 9Boxer - User Guide

A simple guide to using the 9Boxer desktop application for talent management.

## Table of Contents
- [What is 9-Box?](#what-is-9-box)
- [Installation](#installation)
- [Quick Tour](#quick-tour)
- [Uploading Employee Data](#uploading-employee-data)
- [Understanding the 9-Box Grid](#understanding-the-9-box-grid)
- [Working with Employees](#working-with-employees)
- [Tracking Changes and Adding Notes](#tracking-changes-and-adding-notes)
- [Filtering and Exclusions](#filtering-and-exclusions)
- [Viewing Statistics and Intelligence](#viewing-statistics-and-intelligence)
- [Exporting Your Changes](#exporting-your-changes)
- [Tips and Best Practices](#tips-and-best-practices)
- [Troubleshooting](#troubleshooting)

## What is 9-Box?

9Boxer helps you visualize and manage employee talent by plotting people on a grid based on:
- **Performance** - Current performance in their role
- **Potential** - Future growth capacity

This desktop application keeps all your data local and secure on your computer.

## Installation

### Installing the Application

1. **Download the installer** for your operating system (Windows, macOS, or Linux)
2. **Run the installer**
3. **Windows users**: You may see a security warning that says "Windows protected your PC"
   - Click "More info"
   - Click "Run anyway"
   - This warning appears because the app is not yet signed with a Microsoft certificate
4. **Follow the installation prompts** to complete setup
5. **Launch the application** from your desktop or applications folder

The application will start with an empty dashboard ready for you to upload your employee data.

## Quick Tour

Here's a 5-minute overview of what you can do with 9-Box:

### 1. Import Your Data (2 minutes)

**Click the "Upload" button** in the top bar and select your Excel file containing employee data. Your file needs these columns (case-sensitive):
- `Employee ID` - Unique ID for each person
- `Worker` - Full name
- `Performance` - Rating: Low, Medium, or High
- `Potential` - Rating: Low, Medium, or High

Optional columns like `Job Level - Primary Position`, `Business Title`, `Manager`, and `Organization Name - Level 01` for organizational hierarchy can also be included.

Once uploaded, you'll see employee tiles arranged in a 3×3 grid based on their performance and potential ratings.

### 2. Arrange the Grid (1 minute)

**Drag and drop employees** between boxes to adjust their ratings:
- Click and hold an employee tile
- Drag to a different box
- Release to drop
- Changed employees turn yellow

The "Apply" button shows how many changes you've made.

### 3. Filter Your View (1 minute)

**Click the "Filters" button** to focus on specific groups:
- Filter by job level, manager, department, or performance ratings
- Use "Manage Exclusions" to temporarily hide specific employees
- Quick filter buttons let you exclude VPs, Directors, or Managers with one click

The employee count updates to show how many are currently displayed.

### 4. View Insights (30 seconds)

**Click any employee** to open the right panel with four tabs:
- **Details** - Employee info and movement history
- **Changes** - Track all employee movements with notes on why changes were made
- **Statistics** - Distribution charts showing your talent spread
- **Intelligence** - Advanced analytics identifying patterns and anomalies

### 5. Export Changes (30 seconds)

**Click the "Apply" button** to save your changes:
- Downloads a new Excel file named `modified_[original_filename].xlsx`
- Contains all employees with updated performance/potential ratings
- Original file remains unchanged

**Important**: Your changes are NOT auto-saved. Always export before closing the application.

---

## Uploading Employee Data

### Excel File Requirements

Your Excel file must contain these columns (column names are case-sensitive):

**Required:**
- `Employee ID` - Unique identifier for each employee
- `Worker` - Full name of the employee
- `Performance` - Performance rating: Low, Medium, or High
- `Potential` - Potential rating: Low, Medium, or High

**Optional:**
- `Job Level - Primary Position` - Job level (e.g., IC, Manager, VP, MT2, MT5, MT6)
- `Business Title` - Job title or function
- `Job Title` - Alternative job title field
- `Manager` - Manager's name
- `Organization Name - Level 01`, `Organization Name - Level 02`, etc. - Organizational hierarchy
- Any other columns you want to preserve

### Upload Process

1. **Click "Upload" button** in the top application bar
2. **Select your file** using the file picker dialog
   - Only .xlsx or .xls formats supported
   - File must be less than 10MB
3. **Wait for upload** to complete
   - You'll see a success notification
   - The grid populates with employee tiles
   - Employee count appears in the top bar

### Upload Errors

**"Please select an Excel file (.xlsx or .xls)"**
- Your file must be an Excel format, not .csv or .txt

**"File size must be less than 10MB"**
- Remove unnecessary data or split into multiple files

**"Missing required columns"** or **"No sheet found containing employee data"**
- Ensure your file has these exact column names: `Employee ID`, `Worker`, `Performance`, `Potential`
- Column names are case-sensitive and must match exactly
- Check spelling and capitalization carefully

### Excel File Template

**Minimum format:**
```
Employee ID | Worker       | Performance | Potential
1           | John Doe     | High        | High
2           | Jane Smith   | Medium      | High
3           | Bob Johnson  | High        | Medium
```

**Complete format with optional columns:**
```
Employee ID | Worker       | Performance | Potential | Job Level - Primary Position | Business Title | Manager | Organization Name - Level 01
1           | John Doe     | High        | High      | IC                            | Engineer       | Alice   | Engineering
2           | Jane Smith   | Medium      | High      | Manager                       | Manager        | Bob     | Sales
```

---

## Understanding the 9-Box Grid

### Grid Layout

The grid is organized as a 3×3 matrix:

```
              LOW            MEDIUM          HIGH
          PERFORMANCE     PERFORMANCE    PERFORMANCE

HIGH      Enigma/         High            Stars
POT.      Question Mark   Potential       (Top Talent)

MED.      Under-          Core            High
POT.      Performer       Performer       Performer

LOW       Too New/        Solid           Strong
POT.      Problem         Performer       Performer
```

### Box Categories

**Stars (High Performance, High Potential)**
- Top performers ready for bigger roles
- Succession planning candidates
- Highest retention priority

**High Potential (Medium Performance, High Potential)**
- Future leaders in development
- Need more experience
- Fast-track candidates

**High Performer (High Performance, Medium Potential)**
- Excellent in current role
- May not want advancement
- Critical contributors

**Core Performer (Medium Performance, Medium Potential)**
- Solid, reliable employees
- Meet expectations consistently
- Backbone of the organization

**Solid Performer (Low Performance, Medium Potential)**
- Reliable workers
- Steady contributors
- Lower growth trajectory

**Strong Performer (High Performance, Low Potential)**
- Excel in current role
- Limited advancement desire or capacity
- Valuable individual contributors

**Under-Performer (Low Performance, Low Potential)**
- Performance improvement needed
- May require action plans
- Potential fit issues

**Enigma/Question Mark (High Potential, Low Performance)**
- High potential but not yet performing
- May be too new to rate accurately
- Require close monitoring and support

### Color Coding

- **Green boxes** (top row) - High potential employees
- **Yellow boxes** (middle row) - Medium potential
- **Orange boxes** (bottom row) - Lower potential or new hires
- **Blue employee tiles** - Default appearance
- **Yellow highlight** - Employee has been moved (modified)

### Expanding/Collapsing Boxes

- **Click on a box header** to expand it and see more employee details
- **Click again** or **press ESC** to collapse
- Expansion state is remembered during your session
- Useful when a box contains many employees

---

## Working with Employees

### Viewing Employee Details

**Click on any employee tile** to open the right panel with four tabs:

**Details Tab:**
- Employee name and ID
- Current performance and potential ratings
- Job level, profile, and manager
- Organizational chain hierarchy
- **Timeline** - Complete history of all position changes with timestamps

**Changes Tab:**
- Track all employee movements across the 9-box grid
- Add notes explaining why each change was made
- Notes are included when you export to Excel (see [Tracking Changes](#tracking-changes-and-adding-notes))

**Statistics Tab:**
- Distribution data for all employees (see [Viewing Statistics](#viewing-statistics-and-intelligence))

**Intelligence Tab:**
- Advanced analytics and anomaly detection (see [Intelligence Analysis](#intelligence-tab))

### Moving Employees

#### How to Drag and Drop

1. **Click and hold** on an employee tile
2. **Drag** to the desired box on the grid
3. **Release** to drop the employee
4. The tile turns **yellow** to indicate it's been modified
5. A badge on the "Apply" button shows your total change count

#### What Happens When You Move

- Employee's performance and potential ratings automatically update
- The change is recorded in the timeline (visible in Details tab)
- A yellow highlight appears on the modified employee
- The change counter in the top bar increments

**Remember**: Changes are NOT saved until you click "Apply" and export!

### Selecting and Deselecting

- Click any employee tile to select and view details
- Selected employee details appear in the right panel
- Click another employee to change selection
- Click outside the grid to deselect

---

## Tracking Changes and Adding Notes

The **Changes** tab provides a comprehensive tracking system for all employee movements with the ability to add notes explaining your decisions.

### Accessing the Change Tracker

1. **Click the "Changes" tab** in the right panel (second tab after Details)
2. The change tracker displays a table of all employee movements
3. Each row shows one employee who has been moved from their original position

### Understanding the Change Tracker Table

The table has three columns:

**Employee:**
- Shows the employee's full name
- Helps you quickly identify who has been moved

**Movement:**
- Visual display showing: "From Position → To Position"
- Uses color-coded chips to show the transition
- Position labels (e.g., "Core Performer [M,M]" → "Star [H,H]")
- Arrow icon between positions for clarity

**Notes:**
- Editable text field for each employee
- Document the rationale for the change
- Preserved across sessions and included in Excel export

### How the Change Tracker Works

**Automatic Tracking:**
- When you drag an employee to a new box, an entry is automatically added to the change tracker
- Each employee appears only once in the tracker showing their net change from original position
- If you move an employee multiple times, the tracker updates to show the overall change (from original to current)

**Automatic Removal:**
- If you move an employee back to their original position, the entry is automatically removed from the tracker
- This keeps the tracker clean, showing only employees who are actually in modified positions

**Persistence:**
- Changes are saved automatically when you add notes
- The change tracker persists when you close and reopen the app (as long as you don't clear the session)
- All changes and notes are preserved until you upload a new file

### Adding Notes to Track Your Rationale

Notes help you document why each change was made, which is valuable for:
- Calibration meetings and performance discussions
- Justifying rating changes to management
- Future reference when reviewing decisions
- Compliance and audit trails

**To add a note:**
1. **Click in the Notes field** for the employee
2. **Type your explanation** (e.g., "Promoted to manager role in Q4, strong leadership")
3. **Click outside the field or press Tab** to save
   - Notes save automatically in the background
   - You can immediately move to the next field without waiting
4. The note is now saved and will be included in your Excel export

**Note Tips:**
- Be specific about the reason (promotion, performance improvement, role change, etc.)
- Keep notes concise but informative
- Use consistent terminology across your team
- Notes support multiple lines for longer explanations

### Empty State

If you haven't moved any employees yet, you'll see:
- An icon and message: "No changes yet"
- Instruction: "Move employees to track changes here"

This reminds you that the change tracker is ready but waiting for you to make employee movements.

### Use Cases

**Talent Calibration Sessions:**
1. Move employees during the meeting
2. Add notes capturing the discussion and consensus
3. Review the Changes tab to confirm all decisions
4. Export with notes for the record

**Performance Review Cycles:**
1. Adjust ratings throughout the review period
2. Document the reason for each rating change
3. Reference notes when discussing changes with managers
4. Include notes in the exported file for HR records

**Succession Planning:**
1. Identify and move high-potential employees
2. Note development plans or promotion timelines
3. Track progress across multiple sessions
4. Export notes for succession planning documentation

**Audit and Compliance:**
1. Every movement is tracked with who, what, and when
2. Add notes explaining the business justification
3. Export provides complete audit trail
4. Maintain transparency in talent decisions

### Tips for Effective Change Tracking

1. **Add notes immediately** - Capture your reasoning while it's fresh
2. **Be specific** - "Completed leadership training, ready for next level" is better than "Good performance"
3. **Use consistent language** - Adopt standard phrases for common scenarios
4. **Review before export** - Check the Changes tab to ensure all notes are complete
5. **Keep it professional** - Notes may be reviewed by others; maintain professionalism

---

## Filtering and Exclusions

### Using Filters

Filters let you focus on specific groups of employees.

**To open filters:**
1. Click the **"Filters"** button in the top application bar
2. The filter drawer opens on the right side

**Available filters:**
- Performance levels (Low, Medium, High)
- Potential levels (Low, Medium, High)
- Job levels (IC, Manager, VP, etc.)
- Job profiles/functions
- Managers
- Organizational chain levels

**How filtering works:**
1. Check the boxes for criteria you want to see
2. Multiple selections within a category use OR logic (show employees matching ANY)
3. Different categories use AND logic (show employees matching ALL categories)
4. Grid updates automatically as you select
5. Click outside or press the Filters button again to close

**Filter indicators:**
- Orange dot appears on the Filters button when any filters are active
- Employee count shows "X of Y employees" (X displayed, Y total)
- Filtered-out employees are hidden from the grid

**To clear filters:**
- Uncheck all boxes
- Or click "Clear All" if available

### Employee Exclusions

Exclusions let you temporarily hide specific employees without deleting them.

**To manage exclusions:**
1. Click **"Filters"** button
2. Scroll to the bottom of the filter drawer
3. Click **"Manage Exclusions"**
4. The exclusion dialog opens

**Exclusion dialog has two approaches:**

**Individual Selection:**
- Complete list of all employees
- Search box to quickly find people
- Checkbox next to each name
- Check to exclude, uncheck to include

**Quick Filter Buttons:**
- **Exclude VPs** - Hides all VP level employees (MT6)
- **Exclude Directors+** - Hides Directors and VPs (MT5, MT6)
- **Exclude Managers** - Hides all manager levels (MT2, MT4)
- One-click application for common scenarios

**After making selections:**
1. Click **"Apply"**
2. Excluded employees disappear from grid
3. Employee count updates to show "X of Y employees"

**Managing exclusions:**
- Excluded employees are hidden, not deleted
- Can be re-included at any time using the same dialog
- Exclusions persist during your session
- Cleared when you upload a new file or restart the application

---

## Viewing Statistics and Intelligence

The right panel provides comprehensive data when you click any employee (or none for global view).

### Details Tab

Shows comprehensive employee information:
- Employee name and ID
- Current performance and potential ratings
- Job level, profile, and manager
- Organizational chain hierarchy (Organization Name - Level 01, Level 02, etc.)
- **Timeline** - Complete history of all position changes with timestamps

The timeline helps you:
- Track when each employee was moved
- See their old and new positions
- Understand career progression over time

### Statistics Tab

Displays distribution data for your entire workforce.

**Distribution Table:**
- Rows represent Performance levels (High, Medium, Low)
- Columns represent Potential levels (High, Medium, Low)
- Each cell shows employee count in that box
- Percentages show proportion of total workforce

**Distribution Chart:**
- Visual bar chart representation
- Each bar represents one box in the 9-box grid
- Height indicates number of employees
- Easy to spot imbalances at a glance

**Interpreting Your Distribution:**

*Ideal distribution (rough guideline):*
- 10-15% in Stars (top-right)
- 15-20% in High Potential boxes (top row)
- 50-60% in Core/Solid Performer boxes (middle)
- 10-20% in lower boxes

*Red flags to watch for:*
- Too many in bottom-left (under-performers) - performance issues
- Too few in top rows - succession planning risk
- Heavily skewed to one side - calibration needed
- Very uneven distribution - potential rating inconsistency

### Intelligence Tab

Advanced statistical analysis that identifies patterns and anomalies in your data.

**Distribution Analysis:**
- Chi-square statistical test results
- Identifies statistically significant patterns
- Overall quality score for your data distribution
- Helps validate that ratings are properly calibrated

**Anomaly Detection:**

The Intelligence tab highlights unusual distributions across different dimensions:
- **By Job Level** - Are managers rated differently than ICs?
- **By Job Profile** - Do certain functions have skewed ratings?
- **By Manager** - Do some managers rate too high or too low?
- **By Location** - Are certain offices rated inconsistently?

For each dimension, you'll see:
- Expected employee count based on overall distribution
- Actual employee count
- Deviation highlighting (outliers marked)
- Potential biases or calibration issues

**How to Use Intelligence:**

1. Click **"Intelligence"** tab in the right panel
2. Review the overall quality score at the top
3. Scan for anomalies highlighted in red or yellow
4. Investigate any significant outliers:
   - Does one manager rate everyone as "High"?
   - Does one department have no stars?
   - Are new hires properly rated as "Too New"?
5. Use insights to validate or adjust your placements
6. Re-calibrate ratings across teams if needed

This helps ensure:
- Fair and consistent ratings across the organization
- Identification of potential bias
- Data quality and accuracy
- Informed succession planning decisions

---

## Exporting Your Changes

### When to Export

Export your changes when you:
- Have moved employees to their correct boxes
- Want to save your current session
- Are ready to share updated ratings
- Need a backup before making more changes

**Critical**: The application does NOT auto-save. You must export to save your work.

### Export Process

1. **Make changes** by dragging employees to different boxes
2. **Check the badge** on the "Apply" button - it shows how many changes you've made
3. **Click the "Apply" button**
4. **File downloads automatically** to your default download folder
   - File name format: `modified_[original_filename].xlsx`
   - Contains all employees with updated ratings
   - All original columns are preserved

### What's in the Export

The exported Excel file contains:
- All employee data from your original file
- Updated performance ratings (based on grid position)
- Updated potential ratings (based on grid position)
- **"9Boxer Change Notes" column** - Contains all notes you added in the Changes tab
- "Modified in Session" column - Shows "Yes" for employees who were moved
- "Modification Date" column - Timestamp of when each employee was last moved
- All original columns preserved (level, manager, chain, etc.)
- Any additional columns from your original file

Your original file remains completely unchanged.

**About the Notes Column:**
- A new column called "9Boxer Change Notes" is automatically added to the export
- Contains the notes you added for each employee in the Changes tab
- Only employees with notes will have values in this column
- Perfect for documenting rationale and maintaining audit trails

### After Export

- Changes are now saved to the new file
- You can continue making more changes in the application
- Each time you click "Apply", a new file is created
- Use the exported file as input for your next session

### Export Errors

**"No modifications to export"**
- You haven't moved any employees yet
- Drag at least one employee to a new box before exporting

**"Export failed"**
- Check that your download folder isn't full
- Ensure you have write permissions to the download location
- Try closing and reopening the application

---

## Tips and Best Practices

### General Usage

1. **Review before moving** - Click an employee to view their details and history before adjusting their rating
2. **Use filters strategically** - Focus on one department, level, or manager at a time
3. **Check the timeline** - Review an employee's movement history before making changes
4. **Export frequently** - Save your work after major changes (remember: no auto-save!)
5. **Document your decisions** - Add notes in the Changes tab explaining why each employee was moved
6. **Review the Changes tab** - Before exporting, check the Changes tab to ensure all movements have notes

### Conducting Performance Reviews

1. **Start with stars** - Identify and confirm your top talent first
2. **Review under-performers** - Determine who needs improvement plans
3. **Look for patterns** - Are certain departments or managers consistently higher/lower?
4. **Calibrate ratings** - Ensure ratings are consistent across teams
5. **Document decisions** - Add notes in the Changes tab during the review to capture rationale
6. **Plan development** - Use the grid to identify training and succession needs
7. **Check Intelligence** - Review anomalies before finalizing placements
8. **Review change tracker** - Use the Changes tab to ensure all rating changes are documented

### Collaboration

1. **Share screen** - Review the grid with managers during calibration sessions
2. **Discuss movements** - Explain your rationale for any changes
3. **Export versions** - Save before/after files for comparison
4. **Keep milestone records** - Export at key points (quarterly, annually)
5. **Use consistent criteria** - Ensure all reviewers use the same performance/potential definitions

### Data Quality

1. **Verify uploads** - Check the employee count after upload to ensure all data loaded
2. **Update regularly** - Re-upload with the latest employee data before each session
3. **Clean data first** - Fix any data issues in Excel before uploading
4. **Backup originals** - Keep a copy of your source file
5. **Validate exports** - Open exported files to verify changes were saved correctly

### Session Management

1. **One file at a time** - Uploading a new file replaces the current session completely
2. **Export before closing** - All changes are lost if you close without exporting
3. **No auto-save** - You must manually click "Apply" to save changes
4. **Restart fresh** - If something seems wrong, restart the app and re-upload

### Data Security

1. **Local processing** - All employee data stays on your computer; nothing is sent to external servers
2. **Secure storage** - Store exported files in a secure location
3. **Clean up exports** - Delete old exported files when no longer needed
4. **Careful sharing** - These files contain sensitive employee performance data
5. **Access control** - Limit who can access the application and exported files

---

## Troubleshooting

### Application won't start

- **Check installation** - Ensure the app installed completely without errors
- **Restart your computer** - Sometimes a restart is needed after installation
- **Check antivirus** - Security software may be blocking the application
- **Reinstall** - Uninstall and reinstall the application

### File won't upload

**Check file format**
- File must be .xlsx or .xls (not .csv, .txt, or other formats)

**Check file size**
- File must be less than 10MB
- If too large, remove unnecessary columns or rows

**Check required columns**
- Must have these exact names: `Employee ID`, `Worker`, `Performance`, `Potential`
- Column names are case-sensitive - capitalization must match exactly

**Try a minimal file**
- Create a test file with just 3 employees to verify upload works
- If successful, the issue is with your original file data

### Employees don't appear after upload

- **Check filters** - Look for an orange dot on the Filters button indicating active filters
- **Check exclusions** - Open "Manage Exclusions" to see if employees are hidden
- **Verify upload** - Did you see a success notification?
- **Check employee count** - Does the top bar show employees (e.g., "150 employees")?
- **Restart** - Close and reopen the application, then re-upload

### Can't drag employees

- **Click and hold** - Make sure you're clicking and holding (not just clicking)
- **Wait for load** - Ensure the page is fully loaded before trying to drag
- **Check the tile** - Make sure you're clicking on the employee tile itself
- **Restart the app** - Close and reopen if dragging still doesn't work

### Changes not saving

- **Click "Apply"** - Changes are NOT saved until you click the Apply button
- **Check download folder** - The exported file downloads to your default location
- **Look for the file** - Search for files starting with `modified_`
- **Check permissions** - Ensure you have write access to your download folder

### Right panel won't open

- **Click the tile** - Click directly on an employee tile (not the box background)
- **Check filters** - Employee might be filtered out
- **Check selection** - Try clicking a different employee
- **Restart** - Close and reopen the application

### Performance is slow

- **Large file** - Files with thousands of employees may load slowly
- **Many changes** - Hundreds of drag-and-drop operations can slow the app
- **Export and restart** - Export your changes, then restart with the new file
- **Filter the view** - Use filters to show fewer employees at once

### Grid looks wrong or incomplete

- **Refresh** - Close and reopen the application
- **Re-upload** - Upload your file again
- **Check data** - Verify your Excel file has correct performance/potential values
- **Expand boxes** - Some boxes may be collapsed; click to expand them

---

## Getting Help

### In-Application Help

- **Tooltips** - Hover over buttons and elements for helpful tooltips
- **Error messages** - Read error messages carefully; they usually explain the issue
- **Success notifications** - Green notifications confirm your actions

### Additional Resources

- **README.md** - Technical setup and development information in the project repository
- Review this guide for detailed explanations

### Support

1. Review the [Troubleshooting](#troubleshooting) section above
2. Check that you're following the correct workflow (see [Quick Tour](#quick-tour))
3. Verify your Excel file meets the requirements (see [Excel File Requirements](#excel-file-requirements))
4. Submit issues or questions to the project repository

---

## Summary

9Boxer is a desktop application that helps you:
- ✓ Visualize employee talent on a 3×3 grid
- ✓ Easily move employees between boxes via drag-and-drop
- ✓ Track all changes with the built-in change tracker
- ✓ Add notes documenting why each change was made
- ✓ Filter and focus on specific groups
- ✓ View statistics and advanced intelligence
- ✓ Export updated ratings and notes back to Excel

All your data stays local and secure on your computer. Remember to export your changes before closing!

---

**Version**: 2.1
**Last Updated**: December 2024
**Questions?** Review this guide or contact your system administrator
