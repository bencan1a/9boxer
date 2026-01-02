# Organization Hierarchy Refactoring Plan

**Created:** 2026-01-01
**Status:** In Progress
**Related Issues:** #102 (Improve management hierarchy generation), #153 (Extract org tree building)

## Executive Summary

This refactoring addresses a critical bug where sample data stores **job titles** instead of **employee names** in manager fields, breaking org hierarchy filters and requiring complex workarounds. Issue #102 built 95% of the infrastructure for a real org hierarchy (CEO → VPs → Directors with actual employees), but the final wiring to use employee names was never completed.

## Problem Statement

### Current Behavior (Broken)
```
Employee: Alice Smith
  direct_manager: "Engineering Manager"         ← Job title (wrong)
  management_chain_04: "Director of Engineering" ← Job title (wrong)
  management_chain_05: "VP Engineering"          ← Job title (wrong)
```

### Intended Behavior (After Fix)
```
Employee: Alice Smith
  direct_manager: "Bob Chen"                     ← Actual employee name
  management_chain_04: "Jennifer Lee"            ← Actual employee name
  management_chain_05: "Michael Rodriguez"       ← Actual employee name
```

### Impact of Bug
1. **Org Hierarchy Filter Broken** - Frontend filter expects names, gets titles
2. **Intelligence Service Workarounds** - Requires complex title-to-name mapping (lines 648-672 in intelligence_service.py)
3. **Unrealistic Sample Data** - Doesn't mirror real HR data (manager field always contains employee names)
4. **Manager Analysis Complications** - Cannot definitively identify which manager (person) has rating bias

## Research Findings

### Issue #102: What Was Built
- `ManagementChainBuilder` class creates real org hierarchy (lines 441-668 in sample_data_generator.py)
- Assigns actual employee IDs as managers (EMP0001, EMP0002, etc.)
- Builds complete 6-level hierarchy: CEO → VP → Director → Manager → Senior IC → IC
- Correctly propagates management chains through all levels

### The Bug: `_get_manager_name()` Method
**Location:** `backend/src/ninebox/services/sample_data_generator.py:1345-1365`

```python
def _get_manager_name(
    self, emp_id: str | None, hierarchy: dict[str, ManagementNode]
) -> str | None:
    """Get manager name from employee ID."""
    if emp_id is None:
        return None
    return hierarchy[emp_id].title if emp_id in hierarchy else None
    #      ^^^^^^^^^^^^^^^^^^^^^^ BUG: Returns title, should return name
```

**Root Cause:** Employee names are generated during `Employee` object creation (line 911), but we need manager names *before* creating the Employee object. This is a classic ordering problem.

### Current Workarounds in Codebase

**Intelligence Service (lines 648-672):**
```python
# Create mappings for resolving manager identities
title_to_name: dict[str, str] = {}
for emp in employees:
    if emp.job_title and emp.job_title != "None":
        title_to_name[emp.job_title] = emp.name
    # ... complex mapping logic ...
```

This workaround maps job titles back to employee names - shouldn't be necessary with correct data.

### Org Tree Building Duplication (Issue #153)

**Current State:**
- Org tree logic embedded in `intelligence_service.py:calculate_manager_analysis()` (lines 643-703)
- 60 lines of code specific to manager analysis
- Not reusable for other features (filters, reporting, org charts)
- Contains workaround for title-to-name mapping

**Needed:**
- Extract to centralized `OrgService` class
- Reusable across features
- Clean API for org graph queries
- Validation (cycles, orphans)

## Solution Architecture

### The Two-Pass Generation Algorithm

**Problem:** We generate Employee objects in one pass, but need manager names before creating those objects.

**Solution:** Generate in two passes:

```python
# Pass 1: Generate names for all employees
employee_names: dict[str, str] = {}  # {employee_id: name}
for emp_id in employee_ids:
    numeric_id = int(emp_id[3:])
    employee_names[emp_id] = self._generate_name(numeric_id)

# Pass 2: Create Employee objects using name lookup
for emp_id in employee_ids:
    node = hierarchy[emp_id]

    # Get manager NAME from lookup (not title!)
    manager_name = employee_names.get(node.manager) if node.manager else None

    employee = Employee(
        name=employee_names[emp_id],
        direct_manager=manager_name,  # ✓ Uses actual employee name
        management_chain_01=employee_names.get(node.chain_01),  # ✓ Names
        ...
    )
```

### The OrgService Architecture

**Purpose:** Centralized service for building and querying org hierarchies as graphs.

**API Design:**
```python
class OrgService:
    """Service for building and querying organizational hierarchies."""

    def __init__(self, employees: list[Employee]):
        """Initialize with employee dataset."""

    def build_org_tree(self) -> dict[str, list[Employee]]:
        """Build complete org tree (direct + indirect reports)."""

    def get_direct_reports(self, manager_name: str) -> list[Employee]:
        """Get only direct reports."""

    def get_all_reports(self, manager_name: str) -> list[Employee]:
        """Get all reports recursively."""

    def get_reporting_chain(self, employee_name: str) -> list[str]:
        """Get upward chain to CEO."""

    def find_managers(self, min_team_size: int = 1) -> list[str]:
        """Find managers with N+ employees."""

    def validate_structure(self) -> OrgValidationResult:
        """Validate for cycles, orphans, inconsistencies."""
```

**Usage Example:**
```python
# Intelligence service
org_service = OrgService(employees)
org_tree = org_service.build_org_tree()
managers = org_service.find_managers(min_team_size=10)

# Filter service
org_service = OrgService(employees)
team_members = org_service.get_all_reports("Alice Chen")
```

