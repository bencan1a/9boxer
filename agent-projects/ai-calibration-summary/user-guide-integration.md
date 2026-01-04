# AI-Powered Calibration Summary - User Guide Integration

## Overview

This document describes how the AI-Powered Calibration Summary feature should be documented for end users. It provides the user-facing feature description, required configuration, usage workflows, and screenshot requirements.

---

## Target User Personas

Based on `internal-docs/contributing/user-personas.md`, this feature is designed for:

### Primary Personas
1. **Sarah - HR Manager**
   - Goal: Prepare quarterly talent reviews efficiently
   - Pain Point: Limited time to prepare for quarterly reviews
   - Use Case: Generate meeting agenda from insights in minutes

2. **Priya - Talent Development Lead**
   - Goal: Identify patterns and trends across organization
   - Pain Point: Needs to spot anomalies quickly across 200+ employees
   - Use Case: Use AI summary to highlight organizational talent patterns

### Secondary Personas
3. **Marcus - Department Head**
   - Goal: Calibrate ratings with peer managers
   - Pain Point: Limited time during calibration meetings
   - Use Case: Use time allocation to structure meeting agenda

4. **James - Executive**
   - Goal: Review leadership bench strength
   - Pain Point: Needs high-level insights quickly
   - Use Case: Export AI summary for board talent review presentations

---

## User-Facing Feature Description

### Feature Name
"AI-Powered Calibration Summary" or "Meeting Preparation Assistant"

### One-Sentence Description
> Generate intelligent meeting agendas, time allocations, and AI-powered executive summaries from your calibration data in seconds.

### Value Proposition (3 Sentences)
The Calibration Summary feature helps you prepare for talent review meetings by automatically analyzing your employee ratings to surface key patterns, anomalies, and discussion topics. Select the insights most relevant to your meeting, and generate an AI-powered executive summary with recommendations and predicted discussion points. Reduce meeting prep time from hours to minutes while ensuring comprehensive, data-driven calibration sessions.

### Key Benefits
- **Save Time:** Generate comprehensive meeting agendas in under 5 minutes
- **Surface Hidden Patterns:** Statistical analysis detects rating bias and grade inflation automatically
- **Allocate Time Wisely:** Get recommended time allocation by employee level
- **Prepare Effectively:** AI predicts discussion topics before meetings start
- **Communicate Better:** Export professional summaries for stakeholder communication

---

## Required Configuration

### For Standard Use (No AI Summary)
**No configuration required.** The Calibration Summary feature works out-of-the-box for:
- Data overview (employee counts, distributions)
- Statistical insights (anomalies, patterns)
- Time allocation recommendations

### For AI-Powered Summaries (Optional)
**Requires:** Anthropic API key configuration

**Steps to Enable AI Summaries:**

1. **Obtain API Key:**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an account or log in
   - Navigate to API Keys section
   - Generate a new API key
   - Copy the key (format: `sk-ant-api03-...`)

2. **Configure 9Boxer:**

   **Option A - Windows (Installed Version):**
   ```
   Set environment variable:
   Variable name: ANTHROPIC_API_KEY
   Value: sk-ant-api03-xxxxxxxxxxxxx

   Steps:
   1. Right-click "This PC" → Properties
   2. Click "Advanced system settings"
   3. Click "Environment Variables"
   4. Under "User variables", click "New"
   5. Enter ANTHROPIC_API_KEY as name
   6. Paste your API key as value
   7. Click OK and restart 9Boxer
   ```

   **Option B - Command Line (Dev Mode):**
   ```bash
   # Linux/Mac
   export ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

   # Windows
   set ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
   ```

   **Option C - .env File (Docker/Self-Hosted):**
   ```bash
   # Add to .env file
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
   ```

3. **Verify Configuration:**
   - Open 9Boxer
   - Navigate to Intelligence tab
   - Expand Calibration Summary section
   - Check for "Generate AI Summary" button (should be enabled)
   - If disabled, hover to see error message

