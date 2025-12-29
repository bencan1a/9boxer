"""Unit tests for PreferencesManager.

This module tests the preferences management functionality for storing
and retrieving recent files.
"""

import json
import time
from collections.abc import Generator
from pathlib import Path

import pytest

from ninebox.services.preferences_manager import PreferencesManager


@pytest.fixture
def temp_config_path(tmp_path: Path) -> Path:
    """Create a temporary config path for testing."""
    config_dir = tmp_path / ".9boxer"
    config_dir.mkdir(parents=True, exist_ok=True)
    return config_dir / "config.json"


@pytest.fixture
def preferences_manager(temp_config_path: Path) -> Generator[PreferencesManager, None, None]:
    """Create a PreferencesManager instance with temporary config path."""
    manager = PreferencesManager(config_path=temp_config_path)
    yield manager


def test_add_recent_file_when_empty_then_file_added(
    preferences_manager: PreferencesManager,
) -> None:
    """Test adding a file to an empty recent files list."""
    # Arrange
    path = str(Path.home() / "Projects" / "data.xlsx")
    name = "data.xlsx"

    # Act
    preferences_manager.add_recent_file(path, name)
    recent_files = preferences_manager.get_recent_files()

    # Assert
    assert len(recent_files) == 1
    assert recent_files[0].name == name
    assert recent_files[0].last_accessed > 0


def test_add_recent_file_when_exists_then_timestamp_updated(
    preferences_manager: PreferencesManager,
) -> None:
    """Test that adding an existing file updates its timestamp."""
    # Arrange
    path = str(Path.home() / "Projects" / "data.xlsx")
    name = "data.xlsx"
    preferences_manager.add_recent_file(path, name)
    first_timestamp = preferences_manager.get_recent_files()[0].last_accessed

    # Act - Wait a bit and add the same file again
    time.sleep(0.01)  # 10ms delay
    preferences_manager.add_recent_file(path, name)
    recent_files = preferences_manager.get_recent_files()

    # Assert
    assert len(recent_files) == 1
    assert recent_files[0].last_accessed > first_timestamp


def test_add_recent_file_when_max_five_then_oldest_removed(
    preferences_manager: PreferencesManager,
) -> None:
    """Test that adding a 6th file removes the oldest one."""
    # Arrange - Add 5 files
    for i in range(5):
        path = str(Path.home() / f"file{i}.xlsx")
        preferences_manager.add_recent_file(path, f"file{i}.xlsx")
        time.sleep(0.001)  # Small delay to ensure different timestamps

    # Act - Add a 6th file
    path = str(Path.home() / "file5.xlsx")
    preferences_manager.add_recent_file(path, "file5.xlsx")
    recent_files = preferences_manager.get_recent_files()

    # Assert
    assert len(recent_files) == 5
    assert recent_files[0].name == "file5.xlsx"  # Most recent first
    assert all(f.name != "file0.xlsx" for f in recent_files)  # Oldest removed


def test_get_recent_files_when_empty_then_returns_empty_list(
    preferences_manager: PreferencesManager,
) -> None:
    """Test getting recent files from an empty list."""
    # Act
    recent_files = preferences_manager.get_recent_files()

    # Assert
    assert isinstance(recent_files, list)
    assert len(recent_files) == 0


def test_get_recent_files_when_populated_then_sorted_by_last_accessed(
    preferences_manager: PreferencesManager,
) -> None:
    """Test that recent files are sorted by last accessed (most recent first)."""
    # Arrange - Add files with delays to ensure different timestamps
    preferences_manager.add_recent_file(str(Path.home() / "file1.xlsx"), "file1.xlsx")
    time.sleep(0.01)
    preferences_manager.add_recent_file(str(Path.home() / "file2.xlsx"), "file2.xlsx")
    time.sleep(0.01)
    preferences_manager.add_recent_file(str(Path.home() / "file3.xlsx"), "file3.xlsx")

    # Act
    recent_files = preferences_manager.get_recent_files()

    # Assert
    assert len(recent_files) == 3
    assert recent_files[0].name == "file3.xlsx"
    assert recent_files[1].name == "file2.xlsx"
    assert recent_files[2].name == "file1.xlsx"
    # Verify timestamps are in descending order
    assert recent_files[0].last_accessed > recent_files[1].last_accessed
    assert recent_files[1].last_accessed > recent_files[2].last_accessed


