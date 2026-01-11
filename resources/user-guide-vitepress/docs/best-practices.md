# Best Practices for 9Boxer

> **Quick navigation:** First time running calibration? Start with [Quick Workflow](getting-started.md). Looking for specific guidance? Jump to [difficult scenarios](reference/difficult-scenarios.md) or [filter strategy](reference/filtering-decision-tree.md).

Maximize the value of your talent reviews with these proven best practices. This guide organizes recommendations by workflow stage, helping you make the most of 9Boxer from preparation through follow-through.

---

## Before You Start: Setting Up for Success

### Prepare Your Data in Excel First

**What:** Clean and review your employee data before uploading to 9Boxer.

**Why:** Data quality issues cause upload failures, missing employees, and inaccurate analysis. Fixing issues in Excel before upload saves time and prevents frustration during your review session.

**How:** Before uploading, verify your Excel file:

- **Use required column names**: `Employee ID`, `Worker`, `Performance`, `Potential`
- **Use valid rating values only**: `Low`, `Medium`, or `High`
- **Remove duplicate employees** (look for multiple rows with same Employee ID)
- **Fix inconsistent formatting** (extra spaces, different capitalizations)
- **Standardize department names** (e.g., "Engineering" not "engineering" or "Eng")
- **Ensure complete data** (no blank cells in required columns)

Common issues to fix:

- ❌ `"High "` (extra space) → ✅ `"High"`
- ❌ `"high"` (lowercase) → ✅ `"High"`
- ❌ `"Med"` (abbreviation) → ✅ `"Medium"`
- ❌ Employee ID "0123" formatted as number → ✅ Format as text to keep leading zeros

See [Employee Data](employee-data.md) for complete requirements.

---

### Calibrate Your Rating Scale Before You Start

**What:** Define what "High Performance" and "High Potential" mean for your organization before rating anyone.

**Why:** Inconsistent rating definitions lead to skewed distributions and unfair comparisons.

**How:** Create a simple rubric defining performance levels (Low: needs improvement, Medium: meets expectations, High: exceeds expectations) and potential levels (Low: best in current role, Medium: could advance 1-2 levels, High: leadership potential 3+ levels). Share this with all managers contributing ratings.

