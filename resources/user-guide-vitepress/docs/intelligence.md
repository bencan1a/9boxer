# Intelligence

The Intelligence tab combines AI-powered analysis with statistical anomaly detection to help you prepare for calibration meetings and ensure fair, consistent talent decisions.

**AI-Powered Meeting Preparation** (recommended starting point):
- Executive summary identifying root causes
- Prioritized, selectable insights for your meeting agenda
- Time allocation recommendations

**Statistical Analysis Tools** (for detailed investigation):
- Location, Function, Level, and Tenure anomaly detection
- Quality scoring and data health metrics
- Deep dive into specific patterns

---

## Accessing Intelligence

1. Click any employee (or click in empty space)
2. Click the **Intelligence** tab (fourth tab) in the right panel

![Right panel showing the Intelligence tab location among the panel tabs](/images/screenshots/intelligence/intelligence-tab-location.png)

![Intelligence panel](/images/screenshots/workflow/intelligence-summary-anomalies.png)

---

## AI-Powered Meeting Preparation

The Intelligence tab now features AI-powered analysis to help you prepare for calibration meetings more effectively. Using Claude (by Anthropic), 9Boxer analyzes your calibration data and generates actionable insights tailored to your organization.

### Generating Your AI Summary

1. Open the Intelligence tab
2. Click the **Generate AI Summary** button at the top
3. Wait 30-40 seconds while the AI analyzes your data
4. Review the 2-3 paragraph executive summary

The AI summary identifies:
- Root causes of distribution patterns (e.g., "MT3 level is driving your center box inflation")
- Specific percentages and affected employee counts
- Recommended meeting approach and focus areas

You can click **Show More** to expand the full summary, or **Refresh** to regenerate with updated data.

![AI-generated executive summary expanded showing full analysis](/images/screenshots/intelligence/ai-summary-expanded.png)

::: tip Privacy First
The AI analysis uses only anonymized statistical data. No employee names, IDs, or business titles are sent to the external API.

:::

### Understanding Calibration Insights

Below the AI summary, you'll find a list of **Calibration Insights** - specific, actionable items for your meeting preparation.

Each insight card shows:
- **Priority badge:** HIGH (red), MEDIUM (yellow), or LOW (green)
- **Category icon:** Location, Function, Level, Tenure, Distribution, or Time
- **Title:** Brief, actionable description
- **Description:** 2-3 sentences explaining the finding, why it matters, and what to do
- **Affected count:** Number of employees impacted
- **Cluster badge:** Groups related insights together (if applicable)

![Insight card showing priority badge, category icon, cluster badge, and impact details](/images/screenshots/intelligence/insight-card-detail.png)

**Insight Types:**
- **Anomaly** - Statistical deviations from expected patterns
- **Focus Area** - Distribution patterns needing attention (e.g., crowded center box)
- **Recommendation** - Process suggestions (e.g., "Run Donut Mode exercise")
- **Time Allocation** - Meeting time recommendations by level

### Using Insight Clusters

Related insights are grouped under **cluster badges** with a common theme. For example, a "MT3 Level Requires Deep Review" cluster might contain:
- "MT3 driving center box inflation" (HIGH priority)
- "New hires driving MT3 center box pattern" (MEDIUM priority)
- "Allocate 45 minutes for MT3 deep dive" (LOW priority - Time)

Clusters help you see the big picture and address root causes holistically rather than treating symptoms individually.

![Multiple related insights grouped under the same cluster badge](/images/screenshots/intelligence/insight-cluster-example.png)

### Selecting Insights for Your Meeting

Use insights to build your meeting agenda:

1. **Filter by priority:** Click All, High, Medium, or Low buttons
2. **Select relevant insights:** Click the checkbox on insight cards
3. **Bulk actions:** Use "Select All" or "Deselect All" for quick changes
4. **Review your selections:** Selected insights become your discussion topics

