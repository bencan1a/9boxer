"""
TEMPLATE: Pytest Test File

Use this template when writing backend tests with pytest.

Location: backend/tests/test_module/test_feature.py

Key Principles:
- Test user-visible behavior, not implementation
- Use Arrange-Act-Assert structure
- No conditional logic in tests
- Test naming: test_function_when_condition_then_expected
- Use fixtures for test data
- Aim for >80% coverage
"""

import pytest

from ninebox.models.employee import Employee
from ninebox.models.session import Session
from ninebox.services.employee_service import EmployeeService

# ============================================================================
# FIXTURES: Shared test data and setup
# ============================================================================


@pytest.fixture
def sample_employee() -> Employee:
    """
    Fixture: Single employee for testing.
    Provides a standard employee instance with consistent data.
    """
    return Employee(
        id=1,
        name="Test Employee",
        title="Engineer",
        department="Engineering",
        location="New York",
        performance=4,
        potential=3,
        grid_position=1,
        is_modified=False,
    )


@pytest.fixture
def sample_employees() -> list[Employee]:
    """
    Fixture: Multiple employees for testing grid and statistics.
    Provides a representative set of employees across all grid positions.
    """
    return [
        Employee(id=1, name="Alice", performance=4, potential=4, grid_position=1),
        Employee(id=2, name="Bob", performance=3, potential=3, grid_position=5),
        Employee(id=3, name="Charlie", performance=2, potential=2, grid_position=9),
        Employee(id=4, name="Diana", performance=4, potential=2, grid_position=3),
        Employee(id=5, name="Eve", performance=2, potential=4, grid_position=7),
    ]


@pytest.fixture
def mock_session() -> Session:
    """
    Fixture: Mock session for testing.
    Provides a session instance for API endpoint testing.
    """
    return Session(
        id="test-session-1",
        name="Test Session",
        created_at="2025-01-01T00:00:00Z",
    )


@pytest.fixture
def employee_service(sample_employees) -> EmployeeService:
    """
    Fixture: EmployeeService instance with test data.
    Provides a service instance pre-populated with test data.
    """
    service = EmployeeService()
    for employee in sample_employees:
        service.add_employee(employee)
    return service


# ============================================================================
# TEST CLASS 1: Basic functionality tests
# ============================================================================


class TestEmployeeCreation:
    """
    Test suite: Employee model creation and validation.
    Tests the most basic functionality: creating valid employees.
    """

    def test_employee_creation_when_valid_data_then_creates_employee(self):
        """
        Test: Create employee with all required fields.
        Verifies that an employee can be created with valid data.

        Naming: test_<function>_when_<condition>_then_<expected>
        """
        # Arrange: Prepare test data
        employee_data = {
            "id": 1,
            "name": "John Doe",
            "title": "Manager",
            "department": "Sales",
            "location": "Boston",
            "performance": 4,
            "potential": 3,
            "grid_position": 1,
            "is_modified": False,
        }

        # Act: Create employee
        employee = Employee(**employee_data)

        # Assert: Verify employee was created correctly
        assert employee.id == 1
        assert employee.name == "John Doe"
        assert employee.title == "Manager"
        assert employee.performance == 4
        assert employee.potential == 3

    def test_employee_creation_when_missing_required_field_then_raises_error(self):
        """
        Test: Create employee with missing required field.
        Verifies that validation catches missing data.
        """
        # Arrange: Incomplete employee data
        incomplete_data = {
            "id": 1,
            "name": "John Doe",
            # Missing required fields: title, department, etc.
        }

        # Act & Assert: Attempt to create should raise error
        with pytest.raises(TypeError):
            Employee(**incomplete_data)

    def test_employee_creation_when_invalid_performance_score_then_raises_error(
        self,
    ):
        """
        Test: Create employee with invalid performance score.
        Verifies that validation rejects out-of-range values.
        """
        # Arrange: Employee with invalid performance (should be 1-5)
        invalid_data = {
            "id": 1,
            "name": "John Doe",
            "title": "Manager",
            "department": "Sales",
            "location": "Boston",
            "performance": 10,  # Invalid: too high
            "potential": 3,
            "grid_position": 1,
        }

        # Act & Assert: Should raise validation error
        with pytest.raises(ValueError, match=r"performance.*range"):
            Employee(**invalid_data)

    def test_employee_creation_when_valid_data_then_not_marked_modified(
        self,
        sample_employee,
    ):
        """
        Test: Newly created employee is not marked as modified.
        Verifies that new employees don't show as modified until changed.
        """
        # Arrange: Sample employee (fixture)

        # Assert: Verify is_modified is False
        assert sample_employee.is_modified is False


