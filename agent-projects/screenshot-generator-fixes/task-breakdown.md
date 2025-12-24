# Screenshot Generator Fixes - Task Breakdown

Agent-scoped task breakdown for fixing functional bugs in the TypeScript screenshot generator.

---

## Phase 1: Match E2E Test Patterns (HIGH Priority)

### Task 1: Fix Dialog/Menu Overlay Timing
**Estimated Time:** 3-4 hours
**Priority:** HIGH
**Dependencies:** None

**Affected Screenshots:**
1. `quickstart-grid-populated`
2. `calibration-statistics-red-flags`
3. `calibration-intelligence-anomalies`
4. `calibration-filters-panel`
5. `calibration-donut-mode-toggle`

**Current Issues:**
- Dialog actions root intercepts pointer events
- File menu backdrop intercepts pointer events
- Insufficient wait time after closing dialogs

**Solution Steps:**

1.1. **Add `closeAllDialogsAndOverlays()` to all workflow files**
   - Import from `helpers/ui.ts`
   - Add after every dialog/menu interaction
   - Add at start of each screenshot workflow

   ```typescript
   // At start of every workflow function
   await closeAllDialogsAndOverlays(page);

   // After every dialog/menu interaction
   await page.locator('[data-testid="file-menu-button"]').click();
   await page.locator('[data-testid="import-data-menu-item"]').click();
   await closeAllDialogsAndOverlays(page);  // ← Add this
   ```

1.2. **Replace fixed `waitForTimeout()` with `waitForUiSettle()`**
   - Find all `page.waitForTimeout(300)` calls
   - Replace with `await waitForUiSettle(page, 0.5);`
   - Increase to 1.0s for complex operations (like file upload)

   ```typescript
   // Before
   await page.waitForTimeout(300);

   // After
   await waitForUiSettle(page, 0.5);
   ```

1.3. **Add explicit backdrop verification**
   - Before clicking elements, verify no backdrop present
   - Pattern from `closeAllDialogsAndOverlays()` helper

   ```typescript
   // Verify no backdrop before proceeding
   const backdropCount = await page.locator('.MuiBackdrop-root').count();
   if (backdropCount > 0) {
     await closeAllDialogsAndOverlays(page);
   }
   ```

1.4. **Update workflow files:**
   - `frontend/playwright/screenshots/workflows/quickstart.ts:generateGridPopulated()`
   - `frontend/playwright/screenshots/workflows/calibration.ts` (all 4 functions)

1.5. **Test each screenshot individually:**
   ```bash
   npm run screenshots:generate quickstart-grid-populated
   npm run screenshots:generate calibration-statistics-red-flags
   npm run screenshots:generate calibration-intelligence-anomalies
   npm run screenshots:generate calibration-filters-panel
   npm run screenshots:generate calibration-donut-mode-toggle
   ```

**Success Criteria:**
- ✅ All 5 screenshots generate without "intercepts pointer events" errors
- ✅ Files exist with non-zero size
- ✅ Visual inspection shows correct content

**Reference:** `frontend/playwright/e2e/upload-flow.spec.ts` (lines 21-23, 44)

---

### Task 2: Fix Drag-and-Drop Operations
**Estimated Time:** 3-4 hours
**Priority:** HIGH
**Dependencies:** None

**Affected Screenshots:**
1. `changes-orange-border`
2. `changes-tab` (depends on successful drag)

**Current Issues:**
- `dragTo()` API fails with "element not visible" timeout
- Target grid box becomes invisible during drag operation
- No stabilization between consecutive drags

**Solution Steps:**

2.1. **Review E2E test drag pattern**
   - Study `frontend/playwright/e2e/drag-drop-visual.spec.ts` (lines 139-217)
   - Identify key differences from screenshot generator approach
   - Document pattern in comments

