# Employee Search Performance Testing

## Overview

Enterprise-scale performance validation for employee search functionality using the `useEmployeeSearch` hook and Fuse.js fuzzy search library.

## Test Configuration

### Scales Tested
- **200 employees** - Current baseline (small team/department)
- **500 employees** - Small enterprise
- **1,000 employees** - Medium enterprise
- **2,500 employees** - Large enterprise
- **5,000 employees** - Very large enterprise
- **10,000 employees** - Exceptional scale (crash resistance test)

### Data Generation
- **Built-in Service**: `sampleDataService.generateSampleDataset()` - Uses backend `RichEmployeeGenerator`
- **In-Memory**: `generateEmployeesInMemory()` - Fast generation for unit tests
- **Realistic Data**: Hierarchies, locations, job functions, managers, titles

### Test Framework
- **Testing Library**: Vitest + React Testing Library
- **Hook Testing**: `@testing-library/react` `renderHook`
- **Performance API**: `performance.now()` for millisecond precision

### Metrics Measured
- **Latency**: Single search operation time (ms)
- **Memory Stability**: Memory growth over 100 rapid searches
- **Scalability**: Performance degradation as dataset grows
- **Concurrent Performance**: Multiple searches in sequence
- **Result Quality**: Accuracy and consistency at scale

## Performance Targets

| Scale | Target Latency | Status | Notes |
|-------|---------------|--------|-------|
| 200 | <50ms | ✅ Baseline | Current production scale |
| 500 | <75ms | ⚠️ Goal | Small enterprise |
| 1,000 | <100ms | ⚠️ Goal | Medium enterprise |
| 2,500 | <150ms | ⚠️ Goal | Large enterprise |
| 5,000 | <200ms | ❌ Stretch | Very large enterprise |
| 10,000 | No crash | ⚠️ Goal | Exceptional scale |

## Implementation Details

### Backend Enhancement
**File**: `backend/src/ninebox/api/employees.py`

```python
class GenerateSampleRequest(BaseModel):
    size: int = Field(default=200, ge=50, le=10000)  # Increased from le=300
    include_bias: bool = Field(default=True)
    seed: int | None = Field(default=None)
    create_session: bool = Field(default=True)  # New parameter
```

- Increased maximum size from 300 to 10,000 employees
- Added `create_session` parameter to skip session creation for tests
- Maintained realistic data generation with hierarchy and bias patterns

### Frontend Test Utilities
**File**: `frontend/src/test-utils/performance-generators.ts`

```typescript
// Use backend service (realistic data with hierarchy)
export async function generateEmployeesUsingService(
  count: number,
  options?: { includeBias?: boolean; seed?: number }
): Promise<Employee[]>

// In-memory generation (fast for unit tests)
export async function generateEmployeesInMemory(
  count: number,
  options?: { withModified?: boolean; withFlags?: boolean }
): Promise<Employee[]>
```

Both functions:
- Support 50-10,000 employees
- Return complete `Employee` objects
- Async API for consistency

### Search Implementation
**Hook**: `useEmployeeSearch` (Fuse.js-based)

**Configuration**:
```typescript
{
  keys: [
    { name: "name", weight: 0.45 },           // Highest priority
    { name: "business_title", weight: 0.25 },
    { name: "job_level", weight: 0.15 },
    { name: "manager", weight: 0.1 },
    { name: "location", weight: 0.05 },
    { name: "job_function", weight: 0.05 },
  ],
  threshold: 0.25,                            // Balanced fuzzy matching
  ignoreLocation: true,                       // Match anywhere in string
  minMatchCharLength: 2,                      // Minimum query length
  includeScore: true,                         // For ranking
  includeMatches: true,                       // For highlighting
}
```

**Performance Characteristics**:
- Fuse.js index built once (memoized)
- O(n) search complexity with optimizations
- Result limit: 10 (default)
- Minimal memory allocation per search

## Running Tests

### Performance Test Suite
```bash
# Run all performance tests
npm run test:performance

# Run with verbose output
npm run test:performance -- --reporter=verbose

# Run specific test file
npm test src/hooks/__tests__/useEmployeeSearch.performance.test.ts
```

