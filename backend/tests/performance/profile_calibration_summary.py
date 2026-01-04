"""Performance profiling for calibration summary feature.

This script benchmarks the calibration summary generation process with varying
dataset sizes to establish baseline performance metrics.

Measures:
- Analysis registry execution time
- Data packaging time (package_for_llm)
- LLM API call latency (if API key available, else mock)
- Total end-to-end time

Usage:
    python profile_calibration_summary.py
    python profile_calibration_summary.py --with-llm  # Requires ANTHROPIC_API_KEY
    python profile_calibration_summary.py --sizes 50,100,250,500  # Custom sizes
    python profile_calibration_summary.py --runs 5  # Average over 5 runs per size
"""

import argparse
import csv
import statistics
import sys
import time
from pathlib import Path
from typing import Any

# Add src to path for imports
backend_path = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(backend_path / "src"))

from ninebox.services.analysis_registry import run_all_analyses
from ninebox.services.calibration_summary_service import CalibrationSummaryService
from ninebox.services.data_packaging_service import package_for_llm
from ninebox.services.org_service import OrgService
from ninebox.services.sample_data_generator import RichDatasetConfig, generate_rich_dataset


def profile_step(name: str, func: callable) -> tuple[Any, float]:
    """Profile a single step and return result + elapsed time.

    Args:
        name: Name of the step being profiled
        func: Function to execute and profile

    Returns:
        Tuple of (result, elapsed_seconds)
    """
    start = time.perf_counter()
    result = func()
    elapsed = time.perf_counter() - start
    return result, elapsed


def profile_calibration_summary(
    employee_count: int, use_llm: bool = False, seed: int = 42
) -> dict[str, float]:
    """Profile calibration summary generation for a given dataset size.

    Args:
        employee_count: Number of employees to generate
        use_llm: Whether to call real LLM API (requires ANTHROPIC_API_KEY)
        seed: Random seed for reproducibility

    Returns:
        Dictionary with timing metrics:
        {
            "dataset_generation": float,
            "analysis_registry": float,
            "data_packaging": float,
            "llm_call": float,
            "total_end_to_end": float,
        }
    """
    metrics = {}

    # Step 1: Generate dataset (not counted in total - setup only)
    config = RichDatasetConfig(size=employee_count, seed=seed, include_bias=True)
    employees, dataset_time = profile_step(
        "Dataset generation", lambda: generate_rich_dataset(config)
    )
    metrics["dataset_generation"] = dataset_time

    # Step 2: Run analysis registry
    analyses, analysis_time = profile_step("Analysis registry", lambda: run_all_analyses(employees))
    metrics["analysis_registry"] = analysis_time

    # Step 3: Data packaging
    def package_data():
        org_service = OrgService(employees, validate=False)
        org_data = {
            "total_employees": len(employees),
            "total_managers": len(org_service.find_managers(min_team_size=1)),
        }
        return package_for_llm(employees, analyses, org_data)

    data_package, packaging_time = profile_step("Data packaging", package_data)
    metrics["data_packaging"] = packaging_time

    # Step 4: LLM call (if enabled)
    if use_llm:
        from ninebox.services.llm_service import llm_service

        if llm_service.is_available():

            def call_llm():
                return llm_service.generate_calibration_analysis(data_package)

            _, llm_time = profile_step("LLM call", call_llm)
            metrics["llm_call"] = llm_time
        else:
            print("WARNING: LLM not available (API key not set). Skipping LLM profiling.")
            metrics["llm_call"] = 0.0
    else:
        # Mock LLM time (realistic estimate: 20-30s for 250 employees)
        # Scale based on dataset size: ~0.08s per employee
        mock_time = employee_count * 0.08
        metrics["llm_call"] = mock_time

    # Total end-to-end (excluding dataset generation)
    metrics["total_end_to_end"] = (
        metrics["analysis_registry"] + metrics["data_packaging"] + metrics["llm_call"]
    )

    return metrics


def run_profiling_suite(
    sizes: list[int], runs_per_size: int = 3, use_llm: bool = False
) -> dict[int, dict[str, list[float]]]:
    """Run profiling for multiple dataset sizes with multiple runs.

    Args:
        sizes: List of employee counts to profile
        runs_per_size: Number of runs per size for statistical reliability
        use_llm: Whether to use real LLM API calls

    Returns:
        Dictionary mapping size to metrics for all runs:
        {
            50: {
                "dataset_generation": [0.1, 0.11, 0.09],
                "analysis_registry": [0.05, 0.06, 0.05],
                ...
            }
        }
    """
    results = {}

    for size in sizes:
        print(f"\n{'=' * 80}")
        print(f"Profiling: {size} employees ({runs_per_size} runs)")
        print(f"{'=' * 80}")

        size_results: dict[str, list[float]] = {
            "dataset_generation": [],
            "analysis_registry": [],
            "data_packaging": [],
            "llm_call": [],
            "total_end_to_end": [],
        }

        for run in range(1, runs_per_size + 1):
            print(f"\nRun {run}/{runs_per_size}...")
            metrics = profile_calibration_summary(
                employee_count=size, use_llm=use_llm, seed=42 + run
            )

            for key, value in metrics.items():
                size_results[key].append(value)

            print(f"  Analysis registry: {metrics['analysis_registry']:.3f}s")
            print(f"  Data packaging:    {metrics['data_packaging']:.3f}s")
            print(f"  LLM call:          {metrics['llm_call']:.3f}s")
            print(f"  Total end-to-end:  {metrics['total_end_to_end']:.3f}s")

        results[size] = size_results

    return results


