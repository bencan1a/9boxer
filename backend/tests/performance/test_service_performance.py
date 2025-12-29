"""Performance tests for service layer.

Performance targets documented in each test docstring.
Use --benchmark-compare to track performance over time.
"""

from pathlib import Path

import pytest

from ninebox.models.employee import Employee
from ninebox.services.excel_exporter import ExcelExporter
from ninebox.services.excel_parser import ExcelParser, ParsingResult
from ninebox.services.intelligence_service import calculate_overall_intelligence
from ninebox.services.statistics_service import StatisticsService

# Check if pytest-benchmark is available
try:
    import pytest_benchmark  # noqa: F401

    BENCHMARK_AVAILABLE = True
except ImportError:
    BENCHMARK_AVAILABLE = False

pytestmark = [
    pytest.mark.performance,
    pytest.mark.slow,
    pytest.mark.skipif(
        not BENCHMARK_AVAILABLE,
        reason="pytest-benchmark not installed. Install with: pip install pytest-benchmark",
    ),
]


class TestExcelParserPerformance:
    """Performance tests for Excel parsing."""

    def test_parse_when_small_file_then_completes_quickly(
        self,
        benchmark: pytest.fixture,
        small_excel_file: Path,
    ) -> None:
        """Benchmark parsing small Excel file (5 employees).

        Target: <0.5s
        """
        parser = ExcelParser()

        def parse_small_file() -> ParsingResult:
            return parser.parse(str(small_excel_file))

        benchmark(parse_small_file)

    def test_parse_when_large_file_then_completes_within_limit(
        self,
        benchmark: pytest.fixture,
        large_excel_file: Path,
    ) -> None:
        """Benchmark parsing large Excel file (1000 employees).

        Target: <3s
        """
        parser = ExcelParser()

        def parse_large_file() -> ParsingResult:
            return parser.parse(str(large_excel_file))

        benchmark(parse_large_file)


class TestStatisticsServicePerformance:
    """Performance tests for statistics service."""

    def test_calculate_distribution_when_called_then_completes_quickly(
        self,
        benchmark: pytest.fixture,
        large_employee_dataset: list[Employee],
    ) -> None:
        """Benchmark distribution calculation (1000 employees).

        Target: <100ms
        """
        service = StatisticsService()

        def calculate_distribution() -> dict:
            return service.calculate_distribution(large_employee_dataset)

        benchmark(calculate_distribution)

    def test_calculate_distribution_with_filters_when_called_then_completes_within_limit(
        self,
        benchmark: pytest.fixture,
        large_employee_dataset: list[Employee],
    ) -> None:
        """Benchmark distribution calculation with filtered dataset (1000 employees).

        Target: <500ms
        """
        service = StatisticsService()
        # Filter to only high performers
        filtered = [e for e in large_employee_dataset if e.performance.value == "High"]

        def calculate_filtered_distribution() -> dict:
            return service.calculate_distribution(filtered)

        benchmark(calculate_filtered_distribution)


class TestIntelligenceServicePerformance:
    """Performance tests for intelligence service."""

    def test_calculate_overall_intelligence_when_called_then_completes_within_limit(
        self,
        benchmark: pytest.fixture,
        large_employee_dataset: list[Employee],
    ) -> None:
        """Benchmark intelligence analysis (1000 employees).

        Target: <1s
        """

        def analyze_intelligence() -> dict:
            return calculate_overall_intelligence(large_employee_dataset)

        benchmark(analyze_intelligence)


class TestExcelExporterPerformance:
    """Performance tests for Excel export."""

    def test_export_when_small_dataset_then_completes_quickly(
        self,
        benchmark: pytest.fixture,
        small_excel_file: Path,
        sample_employees: list[Employee],
        tmp_path: Path,
    ) -> None:
        """Benchmark exporting small dataset (5 employees).

        Target: <0.5s
        """
        exporter = ExcelExporter()
        output_path = tmp_path / "export_small.xlsx"

        def export_small_dataset() -> None:
            exporter.export(
                original_file=str(small_excel_file),
                employees=sample_employees,
                output_path=str(output_path),
            )

        benchmark(export_small_dataset)

    def test_export_when_large_dataset_then_completes_within_limit(
        self,
        benchmark: pytest.fixture,
        large_excel_file: Path,
        large_employee_dataset: list[Employee],
        tmp_path: Path,
    ) -> None:
        """Benchmark exporting large dataset (1000 employees).

        Target: <3s
        """
        exporter = ExcelExporter()
        output_path = tmp_path / "export_large.xlsx"

        def export_large_dataset() -> None:
            exporter.export(
                original_file=str(large_excel_file),
                employees=large_employee_dataset,
                output_path=str(output_path),
            )

        benchmark(export_large_dataset)
