"""Session management service."""

import copy
import json
import logging
import sqlite3
import uuid
from datetime import datetime, timezone

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.events import (
    DonutMoveEvent,
    Event,
    FlagAddEvent,
    FlagRemoveEvent,
    GridMoveEvent,
)
from ninebox.models.grid_positions import calculate_grid_position
from ninebox.models.session import SessionState
from ninebox.services.database import db_manager
from ninebox.services.event_manager import EventManager
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
        self.event_manager = EventManager(self)

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

        # Set original_grid_position to track starting position for each employee
        for emp in current_employees:
            emp.original_grid_position = emp.grid_position

        session = SessionState(
            session_id=session_id,
            user_id=user_id,
            created_at=datetime.now(timezone.utc),
            original_employees=original_employees,
            original_filename=filename,
            original_file_path=file_path,
            sheet_name=sheet_name,
            sheet_index=sheet_index,
            job_function_config=job_function_config,
            current_employees=current_employees,
            events=[],
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
    ) -> GridMoveEvent:
        """Update employee position in session.

        Creates a GridMoveEvent and uses EventManager to track it.
        Events are automatically removed when employee returns to original position.

        Sessions are lazily loaded from database on first access.

        Args:
            user_id: User session identifier
            employee_id: Employee to move
            new_performance: New performance level
            new_potential: New potential level

        Returns:
            GridMoveEvent: The grid move event

        Raises:
            ValueError: If no active session or employee not found

        Example:
            >>> manager.move_employee("user1", 123, PerformanceLevel.HIGH, PotentialLevel.MEDIUM)
            GridMoveEvent(employee_id=123, old_position=1, new_position=8, ...)
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

        # Find original employee
        original_employee = next(
            (e for e in session.original_employees if e.employee_id == employee_id), None
        )
        if not original_employee:
            raise ValueError(f"Original employee {employee_id} not found")

        # Calculate new position
        new_position = calculate_grid_position(new_performance, new_potential)
        now = datetime.now(timezone.utc)

        # Check if there's already a grid move event for this employee
        # If so, preserve the original old_position/old_performance/old_potential to track net change
        existing_event = next(
            (
                e
                for e in session.events
                if e.employee_id == employee_id and e.event_type == "grid_move"
            ),
            None,
        )

        # Use original position from existing event, or current position if no event exists
        old_position = existing_event.old_position if existing_event else employee.grid_position
        old_performance = existing_event.old_performance if existing_event else employee.performance
        old_potential = existing_event.old_potential if existing_event else employee.potential

        # Create grid move event
        event = GridMoveEvent(
            employee_id=employee_id,
            employee_name=employee.name,
            timestamp=now,
            old_performance=old_performance,
            old_potential=old_potential,
            new_performance=new_performance,
            new_potential=new_potential,
            old_position=old_position,
            new_position=new_position,
        )

        # Update employee
        employee.performance = new_performance
        employee.potential = new_potential
        employee.grid_position = new_position
        employee.last_modified = now

        # Track event (EventManager handles net-zero logic and persistence)
        self.event_manager.track_event(session, event, original_employee)

        # Update modified status based on whether events exist
        has_grid_events = any(
            e.employee_id == employee_id and e.event_type == "grid_move" for e in session.events
        )
        has_flag_events = any(
            e.employee_id == employee_id and e.event_type in ["flag_add", "flag_remove"]
            for e in session.events
        )
        employee.modified_in_session = has_grid_events or has_flag_events

        return event

    def update_change_notes(self, user_id: str, employee_id: int, notes: str) -> Event | None:
        """Update notes for an employee's grid move event.

        Sessions are lazily loaded from database on first access.

        Args:
            user_id: User session identifier
            employee_id: Employee whose notes to update
            notes: Notes text to store

        Returns:
            Event: Updated event with notes, or None if no grid move event exists

        Raises:
            ValueError: If no active session

        Example:
            >>> manager.update_change_notes("user1", 123, "Promoted due to exceptional Q4 performance")
            GridMoveEvent(employee_id=123, notes="Promoted due to exceptional Q4 performance", ...)
        """
        self._ensure_sessions_loaded()
        session = self.sessions.get(user_id)
        if not session:
            raise ValueError("No active session")

        # Find grid move event for this employee
        event = next(
            (
                e
                for e in session.events
                if e.employee_id == employee_id and e.event_type == "grid_move"
            ),
            None,
        )
        if not event:
            return None

        # Update notes
        event.notes = notes
        self._persist_session(session)
        return event

    def update_donut_change_notes(self, user_id: str, employee_id: int, notes: str) -> Event | None:
        """Update notes for an employee's donut move event.

        Sessions are lazily loaded from database on first access.

        Args:
            user_id: User session identifier
            employee_id: Employee whose donut notes to update
            notes: Notes text to store

        Returns:
            Event: Updated donut event with notes, or None if no donut move event exists

        Raises:
            ValueError: If no active session

        Example:
            >>> manager.update_donut_change_notes("user1", 123, "Exploring higher potential role")
            DonutMoveEvent(employee_id=123, notes="Exploring higher potential role", ...)
        """
        self._ensure_sessions_loaded()
        session = self.sessions.get(user_id)
        if not session:
            raise ValueError("No active session")

        # Find donut move event for this employee
        event = next(
            (
                e
                for e in session.donut_events
                if e.employee_id == employee_id and e.event_type == "donut_move"
            ),
            None,
        )
        if not event:
            return None

        # Update notes
        event.notes = notes
        self._persist_session(session)
        return event

    def move_employee_donut(
        self,
        user_id: str,
        employee_id: int,
        new_performance: PerformanceLevel,
        new_potential: PotentialLevel,
    ) -> DonutMoveEvent:
        """Update employee donut position in session.

        Creates a DonutMoveEvent and uses EventManager to track it.
        Events are automatically removed when employee returns to position 5 (center).

        Sessions are lazily loaded from database on first access.

        Args:
            user_id: User session identifier
            employee_id: Employee to move in donut mode
            new_performance: New donut performance level
            new_potential: New donut potential level

        Returns:
            DonutMoveEvent: The donut move event

        Raises:
            ValueError: If no active session or employee not found

        Example:
            >>> manager.move_employee_donut("user1", 123, PerformanceLevel.HIGH, PotentialLevel.MEDIUM)
            DonutMoveEvent(employee_id=123, old_position=5, new_position=8, ...)
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

        # Find original employee (needed for net-zero check)
        original_employee = next(
            (e for e in session.original_employees if e.employee_id == employee_id), None
        )
        if not original_employee:
            raise ValueError(f"Original employee {employee_id} not found")

        # Calculate new position
        new_position = calculate_grid_position(new_performance, new_potential)
        now = datetime.now(timezone.utc)

        # Position 5 is the center position (Medium/Medium) - moving back here clears donut state
        is_position_5 = new_position == 5

        # Check if there's already a donut move event for this employee
        # If so, preserve the original old_position/old_performance/old_potential to track net change
        existing_donut_event = next(
            (
                e
                for e in session.donut_events
                if e.employee_id == employee_id and e.event_type == "donut_move"
            ),
            None,
        )

        # Determine old position for the event - use existing event if available
        if existing_donut_event:
            old_performance = existing_donut_event.old_performance
            old_potential = existing_donut_event.old_potential
            old_position = existing_donut_event.old_position
        else:
            old_performance = employee.donut_performance or employee.performance
            old_potential = employee.donut_potential or employee.potential
            old_position = employee.donut_position or employee.grid_position

        # Create donut move event
        event = DonutMoveEvent(
            employee_id=employee_id,
            employee_name=employee.name,
            timestamp=now,
            old_performance=old_performance,
            old_potential=old_potential,
            new_performance=new_performance,
            new_potential=new_potential,
            old_position=old_position,
            new_position=new_position,
        )

        if is_position_5:
            # Moving back to position 5 - clear donut fields
            employee.donut_performance = None
            employee.donut_potential = None
            employee.donut_position = None
            employee.donut_modified = False
            employee.donut_last_modified = None
            employee.donut_notes = None
        else:
            # Normal donut move (not position 5)
            employee.donut_performance = new_performance
            employee.donut_potential = new_potential
            employee.donut_position = new_position
            employee.donut_modified = True
            employee.donut_last_modified = now

        # Track event (EventManager handles net-zero logic and persistence)
        self.event_manager.track_event(session, event, original_employee, is_donut=True)

        return event

    def toggle_donut_mode(self, user_id: str, enabled: bool) -> SessionState:
        """Toggle donut mode on or off for a session.

        Sessions are lazily loaded from database on first access.

        Args:
            user_id: User session identifier
            enabled: True to enable donut mode, False to disable

        Returns:
            SessionState: Updated session state

        Raises:
            ValueError: If no active session

        Example:
            >>> manager.toggle_donut_mode("user1", True)
            SessionState(donut_mode_active=True, ...)
        """
        self._ensure_sessions_loaded()
        session = self.sessions.get(user_id)
        if not session:
            raise ValueError("No active session")

        session.donut_mode_active = enabled
        self._persist_session(session)
        return session

    def update_employee_flags(
        self,
        user_id: str,
        employee_id: int,
        new_flags: list[str],
    ) -> list[Event]:
        """Update employee flags and track individual add/remove events.

        Creates discrete FlagAddEvent and FlagRemoveEvent instances for each
        flag that changes. Events are removed when flags return to original state.

        Sessions are lazily loaded from database on first access.

        Args:
            user_id: Session owner
            employee_id: Employee to update
            new_flags: Complete new list of flags

        Returns:
            List of flag events for this employee

        Raises:
            ValueError: If no active session or employee not found

        Example:
            >>> manager.update_employee_flags("user1", 123, ["promotion_ready", "high_performer"])
            [FlagAddEvent(flag="promotion_ready"), FlagAddEvent(flag="high_performer")]
        """
        self._ensure_sessions_loaded()
        session = self.sessions.get(user_id)
        if not session:
            raise ValueError("No active session")

        employee = next(
            (e for e in session.current_employees if e.employee_id == employee_id), None
        )
        if not employee:
            raise ValueError(f"Employee {employee_id} not found")

        original_employee = next(
            (e for e in session.original_employees if e.employee_id == employee_id), None
        )
        if not original_employee:
            raise ValueError(f"Original employee {employee_id} not found")

        # Calculate flag changes
        old_flags = set(employee.flags or [])
        new_flags_set = set(new_flags)
        added_flags = new_flags_set - old_flags
        removed_flags = old_flags - new_flags_set

        now = datetime.now(timezone.utc)

        # Track each added flag
        for flag in added_flags:
            add_event = FlagAddEvent(
                employee_id=employee_id,
                employee_name=employee.name,
                timestamp=now,
                flag=flag,
            )
            self.event_manager.track_event(session, add_event, original_employee)

        # Track each removed flag
        for flag in removed_flags:
            remove_event = FlagRemoveEvent(
                employee_id=employee_id,
                employee_name=employee.name,
                timestamp=now,
                flag=flag,
            )
            self.event_manager.track_event(session, remove_event, original_employee)

        # Update employee
        employee.flags = new_flags
        employee.last_modified = now

        # Update modified status
        original_flags = set((original_employee.flags or []) if original_employee else [])
        has_flag_changes = new_flags_set != original_flags
        has_other_events = any(
            e.employee_id == employee_id and e.event_type in ["grid_move", "donut_move"]
            for e in session.events
        )
        employee.modified_in_session = has_flag_changes or has_other_events

        # Return all flag events for this employee
        return self.event_manager.get_employee_events(session, employee_id)

    def _recalculate_modified_flags(self, session: SessionState) -> None:
        """Recalculate modified_in_session flags and original_grid_position based on events.

        Called after session restoration to ensure employees have correct
        modified_in_session flags and original_grid_position based on the events in the session.

        Args:
            session: Session whose employee flags need recalculation

        Example:
            >>> session = SessionSerializer.deserialize(row_dict)
            >>> manager._recalculate_modified_flags(session)
            >>> # Employees with events now have modified_in_session=True
            >>> # Employees with grid moves have original_grid_position from first event
        """
        # Build a set of employee IDs that have events
        modified_employee_ids = set()

        # Build a map of employee_id -> original grid position (from first grid move event)
        original_positions: dict[int, int] = {}

        for event in session.events:
            modified_employee_ids.add(event.employee_id)

            # Track original position from first grid move event
            if event.event_type == "grid_move" and event.employee_id not in original_positions:
                # First grid move for this employee - capture original position
                original_positions[event.employee_id] = event.old_position  # type: ignore

        # Update modified_in_session flag and original_grid_position for all employees
        for employee in session.current_employees:
            employee.modified_in_session = employee.employee_id in modified_employee_ids

            # Set original_grid_position from first move event, or current position if no moves
            if employee.employee_id in original_positions:
                employee.original_grid_position = original_positions[employee.employee_id]
            else:
                # No moves yet - original position is current position
                employee.original_grid_position = employee.grid_position

    def _restore_sessions(self) -> None:
        """Restore sessions from database on startup.

        Loads all sessions from the SQLite database and populates the in-memory cache.
        Errors during restoration are logged but do not prevent startup - individual
        sessions that fail to deserialize are skipped.

        After deserialization, recalculates the modified_in_session flag for each
        employee based on the events in the session.

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

                        # Recalculate modified_in_session flags based on events
                        self._recalculate_modified_flags(session)

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
                # Check what columns exist to handle migration period
                cursor = conn.execute("PRAGMA table_info(sessions)")
                columns = {row[1] for row in cursor.fetchall()}

                # Build dynamic INSERT based on available columns
                base_columns = [
                    "user_id",
                    "session_id",
                    "created_at",
                    "original_filename",
                    "original_file_path",
                    "sheet_name",
                    "sheet_index",
                    "job_function_config",
                    "original_employees",
                    "current_employees",
                    "events",
                    "donut_events",
                    "donut_mode_active",
                    "updated_at",
                ]
                base_values = [
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
                    json.dumps(data.get("events", [])),
                    json.dumps(data.get("donut_events", [])),
                    1 if data["donut_mode_active"] else 0,
                    data["updated_at"],
                ]

                # Add legacy columns if they still exist (migration period)
                if "changes" in columns:
                    base_columns.append("changes")
                    base_values.append(json.dumps(data.get("events", [])))
                if "donut_changes" in columns:
                    base_columns.append("donut_changes")
                    base_values.append(json.dumps(data.get("donut_events", [])))

                # Execute dynamic INSERT
                placeholders = ", ".join("?" * len(base_values))
                cols = ", ".join(base_columns)
                query = f"INSERT OR REPLACE INTO sessions ({cols}) VALUES ({placeholders})"
                conn.execute(query, tuple(base_values))

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
