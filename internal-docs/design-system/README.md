# 9Boxer Design System

> A comprehensive design system for building consistent, accessible, and beautiful UIs in 9Boxer.

## Quick Start

**For AI Agents/Developers: Read this FIRST before any UI work!**

1. 📖 **Read** [component-guidelines.md](component-guidelines.md) - Complete UI development guidelines
2. 🎨 **Review** [design-tokens.md](design-tokens.md) - All colors, spacing, dimensions
3. 🧩 **Check** [component-inventory.md](component-inventory.md) - Catalog of existing components
4. ✅ **Follow** [linting-rules.md](linting-rules.md) - Automated quality checks

## What is the Design System?

The 9Boxer Design System ensures:
- **Visual Consistency** - Same look and feel across all features
- **Accessibility** - WCAG 2.1 Level AA compliance
- **Maintainability** - Centralized design tokens, no hardcoded values
- **Developer Velocity** - Reusable components, clear patterns, automated testing

## Documentation Index

### 📘 Essential Reading (Start Here)

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[component-guidelines.md](component-guidelines.md)** | Main guidelines, mandatory pre-work checklist | Before creating/modifying ANY UI |
| **[design-tokens.md](design-tokens.md)** | Colors, spacing, dimensions | When styling components |
| **[layout-patterns.md](layout-patterns.md)** | UI zones and layout structure | When positioning components |
| **[design-principles.md](design-principles.md)** | Design philosophy | When making design decisions |

### 🎨 Visual Design

| Document | Purpose |
|----------|---------|
| **[design-tokens.md](design-tokens.md)** | All design constants (colors, spacing, shadows, etc.) - centralized in `frontend/src/theme/tokens.ts` |
| **[layout-patterns.md](layout-patterns.md)** | Application layout structure and UI zones |
| **[interaction-patterns.md](interaction-patterns.md)** | Animations, drag-drop, feedback mechanisms |
| **[notification-patterns.md](notification-patterns.md)** | Banner vs toast decision guide, notification system integration |

### 🧩 Components

| Document | Purpose |
|----------|---------|
| **[component-inventory.md](component-inventory.md)** | Complete catalog of all components with design token usage status |
| **[component-guidelines.md](component-guidelines.md)** | When to create components, patterns, best practices |

### ♿ Accessibility

| Document | Purpose |
|----------|---------|
| **[accessibility-standards.md](accessibility-standards.md)** | WCAG 2.1 AA requirements and testing checklist |
| **[linting-rules.md](linting-rules.md)** | Automated accessibility checks via ESLint |

### 🔍 Quality Assurance

| Document | Purpose |
|----------|---------|
| **[linting-rules.md](linting-rules.md)** | ESLint/Stylelint rules for design consistency |
| **[../../.github/PULL_REQUEST_TEMPLATE/design-review.md](../../.github/PULL_REQUEST_TEMPLATE/design-review.md)** | PR checklist for UI changes |

## Quick Reference

### Design Tokens Location

```typescript
// Import design tokens
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();

  // Access tokens
  const spacing = theme.tokens.spacing.md;
  const color = theme.palette.primary.main;
  const dimension = theme.tokens.dimensions.gridBoxHeight;

  return <Box sx={{ p: spacing, color }} />;
};
```

**Token Categories:**
- `theme.tokens.spacing.*` - Spacing scale (xs, sm, md, lg, xl, xxl)
- `theme.tokens.colors.*` - Semantic colors (success, warning, error, info)
- `theme.tokens.dimensions.*` - Component dimensions (gridBoxHeight, panelWidth, etc.)
- `theme.tokens.opacity.*` - Opacity levels (disabled, hover, etc.)
- `theme.tokens.duration.*` - Animation durations (fast, normal, slow)
- `theme.tokens.zIndex.*` - Z-index layers (appBar, modal, tooltip, etc.)

### Critical Rules (TL;DR)

**DO:**
- ✅ Use design tokens for all styles (`theme.tokens.*` or `theme.palette.*`)
- ✅ Support both light and dark themes
- ✅ Add `data-testid` attributes for testing
- ✅ Use i18n translation keys for all text (`useTranslation()`)
- ✅ Include ARIA labels for accessibility
- ✅ Run `npm run lint` before committing

**DON'T:**
- ❌ Hardcode colors (`#1976d2`, `rgb(255, 0, 0)`)
- ❌ Hardcode spacing (`padding: '16px'`)
- ❌ Hardcode dimensions (`width: 300`)
- ❌ Skip accessibility attributes
- ❌ Forget to test in dark mode
- ❌ Create new components without checking existing ones

### UI Zones

Components belong in specific zones:

```
┌─────────────────────────────────────────────────────┐
│  Top Toolbar (AppBarContainer)                      │  ← Global actions
├────────┬────────────────────────────┬───────────────┤
│ Filter │  Grid Area                 │ Right Panel   │
│ Drawer │  (NineBoxGrid)             │ (Employee     │  ← Primary workspace
│        │                            │  Details)     │
└────────┴────────────────────────────┴───────────────┘
```

