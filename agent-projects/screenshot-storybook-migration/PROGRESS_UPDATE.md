# Screenshot Cleanup Progress Update
Date: 2025-12-28

## Completed Phases ✅

### Phase 1: Remove Duplicate Screenshots (COMPLETE)
Removed 11 duplicate/obsolete screenshots from config.ts:
- quickstart-success-annotated (duplicate of quickstart-grid-populated)
- calibration-filters-panel (reuse filters-panel-expanded)
- calibration-export-results (replace with text description)
- statistics-trend-indicators (feature doesn't exist)
- statistics-grouping-indicators (duplicate)
- hero-grid-sample (reuse existing app hero images)
- changes-panel-entries (duplicate of changes-tab)
- quickstart-excel-sample (replace with text table)
- details-flag-filtering (duplicate)
- details-reporting-chain-filter-active (duplicate)
- filters-overview (duplicate of filters-panel-expanded)

### Phase 2: Fix Viewport/Clipping Issues (COMPLETE)
Fixed viewport settings for grid screenshots to show full 9 boxes:
- **quickstart-grid-populated** - Added viewport size (1200x1000) in `storybook-components.ts::generateGridPopulated()`
- **grid-normal** - Same fix (uses same function)
- **donut-mode-active-layout** - Added viewport size in `storybook-components.ts::generateDonutModeActive()`

### Phase 3: Update Storybook Story References (COMPLETE)
Updated 6 screenshots to use correct Storybook stories:

1. **filters-active-chips**
   - Changed from: full-app workflow
   - Changed to: Storybook `dashboard-appbar-pureappbar--with-active-filters`
   - Added: `generateActiveChips()` in filters-storybook.ts

2. **filters-clear-all-button**
   - Changed from: `dashboard-filterdrawer--multiple-filters-active`
   - Changed to: `dashboard-filtersection--custom-content`
   - Updated: `generateFilterDrawerClearAll()` in filters-storybook.ts

3. **calibration-donut-mode-toggle**
   - Changed from: full-app workflow
   - Changed to: Storybook `common-viewcontrols--donut-view-active`
   - Reuses: `generateViewControlsDonutView()` from storybook-components.ts

4. **view-controls-main-interface**
   - Changed from: full-app workflow
   - Changed to: Storybook `common-viewcontrols--grid-view-active`
   - Reuses: `generateViewControlsGridView()` from storybook-components.ts

5. **zoom-controls**
   - Changed from: Generic `common-zoomcontrols--default`
   - Changed to: ViewControls `common-viewcontrols--grid-view-active`
   - Reuses: `generateViewControlsGridView()` from storybook-components.ts

6. **file-menu-apply-changes**
   - Changed from: `dashboard-appbar-filemenubutton--with-changes` (button only)
   - Changed to: `dashboard-appbar-filemenubutton--menu-open-with-changes` (menu dropdown)
   - Added: `generateFileMenuApplyChanges()` in storybook-components.ts

## Pending Phases (Require Storybook Story Modifications)

### Phase 4: Update Story Content (REQUIRES REACT/TYPESCRIPT WORK)
These screenshots need Storybook story modifications (editing .stories.tsx files):

1. **changes-employee-details** - Story needs to show changes for the employee
2. **notes-changes-tab-field** - Story needs to highlight one change with cursor in notes field
3. **filters-flags-section** - Need to create new story showing flags in filter drawer
4. **filters-reporting-chain** - Story needs to show reporting chain filter applied
5. **calibration-statistics-red-flags** - Story data needs 40%/55%/5% distribution
6. **details-current-assessment** - Story needs exterior padding
7. **calibration-file-import** - Story layout needs to match actual app
8. **details-flag-badges** - Story needs to show flag colors
9. **quickstart-upload-dialog** - Story needs to show upload dialog (verify if issue persists)
10. **donut-mode-active-layout** - Verify if story shows correct box-5-centric donut grid

**Action Required**: These require editing React component story files (.stories.tsx) to create new stories or modify existing ones with correct data/props/styling.

### Phase 5: Investigate Problematic Screenshots
- **intelligence-deviation-chart** - Review if meaningful/correct
- Already addressed deletions in Phase 1

### Phase 6: Minor Adjustments
- **details-flags-ui** - Adjust story width to match other detail panels

## Summary

**Total Screenshot Changes:**
- Deleted: 11 screenshots
- Fixed viewport: 3 screenshots
- Updated story references: 6 screenshots
- **Remaining work: 11 screenshots requiring Storybook story modifications**

**Files Modified:**
- `frontend/playwright/screenshots/config.ts` - Screenshot config updates
- `frontend/playwright/screenshots/workflows/storybook-components.ts` - Viewport fixes + new functions
- `frontend/playwright/screenshots/workflows/filters-storybook.ts` - New function + story update

**Next Steps:**
1. Regenerate screenshots to validate Phase 1-3 fixes
2. Address Phase 4-6 items (requires React/TypeScript Storybook work)
3. Final review and commit
