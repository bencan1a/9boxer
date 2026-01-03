# FilterToolbar Collapse/Expand Implementation Plan

**Created:** 2026-01-03
**Status:** Planning
**Owner:** @copilot
**Reviewer:** @bencan1a

## Executive Summary

Add expand/collapse functionality to the compact FilterToolbar variant, allowing users to minimize the toolbar to just the filter icon button and expand it back to show all controls (employee count, filter info, search box).

## Background

The FilterToolbar component was implemented with 5 variants (compact, expandable, chips, dropdown, split). The user has selected the **compact variant** as the preferred option and requests an expand/collapse feature to allow users to minimize/maximize the toolbar at will.

## Goals

1. Add expand/collapse toggle button to compact FilterToolbar
2. Maintain filter button visibility in collapsed state (with badge)
3. Smooth animation between expanded and collapsed states
4. Persist collapse state in localStorage
5. Maintain all existing functionality when expanded
6. Follow existing UX patterns (similar to ViewControls/ZoomControls)

## Non-Goals

- Implementing collapse for other variants (only compact)
- Auto-collapse based on screen size (separate from responsive behavior)
- Keyboard shortcuts for collapse/expand (can be added later)

## Design Decisions

### Collapsed State
**Show:**
- Filter button with badge (primary action)
- Collapse/expand toggle button

**Hide:**
- Employee count display
- Active filter info text
- Search box

### Toggle Button
- Icon: `ChevronRight` when collapsed, `ChevronLeft` when expanded
- Position: Right side of toolbar (after filter button)
- Tooltip: "Expand toolbar" / "Collapse toolbar"

### Animation
- Use MUI `Collapse` component for smooth width transition
- Duration: `theme.tokens.duration.normal` (~300ms)
- Easing: `theme.tokens.easing.easeInOut`

### State Persistence
- Store collapse state in localStorage: `filterToolbarCollapsed`
- Boolean value: `true` = collapsed, `false` = expanded
- Default: `false` (expanded on first visit)

## Implementation Phases

### Phase 1: Core Collapse Functionality
**Estimated Time:** 30 minutes

**Tasks:**
1. Add `isCollapsed` state to FilterToolbar component
2. Add toggle button with chevron icons
3. Implement conditional rendering based on collapse state
4. Add localStorage persistence for collapse state
5. Update compact variant rendering logic

**Files to Modify:**
- `frontend/src/components/common/FilterToolbar.tsx`

**Success Criteria:**
- Toolbar collapses to show only filter button + toggle
- Toolbar expands to show all controls
- State persists across page reloads
- No layout shift on collapse/expand

### Phase 2: Animation & Polish
**Estimated Time:** 20 minutes

**Tasks:**
1. Add smooth width transition animation
2. Fine-tune spacing and alignment in both states
3. Ensure proper z-index for collapsed state
4. Test with filter badge visibility in collapsed state

**Files to Modify:**
- `frontend/src/components/common/FilterToolbar.tsx`

**Success Criteria:**
- Smooth animation between states
- No visual glitches during transition
- Badge remains visible in collapsed state

### Phase 3: Container Integration
**Estimated Time:** 10 minutes

**Tasks:**
1. Ensure FilterToolbarContainer passes through collapse state
2. Verify integration with NineBoxGrid works in both states
3. Test with various filter combinations

**Files to Modify:**
- None (container should work without changes)

**Success Criteria:**
- Collapse works in integrated environment
- Filter drawer still opens correctly
- Search and filter functionality unchanged when expanded

### Phase 4: Testing
**Estimated Time:** 30 minutes

**Tasks:**
1. Add tests for collapse/expand behavior
2. Add tests for localStorage persistence
3. Update existing tests if needed
4. Add Storybook stories for collapsed state

**Files to Modify:**
- `frontend/src/components/common/__tests__/FilterToolbar.test.tsx`
- `frontend/src/components/common/FilterToolbar.stories.tsx`

**Success Criteria:**
- All new tests pass
- Existing tests still pass
- Storybook demonstrates both states

### Phase 5: Documentation & Cleanup
**Estimated Time:** 15 minutes

**Tasks:**
1. Update component JSDoc comments
2. Add collapse examples to Storybook
3. Update PR description with new functionality
4. Clean up any unused code from other variants

