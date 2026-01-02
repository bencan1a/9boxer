# Calibration Documentation Review & Restructuring Proposal

**Date:** 2026-01-01
**Reviewer:** Documentation Agent
**Purpose:** Comprehensive analysis of calibration workflow documentation with restructuring recommendations

---

## Executive Summary

The current calibration documentation is **well-structured and comprehensive** but suffers from critical gaps in workflow guidance, tone inconsistencies, and missing strategic context. The most significant issue is **incorrect filtering guidance** that suggests manager-by-manager reviews instead of level-based cohort calibration - a fundamental misunderstanding of effective calibration methodology.

**Key Issues:**
- Missing critical guidance on LEVEL-based filtering as primary calibration approach
- Tone is too formal and feature-centric rather than authentic and goal-oriented
- Manager filtering guidance is backwards (encourages siloed reviews instead of cross-manager cohorts)
- Lacks philosophical grounding on what calibration is trying to achieve
- Missing the "why" behind filtering choices

**Recommended Approach:**
- Major rewrite of filtering guidance with level-first methodology
- Tone transformation to authentic, conversational voice
- Elevate calibration philosophy to set proper mindset
- Restructure to focus on user goals rather than features

---

## Document Analysis

### 1. Getting Started (getting-started.md)

**Current State:** 382 lines | "Your First Calibration"

**Content Assessment:**

**What Works:**
- Clear 5-step workflow (Prepare → Upload → Review → Meet → Export)
- Good use of checklists and visual structure
- Practical screenshots placeholders in appropriate places
- Time estimates help set expectations
- Conversational tone in many sections

**Critical Problems:**

1. **Missing Level-Based Filtering Guidance** (HIGH SEVERITY)
   - Current guidance suggests filtering by manager to "review one person's team"
   - This is BACKWARDS - you want to look at cohorts across managers at the same level
   - Zero mention of starting with lower levels and working up
   - No guidance on why you filter by level (consistent bar of excellence per level)

2. **Tone Still Too Formal in Places**
   - Line 88: "Now let's validate your ratings" - works okay
   - Line 169: "Filter by manager: Select one manager" - too procedural
   - Missing authentic voice about the hard work of calibration

3. **Wrong Framing on Manager Filtering**
   - Line 165-172: "Manager Comparison" suggests reviewing "one manager's team at a time"
   - This encourages managers to "defend their turf" rather than collaborate
   - Should reframe as: look at cohorts to provide consistent expectations bar across managers
   - Real goal: assess both employees AND managers' understanding of "what good looks like"

4. **Missing Critical Context**
   - No mention of starting with lower levels first (Directors, then Managers, then ICs, etc.)
   - No guidance on establishing consistent bar of excellence per level
   - No warning against trying to balance 200 people at once
   - No mention of "compare folks at same level to keep it fair"

5. **Lacks Philosophical Grounding**
   - Doesn't explain WHAT calibration is trying to achieve
   - Missing the mindset shift: NOT "defend my ratings" but "how can we make our org better"
   - No mention of how calibration weeds out bias when done well

6. **Language Needs Reframing**
   - Line 145: "Validate all high performers truly deserve it" - sounds judgmental
   - Should be: "Ensure you have a consistent, high bar for high performers and that leadership agrees these folks meet that bar"
   - Throughout: Needs shift from "checking if they deserve it" to "ensuring consistency and fairness"

**Specific Line Issues:**

```markdown
Line 165-172 (CRITICAL - WRONG GUIDANCE):
=== "Manager Comparison"
    **Goal:** Compare one manager's ratings to others

    - Managers: Select one manager
    - Review their distribution vs. company averages
```

**Should be:**

```markdown
=== "By Level (START HERE)"
    **Goal:** Ensure consistent standards across all managers at each level

    - Job Level: Select "Manager" (or Director, IC, etc.)
    - Review ALL employees at this level across different managers
    - Compare ratings to ensure consistency

    **Why this matters:** Looking at all managers together at the same level helps you spot rating bias and ensure fair standards. If Manager A's "high performers" look mediocre compared to Manager B's, you'll catch it here.
```

**Overlap with Other Docs:**
- Overlaps significantly with talent-calibration.md (both cover same workflow)
- Some duplication with best-practices.md on preparation tips

---

### 2. Complete Calibration Reference (workflows/talent-calibration.md)

**Current State:** 273 lines | Comprehensive calibration reference

**Content Assessment:**

**What Works:**
- Excellent checklist structure (Before/During/After)
- Detailed and thorough coverage
- Good scenario examples
- Proper use of tabbed content

**Critical Problems:**

1. **Same Level-Based Filtering Gap** (HIGH SEVERITY)
   - Line 76-82: Same problematic manager-by-manager filtering guidance
   - No mention of level-based cohorts as primary method
   - Missing the entire conceptual framework for why you filter by level

2. **Missing Intelligence Filter Guidance**
   - No mention of using intelligence filters as final anomaly check AFTER level work
   - Intelligence should come at end: "After level-by-level review, use Intelligence to catch outliers"

3. **Tone Issues Throughout**
   - Generally good but lacks authentic voice
   - Reads like a procedural manual rather than practical guidance from experience
   - Missing the "this is hard work but worth it" acknowledgment

4. **Donut Mode Context Wrong**
   - Line 86-98: Positions Donut Mode as center box validation only
   - Misses that this comes BEFORE calibration for discussion prep
   - Should be: "Run Donut privately to identify discussion topics, not during meeting"

5. **No Guidance on Typical Flow**
   - Missing: "Start at lower levels, work up level by level"
   - Missing: "Use intelligence filters after level stuff as final check"
   - Missing: "Don't try to calibrate 200 people simultaneously"

**What's Missing:**

- **Level-first methodology** as core approach
- **Function + level combinations** (e.g., "Engineering Managers" vs "Sales Managers")
- **Location filtering** to identify cultural rating differences
- **Flag-based filtering** (flight risk, promotion candidates, "big movers")
- **Why each filter type matters** contextually

**Unnecessary Content:**
- Line 115-119: "Export pre-meeting baseline as separate file"
- 9Boxer already tracks all changes - this is redundant advice
- Should simplify: Just use 9Boxer's built-in change tracking

---

### 3. Best Practices (best-practices.md)

**Current State:** 776 lines | Comprehensive best practices guide

**Content Assessment:**

**What Works:**
- Extensive, thorough coverage
- Good "What/Why/How" structure for each practice
- Practical examples throughout
- Strong coverage of data preparation and follow-through

**Critical Problems:**

1. **Filtering Section Completely Wrong** (Line 210-234)
   - Current: "Focus on one department, level, or manager at a time"
   - Lists them as EQUAL options when level should be PRIMARY
   - Manager-filtering guidance (line 240-260) suggests reviewing one manager's team in isolation

2. **Missing Calibration Philosophy Section**
   - Entire document lacks philosophical grounding
   - Should open with "What calibration is trying to achieve"
   - Missing mindset guidance for participants and leaders

3. **Tone Still Too Formal**
   - Line 37: "Inconsistent rating definitions lead to skewed distributions"
   - Needs: "If one manager hands out highs like candy while another is tough, your grid won't reflect reality"

4. **Statistics Section Needs Reframe** (Line 264-294)
   - Line 279-283: Lists patterns to watch but frames as "problems"
   - Should frame as: "These patterns help you understand your org and have productive conversations"
   - Language: "⚠️ One manager rates everyone as High (leniency bias)" sounds accusatory
   - Better: "If Manager A rates 80% high while others rate 20% high, this is a conversation starter about standards"

