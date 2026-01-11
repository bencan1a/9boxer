# Filtering Employees

Filters help you focus on specific groups of employees without changing or deleting any data. All filters are temporary and non-destructive.

---

## Filter Toolbar

The Filter Toolbar is a floating panel positioned at the top-left of the 9-box grid, right above the vertical axis. It gives you quick access to filtering and search tools while you work.

![Filter toolbar in expanded state](/images/screenshots/toolbar/filter-toolbar-expanded.png)

### What's in the Toolbar

The toolbar shows:

- **Filter button** - Opens the filter drawer (highlighted orange when filters are active)
- **Employee count** - Shows "75 of 200 employees" when filtering, or "200 employees" when viewing all
- **Active filter summary** - Hover to see which filters you've applied
- **Employee search** - Find specific employees by name, job level, or manager
- **Collapse/expand toggle** - Minimize the toolbar to save screen space

### Collapse and Expand

Click the **chevron button** (< or >) on the right side of the toolbar to collapse or expand it.

When collapsed, you'll only see the filter button. This gives you more screen space for the grid while keeping filtering accessible.

The toolbar remembers your preference - if you collapse it and refresh the page, it stays collapsed.

::: tip Keyboard Focus
The filter toolbar makes it easy to switch between filtering and searching. Click the Filter button to open the drawer, or click directly into the search field to find an employee.

:::

---

## Employee Search

The search field in the Filter Toolbar helps you find specific employees fast, even with partial or misspelled names.

![Employee search autocomplete showing results](/images/screenshots/toolbar/filter-toolbar-search-autocomplete.png)

### How Search Works

The employee search uses **fuzzy matching**, which means it's forgiving:

- Type "jn smth" and it finds "John Smith"
- Type "sarah eng" and it finds "Sarah Chen" in "Engineering"
- Misspellings and typos usually still work

Search looks across multiple fields (weighted by relevance):

- **Employee name** (highest priority)
- **Job title/role** (e.g., "Senior Engineer")
- **Job level** (like "MT3" or "IC")
- **Manager name**
- **Location** and **Job function** (lower priority)

::: info Searching Within Filters
The search only searches employees currently visible on the grid. If you've applied filters (like "Engineering only"), the search results only include engineers. This makes it easy to find someone within a specific team or department.

:::

### Using Search Results

As you type, you'll see a dropdown with matching employees:

1. **Employee name** is shown with matching text highlighted
2. **Job level and manager** appear below in smaller text
3. **Matching text is highlighted** across all fields

Click any employee in the results to select them and open their details panel.

### Keyboard Navigation

You can navigate search results with your keyboard:

- **Arrow keys** - Move up and down through results
- **Enter** - Select the highlighted employee
- **Escape** - Close the dropdown

---

## Basic Filters

Click the **Filter** button in the toolbar to open the filter drawer. When filters are active, the button turns orange so you can see at a glance that you're viewing a subset of employees.

![Filters panel](/images/screenshots/filters/filters-panel-expanded.png)

### Available Filter Categories

| Category | Options | Description |
|----------|---------|-------------|
| **Job Levels** | MT1-MT6, IC, Manager, etc. | Filter by job grade |
| **Job Functions** | Engineering, Sales, Product, etc. | Filter by department |
| **Locations** | USA, Europe, India, etc. | Filter by office/region |
| **Managers** | Manager names in hierarchy | Filter by organization structure |
| **Flags** | Flight Risk, Promotion Ready, etc. | Filter by special status |

### How Filtering Works

1. **Check the boxes** for criteria you want to see
2. **Grid updates automatically** as you make selections
3. **Click outside** the drawer or press Filters again to close

**Filter Logic:**

- **Within a category** (OR): Checking "Engineering" and "Sales" shows employees in either
- **Across categories** (AND): Checking "Engineering" and "High Performance" shows only high-performing engineers

![Filter drawer with multiple selections in one category demonstrating OR logic](/images/screenshots/filters/filters-logic-or-example.png)

![Filter drawer with selections across categories demonstrating AND logic](/images/screenshots/filters/filters-logic-and-example.png)

### Filter Indicators

When filters are active:

- **Orange dot** appears on the Filters button
- **Employee count** shows "X of Y employees" (X visible, Y total)

![Filters button with orange dot indicator and employee count showing filtered results](/images/screenshots/filters/filters-active-indicator.png)

To clear all filters, uncheck all boxes or click **Clear All**.

---

## Filtering by Flags

Flags mark employees with special statuses. Filter by flags to quickly find specific groups.

![Flags section in filter drawer](/images/screenshots/filters/flags-section.png)

**Available Flags:**

- **Promotion Ready** - Ready for advancement
- **Flight Risk** - At risk of leaving
- **High Retention Priority** - Critical to retain
- **Flagged for Discussion** - Needs manager review
- **New Hire** - Recently joined
- **PIP** - On Performance Improvement Plan
- **Succession Candidate** - Identified for succession
- **Ready for Lateral Move** - Ready for role change

Each flag shows a count of employees with that status.

