# Screenshot Storybook Migration Project

**Status:** active
**Owner:** Claude
**Created:** 2025-12-28
**Summary:**
- Convert 31 full-app screenshots to Storybook component stories
- Eliminate 12 unnecessary screenshots (4 automated + 8 manual)
- Create/fix component stories as needed
- Update documentation to remove screenshots and improve prose

---

## Goals

1. **Performance:** Reduce screenshot generation time from 6-8 minutes to 1-2 minutes (75% faster)
2. **Automation:** Eliminate all 8 manual screenshots (100% automated)
3. **Maintainability:** Single source of truth for component visuals (Storybook)
4. **Quality:** More reliable screenshots (no app startup flakiness)

---

## Scope

### In Scope
- Convert 17 screenshots using existing stories (Category A)
- Fix/create 5 new story variants (Category B)
- Create ViewControls Storybook stories (Category C)
- Eliminate 12 screenshots with doc improvements (Category D)
- Merge hero screenshots (Category E)

### Out of Scope
- Visual design changes to components
- Functionality changes to application
- New features or component behavior

---

## Success Criteria

**Quantitative:**
- [ ] 31 screenshots converted from full-app to Storybook
- [ ] 12 screenshots eliminated
- [ ] Screenshot generation time: <2 minutes (from 6-8 minutes)
- [ ] 0 manual screenshots (from 8)
- [ ] All automated screenshots pass visual regression tests

**Qualitative:**
- [ ] Documentation improved with better prose descriptions
- [ ] Screenshots accurately represent component states
- [ ] Theme support (light/dark) works for all Storybook screenshots
- [ ] No "new interface" language in documentation

---

## Architecture Decisions

### Decision 1: Storybook as Primary Screenshot Source
**Chosen:** Use Storybook component stories for isolated component screenshots
**Alternatives:** Continue with full-app workflows, use static image files
**Rationale:**
- 10x faster generation
- 100% reliable (no app state dependencies)
- Single source of truth (dev, testing, docs use same stories)
- Automatic theme variant support

### Decision 2: Eliminate Manual Screenshots
**Chosen:** Remove manual Excel screenshots, use text documentation instead
**Alternatives:** Keep manual screenshots, automate Excel screenshot capture
**Rationale:**
- Users understand Excel column formats without screenshots
- Text documentation is easier to maintain and translate
- Reduces maintenance burden

### Decision 3: Merge Hero Screenshots
**Chosen:** Merge `hero-grid-sample` and `index-quick-win-preview` into single screenshot
**Alternatives:** Keep separate, create new hero screenshot
**Rationale:** User confirmed these serve the same purpose

### Decision 4: Full-App for Fullscreen
**Chosen:** Keep `view-controls-fullscreen` as full-app screenshot
**Alternatives:** Use ViewControls component story
**Rationale:** User confirmed this should show entire app in fullscreen context

---

## Dependencies

### External Dependencies
- Storybook running on port 6006
- Playwright test infrastructure
- Frontend component library

### Internal Dependencies
- Phase 2 blocks: Need to fix NineBoxGrid stories before using them
- Phase 3 blocks: Need to fix FileMenuButton story dropdown positioning
- Phase 4 blocks: Need to create ViewControls.stories.tsx before using it

---

## Execution Plan

### Phase 1: Quick Wins - Category A (17 screenshots) ✅ COMPLETE
**Effort:** 2-3 hours (actual: ~3 hours)
**Parallelizable:** Yes (3 sub-tasks)
**Progress:** 17/17 screenshots converted (100% complete!)
- ✅ Phase 1A: FileMenuButton + FilterDrawer (11 screenshots)
- ✅ Phase 1B: Statistics + Intelligence (4 screenshots - split from 3)
- ✅ Phase 1C: Notes + EmployeeTile (2 screenshots)

**Summary:** See `phase-1-complete.md` for comprehensive overview of all Phase 1 work.

**Achievement:**
- 10x faster generation (240s → 20s for Category A)
- 100% reliability (isolated Storybook stories)
- 0 story modifications required (all used existing stories)
- 21 workflow functions created

