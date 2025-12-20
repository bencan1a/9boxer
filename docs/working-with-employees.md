# Working with Employees

This page covers the interactive features for managing individual employees in the 9-Box grid.

## Viewing Employee Details

Click on any employee tile to open the right panel with four comprehensive tabs:

### Details Tab

The Details tab shows complete employee information:

- Employee name and ID
- Current performance and potential ratings
- Job level, profile, and manager
- Organizational chain hierarchy (Organization Name - Level 01, Level 02, etc.)
- **Timeline** - Complete history of all position changes with timestamps

The timeline helps you:

- Track when each employee was moved
- See their old and new positions
- Understand career progression over time

### Changes Tab

Track all employee movements across the 9-box grid:

- View all changes made to employees
- Add notes explaining why each change was made
- Notes are included when you export to Excel

See [Tracking Changes and Adding Notes](tracking-changes.md) for detailed information.

### Statistics Tab

View distribution data for all employees in your workforce.

See [Viewing Statistics and Intelligence](statistics.md) for comprehensive details.

### Intelligence Tab

Access advanced analytics and anomaly detection.

See [Intelligence Analysis](statistics.md#intelligence-tab) for detailed information.

## Moving Employees

### How to Drag and Drop

Moving employees between boxes is simple:

1. **Click and hold** on an employee tile
2. **Drag** to the desired box on the grid
3. **Release** to drop the employee in the new position
4. The tile turns **yellow** to indicate it's been modified
5. A badge on the "Apply" button shows your total change count

!!! tip "Visual Feedback"
    Modified employees display a yellow highlight, making it easy to see which employees have been moved during your session.

### What Happens When You Move

When you drag an employee to a new box:

- Employee's performance and potential ratings automatically update based on the new position
- The change is recorded in the timeline (visible in Details tab)
- A yellow highlight appears on the modified employee tile
- The change counter in the top bar increments to show total modifications

!!! warning "Remember"
    Changes are NOT saved until you click "Apply" and export! Always export your work before closing the application.

## Selecting and Deselecting Employees

Navigation and selection:

- **Click any employee tile** to select and view details in the right panel
- Selected employee details appear in the right panel
- **Click another employee** to change selection
- **Click outside the grid** or in an empty area to deselect

## Adding Notes to Employees

You can document the reasoning behind employee movements using the notes feature:

1. **Click an employee** to open the right panel
2. **Switch to the Changes tab**
3. **Click in the Notes field** for the employee
4. **Type your explanation** (e.g., "Promoted to manager role in Q4, strong leadership")
5. **Click outside the field or press ++tab++** to save
    - Notes save automatically in the background
    - You can immediately move to the next field without waiting

!!! tip "Note Best Practices"
    - Be specific about the reason (promotion, performance improvement, role change, etc.)
    - Keep notes concise but informative
    - Use consistent terminology across your team
    - Notes support multiple lines for longer explanations

Notes are valuable for:

- Calibration meetings and performance discussions
- Justifying rating changes to management
- Future reference when reviewing decisions
- Compliance and audit trails

See [Tracking Changes](tracking-changes.md) for more details on the change tracking system.

## Viewing Employee Timeline

The timeline feature shows the complete movement history for each employee:

1. **Click on an employee** to open the right panel
2. **View the Details tab** (first tab)
3. **Scroll to the Timeline section**

The timeline displays:

- **Timestamps** - When each movement occurred
- **Position changes** - From position → To position
- **Box labels** - Human-readable labels (e.g., "Core Performer [M,M]" → "Star [H,H]")
- **Chronological order** - Most recent changes at the top

This helps you understand:

- Career progression patterns
- Rating trajectory over time
- When major movements occurred
- Historical context for current placement

## Expanding and Collapsing Grid Boxes

When a grid box contains many employees, you can expand it for better visibility.

### Multi-Column Layout

When you expand a box containing multiple employees:

- **Click the expand button** (⛶ icon) on any box to expand it
- Employee cards automatically arrange in **multiple columns** (instead of a single column)
- Cards are displayed in a responsive grid that maximizes screen space
- Up to 3-4 columns may appear depending on your screen size
- All drag-and-drop functionality continues to work normally
- This makes it easier to see and manage boxes with many employees without excessive scrolling

<!-- Screenshot placeholder -->
!!! example "Screenshot Placeholder"
    **Expanded grid box showing multi-column employee layout**

    _(Screenshot to be added: Grid box expanded with employees in multiple columns)_

### Collapsing Boxes

To collapse an expanded box:

- **Click the collapse button** (⛶ icon) on the expanded box
- Or **press ++esc++** to collapse the currently expanded box

!!! info "Expansion State"
    The expansion state is remembered during your session, so boxes stay expanded even if you switch views or select different employees.

## Visual Indicators

Understanding the visual feedback system:

| Indicator | Meaning |
|-----------|---------|
| **Blue tile** | Default employee appearance (unchanged) |
| **Yellow highlight** | Employee has been moved (modified in session) |
| **Purple border + ghostly** | Employee in donut mode exercise (see [Donut Mode](donut-mode.md)) |
| **Expand icon (⛶)** | Click to expand/collapse grid box |

## Related Topics

- [Understanding the 9-Box Grid](understanding-grid.md) - Learn about grid positions and categories
- [Tracking Changes and Adding Notes](tracking-changes.md) - Detailed change tracking system
- [Donut Mode Exercise](donut-mode.md) - Special validation exercise for center box
- [Exporting Your Changes](exporting.md) - How to save your work
- [Filtering and Exclusions](filters.md) - Focus on specific employee groups
