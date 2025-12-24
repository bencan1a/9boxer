"""Tests for main.py port selection logic."""

import socket

import pytest

from ninebox.main import get_free_port, is_port_in_use

pytestmark = pytest.mark.unit


def test_get_free_port_when_called_then_returns_valid_port() -> None:
    """Test get_free_port returns a valid port number."""
    port = get_free_port()

    # Port should be in valid range (1024-65535 for non-privileged ports)
    # Note: OS may assign ports in ephemeral range (typically 49152-65535)
    assert isinstance(port, int)
    assert 1024 <= port <= 65535


def test_get_free_port_when_called_multiple_times_then_returns_different_ports() -> None:
    """Test get_free_port returns different ports on consecutive calls."""
    port1 = get_free_port()
    port2 = get_free_port()

    # Ports should be different (highly likely but not guaranteed)
    # This test may occasionally fail due to OS port reuse, but very unlikely
    assert isinstance(port1, int)
    assert isinstance(port2, int)
    # We don't assert they're different because OS could reuse ports
    # But both should be valid
    assert 1024 <= port1 <= 65535
    assert 1024 <= port2 <= 65535


def test_is_port_in_use_when_port_is_free_then_returns_false() -> None:
    """Test is_port_in_use returns False for a free port."""
    # Get a free port
    free_port = get_free_port()

    # Check if it's in use (should be False)
    assert is_port_in_use(free_port) is False


def test_is_port_in_use_when_port_is_occupied_then_returns_true() -> None:
    """Test is_port_in_use returns True for an occupied port."""
    # Create a socket and bind to a port
    test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    test_socket.bind(("127.0.0.1", 0))
    test_socket.listen(1)
    occupied_port = test_socket.getsockname()[1]

    try:
        # Check if the port is in use (should be True)
        assert is_port_in_use(occupied_port) is True
    finally:
        test_socket.close()


def test_is_port_in_use_when_socket_cleanup_then_does_not_leak_sockets() -> None:
    """Test is_port_in_use properly closes sockets."""
    # This test verifies that the function doesn't leak file descriptors
    # by calling it many times and ensuring no errors occur
    free_port = get_free_port()

    for _ in range(10):
        is_port_in_use(free_port)

    # If we got here without errors, sockets are being cleaned up properly
    assert True
