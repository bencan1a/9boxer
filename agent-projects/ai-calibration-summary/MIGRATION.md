# Migration Guide: Button-Triggered to Agent-First AI Calibration Summary

## Overview

This guide documents the migration from the original **button-triggered** approach to the new **agent-first** architecture for AI calibration summaries.

**Migration Status:** Completed ✅

**Timeline:**
- **Phase 1 (Dec 31, 2025):** Original implementation with two-step workflow
- **Phase 2 (Jan 2, 2026):** Agent-first refactoring with single-call workflow
- **Deprecation Period:** 3 months (until April 1, 2026)
- **Removal of Legacy Endpoint:** April 1, 2026

---

## What Changed?

### High-Level Architecture Shift

#### Old Approach: Button-Triggered (Two-Step)

```
1. User opens Intelligence tab
   ↓
2. Backend generates insights using internal logic
   ↓
3. Frontend displays insights with checkboxes
   ↓
4. User selects insights manually
   ↓
5. User clicks "Generate AI Summary" button
   ↓
6. Frontend sends selected insight IDs to backend
   ↓
7. Backend sends selected insights to LLM
   ↓
8. LLM generates summary based on selected insights
   ↓
9. Frontend displays summary
```

**Issues with Old Approach:**
- Two separate API calls (GET insights, then POST to generate summary)
- Insight generation was internal logic-based (not AI)
- User had to manually curate insights before getting summary
- LLM only saw filtered insights, not complete data
- Summary quality depended on user's insight selection

#### New Approach: Agent-First (Single-Call)

```
1. User opens Intelligence tab
   ↓
2. Backend runs all statistical analyses
   ↓
3. Backend packages complete data for LLM (anonymized)
   ↓
4. LLM agent generates insights + summary together
   ↓
5. Frontend displays insights and summary in one response
```

**Benefits of New Approach:**
- Single API call (GET `/calibration-summary?use_agent=true`)
- Insights are AI-generated (not hardcoded logic)
- LLM sees complete calibration data, not filtered subset
- Summary and insights are coherent (same analysis context)
- Clustering of related issues (root cause analysis)

---

## Breaking Changes

### API Changes

#### Deprecated Endpoint

**Endpoint:** `POST /calibration-summary/generate-summary`

**Status:** Deprecated (still functional but logged as deprecated)

**Removal Date:** April 1, 2026

**Old Usage:**
```typescript
// Step 1: Fetch insights
const summary = await apiClient.getCalibrationSummary();

// Step 2: User selects insights, then generate summary
const llmSummary = await apiClient.generateLLMSummary({
  selected_insight_ids: selectedIds
});
```

**New Usage:**
```typescript
// Single call returns insights + summary
const summary = await apiClient.getCalibrationSummary({ useAgent: true });

// Summary is now part of the response
console.log(summary.summary); // AI-generated summary
console.log(summary.insights); // AI-generated insights
```

#### Response Schema Changes

**Old Response (GET `/calibration-summary`):**
```json
{
  "data_overview": {...},
  "time_allocation": {...},
  "insights": [
    {
      "id": "focus-crowded-center-a1b2c3d4",
      "type": "focus_area",
      "priority": "medium",
      "title": "51% in center box",
      "description": "Consider running Donut Mode...",
      // NO cluster_id or cluster_title
    }
  ]
  // NO summary field
}
```

**New Response (GET `/calibration-summary?use_agent=true`):**
```json
{
  "data_overview": {...},
  "time_allocation": {...},
  "insights": [
    {
      "id": "anomaly-level-MT3-a1b2c3d4",
      "type": "anomaly",
      "priority": "high",
      "title": "MT3 level driving center box inflation",
      "description": "MT3 employees account for 65%...",
      "cluster_id": "mt3-focus",  // NEW
      "cluster_title": "MT3 Level Requires Deep Review"  // NEW
    }
  ],
  "summary": "Your calibration session has a clear root cause..."  // NEW
}
```

**New Fields:**
- `summary` (string | null) - AI-generated executive summary (2-3 paragraphs)
- `cluster_id` (string | null) - Identifier for grouped related issues
- `cluster_title` (string | null) - Human-readable cluster name

