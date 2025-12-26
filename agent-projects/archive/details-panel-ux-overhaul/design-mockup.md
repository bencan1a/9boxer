# Details Panel UX Overhaul - Design Mockups

Visual representation of proposed changes to the Details panel.

## Before & After Comparison

### BEFORE (Current State)

```
┌─────────────────────────────────────────────────┐
│ Henry Anderson                                  │
│ Account Executive                               │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Employee Information                            │
│ Job Function:    Account Executive             │
│ Job Level:       IC                             │
│                                                 │
│ □ Promotion Ready                              │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Current Assessment                              │
│ Potential: [High]                              │
│ Position: Star [H,H]                           │
│                                                 │
│ [Modified in Session]  ← Only shows badge      │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Performance History                             │
│                  ● 2025 (Current)               │  ← Too far right
│                    Performance: High            │
│                    Potential: High              │
│                    Current Assessment           │
│                                                 │
│                  ● (No historical data)         │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Reporting Chain                                 │
│ Henry Anderson (You)                            │  ← Not clickable
│         ↑                                       │
│ Sarah Johnson (Manager)                         │
│         ↑                                       │
│ Bill Thompson (Executive)                       │
└─────────────────────────────────────────────────┘
```

### AFTER (Proposed Design)

```
┌─────────────────────────────────────────────────┐
│ Henry Anderson                                  │
│ Account Executive                               │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Employee Information                            │
│ Job Function:    Account Executive             │
│ Job Level:       IC                             │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ 🏷️ Flags                                        │
│ [Promotion Ready ×] [Flight Risk ×]            │
│ [+ Add Flag ▾]                                 │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Current Assessment                              │
│                                                 │
│ Box: High Performer [H,H]                      │
│ [Performance: High] [Potential: High]          │
│                                                 │
│ Recent Changes (2)                              │
│ ┌─────────────────────────────────────────────┐ │
│ │ Movement:                                   │ │
│ │ [Solid Performer M,M] → [High Performer H,H]│ │
│ │ Notes: "Promoted based on Q4 performance"   │ │
│ │ Dec 24, 2025 10:30 AM                       │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Donut Movement:                             │ │
│ │ [Inner Ring] → [Outer Ring]                │ │
│ │ Notes: "High retention priority"            │ │
│ │ Dec 24, 2025 9:15 AM                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Performance History                             │
│ ● 2025 (Current)                               │  ← Left aligned
│   Performance: High                             │
│   Potential: High                               │
│   Current Assessment                            │
│                                                 │
│ No historical ratings available                 │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Reporting Chain                                 │
│ Henry Anderson                                  │
│ (You)                                           │
│         ↑                                       │
│ [Sarah Johnson]  ← Clickable, hover underline  │
│ Manager                                         │
│         ↑                                       │
│ [Bill Thompson]  ← Clickable, hover underline  │
│ Executive                                       │
└─────────────────────────────────────────────────┘
```

## Detailed Component Designs

### 1. Enhanced Current Assessment Section

**Visual Design:**
```
┌─────────────────────────────────────────────────┐
│ Current Assessment                              │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Box: High Performer [H,H]                   │ │
│ │                                             │ │
│ │ ┌──────────────────┐  ┌──────────────────┐ │ │
│ │ │ Performance      │  │ Potential        │ │ │
│ │ │ High             │  │ High             │ │ │
│ │ └──────────────────┘  └──────────────────┘ │ │
│ │    (Purple badge)       (Purple badge)    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

Color Mapping (match grid):
- High Performance + High Potential: Purple (#d4c4e8 light, #4a3a5c dark)
- Medium Performance + Medium Potential: Green
- Low Performance or Low Potential: Red/Yellow based on position
```

**Implementation Notes:**
- Use Material-UI Chips with custom colors from theme
- Colors should match GridBox background colors
- Box name from `getPositionLabel()` function
- Grid coordinates in [X,Y] format

### 2. Changes Display in Current Assessment

