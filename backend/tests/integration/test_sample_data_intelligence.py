"""Integration tests for sample data intelligence insights.

Tests that sample data generation produces detectable anomalies for the intelligence panel.
This ensures users can experience the intelligence feature with generated sample data.
"""

import pytest

from ninebox.services.intelligence_service import calculate_overall_intelligence
from ninebox.services.sample_data_generator import RichDatasetConfig, generate_rich_dataset


class TestSampleDataIntelligence:
    """Test suite for sample data intelligence integration."""

    def test_sample_data_generates_detectable_insights_with_seed_42(self) -> None:
        """Test that sample data with seed=42 generates at least 2 insights.

        This test uses a fixed seed to ensure deterministic results.
        Expected insights:
        - USA location bias (60% boost rate)
        - Sales function bias (65% boost rate)
        """
        # Given: Sample data with bias enabled
        config = RichDatasetConfig(size=200, seed=42, include_bias=True)
        employees = generate_rich_dataset(config)

        # When: Intelligence analysis is performed
        result = calculate_overall_intelligence(employees)

        # Then: At least 2 insights should be detected
        location_sig_devs = [
            d for d in result["location_analysis"]["deviations"] if d["is_significant"]
        ]
        function_sig_devs = [
            d for d in result["function_analysis"]["deviations"] if d["is_significant"]
        ]

        total_insights = len(location_sig_devs) + len(function_sig_devs)

        assert (
            total_insights >= 2
        ), f"Expected >= 2 insights, got {total_insights} (location: {len(location_sig_devs)}, function: {len(function_sig_devs)})"

        # And: Location analysis should detect USA bias
        assert (
            result["location_analysis"]["status"] in ["yellow", "red"]
        ), f"Expected location analysis to show anomaly, got {result['location_analysis']['status']}"

        # And: Function analysis should detect Sales bias
        assert (
            result["function_analysis"]["status"] in ["yellow", "red"]
        ), f"Expected function analysis to show anomaly, got {result['function_analysis']['status']}"

    @pytest.mark.parametrize("seed", [42, 123, 456, 789, 999])
    def test_sample_data_consistently_generates_insights_across_seeds(
        self, seed: int
    ) -> None:
        """Test that sample data generates 2+ insights across multiple random seeds.

        This ensures the bias patterns are strong enough to be detected regardless
        of the specific random seed used for generation.

        Args:
            seed: Random seed for data generation
        """
        # Given: Sample data with bias enabled
        config = RichDatasetConfig(size=200, seed=seed, include_bias=True)
        employees = generate_rich_dataset(config)

        # When: Intelligence analysis is performed
        result = calculate_overall_intelligence(employees)

        # Then: At least 2 insights should be detected
        location_sig_devs = [
            d for d in result["location_analysis"]["deviations"] if d["is_significant"]
        ]
        function_sig_devs = [
            d for d in result["function_analysis"]["deviations"] if d["is_significant"]
        ]

        total_insights = len(location_sig_devs) + len(function_sig_devs)

        assert (
            total_insights >= 2
        ), f"Seed {seed}: Expected >= 2 insights, got {total_insights} (location: {len(location_sig_devs)}, function: {len(function_sig_devs)})"

    def test_sample_data_with_bias_disabled_shows_no_insights(self) -> None:
        """Test that sample data with bias disabled shows no significant insights.

        When include_bias=False, the data should be evenly distributed with no
        detectable anomalies.
        """
        # Given: Sample data with bias disabled
        config = RichDatasetConfig(size=200, seed=42, include_bias=False)
        employees = generate_rich_dataset(config)

        # When: Intelligence analysis is performed
        result = calculate_overall_intelligence(employees)

        # Then: All analyses should be green (no anomalies)
        assert (
            result["location_analysis"]["status"] == "green"
        ), f"Expected green status with no bias, got {result['location_analysis']['status']}"
        assert (
            result["function_analysis"]["status"] == "green"
        ), f"Expected green status with no bias, got {result['function_analysis']['status']}"

        # And: No significant deviations should be detected
        location_sig_devs = [
            d for d in result["location_analysis"]["deviations"] if d["is_significant"]
        ]
        function_sig_devs = [
            d for d in result["function_analysis"]["deviations"] if d["is_significant"]
        ]

        assert (
            len(location_sig_devs) == 0
        ), f"Expected no location deviations, got {len(location_sig_devs)}"
        assert (
            len(function_sig_devs) == 0
        ), f"Expected no function deviations, got {len(function_sig_devs)}"

    def test_usa_bias_produces_significant_z_score(self) -> None:
        """Test that USA location bias produces z-score >= 2.0.

        The USA bias (60% boost rate) should result in significantly more high
        performers than the baseline, with a z-score >= 2.0 for statistical significance.
        """
        # Given: Sample data with bias enabled
        config = RichDatasetConfig(size=200, seed=42, include_bias=True)
        employees = generate_rich_dataset(config)

        # When: Location analysis is performed
        result = calculate_overall_intelligence(employees)
        location_analysis = result["location_analysis"]

        # Then: USA should have a significant deviation
        usa_deviations = [
            d for d in location_analysis["deviations"] if d["category"] == "USA"
        ]

        assert len(usa_deviations) == 1, "Expected exactly one USA deviation"

        usa_dev = usa_deviations[0]
        assert usa_dev["is_significant"], f"USA deviation should be significant (z={usa_dev['z_score']:.2f})"
        assert (
            abs(usa_dev["z_score"]) >= 2.0
        ), f"USA z-score should be >= 2.0, got {abs(usa_dev['z_score']):.2f}"

        # And: USA should have higher % of high performers than expected
        assert (
            usa_dev["observed_high_pct"] > usa_dev["expected_high_pct"]
        ), f"USA should have more high performers (observed={usa_dev['observed_high_pct']:.1f}%, expected={usa_dev['expected_high_pct']:.1f}%)"

    def test_sales_bias_produces_significant_z_score(self) -> None:
        """Test that Sales function bias produces z-score >= 2.0.

        The Sales bias (65% boost rate) should result in significantly more high
        performers than the baseline, with a z-score >= 2.0 for statistical significance.
        """
        # Given: Sample data with bias enabled
        config = RichDatasetConfig(size=200, seed=42, include_bias=True)
        employees = generate_rich_dataset(config)

        # When: Function analysis is performed
        result = calculate_overall_intelligence(employees)
        function_analysis = result["function_analysis"]

        # Then: Sales should have a significant deviation
        sales_deviations = [
            d for d in function_analysis["deviations"] if d["category"] == "Sales"
        ]

        assert len(sales_deviations) == 1, "Expected exactly one Sales deviation"

        sales_dev = sales_deviations[0]
        assert sales_dev["is_significant"], f"Sales deviation should be significant (z={sales_dev['z_score']:.2f})"
        assert (
            abs(sales_dev["z_score"]) >= 2.0
        ), f"Sales z-score should be >= 2.0, got {abs(sales_dev['z_score']):.2f}"

        # And: Sales should have higher % of high performers than expected
        assert (
            sales_dev["observed_high_pct"] > sales_dev["expected_high_pct"]
        ), f"Sales should have more high performers (observed={sales_dev['observed_high_pct']:.1f}%, expected={sales_dev['expected_high_pct']:.1f}%)"
