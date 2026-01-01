# Performance Testing Coverage Analysis

**Date:** 2025-12-31
**Status:** Analysis Complete - Action Items Identified
**Severity:** High Priority - Critical Gaps in Frontend Performance Testing

## Executive Summary

The 9Boxer project has **strong backend performance test coverage** with automated regression detection, but **critical gaps exist in frontend performance testing** that could allow significant regressions to slip through. While infrastructure exists (performance monitoring hooks, bundle size checking), it is not integrated into the test suite with enforceable thresholds.

### Key Findings

| Area | Status | Grade | Details |
|------|--------|-------|---------|
| **Backend Performance Tests** | ✅ Strong | A | 4 dedicated test modules, clear targets, `pytest-benchmark` integration |
| **Frontend Performance Tests** | ⚠️ Limited | D+ | Only 1 runtime test, no render/memory tests, infrastructure not tested |
| **Bundle Size Monitoring** | ✅ Good | B+ | Automated checks, baseline tracking, 10% regression threshold |
| **CI/CD Integration** | ⚠️ Partial | C | Backend tests run in CI, frontend missing Playwright perf tests |

### Impact Assessment

**Regressions that WILL be caught:**
- Backend API performance degradation (pytest benchmarks)
- Import/startup time regressions (dedicated tests)
- Bundle size bloat (automated checks with baselines)
- Backend memory leaks (concurrent performance tests)

**Regressions that MAY slip through:**
- React render performance degradation (missing React.memo, inefficient re-renders)
- Memory leaks in frontend (uncleared timers, dangling event listeners)
- Drag-and-drop frame rate drops (no interaction performance tests)
- Large dataset handling issues (no tests for 500+ employee grids)
- N+1 query problems in backend (no query analysis tests)

---

## Current Performance Testing Coverage

### Backend Performance Tests (Comprehensive ✅)

The backend has a **robust, production-ready performance testing infrastructure** with four dedicated test modules:

#### 1. **Import Performance Tests** (`test_import_performance.py`)
Tests startup and lazy loading to prevent slow application launch.

**What it tests:**
- Main module import time (<12s target)
- Heavy dependencies lazy-loaded (scipy, openpyxl not imported at startup)
- Individual service import times tracked

**Example test:**
```python
def test_main_module_import_time():
    """Ensure backend starts in <12s by lazy-loading heavy modules."""
    start = time.time()
    import ninebox.main
    duration = time.time() - start
    assert duration < 12.0, f"Import took {duration}s (target: <12s)"
```

**Regressions caught:** ✅ Slow startup from eager imports

---

#### 2. **API Performance Tests** (`test_api_performance.py`)
Benchmarks all API endpoints with `pytest-benchmark` for consistent measurements.

**What it tests:**
- Upload performance (small: <1s, large: <5s)
- Employee API response times (<100ms targets)
- Statistics calculations (<1s)
- Intelligence analysis (<2s)
- Export performance benchmarks

**Example test:**
```python
def test_get_all_employees_when_called_then_completes_within_limit(benchmark, client):
    """Benchmark GET /employees endpoint (target: <100ms)."""
    result = benchmark(lambda: client.get("/employees"))
    assert result.status_code == 200
    # pytest-benchmark auto-fails if >100ms based on config
```

**Regressions caught:** ✅ API slowdowns, inefficient queries

---

#### 3. **Concurrent Performance Tests** (`test_concurrent_performance.py`)
Tests concurrency, load handling, and memory usage under stress.

**What it tests:**
- 10 concurrent API requests
- Memory usage monitoring (<200MB increase for large datasets)
- Concurrent read/write operations
- Data consistency under load

**Example test:**
```python
def test_concurrent_requests_when_10_parallel_then_all_succeed():
    """Ensure 10 simultaneous requests don't cause deadlocks or errors."""
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(client.get, "/employees") for _ in range(10)]
        results = [f.result() for f in futures]
    assert all(r.status_code == 200 for r in results)
```

**Regressions caught:** ✅ Concurrency issues, memory leaks

---

#### 4. **Service Performance Tests** (`test_service_performance.py`)
Benchmarks business logic and service layer operations.

**What it tests:**
- Excel parsing benchmarks
- Statistics calculation performance
- Intelligence service analysis time
- Excel export performance