5. **Donut Mode Advice Mispositioned** (Line 346-362)
   - Positioned as "during calibration" activity
   - Should be: "Run Donut Mode BEFORE the meeting to prepare discussion topics"

**What's Missing:**

- **Calibration philosophy opening section** - What are we trying to achieve?
- **Manager mindset guidance** - Come to align, not defend
- **Level-based filtering as primary method**
- **Decision tree for which filters to use when**
- **Cultural context for calibration** - avoiding bias, promoting fairness

**Language That Needs Reframing:**

| Current (Judgmental) | Should Be (Collaborative) |
|---------------------|---------------------------|
| "Check if high performers really deserve it" | "Ensure consistent, high bar for high performers" |
| "Validate that all high ratings are justified" | "Confirm alignment on what 'high performance' means" |
| "One manager rates everyone high (leniency bias)" | "Manager A's standards may differ from peers - worth discussing" |

---

### 4. New to 9-Box (new-to-9box.md)

**Current State:** 631 lines | Introduction to 9-box methodology

**Content Assessment:**

**What Works:**
- Excellent conceptual introduction
- Good scenario-based examples
- Clear position descriptions
- Helpful for true beginners

**Critical Problems:**

1. **Missing Calibration Philosophy**
   - Lines 52-85: Good on "Why Organizations Use 9-Box" but too tactical
   - Missing: "Calibration aligns managers on consistent, high expectations"
   - Missing: "Done well, calibration weeds out bias and helps everyone succeed"

2. **Tone Improvements Needed**
   - Generally good but could be more authentic
   - Line 84: "Without the 9-box framework, talent discussions become subjective debates"
   - Could be: "Without the grid, talent discussions turn into 'my people vs yours' debates. The framework gives structure."

3. **No Connection to Calibration Methodology**
   - Document explains positions well but not how to USE them in calibration
   - Missing link: "In calibration, you'll review level by level to ensure fair standards"

**What's Good:**
- Position descriptions (lines 112-206) are clear and practical
- Scenarios (lines 210-301) are relatable and helpful
- Step-by-step guide (lines 303-439) works well

**Opportunity:**
- This could be expanded with calibration philosophy section
- Could become the "why we calibrate" foundation document
- Needs to set the right mindset before people dive into mechanics

---

## Cross-Document Issues

### Content Duplication

**Filtering Guidance** appears in all three calibration docs:
- getting-started.md (lines 133-175)
- talent-calibration.md (lines 70-85)
- best-practices.md (lines 210-260)

**Problem:** All three have the WRONG guidance (manager-by-manager instead of level-based)

**Solution:** Consolidate filtering guidance in ONE authoritative place with decision tree

---

**Donut Mode References:**
- getting-started.md mentions it briefly
- talent-calibration.md has a section (lines 86-98)
- best-practices.md has detailed guidance (lines 346-362)

**Problem:** Inconsistent positioning (before vs during calibration)

**Solution:** Clarify in one place: Donut Mode is prep work, not during-meeting activity

---

**Statistics/Intelligence Review:**
- getting-started.md (lines 92-130)
- talent-calibration.md (lines 48-69)
- best-practices.md (lines 264-294)

**Problem:** Same content repeated, slight variations in advice

**Solution:** Reference one canonical guide, brief summaries elsewhere

---

### Missing Content Across All Docs

**Level-Based Calibration Methodology:**
- Zero docs explain starting at lower levels and working up
- No mention of why you compare same-level cohorts across managers
- Missing guidance on establishing level-specific bars of excellence

**Filter Decision Tree:**
- No guidance on WHICH filters to use WHEN
- Missing the hierarchy: Level first → Function + Level → Intelligence last
- No explanation of why this order matters

**Calibration Philosophy:**
- What we're trying to achieve (alignment, fairness, consistency)
- How leaders should show up (collaborate, not defend)
- Why 9box helps (structure, visibility, bias reduction)

**Intelligence Filters as Final Check:**
- None of the docs position Intelligence as the final anomaly sweep
- Missing: "After level-by-level review, check Intelligence for outliers"

**Flag-Based Filtering:**
- Flight risk identification
- Promotion candidate lists
- "Big movers" (different from historical movement)
- High performers needing development plans

**Location/Cultural Filtering:**
- Identifying cultural differences in ratings (e.g., Asian offices vs US)
- Discussing whether differences are real or rating bias

---

## Tone Analysis

### Current Tone: Formal and Feature-Centric

**Examples of Current Tone:**

```
"Navigate to the Statistics tab to validate distribution"
"Utilize filters to narrow your focus"
"The Intelligence tab provides statistical analysis"
"Ensure all high performers are justified"
```

**Problems:**
- Passive, procedural language
- Feature-first framing ("The tool does X")
- Lacks human warmth and authenticity
- Sounds like technical documentation

---

### Target Tone: Authentic and Goal-Oriented

**Based on voice-and-tone-guide.md:**
- Conversational, second person
- Active voice with contractions
- Acknowledge the hard work of calibration
- Frame features as solutions to user problems
- Avoid corporate HR speak

**Examples of Target Tone:**

```
Instead of: "Navigate to the Statistics tab to validate distribution"
Write: "Check the Statistics tab to see if your distribution makes sense. If 80% of your people are 'high performers,' something's off."

Instead of: "Utilize filters to narrow your focus"
Write: "Don't try to calibrate 200 people at once. Use filters to look at manageable groups."

Instead of: "The Intelligence tab provides statistical analysis"
Write: "Intelligence runs the numbers behind the scenes to spot patterns you might miss - like one manager who rates everyone high."

Instead of: "Ensure all high performers are justified"
Write: "Make sure you have a consistent, high bar for high performers and that everyone agrees on what 'high' really means."
```

---

### Tone by Content Type

**Calibration Philosophy:**
- Warm, authentic, acknowledging difficulty
- "This is hard work, but it matters"
- "Come to align, not defend"

**How-To Guides:**
- Direct, practical, encouraging
- "Start here, then move to..."
- "This will take 20 minutes but saves hours later"

**Best Practices:**
- Experienced peer sharing wisdom
- "Here's what works..."
- "We've seen this go wrong when..."

**Reference Docs:**
- Clear, concise, factual
- Still conversational but more straightforward

---

## Proposed Restructuring

### Document Strategy

**Keep these documents with major revisions:**

1. **new-to-9box.md** → Expand as "Calibration Philosophy & Introduction"
2. **getting-started.md** → Rename "Quick Calibration Workflow"
3. **workflows/talent-calibration.md** → Merge into best-practices.md
4. **best-practices.md** → Become "Complete Calibration Guide"

---

### New Document Structure

#### 1. Calibration Philosophy & 9-Box Introduction
**File:** `new-to-9box.md` (expanded)
**Length:** ~800 lines
**Tone:** Authentic, warm, philosophical

**New Sections to Add:**

