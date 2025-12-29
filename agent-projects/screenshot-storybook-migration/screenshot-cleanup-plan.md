# Screenshot Cleanup Plan - Based on User Review

**Date:** 2025-12-29
**Source:** User review export (`screenshot-reviews-2025-12-29.json`)
**Total Screenshots:** 58
**Review Status:**
- ✅ Approved: 24
- ❌ Needs Work: 31
- ⚪ Unreviewed: 3

---

## Review Summary Statistics

| Status | Count | Percentage |
|--------|-------|------------|
| Approved | 24 | 41% |
| Needs Work | 31 | 53% |
| Unreviewed | 3 | 5% |

---

## Approved Screenshots (24) - Keep As-Is

1. ✅ `changes-orange-border` - Shows orange border on changed employee
2. ✅ `changes-timeline-view` - Timeline showing employee history
3. ✅ `changes-tab` - Changes tab in details panel
4. ✅ `filters-panel-expanded` - Filter drawer expanded view
5. ✅ `filters-multiple-active` - Multiple active filter chips
6. ✅ `calibration-donut-mode-grid` - Donut mode grid view
7. ✅ `intelligence-summary-anomalies` - Intelligence summary with anomalies
8. ✅ `intelligence-anomaly-details` - Detailed anomaly view
9. ✅ `intelligence-summary-excellent` - Excellent distribution summary
10. ✅ `intelligence-summary-needs-attention` - Needs attention summary
11. ✅ `intelligence-anomaly-green` - Green (good) anomaly indicator
12. ✅ `intelligence-anomaly-red` - Red (bad) anomaly indicator
13. ✅ `intelligence-level-distribution` - Distribution level chart
14. ✅ `statistics-panel-distribution` - Statistics distribution panel
15. ✅ `statistics-summary-cards` - Summary cards in stats panel
16. ✅ `employee-tile-normal` - Normal employee tile
17. ✅ `timeline-employee-history` - Employee history timeline
18. ✅ `distribution-chart-ideal` - Ideal distribution chart (note: use intelligence-anomaly-green instead)
19. ✅ `view-controls-grid-view` - Grid view controls
20. ✅ `view-controls-donut-view` - Donut view controls
21. ✅ `view-controls-settings-dialog` - Settings dialog
22. ✅ `view-controls-simplified-appbar` - Simplified app bar
23. ✅ `view-controls-fullscreen` - Fullscreen view controls
24. ✅ `employee-details-panel-expanded` - Expanded employee details panel
25. ✅ `details-reporting-chain-clickable` - Clickable reporting chain

---

## Phase 1: Remove Duplicates & Obsolete Screenshots (9 screenshots)

### 1.1 Duplicate Screenshots to Delete (6)

| Screenshot | Issue | Replacement | Action |
|-----------|-------|-------------|--------|
| `changes-panel-entries` | Duplicate of changes-tab | Use `changes-tab` | Delete from config.ts |
| `filters-overview` | Duplicate of filters-panel-expanded | Use `filters-panel-expanded` | Delete from config.ts |
| `quickstart-success-annotated` | Duplicate of quickstart-grid-populated | Use `quickstart-grid-populated` | Delete from config.ts |
| `calibration-filters-panel` | Reuse existing filter panel | Use `filters-panel-expanded` | Delete from config.ts |
| `details-flag-filtering` | Duplicate filter panel, doesn't show flag filtering | None needed | Delete from config.ts |
| `details-reporting-chain-filter-active` | Duplicate filter panel without management filtering | None needed | Delete from config.ts |

### 1.2 Screenshots to Replace with Text Documentation (3)

| Screenshot | Issue | Replacement | Action |
|-----------|-------|-------------|--------|
| `quickstart-excel-sample` | Excel file screenshot | Text table in docs showing required columns | Delete from config.ts, add table to docs |
| `calibration-export-results` | Excel export result | Text description of new columns added on export | Delete from config.ts, add text to docs |
| `hero-grid-sample` | Redundant hero image | Reuse existing app hero images | Delete from config.ts |

**Total Deletions:** 9 screenshots

---

## Phase 2: Fix Viewport/Clipping Issues (2 screenshots)

### Grid Clipping Problems

| Screenshot | Issue | Fix | File Location |
|-----------|-------|-----|---------------|
| `quickstart-grid-populated` | Bottom of 9-box grid cut off | Adjust viewport/screenshot bounds to show full grid | `workflows/quickstart.ts` |
| `grid-normal` | Grid clipped on bottom | Adjust viewport/screenshot bounds to show full 9 boxes | `workflows/grid.ts` or Storybook story |

**Fix Approach:**
- Increase screenshot viewport height
- Ensure entire grid (all 9 boxes) is visible
- May need to adjust Storybook story container or use full-page screenshot

---

## Phase 3: Fix Storybook Story References (10 screenshots)

### 3.1 Wrong Story Being Used

