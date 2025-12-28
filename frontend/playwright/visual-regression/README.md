# Documentation Screenshot Visual Regression Tests

This directory contains visual regression tests for documentation screenshots, ensuring that automated screenshot regeneration doesn't introduce unintended visual changes.

## Overview

**Purpose:** Validate that documentation screenshots match approved baselines to catch visual regressions.

**Phase:** 3.1 - Visual Regression Testing
**Related Issues:** #61, #54, #55

## How It Works

1. **Baseline Creation:** First run establishes baseline screenshots
2. **Comparison:** Subsequent runs compare current screenshots against baselines
3. **Threshold:** 5% pixel difference tolerance (configurable)
4. **Reporting:** Visual diff reports show what changed

## Test Suites

### screenshot-validation.spec.ts

Main visual regression test suite:

- **Visual Regression Tests:** Compares each automated screenshot against baseline
- **Metadata Validation:** Ensures all screenshots have proper configuration
- **Dimension Validation:** Checks screenshots match expected dimensions
- **Summary Reports:** Documents missing or changed screenshots

## Usage

### Run Visual Regression Tests

```bash
# Run all documentation visual regression tests
cd frontend
npm run test:docs-visual

# Run with UI mode (recommended for debugging)
npm run test:docs-visual:ui

# Update baselines (after approving visual changes)
npm run test:docs-visual:update
```

### Create/Update Baselines

When screenshots are intentionally changed:

```bash
# 1. Regenerate affected screenshots
npm run screenshots:generate:affected

# 2. Update visual regression baselines
npm run test:docs-visual:update
```

### CI Integration

Visual regression tests run automatically in CI:
- On PRs that modify frontend code
- After screenshot regeneration (Phase 2)
- Before creating documentation PRs

## Directory Structure

```
visual-regression/
├── README.md                              # This file
├── screenshot-validation.spec.ts          # Visual regression test suite
└── __baselines__/                         # Baseline screenshots (gitignored)
    ├── screenshot-validation.spec.ts-snapshots/
    │   ├── changes-tab-baseline.png
    │   ├── grid-normal-baseline.png
    │   └── ...
```

## Configuration

### Playwright Config

Tests configured in `playwright.config.ts`:

```typescript
{
  name: "docs-visual",
  testDir: "./playwright/visual-regression",
  timeout: 60000,
  fullyParallel: true,
}
```

### Visual Comparison Settings

```typescript
const VISUAL_REGRESSION_CONFIG = {
  maxDiffPixelRatio: 0.05,  // 5% tolerance
  threshold: 0.2,            // 20% color difference
};
```

## What Gets Tested

✅ **Automated Screenshots:** All screenshots with `manual: false`
❌ **Manual Screenshots:** Excluded (require manual composition)

### Screenshot Sources

- **Storybook:** Component-level screenshots from isolated stories
- **Full-App:** Workflow screenshots from complete application

## Workflow Integration

### Phase 2 → Phase 3 Flow

```
1. Developer changes component
2. Change Detection (Phase 2.2) identifies affected screenshots
3. Selective Regeneration (Phase 2.3) regenerates screenshots
4. Visual Regression (Phase 3.1) validates quality
5. Visual Diff Report (Phase 3.2) shows changes
6. Documentation PR created with validated screenshots
```

## Handling Test Failures

### Visual Regression Failure

If tests fail due to visual differences:

1. **Review the diff:** Check Playwright HTML report for visual differences
2. **Determine if intentional:**
   - ✅ Intentional change → Update baselines
   - ❌ Unintended regression → Fix the code
3. **Update baselines if needed:**
   ```bash
   npm run test:docs-visual:update
   ```

### Missing Screenshot Failure

If a screenshot doesn't exist:

```bash
# Generate the missing screenshot
npm run screenshots:generate <screenshot-id>

# Or regenerate all affected screenshots
npm run screenshots:generate:affected
```

### Dimension Validation Failure

If screenshot dimensions are wrong:

1. Check the screenshot generation code
2. Verify viewport settings in workflow
3. Update expected dimensions in `config.ts` if intentional

## Best Practices

### When to Update Baselines

✅ **Do update baselines when:**
- Intentionally changing component UI
- Fixing design inconsistencies
- Updating design system tokens
- After approved design changes

❌ **Don't update baselines when:**
- Tests fail unexpectedly
- Changes are unintentional
- Visual regression is a bug
- Haven't reviewed the diff

### Reviewing Visual Changes

1. **Run with UI mode:**
   ```bash
   npm run test:docs-visual:ui
   ```

2. **Check the HTML report:**
   - View side-by-side comparisons
   - Inspect diff overlays
   - Verify changes are intentional

3. **Validate in context:**
   - Check screenshot in actual documentation
   - Ensure it still represents the feature accurately
   - Verify no information is lost

## Troubleshooting

### Tests Pass Locally but Fail in CI

**Cause:** Rendering differences between environments

**Solution:**
- Ensure consistent viewport sizes
- Disable animations in screenshots
- Use deterministic test data
- Increase tolerance if needed (carefully)

### False Positives (Small Pixel Differences)

**Cause:** Anti-aliasing, font rendering differences

**Solution:**
- Adjust `threshold` setting (color tolerance)
- Mask dynamic content (timestamps, random data)
- Use consistent fonts and rendering

### Baselines Not Committed

**Cause:** Baselines in `.gitignore`

**Solution:**
- Baselines are NOT committed to git (by design)
- Each environment generates its own baselines
- First run in CI creates baselines, subsequent runs compare

## Related Documentation

- [Screenshot Generation System](../screenshots/README.md)
- [Playwright Visual Testing Docs](https://playwright.dev/docs/test-snapshots)

## Support

For issues or questions:
1. Check Playwright HTML report: `npx playwright show-report`
2. Run in UI mode for debugging: `npm run test:docs-visual:ui`
3. Review Phase 3 documentation in `agent-projects/self-managing-docs-system/`