```markdown
## Why Calibration Matters (NEW)

Calibration isn't about defending your ratings or proving you're right. It's about making sure everyone on your team - and their managers - understand what "great performance" actually looks like at each level.

### What Good Calibration Achieves

When done well, calibration:
- Weeds out unconscious bias in ratings
- Helps managers develop better judgment about performance
- Ensures workers get consistent expectations regardless of who they report to
- Makes tough conversations easier because you've aligned on standards

### The Wrong Mindset vs The Right Mindset

**Wrong:** "I need to defend my people and make sure they get the ratings they deserve"
**Right:** "I want to align with peers so we all apply the same high standards"

**Wrong:** "HR is checking if I'm too lenient"
**Right:** "This helps me understand if my bar for 'high performance' matches the organization's"

**Wrong:** "If I rate someone lower in calibration, I failed them"
**Right:** "Honest ratings help people grow and understand where they really stand"

### How 9Boxer Helps

The 9-box grid gives structure to these conversations:
- Visualizes talent distribution so patterns are obvious
- Makes bias visible (e.g., one manager rates everyone high)
- Provides data for productive discussions
- Creates shared language for talent decisions

## The Level-Based Calibration Approach (NEW)

Here's the key insight most people miss: **Don't try to calibrate 200 people at once.**

### Start with Levels, Not Teams

The most effective calibration looks at employees by **level and function**, not by manager.

**Why?** Because you need to compare people doing similar work to ensure fairness.

- Comparing all "Senior Engineers" across managers → Fair
- Comparing one manager's mixed team → Misses cross-manager bias

### The Typical Flow

Most effective calibrations follow this pattern:

1. **Start at lower levels** (ICs, individual contributors)
2. **Work up level by level** (Managers → Directors → VPs)
3. **Use level + function filters** ("Engineering Managers", "Sales ICs")
4. **Finish with intelligence filters** to catch remaining anomalies

**Why this order?**
- Lower levels have more people = more data for pattern detection
- Easier to calibrate similar roles before tackling leadership
- Level-based review ensures consistent bar of excellence per level
- Intelligence filters work best AFTER you've done bulk alignment

### Typical Filter Progression

```
Session 1: Filter to "Individual Contributors" → "Engineering"
  → Review all Engineering ICs together
  → Ensure consistent bar for "high performer" at IC level

Session 2: Filter to "Individual Contributors" → "Sales"
  → Review all Sales ICs together
  → Compare to Engineering standards

Session 3: Filter to "Managers" → All departments
  → Review all first-line managers together
  → Different bar than ICs - looking for leadership

Session 4: Intelligence tab
  → Final sweep for anomalies and outliers
  → Catch anything the level-based review missed
```
```

**Keep existing sections:**
- What is 9-Box (already good)
- Position descriptions (already good)
- Common scenarios (already good)

---

#### 2. Quick Calibration Workflow
**File:** `getting-started.md` (major rewrite)
**Length:** ~400 lines
**Tone:** Practical, encouraging, direct

**New Structure:**

```markdown
# Quick Calibration Workflow

> **First calibration?** Read [Calibration Philosophy](new-to-9box.md) first to understand what you're trying to achieve
> **Time:** 15 minutes to learn | 60-90 minutes for actual meeting
> **Who this is for:** Calibration facilitators and participants

## The 5-Step Workflow

1. Prepare (20 min before meeting)
2. Upload data (2 min)
3. Review by level (during meeting)
4. Make changes and document (during meeting)
5. Export and share (5 min after)

## Step 1: Prepare (20 minutes before meeting)

### What You're Looking For

Before the calibration meeting, you need to identify:
- Which levels/functions to review
- Rating patterns that need discussion
- Employees who might need moves
- Managers whose standards might differ from peers

### Upload Your Data

[Existing upload content - keep it]

### Start Your Review by Level

Here's the critical part most people get wrong: **Don't review everyone at once.**

**Filter by level first:**

1. Click Filters → Job Level → Select "Individual Contributor" (or Manager, Director, etc.)
2. Review the Statistics for this level only
3. Note patterns:
   - Are too many rated "High" at this level?
   - Does the distribution look realistic?
   - Do certain managers' teams look different?

**Why level-first?**
- Keeps comparisons fair (comparing similar work)
- Helps establish consistent bar per level
- Makes manager bias visible

### Then Add Function Filter

After selecting level, add function:
- Filter: Job Level = "Manager" + Department = "Engineering"
- Now you're looking at just Engineering Managers
- Compare across all managers of Engineering Managers

**Why function matters?**
Different functions have different expectations:
- Engineering "high performer" looks different than Sales "high performer"
- Filtering by function + level ensures apples-to-apples comparisons

### Check Intelligence (Final Anomaly Sweep)

AFTER you've done level-by-level review:
- Click Intelligence tab
- Review red/yellow anomalies
- These are outliers that survived your level-based review
- Use these as final discussion topics

## Step 2: During the Meeting - Work Level by Level

[Existing meeting content but REFRAME around level-based approach]

### Recommended Calibration Order

**For organizations <100 employees:**
1. Individual Contributors (all functions together)
2. Managers (all functions together)
3. Senior leaders (if applicable)

**For organizations >100 employees:**
1. Individual Contributors → Engineering
2. Individual Contributors → Sales
3. Individual Contributors → Other functions
4. Managers → Engineering
5. Managers → Sales
6. Managers → Other functions
7. Senior leaders

**Why this order works:**
- Most people are ICs = most data = easier to spot patterns
- By the time you get to senior leaders, you've aligned on standards
- Function-by-function prevents overwhelming the discussion

### Using Filters During the Meeting

[Rewrite this section entirely - show level + function combos]

### Making Changes

[Keep existing content - it's good]

### Documenting Decisions

[Keep existing content - it's good]

## Step 3: Export and Share

[Keep existing content - it's good]
```

---

#### 3. Complete Calibration Guide & Best Practices
**File:** `best-practices.md` (merge talent-calibration.md into this)
**Length:** ~1000 lines
**Tone:** Experienced peer, practical wisdom

**New Structure:**

```markdown
# Complete Calibration Guide

> **Quick workflow?** See [Quick Calibration Workflow](getting-started.md)
> **New to calibration?** Start with [Calibration Philosophy](new-to-9box.md)
> **This guide:** Deep best practices, checklists, troubleshooting

## Before the Meeting

### Critical Preparation Steps

[Merge talent-calibration.md pre-meeting checklist here]

### Level-Based Review Strategy

[NEW SECTION - Complete filtering decision tree]

#### Filter Decision Tree

**Start here: What are you trying to accomplish?**

```
Goal: Ensure fair, consistent ratings across the organization
└─> START: Filter by Job Level (IC, Manager, Director, etc.)
    └─> THEN: Add Function if needed (Engineering, Sales, etc.)
        └─> FINALLY: Use Intelligence for anomaly detection

Goal: Review a specific manager's team
└─> ONLY WHEN: Organization is large enough to warrant it
    └─> WARNING: Easy to create silos - use sparingly
    └─> BETTER: Review the manager's cohort across all managers

Goal: Identify promotion candidates
└─> Filter: High Potential + High Performance
    └─> THEN: Add Job Level to see promotion pipeline per level

Goal: Find cultural rating differences
└─> Filter by Location (e.g., Asia vs US vs Europe)
    └─> Look for systematic rating differences
    └─> Discuss whether differences are real or bias

Goal: Spot flight risks
└─> Use Intelligence → High Performers with specific flags
    └─> Or filter to Stars + any flight risk indicators
