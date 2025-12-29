# Testing Agents Guide

This document explains the testing agent system and how to use the specialized testing agents effectively.

## Overview

We have four specialized testing agents designed to work together to maintain a robust, maintainable test suite in a multi-agent development environment:

1. **Test Architect** (`test-architect.md`) - Strategic orchestrator
2. **Backend Testing Expert** (`test-backend-expert.md`) - Pytest specialist
3. **Frontend Testing Expert** (`test-frontend-expert.md`) - Vitest/React Testing Library specialist
4. **E2E Testing Expert** (`test-e2e-expert.md`) - Playwright specialist

## Agent Hierarchy

```
┌─────────────────────────┐
│   Test Architect        │  Strategic guidance, metrics, documentation
│  (test-architect.md)    │  Coordinates domain experts
└───────────┬─────────────┘
            │
    ┌───────┴──────────────────────────┐
    │                                  │
┌───▼──────────────┐  ┌───────────────▼───────┐  ┌──────────────────▼─────┐
│ Backend Expert   │  │ Frontend Expert       │  │ E2E Expert             │
│ (pytest)         │  │ (vitest/RTL)          │  │ (playwright)           │
└──────────────────┘  └───────────────────────┘  └────────────────────────┘
```

## When to Use Each Agent

### Test Architect
**Use for:**
- Initial test strategy and architecture design
- Weekly test architecture reviews
- Test metrics tracking and analysis
- Documentation maintenance
- Cross-cutting concerns (patterns, fixtures, anti-fragility)
- Feature development consultation (which tests are needed?)

**Example commands:**
```bash
# Initial architecture project
"Review the test suite and create an architectural overhaul plan"

# Weekly review
"Perform weekly test architecture review"

# Feature consultation
"Review test plan for employee export feature"

# Fixture design
"Design fixture architecture for employee test data"
```

### Backend Testing Expert
**Use for:**
- Writing pytest tests for FastAPI endpoints
- Creating pytest fixtures and factory_boy factories
- Testing SQLAlchemy models and database operations
- Backend performance/benchmark tests
- Refactoring brittle backend tests

**Example commands:**
```bash
# Implement tests
"Write backend tests for employee filtering service"

# Create fixtures
"Create pytest fixtures for employee test data"

# Refactor
"Refactor brittle tests in tests/unit/api/test_employees.py"

# Performance
"Write performance tests for grid calculation with 1000 employees"
```

### Frontend Testing Expert
**Use for:**
- Writing Vitest tests for React components
- Creating test utilities and mock factories
- Testing accessibility (WCAG 2.1 AA)
- Testing components against design system
- Refactoring brittle component tests

**Example commands:**
```bash
# Implement tests
"Write component tests for EmployeeCard component"

# Create utilities
"Create test utilities for mocking API responses"

# Refactor
"Refactor brittle tests in EmployeeCard.test.tsx"

# Accessibility
"Add accessibility tests for all form components"
```

### E2E Testing Expert
**Use for:**
- Writing Playwright tests for user workflows
- Creating page object models and test helpers
- Testing complete features end-to-end
- Visual regression testing
- Refactoring brittle E2E tests

**Example commands:**
```bash
# Implement tests
"Write E2E tests for employee movement workflow"

# Create helpers
"Create test helpers for file upload and export operations"

# Refactor
"Refactor brittle E2E tests in upload-flow.spec.ts"

# Visual regression
"Add visual regression tests for grid display"
```

## Common Workflows

### 1. Starting a New Feature

```bash
# Step 1: Consult Test Architect for test strategy
"Review test plan for [feature-name]. What layers of testing are needed?"

# Step 2: Domain experts implement tests
# Backend tests
"Write backend tests for [feature-name]"

# Component tests
"Write component tests for [Component]"

# E2E tests
"Write E2E tests for [workflow]"

# Step 3: Architect reviews
"Review test implementation for [feature-name] and ensure alignment with principles"
```

### 2. Weekly Test Architecture Review

```bash
# Run by Test Architect
"Perform weekly test architecture review"

# Outputs:
# - Analysis of test changes in past week
# - Anti-patterns identified
# - GitHub issues created for violations
# - Updated metrics
# - Recommendations for domain experts
```

### 3. Refactoring Brittle Tests

```bash
# Step 1: Identify brittle areas
# (from weekly review or manual observation)

# Step 2: Architect provides guidance
"Analyze brittle tests in [area] and provide refactoring strategy"

# Step 3: Domain experts execute
# Backend Expert
"Refactor brittle tests in tests/unit/services/test_employee_service.py"

# Frontend Expert
"Refactor brittle tests in EmployeeCard.test.tsx"

# E2E Expert
"Refactor brittle tests in employee-movement.spec.ts"
```

### 4. Creating Test Fixtures/Utilities

```bash
# Step 1: Architect designs pattern
"Design fixture architecture for [domain]"

# Step 2: Domain experts implement
# Backend
"Create pytest fixtures for employee test data"

# Frontend
"Create mock factories for employee data"

# E2E
"Create test helpers for file operations"
```

## Initial Project: Test Architecture Overhaul

To get started with the new testing system, run this project:

