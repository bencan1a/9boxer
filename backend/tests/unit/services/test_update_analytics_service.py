"""Tests for UpdateAnalyticsService."""

import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch

import pytest

from ninebox.models.update_analytics import UpdateEvent, UpdateEventRecord
from ninebox.services.update_analytics_service import UpdateAnalyticsService


pytestmark = pytest.mark.unit


@pytest.fixture
def analytics_service(tmp_path: Path) -> UpdateAnalyticsService:
    """Create an UpdateAnalyticsService with a temporary database."""
    db_path = tmp_path / "test_analytics.db"
    return UpdateAnalyticsService(db_path=db_path)


@pytest.fixture
def sample_event() -> UpdateEvent:
    """Create a sample update event."""
    return UpdateEvent(
        event_type="check",
        from_version="1.0.0",
        to_version="1.1.0",
        platform="win32",
        arch="x64",
        timestamp=datetime.utcnow(),
    )


class TestUpdateAnalyticsServiceInit:
    """Tests for UpdateAnalyticsService initialization."""

    def test_init_when_no_db_path_then_uses_default(self, tmp_path: Path) -> None:
        """Test initialization without db_path uses default path."""
        with patch("ninebox.services.update_analytics_service.get_db_path") as mock_get_db:
            mock_get_db.return_value = tmp_path / "default.db"
            service = UpdateAnalyticsService()

            assert service.db_path == tmp_path / "default.db"
            mock_get_db.assert_called_once()

    def test_init_when_db_path_provided_then_uses_it(self, tmp_path: Path) -> None:
        """Test initialization with explicit db_path."""
        db_path = tmp_path / "custom.db"
        service = UpdateAnalyticsService(db_path=db_path)

        assert service.db_path == db_path

    def test_init_when_called_then_creates_tables(self, tmp_path: Path) -> None:
        """Test that initialization creates the update_events table."""
        db_path = tmp_path / "test.db"
        service = UpdateAnalyticsService(db_path=db_path)

        # Verify table exists
        conn = sqlite3.connect(service.db_path)
        try:
            cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='update_events'")
            tables = cursor.fetchall()
            assert len(tables) == 1
            assert tables[0][0] == "update_events"
        finally:
            conn.close()

    def test_init_when_called_then_creates_indexes(self, tmp_path: Path) -> None:
        """Test that initialization creates appropriate indexes."""
        db_path = tmp_path / "test.db"
        service = UpdateAnalyticsService(db_path=db_path)

        # Verify indexes exist
        conn = sqlite3.connect(service.db_path)
        try:
            cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='index'")
            indexes = {row[0] for row in cursor.fetchall()}

            assert "idx_update_events_type" in indexes
            assert "idx_update_events_timestamp" in indexes
            assert "idx_update_events_version" in indexes
        finally:
            conn.close()

    def test_init_when_database_error_then_raises(self, tmp_path: Path) -> None:
        """Test that database errors during initialization are raised."""
        db_path = tmp_path / "test.db"

        # Mock sqlite3.connect to raise an error
        with patch("sqlite3.connect", side_effect=sqlite3.OperationalError("Mock database error")):
            with pytest.raises(sqlite3.OperationalError):
                UpdateAnalyticsService(db_path=db_path)


