# AI-Powered Calibration Summary - Implementation Summary

## Overview

This document provides technical implementation details for the AI-Powered Calibration Summary feature. It describes the backend service architecture, API endpoint design, frontend component hierarchy, state management approach, error handling, and testing strategy.

---

## Backend Service Architecture

### 1. CalibrationSummaryService

**Location:** `backend/src/ninebox/services/calibration_summary_service.py`

**Purpose:** Generate meeting preparation data from employee ratings

**Class Structure:**

```python
class CalibrationSummaryService:
    """Service for generating calibration meeting preparation data."""

    # Main orchestration
    def calculate_summary(self, employees: list[Employee]) -> CalibrationSummaryResponse

    # Sub-calculations
    def calculate_data_overview(self, employees: list[Employee]) -> DataOverview
    def calculate_time_allocation(self, employees: list[Employee]) -> TimeAllocation
    def generate_insights(...) -> list[Insight]

    # Insight generation helpers
    def _generate_distribution_insights(self, data_overview: DataOverview) -> list[Insight]
    def _generate_anomaly_insights(self, category: str, analysis: dict) -> list[Insight]
    def _generate_time_insight(self, time_allocation: TimeAllocation) -> Insight

    # Utilities
    def _generate_insight_id(prefix: str, *components: Any) -> str
    def _normalize_level(self, job_level: str) -> str
    def _empty_data_overview() -> DataOverview
    def _empty_time_allocation() -> TimeAllocation
```

**Key Implementation Details:**

**Data Overview Calculation:**
```python
def calculate_data_overview(self, employees: list[Employee]) -> DataOverview:
    total = len(employees)

    # Count by dimensions using collections.Counter
    by_level = Counter(e.job_level for e in employees)
    by_function = Counter(e.job_function for e in employees)
    by_location = Counter(e.location for e in employees)

    # Grid position counts
    stars_count = sum(1 for e in employees if e.grid_position == 9)
    center_count = sum(1 for e in employees if e.grid_position == 5)
    lower_count = sum(1 for e in employees if e.grid_position in {1, 2, 4})
    high_perf_count = sum(1 for e in employees if e.grid_position in {3, 6, 9})

    # Return with calculated percentages
    return DataOverview(
        total_employees=total,
        by_level=dict(by_level),
        by_function=dict(by_function),
        by_location=dict(by_location),
        stars_count=stars_count,
        stars_percentage=round(100.0 * stars_count / total, 1),
        center_box_count=center_count,
        center_box_percentage=round(100.0 * center_count / total, 1),
        lower_performers_count=lower_count,
        lower_performers_percentage=round(100.0 * lower_count / total, 1),
        high_performers_count=high_perf_count,
        high_performers_percentage=round(100.0 * high_perf_count / total, 1),
    )
```