```bash
# Command to Test Architect
"Review the entire test suite and create a comprehensive architectural overhaul plan.

Analyze:
1. Current test suite organization and patterns
2. Brittle test anti-patterns present in the codebase
3. Test execution time metrics (current state)
4. Missing test coverage areas
5. Opportunities for fixture/helper consolidation

Deliverables:
1. internal-docs/testing/ARCHITECTURE.md - Overall testing strategy
2. internal-docs/testing/PRINCIPLES.md - Anti-fragile testing principles
3. internal-docs/testing/METRICS.md - Metrics definitions and current baseline
4. agent-projects/test-overhaul/plan.md - Prioritized refactoring plan
5. GitHub issues for high-priority improvements"
```

**Expected timeline**: This initial assessment should take 1-2 hours of agent work and produce a comprehensive plan with 10-20 prioritized tasks.

## Key Principles (Common to All Agents)

All testing agents follow these core principles:

### Anti-Fragility
Tests should survive:
- ✅ Design system changes (colors, spacing)
- ✅ UI string changes (button labels)
- ✅ Component refactoring (internal structure)
- ✅ Minor API format changes

Tests should fail on:
- ❌ Breaking behavior changes
- ❌ Logic errors
- ❌ Data integrity issues

### Speed Segmentation
- **Fast tests** (<60s): Unit + component tests
- **Comprehensive tests** (<10min): Integration + E2E + performance

### Strategic Patterns
- ✅ Use factories/fixtures, not hardcoded data
- ✅ Use `data-testid`, not hardcoded strings
- ✅ Wait for events, not arbitrary timeouts
- ✅ Mock I/O boundaries, not business logic
- ✅ Single responsibility per test
- ❌ No conditional assertions
- ❌ No testing multiple behaviors in one test

## Metrics Tracking

The Test Architect tracks these metrics:

### Execution Time
- Fast tests: Target <60s
- Comprehensive tests: Target <10min
- Trend: Week-over-week changes

### Robustness
- False positives: Target <5%
- Bugs escaped: Target <2/month

### Maintenance
- Test changes per feature: Target <50% ratio
- Test debt: Target <10 outstanding items

### Coverage
- Unit test coverage: Target >80%
- Critical paths: Target 100%
- New code: Target 100%

## Documentation Locations

All testing documentation lives in `internal-docs/testing/`:

```
internal-docs/testing/
├── ARCHITECTURE.md          # Overall testing strategy (created by architect)
├── PRINCIPLES.md            # Anti-fragile principles (created by architect)
├── METRICS.md               # Metrics definitions (maintained by architect)
├── fixtures/                # Fixture patterns
│   ├── backend.md           # Pytest fixtures (backend expert)
│   ├── frontend.md          # Mock factories (frontend expert)
│   └── e2e.md               # Test helpers (e2e expert)
├── templates/               # Test templates
│   ├── backend-test-template.py
│   ├── component-test-template.tsx
│   └── e2e-test-template.ts
└── reviews/                 # Weekly review findings
    └── YYYY-MM-DD.md
```

## Integration with Existing Agents

### Relationship to Existing `test.md` Agent

The new **Backend Testing Expert** (`test-backend-expert.md`) is a more specialized, architecture-aligned version of the existing `test.md` agent.

**Recommendation**: Use `test-backend-expert.md` for all backend testing work going forward. The existing `test.md` can be:
- Kept as a general fallback
- Deprecated in favor of the new expert
- Merged into `test-backend-expert.md`

### Use in Feature Development

When agents are working on features, they should:
1. **Before writing tests**: Consult Test Architect for test strategy
2. **When writing tests**: Use appropriate domain expert patterns
3. **After writing tests**: Validate against principles checklist

This can be integrated into the "new feature" workflow/script.

## GitHub Actions Integration (Future)

Potential workflow additions:

### Weekly Test Architecture Review
```yaml
# .github/workflows/test-architecture-review.yml
name: Weekly Test Architecture Review
on:
  schedule:
    - cron: '0 2 * * 1'  # Mondays at 2 AM UTC
  workflow_dispatch:

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Test Architect Review
        # Invoke test-architect agent
        # Create issues for violations
```

## Next Steps

1. **Run Initial Project**: Use Test Architect to create overhaul plan
2. **Implement High-Priority Fixes**: Use domain experts to tackle top issues
3. **Integrate into Workflows**: Add test strategy consultation to feature development
4. **Enable Weekly Reviews**: Set up automated or manual weekly architecture reviews
5. **Track Metrics**: Establish baseline and track improvements

## FAQ

**Q: Which agent should I use for writing tests?**
A: Use the domain expert (backend, frontend, or E2E) based on what layer you're testing. Consult the Test Architect if unsure.

**Q: Can domain experts work independently?**
A: Yes, but they should follow the architectural principles. The Test Architect reviews and ensures alignment.

**Q: How often should weekly reviews run?**
A: Weekly is recommended, but adjust based on development velocity. High-velocity teams may benefit from twice-weekly reviews.

**Q: What if I disagree with the Test Architect's recommendations?**
A: The Test Architect's role is advisory. Discuss trade-offs and adjust principles if needed. Document decisions in `internal-docs/testing/PRINCIPLES.md`.

**Q: How do I measure success?**
A: Track the metrics in `internal-docs/testing/METRICS.md`. Primary indicators:
- Test execution time trending down
- False positives <5%
- Test maintenance time decreasing
- Coverage remaining >80%

---

**Created**: 2025-12-29
**Maintained by**: Test Architect agent
**Related**: `internal-docs/testing/`, `CLAUDE.md` (Testing Approach section)