```

#### When to Use Each Filter Type

**By Level (PRIMARY APPROACH):**
- **Use for:** Main calibration work
- **Goal:** Consistent ratings according to level-specific standards
- **Start with:** Lower levels (more people = easier to spot patterns)
- **Work up to:** Senior levels after you've aligned on standards

**By Function + Level (SECONDARY):**
- **Use for:** When functions have different performance expectations
- **Example:** Engineering Managers vs Sales Managers
- **Why:** Different functions = different definitions of "high performance"

**By Location (CULTURAL CALIBRATION):**
- **Use for:** Global organizations
- **Goal:** Identify cultural differences in rating standards
- **Example:** Asian offices rate more conservatively than US
- **Outcome:** Discuss whether to normalize or accept differences

**By Manager (USE SPARINGLY):**
- **Use for:** Large orgs where individual managers have 20+ reports
- **Warning:** Creates "defend my turf" mentality
- **Better approach:** Look at manager's cohort with peers
- **Goal when used:** Assess whether manager understands "what good looks like"

**By Flags/Intelligence (FINAL SWEEP):**
- **Use for:** Anomaly detection after bulk calibration done
- **Examples:**
  - Flight risk + High Performer = retention conversation
  - Promotion candidate identification
  - "Big movers" who changed significantly
- **Timing:** AFTER level-based work, not before

### Why This Order Matters

**Level → Function → Intelligence** is the right progression because:

1. **Level first** ensures fair comparisons (similar work)
2. **Function second** accounts for role-specific expectations
3. **Intelligence last** catches outliers that survive structured review

**Wrong approach:** Start with Intelligence or manager-by-manager
- Intelligence without context = confusion
- Manager-by-manager = silos and defensiveness

## During the Meeting

### Calibration Meeting Principles

[NEW SECTION - Mindset and approach]

#### Come to Align, Not Defend

The wrong mindset:
- "I need to fight for my people to get the ratings they deserve"
- "HR is checking up on me"
- "If I change a rating, I failed that person"

The right mindset:
- "I want to make sure my standards match the organization's"
- "This helps me be a better manager by calibrating my judgment"
- "Honest ratings help my team understand where they stand"

#### Your Goal as Calibration Facilitator

You're trying to achieve:
- **Consistent expectations** across all managers at each level
- **Visible patterns** so bias becomes obvious and discussable
- **Shared understanding** of what "high performance" means per level
- **Fair outcomes** where similar employees get similar ratings

You're NOT trying to:
- Catch managers being "too lenient" or "too harsh"
- Prove anyone wrong
- Force a specific distribution
- Make managers feel bad about their ratings

#### Language That Helps vs Hurts

**Instead of this (judgmental):**
- "Your ratings are too high"
- "These people don't deserve to be Stars"
- "You're inflating your team's performance"

**Say this (collaborative):**
- "Let's compare your high performers to Sarah's - what differences do we see?"
- "Walk me through why you see these folks as Stars - what are they delivering?"
- "Your bar for 'high performance' might be different than the org's - let's align"

### Working Through Levels

[Merge talent-calibration.md during-meeting content here]
[Reframe everything around level-based review]

### Handling Disagreements

[NEW SECTION]

Disagreements in calibration are normal and healthy. Here's how to handle them:

**Scenario: Manager insists employee is High Performer, peers disagree**

Good facilitation:
1. "Tell us what high performance looks like to you for this role"
2. "Can you share specific examples of what this person delivered?"
3. [To peers] "How does that compare to your high performers in similar roles?"
4. Focus on evidence, not opinions
5. Find common ground: "Sounds like we agree they're strong but disagree on 'high' vs 'medium'"

Poor facilitation:
- "You're wrong, they're clearly Medium"
- "Everyone else disagrees with you"
- Forcing a decision without discussion

**Outcome:**
- Sometimes the manager convinces the group (evidence supports High)
- Sometimes the group convinces the manager (standards align to Medium)
- Sometimes you agree to disagree and revisit next quarter with more data

**Always:** Document the discussion in notes so future calibrations have context

## After the Meeting

[Keep existing best-practices.md after-meeting content]

## Common Scenarios

[Merge scenarios from both talent-calibration.md and best-practices.md]
[Add new scenarios around level-based calibration]

### Scenario: Manager Wants to Review Only Their Team

**Situation:** Manager asks "Can we just filter to my team so I can explain my ratings?"

**The problem:** This creates a silo mentality and prevents cross-manager calibration

**How to handle:**

Facilitator response:
"I understand wanting to give context for your team. Here's what we're going to do instead: We'll filter to [Job Level] across ALL managers, and when we get to your people, you'll have a chance to explain. This way we can compare similar roles across the organization."

**Why this works:**
- Acknowledges the manager's desire to provide context
- Explains the rationale for cross-manager review
- Promises they'll get airtime, just in the right context

**Alternative if org is very large:**
"We will review your team, but we'll look at your Managers alongside all other Managers in the org, then your ICs alongside all other ICs. This helps us see patterns."

### Scenario: "Everyone is Medium/Medium"

**Situation:** 70% of employees clustered in center box

[Keep existing best-practices.md content but add:]

**Level-based approach:**
1. Filter to one level (e.g., "Individual Contributors")
2. Within that level, compare employees directly
3. Ask: "If we could only promote 3 of these ICs tomorrow, who would it be?" → Those are your High Performers
4. Ask: "Who among these ICs has leadership capacity?" → Those are your High Potential
5. This forces differentiation within comparable groups

## Advanced Techniques

[Keep best-practices.md advanced section]
[Add new advanced filtering patterns]

### Advanced Filtering Patterns

**Pattern: Succession Pipeline Review**
```
Filter: High Potential + Job Level = "Manager"
Goal: See your future director pipeline
Then: High Potential + Job Level = "Director"
Goal: See your future VP pipeline
```

**Pattern: Development Planning**
```
Filter: Medium Performance + High Potential
Goal: People who need development to reach their potential
Action: Create development plans, assign mentors
```

**Pattern: Retention Risk Assessment**
```
Filter: High Performance + High Potential (your Stars)
Then: Check Intelligence for flight risk indicators
Goal: Proactive retention conversations
```

**Pattern: Performance Improvement Focus**
```
Filter: Low Performance (all boxes in left column)
Goal: Who needs performance plans or transition discussions
Exclude: Position 1 if those are new hires
```

## Pitfalls to Avoid

[Keep best-practices.md pitfalls section]
[Add new pitfalls around filtering and calibration approach]

### Don't Start with Manager-by-Manager Review

**Why it's tempting:** Feels natural to review each manager's team

**Why it's wrong:**
- Creates silos instead of calibration across managers
- Encourages defensive posture ("defend my people")
- Misses the point: you're trying to ensure consistency ACROSS managers
- Doesn't help managers calibrate their own judgment

**Do this instead:** Level-based review reveals each manager's patterns naturally

### Don't Skip Level-Based Calibration

**Why it's tempting:** Faster to just use Intelligence and spot-check anomalies

**Why it's wrong:**
- Intelligence shows symptoms, not root causes
- Doesn't build shared understanding of standards
- Managers don't learn "what good looks like"
- Misses opportunity to align on level-specific expectations

**Do this instead:** Do the level-by-level work first, intelligence last

### Don't Try to Calibrate 200 People in One Session

**Why it's tempting:** "Let's get it all done at once"

**Why it's wrong:**
- Cognitive overload leads to poor decisions
- Later employees get rushed reviews
- Can't maintain consistent standards across that many

**Do this instead:**
- Break into multiple sessions by level/function
- 20-40 employees per session max
- Take breaks between sessions
```

---

### Document Deletion

**Delete:** `workflows/talent-calibration.md`

**Reason:** Content merged into best-practices.md - no need for two calibration guides

**Migration:**
- Checklists → Move to best-practices.md
- Scenarios → Move to best-practices.md
- During-meeting content → Integrate into best-practices.md with level-based reframe

---

## Content Gaps Summary

### Critical Missing Content

1. **Level-Based Calibration Methodology**
   - Why you filter by level first
   - How to compare same-level cohorts across managers
   - Typical flow: start low, work up
   - Establishing level-specific bars of excellence

2. **Calibration Philosophy Section**
   - What calibration is trying to achieve
   - Right mindset vs wrong mindset
   - How calibration weeds out bias
   - Manager as collaborator not defender

3. **Filter Decision Tree**
   - When to use which filter type
   - Why level → function → intelligence order matters
   - When manager filtering is appropriate (rarely)

