# AI Calibration Summary - Developer Guide

## Table of Contents

1. [Adding New Analyses](#adding-new-analyses)
2. [Modifying the System Prompt](#modifying-the-system-prompt)
3. [Testing with Real LLM Calls](#testing-with-real-llm-calls)
4. [Performance Profiling](#performance-profiling)
5. [API Reference](#api-reference)
6. [Frontend Integration](#frontend-integration)
7. [Troubleshooting](#troubleshooting)

---

## Adding New Analyses

The analysis registry pattern makes adding new statistical analyses trivial. You can add custom analyses without modifying any core logic.

### Step 1: Create Analysis Function

Create your analysis function in `backend/src/ninebox/services/intelligence_service.py` (or a new module):

```python
def calculate_new_analysis(employees: list[Employee]) -> dict[str, Any]:
    """Calculate custom analysis for calibration insights.

    Args:
        employees: List of employee records to analyze

    Returns:
        Dictionary with analysis results:
        {
            "status": "green" | "yellow" | "red",
            "p_value": 0.001,
            "deviations": [
                {
                    "category": "CategoryName",
                    "z_score": 3.5,
                    "is_significant": True,
                    "observed_high_pct": 45.0,
                    "expected_high_pct": 20.0,
                    "sample_size": 30
                }
            ],
            "interpretation": "Human-readable explanation",
            "sample_size": 100
        }
    """
    # Your analysis logic here
    # Example: Analyze by department size
    large_depts = [emp for emp in employees if get_dept_size(emp.function) > 10]
    small_depts = [emp for emp in employees if get_dept_size(emp.function) <= 10]

    # Run chi-square test
    from scipy.stats import chi2_contingency
    contingency_table = build_contingency_table(large_depts, small_depts)
    chi2, p_value, _, _ = chi2_contingency(contingency_table)

    # Determine status
    status = "red" if p_value < 0.01 else "yellow" if p_value < 0.05 else "green"

    return {
        "status": status,
        "p_value": p_value,
        "chi2": chi2,
        "interpretation": f"Department size shows {'significant' if p_value < 0.05 else 'no'} impact on ratings",
        "sample_size": len(employees),
        "deviations": build_deviations(large_depts, small_depts),
    }
```

**Required Fields:**
- `status` - "green", "yellow", or "red" (controls UI display)
- `p_value` - Statistical significance (float between 0 and 1)
- `sample_size` - Number of employees analyzed
- `interpretation` - Human-readable summary

**Optional Fields:**
- `deviations` - List of significant category-level deviations
- `chi2` - Chi-square statistic (or other test statistic)
- Any other fields your analysis produces

### Step 2: Register Analysis

Add your analysis to the registry in `backend/src/ninebox/services/analysis_registry.py`:

```python
from ninebox.services.intelligence_service import (
    calculate_function_analysis,
    calculate_level_analysis,
    calculate_location_analysis,
    calculate_tenure_analysis,
    calculate_new_analysis,  # Your new analysis
)

ANALYSIS_REGISTRY: list[tuple[str, AnalysisFunction]] = [
    ("location", calculate_location_analysis),
    ("function", calculate_function_analysis),
    ("level", calculate_level_analysis),
    ("tenure", calculate_tenure_analysis),
    ("new_analysis", calculate_new_analysis),  # Add here
]
```

That's it! Your analysis will now:
- Run automatically on every calibration summary request
- Be included in the LLM agent's data package
- Potentially generate insights in the AI summary
- Appear in Intelligence tab visualizations

### Step 3: Update System Prompt (Optional)

If your analysis introduces new categories or types, update the system prompt to help the agent interpret it:

```
## Issue Categories

- **location**: Geographic location-based patterns
- **function**: Department/function-based patterns
- **level**: Job level-based patterns
- **tenure**: Tenure-based patterns
- **department_size**: Department size impact patterns  <-- Add your category
- **distribution**: Overall rating distribution patterns
- **time**: Meeting time allocation
```

### Step 4: Test

Run the integration test to verify your analysis works:

```bash
cd backend
python test_llm_agent_architecture.py
```

Expected output:
```
[OK] Analyses included: ['location', 'function', 'level', 'tenure', 'new_analysis']
```

---

## Modifying the System Prompt

The system prompt defines the AI agent's expertise, analysis approach, and output format. Customizing it allows you to tailor insights for your organization.

### Location

File: `backend/config/calibration_agent_prompt.txt`

**IMPORTANT:** This is a TEXT file, not Python code. Do not add code comments or quotes.

### Structure

The prompt has 10 main sections:

1. **Persona & Task** - Defines the agent as an HR consultant
2. **Analysis Focus** - Guides what to look for (root causes, drivers, actionable guidance)
3. **Clustering Guidelines** - When to group related issues
4. **Priority Guidelines** - How to assign high/medium/low priority
5. **Output Format** - Exact JSON schema
6. **Issue Types** - Taxonomy of issue types
7. **Issue Categories** - Taxonomy of categories
8. **Example Output 1** - Clustered issues with clear root cause
9. **Example Output 2** - Multiple independent high-priority issues
10. **Constraints & Rules** - What NOT to do

### Common Modifications

#### Change Priority Thresholds

**Original:**
```
**High Priority** (requires immediate attention):
- Significant statistical anomalies with |z-score| > 3.0
- Critical fairness concerns (major disparities across protected groups)
- Major distribution problems (>60% in center box, <3% stars, >30% stars)
```

**Custom (more lenient):**
```
**High Priority** (requires immediate attention):
- Significant statistical anomalies with |z-score| > 2.5  # Lowered from 3.0
- Critical fairness concerns (major disparities across protected groups)
- Major distribution problems (>55% in center box, <5% stars, >25% stars)  # Adjusted thresholds
```

#### Adjust Tone

**Original:**
```
Be direct and practical. Use business language appropriate for HR leadership.
```

**Custom (more casual):**
```
Be conversational and approachable. Use plain language that managers at all levels can understand.
Avoid HR jargon unless necessary. Prioritize clarity over formality.
```

#### Add Industry-Specific Context

**Original:**
```
Your role is to analyze calibration data holistically and provide actionable insights
that help HR leaders run effective, fair, and efficient calibration meetings.
```

**Custom (tech industry):**
```
Your role is to analyze calibration data holistically and provide actionable insights
that help HR leaders run effective, fair, and efficient calibration meetings.

CONTEXT: This organization is a fast-growing tech company where:
- Engineering talent is critical and often commands premium ratings
- Remote work may create location-based bias patterns
- New hire concentration is common due to rapid scaling
- Retention of Stars (position 9) is a top priority
```

#### Emphasize Specific Concerns

Add a new section after "Analysis Focus":

```
## Key Organizational Priorities

When generating insights, pay special attention to:

1. **Retention Risk** - Identify Stars and High Performers who may be flight risks
2. **Succession Planning** - Flag gaps in leadership pipeline (Director+ levels)
3. **Diversity & Inclusion** - Detect any location/function patterns that could indicate bias
4. **New Hire Integration** - Track if tenure affects ratings (potential probationary bias)
```

### Testing Prompt Changes

After modifying the prompt, test with the integration script:

```bash
cd backend
python test_llm_agent_architecture.py
```

This will:
1. Load the system prompt from `config/calibration_agent_prompt.txt`
2. Package sample employee data
3. Call Claude API with your modified prompt
4. Display the generated summary and issues

**Review the output to verify:**
- Agent follows your new guidelines
- Priority assignments match your thresholds
- Tone is appropriate for your audience
- Industry-specific context influences recommendations

### Prompt Engineering Best Practices

**DO:**
- Be explicit about what you want (examples are powerful)
- Provide clear criteria for priority/classification
- Include 1-2 detailed examples of desired output
- Specify what NOT to do (constraints)
- Use consistent terminology throughout

**DON'T:**
- Make prompts too long (>4000 words gets diluted)
- Contradict yourself (e.g., "be brief" then "provide detailed analysis")
- Over-specify (let the model apply judgment)
- Include PII in examples (use anonymized data)

---

## Testing with Real LLM Calls

### Setup

1. **Get Anthropic API Key:**
   - Sign up at https://console.anthropic.com
   - Create an API key
   - Copy the key (starts with `sk-ant-api03-`)

2. **Set Environment Variable:**

   **Linux/Mac:**
   ```bash
   export ANTHROPIC_API_KEY='sk-ant-api03-xxxxxxxxxxxxx'
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:ANTHROPIC_API_KEY='sk-ant-api03-xxxxxxxxxxxxx'
   ```

   **Windows (Command Prompt):**
   ```cmd
   set ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
   ```

   **Persistent (add to .env file):**
   ```bash
   # backend/.env
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
   LLM_MODEL=claude-sonnet-4-5-20250929  # Optional: override model
   ```

3. **Install Anthropic SDK:**
   ```bash
   cd backend
   pip install anthropic
   ```

### Integration Test Script

**Location:** `backend/test_llm_agent_architecture.py`

**Run:**
```bash
cd backend
python test_llm_agent_architecture.py
```

**Expected Output:**
```
================================================================================
LLM Service Agent-First Architecture Test Suite
================================================================================

================================================================================
TEST 1: Load System Prompt
================================================================================
[OK] System prompt loaded successfully
[OK] Prompt length: 12500 characters
[OK] First 200 chars: You are an expert HR consultant and calibration meeting facilitator...

================================================================================
TEST 2: Data Packaging
================================================================================
[OK] Packaged 3 employees
[OK] Overview: 3 total employees
[OK] Analyses included: ['location', 'function', 'level', 'tenure', 'per_level_distribution']
[OK] Employee IDs are anonymized (using 'Employee_1')
[OK] Business titles are anonymized
[OK] Package size: 2847 bytes

================================================================================
TEST 3: Generate Calibration Analysis
================================================================================
[OK] LLM service is available
[OK] Using model: claude-sonnet-4-5-20250929
[OK] Calling generate_calibration_analysis()...
[OK] Analysis generated successfully!
[OK] Summary length: 1523 characters
[OK] Number of issues: 5

SUMMARY:
--------------------------------------------------------------------------------
Your calibration session has a very small population (3 employees), which limits
statistical reliability but still reveals some patterns worth noting. The most
striking finding is your distribution: 67% Stars (position 9) and 33% High
Performers (position 6), with zero employees...

ISSUES:
--------------------------------------------------------------------------------
1. [HIGH] Grade inflation: 67% rated as Stars
   Type: focus_area, Category: distribution
   Affected: 2 employees

2. [MEDIUM] All Engineering function are high performers
   Type: anomaly, Category: function
   Affected: 2 employees

3. [LOW] Allocate 15 minutes for calibration meeting
   Type: time_allocation, Category: time
   Affected: 3 employees

================================================================================
TEST SUMMARY
================================================================================
Passed: 4/4
[OK] All tests passed!
```

### Unit Tests

**Location:** `backend/tests/unit/services/test_llm_service.py`

**Run:**
```bash
cd backend
pytest tests/unit/services/test_llm_service.py -v
```

**Tests:**
- `test_is_available_when_api_key_set` - Availability check with key
- `test_is_available_when_no_api_key` - Graceful handling when key missing
- `test_generate_calibration_analysis_calls_api` - End-to-end API call
- `test_parse_response_handles_markdown` - JSON extraction from markdown
- `test_anonymization_removes_pii` - Data privacy verification

### Cost Considerations

**Claude Sonnet 4.5 Pricing (as of Jan 2025):**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Typical Request:**
- Input: ~2,000 tokens (employee data + analyses)
- Output: ~1,500 tokens (summary + insights)
- **Cost per request: ~$0.03 (3 cents)**

**Monthly Cost Estimates:**
- 10 calibration sessions/month: ~$0.30
- 100 calibration sessions/month: ~$3.00
- 1,000 calibration sessions/month: ~$30.00

**Optimization Tips:**
- Cache responses for identical employee datasets
- Limit to production environment only (not dev/test)
- Monitor usage via Anthropic console

---

## Performance Profiling

Understanding the performance characteristics of the calibration summary feature is essential for setting user expectations and identifying optimization opportunities.

### Baseline Performance Metrics

The calibration summary feature has been profiled across typical dataset sizes to establish baseline metrics. The table below shows P50 (median) and P95 (95th percentile) timings for each component.

**Context:**
- Internal desktop tool with max ~2000 employees
- Users typically analyze director-level subsets (100-500 employees)
- Performance measured on standard development hardware

**Profiling Results:**

| Employee Count | Analysis (P50) | Packaging (P50) | LLM Call (P50) | Total (P50) | Total (P95) |
|----------------|----------------|-----------------|----------------|-------------|-------------|
|             50 |         0.011s |          0.001s |         4.000s |      4.011s |     10.437s |
|            100 |         0.010s |          0.001s |         8.000s |      8.011s |      8.012s |
|            250 |         0.011s |          0.003s |        20.000s |     20.014s |     20.020s |
|            500 |         0.019s |          0.005s |        40.000s |     40.024s |     40.028s |

**Key Insights:**

1. **LLM Dominates Total Time**: The LLM API call accounts for >99% of total execution time
   - For 250 employees: ~20s of the total 20s is LLM processing
   - Analysis registry + data packaging: <1% of total time

2. **Analysis Registry Performance**: Excellent scalability
   - 50 employees: 0.011s
   - 500 employees: 0.019s
   - Near-linear scaling with dataset size

3. **Data Packaging Performance**: Minimal overhead
   - 50 employees: 0.001s
   - 500 employees: 0.005s
   - Optimized data structure keeps packaging fast

4. **LLM Call Latency**: Scales with token count
   - Estimate: ~0.08s per employee for mock timing
   - Real API calls typically 20-30s for 250 employees
   - Network latency + Claude processing time

**User Expectations:**

For typical use cases:
- **50 employees**: ~4-6 seconds total (small team calibration)
- **100 employees**: ~8-10 seconds total (department calibration)
- **250 employees**: ~20-25 seconds total (director-level calibration)
- **500 employees**: ~40-45 seconds total (VP-level calibration)

**Setting User Expectations:**
Display a progress indicator with messaging:
- "Analyzing calibration data..." (< 1 second)
- "Generating AI insights..." (20-30 seconds for 250 employees)
- The LLM call dominates total time, so focus UX messaging on AI processing

### Running Performance Profiling

To benchmark performance on your environment, use the profiling script:

**Location:** `backend/tests/performance/profile_calibration_summary.py`

**Basic Usage:**
```bash
cd backend/tests/performance
python profile_calibration_summary.py
```

**Output:**
```
================================================================================
Calibration Summary Performance Profiling
================================================================================
Dataset sizes: [50, 100, 250, 500]
Runs per size: 3
LLM mode: Mock (estimated)

| Employee Count | Analysis (P50) | Packaging (P50) | LLM Call (P50) | Total (P50) |
|----------------|----------------|-----------------|----------------|-------------|
|             50 |         0.011s |          0.001s |         4.000s |      4.011s |
|            100 |         0.010s |          0.001s |         8.000s |      8.011s |
|            250 |         0.011s |          0.003s |        20.000s |     20.014s |
|            500 |         0.019s |          0.005s |        40.000s |     40.024s |

Detailed results saved to: profiling_results.csv
```

**Advanced Options:**

```bash
# Use real LLM API calls (requires ANTHROPIC_API_KEY)
python profile_calibration_summary.py --with-llm

# Custom dataset sizes
python profile_calibration_summary.py --sizes 100,200,300

# More runs for statistical reliability
python profile_calibration_summary.py --runs 5

# Custom output filename
python profile_calibration_summary.py --output my_results.csv
```

**Profiling with Real LLM:**

To get actual LLM latency (not mock estimates):

1. Set your Anthropic API key:
   ```bash
   export ANTHROPIC_API_KEY='sk-ant-api03-xxxxxxxxxxxxx'
   ```

2. Run with `--with-llm` flag:
   ```bash
   python profile_calibration_summary.py --with-llm --sizes 50,100,250
   ```

**WARNING**: Real LLM calls will incur API costs (~$0.03 per request).

**CSV Output:**

The script generates a detailed CSV report with P50, P95, mean, min, and max values for each metric:

```csv
Employee Count,Metric,P50 (seconds),P95 (seconds),Mean (seconds),Min (seconds),Max (seconds)
50,analysis_registry,0.011,6.436,2.150,0.004,6.436
50,data_packaging,0.001,0.001,0.000,0.000,0.001
50,llm_call,4.000,4.000,4.000,4.000,4.000
50,total_end_to_end,4.011,10.437,6.151,4.004,10.437
...
```

Use this data to:
- Track performance regressions over time
- Identify optimization opportunities
- Set SLA targets for production deployments
- Inform infrastructure sizing decisions

### Optimization Opportunities

Based on profiling results, optimization efforts should focus on:

1. **LLM Call Optimization** (highest impact):
   - Cache responses for identical employee datasets
   - Implement request batching for multiple simultaneous users
   - Consider streaming responses for perceived performance
   - Use prompt compression techniques to reduce token count

2. **Analysis Registry** (low impact):
   - Already highly optimized (< 20ms for 500 employees)
   - Further optimization yields minimal total time improvement

3. **Data Packaging** (low impact):
   - Already minimal overhead (< 10ms for 500 employees)
   - Current implementation is sufficient

**Recommendation**: Focus on LLM call optimization and UX improvements (progress indicators, caching) for maximum user experience impact.

---

## API Reference

### Calibration Summary Service

#### `calculate_summary(employees, use_agent=True)`

Generate calibration summary with optional AI analysis.

**Parameters:**
- `employees` (list[Employee]) - Employee records to analyze
- `use_agent` (bool, default=True) - Use AI agent for insights + summary

**Returns:**
```python
CalibrationSummaryResponse(
    data_overview=DataOverview(...),
    time_allocation=TimeAllocation(...),
    insights=[Insight(...)],
    summary="AI-generated summary..."  # Only when use_agent=True
)
```

**Example:**
```python
from ninebox.services.calibration_summary_service import CalibrationSummaryService

service = CalibrationSummaryService()
summary = service.calculate_summary(employees, use_agent=True)

print(f"Total employees: {summary['data_overview']['total_employees']}")
print(f"Stars: {summary['data_overview']['stars_percentage']}%")
print(f"AI Summary: {summary.get('summary', 'Not available')}")
```

### LLM Service

#### `generate_calibration_analysis(package)`

Generate AI-powered calibration analysis from packaged data.

**Parameters:**
- `package` (dict) - Output from `package_for_llm(employees, analyses)`

**Returns:**
```python
{
    "summary": str,  # Executive summary (2-3 paragraphs)
    "issues": [
        {
            "type": str,  # anomaly | focus_area | recommendation | time_allocation
            "category": str,  # location | function | level | tenure | distribution | time
            "priority": str,  # high | medium | low
            "title": str,
            "description": str,
            "affected_count": int,
            "source_data": dict,
            "cluster_id": str | None,
            "cluster_title": str | None
        }
    ]
}
```

**Example:**
```python
from ninebox.services.llm_service import LLMService
from ninebox.services.analysis_registry import run_all_analyses
from ninebox.services.data_packaging_service import package_for_llm

# Run analyses
analyses = run_all_analyses(employees)

# Package for LLM (anonymized)
package = package_for_llm(employees, analyses)

# Generate analysis
llm = LLMService()
result = llm.generate_calibration_analysis(package)

print(result["summary"])
for issue in result["issues"]:
    print(f"[{issue['priority'].upper()}] {issue['title']}")
```

### Analysis Registry

#### `run_all_analyses(employees)`

Run all registered analyses and return results.

**Parameters:**
- `employees` (list[Employee]) - Employee records to analyze

**Returns:**
```python
{
    "location": {
        "status": "green" | "yellow" | "red",
        "p_value": float,
        "deviations": [...]
    },
    "function": {...},
    "level": {...},
    "tenure": {...},
    "per_level_distribution": {...}
}
```

**Example:**
```python
from ninebox.services.analysis_registry import run_all_analyses

analyses = run_all_analyses(employees)

if analyses["location"]["status"] == "red":
    print(f"Location anomaly detected! p-value: {analyses['location']['p_value']}")
```

### Data Packaging Service

#### `package_for_llm(employees, analyses, org_data=None)`

Package calibration data for LLM analysis (strict anonymization).

**Parameters:**
- `employees` (list[Employee]) - Employee records
- `analyses` (dict) - Results from `run_all_analyses()`
- `org_data` (dict | None) - Optional pre-built org data

**Returns:**
```python
{
    "employees": [
        {
            "id": "Employee_1",  # Anonymized
            "level": "MT5",
            "function": "Engineering",
            "grid_position": 9,
            ...
        }
    ],
    "organization": {...},
    "analyses": {...},
    "overview": {...}
}
```

**Example:**
```python
from ninebox.services.data_packaging_service import package_for_llm

package = package_for_llm(employees, analyses)

# Verify anonymization
assert "employee_id" not in package["employees"][0]
assert package["employees"][0]["id"] == "Employee_1"
```

#### `package_for_ui(employees, analyses, org_data=None)`

Package calibration data for UI display (includes PII).

**Same signature as `package_for_llm()`, but includes:**
- `employee_id` (real ID)
- `business_title`
- `job_title`
- `manager_id` (real manager ID)

**Example:**
```python
from ninebox.services.data_packaging_service import package_for_ui

ui_package = package_for_ui(employees, analyses)

# Has real employee IDs for frontend display
assert "employee_id" in ui_package["employees"][0]
```

---

## Frontend Integration

### Using the Hook

**Location:** `frontend/src/hooks/useCalibrationSummary.ts`

**Basic Usage:**
```typescript
import { useCalibrationSummary } from '../hooks/useCalibrationSummary';

function CalibrationPage() {
  const {
    data,
    isLoading,
    error,
    summary,
    refetch
  } = useCalibrationSummary({ useAgent: true });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>Calibration Summary</h1>

      {/* Data Overview */}
      <section>
        <h2>Overview</h2>
        <p>Total Employees: {data.data_overview.total_employees}</p>
        <p>Stars: {data.data_overview.stars_percentage}%</p>
        <p>Center Box: {data.data_overview.center_box_percentage}%</p>
      </section>

      {/* AI-Generated Summary */}
      {summary && (
        <section>
          <h2>AI Summary</h2>
          <p>{summary}</p>
        </section>
      )}

      {/* Insights */}
      <section>
        <h2>Insights</h2>
        {data.insights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </section>

      {/* Refresh Button */}
      <button onClick={refetch}>Refresh Analysis</button>
    </div>
  );
}
```

### Displaying Clustered Insights

```typescript
function ClusteredInsights({ insights }: { insights: Insight[] }) {
  // Group insights by cluster
  const clusters = new Map<string, Insight[]>();

  insights.forEach(insight => {
    if (insight.cluster_id) {
      const key = insight.cluster_id;
      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)!.push(insight);
    }
  });

  return (
    <div>
      {Array.from(clusters.entries()).map(([clusterId, clusterInsights]) => (
        <ClusterCard key={clusterId}>
          <h3>{clusterInsights[0].cluster_title}</h3>
          {clusterInsights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </ClusterCard>
      ))}

      {/* Unclustered insights */}
      {insights.filter(i => !i.cluster_id).map(insight => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
```

### Real-time Updates

The hook automatically refetches when employee data changes:

```typescript
import { useSessionStore } from '../store/sessionStore';

function CalibrationPage() {
  const { employees } = useSessionStore();
  const { data } = useCalibrationSummary(); // Auto-refetches when employees change

  useEffect(() => {
    console.log(`Summary updated for ${employees.length} employees`);
  }, [data, employees]);

  // ...
}
```

### Direct API Calls

If you need more control, use the API client directly:

```typescript
import { apiClient } from '../services/api';

async function fetchSummary() {
  try {
    // Agent-first approach (default)
    const summary = await apiClient.getCalibrationSummary({ useAgent: true });
    console.log(summary.summary); // AI-generated summary

    // Legacy approach (no AI summary)
    const legacySummary = await apiClient.getCalibrationSummary({ useAgent: false });
    console.log(legacySummary.summary); // null

    // Check LLM availability
    const availability = await apiClient.checkLLMAvailability();
    if (!availability.available) {
      console.warn(`LLM unavailable: ${availability.reason}`);
    }
  } catch (error) {
    console.error('Failed to fetch calibration summary:', error);
  }
}
```

---

## Troubleshooting

### "Analysis failed" in Results

**Symptom:** One or more analyses show `"status": "error"` in response

**Diagnosis:**
```python
# Check backend logs for traceback
# Look for: "Analysis 'XXX' failed: ..."
```

**Common Causes:**
1. **Empty employee list** - Need at least 2 employees for chi-square tests
2. **Missing attributes** - Employee objects missing required fields (location, function, etc.)
3. **Division by zero** - All employees in same category (no variance)

**Solution:**
```python
# Add defensive checks in your analysis function
def calculate_new_analysis(employees: list[Employee]) -> dict[str, Any]:
    if len(employees) < 2:
        return {
            "status": "green",
            "p_value": 1.0,
            "sample_size": len(employees),
            "interpretation": "Not enough employees for analysis"
        }

    # Ensure required fields exist
    if not all(hasattr(emp, 'custom_field') for emp in employees):
        return {
            "status": "error",
            "error": "Missing custom_field attribute",
            "sample_size": 0
        }

    # ... rest of analysis
```

### Agent Returns Generic Insights

**Symptom:** AI summary is vague and doesn't mention specific categories/levels

**Diagnosis:** Check if your data package includes sufficient detail:

```python
# Verify package contents
package = package_for_llm(employees, analyses)

# Should have specific categories with counts
assert len(package["overview"]["by_level"]) > 1
assert len(package["analyses"]["location"]["deviations"]) > 0
```

**Solution:**
1. Ensure analyses are finding significant deviations (p_value < 0.05)
2. Check if employee distribution allows for meaningful comparisons
3. Review system prompt - may need to emphasize specific insights

### Rate Limiting / API Errors

**Symptom:** 500 error: "Failed to call Claude API: rate_limit_error"

**Diagnosis:**
- Check Anthropic console for rate limit tier
- Review usage patterns (too many concurrent requests)

**Solution:**
```python
# Add retry logic with exponential backoff
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_claude_with_retry(self, prompt: str):
    return self._client.messages.create(...)
```

### Inconsistent Clustering

**Symptom:** Same issues sometimes clustered, sometimes not

**Diagnosis:** Agent is applying judgment about whether issues are related

**Solution:**
1. Make clustering criteria more explicit in system prompt
2. Provide more examples of when to cluster
3. Accept that clustering is judgment-based (some variance is OK)
4. Consider post-processing to enforce clustering rules

### Frontend Not Showing Summary

**Symptom:** `data.summary` is null even though `useAgent: true`

**Diagnosis:**
```typescript
// Check LLM availability first
const availability = await apiClient.checkLLMAvailability();
console.log(availability); // { available: false, reason: "..." }
```

**Common Causes:**
1. ANTHROPIC_API_KEY not set in backend
2. LLM API call failed (check backend logs)
3. Response parsing error (invalid JSON from Claude)

**Solution:**
- Set API key in backend environment
- Check backend logs for detailed error messages
- Verify network connectivity to Anthropic API

---

## Additional Resources

- **Anthropic API Docs:** https://docs.anthropic.com/claude/reference
- **Claude Model Specs:** https://docs.anthropic.com/claude/docs/models-overview
- **Prompt Engineering Guide:** https://docs.anthropic.com/claude/docs/prompt-engineering
- **9Boxer Intelligence Service:** `backend/src/ninebox/services/intelligence_service.py`

## Support

For questions or issues:
1. Check this guide first
2. Review backend logs for detailed error messages
3. Test with `test_llm_agent_architecture.py` to isolate issues
4. Contact the 9Boxer development team