2.2. **Implement manual mouse operations**
   - Replace `employeeCard.dragTo(gridBox)` with manual sequence
   - Use stepwise movement (10 steps)
   - Add verification at each stage

   ```typescript
   // Pattern from drag-drop-visual.spec.ts
   const cardBox = await employeeCard.boundingBox();
   const targetBox = await gridBox.boundingBox();

   const startX = cardBox.x + cardBox.width / 2;
   const startY = cardBox.y + cardBox.height / 2;
   const endX = targetBox.x + targetBox.width / 2;
   const endY = targetBox.y + targetBox.height / 2;

   // Move to drag handle
   await page.mouse.move(cardBox.x + 12, startY);
   await page.mouse.down();
   await page.waitForTimeout(150);  // Ensure drag initiated

   // Stepwise movement
   const steps = 10;
   for (let i = 1; i <= steps; i++) {
     const x = startX + (endX - startX) * (i / steps);
     const y = startY + (endY - startY) * (i / steps);
     await page.mouse.move(x, y);
     await page.waitForTimeout(10);
   }

   // Drop
   await page.mouse.up();
   await page.waitForLoadState('networkidle');
   await page.waitForTimeout(1000);  // Longer stabilization
   ```

2.3. **Add target visibility verification**
   - Before drop, verify target box is visible
   - Check border color change (indicates drag-over state)

   ```typescript
   // Verify target box is accepting drop
   const borderColor = await targetBox.evaluate((el) => {
     return window.getComputedStyle(el).borderColor;
   });
   // Should not be default divider color
   expect(borderColor).not.toBe('rgba(0, 0, 0, 0.12)');
   ```

2.4. **Add stabilization for consecutive drags**
   - If workflow needs multiple drags, add longer wait between them
   - Pattern from `drag-drop-visual.spec.ts:108-110`

   ```typescript
   await dragEmployeeToPosition(page, 1, 6);
   await page.waitForLoadState('networkidle');
   await page.waitForTimeout(1000);  // Longer for consecutive ops
   await dragEmployeeToPosition(page, 2, 5);
   ```

2.5. **Update helper function or create new one**
   - Option A: Update existing `dragEmployeeToPosition()` in helpers
   - Option B: Create screenshot-specific `dragForScreenshot()`
   - Recommendation: Update existing to match E2E pattern

2.6. **Update workflow files:**
   - `frontend/playwright/screenshots/workflows/changes.ts:generateOrangeBorder()`
   - `frontend/playwright/screenshots/workflows/changes.ts:generateChangesTab()`

2.7. **Test drag screenshots:**
   ```bash
   npm run screenshots:generate changes-orange-border
   npm run screenshots:generate changes-tab
   ```

**Success Criteria:**
- ✅ Drag completes without timeout
- ✅ Orange border visible on employee card
- ✅ Changes tab shows employee movement
- ✅ Screenshots capture correct visual state

**Reference:** `frontend/playwright/e2e/drag-drop-visual.spec.ts` (full file)

---

### Task 3: Fix Filter Selectors
**Estimated Time:** 1-2 hours
**Priority:** HIGH
**Dependencies:** None

**Affected Screenshots:**
1. `filters-active-chips`
2. `filters-clear-all-button`

**Current Issues:**
- Using `text="High"` selector not found
- E2E tests use `data-testid` attributes instead
- UI implementation may have changed

**Solution Steps:**

3.1. **Inspect current filter UI**
   - Run app in headed mode
   - Open filter panel
   - Inspect filter option elements
   - Document actual `data-testid` attributes

   ```bash
   npm run electron:dev  # Run in dev mode
   # Open filter panel and inspect elements
   ```

3.2. **Review E2E test selectors**
   - Study `frontend/playwright/e2e/filter-flow.spec.ts`
   - Identify selectors used for filter options
   - Document pattern

   ```typescript
   // From filter-flow.spec.ts
   await page.locator('[data-testid="filter-performance-high"]').check();
   await page.locator('[data-testid="filter-potential-high"]').check();
   ```

3.3. **Update screenshot workflow selectors**
   - Replace all `text="High"` with proper `data-testid`
   - Match exact selector pattern from E2E tests

   ```typescript
   // Before
   await page.locator('text="High"').first().click();

   // After
   await page.locator('[data-testid="filter-performance-high"]').check();
   ```

3.4. **Add helper function for filter operations (optional)**
   - Create `applyFilter(page, category, value)` if pattern repeats
   - Similar to existing `openFilterDrawer()` helper

