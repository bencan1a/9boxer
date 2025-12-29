"""Tests for session serializer service."""

from datetime import date, datetime

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.events import GridMoveEvent
from ninebox.models.session import SessionState
from ninebox.services.excel_parser import JobFunctionConfig
from ninebox.services.session_serializer import SessionSerializer

pytestmark = pytest.mark.unit


def test_serialize_when_complete_session_then_creates_valid_dict(
    sample_employees: list[Employee],
) -> None:
    """Test serializing a complete session with all fields."""
    # Create session with job function config
    job_function_config = JobFunctionConfig(
        common_functions=["Engineering", "Product Management", "Design"],
        threshold_percentage=5.0,
        total_unique_functions=10,
        other_count=15,
    )

    session = SessionState(
        session_id="test-session-123",
        user_id="user1",
        created_at=datetime(2025, 12, 18, 10, 30, 0),
        original_employees=sample_employees[:3],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=job_function_config,
        current_employees=sample_employees[:3],
        events=[],
    )

    # Serialize
    data = SessionSerializer.serialize(session)

    # Verify basic fields
    assert data["session_id"] == "test-session-123"
    assert data["user_id"] == "user1"
    assert data["created_at"] == "2025-12-18T10:30:00"
    assert data["original_filename"] == "test.xlsx"
    assert data["original_file_path"] == "/tmp/test.xlsx"
    assert data["sheet_name"] == "Employee Data"
    assert data["sheet_index"] == 1

    # Verify job_function_config
    assert data["job_function_config"]["common_functions"] == [
        "Engineering",
        "Product Management",
        "Design",
    ]
    assert data["job_function_config"]["threshold_percentage"] == 5.0
    assert data["job_function_config"]["total_unique_functions"] == 10
    assert data["job_function_config"]["other_count"] == 15

    # Verify employees are serialized as dicts
    assert isinstance(data["original_employees"], list)
    assert len(data["original_employees"]) == 3
    assert isinstance(data["original_employees"][0], dict)

    # Verify employee fields
    emp_data = data["original_employees"][0]
    assert emp_data["employee_id"] == 1
    assert emp_data["name"] == "Alice Smith"
    assert emp_data["performance"] == "High"  # Enum serialized as string
    assert emp_data["potential"] == "High"  # Enum serialized as string

    # Verify events list
    assert data["events"] == []

    # Verify updated_at was added
    assert "updated_at" in data
    assert isinstance(data["updated_at"], str)


def test_serialize_when_session_with_changes_then_includes_changes(
    sample_employees: list[Employee],
) -> None:
    """Test serializing a session with employee moves."""
    session = SessionState(
        session_id="test-session-123",
        user_id="user1",
        created_at=datetime(2025, 12, 18, 10, 30, 0),
        original_employees=sample_employees[:2],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,
        current_employees=sample_employees[:2],
        events=[
            GridMoveEvent(
                employee_id=1,
                employee_name="Alice Smith",
                timestamp=datetime(2025, 12, 18, 11, 0, 0),
                old_performance=PerformanceLevel.HIGH,
                old_potential=PotentialLevel.HIGH,
                new_performance=PerformanceLevel.MEDIUM,
                new_potential=PotentialLevel.MEDIUM,
                old_position=9,
                new_position=5,
                notes="Performance review adjustment",
            )
        ],
    )

    # Serialize
    data = SessionSerializer.serialize(session)

    # Verify events
    assert len(data["events"]) == 1
    event = data["events"][0]
    assert event["employee_id"] == 1
    assert event["employee_name"] == "Alice Smith"
    assert event["timestamp"] == "2025-12-18T11:00:00"
    assert event["old_performance"] == "High"
    assert event["old_potential"] == "High"
    assert event["new_performance"] == "Medium"
    assert event["new_potential"] == "Medium"
    assert event["old_position"] == 9
    assert event["new_position"] == 5
    assert event["notes"] == "Performance review adjustment"


