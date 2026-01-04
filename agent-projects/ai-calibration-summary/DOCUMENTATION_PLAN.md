# AI Calibration Intelligence Feature - Documentation Plan

## Executive Summary

Update the 9Boxer user guide to document the new AI-powered calibration intelligence feature. This feature transforms the Intelligence tab from a passive statistical analysis tool into an active AI-assisted meeting preparation system powered by Claude (Anthropic AI).

## Current State Analysis

### Documentation Structure
- **Build System:** MkDocs Material (configured in `mkdocs.yml`)
- **Location:** `resources/user-guide/docs/`
- **Key Files:**
  - `intelligence.md` - Currently documents only statistical anomaly detection
  - `getting-started.md` - Basic workflow, mentions Intelligence tab briefly
- **Screenshot Location:** `resources/user-guide/docs/images/screenshots/`

### Existing Intelligence Documentation
- Quality score (0-100)
- 4 anomaly detectors: Location, Function, Level, Tenure
- Color-coded severity (red/yellow/green)
- Statistical interpretation guidance

**Gap:** No mention of AI-powered features that are now the primary interface

## New Feature Overview

### What Changed
The Intelligence tab now provides:

1. **AI-Generated Executive Summary**
   - 2-3 paragraph conversational analysis
   - Root cause identification (e.g., "MT3 level driving center box inflation")
   - Recommended meeting approach
   - Click "Generate AI Summary" to create
   - Powered by Claude (Anthropic)

2. **Calibration Insights (Meeting Prep)**
   - Selectable, prioritized insights
   - Types: Anomalies, Focus Areas, Recommendations, Time Allocation
   - Priority levels: HIGH (red), MEDIUM (yellow), LOW (green)
   - Categories: Location, Function, Level, Tenure, Distribution, Time
   - Filter by priority, select for meeting agenda
   - Cluster badges group related issues

3. **Data Overview Cards**
   - Quality Score card
   - Anomaly Count card (breakdown by severity)
   - Org Overview card (employees, performance distribution)

4. **Insight Clustering**
   - Groups related insights under common themes
   - Example: "MT3 Level Requires Deep Review" containing multiple MT3 insights
   - Helps users see patterns and address root causes

### User Workflow
1. Open Intelligence tab
2. Click "Generate AI Summary" button
3. Review AI-generated executive summary (2-3 paragraphs)
4. Review calibration insights below summary
5. Filter insights by priority (All/High/Medium/Low)
6. Select insights relevant to meeting agenda
7. Use insights as discussion topics in calibration meeting
8. Drill into statistical analyses for details

### Privacy & Security
- **No PII sent to external API:** No employee names, IDs, business titles, or manager names
- **Anonymized data only:** Employee_1, Manager_1, etc.
- **Statistical aggregates:** Only percentages, counts, and patterns
- **Safe for external API use**

## Documentation Updates Required

### Phase 1: Document the Plan ✓
Create this comprehensive plan document in `agent-projects/ai-calibration-summary/DOCUMENTATION_PLAN.md`

### Phase 2: Update Intelligence Documentation

**File:** `resources/user-guide/docs/intelligence.md`

#### 2.1 Add New Top Section: "AI-Powered Meeting Preparation"
Insert BEFORE existing "Understanding the Quality Score" section.

**Content structure:**

