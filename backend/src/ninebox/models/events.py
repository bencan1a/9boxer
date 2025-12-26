"""Trackable event models for employee property changes."""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Annotated, ClassVar, Literal
from uuid import uuid4

from pydantic import BaseModel, Discriminator, Field

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


class TrackableEvent(BaseModel, ABC):
    """Base class for all trackable employee events.

    All employee property changes are tracked as discrete events that can be
    added, removed, and displayed. Each event type implements is_net_zero()
    to determine if the event represents a return to the original state.

    Attributes:
        event_id: Unique identifier for this event
        employee_id: ID of the affected employee
        employee_name: Name of the affected employee
        timestamp: When the event occurred
        event_type: Discriminator for polymorphic event types
        notes: Optional notes about the event

    Examples:
        >>> # Creating a grid move event
        >>> event = GridMoveEvent(
        ...     employee_id=1,
        ...     employee_name="John Doe",
        ...     old_position=1,
        ...     new_position=5,
        ...     old_performance=PerformanceLevel.LOW,
        ...     new_performance=PerformanceLevel.MEDIUM,
        ...     old_potential=PotentialLevel.LOW,
        ...     new_potential=PotentialLevel.MEDIUM,
        ... )
        >>> print(event.event_type)
        grid_move
    """

    event_id: str = Field(default_factory=lambda: str(uuid4()))
    employee_id: int
    employee_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.utcnow())
    event_type: str  # Discriminator for polymorphism
    notes: str | None = None

    @abstractmethod
    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if this event represents a return to original state.

        Args:
            original_employee: Employee data from original file upload

        Returns:
            True if event is net-zero (should be removed), False otherwise

        Examples:
            >>> # Grid move back to original position
            >>> original = Employee(employee_id=1, performance=PerformanceLevel.MEDIUM, ...)
            >>> event = GridMoveEvent(
            ...     employee_id=1,
            ...     employee_name="John Doe",
            ...     old_position=5,
            ...     new_position=1,
            ...     old_performance=PerformanceLevel.MEDIUM,
            ...     new_performance=PerformanceLevel.MEDIUM,
            ...     old_potential=PotentialLevel.MEDIUM,
            ...     new_potential=PotentialLevel.MEDIUM,
            ... )
            >>> event.is_net_zero(original)
            True
        """
        pass

    class Config:
        """Pydantic config."""

        json_encoders: ClassVar = {
            datetime: lambda v: v.isoformat(),
        }


class GridMoveEvent(TrackableEvent):
    """Grid position change event.

    Represents an employee moving between boxes in the 9-box grid by changing
    their performance and/or potential ratings.

    Attributes:
        old_position: Original grid position (1-9)
        new_position: New grid position (1-9)
        old_performance: Original performance level
        new_performance: New performance level
        old_potential: Original potential level
        new_potential: New potential level

    Examples:
        >>> event = GridMoveEvent(
        ...     employee_id=1,
        ...     employee_name="Jane Smith",
        ...     old_position=1,
        ...     new_position=9,
        ...     old_performance=PerformanceLevel.LOW,
        ...     new_performance=PerformanceLevel.HIGH,
        ...     old_potential=PotentialLevel.LOW,
        ...     new_potential=PotentialLevel.HIGH,
        ... )
        >>> print(f"{event.event_type}: {event.old_position} -> {event.new_position}")
        grid_move: 1 -> 9
    """

    event_type: Literal["grid_move"] = "grid_move"
    old_position: int
    new_position: int
    old_performance: PerformanceLevel
    new_performance: PerformanceLevel
    old_potential: PotentialLevel
    new_potential: PotentialLevel

    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if employee is back to original grid position.

        Args:
            original_employee: Employee from original uploaded data

        Returns:
            True if performance and potential match original values

        Examples:
            >>> original = Employee(
            ...     employee_id=1,
            ...     performance=PerformanceLevel.MEDIUM,
            ...     potential=PotentialLevel.HIGH,
            ...     ...
            ... )
            >>> # Employee moved and then moved back
            >>> event = GridMoveEvent(
            ...     employee_id=1,
            ...     employee_name="John Doe",
            ...     old_position=1,
            ...     new_position=6,
            ...     old_performance=PerformanceLevel.LOW,
            ...     new_performance=PerformanceLevel.MEDIUM,
            ...     old_potential=PotentialLevel.LOW,
            ...     new_potential=PotentialLevel.HIGH,
            ... )
            >>> event.is_net_zero(original)
            True
        """
        return (
            self.new_performance == original_employee.performance
            and self.new_potential == original_employee.potential
        )