### Frontend Hook Changes

#### Old Hook: `useLLMSummary`

**Status:** Deprecated (still exists for backward compatibility)

**Old Usage:**
```typescript
import { useLLMSummary } from '../hooks/useLLMSummary';

function CalibrationPage() {
  const {
    data: llmData,
    isLoading: llmLoading,
    generate
  } = useLLMSummary();

  const handleGenerateSummary = () => {
    generate(selectedInsightIds); // Manual trigger
  };

  return (
    <div>
      <button onClick={handleGenerateSummary}>Generate AI Summary</button>
      {llmData && <p>{llmData.summary}</p>}
    </div>
  );
}
```

#### New Hook: `useCalibrationSummary`

**Status:** Current (recommended)

**New Usage:**
```typescript
import { useCalibrationSummary } from '../hooks/useCalibrationSummary';

function CalibrationPage() {
  const {
    data,
    isLoading,
    summary  // Summary included automatically
  } = useCalibrationSummary({ useAgent: true });

  return (
    <div>
      {/* No button needed - summary auto-generated */}
      {summary && <p>{summary}</p>}
    </div>
  );
}
```

**Key Differences:**
- No manual `generate()` call needed
- Summary included in initial response
- No insight selection state needed
- Single hook handles all data + summary

---

## Migration Steps

### For Backend Developers

#### Step 1: Update API Calls

**Old:**
```python
# GET /calibration-summary (no agent)
summary = summary_service.calculate_summary(employees)

# POST /generate-summary (separate call)
llm_summary = llm_service.generate_summary(
    selected_insight_ids=request.selected_insight_ids,
    insights=summary["insights"],
    data_overview=summary["data_overview"]
)
```

**New:**
```python
# GET /calibration-summary?use_agent=true (single call)
summary = summary_service.calculate_summary(employees, use_agent=True)

# Summary field is now included in response
assert "summary" in summary  # AI-generated summary
assert "insights" in summary  # AI-generated insights
```

#### Step 2: Use New Data Packaging Functions

**Old:**
```python
# No explicit data packaging - insights passed directly to LLM
llm_service.generate_summary(
    insights=insights,  # Just insights, not full data
    data_overview=data_overview
)
```

**New:**
```python
from ninebox.services.analysis_registry import run_all_analyses
from ninebox.services.data_packaging_service import package_for_llm

# Run all analyses
analyses = run_all_analyses(employees)

# Package for LLM (anonymized)
package = package_for_llm(employees, analyses)

# Agent sees complete data, not filtered insights
result = llm_service.generate_calibration_analysis(package)
```

#### Step 3: Update Service Calls

**Old:**
```python
from ninebox.services.calibration_summary_service import CalibrationSummaryService
from ninebox.services.llm_service import LLMService

summary_service = CalibrationSummaryService()
llm_service = LLMService()

# Two separate calls
summary = summary_service.calculate_summary(employees)
llm_summary = llm_service.generate_summary(...)  # Deprecated method
```

**New:**
```python
from ninebox.services.calibration_summary_service import CalibrationSummaryService

summary_service = CalibrationSummaryService()

# Single call with use_agent flag
summary = summary_service.calculate_summary(employees, use_agent=True)

# Summary and insights both in response
print(summary["summary"])  # AI-generated summary
print(summary["insights"])  # AI-generated insights
```

### For Frontend Developers

#### Step 1: Replace useLLMSummary Hook

**Old:**
```typescript
import { useCalibrationSummary } from '../hooks/useCalibrationSummary';
import { useLLMSummary } from '../hooks/useLLMSummary';

function CalibrationPage() {
  // Two hooks needed
  const { data, selectedInsights, getSelectedIds } = useCalibrationSummary();
  const { data: llmData, generate } = useLLMSummary();

  const handleGenerate = () => {
    generate(getSelectedIds());
  };

  return (
    <div>
      <InsightsList insights={data?.insights} selected={selectedInsights} />
      <button onClick={handleGenerate}>Generate AI Summary</button>
      {llmData && <Summary data={llmData} />}
    </div>
  );
}
```

