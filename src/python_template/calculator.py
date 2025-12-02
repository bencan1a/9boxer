"""Simple calculator module demonstrating best practices."""

Number = int | float


class Calculator:
    """
    A simple calculator for basic arithmetic operations.

    This class demonstrates proper typing, documentation, and error handling.

    Examples:
        >>> calc = Calculator()
        >>> calc.add(2, 3)
        5
        >>> calc.multiply(4, 5)
        20
    """

    def add(self, a: Number, b: Number) -> Number:
        """
        Add two numbers.

        Args:
            a: First number
            b: Second number

        Returns:
            Sum of a and b

        Examples:
            >>> calc = Calculator()
            >>> calc.add(1, 2)
            3
        """
        return a + b

    def subtract(self, a: Number, b: Number) -> Number:
        """
        Subtract b from a.

        Args:
            a: Number to subtract from
            b: Number to subtract

        Returns:
            Difference of a and b

        Examples:
            >>> calc = Calculator()
            >>> calc.subtract(5, 3)
            2
        """
        return a - b

    def multiply(self, a: Number, b: Number) -> Number:
        """
        Multiply two numbers.

        Args:
            a: First number
            b: Second number

        Returns:
            Product of a and b

        Examples:
            >>> calc = Calculator()
            >>> calc.multiply(3, 4)
            12
        """
        return a * b

    def divide(self, a: Number, b: Number) -> float:
        """
        Divide a by b.

        Args:
            a: Dividend
            b: Divisor

        Returns:
            Quotient of a and b

        Raises:
            ValueError: If b is zero

        Examples:
            >>> calc = Calculator()
            >>> calc.divide(10, 2)
            5.0
            >>> calc.divide(10, 0)
            Traceback (most recent call last):
                ...
            ValueError: Cannot divide by zero
        """
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

    def power(self, base: Number, exponent: Number) -> Number:
        """
        Raise base to the power of exponent.

        Args:
            base: The base number
            exponent: The exponent

        Returns:
            base raised to the power of exponent

        Examples:
            >>> calc = Calculator()
            >>> calc.power(2, 3)
            8
        """
        return base**exponent
