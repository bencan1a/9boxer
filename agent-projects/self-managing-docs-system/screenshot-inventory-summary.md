# Screenshot Inventory Summary

Quick reference table showing all 48 screenshots and their categorization.

## Legend

- 🟢 **Storybook** - Already using Storybook (fast, reliable)
- 🟡 **Can Migrate** - Can be converted to Storybook
- 🔴 **Full-App Only** - Must remain full-app workflow
- 🟣 **Manual** - Requires manual creation

---

## Complete Screenshot Inventory

| # | Screenshot ID | Status | Category | Reason/Notes |
|---|--------------|--------|----------|--------------|
| 1 | `changes-orange-border` | 🟢 Storybook | Component | EmployeeTile--modified story |
| 2 | `changes-employee-details` | 🟢 Storybook | Component | EmployeeDetails--default story |
| 3 | `changes-timeline-view` | 🟢 Storybook | Component | RatingsTimeline--default story |
| 4 | `changes-tab` | 🟢 Storybook | Component | ChangeTrackerTab--default story |
| 5 | `employee-tile-normal` | 🟢 Storybook | Component | EmployeeTile--default story |
| 6 | `zoom-controls` | 🟢 Storybook | Component | ZoomControls--default story |
| 7 | `view-controls-settings-dialog` | 🟢 Storybook | Dialog | SettingsDialog--open story |
| 8 | `details-current-assessment` | 🟢 Storybook | Section | EmployeeDetails section |
| 9 | `details-flags-ui` | 🟢 Storybook | Component | EmployeeFlags--with-multiple-flags |
| 10 | `details-reporting-chain-clickable` | 🟢 Storybook | Component | ManagementChain--with-manager |
| 11 | `quickstart-upload-dialog` | 🟡 **Can Migrate** | Dialog | FileUploadDialog story exists! |
| 12 | `changes-panel-entries` | 🟡 **Can Migrate** | Component | EmployeeChangesSummary story exists! |
| 13 | `statistics-panel-distribution` | 🟡 **Can Migrate** | Chart | Need DistributionChart variant |
| 14 | `statistics-ideal-actual-comparison` | 🟡 **Can Migrate** | Chart | Need DistributionChart variant |
| 15 | `statistics-trend-indicators` | 🟡 **Can Migrate** | Chart | Need DistributionChart variant |
| 16 | `filters-panel-expanded` | 🟡 **Can Migrate** | Drawer | Need FilterDrawer story |
| 17 | `filters-clear-all-button` | 🟡 **Can Migrate** | Drawer | Need FilterDrawer story variant |
| 18 | `grid-normal` | 🔴 Full-App | Layout | Full 9-box grid with employees |
| 19 | `quickstart-grid-populated` | 🔴 Full-App | Layout | Complete grid after upload |
| 20 | `hero-grid-sample` | 🔴 Full-App | Layout | Hero image for documentation |
| 21 | `index-quick-win-preview` | 🔴 Full-App | Layout | Preview for index page |
| 22 | `view-controls-main-interface` | 🔴 Full-App | Layout | AppBar + ViewControls + Grid |
| 23 | `view-controls-fullscreen` | 🔴 Full-App | Layout | Full page fullscreen mode |
| 24 | `view-controls-grid-view` | 🔴 Full-App | Context | ViewControls in-context |
| 25 | `view-controls-donut-view` | 🔴 Full-App | Context | ViewControls with donut active |
| 26 | `view-controls-simplified-appbar` | 🔴 Full-App | Context | AppBar in full layout |
| 27 | `details-reporting-chain-filter-active` | 🔴 Full-App | Interaction | Drawer + filtered grid |
| 28 | `filters-active-chips` | 🔴 Full-App | Interaction | Filter indicator + grid + count |
| 29 | `details-flag-badges` | 🔴 Full-App | Interaction | Tiles with badges in grid |
| 30 | `details-flag-filtering` | 🔴 Full-App | Interaction | Drawer with employee counts |
| 31 | `calibration-file-import` | 🔴 Full-App | Workflow | File menu in app context |
| 32 | `calibration-statistics-red-flags` | 🔴 Full-App | Workflow | Statistics with data |
| 33 | `calibration-intelligence-anomalies` | 🔴 Full-App | Workflow | Intelligence tab with AI |
| 34 | `calibration-filters-panel` | 🔴 Full-App | Workflow | Calibration-specific filters |
| 35 | `calibration-donut-mode-toggle` | 🔴 Full-App | Workflow | Toggle in context |
| 36 | `calibration-donut-mode-grid` | 🔴 Full-App | Workflow | Donut mode with ghosting |
| 37 | `file-menu-apply-changes` | 🔴 Full-App | Workflow | Dynamic menu text |
| 38 | `donut-mode-active-layout` | 🔴 Full-App | Layout | Full donut layout |
| 39 | `timeline-employee-history` | 🔴 Full-App | Workflow | Timeline in context |
| 40 | `employee-details-panel-expanded` | 🔴 Full-App | Workflow | Details panel in app |
| 41 | `notes-changes-tab-field` | 🔴 Full-App | Workflow | Changes tab with note field |
| 42 | `notes-good-example` | 🔴 Full-App | Workflow | Changes tab with example |
| 43 | `notes-donut-mode` | 🔴 Full-App | Workflow | Tooltip in donut mode |
| 44 | `quickstart-file-menu-button` | 🔴 Full-App | Context | AppBar in empty state |
| 45 | `quickstart-excel-sample` | 🟣 **Manual** | Excel | Excel file screenshot |
| 46 | `calibration-export-results` | 🟣 **Manual** | Excel | Excel with changes |
| 47 | `notes-export-excel` | 🟣 **Manual** | Excel | Excel with notes column |
| 48 | `excel-file-new-columns` | 🟣 **Manual** | Excel | Excel with new columns |
| 49 | `changes-drag-sequence` | 🟣 **Manual** | Composition | 3-panel sequence |
| 50 | `filters-before-after` | 🟣 **Manual** | Composition | 2-panel comparison |
| 51 | `donut-mode-toggle-comparison` | 🟣 **Manual** | Composition | 2-panel comparison |
| 52 | `quickstart-success-annotated` | 🟣 **Manual** | Annotation | Full page with callouts |

