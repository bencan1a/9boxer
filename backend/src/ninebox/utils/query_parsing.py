"""Utilities for parsing and validating query parameters."""

from fastapi import HTTPException


def parse_id_list(ids_str: str | None, param_name: str = "ID") -> list[int] | None:
    """
    Parse comma-separated ID string into list of integers.

    Args:
        ids_str: Comma-separated string of IDs, e.g., "1,2,3"
        param_name: Name of parameter for error messages

    Returns:
        List of integers, or None if ids_str is None/empty

    Raises:
        HTTPException: 400 Bad Request if any ID is not a valid integer

    Examples:
        >>> parse_id_list("1,2,3")
        [1, 2, 3]
        >>> parse_id_list(None)
        None
        >>> parse_id_list("1,abc,3")  # Raises HTTPException
    """
    if not ids_str or ids_str.strip() == "":
        return None

    try:
        return [int(id_val.strip()) for id_val in ids_str.split(",") if id_val.strip()]
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {param_name}: must be comma-separated integers (got: {ids_str})",
        ) from e