3.5. **Update workflow files:**
   - `frontend/playwright/screenshots/workflows/filters.ts:generateActiveChips()`
   - `frontend/playwright/screenshots/workflows/filters.ts:generateClearAllButton()`

3.6. **Test filter screenshots:**
   ```bash
   npm run screenshots:generate filters-active-chips
   npm run screenshots:generate filters-clear-all-button
   ```

**Success Criteria:**
- ✅ Filter options click without "not found" errors
- ✅ Active filter chips visible in screenshot
- ✅ Clear All button visible and highlighted

**Reference:** `frontend/playwright/e2e/filter-flow.spec.ts`

---

### Task 4: Fix API Timeout Handling
**Estimated Time:** 1-2 hours
**Priority:** HIGH
**Dependencies:** Task 2 (drag-drop fixes)

**Affected Screenshots:**
1. `changes-tab` (cascading from employee move failures)
2. Any screenshot requiring multiple employee movements

**Current Issues:**
- `moveEmployeeToPosition()` helper times out after 3 retries
- No verification that API actually completed
- No logging to understand why timeout occurred

**Solution Steps:**

4.1. **Review helper function implementation**
   - Read `frontend/playwright/helpers/ui.ts:moveEmployeeToPosition()`
   - Understand retry logic and timeout thresholds
   - Compare to E2E test approach

4.2. **Add API completion verification**
   - Wait for specific API response, not just timeout
   - Verify `data-position` attribute updated

   ```typescript
   // Wait for API response
   const responsePromise = page.waitForResponse(
     (r) => r.url().includes('/move') && r.status() === 200,
     { timeout: 10000 }
   );

   await dragEmployeeToPosition(page, employeeId, targetPosition);
   await responsePromise;

   // Verify position updated
   const updatedPosition = await employeeCard.getAttribute('data-position');
   expect(updatedPosition).toBe(targetPosition.toString());
   ```

4.3. **Increase retry timeout or count**
   - Current: 3 retries with short timeout
   - Proposed: 5 retries with exponential backoff
   - Or: Increase timeout from 5s to 10s

4.4. **Add detailed logging**
   - Log each retry attempt
   - Log actual vs expected position
   - Log API response status

   ```typescript
   console.log(`Moving employee ${employeeId} to position ${targetPosition}`);
   console.log(`Attempt ${attempt}/3: Position is ${currentPosition}, expected ${targetPosition}`);
   ```

4.5. **Update helper function:**
   - `frontend/playwright/helpers/ui.ts:moveEmployeeToPosition()`
   - Keep backward compatible for E2E tests

4.6. **Alternative approach (if needed):**
   - Use API calls to move employees instead of UI drag
   - Faster and more reliable for screenshot setup
   - Only use UI drag when specifically testing drag visual feedback

**Success Criteria:**
- ✅ Employee movements complete without timeout
- ✅ Changes tab populates with movement data
- ✅ Cascading screenshots now succeed

**Reference:** `frontend/playwright/helpers/ui.ts`, `frontend/playwright/e2e/change-tracking.spec.ts`

---

## Phase 2: Error Handling (MEDIUM Priority)

### Task 5: Wrap Screenshots in Try/Catch
**Estimated Time:** 1-2 hours
**Priority:** MEDIUM
**Dependencies:** Phase 1 complete

**Goal:** Generator continues even if individual screenshots fail

**Solution Steps:**

5.1. **Update main screenshot loop in `generate.ts`**
   - Wrap each screenshot generation in try/catch
   - Log error details
   - Continue to next screenshot

   ```typescript
   for (const [name, metadata] of Object.entries(screenshotsToGenerate)) {
     try {
       console.log(`📸 Generating: ${name}...`);
       await generateScreenshot(page, name, metadata);
       results.successful.push(name);
       console.log(`✓ Success: ${name}`);
     } catch (error) {
       const errorMessage = error instanceof Error ? error.message : String(error);
       const stackTrace = error instanceof Error ? error.stack : '';
       results.failed.push({ name, error: errorMessage, stack: stackTrace });
       console.error(`✗ Failed: ${name} - ${errorMessage}`);

       // Continue to next screenshot (don't throw)
     }
   }
   ```