**Clicking on managers to investigate:** When you spot a manager anomaly (e.g., "Manager X rates 40% higher than peers"), you can click the manager's name directly in the insight card. This opens the Filters panel with the manager filter applied, letting you see their team on the grid.

![Calibration insights section with priority filters and selectable insight cards](/images/screenshots/intelligence/calibration-insights-section.png)

::: tip Start with High Priority
Filter to HIGH priority insights first. These are critical issues requiring immediate attention, such as significant statistical anomalies or major fairness concerns.

:::

### Data Overview Cards

At the top of the Intelligence tab, three summary cards provide quick context:

- **Quality Score:** Overall data health (0-100) with rating (Excellent/Good/Fair/Poor)
- **Anomaly Count:** Total anomalies with breakdown by severity (green/yellow/red chips)
- **Org Overview:** Total employees, performance distribution, flagged employees, locations, levels

![Data overview cards showing quality score, anomaly count, and organization stats](/images/screenshots/intelligence/data-overview-cards.png)

These cards give you instant situational awareness before diving into details.

### Meeting Preparation Workflow

Follow this workflow for efficient meeting prep:

1. **Generate AI Summary** - Get the executive overview and root cause analysis
2. **Filter by Priority** - Start with HIGH priority insights
3. **Select Discussion Topics** - Choose insights relevant to your meeting
4. **Review Time Allocation** - Check AI recommendations for meeting duration by level
5. **Drill into Details** - Use statistical analyses (below) for deep dives

The AI provides the "big picture," while the statistical analyses (Location, Function, Level, Tenure) provide the "deep dive" tools for detailed investigation.

---

## Understanding the Quality Score

At the top, you'll see an overall quality score (0-100) summarizing your data health.

![Quality score display at top of Intelligence panel showing overall data health rating](/images/screenshots/intelligence/intelligence-quality-score.png)

| Score | Rating | What It Means |
|-------|--------|---------------|
| 90-100 | Excellent | Well-calibrated, no significant issues |
| 75-89 | Good | Minor anomalies only |
| 60-74 | Fair | Some issues worth reviewing |
| 40-59 | Poor | Multiple anomalies need attention |
| 0-39 | Critical | Significant bias detected |

A low score means you should review anomalies before finalizing ratings.

---

## The 4 Anomaly Detectors

Intelligence analyzes your data across four dimensions:

### 1. Location Bias

Detects offices or regions with skewed performance distributions compared to the organization overall.

![Location bias analysis](/images/screenshots/workflow/intelligence-location.png)

**What to look for:**

- One office rates 30% High Performance, others average 12%
- Remote workers rated lower than office-based peers
- Regional differences that don't match performance data

**Common causes:**

- Local leadership sets different standards
- Proximity bias (out of sight, out of mind)
- Cultural differences in feedback directness

### 2. Job Function Bias

Detects departments with unusual distributions compared to organizational patterns.

![Job function bias analysis](/images/screenshots/workflow/intelligence-function.png)

**What to look for:**

- Sales has 40% High Potential, Engineering has 8%
- One department has no Stars while others have 10-15%
- Support functions rated consistently lower than revenue teams

**Common causes:**

- Different rating standards across functions
- Visibility bias (customer-facing rated higher)
- Conflating recent results with long-term potential

### 3. Job Level Bias

Detects rating patterns that correlate too strongly with job level rather than actual performance.

![Job level bias analysis](/images/screenshots/workflow/intelligence-level.png)

**What to look for:**

- Directors/VPs disproportionately rated High Performance
- Individual contributors rated lower than managers doing equivalent work
- Executives rarely rated Low (statistically unlikely)

**Common causes:**

- Conflating job level with performance quality
- Assumption that promoted employees are automatically high performers
- Political reluctance to rate senior leaders honestly

### 4. Tenure Bias

Detects rating patterns correlated with time at company rather than performance.

![Tenure bias analysis](/images/screenshots/workflow/intelligence-tenure.png)

**What to look for:**

- New hires (<6 months) rated High Potential at 3x normal rate
- Long-tenure employees stuck in middle boxes
- Recent hires clustered in top-right despite limited data

