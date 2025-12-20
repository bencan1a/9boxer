# Test Suite Organization

The backend tests are organized into distinct suites using **folder structure** and **pytest markers**. This allows you to run specific types of tests independently and makes test organization clear in VS Code's Test Explorer.

## Test Suites

### 1. Unit Tests (`unit`)
**Purpose:** Fast, isolated tests of individual functions and classes
**Location:** `backend/tests/unit/`
- `unit/api/` - API endpoint tests
- `unit/core/` - Core functionality
- `unit/models/` - Data models
- `unit/services/` - Service layer
- `unit/utils/` - Utilities

**Characteristics:**
- No external dependencies (uses mocks/fixtures)
- Fast execution (milliseconds per test)
- Tests single components in isolation
- Uses TestClient for API tests (no real backend process)

**Run unit tests:**
```bash
pytest backend/tests/unit           # By folder (recommended)
pytest -m unit                      # By marker
pytest backend/tests/unit/api       # Specific component
pytest -v backend/tests/unit        # Verbose output
```

**Examples:**
- [unit/services/test_employee_service.py](../../backend/tests/unit/services/test_employee_service.py)
- [unit/models/test_filters.py](../../backend/tests/unit/models/test_filters.py)
- [unit/api/test_employees.py](../../backend/tests/unit/api/test_employees.py)

---

### 2. Integration Tests (`integration`)
**Purpose:** Verify multiple components work together correctly
**Location:** `backend/tests/integration/`
**Characteristics:**
- Tests cross-module interactions
- Uses real components (minimal mocking)
- Slower than unit tests (seconds per test)
- Tests data flow between services

**Run integration tests:**
```bash
pytest backend/tests/integration    # By folder (recommended)
pytest -m integration               # By marker
pytest -v backend/tests/integration # Verbose output
```

**Examples:**
- [integration/test_session_integration.py](../../backend/tests/integration/test_session_integration.py) - Session lifecycle
- [integration/test_cross_module_integration.py](../../backend/tests/integration/test_cross_module_integration.py) - Cross-module interactions
- [integration/test_intelligence_integration.py](../../backend/tests/integration/test_intelligence_integration.py) - Intelligence service with controlled data

---

### 3. End-to-End Tests (`e2e`)
**Purpose:** Test the complete frozen executable with full process lifecycle
**Location:** `backend/tests/e2e/`
**Characteristics:**
- Starts actual PyInstaller executable as subprocess
- Uses real HTTP requests (via `requests` library, not TestClient)
- Tests complete user workflows
- Requires frozen executable to be built first
- Slowest tests (minutes for full suite)

**Build executable first:**
```bash
cd backend
.venv\Scripts\activate  # Windows
.\scripts\build_executable.bat
```

**Run e2e tests:**
```bash
pytest backend/tests/e2e            # By folder (recommended)
pytest -m e2e                       # By marker
pytest -m e2e -v -s                 # With output for debugging
```

**Examples:**
- [e2e/test_frozen.py](../../backend/tests/e2e/test_frozen.py) - All frozen executable tests

---

### 4. Performance Tests (`performance`)
**Purpose:** Benchmark performance and track regressions
**Location:** `backend/tests/performance/`
**Characteristics:**
- Uses pytest-benchmark plugin
- Measures execution time, memory usage
- Has performance targets documented in docstrings
- Slower execution (runs multiple iterations)

**Run performance tests:**
```bash
pytest backend/tests/performance    # By folder (recommended)
pytest -m performance               # By marker
pytest backend/tests/performance --benchmark-only  # Skip non-benchmark tests
```

**Compare performance over time:**
```bash
pytest backend/tests/performance --benchmark-save=baseline
# Make changes...
pytest backend/tests/performance --benchmark-compare=baseline
```

**Examples:**
- [performance/test_service_performance.py](../../backend/tests/performance/test_service_performance.py)
- [performance/test_api_performance.py](../../backend/tests/performance/test_api_performance.py)

---

## Combined Markers

Tests can have multiple markers. For example, all `integration`, `e2e`, and `performance` tests are also marked as `slow`.

### Slow Tests (`slow`)
Tests that take significant time to run.

**Run only fast tests (exclude slow):**
```bash
pytest -m "not slow"
pytest -m "unit and not slow"  # fast unit tests only
```

**Run only slow tests:**
```bash
pytest -m slow
```

---

