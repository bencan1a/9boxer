"""Unit tests for pure_statistics module.

Tests edge cases, error conditions, and functionality without scipy dependency.
"""

import math

import pytest

from ninebox.utils import pure_statistics as ps


class TestSqrt:
    """Test sqrt function."""

    def test_sqrt_when_positive_number_then_returns_correct_value(self) -> None:
        """Test sqrt with positive numbers."""
        assert abs(ps.sqrt(4.0) - 2.0) < 0.001
        assert abs(ps.sqrt(9.0) - 3.0) < 0.001
        assert abs(ps.sqrt(2.0) - 1.41421) < 0.001


class TestChiSquareTestErrors:
    """Test error conditions in chi_square_test."""

    def test_chi_square_test_when_empty_table_then_raises_value_error(self) -> None:
        """Test with empty table."""
        with pytest.raises(ValueError, match="at least 1 row and 1 column"):
            ps.chi_square_test([])

    def test_chi_square_test_when_zero_total_then_raises_value_error(self) -> None:
        """Test with all zeros."""
        with pytest.raises(ValueError, match="zero total"):
            ps.chi_square_test([[0, 0], [0, 0]])

    def test_chi_square_test_when_empty_row_then_raises_value_error(self) -> None:
        """Test with row summing to zero."""
        with pytest.raises(ValueError, match="empty rows"):
            ps.chi_square_test([[0, 0], [5, 5]])

    def test_chi_square_test_when_empty_column_then_raises_value_error(self) -> None:
        """Test with column summing to zero."""
        with pytest.raises(ValueError, match="empty columns"):
            ps.chi_square_test([[5, 0], [5, 0]])

    def test_chi_square_test_when_correction_false_then_no_yates(self) -> None:
        """Test 2x2 table without Yates correction."""
        table = [[10, 20], [30, 40]]
        chi2_no_corr, _, _, _ = ps.chi_square_test(table, correction=False)
        chi2_corr, _, _, _ = ps.chi_square_test(table, correction=True)
        # With correction, chi2 should be smaller
        assert chi2_corr < chi2_no_corr


class TestChiSquareGoodnessOfFitErrors:
    """Test error conditions in chi_square_goodness_of_fit."""

    def test_chi_square_goodness_of_fit_when_length_mismatch_then_raises_value_error(self) -> None:
        """Test with mismatched lengths."""
        observed = [10, 20, 30]
        expected = [15.0, 25.0]  # Wrong length
        with pytest.raises(ValueError, match="same length"):
            ps.chi_square_goodness_of_fit(observed, expected)

    def test_chi_square_goodness_of_fit_when_zero_expected_then_skips_cell(self) -> None:
        """Test with zero expected frequency."""
        observed = [10, 20, 30]
        expected = [15.0, 0.0, 35.0]  # Zero in middle
        chi2, p_value = ps.chi_square_goodness_of_fit(observed, expected)
        # Should calculate without error, skipping zero expected
        assert chi2 >= 0
        assert 0 <= p_value <= 1


class TestFisherExactTestErrors:
    """Test error conditions in fisher_exact_test."""

    def test_fisher_exact_test_when_not_2x2_then_raises_value_error(self) -> None:
        """Test with non-2x2 table."""
        with pytest.raises(ValueError, match="2x2 table"):
            ps.fisher_exact_test([[1, 2, 3], [4, 5, 6]])

    def test_fisher_exact_test_when_3x2_then_raises_value_error(self) -> None:
        """Test with 3x2 table."""
        with pytest.raises(ValueError, match="2x2 table"):
            ps.fisher_exact_test([[1, 2], [3, 4], [5, 6]])

    def test_fisher_exact_test_when_b_and_c_zero_then_odds_ratio_inf(self) -> None:
        """Test with b=0 and c=0, odds ratio should be infinite."""
        table = [[5, 0], [0, 5]]
        odds_ratio, p_value = ps.fisher_exact_test(table)
        assert odds_ratio == float("inf")
        assert 0 <= p_value <= 1

    def test_fisher_exact_test_when_a_and_d_zero_then_odds_ratio_zero(self) -> None:
        """Test with a=0 and d=0, odds ratio should be zero."""
        table = [[0, 5], [5, 0]]
        odds_ratio, p_value = ps.fisher_exact_test(table)
        assert odds_ratio == 0.0
        assert 0 <= p_value <= 1