def test_add_recent_file_when_duplicate_path_then_moves_to_top(
    preferences_manager: PreferencesManager,
) -> None:
    """Test that adding a duplicate file moves it to the top of the list."""
    # Arrange - Add 3 files
    file1_path = str(Path.home() / "file1.xlsx")
    preferences_manager.add_recent_file(file1_path, "file1.xlsx")
    time.sleep(0.01)
    preferences_manager.add_recent_file(str(Path.home() / "file2.xlsx"), "file2.xlsx")
    time.sleep(0.01)
    preferences_manager.add_recent_file(str(Path.home() / "file3.xlsx"), "file3.xlsx")

    # Act - Re-add file1
    time.sleep(0.01)
    preferences_manager.add_recent_file(file1_path, "file1.xlsx")
    recent_files = preferences_manager.get_recent_files()

    # Assert
    assert len(recent_files) == 3
    assert recent_files[0].name == "file1.xlsx"  # Moved to top
    assert recent_files[1].name == "file3.xlsx"
    assert recent_files[2].name == "file2.xlsx"


def test_preferences_persisted_across_instances(temp_config_path: Path) -> None:
    """Test that preferences are persisted to disk and loaded correctly."""
    # Arrange - Create first manager and add files
    manager1 = PreferencesManager(config_path=temp_config_path)
    manager1.add_recent_file(str(Path.home() / "file1.xlsx"), "file1.xlsx")
    manager1.add_recent_file(str(Path.home() / "file2.xlsx"), "file2.xlsx")

    # Act - Create second manager instance
    manager2 = PreferencesManager(config_path=temp_config_path)
    recent_files = manager2.get_recent_files()

    # Assert
    assert len(recent_files) == 2
    assert recent_files[0].name == "file2.xlsx"
    assert recent_files[1].name == "file1.xlsx"


def test_config_file_created_if_not_exists(temp_config_path: Path) -> None:
    """Test that config file is created if it doesn't exist."""
    # Arrange - Ensure config file doesn't exist
    if temp_config_path.exists():
        temp_config_path.unlink()

    # Act
    manager = PreferencesManager(config_path=temp_config_path)
    manager.add_recent_file(str(Path.home() / "file1.xlsx"), "file1.xlsx")

    # Assert
    assert temp_config_path.exists()
    with temp_config_path.open(encoding="utf-8") as f:
        data = json.load(f)
    assert "recent_files" in data
    assert len(data["recent_files"]) == 1


def test_corrupted_config_file_handled_gracefully(temp_config_path: Path) -> None:
    """Test that corrupted config files are handled gracefully."""
    # Arrange - Create corrupted config file
    with temp_config_path.open("w", encoding="utf-8") as f:
        f.write("invalid json {")

    # Act - Should not raise exception
    manager = PreferencesManager(config_path=temp_config_path)
    recent_files = manager.get_recent_files()

    # Assert - Should return empty list and recover
    assert len(recent_files) == 0

    # Verify can add files after recovery
    manager.add_recent_file(str(Path.home() / "file1.xlsx"), "file1.xlsx")
    recent_files = manager.get_recent_files()
    assert len(recent_files) == 1


def test_add_recent_file_when_path_traversal_then_raises_error(tmp_path: Path) -> None:
    """Test path traversal attack is blocked."""
    mgr = PreferencesManager(config_path=tmp_path / "config.json")

    with pytest.raises(ValueError, match="outside allowed directories"):
        mgr.add_recent_file(
            path="/etc/passwd",  # Outside allowed dirs
            name="passwd",
        )


def test_add_recent_file_when_windows_reserved_name_then_raises_error(tmp_path: Path) -> None:
    """Test Windows reserved names are blocked."""
    mgr = PreferencesManager(config_path=tmp_path / "config.json")

    with pytest.raises(ValueError, match="reserved name"):
        mgr.add_recent_file(
            path=str(Path.home() / "CON.xlsx"),
            name="CON.xlsx",
        )
