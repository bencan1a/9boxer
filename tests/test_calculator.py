"""Tests for the calculator module."""

import pytest

from python_template.calculator import Calculator


class TestCalculator:
    """Test suite for Calculator class."""

    @pytest.fixture
    def calculator(self):
        """Provide a Calculator instance for tests."""
        return Calculator()

    def test_add(self, calculator):
        """Test addition of two numbers."""
        assert calculator.add(2, 3) == 5
        assert calculator.add(-1, 1) == 0
        assert calculator.add(0, 0) == 0

    def test_add_floats(self, calculator):
        """Test addition with floating point numbers."""
        result = calculator.add(0.1, 0.2)
        assert abs(result - 0.3) < 1e-10

    def test_subtract(self, calculator):
        """Test subtraction of two numbers."""
        assert calculator.subtract(5, 3) == 2
        assert calculator.subtract(0, 5) == -5
        assert calculator.subtract(10, 10) == 0

    def test_multiply(self, calculator):
        """Test multiplication of two numbers."""
        assert calculator.multiply(3, 4) == 12
        assert calculator.multiply(-2, 5) == -10
        assert calculator.multiply(0, 100) == 0

    def test_divide(self, calculator):
        """Test division of two numbers."""
        assert calculator.divide(10, 2) == 5.0
        assert calculator.divide(7, 2) == 3.5
        assert calculator.divide(-10, 2) == -5.0

    def test_divide_by_zero(self, calculator):
        """Test that division by zero raises ValueError."""
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            calculator.divide(10, 0)

    def test_power(self, calculator):
        """Test exponentiation."""
        assert calculator.power(2, 3) == 8
        assert calculator.power(5, 2) == 25
        assert calculator.power(10, 0) == 1

    @pytest.mark.parametrize(
        "a,b,expected",
        [
            (1, 1, 2),
            (0, 0, 0),
            (-1, 1, 0),
            (100, 200, 300),
        ],
    )
    def test_add_parametrized(self, calculator, a, b, expected):
        """Test addition with multiple parameter sets."""
        assert calculator.add(a, b) == expected

    @pytest.mark.parametrize(
        "a,b,expected",
        [
            (2, 3, 8),
            (3, 2, 9),
            (0, 5, 0),
            (5, 0, 1),
        ],
    )
    def test_power_parametrized(self, calculator, a, b, expected):
        """Test power with multiple parameter sets."""
        assert calculator.power(a, b) == expected
