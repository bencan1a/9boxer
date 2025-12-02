# Backend Testing Guide

## Quick Start

### Install Dependencies
```bash
cd backend
pip install -e ".[dev]"
```

### Run All Tests
```bash
pytest
```

### Run with Coverage
```bash
pytest --cov=src/ninebox --cov-report=term --cov-report=html
```

## Test Commands

| Command | Description |
|---------|-------------|
| `pytest` | Run all tests |
| `pytest -v` | Run with verbose output |
| `pytest -q` | Run with quiet output |
| `pytest -x` | Stop on first failure |
| `pytest --lf` | Run last failed tests |
| `pytest --ff` | Run failures first |
| `pytest -k "auth"` | Run tests matching "auth" |
| `pytest tests/test_api/` | Run specific directory |
| `pytest tests/test_api/test_auth.py` | Run specific file |

## Test Structure

```
tests/
├── conftest.py                    # Shared fixtures and configuration
├── test_api/                      # API endpoint tests (50 tests)
│   ├── test_auth.py              # Authentication (11 tests)
│   ├── test_employees.py         # Employee operations (17 tests)
│   ├── test_session.py           # Session management (10 tests)
│   └── test_statistics.py        # Statistics (12 tests)
├── test_services/                 # Service layer tests (62 tests)
│   ├── test_employee_service.py  # Employee filtering (16 tests)
│   ├── test_excel_exporter.py    # Excel export (12 tests)
│   ├── test_excel_parser.py      # Excel parsing (10 tests)
│   ├── test_session_manager.py   # Session management (12 tests)
│   └── test_statistics_service.py # Statistics (12 tests)
└── test_integration/              # Integration tests (6 tests)
    └── test_e2e.py               # End-to-end workflows
```

## Coverage Report

Current coverage: **92%**

View detailed coverage:
```bash
pytest --cov=src/ninebox --cov-report=html
open htmlcov/index.html  # macOS/Linux
start htmlcov/index.html  # Windows
```

## Test Fixtures

Available fixtures in `conftest.py`:
- `test_db_path` - Temporary test database
- `sample_employees` - List of 5 test employees
- `sample_excel_file` - Generated Excel file with test data
- `test_client` - FastAPI test client
- `auth_headers` - Authentication headers with valid token

## Writing New Tests

### Test Naming Convention
```python
def test_<function>_when_<condition>_then_<expected>():
    """Test description."""
    # Arrange
    # Act
    # Assert
```

### Example Test
```python
def test_login_when_valid_credentials_then_returns_token(test_client):
    """Test POST /api/auth/login with valid credentials."""
    response = test_client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
```

## Debugging Tests

### Run specific test with output
```bash
pytest tests/test_api/test_auth.py::test_login_when_valid_credentials_then_returns_token -v -s
```

### Show local variables on failure
```bash
pytest -l
```

### Enter debugger on failure
```bash
pytest --pdb
```

## CI/CD Integration

Tests run automatically on:
- Every commit (if configured)
- Pull requests
- Before deployment

Ensure all tests pass before merging:
```bash
pytest --cov=src/ninebox --cov-report=term --cov-fail-under=80
```

## Troubleshooting

### Module not found errors
```bash
pip install -e ".[dev]"
```

### Database locked errors
- Tests use temporary database
- Cleaned up automatically between tests
- If issues persist, delete `data/ninebox.db`

### Session persistence between tests
- Sessions are cleared in `conftest.py` after each test
- Each test runs in isolation

## Test Statistics

- **Total Tests**: 119
- **Unit Tests**: 62
- **API Tests**: 50
- **Integration Tests**: 6
- **Code Coverage**: 92%
- **Lines of Test Code**: ~2,270

## Additional Resources

- See `TEST_SUMMARY.md` for detailed test documentation
- See `pyproject.toml` for pytest configuration
- See individual test files for examples
