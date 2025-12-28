# Sample Data Generation Architecture

**Purpose:** Architecture documentation for realistic sample employee dataset generation
**Last Updated:** 2025-12-28
**Status:** Complete (Agents A-E delivered)
**Context:** Standalone desktop app, used for testing, tutorials, and demonstrations

---

## Quick Rules

- **ALWAYS use `generate_rich_dataset()` for realistic test data** (50+ employees)
- **ALWAYS set `seed` parameter for reproducible tests** (deterministic output)
- **NEVER hardcode employee data in tests** (use generator instead)
- **DO use `include_bias=True` for intelligence testing** (statistical patterns)
- **DO use `include_bias=False` for neutral baseline testing** (no patterns)
- **DO set size between 50-300 employees** (generator constraint)
- **NEVER use sample data generator in production sessions** (API endpoint doesn't save to session)

---

## Overview

The Sample Data Generation system provides realistic employee datasets for:
- **Testing and Quality Assurance** - Unit, integration, and E2E tests
- **User Onboarding** - Tutorial walkthroughs with example data
- **Feature Demonstrations** - Screenshots, docs, presentations
- **Intelligence Validation** - Bias pattern detection with known ground truth

**Key Characteristics:**
- Generates 50-300 employees in <2 seconds
- Complete organizational hierarchy (6 levels, no orphans)
- 3 years of performance history with realistic variance
- Configurable bias patterns for intelligence testing
- Reproducible with seed parameter (same seed = same data)
- All 28 Employee model fields populated
- All 9 grid positions covered
- All 8 flag types distributed (10-20% of employees)

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          Frontend                                │
│                                                                  │
│  ┌──────────────┐              ┌───────────────────────┐       │
│  │ EmptyState   │              │ LoadSampleDialog      │       │
│  │ Component    │─────CTA─────▶│                       │       │
│  │              │              │ - Size: 200           │       │
│  │ - Load Sample│              │ - Warning on replace  │       │
│  │ - Upload     │              │ - Loading indicator   │       │
│  └──────────────┘              └──────────┬────────────┘       │
│                                           │                     │
│                              ┌────────────▼─────────────┐       │
│                              │ SampleDataService        │       │
│                              │ - generateSampleDataset()│       │
│                              │ - loadDefaultSampleData()│       │
│                              └────────────┬─────────────┘       │
└─────────────────────────────────────────┼──────────────────────┘
                                          │
                      POST /api/employees/generate-sample
                            { size: 200, include_bias: true }
                                          │
┌─────────────────────────────────────────▼──────────────────────┐
│                          Backend                               │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ API Endpoint: /api/employees/generate-sample             │ │
│  │ - Validates size (50-300)                                │ │
│  │ - Returns employees + metadata (no session save)         │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           │                                   │
│  ┌────────────────────────▼──────────────────────────────┐   │
│  │ RichEmployeeGenerator                                 │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ ManagementChainBuilder                       │    │   │
│  │  │ - Build 6-level hierarchy (MT1-MT6)          │    │   │
│  │  │ - Pyramid distribution (40% MT1, 1% MT6)     │    │   │
│  │  │ - Validate no orphans, no cycles             │    │   │
│  │  │ - Span of control: 5-15 direct reports       │    │   │
│  │  │ - Complete management chains (chain_01-06)   │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ PerformanceHistoryGenerator                  │    │   │
│  │  │ - 3 years of history (2023-2024-2025)        │    │   │
│  │  │ - 80% complete, 20% gaps (realistic)         │    │   │
│  │  │ - Variance: 60% stable, 20% improve, 20% drop│    │   │
│  │  │ - Ratings: "Low", "Solid", "Strong", "Leading"│   │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ Bias Pattern Application                     │    │   │
│  │  │ - USA: +15% high performers (30% boost rate) │    │   │
│  │  │ - Sales: +20% high performers (35% boost rate)│   │   │
│  │  │ - Chi-square test: p < 0.05 (detectable)     │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘

Data Flow:
1. User clicks "Load Sample Data" in EmptyState
2. Frontend calls POST /api/employees/generate-sample
3. Backend generates employees with RichEmployeeGenerator
4. API returns employees + metadata (NOT saved to session)
5. Frontend loads employees into new session via existing upload flow
```

---

## Components

### Backend Components

#### 1. RichDatasetConfig (Dataclass)

**Purpose:** Configuration for dataset generation

**Location:** `backend/src/ninebox/services/sample_data_generator.py`

**Fields:**
- `size: int` - Number of employees (default: 200, range: 50-300)
- `include_bias: bool` - Enable bias patterns (default: True)
- `seed: int | None` - Random seed for reproducibility (default: None)
- `locations: list[str]` - Employee locations (default: 8 locations)
- `job_functions: list[str]` - Job functions (default: 8 functions)

**Example:**
```python
from ninebox.services.sample_data_generator import RichDatasetConfig

# Default configuration (200 employees with bias)
config = RichDatasetConfig()

# Custom configuration (reproducible, no bias)
config = RichDatasetConfig(
    size=100,
    include_bias=False,
    seed=42,
    locations=["USA", "CAN", "GBR"],
    job_functions=["Engineering", "Sales"]
)
```

---

#### 2. ManagementChainBuilder

**Purpose:** Creates realistic organizational hierarchies

**Location:** `backend/src/ninebox/services/sample_data_generator.py`

**Algorithm:**
1. **Create CEO** (MT6) as root node
2. **Generate VPs** (MT5) reporting to CEO
3. **Recursively create hierarchy** down to MT1 (Individual Contributors)
4. **Ensure span of control** 5-15 direct reports per manager
5. **Assign realistic titles** by management level
6. **Validate hierarchy** - no orphans, no cycles, no gaps
7. **Build management chains** - complete chain_01 through chain_06 for all employees

**Level Distribution:**
- **MT6 (CEO):** 1% of employees (at least 1)
- **MT5 (VPs):** 4% of employees
- **MT4 (Directors):** 10% of employees
- **MT3 (Managers):** 20% of employees
- **MT2 (Senior ICs):** 25% of employees
- **MT1 (ICs):** 40% of employees (remaining)

**Validation:**
- All employees except CEO have a manager
- No circular reporting relationships
- Pyramid distribution (more ICs than managers)
- Complete management chains for all employees

**Example:**
```python
from ninebox.services.sample_data_generator import ManagementChainBuilder

builder = ManagementChainBuilder()
hierarchy = builder.build_org_hierarchy(size=100, seed=42)

# hierarchy is dict[str, ManagementNode]
# ManagementNode has: employee_id, level, title, manager, chain_01-06

ceo = [n for n in hierarchy.values() if n.level == "MT6"][0]
print(f"CEO: {ceo.title}, Reports: {sum(1 for n in hierarchy.values() if n.manager == ceo.employee_id)}")
```

---

#### 3. PerformanceHistoryGenerator

**Purpose:** Generates multi-year performance history

**Location:** `backend/src/ninebox/services/sample_data_generator.py`

**Algorithm:**
1. **Calculate years of history** based on tenure (hire date)
2. **For employees with tenure >= 3 years:**
   - 80% get full 3-year history (2023, 2024, 2025)
   - 20% get partial history (gaps simulate new hires, incomplete data)
3. **Generate ratings with variance:**
   - 60% stable (same rating year-over-year)
   - 20% improve (higher ratings over time)
   - 20% decline (lower ratings over time)
4. **Use current year (2025) rating as anchor** (actual rating from Employee model)

**Valid Ratings:** "Low", "Solid", "Strong", "Leading"

**Example Output:**
```python
[
    {"year": 2023, "rating": "Solid"},
    {"year": 2024, "rating": "Strong"},
    {"year": 2025, "rating": "Leading"}  # Current rating
]
```

**Usage:**
```python
from ninebox.services.sample_data_generator import PerformanceHistoryGenerator
from datetime import date

generator = PerformanceHistoryGenerator(seed=42)
hire_date = date(2020, 1, 1)
current_rating = "Strong"

history = generator.generate_history(
    employee_id=1,
    hire_date=hire_date,
    current_rating=current_rating
)

print(f"Generated {len(history)} years of history")
```

---

#### 4. RichEmployeeGenerator

**Purpose:** Main orchestrator for dataset generation

**Location:** `backend/src/ninebox/services/sample_data_generator.py`

**Process:**
1. **Build management hierarchy** (via ManagementChainBuilder)
2. **Distribute employees** across locations and job functions (even distribution)
3. **Assign job levels** (pyramid distribution from hierarchy)
4. **Generate grid positions** ensuring all 9 positions covered (1-9)
5. **Apply bias patterns** (if `include_bias=True`)
6. **Generate performance/potential ratings** from grid positions
7. **Create performance history** (via PerformanceHistoryGenerator)
8. **Distribute flags** (10-20% of employees get flags)
9. **Populate all 28 Employee model fields** (complete data)

**Distributions:**
- **Levels:** 40% MT1, 25% MT2, 20% MT3, 10% MT4, 4% MT5, 1% MT6
- **Grid Positions:** All 9 positions covered (weighted: higher positions less common)
- **Flags:** All 8 flag types represented (10-20% coverage)
- **Locations/Functions:** Even distribution with shuffling

**Example:**
```python
from ninebox.services.sample_data_generator import RichEmployeeGenerator, RichDatasetConfig

config = RichDatasetConfig(size=50, seed=42)
generator = RichEmployeeGenerator()
employees = generator.generate_dataset(config)

print(f"Generated {len(employees)} employees")
print(f"Locations: {set(emp.location for emp in employees)}")
print(f"Job Levels: {set(emp.job_level for emp in employees)}")
print(f"Grid Positions: {set(emp.grid_position for emp in employees)}")
```

---

#### 5. API Endpoint: `/api/employees/generate-sample`

**Purpose:** HTTP endpoint for sample data generation

**Location:** `backend/src/ninebox/api/employees.py`

**Request Model:**
```python
class GenerateSampleRequest(BaseModel):
    size: int = Field(default=200, ge=50, le=300)
    include_bias: bool = Field(default=True)
    seed: int | None = Field(default=None)
```

**Response Model:**
```python
class GenerateSampleResponse(BaseModel):
    employees: list[Employee]
    metadata: dict[str, Any]  # Contains: total, bias_patterns, locations, functions
```

**Metadata Fields:**
- `total: int` - Number of employees generated
- `locations: list[str]` - Unique locations (sorted)
- `functions: list[str]` - Unique job functions (sorted)
- `grid_positions: list[int]` - Unique grid positions (sorted)
- `bias_patterns: dict | None` - Bias statistics (if `include_bias=True`)
  - `usa_employees: int` - Count of USA employees
  - `usa_high_performers: int` - Count of high performers in USA
  - `usa_high_performer_rate: float` - Percentage (e.g., 0.35 = 35%)
  - `sales_employees: int` - Count of Sales employees
  - `sales_high_performers: int` - Count of high performers in Sales
  - `sales_high_performer_rate: float` - Percentage

**Example Request:**
```bash
POST /api/employees/generate-sample
Content-Type: application/json

{
  "size": 200,
  "include_bias": true,
  "seed": 42
}
```

**Example Response:**
```json
{
  "employees": [ /* 200 Employee objects */ ],
  "metadata": {
    "total": 200,
    "locations": ["AUS", "CAN", "DEU", "FRA", "GBR", "IND", "SGP", "USA"],
    "functions": ["Data Analyst", "Designer", "Engineering", "HR", "Marketing", "Operations", "Product Manager", "Sales"],
    "grid_positions": [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "bias_patterns": {
      "usa_employees": 25,
      "usa_high_performers": 12,
      "usa_high_performer_rate": 0.48,
      "sales_employees": 25,
      "sales_high_performers": 13,
      "sales_high_performer_rate": 0.52
    }
  }
}
```

**Error Handling:**
- **400 Bad Request** - Invalid size (out of 50-300 range)
- **500 Internal Server Error** - Generation failure

**Performance:**
- Target: <1 second for 200 employees
- Acceptable: <2 seconds for 300 employees

**Important:** This endpoint does NOT save employees to a session. It only generates and returns the data. The frontend is responsible for creating a session via the existing upload flow.

---

### Frontend Components

#### 1. EmptyState Component

**Purpose:** Display when no employees are loaded

**Location:** `frontend/src/components/common/EmptyState.tsx`

**Features:**
- **Primary CTA:** "Load Sample Data (200 employees)" - Triggers LoadSampleDialog
- **Secondary CTA:** "Upload Excel File" - Opens file upload dialog
- **Tutorial hints:** Instructions for new users
- **Loading state support:** Shows spinner during data generation

**Visual Design:**
- Centered layout with icon
- Clear call-to-action buttons
- Accessible (ARIA labels, keyboard navigation)
- Supports light/dark mode

**Example Usage:**
```typescript
import EmptyState from '@/components/common/EmptyState';

<EmptyState
  onLoadSample={() => setShowLoadSampleDialog(true)}
  onUpload={() => setShowUploadDialog(true)}
  isLoading={isGenerating}
/>
```

---

#### 2. LoadSampleDialog Component

**Purpose:** Confirmation dialog for loading sample data

**Location:** `frontend/src/components/dialogs/LoadSampleDialog.tsx`

**Features:**
- **Warning when replacing existing data** - Confirms user wants to discard current session
- **Description of sample dataset** - Explains what will be generated (200 employees, bias patterns, etc.)
- **Loading indicator** - Shows spinner during generation
- **Error handling** - Displays error messages if generation fails

**Dialog Actions:**
- **Cancel** - Closes dialog without action
- **Load Sample Data** - Triggers generation and session creation

**Example Usage:**
```typescript
import LoadSampleDialog from '@/components/dialogs/LoadSampleDialog';

<LoadSampleDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  hasExistingData={employees.length > 0}
/>
```

---

#### 3. SampleDataService

**Purpose:** Service layer for API calls

**Location:** `frontend/src/services/sampleDataService.ts`

**Methods:**

**`generateSampleDataset(request: GenerateSampleRequest): Promise<GenerateSampleResponse>`**
- Calls `POST /api/employees/generate-sample` with configuration
- Returns employees + metadata
- Throws error on failure (caught by caller)

**`loadDefaultSampleData(): Promise<GenerateSampleResponse>`**
- Convenience method for default configuration (200 employees, bias enabled)
- Internally calls `generateSampleDataset()` with default params

**Example Usage:**
```typescript
import { sampleDataService } from '@/services/sampleDataService';

// Default sample data (200 employees with bias)
const response = await sampleDataService.loadDefaultSampleData();
console.log(`Generated ${response.metadata.total} employees`);

// Custom sample data
const customResponse = await sampleDataService.generateSampleDataset({
  size: 100,
  include_bias: false,
  seed: 42
});
```

**Error Handling:**
```typescript
try {
  const response = await sampleDataService.loadDefaultSampleData();
  // Create session with employees...
} catch (error) {
  const errorMessage = extractErrorMessage(error);
  console.error('Failed to generate sample data:', errorMessage);
  // Show error to user
}
```

---

## Bias Patterns

When `include_bias=True`, the generator creates statistically detectable patterns for demonstrating the Intelligence tab's analytics capabilities.

### USA Location Bias

**Pattern:** USA location has +15% more high performers than baseline

**Implementation:**
- For each USA employee, apply 30% boost rate
- If employee is not already high performance, 30% chance to upgrade to high performance
- Net effect: ~15% increase in high performer rate for USA

**Detection:**
- Chi-square test confirms statistical significance (p < 0.05)
- Intelligence tab surfaces location-based insights

**Example:**
```python
# Baseline high performer rate: 20%
# USA high performer rate: 35% (+15%)
# Chi-square test: p = 0.002 (highly significant)
```

---

### Sales Function Bias

**Pattern:** Sales function has +20% more high performers than baseline

**Implementation:**
- For each Sales employee, apply 35% boost rate
- If employee is not already high performance, 35% chance to upgrade to high performance
- Net effect: ~20% increase in high performer rate for Sales

**Detection:**
- Chi-square test confirms statistical significance (p < 0.05)
- Intelligence tab surfaces function-based insights

**Example:**
```python
# Baseline high performer rate: 20%
# Sales high performer rate: 40% (+20%)
# Chi-square test: p = 0.001 (highly significant)
```

---

### Rationale

These patterns are:
- **Subtle enough to be realistic** - Not obviously artificial
- **Strong enough to be reliably detected** - Chi-square tests consistently show p < 0.05
- **Actionable for demonstrations** - Intelligence tab can surface meaningful insights
- **Configurable** - Can be disabled with `include_bias=False` for neutral baselines

**Use Cases:**
- **Intelligence Testing:** Validate bias detection algorithms with known ground truth
- **Tutorial Walkthroughs:** Demonstrate Intelligence tab features with clear patterns
- **Documentation Screenshots:** Show compelling analytics results
- **User Onboarding:** Help new users understand the value of intelligence features

---

## Performance Characteristics

### Benchmark Results

Tested on typical development machine (Windows 11, Intel i7, 16GB RAM):

| Dataset Size | Generation Time | Memory Usage | Employee Objects Created |
|--------------|----------------|--------------|--------------------------|
| 50 employees | <0.010s | ~5 MB | 50 |
| 100 employees | <0.015s | ~10 MB | 100 |
| 200 employees | <0.018s | ~20 MB | 200 |
| 300 employees | <0.020s | ~30 MB | 300 |

**Test Location:** `backend/tests/integration/test_sample_data_api.py`

### API Endpoint Performance

| Metric | Target | Actual | Test |
|--------|--------|--------|------|
| End-to-end latency (200 employees) | <1s | <0.5s | `test_performance_when_200_employees_then_fast` |
| End-to-end latency (300 employees) | <2s | <1s | `test_performance_when_300_employees_then_acceptable` |
| Network overhead | Minimal | ~200KB | Response size measured |
| Concurrent requests | Stateless | Unlimited | No session state locked |

### Frontend Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Sample data load (200 employees) | <3s total | Includes API call + session creation + grid render |
| UI responsiveness | Non-blocking | Async API call, loading indicator shown |
| Memory footprint | <50MB | Employee objects in React state |

### Bottlenecks

**None Identified:**
- Generation is extremely fast (<20ms for 300 employees)
- Memory usage is minimal (<30MB for 300 employees)
- Network transfer is small (~200KB JSON response)
- No database operations (stateless endpoint)

**Optimization Opportunities:**
- Currently not needed (performance exceeds targets)
- If scale increases (>1000 employees), consider streaming or pagination

---

## Extension Guide

### Adding New Bias Patterns

**Scenario:** Add India location bias (+10% high performers)

**Steps:**

1. **Update `RichEmployeeGenerator._apply_bias()`:**
```python
def _apply_bias(self, grid_pos: int, location: str, function: str) -> int:
    """Apply bias patterns to grid position."""
    if not self.config.include_bias:
        return grid_pos

    # Existing patterns...

    # NEW: India bias (+10% high performers)
    if location == "IND":
        performance, potential = self._grid_to_perf_pot(grid_pos)
        if performance != PerformanceLevel.HIGH and self.rng.random() < 0.20:  # 20% boost rate
            performance = PerformanceLevel.HIGH
            grid_pos = self._perf_pot_to_grid(performance, potential)

    return grid_pos
```

2. **Add Unit Test:**
```python
def test_india_bias_when_enabled_then_statistically_significant():
    """Test India location bias creates detectable pattern."""
    config = RichDatasetConfig(size=200, include_bias=True, seed=42)
    employees = generate_rich_dataset(config)

    india_employees = [e for e in employees if e.location == "IND"]
    india_high = sum(1 for e in india_employees if e.performance == PerformanceLevel.HIGH)

    # Chi-square test should show significance
    from scipy.stats import chi2_contingency

    other_employees = [e for e in employees if e.location != "IND"]
    other_high = sum(1 for e in other_employees if e.performance == PerformanceLevel.HIGH)

    observed = [
        [india_high, len(india_employees) - india_high],
        [other_high, len(other_employees) - other_high]
    ]

    _, p_value, _, _ = chi2_contingency(observed)
    assert p_value < 0.05, "India bias should be statistically significant"
```

3. **Update API Endpoint Metadata:**
```python
# In generate_sample_employees() endpoint
if request.include_bias:
    india_employees = [emp for emp in employees if emp.location == "IND"]
    india_high_perf = sum(1 for emp in india_employees if emp.performance.value == "High")

    bias_info["india_employees"] = len(india_employees)
    bias_info["india_high_performers"] = india_high_perf
    bias_info["india_high_performer_rate"] = india_high_perf / len(india_employees) if india_employees else 0
```

4. **Update Documentation:**
   - Add to bias patterns section in this file
   - Update user guide if intelligence insights change

---

### Adding New Locations/Functions

**Scenario:** Add Brazil (BRA) location

**Steps:**

1. **Update `RichDatasetConfig` defaults:**
```python
@dataclass
class RichDatasetConfig:
    # ...
    locations: list[str] = field(default_factory=lambda: [
        "USA", "CAN", "GBR", "DEU", "FRA", "IND", "AUS", "SGP",
        "BRA"  # NEW: Add Brazil
    ])
```

**That's it!** The generator automatically distributes employees across all locations evenly.

**Optional:** Add Brazil-specific bias pattern following the steps above.

---

### Extending Field Generation

**Scenario:** Add `department` field to Employee model

**Steps:**

1. **Add field to Employee model:**
```python
# backend/src/ninebox/models/employee.py
class Employee(BaseModel):
    # ... existing fields ...
    department: str | None = None  # NEW field
```

2. **Update `RichEmployeeGenerator.generate_dataset()`:**
```python
def generate_dataset(self, config: RichDatasetConfig) -> list[Employee]:
    # ... existing logic ...

    # NEW: Generate departments
    departments = ["Engineering", "Sales", "Marketing", "Operations", "HR"]
    department_list = (departments * (config.size // len(departments) + 1))[:config.size]
    self.rng.shuffle(department_list)

    for idx, emp_id in enumerate(employee_ids):
        # ... existing logic ...

        employee = Employee(
            # ... existing fields ...
            department=department_list[idx],  # NEW field
        )
```

3. **Add Unit Test:**
```python
def test_generate_dataset_when_called_then_all_employees_have_department():
    """Test all employees have department assigned."""
    config = RichDatasetConfig(size=50, seed=42)
    employees = generate_rich_dataset(config)

    assert all(emp.department is not None for emp in employees)
    assert len(set(emp.department for emp in employees)) >= 3  # Multiple departments
```

---

### Customizing Performance History

**Scenario:** Add 4th year of history (2022)

**Steps:**

1. **Update `PerformanceHistoryGenerator.generate_history()`:**
```python
def generate_history(self, employee_id: int, hire_date: date, current_rating: str) -> list[dict]:
    # ... existing logic ...

    # NEW: Use 4 years instead of 3
    max_years = min(4, int(years_of_service))  # Changed from 3

    # NEW: Include 2022
    years = [2022, 2023, 2024, 2025][-max_years:]

    # ... rest of logic unchanged ...
```

2. **Update Tests:**
```python
def test_generate_history_when_long_tenure_then_four_years():
    """Test employees with 4+ years get full history."""
    generator = PerformanceHistoryGenerator(seed=42)
    hire_date = date(2020, 1, 1)  # 5+ years ago

    history = generator.generate_history(1, hire_date, "Strong")

    assert len(history) == 4  # Changed from 3
    assert {h["year"] for h in history} == {2022, 2023, 2024, 2025}
```

---

## Testing Strategy

### Unit Tests

**Target:** Generator components in isolation
**Location:** `backend/tests/unit/services/test_sample_data_generator.py`
**Coverage:** 96% (28 tests)
**Focus:** Hierarchy validation, distributions, bias patterns

**Key Tests:**
- `test_management_chain_builder_when_build_then_no_orphans` - Validates hierarchy
- `test_performance_history_generator_when_long_tenure_then_three_years` - History generation
- `test_rich_employee_generator_when_bias_enabled_then_usa_has_more_high_performers` - Bias patterns
- `test_generate_rich_dataset_when_called_then_all_fields_populated` - Complete data

**Running Unit Tests:**
```bash
pytest backend/tests/unit/services/test_sample_data_generator.py -v
```

---

### Integration Tests

**Target:** API endpoint end-to-end
**Location:** `backend/tests/integration/test_sample_data_api.py`
**Coverage:** 10 tests
**Focus:** Request/response, performance, reproducibility

**Key Tests:**
- `test_generate_sample_when_default_then_returns_200_employees` - Default configuration
- `test_generate_sample_when_seed_then_reproducible` - Seed reproducibility
- `test_performance_when_200_employees_then_fast` - Performance target
- `test_bias_patterns_when_enabled_then_metadata_included` - Bias metadata

**Running Integration Tests:**
```bash
pytest backend/tests/integration/test_sample_data_api.py -v
```

---

### E2E Tests

**Target:** User workflows
**Location:** `frontend/playwright/e2e/sample-data-flow.spec.ts`
**Coverage:** Complete user experience
**Focus:** File menu, empty state, intelligence validation

**Key Tests:**
- Load sample data from empty state
- Load sample data from File menu
- Replace existing data with sample data
- Verify intelligence insights appear (bias patterns)

**Running E2E Tests:**
```bash
cd frontend
npm run test:e2e:pw sample-data-flow
```

---

### Test Coverage Summary

| Test Suite | Files | Tests | Coverage | Focus |
|------------|-------|-------|----------|-------|
| Unit Tests | 1 | 28 | 96% | Generator components |
| Integration Tests | 1 | 10 | 100% | API endpoint |
| E2E Tests | 1 | 4 | N/A | User workflows |
| **Total** | **3** | **42** | **96%** | **Complete system** |

---

## Pattern Catalog

### Pattern: Generate Test Data with Known Seed (#testing #reproducibility)

**When:** Writing tests that need consistent data

**Scenario:** Test filtering logic with known employee set

```python
from ninebox.services.sample_data_generator import generate_rich_dataset, RichDatasetConfig

def test_filter_when_usa_employees_then_correct_count():
    """Test filtering by location returns correct count."""
    # Use seed for reproducible test data
    config = RichDatasetConfig(size=100, seed=42, include_bias=False)
    employees = generate_rich_dataset(config)

    # Filter USA employees
    usa_employees = [emp for emp in employees if emp.location == "USA"]

    # With seed=42, size=100, expect ~12-13 USA employees (1/8 of total)
    assert 10 <= len(usa_employees) <= 15
```

**Don't:**
```python
# ❌ WRONG: No seed - test fails randomly
config = RichDatasetConfig(size=100)  # Random seed
employees = generate_rich_dataset(config)
usa_employees = [emp for emp in employees if emp.location == "USA"]
assert len(usa_employees) == 13  # Fails intermittently!
```

---

### Pattern: Test Bias Detection with Ground Truth (#testing #intelligence)

**When:** Testing intelligence analytics algorithms

**Scenario:** Validate chi-square test correctly detects USA bias

```python
from ninebox.services.sample_data_generator import generate_rich_dataset, RichDatasetConfig
from scipy.stats import chi2_contingency

def test_intelligence_when_usa_bias_then_detected():
    """Test intelligence service detects USA location bias."""
    # Generate data with known bias
    config = RichDatasetConfig(size=200, include_bias=True, seed=42)
    employees = generate_rich_dataset(config)

    # Calculate observed frequencies
    usa_employees = [e for e in employees if e.location == "USA"]
    usa_high = sum(1 for e in usa_employees if e.performance.value == "High")

    other_employees = [e for e in employees if e.location != "USA"]
    other_high = sum(1 for e in other_employees if e.performance.value == "High")

    observed = [
        [usa_high, len(usa_employees) - usa_high],
        [other_high, len(other_employees) - other_high]
    ]

    _, p_value, _, _ = chi2_contingency(observed)

    # Should be statistically significant
    assert p_value < 0.05, f"USA bias not detected: p={p_value}"
```

---

### Pattern: Generate Large Dataset for Performance Testing (#testing #performance)

**When:** Benchmarking performance with realistic data

**Scenario:** Test grid rendering performance with 300 employees

```python
import pytest
from ninebox.services.sample_data_generator import generate_rich_dataset, RichDatasetConfig

@pytest.mark.performance
def test_grid_render_when_300_employees_then_fast(benchmark):
    """Test grid renders 300 employees within acceptable time."""
    # Generate large dataset
    config = RichDatasetConfig(size=300, seed=42)
    employees = generate_rich_dataset(config)

    # Benchmark rendering (mock function for example)
    def render_grid():
        return render_employee_grid(employees)

    result = benchmark(render_grid)

    # Should render in <2 seconds
    assert benchmark.stats.mean < 2.0
```

---

### Pattern: Generate Baseline Data Without Bias (#testing #baseline)

**When:** Testing features that shouldn't be affected by bias

**Scenario:** Test export functionality with neutral data

```python
from ninebox.services.sample_data_generator import generate_rich_dataset, RichDatasetConfig

def test_export_when_neutral_data_then_all_employees_included():
    """Test Excel export includes all employees (no bias)."""
    # Generate neutral baseline data
    config = RichDatasetConfig(size=100, include_bias=False, seed=42)
    employees = generate_rich_dataset(config)

    # Export to Excel
    excel_file = export_to_excel(employees)

    # Verify all employees exported
    df = pd.read_excel(excel_file)
    assert len(df) == 100
    assert set(df["Employee ID"]) == set(emp.employee_id for emp in employees)
```

---

### Pattern: Frontend Sample Data Loading (#frontend #user-onboarding)

**When:** User loads sample data for tutorial or testing

**Scenario:** User clicks "Load Sample Data" in empty state

```typescript
// frontend/src/components/common/EmptyState.tsx

import { sampleDataService } from '@/services/sampleDataService';
import { extractErrorMessage } from '@/types/errors';

const handleLoadSample = async () => {
  setIsLoading(true);
  try {
    // Generate sample data (200 employees with bias)
    const response = await sampleDataService.loadDefaultSampleData();

    // Create session with generated employees
    await sessionStore.createSessionFromEmployees(
      response.employees,
      'Sample Dataset (200 employees)'
    );

    // Success - navigate to grid
    navigate('/grid');
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    setError(`Failed to load sample data: ${errorMessage}`);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Troubleshooting

### Issue: Generation is Slow (>2s for 300 employees)

**Symptom:** Sample data generation takes longer than expected

**Diagnosis:**
1. Check `size` parameter - ensure it's within 50-300 range
2. Check if seed is set - random number generation should be fast
3. Profile with `pytest --benchmark-only` to identify bottleneck

**Fix:**
```python
# Use smaller dataset for development
config = RichDatasetConfig(size=50, seed=42)  # Fast generation

# Or profile to find bottleneck
import cProfile
cProfile.run('generate_rich_dataset(config)', 'profile.stats')
```

---

### Issue: Tests Fail with Random Data

**Symptom:** Tests pass sometimes, fail other times

**Diagnosis:** No `seed` parameter set - data is non-deterministic

**Root Cause:**
```python
# ❌ WRONG: No seed - random data each run
config = RichDatasetConfig(size=100)
employees = generate_rich_dataset(config)
assert len([e for e in employees if e.location == "USA"]) == 13  # Fails randomly!
```

**Fix:**
```python
# ✅ CORRECT: Set seed for reproducibility
config = RichDatasetConfig(size=100, seed=42)
employees = generate_rich_dataset(config)
# Now same seed always produces same data
```

**Validation:**
```bash
# Run test multiple times - should always pass
pytest backend/tests/unit/services/test_sample_data_generator.py::test_name -v --count=10
```

---

### Issue: Bias Patterns Not Detected

**Symptom:** Intelligence tab shows no insights, chi-square tests fail

**Diagnosis:**
1. Check `include_bias` parameter - ensure it's `True`
2. Check dataset size - need at least 100 employees for statistical power
3. Verify bias implementation - boost rates may be too low

**Fix:**
```python
# ✅ CORRECT: Enable bias with sufficient sample size
config = RichDatasetConfig(
    size=200,  # Large enough for statistical significance
    include_bias=True,  # Enable bias patterns
    seed=42
)
employees = generate_rich_dataset(config)

# Verify bias is present
usa_employees = [e for e in employees if e.location == "USA"]
usa_high_rate = sum(1 for e in usa_employees if e.performance.value == "High") / len(usa_employees)

print(f"USA high performer rate: {usa_high_rate:.2%}")
# Should be ~35-50% (significantly higher than baseline ~20%)
```

---

### Issue: Management Chain Validation Fails

**Symptom:** Error: "Employee has no manager but is not CEO"

**Diagnosis:** Hierarchy builder created orphaned employees

**Root Cause:**
- Size too small (<6 employees) - not enough for all levels
- Bug in management chain building logic

**Fix:**
```python
# ✅ CORRECT: Ensure minimum size
config = RichDatasetConfig(size=50, seed=42)  # At least 6 employees

# Validate hierarchy after generation
employees = generate_rich_dataset(config)
ceo_count = sum(1 for e in employees if e.job_level == "MT6")
assert ceo_count == 1, "Should have exactly 1 CEO"

orphans = [e for e in employees if e.manager is None and e.job_level != "MT6"]
assert len(orphans) == 0, f"Found {len(orphans)} orphaned employees"
```

---

### Issue: Frontend Times Out Waiting for Response

**Symptom:** API call exceeds timeout (>30s)

**Diagnosis:**
1. Backend not running or crashed
2. Request size too large (>300 employees)
3. Network issue (unlikely for localhost)

**Fix:**
```typescript
// Add timeout and better error handling
const response = await axios.post(
  '/api/employees/generate-sample',
  { size: 200, include_bias: true },
  { timeout: 30000 }  // 30 second timeout
).catch(error => {
  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timed out - backend may not be running');
  }
  throw error;
});
```

**Validation:**
- Check backend logs: `backend/logs/ninebox.log`
- Verify backend health: `curl http://localhost:38000/health`
- Test API directly: `curl -X POST http://localhost:38000/api/employees/generate-sample -d '{"size": 50}'`

---

## Future Enhancements

### Industry-Specific Datasets

**Goal:** Generate datasets tailored to specific industries

**Example:**
```python
@dataclass
class IndustryConfig:
    name: str
    job_functions: list[str]
    locations: list[str]
    typical_size: int

INDUSTRIES = {
    "tech": IndustryConfig(
        name="Technology",
        job_functions=["Engineering", "Product", "Design", "Data Science"],
        locations=["USA", "CAN", "IND", "GBR"],
        typical_size=500
    ),
    "healthcare": IndustryConfig(
        name="Healthcare",
        job_functions=["Nursing", "Medical Staff", "Administration", "Research"],
        locations=["USA", "CAN"],
        typical_size=1000
    ),
}

# Usage
config = RichDatasetConfig.from_industry("tech", seed=42)
employees = generate_rich_dataset(config)
```

---

### Temporal Patterns

**Goal:** Add seasonal performance trends

**Example:**
- Q4 sales boost (higher performance in Dec)
- Summer hiring wave (more new hires in Jun-Aug)
- Annual review cycles (performance history clustered in Jan-Mar)

---

### Multi-Company Scenarios

**Goal:** Generate datasets simulating mergers, acquisitions

**Example:**
```python
config = RichDatasetConfig(
    size=300,
    companies=["Acme Corp", "Widgets Inc"],
    merger_date=date(2024, 6, 1)  # Simulate post-merger integration
)
```

---

### Configurable Bias

**Goal:** Allow users to define custom bias patterns

**Example:**
```python
config = RichDatasetConfig(
    size=200,
    bias_patterns=[
        BiasPattern(dimension="location", value="USA", boost=0.15),
        BiasPattern(dimension="function", value="Sales", boost=0.20),
        BiasPattern(dimension="tenure", value="5+ years", boost=0.10),
    ]
)
```

---

### Export to Excel

**Goal:** Save generated dataset as Excel file for offline use

**Example:**
```python
from ninebox.services.excel_exporter import export_to_excel

employees = generate_rich_dataset(config)
export_to_excel(employees, filename="sample_dataset_200.xlsx")
```

---

## Related Documentation

- **Employee Model:** `backend/src/ninebox/models/employee.py`
- **API Routes:** `backend/src/ninebox/api/employees.py`
- **User Guide:** `resources/user-guide/docs/getting-started.md`
- **Test Fixtures:** `backend/tests/conftest.py`
- **Frontend Services:** `frontend/src/services/sampleDataService.ts`
- **E2E Tests:** `frontend/playwright/e2e/sample-data-flow.spec.ts`
- **[ERROR_HANDLING.md](ERROR_HANDLING.md)** - API error patterns
- **[PERFORMANCE.md](PERFORMANCE.md)** - Performance benchmarks and targets
- **[TESTING.md](../testing/)** - Testing strategies and templates

---

## Tags for Search

`#generator` `#sample-data` `#bias-patterns` `#testing` `#intelligence` `#hierarchy` `#performance-history` `#api-endpoint` `#frontend` `#reproducibility` `#statistics` `#chi-square` `#organizational-hierarchy` `#management-chain` `#realistic-data`

---

**Document Status:** Complete (All 5 agents delivered)
**Coverage:** 96% unit test coverage, 10 integration tests, 4 E2E tests
**Performance:** <2s for 300 employees, <1s API latency
**Last Updated:** 2025-12-28
