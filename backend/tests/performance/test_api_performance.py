"""Performance tests for API endpoints.

Performance targets documented in each test docstring.
Use --benchmark-compare to track performance over time.
"""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Check if pytest-benchmark is available
try:
    import pytest_benchmark  # noqa: F401
    BENCHMARK_AVAILABLE = True
except ImportError:
    BENCHMARK_AVAILABLE = False

pytestmark = [
    pytest.mark.performance,
    pytest.mark.slow,
    pytest.mark.skipif(
        not BENCHMARK_AVAILABLE,
        reason="pytest-benchmark not installed. Install with: pip install pytest-benchmark"
    )
]

class TestUploadPerformance:
    """Performance tests for file upload endpoint."""

    def test_upload_when_small_file_then_completes_quickly(
        self,
        benchmark: pytest.fixture,
        test_client: TestClient,
        small_excel_file: Path,
    ) -> None:
        """Benchmark small file upload (5 employees).

        Target: <1s
        """

        def upload_small_file() -> None:
            with small_excel_file.open("rb") as f:
                files = {"file": (small_excel_file.name, f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
                response = test_client.post("/api/session/upload", files=files)
                assert response.status_code == 200

        benchmark(upload_small_file)

    def test_upload_when_large_file_then_completes_within_limit(
        self,
        benchmark: pytest.fixture,
        test_client: TestClient,
        large_excel_file: Path,
    ) -> None:
        """Benchmark large file upload (1000 employees).

        Target: <5s
        """

        def upload_large_file() -> None:
            with large_excel_file.open("rb") as f:
                files = {"file": (large_excel_file.name, f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
                response = test_client.post("/api/session/upload", files=files)
                assert response.status_code == 200

        benchmark(upload_large_file)


class TestEmployeeAPIPerformance:
    """Performance tests for employee API endpoints."""

    def test_get_all_employees_when_called_then_responds_quickly(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark getting all employees.

        Target: <100ms
        """

        def get_all_employees() -> None:
            response = test_client_with_session.get("/api/employees")
            assert response.status_code == 200
            data = response.json()
            assert "employees" in data

        benchmark(get_all_employees)

    def test_get_single_employee_when_called_then_responds_quickly(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark getting single employee by ID.

        Target: <50ms
        """

        def get_single_employee() -> None:
            response = test_client_with_session.get("/api/employees/1")
            assert response.status_code == 200
            data = response.json()
            assert data["employee_id"] == 1

        benchmark(get_single_employee)

    def test_filter_employees_when_called_then_responds_quickly(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark filtering employees by performance and potential.

        Target: <100ms
        """

        def filter_employees() -> None:
            response = test_client_with_session.get(
                "/api/employees",
                params={
                    "performance": "High",
                    "potential": "High",
                },
            )
            assert response.status_code == 200
            data = response.json()
            assert "filtered" in data

        benchmark(filter_employees)


class TestStatisticsPerformance:
    """Performance tests for statistics API endpoints."""

    def test_distribution_when_calculated_then_responds_quickly(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark distribution calculation.

        Target: <1s
        """

        def get_distribution() -> None:
            response = test_client_with_session.get("/api/statistics")
            assert response.status_code == 200
            data = response.json()
            assert "distribution" in data

        benchmark(get_distribution)

    def test_statistics_with_filters_when_calculated_then_responds_quickly(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark statistics calculation with filters.

        Target: <1s
        """

        def get_statistics_filtered() -> None:
            response = test_client_with_session.get(
                "/api/statistics",
                params={"performance": "High", "potential": "High"},
            )
            assert response.status_code == 200
            data = response.json()
            assert "distribution" in data

        benchmark(get_statistics_filtered)


class TestIntelligencePerformance:
    """Performance tests for intelligence API endpoints."""

    def test_intelligence_analysis_when_run_then_completes_within_limit(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark intelligence analysis.

        Target: <2s
        """

        def run_intelligence_analysis() -> None:
            response = test_client_with_session.get("/api/intelligence")
            assert response.status_code == 200
            data = response.json()
            assert "quality_score" in data
            assert "anomaly_count" in data

        benchmark(run_intelligence_analysis)


class TestExportPerformance:
    """Performance tests for export functionality."""

    def test_export_when_small_dataset_then_completes_quickly(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark export of small dataset (5 employees).

        Target: <1s
        """

        def export_small_dataset() -> None:
            response = test_client_with_session.post("/api/session/export")
            assert response.status_code == 200

        benchmark(export_small_dataset)

    def test_export_when_large_dataset_then_completes_within_limit(
        self,
        benchmark: pytest.fixture,
        test_client_with_large_session: TestClient,
    ) -> None:
        """Benchmark export of large dataset (1000 employees).

        Target: <5s
        """

        def export_large_dataset() -> None:
            response = test_client_with_large_session.post("/api/session/export")
            assert response.status_code == 200

        benchmark(export_large_dataset)


class TestMovePerformance:
    """Performance tests for employee move operations."""

    def test_move_employee_when_called_then_responds_quickly(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark moving an employee to new grid position.

        Target: <100ms
        """

        def move_employee() -> None:
            response = test_client_with_session.patch(
                "/api/employees/1/move",
                json={
                    "performance": "High",
                    "potential": "Medium",
                },
            )
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True

        benchmark(move_employee)

    def test_update_employee_when_called_then_responds_quickly(
        self,
        benchmark: pytest.fixture,
        test_client_with_session: TestClient,
    ) -> None:
        """Benchmark updating employee fields.

        Target: <50ms
        """

        def update_employee() -> None:
            response = test_client_with_session.patch(
                "/api/employees/1",
                json={
                    "notes": "Updated notes for performance test",
                    "development_focus": "Leadership",
                },
            )
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True

        benchmark(update_employee)