class TestRecordEvent:
    """Tests for recording update events."""

    def test_record_event_when_valid_event_then_inserts_record(
        self, analytics_service: UpdateAnalyticsService, sample_event: UpdateEvent
    ) -> None:
        """Test recording a valid update event."""
        event_id = analytics_service.record_event(sample_event)

        assert isinstance(event_id, int)
        assert event_id > 0

    def test_record_event_when_with_session_id_then_stores_it(
        self, analytics_service: UpdateAnalyticsService, sample_event: UpdateEvent
    ) -> None:
        """Test recording an event with session ID."""
        session_id = "test-session-123"
        event_id = analytics_service.record_event(sample_event, session_id=session_id)

        # Verify session_id was stored
        conn = sqlite3.connect(analytics_service.db_path)
        conn.row_factory = sqlite3.Row
        try:
            cursor = conn.execute("SELECT session_id FROM update_events WHERE id = ?", (event_id,))
            row = cursor.fetchone()
            assert row["session_id"] == session_id
        finally:
            conn.close()

    def test_record_event_when_error_type_then_stores_error_message(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test recording an error event with error message."""
        event = UpdateEvent(
            event_type="error",
            from_version="1.0.0",
            to_version="1.1.0",
            platform="win32",
            arch="x64",
            error_message="Download failed: Network error",
            timestamp=datetime.utcnow(),
        )

        event_id = analytics_service.record_event(event)

        # Verify error message was stored
        conn = sqlite3.connect(analytics_service.db_path)
        conn.row_factory = sqlite3.Row
        try:
            cursor = conn.execute("SELECT error_message FROM update_events WHERE id = ?", (event_id,))
            row = cursor.fetchone()
            assert row["error_message"] == "Download failed: Network error"
        finally:
            conn.close()

    def test_record_event_when_progress_event_then_stores_progress_data(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test recording a download progress event."""
        event = UpdateEvent(
            event_type="download_progress",
            from_version="1.0.0",
            to_version="1.1.0",
            platform="darwin",
            arch="arm64",
            bytes_downloaded=5242880,
            total_bytes=10485760,
            percent_complete=50.0,
            timestamp=datetime.utcnow(),
        )

        event_id = analytics_service.record_event(event)

        # Verify progress data was stored
        conn = sqlite3.connect(analytics_service.db_path)
        conn.row_factory = sqlite3.Row
        try:
            cursor = conn.execute(
                "SELECT bytes_downloaded, total_bytes, percent_complete FROM update_events WHERE id = ?",
                (event_id,),
            )
            row = cursor.fetchone()
            assert row["bytes_downloaded"] == 5242880
            assert row["total_bytes"] == 10485760
            assert row["percent_complete"] == 50.0
        finally:
            conn.close()

    def test_record_event_when_database_error_then_raises(
        self, analytics_service: UpdateAnalyticsService, sample_event: UpdateEvent
    ) -> None:
        """Test that database errors are raised."""
        # Close the database connection by removing the file
        analytics_service.db_path.unlink()

        with pytest.raises(Exception):
            analytics_service.record_event(sample_event)


class TestGetSummary:
    """Tests for getting update analytics summary."""

    def test_get_summary_when_no_events_then_returns_empty_summary(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test getting summary with no events."""
        summary = analytics_service.get_summary(days=30)

        assert summary.total_checks == 0
        assert summary.total_downloads == 0
        assert summary.total_installs == 0
        assert summary.total_errors == 0
        assert summary.success_rate == 0.0
        assert summary.most_common_error is None
        assert summary.version_distribution == {}
        assert summary.platform_distribution == {}

    def test_get_summary_when_events_exist_then_returns_correct_counts(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test summary with various event types."""
        # Record various events
        events = [
            UpdateEvent(event_type="check", from_version="1.0.0", platform="win32", arch="x64"),
            UpdateEvent(event_type="check", from_version="1.0.0", platform="win32", arch="x64"),
            UpdateEvent(event_type="download_complete", from_version="1.0.0", to_version="1.1.0", platform="win32", arch="x64"),
            UpdateEvent(event_type="install", from_version="1.0.0", to_version="1.1.0", platform="win32", arch="x64"),
            UpdateEvent(event_type="error", from_version="1.0.0", platform="darwin", arch="arm64", error_message="Network error"),
        ]

        for event in events:
            analytics_service.record_event(event)

        summary = analytics_service.get_summary(days=30)

        assert summary.total_checks == 2
        assert summary.total_downloads == 1
        assert summary.total_installs == 1
        assert summary.total_errors == 1
        assert summary.success_rate == 1.0  # 1 install / 1 download

    def test_get_summary_when_multiple_downloads_then_calculates_success_rate(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test success rate calculation with multiple downloads."""
        # Record 4 downloads but only 2 installs
        for _ in range(4):
            analytics_service.record_event(
                UpdateEvent(event_type="download_complete", from_version="1.0.0", to_version="1.1.0", platform="win32", arch="x64")
            )
        for _ in range(2):
            analytics_service.record_event(
                UpdateEvent(event_type="install", from_version="1.0.0", to_version="1.1.0", platform="win32", arch="x64")
            )

        summary = analytics_service.get_summary(days=30)

        assert summary.total_downloads == 4
        assert summary.total_installs == 2
        assert summary.success_rate == 0.5

    def test_get_summary_when_errors_exist_then_returns_most_common(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test that most common error is identified."""
        # Record multiple errors
        analytics_service.record_event(
            UpdateEvent(event_type="error", from_version="1.0.0", platform="win32", arch="x64", error_message="Network error")
        )
        analytics_service.record_event(
            UpdateEvent(event_type="error", from_version="1.0.0", platform="win32", arch="x64", error_message="Network error")
        )
        analytics_service.record_event(
            UpdateEvent(event_type="error", from_version="1.0.0", platform="darwin", arch="arm64", error_message="Disk full")
        )

        summary = analytics_service.get_summary(days=30)

        assert summary.most_common_error == "Network error"

    def test_get_summary_when_version_distribution_then_counts_correctly(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test version distribution counting."""
        # Record events with different versions
        analytics_service.record_event(
            UpdateEvent(event_type="available", from_version="1.0.0", to_version="1.1.0", platform="win32", arch="x64")
        )
        analytics_service.record_event(
            UpdateEvent(event_type="available", from_version="1.0.0", to_version="1.1.0", platform="win32", arch="x64")
        )
        analytics_service.record_event(
            UpdateEvent(event_type="available", from_version="1.0.0", to_version="1.2.0", platform="darwin", arch="arm64")
        )

        summary = analytics_service.get_summary(days=30)

        assert summary.version_distribution == {"1.1.0": 2, "1.2.0": 1}

    def test_get_summary_when_platform_distribution_then_counts_correctly(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test platform distribution counting."""
        # Record events from different platforms
        analytics_service.record_event(
            UpdateEvent(event_type="check", from_version="1.0.0", platform="win32", arch="x64")
        )
        analytics_service.record_event(
            UpdateEvent(event_type="check", from_version="1.0.0", platform="win32", arch="x64")
        )
        analytics_service.record_event(
            UpdateEvent(event_type="check", from_version="1.0.0", platform="darwin", arch="arm64")
        )

        summary = analytics_service.get_summary(days=30)

        assert summary.platform_distribution == {"win32": 2, "darwin": 1}

    def test_get_summary_when_custom_days_then_filters_by_date(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test filtering by custom days parameter."""
        # Record old event (35 days ago)
        old_timestamp = datetime.utcnow() - timedelta(days=35)
        old_event = UpdateEvent(
            event_type="check",
            from_version="1.0.0",
            platform="win32",
            arch="x64",
            timestamp=old_timestamp,
        )
        analytics_service.record_event(old_event)

        # Record recent event
        recent_event = UpdateEvent(
            event_type="check",
            from_version="1.0.0",
            platform="win32",
            arch="x64",
        )
        analytics_service.record_event(recent_event)

        # Query with 30 days - should only get recent event
        summary = analytics_service.get_summary(days=30)
        assert summary.total_checks == 1

        # Query with 40 days - should get both events
        summary = analytics_service.get_summary(days=40)
        assert summary.total_checks == 2


class TestGetEvents:
    """Tests for querying update events."""

    def test_get_events_when_no_events_then_returns_empty_list(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test querying events with no data."""
        events = analytics_service.get_events()

        assert events == []

    def test_get_events_when_events_exist_then_returns_list(
        self, analytics_service: UpdateAnalyticsService, sample_event: UpdateEvent
    ) -> None:
        """Test querying events returns list of UpdateEventRecords."""
        analytics_service.record_event(sample_event)

        events = analytics_service.get_events()

        assert len(events) == 1
        assert isinstance(events[0], UpdateEventRecord)
        assert events[0].event_type == "check"
        assert events[0].from_version == "1.0.0"

    def test_get_events_when_filter_by_type_then_filters_correctly(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test filtering events by event type."""
        # Record different event types
        analytics_service.record_event(
            UpdateEvent(event_type="check", from_version="1.0.0", platform="win32", arch="x64")
        )
        analytics_service.record_event(
            UpdateEvent(event_type="download_complete", from_version="1.0.0", to_version="1.1.0", platform="win32", arch="x64")
        )
        analytics_service.record_event(
            UpdateEvent(event_type="check", from_version="1.0.0", platform="darwin", arch="arm64")
        )

        # Filter by "check" type
        events = analytics_service.get_events(event_type="check")

        assert len(events) == 2
        assert all(e.event_type == "check" for e in events)

    def test_get_events_when_limit_specified_then_respects_limit(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test that limit parameter is respected."""
        # Record 5 events
        for i in range(5):
            analytics_service.record_event(
                UpdateEvent(event_type="check", from_version=f"1.0.{i}", platform="win32", arch="x64")
            )

        # Query with limit of 3
        events = analytics_service.get_events(limit=3)

        assert len(events) == 3

    def test_get_events_when_queried_then_ordered_by_timestamp_desc(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test that events are returned in descending timestamp order."""
        # Record events with different timestamps
        timestamps = [
            datetime.utcnow() - timedelta(hours=3),
            datetime.utcnow() - timedelta(hours=1),
            datetime.utcnow() - timedelta(hours=2),
        ]

        for ts in timestamps:
            analytics_service.record_event(
                UpdateEvent(event_type="check", from_version="1.0.0", platform="win32", arch="x64", timestamp=ts)
            )

        events = analytics_service.get_events()

        # Verify descending order
        assert events[0].timestamp > events[1].timestamp
        assert events[1].timestamp > events[2].timestamp

    def test_get_events_when_session_id_exists_then_includes_it(
        self, analytics_service: UpdateAnalyticsService, sample_event: UpdateEvent
    ) -> None:
        """Test that session_id is included in event records."""
        session_id = "test-session-456"
        analytics_service.record_event(sample_event, session_id=session_id)

        events = analytics_service.get_events()

        assert len(events) == 1
        assert events[0].session_id == session_id

    def test_get_events_when_all_fields_populated_then_returns_complete_record(
        self, analytics_service: UpdateAnalyticsService
    ) -> None:
        """Test that all event fields are correctly populated."""
        event = UpdateEvent(
            event_type="download_progress",
            from_version="1.0.0",
            to_version="1.1.0",
            platform="linux",
            arch="x64",
            error_message=None,
            bytes_downloaded=1024,
            total_bytes=2048,
            percent_complete=50.0,
            timestamp=datetime.utcnow(),
        )

        analytics_service.record_event(event, session_id="test-session")
        events = analytics_service.get_events()

        assert len(events) == 1
        record = events[0]
        assert record.id > 0
        assert record.event_type == "download_progress"
        assert record.from_version == "1.0.0"
        assert record.to_version == "1.1.0"
        assert record.platform == "linux"
        assert record.arch == "x64"
        assert record.bytes_downloaded == 1024
        assert record.total_bytes == 2048
        assert record.percent_complete == 50.0
        assert record.session_id == "test-session"
