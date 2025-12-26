# Screenshot Requirements for Documentation Updates

**Status:** Documented (Not Generated)
**Date:** December 26, 2024

## Overview

This document outlines the screenshot requirements for documenting the ViewControls consolidation and Details Panel UX overhaul. Screenshots should be generated using the existing Playwright and Storybook workflows.

## Screenshot Generation Strategy

Per the issue and comments:
- Use **Storybook** for specific component screenshots
- Use **Playwright** for full app composition screenshots
- Automated workflow: `npm run screenshots:generate` (from frontend/)

## ViewControls Screenshots (11 total)

### Priority 1: Core UI Changes (5 screenshots)

**1. main-interface.png**
- **Type:** Full app (Playwright)
- **Content:** Main dashboard showing new AppBar and floating ViewControls
- **Key elements:**
  - Simplified AppBar (Logo, File, Help, Settings only)
  - Floating ViewControls toolbar in top-right
  - Grid with employee tiles
- **Location:** Top-level overview

**2. view-controls-grid.png** (NEW)
- **Type:** Component in context (Playwright)
- **Content:** ViewControls toolbar with Grid view active
- **Key elements:**
  - ViewControls toolbar highlighted
  - Grid/Donut toggle showing Grid icon active
  - Zoom controls visible (+, -, reset, percentage)
  - Fullscreen button
- **Annotation:** Red box around ViewControls, callout "View Controls toolbar"

**3. view-controls-donut.png** (NEW)
- **Type:** Component in context (Playwright)
- **Content:** ViewControls toolbar with Donut view active
- **Key elements:**
  - Grid/Donut toggle showing Donut icon active
  - Only position 5 employees visible on grid
  - ViewControls toolbar still visible
- **Annotation:** Highlight toggle in active state

**4. settings-dialog.png** (NEW)
- **Type:** Component (Storybook or Playwright)
- **Content:** Settings dialog open showing theme and language options
- **Key elements:**
  - Theme radio buttons (Light, Dark, Auto)
  - Language dropdown with English/Español
  - Current selection display
  - Close button
- **Annotation:** Callouts for theme and language sections

**5. toolbar-overview.png**
- **Type:** Partial UI (Playwright)
- **Content:** Simplified AppBar showing only 4 controls
- **Key elements:**
  - Logo (left)
  - File menu button
  - Help button
  - Settings button (gear icon)
- **Annotation:** Label each button

### Priority 2: Feature-Specific (3 screenshots)

**6. donut-mode-activation.png**
- **Type:** Component closeup (Storybook)
- **Content:** ViewControls with Grid/Donut toggle highlighted
- **Key elements:**
  - Toggle button in both states (before/after)
  - Hover state if possible
- **Annotation:** "Click here to toggle" arrow, "Press D" keyboard shortcut note

**7. zoom-controls.png** (NEW)
- **Type:** Component closeup (Storybook)
- **Content:** Zoom controls section of ViewControls
- **Key elements:**
  - Zoom in (+) button
  - Zoom out (-) button
  - Reset button
  - Current zoom percentage display
- **Annotation:** Label each button, show keyboard shortcuts (Ctrl+/-, Ctrl+0)

**8. fullscreen-mode.png** (NEW)
- **Type:** Full app (Playwright)
- **Content:** Application in fullscreen mode
- **Key elements:**
  - No browser chrome visible
  - Grid maximized
  - ViewControls still visible
- **Annotation:** "Press F11 to toggle" note

### Priority 3: Quick Tour (3 screenshots)

**9-11. quick-tour-step-*.png**
- **Type:** Full app with annotations (Playwright)
- **Content:** Updated quick tour showing new UI
- **Updates needed:**
  - Step 1: Show File menu for Import Data (not Upload button)
  - Step 2: Show ViewControls location
  - Step 5: Updated toolbar references

---

## Details Panel Screenshots (6 total)

### Enhanced Current Assessment (1 screenshot)

**12. current-assessment-enhanced.png**
- **Type:** Component (Storybook)
- **Content:** Current Assessment section in Details panel
- **Key elements:**
  - Box name with coordinates (e.g., "Star [H,H]")
  - Performance chip (color-coded to grid - Purple for High)
  - Potential chip (color-coded to grid - Purple for High)
  - Recent changes summary embedded
- **Annotation:** Callouts for each element
- **Example data:** High performer employee showing all features

### Flags System (3 screenshots)

**13. flags-ui.png**
- **Type:** Component (Storybook)
- **Content:** Flags section in Details panel
- **Key elements:**
  - "Flags" heading
  - Autocomplete picker with "Add flag..." placeholder
  - 2-3 existing flag chips with X buttons
  - Different colored chips (blue, orange, red for variety)
- **Annotation:** "Click to add" on picker, "Click X to remove" on chip
- **Example flags:** "Promotion Ready", "Flight Risk", "New Hire"

**14. flags-badges.png**
- **Type:** Grid with badges (Playwright)
- **Content:** Employee tiles showing flag badges
- **Key elements:**
  - Multiple employee tiles visible
  - Some tiles with flag badges (🏷️ icon + count)
  - Badge in top-right corner of tile
  - Tooltip showing on hover (if possible)
- **Annotation:** Red box around badge, callout "Flag count badge"
- **Example:** Show tiles with 1, 2, and 3+ flags