class TestChiSquareSurvivalErrors:
    """Test error conditions in chi_square_survival."""

    def test_chi_square_survival_when_zero_df_then_raises_value_error(self) -> None:
        """Test with zero degrees of freedom."""
        with pytest.raises(ValueError, match="Degrees of freedom must be positive"):
            ps.chi_square_survival(5.0, 0)

    def test_chi_square_survival_when_negative_df_then_raises_value_error(self) -> None:
        """Test with negative degrees of freedom."""
        with pytest.raises(ValueError, match="Degrees of freedom must be positive"):
            ps.chi_square_survival(5.0, -1)

    def test_chi_square_survival_when_zero_x_then_returns_one(self) -> None:
        """Test with x=0 should return p=1.0."""
        p_value = ps.chi_square_survival(0.0, 5)
        assert p_value == 1.0

    def test_chi_square_survival_when_negative_x_then_returns_one(self) -> None:
        """Test with negative x should return p=1.0."""
        p_value = ps.chi_square_survival(-1.0, 5)
        assert p_value == 1.0

    def test_chi_square_survival_when_x_greater_than_a_then_uses_continued_fraction(self) -> None:
        """Test that large x relative to df uses upper incomplete gamma."""
        # When x/2 > df/2, should use continued fraction method
        p_value = ps.chi_square_survival(20.0, 5)  # x/2=10, a=2.5, so x/2 > a
        assert 0 < p_value < 0.01  # Should be very small

    def test_chi_square_survival_when_x_less_than_a_then_uses_series(self) -> None:
        """Test that small x relative to df uses series expansion."""
        # When x/2 <= df/2, should use series method
        p_value = ps.chi_square_survival(2.0, 10)  # x/2=1, a=5, so x/2 < a
        assert 0.9 < p_value < 1.0  # Should be close to 1


class TestUpperIncompleteGamma:
    """Test _upper_incomplete_gamma function."""

    def test_upper_incomplete_gamma_when_zero_x_then_returns_one(self) -> None:
        """Test with x=0."""
        result = ps._upper_incomplete_gamma(5.0, 0.0)
        assert result == 1.0

    def test_upper_incomplete_gamma_when_negative_x_then_returns_one(self) -> None:
        """Test with negative x."""
        result = ps._upper_incomplete_gamma(5.0, -1.0)
        assert result == 1.0

    def test_upper_incomplete_gamma_with_extreme_values(self) -> None:
        """Test with extreme parameter values to cover edge cases."""
        # Test with very small a and large x to exercise continued fraction edge cases
        result1 = ps._upper_incomplete_gamma(0.001, 100.0)
        assert 0 <= result1 <= 1

        # Test with large a and small x
        result2 = ps._upper_incomplete_gamma(100.0, 0.1)
        assert 0 <= result2 <= 1

        # Test with very large x
        result3 = ps._upper_incomplete_gamma(2.0, 1000.0)
        assert 0 <= result3 <= 1


class TestRegularizedGammaInc:
    """Test _regularized_gamma_inc function."""

    def test_regularized_gamma_inc_when_zero_x_then_returns_zero(self) -> None:
        """Test with x=0."""
        result = ps._regularized_gamma_inc(5.0, 0.0)
        assert result == 0.0

    def test_regularized_gamma_inc_when_large_x_then_returns_one(self) -> None:
        """Test with large x."""
        result = ps._regularized_gamma_inc(5.0, 100.0)
        assert result == 1.0


class TestLogGamma:
    """Test _log_gamma function."""

    def test_log_gamma_when_zero_then_raises_value_error(self) -> None:
        """Test with x=0."""
        with pytest.raises(ValueError, match="undefined for x <= 0"):
            ps._log_gamma(0.0)

    def test_log_gamma_when_negative_then_raises_value_error(self) -> None:
        """Test with negative x."""
        with pytest.raises(ValueError, match="undefined for x <= 0"):
            ps._log_gamma(-1.0)

    def test_log_gamma_when_small_positive_then_uses_reflection(self) -> None:
        """Test with x < 0.5 uses reflection formula."""
        # For x < 0.5, uses Gamma(x) * Gamma(1-x) = pi / sin(pi*x)
        result = ps._log_gamma(0.3)
        # Should not raise error and return valid result
        assert isinstance(result, float)
        assert not math.isinf(result)


class TestLogCombination:
    """Test _log_combination function."""

    def test_log_combination_when_k_greater_than_n_then_returns_neg_inf(self) -> None:
        """Test with k > n."""
        result = ps._log_combination(5, 10)
        assert result == float("-inf")

    def test_log_combination_when_negative_k_then_returns_neg_inf(self) -> None:
        """Test with negative k."""
        result = ps._log_combination(5, -1)
        assert result == float("-inf")

    def test_log_combination_when_k_zero_then_returns_zero(self) -> None:
        """Test with k=0."""
        result = ps._log_combination(5, 0)
        assert result == 0.0

    def test_log_combination_when_k_equals_n_then_returns_zero(self) -> None:
        """Test with k=n."""
        result = ps._log_combination(5, 5)
        assert result == 0.0


class TestCalculateZScores:
    """Test calculate_z_scores function."""

    def test_calculate_z_scores_when_zero_expected_then_returns_zero(self) -> None:
        """Test with zero expected frequency."""
        observed = [[10, 20]]
        expected = [[15.0, 0.0]]  # Zero expected
        z_scores = ps.calculate_z_scores(observed, expected)
        assert z_scores[0][1] == 0.0  # Should be 0 when expected is 0

    def test_calculate_z_scores_when_empty_table_then_returns_empty(self) -> None:
        """Test with empty table."""
        observed: list[list[int]] = []
        expected: list[list[float]] = []
        z_scores = ps.calculate_z_scores(observed, expected)
        assert z_scores == []


