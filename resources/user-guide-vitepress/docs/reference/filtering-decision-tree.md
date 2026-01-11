---
title: Filter Strategy Reference
description: Complete guide to choosing the right filters for your calibration session
---

# Filter Strategy Reference

Filters are your most powerful calibration tool - but only when you use them in the right order with the right strategy.

This guide shows you exactly when and why to use each filter type, with concrete examples for different organization sizes and calibration goals.

## Why Filter Strategy Matters

Here's the mistake most people make during calibration: They either try to review 200 people at once (cognitive overload) or they go manager-by-manager reviewing each team in isolation (creates silos and defensiveness).

Both approaches miss the point of calibration entirely.

**Calibration is about ensuring consistent standards across managers at each level.** The right filtering strategy makes this visible and achievable.

---

## The Filter Hierarchy

Think of filtering like using a microscope with progressive lenses. You start with low magnification to see broad patterns, then increase magnification to examine specific details.

### Level 1: By Job Level (PRIMARY - START HERE)

**Why this is first:** You can only ensure fair ratings by comparing similar work. Comparing all "Senior Engineers" across different managers reveals whether standards are consistent. Looking at one manager's mixed team of ICs, managers, and directors tells you nothing about calibration.

**What it reveals:** Manager rating patterns, grade inflation or deflation, organizational talent gaps

**When to use:** Every calibration session should start here

**Example filters:**
- Job Level = "Individual Contributor"
- Job Level = "Manager"
- Job Level = "Director"

#### Special Case: New Hires in Level-Based Calibration

**The challenge:** When filtering by job level, new hires (under 6 months tenure) appear mixed with experienced employees at the same level. This creates a calibration problem - it's often too early to fairly rate new hires, but you need to see the full picture.

**Why it matters:** A new Senior Engineer with 2 months tenure can't be fairly compared to a Senior Engineer with 3 years tenure. They're at the same level, but one is still ramping while the other should be fully productive.

**Three approaches to handle new hires:**

**Option 1: Include with "Too New to Rate" flag (Recommended)**

Keep new hires visible in the level-based view, but flag them clearly so you don't unfairly compare them.

```
Filter: Job Level = "Individual Contributor"
Result: All ICs including new hires

During review:
  → New hire (2 months): Note "Too new to rate - still ramping"
  → Don't compare their performance to tenured employees
  → Focus calibration on employees with 6+ months tenure
```

**Why this works:**
- You see the full talent picture at each level
- New hires don't get unfair ratings based on incomplete evidence
- You can still discuss "ramping well" vs "struggling to ramp" if relevant

**When someone is "too new to rate":**
- Individual Contributors: First 6 months (longer for highly technical roles)
- Managers: First 6-9 months (need time to build team relationships)
- Senior Leaders: First 9-12 months (strategic impact takes longer to assess)

**Option 2: Review separately after level calibration**

Complete your level-based calibration, then review new hires as a separate cohort.

```
Step 1: Filter by Job Level = "IC" + Tenure > 6 months
  → Calibrate tenured ICs first

Step 2: Then review new hires separately
  → Filter: Tenure < 6 months
  → Discuss ramping progress, not final ratings
  → Document development needs
```

**Why this works:**
- Clean separation between "fair to rate" and "too new to rate"
- Dedicated time to discuss new hire development
- No risk of unfair comparisons

**When to use:** Large new hire cohorts (10+ new hires), structured onboarding programs

**Option 3: Exclude from formal calibration**

Don't rate new hires at all during calibration - wait until next cycle when they have enough tenure.

```
Filter: Job Level = "IC" + Tenure > 6 months
  → Only see tenured employees
  → New hires not rated this cycle

At next calibration (6 months later):
  → New hires now have 6-12 months tenure
  → Fair to rate and compare
```

**Why this works:**
- Completely avoids premature ratings
- No risk of unfair performance judgments
- Simple and clean

**When to use:** Small new hire populations, annual calibration cycles

**Decision guide for new hires:**

```
Do you have many new hires (>15% of the cohort)?
  → YES: Use Option 2 (Review separately)
  → Creates dedicated space for new hire discussion

Are new hires spread across multiple teams/managers?
  → YES: Use Option 1 (Include with flag)
  → Helps identify ramping patterns across managers

Do you calibrate frequently (quarterly or more)?
  → YES: Use Option 3 (Exclude and wait)
  → They'll have tenure soon enough

Default choice if unsure:
  → Use Option 1 (Include with flag)
  → Most flexible, maintains full visibility
```

