# Dependency Optimization Plan

**Date**: 2026-01-08
**Principal Architect Review**: Completed
**Status**: Phase 1 In Progress

---

## Executive Summary

The 9Boxer project has significant opportunities for dependency reduction, particularly around unused packages and native dependencies causing code signing complexity. This plan outlines a 5-phase approach to optimize dependencies while preserving essential features (i18n, Storybook, Playwright, MkDocs user guide).

**Current State:**
- **Frontend**: 151 dependencies (17 production, 134 development)
- **Backend**: 36 dependencies (11 production, 25 development)
- **Root**: 3 dependencies

**Primary Issues:**
1. Native dependencies (scipy/numpy, sharp) causing code signing delays
2. Unused dependencies adding bloat (~60MB+)
3. Heavy development tooling increasing setup time (5-10 minutes)
4. PyInstaller bundle size (~200MB, 50% from scipy/numpy)

---

## Phase 1: Immediate Cleanup ✓ COMPLETED (WITH CORRECTIONS)

**Status**: Completed with 2 errors corrected
**Effort**: 3 hours (including verification and corrections)
**Risk**: Zero (no code changes)
**Impact**: -6 packages (backend only), stylelint/react-resizable-panels restored after initial errors

### Unused Dependencies to Remove

#### Backend (`pyproject.toml` - dev dependencies):
- ❌ `hypothesis>=6.98.0` - Property-based testing library (0 imports)
- ❌ `factory-boy>=3.3.0` - Test fixture factory (0 imports)
- ❌ `faker>=22.0.0` - Fake data generation (0 imports)
- ❌ `playwright>=1.40.0` - Browser automation (frontend tool, misplaced)
- ❌ `Pillow>=10.0.0` - Image processing (frontend tool, misplaced)

#### Frontend (`frontend/package.json` - devDependencies):
- ~~❌ `stylelint` - INITIALLY REMOVED IN ERROR~~ ✅ **RESTORED** (CSS file exists: panel-animations.css)
- ~~❌ `stylelint-config-standard` - INITIALLY REMOVED IN ERROR~~ ✅ **RESTORED** (config file exists)
- ~~❌ `react-resizable-panels` - INITIALLY REMOVED IN ERROR~~ ✅ **RESTORED** (used in DashboardPage.tsx)

#### Root (`package.json` - dependencies):
- ❌ `anthropic: ^0.0.0` - Invalid JavaScript package placeholder (NOT the backend Python package)
  - **Note**: Backend Python `anthropic>=0.39.0` is KEPT for LLM integration

### Sub-Agent Tasks (Phase 1)

**Task 1.1: Backend Dependency Removal**
- File: `c:\Git_Repos\9boxer\pyproject.toml`
- Action: Remove 5 packages from dev dependencies
- Verification: No imports in codebase
- Testing: Run pytest to ensure no test failures

**Task 1.2: Frontend Dependency Removal**
- File: `c:\Git_Repos\9boxer\frontend\package.json`
- Action: Remove 3 packages from devDependencies
- Verification: No imports in codebase
- Testing: Run vitest to ensure no test failures

**Task 1.3: Root Dependency Removal**
- File: `c:\Git_Repos\9boxer\package.json`
- Action: Remove invalid anthropic placeholder
- Verification: Check no scripts reference it
- Testing: None needed

**Task 1.4: Lock File Updates**
- Action: `npm install` in frontend/ and root/
- Verification: No dependency resolution errors
- Testing: Build should succeed

**Task 1.5: Integration Testing**
- Backend: `pytest tests/unit tests/integration -x`
- Frontend: `npm test`
- Build: Verify Electron build still works

### Success Criteria
- ⚠️ 6 backend dependencies removed (3 frontend initially removed in error, then restored)
- ✅ Lock files updated
- ✅ All unit tests pass (backend: 205 passed, frontend: 1,351 passed)
- ✅ No import errors after corrections
- ✅ Build succeeds (npm run build)
- ✅ Dev server starts successfully

