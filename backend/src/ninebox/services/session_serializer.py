"""Session serialization service for database persistence."""

from datetime import datetime, timezone
from typing import Any

from ninebox.models.employee import Employee, HistoricalRating, PerformanceLevel, PotentialLevel
from ninebox.models.session import EmployeeMove, SessionState
from ninebox.services.excel_parser import JobFunctionConfig


class SessionSerializer:
    """Serializes and deserializes session state for database storage.

    Handles conversion between SessionState objects and database-compatible
    dictionaries, including proper serialization of:
    - Pydantic models with enums (PerformanceLevel, PotentialLevel)
    - Datetime objects (ISO format)
    - Nested objects (JobFunctionConfig, Employee, EmployeeMove, HistoricalRating)
    - Optional fields (job_function_config, various employee fields)
    """

    @staticmethod
    def serialize(session: SessionState) -> dict[str, Any]:
        """Convert SessionState to database-compatible dict.

        Uses Pydantic's model_dump() for structured serialization,
        which handles enums, dates, and nested models automatically.

        Args:
            session: SessionState object to serialize

        Returns:
            Dictionary with all fields serialized for database storage.
            Complex objects are converted to JSON-compatible dicts.

        Example:
            >>> session = SessionState(...)
            >>> data = SessionSerializer.serialize(session)
            >>> data['user_id']
            'user123'
            >>> data['created_at']
            '2025-12-18T10:30:00'
        """
        # Use Pydantic's built-in serialization (handles enums, dates, nested models)
        session_dict = session.model_dump(mode="json")

        # Convert datetime to ISO format strings (Pydantic should handle this, but be explicit)
        session_dict["created_at"] = session.created_at.isoformat()

        # Add updated_at timestamp
        session_dict["updated_at"] = datetime.now(timezone.utc).isoformat()

        return session_dict

    @staticmethod
    def deserialize(row: dict[str, Any]) -> SessionState:
        """Convert database row to SessionState.

        Reconstructs SessionState from database dict, including:
        - Parsing ISO datetime strings back to datetime objects
        - Reconstructing Employee objects with HistoricalRating nested objects
        - Reconstructing EmployeeMove objects
        - Reconstructing optional JobFunctionConfig
        - Handling enum values (PerformanceLevel, PotentialLevel)

        Args:
            row: Dictionary from database row with JSON-serialized fields

        Returns:
            Fully reconstructed SessionState object

        Raises:
            ValueError: If required fields are missing or invalid

        Example:
            >>> row = {'user_id': 'user123', 'created_at': '2025-12-18T10:30:00', ...}
            >>> session = SessionSerializer.deserialize(row)
            >>> session.user_id
            'user123'
            >>> isinstance(session.created_at, datetime)
            True
        """
        # Make a copy to avoid mutating the input
        data = dict(row)

        # Parse datetime strings back to datetime objects
        if isinstance(data.get("created_at"), str):
            data["created_at"] = datetime.fromisoformat(data["created_at"])

        # Remove updated_at (not part of SessionState model)
        data.pop("updated_at", None)

        # Parse JSON strings from database if needed
        import json  # noqa: PLC0415

        if isinstance(data.get("job_function_config"), str):
            jfc_json = data["job_function_config"]
            data["job_function_config"] = json.loads(jfc_json) if jfc_json else None

        if isinstance(data.get("original_employees"), str):
            data["original_employees"] = json.loads(data["original_employees"])

        if isinstance(data.get("current_employees"), str):
            data["current_employees"] = json.loads(data["current_employees"])

        if isinstance(data.get("changes"), str):
            data["changes"] = json.loads(data["changes"])

        # Reconstruct JobFunctionConfig if present
        if data.get("job_function_config") is not None:
            jfc_data = data["job_function_config"]
            if isinstance(jfc_data, dict):
                data["job_function_config"] = JobFunctionConfig(**jfc_data)

        # Reconstruct Employee objects with nested HistoricalRating
        if "original_employees" in data:
            data["original_employees"] = [
                SessionSerializer._deserialize_employee(emp_data)
                for emp_data in data["original_employees"]
            ]

        if "current_employees" in data:
            data["current_employees"] = [
                SessionSerializer._deserialize_employee(emp_data)
                for emp_data in data["current_employees"]
            ]

        # Reconstruct EmployeeMove objects
        if "changes" in data:
            data["changes"] = [
                SessionSerializer._deserialize_employee_move(move_data)
                for move_data in data["changes"]
            ]

        # Use Pydantic's model_validate to reconstruct SessionState
        return SessionState.model_validate(data)

    @staticmethod
    def _deserialize_employee(emp_data: dict[str, Any]) -> Employee:
        """Reconstruct Employee object from dict.

        Handles:
        - Converting date strings to date objects
        - Converting datetime strings to datetime objects
        - Converting enum strings to enum values
        - Reconstructing HistoricalRating objects

        Args:
            emp_data: Dictionary with employee data

        Returns:
            Reconstructed Employee object
        """
        # Make a copy to avoid mutating input
        data = dict(emp_data)

        # Parse date strings (hire_date)
        if isinstance(data.get("hire_date"), str):
            # Parse ISO format date string (handles both date and datetime formats)
            date_str = data["hire_date"]
            data["hire_date"] = datetime.fromisoformat(date_str.replace("Z", "+00:00")).date()

        # Parse datetime strings (last_modified)
        if isinstance(data.get("last_modified"), str):
            data["last_modified"] = datetime.fromisoformat(data["last_modified"])

        # Convert enum strings to enum values (Pydantic should handle this, but be explicit)
        if isinstance(data.get("performance"), str):
            data["performance"] = PerformanceLevel(data["performance"])

        if isinstance(data.get("potential"), str):
            data["potential"] = PotentialLevel(data["potential"])

        # Reconstruct HistoricalRating objects
        if data.get("ratings_history"):
            data["ratings_history"] = [
                HistoricalRating(**rating_data) for rating_data in data["ratings_history"]
            ]

        # Use Pydantic's model_validate to reconstruct Employee
        return Employee.model_validate(data)

    @staticmethod
    def _deserialize_employee_move(move_data: dict[str, Any]) -> EmployeeMove:
        """Reconstruct EmployeeMove object from dict.

        Handles:
        - Converting datetime strings to datetime objects
        - Converting enum strings to enum values

        Args:
            move_data: Dictionary with employee move data

        Returns:
            Reconstructed EmployeeMove object
        """
        # Make a copy to avoid mutating input
        data = dict(move_data)

        # Parse datetime strings
        if isinstance(data.get("timestamp"), str):
            data["timestamp"] = datetime.fromisoformat(data["timestamp"])

        # Convert enum strings to enum values
        if isinstance(data.get("old_performance"), str):
            data["old_performance"] = PerformanceLevel(data["old_performance"])

        if isinstance(data.get("old_potential"), str):
            data["old_potential"] = PotentialLevel(data["old_potential"])

        if isinstance(data.get("new_performance"), str):
            data["new_performance"] = PerformanceLevel(data["new_performance"])

        if isinstance(data.get("new_potential"), str):
            data["new_potential"] = PotentialLevel(data["new_potential"])

        # Use Pydantic's model_validate to reconstruct EmployeeMove
        return EmployeeMove.model_validate(data)
