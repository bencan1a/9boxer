# Frequently Asked Questions

Quick answers to common questions about 9Boxer. Can't find what you're looking for? Check the [Troubleshooting guide](troubleshooting.md).

---

## Getting Started

### What file format does 9Boxer accept?

9Boxer accepts Excel files (.xlsx and .xls). Your file needs at minimum four columns: Employee ID, Worker, Performance ratings, and Potential ratings. See [Uploading Data](uploading-data.md) for detailed requirements and examples.

### How many employees can I manage in 9Boxer?

You can manage thousands of employees, but files must be less than 10MB. For very large organizations, consider using filters to focus on specific departments or levels. Performance stays smooth with proper filtering. See [Filters](filters.md) for tips on managing large datasets.

### Do I need Excel installed to use 9Boxer?

No, Excel is not required. 9Boxer reads and generates Excel files directly. You only need Excel (or any spreadsheet program) to view and edit the exported files after you save your changes.

### Can I use a CSV file instead of Excel?

No, CSV files are not supported. You must use Excel format (.xlsx or .xls). If you have a CSV file, open it in Excel or Google Sheets and save it as .xlsx before uploading. See [Uploading Data](uploading-data.md) for file format details.

### What happens to my data? Is it stored in the cloud?

9Boxer is a standalone desktop application. All data stays on your computer - nothing is uploaded to the cloud or shared with external servers. Your employee data remains completely private and secure.

### Where can I get the sample file to test the app?

The sample file (`Sample_People_List.xlsx`) is bundled with the application. Check your 9Boxer installation folder in the resources directory, or access it from the Help menu inside the app. See [Uploading Data](uploading-data.md) for more about the sample file.

### Do I need to create an account or login?

No. 9Boxer runs entirely offline on your computer with no login or account required. Just install the app and start using it immediately with your own data.

---

## Using the Grid

### How do I move an employee to a different box?

Click and hold on the employee tile, drag it to the new box, and release. The tile gets an orange left border showing it's been modified. See [Working with Employees](working-with-employees.md) for the complete process.

### Can I move multiple employees at once?

No, you can only move one employee at a time. However, you can make multiple changes in a session and they'll all be tracked together. See [Tracking Changes](tracking-changes.md) for managing multiple changes efficiently.

### What if two employees have the same name?

9Boxer uses the Employee ID column to uniquely identify each person. Two employees with the same name are fine as long as they have different Employee IDs. Their tiles will show their names, and you can view details to see their IDs. See [Working with Employees](working-with-employees.md).

### Can I customize the grid box labels?

No, the grid labels are fixed: Low/Medium/High for both Performance and Potential. This consistency ensures compatibility with standard 9-box methodology and makes it easy to share data across organizations.

### What do the colored borders on employee tiles mean?

Orange left border means you've moved that employee in the current session. Purple border with ghostly appearance means the employee has been placed during a Donut Mode exercise. See [Working with Employees](working-with-employees.md) and [Donut Mode](donut-mode.md) for details.

### Why is my grid empty even though upload succeeded?

