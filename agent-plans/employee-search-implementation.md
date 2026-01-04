# Global Employee Search Implementation Plan

**Date Created**: 2026-01-03
**Status**: In Progress
**Current Phase**: Phase 1

## Overview

Implement global employee search with type-ahead, fuzzy matching, and international name support using Fuse.js + MUI Autocomplete. This feature will enhance two areas:
1. Filter Toolbar search bar (currently non-functional)
2. People Exclusion Dialog search (currently basic string matching)

## Technical Assessment

### Current State
- **Filter Toolbar**: Has non-functional search TextField at line 307-329
- **Exclusion Dialog**: Uses basic `toLowerCase().includes()` matching
- **Employee Data**: Rich structure with 20+ fields, 6 highly searchable
- **Dependencies**: MUI v5.14.20 installed, Fuse.js NOT installed
- **Search Capability**: No fuzzy matching exists anywhere in codebase

### Proposal Validation
- ✅ MUI Autocomplete already available and used (EmployeeFlags.tsx)
- ✅ Clean integration points via `useEmployees()` and `selectEmployee()`
- ✅ Appropriate scale: 200 employees in sample data
- ✅ Fuse.js size: 3KB gzipped (acceptable overhead)
- ⚠️ Need to add Fuse.js dependency
- ⚠️ Need shared hook for both integration points

## Implementation Phases

---

## Phase 1: Dependencies & Core Hook

**Objective**: Install Fuse.js and create reusable search hook

### Agent Assignments

#### Task 1.1: Install Fuse.js
**Agent**: general-purpose
**Command**: `npm install fuse.js`
**Files Modified**: `frontend/package.json`, `frontend/package-lock.json`
**Validation**: Verify Fuse.js appears in dependencies

#### Task 1.2: Create useEmployeeSearch Hook
**Agent**: general-purpose
**File Created**: `frontend/src/hooks/useEmployeeSearch.ts`

**Implementation Requirements**:
```typescript
interface UseEmployeeSearchOptions {
  employees: Employee[];
  threshold?: number;
}

interface UseEmployeeSearchResult {
  search: (query: string) => Employee[];
  isReady: boolean;
}

export function useEmployeeSearch(options: UseEmployeeSearchOptions): UseEmployeeSearchResult
```

**Fuse.js Configuration**:
- **Keys & Weights**:
  - `name`: 0.50 (highest priority)
  - `business_title`: 0.25
  - `job_level`: 0.15 (users search "MT2", "VP")
  - `manager`: 0.10
  - `job_function`: 0.05 (e.g., "Engineering")
- **Options**:
  - `threshold`: 0.3 (configurable, default 0.3)
  - `ignoreLocation`: true (match anywhere in string)
  - `minMatchCharLength`: 2
  - `includeScore`: true (for result ranking)
- **Performance**:
  - Use `useMemo` for Fuse instance (re-create when employees change)
  - Return top 10 results for autocomplete
- **Edge Cases**:
  - Empty query returns empty array
  - No employees returns empty array
  - Unicode normalization for diacritics

**Acceptance Criteria**:
- [ ] Hook returns search function and isReady flag
- [ ] Fuse instance memoized on employees array
- [ ] Search returns Employee[] sorted by relevance score
- [ ] Handles empty/null queries gracefully
- [ ] TypeScript types fully defined

### Quality Gate 1: Principal-Engineer Review

**Agent**: principal-engineer
**Focus Areas**:
- Hook API design (is it reusable and composable?)
- Fuse.js configuration choices (weights, threshold)
- Performance considerations (memoization, result limits)
- TypeScript type safety
- Edge case handling
- Potential technical debt

**Review Deliverable**: Architecture review document or approval to proceed

---

## Phase 2: Filter Toolbar Integration

**Objective**: Replace non-functional search TextField with Autocomplete using Fuse.js

### Agent Assignments

#### Task 2.1: Update FilterToolbar Component
**Agent**: general-purpose
**File Modified**: `frontend/src/components/common/FilterToolbar.tsx`
**Lines Modified**: 307-329 (replace TextField)

**Implementation Requirements**:
- Import `useEmployeeSearch` hook
- Replace TextField with MUI Autocomplete
- **Props Configuration**:
  ```typescript
  <Autocomplete<Employee>
    options={employees}  // from useEmployees() - filtered set
    getOptionLabel={(option) => option.name}
    filterOptions={(options, { inputValue }) => search(inputValue)}
    onChange={(_, value) => onEmployeeSelect(value?.employee_id)}
    renderInput={(params) => (
      <TextField {...params} placeholder={t('filters.searchEmployees')} />
    )}
    renderOption={(props, employee) => (
      <li {...props}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2">{employee.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {employee.job_level} • {employee.manager}
          </Typography>
        </Box>
      </li>
    )}
    noOptionsText={t('filters.noEmployeesFound')}
    size="small"
    sx={{ width: 180 }}  // Match existing search field width
  />
  ```
- Use existing theme tokens for spacing/typography
- Maintain 32px height (same as old TextField)

