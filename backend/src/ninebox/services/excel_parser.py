"""Excel file parser service."""

import logging
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, ClassVar, cast

import pandas as pd

from ninebox.models.employee import Employee, HistoricalRating, PerformanceLevel, PotentialLevel
from ninebox.models.grid_positions import calculate_grid_position

logger = logging.getLogger(__name__)


@dataclass
class JobFunctionConfig:
    """Configuration for job function grouping."""

    common_functions: list[str]  # Functions above threshold
    threshold_percentage: float  # Threshold used (e.g., 5.0 for 5%)
    total_unique_functions: int  # Total unique functions in data
    other_count: int  # Number of employees in "Other" bucket


@dataclass
class ParsingMetadata:
    """Metadata about the parsing process."""

    sheet_name: str
    sheet_index: int
    total_rows: int
    parsed_rows: int
    failed_rows: int
    defaulted_fields: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    warnings: list[str] = field(default_factory=list)
    job_function_config: JobFunctionConfig | None = None


@dataclass
class ParsingResult:
    """Result of parsing an Excel file."""

    employees: list[Employee]
    metadata: ParsingMetadata


class JobFunctionAnalyzer:
    """Analyze and group job functions from employee data."""

    DEFAULT_THRESHOLD_PERCENTAGE = 5.0  # Keep functions with >= 5% of employees
    MIN_COMMON_FUNCTIONS = 5  # Always keep at least top 5 functions

    # Seniority/level prefixes to remove (case-insensitive)
    SENIORITY_PREFIXES: ClassVar[list[str]] = [
        "Lead",
        "Senior",
        "Sr.",
        "Sr",
        "Principal",
        "Staff",
        "Junior",
        "Jr.",
        "Jr",
        "Executive",
        "Chief",
        "Associate",
        "Entry Level",
        "Entry-Level",
    ]

    # Level descriptors to remove when followed by actual function
    # Order matters - match longer patterns first
    LEVEL_DESCRIPTORS: ClassVar[list[str]] = [
        "Advanced Professional",
        "Experienced Professional",
        "Professional",
        "Experienced",
        "Advanced",
    ]

    @staticmethod
    def normalize_job_title(title: str) -> str:
        """
        Normalize job title by removing seniority prefixes and cleaning formatting.

        Transformations:
        - "Lead Product Manager" → "Product Manager"
        - "Sr. Principal, Product Management-IRL" → "Product Manager"
        - "Senior Product Designer" → "Product Designer"
        - "Product Management" → "Product Manager"
        - "Advanced Professional, UI/UX Designer" → "UX Designer"
        - "UI/UX Designer" → "UX Designer"

        Args:
            title: Raw job title from data

        Returns:
            Normalized job function name
        """
        if not title or not title.strip():
            return ""

        normalized = title.strip()

        # Remove country codes (3-letter codes at the end, optionally preceded by hyphen)
        normalized = re.sub(r"-?[A-Z]{3}$", "", normalized)

        # Remove level descriptors followed by comma/whitespace
        # Process in order (longer patterns first)
        for descriptor in JobFunctionAnalyzer.LEVEL_DESCRIPTORS:
            # Match descriptor followed by optional comma and whitespace
            pattern = rf"\b{re.escape(descriptor)},?\s*"
            normalized = re.sub(pattern, "", normalized, flags=re.IGNORECASE)

        # Remove seniority prefixes at the start (followed by space, comma, or whitespace)
        for prefix in JobFunctionAnalyzer.SENIORITY_PREFIXES:
            # Match prefix at start, followed by whitespace or comma
            pattern = rf"^{re.escape(prefix)}[\s,]+"
            normalized = re.sub(pattern, "", normalized, flags=re.IGNORECASE)

        # Normalize UI/UX variations (do this before other normalizations)
        # UI/UX Designer, UX/UI Designer → UX Designer
        # UI/UX Researcher → UX Researcher
        normalized = re.sub(r"\bUI/UX\b", "UX", normalized, flags=re.IGNORECASE)
        normalized = re.sub(r"\bUX/UI\b", "UX", normalized, flags=re.IGNORECASE)
        # User Interface → UI (will become UX above if followed by Designer)
        normalized = re.sub(r"\bUser Interface\b", "UI", normalized, flags=re.IGNORECASE)

        # Clean up multiple spaces, leading/trailing whitespace, and trailing commas
        normalized = re.sub(r"\s+", " ", normalized)
        normalized = normalized.strip().strip(",").strip()

        # Normalize common function variations (Management → Manager, Design → Designer, etc.)
        # Only apply if there's a word before it (e.g., "Product Management" not just "Management")
        function_mappings = {
            r"\bManagement$": "Manager",
            r"\bDesign$": "Designer",
            r"\bWriting$": "Writer",
            r"\bDevelopment$": "Developer",
            r"\bEngineering$": "Engineer",
        }

        for pattern, replacement in function_mappings.items():
            # Check if pattern matches and there's a word before it
            if re.search(rf"\w+\s+{pattern}", normalized, re.IGNORECASE):
                normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)

        # If nothing left after cleaning, return original
        if not normalized:
            return title.strip()

        return normalized

    @staticmethod
    def analyze_job_functions(
        job_titles: list[str],
        threshold_percentage: float = DEFAULT_THRESHOLD_PERCENTAGE,
        min_common: int = MIN_COMMON_FUNCTIONS,
    ) -> JobFunctionConfig:
        """
        Analyze job titles and determine which should be common vs "Other".

        Normalizes titles first (removes seniority prefixes) to group by function, not level.

        Args:
            job_titles: List of raw job titles from Excel data
            threshold_percentage: Minimum percentage to be considered "common" (default 5%)
            min_common: Minimum number of common functions to keep (default 5)

        Returns:
            JobFunctionConfig with common functions and metadata
        """
        # Normalize job titles to group by function, not seniority level
        normalized_titles = [JobFunctionAnalyzer.normalize_job_title(title) for title in job_titles]

        # Count occurrences of each normalized job title
        title_counts = Counter(normalized_titles)
        total_employees = len(normalized_titles)
        total_unique = len(title_counts)

        # Calculate threshold count
        threshold_count = max(1, int(total_employees * threshold_percentage / 100))

        # Get functions above threshold
        common_functions = [
            title for title, count in title_counts.items() if count >= threshold_count
        ]

        # Ensure we have at least min_common functions
        if len(common_functions) < min_common:
            # Get top N most common functions
            most_common = title_counts.most_common(min_common)
            common_functions = [title for title, _ in most_common]

        # Sort common functions alphabetically for consistency
        common_functions = sorted(common_functions)

        # Count employees in "Other" bucket
        other_count = sum(
            count for title, count in title_counts.items() if title not in common_functions
        )

        logger.info(
            f"Job function analysis: {len(common_functions)} common functions "
            f"(threshold: {threshold_percentage}%, {threshold_count} employees), "
            f"{other_count} employees in 'Other' bucket, "
            f"{total_unique} total unique functions"
        )

        return JobFunctionConfig(
            common_functions=common_functions,
            threshold_percentage=threshold_percentage,
            total_unique_functions=total_unique,
            other_count=other_count,
        )

    @staticmethod
    def categorize_job_function(job_title: str, config: JobFunctionConfig) -> str:
        """
        Categorize a job title as either a common function or "Other".

        Normalizes the title first to match against normalized common functions.

        Args:
            job_title: The raw job title
            config: Job function configuration from analysis

        Returns:
            Either the normalized job function (if common) or "Other"
        """
        if not job_title or not job_title.strip():
            return "Unknown"

        # Normalize the title (remove seniority prefixes, etc.)
        normalized_title = JobFunctionAnalyzer.normalize_job_title(job_title)

        # Check if normalized title is in common functions
        if normalized_title in config.common_functions:
            return normalized_title
        else:
            return "Other"