```markdown
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

[Screenshot: ai-summary-expanded.png]

!!! tip "Privacy First"
    The AI analysis uses only anonymized statistical data. No employee names, IDs, or business titles are sent to the external API.

### Understanding Calibration Insights

Below the AI summary, you'll find a list of **Calibration Insights** - specific, actionable items for your meeting preparation.

Each insight card shows:
- **Priority badge:** HIGH (red), MEDIUM (yellow), or LOW (green)
- **Category icon:** Location, Function, Level, Tenure, Distribution, or Time
- **Title:** Brief, actionable description
- **Description:** 2-3 sentences explaining the finding, why it matters, and what to do
- **Affected count:** Number of employees impacted
- **Cluster badge:** Groups related insights together (if applicable)

[Screenshot: insight-card-detail.png]

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

[Screenshot: insight-cluster-example.png]

### Selecting Insights for Your Meeting

Use insights to build your meeting agenda:

1. **Filter by priority:** Click All, High, Medium, or Low buttons
2. **Select relevant insights:** Click the checkbox on insight cards
3. **Bulk actions:** Use "Select All" or "Deselect All" for quick changes
4. **Review your selections:** Selected insights become your discussion topics

[Screenshot: calibration-insights-section.png]

!!! tip "Start with High Priority"
    Filter to HIGH priority insights first. These are critical issues requiring immediate attention, such as significant statistical anomalies or major fairness concerns.

### Data Overview Cards

At the top of the Intelligence tab, three summary cards provide quick context:

- **Quality Score:** Overall data health (0-100) with rating (Excellent/Good/Fair/Poor)
- **Anomaly Count:** Total anomalies with breakdown by severity (green/yellow/red chips)
- **Org Overview:** Total employees, performance distribution, flagged employees, locations, levels

[Screenshot: data-overview-cards.png]

These cards give you instant situational awareness before diving into details.

### Meeting Preparation Workflow

Follow this workflow for efficient meeting prep:

1. **Generate AI Summary** - Get the executive overview and root cause analysis
2. **Filter by Priority** - Start with HIGH priority insights
3. **Select Discussion Topics** - Choose insights relevant to your meeting
4. **Review Time Allocation** - Check AI recommendations for meeting duration by level
5. **Drill into Details** - Use statistical analyses (below) for deep dives

The AI provides the "big picture," while the statistical analyses (Location, Function, Level, Tenure) provide the "deep dive" tools for detailed investigation.

[Screenshot: intelligence-tab-overview.png]
```

#### 2.2 Update Introduction Section
Revise existing introduction to position AI as primary interface:

```markdown
## Overview

The Intelligence tab combines AI-powered analysis with statistical anomaly detection to help you prepare for calibration meetings and ensure fair, consistent talent decisions.

**AI-Powered Meeting Preparation** (recommended starting point):
- Executive summary identifying root causes
- Prioritized, selectable insights for your meeting agenda
- Time allocation recommendations

**Statistical Analysis Tools** (for detailed investigation):
- Location, Function, Level, and Tenure anomaly detection
- Quality scoring and data health metrics
- Deep dive into specific patterns
```

#### 2.3 Add Privacy & Configuration Section
Add at end of document:

```markdown
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
```

### Phase 3: Update Getting Started Guide

**File:** `resources/user-guide/docs/getting-started.md`

#### 3.1 Expand Step 2: "Check the Intelligence Tab"
Currently lines 109-126. Expand to include AI summary as first action.

**Current content:**
```markdown
### Step 2: Check the Intelligence Tab

Before diving into individual employees, check the **Intelligence** tab for patterns and anomalies...
```

**Updated content:**
```markdown
### Step 2: Check the Intelligence Tab

Before diving into individual employees, use the **Intelligence** tab to get AI-powered insights and identify patterns.

#### Generate Your AI Summary (Recommended First Step)

1. Click the **Intelligence** tab
2. Click **Generate AI Summary** at the top of the page
3. Wait 30-40 seconds for the analysis
4. Review the AI-generated executive summary

The AI summary will identify root causes and recommend your meeting approach. For example:
- "MT3 level is driving your center box inflation with 64% of employees rated in the middle vs. 35% expected"
- "New hires (< 1 year tenure) are concentrated in the center box at 80% vs. 41% company average"
- "Consider allocating 45 minutes to deep-dive MT3 ratings during your calibration meeting"

[Screenshot: ai-summary-generate-button.png]

#### Review Calibration Insights

Below the AI summary, you'll see **Calibration Insights** - prioritized, actionable items for your meeting:

1. **Filter by priority:** Start with HIGH priority insights (red badges)
2. **Select relevant insights:** Click checkboxes on insights you want to discuss
3. **Note the clusters:** Related insights are grouped together

Selected insights become your meeting discussion topics. This saves time by focusing on what matters most.

[Screenshot: calibration-insights-section.png]

#### Use Statistical Analysis for Deep Dives

The Intelligence tab also provides detailed statistical analysis:

- **Quality Score:** Overall data health (aim for 75+)
- **Anomaly Detection:** Automatic highlighting of unusual patterns by Location, Function, Level, and Tenure
- **Color-coded severity:** Red (critical), yellow (moderate), green (informational)

Use these tools to investigate the root causes identified by the AI summary.

!!! tip "AI + Statistics = Complete Picture"
    The AI summary gives you the "big picture" and meeting strategy. The statistical analyses provide the "deep dive" for detailed investigation. Use both together for best results.

The Intelligence tab should be your **first stop** for meeting preparation, not a final sweep. Let the AI guide your focus areas, then use the statistical tools to dig deeper.
```

