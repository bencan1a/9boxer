# Test Fixture Quick Reference

**Last Updated:** 2025-12-28

Quick guide for choosing the right test fixture for your tests.

## Available Fixtures

### Single Employee Fixtures

```python
from tests.conftest import create_simple_test_employee

# Create a single employee with full control
employee = create_simple_test_employee(
    employee_id=1,
    name="Test User",
    performance=PerformanceLevel.HIGH,
    potential=PotentialLevel.MEDIUM,
    flags=["promotion_ready"],
    grid_position=6
)
```

**Use When:**
- Unit testing single employee operations
- Need full control over employee attributes
- Testing edge cases with specific configurations
- No organizational hierarchy needed

### Rich Sample Fixtures (Generated Data)

#### Small Dataset (50 employees)
```python
def test_with_small_dataset(sample_employees):
    # or
def test_with_small_dataset(rich_sample_employees_small):
    assert len(sample_employees) == 50
    # Rich organizational data included
```

**Use When:**
- Integration tests with multiple employees
- Testing grid operations
- General feature testing
- Need realistic organizational hierarchy

#### Medium Dataset (100 employees)
```python
def test_with_medium_dataset(rich_sample_employees_medium):
    assert len(rich_sample_employees_medium) == 100
    # Includes statistical bias patterns
```

**Use When:**
- Intelligence/statistics feature tests
- Need statistical significance (30+ employees)
- Testing bias detection
- Analytics calculations

#### Large Dataset (200 employees)
```python
def test_with_large_dataset(rich_sample_employees_large):
    assert len(rich_sample_employees_large) == 200
    # All locations and job functions included
```

**Use When:**
- Performance testing
- Export/import testing
- Large-scale data operations
- UI rendering with many employees

## Decision Tree

```
Need employees for test?
  │
  ├─ Single employee?
  │  └─ Use create_simple_test_employee()
  │
  ├─ Need realistic org hierarchy?
  │  │
  │  ├─ < 50 employees needed?
  │  │  └─ Use sample_employees (50)
  │  │
  │  ├─ Testing statistics/intelligence?
  │  │  └─ Use rich_sample_employees_medium (100)
  │  │
  │  └─ Testing performance/large-scale?
  │     └─ Use rich_sample_employees_large (200)
  │
  └─ Need specific configuration?
     └─ Create custom fixture or use create_simple_test_employee()
```

## Common Patterns

### Filter by Attributes
```python
def test_filter_high_performers(sample_employees):
    # Get all high performers
    high_perf = [e for e in sample_employees
                 if e.performance == PerformanceLevel.HIGH]

    # Filter by location
    usa_employees = [e for e in sample_employees
                     if e.location == "USA"]

    # Find employees with flags
    flagged = [e for e in sample_employees
               if e.flags and "flight_risk" in e.flags]
```

### Calculate Expected Values
```python
def test_statistics(sample_employees):
    # Don't hard-code expected counts
    # Calculate from data instead

    expected_high = sum(1 for e in sample_employees
                       if e.performance == PerformanceLevel.HIGH)

    stats = calculate_statistics(sample_employees)
    assert stats["high_performers"] == expected_high
```

### Use First N Employees
```python
def test_with_subset(sample_employees):
    # Use first 5 employees if you need a small subset
    small_set = sample_employees[:5]

    # Test with subset
    result = process_employees(small_set)
    assert len(result) == 5
```

### Find Specific Employee
```python
def test_specific_employee(sample_employees):
    # Find by attribute, not by ID
    manager = next(e for e in sample_employees
                   if e.job_level == "MT1")

    # Get their direct reports
    reports = [e for e in sample_employees
               if e.manager == manager.name]
```

## Rich Fixture Features

All rich fixtures include:

### Organizational Hierarchy
- 6 management levels (MT1-MT6)
- Complete management chains (chain_04, chain_05, chain_06)
- Realistic span of control (5-15 direct reports)
- No orphaned employees

### Performance History
- 3 years of historical ratings (2023, 2024, 2025)
- 80% have complete history
- 20% have gaps (new hires)
- Rating variance (some improve, some decline, some stable)