**Time Allocation Algorithm:**
```python
# Constants
BASE_MINUTES_PER_EMPLOYEE = 2.0
MIN_MEETING_MINUTES = 30
MAX_MEETING_MINUTES = 240  # 4 hours

TIME_MULTIPLIERS = {
    1: 1.5,  # Lower performer - more discussion needed
    2: 1.2,  # Solid performer
    3: 1.0,  # Strong performer
    4: 1.5,  # Under performer - more discussion needed
    5: 0.8,  # Core performer - quick review
    6: 1.0,  # High performer
    7: 1.3,  # Enigma - needs discussion
    8: 1.2,  # High potential
    9: 1.3,  # Star - succession planning discussion
}

def calculate_time_allocation(self, employees: list[Employee]) -> TimeAllocation:
    # Group employees by normalized level (IC, Manager, Director, VP, Executive)
    by_level = {}
    for emp in employees:
        level = self._normalize_level(emp.job_level)
        by_level.setdefault(level, []).append(emp)

    # Calculate weighted time for each level
    breakdown = []
    total_minutes = 0.0

    for level in LEVEL_SEQUENCE:  # ["IC", "Manager", "Director", "VP", "Executive"]
        if level not in by_level:
            continue

        level_minutes = 0.0
        for emp in by_level[level]:
            multiplier = TIME_MULTIPLIERS.get(emp.grid_position, 1.0)
            level_minutes += BASE_MINUTES_PER_EMPLOYEE * multiplier

        level_minutes_rounded = round(level_minutes)
        total_minutes += level_minutes_rounded

        breakdown.append(LevelTimeBreakdown(
            level=level,
            employee_count=len(by_level[level]),
            minutes=level_minutes_rounded,
            percentage=0.0,  # Calculated after total is known
        ))

    # Add intelligence sweep time (5% of total, min 10 min)
    total_minutes += max(10, int(len(employees) * 0.05))

    # Apply bounds
    total_minutes = max(MIN_MEETING_MINUTES, min(MAX_MEETING_MINUTES, total_minutes))

    # Calculate percentages
    for item in breakdown:
        item["percentage"] = round(100.0 * item["minutes"] / total_minutes, 1)

    return TimeAllocation(
        estimated_duration_minutes=int(total_minutes),
        breakdown_by_level=breakdown,
        suggested_sequence=[item["level"] for item in breakdown] + ["Intelligence Sweep"],
    )
```

**Insight Generation Strategy:**
```python
def generate_insights(...) -> list[Insight]:
    insights = []

    # 1. Distribution-based insights
    insights.extend(self._generate_distribution_insights(data_overview))

    # 2. Anomaly-based insights from intelligence analyses
    insights.extend(self._generate_anomaly_insights("location", location_analysis))
    insights.extend(self._generate_anomaly_insights("function", function_analysis))
    insights.extend(self._generate_anomaly_insights("level", level_analysis))
    insights.extend(self._generate_anomaly_insights("tenure", tenure_analysis))

    # 3. Time allocation insight
    insights.append(self._generate_time_insight(time_allocation))

    # Sort by priority (high → medium → low)
    priority_order = {"high": 0, "medium": 1, "low": 2}
    insights.sort(key=lambda i: priority_order.get(i["priority"], 99))

    return insights
```

**Deterministic Insight IDs:**
```python
import hashlib

def _generate_insight_id(prefix: str, *components: Any) -> str:
    """Generate a deterministic insight ID from components.

    This ensures that the same data always produces the same insight IDs,
    which is critical for:
    1. LLM summary generation (IDs used to filter selected insights)
    2. Frontend selection state management
    3. Testing (predictable IDs)
    """
    content = "-".join(str(c) for c in components)
    hash_suffix = hashlib.sha256(content.encode()).hexdigest()[:8]
    return f"{prefix}-{hash_suffix}"

# Examples:
# _generate_insight_id("focus-crowded-center", 24) → "focus-crowded-center-a1b2c3d4"
# _generate_insight_id("anomaly", "location", "Engineering") → "anomaly-location-Engineering-513398ea"
```

