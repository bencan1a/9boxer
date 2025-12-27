# Screenshot Specifications: Making Your First Changes

**Document Type:** Screenshot Requirements
**Related Guide:** `internal-docs/workflows/making-changes.md`
**Task:** Phase 2, Task 2.2
**Created:** 2024-12-20

---

## Overview

This document specifies the screenshots needed for the "Making Your First Changes" workflow guide. Each screenshot should help first-time users understand the drag-and-drop mechanics and visual feedback.

---

## Required Screenshots (5 total)

### 1. Drag-and-Drop Sequence (3-panel composite)

**File name:** `making-changes-drag-sequence.png`

**Purpose:** Show the complete drag-and-drop workflow in action

**Composition:** Three panels side-by-side showing the progression

**Panel 1 - Click and Hold:**
- Employee tile highlighted with cursor positioned on drag handle
- Tile should show normal state (no orange border yet)
- Mouse cursor visible as pointer
- Annotation: Red box around the drag handle (≡ icon) with callout "1. Click and hold"

**Panel 2 - Dragging:**
- Employee tile semi-transparent (opacity 0.5) being dragged
- Mouse cursor visible between source and target boxes
- Show drag overlay with employee details
- Annotation: Arrow showing drag direction with callout "2. Drag to new box"

**Panel 3 - After Drop:**
- Employee tile in new position with orange left border
- Normal opacity restored
- Modified badge visible
- Annotation: Red box around orange border with callout "3. Orange border confirms the move"

**Technical Details:**
- Use employee: "Sarah Chen" or similar realistic name
- Source box: Position 3 (High Performance, Low Potential)
- Target box: Position 6 (High Performance, Medium Potential)
- Ensure "Modified" chip is visible in Panel 3
- Resolution: 2400px width minimum (800px per panel)

**data-testid references:**
- `employee-card-{id}` - Employee tile
- `modified-indicator` - Modified badge

---

### 2. Orange Border Close-up

**File name:** `making-changes-orange-border.png`

**Purpose:** Clearly show the visual indicator for modified employees

**Composition:** Close-up of a single employee tile with orange border

**What to capture:**
- Full employee tile with orange left border (4px thick)
- "Modified" badge clearly visible (secondary color chip)
- Employee name and title visible
- Job level chip visible
- Enough context to see it's part of the grid

