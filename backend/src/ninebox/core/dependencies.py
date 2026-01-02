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

from functools import lru_cache

from ninebox.services.calibration_summary_service import CalibrationSummaryService
from ninebox.services.database import DatabaseManager
from ninebox.services.employee_service import EmployeeService
from ninebox.services.llm_service import LLMService
from ninebox.services.preferences_manager import PreferencesManager
from ninebox.services.session_manager import SessionManager
from ninebox.services.statistics_service import StatisticsService


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
    """Get or create SessionManager singleton.

    Uses @lru_cache to ensure only one instance is created per application lifecycle.
    Can be overridden in tests using app.dependency_overrides.

    Returns:
        SessionManager: Singleton session manager instance

    Example:
        >>> from fastapi import Depends
        >>> def my_endpoint(mgr: SessionManager = Depends(get_session_manager)):
        ...     session = mgr.get_session("user-123")
    """
    return SessionManager()


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
    from ninebox.core.config import settings

    return LLMService(api_key=settings.anthropic_api_key, model=settings.llm_model)