4. **Intelligence as Final Anomaly Check**
   - Position Intelligence filters as last step
   - Use AFTER level-based work is done
   - Catches outliers that survived structured review

5. **Location/Cultural Calibration**
   - Filtering by location to spot rating differences
   - Discussing whether differences are cultural or bias
   - How to handle global calibration

6. **Flag-Based Filtering Workflows**
   - Flight risk identification
   - Promotion candidate lists
   - Development planning cohorts
   - Big movers (different from historical)

### Guidance That Needs Correction

1. **Manager Filtering** (ALL DOCS)
   - Current: Review one manager's team at a time
   - Correct: Review cohorts across managers at same level
   - Goal: Consistent bar across managers, not siloed reviews

2. **"Validate High Performers" Language**
   - Current: "Check if they deserve it" (judgmental)
   - Correct: "Ensure consistent, high bar" (collaborative)

3. **Donut Mode Timing**
   - Current: During calibration meeting
   - Correct: Before meeting as prep work

4. **Filtering Order**
   - Current: No clear guidance on order
   - Correct: Level → Function → Intelligence

---

## Proposed Rewrite Examples

### Example 1: Level-Based Filtering Section

**For: getting-started.md and best-practices.md**

```markdown
## The Level-Based Calibration Approach

Here's what most people get wrong about calibration: They try to review everyone at once, or they go manager-by-manager looking at each team in isolation.

This misses the entire point of calibration.

### Why Level-First Matters

**You're trying to answer:** "Do we have consistent standards for what 'high performance' means?"

**You can only answer that by comparing similar work.**

- Comparing all Senior Engineers across different managers → You can see if standards are consistent
- Looking at Manager A's mixed team of ICs, managers, and senior leaders → You can't tell anything

**The key insight:** Your goal is to provide consistent expectations **across managers** at each level. Level-based review makes this visible.

### The Typical Flow (Organizations <100 people)

Start with your largest group and work up:

**Session 1: Individual Contributors (All Functions)**
```
Filter: Job Level = "Individual Contributor"
What you're looking for:
- Who are the real high performers at IC level?
- Do all managers have similar bars for IC performance?
- Are ratings clustered too high or too low?

Time: 30-45 minutes for 40-60 ICs
```

**Session 2: Managers (All Functions)**
```
Filter: Job Level = "Manager"
What you're looking for:
- Who shows leadership capacity among your managers?
- Different bar than ICs - looking for people management skill
- Do some managers rate their teams differently than others?

Time: 20-30 minutes for 15-20 managers
```

**Session 3: Senior Leaders (If Applicable)**
```
Filter: Job Level = "Director" or "VP"
What you're looking for:
- Strategic leadership capacity
- Succession pipeline for key roles

Time: 15-20 minutes for 5-10 leaders
```

**Session 4: Intelligence Sweep**
```
Tool: Intelligence tab
What you're looking for:
- Anomalies that survived your level-based review
- Outliers worth discussing
- Patterns you might have missed

Time: 10 minutes
```

### The Typical Flow (Organizations >100 people)

Break it down further by function within each level:

**Week 1: Individual Contributors**
- Session 1: IC → Engineering (30-40 people)
- Session 2: IC → Sales (20-30 people)
- Session 3: IC → Other functions (20-30 people)

**Week 2: Managers and Leaders**
- Session 4: All Managers across functions (15-20 people)
- Session 5: Directors and above (10 people)
- Session 6: Intelligence sweep across all

### Why This Order Works

1. **Start low, work up** - More people at lower levels = easier to spot patterns
2. **Level-first** - Ensures you're comparing similar work
3. **Function refinement** - Accounts for different performance expectations per function
4. **Intelligence last** - Final anomaly check after bulk alignment

### What About Manager-by-Manager Review?

You might be thinking: "Shouldn't we review each manager's team so we can understand their rating patterns?"

**Here's the thing:** Level-based review SHOWS you each manager's patterns without creating silos.

When you filter to "All Individual Contributors":
- You see Manager A's ICs next to Manager B's ICs next to Manager C's ICs
- Patterns become obvious: "Manager A rated 80% of their ICs as High, while B and C rated 20%"
- Discussion becomes productive: "Manager A, tell us about your high performers and how they compare to Manager B's"

**Manager-by-manager review encourages:** "Defend my people"
**Level-based review encourages:** "Let's align on what 'high performance' means"

### When Manager Filtering Makes Sense

There's ONE scenario where filtering by individual manager is appropriate:

**Large organizations where a single manager has 30+ reports spanning multiple levels**

In this case:
1. Filter to that manager
2. Then WITHIN their team, review by level
3. "Let's look at Sarah's team - first her ICs, then her managers"
4. Still use level structure, just scoped to one manager

**Even then,** you should ALSO do cross-manager level reviews to check calibration.

### Dual Goal of Calibration

When you review level-by-level across managers, you're achieving two things simultaneously:

1. **Assigning performance scores** that are fair and consistent
2. **Assessing managers' understanding** of "what good looks like"

If Manager A consistently rates higher than peers:
- It's not "Manager A is wrong"
- It's "Manager A's bar for performance might need calibrating"
- Or "Manager A's team might genuinely be stronger - let's compare evidence"

This is healthy organizational development, not a gotcha game.
```

---

### Example 2: Calibration Philosophy Opening

**For: new-to-9box.md (new section at the start)**

