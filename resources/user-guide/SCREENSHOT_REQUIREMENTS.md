# Screenshot Requirements for FilterToolbar & Filter Drawer Updates

This document tracks all screenshot updates needed for the `copilot/add-filtering-toolbar` branch changes.

## Overview

The filtering UI has been significantly enhanced with:
- **New FilterToolbar** - Floating toolbar at top-left of grid
- **Replaced ReportingChainFilter** with **OrgTreeFilter** - Hierarchical org tree in FilterDrawer
- **Employee Search** - Fuzzy search with text highlighting

---

## 🔴 CRITICAL: Screenshots to DELETE

### 1. ❌ `images/screenshots/filters/reporting-chain-filter.png`
**Status:** OBSOLETE - Feature removed
**Reason:** The "Reporting Chain Filter" chip UI no longer exists. It was replaced by the hierarchical OrgTreeFilter in the FilterDrawer.
**Action:** Delete this file and confirm no other documentation references it.

---

## 🟢 NEW: Screenshots to CREATE (Priority 1)

### FilterToolbar Screenshots

#### 1. `images/screenshots/toolbar/filter-toolbar-expanded.png`
**Purpose:** Show the FilterToolbar in expanded state with all features visible
**Content Required:**
- Filter button (not highlighted - no active filters)
- Employee count display (e.g., "200 employees")
- Collapse/expand chevron icon
- Positioned at top-left of grid, above vertical axis
- Light theme

**Test Setup:**
```typescript
// Playwright test
await page.goto('/dashboard');
await page.waitForSelector('.filter-toolbar');
// Ensure toolbar is expanded
// Ensure no filters are active
await page.screenshot({ path: 'toolbar/filter-toolbar-expanded.png' });
```

#### 2. `images/screenshots/toolbar/filter-toolbar-with-active-filters.png`
**Purpose:** Show FilterToolbar with active filters and highlighted button
**Content Required:**
- Filter button highlighted in ORANGE/SECONDARY color
- Employee count showing filtered subset (e.g., "75 of 200 employees")
- Active filter summary visible (e.g., "Level: IC5, IC6")
- Tooltip on hover showing full filter details (optional)
- Light theme

**Test Setup:**
```typescript
// Apply some filters first
await filterStore.setFilters({ levels: ['IC5', 'IC6'] });
await page.waitForSelector('.filter-toolbar .filter-button.active');
await page.screenshot({ path: 'toolbar/filter-toolbar-with-active-filters.png' });
```

#### 3. `images/screenshots/toolbar/filter-toolbar-search-autocomplete.png`
**Purpose:** Show employee search dropdown with highlighted matches
**Content Required:**
- Search input field with text entered (e.g., "sarah")
- Autocomplete dropdown visible below
- Multiple search results (up to 10)
- Matched text highlighted with `<mark>` elements (orange background)
- Search results showing name, job level, and manager
- Light theme

**Test Setup:**
```typescript
await page.fill('.filter-toolbar .search-input', 'sarah');
await page.waitForSelector('.search-results');
await page.screenshot({ path: 'toolbar/filter-toolbar-search-autocomplete.png' });
```

---

### OrgTreeFilter Screenshots

#### 4. `images/screenshots/filters/org-tree-filter-expanded.png`
**Purpose:** Show the hierarchical organization tree in FilterDrawer
**Content Required:**
- FilterDrawer open
- "Managers" section expanded
- Organization tree showing at least 2-3 levels of hierarchy
- Manager names with team size badges (e.g., "Sarah Chen (12)")
- Expand/collapse icons visible
- Checkboxes for manager selection
- Light theme

**Test Setup:**
```typescript
await page.click('[data-testid="filter-button"]');
await page.waitForSelector('.filter-drawer');
await page.click('[data-testid="managers-section-toggle"]');
await page.waitForSelector('.org-tree-filter');
// Expand some tree nodes
await page.screenshot({ path: 'filters/org-tree-filter-expanded.png' });
```

#### 5. `images/screenshots/filters/org-tree-filter-search.png`
**Purpose:** Show search functionality within the org tree with highlighted matches
**Content Required:**
- FilterDrawer open with Managers section
- Search input field with text entered (e.g., "chen")
- Matching manager names highlighted
- Tree auto-expanded to show matching descendants
- "No managers found" state if no matches (optional second screenshot)
- Light theme

**Test Setup:**
```typescript
await page.fill('.org-tree-filter .search-input', 'chen');
await page.waitForSelector('.org-tree-filter .highlighted-text');
await page.screenshot({ path: 'filters/org-tree-filter-search.png' });
```

#### 6. `images/screenshots/filters/org-tree-multi-select.png`
**Purpose:** Show multiple managers selected with checkboxes
**Content Required:**
- FilterDrawer open with Managers section
- At least 2-3 managers checked (at different hierarchy levels)
- Active filter summary at top of drawer showing selected managers
- Checked checkboxes clearly visible
- Light theme

**Test Setup:**
```typescript
await page.click('[data-manager-id="manager-1"] .checkbox');
await page.click('[data-manager-id="manager-2"] .checkbox');
await page.waitForSelector('.filter-summary');
await page.screenshot({ path: 'filters/org-tree-multi-select.png' });
```

---

## 🟡 VERIFY: Existing Screenshots to Review/Update (Priority 2)

These screenshots may need updates if they don't show the new FilterToolbar:

### Grid Screenshots

#### 7. `images/screenshots/grid/grid-basic-layout.png`
**Check:** Does it show the FilterToolbar at top-left?
**If No:** Update to include FilterToolbar in collapsed or expanded state

