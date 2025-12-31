# Grid Zoom Feature

```yaml
status: active
owner: bencan1a
created: 2024-12-30
last_updated: 2024-12-30
summary:
  - Implement intelligent grid zoom with 5 discrete levels for employee tiles
  - Replace naive browser-level zoom with component-specific scaling
  - Support two use cases: information density vs. presentation visibility
  - Use design tokens for all scaling values to enable easy tuning
```

## Problem Statement

The current zoom implementation uses browser-level zoom (via Electron's `webFrame` API or CSS `zoom` property), which:
- Scales the ENTIRE application proportionally, including UI chrome, panels, and controls
- Doesn't truly change information density (tiles just get bigger/smaller in lockstep with viewport)
- Provides 15 zoom levels (25% to 300%) which is excessive and hard to navigate
- Doesn't optimize for the two key user goals:
  1. **Information density**: Fit more employees on screen for bulk operations
  2. **Presentation mode**: Make tiles readable from a distance on a large display

## User Goals

### Primary Use Case 1: Information Density
**User Story**: "I want to see more employees at once so I can work with them efficiently"
- Smaller tiles with compact fonts
- More tiles visible without scrolling
- Still readable but prioritizes quantity over size
- Useful for: bulk operations, getting overview of distribution, filtering large teams

### Primary Use Case 2: Presentation Mode
**User Story**: "I'm showing this on a conference room display and need tiles visible from 10+ feet away"
- Larger tiles with big, readable fonts
- Fewer tiles visible (acceptable tradeoff)
- Optimized for visibility and legibility from a distance
- Useful for: team meetings, calibration sessions, executive reviews

## Solution Design

### Approach: Component-Level Zoom with Design Tokens

**Key Decision**: Zoom affects ONLY employee tiles and grid spacing, NOT the entire application.

**5 Discrete Zoom Levels** (vs. current 15):
- **Level 0 - Compact (60%)**: Maximum density, ~40% more tiles visible
- **Level 1 - Comfortable- (80%)**: Slightly tighter than normal
- **Level 2 - Normal (100%)**: Current default, baseline
- **Level 3 - Comfortable+ (125%)**: Slightly larger than normal
- **Level 4 - Presentation (150%)**: Maximum visibility, ~40% fewer tiles visible

**Scaling Strategy** (Aggressive, non-linear):
```
Tile Width:  168-240px → 280-400px → 420-600px
Font Sizes:  0.6-0.8rem → 0.75-1rem → 1.125-1.5rem
Icon Sizes:  10-12px → 12-16px → 18-24px
Gaps:        8px → 16px → 24px
```

### Design Tokens

All zoom values defined in `frontend/src/theme/tokens.ts → gridZoom`:
```typescript
gridZoom: {
  level0: { tile: {}, font: {}, icon: {}, spacing: {} },
  level1: { ... },
  level2: { ... }, // Baseline
  level3: { ... },
  level4: { ... },
}
```

**Token Categories**:
- `tile`: minWidth, maxWidth, padding
- `font`: name, titleLevel, metadata
- `icon`: dragHandle, flag, history
- `spacing`: gap (between tiles), flagGap

### User Experience

**Controls** (keep existing UX):
- Bottom-left zoom controls (ZoomControls component)
- Keyboard shortcuts: Ctrl+/- (zoom in/out), Ctrl+0 (reset)
- Ctrl+Scroll wheel
- F11 (fullscreen - independent)

**Persistence**: Save zoom level to localStorage (same as current behavior)

**Scope**: Only affects:
- Employee tiles (EmployeeTile component)
- Grid spacing (gap between tiles in GridBox)
- Grid box gaps (spacing between 9 boxes)

**Does NOT affect**:
- Axes labels (fixed size)
- Top toolbar (AppBar)
- Right panel
- Filter drawer

## Implementation Phases

### Phase 1: Design Tokens ✅ COMPLETED
- [x] Add `gridZoom` tokens to `frontend/src/theme/tokens.ts`
- [x] Define all 5 levels with comprehensive token values
- [x] Document rationale for each scaling factor

**Status**: Completed 2024-12-30

### Phase 2: Storybook Experimentation ✅ COMPLETED
- [x] Create EmployeeTile zoom stories (Interactive, Comparison, Density Test)
- [x] Create NineBoxGrid zoom stories (Interactive Grid, Token Matrix)
- [x] Build UI for experimenting with zoom levels
- [x] Document how to iterate on token values

**Status**: Completed 2024-12-30

**Files Modified**:
- `frontend/src/components/grid/EmployeeTile.stories.tsx`
- `frontend/src/components/grid/NineBoxGrid.stories.tsx`

**Storybook Stories Created**:
1. `EmployeeTile → 🔍 Zoom Levels: Interactive` - Single tile with zoom selector
2. `EmployeeTile → 🔍 Zoom Levels: All 5 Side-by-Side` - Visual comparison
3. `EmployeeTile → 🔍 Zoom Levels: Density Test` - 6 tiles in grid
4. `NineBoxGrid → 🔍 Zoom Levels: Interactive Grid` - Full grid with zoom controls
5. `NineBoxGrid → 🔍 Zoom Levels: Token Comparison Matrix` - Complete token table

### Phase 3: Finalize Token Values (CURRENT)
**Goal**: Use Storybook to dial in perfect scaling ratios

**Tasks**:
- [ ] Test each zoom level in Storybook
- [ ] Validate Level 0 (Compact): Is text still readable? Can we fit more tiles?
- [ ] Validate Level 4 (Presentation): Readable from 10ft? Tile size feels right?
- [ ] Check smooth progression between levels
- [ ] Adjust token values in `tokens.ts` as needed
- [ ] Document final decisions and rationale

**Acceptance Criteria**:
- Each level feels meaningfully different
- Level 0: Fits ~40-50% more tiles than Level 2
- Level 4: Text readable from 10+ feet on 1080p display
- No "dead" levels that feel too similar to neighbors
- Fonts never smaller than 10px (readability floor)

### Phase 4: Update Zoom Service
**Goal**: Replace browser zoom with grid zoom levels

**Tasks**:
- [ ] Update `frontend/src/services/zoomService.ts`:
  - Replace 15 browser zoom levels with 5 grid zoom levels
  - Change `ZOOM_LEVELS` from factors to level indices (0-4)
  - Remove `webFrame` API calls (no more browser zoom)
  - Keep localStorage persistence
  - Keep keyboard shortcuts (Ctrl+/-, Ctrl+0)
- [ ] Add `getGridZoomLevel()` → returns current level index (0-4)
- [ ] Add `getGridZoomTokens()` → returns tokens for current level
- [ ] Update tests in `__tests__/ZoomControls.test.tsx`

**API Changes**:
```typescript
// Before (browser zoom)
export const ZOOM_LEVELS = [0.25, 0.33, 0.5, ..., 3.0];
export function zoomIn() { ... } // Calls webFrame.setZoomFactor()

// After (grid zoom)
export const ZOOM_LEVELS = [0, 1, 2, 3, 4]; // Level indices
export function zoomIn() { ... } // Just increments level index
export function getGridZoomLevel(): number { ... } // Returns 0-4
export function getGridZoomTokens() { ... } // Returns tokens.dimensions.gridZoom.levelX
```

**Files to Modify**:
- `frontend/src/services/zoomService.ts` (major refactor)
- `frontend/src/components/common/ZoomControls.tsx` (update to show level vs %)
- `frontend/src/components/common/__tests__/ZoomControls.test.tsx`

### Phase 5: Grid Zoom Context
**Goal**: Provide zoom level to all grid components

**Tasks**:
- [ ] Create `frontend/src/contexts/GridZoomContext.tsx`:
  - Hook: `useGridZoom()` returns `{ level, tokens, setLevel }`
  - Provider: `<GridZoomProvider>` wraps grid area
  - Subscribe to zoom service changes
- [ ] Add to component tree in `DashboardPage.tsx`:
  ```tsx
  <GridZoomProvider>
    <NineBoxGrid />
    <ViewControls />
  </GridZoomProvider>
  ```
- [ ] Create tests for context

**Alternative**: Could use Zustand store instead of Context if preferred

### Phase 6: Apply Zoom to Components
**Goal**: Make components use zoom tokens

**Tasks**:
- [ ] Update `EmployeeTile.tsx`:
  - Use `useGridZoom()` hook
  - Apply `tokens.tile.minWidth/maxWidth` to Card component
  - Apply `tokens.tile.padding` to CardContent
  - Apply `tokens.font.*` to Typography components
  - Apply `tokens.icon.*` to icon sizes (DragIndicatorIcon, flag badges, HistoryIcon)
  - Update flag gap spacing
- [ ] Update `GridBox.tsx`:
  - Apply `tokens.spacing.gap` to grid gap between tiles
- [ ] Update `NineBoxGrid.tsx`:
  - Apply gap between 9 boxes if needed
- [ ] Update all component tests to handle zoom context

**Component Changes**:
```tsx
// EmployeeTile.tsx - Before
<Card sx={{ minWidth: 280, maxWidth: 400 }}>
  <CardContent sx={{ p: 1.5 }}>
    <Typography variant="subtitle2">{employee.name}</Typography>
    <Typography fontSize="0.75rem">{employee.business_title}</Typography>

// EmployeeTile.tsx - After
const { tokens } = useGridZoom();
<Card sx={{ minWidth: tokens.tile.minWidth, maxWidth: tokens.tile.maxWidth }}>
  <CardContent sx={{ p: `${tokens.tile.padding}px` }}>
    <Typography fontSize={tokens.font.name}>{employee.name}</Typography>
    <Typography fontSize={tokens.font.titleLevel}>{employee.business_title}</Typography>
```

**Files to Modify**:
- `frontend/src/components/grid/EmployeeTile.tsx` (most changes)
- `frontend/src/components/grid/GridBox.tsx` (gap changes)
- `frontend/src/components/grid/NineBoxGrid.tsx` (minor)
- All related test files

### Phase 7: Update ZoomControls UI
**Goal**: Show current zoom level in UI

**Tasks**:
- [ ] Update `ZoomControls.tsx`:
  - Change percentage display to level name (e.g., "Compact", "Normal", "Presentation")
  - Or show both: "Level 2 (Normal)"
  - Update tooltips to mention zoom affects tiles only
- [ ] Add i18n translation keys:
  ```json
  {
    "zoom.level0": "Compact",
    "zoom.level1": "Comfortable-",
    "zoom.level2": "Normal",
    "zoom.level3": "Comfortable+",
    "zoom.level4": "Presentation"
  }
  ```

### Phase 8: Testing & Validation
**Goal**: Comprehensive testing before release

**Tasks**:
- [ ] **Unit Tests**:
  - `zoomService.ts` - all zoom functions
  - `GridZoomContext.tsx` - hook and provider
  - `EmployeeTile.tsx` - renders with different zoom levels
  - `ZoomControls.tsx` - button interactions
- [ ] **Integration Tests**:
  - Zoom changes propagate to all tiles
  - Persistence works (reload page, zoom persists)
- [ ] **E2E Tests** (Playwright):
  - Zoom in/out via buttons
  - Keyboard shortcuts work
  - Verify tile count changes at different levels
  - Screenshot comparison at each level
- [ ] **Manual Testing**:
  - Test with real employee data (50-200 employees)
  - Verify Level 0 fits more tiles
  - Verify Level 4 readable on large display
  - Test with long names, many flags, edge cases
  - Test in dark mode

### Phase 9: Documentation & Screenshots
**Goal**: Update user-facing docs and regenerate screenshots

**Tasks**:
- [ ] Update `resources/user-guide/docs/user-interface-overview.md`:
  - Document zoom levels and their purposes
  - Explain when to use each level
- [ ] Create screenshot workflow in `frontend/playwright/screenshots/workflows/zoom-levels.ts`:
  - Capture grid at Level 0 (Compact)
  - Capture grid at Level 2 (Normal)
  - Capture grid at Level 4 (Presentation)
- [ ] Register screenshots in `config.ts`
- [ ] Regenerate all screenshots: `npm run screenshots:generate`
- [ ] Update CHANGELOG.md

### Phase 10: Review & Merge
**Goal**: Code review and release

**Tasks**:
- [ ] Self-review checklist (design-review.md template)
- [ ] Run all linters and fix issues
- [ ] Run full test suite
- [ ] Create PR with before/after screenshots
- [ ] User smoke test and approval
- [ ] Merge to main
- [ ] Mark this plan as `done`

## Technical Decisions

### Decision 1: Component Zoom vs. Browser Zoom
**Chosen**: Component-level zoom (only tiles scale)
**Rationale**:
- Users want to change information density, not scale the entire app
- Browser zoom scales controls, panels, axes - not useful
- Component zoom allows axes to stay fixed size (more professional)

### Decision 2: 5 Levels vs. 15 Levels
**Chosen**: 5 discrete levels
**Rationale**:
- Simpler mental model (Compact, Normal, Presentation)
- Easier to navigate with +/- buttons
- Forces intentional design of each level
- Avoids "dead zones" where levels feel too similar

### Decision 3: Aggressive Scaling (60%-150%) vs. Conservative (80%-120%)
**Chosen**: Aggressive (60%-150%)
**Rationale**:
- User explicitly requested "more aggressive"
- Conservative scaling doesn't meaningfully change density
- Need ~40-50% difference between Compact and Presentation to satisfy both use cases
- Can always dial back if too extreme (that's what Storybook is for!)

### Decision 4: Design Tokens vs. Hardcoded
**Chosen**: Design tokens in `tokens.ts`
**Rationale**:
- Easy to tweak values without touching component code
- Centralized, searchable, type-safe
- Hot-reloads in Storybook for rapid iteration
- Follows established design system patterns

### Decision 5: Context vs. Zustand Store
**Chosen**: Context (for now)
**Rationale**:
- Simple, React-native solution
- Zoom state is local to grid area
- Can migrate to Zustand later if needed
- Consistent with other local UI state

## Open Questions

### Resolved
- ✅ Should axes scale? **No** - keep fixed size
- ✅ How many zoom levels? **5** - discrete steps
- ✅ Linear or non-linear scaling? **Aggressive non-linear** (60%-150%)
- ✅ Where to store tokens? **frontend/src/theme/tokens.ts**

### To Be Resolved
- ⏳ Should right panel text scale? **Deferred** - not in this PR, can address later
- ⏳ Should we add a "Reset to Normal" button? **TBD** - already have Ctrl+0, may not need
- ⏳ Should zoom level show in UI? **TBD** - needs UX review

## Dependencies

**Frontend**:
- `@mui/material` - styling components
- `@dnd-kit/core` - drag-drop (existing)
- React Context API (or Zustand if we choose that)

**No Backend Changes Required** ✅

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Font too small at Level 0 | High - unusable | Set minimum font size (10px), test readability |
| Tiles too large at Level 4 | Medium - wasteful | Test with real conference room display |
| Inconsistent scaling feels janky | Medium - poor UX | Use Storybook to smooth progression |
| Breaking existing zoom users | Low - minor | Persist zoom level, map old values to new |
| Performance with many tiles | Low - unlikely | Test with 200+ employees, profile if needed |

## Success Metrics

**How we'll know this worked**:
1. ✅ Users can fit 40-50% more employees at Level 0 vs Level 2
2. ✅ Level 4 is readable from 10+ feet on 1080p display
3. ✅ All 5 levels feel meaningfully different
4. ✅ No font sizes below 10px (readability floor)
5. ✅ Zero unintended regressions (drag-drop, selection, filtering still work)
6. ✅ Zoom persists across sessions
7. ✅ Storybook makes token iteration effortless

## Timeline Estimate

**Phase-by-phase estimate** (in ideal development time):
- Phase 1-2 (Tokens + Storybook): ✅ **Complete** (~2 hours)
- Phase 3 (Token tuning): ⏳ **Current** (~1-2 hours)
- Phase 4 (Zoom Service): (~1 hour)
- Phase 5 (Context): (~1 hour)
- Phase 6 (Apply to components): (~2-3 hours) - Most complex
- Phase 7 (UI updates): (~30 min)
- Phase 8 (Testing): (~2-3 hours)
- Phase 9 (Docs): (~1 hour)
- Phase 10 (Review): (~1 hour)

**Total**: ~11-15 hours of development time

**Critical Path**: Phases 3 → 4 → 5 → 6 (must be sequential)

**Parallel Opportunities**: Phases 7-9 can happen in parallel with Phase 8

## Related Work

**Similar Features**:
- Design System tokens implementation (established pattern)
- Box expansion/collapse (precedent for grid layout changes)
- View mode toggle (precedent for changing grid appearance)

**Future Enhancements** (out of scope for this PR):
- Right panel text scaling
- Zoom presets (save favorite levels)
- Different zoom per grid box (probably not useful)
- Animation when changing zoom levels

## Notes & Learnings

**2024-12-30 - Initial Implementation**:
- Jumped straight to coding without documenting plan (bad! caught by user)
- Storybook approach is working well - visual feedback is invaluable
- Token Matrix story is excellent for comparing values
- Import path issues with `@/` alias in Storybook - use relative paths instead

**Next Steps**:
- Run Storybook and iterate on token values
- Get user feedback on scaling ratios
- Document any token changes and rationale
