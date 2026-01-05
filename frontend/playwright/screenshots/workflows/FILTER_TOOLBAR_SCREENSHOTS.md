# FilterToolbar Integration Screenshot Workflow

## Overview

This document describes the new screenshot generation workflow for FilterToolbar integration screenshots created for the `copilot/add-filtering-toolbar` branch.

**Created:** 2026-01-04
**Branch:** copilot/add-filtering-toolbar
**Workflow File:** `filter-toolbar-app.ts`

## Purpose

The FilterToolbar is now integrated into the actual 9-box grid application at the top-left position. These screenshots demonstrate:

1. **FilterToolbar visibility** - Shows the toolbar positioned above the vertical axis
2. **Active filter states** - Orange button highlighting when filters are active
3. **FilterDrawer integration** - Shows OrgTreeFilter replacing the old ReportingChainFilter
4. **Search functionality** - Employee search with autocomplete and highlighting
5. **Grid layout updates** - Updated grid screenshots showing the toolbar integration

## Why Full-App vs Storybook?

These screenshots use **full-app** workflows (not Storybook) because:

- Need to show FilterToolbar in context with the actual grid
- Need to demonstrate real filter state propagation between toolbar and drawer
- Need to capture FilterDrawer + toolbar interaction
- Storybook stories show components in isolation, but we need the integration

## Screenshots Generated

### 1. Updated Existing Screenshots

These existing screenshots have been updated to use the new full-app workflow:

| Screenshot | Path | Change |
|------------|------|--------|
| `filters-panel-expanded.png` | `filters/` | Now shows OrgTreeFilter instead of old filter UI |
| `filters-active-indicator.png` | `filters/` | Now shows FilterToolbar orange button (was AppBar) |
| `grid-basic-layout.png` | `grid/` | Now includes FilterToolbar at top-left |

### 2. New Screenshots

These are brand new screenshots for FilterToolbar features:

| Screenshot | Path | Description |
|------------|------|-------------|
| `filter-toolbar-and-grid.png` | `toolbar/` | Full grid with FilterToolbar visible |
| `filter-toolbar-search-autocomplete.png` | `toolbar/` | Search dropdown with highlighted matches |
| `org-tree-filter-expanded.png` | `filters/` | Hierarchical org tree with manager badges |
| `org-tree-filter-search.png` | `filters/` | Org tree with search highlighting |
| `org-tree-multi-select.png` | `filters/` | Multiple managers selected with checkboxes |

## Workflow Functions

### Core Functions

#### `generateFilterDrawerExpanded()`
- **Replaces:** Old Storybook-based `generateFilterDrawerAllExpanded()`
- **Shows:** FilterDrawer with OrgTreeFilter expanded
- **Features:**
  - Hierarchical organization tree visible
  - Manager names with team size badges
  - Expand/collapse icons and checkboxes
  - Multiple filter sections (Levels, Functions, Locations)

#### `generateFilterActiveIndicator()`
- **Replaces:** Old Storybook-based `generateFiltersActiveIndicator()`
- **Shows:** FilterToolbar with active filters
- **Features:**
  - Orange highlighted filter button
  - Filtered employee count (e.g., "45 of 200 employees")
  - Filter summary text visible in toolbar

#### `generateGridBasicLayoutWithToolbar()`
- **Updates:** `grid-basic-layout.png` to include FilterToolbar
- **Shows:** Complete 9-box grid with toolbar integration
- **Features:**
  - FilterToolbar at top-left
  - Performance and Potential axes labeled
  - All 9 positions visible with employee tiles

### New Feature Functions

#### `generateFilterToolbarAndGrid()`
- **NEW:** Shows full grid with FilterToolbar
- **Clean state:** No active filters
- **Purpose:** Demonstrate default toolbar integration

#### `generateFilterToolbarSearchAutocomplete()`
- **NEW:** Shows employee search functionality
- **Features:**
  - Search input with text entered
  - Autocomplete dropdown visible
  - Matched text highlighted with `<mark>` elements

#### `generateOrgTreeFilterExpanded()`
- **NEW:** Shows hierarchical organization tree
- **Features:**
  - 2-3 levels of hierarchy visible
  - Manager names with team size badges
  - Expand/collapse controls