```markdown
## Why Calibration Matters

Let's be honest: Calibration can feel uncomfortable. You're sitting in a room with peers, discussing whether someone is really a "high performer" or just "solid." Managers sometimes feel like they're defending their people or being attacked for their ratings.

That discomfort is exactly why calibration matters.

### What Calibration Is Trying to Achieve

**The core problem:** Without calibration, every manager develops their own internal bar for performance. Manager A hands out "high performer" ratings to anyone who shows up on time and does their job. Manager B reserves "high performer" for people who consistently exceed expectations and show leadership.

**Result:** Two employees doing similar work, performing at similar levels, get wildly different ratings depending on who their manager is.

**That's not fair to anyone.**

Calibration fixes this by:
- Creating consistent expectations across all managers
- Making bias visible so it can be discussed and corrected
- Helping managers develop better judgment about performance
- Ensuring employees get fair ratings regardless of who they report to

### How Good Calibration Weeds Out Bias

When done well, calibration is an organizational health tool. Here's what it reveals:

**Pattern: Grade Inflation**
- Manager A rates 18 out of 20 people as "High Performance"
- Peers rate 20% as "High Performance"
- **The conversation:** Is Manager A's team genuinely stronger, or is their bar too low?
- **The outcome:** Either evidence supports Manager A's team quality, or they recalibrate their standards

**Pattern: Harsh Rater**
- Manager B has zero employees in top-right (Stars)
- Peers have 10-15% Stars
- **The conversation:** Is Manager B's bar too high, or do they genuinely lack top talent?
- **The outcome:** Understanding Manager B's standards and whether they need recalibration

**Pattern: Potential Inflation for New Hires**
- All employees hired in past 6 months rated "High Potential"
- **The conversation:** Are we rating potential based on interviews or actual performance?
- **The outcome:** More realistic potential assessments based on evidence

### Done well, calibration helps workers and managers understand what great performance actually looks like.

Done poorly, it becomes a defensive battle where managers protect their turf.

### The Wrong Mindset vs The Right Mindset

**WRONG MINDSET (Defensive):**
- "I need to fight for my people to keep their ratings"
- "HR is checking up on me to see if I'm too lenient"
- "If I change a rating in calibration, I failed that person"
- "This is about protecting my team from other managers"

**RIGHT MINDSET (Collaborative):**
- "I want to make sure my bar for performance matches the organization's expectations"
- "This helps me become a better manager by calibrating my judgment"
- "Honest, fair ratings help my team members understand where they really stand"
- "We're aligning on standards so everyone gets fair treatment"

### The question isn't "Are you rating too high or too low?"
### The question is "Do we all mean the same thing when we say 'high performance'?"

When everyone's aligned on that question, calibration becomes productive instead of adversarial.

### Your Role as a Calibration Participant

**If you're a manager bringing ratings to calibration:**

Come prepared to:
- Explain your ratings with specific evidence
- Listen when peers share how their bar differs from yours
- Adjust ratings when evidence shows you're out of alignment
- Learn from the discussion to improve your future judgment

Come ready to ask:
- "How does my high performer compare to yours?"
- "What does 'high performance' look like for this level in your experience?"
- "Am I being too harsh or too lenient compared to organizational standards?"

**If you're facilitating calibration:**

Your job is to:
- Create psychological safety for honest discussion
- Help the group compare similar work fairly
- Make patterns visible without making anyone feel attacked
- Drive toward alignment, not force a predetermined outcome
- Help managers learn, not catch them being wrong

Your job is NOT to:
- Prove managers wrong about their ratings
- Force a specific distribution percentage
- Make people feel bad about their judgment
- Catch leniency or harshness as if it's a crime

### Language That Helps vs Hurts

The words you choose matter. Here's how to make calibration conversations productive:

**Instead of (judgmental):** "Your ratings are too high"
**Say (collaborative):** "Let's compare your high performers to Sarah's and see what differences we notice"

**Instead of (accusatory):** "These people don't really deserve to be Stars"
**Say (inquiry):** "Walk me through what you're seeing that puts them in the Star category - what are they delivering?"

**Instead of (attacking):** "You're inflating your team's performance"
**Say (alignment-seeking):** "Your bar for 'high performance' might be different than the org's - let's make sure we're aligned on what that means"

### The frame shift: From "Who's right?" to "Are we aligned?"

When calibration focuses on alignment rather than judgment, everyone relaxes. Managers feel safe sharing their reasoning. The group can have honest conversations about what performance standards should be.

And that's when calibration becomes powerful: Not as a checking mechanism, but as a learning and alignment tool.

### How 9Boxer Supports Good Calibration

The 9-box grid and 9Boxer tool make calibration more effective by:

**Visualizing patterns:**
- Grade inflation becomes obvious when you see one manager's distribution vs others
- Talent gaps are visible when you filter by level and see who you have (or don't have)
- Cross-manager comparisons are easy when you can see all "Senior Engineers" on screen together

**Providing structure:**
- Level-based filtering ensures fair comparisons (similar work)
- Intelligence analysis spots statistical anomalies automatically
- Change tracking creates audit trail of calibration decisions

**Creating shared language:**
- Everyone looking at same grid, same data
- Positions have clear definitions (Star, Core Performer, etc.)
- Visual representation reduces ambiguity

The tool doesn't make calibration easy (it's still hard work), but it makes it fairer and more transparent.

---

**Ready to run your first calibration?** Continue to [Quick Calibration Workflow](getting-started.md) for the step-by-step process.

**Want to understand the 9-box positions first?** Jump to [Understanding the 9 Positions](#understanding-the-9-positions) below.
```

---

### Example 3: Reframed Filtering Guidance

**For: best-practices.md**

```markdown
## Filtering Strategy for Calibration

Filters are your most powerful calibration tool, but only if you use them in the right order with the right mindset.

### The Filter Hierarchy

Think of filtering like using a microscope with multiple lenses. You start with low magnification (broad view) and increase magnification (narrow focus) as needed.

**Level 1: By Job Level (START HERE)**
- Broadest, most important lens
- Compares similar work across all managers
- Reveals rating patterns and bias most clearly

**Level 2: By Function (REFINE)**
- Narrows within a level to account for role differences
- Engineering vs Sales vs Marketing have different performance expectations
- Use when level alone is too broad

**Level 3: By Location (CULTURAL CALIBRATION)**
- Identifies cultural differences in rating standards
- Global orgs: Asia vs US vs Europe might rate differently
- Decide whether to normalize or accept differences

**Level 4: Intelligence & Flags (FINAL SWEEP)**
- Automated anomaly detection after bulk work is done
- Catches outliers that survived structured review
- Flag-based filters for specific cohorts (flight risk, promotion candidates)

**Level 5: By Manager (RARELY)**
- Use only when individual manager has 30+ reports
- Even then, still review by level within their team
- Primary review should still be cross-manager by level

### Level-First: Why It's Non-Negotiable

**Scenario:** You have 80 employees across 4 managers

**WRONG APPROACH: Manager-by-manager**
```
Filter: Manager = Sarah → Review her 20 people
Filter: Manager = Alex → Review his 20 people
Filter: Manager = Jordan → Review their 20 people
Filter: Manager = Taylor → Review their 20 people
```

**What you miss:**
- Can't compare Sarah's "high performers" to Alex's
- Can't see if one manager rates systematically higher/lower
- Creates siloed discussions: "Let me explain MY team"
- Managers defend ratings instead of calibrating

**RIGHT APPROACH: Level-first**
```
Filter: Job Level = "Individual Contributor" → See all 60 ICs across all managers
Filter: Job Level = "Manager" → See all 15 managers across all senior leaders
Filter: Job Level = "Director" → See all 5 directors
```

**What you gain:**
- Sarah's ICs directly next to Alex's ICs on the grid
- Patterns obvious: "Sarah rated 80% high, Alex rated 20% high"
- Discussion becomes productive: "Let's compare these high performers and align on standards"
- Managers calibrate together instead of separately

### Function + Level: When and Why

After level filtering, sometimes you need to refine by function.

**When to add function:**

**Example 1: Different Performance Expectations**
```
Engineering "high performer" = ships complex features independently, mentors others
Sales "high performer" = exceeds quota by 20%+, generates new pipeline

These require different evidence. Filtering to "IC + Engineering" vs "IC + Sales" lets you apply appropriate standards.
```

**Example 2: Functional Talent Gaps**
```
Filter: High Potential + Engineering → 12 people
Filter: High Potential + Sales → 2 people

Reveals: Strong engineering pipeline, weak sales pipeline
Action: Targeted hiring or development in sales
```

**Example 3: Function-Specific Calibration**
```
Filter: Job Level = "Manager" + Function = "Engineering"
→ Review all Engineering Managers together
→ Ensures consistent bar for "high performing manager" in engineering

