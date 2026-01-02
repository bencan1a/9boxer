# Performance Testing Guide

This guide covers the comprehensive frontend performance testing infrastructure for 9Boxer. It explains how to run, write, and maintain performance tests to prevent regressions.

## Overview

The performance testing suite consists of three layers:

1. **Component Performance Tests** (Vitest) - Fast unit-level render performance tests
2. **Memory Leak Detection Tests** (Vitest) - Component cleanup verification
3. **E2E Performance Tests** (Playwright) - Real browser performance measurement

## Quick Start

```bash
# Run all component performance tests
npm run test:perf

# Run E2E performance tests
npm run test:perf:e2e

# Run with UI (interactive)
npm run test:perf:e2e:ui

# Debug mode
npm run test:perf:e2e:debug
```

## Performance Targets

### Component Performance (Vitest)

| Component | Dataset Size | Target Time (CI) | Purpose |
|-----------|--------------|------------------|---------|
| NineBoxGrid | 100 employees | <700ms | Baseline render |
| NineBoxGrid | 500 employees | <1500ms | Medium dataset |
| NineBoxGrid | 1000 employees | <2500ms | Large dataset |
| NineBoxGrid re-render | Single change | <200ms | Update efficiency |
| EmployeeTile | Single tile | <20ms | Individual render |
| EmployeeTile | 100 tiles | <1000ms | Batch render |

**Note:** CI thresholds are ~3-4x higher than local development to account for slower environments.

### E2E Performance (Playwright)

| Test | Target Time | Metric |
|------|-------------|--------|
| Initial app load | <3000ms | Time to interactive |
| Grid render (browser) | <2000ms | Full page render |
| Filter application | <500ms | UI responsiveness |
| Drag operation | <1000ms | Interaction speed |
| Memory growth (5 ops) | <50MB | Memory leak detection |

### Web Vitals

| Metric | Good | Acceptable |
|--------|------|------------|
| LCP (Largest Contentful Paint) | <2.5s | <4.0s |
| FCP (First Contentful Paint) | <1.8s | <3.0s |
| TTFB (Time to First Byte) | <800ms | <1800ms |
| CLS (Cumulative Layout Shift) | <0.1 | <0.25 |

## Test Files

- Component Performance: `frontend/src/components/**/__tests__/*.performance.test.tsx`
- Memory Leak Tests: `frontend/src/**/__tests__/*.memory.test.tsx`
- E2E Performance: `frontend/playwright/performance/*.spec.ts`
- Test Utilities: `frontend/src/test-utils/performance-generators.ts`

## Success Metrics

Current coverage (as of implementation):

- ✅ 10 component performance tests
- ✅ 11 memory leak detection tests
- ✅ 24 E2E performance tests
- ✅ **45 total tests** (exceeds P0 requirements)

## Related Documentation

- [Performance Analysis](../../internal-docs/testing/performance-testing-analysis.md) - Detailed analysis
- [Test Principles](../../internal-docs/testing/test-principles.md) - Testing philosophy
- [PERFORMANCE.md](../../PERFORMANCE.md) - Application performance targets

For detailed usage examples, debugging tips, and best practices, see the internal testing documentation.
