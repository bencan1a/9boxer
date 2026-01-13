"""Integration tests for sample data generation API endpoint."""

import pytest
from fastapi.testclient import TestClient

pytestmark = [pytest.mark.integration]


def test_generate_sample_employees_when_default_request_then_returns_200_ok(
    test_client: TestClient,
) -> None:
    """Test POST /api/employees/generate-sample returns 200 OK with default parameters."""
    response = test_client.post("/api/employees/generate-sample", json={})

    assert response.status_code == 200
    data = response.json()
    assert "employees" in data
    assert "metadata" in data
    assert "session_id" in data
    assert isinstance(data["session_id"], str)
    assert len(data["employees"]) == 200  # Default size
    assert data["metadata"]["total"] == 200


def test_generate_sample_employees_when_custom_size_then_matches_response_length(
    test_client: TestClient,
) -> None:
    """Test requested size matches response length."""
    response = test_client.post("/api/employees/generate-sample", json={"size": 100})

    assert response.status_code == 200
    data = response.json()
    assert len(data["employees"]) == 100
    assert data["metadata"]["total"] == 100


def test_generate_sample_employees_when_include_bias_true_then_has_bias_patterns(
    test_client: TestClient,
) -> None:
    """Test include_bias=True includes bias patterns in metadata."""
    response = test_client.post(
        "/api/employees/generate-sample", json={"size": 100, "include_bias": True}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["bias_patterns"] is not None
    assert "usa_employees" in data["metadata"]["bias_patterns"]
    assert "sales_employees" in data["metadata"]["bias_patterns"]
    assert "usa_high_performer_rate" in data["metadata"]["bias_patterns"]
    assert "sales_high_performer_rate" in data["metadata"]["bias_patterns"]


def test_generate_sample_employees_when_include_bias_false_then_excludes_bias_patterns(
    test_client: TestClient,
) -> None:
    """Test include_bias=False excludes bias patterns from metadata."""
    response = test_client.post(
        "/api/employees/generate-sample", json={"size": 100, "include_bias": False}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["bias_patterns"] is None


def test_generate_sample_employees_when_seed_provided_then_reproducible_results(
    test_client: TestClient,
) -> None:
    """Test seed parameter produces reproducible results."""
    # Generate with seed 42
    response1 = test_client.post("/api/employees/generate-sample", json={"size": 50, "seed": 42})
    assert response1.status_code == 200
    data1 = response1.json()

    # Generate again with same seed
    response2 = test_client.post("/api/employees/generate-sample", json={"size": 50, "seed": 42})
    assert response2.status_code == 200
    data2 = response2.json()

    # Results should be identical
    assert len(data1["employees"]) == len(data2["employees"])
    for emp1, emp2 in zip(data1["employees"], data2["employees"], strict=False):
        assert emp1["employee_id"] == emp2["employee_id"]
        assert emp1["name"] == emp2["name"]
        assert emp1["job_level"] == emp2["job_level"]
        assert emp1["performance"] == emp2["performance"]
        assert emp1["potential"] == emp2["potential"]


def test_generate_sample_employees_when_size_below_minimum_then_returns_400(
    test_client: TestClient,
) -> None:
    """Test size < 50 returns 400 Bad Request."""
    response = test_client.post("/api/employees/generate-sample", json={"size": 49})

    assert response.status_code == 422  # Pydantic validation error
    data = response.json()
    assert "detail" in data


def test_generate_sample_employees_when_size_above_maximum_then_returns_400(
    test_client: TestClient,
) -> None:
    """Test size > 10000 returns 400 Bad Request."""
    response = test_client.post("/api/employees/generate-sample", json={"size": 10001})

    assert response.status_code == 422  # Pydantic validation error
    data = response.json()
    assert "detail" in data


def test_generate_sample_employees_when_generated_then_has_required_fields(
    test_client: TestClient,
) -> None:
    """Test generated employees have all required fields."""
    response = test_client.post("/api/employees/generate-sample", json={"size": 50})

    assert response.status_code == 200
    data = response.json()
    employees = data["employees"]

    # Check first employee has all required fields
    assert len(employees) > 0
    emp = employees[0]

    # Identifiers
    assert "employee_id" in emp
    assert "name" in emp

    # Job Information
    assert "business_title" in emp
    assert "job_title" in emp
    assert "job_profile" in emp
    assert "job_level" in emp
    assert "job_function" in emp
    assert "location" in emp

    # Management
    assert "direct_manager" in emp

    # Tenure
    assert "hire_date" in emp
    assert "tenure_category" in emp
    assert "time_in_job_profile" in emp

    # Current Performance
    assert "performance" in emp
    assert "potential" in emp
    assert "grid_position" in emp
    assert "talent_indicator" in emp

    # Performance should be valid
    assert emp["performance"] in ["Low", "Medium", "High"]
    assert emp["potential"] in ["Low", "Medium", "High"]
    assert 1 <= emp["grid_position"] <= 9

    # Job level should be valid
    assert emp["job_level"] in ["MT1", "MT2", "MT3", "MT4", "MT5", "MT6"]


@pytest.mark.slow
def test_generate_sample_employees_when_300_employees_then_completes_under_2_seconds(
    test_client: TestClient,
) -> None:
    """Test performance: <2 seconds for 300 employees end-to-end."""
    import time

    start_time = time.time()
    response = test_client.post("/api/employees/generate-sample", json={"size": 300})
    end_time = time.time()

    assert response.status_code == 200
    data = response.json()
    assert len(data["employees"]) == 300

    elapsed = end_time - start_time
    assert elapsed < 2.0, f"Generation took {elapsed:.3f}s, expected < 2.0s"


def test_generate_sample_employees_when_size_at_new_maximum_then_returns_200_ok(
    test_client: TestClient,
) -> None:
    """Test size = 10000 (new maximum) returns 200 OK."""
    response = test_client.post("/api/employees/generate-sample", json={"size": 10000})

    assert response.status_code == 200
    data = response.json()
    assert len(data["employees"]) == 10000
    assert data["metadata"]["total"] == 10000


def test_generate_sample_employees_when_large_dataset_then_has_valid_structure(
    test_client: TestClient,
) -> None:
    """Test large dataset (1000 employees) maintains valid structure."""
    response = test_client.post("/api/employees/generate-sample", json={"size": 1000})

    assert response.status_code == 200
    data = response.json()
    assert len(data["employees"]) == 1000

    # Verify all employees have required fields
    for emp in data["employees"]:
        assert "employee_id" in emp
        assert "name" in emp
        assert "performance" in emp
        assert "potential" in emp
        assert emp["performance"] in ["Low", "Medium", "High"]
        assert emp["potential"] in ["Low", "Medium", "High"]
        assert 1 <= emp["grid_position"] <= 9


@pytest.mark.slow
def test_generate_sample_employees_when_5000_employees_then_completes_successfully(
    test_client: TestClient,
) -> None:
    """Test enterprise scale: 5000 employees completes successfully."""
    import time

    start_time = time.time()
    response = test_client.post("/api/employees/generate-sample", json={"size": 5000})
    end_time = time.time()

    assert response.status_code == 200
    data = response.json()
    assert len(data["employees"]) == 5000
    assert data["metadata"]["total"] == 5000

    elapsed = end_time - start_time
    # Allow more time for larger datasets - should complete within 10 seconds
    assert elapsed < 10.0, f"Generation took {elapsed:.3f}s, expected < 10.0s"


def test_generate_sample_employees_when_metadata_then_has_correct_structure(
    test_client: TestClient,
) -> None:
    """Test metadata has correct structure and data."""
    response = test_client.post("/api/employees/generate-sample", json={"size": 100})

    assert response.status_code == 200
    data = response.json()
    metadata = data["metadata"]

    # Check required metadata fields
    assert "total" in metadata
    assert "locations" in metadata
    assert "functions" in metadata
    assert "grid_positions" in metadata

    # Verify data types
    assert isinstance(metadata["total"], int)
    assert isinstance(metadata["locations"], list)
    assert isinstance(metadata["functions"], list)
    assert isinstance(metadata["grid_positions"], list)

    # Verify locations are sorted and non-empty
    assert len(metadata["locations"]) > 0
    assert metadata["locations"] == sorted(metadata["locations"])

    # Verify functions are sorted and non-empty
    assert len(metadata["functions"]) > 0
    assert metadata["functions"] == sorted(metadata["functions"])

    # Verify all 9 grid positions are covered
    assert len(metadata["grid_positions"]) == 9
    assert metadata["grid_positions"] == sorted(metadata["grid_positions"])
    assert set(metadata["grid_positions"]) == {1, 2, 3, 4, 5, 6, 7, 8, 9}


def test_get_column_schema_when_called_then_returns_200_ok(
    test_client: TestClient,
) -> None:
    """Test GET /api/employees/column-schema returns 200 OK."""
    response = test_client.get("/api/employees/column-schema")

    assert response.status_code == 200
    data = response.json()
    assert "columns" in data
    assert "total_columns" in data
    assert "required_columns" in data
    assert "categories" in data


def test_get_column_schema_when_called_then_has_required_columns(
    test_client: TestClient,
) -> None:
    """Test column schema includes the 4 required columns."""
    response = test_client.get("/api/employees/column-schema")

    assert response.status_code == 200
    data = response.json()

    required_names = [col["name"] for col in data["columns"] if col["required"]]
    assert "Employee ID" in required_names
    assert "Worker" in required_names
    assert "Current Performance" in required_names
    assert "Current Potential" in required_names
    assert data["required_columns"] == 4


def test_get_column_schema_when_called_then_columns_have_correct_structure(
    test_client: TestClient,
) -> None:
    """Test each column has required metadata fields."""
    response = test_client.get("/api/employees/column-schema")

    assert response.status_code == 200
    data = response.json()

    for col in data["columns"]:
        assert "name" in col
        assert "data_type" in col
        assert "description" in col
        assert "required" in col
        assert "category" in col
        assert isinstance(col["name"], str)
        assert isinstance(col["required"], bool)


def test_get_column_schema_when_called_then_has_all_categories(
    test_client: TestClient,
) -> None:
    """Test column schema includes all expected categories."""
    response = test_client.get("/api/employees/column-schema")

    assert response.status_code == 200
    data = response.json()

    expected_categories = {"identity", "ratings", "organization", "job_info", "history", "tracking", "donut"}
    actual_categories = set(data["categories"])
    assert expected_categories == actual_categories


def test_get_column_schema_when_called_then_performance_has_valid_values(
    test_client: TestClient,
) -> None:
    """Test Performance column has correct valid values."""
    response = test_client.get("/api/employees/column-schema")

    assert response.status_code == 200
    data = response.json()

    performance_col = next(col for col in data["columns"] if col["name"] == "Current Performance")
    assert performance_col["data_type"] == "enum"
    assert performance_col["valid_values"] == ["Low", "Medium", "High"]
    assert performance_col["category"] == "ratings"