**Distribution Insight Logic:**
```python
def _generate_distribution_insights(self, data_overview: DataOverview) -> list[Insight]:
    insights = []

    # Check for crowded center box
    if data_overview["center_box_percentage"] > 50.0:
        insights.append(Insight(
            id=self._generate_insight_id("focus-crowded-center", data_overview["center_box_count"]),
            type="focus_area",
            category="distribution",
            priority="medium",
            title=f"{data_overview['center_box_percentage']:.0f}% of employees in center box",
            description="Consider running a Donut Mode exercise to differentiate Core Performers. "
                       "A crowded center box may indicate managers are avoiding differentiation.",
            affected_count=data_overview["center_box_count"],
            source_data=InsightSourceData(
                center_count=data_overview["center_box_count"],
                center_pct=data_overview["center_box_percentage"],
                recommended_max_pct=50.0,
            ),
        ))

    # Check for too few stars (succession risk)
    if data_overview["stars_percentage"] < 5.0:
        insights.append(Insight(
            id=self._generate_insight_id("focus-low-stars", data_overview["stars_count"]),
            type="focus_area",
            category="distribution",
            priority="high",
            title=f"Only {data_overview['stars_percentage']:.0f}% Stars (Position 9)",
            description="Low percentage of top talent may indicate succession planning risk "
                       "or overly strict rating standards.",
            affected_count=data_overview["stars_count"],
            source_data=InsightSourceData(
                observed_pct=data_overview["stars_percentage"],
                expected_pct=10.0,
            ),
        ))

    # Check for potential grade inflation (too many stars)
    if data_overview["stars_percentage"] > 25.0:
        insights.append(Insight(
            id=self._generate_insight_id("focus-high-stars", data_overview["stars_count"]),
            type="focus_area",
            category="distribution",
            priority="high",
            title=f"{data_overview['stars_percentage']:.0f}% rated as Stars",
            description="High percentage of top talent may indicate grade inflation. "
                       "Review whether the bar for 'Star' is consistent across managers.",
            affected_count=data_overview["stars_count"],
            source_data=InsightSourceData(
                observed_pct=data_overview["stars_percentage"],
                expected_pct=15.0,
            ),
        ))

    return insights
```

**Anomaly Insight Logic:**
```python
def _generate_anomaly_insights(self, category: str, analysis: dict[str, Any]) -> list[Insight]:
    insights = []

    # Only generate insights for yellow or red status
    status = analysis.get("status", "green")
    if status == "green":
        return insights

    # Get significant deviations (|z-score| > 2.0)
    deviations = analysis.get("deviations", [])
    significant_devs = [d for d in deviations if d.get("is_significant", False)]

    if not significant_devs:
        # Create a general insight if flagged but no specific deviations
        insights.append(Insight(
            id=self._generate_insight_id("anomaly-general", category, status),
            type="anomaly",
            category=category,
            priority="medium" if status == "yellow" else "high",
            title=f"Rating pattern differences detected across {category}s",
            description=analysis.get("interpretation", "Statistical analysis shows significant differences."),
            affected_count=analysis.get("sample_size", 0),
            source_data=InsightSourceData(p_value=analysis.get("p_value", 0), category=category),
        ))
        return insights

    # Create insight for each significant deviation
    for dev in significant_devs:
        category_name = dev.get("category", "Unknown")
        z_score = dev.get("z_score", 0)
        direction = "higher" if z_score > 0 else "lower"
        priority = "high" if abs(z_score) > 3.0 else "medium"

        insights.append(Insight(
            id=self._generate_insight_id("anomaly", category, category_name),
            type="anomaly",
            category=category,
            priority=priority,
            title=f"{category_name} rates {direction} than average",
            description=f"{category_name} has {dev['observed_high_pct']:.0f}% high performers "
                       f"vs {dev['expected_high_pct']:.0f}% expected (z={z_score:.1f})",
            affected_count=dev.get("sample_size", 0),
            source_data=InsightSourceData(
                z_score=z_score,
                p_value=analysis.get("p_value", 0),
                observed_pct=dev["observed_high_pct"],
                expected_pct=dev["expected_high_pct"],
            ),
        ))

    return insights
```

---

### 2. LLMService

**Location:** `backend/src/ninebox/services/llm_service.py`

**Purpose:** Integrate with Anthropic Claude API for AI-powered summary generation

**Class Structure:**

```python
class LLMService:
    """Service for generating AI-powered calibration summaries."""

    def __init__(self, api_key: str | None = None, model: str | None = None)
    def is_available(self) -> LLMAvailability
    def generate_summary(...) -> LLMSummaryResponse

    # Privacy & security
    def _anonymize_data(...) -> dict[str, Any]
    def _sanitize_for_prompt(text: str | None) -> str

    # Prompt & API
    def _build_prompt(anonymized_data: dict) -> str
    def _call_claude(prompt: str) -> LLMSummaryResponse
    def _parse_response(content: str) -> dict[str, Any]
```