**Special consideration: High new hire volume organizations**

If your organization hires in large cohorts (campus recruiting, rapid growth phases), consider a dedicated "New Hire Cohort Review" separate from regular calibration:

```
Quarterly New Hire Review:
  Filter: Tenure < 6 months

  Focus areas:
    → Ramping velocity (fast, on-track, struggling)
    → Fit and engagement (settling in well, culture questions)
    → Manager support needs (which managers need help onboarding)
    → Development priorities (training gaps, mentorship needs)

  Don't compare to tenured employees
  Don't assign formal performance ratings
  Do identify early red flags and support needs
```

**Sample facilitator language:**

**Flagging new hires during calibration:**
> "I see Sarah here - she's only been with us 3 months. Too early for a fair performance rating. Let's note that she's ramping well and move to employees we can meaningfully calibrate."

**Handling premature ratings:**
> "I notice we've rated this person as High Performer, but they've only been here 4 months. We don't have enough evidence yet. I'd recommend holding off on a formal rating until they hit 6 months. If we need a placeholder, let's note 'Ramping on track - evaluate next cycle.'"

**New hire cohort discussion:**
> "We have 8 new hires in this IC cohort. Rather than try to rate them against 3-year veterans, let's do a quick separate review. Are they ramping as expected? Any early concerns? Any standouts we should watch?"

### Level 2: By Function (SECONDARY - REFINE)

**Why this comes second:** Different functions have different performance expectations. An Engineering "high performer" looks different than a Sales "high performer" - they require different evidence and deliver different results.

**What it reveals:** Function-specific talent gaps, whether engineering standards match sales standards

**When to use:** After level filtering, when your org has 100+ people or distinct functional differences

**Example filters:**
- Job Level = "Individual Contributor" + Function = "Engineering"
- Job Level = "Manager" + Function = "Sales"

### Level 3: By Location (CULTURAL CALIBRATION)

**Why this matters:** Global organizations often see cultural differences in rating standards. Asian offices may rate more conservatively while US offices show grade inflation. You need to identify these patterns and decide whether to normalize or accept them.

**What it reveals:** Cultural rating bias, location-specific talent strengths, whether standards are globally consistent

**When to use:** Global organizations with multiple office locations, after level-based calibration

**Example filters:**
- Location = "Singapore" vs "United States" vs "Germany"

### Level 4: Intelligence & Flags (FINAL SWEEP)

**Why this comes last:** Intelligence shows symptoms, not root causes. Without the context from level-based review, anomalies are just confusing noise. After you've done the structured work, Intelligence catches the outliers you might have missed.

**What it reveals:** Statistical anomalies, retention risks, promotion candidates, patterns across multiple dimensions

**When to use:** Final discussion topics after level-by-level review is complete

**Example uses:**
- Find remaining outliers after calibration
- Identify flight risks among high performers
- Build development cohorts

### Level 5: By Manager (RARELY - USE SPARINGLY)

**Why this is last:** Manager filtering creates siloed discussions where managers "defend their turf" instead of calibrating together. It defeats the entire purpose of cross-manager calibration.

**What it's useful for:** Post-calibration follow-up with individual managers, coaching managers on their patterns, very large manager spans (30+ reports)

**When to avoid:** Primary calibration approach, during calibration meetings, any time you want to ensure consistent standards

---

## Complete Decision Tree

Use this decision tree to determine which filters to apply for different calibration goals:

### Goal: Fair, Consistent Ratings Across the Organization

**START: Filter by Job Level**
```
Step 1: Job Level = "Individual Contributor"
  → Review ALL ICs across all managers together
  → Look for: Manager patterns, consistent bar for IC performance
  → Time: 30-45 minutes for 40-60 ICs

Step 2: Job Level = "Manager"
  → Review ALL managers across the organization
  → Look for: Leadership capacity, succession pipeline
  → Time: 20-30 minutes for 15-20 managers

Step 3: Job Level = "Director" (if applicable)
  → Review ALL senior leaders
  → Look for: Strategic leadership, executive readiness
  → Time: 15 minutes for 5-10 directors

Step 4: Intelligence tab
  → Final anomaly sweep
  → Look for: Outliers that survived level-based review
  → Time: 10 minutes
```

**Why this works:** You're comparing apples to apples at each level, which reveals manager patterns naturally and ensures fairness.