class DonutMoveEvent(TrackableEvent):
    """Donut mode position change event.

    Represents an employee moving in the donut exercise mode, which is a
    temporary alternative placement exercise. Donut moves are net-zero when
    the employee is moved back to position 5 (the center/neutral position).

    Attributes:
        old_position: Original donut position (1-9)
        new_position: New donut position (1-9)
        old_performance: Original performance level in donut mode
        new_performance: New performance level in donut mode
        old_potential: Original potential level in donut mode
        new_potential: New potential level in donut mode

    Examples:
        >>> event = DonutMoveEvent(
        ...     employee_id=1,
        ...     employee_name="Bob Johnson",
        ...     old_position=5,
        ...     new_position=9,
        ...     old_performance=PerformanceLevel.MEDIUM,
        ...     new_performance=PerformanceLevel.HIGH,
        ...     old_potential=PotentialLevel.MEDIUM,
        ...     new_potential=PotentialLevel.HIGH,
        ... )
        >>> print(f"{event.event_type}: {event.old_position} -> {event.new_position}")
        donut_move: 5 -> 9
    """

    event_type: Literal["donut_move"] = "donut_move"
    old_position: int
    new_position: int
    old_performance: PerformanceLevel
    new_performance: PerformanceLevel
    old_potential: PotentialLevel
    new_potential: PotentialLevel

    def is_net_zero(self, _original_employee: Employee) -> bool:
        """Donut moves are always net-zero when back to position 5.

        Position 5 is the center/neutral position in the donut exercise.
        When an employee is moved back to position 5, the donut move is
        considered reverted and the event should be removed.

        Args:
            _original_employee: Employee from original uploaded data (unused for donut moves)

        Returns:
            True if new_position is 5 (center position)

        Examples:
            >>> original = Employee(employee_id=1, ...)
            >>> # Employee moved back to center
            >>> event = DonutMoveEvent(
            ...     employee_id=1,
            ...     employee_name="Alice Brown",
            ...     old_position=9,
            ...     new_position=5,
            ...     old_performance=PerformanceLevel.HIGH,
            ...     new_performance=PerformanceLevel.MEDIUM,
            ...     old_potential=PotentialLevel.HIGH,
            ...     new_potential=PotentialLevel.MEDIUM,
            ... )
            >>> event.is_net_zero(original)
            True
        """
        return self.new_position == 5


class FlagAddEvent(TrackableEvent):
    """Flag added to employee event.

    Represents adding a flag (tag) to an employee for categorization and
    filtering purposes. Flags like "promotion_ready", "flight_risk", etc.
    can be added to help identify and group employees.

    Attributes:
        flag: The flag key that was added (e.g., "promotion_ready")

    Examples:
        >>> event = FlagAddEvent(
        ...     employee_id=1,
        ...     employee_name="Carol White",
        ...     flag="promotion_ready",
        ...     notes="Discussed in Q4 talent review",
        ... )
        >>> print(f"Added flag: {event.flag}")
        Added flag: promotion_ready
    """

    event_type: Literal["flag_add"] = "flag_add"
    flag: str  # Flag key (e.g., "promotion_ready")

    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if flag was in original data (net-zero when re-added).

        If the flag being added was already present in the original uploaded
        data, then adding it again is considered net-zero because we're
        returning to the original state.

        Args:
            original_employee: Employee from original uploaded data

        Returns:
            True if flag was in original employee's flags

        Examples:
            >>> original = Employee(
            ...     employee_id=1,
            ...     flags=["promotion_ready", "high_retention_priority"],
            ...     ...
            ... )
            >>> # Re-adding an original flag
            >>> event = FlagAddEvent(
            ...     employee_id=1,
            ...     employee_name="Dave Green",
            ...     flag="promotion_ready",
            ... )
            >>> event.is_net_zero(original)
            True
            >>> # Adding a new flag
            >>> event2 = FlagAddEvent(
            ...     employee_id=1,
            ...     employee_name="Dave Green",
            ...     flag="flight_risk",
            ... )
            >>> event2.is_net_zero(original)
            False
        """
        original_flags = original_employee.flags or []
        return self.flag in original_flags


class FlagRemoveEvent(TrackableEvent):
    """Flag removed from employee event.

    Represents removing a flag (tag) from an employee. This is the inverse
    of FlagAddEvent and is used to track when flags are removed during a
    session.

    Attributes:
        flag: The flag key that was removed (e.g., "flight_risk")

    Examples:
        >>> event = FlagRemoveEvent(
        ...     employee_id=1,
        ...     employee_name="Eve Black",
        ...     flag="flight_risk",
        ...     notes="Retention plan successful",
        ... )
        >>> print(f"Removed flag: {event.flag}")
        Removed flag: flight_risk
    """

    event_type: Literal["flag_remove"] = "flag_remove"
    flag: str  # Flag key (e.g., "flight_risk")

    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if flag is back in current state (net-zero when re-removed).

        If the flag being removed was NOT present in the original uploaded
        data, then removing it is net-zero because we're returning to the
        original state (where it didn't exist).

        Args:
            original_employee: Employee from original uploaded data

        Returns:
            True if flag was NOT in original employee's flags

        Examples:
            >>> original = Employee(
            ...     employee_id=1,
            ...     flags=["promotion_ready"],
            ...     ...
            ... )
            >>> # Removing a flag that wasn't in original data
            >>> event = FlagRemoveEvent(
            ...     employee_id=1,
            ...     employee_name="Frank Blue",
            ...     flag="flight_risk",
            ... )
            >>> event.is_net_zero(original)
            True
            >>> # Removing a flag that was in original data
            >>> event2 = FlagRemoveEvent(
            ...     employee_id=1,
            ...     employee_name="Frank Blue",
            ...     flag="promotion_ready",
            ... )
            >>> event2.is_net_zero(original)
            False
        """
        original_flags = original_employee.flags or []
        return self.flag not in original_flags


# Type alias for all event types (discriminated union)
# Using Annotated with Discriminator for proper Pydantic v2 support
Event = Annotated[
    GridMoveEvent | DonutMoveEvent | FlagAddEvent | FlagRemoveEvent,
    Discriminator("event_type"),
]
