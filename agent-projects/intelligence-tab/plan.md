# Intelligence Tab Feature

```yaml
status: done
owner: Claude
created: 2025-12-03
completed: 2025-12-21
summary:
  - Add Intelligence tab for statistical anomaly detection across full dataset
  - Analyze Location, Function, Level, Tenure for rating distribution anomalies
  - Use Chi-square tests, z-scores, and effect sizes for statistical significance
  - Display traffic light indicators and visualizations for actionable insights
  - Real-time updates when data changes
completion_notes: |
  Intelligence tab fully implemented with comprehensive statistical analysis.
  Backend service (intelligence_service.py) implements chi-square tests, z-scores,
  and effect sizes. Frontend component (IntelligenceTab.tsx) with visualizations.
  Full test coverage: unit tests, integration tests. Feature deployed and operational.
```

## Overview

Adding a new "Intelligence" tab to the 9-Box application that provides statistical analysis of the entire employee dataset to identify anomalous rating patterns that may indicate bias, calibration issues, or areas requiring attention.

## Key Principles

### Statistical Methodology

**Chi-Square Test of Independence**
- Tests whether rating distributions differ significantly across categories
- Null hypothesis: Ratings are independent of category (Location/Function/Level/Tenure)
- p < 0.05 indicates significant deviation from expected distribution

**Standardized Residuals (Z-scores)**
- Measures how many standard deviations a specific cell deviates from expected
- |z| > 2: Moderate anomaly (yellow flag)
- |z| > 3: Severe anomaly (red flag)

