# Visual Regression Testing Guide

## Overview

9Boxer uses Playwright's built-in visual regression testing to automatically detect unintended visual changes to UI components. This catches visual bugs before they reach production.

## Quick Start

### First Time Setup

```bash
cd frontend

# Start Storybook (required for visual tests)
npm run storybook

# In a new terminal, generate baseline snapshots
npm run test:visual:update

# Commit the baseline snapshots
git add playwright/visual/**/__screenshots__
git commit -m "chore: add visual regression test baselines"
```

### Daily Workflow

```bash
# Start Storybook
npm run storybook

# In a new terminal, run visual tests
npm run test:visual

# If failures occur, review diffs in test-results/
# Update baselines if changes are intentional
npm run test:visual:update
```

## What It Tests

Visual regression tests capture screenshots of Storybook components and compare them against known-good baselines. The tests detect:

- Color and theme changes
- Layout shifts and spacing issues
- Typography changes
- Component rendering bugs
- CSS regressions

## Test Coverage

Current visual tests cover:
- **LoadingSpinner**: All size variants (small, default, large) + custom colors
- **FileUploadDialog**: All states (closed, open, file selected, uploading, error)
- **Theme**: Color palette, typography, spacing showcase

**Note**: Visual tests test both light and dark themes for all components.

## Writing Visual Tests

### Basic Example

```typescript
import { test } from '@playwright/test';
import { snapshotStoryBothThemes } from './storybook-helpers';

test.describe('Button Visual Tests', () => {
  test('primary button appearance', async ({ page }) => {
    // Tests both light and dark themes automatically
    await snapshotStoryBothThemes(
      page,
      'common-button--primary',
      'button-primary'
    );
  });
});
```

### Advanced Example (Masking Dynamic Content)

```typescript
import { test } from '@playwright/test';
import { snapshotStory } from './storybook-helpers';

test.describe('Dashboard Visual Tests', () => {
  test('dashboard with masked timestamp', async ({ page }) => {
    await snapshotStory(
      page,
      'dashboard--default',
      'dashboard.png',
      {
        theme: 'light',
        mask: ['[data-testid="timestamp"]'], // Hide dynamic content
        maxDiffPixels: 200, // Allow more variance for complex layouts
      }
    );
  });
});
```

## Helper Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `snapshotStoryBothThemes` | Test story in light and dark themes | `await snapshotStoryBothThemes(page, 'button--primary', 'button')` |
| `snapshotStory` | Test story with custom options | `await snapshotStory(page, 'button--primary', 'btn.png', { theme: 'dark' })` |
| `navigateToStory` | Navigate to Storybook story | `await navigateToStory(page, 'button--primary', 'light')` |

See [frontend/playwright/visual/README.md](../../frontend/playwright/visual/README.md) for complete API documentation.

## CI/CD Integration

Visual regression tests run automatically on:
- **Pull Requests**: When frontend code changes
- **Main Branch**: On every push

### Handling CI Failures

When visual tests fail in CI:

1. **Download Artifacts**
   - Go to the failed GitHub Actions run
   - Download the `visual-diffs` artifact

2. **Review Diffs**
   - Extract the artifact
   - Review diff images (side-by-side comparison)

3. **Determine Action**
   - **Intentional change**: Update baselines locally and push
   - **Unintentional change**: Fix the bug causing the visual difference

4. **Update Baselines** (if intentional)
   ```bash
   npm run test:visual:update
   git add playwright/visual/**/__screenshots__
   git commit -m "chore: update visual regression baselines"
   git push
   ```

## Configuration

Visual test thresholds are configured in `playwright.visual.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,        // Allow 100 pixels to differ
    maxDiffPixelRatio: 0.01,   // Allow 1% of pixels to differ
    animations: 'disabled',     // Disable animations
    scale: 'css',              // Use CSS pixels
  },
}
```

### When to Adjust Thresholds

- **Flaky failures**: Increase `maxDiffPixels` or `maxDiffPixelRatio`
- **Font rendering differences**: Increase per-test thresholds
- **Complex layouts**: Use per-test overrides instead of global config

## Troubleshooting

### "Storybook not running" Error

**Cause**: Visual tests require Storybook to be running on `http://localhost:6006`

**Solution**:
```bash
npm run storybook
# In new terminal
npm run test:visual
```

### Flaky Test Failures

**Cause**: Minor pixel differences due to font rendering or anti-aliasing