**Acceptance Criteria**:
- [ ] Autocomplete replaces TextField at same location
- [ ] Search uses filtered employees (respects active filters)
- [ ] 10-result limit applied
- [ ] Custom renderOption shows name, level, manager
- [ ] "No employees found" empty state
- [ ] Maintains compact variant styling

#### Task 2.2: Update FilterToolbarContainer
**Agent**: general-purpose
**File Modified**: `frontend/src/components/common/FilterToolbarContainer.tsx`

**Implementation Requirements**:
- Import `selectEmployee` from `useEmployees()` hook
- Pass `onEmployeeSelect` handler to FilterToolbar
- Ensure filtered employees are passed to FilterToolbar

**Acceptance Criteria**:
- [ ] `selectEmployee` function passed to FilterToolbar
- [ ] Employee selection triggers detail panel focus
- [ ] Container remains stateless (no new state)

### Quality Gate 2: Principal-Engineer Review

**Agent**: principal-engineer
**Focus Areas**:
- Component composition and prop design
- Search scope decision (filtered vs all employees)
- UI/UX considerations (autocomplete behavior, keyboard nav)
- Integration with existing filter system
- Accessibility (ARIA labels, keyboard navigation)
- Potential layout/styling issues
- Technical debt assessment

**Review Deliverable**: Architecture review + approval to proceed

---

## Phase 3: Exclusion Dialog Enhancement

**Objective**: Replace basic string matching with fuzzy search in ExclusionDialog

### Agent Assignments

#### Task 3.1: Update ExclusionDialog Search
**Agent**: general-purpose
**File Modified**: `frontend/src/components/dashboard/ExclusionDialog.tsx`

**Implementation Requirements**:
- Import `useEmployeeSearch` hook
- Replace existing `filteredEmployees` logic (lines with `toLowerCase().includes()`)
- Use fuzzy search instead of basic matching
- **Search Integration**:
  ```typescript
  const { search } = useEmployeeSearch({
    employees: allEmployees,
    threshold: 0.3
  });

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return allEmployees;
    return search(searchTerm);
  }, [allEmployees, searchTerm, search]);
  ```
- Keep existing UI (checkbox list, quick filter buttons)
- Maintain select-all functionality

**Acceptance Criteria**:
- [ ] Fuzzy search replaces basic includes() matching
- [ ] Existing checkbox list UI unchanged
- [ ] Quick filter buttons still work
- [ ] Search respects active filters
- [ ] Performance acceptable with 200+ employees

### Quality Gate 3: Principal-Engineer Review

**Agent**: principal-engineer
**Focus Areas**:
- Consistency with FilterToolbar search behavior
- UX impact (fuzzy vs exact matching in checkbox list)
- Performance with large employee lists
- Edge cases (exclusions + search interaction)
- Code duplication opportunities
- Technical debt assessment

**Review Deliverable**: Architecture review + approval to proceed

---

## Phase 4: Testing & Internationalization

**Objective**: Add comprehensive tests and i18n support

### Agent Assignments

#### Task 4.1: Add i18n Translation Keys
**Agent**: general-purpose
**File Modified**: `frontend/src/i18n/locales/en/translation.json`

**Keys to Add**:
```json
{
  "filters": {
    "searchEmployees": "Search employees...",
    "noEmployeesFound": "No employees found",
    "searchResultCount": "{{count}} result(s)"
  }
}
```

**Acceptance Criteria**:
- [ ] Translation keys added to en/translation.json
- [ ] Keys follow existing naming conventions
- [ ] Placeholders properly formatted ({{count}})

#### Task 4.2: Test Strategy Design
**Agent**: test-architect
**Deliverable**: Test strategy document covering:
- Unit test approach for `useEmployeeSearch` hook
- Integration tests for FilterToolbar autocomplete
- Fixture design for employee search scenarios
- Performance test criteria (<50ms for 200 employees)
- Anti-fragile test patterns (avoid brittle selectors)

#### Task 4.3: Create useEmployeeSearch Tests
**Agent**: general-purpose (following test-architect strategy)
**File Created**: `frontend/src/hooks/__tests__/useEmployeeSearch.test.ts`

**Test Cases**:
```typescript
describe('useEmployeeSearch', () => {
  // Basic functionality
  test('returns empty array for empty query')
  test('returns employees matching name exactly')
  test('returns employees with fuzzy name match')

  // Weighted field search
  test('prioritizes name matches over title matches')
  test('searches across business_title field')
  test('searches across job_level field')
  test('searches across manager field')

  // Edge cases
  test('handles empty employee array')
  test('handles null/undefined query')
  test('handles special characters in query')

  // International support
  test('matches names with diacritics (José, François)')
  test('handles CJK characters if available in test data')

  // Performance
  test('returns results in <50ms for 200 employees')
  test('limits results to 10 items')

  // Memoization
  test('re-creates Fuse instance when employees change')
  test('does not re-create Fuse when query changes')
});
```

**Acceptance Criteria**:
- [ ] All test cases pass
- [ ] Coverage > 90% for useEmployeeSearch.ts
- [ ] Tests use anti-fragile patterns
- [ ] Performance test validates <50ms

