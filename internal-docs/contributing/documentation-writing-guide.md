# 9Boxer Documentation Standards & Assessment

## Executive Summary

This document provides:
1. **Documentation Standards** - Best practices for user-focused software documentation
2. **Current State Assessment** - Evaluation of existing 9Boxer documentation
3. **Proposed Revisions** - Extensive redesign to make documentation best-in-class
4. **Screenshot Requirements** - Specific visual guidance needs

---

## Part 1: Documentation Standards for Best-in-Class User Guides

### Core Principles

#### 1. **User-Centric Organization**
- **Organize by user goals, not features** - "How do I prepare for a talent review?" not "Understanding the Grid"
- **Task-based navigation** - Users come with questions like "How do I...?"
- **Progressive disclosure** - Show basics first, advanced features later
- **Clear user journeys** - Guide users through natural workflows

#### 2. **Quick Wins First**
- **Get users to success in <5 minutes** - Build confidence early
- **One clear path to value** - Don't overwhelm with options
- **Celebrate small victories** - Acknowledge progress explicitly
- **Defer complexity** - Advanced features come after basics are mastered

#### 3. **Show, Don't Just Tell**
- **Screenshots for every key action** - Visual learners need images
- **Annotated images** - Arrows, callouts, highlights to guide eyes
- **Before/after comparisons** - Show the result of actions
- **Video alternatives** - Screencasts for complex workflows
- **Real examples** - Use realistic data, not "foo/bar"

#### 4. **Scannable Content**
- **Short paragraphs (2-3 sentences max)** - Easy to digest
- **Bulleted lists** - Break up dense text
- **Clear headings** - Descriptive, action-oriented
- **Visual hierarchy** - Use formatting to guide scanning
- **Callout boxes** - Highlight critical information
- **Tables for comparisons** - Structured data is easier to scan

#### 5. **Conversational and Engaging Tone**
- **Second person ("you")** - Direct address feels personal
- **Active voice** - "Click Upload" not "Upload should be clicked"
- **Friendly but professional** - Warm without being cutesy
- **Empathize with user challenges** - Acknowledge pain points
- **Avoid jargon** - Or explain it immediately when unavoidable
- **Use contractions** - "You'll" not "You will" (sounds more natural)

#### 6. **Contextual Guidance**
- **When to use features** - Not just how, but why and when
- **Use cases and scenarios** - Real-world examples
- **Anti-patterns** - Show common mistakes to avoid
- **Decision trees** - Help users choose between options
- **Prerequisites** - What users need before starting

#### 7. **Consistent Structure**
Every guide page should follow a predictable pattern:
1. **What you'll learn** (30 words) - Set expectations
2. **Why this matters** (50 words) - Connect to user goals
3. **Before you begin** - Prerequisites and setup
4. **Step-by-step instructions** - Clear, numbered steps
5. **What's next** - Logical progression to related tasks
6. **Troubleshooting** - Common issues inline

#### 8. **Error Prevention and Recovery**
- **Warnings before destructive actions** - Not after
- **Inline validation guidance** - Help users avoid errors
- **Recovery instructions** - Fix problems when they occur
- **"You can't break it" reassurance** - Reduce anxiety

#### 9. **Accessibility**
- **Alt text for all images** - Screen reader compatible
- **Keyboard shortcuts documented** - For power users
- **High contrast** - Readable in all themes
- **Clear link text** - "Learn about filters" not "Click here"

#### 10. **Maintenance and Freshness**
- **Screenshot versioning** - Update when UI changes
- **Change logs** - Track documentation updates
- **Review cycles** - Quarterly refresh of content
- **User feedback integration** - Update based on support tickets

---

### Content Structure Standards

#### Home Page Pattern
```markdown
# Welcome to [Product]

[One sentence: What it does]
[One sentence: Who it's for]
[One sentence: Key benefit]

## Get Started in 5 Minutes
[Button/Link: Quick Start Tutorial]

## Common Tasks
[3-5 top tasks users perform]
- [Task 1 with icon and description]
- [Task 2 with icon and description]
- [Task 3 with icon and description]

## New to [Concept]?
[Brief explanation of core methodology/framework]
[Link: Deep dive article]

## Need Help?
[Search box]
[Link: Troubleshooting]
[Link: FAQ]
```

#### Getting Started Pattern
```markdown
# Getting Started

> **Time to complete:** 5 minutes
> **What you'll learn:** [List 3 things]

## Your First 5 Minutes

### Step 1: [Action] (1 minute)
[Why this matters - 1 sentence]
[Numbered steps with screenshots]
✅ Success indicator: [What you should see]

### Step 2: [Action] (2 minutes)
[Why this matters - 1 sentence]
[Numbered steps with screenshots]
✅ Success indicator: [What you should see]

[Continue pattern...]

## 🎉 Congratulations!
You've learned how to [summarize achievement].

## What's Next?
Choose your path:
- **New to [concept]?** → [Conceptual guide]
- **Ready to dive deeper?** → [Advanced feature]
- **Need specific help?** → [Task-based guide]
```