**Initialization & Availability:**
```python
DEFAULT_MODEL = "claude-sonnet-4-5-20250929"
MAX_TOKENS = 2048
TEMPERATURE = 0.3  # Low for consistent output

def __init__(self, api_key: str | None = None, model: str | None = None):
    # Try passed parameters first, fall back to environment variables
    self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
    self.model = model or os.getenv("LLM_MODEL", DEFAULT_MODEL)
    self._client = None

    if self.api_key:
        try:
            import anthropic
            self._client = anthropic.Anthropic(api_key=self.api_key)
            logger.info(f"LLM service initialized with model: {self.model}")
        except ImportError:
            logger.warning("anthropic package not installed. LLM features unavailable.")
        except Exception as e:
            logger.warning(f"Failed to initialize Anthropic client: {type(e).__name__}")

def is_available(self) -> LLMAvailability:
    if not self.api_key:
        return LLMAvailability(
            available=False,
            reason="ANTHROPIC_API_KEY environment variable not set",
        )

    if self._client is None:
        return LLMAvailability(
            available=False,
            reason="Anthropic client failed to initialize. Check logs for details.",
        )

    return LLMAvailability(available=True, reason=None)
```

**Data Anonymization (Critical Security Feature):**
```python
def _anonymize_data(
    self,
    insights: list[dict[str, Any]],
    data_overview: dict[str, Any],
) -> dict[str, Any]:
    """Anonymize data before sending to LLM.

    This function removes any potentially identifying information
    and keeps only aggregate statistics.
    """
    # Anonymize insights - keep only statistical/aggregate data
    anonymized_insights = []
    for insight in insights:
        anonymized_insight = {
            "type": insight.get("type"),
            "category": insight.get("category"),
            "priority": insight.get("priority"),
            # Sanitize user-influenced text fields
            "title": self._sanitize_for_prompt(insight.get("title")),
            "description": self._sanitize_for_prompt(insight.get("description")),
            "affected_count": insight.get("affected_count"),
        }

        # Include source_data but ensure no names/IDs
        source_data = insight.get("source_data", {})
        anonymized_source = {}

        # Safe fields to include (only aggregate statistics)
        safe_fields = [
            "z_score", "p_value", "observed_pct", "expected_pct",
            "center_count", "center_pct", "recommended_max_pct",
            "total_minutes", "by_level"
        ]

        for field in safe_fields:
            if field in source_data:
                anonymized_source[field] = source_data[field]

        anonymized_insight["source_data"] = anonymized_source
        anonymized_insights.append(anonymized_insight)

    # Anonymize data overview - keep only aggregate counts/percentages
    anonymized_overview = {
        "total_employees": data_overview.get("total_employees"),
        "stars_percentage": data_overview.get("stars_percentage"),
        "center_box_percentage": data_overview.get("center_box_percentage"),
        "lower_performers_percentage": data_overview.get("lower_performers_percentage"),
        "high_performers_percentage": data_overview.get("high_performers_percentage"),
        # Include level/function/location counts but NOT names
        "level_count": len(data_overview.get("by_level", {})),
        "function_count": len(data_overview.get("by_function", {})),
        "location_count": len(data_overview.get("by_location", {})),
    }

    return {
        "insights": anonymized_insights,
        "data_overview": anonymized_overview,
    }
```

**Prompt Injection Prevention:**
```python
def _sanitize_for_prompt(self, text: str | None) -> str:
    """Sanitize text before including in LLM prompt.

    Removes potential prompt injection patterns and truncates to
    a reasonable length.
    """
    if not text:
        return ""

    # Remove common prompt manipulation patterns
    sanitized = text.replace("Ignore previous instructions", "")
    sanitized = sanitized.replace("System:", "")
    sanitized = sanitized.replace("Human:", "")
    sanitized = sanitized.replace("Assistant:", "")
    sanitized = sanitized.replace("```", "")

    # Truncate to reasonable length (500 chars max)
    return sanitized[:500]