# ============================================================================
# TEST CLASS 2: Service/business logic tests
# ============================================================================


class TestEmployeeService:
    """
    Test suite: EmployeeService business logic.
    Tests service methods that contain business logic.
    """

    def test_move_employee_when_valid_position_then_updates_grid_position(
        self,
        employee_service,
        sample_employee,
    ):
        """
        Test: Move employee to valid grid position.
        Verifies that employee position updates correctly.
        """
        # Arrange: Service with employee
        employee_service.add_employee(sample_employee)
        new_position = 5

        # Act: Move employee
        employee_service.move_employee(employee_id=1, new_position=new_position)

        # Assert: Verify position updated
        moved_employee = employee_service.get_employee(1)
        assert moved_employee.grid_position == new_position
        assert moved_employee.is_modified is True

    def test_move_employee_when_invalid_position_then_raises_error(
        self,
        employee_service,
        sample_employee,
    ):
        """
        Test: Move employee to invalid grid position.
        Verifies that service validates position values.
        """
        # Arrange: Service with employee
        employee_service.add_employee(sample_employee)
        invalid_position = 99  # Grid only has positions 1-9

        # Act & Assert: Should raise validation error
        with pytest.raises(ValueError, match=r"position.*valid"):
            employee_service.move_employee(
                employee_id=1,
                new_position=invalid_position,
            )

    def test_calculate_statistics_when_employees_present_then_returns_distribution(
        self,
        employee_service,
    ):
        """
        Test: Calculate statistics for populated employee service.
        Verifies that statistics are computed correctly.
        """
        # Arrange: Service pre-populated with sample data (from fixture)

        # Act: Calculate statistics
        stats = employee_service.calculate_statistics()

        # Assert: Verify statistics are correct
        assert stats["total_employees"] == 5
        assert len(stats["distribution"]) == 9  # 9 grid positions
        assert sum(d["count"] for d in stats["distribution"]) == 5

    def test_calculate_statistics_when_empty_dataset_then_returns_zeros(self):
        """
        Test: Calculate statistics for empty service.
        Verifies that statistics handle empty data gracefully.
        """
        # Arrange: Empty service
        service = EmployeeService()

        # Act: Calculate statistics
        stats = service.calculate_statistics()

        # Assert: Verify all counts are zero
        assert stats["total_employees"] == 0
        assert all(d["count"] == 0 for d in stats["distribution"])


# ============================================================================
# TEST CLASS 3: API endpoint tests (using test client)
# ============================================================================


class TestEmployeeAPIEndpoints:
    """
    Test suite: Employee API endpoints.
    Tests HTTP endpoints and request/response handling.
    """

    def test_get_employees_when_employees_exist_then_returns_list(
        self,
        test_client,
        sample_employees,
        db_session,
    ):
        """
        Test: GET /api/employees returns employee list.
        Verifies endpoint returns all employees in correct format.

        Note: test_client is a fixture that provides HTTP client for API testing
        """
        # Arrange: Add sample employees to database
        for employee in sample_employees:
            db_session.add(employee)
        db_session.commit()

        # Act: Call API endpoint
        response = test_client.get("/api/employees")

        # Assert: Verify response
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert data[0]["name"] == "Alice"

    def test_get_employees_when_empty_then_returns_empty_list(
        self,
        test_client,
    ):
        """
        Test: GET /api/employees returns empty list when no employees.
        Verifies endpoint handles empty data gracefully.
        """
        # Arrange: Empty database (no employees)

        # Act: Call API endpoint
        response = test_client.get("/api/employees")

        # Assert: Verify empty response
        assert response.status_code == 200
        assert response.json() == []

    def test_move_employee_when_valid_move_then_returns_success(
        self,
        test_client,
        sample_employee,
        db_session,
    ):
        """
        Test: PUT /api/employees/{id}/move updates grid position.
        Verifies endpoint correctly processes employee movement.
        """
        # Arrange: Add employee to database
        db_session.add(sample_employee)
        db_session.commit()

        move_request = {
            "grid_position": 5,
        }

        # Act: Call API endpoint
        response = test_client.put(
            f"/api/employees/{sample_employee.id}/move",
            json=move_request,
        )

        # Assert: Verify response and database state
        assert response.status_code == 200
        updated = response.json()
        assert updated["grid_position"] == 5
        assert updated["is_modified"] is True

    def test_move_employee_when_invalid_employee_then_returns_404(
        self,
        test_client,
    ):
        """
        Test: PUT /api/employees/{id}/move with invalid ID returns 404.
        Verifies endpoint returns appropriate error for missing employee.
        """
        # Arrange: No employee with ID 999

        move_request = {
            "grid_position": 5,
        }

        # Act: Call API endpoint with non-existent ID
        response = test_client.put(
            "/api/employees/999/move",
            json=move_request,
        )

        # Assert: Verify 404 error
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