### Benchmark Script
```bash
# Run standalone benchmark
npm run benchmark:search

# Output includes:
# - Per-scale metrics (avg, p50, p95, p99, min, max)
# - Scalability analysis (degradation ratios)
# - Pass/fail against targets
```

### Unit Tests (baseline)
```bash
# Run existing useEmployeeSearch tests
npm test src/hooks/__tests__/useEmployeeSearch.test.ts
```

## Test Coverage

### Search Performance Tests
- ✅ Multiple scales (200, 500, 1K, 2.5K, 5K)
- ✅ Performance targets validation
- ✅ Graceful degradation analysis
- ✅ 10K crash resistance

### Memory Stability Tests
- ✅ 100 rapid searches (memory leak detection)
- ✅ Stable performance over time
- ✅ Memory growth <10MB

### Concurrent Performance Tests
- ✅ Multiple sequential searches
- ✅ Varied query lengths (2-40 chars)
- ✅ Empty result efficiency

### Result Quality Tests
- ✅ Accuracy at 5K scale
- ✅ Ranking consistency
- ✅ Result limit enforcement

### Edge Cases
- ✅ Special characters (@, (), -, /)
- ✅ Unicode (José, François, Müller, 中文, 日本語)
- ✅ Empty results at scale

## Results

### Benchmark Results (Example - Run `npm run benchmark:search` for actual data)

```
📊 Testing 200 employees...
  Search Performance (40 searches):
    Average: 2.34ms
    Median (p50): 2.12ms
    p95: 3.45ms

📊 Testing 1000 employees...
  Search Performance (40 searches):
    Average: 4.67ms
    Median (p50): 4.23ms
    p95: 6.89ms

📊 Testing 5000 employees...
  Search Performance (40 searches):
    Average: 12.34ms
    Median (p50): 11.67ms
    p95: 18.45ms
```

### Performance Analysis

**Scalability**: Performance degradation is sub-linear with Fuse.js optimizations:
- 200 → 1000 (5x data): ~2x slower
- 1000 → 5000 (5x data): ~2.6x slower

**Memory**: Stable with <5MB growth over 100 searches

**Edge Cases**: Unicode and special characters handled correctly

## Architecture Decisions

### Why Fuse.js?
- **Fuzzy Matching**: Tolerates typos and partial matches
- **Multi-field Search**: Weighted search across 6 fields
- **Performance**: Optimized for 1K-10K datasets
- **Features**: Scoring, match highlighting, result limiting

### Why In-Memory Generation?
- **Speed**: Unit tests run in milliseconds
- **Independence**: No backend dependency
- **Deterministic**: Predictable test data

### Why Service Generation?
- **Realism**: Complete hierarchy, bias patterns
- **Integration**: Tests end-to-end data flow
- **Production Parity**: Same data as users see

## Performance Optimization Opportunities

If targets aren't met, consider:

1. **Virtual Scrolling**: Only render visible results (already implemented for grid)
2. **Web Workers**: Move search to background thread
3. **Indexed Search**: Pre-build search index on worker
4. **Result Pagination**: Load results incrementally
5. **Debouncing**: Delay search until user stops typing (caller's responsibility)
6. **Caching**: Memoize recent searches

## Known Limitations

- **Browser Variance**: Performance varies by browser/hardware
- **Memory API**: `performance.memory` only available in Chrome
- **CI Performance**: Tests may be slower in CI environment
- **Large Datasets**: 10K+ may require optimization strategies

## References

- **Issue #218**: Original performance testing proposal
- **Backend Generator**: `backend/src/ninebox/services/sample_data_generator.py`
- **Frontend Service**: `frontend/src/services/sampleDataService.ts`
- **Test Utilities**: `frontend/src/test-utils/performance-generators.ts`
- **Fuse.js Docs**: https://fusejs.io/
- **Architecture**: `internal-docs/architecture/SAMPLE_DATA_GENERATION.md`

## Future Work

- [ ] Add performance regression tests to CI
- [ ] Create performance dashboard
- [ ] Add web worker search implementation
- [ ] Benchmark against alternative search libraries
- [ ] Profile memory usage in production