class TestAllValuesGe:
    """Test all_values_ge function."""

    def test_all_values_ge_when_all_above_threshold_then_true(self) -> None:
        """Test when all values >= threshold."""
        values = [[5.0, 6.0], [7.0, 8.0]]
        assert ps.all_values_ge(values, 5.0) is True

    def test_all_values_ge_when_one_below_threshold_then_false(self) -> None:
        """Test when one value < threshold."""
        values = [[5.0, 4.9], [7.0, 8.0]]
        assert ps.all_values_ge(values, 5.0) is False

    def test_all_values_ge_when_empty_list_then_true(self) -> None:
        """Test with empty list (vacuously true)."""
        values: list[list[float]] = []
        assert ps.all_values_ge(values, 5.0) is True


class TestSumRows:
    """Test sum_rows function."""

    def test_sum_rows_when_valid_table_then_returns_sums(self) -> None:
        """Test with valid table."""
        table = [[1, 2, 3], [4, 5, 6]]
        result = ps.sum_rows(table)
        assert result == [6, 15]

    def test_sum_rows_when_empty_table_then_returns_empty_list(self) -> None:
        """Test with empty table."""
        table: list[list[int]] = []
        result = ps.sum_rows(table)
        assert result == []


class TestSumCols:
    """Test sum_cols function."""

    def test_sum_cols_when_valid_table_then_returns_sums(self) -> None:
        """Test with valid table."""
        table = [[1, 2, 3], [4, 5, 6]]
        result = ps.sum_cols(table)
        assert result == [5, 7, 9]

    def test_sum_cols_when_empty_table_then_returns_empty_list(self) -> None:
        """Test with empty table."""
        table: list[list[int]] = []
        result = ps.sum_cols(table)
        assert result == []


class TestAnyZero:
    """Test any_zero function."""

    def test_any_zero_when_contains_zero_then_true(self) -> None:
        """Test with zero in list."""
        assert ps.any_zero([1, 0, 3]) is True

    def test_any_zero_when_no_zero_then_false(self) -> None:
        """Test with no zeros."""
        assert ps.any_zero([1, 2, 3]) is False

    def test_any_zero_when_empty_list_then_false(self) -> None:
        """Test with empty list."""
        assert ps.any_zero([]) is False

    def test_any_zero_when_all_zeros_then_true(self) -> None:
        """Test with all zeros."""
        assert ps.any_zero([0, 0, 0]) is True


class TestFisherExactPValue:
    """Test _fisher_exact_pvalue function."""

    def test_fisher_exact_pvalue_when_symmetric_table_then_high_p_value(self) -> None:
        """Test with symmetric table (no association)."""
        # Table: [[5, 5], [5, 5]]
        p_value = ps._fisher_exact_pvalue(5, 5, 5, 5)
        # Symmetric table should have high p-value
        assert p_value > 0.5


class TestHypergeometricProb:
    """Test _hypergeometric_prob function."""

    def test_hypergeometric_prob_when_valid_inputs_then_returns_probability(self) -> None:
        """Test with valid inputs."""
        # Calculate probability for some hypergeometric scenario
        prob = ps._hypergeometric_prob(2, 5, 4, 10)
        assert 0 <= prob <= 1


class TestIntegrationScenarios:
    """Test integration scenarios covering multiple functions."""

    def test_chi_square_test_with_large_table_then_handles_correctly(self) -> None:
        """Test chi-square with larger table."""
        table = [
            [10, 20, 30, 40],
            [50, 60, 70, 80],
            [90, 100, 110, 120],
            [130, 140, 150, 160],
        ]
        chi2, p_value, dof, expected = ps.chi_square_test(table)
        assert chi2 >= 0
        assert 0 <= p_value <= 1
        assert dof == (4 - 1) * (4 - 1)  # (rows-1) * (cols-1)
        assert len(expected) == 4
        assert len(expected[0]) == 4

    def test_chi_square_goodness_of_fit_with_large_deviation_then_low_p_value(self) -> None:
        """Test goodness of fit with large deviations."""
        observed = [100, 10, 5]  # Very different from expected
        expected = [30.0, 40.0, 45.0]
        chi2, p_value = ps.chi_square_goodness_of_fit(observed, expected)
        assert chi2 > 10  # Large chi-square
        assert p_value < 0.05  # Significant difference

    def test_fisher_exact_test_with_strong_association_then_low_p_value(self) -> None:
        """Test Fisher's exact with strong association."""
        table = [[10, 1], [1, 10]]  # Strong diagonal pattern
        odds_ratio, p_value = ps.fisher_exact_test(table)
        assert odds_ratio > 10  # Strong odds ratio
        assert p_value < 0.05  # Significant association

    def test_chi_square_survival_with_various_df_then_returns_valid_p_values(self) -> None:
        """Test chi-square survival with various degrees of freedom."""
        for df in [1, 2, 5, 10, 20]:
            for chi2_val in [1.0, 5.0, 10.0, 20.0]:
                p_value = ps.chi_square_survival(chi2_val, df)
                assert 0 <= p_value <= 1, f"Invalid p-value for df={df}, chi2={chi2_val}"