**Visual Design:**
```
┌─────────────────────────────────────────────────┐
│ Recent Changes (3)                              │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Movement:                                   │ │
│ │ ┌──────────────┐    ┌──────────────┐       │ │
│ │ │ Solid M,M    │ →  │ High H,H     │       │ │
│ │ └──────────────┘    └──────────────┘       │ │
│ │                                             │ │
│ │ Notes:                                      │ │
│ │ "Promoted based on Q4 performance. Ready   │ │
│ │  for increased responsibilities."          │ │
│ │                                             │ │
│ │ Dec 24, 2025 10:30 AM                       │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Donut Movement:                             │ │
│ │ ┌──────────────┐    ┌──────────────┐       │ │
│ │ │ Inner Ring   │ →  │ Outer Ring   │       │ │
│ │ └──────────────┘    └──────────────┘       │ │
│ │                                             │ │
│ │ Notes: High retention priority              │ │
│ │                                             │ │
│ │ Dec 24, 2025 9:15 AM                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Movement:                                   │ │
│ │ ┌──────────────┐    ┌──────────────┐       │ │
│ │ │ Low L,M      │ →  │ Solid M,M    │       │ │
│ │ └──────────────┘    └──────────────┘       │ │
│ │                                             │ │
│ │ Notes: Improvement after training program   │ │
│ │                                             │ │
│ │ Dec 20, 2025 2:45 PM                        │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

Empty State (no changes):
┌─────────────────────────────────────────────────┐
│ Recent Changes                                  │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │                                             │ │
│ │          [TrendingFlat Icon]                │ │
│ │                                             │ │
│ │      No changes for this employee           │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Implementation Notes:**
- Filter changes from sessionStore by selected employee_id
- Combine normal changes and donut changes
- Sort by timestamp (most recent first)
- Limit to recent 5 changes (or all if < 5)
- Reuse Chip components from ChangeTrackerTab
- Include timestamp formatting

### 3. Flags System

**Visual Design:**
```
┌─────────────────────────────────────────────────┐
│ 🏷️ Flags                                        │
│                                                 │
│ [Promotion Ready ×] [Flagged for Discussion ×] │
│ [Flight Risk ×]                                │
│                                                 │
│ [+ Add Flag ▾]                                 │
│                                                 │
│ Available Flags Dropdown:                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ ☐ Promotion Ready                           │ │
│ │ ☐ Flagged for Discussion                    │ │
│ │ ☐ Flight Risk                               │ │
│ │ ☐ New Hire                                  │ │
│ │ ☐ Succession Candidate                      │ │
│ │ ☐ Performance Improvement Plan              │ │
│ │ ☐ High Retention Priority                   │ │
│ │ ☐ Ready for Lateral Move                    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

