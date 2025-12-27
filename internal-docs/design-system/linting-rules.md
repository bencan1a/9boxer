# Design System Linting Rules

This document explains the linting rules enforced to maintain design system consistency and code quality.

## Overview

9Boxer uses automated linting to enforce:
- **Accessibility standards** (WCAG 2.1 Level AA)
- **Design token usage** (preventing hardcoded values)
- **Code quality best practices**
- **React/TypeScript patterns**

## Running Linters

```bash
cd frontend

# Run ESLint
npm run lint

# Fix auto-fixable ESLint issues
npm run lint -- --fix

# Run Stylelint (for CSS files)
npx stylelint "**/*.css"
```

## ESLint Rules

### Accessibility Rules (`jsx-a11y`)

These rules ensure WCAG 2.1 Level AA compliance:

| Rule | Level | Description |
|------|-------|-------------|
| `jsx-a11y/alt-text` | Error | All images must have alt text |
| `jsx-a11y/anchor-has-content` | Error | Links must have accessible content |
| `jsx-a11y/anchor-is-valid` | Error | Links must have valid hrefs |
| `jsx-a11y/aria-props` | Error | ARIA props must be valid |
| `jsx-a11y/aria-proptypes` | Error | ARIA prop types must be correct |
| `jsx-a11y/heading-has-content` | Error | Headings must have content |
| `jsx-a11y/label-has-associated-control` | Error | Form labels must be associated with controls |
| `jsx-a11y/no-autofocus` | Warning | Avoid autofocus (accessibility concern) |
| `jsx-a11y/no-distracting-elements` | Error | No `<marquee>` or `<blink>` |
| `jsx-a11y/no-redundant-roles` | Error | Don't add redundant ARIA roles |
| `jsx-a11y/role-has-required-aria-props` | Error | ARIA roles must have required props |
| `jsx-a11y/role-supports-aria-props` | Error | Only use supported ARIA props |
| `jsx-a11y/tabindex-no-positive` | Warning | Avoid positive tabindex values |

**Examples:**

```tsx
// ❌ BAD - Missing alt text
<img src="chart.png" />

// ✅ GOOD - Has alt text
<img src="chart.png" alt="Distribution chart showing employee performance" />

// ❌ BAD - Label not associated
<label>Name</label>
<input type="text" />

// ✅ GOOD - Label properly associated
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ❌ BAD - Positive tabindex
<div tabIndex={5}>...</div>

// ✅ GOOD - Natural tab order
<button>...</button>
```

### Design System Rules

#### No Hardcoded Colors

**Rule:** `no-restricted-syntax` (warns on hex/RGB values)

```tsx
// ❌ BAD - Hardcoded colors
const styles = {
  color: '#1976d2',
  background: 'rgb(255, 99, 71)',
  border: '1px solid rgba(0, 0, 0, 0.12)',
};

// ✅ GOOD - Use theme tokens
const theme = useTheme();
const styles = {
  color: theme.palette.primary.main,
  background: theme.tokens.colors.error,
  border: `1px solid ${theme.palette.divider}`,
};

// ✅ GOOD - MUI sx prop with theme
<Box sx={{
  color: 'primary.main',
  bgcolor: 'background.paper',
  borderColor: 'divider',
}} />
```

**Rationale:** Hardcoded colors break theme consistency and don't adapt to light/dark modes.

### TypeScript Rules

| Rule | Level | Description |
|------|-------|-------------|
| `@typescript-eslint/no-explicit-any` | Warning | Avoid `any` type, use specific types |
| `@typescript-eslint/no-unused-vars` | Warning | Remove unused variables (except prefixed with `_`) |
| `@typescript-eslint/no-var-requires` | Off (Electron only) | Allow `require()` in Electron main process |

**Examples:**

```typescript
// ❌ BAD - Using 'any'
function processData(data: any) {
  return data.map(item => item.value);
}

// ✅ GOOD - Specific type
interface DataItem {
  value: number;
}

function processData(data: DataItem[]) {
  return data.map(item => item.value);
}

// ❌ BAD - Unused variable
function calculate() {
  const unusedValue = 42;
  return 100;
}

// ✅ GOOD - No unused variables
function calculate() {
  return 100;
}

// ✅ GOOD - Prefix with _ if intentionally unused
function handleEvent(_event: Event, data: string) {
  console.log(data);
}
```

### React Rules

| Rule | Level | Description |
|------|-------|-------------|
| `react-hooks/rules-of-hooks` | Error | Follow Hook rules |
| `react-hooks/exhaustive-deps` | Warning | Include all dependencies in useEffect/useCallback |
| `react-refresh/only-export-components` | Warning | Only export components from component files |

**Examples:**