## Common Test Commands

### Run all tests
```bash
pytest                   # Run all 372 tests
pytest -v                # Verbose output
```

### Run specific suite (by folder - recommended)
```bash
pytest backend/tests/unit           # Unit tests (~293 tests)
pytest backend/tests/integration    # Integration tests (~39 tests)
pytest backend/tests/e2e            # E2E tests (~16 tests)
pytest backend/tests/performance    # Performance tests (~24 tests)
```

### Run specific suite (by marker - alternative)
```bash
pytest -m unit           # Unit tests only
pytest -m integration    # Integration tests only
pytest -m e2e            # E2E tests only
pytest -m performance    # Performance tests only
```

### Run fast tests only (CI/quick check)
```bash
pytest -m "not slow"     # Runs unit tests only
```

### Run by specific component
```bash
pytest backend/tests/unit/api/              # All API unit tests
pytest backend/tests/unit/services/         # All service unit tests
pytest backend/tests/unit/api/test_employees.py  # Specific file
```

### Run specific test
```bash
pytest backend/tests/test_services/test_employee_service.py::test_filter_employees_when_single_level_then_filters_correctly
```

### Run with coverage
```bash
pytest -m unit --cov=backend/src --cov-report=html
```

### Run in parallel (faster)
```bash
pytest -n auto  # requires pytest-xdist
```

---

## VS Code Test Explorer

The test suites appear organized by folder in VS Code's Test Explorer:

```
📦 9boxer > backend > tests
├── 📁 unit (~293 tests)
│   ├── 📁 api/
│   ├── 📁 core/
│   ├── 📁 models/
│   ├── 📁 services/
│   └── 📁 utils/
├── 📁 integration (~39 tests)
├── 📁 e2e (~16 tests)
│   └── test_frozen.py
└── 📁 performance (~24 tests)
```

**VS Code Test Explorer Features:**
- ✅ Tests organized by suite type (folder structure)
- ✅ Click the test tube icon in the sidebar to view
- ✅ Click play button next to any folder to run that suite
- ✅ Filter tests by typing in the search box
- ✅ Debug tests by clicking the debug icon
- ✅ Run individual tests by clicking the play button next to them

---

## Test Naming Conventions

All tests follow this naming pattern:
```
test_function_when_condition_then_expected_result
```

**Examples:**
- `test_filter_employees_when_single_level_then_filters_correctly`
- `test_parse_when_small_file_then_completes_quickly`
- `test_session_when_cleared_then_removes_all_data`

---

## CI/CD Pipeline

The GitHub Actions CI pipeline runs different suites strategically:

1. **Pull Requests:** Smart test selection + fast tests (`-m "not slow"`)
2. **Main branch:** All tests including integration
3. **Nightly:** Full suite including e2e and performance tests

See [ci.yml](../../.github/workflows/ci.yml) for details.

---

## Adding New Tests

When creating new tests, add the appropriate marker:

**Module-level marker (recommended for files with single test type):**
```python
"""Tests for my service."""

import pytest
from myapp.services import MyService

pytestmark = pytest.mark.unit  # All tests in this file are unit tests


def test_my_function_when_valid_input_then_returns_result():
    ...
```

**Function-level marker (for mixed test types):**
```python
@pytest.mark.integration
@pytest.mark.slow
def test_full_workflow_integration():
    ...
```

**Multiple markers:**
```python
pytestmark = [pytest.mark.integration, pytest.mark.slow]
```

---

## Troubleshooting

### Tests not showing in VS Code
1. Ensure pytest is configured in VS Code settings
2. Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Check Python interpreter is set to `.venv`

### "Unknown marker" errors
Markers are defined in [pyproject.toml](../../pyproject.toml). Run:
```bash
pytest --markers  # List all available markers
```

### E2E tests failing
Ensure frozen executable is built:
```bash
cd backend && .\scripts\build_executable.bat
dir dist\ninebox\ninebox.exe  # Should exist
```

### Performance tests failing
Ensure pytest-benchmark is installed:
```bash
pip install pytest-benchmark
```

---

## Reference

- **Pytest markers documentation:** https://docs.pytest.org/en/stable/example/markers.html
- **Project test configuration:** [pyproject.toml](../../pyproject.toml)
- **Test principles:** [test-principles.md](./test-principles.md)
- **Quick reference:** [quick-reference.md](./quick-reference.md)