Flag Color Coding:
- Promotion Ready: Blue (#1976d2)
- Flagged for Discussion: Orange (#ff9800)
- Flight Risk: Red (#f44336)
- New Hire: Green (#4caf50)
- Succession Candidate: Purple (#9c27b0)
- Performance Improvement Plan: Red (#f44336)
- High Retention Priority: Gold (#ffc107)
- Ready for Lateral Move: Teal (#009688)
```

**Flag Badges on Employee Tiles:**
```
┌──────────────────────────────────┐
│ ≡  John Smith              👁 ✎ │
│    ID: EMP-12345                │
│    [🏷️ 2]  ← Flag count badge  │
└──────────────────────────────────┘

On Hover:
┌──────────────────────────────────┐
│ ≡  John Smith              👁 ✎ │
│    ID: EMP-12345                │
│    [🏷️ Promotion Ready]         │
│    [   Flight Risk]             │
└──────────────────────────────────┘
```

**Implementation Notes:**
- Use Material-UI Autocomplete for flag picker
- Chips with delete icon for set flags
- Store flags as string array on Employee
- Persist with session store
- Color chips based on flag type

### 4. Flag Filtering in FilterDrawer

**Visual Design:**
```
┌───────────────────────┐
│  🔍 Search            │
│  ___________________  │
│                       │
│  Departments          │
│  □ Engineering (27)   │
│  □ Product (15)       │
│                       │
│  ─────────────────    │
│                       │
│  🏷️ Flags             │
│  □ Promotion Ready (5)│
│  □ Flight Risk (2)    │
│  □ New Hire (8)       │
│  □ Succession (3)     │
│  □ PIP (1)            │
│                       │
│  ─────────────────    │
│                       │
│  Reporting Chain      │
│  [Bill Thompson ×]    │  ← Active filter
│                       │
│  ─────────────────    │
│                       │
│  [Reset Filters]      │
└───────────────────────┘
```

**Implementation Notes:**
- Add "Flags" section to FilterDrawer
- Show only flags that exist in dataset
- Multi-select checkboxes
- Show count of employees with each flag
- Active reporting chain filter shown as chip

### 5. Interactive Reporting Chain

**Visual Design:**
```
Normal State:
┌─────────────────────────────────┐
│ Reporting Chain                 │
│                                 │
│ Henry Anderson                  │
│ (You)                           │
│         ↑                       │
│ Sarah Johnson                   │
│ Manager                         │
│         ↑                       │
│ Bill Thompson                   │
│ Executive                       │
└─────────────────────────────────┘

Hover State (manager name):
┌─────────────────────────────────┐
│ Reporting Chain                 │
│                                 │
│ Henry Anderson                  │
│ (You)                           │
│         ↑                       │
│ [Sarah Johnson]  ← Underlined   │
│ Manager          ← Cursor pointer│
│         ↑                       │
│ Bill Thompson                   │
│ Executive                       │
└─────────────────────────────────┘

Click Action:
- FilterDrawer shows: [Reporting to: Sarah Johnson ×]
- Grid filters to employees with Sarah Johnson in management chain
- Visual indicator in reporting chain (highlighted)
```

**Implementation Notes:**
- Convert manager names to Button components
- Add hover states (underline, color change)
- onClick sets reporting chain filter in sessionStore
- Filter logic checks all management_chain_XX fields
- Clear button in FilterDrawer removes filter

## Color Palette Reference

From design system (`docs/design-system/design-principles.md`):

### Grid Box Colors (to match in Current Assessment)
- **High Performer** (6, 8, 9): Purple `#d4c4e8` (light), `#4a3a5c` (dark)
- **Solid Performer** (5): Green `#4caf50`
- **Development** (3, 7): Yellow `#ff9800`
- **Needs Attention** (1, 2, 4): Red `#f44336`

### Semantic Colors
- **Success**: Green `#4caf50`
- **Warning**: Orange `#ff9800`
- **Error**: Red `#f44336`
- **Info**: Blue `#1976d2`

## Spacing & Layout

Following design tokens:
- **Section spacing**: 24px (`theme.tokens.spacing.lg`)
- **Card spacing**: 16px (`theme.tokens.spacing.md`)
- **Chip spacing**: 8px (`theme.tokens.spacing.sm`)
- **Tight spacing**: 4px (`theme.tokens.spacing.xs`)

## Accessibility Considerations

1. **Keyboard Navigation**
   - All flags can be added/removed via keyboard
   - Manager names in reporting chain accessible via Tab
   - Flag picker accessible via keyboard

2. **Screen Reader**
   - ARIA labels for all interactive elements
   - Announce flag additions/removals
   - Announce filter activation

3. **Color Contrast**
   - All color combinations meet WCAG AA standards
   - Text + icons for all status indicators (not color alone)

4. **Focus Indicators**
   - Visible focus outlines for all interactive elements
   - High contrast focus states

## Responsive Behavior

- Flags wrap to multiple lines if needed
- Changes cards stack vertically (always)
- Reporting chain always vertical
- No horizontal scrolling in panel

## Animation & Transitions

Following design tokens (`theme.tokens.duration.*`):
- **Flag add/remove**: 0.15s ease-in-out
- **Filter activation**: 0.3s ease-out
- **Hover states**: 0.15s ease-in-out
- **Collapse/expand sections**: 0.3s ease-in-out