| Screenshot | Current Issue | Correct Story | File Location |
|-----------|---------------|---------------|---------------|
| `filters-active-chips` | Not using correct story | `dashboard-appbar-pureappbar--with-active-filters` | `workflows/filters-storybook.ts` |
| `filters-clear-all-button` | Using wrong story | `dashboard-filtersection--custom-content` | `workflows/filters.ts` |
| `calibration-donut-mode-toggle` | Using generic view instead of toggle controls | ViewControls storybook story (toggle only) | `workflows/calibration.ts` |
| `view-controls-main-interface` | Not using ViewControls story | ViewControls storybook story | `workflows/viewcontrols.ts` |
| `zoom-controls` | Showing generic zoom controls | Custom ViewControls toolbar story | `workflows/viewcontrols.ts` |
| `donut-mode-active-layout` | Using generic grid story | Donut grid story (box 5 centric) | `workflows/donut.ts` |

### 3.2 Story Not Working Correctly

| Screenshot | Issue | Fix | File Location |
|-----------|-------|-----|---------------|
| `quickstart-upload-dialog` | Story doesn't show upload dialog | Fix Storybook story to show FileUploadDialog | `workflows/quickstart.ts` or create story |
| `file-menu-apply-changes` | Doesn't show dropdown menu | Fix to capture menu expanded state | `workflows/exporting.ts` |
| `calibration-file-import` | Layout doesn't match actual app | Fix story layout/styling | `workflows/calibration.ts` |
| `details-flag-badges` | Doesn't show flag colors | Modify story to include colored flag badges | `workflows/details-panel-storybook.ts` |

---

## Phase 4: Create/Update Stories with New Data (6 screenshots)

### Stories Needing Content Updates

| Screenshot | Issue | Fix Required | File Location |
|-----------|-------|-------------|---------------|
| `changes-employee-details` | Doesn't show any changes for employee | Update story to show employee with changes | `workflows/changes.ts` |
| `notes-changes-tab-field` | Needs to highlight one change with cursor in notes | Update story: 1 change, cursor in notes field | `workflows/notes.ts` |
| `filters-flags-section` | Doesn't show flags section | Create new story showing flags in filter drawer | Create new story + workflow |
| `filters-reporting-chain` | Doesn't show reporting chain filter applied | Update story to show reporting chain filter active | `workflows/filters.ts` |
| `calibration-statistics-red-flags` | Needs skewed distribution | Update data to 40% high / 55% middle / 5% low | `workflows/calibration.ts` |
| `details-current-assessment` | Missing exterior padding | Add padding to story to match app | `workflows/details-panel-storybook.ts` |

---

## Phase 5: Fix Incorrect/Problematic Screenshots (3 screenshots)

### Screenshots to Investigate

| Screenshot | Issue | Investigation Needed | Recommended Action |
|-----------|-------|---------------------|-------------------|
| `intelligence-deviation-chart` | Image not meaningful, text may be incorrect | Review feature and documentation | Remove if not valuable, or fix text |
| `statistics-trend-indicators` | Feature doesn't exist, image incorrect | Confirm feature doesn't exist | Delete from config.ts |
| `statistics-grouping-indicators` | Doesn't show groupings | Check if duplicate of statistics-panel-distribution | Delete if duplicate, else fix story |

**Likely Outcome:** Delete 2-3 of these screenshots

---

## Phase 6: Manual Work (1 screenshot)

### Video/GIF Creation

| Screenshot | Issue | Fix Required | Complexity |
|-----------|-------|-------------|-----------|
| `changes-drag-sequence` | Needs to show drag operation | Capture drag operation as video, convert to GIF | High - manual video editing |

**Options:**
1. Create GIF using screen recording + video editing tools
2. Use Playwright video recording feature + ffmpeg conversion
3. Create multi-panel static image showing before/during/after states
4. Skip for now and mark as manual in config.ts

---

## Phase 7: Minor Adjustments (1 screenshot)

### Story Layout Fixes

| Screenshot | Issue | Fix | File Location |
|-----------|-------|-----|---------------|
| `details-flags-ui` | Story shown extra wide relative to other panels | Adjust story width to match other detail panels | `workflows/details-panel-storybook.ts` |

---

## Implementation Plan

### Step 1: Documentation Updates (Before Deletions)

Before deleting screenshots that need text replacements:

1. **Quickstart Excel Sample** → Add table to quickstart docs:
   ```markdown
   ## Required Excel Columns

   | Column Name | Type | Description |
   |------------|------|-------------|
   | Employee ID | Text | Unique identifier |
   | Name | Text | Full name |
   | Performance | Number (1-3) | Performance rating |
   | Potential | Number (1-3) | Potential rating |
   ```

2. **Calibration Export Results** → Add to calibration docs:
   ```markdown
   ## Export Columns

   When exporting after calibration, these columns are added:
   - Grid Position (e.g., "High Performer")
   - Flags (comma-separated)
   - Notes
   - Reporting Chain
   ```

### Step 2: Execute Deletions (Phase 1)

