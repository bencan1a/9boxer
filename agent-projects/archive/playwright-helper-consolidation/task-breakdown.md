# Playwright Helper Consolidation - Task Breakdown

**Project:** Consolidate Playwright helpers + Migrate screenshot generator to TypeScript
**Total Effort:** 20-30 hours
**Agent Tasks:** 12 focused tasks (1-3 hours each)

---

## Task 1: Create Shared TypeScript Helpers
**Phase:** 1 - Foundation
**Effort:** 2-4 hours
**Prerequisites:** None
**Deliverables:**
- `frontend/playwright/helpers/ui.ts` with 7 helper functions
- `frontend/playwright/helpers/assertions.ts` with 3 helper functions
- `frontend/playwright/helpers/fixtures.ts` with 2 helper functions
- Updated `frontend/playwright/helpers/index.ts` barrel exports

**Success Criteria:**
- [ ] All 12 helper functions implemented with TypeScript types
- [ ] JSDoc comments with examples on all functions
- [ ] Functions exported from index.ts
- [ ] No breaking changes to existing tests

**Agent Instructions:**
```
Create shared TypeScript helper library for Playwright tests.

Files to create:
1. frontend/playwright/helpers/ui.ts - 7 UI interaction helpers
2. frontend/playwright/helpers/assertions.ts - 3 test utility helpers
3. frontend/playwright/helpers/fixtures.ts - 2 data loading helpers

Refer to agent-projects/playwright-helper-consolidation/plan.md Phase 1 for:
- Complete function signatures
- Implementation details
- JSDoc examples

Update frontend/playwright/helpers/index.ts to export all new helpers.
```

---

## Task 2: Refactor change-tracking.spec.ts
**Phase:** 2 - Proof of Concept (Test 1/3)
**Effort:** 1 hour
**Prerequisites:** Task 1 complete
**Deliverables:**
- Refactored `frontend/playwright/e2e/change-tracking.spec.ts`
- Uses `clickTabAndWait()`, `getBadgeCount()`, `ensureChangesExist()`

**Success Criteria:**
- [ ] Test file uses new helpers instead of inline patterns
- [ ] All tests pass (no regressions)
- [ ] Line count reduced by ~30%
- [ ] Code is more readable

**Agent Instructions:**
```
Refactor frontend/playwright/e2e/change-tracking.spec.ts to use shared helpers.

Patterns to replace:
- Tab switching → clickTabAndWait()
- Badge count parsing → getBadgeCount()
- Change creation → ensureChangesExist()

Run tests to validate: npm run test:e2e:pw change-tracking.spec.ts
```

---

## Task 3: Refactor donut-mode.spec.ts
**Phase:** 2 - Proof of Concept (Test 2/3)
**Effort:** 1 hour
**Prerequisites:** Task 1 complete
**Deliverables:**
- Refactored `frontend/playwright/e2e/donut-mode.spec.ts`
- Uses `toggleDonutMode()`, `getEmployeeIdFromCard()`, `waitForUiSettle()`

**Success Criteria:**
- [ ] Test file uses new helpers
- [ ] All tests pass
- [ ] Line count reduced by ~30%

**Agent Instructions:**
```
Refactor frontend/playwright/e2e/donut-mode.spec.ts to use shared helpers.

Patterns to replace:
- Donut mode toggle → toggleDonutMode()
- Employee ID extraction → getEmployeeIdFromCard()
- UI waits → waitForUiSettle()

Run tests to validate: npm run test:e2e:pw donut-mode.spec.ts
```

---

## Task 4: Refactor toolbar-interactions.spec.ts
**Phase:** 2 - Proof of Concept (Test 3/3)
**Effort:** 1 hour
**Prerequisites:** Task 1 complete
**Deliverables:**
- Refactored `frontend/playwright/e2e/toolbar-interactions.spec.ts`
- Uses `openFileMenu()`, `openFilterDrawer()`, `closeAllDialogsAndOverlays()`

**Success Criteria:**
- [ ] Test file uses new helpers
- [ ] All tests pass
- [ ] Line count reduced by ~30%