```

**System Prompt Design:**
```python
SYSTEM_PROMPT = """You are an experienced HR consultant and calibration meeting facilitator.
Your role is to help HR leaders and calibration managers prepare for talent review meetings.

Based on the anonymized statistical insights provided, generate:
1. A 2-3 paragraph executive summary of the key findings
2. 3-5 key recommendations for the calibration meeting
3. 3-5 predicted discussion points that may arise

Focus on actionable guidance that helps the calibration leader:
- Allocate meeting time effectively
- Anticipate challenging conversations
- Ensure fair and consistent talent assessment
- Address any statistical anomalies appropriately

Be direct and practical. Use business language appropriate for HR leadership.
Do not speculate about individual employees - work only with the aggregate data provided.

Respond in valid JSON format with this structure:
{
  "summary": "Your executive summary here...",
  "key_recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "discussion_points": ["Discussion point 1", "Discussion point 2", ...]
}"""
```

**Claude API Integration:**
```python
def _call_claude(self, prompt: str) -> LLMSummaryResponse:
    if self._client is None:
        raise RuntimeError("Anthropic client not initialized")

    logger.info(f"Calling Claude API with model: {self.model}")
    logger.debug(f"Prompt length: {len(prompt)} characters")

    try:
        message = self._client.messages.create(
            model=self.model,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        logger.info(
            f"Claude API response received: "
            f"model={message.model}, "
            f"stop_reason={message.stop_reason}, "
            f"tokens_in={message.usage.input_tokens}, "
            f"tokens_out={message.usage.output_tokens}"
        )

        # Extract text content
        content = message.content[0].text

        # Parse JSON response
        result = self._parse_response(content)
        result["model_used"] = self.model

        return LLMSummaryResponse(
            summary=result.get("summary", ""),
            key_recommendations=result.get("key_recommendations", []),
            discussion_points=result.get("discussion_points", []),
            model_used=self.model or DEFAULT_MODEL,
        )

    except Exception as e:
        logger.error(f"Claude API call failed: {e}")
        raise RuntimeError(f"Failed to call Claude API: {e}") from e
```

**Response Parsing (Handles Multiple Formats):**
```python
def _parse_response(self, content: str) -> dict[str, Any]:
    """Parse Claude's response, handling markdown code blocks.

    Claude might return:
    1. ```json\n{...}\n``` (markdown code block)
    2. Raw JSON: {...}
    """
    import re

    # Try to extract JSON from markdown code blocks
    json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
    if json_match:
        json_text = json_match.group(1)
    else:
        # Try to find raw JSON
        json_match = re.search(r"(\{[\s\S]*\})", content)
        if json_match:
            json_text = json_match.group(1)
        else:
            raise ValueError("Could not find JSON in response")

    try:
        return json.loads(json_text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}")
        logger.error(f"Response content: {content[:500]}...")
        raise ValueError(f"Failed to parse response JSON: {e}") from e
```

---

## API Endpoint Design

**Location:** `backend/src/ninebox/api/calibration_summary.py`

**Router Configuration:**
```python
router = APIRouter(prefix="/calibration-summary", tags=["calibration-summary"])
LOCAL_USER_ID = "local-user"  # No auth in local-only app
```

### Endpoint 1: GET /calibration-summary

**Purpose:** Get calibration meeting preparation data

**Implementation:**
```python
@router.get("", response_model=None)
async def get_calibration_summary(
    session_mgr: SessionManager = Depends(get_session_manager),
    summary_service: CalibrationSummaryService = Depends(get_calibration_summary_service),
) -> CalibrationSummaryResponse:
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found. Please upload an Excel file first.",
        )

    if not session.current_employees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session exists but contains no employee data.",
        )

    logger.info(f"Processing {len(session.current_employees)} employees")

    summary = summary_service.calculate_summary(session.current_employees)
    return CalibrationSummaryResponse(**summary)
