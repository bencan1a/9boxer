# Tracking Changes

9Boxer automatically tracks all employee movements and lets you add notes explaining your decisions.

---

## What Gets Tracked

9Boxer tracks four types of changes:

| Change Type | What It Is | Where It Shows |
|-------------|-----------|----------------|
| **Employee Movements** | Dragging employees between grid boxes | Changes tab, orange border on tile |
| **Flags** | Adding or removing employee flags | Changes tab, employee tile |
| **Notes** | Your explanations for why changes were made | Changes tab, Excel export |
| **Donut Placements** | Exploratory positions in Donut Mode | Separate Donut Changes tab |

All changes save automatically. No manual save needed.

---

## Viewing Changes

To see all changes you've made:

1. Click any employee (or the **Changes** tab in the right panel)
2. View the table showing all movements

![Changes tab showing movement table](images/screenshots/placeholder-changes-tab.png){: .screenshot-placeholder }

Each row shows:

- **Employee** - Name of who was moved
- **Movement** - From position → To position (with color-coded chips)
- **Notes** - Your explanation (editable)

### How Movement Tracking Works

- Each employee appears **once**, showing their net change from original position
- If you move someone multiple times, only the overall change shows
- If you move someone **back to their original position**, they're automatically removed from the tracker

---

## Big Movers

9Boxer automatically flags employees who make significant tier jumps as "Big Movers."

### What Qualifies as a Big Move

Employees are grouped into performance tiers based on their grid position:

| Tier | Grid Positions | Description |
|------|----------------|-------------|
| **Low** | 1, 2, 3, 4 | Lower performance/potential boxes |
| **Middle** | 5, 7 | Core performers and enigmas |
| **High** | 6, 8, 9 | High performers and stars |

A **Big Mover** is automatically flagged when an employee crosses from:
- Low tier → High tier (e.g., Box 2 → Box 9)
- High tier → Low tier (e.g., Box 6 → Box 1)

### Why Big Movers Matter

Big moves represent significant rating changes that deserve extra scrutiny:

- **Upward big moves** may indicate rapid growth or prior underrating
- **Downward big moves** may signal performance issues or prior overrating

The Big Mover flag helps you identify these employees for calibration discussion.

---

## Adding Notes

Notes create an audit trail for your decisions.

**To add a note:**

1. Click in the **Notes field** for an employee
2. Type your explanation
3. Click outside to save (auto-saves)

![Notes field in changes panel](images/screenshots/placeholder-change-notes.png){: .screenshot-placeholder }

!!! tip "Good Notes"
    Be specific: "Promoted to team lead Q4, exceeded all targets" is better than "Good performance"

---

## Regular vs Donut Changes

When you use [Donut Mode](donut-mode.md), changes are tracked separately:

| | Regular Changes | Donut Changes |
|---|---|---|
| **Purpose** | Actual rating adjustments | Exploratory "what-if" placements |
| **Affects Ratings** | Yes - updates Performance/Potential | No - separate tracking only |
| **Export Columns** | `9Boxer Change Description/Notes` | `Donut Exercise Description/Notes` |

When donut changes exist, you'll see two tabs: **Regular Changes** and **Donut Changes**.

---

## Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| **Orange left border** on tile | Employee has been moved |
| **Big Mover flag** | Employee crossed performance tiers |
| **Badge on Apply button** | Number of unsaved changes |
| **Empty changes tab** | No movements yet |

---

## Export Columns

When you export, these columns are added for each modified employee:

| Column | Description |
|--------|-------------|
| `Modified in Session` | "Yes" if employee was moved |
| `Modification Date` | When the change was made |
| `9Boxer Change Description` | "Moved from Core Talent [M,M] to Star [H,H]" |
| `9Boxer Change Notes` | Your notes explaining the change |

For donut changes, separate columns: `Donut Exercise Position`, `Donut Exercise Label`, `Donut Exercise Notes`.

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| See all my changes | Click Changes tab in right panel |
| Add a note | Click Notes field → Type → Click outside |
| See who I moved | Look for orange left border on tiles |
| See big movers | Look for Big Mover flag on tiles |
| Know how many changes | Check Apply button badge |
| Undo a change | Drag employee back to original position |
| Export with notes | File menu → Apply Changes (notes included automatically) |

---

## Next Steps

- [Working with Employees](working-with-employees.md) - Move employees on the grid
- [Donut Mode](donut-mode.md) - Exploratory placement exercise
- [Exporting](exporting.md) - Save your changes to Excel