5.2. **Add screenshot-specific error context**
   - Include metadata (workflow, function, path)
   - Log viewport state at time of failure
   - Log network state

5.3. **Save error report**
   - Write failures to JSON file for debugging
   - Include timestamps, error messages, stack traces

**Success Criteria:**
- ✅ Generator completes full run even with failures
- ✅ Detailed error log for each failure
- ✅ JSON error report saved to `agent-tmp/`

---

### Task 6: Add Progress Indicators
**Estimated Time:** 1-2 hours
**Priority:** MEDIUM
**Dependencies:** Task 5

**Goal:** User can see generation progress in real-time

**Solution Steps:**

6.1. **Add progress counter**
   ```typescript
   console.log(`\n[${successful.length + failed.length}/${totalCount}] Generating: ${name}...`);
   ```

6.2. **Add elapsed time tracking**
   ```typescript
   const startTime = Date.now();
   // ... generate screenshot ...
   const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
   console.log(`✓ Success: ${name} (${elapsed}s)`);
   ```

6.3. **Add ETA calculation**
   ```typescript
   const avgTimePerScreenshot = elapsed / (successful.length + failed.length);
   const remaining = totalCount - (successful.length + failed.length);
   const eta = Math.round(avgTimePerScreenshot * remaining);
   console.log(`\nETA: ~${eta}s remaining (${remaining} screenshots)`);
   ```

6.4. **Add progress bar (optional)**
   - Use simple text-based progress: `[====    ] 50%`
   - Or use library like `cli-progress`

**Success Criteria:**
- ✅ Console shows current progress (X/Y)
- ✅ Console shows time per screenshot
- ✅ Console shows estimated time remaining

---

### Task 7: Add Validation Checks
**Estimated Time:** 1-2 hours
**Priority:** MEDIUM
**Dependencies:** Task 5, Task 6

**Goal:** Verify screenshots generated correctly

**Solution Steps:**

7.1. **Add pre-capture validation**
   ```typescript
   // Before screenshot
   await expect(element).toBeVisible({ timeout: 5000 });
   const boundingBox = await element.boundingBox();
   if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
     throw new Error(`Element has zero dimensions: ${metadata.path}`);
   }
   ```

7.2. **Add post-capture validation**
   ```typescript
   // After screenshot
   const stats = await fs.promises.stat(outputPath);
   if (stats.size === 0) {
     throw new Error(`Screenshot file is empty: ${outputPath}`);
   }
   if (stats.size < 1000) {
     console.warn(`Screenshot file is very small (${stats.size} bytes): ${outputPath}`);
   }
   ```

7.3. **Add viewport validation**
   ```typescript
   // Verify viewport size matches config
   const viewport = page.viewportSize();
   if (viewport.width !== 1400 || viewport.height !== 900) {
     console.warn(`Viewport size mismatch: ${viewport.width}x${viewport.height}`);
   }
   ```

**Success Criteria:**
- ✅ Pre-capture checks prevent zero-size screenshots
- ✅ Post-capture checks verify file integrity
- ✅ Warnings for unusual situations

---

## Phase 3: State Isolation (MEDIUM Priority)

### Task 8: Reset Between Workflows
**Estimated Time:** 2-3 hours
**Priority:** MEDIUM
**Dependencies:** Phase 1, Phase 2

**Goal:** Each workflow group starts with clean state

**Solution Steps:**

8.1. **Group screenshots by workflow**
   - Changes screenshots (5)
   - Filters screenshots (4)
   - Quickstart screenshots (4)
   - Calibration screenshots (6)
   - Others

8.2. **Add workflow-level setup/teardown**
   ```typescript
   // Before each workflow group
   await resetToEmptyState(page);
   await closeAllDialogsAndOverlays(page);

   // Generate all screenshots in group
   // ...

   // After each workflow group
   await closeAllDialogsAndOverlays(page);
   ```

