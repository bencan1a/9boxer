# Filter Unification and Enhancement Plan

**Date:** 2026-01-03
**Status:** In Progress
**Estimated Effort:** 20-25 hours

## Overview

This plan unifies the dual filter mechanisms (Manager Filter + Org Hierarchy Filter) into a single filter architecture while simultaneously enhancing the filter panel UX with search, better visual hierarchy, and improved touch targets.

## Problem Statement

### Current Issues
1. **Dual Filter Mechanisms**: Two separate filters for the same concept
   - Manager Filter (manual checkbox tree in drawer)
   - Org Hierarchy Filter (shortcut from clicking manager names)
   - Implemented as separate state: `selectedManagers[]` + `reportingChainFilter`
   - Confusing UX: Two filter chips, unclear relationship

2. **Poor Visual Hierarchy**: All filter sections look identical
   - No visual indication of active filters
   - Weak section differentiation
   - Inconsistent spacing

3. **Missing Search**: Finding managers in deep org trees is tedious
   - No search functionality
   - Users must manually expand and scroll

4. **Small Touch Targets**: Poor mobile/tablet experience
   - Icon buttons too small (size="small")
   - Minimum touch target below 48px
   - Tight indentation in tree (level * 2)

## Solution Architecture

### 1. Unified Filter State

**Single Source of Truth:**
```typescript
interface FilterState {
  // UNIFIED manager filter
  selectedManagers: Set<string>;  // Changed from string[]
  selectedManagerEmployeeIds: Map<string, number[]>;

  // Track which manager triggered quick selection (for smart display)
  quickFilterManagerName: string | null;

  // REMOVED:
  // reportingChainFilter: string | null;
  // reportingChainEmployeeIds: number[];
}
```

### 2. Smart Actions

**New Actions:**
- `setManagerSubtree(managerName, subtree, markAsQuickFilter)` - Select manager + all subordinates
- `selectManager(manager, employeeIds)` - Select single manager
- `deselectManager(manager)` - Deselect single manager
- `clearManagerFilter()` - Clear all manager selections

**Removed Actions:**
- `setReportingChainFilter()` ❌
- `clearReportingChainFilter()` ❌

### 3. Filter Toolbar Smart Display

**Display Logic:**
- Quick filter: "Peter Miller + team (8)" - shows root manager + count
- Manual mixed: "Managers (12)" - shows total count
- Clicking chip opens drawer with all checkboxes visible

### 4. Enhanced UI Components

**New Components:**
- `useDebounced` hook - Debounce search input (300ms)
- `HighlightedText` component - Highlight search matches
- `SearchableTreeNode` component - Tree node with controlled expansion + highlighting

**Enhanced Components:**
- `FilterSection` - Active state styling (border, background)
- `OrgTreeFilter` - Search input, filtered tree rendering

## Implementation Chunks

### Chunk 1: Foundation Utilities ⚡ (Parallel)
- Create `useDebounced.ts` hook
- Create `HighlightedText.tsx` component
- Add i18n keys to translation.json

**Files:**
- `frontend/src/hooks/useDebounced.ts` (NEW)
- `frontend/src/components/dashboard/filters/HighlightedText.tsx` (NEW)
- `frontend/src/i18n/locales/en/translation.json` (UPDATE)

### Chunk 2: Filter Store Refactoring ⚡ (Parallel)
- Remove `reportingChainFilter` state
- Convert `selectedManagers` from array to Set
- Add new actions (setManagerSubtree, selectManager, deselectManager, clearManagerFilter)
- Update `toggleManager` to clear quickFilterManagerName on manual edit
- Update `clearAllFilters` and `hasActiveFilters`

**Files:**
- `frontend/src/store/filterStore.ts` (UPDATE)

### Chunk 3: OrgHierarchy Service Enhancement ⚡ (Parallel)
- Add `getManagerSubtree()` function
- Implement subtree traversal logic
- Handle edge cases (circular refs, missing managers, empty subtrees)

**Files:**
- `frontend/src/hooks/useOrgHierarchy.ts` (UPDATE)

### Chunk 4: FilterSection Visual Enhancement ⚡ (Parallel)
- Add active state styling (border, background, hover)
- Improve touch targets (minHeight: 48px)
- Enhanced count badge styling
- Better spacing with design tokens

**Files:**
- `frontend/src/components/dashboard/filters/FilterSection.tsx` (UPDATE)

### Chunk 5: Search Infrastructure (Sequential - after Chunk 1)
- Implement `filterOrgTree` utility function
- Create `SearchableTreeNode` component
- Add search UI to `OrgTreeFilter`
- Wire up debounced search and filtered tree rendering

**Files:**
- `frontend/src/components/dashboard/filters/SearchableTreeNode.tsx` (NEW)
- `frontend/src/components/dashboard/filters/OrgTreeFilter.tsx` (UPDATE)

### Chunk 6: Update useFilters Hook (Sequential - after Chunk 2)
- Update imports and destructuring (remove reportingChainFilter refs)
- Simplify `applyFilters` logic (single manager filter check)
- Update return statement exports

**Files:**
- `frontend/src/hooks/useFilters.ts` (UPDATE)

### Chunk 7: Update ManagementChain (Sequential - after Chunks 2+3)
- Replace `setReportingChainFilter` with `setManagerSubtree`
- Add loading state during subtree fetch
- Implement toggle behavior (click twice to deselect)
- Update active filter check

**Files:**
- `frontend/src/components/panel/ManagementChain.tsx` (UPDATE)

### Chunk 8: Update FilterToolbar (Sequential - after Chunk 2)
- Remove `reportingChainFilter` references
- Implement smart grouping display logic
- Update active filter count calculation

