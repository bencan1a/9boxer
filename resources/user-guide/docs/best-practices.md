# Best Practices for 9Boxer

Maximize the value of your talent reviews with these proven best practices. This guide organizes recommendations by workflow stage, helping you make the most of 9Boxer from preparation through follow-through.

---

## Before You Start: Setting Up for Success

### Prepare Your Data in Excel First

**What:** Clean and validate your employee data before uploading to 9Boxer.

**Why:** Data quality issues cause upload failures, missing employees, and inaccurate analysis. Fixing problems in Excel before upload saves time and prevents frustration during your review session.

**How:** Before uploading, verify your Excel file:

- **Use exact column names** (case-sensitive): `Employee ID`, `Worker`, `Performance`, `Potential`
- **Use valid rating values only**: `Low`, `Medium`, or `High` (exact capitalization)
- **Remove duplicate employees** (check for multiple rows with same Employee ID)
- **Fix inconsistent formatting** (extra spaces, different capitalizations)
- **Standardize department names** (e.g., "Engineering" not "engineering" or "Eng")
- **Ensure complete data** (no blank cells in required columns)

Common issues to fix:

- ❌ `"High "` (extra space) → ✅ `"High"`
- ❌ `"high"` (lowercase) → ✅ `"High"`
- ❌ `"Med"` (abbreviation) → ✅ `"Medium"`
- ❌ Employee ID "0123" formatted as number → ✅ Format as text to keep leading zeros

See [Uploading Data](uploading-data.md) for complete requirements.

---

### Calibrate Your Rating Scale Before You Start

**What:** Define what "High Performance" and "High Potential" mean for your organization before rating anyone.

**Why:** Inconsistent rating definitions lead to skewed distributions and unfair comparisons. If one manager rates generously while another is strict, the grid won't reflect reality and calibration becomes difficult.

**How:** Create a simple rubric defining performance and potential levels. Share this with all managers contributing ratings.

**Example rubric:**

**Performance Scale:**
- **Low (1-3):** Meets some expectations, needs improvement in key areas
- **Medium (4-7):** Consistently meets expectations, reliable contributor
- **High (8-10):** Exceeds expectations, delivers exceptional results

**Potential Scale:**
- **Low:** Best in current role, limited advancement capacity
- **Medium:** Could advance 1-2 levels with development
- **High:** Leadership potential, could advance 3+ levels

