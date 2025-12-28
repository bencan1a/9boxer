# Future Enhancements - Sample Data Feature

This document tracks enhancement ideas for the sample data generation feature.

## 1. File Menu Display Issue

**Status:** Open
**Priority:** Low (Cosmetic)
**Labels:** `enhancement`, `ui`

**Description:**
When sample data is loaded via File → Load Sample Dataset, the file menu dropdown still shows "No file selected" instead of showing a meaningful name.

**Expected Behavior:**
The file menu should show an appropriate label when sample data is loaded, such as:
- "Sample Dataset (200 employees)"
- "Sample Data - [timestamp]"
- Or similar identifier

**Current Behavior:**
File menu shows "No file selected" even though 200 employees are loaded.

**Proposed Solution:**
- Update the sample data API response to include a `filename` field (e.g., "Sample_Dataset_200.xlsx")
- Store this in the session store's `filename` field
- UI will automatically display it in the file menu

**Files to Modify:**
- `backend/src/ninebox/api/employees.py` - Add filename to generate-sample response
- `frontend/src/components/dashboard/AppBarContainer.tsx` - Set filename when loading sample data

---

## 2. Management Hierarchy Algorithm Improvements

**Status:** Open
**Priority:** Medium
**Labels:** `enhancement`, `backend`, `data-quality`

**Description:**
The algorithm that generates management hierarchies needs improvement to create more realistic organizational structures.

**Current Issues:**
- [To be documented - specific issues with current algorithm]
- Possibly unrealistic span of control
- Management levels might not reflect real-world patterns
- Chain relationships may be inconsistent

**Proposed Improvements:**
- Review and refactor `ManagementChainBuilder` in `backend/src/ninebox/services/sample_data_generator.py`
- Add validation for realistic span of control (5-15 direct reports)
- Ensure consistent title-to-level mappings
- Add more sophisticated org chart generation logic

**Files to Modify:**
- `backend/src/ninebox/services/sample_data_generator.py`
- `backend/tests/unit/services/test_sample_data_generator.py` - Add tests for hierarchy validation

---

## 3. Intelligence Panel Anomalies

**Status:** Open
**Priority:** High
**Labels:** `enhancement`, `intelligence`, `data-quality`

**Description:**
Generated sample data doesn't contain detectable anomalies for the intelligence panel to analyze.

**Current Behavior:**
The intelligence panel may not show insights when viewing sample data because the bias patterns aren't strong enough or properly distributed.

**Expected Behavior:**
Sample data should include:
- Detectable bias patterns (e.g., USA location +15% high performers, Sales function +20% high performers)
- Sufficient statistical power for chi-square tests
- Distribution that triggers intelligence insights

**Investigation Needed:**
- Review `RichEmployeeGenerator` bias pattern implementation
- Check if bias patterns are being applied correctly
- Verify intelligence panel detection thresholds
- Test with sample data to see what insights appear

**Files to Review:**
- `backend/src/ninebox/services/sample_data_generator.py` - Bias pattern implementation
- `backend/src/ninebox/services/intelligence_service.py` - Detection thresholds
- `backend/tests/integration/test_sample_data_api.py` - Add test for intelligence detection

**Success Criteria:**
- Loading sample data should consistently show 2+ insights in the intelligence panel
- Insights should highlight the intentional bias patterns

---

## 4. Documentation Updates

**Status:** Open
**Priority:** Medium
**Labels:** `documentation`

**Description:**
Quick start guide and other documentation should be updated to leverage the new sample data feature.

**Documentation to Update:**

### Quick Start Guide
**File:** `resources/user-guide/docs/getting-started.md`

**Updates Needed:**
- Add "Try with Sample Data" section at the beginning
- Show how to load sample data as the first step
- Use sample data for all tutorial examples
- Add screenshots showing the sample data load process

### User Guide
**Files:** Various in `resources/user-guide/docs/`

**Updates Needed:**
- Update all tutorials to mention sample data option
- Add sample data as alternative to Excel upload
- Include sample data in feature demonstration workflows

### Architecture Docs
**File:** `internal-docs/architecture/SAMPLE_DATA_GENERATION.md`

**Already Planned:**
- Generator architecture diagram
- Component descriptions
- Bias patterns and rationale
- Performance characteristics
- Extension guide

### Storybook Documentation
**Files:**
- `frontend/src/components/EmptyState.stories.tsx` - Already has sample data button
- `frontend/src/components/dialogs/LoadSampleDialog.stories.tsx` - Already has stories

**Additional Stories Needed:**
- File menu with sample data loaded
- Statistics panel with sample data
- Intelligence panel showing sample data insights

---

## Implementation Priority

1. **High Priority:**
   - #3 - Intelligence panel anomalies (core feature value)

2. **Medium Priority:**
   - #2 - Management hierarchy improvements (data quality)
   - #4 - Documentation updates (user onboarding)

3. **Low Priority:**
   - #1 - File menu display (cosmetic)

---

## Related Files

- **Plan:** `agent-projects/rich-sample-data-generator/plan.md`
- **Backend Generator:** `backend/src/ninebox/services/sample_data_generator.py`
- **Backend API:** `backend/src/ninebox/api/employees.py`
- **Frontend Service:** `frontend/src/services/sampleDataService.ts`
- **Frontend UI:** `frontend/src/components/dashboard/AppBarContainer.tsx`
- **Tests:** `backend/tests/unit/services/test_sample_data_generator.py`

---

**Last Updated:** 2025-12-28
**Status:** Active tracking
