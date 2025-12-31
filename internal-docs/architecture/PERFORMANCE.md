# Performance Characteristics

## Quick Rules

- Expected scale: 100-10,000 employees (optimize for ~1,000)
- Startup target: <5s backend, <10s total (acceptable up to 12s)
- Grid render target: <500ms for 500 employees
- Drag operations: <16ms (60fps)
- API response target: <100ms (acceptable up to 500ms)
- Excel file limit: 50MB (enforce in validation)
- Memory budget: <500MB total (Electron + backend)
- DON'T optimize unless user-perceived lag >100ms
- DON'T use Web Workers for infrequent operations (Excel upload)
- DON'T over-engineer - prioritize simplicity for desktop app workloads

## Performance Targets

| Operation | Target | Acceptable | Unacceptable | Test Location |
|-----------|--------|------------|--------------|---------------|
| **Backend startup** | <5s | <10s | >12s | `test_import_performance.py::test_main_module_import_time` |
| **Excel upload (5 employees)** | <0.5s | <1s | >1s | `test_api_performance.py::test_upload_when_small_file` |
| **Excel upload (1000 employees)** | <3s | <5s | >5s | `test_api_performance.py::test_upload_when_large_file` |
| **Excel parsing (1000 employees)** | <2s | <3s | >3s | `test_service_performance.py::test_parse_when_large_file` |
| **Excel export (5 employees)** | <0.5s | <1s | >1s | `test_api_performance.py::test_export_when_small_dataset` |
| **Excel export (1000 employees)** | <3s | <5s | >5s | `test_api_performance.py::test_export_when_large_dataset` |
| **Grid initial render** | <500ms | <1s | >1s | Manual testing (React DevTools Profiler) |
| **Employee card drag** | <16ms | <32ms | >32ms | Chrome DevTools (60fps = 16.67ms per frame) |
| **API: Get all employees** | <50ms | <100ms | >100ms | `test_api_performance.py::test_get_all_employees` |
| **API: Get single employee** | <20ms | <50ms | >50ms | `test_api_performance.py::test_get_single_employee` |
| **API: Filter employees** | <50ms | <100ms | >100ms | `test_api_performance.py::test_filter_employees` |
| **API: Move employee** | <50ms | <100ms | >100ms | `test_api_performance.py::test_move_employee` |
| **API: Update employee** | <30ms | <50ms | >50ms | `test_api_performance.py::test_update_employee` |
| **Statistics calculation** | <100ms | <500ms | >1s | `test_api_performance.py::test_distribution_when_calculated` |
| **Intelligence analysis** | <1s | <2s | >2s | `test_api_performance.py::test_intelligence_analysis` |
| **Memory footprint (1000 employees)** | <400MB | <500MB | >1GB | `test_concurrent_performance.py::test_memory_usage` |

## Scale Constraints

| Resource | Minimum | Typical | Maximum Tested | Practical Limit | Notes |
|----------|---------|---------|----------------|-----------------|-------|
| **Employees** | 10 | 100-1,000 | 10,000 | ~10,000 | Grid UX degrades beyond 1,000 (scrolling, visual density) |
| **Excel file size** | 10KB | 1-5MB | 50MB | 50MB | Enforce in validation; 50MB ~= 15,000+ employees |
| **Database size** | 1MB | 10-50MB | 100MB | Unlimited | SQLite scales well; no hard limit |
| **Session history** | 10 events | 100-500 | 10,000+ | Unlimited | Clean up old sessions manually if needed |
| **Concurrent API calls** | 1 | 1-5 | 10 | ~20 | Desktop app (single user); no contention issues |
| **Grid boxes visible** | 9 | 9 | 9 | 9 | Always 9 boxes (3x3 grid); complexity in tiles per box |
| **Employees per box** | 0 | 5-50 | 500+ | ~200 | UX threshold: >100 per box = scrolling required |

## Performance Trade-offs (Accepted)

| Trade-off | Decision | Alternative Rejected | Rationale | Impact |
|-----------|----------|---------------------|-----------|--------|
| **Large bundle (~300MB)** | ✅ Accept | Require Python/Node.js install | User convenience > download size | Slower initial download, but single-file install |
| **Slower startup (~5-10s)** | ✅ Accept | Pre-spawn backend process | Simplicity > 2-3s improvement | User sees splash screen briefly |
| **In-memory sessions** | ✅ Accept | Disk-backed session caching | Speed > memory for desktop | SQLite reads entire dataset on startup (~50-100ms for 1,000 employees) |
| **Synchronous Excel parsing** | ✅ Accept | Web Workers (async parsing) | Simplicity > async for infrequent op | Upload blocks UI briefly (1-5s), acceptable for one-time operation |
| **Full grid re-render on filter** | ✅ Accept | Virtual scrolling/windowing | Simplicity > optimization for <1,000 employees | React re-renders all tiles; fast enough with React.memo |
| **No pagination** | ✅ Accept | Server-side pagination | Desktop app loads all employees at once | All data in memory; no need for pagination API |
| **Lazy-load scipy/openpyxl** | ✅ Accept | Import all modules at startup | Startup speed > import simplicity | Backend starts 3-5s faster; modules loaded on first use |
| **SQLite (not PostgreSQL)** | ✅ Accept | Client-server database | Simplicity > multi-user concurrency | File-based, zero-config, perfect for single-user desktop app |

## Decision Matrix: When to Optimize

| Scenario | Optimize? | Technique | Priority | Validation |
|----------|-----------|-----------|----------|------------|
| **Grid render >1s for 500 employees** | ✅ Yes | React.memo, useMemo, lazy rendering | P0 | User-perceived lag; breaks UX |
| **Startup time >12s** | ✅ Yes | Profile backend imports, lazy load modules | P0 | Exceeds acceptable threshold |
| **Memory >1GB** | ✅ Yes | Profile memory leaks, clean up event listeners | P0 | Exceeds memory budget by 2x |
| **Drag-and-drop lag >32ms** | ✅ Yes | Optimize re-renders, reduce DOM updates | P0 | Visible jank (30fps) |
| **API call >500ms** | ✅ Yes | Add database indexes, optimize queries | P1 | Noticeable delay; breaks flow |
| **Excel upload 5s for 5MB file** | ❌ No | Infrequent operation, acceptable | P3 | One-time operation; user expects delay |
| **Filter application 300ms** | ❌ No | Already debounced, <500ms target | P3 | Fast enough; no user complaints |
| **Backend API call 100ms** | ❌ No | Fast enough for user | P3 | Below perception threshold (~100ms) |
| **Export 3s for 1,000 employees** | ❌ No | Infrequent operation, acceptable | P3 | User expects export to take time |
| **Intelligence analysis 1.5s** | ❌ No | Complex calculation, acceptable | P3 | User expects analysis to compute |