Check for an orange dot on the Filters button - active filters may be hiding your employees. Click Filters and clear all selections. Also check "Manage Exclusions" to ensure no one is excluded. See [Troubleshooting](troubleshooting.md#employees-dont-appear-after-upload) for more solutions.

### How do I expand a box to see all employees in it?

Click the expand icon (⛶) in the box header, or simply click anywhere in the box area. The box expands to show all employee tiles in that position. Click the collapse icon to shrink it back down.

---

## Exporting & Sharing

### Where does the exported file save?

The file saves to your computer's default download folder. The filename is `modified_[your-original-filename].xlsx`. On Windows, this is usually `C:\Users\YourName\Downloads`. See [Exporting](exporting.md) for details.

### Can I undo changes after exporting?

The export creates a new file - your original file is never modified. If you want to undo changes, simply re-upload your original file to start fresh. The export doesn't affect your source data at all.

### Does the app auto-save my changes?

No. 9Boxer does NOT auto-save. You must click "Apply Changes to Excel" in the File menu to export your changes. All changes are lost if you close the app without exporting. Export frequently to avoid losing work!

### How do I share my grid with others?

Export your changes to create an Excel file, then share that file via email or your organization's file sharing system. The exported file contains all ratings, changes, and notes. See [Exporting](exporting.md) for what's included in exports.

### Can I continue working on my grid later?

Yes. Export your changes to save your work. Later, upload the exported file to continue from where you left off. Each export becomes your new starting point. See [Exporting](exporting.md#after-export) for the workflow.

### What's the difference between "Apply Changes" and just closing the app?

"Apply Changes to Excel" exports your work to a file, saving all modifications. Just closing the app loses everything you did in that session. Always export before closing! See [Exporting](exporting.md) for details.

---

## Understanding the 9-Box

### What's the difference between Performance and Potential?

Performance measures current job results (are they meeting goals now?). Potential measures future growth capacity (could they succeed at the next level?). An employee can be high-performing but low-potential, or vice versa. See [Understanding the Grid](understanding-grid.md) for detailed definitions.

### How should I rate borderline cases?

If someone is truly borderline, start with Medium and use Donut Mode to validate later. During calibration, compare them to peers in adjacent boxes to determine the best fit. Document your reasoning in notes. See [Donut Mode](donut-mode.md) for validating placements.

### What does each box mean for development?

Each box suggests different development actions. Stars (top-right) need succession planning. Core Talent needs skill development. Under-performers need performance management or coaching. See [Understanding the Grid](understanding-grid.md) for strategic implications of each position.

### What percentage of employees should be in each box?

There's no single "right" distribution - it depends on your organization. Rough guideline: 10-15% Stars, 50-60% in middle boxes, 10-20% in bottom boxes. Use Statistics to compare your distribution to these benchmarks. See [Statistics](statistics.md) for interpreting distributions.

### How often should I update the 9-box grid?

Most organizations update quarterly or twice yearly, aligned with performance review cycles. Update whenever you have new performance data or after major organizational changes. See [Best Practices](best-practices.md) for workflow recommendations.

### Is it okay to have many employees in the center box?

Some clustering in Core Talent (center box) is normal, but if 60%+ are there, use Donut Mode to validate placements. Many employees may be "safely" rated Medium when they're actually higher or lower. See [Donut Mode](donut-mode.md) for the validation exercise.

---

## Troubleshooting

### Why can't I drag employees?

Make sure you're clicking directly on the employee tile (not the box background) and holding the mouse button down. Wait for the page to fully load before dragging. If issues persist, try closing and reopening the app. See [Troubleshooting](troubleshooting.md#cant-drag-employees) for more solutions.

### Upload failed - what went wrong?

Common causes: column names don't match exactly (case-sensitive!), Performance/Potential values aren't Low/Medium/High, or file exceeds 10MB. Check that you have all four required columns with exact names: `Employee ID`, `Worker`, `Performance`, `Potential`. See [Uploading Data](uploading-data.md#upload-errors-and-solutions) for detailed troubleshooting.

### The grid looks wrong or incomplete - how do I reset?

Close the app and reopen it, then re-upload your file. This resets the session completely. If the grid still looks wrong, check your Excel file for invalid Performance/Potential values (must be exactly Low, Medium, or High). See [Troubleshooting](troubleshooting.md#grid-looks-wrong-or-incomplete).

### I lost my changes! Can I recover them?

Unfortunately, no. 9Boxer doesn't auto-save or maintain session history. If you closed without exporting, your changes are lost. Best practice: export frequently during long sessions to avoid this. See [Exporting](exporting.md#best-practices-for-exporting).

### Why does Windows warn me the app is unsafe during installation?

The app isn't yet code-signed with a Microsoft certificate, triggering a standard security warning. Click "More info" then "Run anyway" to proceed. The app is safe - all code is open source and can be reviewed. See [Troubleshooting](troubleshooting.md#windows-security-warning).

### Can I export if I haven't made any changes?

No. The Apply button is disabled if you haven't moved any employees. You must make at least one change (drag someone to a different box) before you can export. To create a backup of unchanged data, move one employee, export, then move them back.

---

## Advanced Features

### What is Donut Mode used for?

Donut Mode validates that employees in the center "Core Talent" box truly belong there. It asks: "If they couldn't be Medium/Medium, where would they really go?" This helps identify mis-placements before calibration meetings. See [Donut Mode](donut-mode.md) for the complete explanation.

### How do statistics calculations work?

Statistics shows distribution across the 9 boxes (count and percentage). Intelligence uses chi-square testing to detect anomalies - comparing expected vs. actual distributions by manager, department, job level, etc. See [Statistics](statistics.md) for interpreting the analysis.

### Can I export my change history?

Yes. When you export, the Excel file includes columns showing which employees were modified, when they were moved, what changed, and any notes you added. Donut Mode placements are in separate columns. See [Exporting](exporting.md#whats-in-the-export) for the complete column reference.

### What are filters and when should I use them?

Filters let you focus on specific groups: one department, one manager, certain job levels, etc. Use filters to review one team at a time during calibration, or to analyze specific cohorts. Active filters show an orange dot on the Filters button. See [Filters](filters.md) for all filtering options.

### What's the difference between filters and exclusions?

Filters temporarily hide employees from view (reversible). Exclusions remove employees from the grid entirely but still include them in exports (marked as excluded). Use filters for focus, exclusions for removing people who shouldn't be rated. See [Filters](filters.md) for details.

### Does Donut Mode change the actual ratings?

No. Donut Mode placements are exploratory only - they don't change actual Performance/Potential ratings. The placements are tracked separately and exported to distinct columns. Use donut insights to guide actual rating changes later. See [Donut Mode](donut-mode.md#how-donut-mode-differs-from-regular-changes).

### Can I add notes without moving an employee?

No. Notes are tied to changes - you can only add notes to employees you've moved. If you want to document something about an employee without changing their rating, move them to a different box, add the note, then move them back. Both movements are tracked.

---

## Need More Help?

### Still can't find your answer?

- **Troubleshooting guide**: [Common issues and solutions](troubleshooting.md)
- **Full documentation**: [Browse all guides](index.md)
- **Quick start**: [2-minute quickstart](quickstart.md)
- **Workflows**: [Step-by-step task guides](workflows/talent-calibration.md)

### Found a bug or have a feature request?

Submit issues and suggestions through the project repository. Include details about what happened, steps to reproduce, and your environment (operating system, app version).
