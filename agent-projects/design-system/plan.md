# Design System Implementation Plan

## Metadata

```yaml
status: active
owner: Claude Code
created: 2025-12-24
summary:
  - Implement comprehensive design system with tokens, documentation, and tooling
  - Extract hardcoded values into centralized theme tokens
  - Create Storybook for component discovery and validation
  - Establish governance processes for design consistency
```

## Overview

Implement a comprehensive design system for 9Boxer to ensure beautiful, consistent, and maintainable UI design. This will guide AI agents and developers to maintain design consistency as new features are developed.

**GitHub Issue:** [#33](https://github.com/bencan1a/9boxer/issues/33)

## Current State Analysis

### Strengths
- ✅ Solid Material-UI v5 foundation with Emotion CSS-in-JS
- ✅ Well-structured light/dark theme system with auto-detection
- ✅ Good accessibility practices (WCAG AA compliant colors)
- ✅ Strong TypeScript usage with type safety
- ✅ i18n integration via react-i18next
- ✅ Consistent component patterns (functional components, hooks)

### Gaps
- ❌ No centralized design token documentation
- ❌ Hardcoded values throughout components (colors, spacing, dimensions)
- ❌ No component library catalog (Storybook)
- ❌ Limited design principles documentation
- ❌ Inconsistent barrel exports (only `intelligence/` has `index.ts`)
- ❌ No visual regression testing

### Technical Debt
1. **Hardcoded colors:** Traffic light colors (`#4caf50`, `#ff9800`, `#f44336`) not in theme
2. **Magic numbers:** Grid box heights, opacity values scattered in components
3. **Chart colors:** Some charts use hardcoded RGB values
4. **Inconsistent exports:** Missing barrel files in most component folders

## Phased Implementation

### Phase 1: Foundation ✅ (Weeks 1-2)

**Goal:** Extract and document existing design tokens

#### Tasks

- [ ] **1.1 Extract design tokens from theme.ts**
  - File: `frontend/src/theme/tokens.ts`
  - Extract: spacing, dimensions, opacity, semantic colors, z-index, durations, radius, shadows
  - Update `theme.ts` to import and use tokens
  - Test light/dark mode compatibility
  - **Deliverable:** Fully typed tokens.ts with all design constants

- [ ] **1.2 Document design tokens**
  - File: `docs/design-system/design-tokens.md`
  - Document all token categories with usage examples
  - Include light/dark mode color tables with hex codes
  - Add migration guide for converting hardcoded values
  - **Deliverable:** Comprehensive token reference guide

- [ ] **1.3 Create DESIGN_SYSTEM.md agent guidelines**
  - File: `DESIGN_SYSTEM.md` (root level, similar to CLAUDE.md)
  - Component development checklist
  - Styling rules and token usage guidelines
  - When to create new components vs. extend existing
  - Design review criteria
  - **Deliverable:** Complete agent guidelines document

- [ ] **1.4 Audit hardcoded values in components**
  - Scan all components for hardcoded colors, spacing, dimensions
  - Create prioritized migration plan (high-impact components first)
  - Document findings in `agent-tmp/hardcoded-values-audit.md`
  - **Deliverable:** Audit report with migration roadmap

**Acceptance Criteria:**
- [ ] All tokens extracted and typed
- [ ] Theme works correctly in light/dark modes
- [ ] Documentation includes code examples
- [ ] Agent guidelines include actionable checklist

---

### Phase 2: Documentation (Weeks 3-4)

**Goal:** Document design principles and component patterns

#### Tasks

- [x] **2.1 Write design principles documentation** ✅ COMPLETED
  - File: `docs/design-system/design-principles.md` (560 lines)
  - Core philosophy (clarity, data integrity, efficiency, accessibility, consistency)
  - Interaction principles (progressive disclosure, feedback, graceful degradation)
  - Visual design principles (color usage, typography, spacing, motion)
  - Component design guidelines (buttons, forms, tables, empty states)

- [x] **2.1.5 Create component inventory** ✅ COMPLETED (BONUS - Inserted)
  - File: `docs/design-system/component-inventory.md` (450 lines)
  - Complete catalog of all 32 components
  - Component hierarchy tree (visual nesting)
  - Reusability matrix (generic vs app-specific)
  - Migration status tracking
  - Component index and statistics

- [x] **2.2 Document component patterns and guidelines** ✅ COMPLETED
  - File: `docs/design-system/component-guidelines.md` (850 lines)
  - Component composition patterns (container/presentational, compound, provider)
  - When to create new components (decision tree, size/complexity thresholds)
  - Common UI patterns (empty states, loading, errors, notifications, dialogs, forms, drag-drop)
  - Component API design (props naming, required vs optional, TypeScript patterns)
  - Reusable hooks (data fetching, UI state)
  - Best practices (performance, accessibility, i18n)
  - Anti-patterns to avoid (prop drilling, too many states, missing keys)
  - Testing patterns (unit testing with Vitest)

- [ ] **2.3 Create accessibility standards guide**
  - File: `docs/design-system/accessibility-standards.md`
  - WCAG 2.1 Level AA requirements
  - Keyboard navigation patterns
  - Screen reader requirements
  - Focus indicator standards
  - Testing checklist

- [x] **2.4a Document layout patterns** ✅ COMPLETED
  - File: `docs/design-system/layout-patterns.md` (630 lines)
  - Complete application hierarchy (visual component tree)
  - Layout grid system (5-zone layout with dimensions)
  - Detailed UI zone anatomy (Toolbar, FilterDrawer, GridArea, RightPanel)
  - Panel & drawer patterns (collapsible, resizable)
  - Modal & dialog patterns (overlay, sizing, spacing)
  - Spacing rules and vertical rhythm
  - Responsive considerations (auto-collapse behavior)

- [x] **2.4b Document interaction patterns** ✅ COMPLETED
  - File: `docs/design-system/interaction-patterns.md` (680 lines)
  - Animation & transition standards (durations, easing, properties)
  - Drag-and-drop patterns (visual feedback, ghost overlay, drop zones)
  - Feedback mechanisms (loading states, notifications, progress indicators)
  - Hover & focus states (buttons, cards, interactive elements)
  - Keyboard shortcuts (global, context-specific)
  - State indicators (modification badges, connection status)
  - Implementation guidelines and accessibility considerations

**Acceptance Criteria:**
- [ ] All documents include code examples
- [ ] Principles are actionable (not abstract)
- [ ] Guidelines reference existing components
- [ ] Accessibility standards are testable

---

### Phase 3: Tooling (Weeks 5-6)

**Goal:** Add tooling for component discovery and validation

#### Tasks

- [ ] **3.1 Set up Storybook**
  - Install dependencies (@storybook/react, addons)
  - Configure with theme support (light/dark toggle)
  - Add essential addons (essentials, a11y, interactions)
  - Add custom theme decorator
  - Update package.json scripts

- [ ] **3.2 Create Storybook stories for common components**
  - Stories for: LoadingSpinner, FileUploadDialog, ZoomControls
  - Stories for: LanguageSelector, ConnectionStatus, ErrorBoundary
  - Include all variants and accessibility tests
  - Document props and usage

- [ ] **3.3 Add barrel exports to component folders**
  - Add `index.ts` to: common/, grid/, dashboard/, panel/, settings/
  - Update imports throughout codebase
  - Test no broken imports

- [ ] **3.4 Configure visual regression testing**
  - Install Chromatic or similar
  - Configure visual regression workflow
  - Set up baseline snapshots
  - Add CI integration
  - Document workflow

**Acceptance Criteria:**
- [ ] Storybook runs without errors at localhost:6006
- [ ] All stories show light/dark modes
- [ ] Accessibility tests passing
- [ ] Barrel exports work correctly
- [ ] Visual tests catch unintended changes

---

### Phase 4: Governance (Weeks 7-8)

**Goal:** Establish processes to maintain design consistency

#### Tasks

- [ ] **4.1 Create design review checklist for PRs**
  - File: `.github/PULL_REQUEST_TEMPLATE/design-review.md`
  - Visual consistency checks
  - Accessibility audit steps
  - Responsive testing, dark mode verification
  - i18n verification

- [ ] **4.2 Add design linting rules**
  - Configure stylelint for CSS-in-JS
  - Add eslint-plugin-jsx-a11y rules
  - Add custom ESLint rules for token usage
  - Update pre-commit hooks
  - Document linting rules

- [ ] **4.3 Update CLAUDE.md with design system references**
  - Add "Design System" section
  - Reference DESIGN_SYSTEM.md
  - Add critical rules
  - Link to design system docs

- [ ] **4.4 Create design system README and index**
  - File: `docs/design-system/README.md`
  - Overview of design system
  - Link to all documents
  - Quick start guide
  - Quick reference for AI agents

**Acceptance Criteria:**
- [ ] PR template includes all checks
- [ ] Linters catch common violations
- [ ] Pre-commit hooks enforce standards
- [ ] CLAUDE.md references design system
- [ ] Design system README is navigable

---

## Quick Wins (Parallel Work)

These can be tackled independently:

- [ ] **Quick Win 1:** Fix traffic light colors (add to theme, replace hardcoded values)
- [ ] **Quick Win 2:** Fix chart colors (add chart tokens, replace RGB values)
- [ ] **Quick Win 3:** Document color palette (visual reference with hex codes, contrast ratios)
- [ ] **Quick Win 4:** Add design system link to README.md

---

## Success Metrics

**Measurable:**
- Zero hardcoded colors in components
- Zero hardcoded spacing values
- 100% of reusable components have Storybook stories
- All UI PRs pass design review checklist
- WCAG AA compliance verified
- 95%+ visual regression test coverage

**Qualitative:**
- Consistent visual language
- Faster feature development
- Improved accessibility
- AI agents follow standards automatically
- Comprehensive design documentation

---

## Implementation Strategy

### Sequencing
1. **Phase 1 first** (foundational, blocking for other phases)
2. **Phase 2 tasks can be parallelized** (independent documentation)
3. **Phase 3 requires Phase 1** (tokens needed for Storybook)
4. **Phase 4 requires Phase 2-3** (documentation and tooling needed)

### Component Migration Priority
1. **Start with common/** (highest reuse)
2. **Then grid/** (core feature)
3. **Then dashboard/** (main UI)
4. **Then panel/** (detail views)
5. **Finally settings/** (lowest priority)

### Testing Strategy
- Visual regression tests after each component migration
- Accessibility audits after each story creation
- Manual QA in light/dark modes for each PR
- E2E tests ensure no regressions

### Rollout
- Implement tooling first (low risk)
- Migrate components incrementally
- Update documentation as components migrate
- Enforce standards via linting (gradual rollout)

---

## Current Progress

**Phase 1 Status:** In Progress

### Completed
- ✅ GitHub issue created (#33)
- ✅ Agent project plan created

### In Progress
- 🔄 Task 1.1: Extract design tokens

### Next Steps
1. Create `frontend/src/theme/tokens.ts`
2. Extract all hardcoded values from current theme
3. Test theme still works
4. Create documentation
5. Create agent guidelines

---

## Resources

**Current Files to Reference:**
- `frontend/src/theme/theme.ts` - Current theme configuration
- `frontend/src/components/intelligence/README.md` - Good component docs example
- `docs/contributing/screenshot-guide.md` - Visual content standards
- `docs/contributing/voice-and-tone-guide.md` - Writing style guide

**External Resources:**
- [Material-UI Design Tokens](https://mui.com/material-ui/customization/theming/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Storybook Best Practices](https://storybook.js.org/docs/react/writing-stories/introduction)

---

## Notes

- All code must pass pre-commit hooks (ruff, mypy, eslint)
- All UI changes must support light/dark modes
- All text must use i18n translation keys
- All components must have data-testid attributes
- All new components must have TypeScript types
- All new components must have accessibility attributes