## Implementation Phases

### Phase 0: Document the Plan ✓
- Create this document
- Record research findings
- Define architecture

### Phase 1: Fix Sample Data Generation
**File:** `backend/src/ninebox/services/sample_data_generator.py`

**Tasks:**
1. Implement two-pass generation in `generate_dataset()` method (lines 823-943)
2. Update `_get_manager_name()` to accept and use employee names lookup (lines 1345-1365)
3. Fix manager bias logic to use hierarchy data instead of checking manager name strings (lines 1038-1080)
4. Principal architect review

**Success Criteria:**
- Sample data has employee names in `direct_manager` field
- Management chains (01-06) contain employee names
- Bias logic correctly identifies managers by their position in hierarchy

### Phase 2: Extract Org Tree Service (Issue #153)
**New File:** `backend/src/ninebox/services/org_service.py`

**Tasks:**
1. Create `OrgService` class with methods listed above
2. Extract org tree building logic from `intelligence_service.py` lines 643-703
3. Add validation for cycles, orphaned employees
4. Add caching for performance
5. Principal architect review

**Success Criteria:**
- OrgService provides clean API for org queries
- All methods properly validated and tested
- Code extracted from intelligence service

### Phase 3: Update Intelligence Service
**File:** `backend/src/ninebox/services/intelligence_service.py`

**Tasks:**
1. Import and use `OrgService`
2. Replace embedded org tree code (lines 643-703) with service calls
3. Remove title-to-name workaround (lines 648-672)
4. Simplify `calculate_manager_analysis()` function
5. Principal architect review

**Success Criteria:**
- Function simplified by ~60 lines
- No workarounds for data quality issues
- Cleaner, more maintainable code

### Phase 4: Update Tests
**Files:** Multiple test files

**Parallel Tasks:**
1. Update `backend/tests/integration/test_manager_bias_sample_data.py`
   - Change from checking job titles to checking hierarchy data
   - Verify manager fields contain names, not titles

2. Create `backend/tests/unit/services/test_org_service.py`
   - Test all OrgService methods
   - Test edge cases (cycles, orphans, self-management)

3. Verify `backend/tests/unit/services/test_intelligence_manager_analysis.py`
   - Ensure still passes after OrgService extraction
   - May need minor updates

4. Principal architect review of test coverage

**Success Criteria:**
- All tests pass
- Comprehensive OrgService test coverage
- Integration tests verify corrected data model

### Phase 5: Validate Org Hierarchy Filter (E2E)
**New File:** `frontend/playwright/e2e-core/org-hierarchy-filter.spec.ts`

**Tasks:**
1. Create E2E test for org hierarchy filter workflow
2. Test: Click manager in Intelligence tab → Employee list filters
3. Test edge cases (CEO, no reports, clear filter)
4. Manual validation with generated sample data
5. Principal architect review

**Success Criteria:**
- E2E test passes
- Manual testing confirms filter works correctly
- Clicking manager shows their team

### Phase 6: Architecture Documentation
**Location:** `internal-docs/architecture/` (following existing guidelines)

**Tasks:**
1. Use principal-engineer subagent to create architecture docs
2. Document org hierarchy data model
3. Document OrgService design and API
4. Include migration guide for future features
5. Follow `internal-docs/architecture/` guidelines

**Success Criteria:**
- Architecture properly documented
- Migration guide complete
- Follows internal documentation standards

## Success Criteria (Overall)

### Data Model
✅ Sample data assigns real employee names as managers (not titles)
✅ Example: "Alice Smith" reports to "Bob Chen" (actual employee)
✅ Management chains contain employee names throughout

### Code Quality
✅ OrgService provides centralized org tree building (addresses Issue #153)
✅ Intelligence service simplified (no title-to-name workarounds)
✅ ~60 lines of duplicated code removed

### Functionality
✅ Org hierarchy filter works correctly
✅ Can click manager name → see their team
✅ Manager anomaly detection identifies actual people

### Testing & Documentation
✅ All tests pass (unit, integration, E2E)
✅ Comprehensive OrgService test coverage
✅ Architecture documented in `internal-docs/architecture/`

## Risk Assessment

### Low Risk
- Two-pass generation: Straightforward algorithm change
- OrgService extraction: Clean separation of concerns
- Test updates: Clear expectations

### Medium Risk
- Manager bias logic: May need careful testing to ensure bias patterns still detected correctly
- Performance: OrgService may need optimization for large datasets (caching addresses this)

### Mitigation
- Principal architect review at each phase
- Comprehensive test coverage
- Manual validation before marking complete

## Timeline Estimate

- Phase 0: 1 hour (complete)
- Phase 1: 3-4 hours (implementation + review)
- Phase 2: 4-6 hours (new service + review)
- Phase 3: 2-3 hours (refactoring + review)
- Phase 4: 3-4 hours (parallel test updates + review)
- Phase 5: 2-3 hours (E2E + manual validation + review)
- Phase 6: 2-3 hours (architecture docs with principal engineer)

**Total: 17-24 hours**

## Related Documentation

- Issue #102: Improve management hierarchy generation algorithm
- Issue #153: Extract org tree building to separate function
- `agent-projects/rich-sample-data-generator/` - Sample data generation context
- `internal-docs/architecture/` - Final architecture documentation location

## Notes

- The infrastructure from Issue #102 is solid - just needs final wiring
- Principal architect reviews ensure quality at each phase
- Parallel execution of Phase 4 tests maximizes efficiency
- Documentation-first approach ensures knowledge capture
