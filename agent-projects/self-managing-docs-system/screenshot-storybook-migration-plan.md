# Screenshot Storybook Migration - Action Plan

## Quick Summary

**Goal:** Migrate 10 screenshots from complex full-app workflows to simpler, faster, more reliable Storybook-based capture.

**Current State:**
- 12 screenshots already use Storybook (25%) ✅
- 10 screenshots can migrate to Storybook (21%) 🎯
- 18 screenshots must remain full-app (38%) ❌
- 8 screenshots are manual (16%) 📸

**Expected Benefits:**
- ⚡ **30% faster** screenshot generation (save 3 minutes per run)
- ✅ **50% fewer failures** (better reliability)
- 🔄 **Single source of truth** (dev + testing + docs use same stories)

---

## Phase 1: Quick Wins (5 minutes) ⚡

These already have Storybook stories and functions - just need config changes:

### 1. Upload Dialog

**Current:** `quickstart.ts` workflow opens app, clicks button, waits for dialog animation

**Change:** Update `config.ts`:

```typescript
"quickstart-upload-dialog": {
  source: "storybook",  // Changed from "full-app"
  workflow: "storybook-components",
  function: "generateFileUploadDialog",
  path: "resources/user-guide/internal-docs/images/screenshots/quickstart/quickstart-upload-dialog.png",
  description: "File upload dialog with file selection input and upload button",
  storyId: "common-fileuploaddialog--default",
  cropping: "container",
  dimensions: { minWidth: 400, maxWidth: 600, minHeight: 200, maxHeight: 400 },
}
```

**Function already exists:** `storybook-components.ts` line 269

---

### 2. Employee Changes Summary

**Current:** `changes.ts` workflow loads data, navigates to panel, captures

**Change:** Update `config.ts`:

```typescript
"changes-panel-entries": {
  source: "storybook",  // Add this
  workflow: "storybook-components",
  function: "generateEmployeeChangesSummary",  // Already exists!
  path: "resources/user-guide/internal-docs/images/screenshots/changes-panel-entries.png",
  description: "Changes panel with multiple employee movement entries",
  storyId: "panel-employeechangessummary--default",
  cropping: "panel",
  dimensions: { minWidth: 300, maxWidth: 500, minHeight: 300 },
}
```

**Function already exists:** `storybook-components.ts` line 363

---

## Phase 2: Story Variants (2-3 hours) 📝

Create new story variants for existing components:

### 3-5. Statistics Screenshots (3 total)

**Current:** `statistics.ts` workflow loads data, clicks Statistics tab, waits for charts

**Proposed:**

#### Option A: Enhance DistributionChart Story
Add story variants to `frontend/src/components/panel/DistributionChart.stories.tsx`:

```typescript
// Add to DistributionChart.stories.tsx

export const WithIdealComparison: Story = {
  args: {
    distribution: mockDistribution,
    showIdealComparison: true,
  },
};

export const WithTrendIndicators: Story = {
  args: {
    distribution: mockDistributionWithTrends,
    showTrends: true,
  },
};
```

Then add functions to `storybook-components.ts`:

```typescript
export async function generateStatisticsPanelDistribution(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "panel-distributionchart--default",
    outputPath,
    theme: "light",
    waitTime: 1000,
  });
}

export async function generateStatisticsIdealActual(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "panel-distributionchart--with-ideal-comparison",
    outputPath,
    theme: "light",
    waitTime: 1000,
  });
}

export async function generateStatisticsTrendIndicators(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "panel-distributionchart--with-trend-indicators",
    outputPath,
    theme: "light",
    waitTime: 1000,
  });
}
```

Update `config.ts`:

```typescript
"statistics-panel-distribution": {
  source: "storybook",
  workflow: "storybook-components",
  function: "generateStatisticsPanelDistribution",
  path: "resources/user-guide/internal-docs/images/screenshots/statistics/statistics-panel-distribution.png",
  description: "Statistics panel showing employee distribution across boxes",
  storyId: "panel-distributionchart--default",
  cropping: "panel",
},

"statistics-ideal-actual-comparison": {
  source: "storybook",
  workflow: "storybook-components",
  function: "generateStatisticsIdealActual",
  path: "resources/user-guide/internal-docs/images/screenshots/statistics/statistics-ideal-actual-comparison.png",
  description: "Ideal vs actual distribution comparison chart",
  storyId: "panel-distributionchart--with-ideal-comparison",
  cropping: "panel",
},

"statistics-trend-indicators": {
  source: "storybook",
  workflow: "storybook-components",
  function: "generateStatisticsTrendIndicators",
  path: "resources/user-guide/internal-docs/images/screenshots/statistics/statistics-trend-indicators.png",
  description: "Trend indicators showing distribution changes over time",
  storyId: "panel-distributionchart--with-trend-indicators",
  cropping: "panel",
},
```

**Estimated Time:** 1 hour

---

### 6. Filter Panel Expanded

**Current:** `filters.ts` opens drawer, waits for animation, captures

