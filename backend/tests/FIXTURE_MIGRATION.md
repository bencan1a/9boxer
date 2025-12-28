# Test Fixture Migration Guide

**Migration Date:** 2025-12-28
**Status:** Completed - Sample employees fixture migrated to rich data generator

## Overview

The test suite has been enhanced with a rich sample data generator that creates realistic employee datasets with:
- Complete organizational hierarchies (6 management levels)
- Performance history over 3 years
- Statistical bias patterns for intelligence testing
- All job levels, locations, and grid positions covered
- Reproducible results via fixed seed

## What Changed

### Migrated Fixtures

1. **`sample_employees` fixture** (50 employees)
   - **Before:** Hard-coded list of 5 employees with minimal data
   - **After:** Generated dataset of 50 employees with complete organizational data
   - **Impact:** Tests using this fixture now have richer, more realistic data
   - **Breaking Changes:** Tests that expected exactly 5 employees need to be updated

### New Fixtures Added

1. **`rich_sample_employees_small`** (50 employees)
   - Alias for `sample_employees` with explicit naming
   - Use when you want to clearly indicate usage of rich data generator
   - Includes bias patterns for intelligence testing

2. **`rich_sample_employees_medium`** (100 employees)
   - Medium-sized dataset for statistical significance
   - Ideal for intelligence/statistics feature testing
   - More diverse organizational structures

3. **`rich_sample_employees_large`** (200 employees)
   - Large dataset for performance and integration testing
   - Complete coverage of all edge cases
   - All 8 locations and job functions included

### Unchanged Fixtures

1. **`create_test_employee()` function** (conftest.py)
   - Marked as DEPRECATED but still functional
   - Alias for `create_simple_test_employee()`
   - Kept for backward compatibility with existing imports
   - Will be removed in future version

2. **`create_simple_test_employee()` function** (conftest.py)
   - Use for single-employee unit tests
   - Provides full control over employee attributes
   - No organizational hierarchy (minimal fixture)

3. **`create_test_employee()` function** (tests/test_utils.py)
   - Separate implementation for event tracking tests
   - Unchanged, no migration needed

4. **Performance test fixtures** (performance/conftest.py)
   - `create_test_employee()` - Performance-optimized implementation
   - `large_employee_dataset` - Uses custom employee generator
   - No migration needed (performance-specific implementation)

## Migration Strategy

### For New Tests

**Choose the right fixture:**

```python
# Single-employee unit test with full control
from tests.conftest import create_simple_test_employee

def test_employee_validation():
    employee = create_simple_test_employee(
        employee_id=1,
        name="Test User",
        performance=PerformanceLevel.HIGH
    )
    # Test logic...

# Integration test with multiple employees (50)
def test_grid_operations(sample_employees):
    # Test with 50 realistic employees
    assert len(sample_employees) == 50
    # Test logic...

# Statistics test needing larger dataset (100)
def test_bias_detection(rich_sample_employees_medium):
    # Test with 100 employees for statistical significance
    assert len(rich_sample_employees_medium) == 100
    # Test logic...

# Performance test with large dataset (200)
def test_export_performance(rich_sample_employees_large):
    # Test with 200 employees
    assert len(rich_sample_employees_large) == 200
    # Test logic...
```

### For Existing Tests

**Option 1: No Changes Required**
- If test uses `sample_employees` and doesn't depend on count being 5
- Test will automatically benefit from richer data
- Verify test still passes with 50 employees

**Option 2: Update Count Assertions**
```python
# Before
def test_load_employees(sample_employees):
    assert len(sample_employees) == 5  # ❌ This will fail

# After
def test_load_employees(sample_employees):
    assert len(sample_employees) == 50  # ✅ Updated count
```

**Option 3: Use Explicit Small Fixture**
```python
# Before
def test_with_few_employees(sample_employees):
    # Test that expected exactly 5 employees

# After - create custom small fixture if needed
@pytest.fixture
def five_employees():
    return [create_simple_test_employee(i) for i in range(1, 6)]

def test_with_few_employees(five_employees):
    assert len(five_employees) == 5
    # Test logic...
```

## Test Count Expectations

### Before Migration
- `sample_employees`: 5 employees
- `sample_excel_file`: Excel file with 5 employees

### After Migration
- `sample_employees`: 50 employees
- `rich_sample_employees_small`: 50 employees
- `rich_sample_employees_medium`: 100 employees
- `rich_sample_employees_large`: 200 employees
- `sample_excel_file`: Excel file with 50 employees (uses sample_employees)

## Benefits of Rich Data Generator

### Better Test Coverage
- All 6 management levels (MT1-MT6) represented
- All 9 grid positions covered
- All 8 flag types distributed
- Multiple locations (USA, CAN, GBR, DEU, FRA, IND, AUS, SGP)
- Multiple job functions (Engineering, Product, Sales, Marketing, etc.)

### More Realistic Testing
- Complete organizational hierarchies (no orphaned employees)
- 3 years of performance history (80% complete, 20% with gaps)
- Realistic span of control (5-15 direct reports)
- Statistical bias patterns for intelligence testing:
  - USA location: +15% high performers
  - Sales function: +20% high performers

### Test Reproducibility
- Fixed seed (42) ensures consistent data across runs
- Same employees generated every time
- Predictable IDs, names, and attributes
- No flakiness from random data

### Statistical Significance
- Intelligence tests require 30+ employees
- Bias detection needs sufficient sample size
- Statistical calculations more meaningful
- Can detect patterns and outliers