# ============================================================================
# TEST CLASS 4: Error handling and edge cases
# ============================================================================


class TestErrorHandling:
    """
    Test suite: Error handling and edge cases.
    Tests how system handles invalid inputs and error conditions.
    """

    def test_employee_when_name_empty_string_then_raises_error(self):
        """
        Test: Create employee with empty name.
        Verifies validation rejects empty strings.
        """
        # Arrange & Act & Assert
        with pytest.raises(ValueError, match=r"name.*required"):
            Employee(
                id=1,
                name="",  # Empty name
                title="Manager",
                department="Sales",
                location="Boston",
                performance=4,
                potential=3,
                grid_position=1,
            )

    def test_employee_when_department_has_special_characters_then_accepts(self):
        """
        Test: Create employee with special characters in department.
        Verifies that special characters are handled correctly.
        """
        # Arrange: Data with special characters
        employee_data = {
            "id": 1,
            "name": "John Doe",
            "title": "Sr. Manager",
            "department": "R&D / Innovation",  # Special characters
            "location": "Boston",
            "performance": 4,
            "potential": 3,
            "grid_position": 1,
        }

        # Act: Create employee
        employee = Employee(**employee_data)

        # Assert: Verify special characters preserved
        assert employee.department == "R&D / Innovation"

    def test_concurrent_moves_when_multiple_employees_then_all_move_correctly(
        self,
        employee_service,
        sample_employees,
    ):
        """
        Test: Move multiple employees simultaneously.
        Verifies that concurrent operations don't cause conflicts.
        """
        # Arrange: Service with multiple employees
        for employee in sample_employees:
            employee_service.add_employee(employee)

        # Act: Move multiple employees
        for emp_id in [1, 2, 3]:
            employee_service.move_employee(emp_id, new_position=emp_id + 1)

        # Assert: Verify all moved correctly
        assert employee_service.get_employee(1).grid_position == 2
        assert employee_service.get_employee(2).grid_position == 3
        assert employee_service.get_employee(3).grid_position == 4


# ============================================================================
# Common Testing Patterns
# ============================================================================

"""
FIXTURES:

    @pytest.fixture
    def sample_data() -> SampleType:
        '''Create and return test data.'''
        return SampleType(...)

    @pytest.fixture
    def sample_data_with_cleanup() -> Generator[SampleType, None, None]:
        '''Create test data and clean up after.'''
        data = SampleType(...)
        yield data
        # Cleanup code here
        data.cleanup()


MOCKING:

    from unittest.mock import Mock, patch

    # Mock a function
    with patch('module.function') as mock_func:
        mock_func.return_value = 'mocked value'
        result = function_that_calls_mocked()
        mock_func.assert_called_once()

    # Mock a class
    mock_obj = Mock()
    mock_obj.method.return_value = 'value'
    assert mock_obj.method() == 'value'


PARAMETRIZED TESTS (avoid if possible, prefer explicit tests):

    @pytest.mark.parametrize('input,expected', [
        (1, 2),
        (2, 4),
    ])
    def test_function(input, expected):
        assert function(input) == expected


ASSERTIONS:

    assert value == expected
    assert value is not None
    assert len(collection) == 5
    assert 'substring' in string
    assert 0.99 < value < 1.01  # Float comparison with tolerance
    assert isinstance(obj, Type)

    with pytest.raises(ValueError, match='error message pattern'):
        function_that_raises()

    with patch('module.function') as mock:
        function_under_test()
        mock.assert_called_once_with(arg1, arg2)
        mock.assert_called()
        mock.assert_not_called()


TEST ORGANIZATION:

    - Create test file: backend/tests/test_module/test_feature.py
    - Use test classes to organize related tests
    - Use descriptive test names
    - One logical assertion per test (multiple calls OK if testing same concept)
    - Use fixtures for reusable test data


NAMING CONVENTION:

    test_<what>_when_<condition>_then_<expected>

    Examples:
    - test_employee_when_created_then_has_valid_id
    - test_move_employee_when_invalid_position_then_raises_error
    - test_calculate_stats_when_empty_dataset_then_returns_zeros
"""