#### Phase 1A: FileMenuButton + FilterDrawer
**Agent:** general-purpose
**Screenshots:** 11 total
- quickstart-file-menu-button
- file-menu-apply-changes
- filters-panel-expanded
- filters-clear-all-button
- calibration-filters-panel
- filters-overview (verify)
- filters-multiple-active (verify)
- filters-flags-section (verify)
- filters-reporting-chain (verify)
- filters-active-chips (verify existing config)

**Tasks:**
1. Verify FilterDrawer stories exist and are correct
2. Find FileMenuButton story (note: dropdown positioning issue exists)
3. Update config.ts entries
4. Create workflow functions in storybook-components.ts
5. Test screenshot generation

---

#### Phase 1B: Statistics + Intelligence
**Agent:** general-purpose
**Screenshots:** 3 total
- calibration-statistics-red-flags → DistributionTable skewed story
- calibration-intelligence-anomalies → Split into TWO screenshots:
  - intelligence-summary-anomalies → IntelligenceSummary needs-attention story
  - intelligence-anomaly-details → AnomalySection red-status story

**Tasks:**
1. Verify DistributionTable story exists
2. Verify IntelligenceSummary and AnomalySection stories exist
3. Update config.ts to split calibration-intelligence-anomalies into 2 entries
4. Create workflow functions
5. Test screenshot generation

---

#### Phase 1C: Notes + EmployeeTile ✅ COMPLETE
**Agent:** general-purpose
**Screenshots:** 2 total (both converted successfully)
- ✅ workflow-changes-add-note → ChangeTrackerTab grid-changes-only story (REUSES existing function)
- ✅ flag-badges → EmployeeTile with-flags story

**Completed Tasks:**
1. ✅ Verified ChangeTrackerTab GridChangesOnly story shows notes field (line 145-154)
2. ✅ Found EmployeeTile WithFlags story (line 235-244)
3. ✅ Updated config.ts for both screenshots:
   - notes-changes-tab-field: Reuses existing generateChangesTab() function
   - details-flag-badges: New generateEmployeeTileFlagged() function
4. ✅ Created generateEmployeeTileFlagged() workflow function
5. ✅ Tested both screenshots - generation successful (28KB + 3.2KB)

**Key Finding:** workflow-changes-add-note REUSES the same generateChangesTab() function already used by changes-panel-entries. Both screenshots use the same Storybook story (components-panel-changetrackertab--grid-changes-only).

---

### Phase 2: Fix NineBoxGrid Stories - Category B
**Effort:** 3-4 hours
**Parallelizable:** No (sequential story fixes)

#### Phase 2A: Fix Populated Story
**Agent:** general-purpose
**Screenshots:** 2 total (unlocks these)
- quickstart-grid-populated
- grid-normal

**Tasks:**
1. Read NineBoxGrid.stories.tsx
2. Fix `Populated` story:
   - Add mock employee data (import from test fixtures)
   - Ensure employees are distributed across grid positions
   - Verify design-system theme usage
3. Update config.ts entries
4. Create workflow functions
5. Test screenshot generation

---

#### Phase 2B: Fix Donut Mode Story
**Agent:** general-purpose
**Screenshots:** 1 total
- donut-mode-active-layout

**Tasks:**
1. Read NineBoxGrid.stories.tsx donut mode story
2. Fix `DonutMode` story:
   - Add employee with `modified_in_session: true`
   - Add ghost tile at original position
   - Ensure movement indicators are visible
3. Update config.ts entry
4. Create workflow function
5. Test screenshot generation

---

### Phase 3: Fix FileMenuButton Stories - Category B ✅ COMPLETE
**Effort:** 2-3 hours → **Actual: ~1 hour**
**Parallelizable:** No (story fixes first)
**Completed:** 2025-12-28

**Agent:** general-purpose
**Screenshots:** 1 total (file-menu-apply-changes was already done in Phase 1A)
- calibration-file-import ✅

**Tasks:**
1. ✅ Read FileMenuButton.stories.tsx
2. ✅ Fix existing `MenuOpen` story dropdown positioning issue
   - Added decorator with minHeight: 400px and proper styling
   - Fixed missing `onLoadSampleClick` prop in default args
3. ✅ Create hybrid workflow function:
   - `generateFileMenuImport()` in storybook-components.ts
   - Uses Storybook for menu open state + Playwright hover for highlight
   - No new story variant needed (MenuOpen story works perfectly)
