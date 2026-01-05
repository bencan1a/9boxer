# ADR-009: Configuration Management for Business Rules

**Status:** ✅ Accepted
**Date:** 2026-01-05
**Tags:** #backend #configuration #maintainability #patterns

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Centralize business rules and magic numbers into typed configuration system | Hardcoded thresholds, percentages, and limits scattered throughout codebase | Self-documenting, environment-specific configs, type-safe, easier to modify |

## When to Reference This ADR

- When adding new thresholds, limits, or business rules
- When magic numbers appear in code reviews
- When business rules need to differ between dev/staging/prod
- When non-developers need to adjust business parameters
- When experiencing difficulty finding where a threshold is defined

## Problem Statement

Business rules are hardcoded as magic numbers throughout the codebase:

### Current Anti-Pattern: Magic Numbers Everywhere

```python
# backend/services/intelligence_service.py:234
def identify_high_performers(employees):
    return [e for e in employees if e.performance_score >= 85]  # Why 85?

# backend/services/intelligence_service.py:456
def flag_outliers(distribution):
    if distribution['top_box'] > 0.20:  # Why 20%?
        return "warning"

# backend/services/session_manager.py:567
def validate_box_capacity(box_id, employees):
    if len(employees) > 50:  # Why 50?
        raise ValidationError("Box capacity exceeded")

# backend/services/calibration_service.py:123
def calculate_target_distribution():
    return {
        'top_performer': 0.10,     # Why 10%?
        'high_performer': 0.20,    # Why 20%?
        'solid_performer': 0.40,   # Why 40%?
        # ...
    }

# backend/api/statistics.py:89
def get_recent_sessions(user_id):
    return db.query(...).limit(100)  # Why 100?
```

### Issues with Magic Numbers

1. **No Documentation**: No explanation of why these values were chosen
2. **Hard to Change**: Business rules buried in code logic
3. **Inconsistency Risk**: Same concept might use different values
4. **No Type Safety**: Numbers could be wrong type or out of range
5. **Environment Differences**: Cannot have different values for dev/staging/prod
6. **Not Business-Readable**: Non-developers cannot review or modify

## Decision

**Centralize all business rules, thresholds, and magic numbers into a typed configuration system with validation.**

### Configuration Architecture