#### Task 4.4: Update FilterToolbar Tests
**Agent**: general-purpose (following test-architect strategy)
**File Modified**: `frontend/src/components/common/__tests__/FilterToolbar.test.tsx`

**Test Cases to Add**:
```typescript
describe('FilterToolbar - Employee Search', () => {
  test('renders Autocomplete component')
  test('calls onEmployeeSelect when employee chosen')
  test('shows "No employees found" for no matches')
  test('displays employee name, level, manager in options')
  test('respects filtered employee list')
  test('limits results to 10 suggestions')
});
```

**Acceptance Criteria**:
- [ ] All new tests pass
- [ ] Existing FilterToolbar tests still pass
- [ ] No test flakiness introduced

### Quality Gate 4: Principal-Engineer Review

**Agent**: principal-engineer
**Focus Areas**:
- Test coverage and quality
- Test anti-fragility (will tests break with UI changes?)
- i18n key naming and structure
- Missing test scenarios
- Performance test validity
- Technical debt in test code

**Review Deliverable**: Test quality assessment + approval to proceed

---

## Phase 5: Performance Validation & Final Review

**Objective**: Validate performance and conduct final architecture review

### Agent Assignments

#### Task 5.1: Performance Analysis
**Agent**: react-performance-analyst
**Focus Areas**:
- Autocomplete render performance with 200 employees
- Fuse.js search performance (<50ms target)
- FilterToolbar re-render patterns
- useMemo effectiveness
- Bundle size impact (+12KB for Fuse.js)
- Potential memory leaks with large employee lists
- Recommendations for optimization

**Deliverable**: Performance analysis report

#### Task 5.2: Performance Optimizations (if needed)
**Agent**: general-purpose (based on analyst recommendations)
**Possible Optimizations**:
- Debounce autocomplete input (if needed)
- Virtualize results list (if >10 results shown)
- Lazy load Fuse.js (code splitting)
- Adjust Fuse.js threshold based on performance data

### Quality Gate 5: Final Principal-Engineer Review

**Agent**: principal-engineer
**Focus Areas**:
- Overall architecture quality
- Code consistency across all phases
- Performance characteristics
- Maintainability and extensibility
- Technical debt introduced
- Documentation needs
- Production readiness

**Review Deliverable**: Final architecture sign-off or remediation plan

---

## Success Criteria

### Functional Requirements
- [ ] FilterToolbar search uses fuzzy matching
- [ ] ExclusionDialog search uses fuzzy matching
- [ ] Search returns relevant results with typo tolerance
- [ ] Autocomplete shows top 10 results
- [ ] Employee selection navigates to detail panel
- [ ] Search respects active filters
- [ ] "No employees found" empty state works

### Performance Requirements
- [ ] Search completes in <50ms for 200 employees
- [ ] No noticeable UI lag when typing
- [ ] Bundle size increase < 15KB
- [ ] No memory leaks detected

### Quality Requirements
- [ ] Test coverage > 85% for new code
- [ ] All tests pass (unit + integration)
- [ ] TypeScript strict mode compliance
- [ ] Accessibility (ARIA, keyboard navigation)
- [ ] i18n support for all user-facing text
- [ ] Consistent with existing design system

### Code Quality
- [ ] Passes all principal-engineer reviews
- [ ] No high-priority technical debt introduced
- [ ] Consistent with existing patterns
- [ ] Properly documented (JSDoc for public APIs)

## Risk Mitigation

### Risk 1: Performance Degradation
- **Mitigation**: Performance testing at Phase 5
- **Fallback**: Increase threshold, reduce result limit, add debouncing

### Risk 2: UX Confusion (fuzzy vs exact)
- **Mitigation**: User testing, tooltip explaining fuzzy search
- **Fallback**: Add toggle for exact/fuzzy mode

### Risk 3: International Name Support Fails
- **Mitigation**: Test with diverse sample data
- **Fallback**: Fuse.js has built-in unicode normalization

### Risk 4: Integration Conflicts
- **Mitigation**: Architect reviews at each phase
- **Fallback**: Revert to basic search, investigate separately

## Dependencies

### External
- Fuse.js v6.6.2 (latest stable)

### Internal
- MUI Autocomplete (@mui/material v5.14.20)
- i18next (v25.7.3)
- useEmployees hook
- useFilters hook
- Employee TypeScript types

## Timeline

- **Phase 1**: ~1-2 hours (dependency + hook)
- **Phase 2**: ~2-3 hours (FilterToolbar integration)
- **Phase 3**: ~1-2 hours (ExclusionDialog update)
- **Phase 4**: ~3-4 hours (testing + i18n)
- **Phase 5**: ~1-2 hours (performance validation)
- **Total**: ~8-13 hours (with reviews)

## Notes

- Search operates on filtered employee set (respects active filters)
- Shared `useEmployeeSearch` hook promotes code reuse
- Architect reviews ensure quality gates at each phase
- Performance analyst validates production readiness
- Test architect ensures anti-fragile test patterns

---

**Last Updated**: 2026-01-03
**Next Review**: After Phase 1 completion