### Goal: Review Specific Manager's Team

**WARNING: This is usually the wrong approach**

Instead of filtering by manager, do this:

```
WRONG: Manager = "Sarah" → Review her 20 mixed employees
  Problem: Can't compare to other managers, creates defensiveness

RIGHT: Job Level = "IC" → See Sarah's ICs next to Alex's ICs
  Benefit: Sarah's patterns become visible, comparisons are fair
```

**Only filter by manager when:**
- Manager has 30+ reports spanning multiple levels (then still review by level within their team)
- Post-calibration follow-up to prep manager for team conversations
- 1:1 coaching session to help manager recalibrate their standards

### Goal: Find Promotion Candidates

**Filter combination approach:**

```
Step 1: High Performance + High Potential
  → Shows your Stars (top-right corner)
  → These are your promotion candidates

Step 2: Add Job Level to refine
  → High Perf + High Pot + Job Level = "Individual Contributor"
  → See your future manager pipeline

  → High Perf + High Pot + Job Level = "Manager"
  → See your future director pipeline

Step 3: Add Function if needed
  → High Perf + High Pot + Job Level = "Manager" + Function = "Engineering"
  → See your future Engineering Director pipeline
```

**Why this works:** Progressive refinement from broad (all Stars) to specific (Engineering manager promotion candidates).

### Goal: Address Cultural Rating Differences

**Location-based filtering sequence:**

```
Step 1: Location = "United States"
  → Note distribution and patterns
  → Example: 25% rated High Performance

Step 2: Location = "Singapore"
  → Compare to US distribution
  → Example: 10% rated High Performance

Step 3: Discussion questions
  → Is this real performance difference or rating bias?
  → Should we normalize across locations?
  → Are cultural expectations different?

Step 4: Combine with Job Level
  → Location = "Singapore" + Job Level = "IC"
  → Deeper comparison at same level across locations
```

**Why this works:** Makes cultural rating patterns visible so you can address them systematically.

### Goal: Find Flight Risks

**Intelligence and flag-based approach:**

```
Step 1: Filter by High Performance + High Potential
  → Your top talent (Stars)

Step 2: Use Intelligence tab
  → Look for flight risk indicators among Stars
  → Tenure patterns, engagement signals, external offers

Step 3: Create action list
  → Export filtered list
  → Plan retention conversations
  → Review compensation and career path
```

**Why this works:** Focuses your retention efforts on high-impact employees who might leave.

### Goal: Quick Anomaly Check

**Intelligence-first approach (only for spot-checking, not calibration):**

```
When to use: Between formal calibrations, quick health check

Step 1: Open Intelligence tab
  → Review red/yellow anomalies
  → Statistical outliers, unusual patterns

Step 2: For each anomaly, add context with level filtering
  → Intelligence shows "Manager A rates everyone high"
  → Filter: Manager = A + Job Level = IC
  → See the pattern in context

IMPORTANT: Don't use this as your primary calibration method
```

**Why limited use:** Intelligence without level-based context leads to spot-fixes instead of systematic calibration.

---

## When to Use Each Filter Type

### By Level (Primary Approach)

**Start here. Always.**

Comparing people at the same level across different managers is the foundation of fair calibration. This reveals whether Manager A's "high performers" would still be high performers if they worked for Manager B.

**Specific use cases:**

**Small orgs (<100 people):**
```
Session 1: All Individual Contributors (all functions together)
Session 2: All Managers (all functions together)
Session 3: All Directors/Senior Leaders (if applicable)
Session 4: Intelligence sweep
```

**Medium orgs (100-500 people):**
```
Week 1: Individual Contributors by function
  - IC + Engineering
  - IC + Sales
  - IC + Operations

Week 2: Leadership by function
  - Managers (all or by function)
  - Directors and above

Week 3: Intelligence sweep and follow-up
```

**Large orgs (500+ people):**
```
Break into multiple calibration cycles:
  - Cycle 1: ICs in Division A by function + level
  - Cycle 2: ICs in Division B by function + level
  - Cycle 3: All managers across divisions
  - Cycle 4: Senior leadership
  - Final: Intelligence sweep across entire org
```

**Why level-first reveals manager patterns:**

When you filter to "All Individual Contributors," you see:
- Manager A's 15 ICs next to Manager B's 12 ICs next to Manager C's 18 ICs
- Pattern becomes obvious: "Manager A rated 80% of ICs as High, while B and C rated 20%"
- Discussion becomes productive: "Manager A, tell us about your high performers compared to Manager B's"