```python
# backend/config/business_rules.py
"""Centralized business rules configuration."""

from dataclasses import dataclass, field
from typing import Dict
import os
import yaml

@dataclass(frozen=True)
class PerformanceThresholds:
    """Performance rating thresholds with clear documentation."""

    high_performer_min: float = 85.0
    """Minimum score (0-100) to be classified as high performer"""

    low_performer_max: float = 60.0
    """Maximum score (0-100) to be classified as low performer"""

    outstanding_min: float = 95.0
    """Minimum score (0-100) for outstanding rating"""

    def __post_init__(self):
        """Validate thresholds are in correct range and order."""
        if not 0 <= self.low_performer_max <= self.high_performer_min <= self.outstanding_min <= 100:
            raise ValueError(
                "Thresholds must be: 0 ≤ low_max ≤ high_min ≤ outstanding ≤ 100"
            )

@dataclass(frozen=True)
class DistributionTargets:
    """Target distribution percentages for 9-box calibration."""

    top_performer: float = 0.10
    """Target: 10% of employees should be top performers"""

    high_performer: float = 0.20
    """Target: 20% of employees should be high performers"""

    solid_performer: float = 0.40
    """Target: 40% of employees should be solid performers"""

    developing: float = 0.20
    """Target: 20% of employees should be developing"""

    needs_improvement: float = 0.10
    """Target: 10% of employees need improvement"""

    def __post_init__(self):
        """Validate distribution sums to 100%."""
        total = sum([
            self.top_performer,
            self.high_performer,
            self.solid_performer,
            self.developing,
            self.needs_improvement
        ])
        if abs(total - 1.0) > 0.001:
            raise ValueError(
                f"Distribution must sum to 100%, got {total*100:.1f}%"
            )

        # Validate all are positive
        if any(x < 0 for x in [self.top_performer, self.high_performer,
                                self.solid_performer, self.developing,
                                self.needs_improvement]):
            raise ValueError("All distribution percentages must be non-negative")

@dataclass(frozen=True)
class CapacityLimits:
    """System capacity and pagination limits."""

    max_box_capacity: int = 50
    """Maximum number of employees allowed per box"""

    max_import_rows: int = 5000
    """Maximum rows allowed in Excel import"""

    recent_sessions_limit: int = 100
    """Number of recent sessions to show in list"""

    max_session_duration_days: int = 90
    """Auto-archive sessions older than this many days"""

    max_page_size: int = 100
    """Maximum page size for paginated API endpoints"""

    default_page_size: int = 20
    """Default page size for paginated API endpoints"""

    def __post_init__(self):
        """Validate all limits are positive."""
        limits = [
            self.max_box_capacity,
            self.max_import_rows,
            self.recent_sessions_limit,
            self.max_session_duration_days,
            self.max_page_size,
            self.default_page_size
        ]
        if any(x <= 0 for x in limits):
            raise ValueError("All capacity limits must be positive integers")

        if self.default_page_size > self.max_page_size:
            raise ValueError("Default page size cannot exceed max page size")

@dataclass(frozen=True)
class WarningThresholds:
    """Thresholds for system warnings and alerts."""

    high_top_box_percentage: float = 0.20
    """Warn if more than 20% of employees in top box (grade inflation)"""

    low_performance_count: int = 3
    """Warn if more than 3 low performers in a single team"""

    stale_session_days: int = 30
    """Warn if session hasn't been updated in 30 days"""

    def __post_init__(self):
        """Validate warning thresholds."""
        if not 0 <= self.high_top_box_percentage <= 1:
            raise ValueError("Percentage must be between 0 and 1")

        if self.low_performance_count < 0:
            raise ValueError("Count must be non-negative")

        if self.stale_session_days < 0:
            raise ValueError("Days must be non-negative")

class BusinessRules:
    """
    Centralized business rules configuration.

    Singleton instance loaded once at application startup.
    Frozen dataclasses ensure immutability at runtime.
    """

    # Default configuration
    performance: PerformanceThresholds = PerformanceThresholds()
    distribution: DistributionTargets = DistributionTargets()
    capacity: CapacityLimits = CapacityLimits()
    warnings: WarningThresholds = WarningThresholds()

    _loaded: bool = False

    @classmethod
    def load_from_file(cls, config_path: str = "config/business_rules.yaml"):
        """
        Load configuration from YAML file.

        Called once at application startup.
        Validates all configuration values.
        """
        if cls._loaded:
            return  # Already loaded

        try:
            with open(config_path, 'r') as f:
                config_data = yaml.safe_load(f)

            # Load each section
            if 'performance_thresholds' in config_data:
                cls.performance = PerformanceThresholds(
                    **config_data['performance_thresholds']
                )

            if 'distribution_targets' in config_data:
                cls.distribution = DistributionTargets(
                    **config_data['distribution_targets']
                )

            if 'capacity_limits' in config_data:
                cls.capacity = CapacityLimits(
                    **config_data['capacity_limits']
                )

            if 'warnings' in config_data:
                cls.warnings = WarningThresholds(
                    **config_data['warnings']
                )

            cls._loaded = True

        except FileNotFoundError:
            # Use defaults if config file not found
            print(f"Config file not found: {config_path}, using defaults")
        except Exception as e:
            # Validation errors or invalid YAML
            raise ConfigurationError(f"Failed to load configuration: {e}")

    @classmethod
    def load_from_env(cls):
        """
        Override configuration from environment variables.

        Allows environment-specific overrides without changing files.
        Useful for dev/staging/prod differences.
        """
        # Performance thresholds
        if threshold := os.getenv('HIGH_PERFORMER_MIN'):
            cls.performance = PerformanceThresholds(
                high_performer_min=float(threshold),
                low_performer_max=cls.performance.low_performer_max,
                outstanding_min=cls.performance.outstanding_min
            )

        # Distribution targets
        if top := os.getenv('TARGET_TOP_PERFORMER_PCT'):
            # Reconstruct with overridden values
            cls.distribution = DistributionTargets(
                top_performer=float(top),
                high_performer=cls.distribution.high_performer,
                # ... other fields
            )

        # Capacity limits
        if limit := os.getenv('MAX_BOX_CAPACITY'):
            cls.capacity = CapacityLimits(
                max_box_capacity=int(limit),
                max_import_rows=cls.capacity.max_import_rows,
                # ... other fields
            )
```

### Configuration File: YAML

