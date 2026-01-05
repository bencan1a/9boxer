"""Additional tests to improve coverage for dependencies module.

This test module specifically targets uncovered code paths in the dependencies module
to meet the 80% coverage requirement for changed files.
"""

import pytest

from ninebox.core.dependencies import (
    get_calibration_summary_service,
    get_db_manager,
    get_employee_service,
    get_llm_service,
    get_org_service,
    get_session_manager,
    get_statistics_service,
    get_validated_session,
)
from ninebox.services.calibration_summary_service import CalibrationSummaryService
from ninebox.services.database import DatabaseManager
from ninebox.services.employee_service import EmployeeService
from ninebox.services.llm_service import LLMService
from ninebox.services.org_service import OrgService
from ninebox.services.session_manager import SessionManager
from ninebox.services.statistics_service import StatisticsService

pytestmark = pytest.mark.unit


def test_get_db_manager_returns_database_manager_instance() -> None:
    """Test that get_db_manager returns a DatabaseManager instance."""
    # Clear cache first
    get_db_manager.cache_clear()

    db = get_db_manager()
    assert isinstance(db, DatabaseManager)

    # Should return same instance on second call (cached)
    db2 = get_db_manager()
    assert db is db2


def test_get_session_manager_returns_session_manager_with_injected_db() -> None:
    """Test that get_session_manager returns SessionManager with injected DatabaseManager."""
    # Clear caches
    get_db_manager.cache_clear()
    get_session_manager.cache_clear()

    manager = get_session_manager()
    assert isinstance(manager, SessionManager)
    assert manager._db is not None
    assert isinstance(manager._db, DatabaseManager)


def test_get_employee_service_returns_employee_service_instance() -> None:
    """Test that get_employee_service returns an EmployeeService instance."""
    # Clear cache first
    get_employee_service.cache_clear()

    service = get_employee_service()
    assert isinstance(service, EmployeeService)


def test_get_statistics_service_returns_statistics_service_instance() -> None:
    """Test that get_statistics_service returns a StatisticsService instance."""
    # Clear cache first
    get_statistics_service.cache_clear()

    service = get_statistics_service()
    assert isinstance(service, StatisticsService)


def test_get_calibration_summary_service_returns_service_instance() -> None:
    """Test that get_calibration_summary_service returns a CalibrationSummaryService instance."""
    # Clear cache first
    get_calibration_summary_service.cache_clear()

    service = get_calibration_summary_service()
    assert isinstance(service, CalibrationSummaryService)


def test_get_llm_service_returns_llm_service_instance() -> None:
    """Test that get_llm_service returns an LLMService instance."""
    # Clear cache first
    get_llm_service.cache_clear()

    service = get_llm_service()
    assert isinstance(service, LLMService)


def test_get_validated_session_when_no_session_then_raises_404(
    test_client,
) -> None:
    """Test that get_validated_session raises 404 when no session exists."""
    from fastapi import HTTPException
    from ninebox.core.dependencies import LOCAL_USER_ID

    # Clear session manager cache
    get_session_manager.cache_clear()

    manager = get_session_manager()

    # Ensure no session exists
    if manager.get_session(LOCAL_USER_ID):
        manager.delete_session(LOCAL_USER_ID)

    # Should raise 404
    with pytest.raises(HTTPException) as exc_info:
        get_validated_session(session_mgr=manager)

    assert exc_info.value.status_code == 404
    assert "No active session found" in exc_info.value.detail


def test_get_validated_session_when_empty_employees_then_raises_400() -> None:
    """Test that get_validated_session raises 400 when session has no employees."""
    from fastapi import HTTPException
    from ninebox.core.dependencies import LOCAL_USER_ID
    from ninebox.models.session import SessionState

    # Clear session manager cache
    get_session_manager.cache_clear()

    manager = get_session_manager()

    # Create a session with no employees
    session = SessionState(
        user_id=LOCAL_USER_ID,
        session_id="test_session",
        created_at="2025-01-01T00:00:00Z",
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Sheet1",
        sheet_index=0,
        job_function_config=None,
        original_employees=[],
        current_employees=[],  # Empty!
        events=[],
        updated_at="2025-01-01T00:00:00Z",
        donut_events=[],
        donut_mode_active=False,
    )

    # Manually add the session to the manager
    manager._sessions[LOCAL_USER_ID] = session
    manager._sessions_loaded = True

    # Should raise 400
    with pytest.raises(HTTPException) as exc_info:
        get_validated_session(session_mgr=manager)

    assert exc_info.value.status_code == 400
    assert "contains no employee data" in exc_info.value.detail


def test_get_org_service_returns_org_service_with_session_employees(
    test_client, session_with_employees
) -> None:
    """Test that get_org_service returns OrgService initialized with session employees."""
    from ninebox.models.session import SessionState

    # Create a mock session with employees
    manager = get_session_manager()
    session = manager.get_session("local-user")

    assert session is not None
    assert len(session.current_employees) > 0

    # Get org service should work with validated session
    org_service = get_org_service(session=session)
    assert isinstance(org_service, OrgService)