**Example test:**
```python
def test_parse_when_large_file_then_completes_within_limit(benchmark, large_excel_file):
    """Benchmark Excel parsing for 1000 employees (target: <3s)."""
    parser = ExcelParser()
    result = benchmark(lambda: parser.parse(str(large_excel_file)))
    assert len(result.employees) == 1000
```

**Regressions caught:** ✅ Service layer slowdowns, inefficient algorithms

---

### Frontend Performance Tests (Limited ⚠️)

The frontend has **minimal dedicated performance testing**, despite having the necessary infrastructure.

#### Current Coverage

**1. Bundle Size Monitoring** ✅
- `check-bundle-size.js` script with baseline tracking
- GitHub Actions workflow for PR validation
- Gzipped size analysis and regression detection (10% threshold)
- Current baseline: 368KB total (well under 1MB limit)

**File:** `frontend/scripts/check-bundle-size.js`

**2. Runtime Performance Utilities** ✅
- `usePerformanceMonitor.ts` hook for component render tracking
- `performance.ts` utility for Web Vitals (LCP, INP, CLS, FCP, TTFB)
- Performance marks/measures for operations
- Console warnings for slow renders (>100ms)

**Files:**
- `frontend/src/hooks/usePerformanceMonitor.ts`
- `frontend/src/utils/performance.ts`

**3. Actual Runtime Tests** ⚠️
- **Only ONE test:** `sortEmployees.test.ts` (tests <200ms sorting for 100 employees)
- No React component render performance tests
- No memory leak detection tests
- No virtualization performance tests

**File:** `frontend/src/utils/__tests__/sortEmployees.test.ts`

---

## Performance Metrics Currently Tested

### Backend Metrics ✅

| Metric | Target | Test Location | Status |
|--------|--------|---------------|--------|
| **Import/Startup Time** | <12s | `test_import_performance.py` | ✅ Tested |
| **API Response Times** | 20-100ms | `test_api_performance.py` | ✅ Tested |
| **File Processing** | <1s small, <5s large | `test_api_performance.py` | ✅ Tested |
| **Concurrency** | 10 simultaneous | `test_concurrent_performance.py` | ✅ Tested |
| **Memory Usage** | <200MB increase | `test_concurrent_performance.py` | ✅ Tested |
| **Database Operations** | <100ms queries | `test_api_performance.py` | ✅ Tested |

### Frontend Metrics ⚠️

| Metric | Target | Test Location | Status |
|--------|--------|---------------|--------|
| **Bundle Size** | <1MB total | `check-bundle-size.js` | ✅ Tracked (not blocking) |
| **Web Vitals** | LCP <2.5s, CLS <0.1 | `performance.ts` | ⚠️ Monitored, not tested |
| **Sorting Performance** | <200ms | `sortEmployees.test.ts` | ✅ Tested (1 test) |
| **Component Renders** | <100ms | `usePerformanceMonitor.ts` | ⚠️ Logged, not tested |
| **Grid Render Time** | <500ms for 500 employees | - | ❌ Not tested |
| **Drag-and-drop FPS** | 60fps (16ms/frame) | - | ❌ Not tested |
| **Memory Leaks** | No growth over time | - | ❌ Not tested |
| **Large Dataset Handling** | Smooth with 1000+ employees | - | ❌ Not tested |

---

## Critical Gaps in Performance Coverage

### Frontend Gaps (High Priority 🔴)

#### 1. **No React Render Performance Tests**
**Impact:** High - Render regressions are user-facing and immediately noticeable

**Missing tests:**
- Grid re-renders with 500+ employees
- Drag-and-drop frame rate validation
- Filter application performance
- Virtualization performance validation

**Example regression scenario:**
```typescript
// Developer removes React.memo from EmployeeTile
export const EmployeeTile = ({ employee }) => {  // Missing React.memo
  return <Card>{employee.name}</Card>;
};

// Result: 1000 tiles re-render on ANY state change
// Performance impact: 50ms → 1000ms (20x slower)
// Current tests: ❌ Would NOT catch this regression
```

