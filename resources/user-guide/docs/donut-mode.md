# Donut Mode

Donut Mode is an exercise to validate that employees in the center "Core Talent" box truly belong there. The name comes from the visualization: you're examining everyone in the center hole of the donut.

---

## What Is It?

The Donut Exercise asks one simple question for each employee in Position 5 (Core Talent):

!!! question "The Key Question"
    If this person couldn't be rated Medium Performance / Medium Potential, where would they actually belong?

This forces you to challenge "safe" center placements and reveals:

- **Hidden stars** - High performers who were under-rated
- **Slipping performers** - People who should be in lower boxes
- **Correct placements** - Employees who truly are Core Talent

**Important**: Donut placements are exploratory. They do NOT change actual ratings—they're tracked separately.

---

## When to Use It

- **Before calibration meetings** - Identify borderline cases for discussion
- **Center box is overcrowded** - Challenge the 65% sitting in Medium/Medium
- **Quality checking ratings** - Validate Core Talent placements before finalizing
- **Finding hidden potential** - Identify rising stars who may be under-rated

---

## How to Activate

1. Click the **Donut Mode** button in the top bar (donut icon, next to Filters)
2. The grid filters to show only Position 5 employees
3. An **ACTIVE** indicator appears on the button

![Donut Mode button in toolbar](images/screenshots/placeholder-donut-button.png){: .screenshot-placeholder }

**To deactivate**: Click the button again.

---

## Working in Donut Mode

### Moving Employees

1. **Review** the employees shown (all from Position 5)
2. **Drag** each employee to where they'd go if they couldn't be Medium/Medium:
    - Position 9 (Stars) if they're actually high performers
    - Position 2 (Solid Performer) if they're just meeting minimums
    - Any box that reflects their true capability
3. **The employee's tile changes** to show the donut placement:
    - Purple border
    - Shows original position

![Grid in Donut Mode showing employee tiles](images/screenshots/placeholder-donut-grid.png){: .screenshot-placeholder }

### Returning to Position 5

If you think someone is correctly placed:

- Drag them back to Position 5
- This removes their donut placement (confirms they belong in Core Talent)

---

## Tracking Donut Changes

Donut placements are tracked separately from regular changes.

### Viewing Donut Changes

1. Click the **Changes** tab in the right panel
2. You'll see two tabs:
    - **Regular Changes** - Actual rating adjustments
    - **Donut Changes** - Exercise placements

Each donut placement shows:

- Employee name
- Movement (from Core Talent → donut position)
- Notes field

![Donut Changes tab](images/screenshots/placeholder-donut-changes.png){: .screenshot-placeholder }

### Adding Notes

Document your reasoning for each placement:

1. Click in the **Notes field** for an employee
2. Type your explanation
3. Click outside to save (auto-saves)

Example notes:
- "Actually exceeds expectations, should be High Performer"
- "Struggling with recent projects, needs development"
- "Correctly placed in Core Talent"

---

## Switching Modes

You can toggle between Donut Mode and normal mode freely.

**When you switch TO Donut Mode:**
- Grid shows only Position 5 employees
- Donut-placed employees appear at their donut positions with purple borders

**When you switch TO Normal Mode:**
- Grid shows all employees at their actual positions
- Donut placements are hidden (but saved)

---

## Exporting Donut Data

When you export, four columns are added for donut placements:

| Column | Description |
|--------|-------------|
| `Donut Exercise Position` | Position number (1-9) |
| `Donut Exercise Label` | Box label (e.g., "Star [H,H]") |
| `Donut Exercise Change Description` | "Donut: Moved from Core Talent [M,M] to Star [H,H]" |
| `Donut Exercise Notes` | Your notes |

**Important**: Regular Performance/Potential columns show actual ratings—they're NOT changed by donut placements.

---

## Regular vs Donut Changes

| Aspect | Regular Mode | Donut Mode |
|--------|-------------|------------|
| **Purpose** | Update actual ratings | Explore "what-if" placements |
| **Changes Ratings** | Yes | No |
| **Visual** | Orange border | Purple border |
| **Tracking** | Regular Changes tab | Donut Changes tab |
| **Export** | Updates Performance/Potential | Separate Donut columns |

---

## Interpreting Results

After completing the exercise:

| Finding | Interpretation |
|---------|---------------|
| Many move to High Potential | Your "Core" bar may be too low |
| Many move to Solid Performer | You may be over-rating average performance |
| Even split up and down | Good differentiation |
| Most stay at Position 5 | Either correct calibration or need to challenge more |

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| Start donut exercise | Click Donut Mode button in top bar |
| Place an employee | Drag to where they'd go if not Medium/Medium |
| Confirm correct placement | Drag back to Position 5 |
| Add a note | Donut Changes tab → Notes field |
| See my placements | Changes tab → Donut Changes |
| Exit donut mode | Click Donut Mode button again |
| Export donut data | File menu → Apply Changes (donut columns auto-included) |

---

## Next Steps

- [Understanding the Grid](understanding-grid.md) - What each position means
- [Tracking Changes](tracking-changes.md) - How change tracking works
- [Exporting](exporting.md) - How donut data appears in exports
