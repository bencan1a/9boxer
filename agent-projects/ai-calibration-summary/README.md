# AI-Powered Calibration Summary

## Overview

The AI-Powered Calibration Summary feature provides HR leaders and calibration managers with intelligent, data-driven meeting preparation tools. Using Claude (Anthropic's AI), it analyzes employee rating distributions to surface patterns, detect anomalies, and generate actionable insights with professional summaries.

**Key Capabilities:**
- Statistical analysis of rating distributions across locations, functions, levels, and tenure
- Anomaly detection with significance testing (chi-square tests, z-scores)
- AI-generated executive summaries with clustered insights
- Time allocation recommendations based on employee distributions
- Privacy-first design with strict data anonymization

## Architecture: Agent-First Approach

This feature uses an **agent-first architecture** where the AI agent is the primary insight generator, not a post-processing tool.

### Data Flow

```
Employee Data
    ↓
┌─────────────────────────────────────┐
│  Analysis Registry                  │
│  - Runs all statistical analyses    │
│  - Location, function, level, tenure│
│  - Distribution calculations        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Data Packaging Service             │
│  - Packages analyses for LLM        │
│  - Anonymizes all PII               │
│  - Formats in LLM-friendly JSON     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  LLM Agent (Claude Sonnet 4.5)      │
│  - Receives complete analysis data  │
│  - Applies system prompt expertise  │
│  - Generates insights + clusters    │
│  - Produces executive summary       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Frontend Display                   │
│  - Shows AI-generated insights      │
│  - Displays clustered issues        │
│  - Presents executive summary       │
└─────────────────────────────────────┘
```

### Key Components

#### 1. Analysis Registry (`backend/src/ninebox/services/analysis_registry.py`)

**Purpose:** Centralized registry of all statistical analyses.

**Pattern:** One-line registration makes adding new analyses trivial:

```python
ANALYSIS_REGISTRY: list[tuple[str, AnalysisFunction]] = [
    ("location", calculate_location_analysis),
    ("function", calculate_function_analysis),
    ("level", calculate_level_analysis),
    ("tenure", calculate_tenure_analysis),
    ("per_level_distribution", calculate_per_level_distribution),
]
```

**Dual Use:** Same analyses power both Intelligence tab visualizations AND LLM agent data.

**Error Handling:** If an analysis fails, returns error status instead of crashing entire pipeline.

#### 2. Data Packaging Service (`backend/src/ninebox/services/data_packaging_service.py`)

**Purpose:** Packages calibration data for different consumers.

**Two Packaging Modes:**
- `package_for_ui()` - Includes all fields including PII (for frontend visualization)
- `package_for_llm()` - Strict anonymization, no PII (safe for external API)

**Anonymization Rules:**
```python
# NEVER sent to LLM:
- Employee names
- Employee IDs
- Business titles
- Job titles
- Manager names/IDs (uses "Manager_1", "Employee_1" instead)

# Safe to send (aggregates only):
- Statistical measures (z-scores, p-values)
- Counts and percentages
- Grid position distributions
- Tenure categories (not hire dates)
```

**Output Structure:**
```json
{
  "employees": [
    {
      "id": "Employee_1",
      "level": "MT5",
      "function": "Engineering",
      "location": "USA",
      "tenure_years": 3.5,
      "performance_rating": 3,
      "grid_position": 9,
      "is_new_hire": false
    }
  ],
  "organization": {
    "managers": [
      {
        "id": "Manager_MGR001",
        "level": "MT6",
        "direct_report_count": 12,
        "total_org_size": 47
      }
    ],
    "total_employees": 47,
    "total_managers": 5
  },
  "analyses": {
    "location": {
      "status": "red",
      "p_value": 0.001,
      "deviations": [...]
    },
    "function": {...},
    "level": {...}
  },
  "overview": {
    "total_employees": 47,
    "stars_percentage": 14.9,
    "center_box_percentage": 51.1
  }
}
```

#### 3. LLM Service (`backend/src/ninebox/services/llm_service.py`)

**Purpose:** Orchestrates communication with Claude API.

**Key Method:** `generate_calibration_analysis(package)`

**System Prompt Location:** `backend/config/calibration_agent_prompt.txt`

**Prompt Design Principles:**
- HR consultant persona with talent management expertise
- Focus on root causes, not just symptoms
- Provide actionable guidance for calibration leaders
- Cluster related issues for holistic understanding
- Support claims with statistical evidence

**Agent Output Schema:**
```json
{
  "summary": "2-3 paragraph executive summary...",
  "issues": [
    {
      "type": "anomaly",
      "category": "level",
      "priority": "high",
      "title": "MT3 level driving center box inflation",
      "description": "MT3 employees account for 65% of center box...",
      "affected_count": 42,
      "source_data": {
        "z_score": 3.8,
        "p_value": 0.0008,
        "observed_pct": 64.3,
        "expected_pct": 35.0
      },
      "cluster_id": "mt3-focus",
      "cluster_title": "MT3 Level Requires Deep Review"
    }
  ]
}
```

**Issue Types:**
- `anomaly` - Statistical deviation detected
- `focus_area` - Distribution pattern requiring attention
- `recommendation` - Process or approach suggestion
- `time_allocation` - Time management recommendation

**Priority Levels:**
- `high` - |z-score| > 3.0, critical fairness concerns, major distribution problems
- `medium` - |z-score| > 2.0, moderate anomalies, areas needing discussion
- `low` - General recommendations, process suggestions, attribution

**Clustering:** Related issues share `cluster_id` and `cluster_title` to help facilitators see the big picture.

#### 4. Calibration Summary Service (`backend/src/ninebox/services/calibration_summary_service.py`)

**Purpose:** Main orchestration layer for summary generation.

**Key Method:** `calculate_summary(employees, use_agent=True)`

**Agent-First Logic:**
```python
if use_agent and llm_service.is_available():
    # Run all analyses via registry
    analyses = run_all_analyses(employees)

    # Package data for LLM (anonymized)
    package = package_for_llm(employees, analyses, org_data)

    # Let agent generate insights + summary
    agent_result = llm_service.generate_calibration_analysis(package)

    # Transform agent insights to our schema
    insights = transform_agent_insights(agent_result["issues"])
    summary_text = agent_result["summary"]
else:
    # Fallback: legacy insight generation
    insights = generate_insights_legacy(...)
    summary_text = None
```

**Graceful Fallback:** If LLM unavailable, falls back to legacy logic-based insight generation (no summary).

#### 5. Frontend Integration

**Hook:** `useCalibrationSummary({ useAgent: true })`

**Location:** `frontend/src/hooks/useCalibrationSummary.ts`

**Capabilities:**
- Auto-fetch on mount
- Auto-refetch when employee data changes (real-time updates)
- Returns both insights AND summary in single call
- Selection state management (deprecated for agent-first)

**Response:**
```typescript
{
  data_overview: {
    total_employees: 47,
    stars_percentage: 14.9,
    center_box_percentage: 51.1,
    ...
  },
  time_allocation: {
    estimated_duration_minutes: 120,
    breakdown_by_level: [...],
    suggested_sequence: ["IC", "Manager", "Director", "Intelligence Sweep"]
  },
  insights: [
    {
      id: "anomaly-level-MT3-a1b2c3d4",
      type: "anomaly",
      priority: "high",
      title: "MT3 level driving center box inflation",
      cluster_id: "mt3-focus",
      cluster_title: "MT3 Level Requires Deep Review",
      ...
    }
  ],
  summary: "Your calibration session has a clear root cause..." // AI-generated
}
```

## System Prompt

The system prompt is the "brain" of the AI calibration summary. It defines the agent's expertise, analysis approach, and output format.

**Location:** `backend/config/calibration_agent_prompt.txt`

**Key Sections:**

1. **Persona & Expertise** - HR consultant and calibration meeting facilitator
2. **Analysis Focus** - Root causes, driving factors, actionable guidance
3. **Clustering Guidelines** - When to group related issues
4. **Priority Guidelines** - How to prioritize high/medium/low
5. **Output Format** - Exact JSON schema with examples
6. **Issue Types & Categories** - Taxonomy for classification
7. **Example Outputs** - Two detailed examples showing clustering and independent issues
8. **Constraints & Rules** - No speculation, statistical evidence required, JSON only

**Modifying the Prompt:**

See `DEVELOPER_GUIDE.md` for detailed instructions on customizing the system prompt for your organization's needs.

## Privacy & Security

### Data Anonymization

**Strict Policy:** No PII is ever sent to external LLM APIs.

**Implementation:** `package_for_llm()` function enforces anonymization:
- Employee IDs → "Employee_1", "Employee_2", etc.
- Manager IDs → "Manager_MGR001", "Manager_MGR002", etc.
- Names, titles, departments → Excluded entirely
- Only aggregate statistics and anonymized identifiers sent

**Verification:** See `backend/test_llm_agent_architecture.py` for anonymization tests.

### Prompt Injection Prevention

While the agent-first architecture uses packaged data (not user input), defense-in-depth is applied:

```python
def _sanitize_for_prompt(text: str) -> str:
    """Remove prompt manipulation patterns."""
    sanitized = text.replace("Ignore previous instructions", "")
    sanitized = sanitized.replace("System:", "")
    sanitized = sanitized.replace("Human:", "")
    sanitized = sanitized.replace("Assistant:", "")
    sanitized = sanitized.replace("```", "")
    return sanitized[:500]  # Truncate to 500 chars
```

### API Key Management

**Configuration:**
```bash
# Backend .env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx  # Required for LLM features
LLM_MODEL=claude-sonnet-4-5-20250929          # Optional (default: Sonnet 4.5)
```

**Graceful Degradation:**
- If `ANTHROPIC_API_KEY` not set, feature shows info alert but remains functional
- Legacy insight generation works without API key
- Summary field is optional in response schema

## API Endpoints

### GET /calibration-summary

**Purpose:** Get calibration summary with optional AI-powered analysis

**Query Parameters:**
- `use_agent` (boolean, default: `true`) - Use AI agent for insights + summary

**Response:**
```typescript
{
  data_overview: DataOverview,
  time_allocation: TimeAllocation,
  insights: Insight[],
  summary?: string  // Only when use_agent=true and LLM succeeds
}
```

**Migration from Old API:**
- **Old:** Call GET `/calibration-summary`, then POST `/generate-summary` with selected insights
- **New:** Just call GET `/calibration-summary` (use_agent=true is default)
- **Result:** Single call returns insights AND summary together

### GET /calibration-summary/llm-availability

**Purpose:** Check if LLM service is available

**Response:**
```typescript
{
  available: boolean,
  reason?: string  // If unavailable: "ANTHROPIC_API_KEY environment variable not set"
}
```

### POST /calibration-summary/generate-summary (DEPRECATED)

**Status:** Deprecated in favor of agent-first architecture.

**Migration:** Use GET `/calibration-summary` with `use_agent=true` instead.

**Why Deprecated:** Two-step approach (fetch insights → select → generate summary) replaced by single agent-generated response.

## Testing

### Backend Tests

**Analysis Registry:** `backend/tests/unit/services/test_analysis_registry.py`
- Registry runs all analyses
- Failed analyses return error status (don't crash pipeline)
- Analysis function lookup by name

**Data Packaging:** `backend/tests/unit/services/test_data_packaging_service.py`
- `package_for_ui()` includes PII fields
- `package_for_llm()` excludes all PII
- Anonymized IDs follow "Employee_N" pattern
- Org hierarchy anonymization

**LLM Service:** `backend/tests/unit/services/test_llm_service.py`
- `generate_calibration_analysis()` calls Claude API
- Response parsing handles JSON in markdown
- Availability checking works correctly
- Deprecation warnings on old methods

**Integration Test:** `backend/test_llm_agent_architecture.py`
- End-to-end verification of agent-first flow
- System prompt loading
- Data packaging and anonymization
- Agent analysis generation

### Frontend Tests

**Hook Tests:** `frontend/src/hooks/__tests__/useCalibrationSummary.test.ts`
- Fetches data on mount
- Auto-refetch when employees change
- Returns summary field when agent enabled
- Selection state management (for backward compatibility)

**Component Tests:** Visual tests for Intelligence tab display

## Performance Considerations

**Backend:**
- Analysis registry runs all analyses in parallel-safe manner
- Failed analyses don't block other analyses
- Data packaging is O(n) in employee count
- LLM API call is the slowest operation (~3-10 seconds)

**Frontend:**
- Single API call fetches all data (no N+1 queries)
- Real-time updates trigger refetch automatically
- Loading states prevent UI jank during LLM generation

**Caching Opportunities (Future):**
- Cache LLM responses for identical employee datasets
- Memoize analysis results within session
- Server-side caching with invalidation on data change

## Troubleshooting

### LLM Unavailable

**Symptom:** Info alert says "AI Summary requires ANTHROPIC_API_KEY to be configured"

**Solutions:**
1. Set `ANTHROPIC_API_KEY` environment variable in backend
2. Verify `anthropic` package is installed: `pip install anthropic`
3. Check backend logs for initialization errors
4. Verify API key is valid (test with `curl`)

### Agent Returns No Issues

**Symptom:** Summary generated but `issues` array is empty

**Solutions:**
1. Check if employee dataset is too small (< 10 employees)
2. Verify analyses are running (check `package["analyses"]` in logs)
3. Review system prompt - may need to lower significance thresholds
4. Check Claude API response for errors in backend logs

### Insights Not Clustering

**Symptom:** Multiple related issues have different `cluster_id` values

**Solutions:**
1. Review system prompt's clustering examples
2. Check if issues are genuinely unrelated (clustering is optional)
3. Verify agent has sufficient context (all analyses included in package)
4. Consider adjusting prompt to emphasize clustering importance

### Performance Issues

**Symptom:** Calibration summary takes >15 seconds to load

**Solutions:**
1. Check LLM API latency (should be 3-10 seconds)
2. Profile analysis functions (should be <1 second total)
3. Verify network connectivity to Anthropic API
4. Consider caching responses for repeated requests

### JSON Parsing Errors

**Symptom:** 500 error: "Failed to parse response JSON"

**Solutions:**
1. Check backend logs for malformed JSON from Claude
2. Verify system prompt output format examples are correct
3. Test with smaller employee dataset
4. Report to Anthropic if Claude consistently returns invalid JSON

## Future Enhancements

### Short-term (Next Quarter)
- **Insight History Tracking:** Mark insights as "Addressed" or "Deferred" during meetings
- **Custom Clustering:** Allow users to manually adjust cluster assignments
- **Export Summary:** Download AI summary as PDF or Word document

### Medium-term (6 months)
- **Multi-Session Comparison:** Compare current insights to previous quarter
- **Trend Analysis:** "Center box increased from 45% to 51%"
- **Custom Prompts:** Allow organizations to customize system prompt via UI

### Long-term (1 year)
- **Response Streaming:** Progressive display of AI summary as it's generated
- **Multi-LLM Support:** Support GPT-4, Gemini, etc. as alternative models
- **Offline Mode:** Local LLM inference for air-gapped environments

## Related Documentation

- **Developer Guide:** `DEVELOPER_GUIDE.md` - How to add analyses, modify prompts, test
- **Migration Guide:** `MIGRATION.md` - Changes from button-triggered to agent-first
- **System Prompt:** `backend/config/calibration_agent_prompt.txt` - Agent expertise definition
- **Implementation Summary:** `implementation-summary.md` - Technical details (legacy)
- **Architecture Plan:** `plan.md` - Original design decisions (legacy)

## Contributors

- Architecture: Claude Code
- Implementation: Claude Code
- Testing: Claude Code
- Documentation: Claude Code

## License

Proprietary - 9Boxer Internal Use Only