#### Feature Guide Pattern
```markdown
# [Feature Name]

> **When to use this:** [One sentence scenario]
> **Time to complete:** [X minutes]

## What This Feature Does
[2-3 sentences, user benefit focused]

## When You'd Use [Feature]
[Real-world scenarios, bulleted list]
- Scenario 1
- Scenario 2
- Scenario 3

## How to Use [Feature]

### Before You Begin
- [ ] Prerequisite 1
- [ ] Prerequisite 2

### Step-by-Step Instructions
[Numbered steps with screenshots]

### What Success Looks Like
[Screenshot or description of expected result]

## Tips and Best Practices
[Practical advice from power users]

## Common Mistakes to Avoid
[Anti-patterns with explanations]

## Troubleshooting
[Common issues inline]

## Related Tasks
[Links to next logical steps]
```

---

### Visual Standards

#### Screenshot Requirements
1. **Capture full context** - Include enough UI for orientation
2. **Annotate key elements** - Red boxes, arrows, numbered callouts
3. **Hide sensitive data** - Use realistic but anonymous examples
4. **Consistent styling** - Same annotation style throughout
5. **High resolution** - 2x for retina displays, scale down
6. **Light and dark themes** - Capture both if app supports it
7. **File naming convention** - `feature-name-step-number.png`
8. **Alt text** - Descriptive alternative text for accessibility

#### When to Include Screenshots
- **Every key UI interaction** - Buttons, menus, dialogs
- **Before and after states** - Show the result of actions
- **Complex layouts** - Multi-panel interfaces
- **Visual indicators** - Color coding, badges, highlights
- **Error messages** - What users will see when things go wrong
- **Success states** - Confirmation dialogs, completed actions

#### Annotation Best Practices
```
✅ GOOD: Red box around Upload button with "1" callout
✅ GOOD: Arrow pointing to Apply badge with "Shows change count"
❌ BAD: Unmarked screenshot expecting users to find element
❌ BAD: Too many annotations creating visual clutter
```

---

### Tone and Voice Guide

#### Do's
- **Do use "you" and "your"** - "Upload your file" not "Upload the file"
- **Do use contractions** - "You'll see" not "You will see"
- **Do use active voice** - "Click the button" not "The button should be clicked"
- **Do be encouraging** - "Great! You've completed..." not just "Completed"
- **Do anticipate questions** - "You might wonder why..." addresses concerns
- **Do use simple words** - "Use" not "Utilize", "Help" not "Facilitate"

#### Don'ts
- **Don't use jargon without explanation** - Define terms on first use
- **Don't be condescending** - "Simply" implies it's easy (might not be)
- **Don't be vague** - "Several options" → "3 options"
- **Don't assume expertise** - Explain even "obvious" steps
- **Don't use filler words** - "Basically", "Actually" add no value
- **Don't write walls of text** - Break into scannable chunks

#### Example Transformations
```
❌ BAD: "The application facilitates the visualization of employee performance data utilizing the 9-box methodology."
✅ GOOD: "9Boxer helps you visualize how your team is performing using a simple 3×3 grid."

❌ BAD: "Users should navigate to the upload interface and select the appropriate file."
✅ GOOD: "Click Upload and choose your Excel file."

❌ BAD: "Note that the system does not automatically persist changes."
✅ GOOD: "⚠️ Important: Your changes aren't saved automatically. Click Apply to save your work."
```

---

## Part 2: Current Documentation Assessment

### Overall Rating: **6.5/10** (Good Reference, Weak Onboarding)

### Strengths ✅

1. **Comprehensive Coverage**
   - All major features documented thoroughly
   - Good attention to edge cases and troubleshooting
   - Cross-references between related topics

2. **MkDocs Features Well Used**
   - Admonitions for warnings and tips
   - Tabbed content for scenarios
   - Keyboard shortcut formatting
   - Consistent formatting

3. **Technical Accuracy**
   - Correct information about features
   - Accurate column names and requirements
   - Proper error message documentation

4. **Safety Warnings**
   - Critical issues called out (no auto-save)
   - Destructive actions clearly marked
   - Prerequisites stated

### Critical Weaknesses ❌

#### 1. **Encyclopedic Structure (Not User-Centric)**
**Problem:** Organized by features, not user goals

**Examples:**
- Current: "Understanding the Grid" (feature-focused)
- Better: "Preparing for Your Talent Review" (goal-focused)

**Impact:** Users don't know where to start or what to do first

#### 2. **No Quick Wins**
**Problem:** Getting Started is 213 lines long, overwhelming

**Example:**
- Current: "5-minute tour" actually takes 15-20 minutes to read
- Better: Actual 5-minute success path with one clear action

**Impact:** Users get overwhelmed and give up before experiencing value

#### 3. **Missing Visual Guidance**
**Problem:** Only placeholder text for screenshots

**Examples:**
- 12+ instances of "Screenshot to be added"
- No annotated images showing WHERE to click
- No before/after comparisons