**Files to Modify:**
- `frontend/src/components/common/FilterToolbar.tsx` (comments)
- `frontend/src/components/common/FilterToolbar.stories.tsx`

**Success Criteria:**
- Documentation is clear and complete
- Storybook examples demonstrate feature
- Code is clean and maintainable

## Technical Implementation Details

### State Management

```typescript
// Inside FilterToolbar component
const [isCollapsed, setIsCollapsed] = useState(() => {
  const stored = localStorage.getItem('filterToolbarCollapsed');
  return stored === 'true';
});

const handleToggleCollapse = () => {
  const newState = !isCollapsed;
  setIsCollapsed(newState);
  localStorage.setItem('filterToolbarCollapsed', String(newState));
};
```

### Collapsed Layout Structure

```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5 }}>
  {/* Filter button - always visible */}
  <FilterButton />

  {/* Collapsible content */}
  <Collapse in={!isCollapsed} orientation="horizontal">
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Divider />
      <EmployeeCount />
      {hasActiveFilters && <FilterInfo />}
      <Divider />
      <SearchBox />
    </Box>
  </Collapse>

  {/* Toggle button (right side) */}
  <Tooltip title={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}>
    <IconButton onClick={handleToggleCollapse} size="small">
      {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
    </IconButton>
  </Tooltip>
</Box>
```

### Styling Considerations

1. **Width transition:** Use auto width with max-width constraints
2. **Collapsed width:** ~80px (filter button + toggle button + padding)
3. **Expanded width:** Maintain current max-width of 600px
4. **Shadow:** Maintain consistent box-shadow in both states

## Testing Strategy

### Unit Tests
- ✅ Renders collapsed state correctly
- ✅ Renders expanded state correctly
- ✅ Toggle button changes collapse state
- ✅ LocalStorage persistence works
- ✅ Restores state from localStorage on mount

### Integration Tests
- ✅ Works with FilterToolbarContainer
- ✅ Filter button functionality unchanged
- ✅ Search box accessible when expanded
- ✅ No interference with NineBoxGrid layout

### Visual Tests
- ✅ Storybook story: Collapsed state
- ✅ Storybook story: Expanded state
- ✅ Storybook story: Toggle interaction

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Animation performance on slower devices | Medium | Use CSS transitions only, test on low-end hardware |
| Layout shift affecting grid | High | Use absolute positioning, test with various screen sizes |
| LocalStorage not available | Low | Gracefully default to expanded if localStorage fails |
| Conflict with responsive behavior | Medium | Ensure collapse state is independent of screen size |

## Success Metrics

- [ ] Collapse/expand works smoothly without visual glitches
- [ ] State persists across page reloads and sessions
- [ ] All existing tests pass
- [ ] New tests achieve >95% coverage of new code
- [ ] No performance regression (animation <16ms frame time)
- [ ] User can access all functionality in expanded state
- [ ] Filter button remains accessible in collapsed state

## Rollout Plan

1. **Phase 1-2:** Implement core functionality + animation (commit 1)
2. **Phase 3-4:** Integration + testing (commit 2)
3. **Phase 5:** Documentation + cleanup (commit 3)
4. **Review:** Submit for code review with screenshots
5. **Deploy:** Merge to main after approval

## Open Questions

1. ❓ Should we show a count badge on the toggle button when collapsed?
   - **Decision Pending:** Discuss with @bencan1a

2. ❓ Should collapse state be per-user or per-session?
   - **Current:** Per-browser (localStorage)
   - **Alternative:** Could be per-user preference if we add user settings

3. ❓ Should there be a tooltip explaining the toolbar can be collapsed?
   - **Current:** Only tooltip on toggle button
   - **Alternative:** First-time user hint

## References

- Original PR: copilot/add-filtering-toolbar
- FilterToolbar implementation: commits fc5ffd3, d44db85, 887c3a7
- Similar pattern: ViewControls component
- Design system: DESIGN_SYSTEM.md

## Timeline

- **Planning:** 2026-01-03 (today)
- **Phase 1-2:** 2026-01-03 (50 minutes)
- **Phase 3-4:** 2026-01-03 (40 minutes)
- **Phase 5:** 2026-01-03 (15 minutes)
- **Total Estimated:** ~2 hours

## Sign-off

- [ ] Implementation plan reviewed by @bencan1a
- [ ] Technical approach approved
- [ ] Ready to begin implementation
