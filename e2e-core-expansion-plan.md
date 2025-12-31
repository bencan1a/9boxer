# E2E-Core Test Suite Expansion Plan

## Goal
Add 9 critical test scenarios to e2e-core suite to improve coverage of core UX workflows.

## New Tests to Add
1. Panel toggle collapse/expand
2. Panel width resize via drag handle
3. Tab switching with state persistence
4. Empty state UI (Load Sample/Upload buttons)
5. Box expansion/collapse functionality
6. Drag-drop from/to expanded boxes
7. EN↔ES language switching
8. Zoom in/out/reset buttons
9. Distribution table with percentages

## Implementation Phases

### Phase 1: Helper Functions (18 new helpers in 4 files)

#### File: `panelInteractions.ts` (9 functions) - ✅ COMPLETE
- toggleRightPanel()
- verifyPanelCollapsed()
- verifyPanelExpanded()
- resizePanelToWidth()
- switchPanelTab()
- expandGridBox()
- collapseGridBox()
- verifyBoxExpanded()
- verifyBoxCollapsed()

#### File: `settings.ts` (4 functions)
- openSettingsDialog()
- closeSettingsDialog()
- changeLanguage()
- verifyLanguage()

#### File: `zoom.ts` (5 functions)
- zoomIn()
- zoomOut()
- resetZoom()
- getZoomLevel()
- verifyZoomLevel()

#### File: `statistics.ts` (2 functions)
- getDistributionData()
- verifyDistributionPercentagesSum()

#### Update: `index.ts`
- Export all new helpers

### Phase 2: Test Files (9 tests in 6 files)

#### `07-panel-interactions.spec.ts` (3 tests)
- 7.1: Panel toggle
- 7.2: Panel resize
- 7.3: Tab switching persistence

#### `08-empty-state.spec.ts` (3 tests)
- 8.1: Load Sample button visible
- 8.2: Upload button visible
- 8.3: Empty state disappears after load

#### `09-grid-expansion.spec.ts` (2 tests)
- 9.1: Box expand/collapse
- 9.2: Drag from expanded box

#### `10-language-switching.spec.ts` (2 tests)
- 10.1: EN↔ES switching
- 10.2: Language persistence

#### `11-zoom-controls.spec.ts` (2 tests)
- 11.1: Zoom in/out/reset
- 11.2: Zoom persistence

#### `12-statistics-accuracy.spec.ts` (1 test)
- 12.1: Distribution percentages sum to 100%

### Phase 3: Code Review
- Check all helpers use state-based waits (NO waitForTimeout)
- Verify all tests import from '../fixtures'
- Ensure data-testid selectors used
- Verify error messages are clear
- Test edge cases handled

### Phase 4: Validation
- Run each test file individually
- Run full e2e-core suite (32 tests expected)
- Run 3 times for stability check
- Target: < 2 minutes execution time

## Success Criteria
- ✅ 18 new helper functions
- ✅ 9 new tests (32 total)
- ✅ All tests pass consistently
- ✅ Zero arbitrary waits
- ✅ Execution time < 2 min

## Progress
- [x] panelInteractions.ts - COMPLETE
- [ ] settings.ts
- [ ] zoom.ts
- [ ] statistics.ts
- [ ] index.ts updates
- [ ] 07-panel-interactions.spec.ts
- [ ] 08-empty-state.spec.ts
- [ ] 09-grid-expansion.spec.ts
- [ ] 10-language-switching.spec.ts
- [ ] 11-zoom-controls.spec.ts
- [ ] 12-statistics-accuracy.spec.ts
- [ ] Code review
- [ ] Test execution
