# Manager Rating Distribution Anomaly Detection

**Status:** active
**Owner:** bencan1a
**Created:** 2026-01-01

## Summary

- Add new intelligence check to identify managers with anomalous rating distributions
- 100% stacked bar chart showing High/Med/Low distribution per manager
- Compare against configurable 20/70/10 baseline
- Filter to managers with sufficient org size (≥10 employees)
- Statistical analysis using chi-square test and z-scores
- Integration with existing org hierarchy filter

## Problem Statement

Users need to identify managers who have unusual rating distributions within their organizations during calibration meetings. Small teams can't realistically achieve exact 20/70/10 distributions, so we need to focus on managers with larger organizations while accounting for statistical variance.

## Success Criteria

- [ ] New "Manager Rating Distribution" section in Intelligence tab
- [ ] Visualization shows top 10 most anomalous managers
- [ ] Clicking "View Team" filters grid to show manager's organization
- [ ] Statistical analysis determines green/yellow/red status
- [ ] Sample data includes intentional manager bias for testing
- [ ] Configurable thresholds for deviation severity
- [ ] Sortable by manager name, team size, or deviation

## Technical Approach

### Backend (Python/FastAPI)

**New Analysis Function:** `calculate_manager_analysis()`

1. **Build org tree**
   - For each employee with direct_manager, build parent-child relationships
   - Calculate total org size (direct + all indirect reports) for each manager

2. **Filter managers**
   - Include only managers with org_size >= MIN_TEAM_SIZE (default: 10)

3. **Calculate distributions**
   - Group 9-box positions into High/Med/Low buckets:
     - High: positions 9, 8, 6
     - Medium: positions 7, 5, 3
     - Low: positions 4, 2, 1
   - Calculate actual percentages for each manager

4. **Statistical analysis**
   - Build contingency table: managers × performance levels (H/M/L)
   - Chi-square test for overall significance
   - Calculate z-scores for each manager's deviation
   - Calculate Cramér's V for effect size

5. **Rank and filter**
   - Calculate absolute deviation from baseline (20/70/10)
   - Sort by total deviation magnitude
   - Return top 10 most anomalous

6. **Status determination**
   - Use z-score thresholds and effect size
   - Return green/yellow/red status

**Configurable Constants:**
```python
MANAGER_MIN_TEAM_SIZE = 10
MANAGER_MAX_DISPLAYED = 10
MANAGER_BASELINE_HIGH = 20.0
MANAGER_BASELINE_MEDIUM = 70.0
MANAGER_BASELINE_LOW = 10.0
MANAGER_ZSCORE_THRESHOLD_YELLOW = 2.0  # 95% confidence
MANAGER_ZSCORE_THRESHOLD_RED = 3.0     # 99.7% confidence
```

**Data Model:**
```python
class ManagerDeviation(BaseModel):
    manager_name: str
    team_size: int
    high_pct: float
    medium_pct: float
    low_pct: float
    high_deviation: float
    medium_deviation: float
    low_deviation: float
    total_deviation: float
    z_score: float
```

**Sample Data Enhancement:**
- Add biased ratings for 2-3 specific managers
- Example: "Jane Smith" rates 40% High / 50% Med / 10% Low
- Example: "Bob Johnson" rates 5% High / 75% Med / 20% Low

### Frontend (React/TypeScript)

**New Components:**

1. **ManagerDistributionChart.tsx**
   - 100% stacked horizontal bar chart (recharts)
   - Y-axis: Manager names
   - X-axis: Percentage (0-100%)
   - Three segments: Low (red), Medium (yellow), High (green)
   - Baseline reference markers at 20/70/10
   - Visual indicators for anomalous managers
   - Sortable by clicking column headers

2. **ManagerDeviationTable.tsx**
   - Detailed table showing:
     - Manager name
     - Team size
     - Actual distribution (H/M/L %)
     - Expected distribution (20/70/10)
     - Deviation from baseline
     - Z-score
     - Action button: "View Team"
   - Clicking "View Team" calls `filterStore.setReportingChainFilter(managerName)`

