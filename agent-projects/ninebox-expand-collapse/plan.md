# Nine Box Expand/Collapse Feature

```yaml
status: active
owner: Claude Code
created: 2025-12-10
summary:
  - Add expand/collapse functionality to nine box grid boxes
  - Expanded box fills grid area while other boxes remain as small drop targets
  - Preserve drag-and-drop functionality across all boxes
  - Implement smooth animations and keyboard controls
```

## Overview

Enable users to expand individual boxes to fill the grid area when there are many tiles, while keeping other boxes visible as smaller drop targets for drag-and-drop operations.

## Current State Analysis

Based on codebase exploration:
- Nine box grid is in [NineBoxGrid.tsx](../../frontend/src/components/grid/NineBoxGrid.tsx)
- 3x3 CSS Grid layout with positions 1-9
- Individual boxes are [GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx) components
- Drag-and-drop uses @dnd-kit/core library
- State managed with Zustand (sessionStore, filterStore)
- Styling uses MUI sx props (no separate CSS files)
- Employee tiles are [EmployeeTile.tsx](../../frontend/src/components/grid/EmployeeTile.tsx)

## Design Specifications

### Layout Behavior

**Normal Mode** (no box expanded):
- Current 3x3 grid layout unchanged
- All boxes equal size, scrollable content