**Common causes:**

- Optimism about new hires before proven performance
- Assumption that long tenure = plateaued growth
- "Halo effect" of successful recruiting

---

## Understanding Severity

Anomalies are color-coded by severity:

| Color | Severity | What It Means |
|-------|----------|---------------|
| **Red** | Critical | Statistically significant, affects many employees—investigate now |
| **Yellow** | Moderate | Notable pattern, worth reviewing |
| **Green** | Minor | Small deviation, likely normal variance |

Each anomaly card shows:
- **Dimension** (Location, Function, Level, Tenure)
- **Expected count** vs **Actual count**
- **Deviation** amount
- **Affected categories**

![Anomaly card detail view showing expected vs actual counts and deviation metrics](/images/screenshots/intelligence/intelligence-anomaly-card-detail.png)

![Anomaly card example](/images/screenshots/workflow/intelligence-anomaly-red.png)

---

## What to Do With Anomalies

### Red (Critical) Anomalies

1. **Review affected employees** - Use filters to see them
2. **Hold calibration discussion** - Share data with the relevant group
3. **Recalibrate if needed** - Adjust ratings to align with standards

### Yellow (Moderate) Anomalies

1. **Investigate** - Is there a legitimate reason?
2. **Document** - Note if the pattern is justified
3. **Monitor** - Track if it persists over time

### Green (Minor) Anomalies

Generally no action needed—these are within normal variance.

---

## Common Patterns and What They Mean

| Pattern | Likely Cause | Action |
|---------|--------------|--------|
| One location all High ratings | Location-specific leniency | Cross-location calibration |
| New hires all High Potential | Premature rating | Wait 6 months to rate Potential |
| Department has no Stars | Under-rating or talent gap | Cross-functional calibration |
| VPs rated higher than ICs | Level bias | Review against objective metrics |

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| Check overall data quality | Look at quality score at top |
| Find critical issues | Scan for red anomaly cards |
| Compare locations | Check location bias section |
| Compare departments | Check function bias section |
| Check level calibration | Check level bias section |
| Check tenure patterns | Check tenure bias section |
| Investigate an anomaly | Filter to that group, review individuals |

---

## How Detection Works

Each detector uses statistical analysis to compare your actual distribution against expected patterns. When the deviation is too large to be random chance, it's flagged as an anomaly.

The system uses chi-square tests, Z-scores, and effect size measures (Cramér's V) to identify statistically significant patterns. A multi-factor severity algorithm prevents both false positives (flagging trivial anomalies) and false negatives (missing real patterns).

::: info Want the Gory Details?
For a comprehensive technical deep dive on the statistical methodology—including formulas, worked examples, severity determination logic, and the complete data structure sent to the LLM—see the **[Detection Methodology](detection-methodology.md)** reference guide.

:::

---

## Privacy & Data Security

### What Data is Sent to the AI?

When you generate an AI summary, 9Boxer sends **only anonymized statistical data** to the external API (Anthropic Claude):

**Sent:**
- Anonymized employee IDs (e.g., "Employee_1", "Employee_2")
- Anonymized manager IDs (e.g., "Manager_1", "Manager_2")
- Performance ratings (e.g., "Star", "High Performer")
- Demographic categories (e.g., "Engineering", "MT3", "Remote")
- Statistical aggregates (percentages, counts, z-scores)

**NOT Sent:**
- Employee names
- Employee IDs from your system
- Business titles
- Manager names
- Any personally identifiable information (PII)

This anonymization ensures the AI analysis is safe for external API use while still providing valuable insights.

### Troubleshooting

**AI Summary button not appearing?**
- Check that your organization has enabled LLM features
- Verify calibration session has sufficient data for analysis

**AI Summary fails to generate?**
- Check your internet connection
- Try refreshing the page and generating again
- If problem persists, you can still use the statistical analysis tools below

The Intelligence tab gracefully degrades to statistical-only insights if AI is unavailable.

---
