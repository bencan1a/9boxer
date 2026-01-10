"""Tests for update analytics API endpoints."""

from datetime import datetime
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from ninebox.models.update_analytics import (
    UpdateAnalyticsSummary,
    UpdateEventRecord,
)


pytestmark = pytest.mark.unit


@pytest.fixture
def mock_analytics_service():
    """Mock UpdateAnalyticsService for testing."""
    return MagicMock()


@pytest.fixture
def test_client_with_mock_service(test_client: TestClient, mock_analytics_service: MagicMock):
    """Create test client with mocked analytics service."""
    from ninebox.api import update_analytics
    from ninebox.main import app

    # Override the dependency
    app.dependency_overrides[update_analytics.get_analytics_service] = lambda: mock_analytics_service

    yield test_client

    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture
def sample_update_event() -> dict:
    """Sample update event data for testing."""
    return {
        "event_type": "check",
        "from_version": "1.0.0",
        "to_version": "1.1.0",
        "platform": "win32",
        "arch": "x64",
        "timestamp": datetime.utcnow().isoformat(),
    }


@pytest.fixture
def sample_summary() -> UpdateAnalyticsSummary:
    """Sample analytics summary for testing."""
    return UpdateAnalyticsSummary(
        total_checks=100,
        total_downloads=50,
        total_installs=45,
        total_errors=5,
        success_rate=0.9,
        most_common_error="Network timeout",
        version_distribution={"1.1.0": 30, "1.2.0": 20},
        platform_distribution={"win32": 60, "darwin": 40},
    )


@pytest.fixture
def sample_event_records() -> list[UpdateEventRecord]:
    """Sample event records for testing."""
    return [
        UpdateEventRecord(
            id=1,
            event_type="check",
            from_version="1.0.0",
            to_version="1.1.0",
            platform="win32",
            arch="x64",
            error_message=None,
            bytes_downloaded=None,
            total_bytes=None,
            percent_complete=None,
            timestamp=datetime.utcnow(),
            session_id="session-123",
        ),
        UpdateEventRecord(
            id=2,
            event_type="download_complete",
            from_version="1.0.0",
            to_version="1.1.0",
            platform="darwin",
            arch="arm64",
            error_message=None,
            bytes_downloaded=10485760,
            total_bytes=10485760,
            percent_complete=100.0,
            timestamp=datetime.utcnow(),
            session_id="session-456",
        ),
    ]


