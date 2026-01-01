# Working with Employees

This guide covers viewing employee details, moving employees on the grid, and managing employee flags.

---

## Viewing Employee Details

Click any employee tile to open the details panel on the right with four tabs.

![Employee details panel with four tabs](images/screenshots/placeholder-details-panel.png){: .screenshot-placeholder }

### Details Tab

Shows complete employee information:

- Name, ID, and current ratings
- Job level, profile, and manager
- Organizational chain
- Flags (special status indicators)
- Timeline of all historical moves

### Changes Tab

Track modifications to this employee:

- View any moves you've made
- Add notes explaining changes
- Notes are included when you export

### Statistics Tab

Distribution data for your workforce. See [Statistics](statistics.md) for details.

### Intelligence Tab

Anomaly detection and analytics. See [Intelligence](intelligence.md) for details.

---

## Moving Employees

Drag and drop to move employees between grid positions.

### How to Move

1. **Click and hold** an employee tile
2. **Drag** to the destination box
3. **Release** to drop them in place

![Drag and drop sequence](images/screenshots/placeholder-drag-drop.png){: .screenshot-placeholder }

When you move an employee:

- An **orange left border** appears on the tile
- The **Apply button badge** shows your change count
- The move is recorded in the timeline

!!! warning "Changes Require Export"
    Changes aren't saved until you click **Apply** and export. Always export before closing.

---

## Adding Notes

Document why you moved someone:

1. Click an employee to open the panel
2. Go to the **Changes tab**
3. Click in the **Notes field**
4. Type your explanation
5. Click outside to save (auto-saves)

![Notes field in Changes tab](images/screenshots/placeholder-notes-field.png){: .screenshot-placeholder }

Notes help with calibration meetings, audit trails, and future reference.

---

## Viewing Timeline

See the complete movement history:

1. Click an employee
2. Go to the **Details tab**
3. Scroll to the **Timeline section**

![Timeline showing position changes](images/screenshots/placeholder-timeline.png){: .screenshot-placeholder }

The timeline shows:

- When each move happened
- Previous and new positions
- Chronological order (most recent first)

---

## Expanding Grid Boxes

When a box has many employees, expand it for better visibility:

1. **Click the expand icon** (⛶) on the box
2. Employees arrange in multiple columns
3. Drag-and-drop still works
4. **Click collapse** or press ++esc++ to close

![Expanded box with multi-column layout](images/screenshots/placeholder-expanded-box.png){: .screenshot-placeholder }

---

## Employee Flags

Flags are visual markers highlighting employees with special statuses.

### Available Flags

| Flag | Color | Meaning |
|------|-------|---------|
| **Promotion Ready** | Blue | Ready for promotion |
| **Succession Candidate** | Purple | Identified for succession planning |
| **High Retention Priority** | Gold | Critical to retain |
| **Flight Risk** | Red | At risk of leaving |
| **Flagged for Discussion** | Orange | Needs team discussion |
| **New Hire** | Green | Recently joined |
| **Ready for Lateral Move** | Teal | Ready for role change at same level |
| **Performance Improvement Plan** | Red | On formal PIP |
| **Big Mover** | Cyan | Moved significantly (auto-flagged) |

### Adding and Removing Flags

**To add a flag:**

1. Click an employee
2. Go to **Details tab** → **Flags section**
3. Click **Add Flag** dropdown
4. Select the flag

**To remove a flag:**

1. Find the flag chip in the Flags section
2. Click the **X** on the chip

### The Big Mover Flag

This flag is auto-applied when employees cross performance tiers:

- Low tier (Boxes 1-4) → High tier (Boxes 6, 8, 9)
- High tier → Low tier

Big movers indicate significant shifts that deserve extra scrutiny.

### Filtering by Flags

Combine flags with filters to focus your view:

1. Open **Filters** drawer
2. Check flag types under **Flags** section
3. Combine with other filters (job function, manager, etc.)

Example: Filter by "Flight Risk" + "High Retention Priority" to see critical employees at risk.

---

## Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| **Blue tile** | Default (unchanged) |
| **Orange left border** | Modified in session |
| **Purple border** | In Donut Mode exercise (also shows original position) |
| **Colored flag chips** | Has special status flags |
| **Expand icon (⛶)** | Click to expand/collapse box |

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| View employee details | Click employee tile → Panel opens |
| See job info | Click employee → Details tab |
| View movement history | Click employee → Details tab → Timeline |
| Move an employee | Drag tile to new box |
| See modified employees | Look for orange left border |
| Check change count | Look at Apply button badge |
| Add a note | Click employee → Changes tab → Notes field |
| Add a flag | Details tab → Flags → Add Flag dropdown |
| Remove a flag | Click X on flag chip |
| Filter by flags | Filters drawer → Flags section |
| Expand crowded box | Click expand icon (⛶) |
| Collapse expanded box | Click collapse icon or press Esc |

---

## Next Steps

- [Tracking Changes](tracking-changes.md) - Detailed change tracking
- [Filtering and Exclusions](filters.md) - Focus on specific groups
- [Donut Mode](donut-mode.md) - Validate center box placements
- [Exporting](exporting.md) - Save your work
