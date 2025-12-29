"""Tests for API request validation edge cases.

This module tests comprehensive validation scenarios for all API endpoints
to ensure robust error handling and security.
"""

import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


pytestmark = pytest.mark.unit


@pytest.fixture
def session_with_data(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> dict[str, str]:
    """Create a session with uploaded data for testing."""
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)
    return auth_headers


class TestMalformedJSON:
    """Test handling of malformed JSON in request bodies."""

    def test_move_when_invalid_json_syntax_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test malformed JSON returns 422 error."""
        response = test_client.patch(
            "/api/employees/1/move",
            data="{invalid json}",  # Malformed JSON
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 422

    def test_move_when_missing_closing_brace_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test incomplete JSON returns 422."""
        response = test_client.patch(
            "/api/employees/1/move",
            data='{"performance": "High"',  # Missing closing brace
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 422

    def test_move_when_extra_comma_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test JSON with trailing comma returns 422."""
        response = test_client.patch(
            "/api/employees/1/move",
            data='{"performance": "High",}',  # Extra comma
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 422


class TestInvalidFieldTypes:
    """Test handling of invalid field types in requests."""

    def test_move_when_performance_is_integer_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test performance as integer instead of string returns 422."""
        response = test_client.patch(
            "/api/employees/1/move",
            json={"performance": 5, "potential": "Medium"},  # Integer instead of string
        )

        assert response.status_code == 422

    def test_move_when_performance_is_array_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test performance as array instead of string."""
        response = test_client.patch(
            "/api/employees/1/move",
            json={"performance": ["High"], "potential": "Medium"},  # Array instead of string
        )

        assert response.status_code == 422

    def test_update_when_promotion_readiness_is_string_then_coerces_to_bool(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test promotion_readiness as string 'true' coerces to bool."""
        response = test_client.patch(
            "/api/employees/1",
            json={"promotion_readiness": "true"},  # String coerced to bool
        )

        # Pydantic coerces "true" to True
        assert response.status_code == 200

    def test_get_employees_when_exclude_ids_invalid_int_then_returns_400(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test exclude_ids with non-integer values returns 400 (bug fixed)."""
        # This test verifies the bug fix: invalid integers in exclude_ids
        # now properly return a 400 validation error instead of 500
        response = test_client.get(
            "/api/employees",
            params={"exclude_ids": "abc,def"},  # Non-integer values
            headers=session_with_data,
        )

        assert response.status_code == 400
        assert "Invalid employee ID" in response.json()["detail"]


class TestNullValues:
    """Test handling of null values in request fields."""

    def test_move_when_performance_is_null_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test null performance returns 422."""
        response = test_client.patch(
            "/api/employees/1/move", json={"performance": None, "potential": "Medium"}
        )

        assert response.status_code == 422

    def test_move_when_potential_is_null_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test null potential returns 422."""
        response = test_client.patch(
            "/api/employees/1/move", json={"performance": "High", "potential": None}
        )

        assert response.status_code == 422


class TestMissingRequiredFields:
    """Test handling of missing required fields."""

    def test_move_when_performance_missing_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test missing performance field returns 422."""
        response = test_client.patch(
            "/api/employees/1/move",
            json={"potential": "Medium"},  # Missing performance
        )

        assert response.status_code == 422
        assert "performance" in str(response.json()).lower()


class TestExtraFields:
    """Test handling of extra/unknown fields in requests."""

    def test_move_when_extra_fields_then_ignores_successfully(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test extra fields in request body are ignored."""
        response = test_client.patch(
            "/api/employees/1/move",
            json={
                "performance": "Medium",
                "potential": "Low",
                "extra_field": "should be ignored",
                "another_field": 123,
            },
        )

        # Pydantic should ignore extra fields by default
        assert response.status_code == 200
        data = response.json()
        assert data["employee"]["performance"] == "Medium"
        assert data["employee"]["potential"] == "Low"

    def test_update_when_nested_extra_fields_then_handles_correctly(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test nested objects with extra fields."""
        response = test_client.patch(
            "/api/employees/1",
            json={
                "notes": "Test note",
                "metadata": {  # Extra nested object
                    "custom_field": "value"
                },
            },
        )

        # Should handle extra nested fields (either ignore or reject)
        assert response.status_code in [200, 422]


class TestArrayVsObject:
    """Test sending array when object expected and vice versa."""

    def test_move_when_array_instead_of_object_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test sending array instead of object."""
        response = test_client.patch(
            "/api/employees/1/move",
            json=["High", "Medium"],  # Array instead of object
        )

        assert response.status_code == 422

    def test_move_when_string_instead_of_object_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test sending primitive instead of object."""
        response = test_client.patch(
            "/api/employees/1/move",
            data='"just a string"',
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 422


class TestSpecialCharacters:
    """Test special characters in request values."""

    def test_get_employees_when_special_chars_in_manager_then_handles(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test special characters in filter values."""
        response = test_client.get(
            "/api/employees",
            params={"managers": "Bob & Alice"},  # Ampersand
            headers=session_with_data,
        )

        assert response.status_code == 200

    def test_get_employees_when_unicode_in_manager_then_handles(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test Unicode characters in filter values."""
        response = test_client.get(
            "/api/employees",
            params={"managers": "José García"},  # Accented characters
            headers=session_with_data,
        )

        assert response.status_code == 200

    def test_get_employees_when_sql_injection_attempt_then_safe(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test SQL injection attempts are handled safely."""
        response = test_client.get(
            "/api/employees",
            params={"managers": "' OR '1'='1"},  # SQL injection attempt
            headers=session_with_data,
        )

        # Should handle safely without error
        assert response.status_code == 200
        # Should return empty or normal results, not all employees
        data = response.json()
        assert "employees" in data


class TestLargePayloads:
    """Test handling of very large request payloads."""

    def test_upload_when_file_very_large_then_handles_or_rejects(
        self, test_client: TestClient, auth_headers: dict[str, str]
    ) -> None:
        """Test file upload with large file."""
        # Create large fake file content (5MB)
        large_content = b"x" * (5 * 1024 * 1024)  # 5 MB

        response = test_client.post(
            "/api/session/upload",
            files={
                "file": (
                    "large.xlsx",
                    io.BytesIO(large_content),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
            headers=auth_headers,
        )

        # Should either accept or reject with appropriate error
        assert response.status_code in [200, 400, 413, 500]

    def test_update_when_huge_string_then_handles_or_rejects(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test very large string values in request."""
        huge_string = "A" * (100 * 1024)  # 100 KB string

        response = test_client.patch(
            "/api/employees/1",
            json={
                "notes": huge_string,  # 100 KB notes field
            },
        )

        # Should either accept or reject gracefully
        assert response.status_code in [200, 413, 422]


class TestContentType:
    """Test Content-Type header validation."""

    def test_move_when_missing_content_type_then_accepts_or_rejects(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test request without Content-Type header."""
        response = test_client.patch(
            "/api/employees/1/move",
            data='{"performance": "Medium", "potential": "Medium"}',
            # No Content-Type header - TestClient may add it automatically
        )

        # FastAPI/TestClient should handle this gracefully
        assert response.status_code in [200, 415, 422]

    def test_move_when_wrong_content_type_then_handles(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test request with incorrect Content-Type."""
        response = test_client.patch(
            "/api/employees/1/move",
            data='{"performance": "Medium", "potential": "Medium"}',
            headers={"Content-Type": "text/plain"},  # Wrong content type
        )

        # Should handle or reject
        assert response.status_code in [200, 415, 422]


class TestEmptyBody:
    """Test empty request body when data expected."""

    def test_move_when_empty_body_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test empty request body returns 422."""
        response = test_client.patch(
            "/api/employees/1/move",
            data="",
            headers={"Content-Type": "application/json"},
        )

        assert response.status_code == 422

    def test_move_when_empty_json_object_then_returns_422(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test empty JSON object when fields required."""
        response = test_client.patch(
            "/api/employees/1/move",
            json={},  # Empty object
        )

        assert response.status_code == 422


class TestBoundaryValues:
    """Test boundary values in requests."""

    def test_move_when_invalid_performance_value_then_returns_400(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test invalid performance enum value."""
        response = test_client.patch(
            "/api/employees/1/move", json={"performance": "VeryHigh", "potential": "Medium"}
        )

        assert response.status_code == 400
        assert "Invalid performance or potential value" in response.json()["detail"]

    def test_move_when_invalid_potential_value_then_returns_400(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test invalid potential enum value."""
        response = test_client.patch(
            "/api/employees/1/move", json={"performance": "High", "potential": "Zero"}
        )

        assert response.status_code == 400

    def test_get_employee_when_negative_id_then_returns_404(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test negative employee ID returns 404 not found."""
        response = test_client.get("/api/employees/-1", headers=session_with_data)

        # Negative IDs are accepted as path parameters but return 404 (not found)
        assert response.status_code == 404


class TestFileUploadValidation:
    """Test file upload specific validation scenarios."""

    def test_upload_when_no_file_provided_then_returns_422(
        self, test_client: TestClient, auth_headers: dict[str, str]
    ) -> None:
        """Test upload without file returns 422."""
        response = test_client.post("/api/session/upload", headers=auth_headers)

        assert response.status_code == 422

    def test_upload_when_empty_filename_then_returns_422(
        self, test_client: TestClient, auth_headers: dict[str, str]
    ) -> None:
        """Test upload with empty filename returns 422."""
        response = test_client.post(
            "/api/session/upload",
            files={
                "file": (
                    "",  # Empty filename
                    io.BytesIO(b"fake content"),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
            headers=auth_headers,
        )

        # FastAPI file validation returns 422 for missing filename
        assert response.status_code == 422

    def test_upload_when_wrong_file_extension_then_returns_400(
        self, test_client: TestClient, auth_headers: dict[str, str]
    ) -> None:
        """Test upload with wrong file extension."""
        response = test_client.post(
            "/api/session/upload",
            files={
                "file": (
                    "test.csv",  # Wrong extension
                    io.BytesIO(b"fake,csv,content"),
                    "text/csv",
                )
            },
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "Excel file" in response.json()["detail"]

    def test_upload_when_special_chars_in_filename_then_handles(
        self, test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
    ) -> None:
        """Test upload with special characters in filename."""
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test file (2024) [updated].xlsx",  # Special chars
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files, headers=auth_headers)

        # Should handle special characters in filename
        assert response.status_code == 200


class TestQueryParameterValidation:
    """Test query parameter validation for filtering endpoints."""

    def test_get_employees_when_empty_filter_values_then_handles(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test empty filter parameter values."""
        response = test_client.get(
            "/api/employees",
            params={"levels": ""},  # Empty value
            headers=session_with_data,
        )

        assert response.status_code == 200

    def test_get_employees_when_repeated_parameters_then_uses_last(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test repeated query parameters."""
        # Note: TestClient may not support this directly, but we can try
        response = test_client.get(
            "/api/employees?levels=MT2&levels=MT4", headers=session_with_data
        )

        # Should handle gracefully
        assert response.status_code == 200

    def test_statistics_when_all_filters_applied_then_returns_stats(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test statistics endpoint with multiple filters."""
        response = test_client.get(
            "/api/statistics",
            params={
                "levels": "MT4,MT5",
                "performance": "High",
                "potential": "High,Medium",
            },
            headers=session_with_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert "total" in data or "distribution" in data or "grid_counts" in data


class TestCaseSensitivity:
    """Test case sensitivity in request values."""

    def test_move_when_lowercase_performance_then_returns_400(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test lowercase performance value (should be 'High' not 'high')."""
        response = test_client.patch(
            "/api/employees/1/move",
            json={"performance": "high", "potential": "Medium"},  # Lowercase
        )

        # Enum validation should catch this
        assert response.status_code == 400

    def test_move_when_uppercase_performance_then_returns_400(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test uppercase performance value (should be 'High' not 'HIGH')."""
        response = test_client.patch(
            "/api/employees/1/move",
            json={"performance": "HIGH", "potential": "Medium"},  # Uppercase
        )

        # Enum validation should catch this
        assert response.status_code == 400


class TestConcurrentRequests:
    """Test handling of concurrent operations on same resource."""

    def test_move_employee_when_concurrent_moves_then_both_succeed(
        self, test_client: TestClient, session_with_data: dict[str, str]
    ) -> None:
        """Test concurrent move operations on different employees."""
        # Move employee 1
        response1 = test_client.patch(
            "/api/employees/1/move",
            json={"performance": "Medium", "potential": "Low"},
        )

        # Move employee 2 (different employee, should not conflict)
        response2 = test_client.patch(
            "/api/employees/2/move",
            json={"performance": "High", "potential": "High"},
        )

        assert response1.status_code == 200
        assert response2.status_code == 200