```yaml
# config/business_rules.yaml
# Business rules configuration for 9Boxer
# Modify these values to change application behavior without code changes

performance_thresholds:
  # Scores are 0-100
  high_performer_min: 85.0  # Employees scoring ≥85 are high performers
  low_performer_max: 60.0   # Employees scoring ≤60 are low performers
  outstanding_min: 95.0     # Employees scoring ≥95 are outstanding

distribution_targets:
  # Percentages must sum to 1.0 (100%)
  # These are targets for calibration, not hard limits
  top_performer: 0.10       # Target: 10% top performers
  high_performer: 0.20      # Target: 20% high performers
  solid_performer: 0.40     # Target: 40% solid performers
  developing: 0.20          # Target: 20% developing
  needs_improvement: 0.10   # Target: 10% needs improvement

capacity_limits:
  max_box_capacity: 50          # Maximum employees per box
  max_import_rows: 5000         # Maximum rows in Excel import
  recent_sessions_limit: 100    # Number of recent sessions to show
  max_session_duration_days: 90 # Archive sessions after 90 days
  max_page_size: 100            # Maximum items per page in API
  default_page_size: 20         # Default items per page in API

warnings:
  high_top_box_percentage: 0.20  # Warn if >20% in top box
  low_performance_count: 3       # Warn if >3 low performers in team
  stale_session_days: 30         # Warn if session not updated in 30 days
```

### Usage in Services

```python
# backend/services/intelligence_service.py
from backend.config.business_rules import BusinessRules

class IntelligenceService:
    """Intelligence analysis service using configuration."""

    def identify_high_performers(
        self,
        employees: List[Employee]
    ) -> List[Employee]:
        """
        Identify high performers based on configured threshold.

        Previously: hardcoded 85
        Now: BusinessRules.performance.high_performer_min
        """
        threshold = BusinessRules.performance.high_performer_min

        return [
            e for e in employees
            if e.performance_score >= threshold
        ]

    def flag_distribution_outliers(
        self,
        distribution: Dict[str, int]
    ) -> Optional[Warning]:
        """
        Flag if distribution is skewed (e.g., too many in top box).

        Previously: hardcoded 0.20
        Now: BusinessRules.warnings.high_top_box_percentage
        """
        total = sum(distribution.values())
        if total == 0:
            return None

        top_box_pct = distribution.get('top_right', 0) / total
        threshold = BusinessRules.warnings.high_top_box_percentage

        if top_box_pct > threshold:
            return Warning(
                level="warning",
                message=f"Top box has {top_box_pct*100:.1f}% of employees "
                        f"(threshold: {threshold*100:.1f}%)",
                recommendation="Consider recalibration to avoid grade inflation"
            )

        return None

# backend/services/calibration_service.py
from backend.config.business_rules import BusinessRules

class CalibrationService:
    """Calibration service using configured targets."""

    def get_target_distribution(self) -> Dict[str, float]:
        """
        Get target distribution percentages.

        Previously: hardcoded dictionary
        Now: BusinessRules.distribution
        """
        targets = BusinessRules.distribution

        return {
            'top_performer': targets.top_performer,
            'high_performer': targets.high_performer,
            'solid_performer': targets.solid_performer,
            'developing': targets.developing,
            'needs_improvement': targets.needs_improvement
        }

    def calculate_deviation(
        self,
        actual: Dict[str, int]
    ) -> CalibrationResult:
        """Calculate deviation from target distribution."""
        targets = self.get_target_distribution()
        total = sum(actual.values())

        deviations = {}
        for category, count in actual.items():
            actual_pct = count / total if total > 0 else 0
            target_pct = targets[category]
            deviations[category] = actual_pct - target_pct

        return CalibrationResult(
            targets=targets,
            actual=actual,
            deviations=deviations
        )
```

### Application Startup

```python
# backend/main.py
from fastapi import FastAPI
from backend.config.business_rules import BusinessRules

def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(title="9Boxer API")

    # Load configuration at startup
    @app.on_event("startup")
    async def startup():
        """Load configuration when application starts."""
        # 1. Load from file (defaults + overrides)
        BusinessRules.load_from_file("config/business_rules.yaml")

        # 2. Override with environment variables (optional)
        BusinessRules.load_from_env()

        # 3. Log loaded configuration
        logger.info(
            f"Configuration loaded: "
            f"high_performer_min={BusinessRules.performance.high_performer_min}"
        )

    return app
```

## Key Constraints and Rules

### Mandatory Rules

1. **No Magic Numbers**: All thresholds, percentages, limits must be in configuration
2. **Immutable at Runtime**: Use `frozen=True` dataclasses, configuration loaded once at startup
3. **Validated on Load**: Configuration must validate on load, fail fast if invalid
4. **Documented**: Every configuration value must have docstring explaining purpose
5. **Typed**: Use dataclasses with type hints, not dictionaries

### Configuration Naming Conventions