**Pricing Note:**
AI summaries use the Claude API, which has usage-based pricing. Typical cost per summary: $0.01-0.05 USD depending on insight count. See [Anthropic Pricing](https://www.anthropic.com/pricing) for current rates.

---

## Usage Workflows

### Workflow 1: Quick Meeting Prep (No AI)

**Time:** 2 minutes
**Goal:** Get meeting agenda and time allocation
**User:** Sarah (HR Manager with 47 employees)

**Steps:**

1. **Upload your employee data**
   - Click Upload button
   - Select your Excel file with performance/potential ratings
   - Wait for grid to populate

2. **Open Calibration Summary**
   - Navigate to Intelligence tab (top navigation)
   - The Calibration Summary section appears at the top
   - It's expanded by default - if collapsed, click to expand

3. **Review Data Overview**
   - Total employees: 47
   - Stars: 7 (15%)
   - Center Box: 24 (51%) ⚠️
   - Lower Performers: 8 (17%)
   - Estimated meeting time: 2 hours

4. **Read Generated Insights**
   - Insight 1: "51% of employees in center box" → Consider Donut Mode exercise
   - Insight 2: "Engineering rates higher than average" → Allocate discussion time
   - Insight 3: "Estimated 2h for full calibration" → Plan meeting duration

5. **Plan Your Meeting**
   - Use time allocation breakdown: 50min IC, 35min Managers, 25min Directors
   - Focus on high-priority insights (red/orange badges)
   - Add discussion topics from insight descriptions

**Expected Outcome:**
- Meeting agenda structured by level
- Key discussion topics identified
- Time allocated appropriately

---

### Workflow 2: AI-Powered Executive Summary

**Time:** 5 minutes
**Goal:** Generate professional summary with AI recommendations
**User:** Priya (Talent Lead reviewing 200 employees)

**Steps:**

1. **Upload and Review Insights** (as in Workflow 1)

2. **Select Relevant Insights**
   - All insights selected by default
   - Deselect low-priority insights (e.g., time allocation if not needed)
   - Focus on anomalies and distribution patterns
   - Selected count shown: "5 insights selected"

3. **Generate AI Summary**
   - Click "Generate AI Summary" button
   - Wait 5-10 seconds (loading spinner)
   - AI analyzes selected insights

4. **Review AI-Generated Summary**
   - **Executive Summary:** 2-3 paragraph overview
     > "Your calibration session has several key focus areas. First, over half your employees (51%) are rated in the center box, which may indicate managers are avoiding differentiation. Second, Engineering shows significantly higher ratings than other departments (z-score: 2.5), warranting a discussion about rating consistency..."

   - **Key Recommendations:** 3-5 actionable items
     - "Allocate 30-40 minutes specifically for Engineering department"
     - "Run a Donut Mode validation exercise before the meeting"
     - "Begin with IC-level discussions (50 minutes) before leadership calibration"

   - **Predicted Discussion Points:** 3-5 questions/topics
     - "Why does Engineering have 35% high performers vs 20% company average?"
     - "Which center box employees should be differentiated?"
     - "Do we have enough Stars for our succession pipeline?"

5. **Use or Export Summary**
   - Copy summary text for meeting invitation
   - Share recommendations with calibration attendees
   - Use discussion points to prepare talking points
   - Take notes during meeting based on predictions

**Expected Outcome:**
- Professional executive summary ready to share
- Actionable recommendations for meeting facilitation
- Anticipated discussion topics prepared in advance

---

### Workflow 3: Real-Time Adjustments During Meeting

**Time:** Ongoing during 2-hour meeting
**Goal:** Update insights as ratings change live
**User:** Marcus (Department Head in calibration session)

**Steps:**

1. **Screen Share During Meeting**
   - Open 9Boxer with loaded employee data
   - Share screen in video call
   - Calibration Summary section visible

2. **Discuss and Adjust Ratings**
   - Group discusses employee in center box
   - Decision: Move to High Performer box
   - Drag employee tile to new position

3. **Watch Summary Update**
   - Center box count automatically decreases: 24 → 23
   - Center box percentage recalculates: 51% → 49%
   - Insight updates: "49% in center box" (threshold warning removed)

4. **Regenerate AI Summary (Optional)**
   - After multiple changes, click "Generate AI Summary" again
   - Get updated recommendations based on new distribution
   - Verify meeting goals achieved (e.g., center box reduced)

5. **Export Final Results**
   - Click Apply button after all changes
   - Download modified Excel file with notes
   - AI summary serves as meeting minutes

**Expected Outcome:**
- Real-time validation of calibration decisions
- Updated insights reflect current state
- Meeting goals tracked visually

---

## Screenshots Needed for User Documentation

### Critical Screenshots (Must Have)

#### 1. Overview - Calibration Summary Section Location
**Filename:** `calibration-summary-overview.png`
**Description:** Full Intelligence tab showing Calibration Summary at top
**Annotations:**
- Red arrow pointing to "Intelligence" tab in navigation
- Red box around "Calibration Summary" section header
- Callout: "Summary appears here automatically when data is loaded"

#### 2. Data Overview Panel
**Filename:** `data-overview-panel.png`
**Description:** Close-up of left column with metrics
**Annotations:**
- Highlight "47 employees" with callout
- Highlight "7 Stars (15%)" with green checkmark
- Highlight "24 Center Box (51%)" with orange warning icon
- Callout: "Metrics update in real-time as you move employees"

#### 3. Insight Card Anatomy
**Filename:** `insight-card-anatomy.png`
**Description:** Single insight card with all elements labeled
**Annotations:**
- Arrow to checkbox: "Select/deselect for AI summary"
- Arrow to priority badge: "HIGH priority = discuss first"
- Arrow to category icon: "Shows insight category (location, function, etc.)"
- Arrow to title: "Quick summary of finding"
- Arrow to description: "Detailed explanation and recommendation"
- Arrow to affected count: "Number of employees impacted"

#### 4. Insight Selection Controls
**Filename:** `insight-selection-controls.png`
**Description:** Top of insights section with Select All/Deselect All buttons
**Annotations:**
- Red box around "Select All" and "Deselect All" buttons
- Callout: "Quickly toggle all insights for AI generation"
- Show "5 insights selected" counter

#### 5. Generate AI Summary Button States
**Filename:** `generate-summary-button-states.png`
**Description:** Side-by-side comparison of button states
**Annotations:**
- Panel 1: Button enabled (blue, "Generate AI Summary")
- Panel 2: Button loading (spinner, "Generating...")
- Panel 3: Button disabled (gray, with tooltip "ANTHROPIC_API_KEY required")

#### 6. AI Summary Result - Executive Summary
**Filename:** `ai-summary-executive-summary.png`
**Description:** AI-generated summary displayed in green success alert
**Annotations:**
- Red box around summary text
- Callout: "2-3 paragraph executive overview"

#### 7. AI Summary Result - Recommendations
**Filename:** `ai-summary-recommendations.png`
**Description:** Key Recommendations list with checkmarks
**Annotations:**
- Red box around bulleted list
- Callout: "Actionable steps for meeting facilitation"
- Highlight first recommendation with note: "Prioritize by relevance"

#### 8. AI Summary Result - Discussion Points
**Filename:** `ai-summary-discussion-points.png`
**Description:** Predicted Discussion Points list with lightbulb icons
**Annotations:**
- Red box around bulleted list
- Callout: "Questions/topics likely to arise in meeting"
- Note: "Use these to prepare talking points"

#### 9. LLM Not Available Alert
**Filename:** `llm-not-available-alert.png`
**Description:** Info alert when ANTHROPIC_API_KEY not configured
**Annotations:**
- Blue info alert visible
- Message: "AI Summary requires ANTHROPIC_API_KEY to be configured"
- Callout: "Feature works without API key - AI summary optional"

#### 10. Real-Time Update Example
**Filename:** `real-time-update-example.png`
**Description:** Before/after split showing insight change
**Annotations:**
- Left panel: "51% in center box" (before employee moved)
- Right panel: "49% in center box" (after employee moved)
- Arrow showing movement
- Callout: "Insights recalculate automatically"

---

### Supplementary Screenshots (Nice to Have)

#### 11. Time Allocation Breakdown
**Filename:** `time-allocation-breakdown.png`
**Description:** Close-up of estimated duration section
**Annotations:**
- Highlight "Est. 2h" with clock icon
- Show "Suggested: IC → Manager → Director → Intelligence Sweep"
- Callout: "Plan meeting flow based on level sequence"

#### 12. Priority Badge Colors
**Filename:** `priority-badge-colors.png`
**Description:** Three insight cards showing different priorities
**Annotations:**
- Red badge: "HIGH - Discuss first"
- Orange badge: "MED - Review if time permits"
- Green badge: "LOW - Optional context"

#### 13. Category Icons Reference
**Filename:** `category-icons-reference.png`
**Description:** Legend showing all category icons
**Annotations:**
- Location pin icon: "Location anomaly"
- Briefcase icon: "Function anomaly"
- People icon: "Level/tenure anomaly"
- Trending up icon: "Distribution pattern"
- Clock icon: "Time allocation"
- Lightbulb icon: "General recommendation"

#### 14. Collapse/Expand Animation
**Filename:** `collapse-expand-animation.gif`
**Description:** Animated GIF showing section collapse/expand
**Annotations:**
- Click on header to toggle
- Content slides in/out smoothly

#### 15. Export with AI Summary
**Filename:** `export-with-summary.png`
**Description:** User copying AI summary text to clipboard
**Annotations:**
- Cursor selecting summary text
- Callout: "Copy summary for meeting invites or reports"

---

## Documentation Page Structure

### Proposed Page: "Preparing for Calibration Meetings"

**Location in User Guide:**
`How-To Guides > Calibration Workflows > Preparing for Calibration Meetings`

**Page Type:** How-To Guide (task-oriented)

**Structure:**

```markdown
# Preparing for Calibration Meetings

> **You're here because:** You need to prepare for an upcoming talent calibration session
> **Time to complete:** 5-10 minutes
> **What you'll accomplish:** Create a data-driven meeting agenda with key discussion topics

## What You'll Learn

By the end of this guide, you'll be able to:
- Generate calibration insights from your employee ratings
- Identify statistical anomalies that need discussion
- Allocate time effectively across employee cohorts
- (Optional) Generate AI-powered executive summaries

---

## Before You Begin

- [x] Upload your employee Excel file with performance/potential ratings
- [x] Review the 9-box grid to verify data loaded correctly
- [ ] (Optional) Configure ANTHROPIC_API_KEY for AI summaries

---

## Step 1: Open Calibration Summary (30 seconds)

1. Navigate to the **Intelligence** tab (top navigation bar)
2. The **Calibration Summary** section appears at the top of the page
3. If collapsed, click the section header to expand

[Screenshot: calibration-summary-overview.png]

✅ **Success:** You should see employee counts, distribution metrics, and a list of insights

---

## Step 2: Review Your Distribution (2 minutes)

The Data Overview panel shows key metrics:

- **Total Employees:** How many people in this calibration session
- **Stars (Position 9):** Top talent percentage
  - ⚠️ < 5% = Succession risk
  - ✅ 10-15% = Healthy pipeline
  - ⚠️ > 25% = Possible grade inflation

- **Center Box (Position 5):** Core talent percentage
  - ⚠️ > 50% = Poor differentiation (run Donut Mode)

- **Lower Performers:** Development needs

[Screenshot: data-overview-panel.png]

### What the Numbers Mean

**Example:**
- 47 employees
- 7 Stars (15%) → ✅ Healthy
- 24 Center Box (51%) → ⚠️ Consider differentiation exercise
- 8 Lower Performers (17%) → Review development plans

---

## Step 3: Read Generated Insights (3 minutes)

Insights are automatically generated based on statistical analysis:

### Insight Types

1. **Distribution Patterns** (orange/red badges)
   - Center box overcrowding
   - Too many/too few Stars
   - Grade inflation indicators

2. **Anomalies** (red badges)
   - Department X rates higher than average
   - Location Y has unusual distribution
   - Tenure bias detected

3. **Time Allocation** (green badge)
   - Recommended meeting duration
   - Time breakdown by level

[Screenshot: insight-card-anatomy.png]

### How to Interpret Insights

**Priority Badges:**
- 🔴 **HIGH** → Discuss first, statistically significant (z-score > 3.0)
- 🟠 **MED** → Review if time permits, notable pattern (z-score > 2.0)
- 🟢 **LOW** → Context/reference, optional

**Example Insight:**
```
🔴 HIGH | Engineering rates higher than average

Engineering has 35% high performers vs 20% expected (z=2.5)

20 employees affected
```

**Action:** Allocate 30-40 minutes to discuss Engineering ratings during calibration.

---

## Step 4: Plan Your Meeting Agenda (2 minutes)

Use the **Time Allocation** recommendations:

**Example:**
- Estimated Duration: 2 hours
- IC Level: 50 minutes (25 employees)
- Manager Level: 35 minutes (15 employees)
- Director Level: 25 minutes (7 employees)
- Intelligence Sweep: 10 minutes (review anomalies)

**Suggested Sequence:** IC → Manager → Director → Intelligence Sweep

[Screenshot: time-allocation-breakdown.png]

### Why This Order?

1. **IC First:** Largest group, sets baseline expectations
2. **Managers/Directors:** Build on IC decisions, smaller groups
3. **Intelligence Sweep:** Address any missed patterns at end

---

## Step 5: (Optional) Generate AI Summary (3 minutes)

**Requires:** ANTHROPIC_API_KEY configuration (see [Configuration Guide](#))

### Select Insights

1. All insights are selected by default (checkboxes checked)
2. Deselect low-priority insights if not relevant
3. Selected count shows: "5 insights selected"

[Screenshot: insight-selection-controls.png]

### Generate Summary

1. Click **"Generate AI Summary"** button
2. Wait 5-10 seconds (loading spinner shows)
3. AI analyzes your selected insights

[Screenshot: generate-summary-button-states.png]

### Review Results

**Executive Summary:**
> "Your calibration session has several key focus areas. First, over half your employees (51%) are rated in the center box, which may indicate managers are avoiding differentiation. Second, Engineering shows significantly higher ratings than other departments (z-score: 2.5), warranting a discussion about rating consistency..."

[Screenshot: ai-summary-executive-summary.png]

**Key Recommendations:**
- Allocate 30-40 minutes for Engineering department discussion
- Run a Donut Mode exercise to validate center box placements
- Begin with IC-level discussions before leadership calibration

[Screenshot: ai-summary-recommendations.png]

**Predicted Discussion Points:**
- Why does Engineering have 35% high performers vs 20% average?
- Which center box employees should be differentiated?
- Do we have enough Stars for succession planning?

[Screenshot: ai-summary-discussion-points.png]

### Use the Summary

- **Copy text** → Paste into meeting invitation
- **Share recommendations** → Send to calibration attendees beforehand
- **Prepare talking points** → Use predicted questions to structure discussion

---

## 🎉 Success Checklist

You've successfully prepared for your calibration meeting when you have:

- [x] Reviewed employee distribution metrics
- [x] Identified high-priority anomalies (red/orange badges)
- [x] Planned time allocation by employee level
- [x] (Optional) Generated AI executive summary
- [x] Created meeting agenda with discussion topics

---

## Troubleshooting

### "Generate AI Summary" button is disabled

**Cause:** ANTHROPIC_API_KEY not configured

**Solution:**
1. See [Configuration Guide](#) for API key setup
2. Restart 9Boxer after setting environment variable
3. Feature still works without AI - use insights directly

### Insights seem outdated

**Cause:** Insights don't auto-refresh when you move employees

**Solution:**
- Insights recalculate automatically when you load new data
- To see updated insights mid-meeting, reload the Intelligence tab
- Regenerate AI summary to get fresh recommendations

### No insights generated

**Cause:** Not enough data for statistical analysis

**Solution:**
- Need at least 10-15 employees for anomaly detection
- With small teams (<10), use Data Overview metrics directly
- Focus on distribution patterns instead of anomalies

---

## What's Next?

**Ready to run your meeting?**
→ [Conducting a Calibration Session](#)

**Want to validate center box placements?**
→ [Using Donut Mode for Differentiation](#)

**Need to document your decisions?**
→ [Adding Notes and Exporting Results](#)

---

## Tips from Experienced Users

💡 **Filter before generating summary** - Use filters to focus on specific departments, then generate targeted summaries

💡 **Save AI summaries** - Copy the text to a document for your records (summaries are not saved in 9Boxer)

💡 **Compare before/after** - Generate summary before meeting, then regenerate after changes to measure impact

💡 **Use discussion points as agenda** - Structure meeting around predicted questions for efficient facilitation

---

**Questions?** Check [Troubleshooting](#) or [ask for help](#)
```

---

## Voice and Tone Guidance

Based on `internal-docs/contributing/voice-and-tone-guide.md`, apply these tone principles:

### For This Feature

**Tone:** Professional but encouraging, data-focused but accessible

**Do:**
- ✅ "Generate intelligent meeting agendas in seconds"
- ✅ "AI predicts discussion topics before meetings start"
- ✅ "You'll see 2-3 paragraphs summarizing key findings"
- ✅ "Copy the summary to your meeting invitation"

**Don't:**
- ❌ "The system utilizes advanced statistical algorithms..."
- ❌ "Simply configure the API endpoint..."
- ❌ "Obviously, you should review the insights..."
- ❌ "The LLM will analyze your data..."

### Specific Phrases

**Describe AI features:**
- ✅ "AI-powered summary" (not "LLM-generated text")
- ✅ "Claude analyzes your insights" (not "The model processes...")
- ✅ "Get recommendations in seconds" (not "API response time...")

**Describe configuration:**
- ✅ "Optional: Enable AI summaries with an API key"
- ✅ "Feature works without configuration - AI is a bonus"
- ❌ "Requires ANTHROPIC_API_KEY environment variable to be set"

**Describe results:**
- ✅ "AI suggests 3-5 key recommendations"
- ✅ "Predicted discussion points help you prepare"
- ❌ "The model outputs structured JSON with recommendations array..."

---

## Content Type Classification

Based on documentation-writing-guide.md decision tree:

### Main Feature Page
**Type:** How-To Guide
**Reason:** Task-oriented ("How do I prepare for a calibration meeting?")
**Structure:** Steps with screenshots, success criteria, troubleshooting

### Configuration Page
**Type:** Reference
**Reason:** Lookup information for specific task
**Structure:** Step-by-step instructions, environment variable setup

### Concept Page (Optional)
**Type:** Tutorial
**Reason:** Teaching users about statistical insights
**Structure:** Explanation of chi-square tests, z-scores, p-values in plain language

---

## Key Messages for Documentation

### Message 1: Save Time
> "Reduce calibration prep time from hours to minutes with automatically generated insights and meeting agendas."

### Message 2: Data-Driven Decisions
> "Statistical analysis detects patterns humans might miss - grade inflation, rating bias, succession risks."

### Message 3: AI is Optional
> "Feature works perfectly without AI. Add Claude integration for executive summaries and recommendations."

### Message 4: Real-Time Updates
> "Insights recalculate as you move employees - validate calibration decisions live during meetings."

### Message 5: Privacy First
> "Only aggregate statistics are sent to AI - no employee names or IDs ever leave your computer."

---

## FAQ Entries

### Q: Do I need an AI API key to use this feature?

**A:** No! The Calibration Summary feature works completely without an API key. You'll get:
- Employee distribution metrics
- Statistical insights (anomalies, patterns)
- Time allocation recommendations

The AI-powered summary is an optional enhancement that provides:
- Executive summary (2-3 paragraphs)
- Key recommendations (3-5 bullets)
- Predicted discussion points (3-5 bullets)

To enable AI summaries, configure an ANTHROPIC_API_KEY. See [Configuration Guide](#).

---

### Q: How much does the AI summary feature cost?

**A:** AI summaries use the Claude API, which has usage-based pricing:
- Typical cost per summary: $0.01 - $0.05 USD
- Based on number of insights selected (more insights = higher cost)
- You're only charged when you click "Generate AI Summary"

Check [Anthropic Pricing](https://www.anthropic.com/pricing) for current rates. You'll need to create an Anthropic account and add billing information.

---

### Q: What data is sent to the AI?

**A:** Only anonymized aggregate statistics:
- Percentages and counts (e.g., "51% in center box")
- Statistical measures (z-scores, p-values)
- Distribution patterns

**Never sent:**
- Employee names
- Employee IDs
- Manager names
- Specific location/department identifiers

See [Privacy & Security](#) for full details.

---

### Q: Can I save the AI-generated summary?

**A:** The summary is displayed in the UI but not saved in 9Boxer. To save it:
1. Select the summary text
2. Copy to clipboard (Ctrl+C / Cmd+C)
3. Paste into:
   - Meeting invitation email
   - Word document for your records
   - Internal wiki/documentation

**Future enhancement:** Export summaries as PDF or include in Excel export.

---

### Q: Why are insights different from the Intelligence tab analyses?

**A:** They're complementary:

**Intelligence Tab Analyses:**
- Full statistical breakdowns (chi-square tests, deviations)
- Detailed tables and charts
- Technical depth for HR analysts

**Calibration Summary Insights:**
- Discrete, actionable items
- Prioritized by importance (HIGH/MED/LOW)
- Meeting-focused (what to discuss first)
- Selectable for AI summary generation

**Use both:** Review Intelligence for deep analysis, use Calibration Summary for meeting prep.

---

### Q: Do insights update when I move employees?

**A:** Partially:
- Insights recalculate when you **upload new data**
- Insights do NOT auto-refresh mid-session (performance optimization)

**Workaround for real-time updates:**
- Make your changes
- Click Apply to export
- Re-upload the exported file
- Insights recalculate with new distributions

**Future enhancement:** Auto-refresh insights on significant changes.

---

### Q: What if I don't see any insights?

**Possible causes:**

1. **Not enough data:** Need 10-15+ employees for statistical analysis
   - **Solution:** Use Data Overview metrics directly

2. **No anomalies detected:** Your distribution is statistically normal
   - **Solution:** This is good news! Focus on time allocation

3. **All insights low priority:** Minor patterns detected
   - **Solution:** Review green badges for context, focus on distribution metrics

---

### Q: Can I customize which insights are generated?

**A:** Not currently. Insights are generated based on:
- Statistical significance (p-values, z-scores)
- Best practice thresholds (50% center box, 5% stars)
- Industry standards for talent distributions

**Future enhancement:** Customizable thresholds and insight templates.

---

## Release Notes Entry

### AI-Powered Calibration Summary (Version X.X)

**What's New:**

Introducing the **Calibration Summary** feature - your intelligent meeting preparation assistant!

**Key Features:**
- 📊 **Data Overview:** Employee counts, Stars percentage, Center Box warnings
- 🔍 **Statistical Insights:** Automatic anomaly detection (location, function, level, tenure)
- ⏱️ **Time Allocation:** Recommended meeting duration and breakdown by employee level
- 🤖 **AI Summaries:** Generate executive summaries with Claude (optional, requires API key)

**How to Use:**
1. Upload your employee data
2. Navigate to Intelligence tab
3. Review Calibration Summary section (auto-expanded)
4. Select insights and click "Generate AI Summary" (if configured)

**Configuration:**
- No setup required for basic features
- Optional: Add ANTHROPIC_API_KEY for AI summaries
- See [documentation](#) for API key setup instructions

**Privacy:**
- Only aggregate statistics sent to AI (no employee names/IDs)
- Feature works completely offline (except AI summaries)
- Data never leaves your computer (except anonymized stats for AI)

**Learn More:**
- [Preparing for Calibration Meetings Guide](#)
- [AI Summary Configuration](#)
- [Understanding Statistical Insights](#)

---

## Changelog

### 2026-01-02 - Documentation Guide Created
- Comprehensive user guide integration plan
- Screenshot requirements documented
- Workflows defined for all personas
- FAQ entries drafted

### 2025-12-31 - Feature Released
- Calibration Summary available in Intelligence tab
- AI summary generation (optional)
- Statistical insight generation