**The key insight:** You're achieving two goals simultaneously:
1. Assigning fair performance scores
2. Assessing whether managers understand "what good looks like"

If Manager A consistently rates higher than peers, it's not "Manager A is wrong." It's either:
- Manager A's team is genuinely stronger (show evidence)
- Manager A's bar for "high performance" needs calibrating (healthy organizational development)

### By Function + Level

**Use when:** Organizations with 100+ people or distinct functional differences

Function filtering accounts for the reality that different roles have different performance expectations.

**Engineering high performer:**
- Ships complex features independently
- Mentors junior engineers
- Influences technical architecture
- Reduces technical debt

**Sales high performer:**
- Exceeds quota by 20%+
- Generates new pipeline
- Closes complex deals
- Builds customer relationships

These require different evidence. You can't fairly compare an engineer to a salesperson.

**Example filtering combinations:**

**Engineering leadership pipeline:**
```
Filter: High Potential + Function = "Engineering" + Job Level = "IC"
Result: Future engineering managers
Action: Leadership development, stretch assignments
```

**Sales talent gap analysis:**
```
Filter: Function = "Sales" + Job Level = "IC"
Review distribution: Only 2 out of 20 in top-right corner
Discussion: Do we have a sales hiring problem or development gap?
```

**Cross-functional manager calibration:**
```
Session 1: Job Level = "Manager" + Function = "Engineering"
  → All Engineering Managers together
  → Establish consistent bar for engineering leadership

Session 2: Job Level = "Manager" + Function = "Sales"
  → All Sales Managers together
  → Different leadership expectations than engineering

Then compare: Do our best Engineering Managers match our best Sales Managers?
```

**When NOT to add function:**
- Small orgs (<50 people) - not enough data for meaningful patterns
- First pass review - add function on second pass if needed
- When job level alone provides sufficient differentiation

### By Location (Cultural Calibration)

**Use when:** Global organization with offices in multiple countries or regions

Location filtering reveals whether rating standards are culturally consistent or if some offices rate systematically higher or lower.

**Common global patterns:**

**Grade inflation in US offices:**
```
Filter: Location = "United States"
Distribution: 35% in top row (High Performance)

Filter: Location = "Singapore"
Distribution: 12% in top row (High Performance)

Discussion: Is US team genuinely stronger, or are US managers more lenient?
```

**Conservative rating in Asian offices:**
```
Filter: Location = "Tokyo"
Pattern: Very few Stars (3%), most employees in center box

Filter: Location = "London"
Pattern: Balanced distribution (12% Stars)

Discussion: Cultural tendency toward modesty in ratings, or genuinely different performance?
```

**Practical calibration approach:**

**Option 1: Location-first, then normalize**
```
Step 1: Review each location separately
  → Understand local distribution and context

Step 2: Look for systematic differences
  → Statistical analysis of rating patterns by location

Step 3: Discuss with location leaders
  → "Your office rates 20% lower than others - what's driving this?"

Step 4: Decide on normalization approach
  → Adjust ratings to match global standards, or
  → Accept location-specific differences with documentation
```

**Option 2: Level-first, location-second**
```
Step 1: Filter by Job Level = "IC"
  → Review all ICs globally

Step 2: Add Location filter
  → Job Level = "IC" + Location = "Singapore"
  → Compare Singapore ICs to US ICs at same level

Step 3: Calibrate across locations
  → Ensure Singapore "high performers" match US "high performers"
```

**Questions to ask:**
- Are cultural expectations genuinely different (e.g., Asian modesty in self-ratings)?
- Do managers in some locations lack calibration training?
- Should we have global standards or location-specific standards?
- How do we explain differences to employees?

### By Manager (Use Sparingly)

**The key message: Manager filtering is usually the wrong approach for calibration.**

**Why it's tempting:**
- Feels natural to review "Sarah's team" then "Alex's team" then "Jordan's team"
- Managers want to explain their ratings in context
- Seems organized and systematic

**Why it's wrong for calibration:**
- Creates silos instead of cross-manager comparison
- Encourages defensive posture ("I need to defend my people")
- Misses the entire point: ensuring consistency ACROSS managers
- Doesn't help managers learn what "good" looks like at each level