**15. flags-filtering.png**
- **Type:** FilterDrawer (Storybook or Playwright)
- **Content:** FilterDrawer showing Flags section
- **Key elements:**
  - "Flags" section header
  - Checkboxes for all 8 flag types
  - Employee count next to each flag (e.g., "Promotion Ready (3)")
  - Some flags checked
  - Active filter chips at top
- **Annotation:** Highlight Flags section, show filter logic explanation

### Reporting Chain Filtering (2 screenshots)

**16. reporting-chain-clickable.png**
- **Type:** Component (Storybook)
- **Content:** Reporting Chain section in Details panel
- **Key elements:**
  - Management hierarchy list
  - Manager names shown as blue underlined links
  - Hover state on one manager (pointer cursor)
  - "Employee" label
  - Manager levels (01, 02, 03, etc.)
- **Annotation:** "Click to filter" arrow pointing to manager name

**17. reporting-chain-filter-active.png**
- **Type:** FilterDrawer + Grid (Playwright)
- **Content:** Active reporting chain filter
- **Key elements:**
  - FilterDrawer showing "Reporting Chain" filter chip
  - Chip text: "Reporting Chain: [Manager Name]"
  - Grid filtered to show only employees under that manager
  - Employee count updated
- **Annotation:** Highlight filter chip, show filtered result

---

## Screenshot Specifications

### Technical Requirements
- **Format:** PNG with transparency where applicable
- **Resolution:** 2400px width minimum (retina/2x)
- **Color depth:** 24-bit RGB
- **Compression:** Optimized (TinyPNG after annotation)

### Annotation Standards
- **Highlight boxes:** Red (#FF0000), 3px border
- **Callout circles:** Blue (#1976D2), numbered
- **Arrows:** Red (#FF0000), 4px width
- **Text:** 16px Roboto, white on 50% black background

### File Naming Convention
```
[category]-[feature]-[state].png

Examples:
view-controls-grid-active.png
settings-dialog-open.png
flags-ui-with-chips.png
reporting-chain-clickable-hover.png
```

### Storage Location
```
docs/images/screenshots/
├── view-controls/
│   ├── main-interface.png
│   ├── view-controls-grid.png
│   ├── view-controls-donut.png
│   ├── settings-dialog.png
│   ├── toolbar-overview.png
│   ├── donut-mode-activation.png
│   ├── zoom-controls.png
│   └── fullscreen-mode.png
└── details-panel/
    ├── current-assessment-enhanced.png
    ├── flags-ui.png
    ├── flags-badges.png
    ├── flags-filtering.png
    ├── reporting-chain-clickable.png
    └── reporting-chain-filter-active.png
```

---

## Workflow Files Needed

### ViewControls Workflow
**File:** `frontend/playwright/screenshots/workflows/view-controls.ts`

**Scenarios to capture:**
1. Main interface with new AppBar
2. ViewControls in Grid view
3. ViewControls in Donut view
4. Settings dialog open
5. Fullscreen mode

### Details Panel Workflow
**File:** `frontend/playwright/screenshots/workflows/details-panel-enhancements.ts`

**Scenarios to capture:**
1. Enhanced current assessment display
2. Flags section with chips
3. Grid with flag badges on tiles
4. FilterDrawer with flags section
5. Reporting chain with clickable managers
6. Active reporting chain filter

### Storybook Screenshots

Components to capture in Storybook:
- `ViewControls` component (isolated)
- `ZoomControls` section (isolated)
- `SettingsDialog` component
- `EmployeeFlags` component
- `ManagementChain` component
- `FilterDrawer` with flags section

**Command:** `npm run screenshots:storybook` (if configured)

---

## Update Screenshot Config

**File:** `frontend/playwright/screenshots/config.ts`

Add screenshot definitions for all 17 new screenshots with:
- Target selector
- Viewport size
- Wait conditions
- Annotation instructions

---

## Manual vs Automated

### Automated (Playwright/Storybook) - 14 screenshots
- Main interface
- ViewControls variations
- Settings dialog
- Component close-ups
- FilterDrawer views
- Grid with badges

### Manual (Electron app running) - 3 screenshots
- Fullscreen mode (requires F11 in actual app)
- Quick tour sequences (may need interactive setup)
- Complex multi-step scenarios

---

## Validation Checklist

Before marking screenshots as complete:
- [ ] All 17 screenshots generated
- [ ] Annotations applied consistently
- [ ] File names follow convention
- [ ] Alt text written for each image
- [ ] Images optimized (<500KB each)
- [ ] Screenshots match current UI exactly
- [ ] Both light and dark themes captured (where relevant)
- [ ] All key elements visible and labeled

---

## Notes

- Screenshots should use **realistic sample data** (not "John Doe")
- **Hide sensitive information** if using real data
- **Consistent window size** for all screenshots (1920x1080 recommended)
- **Both themes** may be needed for certain screenshots
- Some screenshots may require **manual annotation** after automated capture

---

## Related Documentation

- ViewControls plan: `agent-projects/view-controls-consolidation/documentation-updates-needed.md`
- Details Panel plan: `agent-projects/details-panel-ux-overhaul/IMPLEMENTATION_SUMMARY.md`
- Screenshot guide: `docs/contributing/screenshot-guide.md`
- Playwright config: `frontend/playwright/screenshots/config.ts`