#### `generateOrgTreeFilterSearch()`
- **NEW:** Shows search within org tree
- **Features:**
  - Search input with text
  - Matching managers highlighted
  - Tree auto-expanded to show matches

#### `generateOrgTreeMultiSelect()`
- **NEW:** Shows multiple manager selections
- **Features:**
  - 2-3 managers checked at different levels
  - Checked checkboxes visible
  - Active filter summary

## Usage

### Generate All FilterToolbar Screenshots

```bash
npm run screenshots:generate filters-panel-expanded filters-active-indicator grid-basic-layout filter-toolbar-and-grid filter-toolbar-search-autocomplete org-tree-filter-expanded org-tree-filter-search org-tree-multi-select
```

### Generate Individual Screenshots

```bash
# Just the filter drawer with OrgTreeFilter
npm run screenshots:generate filters-panel-expanded

# Just the active filter indicator
npm run screenshots:generate filters-active-indicator

# Just the grid with toolbar
npm run screenshots:generate grid-basic-layout
```

## Configuration

All screenshots are registered in `config.ts`:

```typescript
"filters-panel-expanded": {
  source: "full-app",
  workflow: "filter-toolbar-app",
  function: "generateFilterDrawerExpanded",
  path: "resources/user-guide/docs/images/screenshots/filters/filters-panel-expanded.png",
  description: "Filter panel expanded showing OrgTreeFilter...",
  quality: "good",
  usedIn: ["filters.md", "quickstart.md", ...],
}
```

## Technical Implementation

### State Management

Each function follows this pattern:

1. **Load sample data** (if not already loaded)
2. **Close any dialogs** to ensure clean state
3. **Perform actions** (open drawer, select filters, search, etc.)
4. **Wait for animations** using helpers from `../../helpers/ui`
5. **Capture screenshot** with appropriate cropping
6. **Reset state** (close dialogs) for next screenshot

### Helpers Used

From `frontend/playwright/helpers/`:

- `loadSampleData()` - Loads consistent sample data
- `closeAllDialogsAndOverlays()` - Ensures clean state
- `openFilterDrawer()` - Opens the FilterDrawer
- `waitForUiSettle()` - Waits for UI animations
- `verifyFilterActive()` - Verifies orange dot indicator
- `waitForCssTransition()` - Waits for specific CSS transitions

### Wait Strategies

The workflow uses proper wait strategies:

- **State-based waits:** `await element.waitFor({ state: "visible" })`
- **CSS transition waits:** `await waitForCssTransition(element, duration)`
- **UI settle waits:** `await waitForUiSettle(page, seconds)`
- **Auto-retrying assertions:** `await expect(element).toBeVisible()`

This ensures stable, flake-free screenshots.

## Testing

After generating screenshots, verify:

1. **FilterToolbar is visible** in grid screenshots
2. **Orange button highlighting** works in active filter state
3. **OrgTreeFilter shows hierarchy** with manager badges
4. **Search highlighting** is visible in both toolbar and tree
5. **Multiple selections** show checked checkboxes clearly

## Maintenance

### When to Update

Update these screenshots when:

- FilterToolbar UI/UX changes
- OrgTreeFilter component changes
- Filter state management changes
- Grid layout integration changes

### How to Update

1. Update the function in `filter-toolbar-app.ts`
2. Regenerate affected screenshots
3. Verify in documentation that screenshots look correct
4. Commit both workflow code and screenshot images

## Related Files

- **Workflow:** `frontend/playwright/screenshots/workflows/filter-toolbar-app.ts`
- **Config:** `frontend/playwright/screenshots/config.ts`
- **Components:**
  - `frontend/src/components/common/FilterToolbar.tsx`
  - `frontend/src/components/common/FilterToolbarContainer.tsx`
  - `frontend/src/components/dashboard/filters/OrgTreeFilter.tsx`
  - `frontend/src/components/grid/NineBoxGrid.tsx`
- **Requirements:** `resources/user-guide/SCREENSHOT_REQUIREMENTS.md`

## Notes

- All screenshots use **light theme** for consistency
- Screenshots use **sample data** for predictable results
- Proper **wait strategies** ensure stable generation
- Functions are **idempotent** - can be run multiple times safely
- **Error handling** captures failures and saves trace files for debugging
