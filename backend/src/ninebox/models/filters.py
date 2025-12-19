"""Employee filter models for query parameter parsing."""

from pydantic import BaseModel

from ninebox.utils.query_parsing import parse_id_list


class EmployeeFilters(BaseModel):
    """
    Filters for querying employees.

    Supports filtering by levels, job profiles, managers, performance,
    potential, and excluding specific employee IDs.
    """

    levels: list[str] | None = None
    job_profiles: list[str] | None = None
    managers: list[str] | None = None
    performance: list[str] | None = None
    potential: list[str] | None = None
    exclude_ids: list[int] | None = None

    @classmethod
    def from_query_params(
        cls,
        levels: str | None = None,
        job_profiles: str | None = None,
        managers: str | None = None,
        performance: str | None = None,
        potential: str | None = None,
        exclude_ids: str | None = None,
    ) -> "EmployeeFilters":
        """
        Parse query parameters into EmployeeFilters.

        Args:
            levels: Comma-separated levels (e.g., "Senior,Junior")
            job_profiles: Comma-separated job profiles
            managers: Comma-separated manager names
            performance: Comma-separated performance levels
            potential: Comma-separated potential levels
            exclude_ids: Comma-separated employee IDs to exclude

        Returns:
            EmployeeFilters instance

        Examples:
            >>> filters = EmployeeFilters.from_query_params(
            ...     levels="Senior,Junior",
            ...     exclude_ids="1,2,3"
            ... )
            >>> filters.levels
            ['Senior', 'Junior']
            >>> filters.exclude_ids
            [1, 2, 3]
        """
        return cls(
            levels=cls._parse_string_list(levels),
            job_profiles=cls._parse_string_list(job_profiles),
            managers=cls._parse_string_list(managers),
            performance=cls._parse_string_list(performance),
            potential=cls._parse_string_list(potential),
            exclude_ids=parse_id_list(exclude_ids, "employee ID"),
        )

    @staticmethod
    def _parse_string_list(value: str | None) -> list[str] | None:
        """
        Parse comma-separated string into list, or None.

        Args:
            value: Comma-separated string (e.g., "item1, item2")

        Returns:
            List of trimmed strings, or None if value is None/empty

        Examples:
            >>> EmployeeFilters._parse_string_list("Senior,Junior")
            ['Senior', 'Junior']
            >>> EmployeeFilters._parse_string_list(" Senior , Junior ")
            ['Senior', 'Junior']
            >>> EmployeeFilters._parse_string_list(None)
            None
            >>> EmployeeFilters._parse_string_list("")
            None
            >>> EmployeeFilters._parse_string_list(",,,")
            None
        """
        if not value or value.strip() == "":
            return None
        result = [item.strip() for item in value.split(",") if item.strip()]
        return result if result else None

    def to_filter_kwargs(self) -> dict:
        """
        Convert to keyword arguments for filter_employees().

        Returns:
            Dictionary of filter parameters (only non-None values)

        Examples:
            >>> filters = EmployeeFilters(levels=["Senior"], exclude_ids=None)
            >>> filters.to_filter_kwargs()
            {'levels': ['Senior']}
        """
        return {key: value for key, value in self.model_dump().items() if value is not None}
