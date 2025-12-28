"""Root conftest for all tests."""

import os
import tempfile
from collections.abc import Generator
from datetime import date, datetime, timezone
from pathlib import Path

import openpyxl
import pytest
from fastapi.testclient import TestClient

from ninebox.models.constants import ALLOWED_FLAGS
from ninebox.models.employee import Employee, HistoricalRating, PerformanceLevel, PotentialLevel
from ninebox.models.grid_positions import get_position_label_by_number


def create_test_employee(
    employee_id: int = 1,
    name: str = "Alice",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
    flags: list[str] | None = None,
    grid_position: int = 5,
) -> Employee:
    """Create a minimal Employee for testing with all required fields.

    Args:
        employee_id: Employee ID (default: 1)
        name: Employee name (default: "Alice")
        performance: Performance level (default: MEDIUM)
        potential: Potential level (default: MEDIUM)
        flags: Employee flags, must be from ALLOWED_FLAGS (default: None)
        grid_position: Grid position 1-9 (default: 5)

    Returns:
        Employee object with all required fields populated
    """
    return Employee(
        employee_id=employee_id,
        name=name,
        business_title="Test Title",
        job_title="Test Job",
        job_profile="Test ProfileUSA",
        job_level="MT4",
        job_function="Other",
        location="USA",
        manager="Test Manager",
        hire_date=date(2020, 1, 1),
        tenure_category="3-5 years",
        time_in_job_profile="2 years",
        performance=performance,
        potential=potential,
        grid_position=grid_position,
        talent_indicator="Solid Contributor",
        flags=flags,
    )


@pytest.fixture(scope="session")
def test_db_path(request: pytest.FixtureRequest) -> Generator[str, None, None]:
    """Create a temporary database for testing.

    Supports pytest-xdist by creating separate database files per worker.
    """
    # Get worker ID for parallel test execution (pytest-xdist)
    worker_id = getattr(request.config, 'workerinput', {}).get('workerid', 'master')

    # Create a temporary directory for this worker's database
    temp_dir = tempfile.mkdtemp(suffix=f"_{worker_id}_ninebox_test")
    db_path = os.path.join(temp_dir, "ninebox.db")

    # Save original environment variables so we can restore them
    # This is critical for VSCode pytest extension communication
    original_app_data_dir = os.environ.get("APP_DATA_DIR")
    original_database_path = os.environ.get("DATABASE_PATH")

    # Set APP_DATA_DIR so get_user_data_dir() returns our test directory
    # This ensures DatabaseManager uses the test database
    os.environ["APP_DATA_DIR"] = temp_dir
    # Also set DATABASE_PATH for any legacy code that might use it
    os.environ["DATABASE_PATH"] = db_path

    yield db_path

    # Restore original environment variables FIRST (important for VSCode extension)
    if original_app_data_dir is None:
        os.environ.pop("APP_DATA_DIR", None)
    else:
        os.environ["APP_DATA_DIR"] = original_app_data_dir

    if original_database_path is None:
        os.environ.pop("DATABASE_PATH", None)
    else:
        os.environ["DATABASE_PATH"] = original_database_path

    # Then cleanup files
    try:
        if os.path.exists(db_path):  # noqa: PTH110
            os.unlink(db_path)  # noqa: PTH108
    except Exception:
        pass  # Ignore cleanup errors

    try:
        if os.path.exists(temp_dir):  # noqa: PTH110
            import shutil  # noqa: PLC0415
            shutil.rmtree(temp_dir)  # Remove directory and any remaining contents
    except Exception:
        pass  # Ignore cleanup errors


@pytest.fixture(autouse=True)
def setup_test_db() -> Generator[None, None, None]:
    """Clean up in-memory state and database before and after each test.

    This fixture clears dependency injection caches, in-memory state,
    and database sessions to ensure tests start with a clean slate.

    Note: Integration tests use transaction-based isolation (see integration/conftest.py),
    so this database cleanup only affects unit tests.
    """
    import gc  # noqa: PLC0415

    # BEFORE test: ensure clean state for xdist robustness
    from ninebox.core.dependencies import get_session_manager, get_db_manager  # noqa: PLC0415

    # Clear caches BEFORE test to ensure fresh instances
    try:
        get_session_manager.cache_clear()
        get_db_manager.cache_clear()
    except Exception:
        pass

    # Clear session manager state
    try:
        mgr = get_session_manager()
        mgr._sessions_loaded = False
        mgr._sessions.clear()
    except Exception:
        pass

    # Force garbage collection before test
    try:
        gc.collect()
    except Exception:
        pass

    yield

    # AFTER test: Clean up openpyxl state to prevent NumberFormat pollution
    try:
        # Force garbage collection to clean up any lingering workbook references
        # This helps prevent openpyxl's NumberFormat registry from getting polluted
        gc.collect()
    except Exception:
        pass

    # AFTER test: Clean up in-memory state from dependency injection cache
    # Reset session manager's in-memory state
    try:
        mgr = get_session_manager()
        mgr._sessions_loaded = False  # Reset lazy loading flag
        mgr._sessions.clear()  # Clear in-memory session cache
    except Exception:
        pass  # If manager doesn't exist yet, that's fine

    # Clear the lru_cache to get fresh instances for next test
    try:
        get_session_manager.cache_clear()
        get_db_manager.cache_clear()
    except Exception:
        pass

    # Clear database sessions (for unit tests that use test_client)
    # Integration tests handle this via transaction rollback
    # Note: Integration tests patch get_connection, so this cleanup may be a no-op for them
    from ninebox.services.database import DatabaseManager  # noqa: PLC0415

    try:
        temp_db = DatabaseManager()
        # Use a fresh connection that bypasses any patches
        # This ensures cleanup works even if DatabaseManager.get_connection is patched
        with temp_db.get_connection() as conn:
            conn.execute("DELETE FROM sessions")
    except Exception:
        # Ignore errors during cleanup (e.g., if database doesn't exist, is patched, or transaction-controlled)
        pass

    # Final garbage collection after all cleanup
    try:
        gc.collect()
    except Exception:
        pass