**Impact:** Visual learners struggle; users can't verify they're in right place

#### 4. **Tone is Functional, Not Engaging**
**Problem:** Reads like a technical manual, not a guide

**Examples:**
- Current: "Navigate to the upload interface and select your file"
- Better: "Ready to see your team on the grid? Let's upload your data!"

**Impact:** Documentation feels dry and uninviting

#### 5. **Information Overload**
**Problem:** Too much information presented too early

**Examples:**
- Getting Started includes 9-box methodology, grid layout, filtering, themes, statistics
- New users don't need to know ALL features before uploading first file

**Impact:** Cognitive overload prevents learning

#### 6. **Lacks Context for "When" and "Why"**
**Problem:** Explains HOW but not WHEN or WHY

**Examples:**
- Donut Mode: Explains mechanics, but not when you'd actually use it
- Filters: Lists filter options, but not scenarios for using them

**Impact:** Users don't know which features apply to their situation

#### 7. **Repetitive Content**
**Problem:** Same information repeated across multiple pages

**Examples:**
- "No auto-save" warning appears 8+ times
- Upload requirements repeated in 3 different places
- Cross-references without adding new value

**Impact:** Feels bloated; users lose trust in documentation freshness

#### 8. **No User Journeys**
**Problem:** No clear path from beginner to advanced user

**Examples:**
- All pages treated as equal importance
- No recommended reading order beyond Getting Started
- No skill progression

**Impact:** Users don't know what to learn next

#### 9. **Dense Paragraphs**
**Problem:** Large blocks of text that aren't scannable

**Examples:**
- Paragraphs of 8-10 sentences
- Long lists without visual breaks
- Tables that could be visualized better

**Impact:** Users skim and miss critical information

#### 10. **Inconsistent Depth**
**Problem:** Some topics over-explained, others under-explained

**Examples:**
- Understanding the Grid: 407 lines (too detailed for most users)
- Working with Employees: 181 lines (could be more concise)
- Statistics: Not enough context about when to review

**Impact:** Uneven user experience across documentation

---

### Page-by-Page Critique

#### ✅ **index.md** - Rating: 7/10
**Strengths:**
- Clear value proposition
- Good feature overview
- Quick navigation section

**Weaknesses:**
- Too much methodology upfront (lines 10-22 could be deferred)
- 12 navigation links overwhelming for new users
- Missing "Start here if you're new" vs "Jump to X if you know what you want"
- No visual welcome

#### ⚠️ **getting-started.md** - Rating: 5/10
**Strengths:**
- Attempts a structured tour
- Time estimates provided
- Covers key workflows

**Weaknesses:**
- **CRITICAL:** Not actually 5 minutes (more like 20+ minutes to read)
- Frontloads too much (installation warnings, all columns, themes)
- No clear success milestone
- Screenshots missing - users don't know what to look for
- Includes advanced features (filters, settings, donut mode) too early

#### ✅ **uploading-data.md** - Rating: 7.5/10
**Strengths:**
- Excellent error troubleshooting
- Clear examples of correct/incorrect formats
- Good table showing required columns

**Weaknesses:**
- Too detailed for first-time users (belongs in reference section)
- Repetitive (sample file mentioned 3 times)
- Errors section could be interactive troubleshooter

#### ⚠️ **understanding-grid.md** - Rating: 6/10
**Strengths:**
- Comprehensive box descriptions
- Good strategic context
- Typography warning patterns

**Weaknesses:**
- 407 lines is too long for most users
- Each position doesn't need full strategic breakdown on first read
- Missing visual grid map at top
- Could be split into "Grid Basics" (beginner) and "Strategic Use of 9-Box" (advanced)

#### ⚠️ **donut-mode.md** - Rating: 6/10
**Strengths:**
- Good conceptual explanation
- Use cases and scenarios helpful
- Tabbed examples excellent

**Weaknesses:**
- Doesn't clearly state WHEN users should use this (upfront)
- Too detailed about mechanics before explaining value
- Missing "Is Donut Mode right for me?" decision tree

#### ✅ **working-with-employees.md** - Rating: 7/10
**Strengths:**
- Clear sections
- Practical instructions
- Good visual indicator table

**Weaknesses:**
- Dry tone ("This page covers...")
- Could integrate more "why" alongside "how"
- Timeline feature underexplained

#### ✅ **tips.md** - Rating: 7.5/10
**Strengths:**
- Practical, actionable advice
- Good checklists
- Real-world workflows

**Weaknesses:**
- Positioned as "optional reading" when it contains critical best practices
- Should be integrated into main flows, not separate page
- "Review Before Moving" should be in Working with Employees page

#### ✅ **troubleshooting.md** - Rating: 8/10
**Strengths:**
- Excellent comprehensive coverage
- Clear problem/solution format
- Good diagnostic checklists

**Weaknesses:**
- Could benefit from search/filter by symptom
- Some issues could be prevented with better inline help
- Missing "Can't find what you're looking for?" fallback

