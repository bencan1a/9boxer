# Screenshot Generator Functional Fixes

**Status:** done
**Owner:** Development Team
**Created:** 2025-12-24
**Completed:** 2025-12-26
**Summary:**
- Fix 7 HIGH severity functional bugs preventing screenshot generation
- Achieve >95% success rate (24/25 automated screenshots generating)
- Match patterns from existing Playwright E2E tests for consistency
**Completion Notes:** Screenshot generator functional fixes completed successfully.

---

## Context

The TypeScript screenshot generator (migrated from Python in issue #8) is experiencing critical failures. Out of 25 automated screenshots, only 8 (32%) generate successfully. The remaining 17 fail due to functional bugs in the generator workflow code, not the application itself.

**Validation Results:** See comprehensive report in `agent-tmp/screenshot-validation-report-2025-12-24.md`

**Key Finding:** Most failures stem from inconsistent use of existing helper functions and Material-UI timing issues that E2E tests already handle correctly.

---

## Problem Statement

### Current State
- **8/25 screenshots** generating successfully (32% success rate)
- **7 HIGH severity bugs** blocking screenshot generation
- **5 screenshots** fail due to dialog/menu overlay timing
- **2 screenshots** fail due to drag-and-drop target invisibility
- **2 screenshots** fail due to incorrect filter selectors
- **1 screenshot** fails due to API timeout in employee movement

### Target State
- **24/25 screenshots** generating successfully (96% success rate)
- **0 HIGH severity bugs**
- Consistent use of proven helper patterns from E2E tests
- Graceful error handling with progress indicators

---

## Root Causes

### 1. Dialog/Menu Overlay Timing (50% of failures)
**Issue:** Material-UI animations not completing before next action
- Insufficient wait times (300ms vs needed 500ms+)
- `closeAllDialogsAndOverlays()` helper not used consistently
- No verification that backdrop is actually gone

**Evidence from E2E tests:**
```typescript
// E2E tests (working):
await openFileMenu(page);  // Built-in 300ms wait
await page.keyboard.press('Escape');
await waitForUiSettle(page, 0.5);  // Network + 500ms buffer

// Screenshot generator (broken):
await page.locator('[data-testid="file-menu-button"]').click();
await page.waitForTimeout(300);
// ❌ No cleanup, no verification
```

### 2. Drag-and-Drop Target Invisibility (20% of failures)
**Issue:** Grid box element becomes invisible during drag operation
- Using `dragTo()` which doesn't match E2E test patterns
- No verification that target is visible before drop
- Missing stabilization buffer between operations

**Evidence from E2E tests:**
```typescript
// E2E tests (working):
await page.mouse.down();
await page.waitForTimeout(150);  // Ensure drag initiated
// ... stepwise movement ...
await page.mouse.up();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);  // Longer stabilization

// Screenshot generator (broken):
await employeeCard.dragTo(gridBox);  // ❌ High-level API fails
```

### 3. Incorrect Filter Selectors (20% of failures)
**Issue:** Using text content selectors that don't match current UI
- E2E tests use `data-testid` attributes
- Screenshot generator uses `text="High"` selectors
- UI may have changed since selectors were written

### 4. API Timing for Employee Movement (10% of failures)
**Issue:** Backend API doesn't complete within timeout
- Missing retry logic used in E2E tests
- No verification that position actually updated
- Cascading failures to dependent screenshots

---

## Solution Strategy

### Phase 1: Match E2E Test Patterns (HIGH Priority)
**Goal:** Use exact same helper patterns that work in E2E tests

1. **Adopt `closeAllDialogsAndOverlays()` everywhere**
   - After every dialog/menu interaction
   - Before starting new screenshot workflow
   - Pattern: `await closeAllDialogsAndOverlays(page);`

2. **Use `waitForUiSettle()` instead of fixed timeouts**
   - After state-changing operations
   - Before screenshot capture
   - Pattern: `await waitForUiSettle(page, 0.5);`

3. **Replace `dragTo()` with manual mouse operations**
   - Match `drag-drop-visual.spec.ts` pattern
   - Stepwise movement with verification
   - Longer stabilization between consecutive drags

4. **Use `data-testid` selectors like E2E tests**
   - Never use text content for functional selectors
   - Match existing E2E test selector patterns
   - Pattern: `page.locator('[data-testid="filter-high"]')`

### Phase 2: Add Robust Error Handling (MEDIUM Priority)
**Goal:** Generator continues even if individual screenshots fail

1. **Wrap each screenshot in try/catch**
   - Log detailed error with context
   - Continue to next screenshot
   - Collect all errors for final report

2. **Add progress indicators**
   - Show "X/25 screenshots completed"
   - Show elapsed time per screenshot
   - Show estimated time remaining

3. **Add validation checks**
   - Verify element exists before screenshot
   - Check screenshot file size (not 0 bytes)
   - Validate viewport state before capture

### Phase 3: State Isolation (MEDIUM Priority)
**Goal:** Each screenshot workflow starts with clean state

1. **Reset between workflow groups**
   - Clear dialogs/overlays before each workflow
   - Reset to known data state
   - Pattern from E2E: `await resetToEmptyState(page);`

2. **Verify clean state**
   - No overlays visible
   - Network idle
   - Expected data loaded

---

## Success Criteria

### Must Have (Phase 1)
- ✅ All dialog/menu overlay failures fixed (5 screenshots)
- ✅ Drag-and-drop failures fixed (2 screenshots)
- ✅ Filter selector failures fixed (2 screenshots)
- ✅ API timeout failures fixed (1 screenshot)
- ✅ Success rate >95% (24/25 screenshots)

### Should Have (Phase 2)
- ✅ Error handling prevents total generator failure
- ✅ Progress indicators show generation status
- ✅ Detailed error logs for debugging
- ✅ Screenshot validation (file exists, non-zero size)

### Nice to Have (Phase 3)
- ✅ State isolation between workflows
- ✅ Parallel screenshot generation
- ✅ Visual regression testing baseline

---

## Out of Scope

This plan focuses ONLY on functional bugs. Quality issues are tracked separately:
- ❌ Screenshot cropping inconsistencies
- ❌ Documentation text mismatches
- ❌ Manual screenshot workflows
- ❌ Screenshot composition (multi-panel)

---

## Implementation Approach

### Pattern Matching Philosophy
**"Don't reinvent - reuse what works"**

For every screenshot workflow function, review corresponding E2E test:
1. Find E2E test for same feature (e.g., `filter-flow.spec.ts` for filter screenshots)
2. Identify helper functions used (e.g., `openFilterDrawer()`, `waitForUiSettle()`)
3. Copy pattern exactly, adapting only for screenshot capture
4. Add comments linking back to E2E test reference

**Example:**
```typescript
// Pattern from filter-flow.spec.ts
export async function generateFiltersPanelExpanded(page: Page, outputPath: string): Promise<void> {
  // Reset to clean state (from upload-flow.spec.ts pattern)
  await uploadExcelFile(page, 'sample-employees.xlsx');
  await closeAllDialogsAndOverlays(page);

  // Open filter drawer (from filter-flow.spec.ts)
  await openFilterDrawer(page);
  await waitForUiSettle(page, 0.5);

  // Capture screenshot
  const filterDrawer = page.locator('[data-testid="filter-drawer"]');
  await filterDrawer.screenshot({ path: outputPath });
}
```

### Testing Strategy
After each fix:
1. Run generator for affected screenshots only
2. Verify file generated (exists, >0 bytes)
3. Visual inspection of screenshot
4. Run full generator suite at end of phase

---

## Dependencies

### Internal
- `frontend/playwright/helpers/ui.ts` - Helper functions to reuse
- `frontend/playwright/helpers/fixtures.ts` - Upload helper
- `frontend/playwright/e2e/*.spec.ts` - Pattern references

### External
- None (all fixes use existing infrastructure)

---

## Risks & Mitigation

### Risk: E2E Test Patterns Don't Work for Screenshots
**Likelihood:** Low
**Impact:** Medium
**Mitigation:** E2E tests already capture screenshots in some cases. Patterns are proven.

### Risk: Timing Still Flaky on Different Machines
**Likelihood:** Medium
**Impact:** Low
**Mitigation:**
- Use auto-retry assertions where possible
- Add retries for screenshot generation (like E2E tests have)
- Increase timeouts in CI environment

### Risk: Drag-Drop Still Fails After Pattern Match
**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Alternative: Use API calls to move employees instead of UI drag
- Verify with headed browser mode to debug visually
- Add detailed logging for each drag step

---

## Timeline Estimates

### Phase 1: Match E2E Patterns (HIGH Priority)
- **Task 1:** Fix dialog/menu overlay timing (3-4 hours)
  - Add `closeAllDialogsAndOverlays()` to all workflows
  - Replace fixed timeouts with `waitForUiSettle()`
  - Test 5 affected screenshots

- **Task 2:** Fix drag-and-drop operations (3-4 hours)
  - Implement manual mouse operations pattern
  - Add stepwise movement with verification
  - Test 2 affected screenshots

- **Task 3:** Fix filter selectors (1-2 hours)
  - Update to `data-testid` selectors
  - Match filter-flow.spec.ts patterns
  - Test 2 affected screenshots

- **Task 4:** Fix API timeout handling (1-2 hours)
  - Add retry logic from E2E patterns
  - Verify position updates before proceeding
  - Test cascading screenshots

**Phase 1 Total:** 8-12 hours

### Phase 2: Error Handling (MEDIUM Priority)
- **Task 5:** Wrap screenshots in try/catch (1-2 hours)
- **Task 6:** Add progress indicators (1-2 hours)
- **Task 7:** Add validation checks (1-2 hours)

**Phase 2 Total:** 3-6 hours

### Phase 3: State Isolation (MEDIUM Priority)
- **Task 8:** Reset between workflows (2-3 hours)
- **Task 9:** Verify clean state (1-2 hours)

**Phase 3 Total:** 3-5 hours

**Grand Total:** 14-23 hours (2-3 days development)

---

## References

### Documentation
- `internal-docs/testing/playwright-best-practices-checklist.md` - Patterns to follow
- `internal-docs/testing/playwright-architecture-review.md` - Architecture context
- `frontend/playwright/helpers/ui.ts` - Existing helper functions

### E2E Tests to Reference
- `frontend/playwright/e2e/upload-flow.spec.ts` - File upload patterns
- `frontend/playwright/e2e/drag-drop-visual.spec.ts` - Drag/drop patterns
- `frontend/playwright/e2e/filter-flow.spec.ts` - Filter panel patterns
- `frontend/playwright/e2e/toolbar-interactions.spec.ts` - Menu patterns

### Issues
- GitHub Issue #29 - Screenshot generator functional bugs (this work)
- GitHub Issue #30 - Screenshot quality improvements (follow-up work)
- GitHub Issue #8 - Original migration from Python to TypeScript

---

**Last Updated:** 2025-12-24
**Next Review:** After Phase 1 completion