**Recommended test:**
```typescript
// frontend/src/components/grid/__tests__/NineBoxGrid.performance.test.tsx
describe('NineBoxGrid Performance', () => {
  it('should render 1000 employees in <500ms', async () => {
    const employees = generateLargeDataset(1000);
    const start = performance.now();
    render(<NineBoxGrid employees={employees} />);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

---

#### 2. **No Memory Leak Testing**
**Impact:** High - Memory leaks degrade performance over time and can crash the app

**Missing tests:**
- Component cleanup validation (event listeners, timers)
- Memory release on unmount
- Long-running session memory growth tests

**Example regression scenario:**
```typescript
// Developer forgets to clear interval in useEffect
const MyComponent = () => {
  useEffect(() => {
    const interval = setInterval(() => updateData(), 1000);
    // Missing: return () => clearInterval(interval);
  }, []);
};

// Result: Memory leak - interval never cleared
// Performance impact: Memory grows 1MB/minute indefinitely
// Current tests: ❌ Would NOT catch this regression
```

**Recommended test:**
```typescript
// frontend/src/hooks/__tests__/usePerformanceMonitor.test.ts
it('should not leak memory on unmount', () => {
  const { unmount } = renderHook(() => usePerformanceMonitor('TestComponent'));

  // Verify all listeners/timers are cleaned up
  const listenersBefore = getActiveListeners();
  unmount();
  const listenersAfter = getActiveListeners();

  expect(listenersAfter.length).toBe(listenersBefore.length);
});
```

---

#### 3. **No Integration Performance Tests**
**Impact:** Medium-High - End-to-end scenarios can expose performance bottlenecks

**Missing tests:**
- Initial app load time
- File upload and processing flow
- Large dataset interactions
- Complete user workflows

**Example regression scenario:**
```typescript
// Developer adds expensive computation in render path
const Dashboard = () => {
  const employees = useEmployees();

  // Expensive calculation on EVERY render (not memoized)
  const statistics = employees.map(e => calculateComplexStats(e));

  return <Grid employees={employees} stats={statistics} />;
};

// Result: 1000 employees × 10ms = 10s render time
// Performance impact: <500ms → 10s (20x slower)
// Current tests: ❌ Would NOT catch this regression
```

**Recommended test:**
```typescript
// frontend/playwright/performance/app-load.spec.ts
test('App loads with 500 employees within performance budget', async ({ page }) => {
  await page.goto('/');

  await loadLargeDataset(page, 500);

  const metrics = await page.evaluate(() => ({
    renderTime: performance.measure('grid-render').duration,
    memoryUsage: performance.memory?.usedJSHeapSize
  }));

  expect(metrics.renderTime).toBeLessThan(500);
  expect(metrics.memoryUsage).toBeLessThan(500 * 1024 * 1024); // <500MB
});
```

---

#### 4. **No Automated Performance Budgets**
**Impact:** Medium - Bundle size checks exist but don't fail builds

**Current state:**
- Bundle size checked but informational only
- No runtime performance budgets enforced
- No Lighthouse CI integration

**Example regression scenario:**
```typescript
// Developer adds heavy dependency
import _ from 'lodash'; // Full lodash, not lodash-es

// Result: Bundle increases 72KB (lodash full library)
// Current behavior: ⚠️ Warning logged, but build succeeds
// Desired behavior: ❌ Fail build if >10% increase without approval
```

**Recommended solution:**
```javascript
// frontend/scripts/check-bundle-size.js (enhancement)
if (percentIncrease > 10) {
  console.error(`Bundle size increased by ${percentIncrease.toFixed(1)}%`);
  console.error('This exceeds the 10% regression threshold.');
  console.error('To proceed, update the baseline: npm run check:bundle:save');
  process.exit(1); // Fail the build
}
```

---

### Backend Gaps (Medium Priority 🟡)

#### 1. **Database Performance Testing**
**Impact:** Medium - Query performance can degrade silently

**Missing tests:**
- Complex query performance (joins, filters)
- Index effectiveness validation
- Session history queries at scale

**Example regression scenario:**
```python
# Developer removes index from frequently-queried column
class Employee(Base):
    __tablename__ = 'employees'

    employee_id = Column(Integer, unique=True)  # Missing: index=True

# Result: O(n) table scan instead of O(log n) index lookup
# Performance impact: 0.2ms → 100ms for 10,000 employees (500x slower)
# Current tests: ⚠️ Might catch via API benchmarks, but no direct test
```

**Recommended test:**
```python
# backend/tests/performance/test_database_performance.py
def test_employee_lookup_by_id_when_10k_employees_then_fast(benchmark, db_with_10k):
    """Ensure employee lookup is <1ms (validates index exists)."""
    def lookup():
        return db.query(Employee).filter_by(employee_id=5000).first()

    result = benchmark(lookup)
    assert benchmark.stats.mean < 0.001  # <1ms