- **Thresholds**: `*_threshold`, `*_min`, `*_max` (e.g., `high_performer_min`)
- **Percentages**: `*_percentage`, `*_pct` (e.g., `top_performer_pct`)
- **Limits/Counts**: `max_*`, `*_limit` (e.g., `max_box_capacity`)
- **Durations**: `*_days`, `*_seconds` (e.g., `stale_session_days`)

### Environment-Specific Configuration

```bash
# Development environment (.env.dev)
HIGH_PERFORMER_MIN=80.0      # More lenient for testing
MAX_BOX_CAPACITY=10          # Smaller for dev data

# Staging environment (.env.staging)
HIGH_PERFORMER_MIN=85.0      # Production-like
MAX_BOX_CAPACITY=50

# Production environment (.env.prod)
HIGH_PERFORMER_MIN=85.0      # Business-approved threshold
MAX_BOX_CAPACITY=50
```

## Benefits

- ✅ **Self-Documenting**: Configuration with clear descriptions
- ✅ **Type Safety**: Dataclasses with validation prevent invalid values
- ✅ **Centralized**: One place to view/modify all rules
- ✅ **Environment-Specific**: Different values for dev/staging/prod
- ✅ **Business-Readable**: Non-developers can review YAML
- ✅ **Testable**: Easy to test with different configurations
- ✅ **Immutable**: Cannot be accidentally modified at runtime
- ✅ **Validated**: Invalid configuration detected at startup

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Direct numeric literals in code** | Documented, configurable values | Clear configuration access pattern |
| **Slightly more verbose** | Self-documenting code | IDE autocomplete helps |
| **Config loading at startup** | Validated configuration | Fail fast on invalid config |

## Configuration Loading Strategy

### Development

```python
# Load from local YAML file
BusinessRules.load_from_file("config/business_rules.dev.yaml")
```

### Production

```python
# Load from file + environment overrides
BusinessRules.load_from_file("config/business_rules.prod.yaml")
BusinessRules.load_from_env()  # Override sensitive values
```

### Testing

```python
# Use default values or test-specific config
@pytest.fixture(autouse=True)
def reset_config():
    """Reset configuration before each test."""
    BusinessRules._loaded = False
    BusinessRules.load_from_file("config/business_rules.test.yaml")
```

## Migration Strategy

### Phase 1: Create Configuration System (Week 1)

1. Create `backend/config/business_rules.py`
2. Create `config/business_rules.yaml`
3. Add configuration loading to startup
4. Create tests for configuration validation

### Phase 2: Identify All Magic Numbers (Week 2)

```bash
# Find numeric literals in code
grep -rn "[0-9]\+\.[0-9]\+" backend/ --include="*.py"
grep -rn "[0-9]\{2,\}" backend/ --include="*.py"
```

Document each:
- What it represents
- Why that value
- Where it's used

### Phase 3: Migrate to Configuration (Week 3)

For each magic number:
1. Add to appropriate configuration dataclass
2. Replace literal with `BusinessRules.*.value`
3. Update tests
4. Verify behavior unchanged

### Phase 4: Remove All Magic Numbers (Week 4)

1. Add linting rule to detect numeric literals
2. Code review to catch new magic numbers
3. Document configuration values

## Testing Configuration

```python
# tests/unit/test_business_rules.py
import pytest
from backend.config.business_rules import DistributionTargets

def test_distribution_must_sum_to_100_percent():
    """Test validation: distribution must sum to 100%."""
    with pytest.raises(ValueError, match="must sum to 100%"):
        DistributionTargets(
            top_performer=0.15,   # 15%
            high_performer=0.20,  # 20%
            solid_performer=0.40, # 40%
            developing=0.20,      # 20%
            needs_improvement=0.10 # 10%
            # Total: 105% - INVALID!
        )

def test_thresholds_must_be_ordered():
    """Test validation: thresholds must be in correct order."""
    with pytest.raises(ValueError, match="Thresholds must be"):
        PerformanceThresholds(
            low_performer_max=70.0,
            high_performer_min=60.0,  # Less than low_max - INVALID!
            outstanding_min=95.0
        )
```

## Related Decisions

- See [ADR-008](008-single-responsibility-principle.md) for service design
- See [GUIDELINES.md](../GUIDELINES.md#configuration) for config guidelines

## References

- [Twelve-Factor App: Config](https://12factor.net/config)
- [Python Dataclasses](https://docs.python.org/3/library/dataclasses.html)
- [YAML Configuration Best Practices](https://yaml.org/spec/1.2/spec.html)

## Related GitHub Issues

- #254: Extract magic numbers into documented configuration
- #255: Consolidate duplicate constants into shared module