See [Understanding the Grid](understanding-grid.md#axis-definitions) for detailed guidance on defining ratings.

---

### Backup Your Original Data

**What:** Save a copy of your source Excel file before making any changes.

**Why:** You need a baseline to compare against and the ability to restart if something goes wrong.

**How:** Save a master copy before uploading (`talent_data_ORIGINAL_2024-Q4.xlsx`), store backups in a secure location, maintain version history, and never overwrite your original file. Use ISO date format (YYYY-MM-DD) in filenames for easy sorting.

---

### Set Expectations with Stakeholders

**What:** Align with leadership on the purpose, timeline, and expected outcomes of the talent review session.

**Why:** Without alignment, you may waste time reviewing the wrong employees or producing outputs nobody needs.

**How:** Clarify the goal (calibration, succession planning, performance review prep), define scope (departments, levels, teams), agree on timeline and deliverables format, and establish shared rating criteria.

---

### Plan Your Session Structure

**What:** Decide how you'll organize your review work before you begin.

**Why:** Reviewing hundreds of employees at once is overwhelming and inefficient.

**How:** Choose a review strategy: by department, by level (all directors, then all managers, then all ICs), or by rating tier. Use [Filters](filters.md) to implement your chosen structure during the session.

---

## During Data Entry: Rating Best Practices

### Be Consistent with Performance vs. Potential

**What:** Use clear, distinct criteria to differentiate Performance (current role) from Potential (future capacity).

**Why:** Confusing these dimensions leads to misplaced employees. High performers aren't automatically high potential, and vice versa.

**How:** For Performance, ask how well they execute in their current role and what results they've delivered. For Potential, ask how far they could advance and whether they can take on broader scope or leadership.

**Common patterns:** High Performance + Low Potential (excellent IC, best in current role), Low Performance + High Potential (new hire ramping or wrong role but has capacity), High Performance + High Potential (Star with leadership capacity).

See [Understanding the Grid](understanding-grid.md) for detailed position descriptions.

---

### Review Employee Context Before Rating

**What:** Review an employee's details, timeline, and organizational context before making rating decisions.

**Why:** Ratings should reflect the full picture including recent promotions, performance trends, or role changes.

**How:** Click the employee tile to open the Details panel. Review the Timeline to see previous movements and trajectory, note job level and manager, and consider recent changes and performance trends.

See [Working with Employees](working-with-employees.md) for complete details panel guide.

---

### Handle Borderline Cases Systematically

**What:** Use a consistent decision framework when employees fall between two ratings.

**Why:** Without a systematic approach, borderline decisions become arbitrary and inconsistent.

**How:** Compare to clear examples, apply the 6-month test (where will they be if trends continue?), use the promotion test (would you promote them tomorrow?), review peer comparison, and default to conservative when uncertain. Document borderline decisions with notes explaining your reasoning.

---

### Document Your Reasoning in Notes

**What:** Add specific, objective notes explaining each rating change you make.

**Why:** Notes create an audit trail, justify decisions in calibration meetings, and help you remember your reasoning months later. Without notes, the "why" behind changes is lost.

**How:** For every rating change, add a note that includes:

- **What changed:** Promotion, performance shift, calibration, initial rating correction
- **Specific evidence:** Recent projects, deliverables, behaviors, or outcomes
- **Timeline:** When the change occurred or was observed

**Good note examples:**

- ✅ "Promoted to Senior Engineer Q4 2024, consistently exceeds deliverables"
- ✅ "Performance declined after team restructure - skill gap in new responsibilities"
- ✅ "Calibrated with peers - rating adjusted to reflect actual output vs. potential"
- ✅ "Initial rating too high - performance is solid but not exceptional, adjusted to Medium"

![Changes tab showing employee with good detailed note example reading "Promoted to manager role in Q4, strong leadership demonstrated through team restructuring project and consistent delivery" providing specific evidence and timeline for rating change decision](/images/screenshots/workflow/workflow-changes-good-note.png)

This is what a good note looks like - specific, objective, with evidence and timeline.

**Bad note examples:**

- ❌ "Good performer" (too vague)
- ❌ "Just because" (not helpful)
- ❌ "Everyone knows why" (doesn't create audit trail)

See [Tracking Changes](tracking-changes.md) for complete note-taking guidance.

---

### Use Filters Strategically During Calibration

**What:** Use level-based filtering as your primary calibration approach, not manager-by-manager reviews.

**Why:** Calibration is about ensuring consistent standards across managers at each level. Reviewing by level reveals rating patterns and prevents defensive silos. Manager-by-manager filtering encourages "defend my turf" mentality instead of collaborative alignment.

**How:** Start with level-based filtering (all ICs, then all Managers), refine by function if needed, and finish with Intelligence for anomaly detection.

**Key principle:** Never filter manager-by-manager during calibration - this creates silos instead of cross-manager comparison.

**Why level-first works:** When you filter to "All Individual Contributors," you see Manager A's ICs next to Manager B's ICs next to Manager C's ICs. Patterns become obvious: "Manager A rated 80% as High, Manager B rated 20% as High." This reveals manager patterns without creating defensiveness.

For complete filter strategy including the decision tree, when to use each filter type, and session flows for different organization sizes, see [Filter Strategy Reference](reference/filtering-decision-tree.md). For global organizations, also review [Cultural Calibration](reference/cultural-calibration.md) to address location-based rating differences.

---

## During Calibration: Meeting Workflow

### Prepare Before the Meeting Starts

**What:** Complete essential preparation steps before your calibration session begins.

**Why:** Walking into a calibration meeting unprepared wastes time and leads to unproductive discussions.

**How:** Review Statistics tab (check distribution percentages), check Intelligence tab (note red/yellow highlights), list borderline cases, test your filters, and share meeting agenda with discussion topics ahead of time.

Before your meeting, review [Creating Psychological Safety](reference/psychological-safety.md) for tactics to build trust and enable honest discussions.

---

### Use Filters to Focus Discussions

**What:** During calibration meetings, work level-by-level across all managers, not manager-by-manager.

**Why:** Cross-manager level comparison ensures consistent standards and reveals rating patterns.

**How:** Project 9Boxer and apply level-based filters to guide discussion. Set level filter (e.g., "Individual Contributor"), review cohort together noting which managers' ratings differ, discuss specific employees, make adjustments via drag-and-drop as group reaches consensus, add notes documenting decisions, move to next level and repeat, then do final Intelligence sweep.

**Example meeting structure:** 0:00-0:30 All ICs, 0:30-0:50 All Managers, 0:50-1:00 Intelligence review.

See [Filters](filters.md) for complete filtering guide.

---

### Stay Organized During the Session

**What:** Follow a consistent workflow during live calibration to keep meetings productive and ensure nothing gets missed.

**Why:** Long calibration meetings can become chaotic without structure.

**How:** Open 9Boxer with data loaded and share your screen. For each employee, use filters to focus on relevant level, click tile to show details, facilitate discussion, reach consensus, make rating changes via drag-and-drop, and add notes immediately. Throughout the meeting, watch the File menu badge, review Statistics periodically, keep discussions moving (2-3 minutes per employee max), and table contentious cases. Before ending, review Changes tab to ensure all moves have notes, verify Statistics shows improved distribution, and agree on next steps.

---

### Keep Discussions Moving

**What:** Set time limits for each employee discussion and stick to them.

**Why:** Time-boxing prevents unproductive debates and keeps calibration on schedule.

**How:** Allow 2-3 minutes per employee maximum, set a timer if helpful, table contentious cases for offline follow-up, focus on clear outliers first, and save borderline cases for last. If a discussion goes past 5 minutes, table it and schedule a separate meeting for complex cases.

For specific guidance on handling difficult moments when discussions stall or become contentious, see [Difficult Calibration Scenarios](reference/difficult-scenarios.md).

---

### Review Statistics to Identify Patterns

**What:** Use the Statistics tab to identify rating patterns that spark productive calibration conversations.

**Why:** Statistical analysis reveals patterns you might miss when looking at individual employees. Different rating standards across managers, concentrated distributions, or unusual patterns - these are conversation starters, not issues to fix.

**How:** Before finalizing calibration, review the Statistics tab for patterns worth discussing:

- **Overall distribution:** Does it match your organization's reality?
- **Manager comparison:** Do different managers have different rating standards?
- **Department comparison:** Are distributions different across departments?
- **Intelligence flags:** Red/yellow highlights show statistical patterns worth exploring

**Patterns that spark good conversations:**

- 💬 Manager A rates 80% as "High" while Manager B rates 20% as "High" → **Standards may differ - let's compare what "high performance" means to each**
- 💬 Engineering has 30% Stars while Sales has 5% → **Is this real talent difference or different expectations? Let's discuss**
- 💬 All employees hired in past 6 months rated "High Potential" → **Are we rating based on interviews or actual evidence? Worth reviewing**
- 💬 One location rates consistently lower than others → **Cultural difference in rating standards or actual performance gap? Good discussion topic**

![Intelligence tab showing pattern detection with red and yellow cards indicating statistical patterns including different manager rating standards and department rating variations that benefit from calibration discussion before finalizing performance assessments](/images/screenshots/workflow/intelligence-summary-anomalies.png)

The Intelligence tab highlights patterns that benefit from group discussion. Use these insights to start conversations about standards and alignment.

**Questions that lead to productive calibration:**

- "Manager A, your team has 30% Stars while Manager B has 5%. Walk us through what you're seeing that puts them in that category."
- "Engineering and Sales have very different distributions. Do we need different standards, or should we align?"
- "Location X rates lower across the board. Is this cultural, or are we seeing real performance differences?"

The goal is understanding and alignment, not finding who's "right" or "wrong."

For navigating the interpersonal dynamics when discussing these patterns, see [Power Dynamics and Politics](reference/power-dynamics-and-politics.md). For complete analysis features, see [Statistics and Intelligence](statistics.md).

---

### Track Changes as You Make Decisions

**What:** Monitor the Changes tab during calibration to see cumulative impact of rating decisions.

**Why:** Without tracking, you lose sight of how many changes you're making and may forget to document important moves. The Changes tab prevents decisions from getting lost.

**How:** During calibration meetings:

1. **Keep Changes tab visible** (or review it periodically)
2. **Watch the change count** on the File menu badge
3. **Ensure every change has a note** before moving to next employee
4. **Review the full list** before ending the meeting
5. **Export immediately after** to capture calibration outcomes

**Before exporting, verify:**

- ✅ All changes have notes documenting rationale
- ✅ Change count matches your expectations (file menu badge)
- ✅ No unintended changes were made
- ✅ All participants agree with final placements

See [Tracking Changes](tracking-changes.md) for change management workflow.

---

### Share Screen During Calibration Meetings

**What:** Project 9Boxer on a shared screen during live calibration sessions with managers.

**Why:** Collaborative, visual calibration creates shared understanding and buy-in. When everyone sees the grid together, discussions are more productive and decisions more transparent.

**How:**

1. **Project 9Boxer** via screen share or meeting room display
2. **Apply filters** to focus on specific teams (one manager at a time)
3. **Click employees** to show details to all participants
4. **Make moves in real-time** using drag-and-drop as consensus emerges
5. **Add notes collaboratively** - capture group reasoning, not just one person's view
6. **Review Statistics** together to identify patterns
7. **Export immediately** when meeting ends

**Meeting tips:**

- Have one person control 9Boxer while others observe and discuss
- Use the Expand Box feature (⛶ icon) to see all employees in a box during discussion
- Review the Changes tab at meeting end to confirm all decisions

---

### Use Donut Mode to Review the Center Box

**What:** During calibration, activate Donut Mode to force-rank employees currently rated "Medium Performance, Medium Potential."

**Why:** The center box (Core Performers) often becomes a default placement where managers put anyone they're unsure about. Donut Mode forces you to differentiate: if they can't be Medium/Medium, where do they really belong?

**How:** Integrate Donut Mode into calibration:

1. **After initial calibration**, activate [Donut Mode](donut-mode.md)
2. **Ask for each center box employee:** "If they can't be Medium/Medium, where do they truly belong?"
3. **Place on the donut** (the 8 outer boxes) at their actual level
4. **Add notes** explaining each donut placement
5. **Export donut data** (appears in separate columns in Excel)
6. **Review donut insights** with leadership to recalibrate actual ratings

Follow the complete step-by-step process in the [Donut Mode Exercise guide](donut-mode.md).

---

## After Calibration: Follow-Through

### Export and Share Results Promptly

**What:** Export final ratings immediately after calibration and distribute to stakeholders within 24 hours.

**Why:** Delays between calibration and follow-through reduce impact and let decisions become stale.

**How:** Export immediately after the meeting while 9Boxer is still open. Verify the export shows all changes, notes, and the "Modified in Session" column. Share with stakeholders via secure file transfer using clear naming: `talent_calibration_2024-Q4_FINAL.xlsx`

See [Exporting Your Changes](exporting.md) for export best practices and file management.

---

### Create Development Plans for Each Box

**What:** Use the finalized grid to create targeted development strategies for each position.

**Why:** The 9-box grid is a planning tool, not just a rating system. Different positions require different talent strategies.

**How:** Each box needs a different approach:

- **Stars** - Retention and advancement (succession planning, stretch assignments, fast-track promotions)
- **High Potential** - Accelerate development (mentorship, leadership training, cross-functional projects)
- **High Performers** - Leverage expertise (technical leadership, knowledge sharing, SME roles)
- **Core Performers** - Maintain engagement (skill development, clear goals, ongoing feedback)
- **Under-Performers** - Performance improvement or transition (PIPs, coaching, role reassessment)

Export filtered views for each box to share targeted lists with managers.

---

### Schedule Follow-Up Reviews

**What:** Set specific dates for the next talent review cycle before ending the current one.

**Why:** Without scheduled follow-up, talent reviews become one-off events rather than ongoing processes.

**How:** Decide review frequency (quarterly recommended), schedule the next review before ending the current session, and send calendar invites to all participants. Use current export as baseline for next review.

**Recommended:** Quarterly full reviews with mid-quarter progress checks for Stars and Under-Performers.

---

### Communicate Outcomes Appropriately

**What:** Share calibration results with employees and managers in a structured, professional manner.

**Why:** Transparency builds trust, but raw grid data can be misinterpreted or demotivating.

**How:**

**For managers:** Share full grid with context about distribution, calibration decisions, and development actions for each box.

**For employees:** Share individual ratings as part of performance conversations, focusing on development path and support available rather than grid labels.

**Never share:** Raw grid labels without context, peer comparisons, or position without development plan.

For detailed guidance on manager-employee conversations after calibration, see [Post-Calibration Conversations](reference/post-calibration-conversations.md).

---

### Maintain Milestone Records

**What:** Keep dated exports at key points to track talent trends over time.

**Why:** Historical data reveals patterns like who's improving, which teams develop talent effectively, and whether interventions worked.

**How:** Export and archive at quarterly sessions, annual reviews, calibration meetings, performance cycles, and before major changes. Use naming convention: `talent_[event]_[YYYY-MM-DD].xlsx`

Use historical data to track employee trajectories, measure development progress, evaluate interventions, and support succession planning.

For comprehensive guidance on using multi-year data to improve calibration quality, see [Multi-Year Tracking](reference/multi-year-tracking.md).

::: tip Compare Before and After
Open pre-calibration and post-calibration exports side-by-side to see total impact. Follow up quickly by sending results within 24 hours while the discussion is fresh. Plan the next calibration session before everyone leaves the meeting.

:::

---

## Common Calibration Scenarios

During calibration you'll encounter common challenges that require facilitation skill and courage. Here are some you'll see:

**Grade inflation** - Manager rates 35% as high performers when benchmarks suggest 20%. Solution: View all high performers side-by-side to compare evidence and identify different standards.

**Protected pet** - Senior leader shields an underperformer from honest discussion. Solution: Ask for specific evidence that justifies the rating compared to other high performers discussed that day.

**New manager** - First-time manager rated everyone high due to inexperience. Solution: Private pre-meeting conversation to calibrate their understanding before group session.

**Crowded center** - 70% of employees land in Medium/Medium. Solution: Use Donut Mode to force differentiation or ask forced-choice questions about promotions and exits.

**Cultural differences** - Asia office rates 80% as Medium/Low while US office rates 60% as High. Solution: Decide whether to normalize globally or accept local standards, then communicate the decision clearly.

**Recency bias** - Employee had terrible Q1-Q3 but excellent Q4, manager rates High based on recent memory. Solution: Frame rating as full-period assessment, distinguish "improving" from "sustained high performance."

For detailed guidance on handling each scenario with facilitator scripts, psychological safety tactics, and power dynamics navigation, see [Difficult Scenarios Reference](reference/difficult-scenarios.md).

---

## Common Pitfalls to Avoid

### Don't Over-Focus on One Dimension

**What:** Avoid rating Performance and Potential as identical or nearly identical for everyone.

**Why:** If everyone has the same Performance and Potential rating, you're not differentiating between current role execution and future growth capacity. This defeats the purpose of the 9-box model.

**How to avoid:**

- **Ask distinct questions** for each dimension (see "Be Consistent with Performance vs. Potential")
- **Review your distribution:** If most employees fall on the diagonal (Low/Low, Medium/Medium, High/High), you're conflating the dimensions
- **Use real examples:** High performers who are best in current role (High Perf, Low Potential) and high-potential employees still ramping (Low Perf, High Potential)

**Warning signs:**

- ⚠️ 80%+ of employees on the diagonal (positions 1, 5, 9)
- ⚠️ Very few employees in off-diagonal positions (2, 3, 4, 6, 7, 8)
- ⚠️ Managers say "Performance and Potential are the same thing"

---

### Don't Forget to Export Frequently

**What:** Avoid working for long periods without exporting your changes.

**Why:** Exporting creates shareable files and preserves your work for compliance and record-keeping.

**Export guidelines:**

- ✅ **Export at milestones** - After reviewing each department, after calibration meetings
- ✅ **Export before uploads** - Save current work before uploading a new file
- ✅ **Export for sharing** - Create versions to share with stakeholders
- ✅ **Export for backup** - Create backup before making speculative changes

**File naming for frequent exports:**

- During session: `talent_inprogress_2024-12-20_14-30.xlsx`
- After milestone: `talent_engineering_complete.xlsx`
- Before risky change: `talent_backup_before_reorg.xlsx`

See [Exporting Your Changes](exporting.md) for detailed export workflow.

---

### Don't Skip Review Steps

**What:** Avoid rushing through review steps like Statistics review, Donut Mode, and Changes tab review.

**Why:** Skipping review steps leads to errors that undermine trust in the process: missed rating patterns, inconsistent calibration, undocumented changes, or employees placed incorrectly.

**How to avoid:**

**Before finalizing ratings, always:**

1. ✅ **Review Statistics tab** for distribution and patterns
2. ✅ **Review Changes tab** to ensure all changes have notes
3. ✅ **Review center box** with Donut Mode (if using this technique)
4. ✅ **Compare across managers/departments** for consistency
5. ✅ **Open exported file** to verify it saved correctly

**Time investment:**

- Statistics review: 5 minutes
- Changes tab review: 5 minutes
- Donut Mode exercise: 20-30 minutes (optional but valuable)
- Total: ~15-40 minutes of validation prevents hours of rework

**Warning signs you skipped review steps:**

- ⚠️ Exported file has changes without notes
- ⚠️ Statistical patterns you didn't investigate
- ⚠️ Stakeholders question rating consistency
- ⚠️ Center box is overpopulated (>60% of employees)

---

### Don't Ignore Statistical Patterns

**What:** Avoid dismissing red or yellow highlights in the Intelligence tab without investigation.

**Why:** Patterns indicate potential rating differences, data quality issues, or real organizational patterns. Ignoring them means you're signing off on potentially unfair or inaccurate ratings.

**How to avoid:**

1. **Open the Intelligence tab** before finalizing ratings
2. **Investigate each red/yellow highlight:**
   - Red highlight = Strong pattern (worth discussing or explaining)
   - Yellow highlight = Moderate pattern (worth discussing)
3. **Ask "Why is this happening?"**
   - Is it real (genuine performance difference)?
   - Is it different standards (manager rating approaches differ)?
   - Is it data quality (wrong department assignment)?
4. **Document your finding** in notes or separate report
5. **Take action:**
   - Recalibrate if different standards detected
   - Fix data quality issues
   - Accept if pattern is genuine and document reasoning

**Common patterns to investigate:**

- Manager A has 40% Stars while Manager B has 5%
- Engineering department has no Low performers
- All employees hired in past 6 months rated "High Potential"
- One location rates significantly higher/lower than others

See [Statistics and Intelligence](statistics.md) for complete anomaly detection features.

---

### Don't Rate New Hires Too Quickly

**What:** Avoid assigning High Potential or definitive Performance ratings to employees with less than 6 months tenure.

**Why:** It takes time to assess true performance and potential. Premature ratings based on interviews or onboarding impressions are often wrong and create complications later.

**How to avoid:**

- **Use "Too New to Rate" approach:** Place new hires in Medium/Medium as placeholder
- **Add "New Hire" note:** Document that rating is provisional pending performance data
- **Set review milestone:** Flag for reassessment after 6-12 months
- **Focus on ramp trajectory:** Are they learning quickly? Showing potential?
- **Defer definitive ratings** until you have performance data from actual work

**Exception:** If new hire came from internal transfer or you have extensive prior work history, earlier rating may be appropriate. Document the reasoning.

---

## Advanced Tips for Power Users

### Use Keyboard Shortcuts for Efficiency

**What:** Learn keyboard shortcuts to navigate 9Boxer faster without clicking through menus.

**Why:** Keyboard shortcuts significantly speed up repetitive actions during long review sessions. Power users can process employees 2-3x faster.

**How:** Key shortcuts to master:

| Action | Shortcut |
|--------|----------|
| Collapse expanded box | `Esc` |
| Close employee details | `Esc` or click outside |
| Navigate between employees | Click tiles (no keyboard nav yet) |
| Quick filter clear | Click "Clear All Filters" button |

**Workflow optimization:**

1. **Expand box** (click ⛶ icon)
2. **Click employee** to review details
3. **Add note** in Changes tab
4. **Press Esc** to close details
5. **Repeat** for next employee

**Coming soon:** Arrow key navigation between employee tiles (feature request).

---

### Use Advanced Filtering Strategies

**What:** Combine multiple filters to create precise employee segments for focused review.

**Why:** Simple single-filter views are useful, but complex filter combinations let you find exactly the employees you need to discuss or analyze.

**How:** Advanced filter patterns:

**Combination filters:**

- **"High Potential" + "Engineering"** → Engineering's future leaders
- **"Low Performance" + "Manager: Sarah"** → Sarah's under-performers needing action
- **"High Performance" + "Job Level: Senior"** → Senior ICs for promotion consideration
- **"Stars" + "Department: Marketing"** → Marketing's top talent retention list

**Exclusion filters (Clear unwanted):**

- Review **all employees EXCEPT Sales** → Select filters, select all but Sales
- Review **only non-managers** → Exclude "Manager" job level

**Sequential filtering workflow:**

1. Start broad: Filter to "Engineering Department" (100 employees)
2. Narrow down: Add "High Potential" filter (25 employees)
3. Focus further: Add "Job Level: Junior" (8 employees)
4. Review this precise segment, then clear and repeat for next segment

See [Filters](filters.md) for all available filter types and advanced techniques.

---

### Use Export Naming Conventions for Version Control

**What:** Develop a consistent file naming system for exports to track versions and purpose.

**Why:** Without naming conventions, you end up with `modified_talent.xlsx`, `modified_talent(1).xlsx`, `final.xlsx`, `final_FINAL.xlsx` chaos. Good naming makes it easy to find the right file and understand what it contains.

**How:** Use this pattern: `talent_[purpose]_[date]_[version].xlsx`

**Examples:**

- **Work in progress:** `talent_inprogress_2024-12-20_v1.xlsx`
- **Milestone complete:** `talent_engineering_complete_2024-12-20.xlsx`
- **Before meeting:** `talent_before_calibration_2024-12-20.xlsx`
- **After meeting:** `talent_after_calibration_2024-12-20_FINAL.xlsx`
- **Quarterly archive:** `talent_2024-Q4.xlsx`
- **Backup before change:** `talent_backup_before_reorg_2024-12-20.xlsx`

**Naming tips:**

- ✅ Use ISO date format (YYYY-MM-DD) for correct sorting
- ✅ Include purpose (calibration, quarterly, backup, etc.)
- ✅ Use version numbers for iterations (v1, v2, v3)
- ✅ Mark finals as "FINAL" for clarity
- ❌ Avoid generic names ("data.xlsx", "export.xlsx")
- ❌ Avoid spaces (use underscores or hyphens)

---

### Master the Expand Box Feature

**What:** Use the Expand Box feature (⛶ icon) to see all employees in a single box without scrolling.

**Why:** When a box contains many employees, the default view shows only a few tiles with scroll. Expanding shows all employees at once for faster review and comparison.

**How:**

1. **Click the ⛶ icon** on any box header
2. **The box expands** to fill the screen with all employee tiles visible
3. **Click employees** to review details (same workflow as normal view)
4. **Click ⛶ again** or **press Esc** to collapse back to grid view

**Use cases:**

- **Review all Stars** → Expand top-right box to see all high performers
- **Discuss Core Performers** → Expand center box during calibration meetings
- **Identify under-performers** → Expand bottom-left boxes to see who needs action

**Pro tip:** Combine with filters. Filter to "Engineering", then expand "Stars" box to see only Engineering's star performers.

---

### Use Donut Mode for Succession Planning

**What:** Use Donut Mode not just for validation, but as a succession planning exercise.

**Why:** The standard grid shows current state. Donut Mode forces you to think about future state: "Where could this person be in 2-3 years?" This identifies development paths and succession candidates.

**How:** Run Donut Mode as a forward-looking exercise:

1. **Activate Donut Mode** and focus on Core Performers (center box)
2. **For each employee, ask:** "With the right development, where could they be in 2-3 years?"
3. **Place on donut** at their potential future position (not current state)
4. **Add notes** describing the development path needed to get there
5. **Export donut data** to create succession pipeline report

**Example notes:**

- "Could move to High Performer with advanced technical training - succession candidate for Tech Lead"
- "Leadership potential if given people management experience - could be Stars in 2 years"
- "Best suited for current role - solid Core Performer long-term"

This creates a development roadmap for each employee.

See [Donut Mode](donut-mode.md) for complete exercise guide.

---

## Related Topics

### Core Workflow Guides
- [Getting Started](getting-started.md) - Complete walkthrough for new users
- [Understanding the Grid](understanding-grid.md) - Detailed explanation of all 9 positions
- [Tracking Changes](tracking-changes.md) - How to add notes and document decisions
- [Exporting Your Changes](exporting.md) - Export workflow and file management
- [Donut Mode](donut-mode.md) - Advanced validation technique for Core Talent
- [Statistics and Intelligence](statistics.md) - Data analysis and anomaly detection
- [Filters](filters.md) - Focus on specific employee groups
- [Troubleshooting](troubleshooting.md) - Solutions for common issues

### Specialized Calibration References
- [Filter Strategy Reference](reference/filtering-decision-tree.md) - Complete filtering decision tree and session flows
- [Creating Psychological Safety](reference/psychological-safety.md) - Build trust and enable honest discussion
- [Power Dynamics and Politics](reference/power-dynamics-and-politics.md) - Navigate influence and credibility in calibration
- [Difficult Calibration Scenarios](reference/difficult-scenarios.md) - Handle protected pets, layoffs, and contentious moments
- [Post-Calibration Conversations](reference/post-calibration-conversations.md) - Communicate outcomes to employees
- [Cultural Calibration](reference/cultural-calibration.md) - Navigate global and cross-cultural differences
- [Multi-Year Tracking](reference/multi-year-tracking.md) - Use historical data to improve calibration
