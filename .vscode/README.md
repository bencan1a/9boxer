# VS Code Test Suite Configuration

## Running Test Suites in VS Code

VS Code's Test Explorer shows tests by **folder structure**, not by pytest markers. However, you can still run specific test suites using the configurations provided.

## Method 1: Tasks (Recommended)

**Run specific test suites via Command Palette:**

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Select one of:
   - **pytest: Run Unit Tests** - Fast unit tests only (260 tests)
   - **pytest: Run Integration Tests** - Integration tests (44 tests)
   - **pytest: Run E2E Tests** - End-to-end frozen executable tests (36 tests)
   - **pytest: Run Performance Tests** - Benchmark tests (44 tests)
   - **pytest: Run Fast Tests Only** - All tests except slow ones
   - **pytest: Run All Tests** - All 384 tests

## Method 2: Debug Configurations

**Debug specific test suites:**

1. Go to the "Run and Debug" panel (Ctrl+Shift+D)
2. Select a configuration from the dropdown:
   - **pytest: Debug Unit Tests**
   - **pytest: Debug Integration Tests**
   - **pytest: Debug E2E Tests**
   - **pytest: Debug Performance Tests**
   - **pytest: Debug Current File**
3. Press F5 to start debugging

## Method 3: Terminal (Command Line)

**Run from integrated terminal:**

```bash
# Activate venv first
.venv\Scripts\activate  # Windows
# or
. .venv/bin/activate    # Mac/Linux

# Run specific suite
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
pytest -m e2e               # E2E tests only
pytest -m performance       # Performance tests only

# Fast tests only (for quick checks)
pytest -m "not slow"

# Verbose output
pytest -m unit -v
```

## Method 4: Test Explorer Filtering

**While the Test Explorer doesn't group by markers, you can filter tests:**

1. Open Test Explorer (Testing icon in sidebar)
2. Use the search box at the top to filter:
   - Type `test_api` to see only API tests
   - Type `test_integration` to see integration tests
   - Type `test_performance` to see performance tests
   - Type `test_frozen` to see E2E tests

## Method 5: Run Individual Tests

**Right-click on any test in the Test Explorer:**
- Click the play button to run
- Click the debug icon to debug
- The test will run with its assigned markers automatically

## Why Doesn't Test Explorer Show Markers?

VS Code's Python test extension groups tests by **file/folder hierarchy** only. Pytest markers are used for:
- **Filtering** which tests to run (via `-m` flag)
- **CI/CD** pipeline organization
- **Selective execution** based on test type

The markers are still valuable - they just don't create visual groups in the UI.

## Test Suite Breakdown

| Folder/File | Marker | Count | Type |
|-------------|--------|-------|------|
| `test_api/`, `test_core/`, `test_models/`, `test_services/`, `test_utils/` | `unit` | 260 | Fast isolated tests |
| `test_integration/` | `integration` | 44 | Multi-component tests |
| `test_frozen.py` | `e2e` | 36 | Full executable tests |
| `test_performance/` | `performance` | 44 | Benchmark tests |

## Keyboard Shortcuts

You can create custom keyboard shortcuts for running test suites:

1. Press `Ctrl+K Ctrl+S` to open Keyboard Shortcuts
2. Search for "Tasks: Run Task"
3. Add a keybinding for your most-used test suite

Example: Bind `Ctrl+Shift+U` to run unit tests.

## Tips

- **Run fast tests often** during development: `pytest -m "not slow"`
- **Run integration tests** before committing: `pytest -m integration`
- **Run full suite** before pushing: `pytest backend/tests`
- **E2E tests require** the frozen executable to be built first

## See Also

- [Test Suite Documentation](../docs/testing/test-suites.md)
- [Test Principles](../docs/testing/test-principles.md)
- [pyproject.toml](../pyproject.toml) - Marker definitions