4. ✅ Update config.ts entries
   - Changed source from "full-app" to "storybook"
   - Updated workflow to "storybook-components"
5. ✅ Create workflow function
6. ✅ Test screenshot generation - SUCCESS (18.3 KB)

**Solution:** Hybrid approach using existing MenuOpen story + Playwright hover interaction
**Known Issue Resolved:** Dropdown positioning fixed with decorator

---

### Phase 4: Create ViewControls Stories - Category C
**Effort:** 4-6 hours
**Parallelizable:** No (requires componentization first)

**Agent:** general-purpose
**Screenshots:** 4-5 total
- view-controls-main-interface (keep as full-app OR convert)
- view-controls-grid-view
- view-controls-donut-view
- view-controls-simplified-appbar
- view-controls-fullscreen (KEEP AS FULL-APP per user)

**Tasks:**
1. Find ViewControls component in codebase
2. Create ViewControls.stories.tsx:
   ```typescript
   export const GridViewActive: Story = {
     args: { mode: 'grid', zoom: 100 }
   };
   export const DonutViewActive: Story = {
     args: { mode: 'donut', zoom: 100 }
   };
   export const WithZoomControls: Story = { ... };
   ```
3. Decide: Is `view-controls-main-interface` component or full-app?
4. Update config.ts entries
5. Create workflow functions
6. Test screenshot generation
7. Update documentation to remove "new interface" language

---

### Phase 5: Cleanup & Documentation - Category D
**Effort:** 2-3 hours
**Parallelizable:** Yes (2 sub-tasks)

#### Phase 5A: Remove Duplicate Screenshots
**Agent:** general-purpose
**Screenshots to eliminate:** 4 automated
- workflow-changes-good-note (duplicate of workflow-changes-add-note)
- notes-donut-mode (notes same in both modes)
- filters-before-after (obvious, per user)
- donut-mode-toggle-comparison (use two separate images)

**Tasks:**
1. Remove from config.ts
2. Delete workflow functions
3. Update documentation:
   - Add good note example in prose
   - Note that notes visible in both modes
   - Remove before/after filter comparison
   - Use grid-normal and donut-mode-active-layout side-by-side

---

#### Phase 5B: Eliminate Manual Screenshots
**Agent:** general-purpose
**Screenshots to eliminate:** 8 manual
- quickstart-success-annotated → Use hero-grid-sample
- quickstart-excel-sample → Generate schema docs
- calibration-export-results → Document columns in text
- making-changes-drag-sequence-base → Create GH issue for GIF
- workflow-changes-notes-in-excel → Remove
- excel-file-new-columns → Remove

**Tasks:**
1. Remove from config.ts
2. Update documentation:
   - Add Excel schema documentation in prose
   - Document export columns in text
   - Use hero screenshot for annotated quickstart
3. Create GitHub Issues:
   - "Auto-generate Excel schema documentation from sample file generator"
   - "Generate drag-and-drop GIF from Playwright workflow"

---

#### Phase 5C: Merge Hero Screenshots
**Agent:** general-purpose
**Screenshots:** 2 → 1
- hero-grid-sample (keep)
- index-quick-win-preview (remove, use hero-grid-sample)

**Tasks:**
1. Verify hero-grid-sample workflow is correct
2. Remove index-quick-win-preview from config.ts
3. Update documentation to use hero-grid-sample for both purposes

---

## Parallel Execution Strategy

### Batch 1 (Parallel) - Phase 1
Execute simultaneously:
- Agent 1: Phase 1A (FileMenuButton + FilterDrawer)
- Agent 2: Phase 1B (Statistics + Intelligence)
- Agent 3: Phase 1C (Notes + EmployeeTile)

**Estimated Time:** 2-3 hours

---

### Batch 2 (Sequential) - Phase 2
Execute sequentially (story fixes):
- Agent 1: Phase 2A (Fix NineBoxGrid Populated story)
- Agent 1: Phase 2B (Fix NineBoxGrid DonutMode story)

**Estimated Time:** 3-4 hours

---

### Batch 3 (Sequential) - Phase 3
Execute sequentially (story fixes):
- Agent 1: Phase 3 (Fix FileMenuButton stories)