**What happens with manager-by-manager review:**
```
Filter: Manager = "Sarah" → Review her 20 employees
  - Sarah explains each rating
  - Group listens and maybe asks questions
  - Move on to next manager

Result: Each manager's ratings exist in isolation, no comparison, no calibration
```

**What happens with level-based review:**
```
Filter: Job Level = "IC" → See all ICs across all managers
  - Sarah's 8 ICs next to Alex's 6 ICs next to Jordan's 7 ICs
  - Pattern visible: Sarah rated 7/8 as High, Alex rated 1/6 as High
  - Discussion: "Sarah and Alex, let's compare your high performers"

Result: Manager patterns revealed, standards calibrated, fairness achieved
```

**The THREE scenarios where manager filtering IS appropriate:**

**1. Very large manager span (30+ reports)**
```
When: Single manager has 40 employees spanning multiple levels

Approach:
  Filter: Manager = "Sarah"
  Then within Sarah's team: Review by level
    → Sarah's ICs first
    → Sarah's Managers second
    → Sarah's Directors third

Still use level structure, just scoped to one manager's organization
```

**2. Post-calibration follow-up**
```
When: After cross-manager calibration is complete

Purpose:
  Filter: Manager = "Alex"
  Help Alex prepare to communicate changes to their team
  Review what moved and why
  Coach Alex on conversations with employees

Timing: After the calibration meeting, not during
```

**3. Manager coaching on rating patterns**
```
When: One manager showed significant leniency or harshness bias

Purpose:
  Filter: Manager = "Jordan" (who rated everyone high in calibration)
  1:1 coaching: Help Jordan recalibrate their understanding
  Show Jordan how their standards differ from peers
  Develop Jordan's judgment for future ratings

Timing: Separate from calibration meeting
```

**The reframe: Even when you DO filter by manager, you're ultimately comparing to peers at same level.**

### By Intelligence & Flags (Final Sweep)

**Intelligence should come LAST, not first.**

**Why last is right:**
- Intelligence shows symptoms (statistical anomalies) not root causes
- Without context from level-based review, anomalies are just confusing
- Most issues get resolved during level-by-level calibration
- Intelligence catches the outliers that survived structured review

**The right workflow:**

```
Step 1: Complete level-by-level calibration
  → All ICs reviewed
  → All Managers reviewed
  → All Directors reviewed

Step 2: Open Intelligence tab
  → Review red/yellow anomalies
  → Note: List is much shorter now because level-based work resolved most issues

Step 3: Discuss remaining anomalies
  → These are genuine outliers worth discussing
  → Or edge cases that need special consideration
```

**What Intelligence catches after level-based calibration:**

**Statistical outliers:**
- Employee rated High Performance despite low tenure (possible early high performer or premature rating)
- Manager rated Low Potential despite High Performance (discuss why)
- New hire rated identically to 10-year veteran (lack of differentiation)

**Patterns across multiple dimensions:**
- All employees in Location X rated lower than Location Y (cultural bias)
- All new hires rated High Potential (premature judgment without evidence)
- One manager's ratings statistically different from all peers (even after calibration)

**Specific cohorts for action planning:**

**Flight risk identification:**
```
After calibration, use Intelligence to find:
  → High Performance + High Potential + Tenure < 2 years
  → Stars who might be most at risk of leaving
  → Create retention conversation list
```

**Promotion candidates:**
```
After calibration, use Intelligence to find:
  → High Potential + Current Job Level = "IC" + Tenure > 1 year
  → Ready for promotion to Manager
  → Build succession pipeline
```

**Development cohort:**
```
After calibration, use Intelligence to find:
  → Medium Performance + High Potential
  → Capacity but not yet delivering
  → Target for development programs, mentorship
```

**Performance improvement needs:**
```
After calibration, use Intelligence to find:
  → Low Performance + Tenure > 6 months
  → Not new hires still ramping up
  → Need performance plans or role changes
```

**Why Intelligence works better as final sweep:**

Before level-based calibration, Intelligence might show:
- 47 anomalies flagged (overwhelming)
- Manager A rates everyone high (context-free)
- Confusing patterns without baseline

