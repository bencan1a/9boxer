"""Reference tests comparing pure Python statistics against scipy.

These tests verify that our pure Python implementations produce results
that match scipy within acceptable tolerance.

These tests will be SKIPPED if scipy is not installed (after removal).
They serve as accuracy verification during the migration.
"""

import pytest

# Try to import scipy - tests will be skipped if not available
try:
    import numpy as np
    from scipy import stats as scipy_stats

    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

from ninebox.utils import pure_statistics as ps


pytestmark = pytest.mark.skipif(
    not SCIPY_AVAILABLE, reason="scipy not installed (expected after dependency removal)"
)


class TestChiSquareTest:
    """Test chi_square_test against scipy.stats.chi2_contingency."""

    def test_simple_2x2_table(self) -> None:
        """Test with a simple 2x2 contingency table."""
        table = [[10, 20], [30, 40]]

        # Scipy
        scipy_chi2, scipy_p, scipy_dof, scipy_expected = scipy_stats.chi2_contingency(table)

        # Pure Python
        ps_chi2, ps_p, ps_dof, ps_expected = ps.chi_square_test(table)

        # Verify results match within tolerance
        assert abs(ps_chi2 - scipy_chi2) < 0.001
        assert abs(ps_p - scipy_p) < 0.001
        assert ps_dof == scipy_dof

        # Check expected frequencies
        for i in range(len(table)):
            for j in range(len(table[0])):
                assert abs(ps_expected[i][j] - scipy_expected[i, j]) < 0.001

    def test_3x3_table(self) -> None:
        """Test with a 3x3 contingency table."""
        table = [[5, 10, 15], [20, 25, 30], [35, 40, 45]]

        scipy_chi2, scipy_p, scipy_dof, scipy_expected = scipy_stats.chi2_contingency(table)
        ps_chi2, ps_p, ps_dof, ps_expected = ps.chi_square_test(table)

        assert abs(ps_chi2 - scipy_chi2) < 0.001
        assert abs(ps_p - scipy_p) < 0.001
        assert ps_dof == scipy_dof

    def test_4x3_table(self) -> None:
        """Test with rectangular (4x3) table."""
        table = [[12, 8, 10], [15, 20, 18], [22, 17, 19], [10, 15, 12]]

        scipy_chi2, scipy_p, scipy_dof, scipy_expected = scipy_stats.chi2_contingency(table)
        ps_chi2, ps_p, ps_dof, ps_expected = ps.chi_square_test(table)

        assert abs(ps_chi2 - scipy_chi2) < 0.01
        assert abs(ps_p - scipy_p) < 0.01
        assert ps_dof == scipy_dof

    def test_location_example(self) -> None:
        """Test with real-world example from location analysis."""
        # Location analysis: rows=locations, cols=[High, Medium, Low]
        table = [
            [5, 15, 2],  # New York
            [8, 20, 3],  # London
            [3, 12, 1],  # Tokyo
        ]

        scipy_chi2, scipy_p, scipy_dof, _ = scipy_stats.chi2_contingency(table)
        ps_chi2, ps_p, ps_dof, _ = ps.chi_square_test(table)

        assert abs(ps_chi2 - scipy_chi2) < 0.001
        assert abs(ps_p - scipy_p) < 0.001
        assert ps_dof == scipy_dof


class TestChiSquareGoodnessOfFit:
    """Test chi_square_goodness_of_fit against scipy.stats.chisquare."""

    def test_simple_example(self) -> None:
        """Test with simple observed vs expected."""
        observed = [10, 15, 20]
        expected = [12.0, 14.0, 19.0]

        scipy_chi2, scipy_p = scipy_stats.chisquare(observed, expected)
        ps_chi2, ps_p = ps.chi_square_goodness_of_fit(observed, expected)

        assert abs(ps_chi2 - scipy_chi2) < 0.001
        assert abs(ps_p - scipy_p) < 0.001

    def test_manager_distribution(self) -> None:
        """Test with manager distribution example."""
        # Manager has: 5 high, 7 medium, 2 low (total 14)
        # Expected baseline: 20%, 70%, 10%
        observed = [5, 7, 2]
        expected = [14 * 0.2, 14 * 0.7, 14 * 0.1]  # [2.8, 9.8, 1.4]

        scipy_chi2, scipy_p = scipy_stats.chisquare(observed, expected)
        ps_chi2, ps_p = ps.chi_square_goodness_of_fit(observed, expected)

        assert abs(ps_chi2 - scipy_chi2) < 0.001
        assert abs(ps_p - scipy_p) < 0.001

    def test_perfect_match(self) -> None:
        """Test when observed exactly matches expected."""
        observed = [20, 70, 10]
        expected = [20.0, 70.0, 10.0]

        scipy_chi2, scipy_p = scipy_stats.chisquare(observed, expected)
        ps_chi2, ps_p = ps.chi_square_goodness_of_fit(observed, expected)

        assert abs(ps_chi2 - scipy_chi2) < 0.001
        assert ps_chi2 < 0.001  # Should be near zero
        assert ps_p > 0.99  # Should be near 1.0