#### ⚠️ **statistics.md, exporting.md, settings.md, tracking-changes.md, filters.md**
**Note:** Need to read these to provide full assessment

---

## Part 3: Proposed Documentation Redesign

### New Information Architecture

#### Current Structure (Feature-Based)
```
Home
├── Getting Started
├── Uploading Data
├── Understanding the Grid
├── Donut Mode
├── Working with Employees
├── Tracking Changes
├── Filters
├── Statistics
├── Exporting
├── Settings
├── Tips
└── Troubleshooting
```

#### Proposed Structure (User Journey-Based)
```
🏠 Home
   "Get started in 2 minutes" CTA

📚 Getting Started
   ├── Quickstart (2-minute success)
   ├── Your First Upload
   └── Your First Talent Review

🎯 Common Tasks
   ├── Preparing for a Talent Calibration Session
   ├── Making Rating Changes
   ├── Documenting Your Decisions
   ├── Analyzing Your Talent Distribution
   └── Exporting Your Results

🔧 Features & Tools
   ├── The 9-Box Grid (Basics)
   ├── Filtering and Focus Tools
   ├── Donut Mode Validation Exercise
   ├── Statistics and Intelligence
   └── Change Tracking and Notes

💡 Best Practices
   ├── When to Use Which Features
   ├── Talent Review Workflows
   ├── Data Quality and Preparation
   └── Collaboration Tips

📖 Reference
   ├── Excel File Requirements
   ├── Grid Position Meanings
   ├── Keyboard Shortcuts
   ├── Settings and Preferences
   └── Frequently Asked Questions

❓ Help
   ├── Troubleshooting
   ├── Error Messages Explained
   └── Get Support
```

---

### Proposed Page Revisions

I'll provide detailed rewrites for the most critical pages. Each rewrite follows best practices:
- User goal-oriented
- Quick wins emphasized
- Engaging tone
- Scannable format
- Screenshots specified

---

### 🏠 NEW: Home Page (index.md)

**Purpose:** Get users to first success in <30 seconds of decision time

**Length:** ~150 lines (vs current 153)

**Key Changes:**
- Hero section with clear CTA
- "Choose your path" based on user type
- Defer methodology explanation
- Visual roadmap
- Remove feature list (move to separate page)

**Screenshot Needs:**
1. **Hero image:** Grid with sample employees (annotated: "Visualize your talent at a glance")
2. **Quick win preview:** "You'll have your first grid in 2 minutes"

---

### 📚 NEW: Quickstart (2-Minute Success)

**Purpose:** Get users to FIRST SUCCESS (seeing their data on grid) in 2 actual minutes

**Length:** ~50 lines max

**Structure:**
```markdown
# See Your Talent in 2 Minutes

> ⏱️ **Time:** 2 minutes
> 🎯 **Goal:** Upload data and see your first 9-box grid
> 📋 **You'll need:** An Excel file with employees

## Step 1: Get Your File Ready (30 seconds)

Your Excel file needs these 4 columns (exact names):
- `Employee ID`
- `Worker`
- `Performance` (values: Low, Medium, or High)
- `Potential` (values: Low, Medium, or High)

✅ **Have one?** Great! Continue to Step 2.
❌ **Don't have one?** [Download sample file](#) to try it out.

[SCREENSHOT: Sample Excel file with columns highlighted]

## Step 2: Upload Your File (1 minute)

1. Click the **Upload** button (top left)
   [SCREENSHOT: Upload button highlighted with red box and "1" callout]

2. Choose your Excel file

3. Watch your grid appear! ✨
   [SCREENSHOT: Grid populated with employee tiles, annotated with key elements]

## 🎉 Success! You've Created Your First Talent Grid

You should see:
- ✅ A 3×3 grid with employee tiles
- ✅ Your employee count in the top bar
- ✅ Employees organized by performance and potential

[SCREENSHOT: Success state with checkmarks pointing to each element]

## What's Next?

**New to the 9-box method?**
→ [Understand what the grid positions mean](#)

**Ready to make changes?**
→ [Learn how to move employees around](#)

**Preparing for a calibration meeting?**
→ [Follow the talent review workflow](#)

---

💡 **Quick tip:** The app doesn't auto-save. Click **Apply** when you want to save your changes!
```

**Screenshot Needs:**
1. Sample Excel file with 4 columns highlighted
2. Upload button with annotation
3. Empty grid (before upload)
4. Populated grid (after upload) with callouts
5. Success state with checkmarks

---

### 📚 REVISED: Getting Started (getting-started.md)

**Purpose:** Provide a comprehensive but focused tour AFTER 2-minute quickstart

**Current:** 213 lines, overwhelming
**Proposed:** 180 lines, focused on core workflow

**Key Changes:**
- Remove installation (move to separate page)
- Assume user completed Quickstart
- Focus on ONE complete workflow: Upload → Review → Change → Export
- Defer advanced features (filters, donut mode) to separate pages
- Add "Why you'd do this" context