class SheetDetector:
    """Detect which sheet in an Excel file contains employee data."""

    # Required columns that must be present for employee data
    REQUIRED_COLUMNS: ClassVar[list[str]] = [
        "Employee ID",
        "Worker",
        "Business Title",
        "Job Level - Primary Position",
    ]

    # Optional columns that boost the score
    OPTIONAL_COLUMNS: ClassVar[list[str]] = [
        "Performance",
        "Potential",
        "Aug 2025 Talent Assessment Performance",
        "Aug 2025  Talent Assessment Potential",
        "Current Performance",
        "Current Potential",
    ]

    # Keywords in sheet names that suggest employee data
    SHEET_NAME_KEYWORDS: ClassVar[list[str]] = [
        "employee",
        "talent",
        "people",
        "data",
        "worker",
        "staff",
    ]

    @staticmethod
    def _score_sheet(df: pd.DataFrame, sheet_name: str) -> int:
        """
        Score a sheet based on how likely it is to contain employee data.

        Returns:
            Score (0-100+). Higher is better. Threshold for acceptance is typically 30.
        """
        score = 0

        # Check for required columns (10 points each)
        for col in SheetDetector.REQUIRED_COLUMNS:
            if col in df.columns:
                score += 10

        # Check for optional columns (5 points each)
        for col in SheetDetector.OPTIONAL_COLUMNS:
            if col in df.columns:
                score += 5
                break  # Only count once if any performance/potential column exists

        # Check row count (10 points if > 5 rows)
        if len(df) > 5:
            score += 10

        # Check sheet name for keywords (5 points)
        sheet_name_lower = sheet_name.lower()
        if any(keyword in sheet_name_lower for keyword in SheetDetector.SHEET_NAME_KEYWORDS):
            score += 5

        return score

    @staticmethod
    def find_best_sheet(file_path: str | Path) -> tuple[pd.DataFrame, str, int]:
        """
        Find the best sheet in the Excel file to parse.

        Returns:
            Tuple of (dataframe, sheet_name, sheet_index)

        Raises:
            ValueError: If no suitable sheet is found or file cannot be read.
        """
        try:
            # Read all sheet names - use try/finally to ensure file handle is closed
            excel_file = pd.ExcelFile(file_path)
            try:
                sheet_names = excel_file.sheet_names

                logger.info(f"Examining {len(sheet_names)} sheets: {sheet_names}")

                best_score = 0
                best_sheet = None
                best_sheet_name = None
                best_sheet_index = None

                for idx, sheet_name in enumerate(sheet_names):
                    try:
                        df = pd.read_excel(file_path, sheet_name=sheet_name)
                        # Ensure sheet_name is a string
                        sheet_name_str = str(sheet_name)
                        score = SheetDetector._score_sheet(df, sheet_name_str)

                        logger.debug(
                            f"Sheet '{sheet_name_str}' (index {idx}): score={score}, rows={len(df)}, columns={len(df.columns)}"
                        )

                        if score > best_score:
                            best_score = score
                            best_sheet = df
                            best_sheet_name = sheet_name_str
                            best_sheet_index = idx

                    except Exception as e:
                        logger.warning(f"Failed to read sheet '{sheet_name}': {e}")
                        continue

                # Check if we found a suitable sheet
                if best_score < 30:
                    # If no sheet scored well, fall back to sheet index 1 for backward compatibility
                    if len(sheet_names) > 1:
                        logger.warning(
                            f"No sheet scored >= 30 (best was {best_score}). "
                            f"Falling back to sheet index 1 for backward compatibility."
                        )
                        try:
                            df = pd.read_excel(file_path, sheet_name=1)
                            return df, str(sheet_names[1]), 1
                        except Exception as e:
                            raise ValueError(
                                f"No sheet found containing employee data. Best score was {best_score}. "
                                f"Fallback to sheet 1 failed: {e}"
                            ) from e
                    else:
                        raise ValueError(
                            f"No sheet found containing employee data. "
                            f"Only 1 sheet present with score {best_score} (threshold: 30)."
                        )

                logger.info(
                    f"Selected sheet '{best_sheet_name}' (index {best_sheet_index}) "
                    f"with score {best_score}"
                )

                # Runtime checks - these should never be None if best_score > 0
                if best_sheet is None or best_sheet_name is None or best_sheet_index is None:
                    raise ValueError(
                        "Internal error: best_sheet data is None despite having a valid score"
                    )

                return best_sheet, best_sheet_name, best_sheet_index

            finally:
                # Always close the Excel file to release file handles
                excel_file.close()

        except ValueError as e:
            # Re-raise our own ValueErrors (from validation above), wrap others
            if "No sheet found containing employee data" in str(e):
                raise
            raise ValueError(f"Failed to read Excel file: {e}") from e
        except Exception as e:
            raise ValueError(f"Failed to read Excel file: {e}") from e