- **Top Toolbar** → Global actions (File, Export, Settings, Help)
- **Filter Drawer** → Search and filtering
- **Grid Area** → Employee manipulation (drag-drop, expand/collapse)
- **Right Panel** → Detailed information (Details, Changes, Stats, Intelligence)
- **Settings Dialog** → User preferences

## Tools & Testing

### Storybook (Component Discovery)

```bash
cd frontend
npm run storybook  # Opens at localhost:6006
```

**Features:**
- Browse all components in isolation
- Toggle light/dark themes
- Test accessibility (a11y addon)
- View component props and usage

### Visual Regression Testing

```bash
cd frontend

# Run visual tests
npm run test:visual

# Update baselines (when changes are intentional)
npm run test:visual:update
```

**How it works:**
- Playwright captures screenshots of Storybook stories
- Compares against baseline snapshots
- Fails if visual differences exceed tolerance (100 pixels or 1%)
- Prevents unintended visual regressions

### Linting

```bash
cd frontend

# Run ESLint (checks accessibility + design token usage)
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**What it checks:**
- Accessibility violations (WCAG 2.1 AA)
- Hardcoded colors/spacing (warns to use tokens)
- TypeScript best practices
- React hooks rules

## Governance

### PR Review Process

For all PRs with UI changes:

1. ✅ **Self-review** using `.github/PULL_REQUEST_TEMPLATE/design-review.md`
2. ✅ **Run linters** (`npm run lint`)
3. ✅ **Test both themes** (light + dark)
4. ✅ **Run visual tests** (`npm run test:visual`)
5. ✅ **Attach screenshots** in PR description
6. ✅ **Get design approval** from reviewer

### Automated Checks

**Pre-commit hooks:** (via `.pre-commit-config.yaml`)
- Ruff format/lint (Python backend)
- Mypy (Python type checking)
- Prettier (TypeScript/JavaScript formatting)

**CI/CD:** (GitHub Actions)
- ESLint accessibility checks
- Visual regression tests
- E2E test suite

### Maintenance

**Updating the design system:**

1. **Add new tokens** → Update `frontend/src/theme/tokens.ts`
2. **Update docs** → Edit relevant files in `docs/design-system/`
3. **Create Storybook story** → Add to `frontend/.storybook/stories/`
4. **Generate visual baselines** → Run `npm run test:visual:update`
5. **Update this README** → Keep index current

## Common Tasks

### Adding a New Component

1. **Check inventory** - Does it already exist? (see [component-inventory.md](component-inventory.md))
2. **Read guidelines** - Follow patterns in [component-guidelines.md](component-guidelines.md)
3. **Use design tokens** - No hardcoded values
4. **Add accessibility** - ARIA labels, keyboard navigation
5. **Create Storybook story** - All variants documented
6. **Add visual tests** - Baseline snapshots
7. **Update inventory** - Add to catalog

### Modifying Existing UI

1. **Read design system docs** - Understand current patterns
2. **Check impact** - Will this affect other components?
3. **Use design tokens** - Don't introduce hardcoded values
4. **Test both themes** - Light and dark
5. **Run visual tests** - Ensure no unintended changes
6. **Update baselines** - If changes are intentional (`npm run test:visual:update`)
7. **Fill out PR checklist** - Complete design review template

### Fixing Accessibility Issues

1. **Run linter** - `npm run lint` catches many issues
2. **Read standards** - See [accessibility-standards.md](accessibility-standards.md)
3. **Test keyboard** - Tab through all interactive elements
4. **Test screen reader** - Use NVDA/JAWS (Windows) or VoiceOver (Mac)
5. **Check contrast** - Use browser DevTools or online checkers
6. **Verify ARIA** - Use axe DevTools extension

## Resources

### Internal Documentation
- **[DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md)** - Main guidelines
- **[CLAUDE.md](../../CLAUDE.md)** - Complete development guide
- **[docs/design-system/](.)** - This directory (all design docs)

### External Resources
- **[Material-UI Documentation](https://mui.com/material-ui/)** - Component library we use
- **[WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)** - Accessibility guidelines
- **[Storybook Documentation](https://storybook.js.org/docs/react/)** - Component development tool
- **[Playwright Visual Testing](https://playwright.dev/docs/test-snapshots)** - Visual regression docs

### Getting Help

- **Read the docs** - Most questions answered in design system docs
- **Check Storybook** - See existing component examples
- **Run linters** - They provide helpful error messages
- **Review PR template** - Checklist covers common issues
- **Ask in PR** - Reviewers can provide design guidance

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-25 | Initial design system documentation |
| | | - Design tokens centralized in `frontend/src/theme/tokens.ts` |
| | | - Complete documentation suite created |
| | | - Storybook + visual regression testing configured |
| | | - Governance via linting and PR templates |
| 1.0.1 | 2025-12-27 | Updated component inventory to reflect current state |
| | | - Documented design token adoption status (27% using tokens) |
| | | - Removed phase-based migration references |
| | | - Clarified "as-is" vs "future work" sections |

---

**Maintained by:** Design System Team
**Last Updated:** 2025-12-27
**Questions?** Check [CLAUDE.md](../../CLAUDE.md) or [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md)