See [Understanding the Grid](understanding-grid.md#axis-definitions) for detailed guidance on defining ratings.

---

### Backup Your Original Data

**What:** Save a copy of your source Excel file before making any changes.

**Why:** You need a baseline to compare against, and you may need to restart if something goes wrong. Without a backup, you can't recover from accidental data loss or corruption.

**How:**

1. Save a master copy before uploading: `talent_data_ORIGINAL_2024-Q4.xlsx`
2. Store backups in a secure, separate location (not just the same folder)
3. Maintain version history: `talent_data_2024-Q4-v1.xlsx`, `v2.xlsx`, etc.
4. Never overwrite your original file

!!! tip "Date your filenames"
    Use ISO date format (YYYY-MM-DD) in filenames for easy sorting: `talent_data_2024-12-20.xlsx`

---

### Set Expectations with Stakeholders

**What:** Align with leadership on the purpose, timeline, and expected outcomes of the talent review session.

**Why:** Without alignment, you may waste time reviewing the wrong employees, using incorrect criteria, or producing outputs nobody needs. Stakeholder buy-in ensures your work drives real decisions.

**How:**

- **Clarify the goal:** Calibration? Succession planning? Performance review prep?
- **Define scope:** Which departments, levels, or teams to review?
- **Agree on timeline:** When do final results need to be delivered?
- **Confirm deliverables:** What format do stakeholders need (Excel export, summary report, presentation)?
- **Establish rating criteria:** Use the same performance/potential definitions as stakeholders

---

### Plan Your Session Structure

**What:** Decide how you'll organize your review work before you begin.

**Why:** Reviewing hundreds of employees at once is overwhelming and inefficient. A structured approach ensures thorough, consistent reviews without missing anyone.

**How:** Choose a review strategy based on your organization:

- **By department:** Review Engineering, then Marketing, then Sales
- **By manager:** Review each manager's team separately for calibration
- **By level:** Review all directors, then all managers, then all ICs
- **By rating tier:** Start with Stars, then review under-performers, then middle tier

Use [Filters](filters.md) to implement your chosen structure during the session.

---

## During Data Entry: Rating Best Practices

### Be Consistent with Performance vs. Potential

**What:** Use clear, distinct criteria to differentiate Performance (current role) from Potential (future capacity).

**Why:** Confusing these dimensions leads to misplaced employees. High performers aren't automatically high potential, and vice versa. Each dimension measures something different.

**How:** Ask these specific questions:

**For Performance:**
- How well does this person execute in their current role?
- Do they meet, exceed, or fall short of expectations?
- What results have they delivered recently?

**For Potential:**
- How far could this person advance in the organization?
- Do they have the capacity to take on broader scope or leadership?
- Can they learn new skills and adapt to different roles?

**Common patterns:**

- **High Performance + Low Potential:** Excellent individual contributor, best in current role
- **Low Performance + High Potential:** New hire still ramping, or struggling in wrong role but has capacity
- **High Performance + High Potential:** Star - top talent with leadership capacity

See [Understanding the Grid](understanding-grid.md) for detailed position descriptions.

---

### Review Employee Context Before Rating

**What:** Check an employee's details, timeline, and organizational context before making rating decisions.

**Why:** Ratings should reflect the full picture. Without context, you might overlook recent promotions, performance trends, or role changes that affect proper placement.

**How:** Before moving or rating an employee:

1. **Click the employee tile** to open the Details panel
2. **Review the Timeline** to see previous movements and trajectory
3. **Check job level and manager** to understand organizational context
4. **Note recent changes** (promotions, role changes, transfers)
5. **Consider the trend** (improving vs. declining performance)

This context-informed approach ensures rating changes are justified and documented.

See [Working with Employees](working-with-employees.md) for complete details panel guide.

---

### Handle Borderline Cases Systematically

**What:** Use a consistent decision framework when employees fall between two ratings.

**Why:** Without a systematic approach, borderline decisions become arbitrary and inconsistent. This undermines trust in the entire rating process.

**How:** For employees who seem "between" Medium and High:

1. **Compare to clear examples:** Is this person more like your definite Highs or definite Mediums?
2. **Apply the 6-month test:** Where will they likely be in 6 months if trends continue?
3. **Use the promotion test:** Would you promote this person tomorrow if a role opened?
4. **Check peer comparison:** How do they compare to others at the same level/role?
5. **Default to conservative:** When truly uncertain, rate Medium and revisit in next cycle

**Document borderline decisions** with notes explaining your reasoning. This helps in calibration discussions.

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

**Bad note examples:**

- ❌ "Good performer" (too vague)
- ❌ "Just because" (not helpful)
- ❌ "Everyone knows why" (doesn't create audit trail)

See [Tracking Changes](tracking-changes.md) for complete note-taking guidance.

---

### Use Filters to Maintain Focus

**What:** Apply filters to review small, manageable groups of employees at a time.

**Why:** Reviewing hundreds of employees simultaneously is cognitively overwhelming and leads to inconsistent decisions. Filtering lets you focus on comparable groups and maintain rating consistency.

**How:** Don't try to review everyone at once:

- **Focus on one department, level, or manager at a time**
- **Use filters to narrow your view** to 20-50 employees
- **Clear filters between different focus areas** to avoid confusion
- **Apply multiple filters** to drill down: "High Potential" + "Engineering" shows engineering's future leaders

**Workflow example:**

1. Filter to "Engineering Department"
2. Review and rate all engineering employees
3. Export progress: `talent_engineering_complete.xlsx`
4. Clear filters, apply "Marketing Department"
5. Repeat

See [Filters](filters.md) for complete filtering strategies.

---

## During Calibration: Meeting Workflow

### Use Filters to Focus Discussions

**What:** During calibration meetings, filter the grid to show only the employees being discussed.

**Why:** Keeping all employees visible during calibration is distracting and makes it hard to focus. Filters let participants concentrate on specific teams or rating tiers without visual clutter.

**How:** Common calibration filter strategies:

- **By manager:** "Show me Sarah's team" - discuss one manager's ratings at a time
- **By department:** "Let's calibrate Engineering" - ensure consistency within department
- **By rating tier:** "Show all Stars" - validate that all high ratings are justified
- **By anomaly:** "Show Low Performance + High Potential" - discuss unusual combinations

**Meeting workflow:**

1. **Project 9Boxer screen** so all participants can see
2. **Apply filter** to focus on discussion topic
3. **Discuss each employee** using visible details
4. **Make adjustments** via drag-and-drop in real-time
5. **Add notes collaboratively** documenting consensus
6. **Export after meeting** to capture calibration decisions

See [Filters](filters.md) for all available filter options.

---

### Review Statistics to Identify Patterns

**What:** Use the Statistics tab to detect rating patterns and potential bias before finalizing calibration.

**Why:** Statistical analysis reveals patterns humans miss: one manager rating everyone high, one department with no stars, or skewed distributions. These patterns indicate calibration issues that need discussion.

**How:** Before finalizing calibration, check the Statistics tab for:

- **Overall distribution:** Is it realistic (not everyone High or Low)?
- **Manager comparison:** Do some managers rate consistently higher/lower than peers?
- **Department comparison:** Are distributions similar across departments?
- **Anomaly flags:** Red/yellow highlights indicate statistical outliers

**Common patterns to watch for:**

- ⚠️ One manager rates everyone as "High" (leniency bias)
- ⚠️ One department has no Stars (under-rating or talent gap?)
- ⚠️ All new hires rated "High Potential" (premature ratings)
- ⚠️ One location consistently lower than others (harsh raters or real performance issues?)

**Calibration questions to ask:**

- "Why does Team A have 30% Stars while Team B has 5%?"
- "Are Manager X's standards aligned with Manager Y's?"
- "Should we recalibrate Department Z's ratings?"

See [Statistics and Intelligence](statistics.md) for complete analysis features.

---

### Track Changes as You Make Decisions

**What:** Monitor the Changes tab during calibration to see cumulative impact of rating decisions.

**Why:** Without tracking, you lose sight of how many changes you're making and may forget to document important moves. The Changes tab prevents decisions from getting lost.

**How:** During calibration meetings:

1. **Keep Changes tab visible** (or check it periodically)
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

### Use Donut Mode to Validate the Center Box

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

**Why:** Delays between calibration and follow-through reduce impact and let decisions become stale. Prompt action maintains momentum and signals that talent decisions matter.

**How:**

1. **Export immediately** after calibration meeting ends (while 9Boxer is still open)
2. **Verify the export** by opening the Excel file
3. **Check for completeness:**
   - All changes saved correctly
   - Notes appear in the export
   - Modified in Session column marks changed employees
   - Original data preserved
4. **Share with stakeholders** via secure file transfer (encrypted email, secure file sharing)
5. **Follow file naming convention:** `talent_calibration_2024-Q4_FINAL.xlsx`

!!! danger "Critical: No Auto-Save"
    The application does NOT auto-save. Export before closing or all changes are lost!

See [Exporting Your Changes](exporting.md) for export best practices and file management.

---

### Create Development Plans for Each Box

**What:** Use the finalized grid to create targeted development strategies for each position.

**Why:** The 9-box grid is a planning tool, not just a rating system. Different positions require different talent strategies. Without follow-through, the grid is just an interesting visualization.

**How:** Develop box-specific action plans:

**Stars (High Performance, High Potential):**
- **Priority:** Retention and advancement
- **Actions:** Succession planning, stretch assignments, leadership development, retention bonuses
- **Cadence:** Quarterly check-ins, fast-track promotion timelines

**High Potential (Medium Performance, High Potential):**
- **Priority:** Accelerate development
- **Actions:** Mentorship, leadership training, cross-functional projects
- **Cadence:** Monthly development check-ins

**High Performers (High Performance, Medium Potential):**
- **Priority:** Leverage expertise
- **Actions:** Technical leadership, knowledge sharing, subject matter expert roles
- **Cadence:** Quarterly recognition and role optimization

**Core Performers (Medium Performance, Medium Potential):**
- **Priority:** Maintain engagement
- **Actions:** Skill development, clear goals, ongoing feedback
- **Cadence:** Standard performance review cycle

**Under-Performers (Low Performance positions):**
- **Priority:** Performance improvement or transition
- **Actions:** Performance improvement plans, coaching, role reassessment, or managed exits
- **Cadence:** Weekly or bi-weekly check-ins

**Export filtered views** for each box to share targeted lists with managers.

---

### Schedule Follow-Up Reviews

**What:** Set specific dates for the next talent review cycle before ending the current one.

**Why:** Without scheduled follow-up, talent reviews become one-off events rather than ongoing processes. Regular cycles ensure ratings stay current and development plans get executed.

**How:**

1. **Decide review frequency:** Quarterly (recommended), semi-annual, or annual
2. **Schedule next review date** before current session ends
3. **Send calendar invites** to all participants
4. **Set milestone check-ins** between full reviews (mid-quarter progress checks)
5. **Use current export as baseline** for next review (re-upload and compare)

**Recommended calendar:**

- **Q1:** Full talent review and calibration
- **Q2:** Mid-year check-in (review Stars and Under-Performers only)
- **Q3:** Full talent review and calibration
- **Q4:** Year-end review and development planning

---

### Communicate Outcomes Appropriately

**What:** Share calibration results with employees and managers in a structured, professional manner.

**Why:** Transparency builds trust, but raw grid data can be misinterpreted or demotivating. Thoughtful communication ensures talent decisions drive development rather than defensiveness.

**How:**

**For managers:**
- Share full grid and export data
- Provide context: overall distribution, calibration decisions, next steps
- Equip them to discuss ratings with their reports
- Review development actions for each box

**For employees:**
- Share individual ratings as part of performance review conversation
- Focus on development path, not grid position label
- Discuss specific actions and support available
- Frame potential honestly but encouragingly

**What NOT to share:**
- ❌ Raw grid labels ("You're in the Problem box")
- ❌ Comparisons to specific peers ("Jane is a Star, you're not")
- ❌ Grid position without context or development plan

---

### Maintain Milestone Records

**What:** Keep dated exports at key points to track talent trends over time.

**Why:** Single-point-in-time snapshots can't show trends. Historical data reveals patterns: who's improving, which teams are developing talent, whether interventions worked.

**How:** Export and archive at these milestones:

- **Quarterly exports:** `talent_2024-Q1.xlsx`, `talent_2024-Q2.xlsx`, etc.
- **Annual exports:** `talent_2024_year_end.xlsx`
- **Calibration sessions:** `talent_calibration_2024-Q4.xlsx`
- **Performance cycles:** `talent_before_reviews.xlsx`, `talent_after_reviews.xlsx`
- **Before major changes:** `talent_before_reorg_2024-Q3.xlsx`

**Use historical data to:**
- Track individual employee trajectories over time
- Measure team/department development progress
- Evaluate effectiveness of development interventions
- Support succession planning and promotion decisions

**File naming convention:** `talent_[event]_[YYYY-MM-DD].xlsx`

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

**Why:** 9Boxer has NO auto-save. If the app closes, crashes, or you upload a new file, all unsaved changes are permanently lost. Regular exports prevent catastrophic data loss.

**How to avoid:**

!!! danger "Critical: No Auto-Save"
    The application does NOT auto-save. Export regularly to avoid losing work!

**Export guidelines:**

- ✅ **Export before closing** - Always save before closing the app
- ✅ **Export during long sessions** - Save after every major set of changes (every 30-60 min)
- ✅ **Export at milestones** - After reviewing each department, after calibration, before breaks
- ✅ **Export before uploads** - Save current work before uploading a new file (uploading replaces session)
- ✅ **Export before experiments** - Create backup before making speculative changes

**File naming for frequent exports:**

- During session: `talent_inprogress_2024-12-20_14-30.xlsx`
- After milestone: `talent_engineering_complete.xlsx`
- Before risky change: `talent_backup_before_reorg.xlsx`

See [Exporting Your Changes](exporting.md) for detailed export workflow.

---

### Don't Skip Validation Steps

**What:** Avoid rushing through validation checks like Statistics review, Donut Mode, and Changes tab review.

**Why:** Skipping validation leads to errors that undermine trust in the process: missed rating bias, inconsistent calibration, undocumented changes, or employees placed incorrectly.

**How to avoid:**

**Before finalizing ratings, always:**

1. ✅ **Check Statistics tab** for distribution and anomalies
2. ✅ **Review Changes tab** to ensure all changes have notes
3. ✅ **Validate center box** with Donut Mode (if using this technique)
4. ✅ **Compare across managers/departments** for consistency
5. ✅ **Open exported file** to verify it saved correctly

**Time investment:**

- Statistics review: 5 minutes
- Changes tab review: 5 minutes
- Donut Mode exercise: 20-30 minutes (optional but valuable)
- Total: ~15-40 minutes of validation prevents hours of rework

**Warning signs you skipped validation:**

- ⚠️ Exported file has changes without notes
- ⚠️ Statistical anomalies you didn't investigate
- ⚠️ Stakeholders question rating consistency
- ⚠️ Center box is overpopulated (>60% of employees)

---

### Don't Ignore Statistical Anomalies

**What:** Avoid dismissing red or yellow anomaly flags in the Intelligence tab without investigation.

**Why:** Anomalies indicate potential rating bias, data quality issues, or real organizational problems. Ignoring them means you're signing off on potentially unfair or inaccurate ratings.

**How to avoid:**

1. **Open the Intelligence tab** before finalizing ratings
2. **Investigate each red/yellow flag:**
   - Red flag = Severe anomaly (requires explanation or correction)
   - Yellow flag = Moderate anomaly (worth discussing)
3. **Ask "Why is this happening?"**
   - Is it real (genuine performance difference)?
   - Is it bias (manager rating leniency/harshness)?
   - Is it data quality (wrong department assignment)?
4. **Document your finding** in notes or separate report
5. **Take action:**
   - Recalibrate if bias detected
   - Fix data quality issues
   - Accept if anomaly is justified and document reasoning

**Common anomalies to investigate:**

- Manager A has 40% Stars while Manager B has 5%
- Engineering department has no Low performers
- All employees hired in past 6 months rated "High Potential"
- One location significantly higher/lower than others

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

**Exception:** If new hire came from internal transfer or you have extensive prior work history, earlier rating may be justified. Document the reasoning.

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

- Review **all employees EXCEPT Sales** → Select filters, check all but Sales
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

- [Getting Started](getting-started.md) - Complete walkthrough for new users
- [Understanding the Grid](understanding-grid.md) - Detailed explanation of all 9 positions
- [Tracking Changes](tracking-changes.md) - How to add notes and document decisions
- [Exporting Your Changes](exporting.md) - Export workflow and file management
- [Donut Mode](donut-mode.md) - Advanced validation technique for Core Talent
- [Statistics and Intelligence](statistics.md) - Data analysis and anomaly detection
- [Filters](filters.md) - Focus on specific employee groups
- [Troubleshooting](troubleshooting.md) - Solutions for common issues