Then: Job Level = "Manager" + Function = "Sales"
→ Review all Sales Managers together
→ Different leadership expectations than engineering
```

**When NOT to add function:**
- Small teams (<20 per function) - not enough data for patterns
- When job level alone provides sufficient differentiation
- First pass review - add function on second pass if needed

### Location Filtering: Global Calibration

If you operate globally, location filtering reveals cultural rating differences.

**Scenario: Multi-country calibration**

```
Filter: Location = "United States" → Check distribution
Filter: Location = "Singapore" → Check distribution
Filter: Location = "Germany" → Check distribution
```

**Common patterns:**
- Asian offices often rate more conservatively (fewer "Highs")
- US offices may show grade inflation (more "Highs")
- European offices may cluster in middle

**The discussion you need:**
1. Are these differences real performance variation?
2. Are they cultural differences in rating standards?
3. Should we normalize ratings across locations?
4. Should we accept location-specific standards?

**No single right answer** - depends on your org culture and global strategy.

### Intelligence Filtering: The Final Anomaly Sweep

Intelligence should come LAST, not first.

**Why last?**
- Intelligence shows symptoms, not root causes
- Without context from level-based review, anomalies are confusing
- Level-based work resolves most issues before you get to Intelligence

**The right workflow:**

```
Step 1: Complete level-by-level calibration
Step 2: Click Intelligence tab
Step 3: Review remaining anomalies
Step 4: Discuss outliers that survived structured review
```

**What Intelligence catches:**
- Statistical outliers you might have missed
- Patterns across multiple dimensions (e.g., "Flight risk + High Potential + Engineering")
- Tenure-based anomalies ("All new hires rated High Potential")
- Systematic bias after calibration ("Still seeing leniency bias in one manager")

**What to do with Intelligence anomalies:**
- **Red flags** = Discuss immediately, likely needs rating change
- **Yellow flags** = Worth reviewing, might be justified
- **Patterns** = Organizational insight, discuss strategy

### Flag-Based Filtering: Special Cohorts

After calibration, flags help you create action lists.

**Retention Watch:**
```
Filter: High Performance + High Potential + [Flight Risk flag if available]
Goal: Proactive retention conversations
Action: Compensation review, engagement plans, career conversations
```

**Promotion Pipeline:**
```
Filter: High Potential + Job Level = "Individual Contributor"
Goal: See your future manager pipeline
Action: Leadership development, stretch assignments
```

**Development Focus:**
```
Filter: Medium Performance + High Potential
Goal: People with capacity but not yet delivering
Action: Development plans, mentorship, skill training
```

**Performance Improvement:**
```
Filter: Low Performance (all left-column boxes)
Exclude: Position 1 if those are "too new to rate"
Goal: Who needs performance plans
Action: PIP conversations, coaching, or transition planning
```

### The Manager Filter: Use Sparingly

**When manager filtering IS appropriate:**

1. **Large manager span** - Manager has 30+ reports spanning multiple levels
   ```
   Filter: Manager = Sarah
   Then within: Job Level = IC, then Manager, then Director
   Still use level structure, just scoped to Sarah's team
   ```

2. **Targeted coaching** - After calibration, coaching individual manager on their patterns
   ```
   Filter: Manager = Alex (who showed leniency bias in calibration)
   Goal: Work 1:1 with Alex to recalibrate their standards
   ```

3. **Follow-up discussions** - After cross-manager calibration, individual manager prep
   ```
   Filter: Manager = Jordan
   Goal: Jordan prepares to communicate changes to their team
   ```

**When manager filtering IS NOT appropriate:**

1. **Primary calibration approach** - Defeats the purpose of cross-manager alignment
2. **"Review each manager's team"** - Creates silos instead of calibration
3. **Defending individual ratings** - Encourages territorialism

### Putting It All Together: Example Session Flow

**Organization: 100 employees, 5 managers, 3 departments**

**Pre-meeting (Solo prep):**
```
Filter: Job Level = "IC" → Review all 70 ICs
Note: Patterns in distribution, potential discussion topics

Filter: Job Level = "Manager" → Review all 20 managers
Note: Who shows leadership capacity

Filter: Job Level = "Director" → Review all 10 directors
Note: Succession pipeline
```

**Meeting Session 1 (60 min):**
```
0:00-30:00 → Filter: IC + Engineering (40 people)
30:00-55:00 → Filter: IC + Sales (20 people)
55:00-60:00 → Filter: IC + Other (10 people)
```

**Meeting Session 2 (45 min):**
```
0:00-30:00 → Filter: Job Level = Manager (all 20 managers)
30:00-40:00 → Filter: Job Level = Director (all 10 directors)
40:00-45:00 → Intelligence tab anomaly sweep
```

**Post-meeting (Solo):**
```
Filter: High Potential + High Performance → Retention list (12 people)
Filter: Low Performance → Performance improvement list (8 people)
Filter by Manager → Prep each manager for their team conversations
```

### Common Filtering Mistakes

**Mistake 1: Starting with Intelligence**
- Problem: Symptoms without context, overwhelming anomaly count
- Fix: Do level-based work first, Intelligence last

**Mistake 2: Manager-by-manager as primary approach**
- Problem: Silos, defensiveness, missed cross-manager patterns
- Fix: Level-first always, manager filter only for follow-up

**Mistake 3: Too many filters at once**
- Problem: Over-narrowed view, can't see patterns
- Fix: Start broad (level), narrow gradually (function, then location, then flags)

**Mistake 4: No filtering at all**
- Problem: Cognitive overload trying to review 100+ people simultaneously
- Fix: Use filters to create manageable 20-40 person review groups

**Mistake 5: Forgetting to clear filters**
- Problem: Confusion about which employees you're looking at
- Fix: Clear filters between different focus areas, be explicit about current filter state

### Filter Checklist for Calibration

Before your calibration meeting, prepare these filter views:

- [ ] All Individual Contributors (level-first baseline)
- [ ] ICs by each major function (if org >50 people)
- [ ] All Managers (level-first for leadership)
- [ ] All Senior Leaders (Directors+)
- [ ] High Potential pipeline (for succession planning)
- [ ] Low Performance cohort (for performance improvement planning)
- [ ] Intelligence anomalies (for final discussion topics)

During the meeting, apply filters in this order:

1. Level (IC, Manager, Director)
2. Function within level (if needed)
3. Location (if global org)
4. Intelligence (final sweep)
5. Manager (only for follow-up)

After the meeting, use these filters for action planning:

- [ ] Retention watch list (High Perf + High Pot)
- [ ] Development cohort (Med Perf + High Pot)
- [ ] Performance improvement (Low Performance)
- [ ] Promotion pipeline (High Potential by level)
```

---

## Tone Transformation Examples

### Example: Statistics Section Rewrite

**Current (getting-started.md, lines 92-106):**

```markdown
### Review the Statistics Tab

Click the **Statistics** tab in the right panel to see how your talent is distributed.

**Look for these red flags:**

- ⚠️ **Too many "High" ratings** (>25% in top row) - Possible grade inflation
- ⚠️ **Too few Stars** (<5% in top-right corner) - Succession planning risk
- ⚠️ **Everyone clustered in center** (>70% in position 5) - Poor differentiation
```

**Rewritten (Authentic, Goal-Oriented):**

```markdown
### Check Your Distribution (Does It Make Sense?)

Click the **Statistics** tab to see how your people are spread across the grid.

**Here's what to look for:**

If 80% of your people are in the top row ("High" something), you've got grade inflation. Not everyone can be above average - that's mathematically impossible and organizationally unhelpful.

If you have less than 5% in the top-right corner (Stars), ask yourself: Do we genuinely have no future leaders, or are we under-rating our talent? Most healthy orgs have 10-15% Stars.

If 70% of your employees are sitting in the center box, that's a yellow flag. The center often becomes a default "I'm not sure where they belong" bucket. Use Donut Mode to challenge those placements.

**What healthy distribution looks like:**
- 10-15% in the top-right (Stars) - your future leaders
- 50-60% in the middle tier - solid, reliable performers
- A few in the bottom-left - new hires or folks who need support
- Some scatter in other boxes - high performers who aren't future managers, high-potential folks still developing, etc.

If your distribution looks wildly different, that's not necessarily wrong - but it's worth discussing in calibration.
```

---

### Example: Manager Filtering Rewrite

**Current (getting-started.md, lines 165-172):**

```markdown
=== "Manager Comparison"
    **Goal:** Compare one manager's ratings to others

    - Managers: Select one manager
    - Review their distribution vs. company averages

    **Questions to prepare:**
    - Does this manager rate higher/lower than peers?
    - Are there patterns in their ratings?
```

**Rewritten (Corrected Approach, Authentic Tone):**