## Pattern Catalog

### Pattern: Bundle Size Optimization with Code Splitting (#frontend #build)

**When:** Initial bundle size >500KB gzipped (slow app loading)

**Scenario:** Material-UI barrel imports and eager i18n loading bloat bundle

```typescript
// ✅ CORRECT: Named imports for tree-shaking
// frontend/src/components/Grid/EmployeeTile.tsx
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
// Each import adds only what's needed (~10-20KB per component)

// ✅ CORRECT: Lazy load i18n translations
// frontend/src/i18n/config.ts
const loadLanguage = async (language: string) => {
  const translations = await import(`./locales/${language}/translation.json`);
  return translations.default || translations;
};

// ✅ CORRECT: Code splitting with React.lazy
// frontend/src/App.tsx
const SettingsDialog = React.lazy(() =>
  import('./components/settings/SettingsDialog')
);
```

**Don't:**
```typescript
// ❌ WRONG: Barrel imports (bundle includes ALL MUI components)
import { Card, Typography, Avatar } from '@mui/material';
// Adds 200-300KB of unused components to bundle

// ❌ WRONG: Eager load all translations at startup
import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
// All 7 languages loaded upfront = +150KB
```

**Performance Impact:**
- Before: 700KB+ gzipped bundle, 3-5s initial load
- After: 381KB gzipped bundle (46% reduction), <2s load
- Validation: `npm run build` → check `dist/assets/` sizes
- Target: <500KB gzipped for main bundle

**Build Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-core': ['@mui/material', '@mui/system'],
          'vendor': ['react', 'react-dom', 'zustand'],
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
});
```

---

### Pattern: i18n Lazy Loading with Resource Caching (#frontend #i18n #performance)

**When:** Language switching or translation loading causes delays

**Scenario:** Custom i18next backend with dynamic imports

```typescript
// ✅ CORRECT: Cache loaded translations in i18next
// frontend/src/i18n/config.ts