::: tip Combine Flags
Check multiple flags like "Flight Risk" + "High Retention Priority" to see critical employees at risk who need immediate attention.

:::

---

## Manager Filter (Organization Hierarchy)

The Manager filter shows your organization structure as a hierarchical tree. This makes it easy to view specific teams, departments, or entire reporting chains.

![Manager tree filter showing organization hierarchy](/images/screenshots/filters/org-tree-filter-expanded.png)

### How the Tree Works

Each manager in the tree shows:

- **Manager name** with checkbox for selection
- **Team size badge** showing direct and indirect reports (e.g., "Sarah Chen (12)")
- **Expand/collapse icon** to show or hide their direct reports

The tree is fully collapsible - click the arrow icons to expand or collapse each manager's section.

::: info Top-Level View
The tree starts at the top of your organization. Executives and VPs are at the root, with their direct reports nested below. Keep expanding to drill down through the hierarchy.

:::

### Selecting Managers

Check the box next to any manager to filter the grid to show:

- That manager's **direct reports**
- All employees in their **reporting chain** (direct and indirect)

You can select multiple managers at once. The grid shows everyone who reports to any of the selected managers.

**Examples:**

- Check "Sarah Chen" → See Sarah's entire team
- Check "Sarah Chen" + "Marcus Lee" → See both teams combined
- Check a VP → See the entire division

### Searching Within the Tree

Can't find the manager you're looking for? Use the search field at the top of the Manager section.

![Manager tree filter with search active](/images/screenshots/filters/org-tree-filter-search.png)

As you type:

- **Matching managers are highlighted** with yellow background
- **Parent nodes auto-expand** to show matching descendants
- **Non-matching managers are hidden** to reduce clutter

The search is instant and updates as you type. Clear the search field to see the full tree again.

::: tip Finding Your Team Fast
If your organization is large, searching is faster than scrolling. Type your manager's name and their section appears immediately.

:::

### Multi-Select Examples

Selecting multiple managers is great for cross-team analysis:

![Multiple managers selected in the tree](/images/screenshots/filters/org-tree-multi-select.png)

| Goal | How to Select |
|------|---------------|
| **Compare two departments** | Check both department heads |
| **Review your skip-level team** | Check yourself and all direct reports |
| **Prepare for calibration** | Check all managers in the calibration group |
| **View entire division** | Check the VP/executive at the top |

### Filter Summary Display

When you select managers, the toolbar shows an active filter summary:

- **One manager**: "Manager: Sarah Chen"
- **Multiple managers**: "Manager: Sarah Chen, Marcus Lee"
- **Many managers**: "Manager: Sarah Chen, Marcus Lee +3"

Hover over the summary to see the complete list of all selected managers.

---

## Managing Exclusions

Exclusions let you hide specific individuals from the grid. Use this to remove outliers or focus on a subset.

### Opening the Exclusion Dialog

1. Click **Filters** in the top bar
2. Scroll to the bottom
3. Click **Manage Exclusions**

![Exclusions dialog](/images/screenshots/filters/exclusions-dialog.png)

### Two Ways to Exclude

**Individual Selection:**

- Search for employees by name
- Check the box next to each person to exclude
- Click **Apply**

**Quick Buttons:**

| Button | What It Hides |
|--------|---------------|
| **Exclude VPs** | MT6 level employees |
| **Exclude Directors+** | MT5 and MT6 |
| **Exclude Managers** | MT2 and MT4 |

### After Excluding

- Excluded employees disappear from the grid
- Employee count updates ("35 of 47 employees")
- They're **not deleted**—just hidden from view

### Re-Including Employees

1. Open **Manage Exclusions** again
2. Uncheck the employees you want to restore
3. Click **Apply**

### Exclusions in Export

::: warning Exclusions Don't Affect Exports
All employees (including excluded ones) are included in Excel exports. Excluded employees are marked with an "Excluded" flag.

:::

### Exclusion Persistence

- Exclusions **persist** during your session
- Exclusions **clear** when you:
    - Upload a new file
    - Restart the application

---

## Filter Combinations

Combine filters to drill down to specific groups:

| Goal | Filter Combination |
|------|-------------------|
| **Critical at-risk employees** | Flight Risk + High Retention Priority |
| **Promotion candidates in Sales** | Promotion Ready + Job Function: Sales |
| **Your entire org** | Filters → Managers → Check your name in tree |
| **ICs only** | Exclude Managers button |

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| Apply a filter | Filter button in toolbar → Check criteria → Grid updates |
| See flight risk employees | Filters → Check "Flight Risk" flag |
| Search for a specific employee | Type name in FilterToolbar search box |
| Filter by manager/team | Filters → Managers → Check manager in tree |
| Hide specific people | Filters → Manage Exclusions → Check names → Apply |
| Exclude all managers | Manage Exclusions → "Exclude Managers" button |
| See how many are filtered | Check "X of Y employees" in FilterToolbar |
| Clear all filters | Uncheck all boxes or "Clear All" |
| Restore excluded employees | Manage Exclusions → Uncheck names → Apply |

---
