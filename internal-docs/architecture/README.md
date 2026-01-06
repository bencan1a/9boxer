# Architecture Documentation

This directory contains system architecture documentation for the 9Boxer desktop application.

## Contents

### System Design
- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) - Complete system design
- [GUIDELINES.md](GUIDELINES.md) - Architectural decisions and patterns
- [SECURITY_MODEL.md](SECURITY_MODEL.md) - Security architecture

### Build & Deployment
- [build-process.md](build-process.md) - How to build desktop installers
- [deployment.md](deployment.md) - Distribution and installation guide

### Domain Documentation
- [SAMPLE_DATA_GENERATION.md](SAMPLE_DATA_GENERATION.md) - Sample data generation
- [ORG_HIERARCHY_SERVICE.md](ORG_HIERARCHY_SERVICE.md) - Organization hierarchy service
- [FILE_HANDLING.md](FILE_HANDLING.md) - File handling patterns
- [MIGRATIONS.md](MIGRATIONS.md) - Database migrations
- [OBSERVABILITY.md](OBSERVABILITY.md) - Observability and monitoring
- [ERROR_HANDLING.md](ERROR_HANDLING.md) - Error handling patterns
- [PERFORMANCE.md](PERFORMANCE.md) - Performance considerations

### Code Patterns
- [Analysis Registry Pattern](#analysis-registry-pattern) - Centralized analysis execution

### Architecture Decision Records (ADRs)
- [decisions/](decisions/) - Architectural decision records

## Analysis Registry Pattern

The analysis registry provides a centralized execution path for all statistical analyses in the intelligence service. This pattern ensures consistency, extensibility, and maintainability when adding new analysis types.

### Pattern Overview

**What it is:** A central registry (`ANALYSIS_REGISTRY`) that maps analysis names to their implementation functions. All analyses execute through a single entry point (`run_all_analyses()`).

**Why it exists:** Before the registry pattern, analyses were called individually throughout the codebase. This created multiple execution paths, making it difficult to:
- Add new analysis types consistently
- Mock analyses for testing
- Ensure all analyses are available to both UI and AI components
- Track which analyses are available in the system

### How It Works

The registry pattern consists of three components:

1. **Analysis Registry** (`analysis_registry.py`): Central list of all available analyses
2. **Analysis Functions** (`intelligence_service.py`): Individual analysis implementations
3. **Execution Function** (`run_all_analyses()`): Single entry point that executes all registered analyses

### Current Registered Analyses

```python
ANALYSIS_REGISTRY: list[tuple[str, AnalysisFunction]] = [
    ("location", calculate_location_analysis),
    ("function", calculate_function_analysis),
    ("level", calculate_level_analysis),
    ("tenure", calculate_tenure_analysis),
    ("manager", calculate_manager_analysis),
    ("per_level_distribution", calculate_per_level_distribution),
]
```

### Using the Registry

**Execute all analyses:**

```python
from ninebox.services.analysis_registry import run_all_analyses

# Run all registered analyses
results = run_all_analyses(employees)

# Results is a dict mapping analysis names to their outputs
location_analysis = results["location"]
function_analysis = results["function"]
```

**Execute a single analysis:**

```python
from ninebox.services.analysis_registry import get_analysis_function

# Get a specific analysis function
analysis_fn = get_analysis_function("location")
if analysis_fn:
    result = analysis_fn(employees)
```

**List available analyses:**

```python
from ninebox.services.analysis_registry import get_registered_analyses

# Get list of all analysis names
analyses = get_registered_analyses()
# Returns: ["location", "function", "level", "tenure", "manager", "per_level_distribution"]
```

### Adding a New Analysis Type

To add a new analysis type, follow these steps:

1. **Implement the analysis function** in `intelligence_service.py`:

```python
def calculate_new_analysis(employees: list[Employee]) -> dict[str, Any]:
    """Analyze new dimension of employee data.

    Args:
        employees: List of employee records

    Returns:
        Dictionary containing:
        - chi_square: Chi-square statistic
        - p_value: Statistical significance level
        - effect_size: Cramér's V effect size
        - degrees_of_freedom: Degrees of freedom
        - sample_size: Total sample size
        - status: Traffic light indicator ("green", "yellow", "red")
        - deviations: List of significant deviations
        - interpretation: Human-readable summary
    """
    # Implementation here
    return {
        "chi_square": 0.0,
        "p_value": 1.0,
        "effect_size": 0.0,
        "degrees_of_freedom": 0,
        "sample_size": len(employees),
        "status": "green",
        "deviations": [],
        "interpretation": "Analysis complete",
    }
```

2. **Register the analysis** in `analysis_registry.py`:

```python
from ninebox.services.intelligence_service import (
    calculate_new_analysis,  # Import your function
    # ... other imports
)

ANALYSIS_REGISTRY: list[tuple[str, AnalysisFunction]] = [
    # ... existing analyses
    ("new_analysis", calculate_new_analysis),  # Add your analysis
]
```

3. **Done.** The new analysis is now:
   - Automatically executed by `run_all_analyses()`
   - Available to Intelligence tab visualizations
   - Available to AI calibration summary generation
   - Testable via registry mocking

### Error Handling

The registry handles analysis failures gracefully. If an analysis raises an exception, it returns an error status instead of crashing the entire pipeline:

```python
{
    "status": "error",
    "error": "Analysis failed: ValueError",
    "sample_size": 0
}
```

This allows partial results to be returned when individual analyses fail.

### Circular Dependency Pattern

The registry creates a circular dependency between `analysis_registry.py` and `intelligence_service.py`:
- `analysis_registry.py` imports analysis functions from `intelligence_service.py`
- `intelligence_service.py` imports `run_all_analyses()` from `analysis_registry.py`

This is resolved using local imports in `intelligence_service.py`:

```python
def calculate_overall_intelligence(employees: list[Employee]) -> dict[str, Any]:
    # Import here to avoid circular dependency
    from ninebox.services.analysis_registry import run_all_analyses

    all_results = run_all_analyses(employees)
    # ... process results
```

### Benefits

- **Single execution path:** All analyses execute through `run_all_analyses()`, eliminating inconsistent direct calls
- **Easy extensibility:** Add new analyses by registering in one location (two-line change)
- **Consistent pattern:** New developers follow the same pattern for all analyses
- **Better testability:** Mock the entire registry instead of individual functions
- **Dual use:** Same analyses power both UI visualizations and AI-generated insights
- **Graceful degradation:** Failed analyses return error status instead of crashing

### Where It's Used

The registry pattern is used in:
- `calculate_overall_intelligence()` - Aggregates all analyses for Intelligence tab
- `CalibrationSummaryService._collect_insight_source_data()` - Provides data for AI calibration summaries
- `DataPackagingService.package_calibration_data()` - Packages analyses for LLM consumption

## Quick Reference

**9Boxer Architecture:**
- **Deployment**: Standalone Electron desktop app (Windows/macOS/Linux installers)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI in Electron renderer
- **Backend**: FastAPI (Python 3.10+) bundled with PyInstaller (~225MB executable)
- **Communication**: Backend subprocess, HTTP localhost:38000
- **Database**: SQLite in user app data directory
- **No external dependencies**: Everything bundled, no Python/Node.js installation required for end users

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for full details.
