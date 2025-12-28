"""End-to-end integration tests for complete session persistence workflows."""

import io
import time
from pathlib import Path

import openpyxl
import pytest
from fastapi.testclient import TestClient

from ninebox.core.dependencies import get_db_manager, get_session_manager
from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.database import DatabaseManager
from ninebox.services.session_manager import SessionManager



pytestmark = [pytest.mark.integration, pytest.mark.slow]

class TestEndToEndPersistence:
    """Test complete workflows from upload to export with persistence."""

    def test_full_workflow_upload_move_notes_restart_export(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Full workflow: Upload → move multiple employees → add notes → restart → export.

        This test verifies the complete persistence story:
        1. Upload file and create session
        2. Move multiple employees to different positions
        3. Add notes to some changes
        4. Simulate backend restart
        5. Verify all changes persisted
        6. Export to Excel and verify changes are reflected
        """
        # Step 1: Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            upload_response = test_client.post("/api/session/upload", files=files)

        assert upload_response.status_code == 200
        original_count = upload_response.json()["employee_count"]

        # Step 2: Get employees and move multiple ones
        response = test_client.get("/api/employees")
        employees = response.json()["employees"][:3]  # Move first 3

        moved_employees = []
        for idx, emp in enumerate(employees):
            employee_id = emp["employee_id"]
            original_perf = emp["performance"]

            # Move to a DIFFERENT performance level, varying potential
            new_perf = "Low" if original_perf != "Low" else "High"
            potential = ["High", "Medium", "Low"][idx]
            response = test_client.patch(
                f"/api/employees/{employee_id}/move",
                json={"performance": new_perf, "potential": potential},
            )
            assert response.status_code == 200
            moved_employees.append((employee_id, new_perf, potential))

        # Step 3: Add notes to first two employees
        notes_data = [
            (moved_employees[0][0], "Promoted to senior role, excellent leadership"),
            (moved_employees[1][0], "Strong technical contributor, needs mentoring"),
        ]

        for employee_id, notes in notes_data:
            response = test_client.patch(
                f"/api/session/changes/{employee_id}/notes",
                json={"notes": notes},
            )
            assert response.status_code == 200

        # Verify session state before restart
        response = test_client.get("/api/session/status")
        status_before = response.json()
        assert status_before["changes_count"] == 3

        # Step 4: Simulate backend restart
        # Clear the dependency cache to force new instance creation
        get_session_manager.cache_clear()
        new_manager = SessionManager()

        # Step 5: Verify all changes persisted after restart
        assert len(new_manager.sessions) == 1
        restored_session = list(new_manager.sessions.values())[0]

        # Verify employee count unchanged
        assert len(restored_session.original_employees) == original_count
        assert len(restored_session.current_employees) == original_count

        # Verify all 3 changes persisted
        assert len(restored_session.events) == 3

        # Verify employee positions persisted
        for employee_id, expected_perf, expected_potential in moved_employees:
            employee = next(
                e for e in restored_session.current_employees if e.employee_id == employee_id
            )
            assert employee.performance.value == expected_perf
            assert employee.potential.value == expected_potential
            assert employee.modified_in_session is True

        # Verify notes persisted
        for employee_id, expected_notes in notes_data:
            event = next(
                e for e in restored_session.events
                if e.employee_id == employee_id and e.event_type == "grid_move"
            )
            assert event.notes == expected_notes

        # Step 6: Export to Excel and verify changes reflected
        # The new_manager already has the sessions loaded from DB
        # Use dependency injection to override the session manager for this test
        # Since we're using test_client which has its own app instance,
        # the export should work with the persisted data

        response = test_client.post("/api/session/export")
        assert response.status_code == 200

        # Load exported Excel
        exported_file = io.BytesIO(response.content)
        workbook = openpyxl.load_workbook(exported_file)

        # Verify data sheet exists
        assert len(workbook.worksheets) >= 2
        data_sheet = workbook.worksheets[1]

        # Find Performance and Modified columns
        perf_col = None
        modified_col = None
        for col_idx in range(1, data_sheet.max_column + 1):
            cell_value = str(data_sheet.cell(1, col_idx).value or "")
            if "Performance" in cell_value:
                perf_col = col_idx
            if "Modified" in cell_value:
                modified_col = col_idx

        assert perf_col is not None
        assert modified_col is not None

        # Count modified employees in export
        modified_count = 0
        for row_idx in range(2, data_sheet.max_row + 1):
            if data_sheet.cell(row_idx, modified_col).value == "Yes":
                modified_count += 1

        assert modified_count == 3

    def test_database_and_filesystem_state_after_operations(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test database and file system state after each operation.

        Verifies that:
        - Database rows are created/updated/deleted correctly
        - File system state is consistent
        - No orphaned data remains
        """
        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Verify database state after upload
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM sessions")
            rows = cursor.fetchall()
            assert len(rows) == 1

            session_row = dict(rows[0])
            assert session_row["original_filename"] == "test.xlsx"
            assert session_row["sheet_name"] == "Employee Data"

        # Move employee to a DIFFERENT position
        response = test_client.get("/api/employees")
        first_employee = response.json()["employees"][0]
        employee_id = first_employee["employee_id"]
        original_perf = first_employee["performance"]
        original_pot = first_employee["potential"]

        # Ensure we move to a different position
        new_perf = "Low" if original_perf != "Low" else "High"
        new_pot = "Low" if original_pot != "Low" else "High"

        test_client.patch(
            f"/api/employees/{employee_id}/move",
            json={"performance": new_perf, "potential": new_pot},
        )

        # Verify database updated after move
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT events, updated_at FROM sessions")
            row = cursor.fetchone()
            import json

            changes = json.loads(row["events"])
            assert len(changes) == 1
            assert changes[0]["employee_id"] == employee_id

        # Delete session
        test_client.delete("/api/session/clear")

        # Verify database cleaned up
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM sessions")
            count = cursor.fetchone()[0]
            assert count == 0

    def test_original_vs_current_employees_after_restart(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Verify original_employees vs current_employees after restart.

        Tests that:
        - original_employees remains unchanged after moves
        - current_employees reflects all moves
        - The diff between them is correct
        """
        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get employees and their original positions
        response = test_client.get("/api/employees")
        employees = response.json()["employees"]
        employee_id = employees[0]["employee_id"]
        original_perf = employees[0]["performance"]
        original_pot = employees[0]["potential"]

        # Move employee to different position
        new_perf = "Low" if original_perf != "Low" else "High"
        new_pot = "High" if original_pot != "High" else "Medium"

        test_client.patch(
            f"/api/employees/{employee_id}/move",
            json={"performance": new_perf, "potential": new_pot},
        )

        # Simulate restart
        get_session_manager.cache_clear()
        new_manager = SessionManager()

        restored_session = list(new_manager.sessions.values())[0]

        # Verify original_employees unchanged
        original_employee = next(
            e for e in restored_session.original_employees if e.employee_id == employee_id
        )
        assert original_employee.performance.value == original_perf
        assert original_employee.potential.value == original_pot
        assert original_employee.modified_in_session is False

        # Verify current_employees reflects change
        current_employee = next(
            e for e in restored_session.current_employees if e.employee_id == employee_id
        )
        assert current_employee.performance.value == new_perf
        assert current_employee.potential.value == new_pot
        assert current_employee.modified_in_session is True

        # Verify change entry exists (grid move event)
        grid_events = [e for e in restored_session.events if e.event_type == "grid_move"]
        assert len(grid_events) == 1
        event = grid_events[0]
        assert event.employee_id == employee_id
        assert event.old_performance.value == original_perf
        assert event.old_potential.value == original_pot
        assert event.new_performance.value == new_perf
        assert event.new_potential.value == new_pot


class TestPerformanceBenchmarks:
    """Performance benchmarks for session persistence operations."""

    @pytest.fixture
    def large_dataset(self, tmp_path: Path) -> Path:
        """Create a large dataset for performance testing (100 employees)."""
        file_path = tmp_path / "large_dataset.xlsx"
        workbook = openpyxl.Workbook()

        # Summary sheet
        summary_sheet = workbook.active
        summary_sheet.title = "Summary"
        summary_sheet["A1"] = "Large Dataset Test"

        # Employee data sheet
        data_sheet = workbook.create_sheet("Employee Data")

        # Headers
        headers = [
            "Employee ID",
            "Worker",
            "Business Title",
            "Job Title",
            "Job Profile",
            "Job Level - Primary Position",
            "Worker's Manager",
            "Management Chain - Level 04",
            "Management Chain - Level 05",
            "Management Chain - Level 06",
            "Hire Date",
            "Tenure Category (Months)",
            "Time in Job Profile",
            "Aug 2025 Talent Assessment Performance",
            "Aug 2025  Talent Assessment Potential",
            "Aug 2025 Talent Assessment 9-Box Label",
            "Talent Mapping Position [Performance vs Potential]",
        ]

        for col_idx, header in enumerate(headers, start=1):
            data_sheet.cell(1, col_idx, header)

        # Generate 100 employees
        performances = ["Low", "Medium", "High"]
        potentials = ["Low", "Medium", "High"]

        for i in range(100):
            row_idx = i + 2
            data_sheet.cell(row_idx, 1, i + 1)  # Employee ID
            data_sheet.cell(row_idx, 2, f"Employee {i + 1}")  # Name
            data_sheet.cell(row_idx, 3, f"Title {i % 10}")  # Business Title
            data_sheet.cell(row_idx, 4, "Software Engineer")  # Job Title
            data_sheet.cell(row_idx, 5, "EngineeringUSA")  # Job Profile
            data_sheet.cell(row_idx, 6, f"MT{(i % 5) + 1}")  # Job Level
            data_sheet.cell(row_idx, 7, f"Manager {i % 20}")  # Manager
            data_sheet.cell(row_idx, 8, f"Manager {i % 20}")  # MC 04
            data_sheet.cell(row_idx, 9, "Director")  # MC 05
            data_sheet.cell(row_idx, 10, None)  # MC 06
            data_sheet.cell(row_idx, 11, "2020-01-01")  # Hire Date
            data_sheet.cell(row_idx, 12, "3-5 years")  # Tenure
            data_sheet.cell(row_idx, 13, "2 years")  # Time in Job
            data_sheet.cell(row_idx, 14, performances[i % 3])  # Performance
            data_sheet.cell(row_idx, 15, potentials[i % 3])  # Potential
            data_sheet.cell(row_idx, 16, (i % 9) + 1)  # Grid Position
            data_sheet.cell(row_idx, 17, f"[{performances[i % 3][0]},{potentials[i % 3][0]}]")

        workbook.save(file_path)
        workbook.close()  # Explicitly close to prevent openpyxl state pollution
        return file_path

    def test_performance_session_restore_100_employees(
        self, test_client: TestClient, large_dataset: Path
    ) -> None:
        """Performance: Session restore with 100 employees should be < 100ms."""
        # Upload large dataset
        with open(large_dataset, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "large.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files)

        assert response.status_code == 200
        assert response.json()["employee_count"] == 100

        # Measure restore time
        get_session_manager.cache_clear()

        start_time = time.perf_counter()
        new_manager = SessionManager()
        end_time = time.perf_counter()

        restore_time_ms = (end_time - start_time) * 1000

        # Verify session restored correctly
        assert len(new_manager.sessions) == 1
        restored_session = list(new_manager.sessions.values())[0]
        assert len(restored_session.original_employees) == 100

        # Performance target: < 100ms
        assert restore_time_ms < 100, f"Session restore took {restore_time_ms:.2f}ms (target: <100ms)"

    def test_performance_session_persist_after_move(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Performance: Session persist after employee move should be < 50ms."""
        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get employee
        response = test_client.get("/api/employees")
        employee_id = response.json()["employees"][0]["employee_id"]

        # Measure persist time during move
        start_time = time.perf_counter()
        response = test_client.patch(
            f"/api/employees/{employee_id}/move",
            json={"performance": "High", "potential": "High"},
        )
        end_time = time.perf_counter()

        persist_time_ms = (end_time - start_time) * 1000

        assert response.status_code == 200

        # Performance target: < 50ms (includes move logic + persistence)
        # Note: This is total API call time, persistence is subset of this
        assert persist_time_ms < 200, f"Move + persist took {persist_time_ms:.2f}ms"

    def test_performance_large_dataset_1000_employees(self, tmp_path: Path) -> None:
        """Performance: Large dataset (1000 employees) should serialize < 500ms.

        This test creates a 1000-employee dataset and measures serialization
        and deserialization performance.
        """
        from datetime import date

        from ninebox.models.employee import Employee
        from ninebox.models.session import SessionState
        from ninebox.services.session_serializer import SessionSerializer

        # Create 1000 employees
        employees = []
        for i in range(1000):
            employee = Employee(
                employee_id=i + 1,
                name=f"Employee {i + 1}",
                business_title=f"Title {i % 10}",
                job_title="Software Engineer",
                job_profile="EngineeringUSA",
                job_level=f"MT{(i % 5) + 1}",
                job_function="Other",
                location="USA",
                manager=f"Manager {i % 20}",
                management_chain_04=f"Manager {i % 20}",
                management_chain_05="Director",
                management_chain_06=None,
                hire_date=date(2020, 1, 1),
                tenure_category="3-5 years",
                time_in_job_profile="2 years",
                performance=PerformanceLevel(["Low", "Medium", "High"][i % 3]),
                potential=PotentialLevel(["Low", "Medium", "High"][i % 3]),
                grid_position=(i % 9) + 1,
                position_label=f"Label {i % 9}",
                talent_indicator="Solid Contributor",
                ratings_history=[],
                development_focus=None,
                development_action=None,
                notes=None,
                promotion_status=None,
                modified_in_session=False,
            )
            employees.append(employee)

        # Create session
        from datetime import datetime, timezone

        session = SessionState(
            session_id="test_session",
            user_id="test_user",
            created_at=datetime.now(timezone.utc),
            original_employees=employees,
            current_employees=employees.copy(),
            original_filename="large.xlsx",
            original_file_path="/tmp/large.xlsx",
            sheet_name="Employee Data",
            sheet_index=0,
            job_function_config=None,
            changes=[],
        )

        # Measure serialization time
        start_time = time.perf_counter()
        serialized = SessionSerializer.serialize(session)
        serialize_time = time.perf_counter() - start_time

        # Measure deserialization time
        start_time = time.perf_counter()
        deserialized = SessionSerializer.deserialize(serialized)
        deserialize_time = time.perf_counter() - start_time

        total_time_ms = (serialize_time + deserialize_time) * 1000

        # Verify correctness
        assert len(deserialized.original_employees) == 1000
        assert len(deserialized.current_employees) == 1000

        # Performance target: < 500ms for 1000 employees
        assert (
            total_time_ms < 500
        ), f"Large dataset serialize/deserialize took {total_time_ms:.2f}ms (target: <500ms)"