def test_serialize_when_missing_optional_fields_then_serializes_null(
    sample_employees: list[Employee],
) -> None:
    """Test serializing a session with missing optional fields."""
    session = SessionState(
        session_id="test-session-123",
        user_id="user1",
        created_at=datetime(2025, 12, 18, 10, 30, 0),
        original_employees=sample_employees[:1],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,  # Optional field
        current_employees=sample_employees[:1],
        events=[],
    )

    # Serialize
    data = SessionSerializer.serialize(session)

    # Verify job_function_config is None
    assert data["job_function_config"] is None


def test_deserialize_when_complete_data_then_reconstructs_session(
    sample_employees: list[Employee],
) -> None:
    """Test deserializing a complete session."""
    # Create original session
    job_function_config = JobFunctionConfig(
        common_functions=["Engineering", "Product Management"],
        threshold_percentage=5.0,
        total_unique_functions=8,
        other_count=12,
    )

    original_session = SessionState(
        session_id="test-session-456",
        user_id="user2",
        created_at=datetime(2025, 12, 18, 14, 0, 0),
        original_employees=sample_employees[:2],
        original_filename="employees.xlsx",
        original_file_path="/tmp/employees.xlsx",
        sheet_name="Sheet1",
        sheet_index=0,
        job_function_config=job_function_config,
        current_employees=sample_employees[:2],
        events=[],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(original_session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify basic fields
    assert reconstructed_session.session_id == "test-session-456"
    assert reconstructed_session.user_id == "user2"
    assert reconstructed_session.created_at == datetime(2025, 12, 18, 14, 0, 0)
    assert reconstructed_session.original_filename == "employees.xlsx"
    assert reconstructed_session.original_file_path == "/tmp/employees.xlsx"
    assert reconstructed_session.sheet_name == "Sheet1"
    assert reconstructed_session.sheet_index == 0

    # Verify job_function_config
    assert reconstructed_session.job_function_config is not None
    assert reconstructed_session.job_function_config.common_functions == [
        "Engineering",
        "Product Management",
    ]
    assert reconstructed_session.job_function_config.threshold_percentage == 5.0
    assert reconstructed_session.job_function_config.total_unique_functions == 8
    assert reconstructed_session.job_function_config.other_count == 12

    # Verify employees
    assert len(reconstructed_session.original_employees) == 2
    assert len(reconstructed_session.current_employees) == 2

    # Verify employee details
    emp = reconstructed_session.original_employees[0]
    assert isinstance(emp, Employee)
    assert emp.employee_id == 1
    assert emp.name == "Alice Smith"
    assert emp.performance == PerformanceLevel.HIGH
    assert emp.potential == PotentialLevel.HIGH
    assert isinstance(emp.hire_date, date)

    # Verify events
    assert reconstructed_session.events == []


def test_deserialize_when_session_with_changes_then_reconstructs_changes(
    sample_employees: list[Employee],
) -> None:
    """Test deserializing a session with employee moves."""
    original_session = SessionState(
        session_id="test-session-789",
        user_id="user3",
        created_at=datetime(2025, 12, 18, 15, 30, 0),
        original_employees=sample_employees[:2],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,
        current_employees=sample_employees[:2],
        events=[
            GridMoveEvent(
                employee_id=1,
                employee_name="Alice Smith",
                timestamp=datetime(2025, 12, 18, 16, 0, 0),
                old_performance=PerformanceLevel.HIGH,
                old_potential=PotentialLevel.HIGH,
                new_performance=PerformanceLevel.MEDIUM,
                new_potential=PotentialLevel.LOW,
                old_position=9,
                new_position=2,
                notes="Temporary reassignment",
            ),
            GridMoveEvent(
                employee_id=2,
                employee_name="Bob Jones",
                timestamp=datetime(2025, 12, 18, 16, 15, 0),
                old_performance=PerformanceLevel.MEDIUM,
                old_potential=PotentialLevel.MEDIUM,
                new_performance=PerformanceLevel.HIGH,
                new_potential=PotentialLevel.HIGH,
                old_position=5,
                new_position=9,
                notes=None,
            ),
        ],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(original_session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify events
    assert len(reconstructed_session.events) == 2

    # Verify first event
    event1 = reconstructed_session.events[0]
    assert isinstance(event1, GridMoveEvent)
    assert event1.employee_id == 1
    assert event1.employee_name == "Alice Smith"
    assert event1.timestamp == datetime(2025, 12, 18, 16, 0, 0)
    assert event1.old_performance == PerformanceLevel.HIGH
    assert event1.old_potential == PotentialLevel.HIGH
    assert event1.new_performance == PerformanceLevel.MEDIUM
    assert event1.new_potential == PotentialLevel.LOW
    assert event1.old_position == 9
    assert event1.new_position == 2
    assert event1.notes == "Temporary reassignment"

    # Verify second event
    event2 = reconstructed_session.events[1]
    assert event2.employee_id == 2
    assert event2.employee_name == "Bob Jones"
    assert event2.notes is None


def test_deserialize_when_missing_optional_fields_then_handles_gracefully(
    sample_employees: list[Employee],
) -> None:
    """Test deserializing a session with missing optional fields."""
    original_session = SessionState(
        session_id="test-session-999",
        user_id="user4",
        created_at=datetime(2025, 12, 18, 17, 0, 0),
        original_employees=sample_employees[:1],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,  # Optional
        current_employees=sample_employees[:1],
        events=[],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(original_session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify optional field is None
    assert reconstructed_session.job_function_config is None


def test_round_trip_serialization_when_real_employee_data_then_identical(
    sample_employees: list[Employee],
) -> None:
    """Test round-trip serialization with real employee data."""
    # Create session with all employee data
    original_session = SessionState(
        session_id="round-trip-test",
        user_id="user5",
        created_at=datetime(2025, 12, 18, 18, 0, 0),
        original_employees=sample_employees,
        original_filename="full_data.xlsx",
        original_file_path="/tmp/full_data.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=JobFunctionConfig(
            common_functions=["Engineering", "Product Management", "Design", "Data Science"],
            threshold_percentage=5.0,
            total_unique_functions=15,
            other_count=20,
        ),
        current_employees=sample_employees,
        events=[],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(original_session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify all employees
    assert len(reconstructed_session.original_employees) == 5
    assert len(reconstructed_session.current_employees) == 5

    for i, emp in enumerate(reconstructed_session.original_employees):
        original_emp = original_session.original_employees[i]

        # Verify all fields match
        assert emp.employee_id == original_emp.employee_id
        assert emp.name == original_emp.name
        assert emp.business_title == original_emp.business_title
        assert emp.job_title == original_emp.job_title
        assert emp.job_profile == original_emp.job_profile
        assert emp.job_level == original_emp.job_level
        assert emp.job_function == original_emp.job_function
        assert emp.location == original_emp.location
        assert emp.manager == original_emp.manager
        assert emp.management_chain_04 == original_emp.management_chain_04
        assert emp.management_chain_05 == original_emp.management_chain_05
        assert emp.management_chain_06 == original_emp.management_chain_06
        assert emp.hire_date == original_emp.hire_date
        assert emp.tenure_category == original_emp.tenure_category
        assert emp.time_in_job_profile == original_emp.time_in_job_profile
        assert emp.performance == original_emp.performance
        assert emp.potential == original_emp.potential
        assert emp.grid_position == original_emp.grid_position
        assert emp.talent_indicator == original_emp.talent_indicator
        assert emp.development_focus == original_emp.development_focus
        assert emp.development_action == original_emp.development_action
        assert emp.notes == original_emp.notes
        assert emp.promotion_status == original_emp.promotion_status
        assert emp.modified_in_session == original_emp.modified_in_session

        # Verify historical ratings
        assert len(emp.ratings_history) == len(original_emp.ratings_history)
        for j, rating in enumerate(emp.ratings_history):
            assert rating.year == original_emp.ratings_history[j].year
            assert rating.rating == original_emp.ratings_history[j].rating


def test_round_trip_serialization_when_employee_with_all_optional_fields_then_preserves(
    sample_employees: list[Employee],
) -> None:
    """Test round-trip serialization preserves employee optional fields."""
    # Use employee 1 which has many optional fields populated
    employee = sample_employees[0]

    original_session = SessionState(
        session_id="optional-fields-test",
        user_id="user6",
        created_at=datetime(2025, 12, 18, 19, 0, 0),
        original_employees=[employee],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,
        current_employees=[employee],
        events=[],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(original_session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify employee optional fields
    emp = reconstructed_session.original_employees[0]
    assert emp.development_focus == "Leadership skills"
    assert emp.development_action == "Executive coaching"
    assert emp.notes == "Top performer"
    assert emp.promotion_status == "Ready now"
    assert len(emp.ratings_history) == 2
    assert emp.ratings_history[0].year == 2023
    assert emp.ratings_history[0].rating == "Strong"
    assert emp.ratings_history[1].year == 2024
    assert emp.ratings_history[1].rating == "Leading"


def test_round_trip_serialization_when_employee_with_null_optional_fields_then_preserves(
    sample_employees: list[Employee],
) -> None:
    """Test round-trip serialization preserves null optional fields."""
    # Use employee 2 which has many optional fields as None
    employee = sample_employees[1]

    original_session = SessionState(
        session_id="null-fields-test",
        user_id="user7",
        created_at=datetime(2025, 12, 18, 20, 0, 0),
        original_employees=[employee],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,
        current_employees=[employee],
        events=[],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(original_session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify employee optional fields are None
    emp = reconstructed_session.original_employees[0]
    assert emp.development_focus is None
    assert emp.development_action is None
    assert emp.notes is None
    assert emp.promotion_status is None


def test_round_trip_serialization_when_multiple_moves_then_preserves_all(
    sample_employees: list[Employee],
) -> None:
    """Test round-trip serialization with multiple employee moves."""
    original_session = SessionState(
        session_id="multi-move-test",
        user_id="user8",
        created_at=datetime(2025, 12, 18, 21, 0, 0),
        original_employees=sample_employees[:3],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,
        current_employees=sample_employees[:3],
        events=[
            GridMoveEvent(
                employee_id=1,
                employee_name="Alice Smith",
                timestamp=datetime(2025, 12, 18, 21, 15, 0),
                old_performance=PerformanceLevel.HIGH,
                old_potential=PotentialLevel.HIGH,
                new_performance=PerformanceLevel.MEDIUM,
                new_potential=PotentialLevel.MEDIUM,
                old_position=9,
                new_position=5,
                notes="Performance adjustment",
            ),
            GridMoveEvent(
                employee_id=2,
                employee_name="Bob Jones",
                timestamp=datetime(2025, 12, 18, 21, 30, 0),
                old_performance=PerformanceLevel.MEDIUM,
                old_potential=PotentialLevel.MEDIUM,
                new_performance=PerformanceLevel.HIGH,
                new_potential=PotentialLevel.HIGH,
                old_position=5,
                new_position=9,
                notes="Promotion",
            ),
            GridMoveEvent(
                employee_id=3,
                employee_name="Carol Williams",
                timestamp=datetime(2025, 12, 18, 21, 45, 0),
                old_performance=PerformanceLevel.LOW,
                old_potential=PotentialLevel.HIGH,
                new_performance=PerformanceLevel.MEDIUM,
                new_potential=PotentialLevel.HIGH,
                old_position=7,
                new_position=8,
                notes=None,
            ),
        ],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(original_session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify all moves
    assert len(reconstructed_session.events) == 3

    # Verify each move in detail
    for i, event in enumerate(reconstructed_session.events):
        original_event = original_session.events[i]
        # Type narrow - we know these are GridMoveEvents in this test
        assert isinstance(event, GridMoveEvent)
        assert isinstance(original_event, GridMoveEvent)
        assert event.employee_id == original_event.employee_id
        assert event.employee_name == original_event.employee_name
        assert event.timestamp == original_event.timestamp
        assert event.old_performance == original_event.old_performance
        assert event.old_potential == original_event.old_potential
        assert event.new_performance == original_event.new_performance
        assert event.new_potential == original_event.new_potential
        assert event.old_position == original_event.old_position
        assert event.new_position == original_event.new_position
        assert event.notes == original_event.notes


def test_serialize_when_employee_with_last_modified_then_serializes_datetime() -> None:
    """Test serializing employee with last_modified datetime."""
    employee = Employee(
        employee_id=100,
        name="Test Employee",
        business_title="Engineer",
        job_title="Software Engineer",
        job_profile="Software EngineeringUSA",
        job_level="MT3",
        job_function="Engineering",
        location="USA",
        manager="Manager Name",
        hire_date=date(2023, 1, 1),
        tenure_category="1-3 years",
        time_in_job_profile="1 year",
        performance=PerformanceLevel.MEDIUM,
        potential=PotentialLevel.MEDIUM,
        grid_position=5,
        talent_indicator="Solid",
        ratings_history=[],
        modified_in_session=True,
        last_modified=datetime(2025, 12, 18, 22, 0, 0),
    )

    session = SessionState(
        session_id="datetime-test",
        user_id="user9",
        created_at=datetime(2025, 12, 18, 22, 0, 0),
        original_employees=[employee],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,
        current_employees=[employee],
        events=[],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify last_modified was preserved
    emp = reconstructed_session.original_employees[0]
    assert emp.last_modified == datetime(2025, 12, 18, 22, 0, 0)
    assert emp.modified_in_session is True


def test_deserialize_when_employee_without_last_modified_then_handles_none() -> None:
    """Test deserializing employee without last_modified (None)."""
    employee = Employee(
        employee_id=101,
        name="Test Employee 2",
        business_title="Designer",
        job_title="UX Designer",
        job_profile="DesignUSA",
        job_level="MT2",
        job_function="Design",
        location="USA",
        manager="Manager Name",
        hire_date=date(2022, 6, 1),
        tenure_category="3-5 years",
        time_in_job_profile="2 years",
        performance=PerformanceLevel.HIGH,
        potential=PotentialLevel.MEDIUM,
        grid_position=6,
        talent_indicator="High Impact",
        ratings_history=[],
        modified_in_session=False,
        last_modified=None,
    )

    session = SessionState(
        session_id="null-datetime-test",
        user_id="user10",
        created_at=datetime(2025, 12, 18, 23, 0, 0),
        original_employees=[employee],
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,
        current_employees=[employee],
        events=[],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify last_modified is None
    emp = reconstructed_session.original_employees[0]
    assert emp.last_modified is None
    assert emp.modified_in_session is False


def test_serialize_deserialize_when_large_dataset_then_preserves_all() -> None:
    """Test round-trip serialization with large employee dataset (edge case)."""
    # Create 100 employees
    employees = []
    for i in range(100):
        employees.append(
            Employee(
                employee_id=i,
                name=f"Employee {i}",
                business_title=f"Title {i}",
                job_title=f"Job {i}",
                job_profile="ProfileUSA",
                job_level="MT3",
                job_function="Engineering",
                location="USA",
                manager="Manager",
                hire_date=date(2020, 1, 1),
                tenure_category="3-5 years",
                time_in_job_profile="2 years",
                performance=PerformanceLevel.MEDIUM,
                potential=PotentialLevel.MEDIUM,
                grid_position=5,
                talent_indicator="Test",
                ratings_history=[],
                modified_in_session=False,
            )
        )

    session = SessionState(
        session_id="large-dataset-test",
        user_id="user11",
        created_at=datetime(2025, 12, 19, 0, 0, 0),
        original_employees=employees,
        original_filename="large.xlsx",
        original_file_path="/tmp/large.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        job_function_config=None,
        current_employees=employees,
        events=[],
    )

    # Serialize then deserialize
    data = SessionSerializer.serialize(session)
    reconstructed_session = SessionSerializer.deserialize(data)

    # Verify all 100 employees
    assert len(reconstructed_session.original_employees) == 100
    assert len(reconstructed_session.current_employees) == 100

    for i in range(100):
        emp = reconstructed_session.original_employees[i]
        assert emp.employee_id == i
        assert emp.name == f"Employee {i}"