### Phase 4: Create Screenshots

**Location:** `resources/user-guide/docs/images/screenshots/intelligence/`

#### Required Screenshots (8 total)

1. **`ai-summary-generate-button.png`**
   - Shows Intelligence tab with "Generate AI Summary" button
   - Button should be prominently visible
   - Before any summary is generated

2. **`ai-summary-expanded.png`**
   - Full AI summary displayed (2-3 paragraphs)
   - "Powered by Claude" badge visible
   - "Show Less" and "Refresh" buttons visible
   - Shows actual summary text with specifics

3. **`ai-summary-preview.png`**
   - 3-line collapsed preview state
   - "Show More" button visible
   - Demonstrates truncated summary view

4. **`calibration-insights-section.png`**
   - Full insights section with multiple insight cards
   - Priority filter buttons visible (All, High, Medium, Low)
   - "Select All" / "Deselect All" buttons visible
   - Mix of HIGH, MEDIUM, LOW priority insights
   - Some insights selected (checkboxes checked)

5. **`insight-card-detail.png`**
   - Single insight card showing all elements:
     - Priority badge (HIGH in red)
     - Category icon (e.g., level groups icon)
     - Title (e.g., "MT3 driving center box inflation")
     - Description (2-3 sentences)
     - Affected count (e.g., "45 employees affected")
     - Cluster badge (e.g., "MT3 Level Requires Deep Review")

6. **`insight-cluster-example.png`**
   - Multiple insight cards with same cluster badge
   - Shows how related insights are grouped
   - Include 2-3 cards in same cluster
   - Different priorities but same cluster theme

7. **`data-overview-cards.png`**
   - Three summary cards at top of Intelligence tab:
     - Quality Score card (with score, e.g., 87, "Good")
     - Anomaly Count card (with colored chips: 2 red, 5 yellow, 3 green)
     - Org Overview card (total employees, performance distribution)

8. **`intelligence-tab-overview.png`**
   - Full Intelligence tab showing complete layout:
     - Data overview cards at top
     - AI summary section below
     - Calibration insights section below summary
     - Statistical analyses (location/function/level/tenure) at bottom
   - May need to be a tall screenshot or composite

#### Screenshot Guidelines

- Use representative sample data (not production data with real names)
- Ensure sufficient contrast for readability
- Highlight key UI elements where appropriate
- Follow existing screenshot style (borders, shadows, etc.)
- Use 1920x1080 resolution or similar
- Compress images for web use (PNG format)

### Phase 5: Add Cross-References and Navigation

#### 5.1 Update Cross-References

**In getting-started.md:**
- Link to intelligence.md AI sections: `See [AI-Powered Meeting Preparation](intelligence.md#ai-powered-meeting-preparation) for details`

**In intelligence.md:**
- Link to getting-started workflow: `See [Your First Calibration](getting-started.md) for the complete workflow`

#### 5.2 Update mkdocs.yml (if needed)

No navigation changes required - Intelligence tab documentation remains in same location.

#### 5.3 Add to FAQ (if exists)

If `resources/user-guide/docs/faq.md` exists, add:

**Q: Is my employee data sent to external AI services?**
A: No employee names, IDs, or business titles are ever sent to external APIs. The AI analysis uses only anonymized statistical data (e.g., "Employee_1", "Manager_1") and aggregated percentages. Your sensitive data stays secure.

