"""Excel file parser service."""

import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any

import pandas as pd

from ninebox.models.employee import Employee, HistoricalRating, PerformanceLevel, PotentialLevel

logger = logging.getLogger(__name__)


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


@dataclass
class ParsingResult:
    """Result of parsing an Excel file."""

    employees: list[Employee]
    metadata: ParsingMetadata


class SheetDetector:
    """Detect which sheet in an Excel file contains employee data."""

    # Required columns that must be present for employee data
    REQUIRED_COLUMNS = [
        "Employee ID",
        "Worker",
        "Business Title",
        "Job Level - Primary Position",
    ]

    # Optional columns that boost the score
    OPTIONAL_COLUMNS = [
        "Performance",
        "Potential",
        "Aug 2025 Talent Assessment Performance",
        "Aug 2025  Talent Assessment Potential",
        "Current Performance",
        "Current Potential",
    ]

    # Keywords in sheet names that suggest employee data
    SHEET_NAME_KEYWORDS = ["employee", "talent", "people", "data", "worker", "staff"]

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
            # Read all sheet names
            excel_file = pd.ExcelFile(file_path)
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

                    logger.debug(f"Sheet '{sheet_name_str}' (index {idx}): score={score}, rows={len(df)}, columns={len(df.columns)}")

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

            # Type assertions - we know these are not None due to score check
            assert best_sheet is not None
            assert best_sheet_name is not None
            assert best_sheet_index is not None

            return best_sheet, best_sheet_name, best_sheet_index

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

    @staticmethod
    def _categorize_job_function(job_function: str) -> str:  # noqa: PLR0911, PLR0912
        """
        Extract meaningful job function from job profile string.

        Attempts to identify function keywords and categorize them into
        broader functional areas. Returns the raw string if no match found.
        """
        if not job_function or not job_function.strip():
            return "Unknown"

        job_function_lower = job_function.lower().strip()

        # Product-related roles
        if "product" in job_function_lower:
            if "manage" in job_function_lower or "manager" in job_function_lower:
                return "Product Management"
            elif "design" in job_function_lower:
                return "Product Design"
            else:
                return "Product"

        # Engineering roles
        elif (
            "engineer" in job_function_lower
            or "software" in job_function_lower
            or "developer" in job_function_lower
        ):
            if "data" in job_function_lower:
                return "Data Engineering"
            elif (
                "machine learning" in job_function_lower
                or "ml " in job_function_lower
                or "ai " in job_function_lower
            ):
                return "ML/AI Engineering"
            else:
                return "Engineering"

        # Design roles
        elif "design" in job_function_lower:
            if "ux" in job_function_lower or "user experience" in job_function_lower:
                return "UX Design"
            elif "product" in job_function_lower:
                return "Product Design"
            else:
                return "Design"

        # Research roles
        elif "research" in job_function_lower:
            if "ux" in job_function_lower or "user" in job_function_lower:
                return "UX Research"
            elif "data" in job_function_lower:
                return "Data Science"
            else:
                return "Research"

        # Data roles
        elif "data" in job_function_lower:
            if "scien" in job_function_lower:
                return "Data Science"
            elif "analy" in job_function_lower:
                return "Data Analytics"
            else:
                return "Data"

        # Writing/Documentation roles
        elif (
            "tech" in job_function_lower and "writ" in job_function_lower
        ) or "technical writ" in job_function_lower:
            return "Technical Writing"
        elif "content" in job_function_lower:
            return "Content"

        # Management roles
        elif (
            "manager" in job_function_lower
            or "director" in job_function_lower
            or "vp " in job_function_lower
            or "head of" in job_function_lower
        ):
            return "Management"

        # Sales/Marketing roles
        elif "sales" in job_function_lower or "account" in job_function_lower:
            return "Sales"
        elif "marketing" in job_function_lower:
            return "Marketing"

        # Support roles
        elif "support" in job_function_lower or "success" in job_function_lower:
            return "Customer Success"

        # HR/People roles
        elif (
            "hr " in job_function_lower
            or "people" in job_function_lower
            or "talent" in job_function_lower
        ):
            return "People/HR"

        # Finance/Operations
        elif "finance" in job_function_lower or "accounting" in job_function_lower:
            return "Finance"
        elif "operations" in job_function_lower or " ops " in job_function_lower:
            return "Operations"

        # If no category matched, return the original (truncated to avoid too many unique values)
        else:
            # Extract first meaningful word(s) as function name
            words = job_function.split()
            if words:
                # Take first 1-2 words as the function name
                return " ".join(words[: min(2, len(words))]).title()
            return "Other"

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
        employees = []
        failed_rows = 0

        logger.info(f"Parsing {total_rows} rows from sheet '{sheet_name}'")

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
            performance_str = str(performance_val).strip() if pd.notna(performance_val) else "Medium"
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
        grid_position = self._calculate_position(performance, potential)

        # Get position label
        position_label_col = self._find_column(
            row,
            [
                "Talent Mapping Position [Performance vs Potential]",
                "Position Label",
                "9-Box Position",
            ],
        )
        if position_label_col is None or pd.isna(row.get(position_label_col)):
            if position_label_col is None:
                self.defaulted_fields["Position Label"] += 1
            position_label = self._get_position_label(performance, potential)
        else:
            position_label = str(row.get(position_label_col))

        # Parse hire date
        hire_date_val = row.get("Hire Date")
        if pd.notna(hire_date_val):
            if isinstance(hire_date_val, pd.Timestamp):
                hire_date = hire_date_val.date()
            else:
                hire_date = pd.to_datetime(hire_date_val).date()
        else:
            hire_date = date.today()

        # Extract location and job function from job_profile
        # Location is the last 3 characters (country code)
        # Job function is the job_profile without the location, categorized into groups
        job_profile_str = str(row.get("Job Profile", row.get("Job Title", "")))
        if len(job_profile_str) >= 3:
            location = job_profile_str[-3:].upper()
            raw_job_function = job_profile_str[:-3].strip()
            job_function = self._categorize_job_function(raw_job_function)
        else:
            location = ""
            job_function = self._categorize_job_function(job_profile_str)

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
            position_label=position_label,
            talent_indicator=str(row.get("FY25 Talent Indicator", row.get("Talent Indicator", ""))).strip()
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

    def _calculate_position(self, perf: PerformanceLevel, pot: PotentialLevel) -> int:
        """Calculate 1-9 grid position from performance/potential.

        Grid layout (standard 9-box):
            Performance (columns): Low=1, Medium=2, High=3
            Potential (rows): Low=1-3, Medium=4-6, High=7-9

            Position = (potential_row * 3) + performance_column

            Example: High Performance (3), Low Potential (0*3) = position 3
        """
        # Performance determines column (1-3)
        perf_map = {
            PerformanceLevel.LOW: 1,
            PerformanceLevel.MEDIUM: 2,
            PerformanceLevel.HIGH: 3,
        }
        # Potential determines row (0, 3, 6)
        pot_map = {
            PotentialLevel.LOW: 0,
            PotentialLevel.MEDIUM: 3,
            PotentialLevel.HIGH: 6,
        }
        return pot_map[pot] + perf_map[perf]

    def _get_position_label(self, perf: PerformanceLevel, pot: PotentialLevel) -> str:
        """Get position label from performance/potential."""
        labels = {
            (PerformanceLevel.HIGH, PotentialLevel.HIGH): "Top Talent [H,H]",
            (PerformanceLevel.HIGH, PotentialLevel.MEDIUM): "High Impact Talent [H,M]",
            (PerformanceLevel.HIGH, PotentialLevel.LOW): "High/Low [H,L]",
            (PerformanceLevel.MEDIUM, PotentialLevel.HIGH): "Growth Talent [M,H]",
            (PerformanceLevel.MEDIUM, PotentialLevel.MEDIUM): "Core Talent [M,M]",
            (PerformanceLevel.MEDIUM, PotentialLevel.LOW): "Med/Low [M,L]",
            (PerformanceLevel.LOW, PotentialLevel.HIGH): "Emerging Talent [L,H]",
            (PerformanceLevel.LOW, PotentialLevel.MEDIUM): "Inconsistent Talent [L,M]",
            (PerformanceLevel.LOW, PotentialLevel.LOW): "Low/Low [L,L]",
        }
        return labels.get((perf, pot), f"[{perf.value[0]},{pot.value[0]}]")
