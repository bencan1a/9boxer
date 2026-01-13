# Test Suite Organization Summary

## Overview

The backend tests are organized into 4 distinct suites using **folder structure** and pytest markers. This enables:
- ✅ Natural grouping in VS Code Test Explorer
- ✅ Running specific test types independently (by folder or marker)
- ✅ Faster CI/CD pipelines (run only relevant tests)
- ✅ Clear understanding of test coverage

## Test Suite Breakdown

| Suite | Folder | Marker | Tests | Speed | Purpose |
|-------|--------|--------|-------|-------|---------|
| **Unit** | `backend/tests/unit/` | `@pytest.mark.unit` | ~293 | Fast (ms) | Individual functions/classes in isolation |
| **Integration** | `backend/tests/integration/` | `@pytest.mark.integration` | ~39 | Medium (sec) | Multiple components working together |
| **E2E** | `backend/tests/e2e/` | `@pytest.mark.e2e` | ~16 | Slow (min) | Full frozen executable workflows |
| **Performance** | `backend/tests/performance/` | `@pytest.mark.performance` | ~24 | Slow (min) | Benchmarks and performance regression tests |
| **Total** | | | **~372** | | |

## File Organization

Tests are now organized by **suite type first**, then by component:

```
backend/tests/
├── unit/                    # Fast isolated tests (~293 tests)
│   ├── api/                 # API endpoint tests (FastAPI TestClient)
│   │   ├── test_employees.py
│   │   ├── test_intelligence.py
│   │   ├── test_session.py
│   │   └── test_statistics.py
│   ├── core/                # Core functionality tests
│   │   ├── test_config.py
│   │   └── test_database.py
│   ├── models/              # Data model tests
│   │   └── test_filters.py
│   ├── services/            # Service layer tests
│   │   ├── test_employee_service.py
│   │   ├── test_excel_exporter.py
│   │   ├── test_excel_parser.py
│   │   ├── test_intelligence_service.py
│   │   ├── test_session_manager.py
│   │   └── test_statistics_service.py
│   └── utils/               # Utility function tests
│       ├── test_paths.py
│       └── test_query_parsing.py
├── integration/             # Multi-component tests (~39 tests)
│   ├── test_cross_module_integration.py
│   ├── test_e2e.py
│   ├── test_end_to_end_persistence.py
│   ├── test_intelligence_integration.py
│   ├── test_session_integration.py
│   └── test_session_restore.py
├── e2e/                     # Frozen executable tests (~16 tests)
│   └── test_frozen.py
└── performance/             # Benchmark tests (~24 tests)
    ├── test_api_performance.py
    ├── test_concurrent_performance.py
    └── test_service_performance.py
```

## Running Test Suites

### By Folder (Recommended - Natural VS Code Integration)

```bash
# Run specific suite
pytest backend/tests/unit           # ~293 fast unit tests
pytest backend/tests/integration    # ~39 integration tests
pytest backend/tests/e2e            # ~16 e2e tests (requires built executable)
pytest backend/tests/performance    # ~24 performance benchmarks

# Run specific component within unit tests
pytest backend/tests/unit/api       # All API unit tests
pytest backend/tests/unit/services  # All service unit tests

# Run with verbose output
pytest backend/tests/unit -v
```

### By Marker (Alternative - Backward Compatible)

```bash
# Run specific suite by marker
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
pytest -m e2e               # E2E tests only
pytest -m performance       # Performance tests only

# Fast tests only (CI/PR checks)
pytest -m "not slow"
```

### VS Code Test Explorer

Tests now appear naturally organized by suite in VS Code:

```
📦 9boxer > backend > tests
├── 📁 unit (~293 tests) ⚡ FAST
│   ├── 📁 api
│   ├── 📁 core
│   ├── 📁 models
│   ├── 📁 services
│   └── 📁 utils
├── 📁 integration (~39 tests) 🔄 MEDIUM
├── 📁 e2e (~16 tests) 🐌 SLOW
└── 📁 performance (~24 tests) 📊 SLOW
```

**To run a suite in VS Code:**
1. Open Test Explorer (test tube icon in sidebar)
2. Click the play button next to any folder (e.g., `unit/`, `integration/`)
3. Tests in that suite will run

## VS Code Configuration

The project includes VS Code tasks and launch configurations for running test suites:

**Run Test Suite via Tasks (Ctrl+Shift+P → "Tasks: Run Task"):**
- pytest: Run Unit Tests
- pytest: Run Integration Tests
- pytest: Run E2E Tests
- pytest: Run Performance Tests
- pytest: Run Fast Tests Only

**Debug Test Suite (Run and Debug panel, F5):**
- pytest: Debug Unit Tests
- pytest: Debug Integration Tests
- pytest: Debug E2E Tests
- pytest: Debug Performance Tests

See [.vscode/README.md](../../.vscode/README.md) for complete VS Code usage guide.

## Changes Made

1. ✅ Reorganized tests into suite-based folder structure
   - `backend/tests/unit/` (with component subfolders)
   - `backend/tests/integration/`
   - `backend/tests/e2e/`
   - `backend/tests/performance/`
2. ✅ Kept pytest markers for backward compatibility
3. ✅ Updated all documentation (CLAUDE.md, test-suites.md)
4. ✅ Created VS Code tasks and launch configurations
5. ✅ Verified all 372 tests collect successfully

## Benefits

**Before (component-first organization):**
- ❌ VS Code showed flat list of test folders (test_api, test_core, etc.)
- ❌ Harder to distinguish test types
- ❌ Required markers to run specific suites

**After (suite-first organization):**
- ✅ VS Code naturally groups tests by suite type
- ✅ Click folder to run entire suite
- ✅ Clear visual separation of fast vs slow tests
- ✅ Easier to find where new tests should go
- ✅ Still supports marker-based filtering

## Adding New Tests

**Choose the right suite:**
- **Unit test?** → `backend/tests/unit/<component>/test_*.py`
  - Fast, isolated, no external dependencies
  - Uses mocks/fixtures
  - Most new tests go here

- **Integration test?** → `backend/tests/integration/test_*.py`
  - Tests multiple components working together
  - Minimal mocking, uses real services

- **E2E test?** → `backend/tests/e2e/test_*.py`
  - Tests frozen executable
  - Real process lifecycle

- **Performance test?** → `backend/tests/performance/test_*.py`
  - Benchmarks with pytest-benchmark
  - Has performance targets

**Example - Adding a new unit test for a service:**
```bash
# Create in the correct suite folder
backend/tests/unit/services/test_my_new_service.py
```

## References

- **Full guide:** [test-suites.md](./test-suites.md)
- **Test principles:** [test-principles.md](./test-principles.md)
- **Quick reference:** [quick-reference.md](./quick-reference.md)
- **VS Code guide:** [.vscode/README.md](../../.vscode/README.md)
- **Configuration:** [pyproject.toml](../../pyproject.toml)
- **CLAUDE.md:** [CLAUDE_INDEX.md](../../CLAUDE_INDEX.md) - Project overview with test info

---

**Updated:** 2025-12-19
**Organization:** Suite-based folders + markers
**Total tests:** ~372 (293 unit, 39 integration, 16 e2e, 24 performance)
**Collection time:** ~2s
**All tests verified:** ✅
