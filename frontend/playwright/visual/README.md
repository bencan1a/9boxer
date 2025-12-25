# Visual Regression Testing

This directory contains visual regression tests for 9Boxer UI components using Playwright's built-in screenshot comparison.

## Overview

Visual regression testing automatically detects unintended visual changes to UI components by comparing screenshots against known-good baselines. This helps catch:
- Accidental style changes
- Layout shifts
- Color/theme inconsistencies
- Typography changes
- Component rendering bugs

## How It Works

1. **Baseline Generation**: First run creates reference screenshots stored in `__screenshots__/` folders
2. **Comparison**: Subsequent runs compare new screenshots against baselines
3. **Diff Detection**: Playwright uses pixelmatch to detect pixel differences
4. **Reporting**: HTML report shows side-by-side comparison of failures

## Running Visual Tests

### Prerequisites

Storybook must be running on `http://localhost:6006`:
```bash
npm run storybook
```

### Running Tests

```bash
# Run all visual tests (requires Storybook to be running)
npm run test:visual

# Run with UI mode (interactive)
npm run test:visual:ui

# Run in debug mode
npm run test:visual:debug

# Update baselines after intentional UI changes
npm run test:visual:update
```

### First Time Setup

1. Start Storybook: `npm run storybook`
2. Generate initial baselines: `npm run test:visual:update`
3. Commit the baseline screenshots to git

## Writing Visual Tests

### Basic Test Structure

```typescript
import { test } from '@playwright/test';
import { snapshotStoryBothThemes } from './storybook-helpers';

test.describe('MyComponent Visual Tests', () => {
  test('default appearance', async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      'mycomponent--default',
      'my-component-default'
    );
  });
});
```

### Helper Functions

#### `snapshotStory(page, storyId, snapshotName, options)`
Take a snapshot of a single Storybook story.

**Parameters:**
- `page`: Playwright page object
- `storyId`: Story ID (e.g., 'common-button--primary')
- `snapshotName`: Optional custom snapshot name
- `options`: Optional configuration
  - `theme`: 'light' or 'dark'
  - `fullPage`: Capture full scrollable page
  - `mask`: Array of CSS selectors to mask (for dynamic content)
  - `maxDiffPixels`: Maximum allowed pixel differences
  - `maxDiffPixelRatio`: Maximum allowed ratio of different pixels

**Example:**
```typescript
await snapshotStory(page, 'common-button--primary', 'button-primary.png', {
  theme: 'light',
  maxDiffPixels: 50,
});
```

#### `snapshotStoryBothThemes(page, storyId, baseName)`
Test a story in both light and dark themes.

**Parameters:**
- `page`: Playwright page object
- `storyId`: Story ID
- `baseName`: Base name for snapshots (adds -light/-dark suffix)

**Example:**
```typescript
await snapshotStoryBothThemes(page, 'common-button--primary', 'button-primary');
// Creates: button-primary-light.png, button-primary-dark.png
```

#### `navigateToStory(page, storyId, theme)`
Navigate to a specific story in Storybook iframe mode.

**Example:**
```typescript
await navigateToStory(page, 'common-button--primary', 'dark');
```

### Masking Dynamic Content

Use the `mask` option to hide elements that change between runs (timestamps, random data, animations):

```typescript
await snapshotStory(page, 'dashboard--default', 'dashboard.png', {
  mask: [
    '[data-testid="timestamp"]',
    '.loading-animation',
    '[data-dynamic="true"]'
  ],
});
```

### Setting Viewport Size

```typescript
test('responsive component', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 600 });
  await snapshotStory(page, 'mycomponent--mobile', 'mobile-view.png');
});
```

## Finding Story IDs

Story IDs follow the pattern: `component-name--story-name` (lowercase with hyphens)

**From Storybook UI:**
1. Open Storybook: `http://localhost:6006`
2. Navigate to your story
3. Look at the URL: `?path=/story/{story-id}`
4. Use the story ID in tests

**Example:**
- Story: `Common/LoadingSpinner` → Default
- Story ID: `common-loadingspinner--default`

## Updating Baselines

When you intentionally change UI styling:

1. Make your UI changes
2. Run tests to see failures: `npm run test:visual`
3. Review the diff images in `test-results/` to confirm changes are expected
4. Update baselines: `npm run test:visual:update`
5. Commit updated baseline screenshots

## CI/CD Integration

Visual tests run automatically on:
- Pull requests (when frontend code changes)
- Pushes to main branch