const loadLanguage = async (language: string) => {
  try {
    const translations = await import(`./locales/${language}/translation.json`);
    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load language: ${language}`, error);
    // Fallback to English if not already trying English
    if (language !== "en") {
      const enTranslations = await import(`./locales/en/translation.json`);
      return enTranslations.default || enTranslations;
    }
    return {}; // i18next uses keys as fallback text
  }
};

i18n.use({
  type: 'backend',
  read: (language: string, namespace: string, callback: Function) => {
    // CRITICAL: Check cache first to enable language switching
    if (i18n.hasResourceBundle(language, namespace)) {
      const bundle = i18n.getResourceBundle(language, namespace);
      callback(null, bundle);
      return;
    }

    // Load and cache
    loadLanguage(language)
      .then((resources) => {
        // Add to i18next cache for future switches
        i18n.addResourceBundle(language, namespace, resources, true, true);
        callback(null, resources);
      })
      .catch((error) => callback(error, null));
  },
});
```

**Don't:**
```typescript
// ❌ WRONG: No resource caching (language switching broken)
read: (language, namespace, callback) => {
  loadLanguage(language)
    .then((resources) => {
      callback(null, resources); // Not cached!
      // Language switch triggers error: "Language already loaded"
    });
},
```

**Performance Impact:**
- Before: Language switching broken, must reload app
- After: Instant language switching (cached resources)
- Bundle: Only current language loaded (~20KB vs 140KB for all 7)
- Validation: Manual test - switch languages in Settings

**Error Handling:**
```tsx
// Add error boundary for Suspense failures
// frontend/src/main.tsx
import { ErrorBoundary } from 'react-error-boundary';

const I18nErrorFallback = () => (
  <div>
    <h2>Translation Loading Error</h2>
    <button onClick={() => window.location.reload()}>Refresh</button>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary fallback={<I18nErrorFallback />}>
    <Suspense fallback={<LoadingSpinner />}>
      <App />
    </Suspense>
  </ErrorBoundary>
);
```

---

### Pattern: Zustand Granular Selectors (#frontend #state #rendering)

**When:** Components re-render when unrelated store state changes

**Scenario:** Component only needs one piece of store state, not whole store

```typescript
// ✅ CORRECT: Export granular selectors from store
// frontend/src/store/sessionStore.ts

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  employees: [],
  donutModeActive: false,
  uploadFile: null,
  // ... actions
}));

// Export selectors for granular subscriptions
export const selectSessionId = (state: SessionState) => state.sessionId;
export const selectEmployees = (state: SessionState) => state.employees;
export const selectDonutModeActive = (state: SessionState) => state.donutModeActive;
export const selectUploadFile = (state: SessionState) => state.uploadFile;

// Component uses only what it needs
const MyComponent = () => {
  // Only re-renders when donutModeActive changes
  const donutModeActive = useSessionStore(selectDonutModeActive);
  const toggleDonut = useSessionStore(selectToggleDonutMode);

  return <Button onClick={toggleDonut}>{donutModeActive ? 'On' : 'Off'}</Button>;
};
```

**Don't:**
```typescript
// ❌ WRONG: Subscribe to entire store (unnecessary re-renders)
const MyComponent = () => {
  const { donutModeActive, toggleDonutMode } = useSessionStore();
  // Component re-renders when ANY store property changes!
  // (employees update → MyComponent re-renders unnecessarily)

  return <Button onClick={toggleDonutMode}>{donutModeActive ? 'On' : 'Off'}</Button>;
};
```

**Performance Impact:**
- Before: 50+ components re-render on any store change
- After: Only affected components re-render (1-5 components)
- Validation: React DevTools Profiler → fewer components in flamegraph
- Best Practice: Export both state selectors AND action selectors

**Test Mock Pattern:**
```typescript
// Test mocks must support selectors
// frontend/src/components/__tests__/MyComponent.test.tsx

vi.mock('../../store/sessionStore', () => ({
  useSessionStore: vi.fn(),
  selectDonutModeActive: vi.fn((state) => state.donutModeActive),
  selectToggleDonutMode: vi.fn((state) => state.toggleDonutMode),
}));

beforeEach(() => {
  useSessionStore.mockImplementation((selector) => {
    const mockState = {
      donutModeActive: false,
      toggleDonutMode: vi.fn(),
    };
    return selector ? selector(mockState) : mockState;
  });
});
```

---

### Pattern: React.memo with Custom Comparison Functions (#frontend #rendering)

**When:** Component receives complex props (objects, arrays, functions)

**Scenario:** EmployeeTile with employee object and callback props

```typescript
// ✅ CORRECT: Custom comparison for complex props
// frontend/src/components/grid/EmployeeTile.tsx

// Helper for efficient array comparison (avoid JSON.stringify)
const areArraysEqual = (a: string[] | undefined, b: string[] | undefined): boolean => {
  const arr1 = a || [];
  const arr2 = b || [];
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
};

export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      prevProps.employee.name === nextProps.employee.name &&
      prevProps.employee.performance === nextProps.employee.performance &&
      prevProps.employee.potential === nextProps.employee.potential &&
      areArraysEqual(prevProps.employee.flags, nextProps.employee.flags) &&
      prevProps.donutModeActive === nextProps.donutModeActive &&
      prevProps.onSelect === nextProps.onSelect  // CRITICAL: Include callbacks!
    );
  }
);
```

**Don't:**
```typescript
// ❌ WRONG: Missing callback comparison (stale closures)
export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return prevProps.employee.employee_id === nextProps.employee.employee_id;
    // Missing onSelect comparison → stale callback when parent updates
  }
);

// ❌ WRONG: JSON.stringify for arrays (performance hit in hot path)
export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      JSON.stringify(prevProps.employee.flags) === JSON.stringify(nextProps.employee.flags)
      // Called 50+ times per frame during drag → CPU bottleneck
    );
  }
);
```

**Performance Impact:**
- Before: React.memo broken by missing comparisons → full re-renders
- After: Only affected tiles re-render (5-10 vs 500+)
- JSON.stringify issue: 50+ calls per frame (16ms budget) → lag
- Validation: React DevTools Profiler → "Why did this render?" shows "Props changed: onSelect"

**Critical Rules:**
1. **Include ALL props** in comparison (especially callbacks)
2. **Never use JSON.stringify** in hot paths (drag, scroll, resize)
3. **Use efficient comparisons** for arrays (sort + every, not JSON)
4. **Compare primitive IDs** first (early exit optimization)

---

### Pattern: requestAnimationFrame Throttling for 60fps (#frontend #interactions)

**When:** User interactions cause jank (drag, scroll, resize)

**Scenario:** Right panel resize handler fires multiple times per frame

```typescript
// ✅ CORRECT: RAF throttling with guards
// frontend/src/components/dashboard/DashboardPage.tsx

const rafIdRef = useRef<number | null>(null);
const isMountedRef = useRef(true);

useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  };
}, []);

const handlePanelResize = useCallback((sizes: number[]) => {
  // Use functional setState to avoid stale closures
  setIsResizing(prev => true);

  // Cancel pending frame
  if (rafIdRef.current) {
    cancelAnimationFrame(rafIdRef.current);
  }

  // Schedule single update per frame (60fps = 16.67ms budget)
  rafIdRef.current = requestAnimationFrame(() => {
    if (!isMountedRef.current) return; // Guard against unmount

    // Update panel size
    const newSize = sizes[1];
    setRightPanelSize(newSize);

    if (!isMountedRef.current) return; // Guard before setTimeout

    // Debounce "resizing complete" signal
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsResizing(false);
    }, 150);
  });
}, [setRightPanelSize]); // Don't include isResizing (stale closure)
```

**Don't:**
```typescript
// ❌ WRONG: Direct state update on every resize event (30-60 fps → 200+ updates/sec)
const handlePanelResize = (sizes: number[]) => {
  setIsResizing(true);
  setRightPanelSize(sizes[1]);
  setTimeout(() => setIsResizing(false), 150);
  // Fires 10-20 times per frame → React can't keep up → jank
};

// ❌ WRONG: Missing mounted guard (React warnings after unmount)
rafIdRef.current = requestAnimationFrame(() => {
  setRightPanelSize(newSize); // May execute after unmount!
});

// ❌ WRONG: isResizing in dependencies (recreates callback during resize)
const handlePanelResize = useCallback((sizes) => {
  setIsResizing(!isResizing); // Stale closure + unnecessary recreation
}, [isResizing]); // Callback recreated on every resize → breaks memoization
```

**Performance Impact:**
- Before: 200+ state updates/sec during resize → 15-20fps (jank)
- After: 60 updates/sec (capped by RAF) → 60fps (smooth)
- Validation: Chrome DevTools Performance → FPS meter should stay green (60fps)
- Critical: Always guard RAF callbacks with `isMounted` check

**Pattern Variants:**
```typescript
// Disable expensive CSS transitions during resize
const GridContainer = styled('div')<{ isResizing: boolean }>(({ isResizing }) => ({
  transition: isResizing ? 'none' : 'width 0.2s ease-out',
  // Transitions disabled during resize → 60fps
}));

// Use ResizeObserver with RAF throttling for responsive layout
useEffect(() => {
  const observer = new ResizeObserver(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      updateLayout();
    });
  });
  observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);
```

---

### Pattern: Web Vitals Monitoring (#frontend #observability)

**When:** Need to track real-world performance metrics

**Scenario:** Monitor Core Web Vitals (LCP, FID, CLS) for regression detection

```typescript
// ✅ CORRECT: Track Web Vitals with web-vitals library
// frontend/src/utils/performance.ts

import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export const initPerformanceMonitoring = () => {
  if (import.meta.env.MODE === 'production') {
    onCLS(console.log); // Cumulative Layout Shift
    onFID(console.log); // First Input Delay
    onLCP(console.log); // Largest Contentful Paint
    onFCP(console.log); // First Contentful Paint
    onTTFB(console.log); // Time to First Byte
  }
};

// Custom hook for component performance
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    performance.mark(`${componentName}-mount-start`);

    return () => {
      performance.mark(`${componentName}-mount-end`);
      performance.measure(
        `${componentName}-mount`,
        `${componentName}-mount-start`,
        `${componentName}-mount-end`
      );

      const measure = performance.getEntriesByName(`${componentName}-mount`)[0];
      if (measure.duration > 100) {
        console.warn(`Slow component: ${componentName} took ${measure.duration}ms to mount`);
      }

      performance.clearMarks(`${componentName}-mount-start`);
      performance.clearMarks(`${componentName}-mount-end`);
      performance.clearMeasures(`${componentName}-mount`);
    };
  }, [componentName]);
};

// Usage
const NineBoxGrid = () => {
  usePerformanceMonitor('NineBoxGrid');
  // Logs warning if mount >100ms
};
```

**Performance Targets:**
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1
- **FCP** (First Contentful Paint): <1.8s
- **TTFB** (Time to First Byte): <600ms

**Validation:**
- Chrome DevTools → Lighthouse tab → Performance score
- Real User Monitoring: Track metrics in production logs
- Regression Detection: Compare before/after optimization metrics

---

### Pattern: Lazy Import Heavy Modules (#backend #startup)

**When:** Backend startup is slow (>12s)

**Scenario:** scipy.stats adds ~0.8s to import time

```python
# ✅ CORRECT: Lazy import scipy (only when needed)
# backend/src/ninebox/services/intelligence_service.py

class IntelligenceService:
    def calculate_overall(self, employees: list[Employee]) -> dict:
        # Import scipy only when intelligence analysis is called
        from scipy import stats  # Lazy import

        # ... use stats.chi2_contingency() ...
        return result
```

**Don't:**
```python
# ❌ WRONG: Import at module level
import scipy.stats  # Adds ~0.8s to backend startup

class IntelligenceService:
    # ...
```

**Performance Impact:**
- Before: Backend startup ~13.8s (scipy imported at module level)
- After: Backend startup ~10s (scipy imported on first intelligence analysis call)
- Test: `test_import_performance.py::test_scipy_not_imported_at_startup`

---

### Pattern: Memoize Expensive Components (#frontend #rendering)

**When:** Component re-renders unnecessarily

**Scenario:** EmployeeTile re-renders when unrelated state changes

```typescript
// ✅ CORRECT: Memo prevents unnecessary re-renders
// frontend/src/components/Grid/EmployeeTile.tsx

import React from 'react';

export const EmployeeTile = React.memo<EmployeeTileProps>(
  ({ employee, onSelect, donutModeActive }) => {
    return (
      <Card data-testid={`employee-tile-${employee.employee_id}`}>
        <Typography>{employee.name}</Typography>
        {/* ... */}
      </Card>
    );
  }
);
```

**Don't:**
```typescript
// ❌ WRONG: Re-renders every time parent renders
export const EmployeeTile = ({ employee, onSelect }) => {
  // No memoization, expensive re-renders for all tiles
}
```

**Performance Impact:**
- Before: 1,000 tiles re-render on any state change (~500-1000ms)
- After: Only affected tiles re-render (~50-100ms)
- Validation: React DevTools Profiler → "Ranked" chart

---

### Pattern: Debounce User Input (#frontend #filtering)

**When:** User types in filter/search fields

**Scenario:** Filter employees by name

```typescript
// ✅ CORRECT: Debounce to avoid excessive filtering
import { debounce } from 'lodash';
import { useMemo } from 'react';

const FilterPanel = () => {
  const [filterText, setFilterText] = useState('');

  const debouncedFilter = useMemo(
    () => debounce((text: string) => {
      filterStore.setNameFilter(text);
    }, 300),
    []
  );

  return (
    <TextField
      onChange={(e) => debouncedFilter(e.target.value)}
      placeholder="Filter by name"
    />
  );
};
```

**Don't:**
```typescript
// ❌ WRONG: Filter on every keystroke
<TextField onChange={(e) => filterStore.setNameFilter(e.target.value)} />
// Result: 1,000 employees re-filtered on every character (~50-100ms each = lag)
```

**Performance Impact:**
- Before: Filter applied on every keystroke (lag on large datasets)
- After: Filter applied 300ms after user stops typing (smooth UX)
- Validation: Chrome DevTools → Performance tab (fewer filter calls)

---

### Pattern: Database Indexing (#database #backend)

**When:** Queries slow for large datasets (>1,000 employees)

**Scenario:** Employee lookup by ID or session_id

```python
# ✅ CORRECT: Index on employee_id and foreign keys
# backend/src/ninebox/services/database.py

class Employee(Base):
    __tablename__ = 'employees'

    id = Column(Integer, primary_key=True, index=True)  # Indexed (PK)
    employee_id = Column(Integer, unique=True, index=True)  # Indexed (lookup)
    session_id = Column(Integer, ForeignKey('sessions.id'), index=True)  # Indexed (FK)
    name = Column(String, index=False)  # NOT indexed (rare lookup by name)
    job_function = Column(String, index=True)  # Indexed (frequent filter)
```

**Don't:**
```python
# ❌ WRONG: No indexes on lookup columns
class Employee(Base):
    id = Column(Integer, primary_key=True)  # Only PK indexed
    employee_id = Column(Integer, unique=True)  # NOT indexed = slow lookup
    session_id = Column(Integer, ForeignKey('sessions.id'))  # NOT indexed = slow joins
```

**Performance Impact:**
- Before: `SELECT * FROM employees WHERE employee_id = ?` → O(n) table scan
- After: Index lookup → O(log n)
- Benchmark: For 10,000 employees, 500x faster (100ms → 0.2ms)

---

### Pattern: Avoid Over-Mocking in Tests (#testing #performance)

**When:** Writing performance benchmarks

**Scenario:** Test Excel parsing performance

```python
# ✅ CORRECT: Test with real Excel file (realistic benchmark)
def test_parse_when_large_file_then_completes_within_limit(
    benchmark, large_excel_file: Path
):
    parser = ExcelParser()

    def parse_large_file() -> ParsingResult:
        return parser.parse(str(large_excel_file))

    benchmark(parse_large_file)
```

**Don't:**
```python
# ❌ WRONG: Mock pandas.read_excel (not testing real performance)
def test_parse_when_large_file_then_completes_within_limit(benchmark, mocker):
    mocker.patch('pandas.read_excel', return_value=mock_df)
    # This tests nothing - pandas is the slow part!
```

**Rationale:**
- Performance tests MUST exercise real code paths (no mocks)
- Unit tests can mock for isolation; performance tests need reality
- Validation: `pytest -m performance --benchmark-compare`

---

### Pattern: Optimize Re-Renders with useMemo (#frontend #rendering)

**When:** Expensive calculations run on every render

**Scenario:** Filtering employees by multiple criteria

```typescript
// ✅ CORRECT: Memoize filtered employees
import { useMemo } from 'react';

const NineBoxGrid = () => {
  const employees = useEmployees();
  const filters = useFilters();

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      filters.performance.includes(emp.performance) &&
      filters.potential.includes(emp.potential) &&
      filters.jobFunction.includes(emp.job_function)
    );
  }, [employees, filters]);

  return <Grid employees={filteredEmployees} />;
};
```

**Don't:**
```typescript
// ❌ WRONG: Filter on every render
const NineBoxGrid = () => {
  const employees = useEmployees();
  const filters = useFilters();

  // Recalculates on every render (even if employees/filters unchanged)
  const filteredEmployees = employees.filter(emp =>
    filters.performance.includes(emp.performance) &&
    filters.potential.includes(emp.potential) &&
    filters.jobFunction.includes(emp.job_function)
  );

  return <Grid employees={filteredEmployees} />;
};
```

**Performance Impact:**
- Before: Filter 1,000 employees on every render (~10-20ms) × 10 renders/sec = lag
- After: Filter only when dependencies change (~10-20ms once)
- Validation: React DevTools Profiler → "Flamegraph" (useMemo in gray)

---

### Pattern: SQLite WAL Mode (#database #concurrency)

**When:** Concurrent read/write operations cause locking

**Scenario:** Multiple API calls reading/writing employees simultaneously

```python
# ✅ CORRECT: Enable WAL mode for better concurrency
# backend/src/ninebox/services/database.py

from sqlalchemy import create_engine, event

engine = create_engine(
    f"sqlite:///{db_path}",
    connect_args={"check_same_thread": False},
)

# Enable WAL mode (Write-Ahead Logging)
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")  # Faster commits
    cursor.execute("PRAGMA cache_size=-64000")  # 64MB cache
    cursor.close()
```

**Don't:**
```python
# ❌ WRONG: Default SQLite settings (locks on writes)
engine = create_engine(f"sqlite:///{db_path}")
# journal_mode=DELETE (default) blocks readers during writes
```

**Performance Impact:**
- Before: Writes block all reads (10+ concurrent requests → serialized)
- After: Reads and writes can happen concurrently (10 requests → parallel)
- Test: `test_concurrent_performance.py::test_concurrent_reads_with_writes`

---

### Pattern: Batch Database Writes (#database #backend)

**When:** Importing large Excel files (1,000+ employees)

**Scenario:** Bulk insert employees into database

```python
# ✅ CORRECT: Batch insert with bulk_save_objects
from sqlalchemy.orm import Session

def create_session_with_employees(
    db: Session, employees: list[Employee]
) -> Session:
    # Create session
    session = SessionModel(name="Imported Session", created_at=datetime.now())
    db.add(session)
    db.flush()  # Get session.id

    # Batch insert employees (all at once)
    employee_models = [
        EmployeeModel(**emp.dict(), session_id=session.id)
        for emp in employees
    ]
    db.bulk_save_objects(employee_models)
    db.commit()

    return session
```

**Don't:**
```python
# ❌ WRONG: Insert one-by-one (1,000 separate commits)
def create_session_with_employees(db: Session, employees: list[Employee]):
    session = SessionModel(name="Imported Session")
    db.add(session)
    db.commit()

    for emp in employees:
        emp_model = EmployeeModel(**emp.dict(), session_id=session.id)
        db.add(emp_model)
        db.commit()  # 1,000 commits = 10-30s for large datasets!
```

**Performance Impact:**
- Before: 1,000 employees × commit overhead (~10ms each) = 10s
- After: Single batch insert = ~500ms
- Benchmark: 20x faster for large imports

---

## Profiling Tools

| Tool | Use For | How to Access | Output |
|------|---------|--------------|--------|
| **React DevTools Profiler** | Frontend component render time | F12 → Profiler tab → Record | Flamegraph, ranked chart, component timings |
| **Chrome Performance Tab** | Frontend JavaScript execution | DevTools → Performance → Record | Timeline with JS call stacks, memory, FPS |
| **Electron Task Manager** | Memory usage | Window → Task Manager (or Ctrl+Shift+Esc) | Per-process memory (Main, Renderer, Backend) |
| **cProfile (Python)** | Backend function timing | `python -m cProfile -o output.prof backend/src/ninebox/main.py` | Call tree with cumulative times |
| **pytest-benchmark** | Backend benchmarks | `pytest -m performance --benchmark-only` | Min/Max/Mean/StdDev for each benchmark |
| **pytest -m performance** | All performance tests | `pytest -m performance` | Pass/fail based on targets |
| **Chrome Memory Profiler** | Frontend memory leaks | DevTools → Memory → Heap snapshot | Object retention, leak detection |

## Performance Monitoring Patterns

### Pattern: Log Startup Time (#backend #observability)

```python
# backend/src/ninebox/main.py

import time
import logging

logger = logging.getLogger(__name__)

# Log startup time
startup_start = time.time()

# ... FastAPI app initialization ...

@app.on_event("startup")
async def startup_event():
    startup_duration = time.time() - startup_start
    logger.info(f"Backend started in {startup_duration:.2f}s")

    # Warn if exceeds acceptable threshold
    if startup_duration > 10.0:
        logger.warning(f"Slow startup: {startup_duration:.2f}s (target: <10s)")
```

---

### Pattern: Measure Grid Render Time (#frontend #observability)

```typescript
// frontend/src/components/Grid/NineBoxGrid.tsx

import { useEffect } from 'react';

const NineBoxGrid = () => {
  const employees = useEmployees();

  useEffect(() => {
    performance.mark('grid-render-start');

    return () => {
      performance.mark('grid-render-end');
      performance.measure('grid-render', 'grid-render-start', 'grid-render-end');

      const measure = performance.getEntriesByName('grid-render')[0];
      console.log(`Grid rendered in ${measure.duration.toFixed(2)}ms`);

      // Warn if exceeds acceptable threshold
      if (measure.duration > 1000) {
        console.warn(`Slow grid render: ${measure.duration.toFixed(2)}ms (target: <500ms)`);
      }

      // Clear marks/measures
      performance.clearMarks('grid-render-start');
      performance.clearMarks('grid-render-end');
      performance.clearMeasures('grid-render');
    };
  }, [employees]);

  // ... render logic ...
};
```

---

### Pattern: Track Memory Usage (#backend #observability)

```python
# backend/src/ninebox/routers/session.py

import psutil
import logging

logger = logging.getLogger(__name__)

@router.post("/session/upload")
async def upload_excel(file: UploadFile):
    process = psutil.Process()
    initial_memory = process.memory_info().rss / (1024 * 1024)  # MB

    # ... parse Excel and create session ...

    final_memory = process.memory_info().rss / (1024 * 1024)  # MB
    memory_increase = final_memory - initial_memory

    logger.info(
        f"Excel upload complete: {len(employees)} employees, "
        f"memory: {final_memory:.1f}MB (+{memory_increase:.1f}MB)"
    )

    # Warn if memory increase exceeds threshold
    if memory_increase > 100:
        logger.warning(
            f"High memory increase: +{memory_increase:.1f}MB "
            f"(consider optimizing for {len(employees)} employees)"
        )
```

---

## Performance Testing Checklist

Before merging code that affects performance-critical paths:

**Backend:**
- [ ] Run performance tests: `pytest -m performance`
- [ ] Verify all benchmarks pass (no regressions)
- [ ] Check startup time: <10s (test: `test_import_performance.py`)
- [ ] Validate lazy loading: scipy/openpyxl not imported at startup
- [ ] Test with large dataset (1,000 employees): all operations <acceptable thresholds

**Frontend:**
- [ ] Profile with React DevTools (render times <1s for 500 employees)
- [ ] Test drag-and-drop smoothness (Chrome DevTools Performance → 60fps)
- [ ] Check memory usage (Chrome Task Manager → <500MB after loading 1,000 employees)
- [ ] Verify debouncing on filter inputs (no lag while typing)
- [ ] Test grid expansion (large boxes with 100+ employees render smoothly)

**End-to-End:**
- [ ] Measure total app startup time (<10s from launch to grid visible)
- [ ] Test Excel upload flow (5MB file completes in <5s)
- [ ] Test export flow (1,000 employees exports in <5s)
- [ ] Run concurrent operations test (`test_concurrent_performance.py`)
- [ ] Monitor memory over 10-minute usage session (no memory leaks)

---

## Critical Anti-Patterns (Discovered During Production Optimization)

This section documents real performance issues discovered during the December 2024 performance optimization project. These anti-patterns caused measurable user-perceived lag and required P0/P1 fixes.

### Anti-Pattern 1: i18n Lazy Loading Without Resource Caching

**Issue:** Custom i18next backend loads translations dynamically but doesn't cache them in i18next's resource bundles.

**Symptom:** Language switching completely broken - users must reload app after first language load.

**Root Cause:**
```typescript
// ❌ BROKEN: No caching in i18next
read: (language, namespace, callback) => {
  loadLanguage(language)
    .then((resources) => callback(null, resources))
    .catch((error) => callback(error, null));
  // i18next doesn't know resources are loaded → error on language switch
}
```

**Fix:**
```typescript
// ✅ FIXED: Cache in i18next resource bundles
read: (language, namespace, callback) => {
  // Check cache first
  if (i18n.hasResourceBundle(language, namespace)) {
    const bundle = i18n.getResourceBundle(language, namespace);
    callback(null, bundle);
    return;
  }

  // Load and cache
  loadLanguage(language).then((resources) => {
    i18n.addResourceBundle(language, namespace, resources, true, true);
    callback(null, resources);
  });
}
```

**Impact:** P0 - Feature completely broken in production
**Files:** `frontend/src/i18n/config.ts`
**Test:** Manual - switch languages in Settings dialog

---

### Anti-Pattern 2: React.memo Missing Callback Props in Comparison

**Issue:** React.memo custom comparison function doesn't include callback props (onSelect, onClick, etc.).

**Symptom:** Components use stale closures, event handlers reference old state/props.

**Root Cause:**
```typescript
// ❌ BROKEN: Missing onSelect comparison
export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      prevProps.donutModeActive === nextProps.donutModeActive
      // Missing: prevProps.onSelect === nextProps.onSelect
    );
  }
);
```

**Why This Breaks:**
1. Parent component updates → creates new `onSelect` callback
2. React.memo comparison returns `true` (props "equal")
3. EmployeeTile keeps old callback → stale closure
4. User clicks tile → old callback with stale state executes

**Fix:**
```typescript
// ✅ FIXED: Include ALL props, especially callbacks
export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      prevProps.donutModeActive === nextProps.donutModeActive &&
      prevProps.onSelect === nextProps.onSelect  // Critical!
    );
  }
);
```

**Impact:** P1 - Stale closures cause incorrect behavior
**Files:** `frontend/src/components/grid/EmployeeTile.tsx`, `DraggedEmployeeTile.tsx`
**Detection:** React DevTools Profiler → "Why did this render?" → "Props changed: onSelect"

---

### Anti-Pattern 3: JSON.stringify for Array Comparison in Hot Paths

**Issue:** Using `JSON.stringify()` to compare arrays in React.memo comparison functions.

**Symptom:** Drag-and-drop feels laggy, frame rate drops to 30-40fps during drag.

**Root Cause:**
```typescript
// ❌ BROKEN: JSON.stringify in hot path (called 50+ times per frame)
export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      JSON.stringify(prevProps.employee.flags) === JSON.stringify(nextProps.employee.flags)
      // Called 50+ times per drag frame → CPU bottleneck
    );
  }
);
```

**Why This Is Slow:**
- Drag triggers 500+ tile comparisons per frame
- Each `JSON.stringify()` call: ~0.05-0.1ms
- Total: 50 tiles × 0.1ms = 5ms (30% of 16ms frame budget)
- Order-sensitive: `['flag1', 'flag2']` ≠ `['flag2', 'flag1']`

**Fix:**
```typescript
// ✅ FIXED: Efficient array comparison
const areArraysEqual = (a?: string[], b?: string[]): boolean => {
  const arr1 = a || [];
  const arr2 = b || [];
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
};

export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      areArraysEqual(prevProps.employee.flags, nextProps.employee.flags)
      // 10-20x faster, order-insensitive
    );
  }
);
```

**Impact:** P1 - Measurable lag during drag operations (40fps → 60fps)
**Files:** `frontend/src/components/grid/EmployeeTile.tsx`, `DraggedEmployeeTile.tsx`
**Validation:** Chrome DevTools Performance → FPS meter, JS profiler

---

### Anti-Pattern 4: Hard-Coded Pixel Values in Responsive Components

**Issue:** Components use hard-coded pixel values instead of design tokens from GridZoomContext.

**Symptom:** Dragged employee tiles don't match grid tile size at different zoom levels.

**Root Cause:**
```typescript
// ❌ BROKEN: Hard-coded values don't respond to zoom
<Card sx={{
  minWidth: 280,  // Hard-coded
  maxWidth: 400,  // Hard-coded
}}>
  <DragHandleIcon sx={{ fontSize: 16 }} /> {/* Hard-coded */}
  <HistoryIcon sx={{ fontSize: 12 }} /> {/* Hard-coded */}
</Card>
```

**Fix:**
```typescript
// ✅ FIXED: Use zoom tokens
import { useGridZoom } from '../../contexts/GridZoomContext';

const DraggedEmployeeTile = () => {
  const { tokens } = useGridZoom();

  return (
    <Card sx={{
      minWidth: tokens.tile.minWidth,
      maxWidth: tokens.tile.maxWidth,
    }}>
      <DragHandleIcon sx={{ fontSize: tokens.icon.dragHandle }} />
      <HistoryIcon sx={{ fontSize: tokens.icon.history }} />
    </Card>
  );
};
```

**Impact:** P1 - Visual mismatch at zoom levels, poor UX
**Files:** `frontend/src/components/grid/DraggedEmployeeTile.tsx`
**Test:** Visual regression - compare drag overlay to grid tiles at 50%, 100%, 150% zoom

---

### Anti-Pattern 5: requestAnimationFrame Without Mounted Guards

**Issue:** RAF callbacks execute after component unmounts, causing React warnings and potential memory leaks.

**Symptom:** Console warnings: "Can't perform a React state update on an unmounted component"

**Root Cause:**
```typescript
// ❌ BROKEN: RAF executes after unmount
const handlePanelResize = (sizes: number[]) => {
  rafIdRef.current = requestAnimationFrame(() => {
    setRightPanelSize(sizes[1]); // May run after unmount!
    setTimeout(() => {
      setIsResizing(false); // Memory leak!
    }, 150);
  });
};
```

**Fix:**
```typescript
// ✅ FIXED: Mounted guards in RAF and cleanup
const isMountedRef = useRef(true);

useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
  };
}, []);

const handlePanelResize = (sizes: number[]) => {
  rafIdRef.current = requestAnimationFrame(() => {
    if (!isMountedRef.current) return; // Guard #1

    setRightPanelSize(sizes[1]);

    if (!isMountedRef.current) return; // Guard #2

    resizeTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return; // Guard #3
      setIsResizing(false);
    }, 150);
  });
};
```

**Impact:** P1 - React warnings, potential memory leaks
**Files:** `frontend/src/components/dashboard/DashboardPage.tsx`
**Test:** Automated - mount/unmount stress test

---

### Anti-Pattern 6: Stale Closures in useCallback Dependencies

**Issue:** `useCallback` includes state variables in dependencies that cause unnecessary callback recreation during active operations.

**Symptom:** Resize operations feel janky, callbacks recreated mid-resize.

**Root Cause:**
```typescript
// ❌ BROKEN: isResizing in dependencies causes recreation
const handlePanelResize = useCallback((sizes) => {
  setIsResizing(!isResizing); // Reads isResizing from closure
  // ... resize logic
}, [isResizing]); // Callback recreated every time isResizing changes!
// During resize: isResizing toggles → callback recreated → breaks memoization
```

**Fix:**
```typescript
// ✅ FIXED: Functional setState pattern, remove from dependencies
const handlePanelResize = useCallback((sizes) => {
  setIsResizing(prev => true); // Functional update, no closure dependency

  rafIdRef.current = requestAnimationFrame(() => {
    // ... resize logic
    setTimeout(() => {
      setIsResizing(false); // OK to use false directly
    }, 150);
  });
}, [setRightPanelSize]); // isResizing NOT in dependencies
```

**Impact:** P1 - Janky resize, broken memoization
**Files:** `frontend/src/components/dashboard/DashboardPage.tsx`
**Validation:** React DevTools Profiler → callback reference stability

---

### Anti-Pattern 7: Context Fallback Logic Ignoring Internal State

**Issue:** Context always uses external prop value even when external setter is `undefined`.

**Symptom:** Internal state never used, components can't function standalone.

**Root Cause:**
```typescript
// ❌ BROKEN: Always uses external value
const GridZoomContext = ({ externalIsResizing, externalSetIsResizing, children }) => {
  const [internalIsResizing, setInternalIsResizing] = useState(false);

  // Always uses external value even if setter is undefined!
  const isResizing = externalIsResizing;
  const setIsResizing = externalSetIsResizing || setInternalIsResizing;
};
```

**Fix:**
```typescript
// ✅ FIXED: Conditional logic based on setter presence
const GridZoomContext = ({ externalIsResizing, externalSetIsResizing, children }) => {
  const [internalIsResizing, setInternalIsResizing] = useState(false);

  // Use external ONLY if setter provided
  const isResizing = externalSetIsResizing ? externalIsResizing : internalIsResizing;
  const setIsResizing = externalSetIsResizing || setInternalIsResizing;
};
```

**Impact:** P1 - Context unusable without external state management
**Files:** `frontend/src/contexts/GridZoomContext.tsx`
**Test:** Unit test - verify internal state works when no external props

---

### Anti-Pattern 8: Zustand Store Tests Not Updated for Selectors

**Issue:** Tests use old mock pattern (`mockReturnValue`) after store refactored to use selectors.

**Symptom:** 49 test failures: "No 'selectX' export is defined on mock"

**Root Cause:**
```typescript
// ❌ BROKEN: Old mock pattern doesn't support selectors
vi.mock('../../store/sessionStore', () => ({
  useSessionStore: vi.fn(() => ({
    employees: mockEmployees,
    donutModeActive: false,
  }))
}));

// Component uses selectors:
const donutModeActive = useSessionStore(selectDonutModeActive);
// Test fails: selectDonutModeActive not exported from mock!
```

**Fix:**
```typescript
// ✅ FIXED: Mock supports selector pattern
vi.mock('../../store/sessionStore', () => ({
  useSessionStore: vi.fn(),
  selectEmployees: vi.fn((state) => state.employees),
  selectDonutModeActive: vi.fn((state) => state.donutModeActive),
}));

beforeEach(() => {
  useSessionStore.mockImplementation((selector) => {
    const mockState = {
      employees: mockEmployees,
      donutModeActive: false,
    };
    return selector ? selector(mockState) : mockState;
  });
});
```

**Impact:** P0 - 49 test failures (96% → 100% pass rate)
**Files:** 6 test files across `components/` and `hooks/`
**Pattern:** Apply to ALL Zustand store mocks consistently

---

## Common Performance Mistakes

### Mistake 1: Importing Heavy Modules at Top Level

```python
# ❌ WRONG: Adds ~0.8s to backend startup
import scipy.stats

# ✅ CORRECT: Lazy import
def calculate_chi_square(data):
    from scipy import stats  # Only import when needed
    return stats.chi2_contingency(data)
```

**Impact:** Backend startup: 13.8s → 10s

---

### Mistake 2: Not Memoizing React Components

```typescript
// ❌ WRONG: All 1,000 tiles re-render on any state change
export const EmployeeTile = ({ employee }) => {
  return <Card>{employee.name}</Card>;
};

// ✅ CORRECT: Only affected tiles re-render
export const EmployeeTile = React.memo(({ employee }) => {
  return <Card>{employee.name}</Card>;
});
```

**Impact:** Grid render: 1000ms → 100ms

---

### Mistake 3: Filtering on Every Keystroke

```typescript
// ❌ WRONG: Filter 1,000 employees on every character
<TextField onChange={(e) => filterEmployees(e.target.value)} />

// ✅ CORRECT: Debounce (wait 300ms after user stops typing)
const debouncedFilter = useMemo(
  () => debounce((text) => filterEmployees(text), 300),
  []
);
<TextField onChange={(e) => debouncedFilter(e.target.value)} />
```

**Impact:** Smooth typing vs laggy input

---

### Mistake 4: Missing Database Indexes

```python
# ❌ WRONG: O(n) table scan for every lookup
employee_id = Column(Integer, unique=True)  # No index!

# ✅ CORRECT: O(log n) index lookup
employee_id = Column(Integer, unique=True, index=True)
```

**Impact:** 10,000 employees: 100ms → 0.2ms per lookup

---

### Mistake 5: Individual Database Commits in Loop

```python
# ❌ WRONG: 1,000 commits (10s for large datasets)
for emp in employees:
    db.add(EmployeeModel(**emp.dict()))
    db.commit()

# ✅ CORRECT: Batch insert (500ms)
db.bulk_save_objects([EmployeeModel(**emp.dict()) for emp in employees])
db.commit()
```

**Impact:** Import 1,000 employees: 10s → 0.5s

---

## Automated Regression Detection

### Quick Commands

```bash
# Pre-commit (< 2s) - Automatic with git hooks
npm run lint                      # ESLint performance rules

# Pre-push (< 30s) - Run before pushing
npm run test:fast                 # Fast unit tests (bail on 5 failures)
npm run check:bundle              # Validate bundle size vs baseline

# Save new baseline (after verified optimization)
npm run check:bundle:save

# CI/CD (runs automatically on PR)
npm test                          # Full test suite
npm run build && npm run check:bundle
```

### ESLint Performance Rules

The project enforces these performance rules automatically:

- **❌ Error:** MUI barrel imports (`import { Button } from '@mui/material'`)
  - **✅ Fix:** Named imports (`import Button from '@mui/material/Button'`)

- **⚠️ Warning:** JSON.stringify in performance-critical paths
  - **✅ Fix:** Use efficient comparison functions

- **⚠️ Warning:** Hardcoded pixel values instead of design tokens
  - **✅ Fix:** Use `useGridZoom()` tokens or theme values

### Bundle Size Limits

| Chunk | Limit (gzipped) | Current Baseline | Status |
|-------|-----------------|------------------|--------|
| **main** | 500KB | 38.7KB | ✅ 92% under limit |
| **vendor** | 300KB | 234.2KB | ✅ 22% under limit |
| **mui-core** | 200KB | 95.2KB | ✅ 52% under limit |
| **total** | 1MB | 368.2KB | ✅ 63% under limit |

**Regression threshold:** 10% increase triggers warning

**Notes:**
- Baseline established: 2025-12-31
- `vendor` includes: React, Zustand, react-dnd, recharts, i18n, emotion
- `mui-core` includes: Material-UI components (@mui/material, @mui/icons-material)
- `main` includes: Application code (components, stores, utilities)
- Translation files are lazy-loaded and not counted in initial bundle

### What Gets Checked When

| Check | Pre-commit | Pre-push | CI/CD | Time |
|-------|-----------|----------|-------|------|
| ESLint performance rules | ✅ | ✅ | ✅ | < 2s |
| Fast unit tests | ❌ | ✅ | ✅ | < 10s |
| Bundle size check | ❌ | ✅ | ✅ | < 20s |
| Full test suite | ❌ | ❌ | ✅ | 30-60s |

### Escape Hatches

```bash
# Skip pre-commit hooks (use sparingly!)
git commit --no-verify

# Run bundle check without rebuilding
npm run check:bundle -- --skip-build

# Check specific tests
npm run test:fast -- EmployeeTile
```

---

## Related Documentation

- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** - Architecture overview, data flow
- **Backend performance tests:** `backend/tests/performance/`
  - `test_api_performance.py` - API endpoint benchmarks
  - `test_service_performance.py` - Service layer benchmarks
  - `test_import_performance.py` - Startup and import benchmarks
  - `test_concurrent_performance.py` - Concurrency and memory tests
- **Frontend testing:** `frontend/playwright/e2e/` - End-to-end performance validation
- **[ERROR_HANDLING.md](ERROR_HANDLING.md)** - Error handling patterns (don't sacrifice performance for error handling)
- **[OBSERVABILITY.md](OBSERVABILITY.md)** - Logging patterns for performance monitoring

---

**Last Updated:** 2025-12-31
**Performance Baseline:** Backend startup <10s, Grid render <500ms, API calls <100ms, Bundle size 381KB gzipped
**Test Suite:** `pytest -m performance` (24 performance tests), Frontend: 1,173 tests
**Recent Optimization:** December 2024 - 46% bundle reduction, 60fps drag operations, i18n lazy loading
