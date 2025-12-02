"""Greeting module demonstrating simple functionality."""


def greet(name: str, formal: bool = False) -> str:
    """
    Generate a greeting message.

    Args:
        name: The name of the person to greet
        formal: Whether to use formal greeting (default: False)

    Returns:
        A greeting message

    Raises:
        ValueError: If name is empty

    Examples:
        >>> greet("Alice")
        'Hello, Alice!'
        >>> greet("Bob", formal=True)
        'Good day, Bob.'
    """
    if not name or not name.strip():
        raise ValueError("Name cannot be empty")

    name = name.strip()

    if formal:
        return f"Good day, {name}."
    return f"Hello, {name}!"


def farewell(name: str) -> str:
    """
    Generate a farewell message.

    Args:
        name: The name of the person to bid farewell

    Returns:
        A farewell message

    Examples:
        >>> farewell("Alice")
        'Goodbye, Alice!'
    """
    if not name or not name.strip():
        raise ValueError("Name cannot be empty")

    return f"Goodbye, {name.strip()}!"