```

---

#### 2. **Real-World Scenario Testing**
**Impact:** Medium - Simulated workflows can expose unexpected bottlenecks

**Missing tests:**
- Complete import → edit → export cycles
- Rapid successive operations
- Cache effectiveness testing

**Example regression scenario:**
```python
# Developer disables caching for statistics calculation
class StatisticsService:
    def get_distribution(self, session_id: int):
        # Missing: cache lookup
        return self._calculate_distribution(session_id)  # Recalculates every time

# Result: 500ms calculation on every call instead of <1ms cache hit
# Current tests: ⚠️ Benchmark tests individual calls, not repeated calls
```

**Recommended test:**
```python
# backend/tests/performance/test_workflow_performance.py
def test_complete_workflow_when_1000_employees_then_acceptable_time(benchmark):
    """Test complete import → move → export workflow."""
    def complete_workflow():
        # Upload file
        session = upload_excel(large_file)
        # Make changes
        move_employee(session.id, employee_id=1, new_position=(1, 1))
        # Export
        result = export_excel(session.id)
        return result

    result = benchmark(complete_workflow)
    assert benchmark.stats.mean < 10.0  # <10s for complete workflow
```

---

## Types of Regressions That Might Slip Through

### Frontend Regressions at Risk

#### 1. **Render Performance Degradation**
**Probability:** High
**User Impact:** High - Immediately noticeable lag

**Examples:**
- Missing `React.memo` on components → 1000 unnecessary re-renders
- Inefficient prop passing → Cascading updates through component tree
- Heavy computations in render methods → Blocking UI thread
- Missing `useMemo`/`useCallback` → Recreating objects/functions on every render

**Current detection:** ❌ None - Only one sorting test exists

---

#### 2. **Memory Leaks**
**Probability:** Medium
**User Impact:** High - App becomes unusable over time

**Examples:**
- Uncleared `setInterval`/`setTimeout` timers
- Dangling event listeners (resize, scroll, custom events)
- Retained DOM references preventing garbage collection
- Stale closures holding large datasets

**Current detection:** ❌ None - No memory tests exist

---

#### 3. **Bundle Size Creep**
**Probability:** Low
**User Impact:** Medium - Slower initial load

**Examples:**
- Barrel imports from MUI (currently prevented by ESLint ✅)
- New heavyweight dependencies (moment.js, lodash full build)
- Missing code splitting opportunities
- Duplicate dependencies in bundle

**Current detection:** ✅ Strong - Automated checks with 10% threshold

---

#### 4. **Interaction Responsiveness**
**Probability:** High
**User Impact:** High - Breaks core UX

**Examples:**
- Slow drag-and-drop operations (<60fps feels janky)
- Laggy filter applications (typing feels unresponsive)
- Janky scrolling in large lists (missing virtualization)
- Delayed button clicks (long-running sync operations blocking UI)

**Current detection:** ❌ None - No interaction performance tests

---

### Backend Regressions at Risk

#### 1. **N+1 Query Problems**
**Probability:** Medium
**User Impact:** Medium-High - API slowdowns

**Examples:**
- Missing eager loading → 1 query per employee instead of 1 total
- Inefficient ORM usage → SELECT in loops
- Missing query optimization → Full table scans

**Current detection:** ⚠️ Partial - API benchmarks might catch, but no query analysis

---

#### 2. **Cache Effectiveness**
**Probability:** Low
**User Impact:** Medium - Repeated slow operations

**Examples:**
- Cache invalidation bugs → Always recalculating
- Missing cache warming → First request always slow
- Cache key collisions → Wrong data returned

**Current detection:** ⚠️ Partial - Benchmarks test first call, not repeated calls

---

## Detailed Recommendations

### Immediate Actions (Priority 0 - This Sprint)

#### 1. Add React Component Performance Test Suite
**Effort:** Medium (4-8 hours)
**Impact:** High - Catches render regressions

**Implementation:**
```typescript
// File: frontend/src/components/grid/__tests__/NineBoxGrid.performance.test.tsx

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NineBoxGrid } from '../NineBoxGrid';
import { generateLargeDataset } from '../../../test-utils/generators';

