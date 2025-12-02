"""Tests for the greeter module."""

import pytest

from python_template.greeter import farewell, greet


class TestGreet:
    """Test suite for greet function."""

    def test_greet_basic(self):
        """Test basic greeting."""
        assert greet("Alice") == "Hello, Alice!"

    def test_greet_formal(self):
        """Test formal greeting."""
        assert greet("Bob", formal=True) == "Good day, Bob."

    def test_greet_with_whitespace(self):
        """Test greeting with whitespace in name."""
        assert greet("  Charlie  ") == "Hello, Charlie!"

    def test_greet_empty_name(self):
        """Test that empty name raises ValueError."""
        with pytest.raises(ValueError, match="Name cannot be empty"):
            greet("")

    def test_greet_whitespace_only(self):
        """Test that whitespace-only name raises ValueError."""
        with pytest.raises(ValueError, match="Name cannot be empty"):
            greet("   ")

    @pytest.mark.parametrize(
        "name,formal,expected",
        [
            ("Alice", False, "Hello, Alice!"),
            ("Bob", True, "Good day, Bob."),
            ("Charlie", False, "Hello, Charlie!"),
            ("Diana", True, "Good day, Diana."),
        ],
    )
    def test_greet_parametrized(self, name, formal, expected):
        """Test greet with multiple parameter sets."""
        assert greet(name, formal=formal) == expected


class TestFarewell:
    """Test suite for farewell function."""

    def test_farewell_basic(self):
        """Test basic farewell."""
        assert farewell("Alice") == "Goodbye, Alice!"

    def test_farewell_with_whitespace(self):
        """Test farewell with whitespace in name."""
        assert farewell("  Bob  ") == "Goodbye, Bob!"

    def test_farewell_empty_name(self):
        """Test that empty name raises ValueError."""
        with pytest.raises(ValueError, match="Name cannot be empty"):
            farewell("")

    def test_farewell_whitespace_only(self):
        """Test that whitespace-only name raises ValueError."""
        with pytest.raises(ValueError, match="Name cannot be empty"):
            farewell("   ")
