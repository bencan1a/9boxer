"""FastAPI dependency injection for services.

This module provides dependency injection functions for all services,
replacing global singletons with proper FastAPI dependencies.

Benefits:
- Clean initialization control
- Proper test isolation via dependency overrides
- Easy mocking in tests
- Follows FastAPI best practices
- Better scalability

Usage:
    from fastapi import Depends
    from ninebox.core.dependencies import get_session_manager

    @router.get("/sessions")
    async def list_sessions(
        session_mgr: SessionManager = Depends(get_session_manager)
    ):
        return session_mgr.list_sessions()
"""

import logging
from functools import lru_cache

from fastapi import Depends, HTTPException, status

from ninebox.core.config import settings
from ninebox.models.session import SessionState
from ninebox.services.calibration_summary_service import CalibrationSummaryService
from ninebox.services.database import DatabaseManager
from ninebox.services.employee_service import EmployeeService
from ninebox.services.llm_service import LLMService
from ninebox.services.org_service import OrgService
from ninebox.services.preferences_manager import PreferencesManager
from ninebox.services.session_manager import SessionManager
from ninebox.services.statistics_service import StatisticsService

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"

logger = logging.getLogger(__name__)


@lru_cache
def get_db_manager() -> DatabaseManager:
    """Get or create DatabaseManager singleton.

    Uses @lru_cache to ensure only one instance is created per application lifecycle.
    Can be overridden in tests using app.dependency_overrides.

    Returns:
        DatabaseManager: Singleton database manager instance

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(db: DatabaseManager = Depends(get_db_manager)):
        ...     conn = db.get_connection()
    """
    return DatabaseManager()


@lru_cache
def get_session_manager() -> SessionManager:
    """Get or create SessionManager singleton with injected database manager.

    Uses @lru_cache to ensure only one instance is created per application lifecycle.
    Can be overridden in tests using app.dependency_overrides.

    Injects DatabaseManager instance for proper dependency management.

    Returns:
        SessionManager: Singleton session manager instance with database dependency

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(mgr: SessionManager = Depends(get_session_manager)):
        ...     session = mgr.get_session("user-123")
    """
    db = get_db_manager()
    return SessionManager(db=db)


@lru_cache
def get_employee_service() -> EmployeeService:
    """Get or create EmployeeService singleton.

    Uses @lru_cache to ensure only one instance is created per application lifecycle.
    Can be overridden in tests using app.dependency_overrides.

    Returns:
        EmployeeService: Singleton employee service instance

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(service: EmployeeService = Depends(get_employee_service)):
        ...     filtered = service.filter_employees(employees, levels=["MT4"])
    """
    return EmployeeService()


@lru_cache
def get_statistics_service() -> StatisticsService:
    """Get or create StatisticsService singleton.

    Uses @lru_cache to ensure only one instance is created per application lifecycle.
    Can be overridden in tests using app.dependency_overrides.

    Returns:
        StatisticsService: Singleton statistics service instance

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(service: StatisticsService = Depends(get_statistics_service)):
        ...     stats = service.calculate_distribution(employees)
    """
    return StatisticsService()


@lru_cache
def get_preferences_manager() -> PreferencesManager:
    """Get or create PreferencesManager singleton.

    Uses @lru_cache to ensure only one instance is created per application lifecycle.
    Can be overridden in tests using app.dependency_overrides.

    Returns:
        PreferencesManager: Singleton preferences manager instance

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(mgr: PreferencesManager = Depends(get_preferences_manager)):
        ...     recent = mgr.get_recent_files()
    """
    return PreferencesManager()


@lru_cache
def get_calibration_summary_service() -> CalibrationSummaryService:
    """Get or create CalibrationSummaryService singleton.

    Uses @lru_cache to ensure only one instance is created per application lifecycle.
    Can be overridden in tests using app.dependency_overrides.

    Returns:
        CalibrationSummaryService: Singleton calibration summary service instance

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(service: CalibrationSummaryService = Depends(get_calibration_summary_service)):
        ...     summary = service.calculate_summary(employees)
    """
    return CalibrationSummaryService()


@lru_cache
def get_llm_service() -> LLMService:
    """Get or create LLMService singleton.

    Uses @lru_cache to ensure only one instance is created per application lifecycle.
    Can be overridden in tests using app.dependency_overrides.

    Loads API key and model from settings (which reads from .env file).

    Returns:
        LLMService: Singleton LLM service instance

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(service: LLMService = Depends(get_llm_service)):
        ...     if service.is_available()["available"]:
        ...         summary = service.generate_summary(...)
    """
    return LLMService(api_key=settings.anthropic_api_key, model=settings.llm_model)


def get_validated_session(
    session_mgr: SessionManager = Depends(get_session_manager),  # noqa: B008
) -> SessionState:
    """Dependency to get and validate session with employee data.

    Validates that:
    1. A session exists for the local user
    2. The session contains employee data (current_employees is not empty)

    This dependency extracts the common session validation logic used across
    multiple endpoints, particularly in the org-hierarchy API.

    Args:
        session_mgr: SessionManager dependency (injected by FastAPI)

    Returns:
        Session: Validated session object with employee data

    Raises:
        HTTPException: 404 if no active session found
        HTTPException: 400 if session exists but contains no employee data

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(session: SessionState = Depends(get_validated_session)):
        ...     employees = session.current_employees  # guaranteed to be non-empty
    """
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        logger.error(f"OrgHierarchy: No session found for user_id={LOCAL_USER_ID}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found. Please upload an Excel file first.",
        )

    if not session.current_employees:
        logger.error("OrgHierarchy: Session exists but current_employees is EMPTY")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session exists but contains no employee data. Please reload your Excel file.",
        )

    return session


def get_org_service(
    session: SessionState = Depends(get_validated_session),  # noqa: B008
) -> OrgService:
    """Dependency to get OrgService initialized with session employees.

    Creates an OrgService instance initialized with the current employees from
    the validated session. Validation is disabled to handle test data with
    incomplete org structures.

    This dependency extracts the common OrgService initialization logic used
    across multiple endpoints in the org-hierarchy API.

    Args:
        session: Validated session (injected by get_validated_session)

    Returns:
        OrgService: Initialized org service with session employees

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(org_service: OrgService = Depends(get_org_service)):
        ...     managers = org_service.find_managers(min_team_size=5)
    """
    return OrgService(session.current_employees, validate=False)