describe('NineBoxGrid Performance', () => {
  it('should render 100 employees in <200ms', () => {
    const employees = generateLargeDataset(100);
    const start = performance.now();
    render(<NineBoxGrid employees={employees} />);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200);
  });

  it('should render 500 employees in <500ms', () => {
    const employees = generateLargeDataset(500);
    const start = performance.now();
    render(<NineBoxGrid employees={employees} />);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });

  it('should render 1000 employees in <1000ms', () => {
    const employees = generateLargeDataset(1000);
    const start = performance.now();
    render(<NineBoxGrid employees={employees} />);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

**Files to create:**
- `frontend/src/components/grid/__tests__/NineBoxGrid.performance.test.tsx`
- `frontend/src/components/grid/__tests__/EmployeeTile.performance.test.tsx`
- `frontend/src/test-utils/generators.ts` (test data generator)

---

#### 2. Implement Playwright Performance Tests
**Effort:** Medium (6-8 hours)
**Impact:** High - Catches end-to-end regressions

**Implementation:**
```typescript
// File: frontend/playwright/performance/grid-performance.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Grid Performance', () => {
  test('renders 500 employees within performance budget', async ({ page }) => {
    await page.goto('/');

    // Start performance trace
    await page.tracing.start({ screenshots: true, snapshots: true });

    // Load large dataset (using sample data)
    await page.click('[data-testid="file-menu-button"]');
    await page.click('[data-testid="load-sample-data"]');
    await page.click('[data-testid="sample-500-employees"]');

    // Wait for grid to render
    await page.waitForSelector('[data-testid^="employee-tile-"]', { timeout: 5000 });

    // Measure performance
    const metrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('measure');
      const gridRender = entries.find(e => e.name === 'grid-render');
      return {
        renderTime: gridRender?.duration || 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      };
    });

    // Stop trace
    await page.tracing.stop({ path: 'test-results/grid-500-trace.zip' });

    // Assertions
    expect(metrics.renderTime).toBeLessThan(500); // <500ms target
    expect(metrics.memoryUsage).toBeLessThan(500 * 1024 * 1024); // <500MB
  });

  test('drag-and-drop maintains 60fps', async ({ page }) => {
    await page.goto('/');
    await loadTestData(page, 100);

    // Start FPS monitoring
    await page.evaluate(() => {
      (window as any).fpsData = [];
      let lastTime = performance.now();

      function measureFPS() {
        const now = performance.now();
        const fps = 1000 / (now - lastTime);
        (window as any).fpsData.push(fps);
        lastTime = now;
        requestAnimationFrame(measureFPS);
      }

      measureFPS();
    });

    // Perform drag operation
    const tile = page.locator('[data-testid="employee-tile-1"]');
    await tile.dragTo(page.locator('[data-testid="grid-box-1-1"]'));

    // Get FPS data
    const fpsData = await page.evaluate(() => (window as any).fpsData);
    const avgFPS = fpsData.reduce((a: number, b: number) => a + b, 0) / fpsData.length;
    const minFPS = Math.min(...fpsData);

    // Assertions
    expect(avgFPS).toBeGreaterThan(55); // Allow 5fps variance
    expect(minFPS).toBeGreaterThan(30); // No severe drops
  });
});
```

**Files to create:**
- `frontend/playwright/performance/grid-performance.spec.ts`
- `frontend/playwright/performance/filter-performance.spec.ts`
- `frontend/playwright/performance/app-load.spec.ts`

---

#### 3. Add Memory Leak Detection Tests
**Effort:** Medium (4-6 hours)
**Impact:** High - Prevents memory issues

**Implementation:**
```typescript
// File: frontend/src/hooks/__tests__/usePerformanceMonitor.test.ts

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

describe('usePerformanceMonitor Memory Leaks', () => {
  it('should clean up performance marks on unmount', () => {
    const { unmount } = renderHook(() => usePerformanceMonitor('TestComponent'));

    // Verify marks exist
    const marksBefore = performance.getEntriesByType('mark');
    expect(marksBefore.some(m => m.name.includes('TestComponent'))).toBe(true);

    // Unmount
    unmount();

    // Verify marks cleaned up
    const marksAfter = performance.getEntriesByType('mark');
    expect(marksAfter.some(m => m.name.includes('TestComponent'))).toBe(false);
  });

  it('should not create memory leaks over multiple mount/unmount cycles', () => {
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const { unmount } = renderHook(() => usePerformanceMonitor('TestComponent'));
      unmount();
    }

    // Verify no accumulated marks
    const marks = performance.getEntriesByType('mark');
    expect(marks.filter(m => m.name.includes('TestComponent')).length).toBe(0);
  });
});
```

**Files to create:**
- `frontend/src/hooks/__tests__/usePerformanceMonitor.memory.test.ts`
- `frontend/src/components/grid/__tests__/NineBoxGrid.memory.test.tsx`
- `frontend/src/contexts/__tests__/GridZoomContext.memory.test.tsx`

---

### Short-term Improvements (Priority 1 - Next Sprint)

#### 1. Vitest Benchmark Integration
**Effort:** Small (2-4 hours)
**Impact:** Medium - Consistent benchmark tracking

**Implementation:**
```typescript
// File: frontend/src/utils/__tests__/sortEmployees.bench.ts

import { bench, describe } from 'vitest';
import { sortEmployees } from '../sortEmployees';
import { generateLargeDataset } from '../../test-utils/generators';

describe('sortEmployees benchmarks', () => {
  const dataset100 = generateLargeDataset(100);
  const dataset500 = generateLargeDataset(500);
  const dataset1000 = generateLargeDataset(1000);

  bench('sort 100 employees', () => {
    sortEmployees(dataset100, 'name', 'asc');
  }, { time: 1000 }); // Run for 1 second

  bench('sort 500 employees', () => {
    sortEmployees(dataset500, 'name', 'asc');
  }, { time: 1000 });

  bench('sort 1000 employees', () => {
    sortEmployees(dataset1000, 'name', 'asc');
  }, { time: 1000 });
});
```

**Files to create:**
- `frontend/src/utils/__tests__/sortEmployees.bench.ts`
- `frontend/src/utils/__tests__/filterEmployees.bench.ts`
- `frontend/vitest.bench.config.ts` (benchmark-specific config)

**Package.json script:**
```json
{
  "scripts": {
    "bench": "vitest bench --run",
    "bench:watch": "vitest bench"
  }
}
```

---

#### 2. Lighthouse CI Integration
**Effort:** Medium (4-6 hours)
**Impact:** Medium-High - Automated Web Vitals tracking

**Implementation:**
```yaml
# File: .github/workflows/lighthouse.yml

name: Lighthouse CI

on:
  pull_request:
    paths:
      - 'frontend/**'

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Build app
        run: |
          cd frontend
          npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

**Lighthouse config:**
```javascript
// File: frontend/lighthouserc.js

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Files to create:**
- `.github/workflows/lighthouse.yml`
- `frontend/lighthouserc.js`

---

#### 3. React DevTools Profiler Automation
**Effort:** Large (8-12 hours)
**Impact:** Medium - Automated flamegraph analysis

**Implementation:**
```typescript
// File: frontend/scripts/profile-components.ts

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function profileComponents() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to app
  await page.goto('http://localhost:5173');

  // Start profiling
  await page.evaluate(() => {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.getProfilingData = () => {
      return {
        version: 1,
        profilingData: (window as any).__profilingData || []
      };
    };
  });

  // Perform actions
  await page.click('[data-testid="load-sample-data"]');
  await page.click('[data-testid="sample-500-employees"]');
  await page.waitForTimeout(2000); // Let profiler collect data

  // Extract profiling data
  const profilingData = await page.evaluate(() => {
    return (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.getProfilingData();
  });

  // Save to file
  writeFileSync('profiling-results.json', JSON.stringify(profilingData, null, 2));

  await browser.close();
}

profileComponents();
```

**Files to create:**
- `frontend/scripts/profile-components.ts`
- `frontend/scripts/analyze-profile.ts` (parse and report)

---

### Long-term Strategy (Priority 2 - Future Sprints)

#### 1. Performance Dashboard
**Effort:** Large (16-24 hours)
**Impact:** High - Centralized performance tracking

**Features:**
- Aggregate metrics from all sources (pytest-benchmark, Vitest bench, Lighthouse, Playwright)
- Track trends over time (store results in JSON files or database)
- Alert on regression patterns (email/Slack notifications)
- Visualizations (charts showing performance over commits)

**Tech stack:**
- Backend: Simple Node.js/Python script to aggregate results
- Storage: JSON files in git (or PostgreSQL for production)
- Visualization: Recharts or Chart.js
- Hosting: GitHub Pages or Vercel

---

#### 2. Synthetic Monitoring
**Effort:** Medium-Large (12-16 hours)
**Impact:** Medium - Proactive regression detection

**Features:**
- Scheduled performance test runs (nightly, weekly)
- Comparison against baselines (detect drift over time)
- Automatic bisection for regressions (find offending commit)
- Historical trend analysis

**Implementation:**
```yaml
# .github/workflows/nightly-perf.yml

name: Nightly Performance Tests

on:
  schedule:
    - cron: '0 2 * * *' # 2 AM daily
  workflow_dispatch: # Manual trigger

jobs:
  backend-perf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run backend performance tests
        run: |
          . .venv/bin/activate
          pytest -m performance --benchmark-json=results.json
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: backend-perf-results
          path: results.json

  frontend-perf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Playwright performance tests
        run: |
          cd frontend
          npm run test:e2e:pw -- --project=performance
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: frontend-perf-results
          path: frontend/test-results/
```

---

#### 3. Real User Monitoring (RUM)
**Effort:** Large (20-30 hours)
**Impact:** High - Production performance insights

**Features:**
- Instrument production builds with telemetry
- Collect actual user performance data (Web Vitals, custom metrics)
- Identify performance issues in the wild (geographic patterns, device patterns)
- Privacy-compliant (no PII, opt-in telemetry)

**Implementation:**
```typescript
// frontend/src/utils/telemetry.ts

import { onCLS, onFCP, onLCP, onINP, onTTFB } from 'web-vitals';

export function initTelemetry() {
  // Only in production
  if (import.meta.env.MODE !== 'production') return;

  // Check user consent
  if (!localStorage.getItem('telemetry-consent')) return;

  // Send Web Vitals to analytics endpoint
  const sendMetric = (metric: any) => {
    fetch('/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.pathname,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {
      // Fail silently - don't impact user experience
    });
  };

  onCLS(sendMetric);
  onFCP(sendMetric);
  onLCP(sendMetric);
  onINP(sendMetric);
  onTTFB(sendMetric);
}
```

---

## Integration Points

### 1. Pre-commit Hooks (Already Implemented ✅)
**Current state:** ESLint performance rules run automatically

**Enhancements needed:**
- None - already working well

---

### 2. Pre-push Hooks (Enhance Existing)
**Current state:** Fast tests run before push

**Enhancements needed:**
```bash
# .husky/pre-push (add performance tests)

#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Existing checks
npm run lint
npm run test:fast

# ADD: Frontend render performance tests
npm run test:perf

# ADD: Critical path benchmarks
npm run bench -- --run sortEmployees filterEmployees
```

**Files to modify:**
- `.husky/pre-push`

---

### 3. CI/CD Pipeline (Enhance Existing)
**Current state:** Backend performance tests run in CI

**Enhancements needed:**
```yaml
# .github/workflows/ci.yml (add frontend performance)

- name: Run frontend performance tests
  run: |
    cd frontend
    npm run test:perf
    npm run bench -- --run

- name: Run Playwright performance tests
  run: |
    cd frontend
    npm run test:e2e:pw -- --project=performance
```

**Files to modify:**
- `.github/workflows/ci.yml`

---

### 4. Pull Request Checks
**Current state:** Bundle size checked, but informational only

**Enhancements needed:**
- Performance comparison comments (show before/after metrics)
- Regression alerts (highlight slowdowns)
- Required performance review for changes to critical paths

**Example PR comment:**
```markdown
## Performance Impact

### Bundle Size
- **Before:** 368.2 KB (gzipped)
- **After:** 372.1 KB (gzipped)
- **Change:** +3.9 KB (+1.1%) ✅ Within 10% threshold

### Render Performance
- **NineBoxGrid (500 employees):**
  - Before: 387ms
  - After: 412ms
  - Change: +25ms (+6.5%) ⚠️ Regression detected

### API Performance
- **GET /employees:**
  - Before: 42ms
  - After: 41ms
  - Change: -1ms ✅ No regression

**Recommendation:** Review NineBoxGrid changes - render time increased by 6.5%
```

---

## Test File Organization

### Recommended Structure

```
backend/
  tests/
    performance/                      # ✅ Exists
      test_api_performance.py         # ✅ Exists
      test_service_performance.py     # ✅ Exists
      test_import_performance.py      # ✅ Exists
      test_concurrent_performance.py  # ✅ Exists
      test_database_performance.py    # ❌ TODO: Create
      test_workflow_performance.py    # ❌ TODO: Create

frontend/
  src/
    components/
      grid/
        __tests__/
          NineBoxGrid.test.tsx                  # ✅ Exists (unit tests)
          NineBoxGrid.performance.test.tsx      # ❌ TODO: Create
          EmployeeTile.performance.test.tsx     # ❌ TODO: Create
          NineBoxGrid.memory.test.tsx           # ❌ TODO: Create
    hooks/
      __tests__/
        usePerformanceMonitor.test.ts           # ⚠️ Exists but minimal
        usePerformanceMonitor.memory.test.ts    # ❌ TODO: Create
    utils/
      __tests__/
        sortEmployees.test.ts                   # ✅ Exists
        sortEmployees.bench.ts                  # ❌ TODO: Create
        filterEmployees.bench.ts                # ❌ TODO: Create

  playwright/
    performance/                                # ❌ TODO: Create folder
      grid-performance.spec.ts                  # ❌ TODO: Create
      filter-performance.spec.ts                # ❌ TODO: Create
      app-load.spec.ts                          # ❌ TODO: Create
      drag-performance.spec.ts                  # ❌ TODO: Create

  scripts/
    check-bundle-size.js              # ✅ Exists
    profile-components.ts             # ❌ TODO: Create
    analyze-profile.ts                # ❌ TODO: Create
```

---

## Success Metrics

### Short-term (After P0 tasks complete)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Frontend perf tests** | 1 test | 10+ tests | Count in `*.performance.test.tsx` files |
| **Memory leak tests** | 0 tests | 5+ tests | Count in `*.memory.test.tsx` files |
| **Playwright perf tests** | 0 tests | 4+ tests | Count in `playwright/performance/` |
| **Test execution time** | N/A | <30s total | CI/CD pipeline duration for perf tests |

### Medium-term (After P1 tasks complete)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Benchmark coverage** | 1 function | 10+ functions | Count in `*.bench.ts` files |
| **Lighthouse score** | Unknown | 90+ performance | Lighthouse CI reports |
| **Web Vitals tracking** | Logged | Tested | Test assertions on LCP, CLS, INP |
| **Automated regression detection** | Bundle only | All metrics | CI failures on performance regressions |

### Long-term (After P2 tasks complete)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Performance dashboard** | None | Live | Dashboard URL accessible |
| **Historical tracking** | None | 6 months history | Database/file storage of results |
| **Nightly test runs** | None | Daily | GitHub Actions schedule |
| **RUM integration** | None | Production | Telemetry endpoint receiving data |

---

## Conclusion

The 9Boxer project has **excellent backend performance test coverage**, but **critical gaps exist in frontend performance testing**. While the infrastructure is in place (monitoring hooks, bundle checks), it's not integrated into the test suite with enforceable thresholds.

### Key Takeaways

1. **Backend:** Continue current practices - performance testing is production-ready ✅
2. **Frontend:** Immediate action needed - implement React/Playwright performance tests 🔴
3. **Bundle Size:** Good monitoring - consider making checks blocking 🟡
4. **CI/CD:** Strong backend integration - add frontend performance tests 🟡

### Immediate Next Steps

1. **Create GitHub issue** tracking all P0/P1/P2 tasks
2. **Implement P0 tasks** (React component perf tests, Playwright perf tests, memory leak tests)
3. **Enhance CI/CD** to fail builds on performance regressions
4. **Document patterns** in testing docs as tests are added

### Estimated Effort

- **P0 (Critical):** 14-22 hours (1.5-3 developer-days)
- **P1 (High):** 18-26 hours (2-3 developer-days)
- **P2 (Future):** 48-70 hours (6-9 developer-days)
- **Total:** 80-118 hours (10-15 developer-days)

**Recommendation:** Tackle P0 in current sprint, P1 in next sprint, P2 as ongoing improvements.

---

**Last Updated:** 2025-12-31
**Next Review:** After P0 tasks complete
**Owner:** Development Team