```

### Endpoint 2: GET /calibration-summary/llm-availability

**Purpose:** Check if LLM service is available

**Implementation:**
```python
@router.get("/llm-availability", response_model=None)
async def check_llm_availability(
    llm_service: LLMService = Depends(get_llm_service),
) -> LLMAvailabilityResponse:
    availability = llm_service.is_available()
    return LLMAvailabilityResponse(**availability)
```

### Endpoint 3: POST /calibration-summary/generate-summary

**Purpose:** Generate AI-powered summary from selected insights

**Request Validation:**
```python
class GenerateSummaryRequest(BaseModel):
    selected_insight_ids: list[str]

    MAX_INSIGHTS = 50  # Prevent DoS
    INSIGHT_ID_PATTERN = re.compile(r"^[a-z][a-z0-9-]+-[a-f0-9]{8}$")

    @field_validator("selected_insight_ids")
    @classmethod
    def validate_insight_ids(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("At least one insight must be selected")

        if len(v) > cls.MAX_INSIGHTS:
            raise ValueError(f"Too many insights selected (max {cls.MAX_INSIGHTS})")

        if len(v) != len(set(v)):
            raise ValueError("Duplicate insight IDs not allowed")

        for insight_id in v:
            if not cls.INSIGHT_ID_PATTERN.match(insight_id):
                raise ValueError(f"Invalid insight ID format: {insight_id}")

        return v
```

**Implementation:**
```python
@router.post("/generate-summary", response_model=None)
async def generate_llm_summary(
    request: GenerateSummaryRequest,
    session_mgr: SessionManager = Depends(get_session_manager),
    summary_service: CalibrationSummaryService = Depends(get_calibration_summary_service),
    llm_service: LLMService = Depends(get_llm_service),
) -> LLMSummaryResponse:
    # Check LLM availability
    availability = llm_service.is_available()
    if not availability["available"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"LLM service not available: {availability['reason']}",
        )

    # Get session and validate
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session or not session.current_employees:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, ...)

    try:
        # Get the full summary to access insights
        summary = summary_service.calculate_summary(session.current_employees)

        # Generate LLM summary
        llm_result = llm_service.generate_summary(
            selected_insight_ids=request.selected_insight_ids,
            insights=summary["insights"],
            data_overview=summary["data_overview"],
        )

        logger.info(f"Generated LLM summary for {len(request.selected_insight_ids)} insights")

        return LLMSummaryResponse(**llm_result)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
```

---

## Frontend Component Hierarchy

### Component Tree

```
Intelligence Tab
└─ CalibrationSummarySection (collapsible card)
    ├─ Header
    │   ├─ Title + Icon
    │   ├─ Employee Count Chip
    │   └─ Expand/Collapse Button
    │
    ├─ Data Overview Section (left column)
    │   ├─ Total Employees
    │   ├─ Stars Count + Percentage
    │   ├─ Center Box Count + Percentage
    │   ├─ Lower Performers Count + Percentage
    │   └─ Time Allocation Summary
    │
    ├─ Insights Section (right column)
    │   ├─ "Select All" / "Deselect All" Buttons
    │   ├─ Scrollable Insight List
    │   │   └─ InsightCard (x N)
    │   │       ├─ Checkbox
    │   │       ├─ Priority Badge
    │   │       ├─ Category Icon
    │   │       ├─ Title
    │   │       ├─ Description
    │   │       └─ Affected Count
    │   │
    │   └─ AI Summary Generation
    │       ├─ "Generate AI Summary" Button
    │       ├─ LLM Not Available Alert
    │       ├─ LLM Error Alert
    │       └─ LLM Result Display
    │           ├─ Executive Summary (Alert)
    │           ├─ Key Recommendations (List)
    │           ├─ Discussion Points (List)
    │           └─ Model Attribution