**Annotations:**
- Red arrow pointing to orange left border with label "Orange border = Changed in this session"
- Red circle around "Modified" badge with label "Modified indicator"
- Optional: Color swatch showing "secondary.main" color (#ff9800 in light mode)

**Technical Details:**
- Border: 4px solid secondary.main (#ff9800 light, #ffb74d dark)
- Chip: "Modified" label, secondary color, height 18px
- Employee example: Use realistic data from Sample_People_List.xlsx
- Resolution: 800px width minimum

**Code reference:** `EmployeeTile.tsx` lines 50-51, 99-106

---

### 3. Employee Details Panel

**File name:** `making-changes-employee-details.png`

**Purpose:** Show how to verify changes in the employee details view

**Composition:** Right panel with employee details open

**What to capture:**
- Full right panel (Details tab active)
- Employee name, title, job level prominent
- **Current Performance and Potential ratings** clearly visible
- All four tabs visible at top (Details, Changes, Statistics, Intelligence)
- Performance History section visible if space permits

**Annotations:**
- Red box around Performance/Potential values with label "Updated ratings"
- Red arrow pointing to Details tab with label "Details tab shows current info"
- Optional: Highlight the Performance History section

**Technical Details:**
- Tab selection: Details tab (first tab)
- Show realistic employee data
- Ensure performance/potential match the box they were moved to
- Resolution: 800px width minimum

**data-testid references:**
- Right panel tabs (check `RightPanel.tsx` for exact ids)

---

### 4. Timeline View

**File name:** `making-changes-timeline.png`

**Purpose:** Show historical movement tracking

**Composition:** Performance History section within employee details

**What to capture:**
- Timeline component showing current year (2025) at top with green dot
- At least 1-2 previous years with blue dots
- Clear labels showing Performance and Potential for current year
- "Current Assessment" label visible

**Annotations:**
- Red arrow pointing to 2025 entry with label "Current position (after your move)"
- Optional: Red circle around green dot indicator
- Optional: Note showing comparison to previous year

**Technical Details:**
- Timeline uses MUI Timeline components
- Current year: Green TimelineDot
- Historical: Blue TimelineDot with connectors
- Show realistic progression (e.g., Medium → High Performance)
- Resolution: 600px width minimum

**Code reference:** `RatingsTimeline.tsx`

---

### 5. Changes Tab

**File name:** `making-changes-changes-tab.png`

**Purpose:** Show the complete change tracking interface

**Composition:** Right panel with Changes tab active

**What to capture:**
- "Change Tracker" heading visible
- Table showing at least 2-3 employee movements
- Columns: Employee, Movement, Notes
- Movement column showing old position → new position with chips and arrow
- At least one row with notes filled in (example note)
- At least one row with empty notes field (showing placeholder "Add notes...")

**Annotations:**
- Red box around the Movement column with label "Shows old → new position"
- Red arrow pointing to Notes field with label "Add context here"
- Optional: Number badge showing total changes

**Technical Details:**
- Tab selection: Changes tab (fourth tab)
- Show 2-3 changes for realism
- Use TrendingFlatIcon (→) between position chips
- Old position: Outlined chip (variant="outlined")
- New position: Primary colored chip
- Resolution: 1000px width minimum

**data-testid references:**
- `change-tracker-view` - Main container
- `change-table` - Table component
- `change-row-{employee_id}` - Individual rows
- `change-notes-{employee_id}` - Notes text field

**Code reference:** `ChangeTrackerTab.tsx`

---

## Screenshot Capture Notes

### Using the Automated Tool

The `tools/generate_docs_screenshots.py` script can capture most of these screenshots with the right configuration.

**Preparation:**
1. Upload sample data with at least 10 employees
2. Move 2-3 employees to create modified state
3. Add sample notes to at least one change
4. Select an employee to populate the right panel

**Capture sequence:**
1. Drag sequence: Requires manual capture or staged screenshots
2. Orange border: Can be automated with focus on single tile
3. Employee details: Automated - select employee, capture right panel
4. Timeline: Automated - scroll to Performance History section
5. Changes tab: Automated - switch to Changes tab, capture

### Manual Annotation Requirements

After capturing base screenshots:

1. **Use consistent annotation style:**
   - Red boxes: 3px solid #d32f2f
   - Arrows: 4px wide, red (#d32f2f), simple arrowhead
   - Callout text: 16px Roboto, white on black/50% opacity background
   - Number badges: White text on blue circle (#1976d2)

2. **Follow accessibility guidelines:**
   - High contrast annotations
   - Clear, readable text at all sizes
   - Alt text describing the annotation intent

3. **Tools recommended:**
   - Snagit (Windows/Mac)
   - GIMP (free, cross-platform)
   - Greenshot (Windows, free)
   - macOS Screenshot with Markup

---

## Integration Checklist

Once screenshots are captured and annotated:

- [ ] File names match specifications above
- [ ] All annotations are clear and readable
- [ ] Images optimized (<500KB each)
- [ ] Files placed in `internal-docs/images/screenshots/`
- [ ] Alt text written for each image
- [ ] Markdown image syntax updated in `making-changes.md`
- [ ] Images render correctly in MkDocs build
- [ ] Images work in both light and dark mode (if app supports themes)

---

## Alternative Approaches

If the 3-panel drag sequence is difficult to capture:

**Option A: Separate images**
- `making-changes-drag-1-click.png`
- `making-changes-drag-2-dragging.png`
- `making-changes-drag-3-dropped.png`
- Update markdown to show three separate images

**Option B: Animated GIF**
- Capture full drag-and-drop as animated GIF
- File: `making-changes-drag-sequence.gif`
- 2-3 second loop showing the complete action
- Annotate individual frames or add overlay text

**Option C: Video screenshot**
- Record 5-second video of drag-and-drop
- Extract key frames at click, drag, drop
- Combine into composite image

---

## Notes for Future Updates

- If UI changes (e.g., border color, badge style), update screenshots
- Keep employee names and data consistent across all screenshots
- Use same theme (light/dark) for all screenshots in the guide
- Consider capturing both light and dark mode versions for accessibility

---

**Status:** Specifications complete, screenshots pending capture
**Next steps:** Use automated tool + manual annotation to generate images