**Structure:**
```markdown
# Getting Started with 9Boxer

> **You're here because:** You've uploaded your first file (or want to)
> **Time to complete:** 10 minutes
> **What you'll learn:** The complete workflow from upload to export

## What We'll Cover

By the end of this guide, you'll know how to:
1. ✅ Upload employee data
2. ✅ Review your talent distribution
3. ✅ Make rating changes
4. ✅ Document your decisions
5. ✅ Export your updated ratings

**Already done the [2-minute quickstart](#)?** Skip to [Step 2: Review Your Distribution](#)

---

## Step 1: Upload Your Team Data

[Condensed version of upload process with link to full Upload reference]

[SCREENSHOT: Upload in action]

## Step 2: Review Your Distribution (2 minutes)

Now that your data is loaded, let's understand what you're looking at.

### The 3×3 Grid

Your grid shows employees in 9 positions based on two factors:
- **Performance** (Low, Medium, High) → Left to right
- **Potential** (Low, Medium, High) → Bottom to top

[SCREENSHOT: Annotated grid showing axes and zones]

**Quick interpretation:**
- Top-right corner (Stars) = Your top talent
- Bottom-left corner (Concerns) = Need attention
- Center (Core Talent) = Solid performers

→ [Deep dive: What each position means](#)

### Check Your Numbers

Click the **Statistics** tab to see your distribution:
- Are too many people rated "High"? (Grade inflation)
- Are too few in the top corner? (Succession risk)
- Is everyone in the middle? (Need better differentiation)

[SCREENSHOT: Statistics tab with distribution chart]

💡 **Pro tip:** Most organizations have 10-15% in the top corner (Stars). If you have significantly more or less, it might signal calibration issues.

---

## Step 3: Make Rating Changes (3 minutes)

### Why You'd Change Ratings

Common scenarios:
- Recent promotion or role change
- Performance improvement (or decline)
- Calibration across managers
- Correction of initial placement

### How to Move an Employee

1. **Click and hold** an employee tile
2. **Drag** to the new box
3. **Release** to drop

The tile turns **yellow** = changed in this session.

[SCREENSHOT: Drag and drop in action with yellow highlight]

### Review the Change

Click the employee to see details:
- Timeline shows the movement
- Previous vs. new ratings displayed

[SCREENSHOT: Employee details showing timeline]

---

## Step 4: Document Your Decisions (2 minutes)

**Why add notes?**
- Justify changes for calibration meetings
- Remember rationale 6 months from now
- Create audit trail for HR compliance

### How to Add a Note

1. Click an employee you moved
2. Switch to the **Changes** tab
3. Type your explanation in the Notes field
4. It saves automatically ✅

[SCREENSHOT: Changes tab with note being added]

**Good note examples:**
- "Promoted to team lead Q4 2024, demonstrating strong leadership"
- "Performance has declined due to skill gap in new role"
- "Calibrated with peers - rating too high relative to actual output"

---

## Step 5: Export Your Updated Ratings (1 minute)

When you're done making changes:

1. Click the **Apply** button (top right)
2. Your browser downloads: `modified_[your-filename].xlsx`
3. Open the file - you'll see:
   - Updated Performance/Potential ratings
   - "Modified in Session" column (Yes/No)
   - "9Boxer Change Notes" column (your notes)

[SCREENSHOT: Apply button with change count badge]

⚠️ **Critical:** Changes are NOT saved automatically. Always export before closing!

---

## 🎉 Congratulations!

You've completed the full 9Boxer workflow:
- ✅ Uploaded employee data
- ✅ Reviewed your talent distribution
- ✅ Made rating adjustments
- ✅ Documented your rationale
- ✅ Exported your results

## What to Explore Next

**Preparing for a talent review?**
→ [Follow the calibration meeting workflow](#)

**Want to validate your center box?**
→ [Try the Donut Mode exercise](#)

**Need to focus on specific teams?**
→ [Learn about filters and exclusions](#)

**Curious about statistical analysis?**
→ [Explore intelligence insights](#)

---

## Quick Reference Card

| I want to... | How to do it |
|--------------|-------------|
| Upload data | Click Upload button (top left) |
| Move an employee | Drag and drop to new box |
| See employee details | Click the employee tile |
| Add a note | Click employee → Changes tab → Type |
| Filter by department | Click Filters → Select criteria |
| Save my work | Click Apply (exports to Excel) |
| Get help | Press ++f1++ or visit [Troubleshooting](#) |

---

**Need help?** Check [Troubleshooting](#) or [browse common questions](#)
```

**Screenshot Needs:**
1. Annotated grid showing axes and position zones
2. Statistics tab with distribution visible
3. Drag and drop sequence (before, during, after)
4. Yellow highlight on changed employee
5. Employee details with timeline
6. Changes tab with note field
7. Apply button with badge count
8. Exported Excel file showing new columns

---

### 🎯 NEW: Task-Based Guide Example - "Preparing for a Talent Calibration Meeting"

**Purpose:** Show how to reorganize content around user goals

**Length:** ~120 lines