#### 8. `images/screenshots/filters/filters-panel-expanded.png`
**Check:** Does it show the new OrgTreeFilter instead of old ReportingChainFilter?
**If No:** Update to show current FilterDrawer with hierarchical org tree

#### 9. `images/screenshots/filters/filters-active-indicator.png`
**Check:** Does it show the orange highlighted filter button in FilterToolbar?
**If No:** Update to show current active filter indicator on toolbar

#### 10. `images/screenshots/filters/filters-logic-and-example.png`
**Check:** Does it reference old UI patterns?
**If No:** Verify it shows current FilterDrawer layout

#### 11. `images/screenshots/filters/filters-logic-or-example.png`
**Check:** Does it reference old UI patterns?
**If No:** Verify it shows current FilterDrawer layout

### Documentation Workflow Screenshots

All screenshots showing the 9-box grid should ideally include the FilterToolbar for visual consistency:

- `quickstart/quickstart-grid-populated.png`
- `workflow/workflow-grid-axes-labeled.png`
- `view-controls/view-controls-grid.png`
- `intelligence/intelligence-tab-location.png`
- `statistics/statistics-panel-distribution.png`
- And approximately ~100 other screenshots in the user guide

**Recommendation:** Spot-check 5-10 key workflow screenshots. If they look visually outdated without the FilterToolbar, consider batch regeneration.

---

## 📋 Screenshot Generation Strategy

### Automated Generation (Recommended)

Create Playwright visual tests in `frontend/playwright/visual/` to automate screenshot generation:

```typescript
// filters-toolbar.spec.ts
test.describe('FilterToolbar Screenshots', () => {
  test('toolbar-expanded', async ({ page }) => {
    await setupCleanState(page);
    await page.goto('/dashboard');
    await expect(page.locator('.filter-toolbar')).toBeVisible();
    await page.screenshot({
      path: 'docs/screenshots/toolbar/filter-toolbar-expanded.png',
      clip: { x: 0, y: 100, width: 400, height: 200 }
    });
  });

  test('toolbar-with-active-filters', async ({ page }) => {
    await setupFilters(page, { levels: ['IC5', 'IC6'] });
    await page.goto('/dashboard');
    await expect(page.locator('.filter-button.active')).toBeVisible();
    await page.screenshot({
      path: 'docs/screenshots/toolbar/filter-toolbar-with-active-filters.png',
      clip: { x: 0, y: 100, width: 400, height: 200 }
    });
  });

  // ... etc
});
```

### Manual Generation (If Needed)

1. Run the application locally: `npm run dev`
2. Navigate to the specific state/view
3. Use browser DevTools to screenshot specific elements
4. Crop and optimize images
5. Save to appropriate `images/screenshots/` subdirectory

---

## 🎨 Screenshot Standards

All new screenshots should follow these guidelines:

- **Theme:** Light theme (default) unless specifically documenting dark mode
- **Resolution:** High-DPI (2x or 3x for retina displays)
- **Format:** PNG with transparency where applicable
- **Cropping:** Tightly cropped to relevant UI area (no excessive whitespace)
- **Annotations:** None - screenshots should show clean UI
- **Consistency:** Use same sample data across related screenshots
- **Accessibility:** Ensure text is clearly readable at documentation display size

---

## 📊 Status Tracking

| Screenshot | Status | Priority | Assigned To | Notes |
|------------|--------|----------|-------------|-------|
| `reporting-chain-filter.png` | 🔴 DELETE | P0 | - | Obsolete feature |
| `toolbar/filter-toolbar-expanded.png` | ⬜ TODO | P1 | - | New feature |
| `toolbar/filter-toolbar-with-active-filters.png` | ⬜ TODO | P1 | - | New feature |
| `toolbar/filter-toolbar-search-autocomplete.png` | ⬜ TODO | P1 | - | New feature |
| `filters/org-tree-filter-expanded.png` | ⬜ TODO | P1 | - | New feature |
| `filters/org-tree-filter-search.png` | ⬜ TODO | P1 | - | New feature |
| `filters/org-tree-multi-select.png` | ⬜ TODO | P1 | - | New feature |
| `filters/filters-panel-expanded.png` | ⬜ VERIFY | P2 | - | May need update |
| `grid/grid-basic-layout.png` | ⬜ VERIFY | P2 | - | Should show toolbar |
| Other grid screenshots (~100+) | ⬜ REVIEW | P3 | - | Spot-check needed |

---

## 🚀 Next Steps

1. **Immediate (P0):**
   - [ ] Delete `reporting-chain-filter.png`
   - [ ] Confirm no documentation references the deleted screenshot

2. **High Priority (P1):**
   - [ ] Create automated Playwright tests for 7 new screenshots
   - [ ] Generate all 7 new screenshots
   - [ ] Add screenshots to documentation repository

3. **Medium Priority (P2):**
   - [ ] Review and verify 5 key existing screenshots
   - [ ] Update screenshots that show outdated UI

4. **Low Priority (P3):**
   - [ ] Spot-check remaining ~100 screenshots
   - [ ] Create backlog for batch screenshot regeneration if needed

---

## 📝 Notes

- All screenshot placeholders have already been added to documentation by Agent 1
- Documentation is ready to merge once screenshots are generated
- Consider creating a Playwright screenshot workflow that can be run on-demand
- May want to add dark mode variants for all new screenshots in the future

---

**Last Updated:** 2026-01-04
**Related Branch:** `copilot/add-filtering-toolbar`
**Documentation Agent:** Agent 6 (Screenshot Requirements)
