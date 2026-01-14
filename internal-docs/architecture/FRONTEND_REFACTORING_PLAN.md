# Frontend Architecture Refactoring Plan

**Date**: January 4, 2026
**Author**: Principal Architect
**Status**: Planning
**Milestone**: [fe-arch-review](https://github.com/bencan1a/9boxer/milestone/15)

## Executive Summary

This document outlines a comprehensive refactoring plan for the 9Boxer frontend based on an architectural review conducted on January 4, 2026. The review identified **16 issues** across critical, high, and medium/low priority categories.

**Overall Codebase Grade**: B+

The codebase demonstrates strong engineering fundamentals with good component structure and testing practices. However, several architectural improvements will significantly enhance maintainability, scalability, and developer productivity.

## Key Metrics

- **Total Issues**: 16
- **Critical**: 3 (6 days effort)
- **High Priority**: 5 (8 days effort)
- **Medium/Low Priority**: 8 (4 days effort)
- **Total Estimated Effort**: ~18 days

## Refactoring Strategy

### Phase 1: Foundation (Critical Issues) - 6 Days

**Goal**: Eliminate blocking technical debt that affects multiple areas of the codebase.

#### 1.1 Refactor useEmployees Hook (#231)
**Effort**: 3 days
**Priority**: CRITICAL
**Blocking**: Multiple other refactorings

**Current State**:
- [frontend/src/hooks/useEmployees.tsx](frontend/src/hooks/useEmployees.tsx) is 400+ lines
- Violates Single Responsibility Principle
- Handles data fetching, filtering, sorting, and org hierarchy

**Target State**:
```
hooks/
  useEmployeeData.tsx       - Data fetching only
  useEmployeeFilters.tsx    - Filter logic
  useEmployeeSorting.tsx    - Sort logic
  useOrgHierarchy.tsx       - Organization structure
```

**Implementation Steps**:
1. Create new hook files with empty implementations
2. Extract data fetching logic to `useEmployeeData`
3. Extract filter logic to `useEmployeeFilters`
4. Extract sorting logic to `useEmployeeSorting`
5. Extract org hierarchy to `useOrgHierarchy`
6. Update `useEmployees` to compose the new hooks
7. Update all components using `useEmployees`
8. Add tests for each new hook
9. Remove old implementation

**Success Criteria**:
- Each hook < 100 lines
- 80%+ test coverage for each hook
- All existing functionality preserved
- No regressions in employee management features

#### 1.2 Consolidate Org Hierarchy Logic (#232)
**Effort**: 2 days
**Priority**: CRITICAL
**Dependencies**: Complements #231

**Current State**:
Duplicated logic in 3 locations:
- [frontend/src/components/OrgChart/OrgChart.tsx:45-120](frontend/src/components/OrgChart/OrgChart.tsx#L45-L120)
- [frontend/src/hooks/useEmployees.tsx:200-250](frontend/src/hooks/useEmployees.tsx#L200-L250)
- [frontend/src/components/Employee/EmployeeCard.tsx:80-95](frontend/src/components/Employee/EmployeeCard.tsx#L80-L95)

**Target State**:
```
services/
  orgHierarchy.ts           - Pure functions for org hierarchy
    - buildHierarchy(employees)
    - findReports(employee, allEmployees)
    - getManagerChain(employee, allEmployees)
    - calculateDepth(employee, allEmployees)

hooks/
  useOrgHierarchy.tsx       - React hook wrapping service
```

**Implementation Steps**:
1. Create `services/orgHierarchy.ts` with consolidated logic
2. Add comprehensive unit tests (edge cases: cycles, orphans, etc.)
3. Create `useOrgHierarchy` hook wrapping the service
4. Update OrgChart component to use service
5. Update EmployeeCard component to use service
6. Update useEmployees to use service (or integrate with #231)
7. Remove duplicate implementations

**Success Criteria**:
- Single source of truth for org hierarchy
- 90%+ test coverage for service
- All edge cases handled (circular references, missing managers, etc.)
- Performance benchmarks meet requirements

#### 1.3 Standardize Error Handling (#233)
**Effort**: 1 day
**Priority**: CRITICAL
**Impact**: User experience

**Current State**:
- Inconsistent error handling patterns
- Mix of try/catch, error boundaries, silent failures
- No centralized error tracking

**Target State**:
```
components/
  ErrorBoundary.tsx         - Global error boundary

hooks/
  useErrorHandler.tsx       - Consistent error state management

utils/
  errorUtils.ts             - Error formatting and logging

constants/
  errorMessages.ts          - User-facing error messages
```

**Implementation Steps**:
1. Create `ErrorBoundary` component with fallback UI
2. Create `useErrorHandler` hook with toast integration
3. Create `errorUtils.ts` for error formatting
4. Define standard error messages in `errorMessages.ts`
5. Update API client utilities to use standard error handling
6. Wrap app in ErrorBoundary
7. Update components to use `useErrorHandler`
8. Add error tracking integration points (e.g., Sentry)

**Success Criteria**:
- Consistent error messages across app
- All API errors properly handled
- Error boundary catches unhandled errors
- Developer-friendly console logs
- User-friendly toast notifications

### Phase 2: Component Refactoring (High Priority) - 8 Days

**Goal**: Improve component architecture, reduce complexity, and enhance reusability.

#### 2.1 Refactor EmployeeFilters Component (#235)
**Effort**: 2 days
**Priority**: HIGH

**Current State**:
- [frontend/src/components/Employee/EmployeeFilters.tsx](frontend/src/components/Employee/EmployeeFilters.tsx) is 200+ lines
- Mixes UI and business logic

**Target State**:
```
components/Employee/
  EmployeeFilters.tsx       - Composition layer
  filters/
    FilterByRole.tsx
    FilterByDepartment.tsx
    FilterByPerformance.tsx
    FilterByDateRange.tsx
```

**Implementation Steps**:
1. Extract filter logic to `useEmployeeFilters` (from Phase 1)
2. Create sub-components for each filter type
3. Update EmployeeFilters to compose sub-components
4. Add tests for each sub-component
5. Verify no regressions

**Success Criteria**:
- Main component < 100 lines
- Each sub-component < 50 lines
- Business logic in hooks, not components
- Full test coverage

#### 2.2 Eliminate Prop Drilling in Calibration (#236)
**Effort**: 2 days
**Priority**: HIGH

**Target State**:
```
contexts/
  CalibrationContext.tsx    - Context provider

hooks/
  useCalibration.tsx        - Hook to access context
```

**Implementation Steps**:
1. Create `CalibrationContext` with provider
2. Move shared state to context (selected employees, session data, UI state)
3. Create `useCalibration` hook
4. Update calibration components to use context
5. Remove prop drilling
6. Add tests

**Success Criteria**:
- No props passed through 3+ levels
- Components decoupled from parent structure
- Easy to refactor component tree

#### 2.3 Add Loading States to Async Operations (#238)
**Effort**: 1.5 days
**Priority**: HIGH

**Target State**:
```
hooks/
  useAsyncOperation.tsx     - Consistent async handling

components/
  LoadingSpinner.tsx
  SkeletonLoader.tsx

Button.tsx                  - Loading state variant
```

**Implementation Steps**:
1. Create `useAsyncOperation` hook
2. Create loading components (spinner, skeleton)
3. Add loading state to Button component
4. Update all async operations to show loading
5. Add optimistic updates where appropriate

**Success Criteria**:
- All async operations have loading indicators
- No duplicate loading implementations
- Smooth user experience

#### 2.4 Standardize Type Definitions (#239)
**Effort**: 1.5 days
**Priority**: HIGH

**Approach**:
- `interface` for object shapes (props, API responses)
- `type` for unions, intersections, and mapped types

**Implementation Steps**:
1. Document convention in coding standards
2. Create ESLint rule to enforce
3. Refactor existing types to follow convention
4. Add to PR review checklist

**Success Criteria**:
- Clear convention established
- ESLint enforces convention
- Existing code refactored

#### 2.5 Extract Business Logic from Components (#240)
**Effort**: 1 day
**Priority**: HIGH

**Target State**:
```
services/
  performanceCalculations.ts
  calibrationRules.ts
  validationRules.ts
```

**Implementation Steps**:
1. Identify hard-coded business logic in components
2. Create service files for each domain
3. Extract logic to services with tests
4. Update components to use services
5. Verify no regressions

**Success Criteria**:
- Business logic independently testable
- Components only handle UI
- 80%+ test coverage for services

### Phase 3: Optimization & Polish (Medium/Low Priority) - 4 Days

**Goal**: Improve code quality, performance, and maintainability.

#### 3.1 Split Large Components (#242)
**Effort**: 1 day
**Priority**: MEDIUM

Split components exceeding 150 lines:
- Dashboard → DashboardHeader, DashboardStats, DashboardGrid
- EmployeeList → EmployeeListHeader, EmployeeListFilters, EmployeeListTable

#### 3.2 Replace Magic Numbers (#243)
**Effort**: 0.5 days
**Priority**: MEDIUM

Create constants directories:
- `constants/performance.ts`
- `constants/ui.ts`
- `constants/calibration.ts`

#### 3.3 Improve Test Coverage (#244)
**Effort**: 2 days
**Priority**: MEDIUM

Target 80%+ coverage for critical paths:
- Org hierarchy building
- Performance calculations
- Calibration rules
- Filter/sort logic

#### 3.4 Add JSDoc Comments (#246)
**Effort**: 1 day
**Priority**: LOW

Add JSDoc to:
- Custom hooks
- Utility functions
- Service methods
- Complex algorithms

#### 3.5 Consolidate CSS & Design Tokens (#247)
**Effort**: 1.5 days
**Priority**: LOW

Create design token system:
- `styles/tokens/colors.ts`
- `styles/tokens/spacing.ts`
- `styles/tokens/typography.ts`

#### 3.6 Implement Memoization (#248)
**Effort**: 0.5 days
**Priority**: LOW

Add `useMemo` for:
- Org hierarchy calculations
- Filtered/sorted lists
- Derived state

#### 3.7 Improve Accessibility (#249)
**Effort**: 1 day
**Priority**: LOW

- Add aria-labels to icon buttons
- Ensure keyboard navigation
- Add visible focus indicators
- Run axe DevTools audit

#### 3.8 Optimize Bundle Size (#251)
**Effort**: 1 day
**Priority**: LOW

- Implement route-based code splitting
- Lazy load heavy components (OrgChart, CalibrationSession, etc.)
- Add bundle analysis
- Set bundle size budgets

## Implementation Timeline

### Week 1: Foundation
- Days 1-3: Refactor useEmployees (#231)
- Days 4-5: Consolidate org hierarchy (#232)
- Day 6: Standardize error handling (#233)

### Week 2: Component Refactoring Part 1
- Days 7-8: Refactor EmployeeFilters (#235)
- Days 9-10: Eliminate prop drilling (#236)

### Week 3: Component Refactoring Part 2
- Days 11-12: Add loading states (#238)
- Days 12-13: Standardize types (#239)
- Day 14: Extract business logic (#240)

### Week 4: Optimization & Polish
- Day 15: Split large components (#242) + Magic numbers (#243)
- Days 16-17: Improve test coverage (#244)
- Day 18: Polish items (#246, #247, #248, #249, #251)

## Risk Management

### Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking changes during refactor | High | Medium | Comprehensive test coverage before changes |
| Extended timeline due to complexity | Medium | Medium | Phase approach allows pausing between phases |
| Merge conflicts with active development | High | High | Communicate refactoring plans, coordinate with team |
| Performance regressions | Medium | Low | Benchmark before/after, profile changes |
| Scope creep | Medium | Medium | Strict adherence to defined scope per phase |

### Rollback Strategy

Each phase should be:
1. Merged to a feature branch first
2. Tested in staging environment
3. Monitored after production deployment
4. Rollback prepared if issues detected

## Success Metrics

### Code Quality
- [ ] All critical issues resolved (3/3)
- [ ] All high priority issues resolved (5/5)
- [ ] Test coverage > 80% for refactored code
- [ ] No increase in bundle size
- [ ] ESLint violations reduced by 50%

### Performance
- [ ] No performance regressions
- [ ] Page load time maintained or improved
- [ ] Lighthouse score maintained or improved

### Developer Experience
- [ ] Reduced cognitive complexity scores
- [ ] Faster development velocity on new features
- [ ] Fewer bugs related to refactored areas
- [ ] Positive team feedback

## Maintenance Plan

After completion:
1. **Weekly Architecture Reviews**: Review new code for conformance
2. **Quarterly Refactoring Sprints**: Address emerging technical debt
3. **Documentation Updates**: Keep architecture docs current
4. **ESLint Rules**: Enforce architectural patterns
5. **PR Review Checklist**: Include architectural review items

## Related Documentation

- [Testing Architecture](../testing/ARCHITECTURE.md)
- [Platform Constraints](../PLATFORM_CONSTRAINTS.md)

## GitHub Issues

All issues are tracked under milestone [fe-arch-review](https://github.com/bencan1a/9boxer/milestone/15).

### Critical Issues
- #231 - Refactor useEmployees hook - Massive SRP violation
- #232 - Consolidate duplicated org hierarchy logic
- #233 - Standardize error handling across frontend

### High Priority Issues
- #235 - Refactor EmployeeFilters component - Reduce complexity
- #236 - Eliminate prop drilling in calibration components
- #238 - Add missing loading states to async operations
- #239 - Standardize type definitions - Eliminate interface/type inconsistency
- #240 - Extract hard-coded business logic from UI components

### Medium/Low Priority Issues
- #242 - Split large components into smaller, focused components
- #243 - Replace magic numbers with named constants
- #244 - Improve test coverage for critical business logic
- #246 - Add JSDoc comments to public APIs and complex functions
- #247 - Consolidate duplicate CSS and create design tokens
- #248 - Implement proper memoization for expensive computations
- #249 - Add aria-labels and improve accessibility
- #251 - Optimize bundle size and implement code splitting

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-01-04 | Principal Architect | Initial refactoring plan created |

---

*This document is a living artifact and should be updated as refactoring progresses.*
