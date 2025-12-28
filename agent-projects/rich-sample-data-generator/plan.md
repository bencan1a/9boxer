# Rich Sample Data Generator

```yaml
status: active
owner: claude
created: 2025-12-28
summary:
  - Create comprehensive sample dataset generator (200-300 employees)
  - Include complete management chains (6 levels), 3-year performance history
  - Add detectable bias patterns for intelligence statistics validation
  - Integrate with app UI (empty state + File menu)
  - Support all 28 Excel schema columns
```

## Problem Statement

Current sample data generation creates minimal test fixtures (5-50 employees) with:
- Missing performance history (only 60% have any history)
- Incomplete management chains (chain 04-06 only)
- Limited diversity (3 locations, 2 functions)
- Insufficient for intelligence statistics (need 30+ minimum)
- No examples of all 8 flag types

**User Impact:**
- New users can't explore features with realistic data
- Tutorials lack compelling datasets
- Intelligence panel doesn't show insights with sample data
- Testing requires manual Excel file creation

## Solution Approach

### Backend Generator
**File:** `backend/src/ninebox/services/sample_data_generator.py`

Components:
1. **RichDatasetConfig** - Configuration dataclass
   - `size: int` (default 200)
   - `include_bias: bool` (default True)
   - `seed: int | None` (for reproducibility)
   - `locations: list[str]` (default 6-8 locations)
   - `job_functions: list[str]` (default 8 functions)

2. **ManagementChainBuilder** - Org hierarchy generator
   - 6 management levels (CEO → VP → Director → Manager → Senior IC → IC)
   - Realistic span of control: 5-15 direct reports
   - Validation: No orphans, no cycles
   - Realistic titles by level

3. **PerformanceHistoryGenerator** - Multi-year ratings
   - 3 years of history (2023, 2024, 2025)
   - 80% have complete history
   - 20% have gaps (new hires, tenure < 3 years)
   - Variance: Some improve, some decline, some stable

4. **RichEmployeeGenerator** - Main orchestrator
   - All 28 Excel columns populated
   - Distributions:
     - Locations: USA, CAN, GBR, DEU, FRA, IND, AUS, SGP
     - Functions: Engineering, Product, Sales, Marketing, Operations, Design, Data, HR
     - Levels: MT1-MT6 (realistic pyramid: more ICs than managers)
     - Grid positions: All 9 positions covered
     - Flags: All 8 types distributed (10-20% of employees)
   - **Bias patterns** (for intelligence detection):
     - USA location: +15% high performers (bias toward one location)
     - Sales function: +20% high performers (bias toward one function)

### API Endpoint
**File:** `backend/src/ninebox/routers/employees.py`

```
POST /api/employees/generate-sample
Request: { size: 200, include_bias: true, seed: 42 }
Response: { employees: Employee[], metadata: { total: 200, bias_patterns: [...] } }
```

### Frontend Integration

**Empty State Component** (`frontend/src/components/EmptyState.tsx`):
- Display when no employees loaded
- "Load Sample Data" button (primary action)
- "Upload Excel File" button (secondary action)
- Tutorial hints

**File Menu** (`frontend/src/components/MenuBar.tsx`):
- File → Load Sample Dataset (200 employees)
- Confirmation dialog if data exists
- Progress indicator during generation

**Sample Data Service** (`frontend/src/services/sampleDataService.ts`):
- API client for `/api/employees/generate-sample`
- Error handling and loading states
- Data transformation if needed

## Implementation Waves

### Wave 1 (Parallel)
- **Agent A:** Core generator logic + unit tests
- **Agent C:** Empty state component + Storybook

### Wave 2 (Parallel - after Agent A)
- **Agent B:** API endpoint + integration tests
- **Agent D:** File menu integration + sample data service

### Wave 3 (Parallel - after Wave 2)
- **Agent E:** E2E tests (sample data flows)
- **Agent F:** Migrate existing test fixtures
- **Agent G:** User guide updates
- **Agent H:** Architecture documentation

## Testing Strategy

### Unit Tests
**File:** `backend/tests/unit/services/test_sample_data_generator.py`