```

### State Management

**Component-Level State:**
```typescript
// CalibrationSummarySection.tsx
const [expanded, setExpanded] = useState(defaultExpanded);
```

**Hook-Based State:**
```typescript
// useCalibrationSummary.ts
const [data, setData] = useState<CalibrationSummaryData | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
const [selectedInsights, setSelectedInsights] = useState<Record<string, boolean>>({});

// useLLMSummary.ts
const [data, setData] = useState<LLMSummaryResult | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [availability, setAvailability] = useState<LLMAvailability | null>(null);
```

**Global State (Session Store):**
```typescript
// Trigger refetch when employees change
const { employees } = useSessionStore();

useEffect(() => {
  refetch();
}, [employees, refetch]);
```

---

## Error Handling & Availability Checks

### Backend Error Scenarios

1. **No Session Found:**
   - Status: 404 NOT FOUND
   - Message: "No active session found. Please upload an Excel file first."

2. **Empty Employee Data:**
   - Status: 400 BAD REQUEST
   - Message: "Session exists but contains no employee data."

3. **LLM Not Available:**
   - Status: 400 BAD REQUEST
   - Message: "LLM service not available: ANTHROPIC_API_KEY environment variable not set"

4. **Invalid Insight IDs:**
   - Status: 400 BAD REQUEST
   - Message: "Invalid insight ID format: {id}"

5. **LLM API Failure:**
   - Status: 500 INTERNAL SERVER ERROR
   - Message: "Failed to call Claude API: {error}"

### Frontend Error Handling

**Data Fetch Errors:**
```typescript
if (error) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Alert severity="error">{error.message}</Alert>
      </CardContent>
    </Card>
  );
}
```

**LLM Not Available:**
```typescript
{!llmAvailable && (
  <Alert severity="info">
    AI Summary requires ANTHROPIC_API_KEY to be configured
  </Alert>
)}
```

**LLM Generation Errors:**
```typescript
{llmError && (
  <Alert severity="error">
    {llmError.message}
  </Alert>
)}
```

**Graceful Degradation:**
- All features work without LLM (data overview, insights, time allocation)
- LLM unavailability shown as info alert (not error)
- "Generate Summary" button disabled but visible

---

## Testing Strategy

### Backend Unit Tests

**LLMService Tests (`test_llm_service.py`):**
- `test_is_available_when_api_key_set_then_returns_true`
- `test_is_available_when_no_api_key_then_returns_false`
- `test_generate_summary_when_no_insights_raises_value_error`
- `test_anonymize_data_removes_pii`
- `test_sanitize_for_prompt_removes_injection_patterns`
- `test_parse_response_handles_markdown_code_blocks`
- `test_parse_response_handles_raw_json`

**CalibrationSummaryService Tests (`test_calibration_summary_service.py`):**
- `test_calculate_data_overview_aggregates_correctly`
- `test_calculate_time_allocation_applies_multipliers`
- `test_generate_insights_detects_crowded_center_box`
- `test_generate_insights_detects_low_stars`
- `test_generate_insights_creates_anomaly_insights`
- `test_generate_insight_id_is_deterministic`

### Frontend Component Tests

**InsightCard Tests:**
- Checkbox toggles selection state
- Priority badge shows correct color
- Category icon renders correctly
- Click card area toggles selection

**CalibrationSummarySection Tests:**
- Collapse/expand functionality
- "Select All" / "Deselect All" buttons
- "Generate Summary" button enable/disable logic
- LLM result rendering

### Frontend Hook Tests

**useCalibrationSummary Tests:**
- Fetches data on mount
- Refetches when employees change
- Initializes all insights as selected
- `toggleInsight` updates selection state correctly
- `selectAll` / `deselectAll` work correctly

**useLLMSummary Tests:**
- Checks availability on mount
- `generate()` sends correct insight IDs
- Error handling for generation failures

---

## Performance Considerations

### Backend Optimizations
- **Insight ID Caching:** Deterministic IDs avoid recomputation
- **Aggregate Calculations:** Use `collections.Counter` for efficient grouping
- **Early Validation:** Check session/employees before heavy calculations

### Frontend Optimizations
- **Conditional Rendering:** Only render expanded content when `expanded === true`
- **Memoization Opportunities:**
  - `formatDuration()` moved outside component
  - `getSelectedIds()` memoized with `useCallback`
  - `selectedCount` memoized with `useMemo`

### API Optimizations
- **Single Endpoint:** All data in one `/calibration-summary` call
- **Selective LLM Generation:** Only selected insights sent to Claude
- **Response Streaming:** Not implemented (could be future enhancement)

---

## Security Considerations

### 1. Data Privacy
- **No PII in LLM requests:** Employee names/IDs removed
- **Aggregate data only:** Counts, percentages, statistics
- **Prompt sanitization:** Prevent injection attacks

### 2. API Key Management
- **Environment variable only:** Never hardcoded
- **Not exposed to frontend:** Backend-only secret
- **Graceful failure:** App works without key

### 3. Input Validation
- **Insight ID format validation:** Regex pattern matching
- **Maximum insight limit:** 50 insights max
- **No duplicate IDs:** Set deduplication

### 4. Error Message Sanitization
- **No stack traces to frontend:** Generic error messages
- **No API key leakage:** Sanitized logging
- **User-friendly messages:** Actionable guidance

---

## Dependencies

### Backend Dependencies
- `anthropic` - Anthropic Python SDK
- Existing: `ninebox.services.intelligence_service`
- Existing: `ninebox.services.session_manager`
- Existing: FastAPI, Pydantic, uvicorn

### Frontend Dependencies
- No new dependencies
- Existing: React, TypeScript, Material-UI
- Existing: `zustand` (session store)

---

## Configuration

### Environment Variables

```bash
# Backend .env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx  # Required for LLM features
LLM_MODEL=claude-sonnet-4-5-20250929          # Optional (default: sonnet 4.5)
APP_DATA_DIR=/path/to/data                    # Existing
```

### Model Configuration

```python
# llm_service.py
DEFAULT_MODEL = "claude-sonnet-4-5-20250929"
MAX_TOKENS = 2048
TEMPERATURE = 0.3
```

### Threshold Configuration

```python
# calibration_summary_service.py
CENTER_BOX_WARNING_THRESHOLD = 50.0  # Warn if > 50% in center box
STARS_LOW_THRESHOLD = 5.0            # Warn if < 5% are stars
STARS_HIGH_THRESHOLD = 25.0          # Warn if > 25% are stars