### CI Behavior

- **On Success**: Tests pass, no action needed
- **On Failure**:
  - Workflow fails with status check ❌
  - Uploads diff images as artifacts
  - Posts comment on PR with failed snapshots
  - Download artifacts to review differences

### Reviewing CI Failures

1. Go to failed GitHub Actions run
2. Download `visual-diffs` artifact
3. Review diff images to determine if changes are intentional
4. If intentional: Update baselines locally and push
5. If unintentional: Fix the bug causing visual change

## Configuration

Visual test settings are in `playwright.visual.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,        // Allow 100 pixels to differ
    maxDiffPixelRatio: 0.01,   // Allow 1% of pixels to differ
    animations: 'disabled',     // Disable animations during capture
    scale: 'css',              // Use CSS pixels (not device pixels)
  },
}
```

Adjust these thresholds if you get flaky failures due to font rendering or anti-aliasing differences.

## Troubleshooting

### Tests fail with "Storybook not running"
**Solution**: Start Storybook before running tests: `npm run storybook`

### Flaky failures due to minor pixel differences
**Solution**: Increase `maxDiffPixels` or `maxDiffPixelRatio` in config or per-test

### Large baseline file sizes
**Solution**:
- Use specific component snapshots instead of full-page
- Consider using `mask` to hide non-essential areas
- Snapshots are compressed PNGs, typically 10-50KB each

### Baselines look different on different machines
**Solution**:
- CI runs on Ubuntu with consistent rendering
- Always use CI baselines as source of truth
- Regenerate baselines on CI if local diffs persist

### Need to ignore specific elements
**Solution**: Use the `mask` option to hide dynamic content:
```typescript
mask: ['[data-testid="timestamp"]']
```

## Best Practices

1. **Test component states**, not full pages
   - ✅ Button states: default, hover, disabled
   - ❌ Entire dashboard page

2. **Always test both themes** (light and dark)
   - Use `snapshotStoryBothThemes` helper

3. **Mask dynamic content** (timestamps, random data, animations)
   - Use `mask` option to hide volatile elements

4. **Set consistent viewports** in test setup
   - Different viewport sizes = different screenshots

5. **Review diffs carefully** before updating baselines
   - Unintentional changes indicate bugs
   - Only update if change is intentional

6. **Keep snapshots small**
   - Test individual components, not full apps
   - Typical snapshot: 10-50KB

7. **Commit baselines to git**
   - Baselines are source of truth
   - CI needs them for comparison

## File Organization

```
frontend/playwright/visual/
├── README.md                          # This file
├── storybook-helpers.ts               # Helper functions for testing Storybook
├── loading-spinner.spec.ts            # LoadingSpinner component tests
├── file-upload-dialog.spec.ts         # FileUploadDialog component tests
├── theme-test.spec.ts                 # Theme consistency tests
└── {component-name}.spec.ts/          # Add more component tests here
    └── __screenshots__/               # Baseline snapshots (auto-generated)
        ├── chromium/                  # Browser-specific baselines
        │   ├── component-light.png
        │   └── component-dark.png
        └── {browser}/
```

## Adding New Visual Tests

1. Create new test file: `{component-name}.spec.ts`
2. Import helpers: `import { snapshotStoryBothThemes } from './storybook-helpers'`
3. Write test using helper functions
4. Generate baselines: `npm run test:visual:update`
5. Commit test file and baseline screenshots

**Example:**
```typescript
// button.spec.ts
import { test } from '@playwright/test';
import { snapshotStoryBothThemes } from './storybook-helpers';

test.describe('Button Visual Tests', () => {
  test('primary button', async ({ page }) => {
    await snapshotStoryBothThemes(page, 'common-button--primary', 'button-primary');
  });

  test('secondary button', async ({ page }) => {
    await snapshotStoryBothThemes(page, 'common-button--secondary', 'button-secondary');
  });
});
```

## Maintenance

- **Weekly**: Review and update visual tests when UI changes
- **Per PR**: Address visual test failures before merging
- **Monthly**: Review snapshot file sizes, clean up unused tests
- **As needed**: Adjust thresholds if getting flaky failures

## Resources

- [Playwright Visual Comparisons Docs](https://playwright.dev/docs/test-snapshots)
- [Storybook Visual Testing Guide](https://storybook.js.org/docs/writing-tests/visual-testing)
- [9Boxer Design System](../../../DESIGN_SYSTEM.md)
