"""Statistics calculation service."""

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


class StatisticsService:
    """Calculate distribution statistics."""

    def calculate_distribution(self, employees: list[Employee]) -> dict:
        """Calculate 9-box distribution."""
        # Initialize counts
        distribution_dict = {}
        for i in range(1, 10):
            distribution_dict[str(i)] = {"count": 0, "percentage": 0.0, "label": self._get_box_label(i)}

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
        }

    def _get_box_label(self, position: int) -> str:
        """Get label for a grid position."""
        labels = {
            9: "Top Talent [H,H]",
            8: "High Impact Talent [H,M]",
            7: "High/Low [H,L]",
            6: "Growth Talent [M,H]",
            5: "Core Talent [M,M]",
            4: "Med/Low [M,L]",
            3: "Emerging Talent [L,H]",
            2: "Inconsistent Talent [L,M]",
            1: "Low/Low [L,L]",
        }
        return labels.get(position, f"Position {position}")


# Global statistics service instance
statistics_service = StatisticsService()