**New:**
```typescript
import { useCalibrationSummary } from '../hooks/useCalibrationSummary';

function CalibrationPage() {
  // Single hook with agent enabled
  const { data, isLoading, summary } = useCalibrationSummary({ useAgent: true });

  return (
    <div>
      <InsightsList insights={data?.insights} />
      {/* No button needed - summary auto-generated */}
      {summary && <Summary text={summary} />}
    </div>
  );
}
```

#### Step 2: Remove Insight Selection Logic (Optional)

**Note:** Selection state is still supported for backward compatibility, but not required.

**Old (required):**
```typescript
const {
  selectedInsights,
  toggleInsight,
  selectAll,
  deselectAll
} = useCalibrationSummary();

// User must select insights before generating summary
<SelectAllButton onClick={selectAll} />
<DeselectAllButton onClick={deselectAll} />
{insights.map(insight => (
  <Checkbox
    checked={selectedInsights[insight.id]}
    onChange={() => toggleInsight(insight.id)}
  />
))}
```

**New (optional):**
```typescript
const { data, summary } = useCalibrationSummary({ useAgent: true });

// Summary generated automatically for ALL insights
// Selection state still available but not required for summary generation
{insights.map(insight => (
  <InsightCard key={insight.id} insight={insight} />
))}
```

#### Step 3: Handle Clustered Insights

**New Feature:** Insights can now be grouped by cluster for better UX.

```typescript
function InsightsList({ insights }: { insights: Insight[] }) {
  // Group by cluster
  const clusters = new Map<string, Insight[]>();
  const unclustered: Insight[] = [];

  insights.forEach(insight => {
    if (insight.cluster_id) {
      if (!clusters.has(insight.cluster_id)) {
        clusters.set(insight.cluster_id, []);
      }
      clusters.get(insight.cluster_id)!.push(insight);
    } else {
      unclustered.push(insight);
    }
  });

  return (
    <div>
      {/* Render clusters */}
      {Array.from(clusters.entries()).map(([id, clusterInsights]) => (
        <ClusterCard key={id} title={clusterInsights[0].cluster_title}>
          {clusterInsights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </ClusterCard>
      ))}

      {/* Render unclustered insights */}
      {unclustered.map(insight => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
```

### For Infrastructure/DevOps

#### Step 1: Set Environment Variables

**New Required Variable:**
```bash
# .env (backend)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

**Optional Override:**
```bash
# .env (backend)
LLM_MODEL=claude-sonnet-4-5-20250929  # Default model
```

#### Step 2: Install Dependencies

```bash
cd backend
pip install anthropic
```

#### Step 3: Verify Configuration

```bash
# Run integration test
cd backend
python test_llm_agent_architecture.py