**Q: What happens if the AI summary fails to generate?**
A: The Intelligence tab gracefully falls back to statistical-only insights. You can still use the Location, Function, Level, and Tenure anomaly detection tools for manual analysis.

**Q: How long does AI summary generation take?**
A: Typically 30-40 seconds. The AI analyzes your entire calibration dataset to identify patterns and root causes.

## Execution Strategy

### Parallel Agent Deployment

Launch 3 documentation expert agents in parallel to maximize efficiency:

**Agent 1: Intelligence.md Updates**
- Task: Add AI-powered sections to intelligence.md
- Deliverables: Sections 2.1, 2.2, 2.3 from Phase 2
- Success criteria: Complete AI documentation integrated before existing statistical content

**Agent 2: Getting-Started.md Updates**
- Task: Update Step 2 with AI summary workflow
- Deliverables: Section 3.1 from Phase 3
- Success criteria: AI summary positioned as first step, integrated with existing workflow

**Agent 3: Screenshot Requirements & Cross-References**
- Task: Create detailed screenshot requirements document and add cross-references
- Deliverables: Screenshot specification list (Phase 4), cross-reference updates (Phase 5)
- Success criteria: Clear screenshot specs for design team, all internal links working

### Sequential Steps (After Parallel Completion)

**Step 4: Screenshot Creation**
- Generate 8 required screenshots using UI
- Place in `resources/user-guide/docs/images/screenshots/intelligence/`
- Verify image quality and compression

**Step 5: Final Review**
- Test all internal documentation links
- Verify screenshot references match actual files
- Check rendering in MkDocs build
- Proofread all new content for consistency

## Success Metrics

### Content Completeness
- [ ] AI summary generation fully documented
- [ ] All 4 insight types explained (Anomaly, Focus Area, Recommendation, Time)
- [ ] Priority levels (HIGH/MEDIUM/LOW) defined
- [ ] Cluster functionality explained
- [ ] Data overview cards documented
- [ ] Meeting preparation workflow outlined
- [ ] Privacy guarantees clearly stated

### User Experience
- [ ] New users can generate AI summary on first try
- [ ] Users understand how to filter and select insights
- [ ] Users know when to use AI vs. statistical tools
- [ ] Privacy concerns addressed proactively

### Technical Quality
- [ ] All 8 screenshots created and integrated
- [ ] All internal links working
- [ ] MkDocs builds without errors
- [ ] Consistent formatting and style
- [ ] No orphaned references

## Timeline & Dependencies

### No External Dependencies
All information needed is available in codebase and UI. No waiting on external teams.

### Suggested Approach
1. **Immediate:** Launch 3 parallel doc expert agents (30-60 min per agent)
2. **After agents complete:** Create screenshots (60-90 min)
3. **Final:** Review and QA (30 min)

**Total estimated effort:** 3-4 hours

## Appendix: Key Technical Details

### API Endpoints
- GET `/calibration-summary?use_agent=true` - Returns complete package with AI summary
- GET `/calibration-summary/llm-availability` - Check if LLM features enabled

### Frontend Components
- `CalibrationSummarySection.tsx` - Main container
- `AISummaryDisplay.tsx` - Executive summary display
- `MeetingInsightsSection.tsx` - Selectable insights section
- `InsightCard.tsx` - Individual insight card
- `ClusterBadge.tsx` - Cluster grouping visual
- `IntelligenceSummary.tsx` - Data overview cards

### Backend Services
- `calibration_summary_service.py` - Core service with agent-first architecture
- `data_packaging_service.py` - Anonymized data packaging for LLM
- `llm_service.py` - Claude API integration
- `calibration_agent_prompt.txt` - System prompt (302 lines)

### Translation Keys
Located in `frontend/src/i18n/locales/*/translation.json`:
- `intelligence.calibrationSummary.*`

### Testing
- 20+ E2E tests cover AI features
- 69+ backend unit/integration tests
- 1280+ frontend tests
- ~40 second response time for AI generation

---

**Plan created:** 2026-01-03
**Feature:** AI Calibration Intelligence (Phases 1-5 complete)
**Documentation lead:** docs-expert agent