**Agent Instructions:**
```
Refactor frontend/playwright/e2e/toolbar-interactions.spec.ts to use shared helpers.

Patterns to replace:
- File menu opening → openFileMenu()
- Filter drawer opening → openFilterDrawer()
- Dialog cleanup → closeAllDialogsAndOverlays()

Run tests to validate: npm run test:e2e:pw toolbar-interactions.spec.ts
```

---

## Task 5: Validate Helper Consolidation
**Phase:** 3 - Validation
**Effort:** 1-2 hours
**Prerequisites:** Tasks 2, 3, 4 complete
**Deliverables:**
- Full E2E test suite passes
- Updated `internal-docs/testing/quick-reference.md` with helper usage examples
- Validation report documenting improvements

**Success Criteria:**
- [ ] All 12 E2E tests pass
- [ ] No flakiness introduced
- [ ] Documentation updated
- [ ] Metrics captured (line reduction, readability)

**Agent Instructions:**
```
Validate the helper consolidation is complete and working.

1. Run full E2E test suite: npm run test:e2e:pw
2. Verify all tests pass
3. Update internal-docs/testing/quick-reference.md with helper examples
4. Create validation report with metrics:
   - Line count reduction
   - Helper coverage
   - Test stability

Document results in agent-tmp/helper-validation-results.md
```

---

## Task 6: Create Screenshot Generator Infrastructure
**Phase:** 5.1a - Screenshot Generator Foundation
**Effort:** 1-2 hours
**Prerequisites:** Task 1 complete
**Deliverables:**
- `frontend/playwright/screenshots/generate.ts` (main CLI)
- `frontend/playwright/screenshots/config.ts` (screenshot registry)
- Package.json scripts for screenshot generation

**Success Criteria:**
- [ ] Generator can be run via `npm run screenshots:generate`
- [ ] Accepts command-line arguments for filtering screenshots
- [ ] Has proper error handling and reporting
- [ ] Can start/stop backend and frontend

**Agent Instructions:**
```
Create TypeScript screenshot generator infrastructure.

Files to create:
1. frontend/playwright/screenshots/generate.ts - Main CLI entry point
2. frontend/playwright/screenshots/config.ts - Screenshot metadata registry
3. frontend/playwright/screenshots/README.md - Usage documentation

Add npm scripts to frontend/package.json:
- "screenshots:generate": "tsx frontend/playwright/screenshots/generate.ts"

Refer to agent-projects/playwright-helper-consolidation/plan.md Step 5.1 for:
- Complete generate.ts implementation
- Screenshot metadata interface
- CLI argument parsing

Test by running: npm run screenshots:generate --help
```

---

## Task 7: Migrate Quickstart + Calibration Screenshots
**Phase:** 5.1b - Screenshot Workflows (Group 1/3)
**Effort:** 2-3 hours
**Prerequisites:** Task 6 complete
**Deliverables:**
- `frontend/playwright/screenshots/workflows/quickstart.ts` (4 screenshots)
- `frontend/playwright/screenshots/workflows/calibration.ts` (6 screenshots)
- Screenshots registered in config.ts

**Success Criteria:**
- [ ] 10 screenshot functions implemented
- [ ] All use shared helpers from Task 1
- [ ] Screenshots generate successfully
- [ ] Visual parity with Python versions

**Agent Instructions:**
```
Migrate quickstart and calibration screenshots to TypeScript.

Create:
1. frontend/playwright/screenshots/workflows/quickstart.ts
   - generateFileMenuButton()
   - generateUploadDialog()
   - generateGridPopulated()
   - generateSuccessAnnotated()

2. frontend/playwright/screenshots/workflows/calibration.ts
   - generateFileImport()
   - generateStatisticsRedFlags()
   - generateIntelligenceAnomalies()
   - generateFiltersPanel()
   - generateDonutModeToggle()
   - generateDonutModeGrid()

Reuse helpers from frontend/playwright/helpers/
Reference Python implementation in tools/generate_docs_screenshots.py for logic.

Register all in frontend/playwright/screenshots/config.ts

Test: npm run screenshots:generate quickstart-file-menu-button calibration-file-import
```

