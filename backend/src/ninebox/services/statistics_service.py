"""Statistics calculation service."""

from collections import Counter
from typing import TypedDict

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


class BoxStats(TypedDict):
    """Statistics for a single 9-box position."""

    count: int
    percentage: float
    label: str


class StatisticsService:
    """Calculate distribution statistics."""

    def calculate_distribution(self, employees: list[Employee]) -> dict:
        """Calculate 9-box distribution."""
        # Initialize counts
        distribution_dict: dict[str, BoxStats] = {}
        for i in range(1, 10):
            distribution_dict[str(i)] = {
                "count": 0,
                "percentage": 0.0,
                "label": self._get_box_label(i),
            }

        # Count employees in each box
        for emp in employees:
            pos = str(emp.grid_position)
            if pos in distribution_dict:
                distribution_dict[pos]["count"] += 1

        # Calculate percentages
        total = len(employees)
        for box in distribution_dict.values():
            box["percentage"] = round((box["count"] / total * 100), 1) if total > 0 else 0

        # Convert distribution dict to array format for frontend
        distribution = [
            {
                "grid_position": int(pos),
                "position_label": data["label"],
                "count": data["count"],
                "percentage": data["percentage"],
            }
            for pos, data in distribution_dict.items()
        ]

        # Aggregate by performance/potential
        by_performance = {
            "Low": sum(1 for e in employees if e.performance == PerformanceLevel.LOW),
            "Medium": sum(1 for e in employees if e.performance == PerformanceLevel.MEDIUM),
            "High": sum(1 for e in employees if e.performance == PerformanceLevel.HIGH),
        }

        by_potential = {
            "Low": sum(1 for e in employees if e.potential == PotentialLevel.LOW),
            "Medium": sum(1 for e in employees if e.potential == PotentialLevel.MEDIUM),
            "High": sum(1 for e in employees if e.potential == PotentialLevel.HIGH),
        }

        # Aggregate by job function
        job_function_counts = Counter(e.job_function for e in employees)
        by_job_function = dict(job_function_counts.most_common())

        # Count modified employees
        modified_count = sum(1 for e in employees if e.modified_in_session)

        # Count high performers (positions 7, 8, 9 = High performance)
        high_performers = sum(1 for e in employees if e.performance == PerformanceLevel.HIGH)

        return {
            "total_employees": total,
            "modified_employees": modified_count,
            "high_performers": high_performers,
            "distribution": distribution,
            "by_performance": by_performance,
            "by_potential": by_potential,
            "by_job_function": by_job_function,
        }

    def _get_box_label(self, position: int) -> str:
        """Get label for a grid position."""
        labels = {
            9: "Star [H,H]",
            8: "Growth [M,H]",
            7: "Enigma [L,H]",
            6: "High Impact [H,M]",
            5: "Core Talent [M,M]",
            4: "Inconsistent [L,M]",
            3: "Workhorse [H,L]",
            2: "Effective Pro [M,L]",
            1: "Underperformer [L,L]",
        }
        return labels.get(position, f"Position {position}")


# Global statistics service instance
statistics_service = StatisticsService()