After level-based calibration, Intelligence shows:
- 8 anomalies remaining (manageable)
- Specific outliers with context (we calibrated Manager A's standards, these 3 employees still look unusual)
- Actionable insights (clear next steps)

---

## Example Session Flows

Here are concrete examples for different organization sizes and structures.

### Small Organizations (<100 people)

**Setup:** 85 employees, 4 managers, 2 departments

**Pre-Meeting Preparation (20 minutes solo):**

```
1. Upload current ratings
2. Review Statistics tab for overall distribution
3. Filter: Job Level = "IC" → Note patterns
4. Filter: Job Level = "Manager" → Note patterns
5. Open Intelligence → Note potential discussion topics
```

**Calibration Meeting Flow (90 minutes):**

**Session 1: All Individual Contributors (45 minutes)**
```
Filter: Job Level = "Individual Contributor"
Result: 65 ICs across all 4 managers visible on grid

Review approach:
  → Statistics tab: What's the IC distribution?
  → Grid view: Who's in top-right (Stars)?
  → Manager patterns: Do managers have similar standards?

Discussion topics:
  → "Manager A has 12 High Performers out of 18 ICs. Manager B has 2 out of 16. Let's compare."
  → "Who are our true IC high performers across all managers?"
  → "Should we have ~10-15% Stars at IC level? Do we?"

Outcome:
  → Aligned on what "IC high performance" means
  → Adjusted ratings where standards weren't consistent
  → Documented moves with notes
```

**Session 2: All Managers (30 minutes)**
```
Filter: Job Level = "Manager"
Result: 15 managers visible (including the 4 who manage ICs)

Review approach:
  → Different bar than ICs - looking for leadership capacity
  → Who shows people management skill, strategic thinking?
  → Succession pipeline: Who could become Directors?

Discussion topics:
  → "What does 'high performing manager' mean for our organization?"
  → "Do we have enough Stars at manager level for succession?"
  → "Are we rating management potential vs IC potential?"

Outcome:
  → Calibrated leadership standards
  → Identified succession gaps
  → Development plans for high-potential managers
```

**Session 3: Directors and Senior Leaders (10 minutes)**
```
Filter: Job Level = "Director"
Result: 5 senior leaders

Review approach:
  → Quick review - smaller group
  → Strategic leadership capacity
  → Executive readiness

Outcome:
  → Aligned on senior talent bench strength
  → Identified gaps in executive pipeline
```

**Session 4: Intelligence Sweep (5 minutes)**
```
Tool: Intelligence tab

Review approach:
  → After level-based work, check for remaining anomalies
  → Statistical outliers we might have missed
  → Final patterns worth discussing

Outcome:
  → Caught 3 additional outliers
  → Confirmed most issues already addressed
  → Final adjustments documented
```

**Post-Meeting Follow-Up:**
```
1. Export calibrated ratings
2. Filter by Manager → Prep each manager for team conversations
3. Filter by High Potential → Create development program list
4. Filter by Low Performance → Create performance improvement list
```

### Mid-Size Organizations (100-500 people)

**Setup:** 280 employees, 15 managers, 5 departments (Engineering, Sales, Marketing, Operations, Finance)

**Pre-Meeting Preparation (45 minutes solo):**

```
1. Upload current ratings
2. Review Statistics by department (spot patterns)
3. Filter: Job Level = "IC" + Function = "Engineering" → Note
4. Filter: Job Level = "IC" + Function = "Sales" → Note
5. Repeat for other functions
6. Intelligence review → Flag discussion topics
```

**Week 1: Individual Contributor Calibration (3 sessions)**

**Session 1: Engineering ICs (60 minutes)**
```
Filter: Job Level = "IC" + Function = "Engineering"
Result: 85 Engineering ICs across 4 engineering managers

Review approach:
  → Statistics: Distribution of Engineering ICs
  → Manager comparison: Do engineering managers use similar standards?
  → High performers: Who are the real Stars in engineering?

Discussion:
  → "What does 'high performing engineer' mean?"
  → "Are we rating based on code quality, impact, mentorship?"
  → Compare Manager A's high performers to Manager B's

Outcome:
  → Consistent engineering IC standards
  → 12 engineers rated as High Performance + High Potential
  → 3 engineers moved down, 2 moved up after discussion
```

**Session 2: Sales ICs (45 minutes)**
```
Filter: Job Level = "IC" + Function = "Sales"
Result: 55 Sales ICs across 3 sales managers

Review approach:
  → Different standards than engineering
  → Focus on quota attainment, pipeline generation, customer relationships
  → Manager patterns in sales ratings

Discussion:
  → "What does 'high performing seller' mean?"
  → "Exceeding quota vs quality of deals vs team collaboration"
  → Compare sales high performers to engineering high performers

Outcome:
  → Aligned on sales IC standards
  → Identified sales talent gap (only 3 Stars, succession risk)
  → Plan to hire or develop more high-potential sales talent
```

**Session 3: Operations, Marketing, Finance ICs (60 minutes)**
```
Filter: Job Level = "IC" + Function = "Operations" (then Marketing, then Finance)
Result: 40 Operations ICs, 30 Marketing ICs, 25 Finance ICs

Review approach:
  → Review each function separately
  → Compare standards across all functions
  → Ensure consistency at IC level across entire org

Outcome:
  → Calibrated standards across all IC functions
  → Identified function-specific talent strengths and gaps
  → Development plans for high-potential ICs in each area
```

**Week 2: Leadership Calibration (2 sessions)**

**Session 4: All Managers (75 minutes)**
```
Filter: Job Level = "Manager"
Result: 40 managers across all departments

Review approach:
  → Leadership capacity, not IC performance
  → People management skills, strategic thinking
  → Cross-functional comparison of manager quality

Discussion:
  → "What does 'high performing manager' mean regardless of function?"
  → "Engineering managers vs Sales managers - different contexts, same leadership bar?"
  → Who shows Director potential?

Outcome:
  → Aligned leadership standards across functions
  → Identified 8 managers with Director potential
  → 5 managers need leadership development
```

**Session 5: Directors and Senior Leaders (45 minutes)**
```
Filter: Job Level = "Director"
Result: 15 Directors across departments

Review approach:
  → Strategic leadership, executive presence
  → VP readiness, cross-functional leadership
  → Succession for senior executive roles

Outcome:
  → Senior leadership bench assessed
  → 3 Directors ready for VP roles
  → Identified executive development needs
```

**Week 3: Intelligence and Follow-Up**

**Session 6: Intelligence Sweep (30 minutes)**
```
Tool: Intelligence tab

Review approach:
  → After 280 people calibrated by level and function
  → Check remaining anomalies
  → Statistical patterns we might have missed

Findings:
  → 5 outliers worth discussing (most resolved by level-based work)
  → Pattern: New hires consistently rated High Potential (discussed bias)
  → Retention risk: 4 High Performers with tenure <2 years flagged
```

**Post-Calibration Actions:**
```
Filter combinations for action planning:

Retention focus:
  → High Performance + High Potential + Tenure <2 years
  → 12 employees identified for retention conversations

Development programs:
  → Medium Performance + High Potential
  → 28 employees for development cohort

Promotion pipeline:
  → High Potential + Job Level = "IC"
  → 24 ICs ready for management development

Performance improvement:
  → Low Performance + Tenure >6 months
  → 8 employees needing performance plans
```

### Global Organizations (500+ people, multiple locations)

**Setup:** 850 employees, 45 managers, global offices (US, UK, Singapore, Germany, Brazil)

**Calibration Cycle: 4 weeks with location and level considerations**

**Week 1: Global IC Calibration by Function**

**Session 1: All Engineering ICs Globally (90 minutes)**
```
Filter: Job Level = "IC" + Function = "Engineering"
Result: 220 Engineering ICs across all locations

Part 1 - US Engineering ICs (30 min)
  Filter: Add Location = "United States"
  Review: 85 US Engineering ICs

Part 2 - Asia Engineering ICs (30 min)
  Filter: Location = "Singapore" + "Tokyo"
  Review: 60 Asia Engineering ICs

Part 3 - Europe Engineering ICs (30 min)
  Filter: Location = "UK" + "Germany"
  Review: 55 Europe Engineering ICs

Cross-location discussion:
  → US distribution: 28% High Performance
  → Asia distribution: 12% High Performance
  → Is this real or cultural rating bias?
  → Normalize or accept location-specific standards?

Outcome:
  → Decided to normalize: Engineering standards should be global
  → Adjusted Asia ratings upward where warranted
  → Documented cultural conversation for future calibrations
```

**Sessions 2-4: Repeat for Sales, Operations, Other Functions**
```
Same pattern for each major function:
  → Review globally first
  → Break down by location
  → Discuss cultural differences
  → Normalize or accept variations
```

**Week 2: Global Manager Calibration**

**Session 5: All Managers Globally by Function**
```
Filter: Job Level = "Manager" + Function analysis

Part 1 - Engineering Managers (all locations together)
  → 18 Engineering Managers globally
  → Leadership standards should be consistent globally
  → Compare US vs Asia vs Europe manager quality

Part 2 - Sales Managers (all locations together)
  → 12 Sales Managers globally
  → Sales leadership expectations
  → Location-specific sales dynamics

Part 3 - Other Function Managers
  → Operations, Finance, Marketing leadership
  → Cross-functional manager calibration

Outcome:
  → Global leadership standards established
  → Location differences noted and discussed
  → Succession pipeline for Directors identified
```

**Week 3: Senior Leadership and Location Deep Dives**

**Session 6: All Directors and VPs (Global)**
```
Filter: Job Level = "Director" or "VP"
Result: 35 senior leaders globally

Review approach:
  → Executive capacity regardless of location
  → Cross-regional leadership potential
  → Succession for C-suite roles

Outcome:
  → Global senior leadership bench assessed
  → Identified 6 leaders with C-suite potential
  → Cross-regional development assignments planned
```

**Session 7: Location-Specific Calibration Discussions**
```
Goal: Address location-specific patterns and cultural questions

Singapore Deep Dive:
  Filter: Location = "Singapore"
  Discussion: Why conservative ratings? Cultural or real?
  Outcome: Normalized some ratings, accepted some cultural differences

Brazil Deep Dive:
  Filter: Location = "Brazil"
  Discussion: New office, different talent market
  Outcome: Separate standards for first year, align next year

Germany Deep Dive:
  Filter: Location = "Germany"
  Discussion: Works council considerations, labor law
  Outcome: Documented special considerations
```

**Week 4: Intelligence, Action Planning, Regional Follow-Up**

**Session 8: Global Intelligence Sweep**
```
Tool: Intelligence tab

Review: Anomalies across 850 employees after 3 weeks of calibration

Findings:
  → 12 remaining outliers globally
  → Pattern: Remote workers rated lower (discussed bias)
  → Flight risk: 18 High Performers flagged for retention
  → Cross-border high potentials: 8 ready for international assignments

Outcome:
  → Final calibration adjustments
  → Action plans by category
  → Regional follow-up sessions planned
```

**Regional Follow-Up (Async)**
```
Each location leader prepares for team conversations:

Filter: Location = "Singapore" + Manager = [Each manager]
  → Prep each Singapore manager for their team discussions

Filter: Location = "United States" + Manager = [Each manager]
  → Prep each US manager for their team discussions

Repeat for each location
```

**Global Action Planning**
```
Retention (Global):
  → High Performance + High Potential
  → 45 employees globally flagged for retention focus

Development (Global):
  → Medium Performance + High Potential
  → 85 employees for global development program

Cross-Border Assignments:
  → High Potential + Willing to relocate
  → 12 employees for international development roles

Performance Improvement (By Location):
  → Low Performance by location
  → Respectful of local labor laws and cultural norms
```

**Key Lessons from Global Calibration:**

1. **Level-first still applies** - Compare ICs to ICs regardless of location
2. **Cultural discussion is healthy** - Don't assume differences are wrong, discuss them
3. **Normalize thoughtfully** - Some differences are bias, some are real context
4. **Global standards for leadership** - Leadership capacity should transcend location
5. **Location-specific follow-up** - Respect local employment context and culture

---

## Related Resources

For more on calibration filtering strategies, see:

- Back to [Getting Started with Calibration](../getting-started.md)
- Back to [Complete Calibration Guide](../best-practices.md)
- Related: [Cultural Calibration](cultural-calibration.md) - Navigate global and cross-cultural rating differences
- Related: [Difficult Scenarios](difficult-scenarios.md) - Handle challenging filtering situations
- See also: [Working with Filters](../filters.md) - How to use the filter panel and combine filters
- See also: [New to 9-Box?](../new-to-9box.md) - Understanding calibration philosophy and the 9-box framework

---

## Quick Reference Card

Keep this handy during calibration sessions:

| Filter Type | When to Use | Primary Goal |
|-------------|-------------|--------------|
| **Job Level** | Always start here | Fair comparisons of similar work |
| **Function + Level** | Orgs >100 people | Account for role-specific expectations |
| **Location** | Global orgs | Identify cultural rating patterns |
| **Intelligence** | Final sweep | Catch remaining anomalies |
| **Manager** | Rarely, post-calibration | Follow-up or very large spans |

**The golden rule:** Level first, function second, intelligence last, manager almost never during calibration.