**Integration:**
- Add manager analysis section to `IntelligenceTab.tsx`
- Reuse `AnomalySection` component pattern
- Display statistical summary (p-value, effect size, degrees of freedom)

### Testing Strategy

**Backend Unit Tests:**
- `test_build_org_tree()` - Verify parent-child relationships
- `test_calculate_org_size()` - Direct + indirect reports counted
- `test_manager_distribution_bucketing()` - H/M/L grouping correct
- `test_manager_min_team_size_filter()` - Small teams excluded
- `test_manager_deviation_calculation()` - Math verified
- `test_manager_statistical_analysis()` - Chi-square and z-scores
- `test_manager_top_10_ranking()` - Most anomalous first

**Backend Integration Tests:**
- `test_intelligence_includes_manager_analysis()` - API returns manager data
- `test_sample_data_manager_bias()` - Biased managers detected

**Frontend Component Tests:**
- `ManagerDistributionChart.test.tsx` - Renders bars correctly
- `ManagerDeviationTable.test.tsx` - Filter action works
- Sorting functionality

**E2E Tests:**
- Navigate to Intelligence tab
- Verify manager section displays
- Click "View Team" button
- Verify grid filters to manager's org

## Implementation Order

1. Backend org tree calculation (TDD)
2. Backend distribution analysis (TDD)
3. Backend statistical tests (TDD)
4. Sample data bias patterns
5. API endpoint updates
6. Frontend chart component
7. Frontend table with filter action
8. Integration with IntelligenceTab
9. User documentation
10. Screenshot workflows

## Configuration Design

Configuration will be stored as constants in the backend code (not user-configurable UI yet). This allows easy tweaking during development and future migration to user settings.

```python
# backend/src/ninebox/services/intelligence_service.py
MANAGER_CONFIG = {
    "min_team_size": 10,
    "max_displayed": 10,
    "baseline": {"high": 20.0, "medium": 70.0, "low": 10.0},
    "thresholds": {
        "zscore_yellow": 2.0,
        "zscore_red": 3.0,
    }
}
```

## Statistical Approach

**Deviation Calculation:**
```
For each manager:
  deviation_high = |actual_high% - baseline_high%|
  deviation_medium = |actual_medium% - baseline_medium%|
  deviation_low = |actual_low% - baseline_low%|
  total_deviation = deviation_high + deviation_medium + deviation_low
```

**Status Determination:**
```
If max(|z_score|) >= 3.0 AND effect_size >= 0.3 AND p_value <= 0.05:
  status = red
Elif max(|z_score|) >= 2.0 AND effect_size >= 0.1 AND p_value <= 0.05:
  status = yellow
Else:
  status = green
```

## Edge Cases & Constraints

- Managers with exactly 10 employees: Include (boundary case)
- Managers with 9 employees: Exclude
- Managers with no rated employees: Exclude from analysis
- Employees without managers: Not counted in any manager's org
- Self-managed employees (manager = self): Exclude
- Circular reporting chains: Should not exist in valid data (validation elsewhere)
- Multiple managers with same name: Treated as distinct (limitation documented)

## Future Enhancements

- User-configurable baseline distribution (not 20/70/10 for all orgs)
- User-configurable minimum team size slider
- Drill-down visualization showing next level down in org
- Export manager anomaly report to CSV/PDF
- Historical trending of manager distributions over time
- Peer comparison (compare manager to similar-sized peer managers)

## Dependencies

- Existing intelligence service patterns
- Existing filter store and reporting chain filter
- Recharts library (already in use)
- Sample data generator

## Risks & Mitigations

**Risk:** Large organizations (50+ managers) may slow down calculation
**Mitigation:** Limit to top 10, optimize org tree building with caching

**Risk:** Manager name conflicts (two "John Smith" managers)
**Mitigation:** Document limitation, future enhancement to use employee IDs

**Risk:** Users may not understand z-scores
**Mitigation:** Provide clear interpretation text, focus on deviation %

## Documentation Requirements

- User guide section explaining manager anomaly check
- Screenshot showing populated chart
- Screenshot showing detailed table
- Screenshot showing filter workflow
- Architecture notes on org tree calculation algorithm