---

## Task 8: Migrate Changes + Notes + Filters Screenshots
**Phase:** 5.1c - Screenshot Workflows (Group 2/3)
**Effort:** 2-3 hours
**Prerequisites:** Task 6 complete
**Deliverables:**
- `frontend/playwright/screenshots/workflows/changes.ts` (5 screenshots)
- `frontend/playwright/screenshots/workflows/notes.ts` (3 screenshots)
- `frontend/playwright/screenshots/workflows/filters.ts` (4 screenshots)

**Success Criteria:**
- [ ] 12 screenshot functions implemented
- [ ] All use shared helpers
- [ ] Screenshots generate successfully

**Agent Instructions:**
```
Migrate changes, notes, and filters screenshots to TypeScript.

Create:
1. frontend/playwright/screenshots/workflows/changes.ts (5 functions)
2. frontend/playwright/screenshots/workflows/notes.ts (3 functions)
3. frontend/playwright/screenshots/workflows/filters.ts (4 functions)

Refer to:
- Python implementation: tools/generate_docs_screenshots.py
- Recent fixes: agent-tmp/empty-state-fixes-results.md
- Shared helpers: frontend/playwright/helpers/

Register all in config.ts

Test: npm run screenshots:generate changes-tab notes-good-example filters-active-chips
```

---

## Task 9: Migrate Remaining Screenshots
**Phase:** 5.1d - Screenshot Workflows (Group 3/3)
**Effort:** 2-3 hours
**Prerequisites:** Task 6 complete
**Deliverables:**
- `frontend/playwright/screenshots/workflows/statistics.ts` (3 screenshots)
- `frontend/playwright/screenshots/workflows/donut.ts` (2 screenshots)
- `frontend/playwright/screenshots/workflows/tracking.ts` (2 screenshots)
- `frontend/playwright/screenshots/workflows/employees.ts` (1 screenshot)
- `frontend/playwright/screenshots/workflows/exporting.ts` (1 screenshot)

**Success Criteria:**
- [ ] 9 screenshot functions implemented
- [ ] All 41 screenshots now in TypeScript
- [ ] All generate successfully

**Agent Instructions:**
```
Migrate remaining screenshots to TypeScript.

Create 5 workflow modules:
1. statistics.ts (3 screenshots)
2. donut.ts (2 screenshots)
3. tracking.ts (2 screenshots)
4. employees.ts (1 screenshot)
5. exporting.ts (1 screenshot)

Register all in config.ts

Verify all 41 screenshots work:
npm run screenshots:generate
```

---

## Task 10: Validate Screenshot Generator Parity
**Phase:** 5.2 - Validation
**Effort:** 2-3 hours
**Prerequisites:** Tasks 7, 8, 9 complete
**Deliverables:**
- Side-by-side comparison of Python vs TypeScript screenshots
- Validation report documenting parity
- Any timing/wait adjustments needed

**Success Criteria:**
- [ ] All 33 automated screenshots generate successfully
- [ ] File sizes within 10% of Python versions
- [ ] Visual inspection confirms no regressions
- [ ] Documented any differences and reasons

**Agent Instructions:**
```
Validate TypeScript screenshot generator matches Python output.

1. Generate baseline with Python:
   python tools/generate_docs_screenshots.py
   mv resources/user-guide/internal-docs/images/screenshots screenshots-python

2. Generate with TypeScript:
   npm run screenshots:generate
   mv resources/user-guide/internal-docs/images/screenshots screenshots-typescript

3. Compare:
   - File sizes
   - Visual appearance
   - Screenshot counts

4. Document findings in agent-tmp/screenshot-migration-validation.md

5. Fix any discrepancies (timing, waits, etc.)

6. Re-run until parity achieved
```

---

## Task 11: Update CI/CD and Documentation
**Phase:** 5.3 - Integration
**Effort:** 1-2 hours
**Prerequisites:** Task 10 complete
**Deliverables:**
- `.github/workflows/screenshots.yml` (new workflow)
- Updated `README.md` with screenshot generation instructions
- Updated `CONTRIBUTING.md` with new workflow
- `tools/README.md` documenting TypeScript approach