## Common Issues and Solutions

### Issue: Test expects 5 employees, gets 50

**Solution:** Update count assertion or create custom small fixture

```python
# Option 1: Update assertion
assert len(sample_employees) == 50

# Option 2: Create custom fixture
@pytest.fixture
def small_employee_set():
    return [create_simple_test_employee(i) for i in range(1, 6)]
```

### Issue: Test depends on specific employee IDs

**Solution:** Use attributes instead of hard-coded IDs

```python
# Before (fragile)
employee = next(e for e in sample_employees if e.employee_id == 1)

# After (robust)
employee = next(e for e in sample_employees if e.performance == PerformanceLevel.HIGH)
# Or filter by other attributes
high_performers = [e for e in sample_employees if e.performance == PerformanceLevel.HIGH]
```

### Issue: Test needs specific employee configuration

**Solution:** Use `create_simple_test_employee()` for full control

```python
# Instead of sample_employees fixture
def test_specific_config():
    employee = create_simple_test_employee(
        employee_id=999,
        name="Specific Test User",
        performance=PerformanceLevel.HIGH,
        potential=PotentialLevel.LOW,
        flags=["flight_risk"]
    )
    # Test logic...
```

### Issue: Integration test needs database-persisted employees

**Solution:** Use fixture with database session

```python
from ninebox.services.database import DatabaseManager

@pytest.fixture
def db_employees(sample_employees):
    db = DatabaseManager()
    # Save to database
    # Return employees
    pass
```

## Deprecation Timeline

### Immediate (2025-12-28)
- ✅ `sample_employees` migrated to rich generator
- ✅ New rich fixtures added (small, medium, large)
- ✅ `create_test_employee()` marked as deprecated
- ✅ Migration guide created

### Near Term (Q1 2026)
- Review all test files for hard-coded count expectations
- Migrate performance tests if beneficial
- Consider adding rich fixtures with custom configurations

### Future (Q2 2026)
- Remove deprecated `create_test_employee()` from conftest.py
- Consolidate into `create_simple_test_employee()` only
- Update all documentation references

## Best Practices

### DO ✅

- Use `sample_employees` for general integration tests
- Use `create_simple_test_employee()` for single-employee unit tests
- Use `rich_sample_employees_medium` for statistics/intelligence tests
- Use `rich_sample_employees_large` for performance validation
- Filter employees by attributes (performance, potential, flags)
- Test with realistic data volumes

### DON'T ❌

- Don't hard-code employee IDs in tests (data is generated)
- Don't use `create_test_employee()` from conftest (deprecated)
- Don't create custom employee generators (use rich fixtures)
- Don't assume specific employee counts without checking fixture size
- Don't test with unrealistic single-employee datasets

## Examples

### Before: Hard-coded minimal data
```python
def test_grid_positions():
    employees = [
        Employee(employee_id=1, name="Alice", ...),
        Employee(employee_id=2, name="Bob", ...),
        Employee(employee_id=3, name="Charlie", ...),
    ]
    # Test logic
```

### After: Rich generated data
```python
def test_grid_positions(sample_employees):
    # Get 50 employees with complete org hierarchy
    assert len(sample_employees) == 50

    # Filter by attributes
    high_performers = [e for e in sample_employees
                       if e.performance == PerformanceLevel.HIGH]

    # Test logic with realistic data
```

### Migration Example: Statistics Test
```python
# Before: Insufficient data for statistics
def test_calculate_bias():
    employees = [create_test_employee(i) for i in range(10)]
    stats = calculate_statistics(employees)
    # Not enough data for meaningful bias detection

# After: Rich data with bias patterns
def test_calculate_bias(rich_sample_employees_medium):
    # 100 employees with built-in bias patterns
    stats = calculate_statistics(rich_sample_employees_medium)

    # Can now detect USA location bias (+15% high performers)
    usa_employees = [e for e in rich_sample_employees_medium
                     if e.location == "USA"]
    usa_high_perf_rate = calculate_high_performer_rate(usa_employees)

    # Statistical significance with larger sample
    assert usa_high_perf_rate > baseline_rate + 0.10
```

## Testing Your Migration

After updating fixtures, run:

```bash
# Activate venv
. .venv/bin/activate  # Linux/macOS
# or
.venv\Scripts\activate  # Windows

# Run all tests
pytest

# Run specific test suites
pytest backend/tests/unit/        # Unit tests
pytest backend/tests/integration/  # Integration tests
pytest backend/tests/performance/  # Performance tests

# Run with coverage
pytest --cov=backend/src/ninebox --cov-report=html

# Type checking
make type-check

# Linting
make lint
```

All 372 existing tests should still pass after migration.

## Questions?

- See `backend/src/ninebox/services/sample_data_generator.py` for generator implementation
- See `backend/tests/unit/services/test_sample_data_generator.py` for usage examples
- See `backend/tests/conftest.py` for fixture definitions
- Consult `internal-docs/testing/` for comprehensive testing guidance

## Summary

The migration to rich sample data generator provides:
- ✅ More realistic test data (organizational hierarchies, performance history)
- ✅ Better test coverage (all levels, locations, grid positions)
- ✅ Statistical significance (sufficient data for intelligence features)
- ✅ Reproducibility (fixed seed for consistent results)
- ✅ Backward compatibility (existing functions still work)
- ✅ Clear migration path (gradual, non-breaking)

This enhancement makes our tests more robust, realistic, and maintainable.