**Estimated Time:** 2-3 hours

---

### Batch 4 (Sequential) - Phase 4
Execute sequentially (new component stories):
- Agent 1: Phase 4 (Create ViewControls stories)

**Estimated Time:** 4-6 hours

---

### Batch 5 (Parallel) - Phase 5
Execute simultaneously:
- Agent 1: Phase 5A (Remove duplicates)
- Agent 2: Phase 5B (Eliminate manual screenshots)
- Agent 3: Phase 5C (Merge hero screenshots)

**Estimated Time:** 2-3 hours

---

## Testing Strategy

### Visual Regression Testing
1. Generate all screenshots with new Storybook sources
2. Compare against existing screenshots
3. Flag significant visual differences for review
4. Update baselines after approval

### Functional Testing
1. Verify all Storybook stories render correctly
2. Test theme switching (light/dark)
3. Verify screenshot metadata (dimensions, cropping)
4. Test screenshot generation CLI commands

---

## Rollback Plan

If issues arise:
1. Git revert commits for config.ts and workflow changes
2. Re-run screenshot generation with original config
3. Restore baseline screenshots from git history
4. Document issues in project notes
5. Fix issues before re-attempting

---

## Risks & Mitigations

### Risk 1: Story Fixes Break Storybook
**Impact:** High
**Likelihood:** Low
**Mitigation:** Test each story in Storybook UI before updating config

### Risk 2: Screenshots Don't Match Originals
**Impact:** Medium
**Likelihood:** Medium
**Mitigation:** Visual regression testing + manual review before baseline update

### Risk 3: ViewControls Componentization Takes Longer Than Expected
**Impact:** Medium
**Likelihood:** Medium
**Mitigation:** Prioritize other phases first, ViewControls is optional

### Risk 4: Storybook Server Issues During Generation
**Impact:** Low
**Likelihood:** Low
**Mitigation:** ServerManager handles startup/shutdown gracefully

---

## Success Metrics Tracking

| Metric | Baseline | Target | Current |
|--------|----------|--------|---------|
| Total screenshots | 42 | ~42 | 42 |
| Full-app screenshots | 34 | 2 | 33 |
| Storybook screenshots | 26 | 40 | 32 |
| Manual screenshots | 8 | 0 | 8 |
| Generation time | 6-8 min | 1-2 min | 5-7 min |
| Screenshot reliability | ~95% | 100% | ~96% |

---

## Open Questions

- [x] Merge hero screenshots? → Yes (user confirmed)
- [x] Eliminate filters-before-after? → Yes (user confirmed)
- [x] view-controls-fullscreen component or full-app? → Full-app (user confirmed)
- [x] calibration-intelligence-anomalies: one or two screenshots? → Two separate (user confirmed)
- [x] FileMenuButton dropdown positioning: How to fix in story? → Fixed with decorator (minHeight: 400px)
- [ ] view-controls-main-interface: Component story or full-app?

---

## Notes

**2025-12-28:** Plan created based on comprehensive screenshot audit
- User confirmed FileMenuButton story has dropdown positioning issue
- Need to investigate and fix before using for screenshots
- DistributionTable story shows 20/70/10 as "skewed" - incorrect desired distribution (fix separately)

**2025-12-28 (Phase 3 Complete):** FileMenuButton stories fixed
- Dropdown positioning issue resolved with decorator (minHeight: 400px + proper styling)
- Created hybrid workflow approach: Storybook renders MenuOpen story, Playwright hovers over Import item
- No new story variant needed (MenuOpen story + hover interaction is sufficient)
- Added missing `onLoadSampleClick` prop to default args (fixed TypeScript errors)
- Screenshot generation successful: calibration-file-import (18.3 KB)
- file-menu-apply-changes was already converted in Phase 1A (using WithChanges story)

---

## References

- [Screenshot Migration Plan](../../agent-tmp/screenshot-migration-plan.md) - Detailed implementation plan
- [Full-App Screenshots Review](../../agent-tmp/full-app-screenshots-review.md) - Current state documentation
- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) - Design system guidelines
- [Storybook Documentation](https://storybook.js.org/) - Storybook best practices