**Files:**
- `frontend/src/components/common/FilterToolbarContainer.tsx` (UPDATE)

### Chunk 9: Update FilterDrawer (Sequential - after Chunk 5)
- Remove ReportingChainFilter section
- Update manager count display (Set.size instead of array.length)
- Convert Set to Array for OrgTreeFilter prop

**Files:**
- `frontend/src/components/dashboard/FilterDrawer.tsx` (UPDATE)

### Chunk 10: Cleanup Legacy Code (Sequential - after all updates)
- Delete `ReportingChainFilter.tsx`
- Update barrel export index.ts
- Remove unused imports across codebase

**Files:**
- `frontend/src/components/dashboard/filters/ReportingChainFilter.tsx` (DELETE)
- `frontend/src/components/dashboard/filters/index.ts` (UPDATE)

### Chunk 11: Testing & QA (Sequential - final)
- Update existing tests for new state structure
- Add tests for new components (HighlightedText, SearchableTreeNode, useDebounced)
- Add tests for new actions (setManagerSubtree)
- Integration tests for search functionality
- Accessibility audit
- Visual QA (light/dark mode)

## Edge Cases Handled

1. **Mixed Manual + Quick Selections**: User can refine quick filter by unchecking managers
2. **Toggle Behavior**: Clicking same manager twice deselects entire subtree
3. **Manager Not in Org Tree**: Fallback to single manager selection
4. **Circular Reporting**: Detect cycles with visited set
5. **Empty Subtree**: Manager with no subordinate managers
6. **Large Org Trees**: Memoization + debouncing for performance
7. **Special Regex Characters**: Escape in search query

## Design Specifications

### Visual Enhancements

**Active Filter Section:**
- Border-left: 4px solid primary.main
- Background: alpha(primary.main, 0.04)
- Border-radius: tokens.radius.md (8px)
- Transition: fast easing

**Touch Targets:**
- Minimum height: 48px
- Icon button size: medium (up from small)
- Tree node indentation: level * 3 (up from level * 2)

**Search UI:**
- TextField with SearchIcon start adornment
- Clear button (X) when query present
- Background: palette.background.default
- Margin-bottom: 16px

**Text Highlighting:**
- Background: alpha(warning.main, 0.3)
- Font-weight: semiBold
- Border-radius: tokens.radius.sm (4px)

## Success Criteria

### Functional Requirements
- ✅ Clicking manager in management chain selects entire subtree
- ✅ Filter drawer shows all selected managers as checkboxes
- ✅ User can refine quick selections manually
- ✅ Filter toolbar shows smart grouping
- ✅ Search filters manager tree with auto-expand
- ✅ Text highlighting works in search results
- ✅ Toggle behavior (click twice to deselect)

### Technical Requirements
- ✅ Single source of truth (selectedManagers Set)
- ✅ No duplicate state
- ✅ Type-safe (TypeScript compiles)
- ✅ Test coverage > 80%
- ✅ Performance: < 50ms search latency for < 50 managers

### UX Requirements
- ✅ Visual feedback for active filters
- ✅ Touch targets ≥ 48px
- ✅ Keyboard accessible
- ✅ WCAG AA compliant
- ✅ Loading states during async operations

## i18n Keys Required

```json
{
  "filters": {
    "searchManagers": "Search managers...",
    "noManagersFound": "No managers found"
  },
  "common": {
    "clearSearch": "Clear search",
    "expand": "Expand",
    "collapse": "Collapse"
  },
  "dashboard": {
    "filterDrawer": {
      "noManagersFound": "No managers found"
    }
  }
}
```

## Files Changed

### New Files (5)
- `frontend/src/hooks/useDebounced.ts`
- `frontend/src/hooks/__tests__/useDebounced.test.ts`
- `frontend/src/components/dashboard/filters/HighlightedText.tsx`
- `frontend/src/components/dashboard/filters/SearchableTreeNode.tsx`
- `frontend/src/components/dashboard/filters/__tests__/HighlightedText.test.tsx`

### Modified Files (9)
- `frontend/src/store/filterStore.ts`
- `frontend/src/hooks/useOrgHierarchy.ts`
- `frontend/src/hooks/useFilters.ts`
- `frontend/src/components/dashboard/filters/FilterSection.tsx`
- `frontend/src/components/dashboard/filters/OrgTreeFilter.tsx`
- `frontend/src/components/dashboard/FilterDrawer.tsx`
- `frontend/src/components/panel/ManagementChain.tsx`
- `frontend/src/components/common/FilterToolbarContainer.tsx`
- `frontend/src/i18n/locales/en/translation.json`

### Deleted Files (1)
- `frontend/src/components/dashboard/filters/ReportingChainFilter.tsx`

## Risk Mitigation

- **Type Errors**: TypeScript will catch at compile time
- **Performance**: Memoization + debouncing + caching
- **Breaking Tests**: Update tests incrementally, maintain coverage
- **Accessibility**: Use MUI components (accessible by default) + ARIA labels

## Timeline

**Total Estimate:** 20-25 hours

- **Phase 1 (Parallel)**: Foundation + Store + Service + FilterSection (6-8 hours)
- **Phase 2 (Sequential)**: Search + useFilters + Components (8-10 hours)
- **Phase 3 (Sequential)**: Cleanup + Testing + QA (6-7 hours)

## References

- Refactoring Plan: Created by principal-engineer agent
- Design Plan: Created by principal-engineer agent (design focus)
- Current Branch: `copilot/add-filtering-toolbar`
- Target Branch: `main`