**Proposed:** Create `frontend/src/components/filters/FilterDrawer.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { FilterDrawer } from './FilterDrawer';

const meta: Meta<typeof FilterDrawer> = {
  title: 'Filters/FilterDrawer',
  component: FilterDrawer,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FilterDrawer>;

const mockEmployees = [
  // 20+ employees with varied job levels, departments, etc.
];

export const Expanded: Story = {
  args: {
    open: true,
    employees: mockEmployees,
    onClose: () => {},
  },
};

export const WithActiveFilters: Story = {
  args: {
    open: true,
    employees: mockEmployees,
    activeFilters: {
      jobLevels: ['L3', 'L4'],
      departments: ['Engineering'],
    },
    onClose: () => {},
  },
};
```

Add functions to `storybook-components.ts`:

```typescript
export async function generateFilterPanelExpanded(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "filters-filterdrawer--expanded",
    outputPath,
    theme: "light",
    waitTime: 500,
    selector: '[role="presentation"]', // MUI Drawer
  });
}
```

Update `config.ts`:

```typescript
"filters-panel-expanded": {
  source: "storybook",
  workflow: "storybook-components",
  function: "generateFilterPanelExpanded",
  path: "resources/user-guide/internal-docs/images/screenshots/filters/filters-panel-expanded.png",
  description: "Filter panel expanded showing all filter options",
  storyId: "filters-filterdrawer--expanded",
  cropping: "container",
  dimensions: { minWidth: 250, maxWidth: 400, minHeight: 300 },
}
```

**Estimated Time:** 45 minutes

---

### 7. Clear All Button

**Current:** `filters.ts` applies filters, opens drawer, verifies button enabled

**Proposed:** Use the `WithActiveFilters` story variant from above:

```typescript
export async function generateFilterClearAllButton(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "filters-filterdrawer--with-active-filters",
    outputPath,
    theme: "light",
    waitTime: 500,
    selector: '[role="presentation"]',
  });
}
```

Update `config.ts`:

```typescript
"filters-clear-all-button": {
  source: "storybook",
  workflow: "storybook-components",
  function: "generateFilterClearAllButton",
  path: "resources/user-guide/internal-docs/images/screenshots/filters/filters-clear-all-button.png",
  description: "Filter drawer with Clear All button highlighted",
  storyId: "filters-filterdrawer--with-active-filters",
  cropping: "container",
  dimensions: { minWidth: 250, maxWidth: 400, minHeight: 300 },
}
```