class TestRecordUpdateEvent:
    """Tests for POST /analytics/update-events endpoint."""

    def test_record_update_event_when_valid_then_returns_201(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock, sample_update_event: dict
    ) -> None:
        """Test recording update event returns 201 with event ID."""
        mock_analytics_service.record_event.return_value = 123

        response = test_client_with_mock_service.post("/api/analytics/update-events", json=sample_update_event)

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["id"] == 123
        mock_analytics_service.record_event.assert_called_once()

    def test_record_update_event_when_check_type_then_stores_event(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test recording a check event."""
        event_data = {
            "event_type": "check",
            "from_version": "1.0.0",
            "platform": "win32",
            "arch": "x64",
            "timestamp": datetime.utcnow().isoformat(),
        }
        mock_analytics_service.record_event.return_value = 1

        response = test_client_with_mock_service.post("/api/analytics/update-events", json=event_data)

        assert response.status_code == 201
        call_args = mock_analytics_service.record_event.call_args[0][0]
        assert call_args.event_type == "check"
        assert call_args.from_version == "1.0.0"

    def test_record_update_event_when_error_type_then_includes_error_message(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test recording an error event with error message."""
        event_data = {
            "event_type": "error",
            "from_version": "1.0.0",
            "platform": "win32",
            "arch": "x64",
            "error_message": "Download failed: Network error",
            "timestamp": datetime.utcnow().isoformat(),
        }
        mock_analytics_service.record_event.return_value = 1

        response = test_client_with_mock_service.post("/api/analytics/update-events", json=event_data)

        assert response.status_code == 201
        call_args = mock_analytics_service.record_event.call_args[0][0]
        assert call_args.event_type == "error"
        assert call_args.error_message == "Download failed: Network error"

    def test_record_update_event_when_progress_type_then_includes_progress_data(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test recording a download progress event."""
        event_data = {
            "event_type": "download_progress",
            "from_version": "1.0.0",
            "to_version": "1.1.0",
            "platform": "darwin",
            "arch": "arm64",
            "bytes_downloaded": 5242880,
            "total_bytes": 10485760,
            "percent_complete": 50.0,
            "timestamp": datetime.utcnow().isoformat(),
        }
        mock_analytics_service.record_event.return_value = 1

        response = test_client_with_mock_service.post("/api/analytics/update-events", json=event_data)

        assert response.status_code == 201
        call_args = mock_analytics_service.record_event.call_args[0][0]
        assert call_args.event_type == "download_progress"
        assert call_args.bytes_downloaded == 5242880
        assert call_args.total_bytes == 10485760
        assert call_args.percent_complete == 50.0

    def test_record_update_event_when_invalid_event_type_then_returns_422(
        self, test_client_with_mock_service: TestClient
    ) -> None:
        """Test that invalid event type returns validation error."""
        event_data = {
            "event_type": "invalid_type",
            "from_version": "1.0.0",
            "platform": "win32",
            "arch": "x64",
            "timestamp": datetime.utcnow().isoformat(),
        }

        response = test_client_with_mock_service.post("/api/analytics/update-events", json=event_data)

        assert response.status_code == 422

    def test_record_update_event_when_missing_required_field_then_returns_422(
        self, test_client_with_mock_service: TestClient
    ) -> None:
        """Test that missing required fields return validation error."""
        event_data = {
            "event_type": "check",
            "from_version": "1.0.0",
            # Missing platform and arch
            "timestamp": datetime.utcnow().isoformat(),
        }

        response = test_client_with_mock_service.post("/api/analytics/update-events", json=event_data)

        assert response.status_code == 422

    def test_record_update_event_when_service_error_then_returns_500(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock, sample_update_event: dict
    ) -> None:
        """Test that service errors return 500."""
        mock_analytics_service.record_event.side_effect = Exception("Database error")

        response = test_client_with_mock_service.post("/api/analytics/update-events", json=sample_update_event)

        assert response.status_code == 500
        assert "Failed to record event" in response.json()["detail"]

    def test_record_update_event_when_all_event_types_then_handles_correctly(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test that all valid event types are accepted."""
        event_types = [
            "check",
            "available",
            "download_start",
            "download_progress",
            "download_complete",
            "install",
            "error",
        ]
        mock_analytics_service.record_event.return_value = 1

        for event_type in event_types:
            event_data = {
                "event_type": event_type,
                "from_version": "1.0.0",
                "platform": "win32",
                "arch": "x64",
                "timestamp": datetime.utcnow().isoformat(),
            }
            response = test_client_with_mock_service.post("/api/analytics/update-events", json=event_data)
            assert response.status_code == 201, f"Failed for event_type: {event_type}"


class TestGetUpdateSummary:
    """Tests for GET /analytics/update-events/summary endpoint."""

    def test_get_update_summary_when_default_days_then_returns_summary(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock, sample_summary: UpdateAnalyticsSummary
    ) -> None:
        """Test getting summary with default days parameter."""
        mock_analytics_service.get_summary.return_value = sample_summary

        response = test_client_with_mock_service.get("/api/analytics/update-events/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_checks"] == 100
        assert data["total_downloads"] == 50
        assert data["total_installs"] == 45
        assert data["total_errors"] == 5
        assert data["success_rate"] == 0.9
        mock_analytics_service.get_summary.assert_called_once_with(days=30)

    def test_get_update_summary_when_custom_days_then_passes_parameter(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock, sample_summary: UpdateAnalyticsSummary
    ) -> None:
        """Test getting summary with custom days parameter."""
        mock_analytics_service.get_summary.return_value = sample_summary

        response = test_client_with_mock_service.get("/api/analytics/update-events/summary?days=7")

        assert response.status_code == 200
        mock_analytics_service.get_summary.assert_called_once_with(days=7)

    def test_get_update_summary_when_no_data_then_returns_empty_summary(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test getting summary with no analytics data."""
        empty_summary = UpdateAnalyticsSummary(
            total_checks=0,
            total_downloads=0,
            total_installs=0,
            total_errors=0,
            success_rate=0.0,
            most_common_error=None,
            version_distribution={},
            platform_distribution={},
        )
        mock_analytics_service.get_summary.return_value = empty_summary

        response = test_client_with_mock_service.get("/api/analytics/update-events/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_checks"] == 0
        assert data["total_downloads"] == 0
        assert data["success_rate"] == 0.0

    def test_get_update_summary_when_has_error_data_then_includes_most_common(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test that most common error is included in summary."""
        summary = UpdateAnalyticsSummary(
            total_checks=10,
            total_downloads=5,
            total_installs=3,
            total_errors=2,
            success_rate=0.6,
            most_common_error="Network timeout",
            version_distribution={},
            platform_distribution={},
        )
        mock_analytics_service.get_summary.return_value = summary

        response = test_client_with_mock_service.get("/api/analytics/update-events/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["most_common_error"] == "Network timeout"

    def test_get_update_summary_when_has_distributions_then_includes_them(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock, sample_summary: UpdateAnalyticsSummary
    ) -> None:
        """Test that version and platform distributions are included."""
        mock_analytics_service.get_summary.return_value = sample_summary

        response = test_client_with_mock_service.get("/api/analytics/update-events/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["version_distribution"] == {"1.1.0": 30, "1.2.0": 20}
        assert data["platform_distribution"] == {"win32": 60, "darwin": 40}

    def test_get_update_summary_when_service_error_then_returns_500(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test that service errors return 500."""
        mock_analytics_service.get_summary.side_effect = Exception("Database error")

        response = test_client_with_mock_service.get("/api/analytics/update-events/summary")

        assert response.status_code == 500
        assert "Failed to get summary" in response.json()["detail"]

    def test_get_update_summary_when_invalid_days_then_returns_422(
        self, test_client_with_mock_service: TestClient
    ) -> None:
        """Test that invalid days parameter returns validation error."""
        response = test_client_with_mock_service.get("/api/analytics/update-events/summary?days=invalid")

        assert response.status_code == 422


class TestGetUpdateEvents:
    """Tests for GET /analytics/update-events endpoint."""

    def test_get_update_events_when_no_filter_then_returns_all_events(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock, sample_event_records: list[UpdateEventRecord]
    ) -> None:
        """Test getting all events without filters."""
        mock_analytics_service.get_events.return_value = sample_event_records

        response = test_client_with_mock_service.get("/api/analytics/update-events")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["id"] == 1
        assert data[0]["event_type"] == "check"
        mock_analytics_service.get_events.assert_called_once_with(event_type=None, limit=100)

    def test_get_update_events_when_filter_by_type_then_filters_correctly(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test filtering events by event type."""
        filtered_records = [
            UpdateEventRecord(
                id=1,
                event_type="check",
                from_version="1.0.0",
                to_version="1.1.0",
                platform="win32",
                arch="x64",
                error_message=None,
                bytes_downloaded=None,
                total_bytes=None,
                percent_complete=None,
                timestamp=datetime.utcnow(),
                session_id=None,
            )
        ]
        mock_analytics_service.get_events.return_value = filtered_records

        response = test_client_with_mock_service.get("/api/analytics/update-events?event_type=check")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["event_type"] == "check"
        mock_analytics_service.get_events.assert_called_once_with(event_type="check", limit=100)

    def test_get_update_events_when_custom_limit_then_respects_limit(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock, sample_event_records: list[UpdateEventRecord]
    ) -> None:
        """Test that custom limit is passed to service."""
        mock_analytics_service.get_events.return_value = sample_event_records

        response = test_client_with_mock_service.get("/api/analytics/update-events?limit=50")

        assert response.status_code == 200
        mock_analytics_service.get_events.assert_called_once_with(event_type=None, limit=50)

    def test_get_update_events_when_no_events_then_returns_empty_list(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test getting events with no data."""
        mock_analytics_service.get_events.return_value = []

        response = test_client_with_mock_service.get("/api/analytics/update-events")

        assert response.status_code == 200
        data = response.json()
        assert data == []

    def test_get_update_events_when_has_error_events_then_includes_error_message(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test that error events include error messages."""
        error_record = UpdateEventRecord(
            id=1,
            event_type="error",
            from_version="1.0.0",
            to_version="1.1.0",
            platform="win32",
            arch="x64",
            error_message="Download failed: Network timeout",
            bytes_downloaded=None,
            total_bytes=None,
            percent_complete=None,
            timestamp=datetime.utcnow(),
            session_id=None,
        )
        mock_analytics_service.get_events.return_value = [error_record]

        response = test_client_with_mock_service.get("/api/analytics/update-events?event_type=error")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["event_type"] == "error"
        assert data[0]["error_message"] == "Download failed: Network timeout"

    def test_get_update_events_when_has_progress_events_then_includes_progress_data(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test that progress events include download data."""
        progress_record = UpdateEventRecord(
            id=1,
            event_type="download_progress",
            from_version="1.0.0",
            to_version="1.1.0",
            platform="darwin",
            arch="arm64",
            error_message=None,
            bytes_downloaded=5242880,
            total_bytes=10485760,
            percent_complete=50.0,
            timestamp=datetime.utcnow(),
            session_id=None,
        )
        mock_analytics_service.get_events.return_value = [progress_record]

        response = test_client_with_mock_service.get("/api/analytics/update-events?event_type=download_progress")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["bytes_downloaded"] == 5242880
        assert data[0]["total_bytes"] == 10485760
        assert data[0]["percent_complete"] == 50.0

    def test_get_update_events_when_service_error_then_returns_500(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock
    ) -> None:
        """Test that service errors return 500."""
        mock_analytics_service.get_events.side_effect = Exception("Database error")

        response = test_client_with_mock_service.get("/api/analytics/update-events")

        assert response.status_code == 500
        assert "Failed to get events" in response.json()["detail"]

    def test_get_update_events_when_invalid_limit_then_returns_422(
        self, test_client_with_mock_service: TestClient
    ) -> None:
        """Test that invalid limit parameter returns validation error."""
        response = test_client_with_mock_service.get("/api/analytics/update-events?limit=invalid")

        assert response.status_code == 422

    def test_get_update_events_when_combined_filters_then_passes_all_parameters(
        self, test_client_with_mock_service: TestClient, mock_analytics_service: MagicMock, sample_event_records: list[UpdateEventRecord]
    ) -> None:
        """Test that multiple query parameters are passed correctly."""
        mock_analytics_service.get_events.return_value = sample_event_records

        response = test_client_with_mock_service.get("/api/analytics/update-events?event_type=check&limit=25")

        assert response.status_code == 200
        mock_analytics_service.get_events.assert_called_once_with(event_type="check", limit=25)


class TestGetAnalyticsServiceDependency:
    """Tests for get_analytics_service dependency."""

    def test_get_analytics_service_when_called_then_returns_service_instance(self) -> None:
        """Test that dependency returns UpdateAnalyticsService instance."""
        from ninebox.api.update_analytics import get_analytics_service
        from ninebox.services.update_analytics_service import UpdateAnalyticsService

        service = get_analytics_service()

        assert isinstance(service, UpdateAnalyticsService)

    def test_get_analytics_service_when_called_multiple_times_then_creates_new_instances(self) -> None:
        """Test that each call creates a new service instance."""
        from ninebox.api.update_analytics import get_analytics_service

        service1 = get_analytics_service()
        service2 = get_analytics_service()

        # Should be different instances
        assert service1 is not service2