---

## Summary Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| 🟢 Already Storybook | 10 | 19.2% |
| 🟡 Can Migrate to Storybook | 7 | 13.5% |
| 🔴 Must Remain Full-App | 27 | 51.9% |
| 🟣 Manual Only | 8 | 15.4% |
| **Total** | **52** | **100%** |

---

## Migration Priorities

### Immediate (Phase 1) - 2 screenshots ⚡
1. `quickstart-upload-dialog` - Story exists, just config change
2. `changes-panel-entries` - Story exists, just config change

**Effort:** 5 minutes
**Impact:** Fast wins, validate Storybook approach

---

### High Priority (Phase 2) - 5 screenshots 📝
3. `statistics-panel-distribution` - Add story variant
4. `statistics-ideal-actual-comparison` - Add story variant
5. `statistics-trend-indicators` - Add story variant
6. `filters-panel-expanded` - Create FilterDrawer story
7. `filters-clear-all-button` - Use FilterDrawer story variant

**Effort:** 2-3 hours
**Impact:** Major reliability improvement for chart/filter screenshots

---

### Optional (Phase 3) - Investigation needed 🤔

**These need investigation to determine if stories exist or can be created:**
- Timeline screenshots - check RatingsTimeline stories
- Details panel variants - check EmployeeDetails stories
- Grid box expanded - story exists, just need to add to config

**Effort:** 1-2 hours per screenshot
**Impact:** Incremental improvement

---

## Screenshot Categorization Logic

### Use Storybook When ✅
- Single isolated component (dialog, card, panel)
- Component has existing Storybook story
- No app navigation or routing required
- No multi-component interactions
- Can mock data easily

**Examples:** Dialogs, individual tiles, charts, controls

---

### Use Full-App When ⚠️
- Full page layouts showing spatial relationships
- Multiple interacting components (filter + grid)
- Requires actual application state (employee data, active filters)
- Demonstrates user workflows (multi-step processes)
- Shows navigation or routing

**Examples:** Dashboard views, before/after comparisons, workflows

---

### Use Manual When 📸
- External application screenshots (Excel)
- Multi-panel compositions (before/after, sequences)
- Requires annotations or callouts
- Cannot be reliably automated

