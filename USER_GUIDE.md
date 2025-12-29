# 9Boxer - User Guide

A simple guide to using the 9Boxer desktop application for talent management.

## Table of Contents
- [What is 9-Box?](#what-is-9-box)
- [Installation](#installation)
- [Quick Tour](#quick-tour)
- [Uploading Employee Data](#uploading-employee-data)
- [Understanding the 9-Box Grid](#understanding-the-9-box-grid)
- [View Controls](#view-controls)
- [Settings and Preferences](#settings-and-preferences)
- [Working with Employees](#working-with-employees)
- [Donut Mode Exercise](#donut-mode-exercise)
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

**Click the "Import Data" button** in the File menu (top-left) and select your Excel file containing employee data. Your file needs these columns (case-sensitive):
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

The File menu shows "Apply X Changes" where X is the number of changes you've made.

### 3. Filter Your View (1 minute)

**Click the "Filters" button** to focus on specific groups:
- Filter by job level, manager, department, or performance ratings
- Use "Manage Exclusions" to temporarily hide specific employees
- Quick filter buttons let you exclude VPs, Directors, or Managers with one click

The employee count updates to show how many are currently displayed.

### 4. View Insights (30 seconds)

**Click any employee** to open the right panel with four tabs:
- **Details** - Employee info, current assessment with color-coded performance/potential chips, flags, reporting chain, and movement history
- **Changes** - Track all employee movements with notes on why changes were made
- **Statistics** - Distribution charts showing your talent spread
- **Intelligence** - Advanced analytics identifying patterns and anomalies

### 5. Apply Changes (30 seconds)

**Click File menu → Apply X Changes** to save your work:
- Choose to update your original file OR save to a different file
- Contains all employees with updated performance/potential ratings
- Recent files list shows files you've worked with for quick access

**Important**: Your changes are NOT auto-saved. Always apply changes before closing. 9Boxer warns you if you try to close with unsaved changes!

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

1. **Click "Import Data"** in the File menu (top-left of the application bar)
2. **Select your file** using the file picker dialog
   - Only .xlsx or .xls formats supported
   - File must be less than 10MB
3. **Wait for upload** to complete
   - You'll see a success notification
   - The grid populates with employee tiles
   - Employee count appears in the top bar

### Recent Files

The File menu maintains a list of your recently used files for quick access.

**How it works:**
- The last 5 files you've worked with appear in the File menu
- Each file shows its name and when you last used it
- Click any recent file to quickly reload it
- Recent files persist across sessions (saved locally)

**To open a recent file:**
1. Click **File menu** (top-left)
2. Look for the **Recent Files** section
3. Click the file you want to reload
4. The file loads automatically

**To clear recent files:**
1. Click **File menu**
2. Click **"Clear Recent Files"** at the bottom of the recent files list
3. All recent files are removed from the list

!!! info "Recent Files and Unsaved Changes"
    If you have unsaved changes when you click a recent file, 9Boxer will warn you before loading the new file. You can choose to apply your changes, discard them, or cancel the operation.

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

- **Click the expand button** (⛶ icon) on any box to expand it
- **Click the collapse button** (⛶ icon) or **press ESC** to collapse
- Expansion state is remembered during your session
- Useful when a box contains many employees

**Multi-Column Layout:**
When you expand a box containing multiple employees:
- Employee cards automatically arrange in multiple columns (instead of a single column)
- Cards are displayed in a responsive grid that maximizes screen space
- Up to 3-4 columns may appear depending on your screen size
- All drag-and-drop functionality continues to work normally
- This makes it easier to see and manage boxes with many employees without excessive scrolling

---

## View Controls

The **View Controls** toolbar is a floating panel located in the top-right corner of the grid. It provides quick access to view options and zoom controls, helping you customize how you see your talent grid.

### Accessing View Controls

You'll find the View Controls toolbar floating in the top-right corner of the grid area. It contains:
- View mode toggle (Grid/Donut)
- Zoom controls
- Fullscreen mode button

**Note:** On small screens (tablets, mobile), the View Controls may be hidden to maximize screen space. Use a desktop or laptop for the best experience.

### View Mode Toggle

Switch between Grid view (normal 3×3 grid) and Donut view (validation exercise mode).

**To toggle view modes:**
- Click the Grid/Donut toggle button in the View Controls toolbar
- Or press **D** on your keyboard for quick switching

**Grid view:**
- Shows all employees across the full 3×3 grid
- Default view for working with your talent data
- All positions visible at once

**Donut view:**
- Shows only employees in the center box (Core Talent)
- Used for validation exercises
- See [Donut Mode Exercise](#donut-mode-exercise) for details

**Keyboard shortcut:** Press **D** to toggle between Grid and Donut views.

### Zoom Controls

Adjust the grid size to fit your screen and preferences.

**Zoom in:** Click the **+** button to make employee tiles larger
**Zoom out:** Click the **-** button to make employee tiles smaller
**Reset zoom:** Click the reset button to return to default size

**Keyboard shortcuts:**
- **Ctrl + Plus (+)** or **Ctrl + Equals (=)** - Zoom in
- **Ctrl + Minus (-)** - Zoom out
- **Ctrl + 0** - Reset to default zoom
- **Ctrl + Scroll** - Zoom with mouse wheel

Zoom settings persist during your session, so you won't need to readjust each time you filter or change views.

### Fullscreen Mode

Maximize your workspace by entering fullscreen mode.

**To enter fullscreen:**
- Press **F11** on your keyboard
- The 9Boxer window enters fullscreen mode, maximizing your workspace

**To exit fullscreen:**
- Press **F11** again
- Or press **Esc**

Fullscreen mode is especially useful during calibration meetings when sharing your screen, as it removes distractions and maximizes the grid view.

### When to Use View Controls

**Use zoom controls when:**
- You have many employees in one box and need to see more at once (zoom out)
- You want to focus on specific employees and see more detail (zoom in)
- Presenting on a large screen or projector (adjust for visibility)
- Working on a high-resolution display (adjust for comfortable viewing)

**Use fullscreen mode when:**
- Conducting calibration meetings
- Presenting to stakeholders
- Maximizing screen real estate for large datasets
- Reducing visual distractions during focused work

---

## Settings and Preferences

Access application settings to customize your 9Boxer experience. Your preferences are saved automatically and persist across sessions.

### Opening Settings

Click the **⚙ Settings** button in the top-right corner of the application bar to open the Settings dialog.

### Theme Settings

Choose your preferred visual theme:

**Light theme:**
- Bright, high-contrast interface
- Best for well-lit environments
- Traditional look and feel

**Dark theme:**
- Dark, easy-on-the-eyes interface
- Reduces eye strain in low-light environments
- Modern aesthetic

**Auto (System):**
- Automatically matches your operating system's theme
- Switches between light and dark based on system preferences
- Recommended for most users

Your theme choice is saved automatically and applies immediately when changed.

### Language Settings

Switch between supported languages using the dropdown menu in Settings:

**Available languages:**
- **English** - Default language
- **Español** - Spanish translation

Select your preferred language from the dropdown. The interface updates immediately, and your choice is saved for future sessions.

### Settings Persistence

All your settings persist across sessions:
- Theme preference (Light, Dark, or Auto)
- Language preference
- These settings are stored locally on your computer
- No need to reconfigure when you reopen the application

**Note:** Settings are separate from your data. Uploading a new file doesn't reset your preferences.

---

## Working with Employees

### Viewing Employee Details

**Click on any employee tile** to open the right panel with four tabs:

**Details Tab:**
- Employee name and ID
- **Enhanced Current Assessment** - Box name, grid coordinates, and color-coded performance/potential chips
- **Flags** - Visual tags for categorizing employees
- Job level, profile, and manager
- **Reporting Chain** - Clickable management hierarchy for filtering
- **Timeline** - Complete history of all position changes with timestamps

**Changes Tab:**
- Track all employee movements across the 9-box grid
- Add notes explaining why each change was made
- Notes are included when you export to Excel (see [Tracking Changes](#tracking-changes-and-adding-notes))

**Statistics Tab:**
- Distribution data for all employees (see [Viewing Statistics](#viewing-statistics-and-intelligence))

**Intelligence Tab:**
- Advanced analytics and anomaly detection (see [Intelligence Analysis](#intelligence-tab))

### Enhanced Current Assessment

When you click an employee and view the Details tab, the **Current Assessment** section provides a rich summary of their status:

**Box Name with Grid Coordinates:**
- Displays the position name (e.g., "Star", "Core Talent", "Enigma")
- Shows grid coordinates in brackets (e.g., "[H,H]", "[M,M]", "[L,H]")
- Example: "Star [H,H]" tells you they're in the top-right position

**Color-Coded Performance Chip:**
- Visual chip showing the employee's current performance level
- Color-coded to match the grid position:
  - Green for High performance
  - Yellow for Medium performance
  - Orange for Low performance
- Makes it easy to see performance at a glance

**Color-Coded Potential Chip:**
- Visual chip showing the employee's current potential level
- Color-coded to match the grid position:
  - Green for High potential
  - Yellow for Medium potential
  - Orange for Low potential
- Complements the performance chip for complete picture

**Recent Changes Summary:**
- Embedded summary of recent movements
- Shows if the employee was modified in the current session
- Links to full change history in the Changes tab

This enhanced view gives you immediate context about an employee's current status without needing to switch tabs or reference the grid.

### Flags System

Flags let you tag employees with predefined categories for organization, tracking, and filtering. Think of flags as visual labels that help you manage discussions, track risks, and plan actions.

**What are flags?**

Flags are categorical tags you can apply to employees. 9Boxer provides 8 predefined flag categories:

1. **Promotion Ready** - Employees ready for advancement
2. **Flagged for Discussion** - Need to discuss in upcoming meetings
3. **Flight Risk** - At risk of leaving the organization
4. **New Hire** - Recently joined employees
5. **Succession Candidate** - Potential successors for key roles
6. **Performance Improvement Plan** - Currently on a PIP
7. **High Retention Priority** - Critical employees to retain
8. **Ready for Lateral Move** - Good candidates for role changes

**How to add flags:**

1. **Click an employee** to open the Details panel
2. **Find the Flags section** in the Details tab
3. **Click "Add flag..."** to open the flag picker
4. **Select one or more flags** from the dropdown list
5. Flags appear as colored chips below the picker

Each flag has a distinct color to make it easy to identify at a glance.

**How to remove flags:**

- Click the **X** on any flag chip to remove it
- Changes save automatically

**Flag badges on employee tiles:**

When an employee has flags:
- A **🏷️ badge** appears on their tile with a count (e.g., "2" if they have 2 flags)
- Hover over the tile to see which flags are applied
- This makes it easy to spot flagged employees when viewing the grid

**When to use flags:**

**Use "Promotion Ready" when:**
- Identifying employees for upcoming promotion cycles
- Building succession plans
- Preparing talent review discussions

**Use "Flagged for Discussion" when:**
- Marking employees to review in calibration meetings
- Noting controversial or borderline ratings
- Tracking open questions about placement

**Use "Flight Risk" when:**
- Identifying retention concerns
- Prioritizing retention conversations
- Planning counter-offers or engagement strategies

**Use "New Hire" when:**
- Tracking employees in onboarding
- Separating new hires from tenured employees in analysis
- Deferring final ratings until probation period ends

**Use "Succession Candidate" when:**
- Building succession plans for key roles
- Identifying high-potential leaders
- Planning leadership development programs

**Use "Performance Improvement Plan" when:**
- Tracking employees on formal PIPs
- Monitoring performance improvement efforts
- Ensuring follow-up discussions occur

**Use "High Retention Priority" when:**
- Marking critical employees who must be retained
- Prioritizing retention efforts and budget
- Ensuring key talent receives adequate attention

**Use "Ready for Lateral Move" when:**
- Identifying employees for role rotations
- Building cross-functional experience
- Addressing skill gaps through internal mobility

Flags are included in your Excel export, making it easy to share and track these categories outside of 9Boxer.

### Reporting Chain Filtering

The **Reporting Chain** section in the Details tab shows an employee's management hierarchy. You can click on any manager name to instantly filter the grid to show only that manager's team.

**How it works:**

1. **Click an employee** to open the Details panel
2. **Find the Reporting Chain** section showing their management hierarchy
3. **Click any manager name** (displayed as a clickable link)
4. The grid filters to show only employees reporting to that manager
5. A filter chip appears in the FilterDrawer showing "Reporting Chain: [Manager Name]"

**Visual feedback:**

- Manager names appear as **blue underlined links** (clickable)
- Hovering shows a **pointer cursor** indicating the link is interactive
- When a manager is selected, their name is **highlighted** in the filter state
- The filter chip shows which reporting chain is active

**Clearing the filter:**

- Click the **X** on the "Reporting Chain" chip in the FilterDrawer
- Or click "Clear All Filters" to remove all active filters
- The grid returns to showing all employees

**When to use reporting chain filtering:**

**Use when:**
- Reviewing a specific team during calibration meetings
- Comparing employees within one manager's organization
- Investigating rating patterns by manager
- Focusing discussion on one reporting line at a time

**Example workflow:**
1. Notice an interesting employee in the grid
2. Click to see their details and reporting chain
3. Click their manager's name to see the whole team
4. Review how this manager rated their entire group
5. Identify patterns or inconsistencies
6. Clear filter and move to next team

This makes it easy to drill down from individual employees to their full team context without manually setting up filters.

### Moving Employees

#### How to Drag and Drop

1. **Click and hold** on an employee tile
2. **Drag** to the desired box on the grid
3. **Release** to drop the employee
4. The tile turns **yellow** to indicate it's been modified
5. The File menu shows "Apply X Changes" with your total change count

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

## Donut Mode Exercise

**Donut Mode** is a special exercise mode designed to validate that employees in the center "Core Talent" box truly belong there. The name comes from the visualization: you're looking at everyone in the center hole of the donut and asking, "Where would they go if they couldn't stay in the center?"

### What is the Donut Exercise?

The Donut Exercise is a talent management technique that helps identify:
- Employees who may be misplaced in the Core Talent box
- People who are on an upward trajectory (should be High Potential or Stars)
- People who may be slipping (should be Solid Performers or lower)
- Whether your center box is properly calibrated

**The key question:** For each employee in the center box, if they couldn't be rated as "Medium Performance, Medium Potential," where would they actually belong?

### When to Use Donut Mode

Use Donut Mode during:
- **Talent calibration sessions** - Validate center box placements across teams
- **Performance review cycles** - Ensure Core Talent ratings are accurate
- **Succession planning** - Identify hidden stars or under-performers
- **Quality checks** - Verify your 9-box ratings are properly differentiated

### How to Activate Donut Mode

1. **Upload your employee data** as normal
2. **Click the Grid/Donut toggle** in the View Controls toolbar (top-right of the grid)
   - Or press **D** on your keyboard for quick access
3. **The grid changes** to show only employees currently in position 5 (Core Talent box)
4. **The toggle updates** to show Donut view is active

**To deactivate:**
- Click the Grid/Donut toggle again
- Or press **D** on your keyboard
- The grid returns to normal view showing all employees

**Keyboard shortcut:** Press **D** to toggle Donut Mode on/off.

### What Happens in Donut Mode

When you activate Donut Mode:

**Grid Changes:**
- Only employees in position 5 (Core Talent [M,M]) are displayed
- All other employees are temporarily hidden
- Box labels remain the same (you can still place people in any box)
- Drag-and-drop continues to work normally

**Visual Indicators:**
- View toggle in View Controls shows "Donut" view is active
- The employee count shows only position 5 employees

**Key Principle:**
Donut placements are **separate from actual positions**. Moving someone in Donut Mode does NOT change their real performance/potential ratings. This is purely an exercise to explore "what-if" scenarios.

### Working in Donut Mode

#### Placing Employees

1. **Review the employees** currently shown (all from position 5)
2. **Drag an employee** to where they would go if they couldn't be Medium/Medium:
   - Drag to position 9 (Stars) if they're actually high performers with potential
   - Drag to position 2 (Solid Performer) if they're really just meeting minimum standards
   - Place anywhere that reflects their true capability
3. **The employee's appearance changes** to show they've been "donut-placed":
   - Becomes semi-transparent (ghostly, 70% opacity)
   - Gets a purple border
   - Shows a purple "Donut" badge
4. **The placement is tracked** separately from their actual position

**Important:**
- You can place employees in any box, including back to position 5 if you think they're correctly placed
- Moving someone back to position 5 removes their donut placement (clears the exercise data)
- You can move the same employee multiple times; only the final placement is tracked

#### Visual Indicators in Donut Mode

When an employee has been placed in Donut Mode, they display:

**Ghostly Appearance:**
- Semi-transparent (70% opacity) to indicate this is an exploratory placement
- Clearly distinguishable from regular employee tiles

**Purple Border:**
- 2px purple border around the tile
- Distinct from the yellow border used for regular modifications

**Purple "Donut" Badge:**
- Small purple badge with "Donut" text
- Appears on the employee tile
- Confirms this is a donut exercise placement

**Position Label:**
- Shows the donut position (e.g., "Donut: Star [H,H]")
- Italic text to differentiate from regular position labels

### Tracking Donut Changes

Donut Mode changes are tracked separately from regular changes to keep the exercise data isolated.

**When Donut Mode is active:**

1. **Click the "Changes" tab** in the right panel
2. **You'll see two tabs:**
   - **Regular Changes** - Normal employee movements and notes
   - **Donut Changes** - Donut exercise placements and notes
3. **The "Donut Changes" tab** shows:
   - Employee name
   - Movement from Core Talent to their donut position
   - Notes field for documenting your reasoning
   - Count of donut placements in the tab label

**The change tracker automatically:**
- Adds an entry when you place someone in donut mode
- Updates the entry if you move them again (shows net change)
- Removes the entry if you move them back to position 5
- Keeps donut changes separate from regular changes

**When Donut Mode is inactive:**
- You can still see the donut changes in the Changes tab if any exist
- This lets you review your donut exercise conclusions in normal mode
- Regular changes continue to track actual position changes

### Adding Notes to Donut Placements

Notes help you document why someone should (or shouldn't) be in the center box.

**To add a note:**
1. **Open the Changes tab** in the right panel
2. **Switch to "Donut Changes" tab** (if not already selected)
3. **Click in the Notes field** for the employee
4. **Type your reasoning**:
   - "Actually exceeds expectations, should be High Performer"
   - "Struggling with recent projects, may need development"
   - "Ready for advancement, High Potential trajectory"
   - "Correctly placed in Core Talent"
5. **Click outside the field or press Tab** to save
   - Notes save automatically
   - No need to wait for confirmation

**Note Tips:**
- Be specific about what makes them not-quite-center-box
- Reference specific achievements or concerns
- Document trajectory (improving vs. declining)
- Note if they're correctly placed (confirms calibration)

### Switching Between Modes

You can toggle between Donut Mode and normal mode at any time.

**Toggling to Donut Mode:**
- Grid filters to position 5 employees only
- Employees with donut placements appear at their donut positions
- Donut visual indicators (ghostly, purple border, badge) appear
- Donut Changes tab becomes visible

**Toggling to Normal Mode:**
- Grid shows all employees
- All employees appear at their actual positions
- Donut visual indicators disappear
- Regular changes display normally
- Donut placements remain saved (not lost)

**Placements Persist:**
- Donut placements are saved when you make them
- They persist when you toggle modes on and off
- They remain in your session until you upload a new file
- They're included in your Excel export

**Important:**
When in normal mode, employees appear at their actual positions, NOT their donut positions. The donut placements are only visible when Donut Mode is active.

### Exporting Donut Data

When you apply your changes (File menu → Apply X Changes), the Excel file includes donut exercise data in dedicated columns.

**Four new columns are added:**

1. **Donut Exercise Position** - The position number (1-9) from the exercise
2. **Donut Exercise Label** - The box label (e.g., "Star [H,H]")
3. **Donut Exercise Change Description** - Formatted text like "Donut: Moved from Core Talent [M,M] to Star [H,H]"
4. **Donut Exercise Notes** - Your notes explaining the donut placement

**For employees with donut placements:**
- All four columns are populated with their donut exercise data
- The regular performance/potential columns show their ACTUAL ratings (unchanged)
- This gives you both actual ratings and exercise findings side-by-side

**For employees without donut placements:**
- The four donut columns are empty
- Only employees you placed in Donut Mode have donut data

**For employees with regular changes:**
- Regular changes appear in "Modified in Session" and "9Boxer Change Notes" columns
- Donut changes appear in separate "Donut Exercise" columns
- You can have both regular and donut data for the same employee

This separation ensures:
- Actual talent ratings remain intact
- Exercise findings are clearly documented
- You can review donut conclusions without affecting real data
- Full audit trail of both actual and exploratory placements

### Use Cases and Examples

**Example 1: Calibration Meeting**

During a talent calibration session, you notice your Core Talent box has 45 employees - more than expected.

1. **Activate Donut Mode** to see only those 45 employees
2. **Review each one** and ask: "If they can't be Medium/Medium, where do they really belong?"
3. **Place employees** at their true level:
   - 8 people → High Potential (they're actually exceeding)
   - 5 people → Solid Performers (just meeting minimums)
   - 32 people → Back to position 5 (correctly placed)
4. **Add notes** explaining each decision
5. **Export the results** to review with leadership
6. **Use the findings** to recalibrate actual ratings in a future session

**Example 2: Identifying Hidden Stars**

You suspect some Core Talent employees are actually rising stars.

1. **Activate Donut Mode**
2. **Look for patterns**:
   - Recent promotions
   - Consistently exceeding goals
   - Taking on leadership roles
3. **Place high-performers** in High Potential or Stars boxes
4. **Add notes** with evidence (projects, metrics, feedback)
5. **Review Donut Changes tab** to see your "promoted" list
6. **Export** to create a development/succession plan

**Example 3: Performance Review Validation**

Before finalizing performance reviews, validate your center box.

1. **Activate Donut Mode** before submitting ratings
2. **Challenge each placement**: Does this person truly belong in Core Talent?
3. **Move anyone** who's borderline to their more accurate box
4. **Document reasoning** in notes for each move
5. **Review the findings** with managers
6. **Adjust actual ratings** based on donut exercise insights

### Tips for Effective Donut Exercises

1. **Do it with others** - Calibration meetings are ideal for donut exercises
2. **Be honest** - The exercise only works if you're truthful about placements
3. **Document everything** - Add notes for every placement, even "correctly placed"
4. **Look for patterns** - If many people move to High Potential, your center box may be too broad
5. **Use as validation** - Donut mode confirms (or challenges) your current ratings
6. **Review before export** - Check the Donut Changes tab to ensure all notes are complete
7. **Compare both views** - Toggle between modes to see actual vs. exercise placements
8. **Act on findings** - Use donut insights to recalibrate actual ratings in a future session

### Donut Mode Best Practices

**Before the Exercise:**
- Upload current employee data
- Ensure position 5 placements are up to date
- Have clear criteria for what "Core Talent" means
- Gather recent performance data

**During the Exercise:**
- Focus only on position 5 employees
- Ask: "Where would they go if not Medium/Medium?"
- Be specific in your notes
- Consider trajectory, not just current state
- Challenge assumptions about "safe" middle ratings

**After the Exercise:**
- Review the Donut Changes tab for all placements
- Look for patterns (many moving up? many moving down?)
- Discuss findings with stakeholders
- Export for documentation and reference
- Plan to address any significant discrepancies

**Common Findings:**
- **Many move to High Potential** - Your "Core" bar may be too low
- **Many move to Solid Performer** - You may be over-rating average performance
- **Even split up and down** - Good differentiation, Core Talent is well-calibrated
- **Most stay at position 5** - Either correct calibration or need to challenge more

---

## Tracking Changes and Adding Notes

The **Changes** tab provides a comprehensive tracking system for all employee movements with the ability to add notes explaining your decisions.

### Accessing the Change Tracker

1. **Click the "Changes" tab** in the right panel (second tab after Details)
2. The change tracker displays a table of all employee movements
3. Each row shows one employee who has been moved from their original position

**When donut mode is active or donut changes exist:**
- The change tracker shows two tabs: **Regular Changes** and **Donut Changes**
- **Regular Changes** tab displays normal employee movements
- **Donut Changes** tab displays donut exercise placements (see [Donut Mode Exercise](#donut-mode-exercise))
- Tab badges show the count of changes in each category
- Click between tabs to view regular or donut changes

**When donut mode is inactive and no donut changes exist:**
- The change tracker shows a single list of regular changes (original behavior)
- No tabs are displayed for a cleaner interface

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
- **Flags** - Filter by employee flags (see [Flags System](#flags-system))
- **Reporting Chain** - Filter by specific manager's team (see [Reporting Chain Filtering](#reporting-chain-filtering))

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
- Click the **X** on individual filter chips
- Or click "Clear All Filters" to remove all at once

### Flag Filters

The FilterDrawer includes a **Flags** section that lets you filter employees by their assigned flags.

**How flag filtering works:**

1. **Open the FilterDrawer** (click "Filters" button)
2. **Scroll to the Flags section**
3. **Check one or more flag categories:**
   - Promotion Ready
   - Flagged for Discussion
   - Flight Risk
   - New Hire
   - Succession Candidate
   - Performance Improvement Plan
   - High Retention Priority
   - Ready for Lateral Move
4. The grid updates to show only employees with those flags

**Employee counts:**
- Each flag shows the count of employees with that flag (e.g., "Flight Risk (3)")
- This makes it easy to see how many employees fall into each category
- Counts update as you apply other filters

**AND logic for multiple flags:**
- When you select multiple flags, 9Boxer uses **AND logic**
- Example: Selecting "Promotion Ready" AND "High Retention Priority" shows only employees with BOTH flags
- This helps you find employees at the intersection of multiple categories

**Flag filter chips:**
- Active flag filters appear as chips in the filter bar
- Click the **X** on a chip to remove that flag filter
- Or use "Clear All Filters" to remove all filters at once

**When to use flag filters:**

**Use when:**
- Preparing for calibration meetings: Filter to "Flagged for Discussion" to review questionable placements
- Building retention plans: Filter to "Flight Risk" or "High Retention Priority" to focus on at-risk talent
- Succession planning: Filter to "Succession Candidate" to review your leadership pipeline
- Performance review cycles: Filter to "Performance Improvement Plan" to track employees on PIPs
- Promotion planning: Filter to "Promotion Ready" to identify advancement candidates

**Example workflow:**
1. Tag employees during the year as you identify issues or opportunities
2. When it's time to act, filter to the relevant flag category
3. Review all employees in that category at once
4. Make decisions and document actions
5. Clear flags or update as situations resolve

### Reporting Chain Filter Display

When you click a manager name in an employee's Reporting Chain (see [Reporting Chain Filtering](#reporting-chain-filtering)), a filter chip appears in the FilterDrawer.

**Filter chip displays:**
- "Reporting Chain: [Manager Name]"
- Shows which manager's team is currently displayed
- Appears alongside other active filters

**Clearing the reporting chain filter:**
- Click the **X** on the "Reporting Chain" chip
- Or click "Clear All Filters" to remove all filters
- The grid returns to showing all employees

**Combining with other filters:**
- You can combine reporting chain filtering with other filters
- Example: Show only "High Performers" (performance filter) in "Manager A's" team (reporting chain filter)
- All filters use AND logic together

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

### When to Apply Changes

Apply your changes when you:
- Have moved employees to their correct boxes
- Want to save your current session
- Are ready to share updated ratings
- Need a backup before making more changes

**Critical**: The application does NOT auto-save. You must apply changes to save your work. 9Boxer warns you if you try to import data or close the file with unsaved changes.

### Apply Changes Process

1. **Make changes** by dragging employees to different boxes
2. **Open the File menu** (top-left of application bar)
3. **Click "Apply X Changes"** (where X is the number of pending changes)
4. **Choose your save option:**
   - **Update original file** (default) - Saves back to the file you loaded
   - **Save to different file** - Choose a new location and filename
5. **Click "Apply Changes"** to save
6. Your work is now saved to the Excel file!

**File Menu Options:**
- **Import Data** - Load a new Excel file
- **Load Sample Dataset** - Load demo data to explore 9Boxer
- **Recent Files** - Quickly reopen your last 5 files
- **Apply X Changes** - Save your work (appears when you have changes)
- **Close File** - Close the current file (warns if unsaved changes)
- **Clear Recent Files** - Remove all files from recent files list

### What's in the Export

The exported Excel file contains:

**Regular Employee Data:**
- All employee data from your original file
- Updated performance ratings (based on grid position)
- Updated potential ratings (based on grid position)
- All original columns preserved (level, manager, chain, etc.)
- Any additional columns from your original file

**Regular Change Tracking Columns:**
- **"9Boxer Change Notes"** - Contains notes you added for regular changes
- **"Modified in Session"** - Shows "Yes" for employees who were moved
- **"Modification Date"** - Timestamp of when each employee was last moved
- **"9Boxer Change Description"** - Formatted description of the movement (e.g., "Moved from Core Talent [M,M] to Star [H,H]")

**Donut Exercise Columns** (if you used Donut Mode):
- **"Donut Exercise Position"** - Position number (1-9) from donut exercise
- **"Donut Exercise Label"** - Box label from donut exercise (e.g., "Star [H,H]")
- **"Donut Exercise Change Description"** - Formatted text (e.g., "Donut: Moved from Core Talent [M,M] to High Potential [M,H]")
- **"Donut Exercise Notes"** - Notes you added during the donut exercise

Your original file remains completely unchanged.

**Important:**
- Regular changes affect the actual Performance/Potential columns
- Donut exercise data appears in separate columns and does NOT change actual ratings
- This lets you export both real talent decisions and exploratory exercise findings
- See [Donut Mode Exercise](#donut-mode-exercise) for more details on donut data

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

- **Click File menu → Apply X Changes** - Changes are NOT saved until you apply them
- **If you chose "Update original file"** - Check the same location as your original file
- **If you chose "Save to different file"** - Check the location you selected in the save dialog
- **Check Recent Files** - The File menu shows recently saved files
- **Check permissions** - Ensure you have write access to the file location

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
- ✓ Use View Controls to customize your grid view with zoom and view mode toggle
- ✓ Tag employees with flags for tracking and organization
- ✓ Filter by flags, reporting chains, and other criteria
- ✓ Use Donut Mode to validate center box placements
- ✓ Track all changes with the built-in change tracker
- ✓ Add notes documenting why each change was made
- ✓ View enhanced employee details with color-coded assessments
- ✓ View statistics and advanced intelligence
- ✓ Export updated ratings, donut exercise data, and notes back to Excel

All your data stays local and secure on your computer. Remember to export your changes before closing!

---

**Version**: 2.3
**Last Updated**: December 2024
**Questions?** Review this guide or contact your system administrator
