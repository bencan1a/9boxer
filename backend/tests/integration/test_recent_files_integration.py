"""Integration tests for recent files across upload and export flows.

This module tests how the recent files list is updated during the complete
workflow of uploading and exporting files.
"""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ninebox.core.dependencies import get_preferences_manager
from ninebox.services.preferences_manager import PreferencesManager

pytestmark = [pytest.mark.integration, pytest.mark.slow]


class TestRecentFilesIntegration:
    """Integration tests for recent files tracking across API workflows."""

    def test_upload_file_when_success_then_recent_files_updated(
        self,
        test_client: TestClient,
        sample_excel_file: Path,
        tmp_path: Path,
    ) -> None:
        """Test that uploading a file adds it to recent files list."""
        # Setup preferences manager with temp config path
        config_path = tmp_path / "config.json"
        prefs_mgr = PreferencesManager(config_path=config_path)

        # Override dependency to use our test preferences manager
        test_client.app.dependency_overrides[get_preferences_manager] = lambda: prefs_mgr

        # Verify recent files is empty
        assert len(prefs_mgr.get_recent_files()) == 0

        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files)

        # Verify upload succeeded
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["employee_count"] > 0  # Don't hardcode count (fixture may vary)

        # Verify recent files was updated
        recent_files = prefs_mgr.get_recent_files()
        assert len(recent_files) == 1
        assert recent_files[0].name == "test.xlsx"
        assert recent_files[0].path  # Should have a path

        # Cleanup override
        test_client.app.dependency_overrides.clear()

    def test_export_file_when_success_then_recent_files_updated(
        self,
        test_client: TestClient,
        sample_excel_file: Path,
        tmp_path: Path,
    ) -> None:
        """Test that exporting a file adds it to recent files list."""
        # Setup preferences manager with temp config path
        config_path = tmp_path / "config.json"
        prefs_mgr = PreferencesManager(config_path=config_path)

        # Override dependency to use our test preferences manager
        test_client.app.dependency_overrides[get_preferences_manager] = lambda: prefs_mgr

        # Upload file first
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files)
        assert response.status_code == 200

        # Clear recent files to test export adds it
        prefs_mgr._save_config({"recent_files": []})
        assert len(prefs_mgr.get_recent_files()) == 0

        # Export to original file (update_original mode)
        export_request = {"mode": "update_original"}
        response = test_client.post("/api/session/export", json=export_request)
        assert response.status_code == 200
        assert response.json()["success"] is True

        # Verify recent files was updated
        recent_files = prefs_mgr.get_recent_files()
        assert len(recent_files) == 1
        assert recent_files[0].name == "test.xlsx"

        # Cleanup override
        test_client.app.dependency_overrides.clear()

    def test_recent_files_when_multiple_uploads_then_max_five_kept(
        self,
        test_client: TestClient,
        sample_excel_file: Path,
        tmp_path: Path,
    ) -> None:
        """Test that recent files list maintains maximum of 5 entries."""
        # Setup preferences manager with temp config path
        config_path = tmp_path / "config.json"
        prefs_mgr = PreferencesManager(config_path=config_path)

        # Override dependency to use our test preferences manager
        test_client.app.dependency_overrides[get_preferences_manager] = lambda: prefs_mgr

        # Upload 6 files
        for i in range(6):
            with open(sample_excel_file, "rb") as f:  # noqa: PTH123
                files = {
                    "file": (
                        f"test_{i}.xlsx",
                        f,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    )
                }
                response = test_client.post("/api/session/upload", files=files)
                assert response.status_code == 200

        # Verify only 5 files are kept
        recent_files = prefs_mgr.get_recent_files()
        assert len(recent_files) == 5

        # Verify newest file is first
        assert recent_files[0].name == "test_5.xlsx"

        # Verify oldest file (test_0.xlsx) was removed
        file_names = [f.name for f in recent_files]
        assert "test_0.xlsx" not in file_names

        # Cleanup override
        test_client.app.dependency_overrides.clear()

    def test_recent_files_when_same_filename_uploaded_twice_then_separate_entries(
        self,
        test_client: TestClient,
        sample_excel_file: Path,
        tmp_path: Path,
    ) -> None:
        """Test that uploading files with same filename creates separate entries (different paths)."""
        # Setup preferences manager with temp config path
        config_path = tmp_path / "config.json"
        prefs_mgr = PreferencesManager(config_path=config_path)

        # Override dependency to use our test preferences manager
        test_client.app.dependency_overrides[get_preferences_manager] = lambda: prefs_mgr

        # Upload file first time
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files)
        assert response.status_code == 200

        # Get first timestamp
        recent_files = prefs_mgr.get_recent_files()
        assert len(recent_files) == 1
        first_timestamp = recent_files[0].last_accessed

        # Upload different file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "other.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files)
        assert response.status_code == 200

        # Upload another file with same filename (creates different path due to session ID)
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files)
        assert response.status_code == 200

        # Verify we now have 3 files (each upload creates unique path)
        # Note: Recent files tracks by path, not by filename
        # Each upload creates a new file with unique session ID, so they're all different paths
        recent_files = prefs_mgr.get_recent_files()
        assert len(recent_files) == 3

        # Verify most recent test.xlsx is first
        assert recent_files[0].name == "test.xlsx"

        # Verify it's newer than the first upload
        assert recent_files[0].last_accessed > first_timestamp

        # Verify we have two test.xlsx entries (different paths) and one other.xlsx
        file_names = [f.name for f in recent_files]
        assert file_names.count("test.xlsx") == 2
        assert file_names.count("other.xlsx") == 1

        # Cleanup override
        test_client.app.dependency_overrides.clear()