def calculate_percentiles(values: list[float]) -> dict[str, float]:
    """Calculate P50 (median) and P95 percentiles.

    Args:
        values: List of timing values

    Returns:
        Dictionary with p50 and p95 percentiles
    """
    if not values:
        return {"p50": 0.0, "p95": 0.0, "mean": 0.0}

    sorted_values = sorted(values)
    n = len(sorted_values)

    # P50 (median)
    if n % 2 == 0:
        p50 = (sorted_values[n // 2 - 1] + sorted_values[n // 2]) / 2
    else:
        p50 = sorted_values[n // 2]

    # P95
    p95_index = int(n * 0.95)
    p95 = sorted_values[min(p95_index, n - 1)]

    return {"p50": p50, "p95": p95, "mean": statistics.mean(values)}


def generate_markdown_table(results: dict[int, dict[str, list[float]]]) -> str:
    """Generate markdown table with performance results.

    Args:
        results: Profiling results from run_profiling_suite()

    Returns:
        Markdown-formatted table string
    """
    lines = []
    lines.append("| Employee Count | Analysis (P50) | Packaging (P50) | LLM Call (P50) | Total (P50) | Total (P95) |")
    lines.append("|----------------|----------------|-----------------|----------------|-------------|-------------|")

    for size in sorted(results.keys()):
        metrics = results[size]
        analysis_p50 = calculate_percentiles(metrics["analysis_registry"])["p50"]
        packaging_p50 = calculate_percentiles(metrics["data_packaging"])["p50"]
        llm_p50 = calculate_percentiles(metrics["llm_call"])["p50"]
        total_p50 = calculate_percentiles(metrics["total_end_to_end"])["p50"]
        total_p95 = calculate_percentiles(metrics["total_end_to_end"])["p95"]

        lines.append(
            f"| {size:14d} | {analysis_p50:13.3f}s | {packaging_p50:14.3f}s | {llm_p50:13.3f}s | {total_p50:10.3f}s | {total_p95:10.3f}s |"
        )

    return "\n".join(lines)


def generate_csv_report(results: dict[int, dict[str, list[float]]], output_path: Path) -> None:
    """Generate CSV report with detailed profiling results.

    Args:
        results: Profiling results from run_profiling_suite()
        output_path: Path to output CSV file
    """
    with open(output_path, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)

        # Header
        writer.writerow(
            [
                "Employee Count",
                "Metric",
                "P50 (seconds)",
                "P95 (seconds)",
                "Mean (seconds)",
                "Min (seconds)",
                "Max (seconds)",
            ]
        )

        # Data rows
        for size in sorted(results.keys()):
            metrics = results[size]
            for metric_name, values in metrics.items():
                stats = calculate_percentiles(values)
                writer.writerow(
                    [
                        size,
                        metric_name,
                        f"{stats['p50']:.3f}",
                        f"{stats['p95']:.3f}",
                        f"{stats['mean']:.3f}",
                        f"{min(values):.3f}",
                        f"{max(values):.3f}",
                    ]
                )


def main():
    """Main entry point for profiling script."""
    parser = argparse.ArgumentParser(description="Profile calibration summary performance")
    parser.add_argument(
        "--sizes",
        type=str,
        default="50,100,250,500",
        help="Comma-separated list of employee counts (default: 50,100,250,500)",
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=3,
        help="Number of runs per size for averaging (default: 3)",
    )
    parser.add_argument(
        "--with-llm",
        action="store_true",
        help="Use real LLM API calls (requires ANTHROPIC_API_KEY)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="profiling_results.csv",
        help="Output CSV filename (default: profiling_results.csv)",
    )

    args = parser.parse_args()

    # Parse sizes
    sizes = [int(s.strip()) for s in args.sizes.split(",")]

    print("=" * 80)
    print("Calibration Summary Performance Profiling")
    print("=" * 80)
    print(f"Dataset sizes: {sizes}")
    print(f"Runs per size: {args.runs}")
    print(f"LLM mode: {'Real API calls' if args.with_llm else 'Mock (estimated)'}")
    print(f"Output file: {args.output}")

    # Run profiling
    results = run_profiling_suite(sizes=sizes, runs_per_size=args.runs, use_llm=args.with_llm)

    # Generate reports
    print("\n" + "=" * 80)
    print("RESULTS SUMMARY")
    print("=" * 80)
    print()
    markdown_table = generate_markdown_table(results)
    print(markdown_table)

    # Save CSV
    output_path = Path(args.output)
    generate_csv_report(results, output_path)
    print(f"\nDetailed results saved to: {output_path.absolute()}")

    # Performance expectations
    print("\n" + "=" * 80)
    print("PERFORMANCE EXPECTATIONS")
    print("=" * 80)

    # Use 250 if available, otherwise use the largest size profiled
    if 250 in results:
        reference_size = 250
        reference_desc = "typical director-level calibration"
    else:
        reference_size = max(results.keys())
        reference_desc = f"largest profiled size"

    total_ref = calculate_percentiles(results[reference_size]["total_end_to_end"])
    llm_ref = calculate_percentiles(results[reference_size]["llm_call"])
    print(f"\nFor {reference_size} employees ({reference_desc}):")
    print(f"  - Total time (P50): {total_ref['p50']:.1f}s")
    print(f"  - LLM dominates: {llm_ref['p50']:.1f}s ({100 * llm_ref['p50'] / total_ref['p50']:.0f}% of total)")
    print(f"  - Analysis + packaging: {total_ref['p50'] - llm_ref['p50']:.1f}s")
    print()
    print("User expectation: AI summary will take 20-30 seconds for typical datasets (250 employees).")


if __name__ == "__main__":
    main()