8.3. **Update generate.ts to group by workflow**
   ```typescript
   const workflowGroups = groupScreenshotsByWorkflow(screenshotsToGenerate);

   for (const [workflow, screenshots] of Object.entries(workflowGroups)) {
     console.log(`\n📂 Starting workflow: ${workflow}`);
     await resetToEmptyState(page);

     for (const [name, metadata] of screenshots) {
       // Generate screenshot
     }

     await closeAllDialogsAndOverlays(page);
   }
   ```

**Success Criteria:**
- ✅ Each workflow starts with clean state
- ✅ No state pollution between workflows
- ✅ Clearer organization in console output

---

### Task 9: Verify Clean State
**Estimated Time:** 1-2 hours
**Priority:** MEDIUM
**Dependencies:** Task 8

**Goal:** Explicit verification of clean state before proceeding

**Solution Steps:**

9.1. **Create state verification helper**
   ```typescript
   async function verifyCleanState(page: Page): Promise<void> {
     // No overlays
     const backdropCount = await page.locator('.MuiBackdrop-root').count();
     if (backdropCount > 0) {
       throw new Error(`Clean state check failed: ${backdropCount} backdrops present`);
     }

     // No dialogs
     const dialogCount = await page.locator('[role="dialog"]').count();
     if (dialogCount > 0) {
       throw new Error(`Clean state check failed: ${dialogCount} dialogs open`);
     }

     // Network idle
     await page.waitForLoadState('networkidle');
   }
   ```

9.2. **Call before each workflow group**
   ```typescript
   await resetToEmptyState(page);
   await verifyCleanState(page);  // Explicit check
   ```

9.3. **Add data state verification (optional)**
   - Verify expected number of employees loaded
   - Verify grid is in expected mode (normal vs donut)

**Success Criteria:**
- ✅ State verification catches unexpected state
- ✅ Clear error messages when state is dirty
- ✅ High confidence in clean starting state

---

## Testing Strategy

### After Each Task
1. Run affected screenshots individually
2. Verify files exist with correct content
3. Check console output for errors

### After Each Phase
1. Run full generator suite: `npm run screenshots:generate`
2. Check success rate
3. Visual inspection of all generated screenshots
4. Compare to previous versions (if available)

### Before Completion
1. Run generator 3 times in a row (check consistency)
2. Run in headed mode to verify visually
3. Run on different machine/environment (if possible)
4. Document any remaining issues

---

## Definition of Done

### Per Task
- ✅ Code changes implemented
- ✅ Affected screenshots tested individually
- ✅ Console output verified (no errors)
- ✅ Files exist with correct content
- ✅ Code reviewed for pattern consistency with E2E tests

### Per Phase
- ✅ All tasks in phase complete
- ✅ Full generator run succeeds
- ✅ Success rate meets target (>95% for Phase 1)
- ✅ Documentation updated (if needed)

### Overall Project
- ✅ All 3 phases complete
- ✅ 24/25 screenshots generating successfully (96% success rate)
- ✅ Generator completes in <5 minutes
- ✅ Consistent results across multiple runs
- ✅ Code follows E2E test patterns
- ✅ Error handling gracefully handles failures
- ✅ Progress indicators show clear status

---

## Quick Reference

### Helper Functions to Use
```typescript
import {
  closeAllDialogsAndOverlays,
  waitForUiSettle,
  resetToEmptyState,
  openFileMenu,
  openFilterDrawer,
  toggleDonutMode,
  clickTabAndWait,
} from '../helpers/ui';

import { uploadExcelFile } from '../helpers/fixtures';
```

### Common Patterns
```typescript
// After dialog interaction
await closeAllDialogsAndOverlays(page);

// After state change
await waitForUiSettle(page, 0.5);

// Before drag/drop
await page.waitForLoadState('networkidle');

// Between consecutive drags
await page.waitForTimeout(1000);

// Screenshot capture
const element = page.locator('[data-testid="..."]');
await expect(element).toBeVisible();
await element.screenshot({ path: outputPath });
```

---

**Last Updated:** 2025-12-24
**Task Count:** 9 tasks across 3 phases
**Total Estimated Time:** 14-23 hours
