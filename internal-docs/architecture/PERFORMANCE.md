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

**Last Updated:** 2025-12-27
**Performance Baseline:** Backend startup <10s, Grid render <500ms, API calls <100ms
**Test Suite:** `pytest -m performance` (24 performance tests)
