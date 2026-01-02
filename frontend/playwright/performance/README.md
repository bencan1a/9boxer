# Performance Tests

This directory contains end-to-end performance tests for the 9Boxer application using Playwright.

## Overview

These tests measure and validate that the application meets performance expectations across different environments. The tests are designed to catch performance regressions while being resilient to environment variations.

## Test Files

### `app-load.spec.ts`
Tests initial application load performance:
- Time to interactive (TTI)
- Backend connection establishment
- DOM metrics (content loaded, interactive, complete)
- Long task detection
- JavaScript bundle loading
- First meaningful paint

### `grid-performance.spec.ts`
Tests 9-box grid rendering performance:
- Grid render time with sample data
- Employee list expansion
- Scrolling performance
- Web Vitals (LCP, FCP, TTFB)
- Memory usage monitoring

### `filter-performance.spec.ts`
Tests filtering operation performance:
- Single filter application
- Filter clearing
- Multiple filter application
- Search input responsiveness
- Rapid filter toggling

### `drag-performance.spec.ts`
Tests drag-and-drop performance:
- Single drag operation
- Multiple consecutive drags
- UI responsiveness during drag
- Memory leak detection
- Drag preview rendering

## CI-Adjusted Thresholds

Performance tests use different thresholds based on the environment:

- **Local Development**: Stricter thresholds for optimal performance
- **CI Environment**: More lenient thresholds accounting for:
  - Cold starts and compilation overhead
  - Resource contention from parallel tests
  - Virtualization overhead
  - Network latency (even for localhost)

### Threshold Multipliers

The tests use a `getThreshold()` helper function that automatically adjusts expectations:

```typescript
const getThreshold = (localValue: number, ciMultiplier = 1.5): number => {
  return process.env.CI ? Math.round(localValue * ciMultiplier) : localValue;
};
```

Common multipliers:
- **1.33x-1.5x**: Standard operations (DOM loading, rendering)
- **1.67x-2x**: Complex operations (filtering, multiple interactions)
- **+50%**: Memory thresholds (50MB local → 75MB CI)

### Example Thresholds

| Metric | Local | CI | Multiplier |
|--------|-------|-----|------------|
| App Load | 3000ms | 5000ms | 1.67x |
| Grid Render | 2000ms | 3000ms | 1.5x |
| Filter Apply | 500ms | 1000ms | 2x |
| Drag Operation | 1000ms | 1500ms | 1.5x |
| Memory Growth | 50MB | 75MB | 1.5x |

## Running Tests

```bash
# Run all performance tests
npm run test:perf:e2e

# Run with UI mode for debugging
npm run test:perf:e2e:ui

# Run specific test file
npx playwright test --project=performance app-load

# Run in debug mode
npm run test:perf:e2e:debug
```

## Environment Detection

Tests automatically detect the CI environment using `process.env.CI`. When running in CI:
- Thresholds are automatically adjusted
- Console output includes CI indicator
- More lenient expectations for resource-constrained environments

## Test Philosophy

1. **Catch Real Regressions**: Thresholds are set to detect meaningful performance degradation
2. **Avoid False Positives**: CI adjustments prevent flaky tests from environment variance
3. **Provide Context**: Console logging shows actual vs expected performance
4. **Graceful Degradation**: Tests skip when features aren't available (e.g., Memory API)

## Interpreting Results

### Success
```
✓ App loaded in 2847ms (target: <5000ms, CI: true)
```
The test passed with good performance margin.

### Warning
```
✓ App loaded in 4823ms (target: <5000ms, CI: true)
```
The test passed but is close to the threshold - may need investigation.

### Failure
```
✗ App loaded in 5234ms (target: <5000ms, CI: true)
Error: expect(received).toBeLessThan(expected)
```
The test failed - investigate what caused the slowdown.

## Maintenance

### When to Update Thresholds

**DO update thresholds when:**
- App architecture fundamentally changes (e.g., new bundler, major framework upgrade)
- CI infrastructure changes (e.g., faster runners, different OS)
- Performance optimizations are intentionally applied
- Historical data shows consistent false positives

**DON'T update thresholds when:**
- Tests occasionally fail (investigate the root cause first)
- New features are slower than expected (optimize the feature instead)
- Quick fix to "make CI green" (this defeats the purpose)

### Updating Thresholds

1. Analyze recent test runs to get median performance
2. Update the local threshold in the test file
3. Verify the CI multiplier is still appropriate (usually 1.5-2x)
4. Document why the threshold changed in commit message
5. Run tests in both local and CI environments

## Debugging Performance Issues

1. **Run locally first**: `npm run test:perf:e2e`
2. **Check console output**: Look for actual timing values
3. **Use UI mode**: `npm run test:perf:e2e:ui` for step-by-step debugging
4. **Profile with tracing**: Playwright automatically captures traces on failure
5. **Compare environments**: Run with `CI=true` locally to simulate CI thresholds

## Related Documentation

- [Playwright Performance Testing](https://playwright.dev/docs/test-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Testing Analysis](../../../internal-docs/testing/performance-testing-analysis.md)

## CI Integration

These tests are designed to be integrated into CI workflows. Recommended setup:

```yaml
- name: Run Performance Tests
  run: npx playwright test --project=performance
  env:
    CI: true
```

The `CI` environment variable is automatically set by most CI providers (GitHub Actions, GitLab CI, etc.).

## Contributing

When adding new performance tests:

1. Use the `getThreshold()` helper for all timing assertions
2. Choose appropriate CI multipliers (1.5x for standard, 2x for complex)
3. Add clear console logging showing actual vs expected
4. Include graceful skip conditions for optional features
5. Document the rationale for chosen thresholds
6. Test in both local and CI environments before committing

## Questions?

See the [internal documentation](../../../internal-docs/testing/performance-testing-analysis.md) for detailed analysis and recommendations.