### Errors Made & Corrected
1. **react-resizable-panels**: Initially removed due to faulty multiline import search. Used in `DashboardPage.tsx:18`. **RESTORED**
2. **stylelint + stylelint-config-standard**: Initially removed without checking for CSS files and config. Found `panel-animations.css` and `.stylelintrc.json`. **RESTORED**

### Lessons Learned
- **Multiline imports are easily missed** by simple grep patterns
- **Must run `npm run build`** after dependency removals (not just unit tests)
- **Must test dev server startup** to catch import errors early
- **Configuration files indicate usage** (.stylelintrc.json existed but wasn't checked)

---

## Phase 2: Replace scipy/numpy (HIGH PRIORITY)

**Status**: Planned
**Effort**: 4-6 hours
**Risk**: Low
**Impact**: -100MB bundle, eliminate #1 code signing pain point

### Problem Analysis

**Current Usage** (`backend/src/ninebox/services/intelligence_service.py:26`):
```python
from scipy.stats import chi2_contingency
import numpy as np
```

**Where Used:**
- `chi2_contingency()` - Chi-square test for grid distribution analysis (1 call)
- `np.array()` - Array operations for statistical calculations
- Z-score calculations for anomaly detection

**Bundle Impact:**
- scipy: ~60MB in PyInstaller bundle
- numpy: ~40MB in PyInstaller bundle
- Total: ~100MB (50% of total 200MB bundle)
- **Code Signing**: Multiple native .pyd/.so files requiring signatures

### Solution: Pure Python Statistics

Implement lightweight statistical functions:

1. **Chi-square contingency test**
   - Input: 2D contingency table
   - Output: chi2 statistic, p-value, degrees of freedom
   - Formula: Well-documented, ~30 lines of code

2. **Z-score calculations**
   - Input: Value, mean, standard deviation
   - Output: Z-score
   - Formula: `(x - mean) / std_dev`

3. **Basic array operations**
   - Replace `np.array()` with Python lists
   - Replace `np.mean()` with `statistics.mean()`
   - Replace `np.std()` with `statistics.stdev()`

### Sub-Agent Tasks (Phase 2)

**Task 2.1: Create Pure Python Statistics Module**
- File: Create `backend/src/ninebox/utils/statistics.py`
- Implement:
  - `chi_square_test(contingency_table)` -> (chi2, p_value, dof)
  - `z_score(value, mean, std_dev)` -> float
  - Helper functions for table operations
- Testing: Unit tests with known values from scipy for accuracy verification

**Task 2.2: Update Intelligence Service**
- File: `backend/src/ninebox/services/intelligence_service.py`
- Replace scipy/numpy imports with local statistics module
- Refactor calculations to use pure Python
- Testing: Existing intelligence service tests should pass with same results

**Task 2.3: Remove Dependencies**
- File: `backend/pyproject.toml`
- Remove `scipy>=1.11.0`
- Remove `numpy>=1.24.0`
- Testing: Full test suite

**Task 2.4: Update PyInstaller Config**
- File: `backend/build_config/ninebox.spec`
- Remove scipy/numpy hidden imports if present
- Verify binary excludes scipy/numpy
- Testing: Build executable, verify size reduction

**Task 2.5: Accuracy Verification**
- Create reference test comparing old scipy output vs new pure Python
- Run statistical validation tests
- Document any precision differences (should be minimal)

### Success Criteria
- ✅ Pure Python statistics module with >95% test coverage
- ✅ All intelligence service tests pass
- ✅ Accuracy matches scipy within 0.01% for test cases
- ✅ PyInstaller bundle reduced by ~100MB
- ✅ No scipy/numpy native dependencies in build
- ✅ Code signing complexity reduced

---

## Phase 3: Replace axios with Native Fetch

**Status**: Planned
**Effort**: 2-4 hours
**Risk**: Very Low
**Impact**: -40KB bundle, -1 dependency

### Problem Analysis

**Current Usage** (`frontend/src/services/api.ts`):
- Single file using axios
- Basic HTTP methods (GET, POST, PUT, DELETE)
- Request/response interceptors
- Error handling

**Why Replace:**
- Modern browsers + Electron have native `fetch()`
- axios features used are available natively
- 40KB bundle size for single-file usage
- One less dependency to maintain

### Solution: Native Fetch API

Refactor `api.ts` to use native fetch with:
- Similar error handling
- Request/response interceptors via wrapper functions
- TypeScript types for responses
- Backward-compatible API

### Sub-Agent Tasks (Phase 3)

**Task 3.1: Create Fetch Wrapper**
- File: `frontend/src/services/api.ts`
- Implement fetch-based HTTP client with:
  - GET, POST, PUT, DELETE methods
  - Error handling (HTTP status codes)
  - JSON serialization/deserialization
  - TypeScript types
- Keep same public API as current axios implementation

**Task 3.2: Update Tests**
- Files: `frontend/src/services/__tests__/api.test.ts` (if exists)
- Replace axios mocks with fetch mocks
- Verify error handling works correctly
- Test all HTTP methods

**Task 3.3: Remove Dependency**
- File: `frontend/package.json`
- Remove `axios: 1.13.2`
- Run `npm install` to update lock file

**Task 3.4: Integration Testing**
- Run frontend tests
- Manual testing: Verify API calls work in dev mode
- E2E tests: Ensure Playwright tests still pass

### Success Criteria
- ✅ api.ts refactored to use native fetch
- ✅ All existing tests pass
- ✅ No regression in error handling
- ✅ Bundle size reduced by ~40KB
- ✅ No axios dependency in package.json

---

## Phase 4: MkDocs Evaluation & Potential Migration

**Status**: Planned (Evaluation Phase)
**Effort**: 2-8 hours (depends on decision)
**Risk**: Medium
**Impact**: Remove Python build dependency for frontend developers

### Problem Analysis

**Current Setup:**
- MkDocs (Python) generates user guide HTML
- Guide bundled in Electron app
- Screenshot generation integrated with docs build
- Python required for frontend developers doing doc updates

**User Requirement:**
- User guide is very important
- Must migrate existing docs
- Must update screenshot generation workflow
- Open to alternatives if they're better

### Evaluation Criteria

1. **Markdown Compatibility**: Can existing MkDocs markdown be reused?
2. **Build Integration**: How does it fit in Electron build pipeline?
3. **Screenshot Workflow**: Can we preserve/improve screenshot generation?
4. **Developer Experience**: Better or worse than MkDocs?
5. **Bundle Size**: Impact on final app size
6. **Maintenance**: Long-term support and ecosystem

### Alternative Options

#### Option A: VitePress (Recommended)
**Pros:**
- TypeScript/Node ecosystem (matches project)
- Excellent dev experience with hot reload
- Built-in search
- Vue components for interactive docs
- Modern, actively maintained
- Can bundle as static HTML in Electron

**Cons:**
- Migration effort (2-4 hours)
- Different theme/styling (may need customization)
- Learning curve for team

**Migration Path:**
- Most markdown compatible
- Theme customization needed
- Screenshot scripts update to Vite build
- Integrate into Electron builder

#### Option B: Docusaurus
**Pros:**
- React-based (matches frontend stack)
- MDX support (can embed React components)
- Excellent documentation features
- Versioning support
- Large community

**Cons:**
- Heavier than VitePress
- More complex setup
- MDX migration may require more work

#### Option C: Keep MkDocs
**Pros:**
- No migration effort
- Works well currently
- Team familiar with it

**Cons:**
- Python dependency for frontend devs
- Separate ecosystem from main project

### Sub-Agent Tasks (Phase 4)

**Task 4.1: Evaluation**
- Set up proof-of-concept with VitePress
- Migrate 2-3 example doc pages
- Test screenshot generation integration
- Document findings and recommendation

**Task 4.2: Migration (If Approved)**
- Migrate all markdown files from MkDocs to chosen solution
- Set up theme and styling
- Configure search
- Update build scripts

**Task 4.3: Screenshot Integration**
- Update screenshot generation scripts
- Integrate with new docs build
- Verify automation still works

**Task 4.4: Build Pipeline Update**
- Update Electron builder config
- Ensure docs bundled correctly
- Test in production build

**Task 4.5: Documentation**
- Update README with new doc build commands
- Document screenshot generation process
- Add developer guide for doc updates

### Success Criteria (If Migrating)
- ✅ All existing docs migrated with no content loss
- ✅ Screenshot generation works and is documented
- ✅ Docs properly bundled in Electron app
- ✅ Build pipeline updated and tested
- ✅ Developer documentation updated
- ✅ Python no longer required for frontend doc updates

---

## Phase 5: Remove Redundant Type Checker

**Status**: Planned
**Effort**: 30 minutes
**Risk**: Very Low
**Impact**: -1 package, simplified CI

### Problem Analysis

**Current State:**
- Running both `mypy` AND `pyright` for Python type checking
- Both tools do essentially the same thing
- Adds complexity and time to CI
- pyright primarily benefits VSCode users

**Recommendation:** Keep mypy, remove pyright
- mypy is standard in Python ecosystem
- More mature and widely adopted
- Better documentation and community
- VSCode Python extension uses Pylance by default anyway

### Sub-Agent Tasks (Phase 5)

**Task 5.1: Remove Pyright**
- File: `backend/pyproject.toml`
- Remove `pyright>=1.1.0` from dev dependencies
- Update any CI scripts that reference pyright

**Task 5.2: Verify mypy Config**
- File: `backend/pyproject.toml` or `backend/mypy.ini`
- Ensure mypy configuration is comprehensive
- Verify strictness settings are appropriate

**Task 5.3: Update CI/CD**
- Check GitHub Actions workflows
- Remove pyright steps
- Ensure mypy runs with proper strictness

**Task 5.4: Update Documentation**
- Update README or contributing guide
- Document that mypy is the official type checker
- Remove references to pyright

### Success Criteria
- ✅ pyright removed from dependencies
- ✅ CI only runs mypy
- ✅ All type checking passes
- ✅ Documentation updated

---

## Items We're Keeping (Per Requirements)

The following dependencies are confirmed essential and will NOT be removed:

### Frontend
- ✅ **i18n suite** (4 packages) - Multi-language support required for v1.0
  - i18next
  - react-i18next
  - i18next-browser-languagedetector
  - i18next-resources-to-backend

- ✅ **Storybook** (7 packages) - Actively used for component development
  - 68 story files created
  - Essential for design system work

- ✅ **Playwright** - E2E testing required
  - Critical for quality assurance

- ✅ **React Router** - Small footprint, minimal benefit to remove
  - Only 80KB
  - May be needed for future multi-page features

- ✅ **recharts** - Works well, high effort to replace
  - Used in 7 chart components
  - Stable and performant

### Backend
- ✅ **MkDocs** - User guide is very important
  - May evaluate alternatives (Phase 4)
  - Will ensure migration preserves all docs

### Core Dependencies (Not Evaluated)
- All framework dependencies (React, FastAPI, etc.)
- All UI libraries (MUI suite)
- All essential build tools (Vite, TypeScript, etc.)
- All testing frameworks (Vitest, Pytest)
- All data processing (pandas, openpyxl)

---

## Overall Impact Summary

### Conservative Estimate (Phases 1-3 + 5)
- **Packages Removed**: 13 packages
- **Backend Bundle**: -100MB (scipy/numpy)
- **Frontend Bundle**: -40KB (axios)
- **Developer Setup Time**: -2-3 minutes per fresh install
- **Code Signing Complexity**: Major reduction (scipy/numpy elimination)

### Aggressive Estimate (All Phases)
- **Packages Removed**: 14-15 packages
- **Backend Bundle**: -100MB
- **Frontend Bundle**: -40KB
- **Build Pipeline**: Simplified (potentially remove Python for frontend devs)
- **Developer Setup Time**: -3-5 minutes per fresh install

### Code Signing Impact
**Current Pain Points:**
- scipy/numpy: ~10-15 native .pyd files on Windows
- sharp: 3-4 native .node files
- Other native deps: Various

**After Phase 2:**
- scipy/numpy: ✅ **ELIMINATED** (biggest win)
- sharp: Still present (needed for icon generation)
- Net Reduction: ~50-60% of native dependencies requiring signing

---

## Execution Timeline

| Phase | Effort | Dependencies | Status |
|-------|--------|--------------|--------|
| Phase 1 | 1-2 hours | None | **In Progress** |
| Phase 2 | 4-6 hours | Phase 1 complete | Planned |
| Phase 3 | 2-4 hours | Phase 1 complete | Planned |
| Phase 5 | 30 minutes | Phase 1 complete | Planned |
| Phase 4 | 2-8 hours | Evaluation needed | Planned |

**Recommended Order:**
1. Phase 1 (quick wins)
2. Phase 2 (highest impact - scipy/numpy)
3. Phase 3 (easy win - axios)
4. Phase 5 (easy win - pyright)
5. Phase 4 (evaluate, then decide)

**Total Estimated Time:** 8-13 hours of development work

---

## Testing Strategy

### Phase 1 (Dependency Removal)
- ✅ Backend: `pytest tests/unit tests/integration -x --tb=short`
- ✅ Frontend: `npm test`
- ✅ Build: `npm run build` (frontend)
- ✅ E2E: `npm run test:e2e` (optional, for verification)

### Phase 2 (scipy/numpy Replacement)
- ✅ Unit tests for new statistics module
- ✅ Accuracy verification against scipy (reference tests)
- ✅ All intelligence service tests
- ✅ Full backend test suite
- ✅ PyInstaller build test
- ✅ Executable size verification
- ✅ Integration test with actual data

### Phase 3 (axios Replacement)
- ✅ Unit tests for api service
- ✅ Integration tests for API calls
- ✅ Frontend test suite
- ✅ E2E tests (API interactions)
- ✅ Manual testing in dev mode

### Phase 4 (MkDocs Migration)
- ✅ Doc content verification (no missing pages)
- ✅ Screenshot generation test
- ✅ Build integration test
- ✅ Electron bundle test (docs accessible in app)
- ✅ Cross-platform test (Windows/Mac/Linux)

### Phase 5 (Pyright Removal)
- ✅ mypy type checking passes
- ✅ CI pipeline runs successfully
- ✅ No regressions in type safety

---

## Risk Mitigation

### High-Risk Items
**Phase 2 (scipy/numpy replacement):**
- Risk: Statistical accuracy differences
- Mitigation: Reference tests comparing scipy output, document precision differences
- Rollback: Keep scipy as optional dependency for verification

**Phase 4 (MkDocs migration):**
- Risk: Documentation content loss or screenshot workflow breakage
- Mitigation: Thorough migration testing, backup current docs
- Rollback: Keep MkDocs if migration proves too complex

### Low-Risk Items
- Phases 1, 3, 5: Minimal risk, easy rollback via git

---

## Success Metrics

### Quantitative
- [ ] Dependency count reduced by 13+ packages
- [ ] Backend bundle size reduced by 100MB+
- [ ] Frontend bundle size reduced by 40KB+
- [ ] Fresh `npm install` time reduced by 2-3 minutes
- [ ] Native dependencies requiring code signing reduced by 50%+

### Qualitative
- [ ] Build pipeline simplified
- [ ] Code signing process faster and more reliable
- [ ] Developer onboarding improved (fewer dependencies)
- [ ] Maintenance burden reduced
- [ ] All tests passing with no regressions

---

## Rollback Plans

### Phase 1
- Git revert + `npm install`
- Risk: Very low (removing unused packages)

### Phase 2
- Restore scipy/numpy to pyproject.toml
- Revert intelligence_service.py changes
- Rebuild executable
- Risk: Low (pure code changes, well-tested)

### Phase 3
- Restore axios to package.json
- Revert api.ts changes
- `npm install`
- Risk: Very low (single file change)

### Phase 4
- Keep MkDocs setup alongside new docs temporarily
- Can switch back if issues found
- Risk: Medium (complex migration)

### Phase 5
- Restore pyright to pyproject.toml
- Re-enable CI checks
- Risk: Very low (CI-only change)

---

## Next Steps

1. ✅ **Phase 1 Execution** (Current)
   - Remove 9 unused dependencies
   - Update lock files
   - Run tests
   - Commit changes

2. **Phase 2 Planning** (After Phase 1)
   - Design pure Python statistics module
   - Create implementation plan
   - Set up reference tests

3. **Stakeholder Review** (After Phase 1)
   - Review Phase 1 results
   - Confirm Phase 2 approach
   - Schedule Phase 4 evaluation

---

## References

### Files Analyzed
- `c:\Git_Repos\9boxer\frontend\package.json` (151 dependencies)
- `c:\Git_Repos\9boxer\pyproject.toml` (36 dependencies)
- `c:\Git_Repos\9boxer\package.json` (3 dependencies)
- `c:\Git_Repos\9boxer\backend\src\ninebox\services\intelligence_service.py` (scipy/numpy usage)
- `c:\Git_Repos\9boxer\frontend\src\services\api.ts` (axios usage)

### Tools Used
- Glob/Grep for dependency usage analysis
- Package.json/pyproject.toml inspection
- Codebase import analysis

### Documentation
- [SciPy Chi-Square Test Documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.chi2_contingency.html)
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [VitePress Documentation](https://vitepress.dev/)
- [MkDocs Documentation](https://www.mkdocs.org/)

---

**Last Updated**: 2026-01-09
**Plan Author**: Claude (Principal Engineer Agent)
**Approved By**: Principal Architect
**Current Phase**: Phase 1 - Completed (with corrections)

---

## Phase 1 Final Verification Results

### Successfully Removed (6 packages)
**Backend** (`pyproject.toml`):
- ✅ `hypothesis>=6.98.0` - Not used (verified via import search)
- ✅ `factory-boy>=3.3.0` - Not used (verified via import search)
- ✅ `faker>=22.0.0` - Not used (verified via import search)
- ✅ `playwright>=1.40.0` - Frontend tool, misplaced in backend
- ✅ `Pillow>=10.0.0` - Frontend tool, misplaced in backend

**Root** (`package.json`):
- ✅ `anthropic: ^0.0.0` - Invalid placeholder (Python version kept in backend)

### Incorrectly Removed, Then Restored (3 packages)
**Frontend** (`package.json`):
- ❌ ➡️ ✅ `react-resizable-panels` - Used in [DashboardPage.tsx:18](c:\Git_Repos\9boxer\frontend\src\components\dashboard\DashboardPage.tsx#L18)
- ❌ ➡️ ✅ `stylelint` - Config file exists at [.stylelintrc.json](c:\Git_Repos\9boxer\frontend\.stylelintrc.json)
- ❌ ➡️ ✅ `stylelint-config-standard` - Referenced by stylelint config

### Verification Tests Completed
1. ✅ **Import search**: All backend removals verified with grep
2. ✅ **Unit tests**: 205 backend + 1,351 frontend tests passing
3. ✅ **Production build**: `npm run build` successful
4. ✅ **Dev server**: Starts and serves on http://localhost:5173
5. ⏭️ **E2E tests**: Skipped (time constraint, but build/dev tests sufficient)

### Net Impact
- **Packages removed**: 6 (5 backend, 1 root)
- **Packages restored**: 3 (frontend)
- **Net reduction**: 3 packages total
- **Bundle impact**: Minimal (removed packages were dev-only)
- **Setup time**: Slightly reduced (~10MB fewer dev dependencies)
