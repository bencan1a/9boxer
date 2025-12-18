"""Session management service."""

import copy
import uuid
from datetime import datetime

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.session import EmployeeMove, SessionState


class SessionManager:
    """Manage in-memory session state."""

    def __init__(self) -> None:
        """Initialize session manager."""
        self.sessions: dict[str, SessionState] = {}

    def create_session(
        self,
        user_id: str,
        employees: list[Employee],
        filename: str,
        file_path: str,
        sheet_name: str,
        sheet_index: int,
    ) -> str:
        """Create new session with uploaded data."""
        session_id = str(uuid.uuid4())

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
            current_employees=current_employees,
            changes=[],
        )

        self.sessions[user_id] = session
        return session_id

    def get_session(self, user_id: str) -> SessionState | None:
        """Retrieve session by user ID."""
        return self.sessions.get(user_id)

    def delete_session(self, user_id: str) -> bool:
        """Delete session."""
        if user_id in self.sessions:
            del self.sessions[user_id]
            return True
        return False

    def move_employee(
        self,
        user_id: str,
        employee_id: int,
        new_performance: PerformanceLevel,
        new_potential: PotentialLevel,
    ) -> EmployeeMove:
        """Update employee position in session."""
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

        # Track change
        change = EmployeeMove(
            employee_id=employee_id,
            employee_name=employee.name,
            timestamp=datetime.utcnow(),
            old_performance=employee.performance,
            old_potential=employee.potential,
            new_performance=new_performance,
            new_potential=new_potential,
            old_position=employee.grid_position,
            new_position=self._calculate_position(new_performance, new_potential),
        )

        # Update employee
        employee.performance = new_performance
        employee.potential = new_potential
        employee.grid_position = change.new_position
        employee.position_label = self._get_position_label(new_performance, new_potential)

        # Check if employee is back to original position
        if (
            original_employee
            and employee.performance == original_employee.performance
            and employee.potential == original_employee.potential
        ):
            employee.modified_in_session = False
        else:
            employee.modified_in_session = True

        employee.last_modified = change.timestamp

        session.changes.append(change)
        return change

    def _calculate_position(self, perf: PerformanceLevel, pot: PotentialLevel) -> int:
        """Calculate 1-9 grid position from performance/potential.

        Grid layout (standard 9-box):
            Performance (columns): Low=1, Medium=2, High=3
            Potential (rows): Low=1-3, Medium=4-6, High=7-9

            Position = (potential_row * 3) + performance_column

            Example: High Performance (3), Low Potential (0*3) = position 3
        """
        # Performance determines column (1-3)
        perf_map = {
            PerformanceLevel.LOW: 1,
            PerformanceLevel.MEDIUM: 2,
            PerformanceLevel.HIGH: 3,
        }
        # Potential determines row (0, 3, 6)
        pot_map = {
            PotentialLevel.LOW: 0,
            PotentialLevel.MEDIUM: 3,
            PotentialLevel.HIGH: 6,
        }
        return pot_map[pot] + perf_map[perf]

    def _get_position_label(self, perf: PerformanceLevel, pot: PotentialLevel) -> str:
        """Get position label from performance/potential."""
        labels = {
            (PerformanceLevel.HIGH, PotentialLevel.HIGH): "Top Talent [H,H]",
            (PerformanceLevel.HIGH, PotentialLevel.MEDIUM): "High Impact Talent [H,M]",
            (PerformanceLevel.HIGH, PotentialLevel.LOW): "High/Low [H,L]",
            (PerformanceLevel.MEDIUM, PotentialLevel.HIGH): "Growth Talent [M,H]",
            (PerformanceLevel.MEDIUM, PotentialLevel.MEDIUM): "Core Talent [M,M]",
            (PerformanceLevel.MEDIUM, PotentialLevel.LOW): "Med/Low [M,L]",
            (PerformanceLevel.LOW, PotentialLevel.HIGH): "Emerging Talent [L,H]",
            (PerformanceLevel.LOW, PotentialLevel.MEDIUM): "Inconsistent Talent [L,M]",
            (PerformanceLevel.LOW, PotentialLevel.LOW): "Low/Low [L,L]",
        }
        return labels.get((perf, pot), f"[{perf.value[0]},{pot.value[0]}]")


# Global session manager instance
session_manager = SessionManager()