**Solution 1 - Increase Threshold**:
```typescript
await snapshotStory(page, 'component--story', 'snapshot.png', {
  maxDiffPixels: 200, // Allow more variance
});
```

**Solution 2 - Mask Dynamic Elements**:
```typescript
await snapshotStory(page, 'component--story', 'snapshot.png', {
  mask: ['[data-testid="timestamp"]'], // Hide volatile content
});
```

### Different Results on Different Machines

**Cause**: Font rendering and OS-level differences

**Solution**: Always use CI baselines as source of truth. Regenerate baselines on CI if local diffs persist.

### Large Baseline File Sizes

**Cause**: Full-page snapshots or too many components

**Solution**:
- Test individual components, not full pages
- Use specific element snapshots: `await expect(page.locator('.component')).toHaveScreenshot()`
- Typical snapshot size: 10-50KB

## Best Practices

### ✅ DO

- Test component states, not full pages
- Test both light and dark themes
- Mask dynamic content (timestamps, animations)
- Set consistent viewports in test setup
- Review diffs carefully before updating baselines
- Commit baseline snapshots to git

### ❌ DON'T

- Test entire application pages (too fragile)
- Leave dynamic content unmasked
- Update baselines without reviewing diffs
- Test components with random data
- Ignore CI failures

## File Organization

```
frontend/
└── playwright/
    └── visual/
        ├── README.md                    # Detailed usage guide
        ├── storybook-helpers.ts         # Helper functions
        ├── loading-spinner.spec.ts      # Component tests
        ├── file-upload-dialog.spec.ts
        ├── theme-test.spec.ts
        └── {component}.spec.ts/         # More tests here
            └── __screenshots__/         # Baseline snapshots (committed to git)
                └── chromium/
                    ├── snapshot-light.png
                    └── snapshot-dark.png
```

## Adding New Tests

1. **Create Test File**
   ```bash
   touch frontend/playwright/visual/my-component.spec.ts
   ```

2. **Write Test**
   ```typescript
   import { test } from '@playwright/test';
   import { snapshotStoryBothThemes } from './storybook-helpers';

   test.describe('MyComponent Visual Tests', () => {
     test('default state', async ({ page }) => {
       await snapshotStoryBothThemes(
         page,
         'mycomponent--default',
         'my-component-default'
       );
     });
   });
   ```

3. **Generate Baselines**
   ```bash
   npm run test:visual:update
   ```

4. **Commit**
   ```bash
   git add playwright/visual/my-component.spec.ts
   git add playwright/visual/**/__screenshots__
   git commit -m "test: add visual regression tests for MyComponent"
   ```

## Maintenance Schedule

- **Weekly**: Review and update baselines when UI changes
- **Per PR**: Address visual test failures before merging
- **Monthly**: Review snapshot file sizes, clean up unused tests
- **As Needed**: Adjust thresholds if getting flaky failures

## Cost Analysis

| Aspect | Cost |
|--------|------|
| **Tool Cost** | $0/month (built into Playwright) |
| **Setup Time** | ~1 hour (one-time) |
| **Maintenance** | 1-2 hours/month |
| **Repo Size** | ~5-10MB for snapshots |
| **CI Time** | +2-3 minutes per run |

**Total Cost of Ownership**: Negligible

## Why Playwright Over SaaS?

We chose Playwright's built-in visual regression over SaaS tools (Chromatic, Percy) because:

1. **Zero Cost**: No monthly fees, unlimited snapshots
2. **No Lock-in**: Complete control over baselines
3. **Privacy**: No uploading screenshots to external services
4. **Offline Support**: Works without internet connection
5. **Simplicity**: Already using Playwright for E2E tests
6. **Git-Based**: Baselines version-controlled with code

**Trade-off Accepted**: Less sophisticated diff UI compared to SaaS tools, but HTML reports are still very usable.

## Resources

- [Playwright Visual Comparisons Docs](https://playwright.dev/docs/test-snapshots)
- [Visual Testing README](../../frontend/playwright/visual/README.md) (detailed API docs)
- [9Boxer Design System](../../DESIGN_SYSTEM.md)
- [Storybook Instance](http://localhost:6006) (when running locally)

## Related Documentation

- [E2E Testing Guide](./e2e-testing.md)
- [Component Testing Guide](./component-testing.md)
- [Testing Principles](./test-principles.md)
- [Testing Quick Reference](./quick-reference.md)
