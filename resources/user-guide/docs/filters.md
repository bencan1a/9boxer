# Filtering and Exclusions

Focus on specific groups of employees using filters and exclusions. These tools help you narrow your view without changing or deleting any data.

---

<details>
<summary>📋 Quick Reference (Click to expand)</summary>

**Applying Filters:**
- Click Filters button → Check desired criteria → Grid updates automatically
- Active filters show orange dot on Filters button
- Employee count shows "X of Y employees" (X = visible, Y = total)
- Click outside drawer to close

**Common Filter Combinations:**
- Focus on department: Use Organizational Chain filter
- View high performers: Check "High" under Performance
- Find discussion topics: Combine Performance + Potential ranges
- Review manager's team: Select specific Manager name

**Managing Exclusions:**
- Click Filters → Manage Exclusions → Check individuals to hide
- Quick buttons: Exclude VPs, Exclude Directors+, Exclude Managers
- Excluded employees hidden from grid but included in exports

**Clearing Filters:**
- Uncheck all boxes individually OR click "Clear All" button
- Exclusions persist during session but clear on new upload

[See detailed instructions below ↓](#using-filters)

</details>

---

## Using Filters

Filters let you display only employees who match specific criteria. All other employees are temporarily hidden from the grid.

> 📋 **Real-World Scenario**
>
> Sarah is preparing for her quarterly talent review meeting. She has 47 employees but only needs to discuss the 12 in her direct team. She uses the **Department** filter to focus on just her team, making the meeting prep much faster.

### Opening the Filter Drawer

1. Click the **"Filters"** button in the top application bar
2. The filter drawer opens on the right side of the screen
3. Filter options appear organized by category

### Available Filter Categories

You can filter employees by:

| Filter Category | Options | Description |
|----------------|---------|-------------|
| **Performance** | Low, Medium, High | Current performance rating |
| **Potential** | Low, Medium, High | Future growth capacity |
| **Job Levels** | IC, Manager, VP, etc. | Employee job level or grade |
| **Job Profiles** | Various functions | Job title, role, or function |
| **Managers** | Manager names | Direct manager |
| **Organizational Chain** | Org levels | Department, division, or hierarchy level |

### How Filtering Works

> 📋 **Real-World Scenario**
>
> Marcus manages 25 people across three teams. During his quarterly review, he uses the **Department** filter to review each team separately. This helps him focus the discussion and compare employees within the same context.

**Applying Filters:**

1. Check the boxes for the criteria you want to see
2. The grid updates automatically as you make selections
3. Only employees matching your selected criteria remain visible
4. Click outside the drawer or press the **Filters** button again to close

**Filter Logic:**

- **Within a category** (OR logic): Show employees matching ANY of the selected options
    - Example: Selecting "High" and "Medium" performance shows employees with either rating
- **Across categories** (AND logic): Show employees matching ALL selected categories
    - Example: Selecting "High Performance" AND "Manager" job level shows only high-performing managers

!!! tip "Filter Combinations"
    You can combine multiple filters to drill down to very specific groups. For example, filter by "High Potential" + "IC" + "Engineering" to see all high-potential individual contributors in engineering.

### Active Filter Indicators

When filters are active, you'll see:

- **Orange dot** on the Filters button (shows filters are applied)
- **Employee count** displays "X of Y employees" format
    - **X** = number of employees currently displayed
    - **Y** = total employees in your dataset
- **Filtered-out employees** are hidden from the grid (not deleted)

!!! example "Example Filter Indicator"
    "45 of 150 employees" means 45 employees match your current filters out of 150 total.

### Clearing Filters

To remove filters and show all employees again:

- **Uncheck all filter boxes** individually, or
- **Click "Clear All"** button (if available in the filter drawer)

The grid returns to showing all employees.

---

## Employee Exclusions

Exclusions let you temporarily hide specific individual employees from the grid. This is useful for removing outliers, temporarily excluding certain people from analysis, or focusing on a subset.

> 📋 **Real-World Scenario**
>
> James is reviewing leadership bench strength for his board presentation. He uses the **Exclude Directors+** button to focus only on individual contributors and first-line managers, identifying 8 high-potential employees ready for promotion to leadership roles.

!!! info "Filters vs. Exclusions"
    **Filters** hide employees based on criteria (job level, performance, etc.)
    **Exclusions** hide specific individuals by name

    Both are temporary and non-destructive. Hidden employees can always be restored.

### Managing Exclusions

**To open the exclusion manager:**

1. Click the **"Filters"** button in the top bar
2. Scroll to the bottom of the filter drawer
3. Click the **"Manage Exclusions"** button
4. The exclusion dialog opens

### Two Ways to Exclude Employees

The exclusion dialog offers two approaches:

#### 1. Individual Selection

**Features:**

- Complete list of all employees in your dataset
- **Search box** to quickly find specific people by name
- **Checkbox** next to each employee name
- Check a box to exclude that employee, uncheck to re-include them

**How to use:**

1. Type in the search box to find an employee quickly
2. Check the box next to their name to exclude them
3. Repeat for each individual you want to hide
4. Click **"Apply"** to save your selections

#### 2. Quick Filter Buttons

For common exclusion scenarios, use one-click buttons:

| Button | Effect | Job Levels Hidden |
|--------|--------|-------------------|
| **Exclude VPs** | Hides all VP-level employees | MT6 |
| **Exclude Directors+** | Hides Directors and VPs | MT5, MT6 |
| **Exclude Managers** | Hides all manager levels | MT2, MT4 |

**How to use:**

1. Click the quick filter button for the group you want to hide
2. All employees in that category are automatically excluded
3. The exclusion checkboxes update to reflect the quick filter
4. Click **"Apply"** to save

!!! tip "Combining Exclusions"
    You can combine individual exclusions with quick filter buttons. For example, exclude all managers PLUS two specific individual contributors.

### After Applying Exclusions

Once you click **"Apply"**:

- Excluded employees **disappear from the grid**
- They are **not deleted** - just hidden from view
- Employee count updates to show "X of Y employees"
- All excluded employees remain in your dataset

### Managing Existing Exclusions

**To re-include excluded employees:**

1. Open **"Manage Exclusions"** again
2. Uncheck the boxes for employees you want to restore
3. Click **"Apply"**
4. Those employees reappear on the grid

**Exclusion persistence:**

- Exclusions **persist during your session** (while the app is open)
- Exclusions are **cleared** when you:
    - Upload a new file
    - Restart the application

### Excluded Employees in Exports

!!! warning "Exclusions DO NOT Affect Exports"
    When you export your changes to Excel, **ALL employees are included** in the export file, even excluded ones.

    Excluded employees are marked in the export with an "Excluded" flag so you can identify them.

This ensures you don't accidentally lose employee data when exporting.

---

## Use Cases

### Focus on a Department

**Scenario:** Review only the engineering department.

1. Open Filters
2. Select "Engineering" under Organizational Chain
3. Grid shows only engineering employees

### Review High Performers

**Scenario:** Focus on employees rated "High Performance."

1. Open Filters
2. Check "High" under Performance
3. Grid shows only high performers

### Hide Leadership for IC Analysis

**Scenario:** Analyze individual contributors without manager bias.

1. Open Filters → Manage Exclusions
2. Click **"Exclude Managers"**
3. Click **"Apply"**
4. Grid shows only ICs

### Remove Specific Outliers

**Scenario:** Temporarily hide two employees who are on leave.

1. Open Filters → Manage Exclusions
2. Search for each employee by name
3. Check their exclusion boxes
4. Click **"Apply"**
5. Those employees are hidden from analysis

---

## Tips for Effective Filtering

1. **Start broad, then narrow** - Apply general filters first, then add more specific criteria
2. **Check the employee count** - Verify the "X of Y" count matches your expectations
3. **Clear filters between analyses** - Reset filters when switching focus areas
4. **Use quick filter buttons** - Save time with one-click exclusions for common scenarios
5. **Document exclusions** - Note which employees you excluded and why (especially for reports)
6. **Remember exclusions don't export** - Excluded employees still appear in exported Excel files

---

## Related Topics

- [Viewing Statistics](statistics.md) - See distribution data after applying filters
- [Exporting Your Changes](exporting.md) - Understand how filters affect exports (they don't)
- [Working with Employees](working-with-employees.md) - Select and move filtered employees