- Test org hierarchy (no orphans, no cycles)
- Test management chain completeness (all 6 levels)
- Test bias patterns (statistical validation: USA +15%, Sales +20%)
- Test schema completeness (all 28 columns)
- Test reproducibility (same seed = same data)
- Test distributions (locations, functions, levels, grid positions)
- Test flag distribution (all 8 types present)

### Integration Tests
**File:** `backend/tests/integration/test_sample_data_api.py`

- Test API endpoint response structure
- Test large dataset generation (300 employees)
- Test performance (<2 seconds for 300 employees)

### Component Tests
**Files:**
- `frontend/src/components/__tests__/EmptyState.test.tsx`
- `frontend/src/services/__tests__/sampleDataService.test.ts`

- Test empty state display conditions
- Test button click handlers
- Test loading states
- Test error handling

### E2E Tests
**File:** `frontend/playwright/e2e/sample-data-flow.spec.ts`

- Test: Load sample data from empty state
- Test: Load sample data from File menu
- Test: Intelligence stats detect bias patterns
- Test: Grid displays all employees correctly

### Regression Tests
- Ensure all 372 existing tests still pass
- Migrate `sample_employees` fixture to use new generator (50 employees)
- Keep old `create_test_employee` as fallback

## Documentation

### User Guide
**File:** `resources/user-guide/docs/getting-started.md`

Section: "Loading Sample Data"
- What: 200 employees with realistic patterns
- How: Empty state button OR File → Load Sample Dataset
- Use cases: Tutorials, feature exploration, testing
- Storybook screenshot references

### Architecture Docs
**File:** `internal-docs/architecture/SAMPLE_DATA_GENERATION.md`

- Generator architecture diagram
- Component descriptions
- Bias patterns and rationale
- Performance characteristics
- Extension guide (how to add new patterns)

### Storybook Stories
- `EmptyState.stories.tsx` - Empty state variants
- `LoadSampleDialog.stories.tsx` - Load sample confirmation dialog

## Success Criteria

✅ **Functionality:**
- 200-300 employees generated with all 28 columns
- Management chain: 6 levels, 5-15 span, no orphans/cycles
- Performance history: 3 years, 80% complete, variance
- All 9 grid positions covered
- All 8 flag types distributed

✅ **Intelligence:**
- Bias patterns detectable (USA +15%, Sales +20%)
- Intelligence panel shows 2+ insights with sample data

✅ **Quality:**
- All 372 existing tests pass
- New unit tests: >80% coverage
- E2E tests pass
- Type checking passes (mypy + pyright)
- Linting passes (ruff + eslint)

✅ **Performance:**
- Generate 300 employees in <2 seconds (backend)
- Load sample data in <3 seconds (end-to-end)

✅ **User Experience:**
- Empty state button works
- File menu item works
- Confirmation dialog prevents accidental data loss
- Progress indicator shows loading state

✅ **Documentation:**
- User guide updated with screenshots
- Architecture docs created
- Storybook stories for new components

## Risks & Mitigations

**Risk:** Breaking existing tests
- **Mitigation:** Keep old `create_test_employee()` as fallback, migrate incrementally, validate before merging

**Risk:** Performance with 300 employees
- **Mitigation:** Benchmark early, optimize if needed (target <2s), use caching for repeated calls

**Risk:** Bias patterns too subtle or too obvious
- **Mitigation:** Unit tests validate statistical significance (chi-square test), manual validation with intelligence panel

**Risk:** Management chain complexity
- **Mitigation:** Thorough validation (no orphans, no cycles), visualization in tests, edge case testing

## Open Questions

1. Should sample data persist across sessions? (Current: No, regenerate each time)
2. Should we offer multiple presets? (e.g., "Small 50", "Medium 100", "Large 300")
3. Should users be able to customize bias patterns? (Current: Fixed patterns)

## Timeline Estimate

- **Wave 1:** Backend generator + Empty state (~2-3 days)
- **Wave 2:** API + File menu (~1-2 days)
- **Wave 3:** Testing + Docs (~2-3 days)
- **Total:** ~5-8 days with parallel execution

## Dependencies

- None (self-contained feature)

## Related Work

- Existing test fixtures in `backend/tests/conftest.py`
- Intelligence statistics requirements in `backend/src/ninebox/services/intelligence_service.py`
- Excel schema in `backend/src/ninebox/services/excel_service.py`