Update `config.ts` to remove 9 screenshot entries:
```typescript
// DELETE these entries:
- changes-panel-entries
- filters-overview
- quickstart-success-annotated
- calibration-filters-panel
- details-flag-filtering
- details-reporting-chain-filter-active
- quickstart-excel-sample
- calibration-export-results
- hero-grid-sample
```

Also delete 2-3 more from Phase 5 investigation (likely):
```typescript
- statistics-trend-indicators (confirmed doesn't exist)
- statistics-grouping-indicators (if duplicate)
- intelligence-deviation-chart (if not valuable)
```

**Total Deletions:** 9-12 screenshots

### Step 3: Fix Viewport Issues (Phase 2)

Update workflow functions to ensure full grid visibility:

**`workflows/quickstart.ts` - generateGridPopulated():**
```typescript
// Increase viewport or use full-page screenshot
await page.setViewportSize({ width: 1400, height: 1000 }); // Ensure enough height
// OR
await grid.screenshot({ path: outputPath, fullPage: true });
```

**`workflows/grid.ts` - generateGridNormal():**
```typescript
// Same fix - ensure full 9-box grid visible
```

### Step 4: Fix Story References (Phase 3)

Update workflow functions to use correct stories:

**Example - `workflows/filters-storybook.ts`:**
```typescript
// Change storyId for filters-active-chips
storyId: 'dashboard-appbar-pureappbar--with-active-filters'
```

**Example - `workflows/filters.ts`:**
```typescript
// Change storyId for filters-clear-all-button
storyId: 'dashboard-filtersection--custom-content'
```

### Step 5: Update Story Content (Phase 4)

Create new Storybook stories or update existing ones:

**Example - New story for `filters-flags-section`:**
```typescript
// Create new story in FilterSection.stories.tsx
export const WithFlagsExpanded: Story = {
  args: {
    flags: [
      { id: 'flight-risk', label: 'Flight Risk', color: '#f44336' },
      { id: 'high-performer', label: 'High Performer', color: '#4caf50' },
    ],
    expandedSections: ['flags'],
  },
};
```

### Step 6: Regenerate Screenshots

After all fixes:
```bash
cd frontend
npm run screenshots:generate
```

### Step 7: Re-Review

1. Open `resources/user-guide/SCREENSHOT_GALLERY.html`
2. Import updated reviews if needed
3. Verify all fixes
4. Mark as approved or iterate

---

## Execution Checklist

### Phase 1: Deletions (15 min)
- [ ] Add Excel table to quickstart docs
- [ ] Add export columns text to calibration docs
- [ ] Delete 9 screenshot entries from config.ts
- [ ] Delete corresponding workflow functions
- [ ] Investigate and delete 2-3 from Phase 5
- [ ] Run `npm run screenshots:generate` to verify no errors

### Phase 2: Viewport Fixes (15 min)
- [ ] Fix `quickstart-grid-populated` viewport
- [ ] Fix `grid-normal` viewport
- [ ] Test both screenshots show full 9-box grid

### Phase 3: Story Reference Updates (30-45 min)
- [ ] Update `filters-active-chips` story reference
- [ ] Update `filters-clear-all-button` story reference
- [ ] Update `calibration-donut-mode-toggle` story reference
- [ ] Update `view-controls-main-interface` story reference
- [ ] Update `zoom-controls` story reference
- [ ] Update `donut-mode-active-layout` story reference
- [ ] Fix `quickstart-upload-dialog` story
- [ ] Fix `file-menu-apply-changes` menu capture
- [ ] Fix `calibration-file-import` layout
- [ ] Fix `details-flag-badges` colors

### Phase 4: Story Content Updates (1-2 hours)
- [ ] Update `changes-employee-details` story
- [ ] Update `notes-changes-tab-field` story
- [ ] Create `filters-flags-section` story
- [ ] Update `filters-reporting-chain` story
- [ ] Update `calibration-statistics-red-flags` data
- [ ] Fix `details-current-assessment` padding

### Phase 5: Investigation & Fixes (30-45 min)
- [ ] Review `intelligence-deviation-chart` - keep or delete
- [ ] Delete `statistics-trend-indicators` (confirmed non-existent feature)
- [ ] Review `statistics-grouping-indicators` - fix or delete

### Phase 6: Manual Work (TBD)
- [ ] `changes-drag-sequence` - video/GIF creation (optional for now)

### Phase 7: Minor Adjustments (5 min)
- [ ] Fix `details-flags-ui` width

### Final Steps
- [ ] Regenerate all screenshots: `npm run screenshots:generate`
- [ ] Review in gallery
- [ ] Update review JSON with new statuses
- [ ] Commit changes

---

## Expected Outcome

After completion:
- **Screenshots Deleted:** 9-12
- **Screenshots Fixed:** 19-21
- **Manual Screenshot:** 1 (deferred)
- **Final Total:** 46-49 automated screenshots
- **Approval Rate Target:** 95%+

---

## Notes

- Focus on quality over quantity - better to have 46 great screenshots than 58 mediocre ones
- Some "duplicates" may be intentional for different contexts - verify before deleting
- Test all changes by regenerating screenshots before committing
- Keep review JSON for reference and future iterations