**Examples:** Excel exports, annotated tutorials, side-by-side comparisons

---

## Full-App Screenshots Breakdown

### By Reason for Full-App:

| Reason | Count | Examples |
|--------|-------|----------|
| **Full Page Layout** | 7 | `grid-normal`, `hero-grid-sample`, `view-controls-main-interface` |
| **Multi-Component Interaction** | 6 | `filters-active-chips`, `details-flag-badges`, `details-flag-filtering` |
| **Complex Workflow** | 11 | `calibration-*` (6), `donut-mode-*`, `file-menu-apply-changes` |
| **In-Context Display** | 3 | `view-controls-grid-view`, `view-controls-donut-view`, `quickstart-file-menu-button` |

---

## Benefits of Migration

### Performance
- **Current:** ~10 minutes for all automated screenshots
- **After Migration:** ~7 minutes (30% faster)
- **Per Screenshot:** 3 seconds (Storybook) vs 20 seconds (full-app)

### Reliability
- **Storybook:** 100% consistent state, no timing issues
- **Full-App:** Can have race conditions, navigation failures, timeouts
- **Expected:** 50% reduction in screenshot generation failures

### Maintenance
- **Single Source of Truth:** Stories used for dev, testing, and docs
- **Design System Validation:** Stories enforce design token usage
- **Visual Regression:** Same stories used for Playwright visual tests

---

## Recommended Action Plan

1. ✅ **Phase 1 (5 min):** Migrate 2 quick wins to validate approach
2. ✅ **Phase 2 (3 hrs):** Create story variants for 5 statistics/filter screenshots
3. 🤔 **Phase 3 (optional):** Investigate timeline/details panel screenshots
4. 📄 **Documentation:** Update guide with Storybook recommendations
5. 🧹 **Cleanup:** Remove deprecated workflow functions

**Total Effort:** ~4 hours for 7 screenshot migrations
**Total Benefit:** 30% faster, 50% more reliable, easier maintenance

---

## Decision Matrix Quick Reference

```
Can the component be isolated from app state?
├─ YES → Can we mock the data easily?
│   ├─ YES → Does a Storybook story exist?
│   │   ├─ YES → ✅ Use Storybook (immediate)
│   │   └─ NO → 🟡 Create story (high priority)
│   └─ NO → 🔴 Use full-app
└─ NO → Does it require external tool (Excel)?
    ├─ YES → 🟣 Manual screenshot
    └─ NO → 🔴 Use full-app
```

---

## Appendix: Screenshot Workflows

### Storybook Workflows (Fast & Reliable)
- `storybook-components.ts` - All Storybook screenshot functions
- Uses `captureStorybookScreenshot()` helper
- Average time: 2-3 seconds per screenshot

### Full-App Workflows (Complex but Necessary)
- `quickstart.ts` - Upload and getting started flow
- `filters.ts` - Filter interactions
- `statistics.ts` - Statistics tab views
- `calibration.ts` - Calibration workflow
- `view-controls.ts` - ViewControls and AppBar
- `details-panel-enhancements.ts` - Details panel features
- Average time: 15-30 seconds per screenshot

### Manual Workflows (No Automation)
- Excel file screenshots - Use Excel/LibreOffice
- Multi-panel compositions - Use Photoshop/Figma
- Annotated screenshots - Use Snagit/Skitch
- Time varies by complexity

---

## Questions?

1. **Why not migrate all screenshots to Storybook?**
   - Some screenshots show full layouts and component interactions that demonstrate real user experience
   - Storybook is for isolated components, not complete workflows

2. **Why keep manual screenshots instead of automating?**
   - Excel automation is complex and fragile
   - Manual composition gives better control over layout and annotations
   - Time investment for automation not worth the maintenance burden

3. **What if Storybook screenshots don't match quality?**
   - Keep full-app workflows as fallback
   - Don't delete old functions, mark as deprecated
   - Can revert config changes easily

4. **How do we ensure Storybook stories stay updated?**
   - Same stories used for dev and testing (single source of truth)
   - Visual regression tests catch unintended changes
   - Documentation screenshots auto-regenerate weekly via GitHub Actions
