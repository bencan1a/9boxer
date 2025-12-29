"""Performance tests for concurrent operations."""

import concurrent.futures
from threading import Thread

import psutil
import pytest
from fastapi.testclient import TestClient


pytestmark = [pytest.mark.performance, pytest.mark.slow]


class TestConcurrentRequests:
    """Performance tests for concurrent API requests."""

    def test_concurrent_employee_queries_when_run_then_handles_load(
        self,
        test_client_with_session: TestClient,
    ) -> None:
        """Test that 10 concurrent employee queries complete successfully."""
        # Arrange
        num_concurrent = 10
        results = []

        def query_employees() -> dict:
            response = test_client_with_session.get("/api/employees")
            assert response.status_code == 200
            return response.json()

        # Act
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            futures = [executor.submit(query_employees) for _ in range(num_concurrent)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]

        # Assert
        assert len(results) == num_concurrent
        for result in results:
            assert "employees" in result
            assert "total" in result

    def test_concurrent_statistics_queries_when_run_then_handles_load(
        self,
        test_client_with_session: TestClient,
    ) -> None:
        """Test that 10 concurrent statistics queries complete successfully."""
        # Arrange
        num_concurrent = 10
        results = []

        def query_statistics() -> dict:
            response = test_client_with_session.get("/api/statistics")
            assert response.status_code == 200
            return response.json()

        # Act
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            futures = [executor.submit(query_statistics) for _ in range(num_concurrent)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]

        # Assert
        assert len(results) == num_concurrent
        for result in results:
            assert "distribution" in result

    def test_concurrent_employee_moves_when_run_then_handles_load(
        self,
        test_client_with_session: TestClient,
    ) -> None:
        """Test that concurrent employee moves complete successfully.

        Note: test_client_with_session uses small dataset with 5 employees.
        We'll perform 10 moves by moving each employee twice.
        """
        # Arrange
        num_concurrent = 10
        results = []

        def move_employee(move_index: int) -> dict:
            # Cycle through employee IDs 1-5 (0->1, 1->2, ..., 5->1, 6->2, etc.)
            employee_id = (move_index % 5) + 1

            # Alternate between different moves
            perf = "High" if move_index % 2 == 0 else "Medium"
            pot = "High" if move_index % 3 == 0 else "Medium"

            response = test_client_with_session.patch(
                f"/api/employees/{employee_id}/move",
                json={
                    "performance": perf,
                    "potential": pot,
                },
            )
            assert response.status_code == 200
            return response.json()

        # Act
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            # Create 10 move operations across 5 employees
            futures = [executor.submit(move_employee, i) for i in range(num_concurrent)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]

        # Assert
        assert len(results) == num_concurrent
        for result in results:
            assert result["success"] is True
            assert "employee" in result
            assert "change" in result


class TestMemoryUsage:
    """Performance tests for memory usage."""

    def test_memory_usage_when_large_dataset_loaded_then_within_limit(
        self,
        test_client_with_large_session: TestClient,
    ) -> None:
        """Test that memory usage with large dataset increases by <200MB."""
        # Arrange
        process = psutil.Process()
        initial_memory = process.memory_info().rss / (1024 * 1024)  # MB

        # Act - Perform multiple operations that would load data
        for _ in range(10):
            # Query all employees
            response = test_client_with_large_session.get("/api/employees")
            assert response.status_code == 200

            # Get statistics
            response = test_client_with_large_session.get("/api/statistics")
            assert response.status_code == 200

            # Get intelligence
            response = test_client_with_large_session.get("/api/intelligence")
            assert response.status_code == 200

        final_memory = process.memory_info().rss / (1024 * 1024)  # MB
        memory_increase = final_memory - initial_memory

        # Assert
        # Allow up to 200MB increase for large dataset operations
        assert memory_increase < 200, (
            f"Memory increased by {memory_increase:.1f}MB (target: <200MB)"
        )


class TestConcurrentReadWrite:
    """Performance tests for concurrent read/write operations."""

    def test_concurrent_reads_with_writes_when_run_then_maintains_consistency(
        self,
        test_client_with_session: TestClient,
    ) -> None:
        """Test that concurrent reads and writes maintain data consistency."""
        # Arrange
        num_readers = 5
        num_writers = 5
        read_results = []
        write_results = []

        def read_employee(employee_id: int) -> dict:
            response = test_client_with_session.get(f"/api/employees/{employee_id}")
            assert response.status_code == 200
            return response.json()

        def write_employee(employee_id: int) -> dict:
            response = test_client_with_session.patch(
                f"/api/employees/{employee_id}",
                json={
                    "notes": f"Updated by concurrent test {employee_id}",
                },
            )
            assert response.status_code == 200
            return response.json()

        # Act
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=num_readers + num_writers
        ) as executor:
            # Submit read operations
            read_futures = [executor.submit(read_employee, i % 5 + 1) for i in range(num_readers)]

            # Submit write operations
            write_futures = [executor.submit(write_employee, i % 5 + 1) for i in range(num_writers)]

            # Collect results
            read_results = [
                future.result() for future in concurrent.futures.as_completed(read_futures)
            ]
            write_results = [
                future.result() for future in concurrent.futures.as_completed(write_futures)
            ]

        # Assert
        assert len(read_results) == num_readers
        assert len(write_results) == num_writers

        # Verify all reads returned valid employee data
        for result in read_results:
            assert "employee_id" in result
            assert "name" in result

        # Verify all writes succeeded
        for result in write_results:
            assert result["success"] is True
