# Getting Started with 9Boxer

> **Time to complete:** 10 minutes
> **What you'll accomplish:** Upload data, make your first change, and export results
> **Already did the [2-minute quickstart](quickstart.md)?** You can skip to [Step 2](#step-2-understand-what-youre-seeing)

Welcome! This guide walks you through the complete 9Boxer workflow, from uploading your team data to exporting your final ratings. By the end, you'll have hands-on experience with everything you need for your first talent review.

---

## What You'll Learn

In the next 10 minutes, you'll discover how to:

- ✅ Upload your employee data from Excel
- ✅ Read and interpret the 9-box grid
- ✅ Make rating changes with drag-and-drop
- ✅ Document your decisions with notes
- ✅ Export your updated ratings to Excel

Let's get started!

---

## Step 1: Upload Your Employee Data (2 minutes)

### What You'll Need

An Excel file (`.xlsx` or `.xls`) with these 4 columns (exact names, case-sensitive):

| Column Name | What It Means | Valid Values |
|-------------|---------------|--------------|
| `Employee ID` | Unique identifier | Any text or number |
| `Worker` | Employee name | Any text |
| `Performance` | Current performance rating | `Low`, `Medium`, or `High` |
| `Potential` | Future growth capacity | `Low`, `Medium`, or `High` |

!!! tip "Don't have a file ready?"
    Use the sample file included with 9Boxer: `Sample_People_List.xlsx`
    It's in the Help menu or bundled with your installation.

![Excel file showing the 4 required columns: Employee ID, Worker, Performance, and Potential](images/screenshots/upload-excel-sample.png)

### Upload Your File

1. **Click the Upload button** in the top-left corner

   ![Upload button highlighted in the application toolbar](images/screenshots/upload-button-location.png)

2. **Choose your Excel file** in the file picker

3. **Wait for the success message** - you'll see a green notification when your data loads

**What happens next:** Your employees appear on the grid, automatically positioned based on their Performance and Potential ratings.

### ✅ Success Check

You should see:

- A 3×3 grid filled with employee tiles
- Your employee count in the top bar (example: "87 employees")
- Employees organized into boxes

![Grid populated with employee tiles after successful upload](images/screenshots/upload-success-grid.png)

!!! warning "Don't see your employees?"
    Check that filters aren't active (look for an orange dot on the Filters button).
    [Learn how to clear filters](filters.md#clearing-all-filters)

---

## Step 2: Understand What You're Seeing (3 minutes)

Now let's decode what this grid is showing you.

### The 3×3 Grid Layout

Your grid organizes employees by two factors:

- **Performance (left to right):** How well they're doing in their current role
- **Potential (bottom to top):** Their capacity for growth and advancement

![Annotated grid showing Performance axis (horizontal) and Potential axis (vertical)](images/screenshots/grid-axes-annotated.png)

This creates 9 distinct positions, each with a strategic meaning:

### Quick Reference: The 9 Positions

```
              LOW             MEDIUM            HIGH
           PERFORMANCE      PERFORMANCE      PERFORMANCE

HIGH       Enigma           High Potential    ⭐ Stars
POTENTIAL  (investigate)    (develop fast)    (top talent)

MEDIUM     Under-           Core              High
POTENTIAL  Performer        Performer         Performer
           (support)        (backbone)        (strong IC)

LOW        Problem/         Solid             Strong
POTENTIAL  Too New          Performer         Performer
           (action needed)  (reliable)        (excellent IC)
```

**The most important boxes:**

- **⭐ Stars (top-right):** Your highest performers with leadership potential - protect and develop them
- **Core Performer (center):** Your largest group - solid, reliable employees who keep things running
- **Bottom-left corner:** Employees who need attention - either too new to rate or facing performance issues

→ [See detailed descriptions of all 9 positions](understanding-grid.md)

### Check Your Distribution

Click the **Statistics** tab in the right panel to see how your talent is distributed.

![Statistics tab showing distribution table and chart](images/screenshots/statistics-distribution.png)

**Healthy distribution looks like:**

- 10-15% in Stars (top-right)
- 50-60% in the middle tier (Core Performers and surrounding boxes)
- Fewer than 10% in bottom-left (Problems)

**Red flags to watch for:**

- ⚠️ Too many people rated "High" (everyone is above average?)
- ⚠️ Too few Stars (succession planning risk)
- ⚠️ Everyone clustered in the center (poor differentiation)

!!! info "These are guidelines, not rules"
    Your ideal distribution depends on your industry, growth stage, and organizational needs.
    [Learn more about interpreting distributions](statistics.md)

---

## Step 3: Make Your First Rating Change (2 minutes)

Now that you understand the grid, let's make a change.

### Why You'd Move Someone

Common reasons for changing ratings:

- Recent promotion or role change
- Performance improved (or declined) since last review
- Initial rating was incorrect
- Calibration with other managers revealed misalignment

### How to Move an Employee

Moving employees is simple - just drag and drop!

1. **Click and hold** on an employee tile
2. **Drag** to the new box
3. **Release** to drop them in place

![Three-panel sequence showing drag and drop: clicking, dragging, and dropping an employee tile](images/screenshots/drag-drop-sequence.png)

The employee tile turns **yellow** to show it's been modified in this session.

![Employee tile with yellow highlight indicating it has been moved](images/screenshots/employee-modified-yellow.png)

**The change counter** in the top bar updates to show how many changes you've made.

### Review What Changed

Click on the employee you just moved to see their details:

![Employee details panel showing the timeline with old and new positions](images/screenshots/employee-timeline.png)

The **Timeline** shows:
- Their previous position
- Their new position
- When the change was made

---

## Step 4: Document Your Decision (2 minutes)

Adding notes helps you remember why you made changes - crucial for calibration meetings and performance reviews.

### Why Add Notes?

- **Justify changes** in calibration meetings
- **Create an audit trail** for HR compliance
- **Remember your reasoning** when you review this 6 months from now
- **Share context** with other reviewers

### How to Add a Note

1. **Click the employee** you moved (to open the right panel)

2. **Switch to the Changes tab**

3. **Type your explanation** in the Notes field

   ![Changes tab with note field showing example text](images/screenshots/changes-add-note.png)

4. **Click outside the field** or press `Tab` to save

   The note saves automatically - no save button needed! ✅

### Good Note Examples

Be specific and objective:

- ✅ "Promoted to Senior Engineer Q4 2024, consistently exceeds deliverables"
- ✅ "Performance declined after team restructure - skill gap in new responsibilities"
- ✅ "Calibrated with peers - rating adjusted to reflect actual output vs. potential"

- ❌ "Good performer" (too vague)
- ❌ "Just because" (not helpful)

!!! tip "Notes are included in your export"
    When you export to Excel, your notes appear in the "9Boxer Change Notes" column for easy sharing.

---

## Step 5: Save Your Work (1 minute)

When you're ready to save your changes:

### How to Export

1. **Click the Apply button** in the top-right corner

   ![Apply button with badge showing "3" changes ready to export](images/screenshots/apply-button-with-count.png)

2. **Your file downloads automatically**
   File name: `modified_[your-original-filename].xlsx`

3. **Open the file** to verify your changes

### What's in the Export?

Your exported Excel file includes:

- ✅ **Updated Performance/Potential ratings** - Changed values reflect your moves
- ✅ **"Modified in Session" column** - Shows "Yes" for changed employees
- ✅ **"9Boxer Change Notes" column** - Contains your notes
- ✅ **All original columns** - Everything from your original file is preserved

![Exported Excel file showing the new columns: Modified in Session and 9Boxer Change Notes](images/screenshots/export-excel-columns.png)

!!! danger "Critical: No Auto-Save!"
    9Boxer does NOT save automatically. Your changes are lost if you close the app without clicking Apply!

    **Always export before:**
    - Closing the application
    - Uploading a new file (replaces current session)
    - Taking a break in a long session

---

## 🎉 Congratulations! You've Completed the Basics

You now know how to:

- ✅ Upload employee data
- ✅ Read the 9-box grid
- ✅ Make rating changes
- ✅ Document your decisions
- ✅ Export your results

You're ready to use 9Boxer for real talent reviews!

---

## What to Learn Next

Choose your path based on what you need to do:

### **I'm preparing for a talent calibration meeting**
→ [Follow the complete calibration workflow](workflows/talent-calibration.md)
Learn how to prepare, run the meeting, and export final results.

### **I want to validate my center box ratings**
→ [Try the Donut Mode exercise](donut-mode.md)
A powerful technique for ensuring "Core Performer" ratings are accurate.

### **I need to focus on specific teams or departments**
→ [Learn about filters and exclusions](filters.md)
Filter by manager, department, job level, or performance tier.

### **I'm curious about distribution analytics**
→ [Explore Statistics and Intelligence](statistics.md)
View charts, detect anomalies, and identify rating bias.

### **I need the full reference guide**
→ [Browse all documentation](index.md)
Complete guide to every feature and setting.

---

## Quick Reference Card

Bookmark this for easy access to common actions:

| I want to... | How to do it | Shortcut |
|--------------|--------------|----------|
| Upload new data | Click Upload button (top-left) | - |
| Move an employee | Drag tile to new box | - |
| View employee details | Click the employee tile | - |
| Add a note | Click employee → Changes tab → Type | - |
| Filter the grid | Click Filters button → Select criteria | - |
| Save my work | Click Apply button (exports to Excel) | - |
| Expand a box | Click ⛶ icon on box header | - |
| Collapse expanded box | Click ⛶ again or press `Esc` | `Esc` |

---

## Need Help?

### Something Not Working?

- **Upload failed?** → [Troubleshooting upload errors](troubleshooting.md#upload-issues)
- **Employees not appearing?** → [Check if filters are active](troubleshooting.md#employees-dont-appear)
- **Can't drag employees?** → [Drag and drop troubleshooting](troubleshooting.md#drag-and-drop-issues)
- **Export not working?** → [Export troubleshooting](troubleshooting.md#export-issues)

### Want to Learn More?

- **In-app tooltips:** Hover over any button or UI element for helpful hints
- **Full documentation:** Browse the complete [user guide](index.md)
- **Common questions:** Check the [FAQ](faq.md)
- **Get support:** [Contact us or report an issue](support.md)

---

**Ready to dive deeper?** Continue to [Understanding the 9-Box Grid](understanding-grid.md) for a complete explanation of all positions and their strategic implications.
