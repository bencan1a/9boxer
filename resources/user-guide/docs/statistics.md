# Statistics and Intelligence

Here's everything you need to know about analyzing your talent distribution using the Statistics and Intelligence tabs in the right panel.

---

<details>
<summary>📋 Quick Reference (Click to expand)</summary>

**Accessing Statistics:**
- Click any employee (or click outside) → Statistics tab (third tab)
- Shows distribution table + visual chart
- Displays count and percentage for each grid box

**Reading Distribution:**
- Ideal: 10-15% Stars (top-right), 50-60% in middle boxes
- Red flags: Too many in bottom-left, too few in top row, heavy clustering
- Use chart to spot imbalances at a glance

**Using Intelligence:**
- Intelligence tab (fourth tab) shows anomalies and quality score
- Red/yellow highlights indicate rating inconsistencies
- Compare expected vs. actual employee counts by manager, department, job level

**Common Patterns to Watch:**
- Manager rates everyone high = leniency bias
- Department has no stars = under-rating or talent gap
- Uneven distribution = calibration needed

[See detailed analysis below ↓](#statistics-tab)

</details>

---

## When to Use This

### Common Scenarios

You'll want to use Statistics and Intelligence when:

- **Checking distribution health** - See if you have too many "High" ratings or too few Stars before calibration ([see Preparing for Talent Calibration](workflows/talent-calibration.md))
- **Identifying rating bias** - Spot managers who rate everyone high or departments with skewed distributions
- **Preparing reports** - Generate data for quarterly talent reviews or board presentations
- **Validating calibration results** - After making changes, verify your distribution improved and anomalies resolved
- **Succession planning analysis** - Check if you have enough high-potential employees in your pipeline

### Related Workflows

- [Preparing for Talent Calibration](workflows/talent-calibration.md) - Use Statistics to validate distribution and Intelligence to spot anomalies requiring discussion
- [Understanding the Grid](understanding-grid.md) - Learn what healthy distributions look like for your organization

### Real-World Example

> 📋 **Scenario**
>
> Before the calibration meeting, Rachel checks Statistics and sees 35% of employees are rated "High Performance" (target is 20%). Intelligence highlights that Manager Tom rates 80% of his team as High while other managers average 15%. This becomes her top discussion topic for the meeting.

---

## Accessing Statistics and Intelligence

To view statistics and intelligence data:

1. Click any employee tile on the grid (or click outside to view global data)
2. The right panel opens with four tabs
3. Click the **"Statistics"** tab (third tab) or **"Intelligence"** tab (fourth tab)

You'll see distribution data in Statistics and advanced analytics in Intelligence.

---

## Statistics Tab

The Statistics tab shows you exactly how your people are spread across the 9-box grid.

> 📋 **Real-World Scenario**
>
> Before her calibration meeting, Sarah checks Statistics and sees 35% of employees are rated "High Performance" (her target is 20%). This becomes her top discussion topic for the meeting - identifying which employees are truly high performers versus those rated too generously.

### Distribution Table

Here's the breakdown of employees by performance and potential:

**Table Structure:**

| | **High Potential** | **Medium Potential** | **Low Potential** |
|---|---|---|---|
| **High Performance** | Count (%) | Count (%) | Count (%) |
| **Medium Performance** | Count (%) | Count (%) | Count (%) |
| **Low Performance** | Count (%) | Count (%) | Count (%) |

**What each cell shows:**

- **Count** - Number of employees in that box
- **Percentage** - Proportion of total workforce in that box

!!! example "Example Distribution Cell"
    **15 (10%)** means 15 employees are in this box, representing 10% of the total workforce.

![Statistics tab showing distribution table with employee counts and percentages for each of the nine grid positions, plus visual bar chart representation and summary cards at the top displaying total employees, average performance, and distribution metrics](images/screenshots/statistics/statistics-panel-distribution.png)

The Statistics panel gives you both a detailed table breakdown and an at-a-glance visual chart. The bar chart makes patterns immediately obvious.

### Distribution Chart

A visual bar chart representation of your data:

- Each bar represents one of the nine boxes in the grid
- Bar height indicates the number of employees in that box
- Makes it easy to spot imbalances and patterns at a glance

!!! tip "See It in Action"
    Remember the distribution chart from the [quickstart tour](quickstart.md)? Load sample data to see realistic distribution patterns with 200 employees spread across all 9 boxes.

![Distribution chart showing ideal bell curve pattern with most employees concentrated in center boxes (positions 5, 4, 6), moderate numbers in adjacent boxes, and fewer employees in extreme positions, representing a healthy balanced distribution](images/screenshots/distribution-chart-ideal.png)

This is what a healthy, well-balanced distribution looks like. Notice the concentration in the middle boxes with fewer employees at the extremes.

### Interpreting Your Distribution

Use these statistics to assess your talent pipeline health and spot potential issues.

**Ideal Distribution (Rough Guideline):**

| Category | Target % | What It Means |
|----------|---------|---------------|
| **Stars** (High/High) | 10-15% | Top performers ready for advancement |
| **High Potential boxes** (top row) | 15-20% | Future leaders in development |
| **Core/Solid Performer boxes** (middle) | 50-60% | Backbone of the organization |
| **Lower boxes** (bottom row) | 10-20% | New hires or improvement needed |

!!! info "Distribution Guidelines"
    These are general guidelines, not strict rules. Your ideal distribution depends on your organization's structure, growth stage, and talent strategy.

**Red Flags to Watch For:**

!!! warning "Distribution Warning Signs"
    - **Too many in bottom-left** (Under-performers) - Performance management issues
    - **Too few in top rows** - Succession planning risk, retention problems
    - **Heavily skewed to one side** - Calibration needed, potential rating bias
    - **Very uneven distribution** - Rating inconsistency across managers or departments

**Balanced vs. Unbalanced Distributions:**

- **Balanced**: Employees spread across multiple boxes with concentration in middle
- **Unbalanced**: Most employees clustered in one or two boxes (indicates calibration issues)

![Three summary cards displaying key distribution metrics: total employee count, percentage in each performance category (High, Medium, Low), and percentage in each potential category, with trend indicators showing changes from previous period](images/screenshots/statistics/statistics-summary-cards.png)

Summary cards at the top of the Statistics panel give you quick insights into your overall distribution health without scrolling through the detailed table.

### Grouping and Trend Analysis

![Statistics panel with grouping dropdown menu expanded showing options to group distribution by Department, Manager, Job Level, or Location, allowing analysis of rating patterns across different organizational dimensions](images/screenshots/statistics/statistics-grouping-indicators.png)

You can group your distribution data by different dimensions (Department, Manager, Location, Job Level) to spot patterns and compare rating consistency across teams.

![Statistics panel showing trend indicators with green upward arrows for improving metrics and red downward arrows for declining metrics, comparing current distribution against previous period baseline to track changes over time](images/screenshots/statistics/statistics-trend-indicators.png)

Trend indicators show you how your distribution has changed over time. Green arrows indicate improvements (like increasing Stars or reducing Under-performers), while red arrows highlight areas needing attention.

### Use Cases for Statistics

**Performance Review Calibration:**

- Compare your distribution to organizational targets
- Identify if too many employees are rated "High" or "Low"
- Ensure consistent rating standards across teams

**Succession Planning:**

- Check if you have enough high-potential employees (top row)
- Identify gaps in your talent pipeline
- Plan development programs based on distribution

**Talent Strategy Assessment:**

- Evaluate overall workforce quality
- Spot hiring or retention issues
- Track distribution changes over time

> Why This Matters
>
> Statistics help you focus during calibration meetings. Instead of guessing if your ratings are balanced, you'll see exactly where adjustments are needed. This data turns subjective discussions into objective calibration.

---

## Intelligence Tab

Intelligence runs advanced statistical analysis behind the scenes to spot patterns, anomalies, and potential biases in your ratings.

!!! info "Sample Data Includes Intentional Bias Patterns"
    Sample data deliberately includes USA location bias (+15% high performers) and Sales function bias (+20% high performers) so you can see Intelligence in action. [Take the quickstart tour](quickstart.md) to explore how anomaly detection works!

> 📋 **Real-World Scenario**
>
> Priya opens Intelligence and discovers that the Engineering department has 80% of employees in the "Core Talent" box while Sales has only 40%. She uses filters to review Engineering employees individually, finding 12 who are actually high-potential but were rated conservatively. She adds notes and recalibrates their ratings.

### What Intelligence Analyzes

Intelligence uses statistical testing (chi-square test) to detect unusual patterns across different dimensions:

- **Job Level** - Are managers rated differently than individual contributors?
- **Job Profile** - Do certain functions have skewed ratings (e.g., sales vs. engineering)?
- **Manager** - Do some managers rate too high or too low compared to peers?
- **Location/Organization** - Are certain offices or departments rated inconsistently?

![Intelligence tab displaying two anomaly cards: "Location Bias - USA" highlighted in red with "Needs Attention" badge showing 23 affected employees with +15% deviation from expected distribution, and "Function Bias - Sales" in yellow with "Review Recommended" showing 15 affected employees with +12% deviation](images/screenshots/workflow/intelligence-summary-anomalies.png)

The Intelligence tab highlights anomalies with color-coded severity indicators. Red cards need immediate attention, yellow cards warrant review, and green cards are informational.

### Quality Score

At the top of the Intelligence tab, you'll see an overall **quality score** for your data distribution.

**What the score indicates:**

- **High score** - Ratings are well-calibrated and statistically consistent
- **Low score** - Significant anomalies detected, calibration review recommended

The quality score helps you quickly assess the reliability of your talent data.

![Intelligence tab showing excellent quality score with green checkmark and "No anomalies detected" message, indicating well-calibrated ratings with consistent distribution patterns across all organizational dimensions and no statistical outliers requiring attention](images/screenshots/workflow/intelligence-summary-excellent.png)

When Intelligence shows a clean bill of health like this, your ratings are well-calibrated and statistically consistent across your organization. No anomalies means no bias patterns detected.

![Intelligence tab showing critical alert with red warning indicator, low quality score, and multiple anomaly cards highlighted for immediate attention, indicating significant rating inconsistencies requiring calibration review before finalizing performance assessments](images/screenshots/workflow/intelligence-summary-needs-attention.png)

This is what you see when Intelligence detects problems. Multiple red anomalies mean you should review ratings before finalizing them. Use this as a discussion prompt for calibration meetings.

### Anomaly Detection

Intelligence highlights unusual distributions by comparing:

- **Expected employee count** - What you'd expect based on overall distribution
- **Actual employee count** - What you actually have in each category
- **Deviation** - How far actual deviates from expected

**We highlight outliers with color coding:**

- **Red/Yellow highlights** - Significant deviations from expected distribution
- **Tables or lists** - Show which groups have the most anomalies

!!! example "Anomaly Example"
    **Expected**: 8 employees in "High Performance, High Potential" for Engineering
    **Actual**: 2 employees
    **Deviation**: -6 (significantly lower than expected)
    **Interpretation**: Engineering may be under-rating high performers or lacking stars

![Detailed anomaly card for critical severity issue showing "Manager Leniency - Tom Chen" with red "Needs Attention" badge, affected employee count of 18, expected distribution 4.2 employees, actual distribution 18 employees, deviation of +13.8, statistical significance p-value, and "View Affected Employees" action button](images/screenshots/workflow/intelligence-anomaly-red.png)

Critical (red) anomalies like this manager leniency example show severe rating bias. This manager rates 18 employees high when only 4 would be expected statistically. This needs immediate calibration discussion.

![Detailed anomaly card for minor severity issue showing "New Hire Distribution" with green "Informational" badge, showing slight positive deviation of +2.3 employees in high potential category, with statistical details indicating pattern is within acceptable variance and no action required](images/screenshots/workflow/intelligence-anomaly-green.png)

Minor (green) anomalies are informational only. This slight deviation is within normal statistical variance and doesn't require action. Intelligence helps you distinguish real problems from noise.

### Anomaly Severity Levels

Intelligence uses color coding to indicate how urgent each anomaly is:

- **Red (Critical)** - Needs immediate attention, significant deviation (p < 0.01)
- **Yellow (Moderate)** - Review recommended, notable pattern (p < 0.05)
- **Green (Minor)** - Informational only, within acceptable variance

The statistical significance (p-value) tells you whether the pattern is real or could be random chance.

### Deviation Charts

![Intelligence deviation chart showing bar graph comparing expected vs actual employee distribution across performance and potential categories, with red bars indicating categories with significant positive deviation and blue bars showing negative deviation from statistical norms](images/screenshots/workflow/intelligence-deviation-chart.png)

Deviation charts visualize where your actual distribution differs from expected patterns. Red bars show over-representation, blue shows under-representation. This makes patterns obvious at a glance.

![Intelligence level distribution chart showing employee counts broken down by job level (Individual Contributor, Manager, Director, VP, Executive) with performance and potential ratings for each level, revealing rating patterns across organizational hierarchy and potential succession planning gaps](images/screenshots/workflow/intelligence-level-distribution.png)

Level distribution analysis shows rating patterns across your organizational hierarchy. Use this to spot if managers are rated differently than individual contributors or if leadership has succession gaps.

### What Anomalies Tell You

**Common Anomaly Patterns:**

| Anomaly Type | What It Might Mean | Action to Take |
|--------------|-------------------|----------------|
| **Manager rates everyone high** | Leniency bias or truly exceptional team | Compare to peer managers, calibrate ratings |
| **Department has no stars** | Under-rating or genuine talent gap | Review top performers, assess hiring needs |
| **New hires rated as "High Potential"** | Premature ratings or excellent hiring | Wait for performance data before rating potential |
| **One location skewed low** | Harsh raters or performance issues | Calibrate across locations, investigate issues |

### How to Use Intelligence Insights

Here's how to act on Intelligence findings:

**Step 1: Check the Quality Score**

- Look at the overall score at the top
- Low score? Investigate anomalies before finalizing ratings

**Step 2: Scan for Red or Yellow Anomalies**

- Find the highlighted categories
- Note which dimensions have the biggest deviations

**Step 3: Investigate Outliers**

Ask these questions:

- **Manager bias?** Does one manager rate everyone as "High" or "Low"?
- **Department gaps?** Does one department have no stars or too many under-performers?
- **Rating consistency?** Are new hires properly rated as "Too New/Question Mark"?
- **Location differences?** Are certain offices rated more harshly or leniently?

**Step 4: Validate or Adjust Placements**

- **If the anomaly is justified** (e.g., one team truly is exceptional) - Keep ratings as-is
- **If the anomaly indicates bias** (e.g., leniency or harshness) - Re-calibrate ratings across teams

**Step 5: Re-Calibrate if Needed**

- Hold calibration meetings with managers
- Ensure consistent rating standards across the organization
- Adjust placements based on intelligence insights

### Benefits of Intelligence Analysis

Using the Intelligence tab helps ensure:

- **Fair and consistent ratings** across the organization
- **Identification of potential bias** (leniency, harshness, or other rating errors)
- **Data quality and accuracy** for decision-making
- **Informed succession planning** based on reliable talent data
- **Calibration guidance** for performance review cycles

!!! tip "Use Intelligence During Calibration"
    The Intelligence tab is most valuable during talent calibration sessions. Review anomalies with managers and use the insights to drive discussions about rating consistency.

---

## Combining Statistics and Intelligence

For the most effective analysis, use both tabs together:

**Workflow:**

1. **Start with Statistics** - Get the big picture of your distribution
2. **Check Intelligence** - Identify specific anomalies and patterns
3. **Investigate outliers** - Drill into specific managers, departments, or job levels
4. **Use Filters** - Apply filters to focus on problem areas
5. **Re-calibrate** - Adjust ratings based on insights
6. **Re-check Statistics** - Verify distribution improvements after changes

**Example Workflow:**

1. Statistics shows 60% of employees are in "Core Performer" box
2. Intelligence highlights that Engineering has 80% in Core, while Sales has 40%
3. Apply filter to show only Engineering employees
4. Review placements and identify stars/under-performers miscategorized as "Core"
5. Move employees to more accurate boxes
6. Re-check Statistics to see improved distribution

---

## Quick Reference

| I want to... | How to do it |
|--------------|-------------|
| View distribution statistics | Click any employee (or click outside) → Statistics tab (third tab) |
| See counts and percentages | Check the distribution table - each cell shows count (%) |
| Spot imbalances visually | Look at the distribution chart - bar heights show concentrations |
| Check if distribution is healthy | Compare to ideal: 10-15% Stars, 50-60% in middle boxes |
| View anomaly analysis | Click Intelligence tab (fourth tab) |
| Check overall quality score | Look at top of Intelligence tab for quality score |
| Find specific bias patterns | Scan Intelligence for red/yellow anomaly cards |
| See which managers rate high | Intelligence shows manager-level rating patterns |
| Compare expected vs actual | Anomaly cards show expected count vs actual count |
| Investigate an anomaly | Click "View Affected Employees" on anomaly card, use filters to drill in |
| Group distribution by dimension | Use Statistics grouping dropdown (Department, Manager, Location, Job Level) |
| Track distribution changes | Look for trend indicators (green/red arrows) in Statistics panel |

---

## Related Topics

- [Understanding the Grid](understanding-grid.md) - Learn what each box means and ideal distributions
- [Filtering and Exclusions](filters.md) - Focus on specific groups when investigating anomalies
- [Tracking Changes](tracking-changes.md) - Document rating adjustments based on intelligence insights
- [Tips & Best Practices](tips.md) - Best practices for using statistics during reviews