```tsx
// ❌ BAD - Hook inside condition
function Component({ show }) {
  if (show) {
    useState(0); // Hooks can't be conditional
  }
}

// ✅ GOOD - Hook at top level
function Component({ show }) {
  const [count, setCount] = useState(0);
  if (show) {
    return <div>{count}</div>;
  }
  return null;
}

// ❌ BAD - Missing dependency
useEffect(() => {
  doSomething(value);
}, []); // 'value' should be in dependencies

// ✅ GOOD - All dependencies included
useEffect(() => {
  doSomething(value);
}, [value]);
```

## Stylelint Rules

Stylelint lints regular CSS files (not CSS-in-JS).

**Configuration:** `.stylelintrc.json`

**Current rules:**
- Extends `stylelint-config-standard`
- Ignores TypeScript/JavaScript files (we use CSS-in-JS)
- Disables some opinionated rules for flexibility

**Usage:**

```bash
# Lint CSS files
npx stylelint "**/*.css"

# Auto-fix issues
npx stylelint "**/*.css" --fix
```

## Pre-Commit Hooks

Linting is enforced via pre-commit hooks (`.pre-commit-config.yaml`).

**Currently enforced:**
- Ruff format/lint (Python)
- Mypy (Python type checking)
- Prettier (TypeScript/JavaScript formatting)

**To add ESLint to pre-commit:**

Update `.pre-commit-config.yaml`:

```yaml
  - repo: local
    hooks:
      - id: eslint
        name: ESLint
        entry: bash -c 'cd frontend && npm run lint'
        language: system
        types: [typescript, javascript, tsx, jsx]
        pass_filenames: false
```

## Integration with CI/CD

Add ESLint to GitHub Actions:

```yaml
# .github/workflows/frontend-ci.yml
- name: Lint frontend
  working-directory: frontend
  run: npm run lint
```

## Disabling Rules (When Necessary)

Sometimes you need to disable a rule temporarily. Always add a comment explaining why:

```tsx
// eslint-disable-next-line jsx-a11y/no-autofocus -- This is the primary action
<input autoFocus />

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- External library type
const data: any = externalLibrary.getData();

/* eslint-disable no-restricted-syntax */
// Temporarily allow hardcoded colors during migration
const legacyColor = '#ff0000';
/* eslint-enable no-restricted-syntax */
```

**Rules for disabling:**
1. Only disable when absolutely necessary
2. Always add explanatory comment
3. Use `eslint-disable-next-line` for single lines
4. Use `/* eslint-disable */` blocks for multiple lines
5. Always re-enable rules after the exception

## Common Issues and Fixes

### "Avoid hardcoded hex colors"

**Problem:** You're using a hardcoded color like `#1976d2`.

**Fix:** Use theme tokens:

```tsx
// Before
<Box sx={{ color: '#1976d2' }} />

// After
<Box sx={{ color: 'primary.main' }} />
// or
const theme = useTheme();
<Box sx={{ color: theme.palette.primary.main }} />
```

### "Missing alt text"

**Problem:** Image has no alt attribute.

**Fix:** Add descriptive alt text:

```tsx
// Before
<img src="logo.png" />

// After
<img src="logo.png" alt="9Boxer logo" />
```

### "Label not associated with control"

**Problem:** Form label doesn't link to input.

**Fix:** Use `htmlFor` attribute:

```tsx
// Before
<label>Email</label>
<input type="email" />

// After
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### "Unexpected any"

**Problem:** Using `any` type.

**Fix:** Define proper interface:

```typescript
// Before
function process(data: any) {
  return data.value;
}

// After
interface Data {
  value: number;
}

function process(data: Data) {
  return data.value;
}
```

## Best Practices

1. **Run linters before committing**
   ```bash
   npm run lint
   ```

2. **Fix issues immediately** - Don't let them accumulate

3. **Use auto-fix when possible**
   ```bash
   npm run lint -- --fix
   ```

4. **Test in both light/dark modes** - Visual checks catch issues linters miss

5. **Add data-testid** - Helps with testing and debugging

6. **Follow design system docs** - Linters catch syntax, but you need to follow patterns

## Resources

- **ESLint Documentation:** https://eslint.org/docs/rules/
- **jsx-a11y Plugin:** https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
- **TypeScript ESLint:** https://typescript-eslint.io/
- **Stylelint Documentation:** https://stylelint.io/
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

## Maintenance

**Updating rules:**
1. Edit `.eslintrc.cjs` or `.stylelintrc.json`
2. Test changes locally: `npm run lint`
3. Update this documentation
4. Communicate changes to team

**Adding new rules:**
1. Discuss with team (if opinionated)
2. Add to config with appropriate level (error/warn)
3. Document in this file with examples
4. Update pre-commit hooks if needed

---

**Last Updated:** 2025-12-25
**Maintained by:** Design System Team
