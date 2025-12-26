# View Controls Consolidation - Project Plan

```yaml
status: active
owner: Claude
created: 2025-12-24
summary:
  - Consolidate floating view controls into single top-right toolbar
  - Move language selector from AppBar to Settings dialog
  - Improve UX by grouping related controls and reducing toolbar clutter
```

## Problem Statement

**Current Issues:**
1. **Two separate floating control surfaces** - inconsistent UI pattern:
   - View mode toggle (grid/donut) at top-right
   - Zoom controls at bottom-left
2. **Language selector in toolbar** - rarely used, crowds AppBar
3. **Toolbar space constraints** - 10+ items competing for space

**UX Violations:**
- Violates design principle: group related controls
- Inconsistent with standard patterns (view controls should be together)
- Language is a "set once and forget" preference, not an active control

## Proposed Solution

### Part 1: Move Language Selector to Settings Dialog

**Changes:**
- Remove `<LanguageSelector />` from `AppBar.tsx`
- Add language selection to `SettingsDialog.tsx` (alongside theme controls)
- Update translations for new settings section

**Benefits:**
- ✅ Cleaner toolbar
- ✅ Groups configuration preferences logically
- ✅ Matches user mental model (language = configuration)

---

### Part 2: Consolidate View Controls

**Create unified `ViewControls` component at top-right:**

```
┌────────────────────────────────────────────────┐
│ [Grid ⇄ Donut] │ [Z-] [⟳] [Z+] [125%] [⛶]     │
└────────────────────────────────────────────────┘
```

**Component structure:**
```tsx
<ViewControls>
  <ViewModeToggle />        // Grid ⇄ Donut
  <Divider orientation="vertical" />
  <ZoomControls />          // - / Reset / + / Percentage
  <FullscreenToggle />      // Fullscreen icon
</ViewControls>
```

**Positioning:**
- `position: fixed`
- `top: 80px` (below AppBar)
- `right: 16px` (edge of viewport)
- `z-index: 10` (above grid, below modals)

**Benefits:**
- ✅ Single control surface for all view manipulation
- ✅ Top-right follows industry standard (video players, maps, etc.)
- ✅ Better discoverability - all view controls in one place
- ✅ Toolbar stays clean - no need to add 5+ items

---

## Implementation Plan

### Phase 1: Language Selector Migration

**Files to modify:**
- `frontend/src/components/dashboard/AppBar.tsx` - Remove LanguageSelector
- `frontend/src/components/settings/SettingsDialog.tsx` - Add language section
- `frontend/src/i18n/locales/en/translation.json` - Add settings translations
- `frontend/src/i18n/locales/es/translation.json` - Add settings translations

**Testing:**
- Verify language switching works from Settings
- Verify selected language persists after app restart
- Test with both English and Spanish

---

### Phase 2: ViewControls Component Creation

**New component:**
- `frontend/src/components/common/ViewControls.tsx` - Unified control toolbar
- `frontend/src/components/common/__tests__/ViewControls.test.tsx` - Component tests

**Component includes:**
1. **ViewModeToggle** - Switch between normal grid and donut view
2. **ZoomControls** - Zoom in/out/reset/percentage display
3. **FullscreenToggle** - Enter/exit fullscreen mode

**Refactoring needed:**
- Extract view mode toggle logic from current location
- Adapt existing `ZoomControls.tsx` to work within new container
- Group fullscreen toggle with other view controls

**Files to modify:**
- `frontend/src/components/dashboard/DashboardPage.tsx` - Import and use ViewControls
- `frontend/src/components/common/ZoomControls.tsx` - Adapt for new layout
- Remove old floating controls (separate view toggle and zoom controls)

**Styling considerations:**
- Use design tokens for spacing, colors, shadows
- Match current zoom controls styling (semi-transparent background)
- Add subtle divider between view mode toggle and zoom controls
- Ensure proper contrast in light and dark modes

---

### Phase 3: Testing

**Component Tests (Vitest):**
- `ViewControls.test.tsx`:
  - Renders all control groups
  - View mode toggle switches correctly
  - Zoom controls respond to clicks
  - Fullscreen toggle works
  - Keyboard shortcuts still function

**Visual/Manual Testing:**
- Test in light and dark modes
- Verify positioning at different window sizes
- Ensure controls don't obscure grid content
- Test keyboard shortcuts (Ctrl+/-, Ctrl+0, F11)
- Verify accessibility (ARIA labels, keyboard navigation)

**E2E Tests:**
- May need to update Playwright tests that interact with zoom/view controls
- Update selectors to find controls in new location

---

### Phase 4: Documentation Updates