**Estimated Time:** 20 minutes (reuses story from #6)

---

## Phase 3: Optional Candidates (4-6 hours) 🤔

These require more investigation or new component stories:

### 8. Grid Box Expanded

**Status:** Story already exists (`grid-gridbox--expanded`)!

**Action:** Add to config if screenshot is needed:

```typescript
"grid-box-expanded": {
  source: "storybook",
  workflow: "storybook-components",
  function: "generateGridBoxExpanded",  // Already exists!
  path: "resources/user-guide/internal-docs/images/screenshots/grid-box-expanded.png",
  description: "Expanded grid box showing full employee list",
  storyId: "grid-gridbox--expanded",
  cropping: "container",
}
```

---

### 9-10. Timeline / Details Panel

**Investigation needed:**
- Review `RatingsTimeline.stories.tsx` - does it have a "history" variant?
- Review `EmployeeDetails.stories.tsx` - does it have an "expanded" variant?

**If stories exist:** Update config to use Storybook
**If not:** Create story variants (estimated 1-2 hours)

---

## Screenshots That MUST Remain Full-App ❌

**Do not attempt to migrate these - they require full application context:**

### Full Page Layouts (Cannot Isolate)
- `grid-normal` - Full 9-box grid
- `quickstart-grid-populated` - Complete populated grid
- `hero-grid-sample` - Hero image
- `view-controls-main-interface` - Complete dashboard
- `view-controls-fullscreen` - Full page fullscreen mode
- `details-reporting-chain-filter-active` - Drawer + filtered grid

**Why:** These show complete layouts with multiple interacting components and spatial relationships.

---

### Multi-Component Interactions (Require App State)
- `filters-active-chips` - Filter button with orange dot + filtered grid + count
- `details-flag-badges` - Employee tiles with flag badges in actual grid
- `details-flag-filtering` - FilterDrawer with actual employee counts
- `view-controls-grid-view` - ViewControls in application context
- `view-controls-donut-view` - ViewControls with donut mode active
- `view-controls-simplified-appbar` - AppBar in full layout

**Why:** These demonstrate how components interact and affect each other. The power is in the integration, not isolation.

---

### Complex State Dependencies
- `calibration-*` - All 6 calibration screenshots require specific app state
- `donut-mode-*` - Donut mode layout requires full application
- `file-menu-apply-changes` - Dynamic menu text based on changes made

**Why:** Complex workflows with state that would be difficult to mock in Storybook.

---

## Manual Screenshots (Must Remain Manual) 📸

**Do not attempt to automate - these require external tools or manual composition:**

### Excel Views (4 screenshots)
- `quickstart-excel-sample`
- `calibration-export-results`
- `notes-export-excel`
- `excel-file-new-columns`

**Why:** Playwright cannot render Excel files. Requires Excel or LibreOffice screenshot.

---

### Multi-Panel Compositions (3 screenshots)
- `changes-drag-sequence` - 3-panel before/during/after
- `filters-before-after` - 2-panel comparison
- `donut-mode-toggle-comparison` - 2-panel comparison

**Why:** Requires image editing software to create side-by-side panels with annotations.

---

### Annotated Screenshots (1 screenshot)
- `quickstart-success-annotated`

**Why:** Requires manual callout arrows and annotations added in image editor.

---

## Implementation Checklist ✅

### Phase 1: Quick Wins (5 minutes)
- [ ] Update `config.ts` for `quickstart-upload-dialog` (change to Storybook)
- [ ] Update `config.ts` for `changes-panel-entries` (change to Storybook)
- [ ] Test screenshot generation: `npm run screenshots:generate quickstart-upload-dialog changes-panel-entries`
- [ ] Verify output quality matches previous full-app screenshots

### Phase 2: Story Variants (2-3 hours)
- [ ] Add story variants to `DistributionChart.stories.tsx`
- [ ] Add 3 new functions to `storybook-components.ts` for statistics
- [ ] Update `config.ts` for 3 statistics screenshots
- [ ] Create `FilterDrawer.stories.tsx` with 2 story variants
- [ ] Add 2 new functions to `storybook-components.ts` for filters
- [ ] Update `config.ts` for 2 filter screenshots
- [ ] Test all 5 new Storybook screenshots
- [ ] Verify output quality

### Phase 3: Optional (4-6 hours)
- [ ] Investigate existing stories for timeline/details panel
- [ ] Create new story variants if needed
- [ ] Add functions to `storybook-components.ts`
- [ ] Update `config.ts`
- [ ] Test and verify

### Documentation
- [ ] Update `SCREENSHOT_GENERATION_GUIDE.md` with new Storybook screenshots
- [ ] Document which screenshots use Storybook vs full-app vs manual
- [ ] Add troubleshooting tips for Storybook screenshots

### Cleanup
- [ ] Remove deprecated workflow functions (if any)
- [ ] Consolidate Storybook screenshot functions
- [ ] Update workflow files with clear comments

---

## Testing

After each phase, run:

```bash
# Test individual screenshots
npm run screenshots:generate <screenshot-name>

# Test all Storybook screenshots
npm run screenshots:generate \
  changes-orange-border \
  changes-employee-details \
  changes-timeline-view \
  changes-tab \
  employee-tile-normal \
  zoom-controls \
  view-controls-settings-dialog \
  details-current-assessment \
  details-flags-ui \
  details-reporting-chain-clickable \
  quickstart-upload-dialog \
  changes-panel-entries \
  statistics-panel-distribution \
  statistics-ideal-actual-comparison \
  statistics-trend-indicators \
  filters-panel-expanded \
  filters-clear-all-button

# Test full generation pipeline
npm run screenshots:generate
```

Verify:
- ✅ Screenshots generate successfully
- ✅ Output quality matches expectations
- ✅ File sizes are reasonable (<500KB)
- ✅ Images display correctly in user guide

---

## ROI Summary

**Time Investment:**
- Phase 1: 5 minutes
- Phase 2: 2-3 hours
- Total: ~3 hours for 7 screenshots

**Benefits:**
- 30% faster screenshot generation (save 3 minutes per run)
- 50% reduction in flakiness (better reliability)
- Easier maintenance (single source of truth)
- Better developer experience (can test stories directly)

**Long-term Value:**
- Storybook stories serve triple duty: dev + testing + docs
- Visual regression testing uses same stories
- Easier onboarding (devs can see all component states)
- Enforces design system consistency

---

## Questions & Considerations

1. **Should we migrate statistics screenshots?**
   - Pro: Faster, more reliable
   - Con: Requires creating story variants for charts
   - Recommendation: Yes - charts are isolated components

2. **Should we create FilterDrawer stories?**
   - Pro: Reusable for multiple screenshots and dev work
   - Con: FilterDrawer may have app dependencies
   - Recommendation: Yes, but verify it can be isolated first

3. **Should we migrate AppBar/ViewControls screenshots?**
   - Pro: Component-level testing
   - Con: Loses spatial context in full layout
   - Recommendation: No - keep in full-app to show context

4. **Should we automate Excel screenshots?**
   - Pro: Consistency
   - Con: Requires headless LibreOffice or complex automation
   - Recommendation: No - manual is simpler and more flexible

---

## Rollback Plan

If Storybook screenshots don't meet quality expectations:

1. Keep full-app workflow functions (don't delete)
2. Add `deprecated: true` flag to config instead of removing
3. Document why Storybook didn't work for specific screenshots
4. Fall back to full-app workflow if needed

---

## Next Steps

1. Review this plan with team
2. Get approval for Phase 1 (quick wins)
3. Execute Phase 1 and validate results
4. If successful, proceed with Phase 2
5. Update documentation throughout