**Effect Size (Cramér's V)**
- Measures strength of association (0-1 scale)
- 0.1 = small, 0.3 = medium, 0.5 = large
- Helps prioritize which anomalies matter most

**Sample Size Safeguards**
- Flag groups with N < 30 as "Insufficient Sample"
- Warn when expected cell counts < 5
- Use Fisher's Exact Test for small samples

### Analysis Dimensions

#### 1. Job Location Analysis
- **Test**: Performance Distribution × Location
- **Expected**: Similar % of high/medium/low performers across locations
- **Anomaly**: Specific locations with unusual concentrations
- **Example**: "USA: 45% high performers vs 25% baseline (z=4.1, p<0.001)"

#### 2. Job Function Analysis
- **Test**: Grid Position Distribution × Job Function
- **Expected**: Similar 9-box distributions across functions
- **Anomaly**: Functions with skewed distributions
- **Example**: "Engineering: 15% high performers vs 30% baseline (z=-2.8, p=0.005)"

#### 3. Level Analysis (CRITICAL INTERPRETATION)
- **Test**: Performance Distribution × Job Level
- **Expected**: Each level should have SIMILAR distribution (NOT higher levels = higher ratings)
- **Rationale**: Ratings are calibrated within level - MT6 "High" ≠ MT1 "High"
- **Anomaly**: If one level has significantly different distribution
- **Good outcome**: p > 0.05 (ratings are properly calibrated across levels)
- **Bad outcome**: p < 0.05 (possible rating bias or calibration issue)
- **Example**:
  - ✅ "Level calibration looks good (p=0.23)"
  - ⚠️ "MT6: 60% rated High vs 30% baseline - possible leniency bias (z=3.2, p<0.001)"

#### 4. Tenure Analysis
- **Test**: Performance Distribution × Tenure Category
- **Expected**: Similar distributions across tenure groups
- **Anomaly**: Tenure-based rating patterns
- **Example**: "0-1 years: 40% high vs 25% baseline (z=2.9, p=0.004)"

### Display Strategy

**Traffic Light System**
- 🟢 Green: No significant issue (p > 0.05)
- 🟡 Yellow: Moderate anomaly (p < 0.05, |z| = 2-3)
- 🔴 Red: Severe anomaly (p < 0.001, |z| > 3)

**Summary Section**
- Overall data quality score (0-100)
- Count of anomalies by severity
- Largest effect sizes detected

**Detail Sections**
- Expected vs Actual comparison charts
- Statistical significance indicators
- Sample sizes with warnings
- Interactive visualizations for drill-down

### Important Implementation Details

**Full Dataset Analysis**
- Intelligence tab analyzes the FULL dataset, NOT the filtered view
- Statistics tab = filtered data
- Intelligence tab = full dataset
- Rationale: Anomaly detection requires full population to establish baseline

**Real-time Updates**
- Recalculate when any employee data changes
- Statistical tests are fast (O(n), <1ms for thousands of employees)
- Debounce if performance issues with very large datasets (>50K)

## Implementation Breakdown

### Backend Components

**intelligence_service.py** (~300 lines)
- Statistical test helpers (chi-square, z-score, Cramér's V)
- Location analysis function
- Function analysis function
- Level analysis function (uniformity testing)
- Tenure analysis function
- Overall intelligence aggregator
- Quality score calculator

**intelligence.py API** (~50 lines)
- GET /api/intelligence endpoint
- Response models
- Router registration

**Dependencies**
- scipy (for statistical tests)
- numpy (if not present)

**Tests** (~300 lines)
- Unit tests for each statistical method
- Edge cases: small N, perfect uniformity, complete bias
- Integration tests for API endpoint

### Frontend Components

**IntelligenceTab.tsx** (~150 lines)
- Main tab component
- Fetches full dataset intelligence
- Layout with 4 sections (Location, Function, Level, Tenure)

**IntelligenceSummary.tsx** (~80 lines)
- Summary cards
- Quality score display
- Anomaly count by severity

**AnomalySection.tsx** (~120 lines)
- Reusable section for each dimension
- Traffic light indicator
- Chart placeholder
- Details table

**DeviationChart.tsx** (~100 lines)
- Bar chart: expected vs actual
- Error bars
- Highlight significant deviations

**DistributionHeatmap.tsx** (~100 lines)
- Heatmap for function analysis
- Color-coded cells

**LevelDistributionChart.tsx** (~100 lines)
- Stacked bar chart by level
- Baseline comparison line

**useIntelligence.ts** (~60 lines)
- Hook for fetching intelligence data
- Auto-refresh on data changes
- Loading/error handling

**Type definitions**
- IntelligenceData interface
- AnomalyDetail interface
- DimensionAnalysis interface
- StatisticalTest type

## Parallel Execution Plan

### Phase 1 (Parallel Execution)
1. **Agent A**: Backend Statistics Service + Tests
2. **Agent B**: Backend API Endpoint + Tests
3. **Agent C**: Frontend Types & API Integration + Hook
4. **Agent E**: Frontend Visualization Components (with mock data)

### Phase 2 (Sequential, depends on Phase 1)
5. **Agent D**: Frontend Intelligence Tab UI (needs types from C)

### Phase 3 (Sequential, depends on Phase 2)
6. **Agent F**: Integration & Wiring (add tab to RightPanel)

### Phase 4 (Testing)
- Run all backend tests
- Run frontend build
- Manual E2E testing
- Performance testing

## Success Criteria

- [ ] All statistical tests implemented correctly
- [ ] Level analysis tests for uniformity (not correlation)
- [ ] All backend unit tests pass
- [ ] All API integration tests pass
- [ ] Intelligence tab appears as third tab
- [ ] Full dataset analyzed (not filtered)
- [ ] Traffic light indicators work
- [ ] All charts render with real data
- [ ] Real-time updates functional
- [ ] Sample size warnings display
- [ ] Statistical details accurate (p-values, z-scores, effect sizes)
- [ ] No console errors
- [ ] TypeScript compiles without errors

## Testing Strategy

### Backend Unit Tests
- Test chi-square calculation with known values
- Test z-score calculation
- Test Cramér's V calculation
- Edge case: N < 5 (should use Fisher's Exact)
- Edge case: Perfect uniformity (p should be ~1.0)
- Edge case: Complete bias (p should be ~0.0)
- Edge case: Single category (should handle gracefully)

### Backend Integration Tests
- Test /api/intelligence endpoint
- Verify response structure
- Test with various data distributions
- Test with small datasets (N < 30)

### Frontend Tests
- Component rendering tests
- Hook behavior tests
- Chart rendering tests
- Loading/error state tests

### Manual E2E Tests
1. Load application
2. Navigate to Intelligence tab
3. Verify all sections display
4. Check traffic light indicators
5. Verify charts render
6. Modify employee data
7. Verify intelligence updates in real-time
8. Check statistical values are reasonable
9. Verify sample size warnings appear for small groups

## Dependencies

- scipy (Python statistical library)
- numpy (if not present)
- Recharts (already in frontend dependencies)
- Material-UI (already in frontend dependencies)

## Estimated Effort

- Backend: ~2 hours
- Frontend: ~2 hours
- Testing: ~1 hour
- **Total**: ~5 hours (with parallel execution: ~2 hours wall time)

## Notes

- Focus on correct statistical interpretation, especially for Level analysis
- Ensure sample size warnings are prominent
- Make visualizations intuitive and actionable
- Document statistical methodology in UI tooltips
- Consider adding help/info icons explaining what each metric means
- Future enhancement: Export intelligence report as PDF

## References

- Chi-square test: scipy.stats.chi2_contingency
- Fisher's Exact test: scipy.stats.fisher_exact
- Cramér's V: sqrt(chi2 / (n * min(r-1, c-1)))
- Standardized residuals: (observed - expected) / sqrt(expected)
