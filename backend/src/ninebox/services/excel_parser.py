"""Excel file parser service."""

from datetime import date
from pathlib import Path
from typing import Any

import pandas as pd

from ninebox.models.employee import Employee, HistoricalRating, PerformanceLevel, PotentialLevel


class ExcelParser:
    """Parse Excel file into Employee objects."""

    @staticmethod
    def _categorize_job_function(job_function: str) -> str:
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
        elif "engineer" in job_function_lower or "software" in job_function_lower or "developer" in job_function_lower:
            if "data" in job_function_lower:
                return "Data Engineering"
            elif "machine learning" in job_function_lower or "ml " in job_function_lower or "ai " in job_function_lower:
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
        elif ("tech" in job_function_lower and "writ" in job_function_lower) or "technical writ" in job_function_lower:
            return "Technical Writing"
        elif "content" in job_function_lower:
            return "Content"

        # Management roles
        elif "manager" in job_function_lower or "director" in job_function_lower or "vp " in job_function_lower or "head of" in job_function_lower:
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
        elif "hr " in job_function_lower or "people" in job_function_lower or "talent" in job_function_lower:
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
                return " ".join(words[:min(2, len(words))]).title()
            return "Other"

    def parse(self, file_path: str | Path) -> list[Employee]:
        """
        Read Excel sheet and convert to Employee list.

        Expects the second sheet (index 1) to contain employee data.
        """
        # Read Excel file - use second sheet (index 1)
        try:
            df = pd.read_excel(file_path, sheet_name=1)
        except Exception as e:
            raise ValueError(f"Failed to read Excel file: {e}")

        # Validate required columns exist
        required_columns = [
            "Employee ID",
            "Worker",
            "Business Title",
            "Job Level - Primary Position",
        ]
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        employees = []

        for idx, row in df.iterrows():
            try:
                emp = self._parse_employee_row(row)
                employees.append(emp)
            except Exception as e:
                print(f"Warning: Failed to parse row {idx}: {e}")
                continue

        if not employees:
            raise ValueError("No valid employees found in Excel file")

        return employees

    def _parse_employee_row(self, row: pd.Series) -> Employee:
        """Parse a single employee row."""
        # Extract historical ratings
        history = []
        if pd.notna(row.get("2023 Completed Performance Rating")):
            history.append(
                HistoricalRating(
                    year=2023, rating=str(row["2023 Completed Performance Rating"])
                )
            )
        if pd.notna(row.get("2024 Completed Performance Rating")):
            history.append(
                HistoricalRating(
                    year=2024, rating=str(row["2024 Completed Performance Rating"])
                )
            )

        # Get performance and potential (handle different possible column names)
        performance_col = self._find_column(
            row, ["Aug 2025 Talent Assessment Performance", "Performance", "Current Performance"]
        )
        potential_col = self._find_column(
            row, ["Aug 2025  Talent Assessment Potential", "Potential", "Current Potential"]
        )

        performance_str = str(row.get(performance_col, "Medium")).strip()
        potential_str = str(row.get(potential_col, "Medium")).strip()

        # Map to enum values
        try:
            performance = PerformanceLevel(performance_str)
        except ValueError:
            print(f"Warning: Invalid performance '{performance_str}', defaulting to Medium")
            performance = PerformanceLevel.MEDIUM

        try:
            potential = PotentialLevel(potential_str)
        except ValueError:
            print(f"Warning: Invalid potential '{potential_str}', defaulting to Medium")
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
        position_label = str(row.get(position_label_col, self._get_position_label(performance, potential)))

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
            name=str(row["Worker"]),
            business_title=str(row.get("Business Title", "")),
            job_title=str(row.get("Job Title", row.get("Business Title", ""))),
            job_profile=job_profile_str,
            job_level=str(row["Job Level - Primary Position"]),
            job_function=job_function,
            location=location,
            manager=str(row.get("Worker's Manager", "")) if pd.notna(row.get("Worker's Manager")) else "",
            management_chain_01=str(row.get("Management Chain - Level 01")) if pd.notna(row.get("Management Chain - Level 01")) else None,
            management_chain_02=str(row.get("Management Chain - Level 02")) if pd.notna(row.get("Management Chain - Level 02")) else None,
            management_chain_03=str(row.get("Management Chain - Level 03")) if pd.notna(row.get("Management Chain - Level 03")) else None,
            management_chain_04=str(row.get("Management Chain - Level 04")) if pd.notna(row.get("Management Chain - Level 04")) else None,
            management_chain_05=str(row.get("Management Chain - Level 05")) if pd.notna(row.get("Management Chain - Level 05")) else None,
            management_chain_06=str(row.get("Management Chain - Level 06")) if pd.notna(row.get("Management Chain - Level 06")) else None,
            hire_date=hire_date,
            tenure_category=str(row.get("Tenure Category (Months)", "")) if pd.notna(row.get("Tenure Category (Months)")) else "",
            time_in_job_profile=str(row.get("Time in Job Profile", "")) if pd.notna(row.get("Time in Job Profile")) else "",
            performance=performance,
            potential=potential,
            grid_position=grid_position,
            position_label=position_label,
            talent_indicator=str(row.get("FY25 Talent Indicator", row.get("Talent Indicator", ""))) if pd.notna(row.get("FY25 Talent Indicator")) else "",
            ratings_history=history,
            development_focus=str(row.get("Development Focus", "")) if pd.notna(row.get("Development Focus")) else None,
            development_action=str(row.get("Development Action", "")) if pd.notna(row.get("Development Action")) else None,
            notes=str(row.get("Notes", "")) if pd.notna(row.get("Notes")) else None,
            promotion_status=str(row.get("Promotion (In-Line,", row.get("Promotion", ""))) if pd.notna(row.get("Promotion (In-Line,")) else None,
            promotion_readiness=self._parse_promotion_readiness(row.get("Promotion Readiness")),
            modified_in_session=False,
        )

        return employee

    def _find_column(self, row: pd.Series, possible_names: list[str]) -> str:
        """Find first matching column name from a list of possibilities."""
        for name in possible_names:
            if name in row.index:
                return name
        return possible_names[0]  # Default to first option

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