### Distribution
- All 9 grid positions represented
- All 8 flag types distributed (10-20% of employees)
- Multiple locations: USA, CAN, GBR, DEU, FRA, IND, AUS, SGP
- Multiple functions: Engineering, Product, Sales, Marketing, Operations, Design, Data, HR

### Statistical Bias Patterns
When `include_bias=True` (default):
- USA location: +15% high performers
- Sales function: +20% high performers
- Detectable with chi-square tests

### Reproducibility
- Fixed seed (42) ensures consistent data
- Same employees generated every run
- Predictable for debugging

## Anti-Patterns (Don't Do This)

### ❌ Hard-code Employee IDs
```python
# BAD
employee = next(e for e in sample_employees if e.employee_id == 1)

# GOOD
employee = next(e for e in sample_employees
                if e.performance == PerformanceLevel.HIGH)
```

### ❌ Hard-code Counts
```python
# BAD
assert len(sample_employees) == 5  # Will fail!

# GOOD
assert len(sample_employees) == 50
# or
assert len(sample_employees) > 0
```

### ❌ Use Deprecated Functions
```python
# BAD
from tests.conftest import create_test_employee  # Deprecated!

# GOOD
from tests.conftest import create_simple_test_employee
```

### ❌ Create Custom Generators
```python
# BAD - Don't create your own employee generators
def my_custom_generator():
    return [Employee(...) for i in range(100)]

# GOOD - Use provided fixtures
def test_something(rich_sample_employees_medium):
    # Already have 100 realistic employees
    pass
```

## Examples by Test Type

### Unit Test (Single Employee)
```python
from tests.conftest import create_simple_test_employee

def test_employee_validation():
    employee = create_simple_test_employee(
        employee_id=999,
        performance=PerformanceLevel.HIGH
    )

    result = validate_employee(employee)
    assert result.is_valid
```

### Integration Test (Multiple Employees)
```python
def test_grid_operations(sample_employees):
    # Work with 50 realistic employees
    grid = create_grid(sample_employees)

    assert grid.total_employees == 50
    assert all(pos in range(1, 10) for pos in grid.positions)
```

### Statistics Test (Need Statistical Significance)
```python
def test_bias_detection(rich_sample_employees_medium):
    # 100 employees with bias patterns
    stats = calculate_statistics(rich_sample_employees_medium)

    # Can detect USA location bias (+15%)
    usa_employees = [e for e in rich_sample_employees_medium
                     if e.location == "USA"]
    bias = detect_bias(usa_employees, rich_sample_employees_medium)

    assert bias.is_significant
    assert bias.location == "USA"
```

### Performance Test (Large Dataset)
```python
def test_export_performance(rich_sample_employees_large, benchmark):
    # Test with 200 employees
    result = benchmark(export_to_excel, rich_sample_employees_large)

    assert result.success
    assert result.duration < 2.0  # Should complete in <2 seconds
```

## Migration from Old Fixtures

If you have tests using old fixtures:

```python
# Old (hard-coded 5 employees)
def test_old_way():
    employees = [
        Employee(employee_id=1, name="Alice", ...),
        Employee(employee_id=2, name="Bob", ...),
        # ...
    ]
    assert len(employees) == 5

# New (rich generated data)
def test_new_way(sample_employees):
    # Get 50 realistic employees
    assert len(sample_employees) == 50

    # Calculate expected values from data
    expected = sum(1 for e in sample_employees
                   if e.performance == PerformanceLevel.HIGH)

    # Test with actual data
    result = process_employees(sample_employees)
    assert result.high_performers == expected
```

See [FIXTURE_MIGRATION.md](FIXTURE_MIGRATION.md) for complete migration guide.

## Need Help?

- **Full Migration Guide:** [FIXTURE_MIGRATION.md](FIXTURE_MIGRATION.md)
- **Testing Best Practices:** `internal-docs/testing/`
- **Sample Generator Code:** `backend/src/ninebox/services/sample_data_generator.py`
- **Fixture Definitions:** `backend/tests/conftest.py`

## Quick Commands

```bash
# Run all tests
pytest backend/tests -v

# Run specific test file
pytest backend/tests/unit/services/test_statistics_service.py -v

# Run with coverage
pytest backend/tests --cov=backend/src/ninebox

# Type checking
make type-check

# Linting
make lint
```