**Expanded Mode** (one box expanded):
- Target box: Fills large portion of viewport (calc'd based on available space), max-height with internal scrolling
- Other 8 boxes: Small drop targets (~60-80px height), labels only, no tiles visible
- Collapsed boxes remain functional drop zones with visual feedback
- Leaves room for details panel and collapsed boxes

### Visual Design

**Expanded Box:**
- Max-height calculated based on viewport height (leaves room for collapsed boxes and details panel)
- Internal scrolling for overflow content
- Box shadow for elevation effect
- Smooth expand animation (300ms)
- Collapse button in header (✕ icon)

**Collapsed Boxes:**
- Height: 60-80px
- Show position label only (e.g., "[H,H]")
- Muted background (50% opacity of normal color)
- Dashed border highlight when drag-over
- Expand button visible on hover

### User Interactions

- Click expand button (⛶) on any box → Expands that box
- Click collapse button (✕) → Returns to normal grid
- ESC key → Collapse if expanded
- Drag-and-drop works in both modes
- Collapsed boxes accept drops with visual feedback
- **Note:** Collapsed boxes are NOT clickable to expand (must use expand button)

## Implementation Phases

### Phase 1: State Management & Core Logic
**Goal:** Add expansion state and handlers to NineBoxGrid

**Tasks (can run in parallel):**

#### Task 1.1: Add Expansion State
- File: [NineBoxGrid.tsx](../../frontend/src/components/grid/NineBoxGrid.tsx)
- Add `expandedPosition` state (number | null)
- Implement `handleExpandBox(position: number)` function
- Implement `handleCollapseBox()` function
- Add ESC key listener for collapse
- Add localStorage persistence (save/restore expanded state)
  - Key: `nineBoxExpandedPosition`
  - Save on expand/collapse
  - Restore on component mount

#### Task 1.2: Calculate Dynamic Grid Layout
- File: [NineBoxGrid.tsx](../../frontend/src/components/grid/NineBoxGrid.tsx)
- Create `getGridTemplate(expandedPosition)` helper function
- Returns appropriate gridTemplateColumns/Rows based on expanded state
- Map position (1-9) to row/column coordinates

**Phase 1 Acceptance Criteria:**
- State updates correctly when expand/collapse triggered
- Grid layout calculation logic returns correct CSS values
- ESC key collapses expanded box
- No visual changes yet (layout logic only)

**Code Review Checkpoint:** Independent review of state management approach and grid calculation logic

---

### Phase 2: GridBox Component Updates
**Goal:** Add expand/collapse UI controls and conditional rendering

**Tasks (can run in parallel):**

#### Task 2.1: Add Expand/Collapse Button
- File: [GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx)
- Add expand button to header (IconButton with ⛶ icon)
- Show collapse button (✕) when expanded
- Accept `onExpand` callback prop
- Button appears on hover in normal mode

#### Task 2.2: Conditional Rendering Logic
- File: [GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx)
- Accept `isExpanded` and `isCollapsed` props
- When `isCollapsed`: Hide EmployeeTile components, show label only
- When `isExpanded`: Set max-height based on viewport, enable scrolling
  - Calculate: `calc(100vh - [space for collapsed boxes] - [space for details panel] - [margins])`
- Update styling for each mode

**Phase 2 Acceptance Criteria:**
- Expand/collapse buttons render correctly
- GridBox responds to isExpanded/isCollapsed props
- Tile visibility controlled by expansion state
- Droppable functionality preserved

**Code Review Checkpoint:** Review component props, conditional rendering, and accessibility

---

### Phase 3: Layout Integration
**Goal:** Wire GridBox components to NineBoxGrid state

**Tasks (sequential - depends on Phase 1 & 2):**

#### Task 3.1: Apply Dynamic Layout
- File: [NineBoxGrid.tsx](../../frontend/src/components/grid/NineBoxGrid.tsx)
- Apply grid template from Phase 1 to container
- Calculate isExpanded/isCollapsed for each box
- Pass props to GridBox components
- Wire up expand/collapse callbacks

#### Task 3.2: Test Basic Functionality
- Manual testing of expand/collapse
- Verify layout changes work
- Check all 9 boxes can be expanded
- Verify collapse returns to normal

**Phase 3 Acceptance Criteria:**
- Clicking expand button expands target box
- Other boxes collapse to small drop targets
- Clicking collapse returns to normal grid
- ESC key works
- Layout is functional (styling polish comes later)

**Code Review Checkpoint:** Review integration logic and state flow

---

### Phase 4: Styling & Animations
**Goal:** Polish visual design and add smooth transitions

**Tasks (can run in parallel):**

#### Task 4.1: Add CSS Transitions
- File: [NineBoxGrid.tsx](../../frontend/src/components/grid/NineBoxGrid.tsx)
- Add transition property to grid container (300ms ease-in-out)
- Smooth layout changes when expanding/collapsing

#### Task 4.2: Style Expanded Box
- File: [GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx)
- Add box shadow for elevation
- Increase header text size
- Full background color saturation

#### Task 4.3: Style Collapsed Boxes
- File: [GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx)
- Reduce opacity to 0.7
- Lighter background color
- Center position label
- Style drag-over state (dashed border, opacity 1.0)

**Phase 4 Acceptance Criteria:**
- Smooth 300ms transitions when expanding/collapsing
- Expanded box has elevated appearance
- Collapsed boxes are visually distinct but not distracting
- Hover states work correctly

**Code Review Checkpoint:** Review CSS, transitions, and visual design consistency

---

### Phase 5: Drag-and-Drop Verification
**Goal:** Ensure drag-and-drop works perfectly in expanded mode

**Tasks (sequential):**

#### Task 5.1: Test Drag-and-Drop Scenarios
- Drag from expanded box to collapsed box
- Drag from collapsed box to expanded box (if any tiles visible)
- Drag from expanded box to itself
- Verify drop zones highlight correctly

#### Task 5.2: Enhance Visual Feedback
- File: [GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx)
- Ensure collapsed boxes show clear drag-over indicator
- Test with DragOverlay
- Verify drop animations work

**Phase 5 Acceptance Criteria:**
- All drag-and-drop scenarios work correctly
- Visual feedback is clear on collapsed boxes
- No @dnd-kit errors or warnings
- Drop animations smooth

**Code Review Checkpoint:** Review drag-and-drop integration and edge cases

---

### Phase 6: Edge Cases & Polish
**Goal:** Handle edge cases and improve UX

**Tasks (can run in parallel):**

#### Task 6.1: Handle Edge Cases
- Empty expanded box (after filters applied)
- Rapid expand/collapse clicks
- Changing filters while box expanded
- Box with 100+ employees

#### Task 6.2: Accessibility Improvements
- Keyboard navigation (Tab to expand buttons)
- ARIA labels for expand/collapse buttons
- Focus management when expanding/collapsing
- Screen reader announcements

#### Task 6.3: localStorage Persistence Verification
- Test expansion state persists across page refresh
- Test expansion state clears correctly on collapse
- Handle case where persisted position no longer exists (edge case)

**Phase 6 Acceptance Criteria:**
- No errors with edge cases
- Keyboard-only navigation works
- Screen readers can use feature
- localStorage persistence works correctly

**Code Review Checkpoint:** Final comprehensive review of entire feature

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Each of 9 boxes can be expanded
- [ ] Collapse button returns to normal
- [ ] ESC key collapses
- [ ] Drag-and-drop to/from collapsed boxes works
- [ ] Filters don't break expansion state
- [ ] Visual feedback on drag-over collapsed boxes
- [ ] Animations are smooth (no jank)
- [ ] Keyboard navigation works
- [ ] Expanded box scrolls internally when content overflows
- [ ] Expansion state persists across page refresh
- [ ] Collapsed boxes are NOT clickable (only expand button works)

### Automated Testing (Future)
- Component tests for GridBox (expanded/collapsed states)
- Integration tests for NineBoxGrid (expand/collapse flow)
- Drag-and-drop tests with @testing-library/react

## Files to Modify

| File | Purpose | Phases |
|------|---------|--------|
| [frontend/src/components/grid/NineBoxGrid.tsx](../../frontend/src/components/grid/NineBoxGrid.tsx) | State, layout logic, ESC handler | 1, 3, 4 |
| [frontend/src/components/grid/GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx) | Expand button, conditional rendering, styling | 2, 4, 5 |

**No changes needed:**
- EmployeeTile.tsx (unchanged)
- Zustand stores (not needed - using localStorage for persistence)
- API/backend (purely frontend feature)

## Future Enhancements (Out of Scope)

- Double-click to expand
- Fullscreen overlay mode
- Expand multiple boxes in split view
- Custom keyboard shortcuts
- Export expanded view as image
- User-configurable collapse box sizes

## Success Criteria

✅ Users can expand any box to see all tiles clearly
✅ Other boxes remain visible as drop targets
✅ Drag-and-drop works seamlessly in expanded mode
✅ Smooth, polished animations
✅ Keyboard accessible (ESC, Tab navigation)
✅ No performance degradation with 100+ employees
✅ Expanded box scrolls internally with appropriate max-height
✅ Expansion state persists across sessions (localStorage)
✅ Only expand button triggers expansion (collapsed boxes not clickable)

## Risk Assessment

**Low Risk:**
- Small, isolated feature (2 files)
- No API changes
- Builds on existing @dnd-kit patterns
- Pure UI state (no data persistence)

**Potential Challenges:**
- CSS Grid dynamic layout calculation
- Ensuring drag-and-drop works with layout changes
- Animation performance with many tiles
- Calculating optimal max-height for expanded box
- Handling viewport resize while box is expanded

## Timeline Estimate

- Phase 1: ~1-2 hours (state + logic)
- Phase 2: ~1-2 hours (component updates)
- Phase 3: ~1 hour (integration)
- Phase 4: ~1-2 hours (styling/animations)
- Phase 5: ~1 hour (drag-drop verification)
- Phase 6: ~2-3 hours (edge cases, a11y, mobile)

**Total: ~7-11 hours** for complete, polished implementation

## User Decisions (Resolved)

1. ✅ **Collapsed boxes NOT clickable** - Must use expand button (explicit action)
2. ✅ **No mobile app** - Desktop web app only, no responsive concerns
3. ✅ **localStorage persistence** - Expansion state persists across sessions
4. ✅ **Max-height with scrolling** - Expanded box fills large portion of viewport, scrolls internally