# Expected output:
# [OK] LLM service is available
# [OK] Using model: claude-sonnet-4-5-20250929
# [OK] Analysis generated successfully!
```

---

## Compatibility Matrix

| Component | Old Approach | New Approach | Compatibility |
|-----------|--------------|--------------|---------------|
| GET `/calibration-summary` | ✅ Works | ✅ Works (use_agent=false for old behavior) | Backward compatible |
| GET `/calibration-summary?use_agent=true` | ❌ Not available | ✅ Works | New feature |
| POST `/generate-summary` | ✅ Works | ⚠️  Deprecated (still works) | Deprecated |
| `useLLMSummary` hook | ✅ Works | ⚠️  Deprecated (still works) | Deprecated |
| `useCalibrationSummary` hook | ✅ Works | ✅ Works (with summary field) | Enhanced |
| Insight selection UI | ✅ Required | ⏩ Optional | Backward compatible |
| Clustering support | ❌ Not available | ✅ Available | New feature |

---

## Deprecation Warnings

### Backend Deprecation

**Deprecated Method:** `LLMService.generate_summary()`

**Deprecation Warning:**
```python
warnings.warn(
    "generate_summary() is deprecated. Use generate_calibration_analysis() instead.",
    DeprecationWarning,
    stacklevel=2
)
```

**Removal Timeline:**
- **Now:** Deprecation warning logged
- **April 1, 2026:** Method removed from codebase

### Frontend Deprecation

**Deprecated Hook:** `useLLMSummary`

**No formal deprecation warning** (TypeScript doesn't have runtime warnings), but documented as deprecated.

**Removal Timeline:**
- **Now:** Documented as deprecated
- **April 1, 2026:** Hook removed from codebase

### API Endpoint Deprecation

**Deprecated Endpoint:** `POST /calibration-summary/generate-summary`

**Deprecation Indicator:** OpenAPI schema marked with `deprecated: true`

**Logs:** Backend logs deprecation warning on every call:
```
WARNING: DEPRECATED ENDPOINT CALLED: POST /generate-summary.
This endpoint is deprecated. Use GET /calibration-summary with use_agent=true instead.
```

**Removal Timeline:**
- **Now:** Endpoint functional but logs deprecation
- **April 1, 2026:** Endpoint returns 410 Gone status
- **May 1, 2026:** Endpoint removed entirely

---

## Testing Your Migration

### Backend Tests

**Test old approach still works:**
```bash
cd backend
pytest tests/unit/services/test_llm_service.py::test_generate_summary_deprecated -v
```

**Test new approach:**
```bash
cd backend
pytest tests/unit/services/test_llm_service.py::test_generate_calibration_analysis -v
```

**Test integration:**
```bash
cd backend
python test_llm_agent_architecture.py
```

### Frontend Tests

**Test hook migration:**
```bash
cd frontend
npm test -- useCalibrationSummary.test.ts
```

**Test component rendering:**
```bash
cd frontend
npm test -- CalibrationSummarySection.test.tsx
```

---

## Rollback Plan

If you need to rollback to the old approach:

### Backend Rollback

**Option 1:** Use `use_agent=false` flag
```python
summary = summary_service.calculate_summary(employees, use_agent=False)
# Uses legacy insight generation (no AI summary)
```

**Option 2:** Continue using deprecated POST endpoint (temporary)
```python
# Still works until April 1, 2026
llm_summary = await apiClient.generateLLMSummary({
  selected_insight_ids: selectedIds
});
```

### Frontend Rollback

**Option 1:** Use `useAgent: false` option
```typescript
const { data } = useCalibrationSummary({ useAgent: false });
// No AI summary, legacy insights
```

**Option 2:** Continue using `useLLMSummary` hook (temporary)
```typescript
import { useLLMSummary } from '../hooks/useLLMSummary';
// Still works until removed from codebase
```

---

## FAQ

### Q: Do I need to change my code immediately?

**A:** No. The old approach is still functional and will remain so until April 1, 2026. However, we recommend migrating to benefit from improved insights and clustering.

### Q: Will my existing insights change?

**A:** Yes. Insights are now AI-generated, so wording and prioritization may differ. The new insights focus on root causes and cluster related issues.

### Q: What if I don't have an ANTHROPIC_API_KEY?

**A:** The feature gracefully degrades. Use `use_agent=false` to get legacy insights without AI summary. All core functionality (data overview, time allocation) works without the API key.

### Q: Can I still manually select insights?

**A:** Yes. The selection state is still maintained in `useCalibrationSummary` for backward compatibility. However, it no longer affects summary generation (summary is auto-generated for all insights).

### Q: How do I update my UI to show clusters?

**A:** See "Step 3: Handle Clustered Insights" in the Frontend Migration section above. Group insights by `cluster_id` for better UX.

### Q: What's the performance impact?

**A:** The new approach makes **one LLM API call** instead of **potentially multiple user-triggered calls**. Initial load is slightly slower (3-10 seconds for LLM), but eliminates the separate "Generate Summary" button click.

### Q: Can I customize the system prompt?

**A:** Yes! See `DEVELOPER_GUIDE.md` for instructions on modifying `backend/config/calibration_agent_prompt.txt`.

---

## Support

For migration assistance:
1. Review this guide and `DEVELOPER_GUIDE.md`
2. Run `test_llm_agent_architecture.py` to verify your setup
3. Check backend logs for deprecation warnings
4. Contact the 9Boxer development team with specific questions
