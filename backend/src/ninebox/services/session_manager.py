"""Session management service."""

import copy
import json
import logging
import sqlite3
import uuid
from datetime import datetime

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.grid_positions import calculate_grid_position, get_position_label
from ninebox.models.session import EmployeeMove, SessionState
from ninebox.services.database import db_manager
from ninebox.services.excel_parser import JobFunctionConfig
from ninebox.services.session_serializer import SessionSerializer

logger = logging.getLogger(__name__)


class SessionManager:
    """Manage in-memory AND persistent session state.

    Uses write-through cache pattern:
    - All sessions stored in memory for fast access
    - All mutations automatically persisted to SQLite database
    - Sessions restored from database on startup
    """

    def __init__(self) -> None:
        """Initialize session manager with lazy loading.

        Sessions are not restored from database until first access,
        improving startup time by ~0.85s.
        """
        self._sessions: dict[str, SessionState] = {}
        self._sessions_loaded: bool = False

    @property
    def sessions(self) -> dict[str, SessionState]:
        """Get sessions dict, triggering lazy loading if needed.

        This property ensures sessions are automatically loaded from the database
        on first access, making the API easier to use and preventing test isolation issues.

        Returns:
            Dictionary of user_id -> SessionState
        """
        self._ensure_sessions_loaded()
        return self._sessions

    def _ensure_sessions_loaded(self) -> None:
        """Load sessions from database on first access (lazy loading).

        This method ensures sessions are restored from the database only
        when needed, rather than eagerly on startup. It uses a flag to
        ensure the restoration happens exactly once.
        """
        if not self._sessions_loaded:
            self._restore_sessions()
            self._sessions_loaded = True

    def create_session(
        self,
        user_id: str,
        employees: list[Employee],
        filename: str,
        file_path: str,
        sheet_name: str,
        sheet_index: int,
        job_function_config: JobFunctionConfig | None = None,
        session_id: str | None = None,
    ) -> str:
        """Create new session with uploaded data."""
        session_id = session_id or str(uuid.uuid4())

        # Deep copy employees for original state
        original_employees = copy.deepcopy(employees)
        current_employees = copy.deepcopy(employees)

        session = SessionState(
            session_id=session_id,
            user_id=user_id,
            created_at=datetime.utcnow(),
            original_employees=original_employees,
            original_filename=filename,
            original_file_path=file_path,
            sheet_name=sheet_name,
            sheet_index=sheet_index,
            job_function_config=job_function_config,
            current_employees=current_employees,
            changes=[],
        )

        self._sessions[user_id] = session
        self._persist_session(session)
        return session_id

    def get_session(self, user_id: str) -> SessionState | None:
        """Retrieve session by user ID.

        Sessions are lazily loaded from database on first access.
        """
        self._ensure_sessions_loaded()
        return self.sessions.get(user_id)

    def delete_session(self, user_id: str) -> bool:
        """Delete session from memory AND database.

        Sessions are lazily loaded from database on first access.
        """
        self._ensure_sessions_loaded()
        if user_id in self.sessions:
            self._delete_session_from_db(user_id)
            del self._sessions[user_id]
            return True
        return False

    def move_employee(
        self,
        user_id: str,
        employee_id: int,
        new_performance: PerformanceLevel,
        new_potential: PotentialLevel,
    ) -> EmployeeMove:
        """Update employee position in session.

        Maintains ONE entry per employee in the changes list:
        - If employee already has a change entry: UPDATE it (preserve old_position, update new_position)
        - If employee is new to changes: CREATE new entry
        - If employee is moved back to ORIGINAL position: REMOVE entry entirely

        Sessions are lazily loaded from database on first access.

        Args:
            user_id: User session identifier
            employee_id: Employee to move
            new_performance: New performance level
            new_potential: New potential level

        Returns:
            EmployeeMove: The change entry (either new or updated)

        Raises:
            ValueError: If no active session or employee not found

        Example:
            >>> manager.move_employee("user1", 123, PerformanceLevel.HIGH, PotentialLevel.MEDIUM)
            EmployeeMove(employee_id=123, old_position=1, new_position=8, ...)
        """
        self._ensure_sessions_loaded()
        session = self.sessions.get(user_id)
        if not session:
            raise ValueError("No active session")

        # Find employee
        employee = next(
            (e for e in session.current_employees if e.employee_id == employee_id), None
        )
        if not employee:
            raise ValueError(f"Employee {employee_id} not found")

        # Find original employee to check if position matches original
        original_employee = next(
            (e for e in session.original_employees if e.employee_id == employee_id), None
        )

        # Calculate new position
        new_position = calculate_grid_position(new_performance, new_potential)
        now = datetime.utcnow()

        # Find existing change entry for this employee (one entry per employee)
        existing_change = next((c for c in session.changes if c.employee_id == employee_id), None)

        if existing_change:
            # Update existing entry (preserve original old_position from first move)
            existing_change.new_performance = new_performance
            existing_change.new_potential = new_potential
            existing_change.new_position = new_position
            existing_change.timestamp = now
            change = existing_change
        else:
            # Create new entry
            change = EmployeeMove(
                employee_id=employee_id,
                employee_name=employee.name,
                timestamp=now,
                old_performance=employee.performance,
                old_potential=employee.potential,
                new_performance=new_performance,
                new_potential=new_potential,
                old_position=employee.grid_position,
                new_position=new_position,
                notes=None,
            )
            session.changes.append(change)

        # Update employee
        employee.performance = new_performance
        employee.potential = new_potential
        employee.grid_position = new_position
        employee.position_label = get_position_label(new_performance, new_potential)
        employee.last_modified = now

        # Check if employee is back to original position - if so, remove from changes
        if (
            original_employee
            and employee.performance == original_employee.performance
            and employee.potential == original_employee.potential
        ):
            employee.modified_in_session = False
            # Remove from changes list (employee is back to original)
            session.changes = [c for c in session.changes if c.employee_id != employee_id]
        else:
            employee.modified_in_session = True

        self._persist_session(session)
        return change

    def update_change_notes(self, user_id: str, employee_id: int, notes: str) -> EmployeeMove:
        """Update notes for an employee's change entry.

        Sessions are lazily loaded from database on first access.

        Args:
            user_id: User session identifier
            employee_id: Employee whose notes to update
            notes: Notes text to store

        Returns:
            EmployeeMove: Updated change entry with notes

        Raises:
            ValueError: If no active session or no change entry exists for employee

        Example:
            >>> manager.update_change_notes("user1", 123, "Promoted due to exceptional Q4 performance")
            EmployeeMove(employee_id=123, notes="Promoted due to exceptional Q4 performance", ...)
        """
        self._ensure_sessions_loaded()
        session = self.sessions.get(user_id)
        if not session:
            raise ValueError("No active session")

        # Find change entry for this employee
        change_entry = next((c for c in session.changes if c.employee_id == employee_id), None)
        if not change_entry:
            raise ValueError(f"No change entry found for employee {employee_id}")

        # Update notes
        change_entry.notes = notes
        self._persist_session(session)
        return change_entry

    def _restore_sessions(self) -> None:
        """Restore sessions from database on startup.

        Loads all sessions from the SQLite database and populates the in-memory cache.
        Errors during restoration are logged but do not prevent startup - individual
        sessions that fail to deserialize are skipped.

        Example:
            >>> manager = SessionManager()
            # Logs: "Restored 3 sessions from database"
        """
        try:
            with db_manager.get_connection() as conn:
                cursor = conn.execute("SELECT * FROM sessions")
                rows = cursor.fetchall()

                restored_count = 0
                for row in rows:
                    try:
                        # Convert sqlite3.Row to dict
                        row_dict = dict(row)
                        session = SessionSerializer.deserialize(row_dict)
                        self._sessions[session.user_id] = session
                        restored_count += 1
                    except Exception as e:
                        # Log error but continue - don't let one bad session break startup
                        user_id = dict(row).get("user_id", "unknown") if row else "unknown"
                        logger.error(f"Failed to restore session for user {user_id}: {e}")

                logger.info(f"Restored {restored_count} session(s) from database")

        except sqlite3.Error as e:
            logger.error(f"Database error during session restoration: {e}")
            # Don't raise - allow app to start with empty session state
        except Exception as e:
            logger.error(f"Unexpected error during session restoration: {e}")
            # Don't raise - allow app to start with empty session state

    def _persist_session(self, session: SessionState) -> None:
        """Write session to database using write-through cache pattern.

        Serializes the session and saves it to the SQLite database.
        Uses INSERT OR REPLACE to handle both new sessions and updates.

        Args:
            session: SessionState object to persist

        Raises:
            sqlite3.Error: If database write fails

        Example:
            >>> session = SessionState(...)
            >>> manager._persist_session(session)
            # Session is now saved to database
        """
        try:
            data = SessionSerializer.serialize(session)

            with db_manager.get_connection() as conn:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO sessions (
                        user_id, session_id, created_at, original_filename,
                        original_file_path, sheet_name, sheet_index,
                        job_function_config, original_employees,
                        current_employees, changes, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        data["user_id"],
                        data["session_id"],
                        data["created_at"],
                        data["original_filename"],
                        data["original_file_path"],
                        data["sheet_name"],
                        data["sheet_index"],
                        json.dumps(data["job_function_config"]),
                        json.dumps(data["original_employees"]),
                        json.dumps(data["current_employees"]),
                        json.dumps(data["changes"]),
                        data["updated_at"],
                    ),
                )

            logger.debug(f"Persisted session for user {session.user_id}")

        except sqlite3.Error as e:
            logger.error(f"Failed to persist session for user {session.user_id}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error persisting session for user {session.user_id}: {e}")
            raise

    def _delete_session_from_db(self, user_id: str) -> None:
        """Delete session from database.

        Removes the session record from the SQLite database.
        Errors are logged but do not raise exceptions - if the session
        doesn't exist in the database, this is a no-op.

        Args:
            user_id: User ID of session to delete

        Example:
            >>> manager._delete_session_from_db("user123")
            # Session removed from database
        """
        try:
            with db_manager.get_connection() as conn:
                conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))

            logger.debug(f"Deleted session from database for user {user_id}")

        except sqlite3.Error as e:
            logger.error(f"Failed to delete session from database for user {user_id}: {e}")
            # Don't raise - session is already deleted from memory
        except Exception as e:
            logger.error(f"Unexpected error deleting session for user {user_id}: {e}")
            # Don't raise - session is already deleted from memory
