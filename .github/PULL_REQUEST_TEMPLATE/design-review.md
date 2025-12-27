# Design Review Checklist

> Use this checklist when your PR includes UI changes to ensure design consistency and accessibility.

## Visual Consistency

- [ ] **Design tokens used** - No hardcoded colors, spacing, or dimensions
  - All colors from `theme.palette.*` or `theme.tokens.colors.*`
  - All spacing from `theme.tokens.spacing.*` or `theme.spacing(n)`
  - All dimensions from `theme.tokens.dimensions.*`

- [ ] **Theme modes tested** - Component works in both light and dark modes
  - Light mode: Colors have sufficient contrast
  - Dark mode: Colors adapt appropriately
  - Screenshots attached for both modes (if visual changes)

- [ ] **Typography consistent** - Using theme typography scale
  - Font sizes from `theme.typography.*`
  - Line heights from design system
  - Font weights match brand guidelines

- [ ] **Component reuse** - Existing components used where possible
  - Checked component inventory before creating new components
  - Extended existing components rather than duplicating
  - Followed component composition patterns

## Accessibility (WCAG 2.1 Level AA)

- [ ] **Keyboard navigation** - All interactive elements are keyboard accessible
  - Tab order is logical
  - Focus indicators are visible
  - Shortcuts documented (if applicable)

- [ ] **Screen reader support** - Content is accessible to assistive technology
  - Semantic HTML used (`<button>`, `<nav>`, etc.)
  - ARIA labels added where needed
  - Form labels properly associated
  - Error messages announced

- [ ] **Color contrast** - Text and UI elements meet contrast requirements
  - Text contrast ≥ 4.5:1 (or 3:1 for large text)
  - UI component contrast ≥ 3:1
  - Tested with contrast checker

- [ ] **Motion & animation** - Respects user motion preferences
  - Animations can be disabled
  - `prefers-reduced-motion` respected
  - No flashing/strobing content

- [ ] **Focus management** - Focus is managed correctly
  - Focus moves to new content (modals, notifications)
  - Focus restored when closing dialogs
  - No keyboard traps

## Responsive & Compatibility

- [ ] **Responsive behavior** - Layout adapts to different screen sizes
  - Tested at 1920x1080 (primary target)
  - Tested at 1280x720 (minimum supported)
  - Content remains accessible at all sizes

- [ ] **Dark mode** - Full dark mode support verified
  - All colors adapt (no hardcoded light-mode colors)
  - Shadows and borders visible in dark mode
  - Images/icons work in both modes

- [ ] **Browser compatibility** - Works in target browsers
  - Chromium-based browsers (primary)
  - No unsupported CSS features
  - Graceful degradation for older browsers

## Internationalization (i18n)

- [ ] **Text externalized** - All user-visible text uses translation keys
  - `useTranslation()` hook used
  - Keys added to `en/translation.json` and `es/translation.json`
  - No hardcoded strings in JSX

- [ ] **RTL consideration** - Layout works with RTL languages (future-proofing)
  - Logical properties used (`margin-inline-start` vs `margin-left`)
  - Icons don't assume LTR direction

## Testing

- [ ] **Component tests** - Unit tests added/updated
  - Vitest tests for new components
  - Tests cover key user interactions
  - Tests verify accessibility attributes

- [ ] **Visual regression** - Storybook stories added/updated
  - Stories for all component variants
  - Visual regression tests passing
  - Baselines updated if intentional changes

- [ ] **E2E tests** - E2E tests updated if needed
  - User workflows still pass
  - No regressions in existing features

## Code Quality

- [ ] **TypeScript types** - All props and state properly typed
  - No `any` types
  - Props interface exported
  - Complex types have JSDoc comments

- [ ] **Test IDs** - `data-testid` attributes added
  - Interactive elements have test IDs
  - Test IDs follow naming convention
  - Used in tests

- [ ] **Documentation** - Component usage documented
  - JSDoc comments on component and props
  - Storybook story includes usage examples
  - README updated if new pattern introduced

## Design System Compliance

- [ ] **Reviewed design system docs** - Followed established patterns
  - Read `DESIGN_SYSTEM.md` before implementation
  - Checked `internal-docs/design-system/component-guidelines.md`
  - Followed `internal-docs/design-system/design-principles.md`

- [ ] **Followed UI zones** - Component placed in correct UI zone
  - Top Toolbar → Global actions only
  - Filter Drawer → Search and filtering only
  - Grid Area → Employee manipulation only
  - Right Panel → Detailed information only
  - Settings Dialog → User preferences only

- [ ] **Animation standards** - Motion follows design system
  - Durations from `theme.tokens.duration.*`
  - Easing from design system
  - Animations enhance, don't distract

## Screenshots (for visual changes)

> Please attach screenshots showing your changes in both light and dark modes.

### Light Mode
<!-- Drag and drop screenshot here -->

### Dark Mode
<!-- Drag and drop screenshot here -->

### Before (if applicable)
<!-- Drag and drop screenshot here -->

### After
<!-- Drag and drop screenshot here -->

---

## Review Guidance

**For Reviewers:**
- Verify all checkboxes are checked
- Test in both light and dark modes locally
- Run keyboard navigation through the feature
- Check visual regression test results
- Validate accessibility with axe DevTools

**For PR Authors:**
- Use this checklist as a self-review before requesting review
- If any item doesn't apply, note why in PR description
- Attach screenshots for all visual changes
- Link to related design system documentation

---

## Additional Notes

<!-- Add any additional context about design decisions, accessibility considerations, or trade-offs made -->
