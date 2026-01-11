# Detection Methodology

This page provides a comprehensive technical deep dive into the statistical methods used by 9Boxer's Intelligence feature to detect rating anomalies and patterns in talent calibration data. It is designed for technically-minded users who want to understand the rigor and validity behind the automated analyses.

---

## 1. Introduction & Overview

The Intelligence tab performs **automated statistical anomaly detection** to help talent leaders identify potential biases, inconsistencies, and patterns in performance ratings. Rather than relying solely on manual review, the system applies rigorous statistical testing to flag areas that merit closer examination during calibration meetings.

### Six Automatic Analyses

When you access the Intelligence tab, 9Boxer automatically runs six distinct analyses:

1. **Location Analysis** - Detects performance distribution differences across geographic locations
2. **Job Function Analysis** - Identifies 9-box distribution biases across job functions
3. **Job Level Analysis** - Verifies calibration uniformity across organizational levels (a uniformity test)
4. **Tenure Analysis** - Detects performance patterns correlated with employee tenure
5. **Manager Analysis** - Identifies managers whose rating distributions deviate from baseline expectations
6. **Per-Level Distribution Analysis** - Analyzes performance distribution within each job level separately

All analyses run automatically with sensible defaults—no configuration required.

### Traffic Light Severity System

Each analysis receives a severity status:

- **🔴 Red (Severe):** Critical anomaly requiring immediate attention
- **🟡 Yellow (Moderate):** Notable anomaly worth reviewing
- **🟢 Green (Healthy):** No significant deviation detected