```markdown
### About Manager Filtering (Use Sparingly)

You might think: "Shouldn't I filter by manager to see each person's team?"

Here's the thing - that's usually backwards.

**What you actually want:** Look at all people at the same level across different managers. This shows you whether Manager A's "high performers" stack up to Manager B's.

**Example:**
```
Filter: Job Level = "Individual Contributor"
Now you see: Manager Sarah's ICs, Manager Alex's ICs, Manager Jordan's ICs - all together
Pattern becomes obvious: Sarah rated 90% of her ICs as "High Performance" while Alex rated 15%
Discussion: "Sarah, tell us about your high performers and how they compare to Alex's"
```

**This reveals manager patterns without creating defensiveness.**

**When IS manager filtering useful?**

Two scenarios:
1. **Post-calibration follow-up** - After you've done cross-manager calibration, filter by manager to prep them for team conversations
2. **Very large manager spans** - If one manager has 40+ reports, filter to their team but STILL review by level within their group

**In calibration meeting itself:** Stick to level-based filtering. It keeps comparisons fair and prevents the "defend my turf" mentality.
```

---

## Implementation Recommendations

### Phase 1: Critical Content Fixes (Week 1-2)

**Priority: HIGH - These are factually wrong and need immediate correction**

1. **Rewrite all manager filtering guidance**
   - getting-started.md lines 165-172
   - talent-calibration.md lines 76-82
   - best-practices.md lines 240-260
   - Change from "review by manager" to "review by level across managers"

2. **Add level-based calibration section**
   - Create new section in getting-started.md explaining level-first approach
   - Add to best-practices.md with detailed filter decision tree
   - Include "why this order matters" rationale

3. **Add calibration philosophy section**
   - Expand new-to-9box.md with new opening section
   - Set proper mindset before people start calibrating
   - Explain what calibration achieves and how to show up

4. **Correct Donut Mode positioning**
   - Change from "during meeting" to "before meeting prep"
   - All three docs need this correction

**Deliverables:**
- 4 documents with critical corrections
- Level-based methodology clearly explained
- Philosophy section added to new-to-9box.md

---

### Phase 2: Tone Transformation (Week 3-4)

**Priority: MEDIUM - Important for user experience**

1. **Rewrite all filtering sections** with authentic, conversational tone
2. **Transform statistics language** from "red flags" to "conversation starters"
3. **Reframe validation language** from judgmental to collaborative
4. **Add "why this matters" context** throughout
5. **Remove corporate HR speak** - make it feel like peer guidance

**Approach:**
- Go section by section through each doc
- Apply voice-and-tone-guide.md principles
- Test reading aloud - if it sounds formal, rewrite
- Add concrete examples and scenarios

**Deliverables:**
- All 4 docs with transformed tone
- Conversational, authentic voice throughout
- Real-world examples and scenarios

---

### Phase 3: Content Consolidation (Week 5)

**Priority: MEDIUM - Reduces duplication**

1. **Merge talent-calibration.md into best-practices.md**
   - Move checklists
   - Integrate scenarios
   - Consolidate during-meeting guidance

2. **Remove duplicate content**
   - Statistics review appears 3x - keep one detailed version, brief summaries elsewhere
   - Filtering guidance appears 3x - consolidate into best-practices.md with references
   - Donut Mode references - align all to same positioning

3. **Create clear document hierarchy**
   - new-to-9box.md = Philosophy and introduction
   - getting-started.md = Quick workflow (15-minute read)
   - best-practices.md = Complete guide (30-minute read with all details)

**Deliverables:**
- 3 documents instead of 4
- Clear progression: Philosophy → Quick Start → Deep Guide
- No content duplication

---

### Phase 4: New Content Addition (Week 6)

**Priority: LOWER - Enhancement, not correction**

1. **Add filter decision tree** to best-practices.md
2. **Add location/cultural calibration** section
3. **Add flag-based filtering workflows**
4. **Add "big movers" guidance** (vs historical movement)
5. **Expand intelligence filtering** as final anomaly sweep

**Deliverables:**
- Complete filtering reference in best-practices.md
- Decision tree for when to use which filter
- Cultural calibration guidance

---

## Success Criteria

### Content Accuracy

- [ ] All filtering guidance shows level-first approach
- [ ] No manager-by-manager as primary calibration method
- [ ] Intelligence positioned as final sweep, not first step
- [ ] Donut Mode positioned as prep work, not during-meeting
- [ ] Language reframed from judgmental to collaborative

### Tone Quality

- [ ] Conversational, second-person throughout
- [ ] Active voice, contractions used naturally
- [ ] Authentic peer voice, not corporate HR speak
- [ ] "Why this matters" context provided
- [ ] Real-world examples and scenarios

### User Experience

- [ ] Philosophy grounds users before tactical work
- [ ] Quick workflow gets users started in 15 minutes
- [ ] Complete guide provides depth when needed
- [ ] Clear document progression (intro → quick → deep)
- [ ] No confusing duplication

### Organizational Health

- [ ] Calibration framed as alignment, not gotcha
- [ ] Manager mindset guidance promotes collaboration
- [ ] Bias detection framed as organizational health tool
- [ ] Language promotes fairness and consistency
- [ ] Philosophy emphasizes helping workers and managers succeed

---

## Questions for Discussion

Before proceeding with rewrites, we should discuss:

1. **Document naming:** Should getting-started.md be renamed "quick-calibration-workflow.md" for clarity?

2. **Philosophy placement:** Should calibration philosophy be its own doc, or expand new-to-9box.md?

3. **Depth of filtering guide:** How detailed should the filter decision tree be? Risk of overwhelming?

4. **Manager filtering:** Should we completely remove manager filtering guidance, or keep it with strong warnings?

5. **Tone target:** How conversational is too conversational for enterprise HR users?

6. **Screenshot strategy:** Which new concepts need visual support?

---

## Appendix: Voice & Tone Examples

### Current vs Target Tone

**Statistics Section:**

Current:
> "The Intelligence tab provides statistical analysis to identify anomalies"

Target:
> "Intelligence runs the numbers behind the scenes to spot patterns you might miss"

---

**Filtering Guidance:**

Current:
> "Utilize filters to narrow your focus to relevant employee cohorts"

Target:
> "Don't try to calibrate 200 people at once. Use filters to look at manageable groups."

---

**Manager Comparison:**

Current:
> "Ensure consistent rating standards across all organizational managers"

Target:
> "You're trying to make sure Manager A's 'high performers' would still be high performers if they worked for Manager B. That's fair to everyone."

---

**Validation Language:**

Current:
> "Validate that high performers truly deserve their ratings"

Target:
> "Make sure you have a consistent, high bar for high performers and that leadership agrees these folks meet that bar"

---

**Calibration Mindset:**

Current:
> "Participate collaboratively in calibration discussions"

Target:
> "Come to calibration ready to align, not defend. It's not about proving you're right - it's about making sure we all mean the same thing when we say 'high performer.'"

---

## Next Steps

1. **Review this analysis** - Discuss findings and recommendations
2. **Prioritize fixes** - Agree on Phase 1 critical corrections
3. **Approve tone direction** - Confirm target voice is appropriate
4. **Begin rewrites** - Start with critical content corrections
5. **Iterate** - Review drafts and refine

**Estimated effort:**
- Phase 1 (Critical fixes): 20 hours
- Phase 2 (Tone transformation): 30 hours
- Phase 3 (Consolidation): 15 hours
- Phase 4 (New content): 20 hours
- **Total: 85 hours over 6 weeks**

---

**Ready to proceed?** Let's start with Phase 1 critical corrections to fix the fundamentally incorrect filtering guidance.