class ExcelParser:
    """Parse Excel file into Employee objects."""

    def __init__(self) -> None:
        """Initialize the parser with tracking for defaults and warnings."""
        self.defaulted_fields: dict[str, int] = defaultdict(int)
        self.warnings: list[str] = []
        self.job_function_config: JobFunctionConfig | None = None

    def parse(self, file_path: str | Path) -> ParsingResult:
        """
        Read Excel sheet and convert to Employee list.

        Uses intelligent sheet detection to find employee data.
        Returns ParsingResult with employees and metadata about the parsing process.

        Raises:
            ValueError: If file cannot be read or no suitable data found.
        """
        # Reset tracking for this parse operation
        self.defaulted_fields = defaultdict(int)
        self.warnings = []

        # Use SheetDetector to find the best sheet
        logger.info(f"Parsing Excel file: {file_path}")
        df, sheet_name, sheet_index = SheetDetector.find_best_sheet(file_path)

        # Validate required columns exist
        required_columns = [
            "Employee ID",
            "Worker",
            "Business Title",
            "Job Level - Primary Position",
        ]
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            error_msg = f"Missing required columns in sheet '{sheet_name}': {missing}"
            logger.error(error_msg)
            raise ValueError(error_msg)

        # Track statistics
        total_rows = len(df)

        # PASS 1: Collect all raw job titles for analysis
        logger.info(f"Pass 1: Analyzing job functions from {total_rows} rows")
        raw_job_titles = []
        for _, row in df.iterrows():
            # Use Business Title as the source of truth for job function
            business_title = row.get("Business Title", "")
            if pd.notna(business_title):
                raw_job_titles.append(str(business_title).strip())
            else:
                raw_job_titles.append("")

        # Analyze job functions to determine common vs "Other"
        self.job_function_config = JobFunctionAnalyzer.analyze_job_functions(raw_job_titles)

        # PASS 2: Parse employees with categorized job functions
        logger.info(f"Pass 2: Parsing {total_rows} employee rows")
        employees = []
        failed_rows = 0

        for idx, row in df.iterrows():
            try:
                emp = self._parse_employee_row(row)
                employees.append(emp)
            except Exception as e:
                failed_rows += 1
                warning_msg = f"Failed to parse row {idx}: {e}"
                logger.warning(warning_msg)
                self.warnings.append(warning_msg)
                continue

        if not employees:
            error_msg = f"No valid employees found in Excel file. Total rows: {total_rows}, Failed rows: {failed_rows}"
            logger.error(error_msg)
            raise ValueError(error_msg)

        # Create metadata
        parsed_rows = len(employees)
        metadata = ParsingMetadata(
            sheet_name=sheet_name,
            sheet_index=sheet_index,
            total_rows=total_rows,
            parsed_rows=parsed_rows,
            failed_rows=failed_rows,
            defaulted_fields=dict(self.defaulted_fields),
            warnings=self.warnings,
            job_function_config=self.job_function_config,
        )

        logger.info(
            f"Parsing complete: {parsed_rows}/{total_rows} employees parsed successfully. "
            f"Failed: {failed_rows}, Defaulted fields: {len(self.defaulted_fields)}"
        )

        # Log defaulted fields if any
        if self.defaulted_fields:
            logger.info(f"Defaulted fields summary: {dict(self.defaulted_fields)}")

        return ParsingResult(employees=employees, metadata=metadata)

    def _parse_employee_row(self, row: pd.Series) -> Employee:
        """Parse a single employee row."""
        # Extract historical ratings
        history = []
        if pd.notna(row.get("2023 Completed Performance Rating")):
            history.append(
                HistoricalRating(year=2023, rating=str(row["2023 Completed Performance Rating"]))
            )
        if pd.notna(row.get("2024 Completed Performance Rating")):
            history.append(
                HistoricalRating(year=2024, rating=str(row["2024 Completed Performance Rating"]))
            )

        # Get performance and potential (handle different possible column names)
        performance_col = self._find_column(
            row, ["Aug 2025 Talent Assessment Performance", "Performance", "Current Performance"]
        )
        potential_col = self._find_column(
            row, ["Aug 2025  Talent Assessment Potential", "Potential", "Current Potential"]
        )

        # Handle NaN values properly - check before converting to string
        if performance_col is None:
            self.defaulted_fields["Performance"] += 1
            performance_str = "Medium"
        else:
            performance_val = row.get(performance_col)
            performance_str = (
                str(performance_val).strip() if pd.notna(performance_val) else "Medium"
            )
            if not pd.notna(performance_val):
                self.defaulted_fields["Performance"] += 1

        if potential_col is None:
            self.defaulted_fields["Potential"] += 1
            potential_str = "Medium"
        else:
            potential_val = row.get(potential_col)
            potential_str = str(potential_val).strip() if pd.notna(potential_val) else "Medium"
            if not pd.notna(potential_val):
                self.defaulted_fields["Potential"] += 1

        # Map to enum values
        try:
            performance = PerformanceLevel(performance_str)
        except ValueError:
            logger.warning(f"Invalid performance value '{performance_str}', defaulting to Medium")
            self.defaulted_fields["Performance (Invalid)"] += 1
            performance = PerformanceLevel.MEDIUM

        try:
            potential = PotentialLevel(potential_str)
        except ValueError:
            logger.warning(f"Invalid potential value '{potential_str}', defaulting to Medium")
            self.defaulted_fields["Potential (Invalid)"] += 1
            potential = PotentialLevel.MEDIUM

        # Calculate grid position
        grid_position = calculate_grid_position(performance, potential)

        # Parse hire date
        hire_date_val = row.get("Hire Date")
        if pd.notna(hire_date_val):
            if isinstance(hire_date_val, pd.Timestamp):
                hire_date = hire_date_val.date()
            else:
                hire_date = pd.to_datetime(hire_date_val).date()  # type: ignore[arg-type]  # pandas type inference
        else:
            hire_date = date.today()

        # Extract location from job_profile
        # Location is the last 3 characters (country code)
        job_profile_str = str(row.get("Job Profile", row.get("Job Title", "")))
        location = job_profile_str[-3:].upper() if len(job_profile_str) >= 3 else ""

        # Extract job function from Business Title (source of truth)
        # Categorize using the auto-detected common functions
        business_title = row.get("Business Title", "")
        if pd.notna(business_title) and business_title:
            raw_job_title = str(business_title).strip()
        else:
            raw_job_title = ""

        # Categorize job function using configuration
        if self.job_function_config:
            job_function = JobFunctionAnalyzer.categorize_job_function(
                raw_job_title, self.job_function_config
            )
        else:
            # Fallback if no config (shouldn't happen in normal flow)
            job_function = (
                JobFunctionAnalyzer.normalize_job_title(raw_job_title)
                if raw_job_title
                else "Unknown"
            )

        # Parse flags from tracking column (comma-separated list)
        flags_value = row.get("Flags")
        flags = None
        if pd.notna(flags_value) and str(flags_value).strip():
            # Split by comma and strip whitespace from each flag
            flags = [f.strip() for f in str(flags_value).split(",") if f.strip()]

        # Parse donut exercise data from tracking columns
        donut_position = None
        donut_performance = None
        donut_potential = None
        donut_notes = None
        donut_modified = False

        donut_pos_value = row.get("Donut Exercise Position")
        if pd.notna(donut_pos_value) and str(donut_pos_value).strip():
            try:
                # Cast to float first to handle both int and float values from Excel
                donut_position = int(cast(float, donut_pos_value))
                donut_modified = True

                # Parse donut performance/potential from position if available
                # Position 1-9 maps to performance/potential combinations
                if 1 <= donut_position <= 9:
                    # Calculate performance and potential from grid position
                    # Grid formula: position = (potential_row * 3) + performance_column
                    # Where performance: Low=1, Medium=2, High=3
                    # And potential_row: Low=0, Medium=3, High=6
                    #
                    # Reverse calculation:
                    # performance_column = ((position - 1) % 3) + 1  -> gives 1, 2, or 3
                    # potential_row = (position - 1) // 3  -> gives 0, 1, or 2
                    perf_idx = (donut_position - 1) % 3  # Column (0, 1, 2)
                    pot_idx = (donut_position - 1) // 3  # Row (0, 1, 2)
                    perf_levels = [
                        PerformanceLevel.LOW,
                        PerformanceLevel.MEDIUM,
                        PerformanceLevel.HIGH,
                    ]
                    pot_levels = [PotentialLevel.LOW, PotentialLevel.MEDIUM, PotentialLevel.HIGH]
                    donut_performance = perf_levels[perf_idx]
                    donut_potential = pot_levels[pot_idx]
            except (ValueError, TypeError):
                # If conversion fails, leave donut data as None
                pass

        donut_notes_value = row.get("Donut Exercise Notes")
        if pd.notna(donut_notes_value) and str(donut_notes_value).strip():
            donut_notes = str(donut_notes_value).strip()

        employee = Employee(
            employee_id=int(row["Employee ID"]),
            name=str(row["Worker"]).strip(),
            business_title=str(row.get("Business Title", "")).strip(),
            job_title=str(row.get("Job Title", row.get("Business Title", ""))).strip(),
            job_profile=job_profile_str.strip(),
            job_level=str(row["Job Level - Primary Position"]).strip(),
            job_function=job_function,
            location=location,
            manager=str(row.get("Worker's Manager", "")).strip()
            if pd.notna(row.get("Worker's Manager"))
            else "",
            management_chain_01=str(row.get("Management Chain - Level 01")).strip()
            if pd.notna(row.get("Management Chain - Level 01"))
            else None,
            management_chain_02=str(row.get("Management Chain - Level 02")).strip()
            if pd.notna(row.get("Management Chain - Level 02"))
            else None,
            management_chain_03=str(row.get("Management Chain - Level 03")).strip()
            if pd.notna(row.get("Management Chain - Level 03"))
            else None,
            management_chain_04=str(row.get("Management Chain - Level 04")).strip()
            if pd.notna(row.get("Management Chain - Level 04"))
            else None,
            management_chain_05=str(row.get("Management Chain - Level 05")).strip()
            if pd.notna(row.get("Management Chain - Level 05"))
            else None,
            management_chain_06=str(row.get("Management Chain - Level 06")).strip()
            if pd.notna(row.get("Management Chain - Level 06"))
            else None,
            hire_date=hire_date,
            tenure_category=str(row.get("Tenure Category (Months)", "")).strip()
            if pd.notna(row.get("Tenure Category (Months)"))
            else "",
            time_in_job_profile=str(row.get("Time in Job Profile", "")).strip()
            if pd.notna(row.get("Time in Job Profile"))
            else "",
            performance=performance,
            potential=potential,
            grid_position=grid_position,
            talent_indicator=str(
                row.get("FY25 Talent Indicator", row.get("Talent Indicator", ""))
            ).strip()
            if pd.notna(row.get("FY25 Talent Indicator"))
            else "",
            ratings_history=history,
            development_focus=str(row.get("Development Focus", "")).strip()
            if pd.notna(row.get("Development Focus"))
            else None,
            development_action=str(row.get("Development Action", "")).strip()
            if pd.notna(row.get("Development Action"))
            else None,
            notes=str(row.get("Notes", "")).strip() if pd.notna(row.get("Notes")) else None,
            promotion_status=str(row.get("Promotion (In-Line,", row.get("Promotion", ""))).strip()
            if pd.notna(row.get("Promotion (In-Line,"))
            else None,
            promotion_readiness=self._parse_promotion_readiness(row.get("Promotion Readiness")),
            modified_in_session=False,
            flags=flags,
            donut_position=donut_position,
            donut_performance=donut_performance,
            donut_potential=donut_potential,
            donut_modified=donut_modified,
            donut_notes=donut_notes,
        )

        return employee

    def _find_column(self, row: pd.Series, possible_names: list[str]) -> str | None:
        """
        Find first matching column name from a list of possibilities.

        Returns:
            The first matching column name, or None if no match found.
        """
        for name in possible_names:
            if name in row.index:
                return name
        return None  # No matching column found

    def _parse_promotion_readiness(self, value: Any) -> bool | None:
        """Parse promotion readiness value to boolean."""
        if pd.isna(value):
            return None
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            value_lower = value.strip().lower()
            if value_lower in ("yes", "true", "1", "ready", "x"):
                return True
            if value_lower in ("no", "false", "0", "not ready", ""):
                return False
        return None