@pytest.fixture
def sample_employees() -> list[Employee]:
    """Create sample employee data for testing."""
    return [
        Employee(
            employee_id=1,
            name="Alice Smith",
            business_title="Senior Engineer",
            job_title="Software Engineer",
            job_profile="Software EngineeringUSA",
            job_level="MT4",
            job_function="Other",
            location="USA",
            manager="Bob Manager",
            management_chain_04="Bob Manager",
            management_chain_05="Carol Director",
            management_chain_06=None,
            hire_date=date(2020, 1, 15),
            tenure_category="3-5 years",
            time_in_job_profile="2 years",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.HIGH,
            grid_position=9,
            position_label="Star [H,H]",
            talent_indicator="High Potential",
            ratings_history=[
                HistoricalRating(year=2023, rating="Strong"),
                HistoricalRating(year=2024, rating="Leading"),
            ],
            development_focus="Leadership skills",
            development_action="Executive coaching",
            notes="Top performer",
            promotion_status="Ready now",
            modified_in_session=False,
        ),
        Employee(
            employee_id=2,
            name="Bob Jones",
            business_title="Engineer",
            job_title="Software Engineer",
            job_profile="Software EngineeringCAN",
            job_level="MT2",
            job_function="Other",
            location="CAN",
            manager="Bob Manager",
            management_chain_04="Bob Manager",
            management_chain_05="Carol Director",
            management_chain_06=None,
            hire_date=date(2021, 6, 1),
            tenure_category="1-3 years",
            time_in_job_profile="1 year",
            performance=PerformanceLevel.MEDIUM,
            potential=PotentialLevel.MEDIUM,
            grid_position=5,
            position_label="Core Talent [M,M]",
            talent_indicator="Solid Contributor",
            ratings_history=[HistoricalRating(year=2024, rating="Solid")],
            development_focus=None,
            development_action=None,
            notes=None,
            promotion_status=None,
            modified_in_session=False,
        ),
        Employee(
            employee_id=3,
            name="Carol Williams",
            business_title="Junior Engineer",
            job_title="Software Engineer",
            job_profile="Software EngineeringGBR",
            job_level="MT1",
            job_function="Other",
            location="GBR",
            manager="Dave Lead",
            management_chain_04="Dave Lead",
            management_chain_05="Carol Director",
            management_chain_06=None,
            hire_date=date(2023, 1, 10),
            tenure_category="0-1 year",
            time_in_job_profile="6 months",
            performance=PerformanceLevel.LOW,
            potential=PotentialLevel.HIGH,
            grid_position=7,
            position_label="Enigma [L,H]",
            talent_indicator="Emerging",
            ratings_history=[],
            development_focus="Technical skills",
            development_action="Mentorship program",
            notes="New hire, high potential",
            promotion_status=None,
            modified_in_session=False,
        ),
        Employee(
            employee_id=4,
            name="David Brown",
            business_title="Staff Engineer",
            job_title="Staff Software Engineer",
            job_profile="Software EngineeringUSA",
            job_level="MT5",
            job_function="Other",
            location="USA",
            manager="Eve VP",
            management_chain_04="Eve VP",
            management_chain_05=None,
            management_chain_06=None,
            hire_date=date(2018, 3, 20),
            tenure_category="5+ years",
            time_in_job_profile="3 years",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.MEDIUM,
            grid_position=6,
            position_label="High Impact [H,M]",
            talent_indicator="High Impact",
            ratings_history=[
                HistoricalRating(year=2023, rating="Strong"),
                HistoricalRating(year=2024, rating="Strong"),
            ],
            development_focus=None,
            development_action=None,
            notes=None,
            promotion_status="In consideration",
            modified_in_session=False,
        ),
        Employee(
            employee_id=5,
            name="Eve Davis",
            business_title="Product Manager",
            job_title="Product Manager",
            job_profile="Product ManagementUSA",
            job_level="MT4",
            job_function="Product Management",
            location="USA",
            manager="Frank Director",
            management_chain_04="Frank Director",
            management_chain_05="Carol Director",
            management_chain_06=None,
            hire_date=date(2019, 9, 15),
            tenure_category="3-5 years",
            time_in_job_profile="2 years",
            performance=PerformanceLevel.MEDIUM,
            potential=PotentialLevel.HIGH,
            grid_position=8,
            position_label="Growth [M,H]",
            talent_indicator="Growth",
            ratings_history=[HistoricalRating(year=2024, rating="Solid")],
            development_focus="Strategic thinking",
            development_action="Leadership training",
            notes=None,
            promotion_status=None,
            modified_in_session=False,
        ),
    ]