**Structure:**
```markdown
# Preparing for a Talent Calibration Meeting

> **You're here because:** You need to prepare talent ratings for a group calibration session
> **Time to complete:** 30-45 minutes
> **What you'll accomplish:** Clean, calibrated ratings ready to discuss

Talent calibration meetings ensure consistent ratings across managers. Here's how to prepare using 9Boxer.

---

## Before the Meeting (30 minutes)

### 1. Upload Current Ratings (2 minutes)

Get the most recent employee data:
- Export from your HRIS or last calibration session
- Ensure all managers have submitted their ratings
- Upload to 9Boxer

→ [How to upload data](#)

### 2. Review Distribution (5 minutes)

Check if ratings look reasonable:

**Open Statistics tab** and look for red flags:
- ❌ Too many "High" ratings (>20% in top row)
- ❌ Too few Stars (succession planning risk)
- ❌ Everyone clustered in center (poor differentiation)

[SCREENSHOT: Statistics tab showing distribution with red flags annotated]

**Open Intelligence tab** to spot:
- Managers with unusually high/low ratings
- Departments with skewed distributions
- Outliers that need discussion

[SCREENSHOT: Intelligence tab with anomalies highlighted]

### 3. Prepare Discussion Topics (10 minutes)

#### Identify "On the Fence" Employees

Use **Filters** to find borderline cases:
1. Click Filters button
2. Select Performance: "Medium" + "High"
3. Review employees who might move up or down

[SCREENSHOT: Filters panel with selections]

**Flag for discussion:**
- High Performers who might be Stars
- Core Talent who might be declining
- Enigmas (high potential, low performance)

#### Check for Bias Patterns

Common patterns to investigate:
- Manager A rates everyone "High" (leniency bias)
- Manager B has no Stars (harsh rater or talent gap?)
- New hires rated "High Potential" (premature judgment?)

**Add notes** on employees you want to discuss:
"Discuss in calibration - manager rates High, but metrics don't support"

### 4. Use Donut Mode to Validate Center Box (15 minutes)

The center box (Core Talent) often gets over-used. Validate it:

1. Click **Donut Mode** button
2. For each employee in position 5, ask: "Where would they go if they can't be Medium/Medium?"
3. Place them in their "true" position
4. Add notes explaining your reasoning

[SCREENSHOT: Donut mode active with employees being placed]

This gives you talking points:
- "I think these 5 are actually High Potential"
- "These 3 are really Solid Performers, not Core"

→ [Learn more about Donut Mode](#)

### 5. Export Pre-Meeting Baseline (2 minutes)

Before the meeting:
1. Click **Apply** to export current state
2. Name it: `talent-ratings-pre-calibration-2024-12.xlsx`
3. Share with attendees (optional)

This gives everyone a common starting point.

---

## During the Meeting (60-90 minutes)

### Share Your Screen

1. Open 9Boxer with your current data loaded
2. Share screen in video call
3. **Enable filters** to focus discussions

**Pro tip:** Use filters to review one manager at a time, so each manager sees their team discussed.

### Work Through Discussions

For each flagged employee:

1. **Show their position** on the grid
2. **Open Details tab** to review:
   - Job level, tenure
   - Organizational context
   - Timeline (previous ratings)
3. **Discuss and decide** on rating
4. **Drag to new position** if group agrees to change
5. **Add note** capturing the decision:
   "Calibration 2024-12: Moved to Star - consensus on high performance + leadership potential"

[SCREENSHOT: Screen share view with employee details open]

### Track Decisions in Real-Time

As the meeting progresses:
- Move employees based on group consensus
- Add notes explaining each decision
- The **Apply badge** shows how many changes you've made

Watch the distribution shift in Statistics tab to ensure balanced results.

---

## After the Meeting (10 minutes)

### 1. Review Final Distribution (3 minutes)

Before exporting, do a final check:
- Statistics tab: Does distribution look calibrated?
- Intelligence tab: Are anomalies resolved?
- Changes tab: Are all moves documented with notes?

### 2. Export Final Ratings (2 minutes)

1. Click **Apply**
2. File name: `talent-ratings-post-calibration-2024-12.xlsx`
3. This file shows:
   - Final Performance/Potential ratings
   - All employees modified in session
   - Notes explaining each change

### 3. Communicate Results (5 minutes)

Send the exported file to:
- Meeting attendees (for their records)
- HR team (for system updates)
- Managers (to inform their direct reports)

**Include in your email:**
- Summary of changes (X employees moved)
- Next steps (update HRIS, communicate to employees)
- Timeline for next calibration

---

## 🎉 Success Checklist

You've successfully prepared and run a calibration meeting when you have:
- ✅ Identified and discussed borderline cases
- ✅ Resolved rating inconsistencies across managers
- ✅ Documented rationale for all changes
- ✅ Achieved balanced distribution (not too many high or low)
- ✅ Exported final ratings with full audit trail

---

## Tips from Experienced Users

💡 **Filter one manager at a time** - Review each manager's team as a group to spot patterns

💡 **Use Donut Mode before the meeting** - Gives you a head start on identifying mis-placements

💡 **Set ground rules** - Establish what "High Performance" means for your org before discussing individuals

💡 **Export frequently** - Save progress during long meetings in case of technical issues

💡 **Compare before/after** - Open both pre- and post-meeting exports side-by-side to see total impact

---

## Related Workflows

- [Running a Performance Review Cycle](#)
- [Succession Planning for Key Roles](#)
- [Identifying Flight Risks](#)
- [Building Development Plans](#)

**Questions?** Check [Troubleshooting](#) or [ask for help](#)
```