TIME_MULTIPLIERS = {
    1: 1.5, 2: 1.2, 3: 1.0, 4: 1.5, 5: 0.8,
    6: 1.0, 7: 1.3, 8: 1.2, 9: 1.3
}
```

---

## Deployment Considerations

### Backend Deployment
1. Ensure `anthropic` package installed: `pip install anthropic`
2. Set `ANTHROPIC_API_KEY` in production environment
3. Monitor LLM API usage and costs (Anthropic dashboard)
4. Set up logging for LLM requests/responses

### Frontend Deployment
- No special deployment steps
- Feature automatically detects LLM availability
- Gracefully degrades if backend unavailable

### Monitoring
- Track LLM API call counts (backend logs)
- Monitor token usage (input + output)
- Alert on high error rates (>10% failures)
- Track feature adoption (usage analytics)

---

## Future Technical Improvements

### Performance
- Cache LLM responses (same insights = same summary)
- Paginate insight lists (>20 insights)
- Stream LLM responses (progressive display)

### Testing
- E2E tests with mocked Claude API
- Visual regression tests for summary display
- Load testing (large employee datasets)

### Observability
- OpenTelemetry tracing for LLM calls
- Grafana dashboard for API usage
- Cost tracking per summary generation

---

## Changelog

### 2026-01-02 - Documentation Created
- Comprehensive implementation documentation
- Technical details for all components
- Security and privacy documentation

### 2025-12-31 - Feature Completed
- Backend services fully implemented
- Frontend components deployed
- All tests passing