@pytest.fixture
def sample_excel_file(tmp_path: Path, sample_employees: list[Employee]) -> Path:
    """Create a sample Excel file for testing."""
    file_path = tmp_path / "test_employees.xlsx"

    # Create workbook with two sheets
    workbook = openpyxl.Workbook()

    # First sheet (summary/metadata)
    summary_sheet = workbook.active
    summary_sheet.title = "Summary"
    summary_sheet["A1"] = "9-Box Talent Review"
    summary_sheet["A2"] = f"Generated: {datetime.now(timezone.utc).isoformat()}"

    # Second sheet (employee data)
    data_sheet = workbook.create_sheet("Employee Data")

    # Headers
    headers = [
        "Employee ID",
        "Worker",
        "Business Title",
        "Job Title",
        "Job Profile",
        "Job Level - Primary Position",
        "Worker's Manager",
        "Management Chain - Level 04",
        "Management Chain - Level 05",
        "Management Chain - Level 06",
        "Hire Date",
        "Tenure Category (Months)",
        "Time in Job Profile",
        "Aug 2025 Talent Assessment Performance",
        "Aug 2025  Talent Assessment Potential",
        "Aug 2025 Talent Assessment 9-Box Label",
        "Talent Mapping Position [Performance vs Potential]",
        "FY25 Talent Indicator",
        "2023 Completed Performance Rating",
        "2024 Completed Performance Rating",
        "Development Focus",
        "Development Action",
        "Notes",
        "Promotion (In-Line,",
    ]

    for col_idx, header in enumerate(headers, start=1):
        data_sheet.cell(1, col_idx, header)

    # Data rows
    for row_idx, emp in enumerate(sample_employees, start=2):
        data_sheet.cell(row_idx, 1, emp.employee_id)
        data_sheet.cell(row_idx, 2, emp.name)
        data_sheet.cell(row_idx, 3, emp.business_title)
        data_sheet.cell(row_idx, 4, emp.job_title)
        data_sheet.cell(row_idx, 5, emp.job_profile)
        data_sheet.cell(row_idx, 6, emp.job_level)
        data_sheet.cell(row_idx, 7, emp.manager)
        data_sheet.cell(row_idx, 8, emp.management_chain_04)
        data_sheet.cell(row_idx, 9, emp.management_chain_05)
        data_sheet.cell(row_idx, 10, emp.management_chain_06)
        data_sheet.cell(row_idx, 11, emp.hire_date.isoformat() if emp.hire_date else None)
        data_sheet.cell(row_idx, 12, emp.tenure_category)
        data_sheet.cell(row_idx, 13, emp.time_in_job_profile)
        data_sheet.cell(row_idx, 14, emp.performance.value)
        data_sheet.cell(row_idx, 15, emp.potential.value)
        data_sheet.cell(row_idx, 16, emp.grid_position)
        data_sheet.cell(row_idx, 17, get_position_label_by_number(emp.grid_position))
        data_sheet.cell(row_idx, 18, emp.talent_indicator)

        # Historical ratings
        if len(emp.ratings_history) > 0 and emp.ratings_history[0].year == 2023:
            data_sheet.cell(row_idx, 19, emp.ratings_history[0].rating)
        if len(emp.ratings_history) > 0:
            for rating in emp.ratings_history:
                if rating.year == 2024:
                    data_sheet.cell(row_idx, 20, rating.rating)

        data_sheet.cell(row_idx, 21, emp.development_focus)
        data_sheet.cell(row_idx, 22, emp.development_action)
        data_sheet.cell(row_idx, 23, emp.notes)
        data_sheet.cell(row_idx, 24, emp.promotion_status)

    workbook.save(file_path)
    workbook.close()  # Explicitly close to prevent openpyxl state pollution
    return file_path


@pytest.fixture
def test_client(test_db_path: str) -> TestClient:
    """Create a FastAPI test client."""
    # Import app after database path is set
    # Patch database path for testing
    import ninebox.core.database as db_module  # noqa: PLC0415
    from ninebox.main import app  # noqa: PLC0415

    original_get_db_path = db_module.get_db_path

    def mock_get_db_path() -> Path:
        return Path(test_db_path)

    db_module.get_db_path = mock_get_db_path

    client = TestClient(app)

    yield client

    # Restore original function
    db_module.get_db_path = original_get_db_path


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Get authentication headers for testing.

    Note: This app is local-only without authentication.
    This fixture returns empty headers for backward compatibility.
    """
    return {}