**Success Criteria:**
- [ ] CI/CD workflow runs successfully
- [ ] Documentation reflects TypeScript approach
- [ ] All references to Python tool removed from docs

**Agent Instructions:**
```
Update CI/CD and documentation for TypeScript screenshot generator.

1. Create .github/workflows/screenshots.yml (see plan.md Step 5.3)

2. Update documentation:
   - README.md - Update screenshot generation section
   - CONTRIBUTING.md - Update documentation workflow
   - Create tools/README.md with TypeScript instructions

3. Test CI/CD workflow locally if possible

4. Document migration in CHANGELOG.md
```

---

## Task 12: Delete Python Screenshot Generator
**Phase:** 5.4 - Cutover
**Effort:** 30 minutes
**Prerequisites:** Task 11 complete
**Deliverables:**
- Python screenshot generator deleted
- All references updated
- Migration commit created

**Success Criteria:**
- [ ] tools/generate_docs_screenshots.py deleted
- [ ] No broken references in codebase
- [ ] Commit message documents migration

**Agent Instructions:**
```
Delete Python screenshot generator and finalize migration.

1. Delete Python tool:
   git rm tools/generate_docs_screenshots.py

2. Search for any remaining references:
   grep -r "generate_docs_screenshots" .

3. Update any remaining references to use TypeScript version

4. Create migration commit with message from plan.md Step 5.4

5. Verify everything still works:
   npm run screenshots:generate

6. Document completion in agent-projects/playwright-helper-consolidation/plan.md
   (Update status to "done")
```

---

## Task Dependency Graph

```
Task 1 (Create Helpers)
├── Task 2 (Refactor Test 1)
├── Task 3 (Refactor Test 2)
├── Task 4 (Refactor Test 3)
│   └── Task 5 (Validate Helpers)
└── Task 6 (Generator Infrastructure)
    ├── Task 7 (Workflows Group 1)
    ├── Task 8 (Workflows Group 2)
    └── Task 9 (Workflows Group 3)
        └── Task 10 (Validate Screenshots)
            └── Task 11 (Update CI/CD)
                └── Task 12 (Delete Python)
```

## Execution Strategy

### Parallel Track Option (Faster)
**If multiple agents available:**
- **Track A:** Tasks 1 → 2, 3, 4 → 5 (Helper consolidation)
- **Track B:** Tasks 6 → 7, 8, 9 → 10 → 11 → 12 (Screenshot migration)
- **Dependency:** Task 6 needs Task 1 complete
- **Total time:** ~15-20 hours (with parallelization)

### Sequential Option (Safer)
**If single agent or prefer validation between phases:**
- Complete Tasks 1-5 first (validate helpers work)
- Then complete Tasks 6-12 (migrate screenshots using validated helpers)
- **Total time:** ~20-30 hours

## Recommended Sequence

**Sprint 1 (Week 1):** Foundation
- Day 1-2: Task 1 (Create helpers)
- Day 3: Tasks 2, 3, 4 (Refactor tests in parallel)
- Day 4: Task 5 (Validate)
- **Outcome:** Helpers validated and working

**Sprint 2 (Week 2):** Screenshot Migration
- Day 1: Task 6 (Generator infrastructure)
- Day 2-3: Tasks 7, 8, 9 (Migrate all workflows)
- Day 4: Task 10 (Validate parity)
- Day 5: Tasks 11, 12 (CI/CD and cutover)
- **Outcome:** Full TypeScript migration complete

---

## Success Metrics

**After Task 5:**
- ✅ 12 new helper functions available
- ✅ 3 tests refactored with ~30% line reduction
- ✅ E2E test suite still 100% passing

**After Task 12:**
- ✅ Python screenshot generator deleted
- ✅ 41 screenshots generating in TypeScript
- ✅ Zero code duplication (tests + screenshots share helpers)
- ✅ Single language (TypeScript only)
- ✅ 50% reduction in maintenance surface

---

**Created:** 2025-12-23
**Project:** agent-projects/playwright-helper-consolidation/
**Tracking:** GitHub Issue #TBD