The severity determination considers multiple factors: statistical significance (p-values), effect sizes (Cramér's V), and individual cell deviations (Z-scores). This multi-factor approach prevents flagging trivial anomalies while catching meaningful patterns that simpler tests might miss.

### Sample Size Requirements

All analyses require:

- **Minimum sample size:** 30 employees
- **Expected frequency rule:** All cells in contingency tables must have expected frequency ≥ 5
- **Fallback:** Fisher's exact test for 2×2 tables when sample sizes are too small for chi-square

These requirements ensure statistical validity and prevent spurious findings from small samples.

### How Analyses Inform LLM Insights

After running all statistical analyses, 9Boxer packages the results (along with anonymized employee data) and sends them to a Large Language Model (Claude). The LLM interprets the statistical findings in natural language, clusters related issues, and provides actionable recommendations. This hybrid approach combines statistical rigor with human-readable explanations.

---

## 2. Statistical Foundations

This section explains the core statistical concepts that underpin all anomaly detection analyses.

### Chi-Square Test of Independence

**Used by:** Location, Function, Level, and Tenure analyses

The chi-square test of independence assesses whether two categorical variables are statistically independent. In the context of talent calibration, this means testing whether performance ratings are distributed uniformly across categories (locations, functions, levels, or tenure brackets).

**Null Hypothesis (H₀):** Performance distribution is independent of the category (e.g., performance ratings don't depend on location).

**Alternative Hypothesis (H₁):** Performance distribution differs significantly across categories.

**Formula:**

```
χ² = Σ [(Oᵢ - Eᵢ)² / Eᵢ]
```

Where:
- Oᵢ = Observed frequency in cell i
- Eᵢ = Expected frequency in cell i = (row total × column total) / grand total
- Σ = Sum across all cells in the contingency table

**Degrees of Freedom:**

```
df = (r - 1) × (c - 1)
```

Where:
- r = number of rows in contingency table
- c = number of columns in contingency table

**Interpretation:**

- **p-value ≤ 0.05:** Reject null hypothesis—performance distribution differs significantly
- **p-value > 0.05:** Fail to reject null hypothesis—no significant difference detected

**Important:** A significant p-value tells us there's a pattern, but it doesn't tell us *where* the pattern is or *how large* it is. That's why we also use Z-scores and Cramér's V.

### Chi-Square Goodness-of-Fit Test

**Used by:** Manager analysis only

The goodness-of-fit test assesses whether an observed distribution matches a theoretical expected distribution. For manager analysis, we test whether each manager's rating distribution matches the 20/70/10 baseline (20% High performers, 70% Medium, 10% Low).

**Null Hypothesis (H₀):** Manager's distribution matches the 20/70/10 baseline.

**Alternative Hypothesis (H₁):** Manager's distribution deviates significantly from baseline.

**Formula:**

```
χ² = Σ [(Oᵢ - Eᵢ)² / Eᵢ]
```

Where:
- Oᵢ = Observed count in category i (e.g., manager has 8 High performers)
- Eᵢ = Expected count in category i = total employees × expected proportion (e.g., 20 employees × 0.20 = 4)

**Key Difference from Independence Test:**

- Independence test: Tests relationship between TWO variables
- Goodness-of-fit test: Tests ONE variable against a theoretical distribution

### Standardized Residuals (Z-Scores)

Z-scores identify which specific cells in a contingency table drive the overall chi-square result. While the chi-square statistic tells us "there's a pattern," Z-scores tell us "the pattern is specifically in this cell."

**Formula:**

```
Z = (Oᵢ - Eᵢ) / √Eᵢ
```

**Interpretation:**

- **|Z| ≥ 2.0:** Cell is statistically significant (roughly p < 0.05)
- **|Z| ≥ 2.5:** Strong deviation
- **|Z| ≥ 3.0:** Very strong deviation
- **Z > 0:** More than expected (over-represented)
- **Z < 0:** Fewer than expected (under-represented)

**Example:** If Remote workers have Z = 3.5 for High performance, this means:
- Remote workers are rated High 3.5 standard deviations above expectation
- This is a very strong, statistically significant over-representation
- This specific location-performance combination is driving the overall anomaly

### Cramér's V Effect Size

P-values tell us whether a pattern exists, but they don't tell us whether the pattern *matters*. With large sample sizes, even tiny, practically meaningless differences can be statistically significant. Cramér's V measures the strength of association between variables.

**Formula:**

```
V = √(χ² / (n × m))
```

Where:
- χ² = Chi-square statistic
- n = Total sample size
- m = min(r - 1, c - 1) where r = rows, c = columns

**Interpretation:**

- **0.00 - 0.10:** Negligible effect (small or no association)
- **0.10 - 0.30:** Small effect
- **0.30 - 0.50:** Medium effect
- **0.50+:** Large effect (strong association)

**Why This Matters:** You might have p = 0.001 (very significant) but V = 0.12 (small effect). This means the pattern is real but weak—not necessarily actionable. Conversely, V = 0.45 with p = 0.08 might indicate a meaningful pattern worth investigating, even though it's not technically "significant."

### Sample Size and Validity

**Minimum Sample Size:** All analyses require at least 30 employees. Below this threshold, statistical tests lack sufficient power to detect patterns reliably.

**Expected Frequency Rule:** For chi-square tests to be valid, every cell in the contingency table should have expected frequency ≥ 5. When this rule is violated:

- For 2×2 tables: Use Fisher's exact test instead
- For larger tables: Results may be unreliable; interpret with caution

**Why This Matters:** Violating these assumptions can lead to inflated false positive rates (flagging anomalies that don't exist) or deflated power (missing real patterns).

---

## 3. Location Analysis

Location analysis detects whether employees in certain geographic locations are systematically rated higher or lower than expected.

### Methodology

**Test:** Chi-square test of independence
**Contingency Table:** Locations (rows) × Performance Levels (columns)

The performance levels are:
- **High:** Grid positions 9, 8, 6 (Star, Growth, High Impact)
- **Medium:** Grid positions 7, 5, 3 (Enigma, Core Talent, Workhorse)
- **Low:** Grid positions 4, 2, 1 (Inconsistent, Effective Pro, Underperformer)

### Requirements

- At least 2 locations in the dataset
- Sample size ≥ 30 employees
- Expected frequency ≥ 5 in all cells (or fallback to Fisher's exact test)

### How It Works

1. **Build contingency table** counting employees in each location × performance combination
2. **Calculate expected frequencies** assuming performance is independent of location
3. **Run chi-square test** to determine if observed frequencies differ significantly from expected
4. **Calculate Z-scores** for each location-performance cell to identify specific deviations
5. **Determine severity** based on p-value, effect size, and maximum Z-score

### Example

Consider a company with three locations:

| Location | High (Obs) | High (Exp) | Medium (Obs) | Medium (Exp) | Low (Obs) | Low (Exp) | Total |
|----------|------------|------------|--------------|--------------|-----------|-----------|-------|
| Office A | 15 (25%)   | 12 (20%)   | 42 (70%)     | 42 (70%)     | 3 (5%)    | 6 (10%)   | 60    |
| Office B | 8 (20%)    | 8 (20%)    | 28 (70%)     | 28 (70%)     | 4 (10%)   | 4 (10%)   | 40    |
| Remote   | 21 (35%)   | 12 (20%)   | 36 (60%)     | 42 (70%)     | 3 (5%)    | 6 (10%)   | 60    |

**Statistical Results:**
- χ² = 8.57, p = 0.073, df = 4, V = 0.17
- Z-scores: Remote/High = +2.8, Office A/High = +1.2, Remote/Medium = -1.5

**Interpretation:**
- Overall p-value (0.073) is not significant at α = 0.05
- However, Remote/High has Z = 2.8, indicating significant over-representation
- Effect size V = 0.17 is small but non-negligible
- **Severity: Yellow** (significant individual deviation despite non-significant overall p-value)

**Human Explanation:** "Remote workers are rated as High performers 35% of the time, compared to 20% company-wide. This 15-percentage-point difference is statistically significant (Z = 2.8) and affects 21 employees. Consider whether remote work genuinely correlates with higher performance, or if there's a systematic bias in how remote employees are evaluated."

### When This Flags Issues vs. When It's Healthy

**Healthy (Green):**
- Performance distributions are similar across all locations
- Small, random variations that don't exceed significance thresholds
- Example: All locations have 18-22% High performers

**Moderate Concern (Yellow):**
- One location shows significant deviation (|Z| ≥ 2.0)
- Medium effect size (V ≥ 0.3)
- Example: Remote workers have 30% High performers vs. 20% expected

**Severe Concern (Red):**
- Multiple locations show strong deviations (|Z| ≥ 3.0)
- Large effect size (V ≥ 0.5)
- Example: Location A has 45% High performers, Location B has 8%

---

## 4. Job Function Analysis

Function analysis identifies whether employees in certain job functions (Engineering, Sales, Marketing, etc.) are systematically rated differently in the 9-box grid.

### Methodology

**Test:** Chi-square test of independence
**Contingency Table:** Functions (rows) × Grid Positions 1-9 (columns)

**Key Difference from Location Analysis:** Instead of collapsing to High/Medium/Low, function analysis examines the full 9-box distribution. This provides more granularity to detect whether functions cluster in specific grid positions.

### Handling Rare Functions

Functions with fewer than 10 employees are grouped into an "Other" category to ensure adequate sample sizes for statistical testing.

### Grid Position Filtering

The analysis filters out grid positions that have zero employees across all functions, preventing division-by-zero errors and focusing on positions that actually exist in the dataset.

### Focus on High Performers

While the chi-square test examines all 9 positions, the deviation analysis highlights positions 3, 6, and 9:
- Position 3: Workhorse (High Performance, Low Potential)
- Position 6: High Impact (High Performance, Medium Potential)
- Position 9: Star (High Performance, High Potential)

This focus helps identify whether certain functions are over- or under-represented among top performers.

### Example

Consider a company with four functions:

| Function    | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 | Pos 8 | Pos 9 | Total |
|-------------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| Engineering | 2     | 4     | 8     | 3     | 20    | 10    | 5     | 6     | 8     | 66    |
| Sales       | 1     | 3     | 4     | 2     | 15    | 6     | 3     | 4     | 4     | 42    |
| Marketing   | 0     | 2     | 2     | 1     | 10    | 3     | 2     | 2     | 2     | 24    |
| Operations  | 2     | 4     | 3     | 2     | 12    | 4     | 2     | 2     | 1     | 32    |

**High Performer Distribution (Positions 3, 6, 9):**

| Function    | High Perf Count | High Perf % | Expected % | Z-score |
|-------------|-----------------|-------------|------------|---------|
| Engineering | 26              | 39%         | 30%        | +2.4    |
| Sales       | 14              | 33%         | 30%        | +0.8    |
| Marketing   | 7               | 29%         | 30%        | -0.2    |
| Operations  | 8               | 25%         | 30%        | -1.3    |

**Statistical Results:**
- χ² = 12.45, p = 0.134, df = 24, V = 0.20
- Engineering shows significant over-representation in high performer positions (Z = 2.4)

**Interpretation:**
- Engineering has 39% of employees in high performer positions vs. 30% expected
- This affects 26 employees and is statistically significant
- **Severity: Yellow**

**Human Explanation:** "Engineering has a notably higher proportion of employees in Star, High Impact, and Workhorse positions (39% vs. 30% expected). This might reflect genuine skill differences, or it could indicate that engineering contributions are more visible during calibration. Review whether evaluation criteria are function-appropriate."

### Why Grid Position Distribution Matters

Simply comparing "High/Medium/Low" performance ratings treats a Position 3 "Workhorse" (high performer with low potential) the same as a Position 9 "Star" (high performer with high potential). By analyzing the full 9-box distribution, we can detect more nuanced patterns:

- **Function A** might have many Position 3 employees (solid contributors, limited growth)
- **Function B** might have many Position 9 employees (top talent, high trajectory)

These patterns have different implications for succession planning and development.

---

## 5. Job Level Analysis (The Uniformity Test)

Level analysis is unique among all analyses: it's a **uniformity test**, meaning the interpretation is inverted compared to other tests.

### Methodology

**Test:** Chi-square test of independence
**Contingency Table:** Job Levels (rows) × Performance Levels (columns)

**CRITICAL DISTINCTION:** For this analysis only:
- **p > 0.05 is GOOD** (indicates consistent calibration standards)
- **p ≤ 0.05 is CONCERNING** (indicates inconsistent standards across levels)

### Why Uniformity Matters

In a well-calibrated organization, the distribution of High/Medium/Low performers should be roughly similar across job levels. If MT3 has 40% High performers but MT4 has only 15%, this suggests:

- Inconsistent rating standards between levels
- Possible "level inflation" (easier to get high ratings at certain levels)
- Calibration conversations are not aligned across the organization

**This is different from other analyses** where we're looking for bias. Here, we're looking for *consistency*.

### What "Uniformity" Means

Uniformity does NOT mean:
- Every level must have exactly 20% High performers
- Higher-level employees can't be higher performers on average (that's expected!)

Uniformity DOES mean:
- Performance *distribution* should be similar (e.g., all levels have ~20% High, ~70% Medium, ~10% Low)
- Rating standards are being applied consistently
- A "High performer" at MT2 means the same thing as a "High performer" at MT4

### Example: Healthy Uniformity

| Level | High % | Medium % | Low % | Total |
|-------|--------|----------|-------|-------|
| MT1   | 22%    | 68%      | 10%   | 40    |
| MT2   | 19%    | 72%      | 9%    | 45    |
| MT3   | 21%    | 70%      | 9%    | 35    |
| MT4   | 20%    | 71%      | 9%    | 30    |

**Statistical Results:**
- χ² = 0.85, p = 0.932, df = 6, V = 0.06
- **Severity: Green**

**Interpretation:** Distributions are nearly identical across levels. Rating standards are being applied consistently. This is exactly what we want to see.

### Example: Poor Uniformity

| Level | High % | Medium % | Low % | Total |
|-------|--------|----------|-------|-------|
| MT1   | 15%    | 75%      | 10%   | 40    |
| MT2   | 25%    | 68%      | 7%    | 45    |
| MT3   | 40%    | 55%      | 5%    | 35    |
| MT4   | 10%    | 82%      | 8%    | 30    |

**Statistical Results:**
- χ² = 18.34, p = 0.005, df = 6, V = 0.31
- Z-scores: MT3/High = +3.2, MT4/High = -2.1
- **Severity: Red**

**Interpretation:** MT3 has significantly more High performers (40%) than expected (20%), while MT4 has significantly fewer (10%). This suggests:
- MT3 managers may be rating more generously
- MT4 managers may be rating more harshly
- Different calibration standards are being applied at different levels

**Human Explanation:** "There's significant variation in how employees are rated across job levels. MT3 has 40% High performers while MT4 has only 10%, suggesting inconsistent calibration standards. During your calibration meeting, ensure all managers align on what 'High performance' means, regardless of job level."

### When This Flags Issues vs. When It's Healthy

**Healthy (Green):**
- p > 0.05 (distributions are uniform across levels)
- Small effect size (V < 0.1)
- Z-scores < 2.0 for all level-performance combinations

**Moderate Concern (Yellow):**
- p ≤ 0.05 but effect size is small-to-medium (V < 0.3)
- One level shows moderate deviation

**Severe Concern (Red):**
- p < 0.01 with medium or large effect size
- Multiple levels show strong deviations (|Z| ≥ 3.0)
- Large disparities (e.g., one level has 3x the High performers of another)

---

## 6. Tenure Analysis

Tenure analysis detects whether employee tenure (length of service) correlates with performance ratings. Common patterns include "new hire optimism" (rating new employees generously) and "long-tenure plateauing" (rating long-tenured employees lower).

### Methodology

**Test:** Chi-square test of independence
**Contingency Table:** Tenure Categories (rows) × Performance Levels (columns)

### Tenure Categories

The system typically groups employees into tenure brackets such as:
- 0-1 years (New hires)
- 1-2 years
- 2-5 years
- 5-10 years
- 10+ years (Veterans)

Exact brackets may vary depending on organizational tenure distribution.

### Common Patterns

**New Hire Optimism:**
- New employees (< 1 year) rated disproportionately as High performers
- May reflect genuine high performance during "honeymoon period"
- May also reflect insufficient data to calibrate ratings accurately
- Z-score for <1 year / High would be significantly positive

**Long-Tenure Plateauing:**
- Long-tenured employees (10+ years) rated disproportionately as Medium or Low
- May reflect genuine skill obsolescence or disengagement
- May also reflect "familiarity bias" (overlooking contributions of familiar employees)
- Z-score for 10+ years / High would be significantly negative

**Mid-Career Peak:**
- Employees with 2-5 years show highest High performer percentage
- Often the "sweet spot" of experience + motivation

### Example

| Tenure    | High % | High (Obs) | High (Exp) | Z-score | Medium % | Low % | Total |
|-----------|--------|------------|------------|---------|----------|-------|-------|
| 0-1 years | 35%    | 14         | 8          | +2.8    | 60%      | 5%    | 40    |
| 1-2 years | 25%    | 10         | 8          | +0.9    | 68%      | 7%    | 40    |
| 2-5 years | 22%    | 11         | 10         | +0.4    | 70%      | 8%    | 50    |
| 5-10 years| 18%    | 7          | 8          | -0.5    | 72%      | 10%   | 40    |
| 10+ years | 10%    | 3          | 6          | -1.8    | 73%      | 17%   | 30    |

**Statistical Results:**
- χ² = 12.67, p = 0.048, df = 8, V = 0.20
- Significant Z-scores: 0-1 years/High (+2.8), 10+ years/High (-1.8)
- **Severity: Yellow**

**Interpretation:**
- New hires (< 1 year) are rated High 35% of the time vs. 20% expected
- Veterans (10+ years) are rated High only 10% of the time vs. 20% expected
- This creates a 25-percentage-point gap between tenure groups

**Human Explanation:** "New hires are significantly more likely to be rated as High performers (35%) compared to employees with 10+ years tenure (10%). This might reflect genuine performance differences, or it could indicate 'new hire optimism' bias. Review whether new hire ratings are based on sufficient data, and whether long-tenured employees' contributions are being fully recognized."

### Why This Matters

Tenure bias can have serious implications:

- **Retention:** High performers may leave if they perceive tenure as a disadvantage
- **Development:** New hires may not receive developmental feedback if rated too generously
- **Fairness:** Long-tenured employees may feel undervalued
- **Succession Planning:** Over-promoting new hires or under-utilizing veterans

---

## 7. Manager Analysis

Manager analysis identifies individual managers whose rating distributions deviate significantly from the expected 20/70/10 baseline (20% High, 70% Medium, 10% Low performers).

### Methodology

**Test:** Chi-square goodness-of-fit test (NOT test of independence)
**Baseline:** 20% High, 70% Medium, 10% Low performers
**Minimum Team Size:** 10 employees (default)

**Key Difference:** This is the ONLY analysis that uses goodness-of-fit instead of independence testing. We're comparing each manager's distribution to a theoretical baseline, not comparing managers to each other.

### Why 20/70/10 Baseline?

The 20/70/10 distribution reflects a typical organizational reality:
- **20% High performers:** Top contributors, succession candidates, stars
- **70% Medium performers:** Solid contributors, the organizational backbone
- **10% Low performers:** Struggling employees, performance concerns

This baseline is not prescriptive (managers aren't required to hit these exact percentages) but serves as a reference point to detect significant deviations.

### How It Works

1. **Build organizational hierarchy** using OrgService to identify all managers
2. **Filter managers** to those with at least 10 direct reports (configurable)
3. **For each manager:**
   - Count employees in High/Medium/Low performance buckets
   - Calculate expected counts based on 20/70/10 baseline
   - Run chi-square goodness-of-fit test
   - Calculate Z-scores for each performance level
4. **Rank managers** by chi-square statistic (most anomalous first)
5. **Return top N managers** (default: 10) for display

### Example: Manager Rating Too Harshly

**Manager A has 20 direct reports:**

| Performance | Observed | Expected (20/70/10) | Z-score |
|-------------|----------|---------------------|---------|
| High        | 1 (5%)   | 4 (20%)             | -1.5    |
| Medium      | 15 (75%) | 14 (70%)            | +0.3    |
| Low         | 4 (20%)  | 2 (10%)             | +1.4    |

**Statistical Results:**
- χ² = 4.86, p = 0.088
- No individual Z-score exceeds 2.0
- **Severity: Green or Yellow** (borderline)

**Interpretation:** Manager A rates slightly more harshly than expected (5% High vs. 20% baseline, 20% Low vs. 10% baseline), but the deviation is not statistically significant.

### Example: Manager Rating Too Generously

**Manager B has 25 direct reports:**

| Performance | Observed | Expected (20/70/10) | Z-score |
|-------------|----------|---------------------|---------|
| High        | 12 (48%) | 5 (20%)             | +3.5    |
| Medium      | 12 (48%) | 17.5 (70%)          | -1.3    |
| Low         | 1 (4%)   | 2.5 (10%)           | -0.9    |

**Statistical Results:**
- χ² = 14.25, p = 0.0008
- High Z-score = +3.5 (highly significant)
- **Severity: Red**

**Interpretation:** Manager B rates nearly half of direct reports (48%) as High performers, compared to the 20% baseline. This is a very strong, statistically significant deviation affecting 12 employees.

**Human Explanation:** "Manager B has 48% of their team rated as High performers, significantly above the 20% baseline. This could reflect a genuinely exceptional team, or it could indicate lenient rating standards. During calibration, review whether these ratings align with peer managers' standards and whether the team's contributions justify the high ratings."

### Organizational Hierarchy Integration

The manager analysis uses the OrgService to build a complete organizational hierarchy, identifying:
- Who reports to whom (manager-employee relationships)
- Manager levels and spans of control
- Total organizational size under each manager

This ensures that only true people managers (not individual contributors) are analyzed, and that the minimum team size threshold is applied correctly.

### Why Minimum Team Size Matters

With small teams (< 10 employees), the expected counts become too small for reliable chi-square testing. For example:
- Manager with 5 employees: Expected High = 1, Expected Low = 0.5
- These fractional expected counts violate chi-square assumptions

By requiring at least 10 employees, we ensure:
- Expected High ≥ 2 employees
- Expected Low ≥ 1 employee
- More reliable statistical conclusions

### When This Flags Issues vs. When It's Healthy

**Healthy (Green):**
- Distribution close to 20/70/10 baseline
- Chi-square p > 0.05
- Z-scores < 2.0

**Moderate Concern (Yellow):**
- Moderate deviation (e.g., 30% High vs. 20% baseline)
- p ≤ 0.05 but not extreme
- One Z-score between 2.0 and 2.5

**Severe Concern (Red):**
- Extreme deviation (e.g., 50% High or 0% High)
- p < 0.01
- Z-score ≥ 3.0

### Coaching Implications

Manager anomalies don't necessarily indicate "bad managers." Potential causes include:

- **Genuinely exceptional team:** Some managers inherit or build strong teams
- **Lenient standards:** Manager rates too generously
- **Harsh standards:** Manager rates too harshly
- **Inadequate calibration:** Manager not aligned with peer standards
- **Small sample:** Random variation (especially near the 10-employee threshold)

The analysis flags managers for calibration discussion, not punitive action.

---

## 8. Per-Level Distribution Analysis

Per-level distribution analysis examines the performance distribution within EACH job level separately, using Z-score analysis against the 20/70/10 baseline. This complements the level uniformity test by identifying specific levels that need calibration attention.

### Methodology

**Test:** Z-score analysis (not chi-square)
**Baseline:** 20% High, 70% Medium, 10% Low performers
**Applied to:** Each job level independently

### Use Case

Imagine your organization has an overall distribution of 25% High / 68% Medium / 7% Low:

- Overall, you're slightly above the 20/70/10 baseline
- But which specific levels are driving this?

Per-level analysis reveals:
- **MT1:** 22% High (within normal range)
- **MT2:** 20% High (within normal range)
- **MT3:** 45% High (way above baseline!)
- **MT4:** 18% High (within normal range)

**Insight:** MT3 is the problem. Focus calibration efforts there.

### How It Works

1. **Group employees by job level** (MT1, MT2, MT3, etc.)
2. **For each level:**
   - Count employees in High/Medium/Low performance tiers
   - Calculate expected counts based on 20/70/10 baseline
   - Calculate Z-score for each performance tier
3. **Flag levels** where any Z-score exceeds ±2.0
4. **Provide level-specific recommendations** for calibration

### Performance Tier Definitions

**High:** Grid positions 9, 8, 6
- Position 9: Star [High Performance, High Potential]
- Position 8: Growth [Medium Performance, High Potential]
- Position 6: High Impact [High Performance, Medium Potential]

**Medium:** Grid positions 7, 5, 3
- Position 7: Enigma [Low Performance, High Potential]
- Position 5: Core Talent [Medium Performance, Medium Potential]
- Position 3: Workhorse [High Performance, Low Potential]

**Low:** Grid positions 4, 2, 1
- Position 4: Inconsistent [Low Performance, Medium Potential]
- Position 2: Effective Pro [Medium Performance, Low Potential]
- Position 1: Underperformer [Low Performance, Low Potential]

### Example

| Level | Total | High (Obs) | High (Exp) | High Z | Med (Obs) | Med (Exp) | Med Z | Low (Obs) | Low (Exp) | Low Z |
|-------|-------|------------|------------|--------|-----------|-----------|-------|-----------|-----------|-------|
| MT1   | 40    | 9 (22%)    | 8 (20%)    | +0.4   | 28 (70%)  | 28 (70%)  | 0.0   | 3 (8%)    | 4 (10%)   | -0.5  |
| MT2   | 50    | 8 (16%)    | 10 (20%)   | -0.7   | 37 (74%)  | 35 (70%)  | +0.3   | 5 (10%)   | 5 (10%)   | 0.0   |
| MT3   | 35    | 18 (51%)   | 7 (20%)    | +4.2   | 15 (43%)  | 24.5 (70%)| -1.9   | 2 (6%)    | 3.5 (10%) | -0.8  |
| MT4   | 25    | 5 (20%)    | 5 (20%)    | 0.0    | 17 (68%)  | 17.5 (70%)| -0.1   | 3 (12%)   | 2.5 (10%) | +0.3  |

**Flagged Level: MT3**
- High Z-score: +4.2 (extremely significant!)
- 51% High performers vs. 20% expected
- Affects 18 employees (11 more than expected)
- **Severity: Red**

**Interpretation:** MT3 has a dramatically higher proportion of High performers than any other level or the baseline. This suggests:
- Possible "level inflation" (MT3 is rated more generously)
- MT3 managers may not be calibrated with other levels
- MT3 might be a critical level where high performers accumulate

**Human Explanation:** "MT3 has 51% of employees rated as High performers, compared to 20% baseline and 16-22% for other levels. This is a statistically significant deviation (Z = 4.2) affecting 18 employees. During your calibration meeting, specifically review MT3 ratings to ensure they're aligned with organizational standards."

### Complementing the Level Uniformity Test

**Level Uniformity Test (Section 5):**
- Tests whether ALL levels have similar distributions
- Uses chi-square test of independence
- Answers: "Are rating standards consistent across levels?"

**Per-Level Distribution Analysis (Section 8):**
- Tests EACH level individually against baseline
- Uses Z-score analysis
- Answers: "Which specific levels need attention?"

**Together:** The uniformity test might flag "inconsistency across levels," and per-level analysis pinpoints "MT3 is the problem—focus there."

---

## 9. Severity Determination Logic

The severity determination algorithm combines multiple statistical indicators to classify each analysis as Red (severe), Yellow (moderate), or Green (healthy). This multi-factor approach prevents both false positives (flagging trivial anomalies) and false negatives (missing meaningful patterns).

### Multi-Factor Algorithm

The algorithm considers THREE factors in order:

1. **Individual cell deviations (Z-scores)**
2. **Effect size (Cramér's V)**
3. **Statistical significance (p-value)**

### Step 1: Check Individual Deviations FIRST

Before looking at overall statistics, the algorithm scans all Z-scores to find the maximum absolute value:

```
max_z = max(|z| for all cells)
```

**If max_z ≥ 2.0** (at least one cell is significant):

- **Red if:** max_z > 3.0 OR (max_z > 2.5 AND effect_size > 0.4)
  - Rationale: Very strong individual deviation, possibly combined with medium effect
- **Yellow otherwise**
  - Rationale: At least one significant cell, but not extreme

**Why This Matters:** Even if the overall p-value is not significant (p > 0.05), a single cell with |Z| ≥ 2.0 represents a meaningful pattern worth investigating. This prevents the algorithm from dismissing real anomalies just because the overall test isn't significant.

### Step 2: If No Significant Individual Deviations

If all |Z| < 2.0, the algorithm checks effect size:

- **Yellow if:** effect_size ≥ 0.5 (large effect)
  - Rationale: Strong association, even if not technically significant
- **Yellow if:** effect_size ≥ 0.3 (medium effect)
  - Rationale: Moderate association worth noting

**Why This Matters:** With small sample sizes, you might have V = 0.45 (medium-large effect) but p = 0.08 (not significant). The effect size suggests a real pattern, so we flag it Yellow rather than Green.

### Step 3: Fallback to P-Value

If no significant individual deviations AND small effect size, use p-value:

- **Green if:** p > 0.05
  - Rationale: Not significant, small effect, no concerning cells
- **Yellow if:** 0.01 < p ≤ 0.05
  - Rationale: Marginally significant
- **Red if:** p ≤ 0.01
  - Rationale: Highly significant, even without large effect or individual deviations

### Complete Decision Tree

```
IF any |Z| ≥ 2.0:
    IF max_z > 3.0 OR (max_z > 2.5 AND V > 0.4):
        RETURN Red
    ELSE:
        RETURN Yellow
ELSE IF V ≥ 0.5:
    RETURN Yellow  (large effect)
ELSE IF V ≥ 0.3:
    RETURN Yellow  (medium effect)
ELSE IF p > 0.05:
    RETURN Green   (not significant)
ELSE IF p > 0.01:
    RETURN Yellow  (marginally significant)
ELSE:
    RETURN Red     (highly significant)
```

### Example Scenarios

**Scenario 1: Strong Individual Deviation**

- p = 0.073 (not significant)
- V = 0.17 (small effect)
- max_z = 2.8 (significant)
- **Result: Yellow** (individual deviation despite non-significant p-value)

**Scenario 2: Large Effect, Not Significant**

- p = 0.082 (not significant)
- V = 0.48 (medium-large effect)
- max_z = 1.9 (not quite significant)
- **Result: Yellow** (meaningful effect size)

**Scenario 3: Highly Significant with Large Effect**

- p = 0.0008 (highly significant)
- V = 0.52 (large effect)
- max_z = 3.7 (very strong)
- **Result: Red** (multiple red flags)

**Scenario 4: Truly Healthy**

- p = 0.624 (not significant)
- V = 0.08 (negligible effect)
- max_z = 0.9 (no significant cells)
- **Result: Green** (no concerns)

**Scenario 5: Marginally Significant**

- p = 0.042 (marginally significant)
- V = 0.21 (small effect)
- max_z = 1.8 (not quite significant)
- **Result: Yellow** (significant p-value, but small effect)

### Why P-Value Alone Is Insufficient

**Problem 1: Large samples make everything significant**

With 1,000 employees, even a 2-percentage-point difference (20% vs. 22%) can be "statistically significant" (p < 0.05), but it's not practically meaningful. Effect size prevents over-flagging.

**Problem 2: Small samples hide real patterns**

With 40 employees, a 15-percentage-point difference (20% vs. 35%) might not reach p < 0.05, but it's a meaningful pattern. Effect size and Z-scores catch this.

**Problem 3: Overall p-value masks specific cells**

You might have p = 0.08 (not significant) for an analysis with 4 locations, but Location A has Z = 2.9 (highly significant). The overall test averages across locations, diluting the signal. Z-scores catch this.

### Implications for Users

**Green (Healthy):**
- No action needed
- Distribution is as expected
- Continue current calibration practices

**Yellow (Moderate):**
- Review during calibration meeting
- Not an emergency, but worth discussing
- May represent a real pattern or random variation
- Use judgment to decide if intervention is needed

**Red (Severe):**
- Immediate attention required
- Strong statistical evidence of anomaly
- Likely represents systematic bias or inconsistency
- Action recommended (recalibration, coaching, policy review)

---

## 10. Grid Position & Performance Bucket Definitions

Understanding how 9Boxer categorizes employees is critical to interpreting statistical results correctly.

### The 9-Box Grid Layout

The 9-box grid maps employees based on two dimensions:

- **X-axis: Performance** (Low, Medium, High)
- **Y-axis: Potential** (Low, Medium, High)

```
  Low Perf   Med Perf   High Perf
  ─────────────────────────────
High Pot │    7    │    8    │    9    │  Enigma     Growth      Star
         │         │         │         │
Med Pot  │    4    │    5    │    6    │  Inconsist  Core        High Impact
         │         │         │         │
Low Pot  │    1    │    2    │    3    │  Underperf  Effective   Workhorse
         └─────────┴─────────┴─────────┘
```

### Position Labels and Definitions

| Position | Label | Performance | Potential | Description |
|----------|-------|-------------|-----------|-------------|
| 9 | Star | High | High | Top talent with strong current performance and high future potential. Succession candidates. |
| 8 | Growth | Medium | High | High potential individuals who are still developing. Invest heavily in development. |
| 7 | Enigma | Low | High | High potential but underperforming. May be new, in wrong role, or lack support. |
| 6 | High Impact | High | Medium | Strong performers who are well-placed in current role. Solid contributors. |
| 5 | Core Talent | Medium | Medium | The organizational backbone. Steady, reliable employees. |
| 4 | Inconsistent | Low | Medium | Moderate potential but currently underperforming. Coaching opportunity. |
| 3 | Workhorse | High | Low | High current performance but limited future potential. Valuable in current role. |
| 2 | Effective Pro | Medium | Low | Satisfactory performance, limited growth trajectory. |
| 1 | Underperformer | Low | Low | Low performance and potential. May require performance management. |

### Performance Buckets (CRITICAL)

For statistical analyses, the 9 positions are collapsed into 3 performance levels:

```python
PERFORMANCE_BUCKETS = {
    "High": [9, 8, 6],     # Star, Growth, High Impact
    "Medium": [7, 5, 3],   # Enigma, Core Talent, Workhorse
    "Low": [4, 2, 1]       # Inconsistent, Effective Pro, Underperformer
}
```

**IMPORTANT DISTINCTION:** Note that Position 3 "Workhorse" is categorized as **Medium** performance, NOT High!

### Why Position 3 Is NOT "High Performance"

This is a common point of confusion. Let's clarify:

**Position 3 "Workhorse":**
- **High current performance rating** (rightmost column)
- **Low future potential** (bottom row)
- **Statistical bucket:** Medium

**Why Medium?** The performance buckets are designed to identify employees for succession planning and leadership development. A Workhorse is a strong current contributor but has limited growth trajectory. For talent management purposes, they're not in the "high performer" tier alongside Stars (9), Growth (8), and High Impact (6) employees.

**Practical implication:** When analyses report "20% High performers," they mean positions 9, 8, and 6 only—NOT position 3.

### High Performer Positions (6, 8, 9)

These three positions represent the top ~20% of the organization:

- **Position 9 (Star):** High performance + high potential = succession candidate
- **Position 8 (Growth):** High potential, developing performance = invest heavily
- **Position 6 (High Impact):** High performance, solid potential = key contributor

These are the employees you'd consider for:
- Promotion to leadership roles
- Critical project assignments
- Retention bonuses
- Succession planning

### Impact on Statistical Calculations

When Location Analysis reports "Remote workers have 35% High performers vs. 20% expected," it means:

- 35% of remote workers are in positions 6, 8, or 9
- This is statistically higher than the company average
- Position 3 employees are NOT included in this percentage

Similarly, when the LLM states "You have 15% Stars," it means:

- 15% of employees are specifically in position 9
- This does NOT include positions 6 or 8
- It definitely does NOT include position 3

### Why These Definitions Matter

Incorrect interpretation of performance buckets leads to:

- **Overstating high performer percentages** (if you include position 3)
- **Misidentifying succession candidates** (position 3 employees aren't future leaders)
- **Incorrect statistical comparisons** (comparing apples to oranges)

9Boxer's statistical analyses use the official PERFORMANCE_BUCKETS definition consistently. Users should use the same definition when interpreting results.

---

## 11. Data Sent to LLM (Anonymized)

After running all statistical analyses, 9Boxer packages the results along with anonymized employee data and sends them to a Large Language Model (Claude) for natural language interpretation and insight generation.

### Anonymization Strategy

**Never sent to LLM:**
- Employee names
- Manager names
- Real employee IDs (e.g., "emp_12345")
- Real manager IDs
- Business titles (e.g., "Senior Software Engineer")
- Job titles
- Any personally identifiable information (PII)

**Sent to LLM (anonymized):**
- Anonymized IDs: "Employee_1", "Employee_2", "Manager_1", "Manager_2"
- Performance ratings (1-3 scale or grid position 1-9)
- Potential ratings (1-3 scale)
- Grid positions (1-9)
- Flags (High Performer, Succession Planning, Flight Risk, New Hire, etc.)
- Demographic categories: job level (MT1, MT2, etc.), function (Engineering, Sales), location (Remote, Office)
- Tenure in years (numeric)
- Statistical analysis results (chi-square, p-values, Z-scores, effect sizes)

### Complete Data Structure

The LLM receives a JSON payload with the following structure:

```json
{
  "level_breakdown": {
    "levels": [
      {
        "level": "MT3",
        "total_employees": 42,
        "grid_distribution": {
          "1": 2, "2": 3, "3": 5, "4": 2, "5": 15,
          "6": 8, "7": 3, "8": 2, "9": 2
        },
        "performance_distribution": {
          "High": 12,
          "Medium": 23,
          "Low": 7
        },
        "potential_distribution": {
          "High": 7,
          "Medium": 25,
          "Low": 10
        },
        "flagged_count": 8,
        "flags_breakdown": {
          "High Performer": 5,
          "Succession Planning": 2,
          "Flight Risk": 1
        }
      }
      // ... more levels
    ]
  },

  "flagged_employees": [
    {
      "id": "Employee_15",
      "level": "MT3",
      "function": "Engineering",
      "location": "Remote",
      "tenure_years": 2.5,
      "performance_rating": 3,
      "potential_rating": 3,
      "grid_position": 9,
      "flags": ["High Performer", "Succession Planning"]
    }
    // ... more flagged employees only (not all employees)
  ],

  "organization": {
    "managers": [
      {
        "id": "Manager_1",
        "level": "MT5",
        "direct_report_count": 8,
        "total_org_size": 25
      }
      // ... more managers
    ],
    "total_employees": 120,
    "total_managers": 15,
    "levels_present": ["MT1", "MT2", "MT3", "MT4", "MT5"]
  },

  "analyses": {
    "location": {
      "chi_square": 15.234,
      "p_value": 0.0012,
      "effect_size": 0.412,
      "degrees_of_freedom": 4,
      "sample_size": 120,
      "status": "red",
      "deviations": [
        {
          "category": "Remote",
          "performance_level": "High",
          "observed_count": 28,
          "expected_count": 18.5,
          "observed_percentage": 35.2,
          "expected_percentage": 20.1,
          "z_score": 3.45,
          "sample_size": 28,
          "is_significant": true
        }
        // ... more deviations
      ],
      "interpretation": "Significant location bias detected. Remote workers are rated High 35.2% of the time vs. 20.1% expected (Z=3.45, p=0.001)."
    },

    "function": {
      "chi_square": 18.67,
      "p_value": 0.0045,
      "effect_size": 0.31,
      "degrees_of_freedom": 24,
      "sample_size": 120,
      "status": "yellow",
      "deviations": [
        {
          "category": "Engineering",
          "grid_position": 9,
          "observed_count": 12,
          "expected_count": 7.5,
          "observed_percentage": 18.2,
          "expected_percentage": 10.0,
          "z_score": 2.8,
          "sample_size": 66,
          "is_significant": true
        }
        // ... more deviations
      ],
      "interpretation": "Engineering shows higher representation in Star positions (18.2% vs. 10% expected, Z=2.8)."
    },

    "level": {
      "chi_square": 18.34,
      "p_value": 0.005,
      "effect_size": 0.31,
      "degrees_of_freedom": 6,
      "sample_size": 150,
      "status": "red",
      "deviations": [
        {
          "category": "MT3",
          "performance_level": "High",
          "observed_count": 18,
          "expected_count": 7,
          "observed_percentage": 51.4,
          "expected_percentage": 20.0,
          "z_score": 4.2,
          "sample_size": 35,
          "is_significant": true
        }
        // ... more deviations
      ],
      "interpretation": "UNIFORMITY TEST: p=0.005 indicates INCONSISTENT rating standards across levels. MT3 has 51.4% High performers vs. 20% expected."
    },

    "tenure": {
      "chi_square": 12.67,
      "p_value": 0.048,
      "effect_size": 0.20,
      "degrees_of_freedom": 8,
      "sample_size": 200,
      "status": "yellow",
      "deviations": [
        {
          "category": "0-1 years",
          "performance_level": "High",
          "observed_count": 14,
          "expected_count": 8,
          "observed_percentage": 35.0,
          "expected_percentage": 20.0,
          "z_score": 2.8,
          "sample_size": 40,
          "is_significant": true
        }
        // ... more deviations
      ],
      "interpretation": "New hires (0-1 years) rated High 35% vs. 20% expected (Z=2.8). Possible 'new hire optimism' bias."
    },

    "manager": {
      "top_anomalies": [
        {
          "manager_id": "Manager_5",
          "chi_square": 14.25,
          "p_value": 0.0008,
          "team_size": 25,
          "distribution": {
            "High": {"observed": 12, "expected": 5, "percentage": 48.0, "z_score": 3.5},
            "Medium": {"observed": 12, "expected": 17.5, "percentage": 48.0, "z_score": -1.3},
            "Low": {"observed": 1, "expected": 2.5, "percentage": 4.0, "z_score": -0.9}
          },
          "interpretation": "Manager rates 48% High vs. 20% baseline (Z=3.5, p=0.001). Significantly more generous than expected."
        }
        // ... more managers
      ]
    },

    "per_level_distribution": {
      "MT3": {
        "total": 35,
        "distribution": {
          "High": {"observed": 18, "expected": 7, "percentage": 51.4, "z_score": 4.2},
          "Medium": {"observed": 15, "expected": 24.5, "percentage": 42.9, "z_score": -1.9},
          "Low": {"observed": 2, "expected": 3.5, "percentage": 5.7, "z_score": -0.8}
        },
        "status": "red",
        "interpretation": "MT3 has 51.4% High performers vs. 20% baseline (Z=4.2). Focus calibration here."
      }
      // ... more levels
    }
  },

  "overview": {
    "total_employees": 120,
    "stars_count": 12,
    "stars_percentage": 10.0,
    "high_performers_count": 28,
    "high_performers_percentage": 23.3,
    "center_box_count": 45,
    "center_box_percentage": 37.5,
    "by_level": {
      "MT1": 20,
      "MT2": 35,
      "MT3": 42,
      "MT4": 18,
      "MT5": 5
    },
    "by_function": {
      "Engineering": 50,
      "Sales": 30,
      "Support": 40
    },
    "by_location": {
      "Remote": 28,
      "Office": 92
    },
    "by_performance": {
      "High": 28,
      "Medium": 78,
      "Low": 14
    },
    "by_potential": {
      "High": 25,
      "Medium": 80,
      "Low": 15
    },
    "by_grid_position": {
      "1": 5, "2": 8, "3": 12, "4": 6, "5": 45,
      "6": 15, "7": 8, "8": 9, "9": 12
    }
  }
}
```

### Token Optimization Through Aggregation

**Problem:** Sending 500 individual employee records to the LLM would consume excessive tokens and increase API costs.

**Solution:** Token optimization through selective data packaging:

1. **Send level-by-level aggregates** instead of all individual records
   - For a 500-employee organization: Send 6 level summaries instead of 500 records
   - Each level summary includes distribution statistics
2. **Send individual records ONLY for flagged employees**
   - Succession Planning candidates
   - High Performers (positions 6, 8, 9)
   - Flight Risk employees
   - New Hires
   - Custom flags
   - Typically ~10% of workforce

**Result:** Massive token reduction (80-90%) while preserving all analytical value.

**Example:**
- **Without optimization:** 500 employee records × ~100 tokens each = 50,000 tokens
- **With optimization:** 6 level aggregates + 50 flagged employees = ~8,000 tokens
- **Savings:** 42,000 tokens (84% reduction)

### LLM Model Configuration

**Model:** Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
**Fast Model Option:** Claude Haiku 3.5 (claude-haiku-3-5-20250110) for 3-5x faster responses
**Max Output Tokens:** 4,096
**Temperature:** 0.3 (low for consistency)

### How the LLM Uses This Data

The LLM receives this comprehensive data package along with a detailed system prompt (stored in `backend/config/calibration_agent_prompt.txt`) that instructs it to:

1. **Synthesize statistical findings** into executive summary (2-3 paragraphs)
2. **Generate specific insights** with:
   - Type: anomaly, focus_area, recommendation, time_allocation
   - Category: location, function, level, tenure, distribution, time
   - Priority: high, medium, low
   - Title: Brief, actionable (e.g., "Remote Workers Over-Rated")
   - Description: 2-3 sentences (finding, impact, action)
   - Source data: Z-scores, percentages, counts
3. **Cluster related issues** to avoid duplication
4. **Use plain language** (avoid jargon, use contractions, be conversational)
5. **Focus on root causes** rather than symptoms
6. **Provide actionable recommendations**

### Structured Output Schema

The LLM returns JSON with guaranteed structure (using Anthropic's beta structured outputs feature):

```json
{
  "summary": "Executive summary paragraph...",
  "issues": [
    {
      "type": "anomaly",
      "category": "location",
      "priority": "high",
      "title": "Remote Workers Over-Rated",
      "description": "Remote workers are rated High 35% of the time vs. 20% expected (Z=3.45). This affects 28 employees and suggests potential location bias. Review whether remote work genuinely correlates with higher performance or if evaluation standards differ.",
      "affected_count": 28,
      "source_data": {
        "z_score": 3.45,
        "percentage": 35.2,
        "expected": 20.1,
        "actual": 35.2,
        "count": 28,
        "segment": "Remote"
      },
      "cluster_id": null,
      "cluster_title": null
    }
    // ... more issues
  ]
}
```

### Privacy and Security

**Data Transmission:**
- HTTPS encryption for all API calls
- Anthropic API endpoint (api.anthropic.com)
- No data stored by Anthropic after response (per Anthropic's privacy policy)

**Data Retention:**
- LLM responses cached in 9Boxer database for performance
- No employee data sent externally except during API call
- Users control when analyses are re-run (triggering new API calls)

**Compliance:**
- No PII ever sent to LLM
- Anonymized IDs cannot be linked back to individuals without 9Boxer database
- Statistical aggregates preserve privacy (no individual-level data in aggregates)

---

## Back to

- [Intelligence](intelligence.md) - Main intelligence feature documentation
- [Statistics](statistics.md) - Distribution analytics
- [User Guide Home](/) - Complete user documentation

---

## Summary

9Boxer's Intelligence tab combines rigorous statistical testing with AI-powered natural language interpretation to provide actionable insights for talent calibration. The six automatic analyses cover location, function, level, tenure, manager, and per-level distributions, using chi-square tests, Z-scores, and effect sizes to detect meaningful patterns.

The multi-factor severity determination ensures that only truly significant anomalies are flagged, while the anonymized data sent to the LLM enables natural language explanations without compromising employee privacy.

This methodology is designed to be transparent, statistically valid, and practically useful—giving talent leaders confidence that the insights they're seeing are based on sound analytical principles.