**Screenshot Needs:**
1. Statistics tab with red flag annotations
2. Intelligence tab showing anomalies
3. Filters panel with specific selections
4. Donut mode in action
5. Screen share view during meeting
6. Apply button with change count
7. Exported file comparison (before/after)

---

## Part 4: Screenshot Requirements

### Critical Screenshots (Must Have - 25 images)

#### Welcome & Quickstart (5 images)
1. **Sample Excel file** - 4 required columns highlighted
2. **Upload button location** - Annotated with red box and "Click here" callout
3. **Empty grid state** - Before upload with "Upload your data to begin" message
4. **Populated grid** - After successful upload, annotated with:
   - "Your employees" callout on tiles
   - "3×3 grid" overlay showing structure
   - "Employee count" callout on top bar
5. **Success indicators** - Checkmarks pointing to grid, count, and tiles

#### Core Workflow (8 images)
6. **Grid with axes labeled** - Annotate Performance (horizontal) and Potential (vertical)
7. **Position zones highlighted** - Color overlay showing Stars, Core, Concerns zones
8. **Drag and drop sequence** - 3-panel: Grab → Drag → Drop with motion lines
9. **Yellow highlight** - Employee tile after being moved
10. **Employee details panel** - All 4 tabs visible with Details tab open
11. **Timeline view** - Movement history showing old → new positions
12. **Changes tab** - With note being typed in field
13. **Apply button** - With badge showing "3 changes" count

#### Features (8 images)
14. **Filters panel open** - With some filters selected (e.g., "Engineering" department)
15. **Filters active state** - Grid showing only filtered employees + orange dot on Filters button
16. **Statistics tab** - Distribution table and chart visible
17. **Intelligence tab** - With at least one anomaly highlighted in red/yellow
18. **Donut mode button** - Before and after activation (separate states)
19. **Donut mode grid** - Showing only position 5 employees with ghostly appearance
20. **Donut changes tab** - Separate from regular changes tab
21. **Settings panel** - Theme options visible

#### Export & Results (4 images)
22. **Apply button states** - No changes (gray) vs. Has changes (with badge)
23. **Export in progress** - Download notification
24. **Exported Excel file** - Opened showing new columns highlighted:
    - Modified in Session
    - 9Boxer Change Notes
    - Updated Performance/Potential values
25. **Donut exercise columns** - In exported Excel with data populated

---

### Supplementary Screenshots (Nice to Have - 15 images)

#### Advanced Features
26. **Expanded grid box** - Multi-column layout with many employees
27. **Exclusions panel** - Manage Exclusions dialog with some employees excluded
28. **Search/filter combination** - Multiple filters active showing specific cohort
29. **Empty state messages** - "No employees match filters" screen
30. **Error states** - Examples of upload errors with messages

#### Workflow Scenarios
31. **Before/after calibration** - Side-by-side comparison of grid distribution
32. **Manager comparison** - Two different managers' distributions using filters
33. **Department view** - Filtered to one department showing their distribution
34. **Job level filtering** - Example showing only ICs or only Managers

#### Visual Indicators
35. **Color coding** - Legend showing what tile colors mean
36. **Badge indicators** - Different badge types (changes, donut, etc.)
37. **Tooltip examples** - Hover states showing helpful tooltips

#### UI Details
38. **Top bar** - Full application header with all buttons labeled
39. **Right panel tabs** - All 4 tabs (Details, Changes, Statistics, Intelligence) visible
40. **Grid expand/collapse** - Box with expand icon highlighted

---

### Screenshot Specifications

#### Technical Requirements
- **Format:** PNG with transparency where applicable
- **Resolution:** 2400px width minimum (will scale down for retina)
- **Color depth:** 24-bit RGB
- **Compression:** Optimized (use tools like TinyPNG after annotation)

#### Annotation Style Guide
- **Highlight boxes:** Red, 3px border, no fill
- **Callout numbers:** White text on blue circle (30px diameter)
- **Arrows:** Red, 4px wide, simple arrowhead
- **Annotations text:** 16px Roboto, white text with black 50% opacity background
- **Blur sensitive data:** 10px Gaussian blur on names/IDs

#### File Naming Convention
```
[page]-[feature]-[state]-[number].png

Examples:
quickstart-upload-button-highlighted-01.png
quickstart-grid-populated-02.png
workflow-drag-drop-sequence-03.png
features-filters-panel-open-14.png
export-excel-columns-highlighted-24.png
```