**Files to update:**
- `docs/design-system/layout-patterns.md` - Document floating controls exception
- `DESIGN_SYSTEM.md` - Update UI zones section
- Add note explaining why view controls float vs. toolbar placement

**Rationale to document:**
- Floating controls are standard pattern for visualization apps
- Toolbar space constraints (10+ items would be too crowded)
- Frequently-used controls should be visible, not buried in toolbar
- Spatial relationship to content they affect

---

## Design System Exception

**Documented deviation from design system:**

The design system prescribes that view controls (zoom, fullscreen) should be in the **Top Toolbar**. However, this implementation uses **floating controls at top-right** for these reasons:

1. **Toolbar space constraints** - Adding 5+ view control items would crowd the toolbar
2. **Industry standard pattern** - Video players, mapping tools, and visualization apps use floating view controls
3. **Frequent use** - View controls are frequently accessed and should be visible
4. **Spatial relationship** - Controls positioned near the content they affect
5. **Scalability** - Allows toolbar to focus on file operations and settings

This is an **intentional, documented exception** to the design system, not an oversight.

---

## File Checklist

### New Files
- [x] `agent-projects/view-controls-consolidation/plan.md` (this file)
- [ ] `frontend/src/components/common/ViewControls.tsx`
- [ ] `frontend/src/components/common/__tests__/ViewControls.test.tsx`

### Modified Files
- [ ] `frontend/src/components/dashboard/AppBar.tsx`
- [ ] `frontend/src/components/settings/SettingsDialog.tsx`
- [ ] `frontend/src/components/dashboard/DashboardPage.tsx`
- [ ] `frontend/src/components/common/ZoomControls.tsx`
- [ ] `frontend/src/i18n/locales/en/translation.json`
- [ ] `frontend/src/i18n/locales/es/translation.json`
- [ ] `docs/design-system/layout-patterns.md`
- [ ] `DESIGN_SYSTEM.md`

### Tests to Update/Create
- [ ] `frontend/src/components/common/__tests__/ViewControls.test.tsx` (new)
- [ ] `frontend/src/components/settings/__tests__/SettingsDialog.test.tsx` (update)
- [ ] Playwright E2E tests (if affected)

---

## Acceptance Criteria

**Language Selector:**
- [x] Removed from AppBar
- [ ] Present in Settings dialog
- [ ] Language changes apply immediately
- [ ] Selected language persists after restart
- [ ] Translations complete for both English and Spanish

**View Controls:**
- [ ] Single unified control toolbar at top-right
- [ ] Contains view mode toggle, zoom controls, fullscreen toggle
- [ ] Positioned below AppBar, above grid content
- [ ] Styling consistent with design system (tokens, theme support)
- [ ] Keyboard shortcuts work (Ctrl+/-, Ctrl+0, F11)
- [ ] Accessible (ARIA labels, keyboard navigation, screen reader compatible)
- [ ] Works in light and dark modes

**Quality:**
- [ ] All component tests pass
- [ ] All E2E tests pass
- [ ] Type checking passes (TypeScript)
- [ ] Linting passes (ESLint)
- [ ] Manual testing in Electron app confirms functionality
- [ ] No regressions in existing features

**Documentation:**
- [ ] Design system updated to document exception
- [ ] Rationale for floating controls clearly explained
- [ ] Screenshots updated (if applicable)

---

## Timeline

**Estimated effort:** 4-6 hours

**Breakdown:**
- Phase 1 (Language Selector): 1-1.5 hours
- Phase 2 (ViewControls): 2-3 hours
- Phase 3 (Testing): 1 hour
- Phase 4 (Documentation): 0.5-1 hour

---

## Risks and Mitigations

**Risk:** Breaking existing E2E tests that rely on zoom control selectors
**Mitigation:** Search codebase for references before moving, update test selectors

**Risk:** Keyboard shortcuts stop working after refactor
**Mitigation:** Ensure event listeners are properly attached in new component structure

**Risk:** Positioning issues at different window sizes
**Mitigation:** Test thoroughly at various resolutions, use responsive breakpoints

**Risk:** Loss of functionality during refactor
**Mitigation:** Incremental approach, test frequently, keep old code until new version confirmed working

---

## Success Metrics

- ✅ Single floating control surface instead of two
- ✅ Language selector moved to appropriate configuration location
- ✅ Toolbar cleaned up (one less item)
- ✅ All tests passing
- ✅ No user-facing regressions
- ✅ Improved UX consistency

---

## Next Steps

1. ✅ Create this plan document
2. Review current implementation of view mode toggle and zoom controls
3. Begin Phase 1: Language selector migration
4. Begin Phase 2: ViewControls component creation
5. Test thoroughly
6. Update documentation
7. Commit and create PR