class TestFisherExactTest:
    """Test fisher_exact_test against scipy.stats.fisher_exact."""

    def test_simple_2x2(self) -> None:
        """Test with simple 2x2 table."""
        table = [[8, 2], [1, 5]]

        scipy_odds, scipy_p = scipy_stats.fisher_exact(table)
        ps_odds, ps_p = ps.fisher_exact_test(table)

        assert abs(ps_odds - scipy_odds) < 0.01
        assert abs(ps_p - scipy_p) < 0.01

    def test_tea_tasting_lady(self) -> None:
        """Test with classic tea-tasting example."""
        # Lady correctly identifies 3/4 milk-first cups and 3/4 tea-first cups
        table = [[3, 1], [1, 3]]

        scipy_odds, scipy_p = scipy_stats.fisher_exact(table)
        ps_odds, ps_p = ps.fisher_exact_test(table)

        assert abs(ps_odds - scipy_odds) < 0.01
        assert abs(ps_p - scipy_p) < 0.01

    def test_with_zeros(self) -> None:
        """Test with zero cells."""
        table = [[0, 5], [3, 7]]

        scipy_odds, scipy_p = scipy_stats.fisher_exact(table)
        ps_odds, ps_p = ps.fisher_exact_test(table)

        # Odds ratio should be 0
        assert ps_odds == 0.0
        assert abs(ps_p - scipy_p) < 0.01


class TestCalculateZScores:
    """Test calculate_z_scores against numpy implementation."""

    def test_simple_z_scores(self) -> None:
        """Test z-score calculation."""
        observed = [[10, 20], [30, 40]]
        expected = [[12.0, 18.0], [28.0, 42.0]]

        # Scipy/numpy version
        obs_array = np.array(observed)
        exp_array = np.array(expected)
        scipy_z = (obs_array - exp_array) / np.sqrt(exp_array)

        # Pure Python version
        ps_z = ps.calculate_z_scores(observed, expected)

        # Compare
        for i in range(len(observed)):
            for j in range(len(observed[0])):
                assert abs(ps_z[i][j] - scipy_z[i, j]) < 0.001

    def test_3x3_z_scores(self) -> None:
        """Test with larger table."""
        observed = [[5, 10, 15], [20, 25, 30], [35, 40, 45]]
        expected = [[6.0, 11.0, 14.0], [19.0, 26.0, 31.0], [36.0, 39.0, 44.0]]

        obs_array = np.array(observed)
        exp_array = np.array(expected)
        scipy_z = (obs_array - exp_array) / np.sqrt(exp_array)

        ps_z = ps.calculate_z_scores(observed, expected)

        for i in range(len(observed)):
            for j in range(len(observed[0])):
                assert abs(ps_z[i][j] - scipy_z[i, j]) < 0.001


class TestStatisticalDistributions:
    """Test underlying statistical distribution functions."""

    def test_chi_square_survival_small_df(self) -> None:
        """Test chi-square survival function with small degrees of freedom."""
        # Test cases: (chi2_value, df, expected_p_value)
        test_cases = [
            (3.84, 1, 0.05),  # Critical value for p=0.05, df=1
            (5.99, 2, 0.05),  # Critical value for p=0.05, df=2
            (7.81, 3, 0.05),  # Critical value for p=0.05, df=3
            (0.0, 1, 1.0),  # Zero should give p=1.0
            (0.0, 2, 1.0),
        ]

        for chi2_val, df, expected_p in test_cases:
            ps_p = ps.chi_square_survival(chi2_val, df)
            # Allow 1% tolerance on p-values
            assert abs(ps_p - expected_p) < 0.01, f"Failed for chi2={chi2_val}, df={df}"

    def test_chi_square_survival_large_chi2(self) -> None:
        """Test with large chi-square values (small p-values)."""
        # Large chi2 should give very small p-values
        ps_p = ps.chi_square_survival(100.0, 5)
        assert ps_p < 0.001

        ps_p = ps.chi_square_survival(50.0, 10)
        assert ps_p < 0.001


class TestHelperFunctions:
    """Test helper utility functions."""

    def test_all_values_ge(self) -> None:
        """Test all_values_ge function."""
        assert ps.all_values_ge([[5.0, 10.0], [15.0, 20.0]], 5.0) is True
        assert ps.all_values_ge([[5.0, 10.0], [15.0, 20.0]], 5.1) is False
        assert ps.all_values_ge([[5.0, 10.0], [15.0, 20.0]], 10.0) is False

    def test_sum_rows(self) -> None:
        """Test sum_rows function."""
        table = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        result = ps.sum_rows(table)
        assert result == [6, 15, 24]

    def test_sum_cols(self) -> None:
        """Test sum_cols function."""
        table = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        result = ps.sum_cols(table)
        assert result == [12, 15, 18]

    def test_any_zero(self) -> None:
        """Test any_zero function."""
        assert ps.any_zero([1, 2, 3]) is False
        assert ps.any_zero([1, 0, 3]) is True
        assert ps.any_zero([0, 0, 0]) is True
        assert ps.any_zero([]) is False