#### Accessibility Requirements
Every screenshot must have descriptive alt text:
```markdown
![The Upload button in the top-left of the application toolbar, highlighted with a red box and numbered callout "1"](quickstart-upload-button-01.png)
```

---

## Part 5: Implementation Recommendations

### Phase 1: Critical Path (Week 1-2)
**Goal:** Get new users to success faster

**Priority 1 - Must Do:**
1. ✅ Create NEW "2-Minute Quickstart" page
2. ✅ Revise "Getting Started" to focus on core workflow (remove installation, defer advanced features)
3. ✅ Capture 8 critical screenshots (Quickstart + Core Workflow sections)
4. ✅ Revise Home (index.md) to emphasize quick start
5. ✅ Create "Choose Your Path" navigation on home

**Deliverables:**
- 4 new/revised pages
- 8 annotated screenshots
- Updated navigation structure

**Success Metric:** New user can see their first grid in <5 minutes (currently ~15-20 minutes)

---

### Phase 2: Task-Based Guides (Week 3-4)
**Goal:** Help users accomplish real-world goals

**Priority 2 - Should Do:**
1. ✅ Create "Preparing for Talent Calibration" workflow guide
2. ✅ Create "Making Your First Rating Changes" guide
3. ✅ Reorganize existing content into "Reference" section
4. ✅ Capture 10 feature screenshots (Filters, Statistics, Donut Mode)
5. ✅ Add "When to use this" sections to feature pages

**Deliverables:**
- 3 new task-based guides
- Reorganized navigation (Getting Started / Tasks / Features / Reference / Help)
- 10 feature screenshots

**Success Metric:** Users can find "how do I prepare for a calibration meeting" content

---

### Phase 3: Engagement & Polish (Week 5-6)
**Goal:** Make docs engaging and comprehensive

**Priority 3 - Nice to Have:**
1. ✅ Rewrite feature pages with engaging tone
2. ✅ Add user scenarios and use cases to every feature
3. ✅ Create comparison table: "When to use X vs Y"
4. ✅ Add decision trees for choosing features
5. ✅ Capture remaining supplementary screenshots (15)
6. ✅ Create interactive troubleshooter
7. ✅ Add "Success looks like..." sections throughout

**Deliverables:**
- Revised tone across all pages
- 15 supplementary screenshots
- Decision trees and comparison tables

**Success Metric:** 90% of users can self-serve without support tickets

---

### Phase 4: Continuous Improvement (Ongoing)
**Goal:** Keep docs fresh and useful

**Ongoing:**
1. ✅ Monthly review of support tickets → update docs for common issues
2. ✅ Quarterly screenshot refresh when UI changes
3. ✅ User feedback integration (add "Was this helpful?" to each page)
4. ✅ A/B test different getting-started approaches
5. ✅ Track time-to-first-success metric

---

## Part 6: Quick Wins You Can Implement Today

Even before full redesign, these changes will improve docs immediately:

### 1. Add "Time to Complete" to Every Guide
```markdown
> ⏱️ **Time to complete:** 5 minutes
```

### 2. Add "What You'll Learn" Bullets
```markdown
> **What you'll learn:**
> - How to upload your first file
> - How to move employees
> - How to save your work
```

### 3. Add Success Indicators
```markdown
✅ **Success!** You should see your employee tiles arranged on a 3×3 grid
```

### 4. Break Up Dense Paragraphs
```markdown
❌ BEFORE (dense):
"When you activate Donut Mode the grid filters to show only employees in position 5 and you can place them in their true positions to validate that they belong in the center box and the placements are tracked separately from actual positions."

✅ AFTER (scannable):
When you activate Donut Mode:
- Grid shows only position 5 employees
- You can place them in their "true" positions
- Placements tracked separately from actual ratings
```

### 5. Add Clear CTAs
```markdown
**Ready to try it?** → [Follow the 2-minute quickstart](#)
```

---

## Conclusion

The current documentation is a **strong technical reference** but a **weak onboarding tool**. The proposed changes will transform it into **best-in-class user documentation** that:

✅ Gets users to success in <5 minutes (vs 15-20 currently)
✅ Organizes around user goals, not features
✅ Uses engaging, conversational tone
✅ Provides visual guidance with 40+ annotated screenshots
✅ Offers task-based workflows for real-world scenarios
✅ Maintains comprehensive reference for power users

**Recommended approach:** Implement in phases, starting with critical path (2-minute quickstart), then building out task-based guides, then polishing tone and adding supplementary content.

**Effort estimate:**
- Writing: 40-60 hours
- Screenshots: 20-30 hours
- Review/iteration: 10-15 hours
- **Total: 70-105 hours (~2-3 weeks for 1 person)**

**Impact:** Significantly reduced time-to-value for new users, decreased support burden, increased user satisfaction and feature adoption.

---

*Document prepared: December 2024*
*For: 9Boxer Documentation Redesign*
*By: Claude Code (Documentation Standards Expert)*
