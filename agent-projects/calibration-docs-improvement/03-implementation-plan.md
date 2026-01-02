# Calibration Documentation Implementation Plan

**Date:** 2026-01-01
**Project:** Calibration Documentation Restructuring
**Approach:** Dual-track WHY/HOW structure with reference appendix

---

## 1. Executive Summary

### What We're Building

We are restructuring the calibration documentation into a dual-track system that separates:

1. **WHY Track** - Philosophy, mindset, organizational health perspective
2. **HOW Track** - Practical workflows for before/during/after calibration in 9Boxer
3. **Reference Appendix** - Deep-dive best practices linked from main content

This approach addresses the critical gaps identified in the initial review (incorrect filtering guidance, missing philosophy, wrong tone) while incorporating the organizational health expert's insights on power dynamics, psychological safety, and making calibration human.

### Key Changes

**Critical Corrections:**
- Replace manager-by-manager filtering with level-based cohort methodology
- Add calibration philosophy section explaining dual purpose (rating employees AND assessing managers)
- Reframe all judgmental language to collaborative language
- Position Intelligence as final sweep, not first step
- Correct Donut Mode timing (before meeting, not during)

**Structure:**
- 1 philosophy/intro document (WHY)
- 1 quick workflow document (HOW - getting started)
- 1 complete reference document (HOW - comprehensive)
- 5-7 reference appendix documents (deep dives on specific topics)

**Tone:**
- Transform from formal/procedural to authentic/conversational
- Acknowledge discomfort and difficulty
- Use peer guidance voice, not corporate HR speak

### Success Criteria

- New users understand WHY calibration matters before learning HOW
- Level-based filtering is clearly the primary methodology
- Language promotes collaboration, not defensiveness
- Facilitators have concrete scripts for difficult moments
- Deep topics (power dynamics, cultural calibration, etc.) are accessible but not overwhelming

---

## 2. Proposed Document Structure

### 2.1 Document Map

```
📁 Calibration Documentation
│
├── 📄 new-to-9box.md (EXPANDED - WHY TRACK)
│   "Calibration Philosophy & 9-Box Introduction"
│   ~900 lines
│   └─ Links to: getting-started.md, best-practices.md
│
├── 📄 getting-started.md (MAJOR REWRITE - HOW TRACK)
│   "Quick Calibration Workflow"
│   ~450 lines
│   └─ Links to: new-to-9box.md, best-practices.md, appendix docs
│
├── 📄 best-practices.md (EXPAND & MERGE - HOW TRACK + REFERENCE)
│   "Complete Calibration Guide"
│   ~1200 lines (merges content from talent-calibration.md)
│   └─ Links to: all appendix docs
│
├── 🗑️ workflows/talent-calibration.md (DELETE - content merged into best-practices.md)
│
└── 📁 reference/ (NEW - REFERENCE APPENDIX)
    │
    ├── 📄 power-dynamics-and-politics.md (NEW)
    │   "Handling Power Dynamics in Calibration"
    │   ~400 lines
    │
    ├── 📄 psychological-safety.md (NEW)
    │   "Creating Psychological Safety in Calibration"
    │   ~350 lines
    │
    ├── 📄 difficult-scenarios.md (NEW)
    │   "Handling Difficult Calibration Scenarios"
    │   ~500 lines
    │
    ├── 📄 post-calibration-conversations.md (NEW)
    │   "After Calibration: Manager and Employee Conversations"
    │   ~400 lines
    │
    ├── 📄 cultural-calibration.md (NEW)
    │   "Global and Cross-Cultural Calibration"
    │   ~350 lines
    │
    ├── 📄 filtering-decision-tree.md (NEW)
    │   "Filter Strategy Reference"
    │   ~450 lines
    │
    └── 📄 multi-year-tracking.md (NEW)
    │   "Tracking Calibration Patterns Over Time"
    │   ~300 lines
```

### 2.2 Navigation Flow

**For New Users (First Calibration):**
```
Start: new-to-9box.md (Philosophy)
  ↓
Next: getting-started.md (Quick Workflow)
  ↓
Reference as needed: best-practices.md (Complete Guide)
  ↓
Deep dives as needed: Appendix documents
```

**For Experienced Users (Nth Calibration):**
```
Jump to: best-practices.md (Complete Guide)
  ↓
Reference specific topics: Appendix documents
```

**For Facilitators:**
```
Review: new-to-9box.md (Philosophy section on facilitation)
  ↓
Prepare with: best-practices.md (Before/During/After sections)
  ↓
Handle challenges: reference/difficult-scenarios.md
  ↓
Build safety: reference/psychological-safety.md
```

---

## 3. Content Mapping

### 3.1 new-to-9box.md (Philosophy & Introduction)

**Current State:** 631 lines, good conceptual intro but missing calibration philosophy

**Target State:** ~900 lines, foundational document for mindset

**New Sections to Add:**

```markdown
## Why Calibration Matters (NEW - 200 lines)
  - What calibration achieves (alignment, bias detection, manager development)
  - Wrong mindset vs. right mindset (defend vs. align)
  - How 9Boxer supports good calibration
  - Dual purpose: rating employees AND assessing managers

## The Level-Based Calibration Approach (NEW - 180 lines)
  - Start with levels, not teams
  - The typical flow (ICs → Managers → Directors → Intelligence)
  - Why this order matters
  - Example filter progression

## Your Role in Calibration (NEW - 150 lines)
  - As a participating manager (come prepared, stay curious)
  - As a facilitator (create safety, make patterns visible)
  - Language that helps vs. hurts

## How Calibration Connects to Organizational Health (NEW - 120 lines)
  - What calibration reveals about culture
  - Trust-building through calibration
  - Avoiding political calibration
```

**Existing Sections to Keep:**
- What is 9-Box (already good, ~200 lines)
- Understanding the 9 Positions (~200 lines)
- Common Scenarios (~150 lines)

**Tone Changes:**
- Add warmth and acknowledgment of difficulty
- Use "we're all figuring this out" framing
- Include specific language transformations (judgmental → collaborative)

**Links to Add:**
- Link to getting-started.md for practical workflow
- Link to best-practices.md for complete guide
- Link to reference/psychological-safety.md for deep dive
- Link to reference/power-dynamics-and-politics.md for political challenges

---

### 3.2 getting-started.md (Quick Workflow)

**Current State:** 382 lines, unclear filtering guidance, too much upfront

**Target State:** ~450 lines, clear level-based workflow

**Complete Rewrite Required - New Structure:**

```markdown
# Quick Calibration Workflow

## Introduction (50 lines)
  - Who this is for
  - Time commitment (15 min to learn, 60-90 min for meeting)
  - Link to philosophy doc for first-timers

## The 5-Step Workflow (350 lines)

  ### Step 1: Prepare (Before Meeting) - 100 lines
    - Upload data
    - Review by level (CORRECT guidance)
    - Check Intelligence (positioned as final sweep)
    - Use Donut Mode (positioned as prep, not during meeting)

  ### Step 2: Plan Your Session Order - 80 lines
    - Recommended calibration order by org size
    - <100 employees: all ICs, all Managers, all Leaders
    - >100 employees: IC+Engineering, IC+Sales, etc.

  ### Step 3: During the Meeting - 100 lines
    - Work level by level
    - Use filters to focus discussions
    - Make changes and document decisions
    - Frame for collaboration, not defense

  ### Step 4: Final Checks - 40 lines
    - Review distribution
    - Intelligence sweep for remaining anomalies

  ### Step 5: Export and Share - 30 lines
    - Export results
    - Communicate changes

## What's Next (50 lines)
  - Links to complete guide
  - Links to specific appendix topics
  - Links to feature references
```

**Critical Content Changes:**

**REMOVE (Incorrect):**
- Manager-by-manager filtering as primary approach (lines 165-172 in current)
- "Review one person's team" guidance
- Intelligence as first step

**ADD (Correct):**
- Level-based filtering as primary methodology
- Filter hierarchy: Level → Function → Intelligence
- When/why to use each filter type
- Manager filtering positioned as rarely appropriate

**Tone Changes:**
- "Don't try to calibrate 200 people at once" (direct, honest)
- "Here's what most people get wrong..." (peer guidance)
- "This is hard work but worth it" (acknowledge difficulty)

**Links to Add:**
- reference/filtering-decision-tree.md for complete filter guidance
- reference/psychological-safety.md for facilitation tips
- reference/difficult-scenarios.md for handling challenges

---

### 3.3 best-practices.md (Complete Guide)

**Current State:** 776 lines, comprehensive but wrong filtering guidance and formal tone

**Target State:** ~1200 lines (includes merged content from talent-calibration.md)

**Major Restructuring Required:**

```markdown
# Complete Calibration Guide

## Introduction (50 lines)
  - Quick workflow link for streamlined path
  - Philosophy link for context
  - This guide: deep best practices and troubleshooting

## Before the Meeting (300 lines)

  ### Critical Preparation Steps (80 lines)
    - Merge talent-calibration.md pre-meeting checklist

  ### Level-Based Review Strategy (NEW - 220 lines)
    - Complete filter decision tree
    - When to use each filter type
    - Example session flows
    - Why level → function → intelligence order matters
    - Manager filtering: when/why/how sparingly
    - Location/cultural calibration
    - Flag-based filtering workflows

## During the Meeting (400 lines)

  ### Calibration Meeting Principles (NEW - 150 lines)
    - Come to align, not defend
    - Your goal as facilitator
    - Language that helps vs. hurts
    - Evidence over intuition
    - Permission to change minds

  ### Working Through Levels (100 lines)
    - Merge talent-calibration.md during-meeting content
    - Reframe around level-based review

  ### Handling Disagreements (NEW - 80 lines)
    - Scenario: manager vs. peers on rating
    - Good vs. poor facilitation
    - When to agree to disagree

  ### Common Meeting Scenarios (70 lines)
    - Merge scenarios from talent-calibration.md
    - Add new scenarios

## After the Meeting (200 lines)

  ### Manager-to-Employee Conversations (80 lines)
    - Link to reference/post-calibration-conversations.md
    - Brief overview

  ### Development Planning (60 lines)
    - High Potentials
    - Performance improvement
    - Retention conversations

  ### Follow-up and Documentation (60 lines)
    - Update HRIS
    - Track decisions
    - Plan next calibration

## Advanced Techniques (150 lines)
  - Advanced filtering patterns
  - Succession pipeline review
  - Development planning cohorts
  - Retention risk assessment

## Pitfalls to Avoid (100 lines)
  - Don't start manager-by-manager
  - Don't skip level-based calibration
  - Don't try 200 people in one session
  - Don't force distribution without context
  - Don't calibrate without preparation
```

**Content to Merge from talent-calibration.md:**
- Pre-meeting checklist (lines 30-69)
- Filtering guidance (REWRITE with corrections, lines 70-85)
- During-meeting workflow (lines 100-150)
- Scenarios (lines 180-220)

**Content to Remove/Replace:**
- Current filtering section (lines 210-260) - completely wrong
- Statistics section (lines 264-294) - reframe from "problems" to "conversation starters"
- Manager filtering guidance (lines 240-260) - remove as primary approach

**Tone Changes:**
- Reframe "validate they deserve it" to "ensure consistent bar"
- Change "checking leniency bias" to "comparing standards"
- Transform from procedural to peer wisdom voice

**Links to Add:**
- All 7 appendix documents at relevant points
- Feature references (filters, intelligence, donut mode, etc.)

---

### 3.4 Reference Appendix Documents (NEW)

#### 3.4.1 power-dynamics-and-politics.md

**Purpose:** Address the elephant in the room - calibration involves power dynamics

**Length:** ~400 lines

**Content Outline:**

```markdown
# Handling Power Dynamics in Calibration

## The Dual Purpose Nobody Talks About (80 lines)
  - Assessing employees AND managers simultaneously
  - Managers are being evaluated on their judgment
  - Transparency creates discomfort by design
  - Acknowledging this builds trust

## When Power Protects Ratings (100 lines)
  - The "protected pet" scenario
  - How to name it gently as facilitator
  - What to do when senior leaders dominate
  - Making conversation happen despite discomfort

## Redistributing Credibility (80 lines)
  - Managers who demonstrate good judgment gain influence
  - Those who can't articulate ratings lose credibility
  - This is healthy organizational development
  - Not a gotcha game

## Avoiding Political Calibration (140 lines)
  - Data first, discussion second
  - Level-based review makes patterns visible
  - Rotate facilitators
  - Document reasoning
  - Check outcomes over time
```

**Mapped from org-health review:** Lines 26-91 (power dynamics section)

**Tone:** Honest, direct, acknowledges difficulty

**Links from:** new-to-9box.md, best-practices.md (during meeting section)

---

#### 3.4.2 psychological-safety.md

**Purpose:** Concrete tactics for creating safety in calibration discussions

**Length:** ~350 lines

**Content Outline:**

```markdown
# Creating Psychological Safety in Calibration

## What Makes Calibration Actually Work (100 lines)
  - Permission to be wrong
  - Separation of rating from relationship
  - Evidence over intuition
  - "We're all figuring this out" frame

## Specific Safety-Building Tactics (150 lines)
  - Senior leaders go last
  - Acknowledge the discomfort
  - Separate identity from opinion
  - Model changing your mind
  - Name the elephant when you see it

## Language for Facilitators (100 lines)
  - Scripts for giving permission to revise
  - How to invite different perspectives
  - Handling silence
  - Addressing visible discomfort
```

**Mapped from org-health review:** Lines 45-91 (psychological safety section) and 277-301 (creating safety tactics)

**Tone:** Warm, practical, script-heavy

**Links from:** new-to-9box.md (facilitator role), best-practices.md (during meeting), getting-started.md

---

#### 3.4.3 difficult-scenarios.md

**Purpose:** Real-world challenges with concrete responses

**Length:** ~500 lines

**Content Outline:**

```markdown
# Handling Difficult Calibration Scenarios

## The Protected Pet (70 lines)
  - Situation: senior leader protecting underperformer
  - What happens if unaddressed
  - Facilitator response script
  - Follow-up actions

## Recency Bias Problem (60 lines)
  - Strong Q4 after weak Q1-Q3
  - How to rate for full period
  - Language to use

## The New Manager (60 lines)
  - First-time manager, rated everyone high
  - How to make it a learning experience
  - Framing calibration as development

## The Layoff Shadow (70 lines)
  - Fear distorting ratings
  - Why honesty is protective
  - How to address in room

## The Exit Already Planned (60 lines)
  - Don't retroactively adjust ratings
  - Rate performance as it was
  - Maintain system integrity

## Manager Wants Team-Only Review (70 lines)
  - Why this creates silos
  - How to redirect to level-based
  - When manager filtering IS appropriate

## Everyone is Medium/Medium (70 lines)
  - 70% in center box
  - Force differentiation within level
  - "Who would you promote?" question

## The Absent Vote (40 lines)
  - Manager can't attend
  - Options: reschedule or designate proxy
  - Don't calibrate without context

## The "Everyone Knows" Problem (40 lines)
  - Obvious underperformance, no one speaks
  - Courage to name the obvious
  - Facilitator responsibility

## The Unknown Gem (40 lines)
  - Great employee, poor advocate
  - Calibration reveals overlooked talent
  - Coaching opportunity for manager

## The Recalibration Moment (20 lines)
  - Realizing earlier cohorts were off
  - Intellectual honesty to revisit
```

**Mapped from org-health review:** Lines 97-173 (scenarios section) and 362-401 (what I would add section)

**Tone:** Scenario-based, practical, non-judgmental

**Links from:** best-practices.md (during meeting, pitfalls), getting-started.md

---

#### 3.4.4 post-calibration-conversations.md

**Purpose:** What happens after ratings are finalized

**Length:** ~400 lines

**Content Outline:**

```markdown
# After Calibration: Manager and Employee Conversations

## The 30-Day Rule (60 lines)
  - Every rating change = conversation required
  - Timeline for communicating
  - What happens if you don't follow up

## Manager-to-Employee Conversations (150 lines)
  - How to explain a rating change
  - Separating rating from worth
  - Language that helps vs. hurts
  - Examples of good conversations
  - What to avoid

## Development Planning (100 lines)
  - High Potentials: next steps
  - Medium Performance + High Potential: development focus
  - Low Performance: performance improvement plans
  - Stars: retention and growth

## Retention Conversations (60 lines)
  - Proactive outreach to Stars
  - Understanding flight risk
  - What to offer, what to avoid

## Calibration Feedback to Managers (30 lines)
  - Coaching managers on their patterns
  - Leniency/harshness conversations
  - Helping managers develop judgment
```

**Mapped from org-health review:** Lines 315-325 (what to do after) and 169-173 (never following up)

**Tone:** Compassionate, practical, human

**Links from:** best-practices.md (after meeting section)

---

#### 3.4.5 cultural-calibration.md

**Purpose:** Global and cross-cultural calibration challenges

**Length:** ~350 lines

**Content Outline:**

```markdown
# Global and Cross-Cultural Calibration

## Cultural Differences in Rating Standards (100 lines)
  - Asian offices: conservative ratings
  - US offices: grade inflation
  - European offices: center clustering
  - What's real vs. what's bias

## The Normalization Decision (80 lines)
  - Should we normalize across locations?
  - Should we accept location-specific standards?
  - Factors to consider
  - Decision framework

## Cultural Comfort with Ratings (90 lines)
  - Some cultures: rating low = personal insult
  - Some cultures: rating high = bragging
  - How to navigate these differences
  - Creating shared understanding

## Remote/Distributed Calibration (80 lines)
  - Calibrating across time zones
  - Managing bias toward in-office visibility
  - Video call effectiveness
  - Screen sharing best practices
```

**Mapped from org-health review:** Lines 343-348 (calibration across cultures) and initial review mentions of location filtering

**Tone:** Culturally sensitive, practical, nuanced

**Links from:** best-practices.md (advanced techniques)

---

#### 3.4.6 filtering-decision-tree.md

**Purpose:** Complete reference for when/why/how to filter

**Length:** ~450 lines

**Content Outline:**

```markdown
# Filter Strategy Reference

## Filter Hierarchy (80 lines)
  - Level 1: By Job Level (START HERE)
  - Level 2: By Function (REFINE)
  - Level 3: By Location (CULTURAL)
  - Level 4: Intelligence & Flags (FINAL SWEEP)
  - Level 5: By Manager (RARELY)

## Complete Decision Tree (150 lines)
  - Goal: fair consistent ratings → Level first
  - Goal: review manager's team → Only when large span
  - Goal: promotion candidates → High Pot + High Perf by level
  - Goal: cultural differences → Location filter
  - Goal: flight risks → Intelligence + flags
  - Visual flowchart

## When to Use Each Filter (100 lines)
  - By Level (primary approach)
  - By Function + Level (secondary)
  - By Location (cultural calibration)
  - By Manager (use sparingly)
  - By Flags/Intelligence (final sweep)

## Example Session Flows (120 lines)
  - Organization <100 people
  - Organization >100 people
  - Global organization
  - Manager-heavy organization
```

**Mapped from:** Initial review lines 297-320 (missing filter guidance) and proposed rewrites in initial review

**Tone:** Clear, structured, decision-focused

**Links from:** getting-started.md (Step 1), best-practices.md (before meeting section)

---

#### 3.4.7 multi-year-tracking.md

**Purpose:** Using calibration data over time

**Length:** ~300 lines

**Content Outline:**

```markdown
# Tracking Calibration Patterns Over Time

## Why Multi-Year Tracking Matters (60 lines)
  - Single-year = snapshot
  - Multi-year = trajectories
  - Organizational insights emerge

## What to Track (80 lines)
  - Same people Stars every year (stagnation or accuracy?)
  - Movement from Low to High in one year (what happened?)
  - Manager patterns over time
  - Distribution shifts year over year

## Using Historical Data (100 lines)
  - Informing current calibration
  - Identifying development success/failure
  - Predicting future performance
  - Validating calibration accuracy

## Outcome Validation (60 lines)
  - Do Stars actually get promoted?
  - Do Low Performers exit or improve?
  - Do calibration decisions predict outcomes?
  - What to do if predictions fail
```

**Mapped from org-health review:** Lines 327-334 (multi-year patterns)

**Tone:** Analytical, strategic, long-term focused

**Links from:** best-practices.md (advanced techniques)

---

## 4. Task Breakdown

### Phase 1: Foundation & Critical Corrections (Week 1-2)

**Priority:** HIGH - Fix factually incorrect guidance

#### Task 1.1: Expand new-to-9box.md with Philosophy Section
**Time Estimate:** 8 hours

**Deliverables:**
- Add "Why Calibration Matters" section (200 lines)
- Add "The Level-Based Calibration Approach" section (180 lines)
- Add "Your Role in Calibration" section (150 lines)
- Add "How Calibration Connects to Organizational Health" section (120 lines)

**Dependencies:** None

**Content Sources:**
- Org-health review lines 26-91 (philosophy)
- Initial review proposed philosophy section
- Org-health review lines 19-91 (mindset shifts)

**Acceptance Criteria:**
- [ ] Philosophy explains dual purpose (employees + managers)
- [ ] Mindset shifts clearly articulated (defend vs. align)
- [ ] Level-based approach introduced conceptually
- [ ] Links to getting-started.md and best-practices.md added
- [ ] Tone is warm, acknowledges difficulty

---

#### Task 1.2: Complete Rewrite of getting-started.md Filtering Section
**Time Estimate:** 6 hours

**Deliverables:**
- Remove all manager-by-manager filtering guidance
- Replace with level-based filtering as primary approach
- Add filter hierarchy (Level → Function → Intelligence)
- Correct Donut Mode timing (before meeting, not during)
- Add session planning guidance by org size

**Dependencies:** Task 1.1 (philosophy provides context)

**Critical Changes:**
- Lines 165-172: Delete manager comparison tab, replace with level-based guidance
- Lines 133-175: Complete rewrite of filtering section
- Position Intelligence as final sweep, not first step

**Acceptance Criteria:**
- [ ] No mention of manager-by-manager as primary approach
- [ ] Level-based filtering clearly primary methodology
- [ ] Filter hierarchy explicitly stated
- [ ] Donut Mode positioned as prep work
- [ ] Intelligence positioned as final anomaly check

---

#### Task 1.3: Rewrite best-practices.md Filtering Section
**Time Estimate:** 8 hours

**Deliverables:**
- Complete rewrite of lines 210-260 (filtering guidance)
- Add complete filter decision tree
- Add "when to use each filter type" section
- Add example session flows
- Reframe statistics language (lines 264-294)

**Dependencies:** Task 1.2 (consistent filtering guidance)

**Critical Changes:**
- Delete current filtering section (lines 210-260)
- Add decision tree flowchart
- Add when/why/how for each filter type
- Reframe from "problems" to "conversation starters"

**Acceptance Criteria:**
- [ ] Filter decision tree complete and visual
- [ ] Level → Function → Intelligence order explicit
- [ ] Manager filtering positioned as rare exception
- [ ] Statistics section uses collaborative language
- [ ] Links to reference/filtering-decision-tree.md added

---

#### Task 1.4: Merge talent-calibration.md into best-practices.md
**Time Estimate:** 5 hours

**Deliverables:**
- Move checklists to best-practices.md
- Integrate scenarios into best-practices.md
- Merge during-meeting content
- Delete talent-calibration.md
- Update all cross-references

**Dependencies:** Task 1.3 (best-practices.md structure ready)

**Content to Move:**
- Pre-meeting checklist (talent-calibration.md lines 30-69)
- During-meeting workflow (lines 100-150)
- Scenarios (lines 180-220)

**Acceptance Criteria:**
- [ ] All valuable content from talent-calibration.md preserved
- [ ] Content integrated logically into best-practices.md
- [ ] No duplicate content
- [ ] talent-calibration.md deleted
- [ ] All links updated to point to best-practices.md

---

#### Task 1.5: Tone Transformation - Critical Sections
**Time Estimate:** 6 hours

**Deliverables:**
- Rewrite "validate they deserve it" language across all docs
- Change "checking for bias" to "comparing standards"
- Transform statistics "red flags" to "conversation starters"
- Add "why this matters" context throughout

**Dependencies:** Tasks 1.1-1.4 (content structure in place)

**Documents to Update:**
- getting-started.md
- best-practices.md
- new-to-9box.md

**Specific Transformations:**
- "Validate high performers deserve it" → "Ensure consistent, high bar"
- "One manager rates everyone high (leniency bias)" → "Manager A's standards may differ - worth discussing"
- "Check if ratings are justified" → "Confirm alignment on what 'high performance' means"

**Acceptance Criteria:**
- [ ] No judgmental language remains
- [ ] All language promotes collaboration
- [ ] Tone is conversational, not procedural
- [ ] "Why this matters" added to key sections
- [ ] Voice matches voice-and-tone-guide.md

---

### Phase 2: Reference Appendix Creation (Week 3-4)

**Priority:** MEDIUM - Enhance with deep-dive content

#### Task 2.1: Create power-dynamics-and-politics.md
**Time Estimate:** 6 hours

**Deliverables:**
- Complete document (~400 lines)
- Sections on dual purpose, protected pets, credibility, avoiding politics

**Dependencies:** Task 1.1 (philosophy established)

**Content Sources:**
- Org-health review lines 26-91, 217-238

**Acceptance Criteria:**
- [ ] Dual purpose explicitly explained
- [ ] Protected pet scenario with facilitator script
- [ ] Political calibration countermeasures listed
- [ ] Tone is honest and direct
- [ ] Links added from new-to-9box.md and best-practices.md

---

#### Task 2.2: Create psychological-safety.md
**Time Estimate:** 5 hours

**Deliverables:**
- Complete document (~350 lines)
- Safety-building tactics with specific scripts

**Dependencies:** Task 1.1 (philosophy established)

**Content Sources:**
- Org-health review lines 45-91, 277-301

**Acceptance Criteria:**
- [ ] Four psychological safety principles explained
- [ ] Five specific tactics with scripts
- [ ] Facilitator language examples provided
- [ ] Tone is warm and practical
- [ ] Links added from best-practices.md and getting-started.md

---

#### Task 2.3: Create difficult-scenarios.md
**Time Estimate:** 8 hours

**Deliverables:**
- Complete document (~500 lines)
- 11 scenarios with situation/response/outcome

**Dependencies:** Task 2.2 (safety context established)

**Content Sources:**
- Org-health review lines 97-173, 362-401

**Acceptance Criteria:**
- [ ] All 11 scenarios documented
- [ ] Each has situation/what happens/response structure
- [ ] Facilitator scripts provided
- [ ] Tone is scenario-based and practical
- [ ] Links added from best-practices.md

---

#### Task 2.4: Create post-calibration-conversations.md
**Time Estimate:** 6 hours

**Deliverables:**
- Complete document (~400 lines)
- Manager-to-employee conversation guidance
- Development planning framework

**Dependencies:** Task 1.4 (best-practices.md after-meeting section exists)

**Content Sources:**
- Org-health review lines 315-325, 169-173

**Acceptance Criteria:**
- [ ] 30-day rule explained
- [ ] Manager-to-employee scripts provided
- [ ] Development planning by box position
- [ ] Retention conversation guidance
- [ ] Tone is compassionate and human
- [ ] Links added from best-practices.md after-meeting section

---

#### Task 2.5: Create cultural-calibration.md
**Time Estimate:** 5 hours

**Deliverables:**
- Complete document (~350 lines)
- Cultural differences, normalization decision, remote calibration

**Dependencies:** Task 1.3 (filtering guidance references location filtering)

**Content Sources:**
- Org-health review lines 343-348
- Initial review location filtering references

**Acceptance Criteria:**
- [ ] Cultural rating differences explained
- [ ] Normalization decision framework provided
- [ ] Remote calibration tactics included
- [ ] Tone is culturally sensitive
- [ ] Links added from best-practices.md advanced section

---

#### Task 2.6: Create filtering-decision-tree.md
**Time Estimate:** 7 hours

**Deliverables:**
- Complete document (~450 lines)
- Visual decision tree
- Complete when/why/how for each filter type
- Example session flows

**Dependencies:** Task 1.3 (filtering guidance in best-practices.md)

**Content Sources:**
- Initial review lines 297-320
- Initial review proposed filter decision tree sections

**Acceptance Criteria:**
- [ ] Filter hierarchy clearly visualized
- [ ] Decision tree flowchart created
- [ ] Three example session flows (small/large/global orgs)
- [ ] When/why/how sections for each filter type
- [ ] Tone is clear and decision-focused
- [ ] Links added from getting-started.md and best-practices.md

---

#### Task 2.7: Create multi-year-tracking.md
**Time Estimate:** 4 hours

**Deliverables:**
- Complete document (~300 lines)
- Why tracking matters, what to track, outcome validation

**Dependencies:** None (standalone topic)

**Content Sources:**
- Org-health review lines 327-334

**Acceptance Criteria:**
- [ ] Multi-year value explained
- [ ] What to track listed with examples
- [ ] Outcome validation framework provided
- [ ] Tone is analytical and strategic
- [ ] Links added from best-practices.md advanced section

---

### Phase 3: Cross-Linking & Integration (Week 5)

**Priority:** MEDIUM - Ensure cohesive navigation

#### Task 3.1: Add Cross-Links Between Main Documents
**Time Estimate:** 3 hours

**Deliverables:**
- Links from new-to-9box.md to getting-started.md and best-practices.md
- Links from getting-started.md to appendix documents
- Links from best-practices.md to all appendix documents
- Contextual linking (not just "see also")

**Dependencies:** All Phase 1 and Phase 2 tasks complete

**Acceptance Criteria:**
- [ ] Every main document links to relevant appendix docs
- [ ] Links are contextual ("for facilitator scripts, see...")
- [ ] No broken links
- [ ] Navigation flows tested (new user path, experienced user path)

---

#### Task 3.2: Create Navigation Summary in Each Document
**Time Estimate:** 2 hours

**Deliverables:**
- Add "What's in this guide" section to each main doc
- Add "Related resources" section to each appendix doc
- Add navigation hints ("New to calibration? Start here...")

**Dependencies:** Task 3.1 (cross-links in place)

**Acceptance Criteria:**
- [ ] Each document has clear navigation guidance
- [ ] Users know where to go next
- [ ] Role-based navigation provided (facilitator, participant, etc.)

---

#### Task 3.3: Update MkDocs Navigation Structure
**Time Estimate:** 2 hours

**Deliverables:**
- Update mkdocs.yml to reflect new structure
- Add "Reference" section for appendix docs
- Ensure proper document ordering

**Dependencies:** All documents created

**Acceptance Criteria:**
- [ ] Navigation structure matches document map
- [ ] Appendix docs organized under "Reference"
- [ ] Order supports user journeys (philosophy → quick → complete → deep dives)

---

### Phase 4: Quality Assurance & Polish (Week 6)

**Priority:** MEDIUM - Ensure consistency and quality

#### Task 4.1: Tone Consistency Review
**Time Estimate:** 4 hours

**Deliverables:**
- Review all documents against voice-and-tone-guide.md
- Ensure consistent voice across all docs
- Check paragraph length (2-3 sentences max)
- Verify conversational tone throughout

**Dependencies:** All content written

**Acceptance Criteria:**
- [ ] No passive voice constructions
- [ ] All paragraphs 2-3 sentences
- [ ] Consistent use of second person ("you")
- [ ] No judgmental language remains
- [ ] Tone matches content type (warm for philosophy, practical for how-to, etc.)

---

#### Task 4.2: Content Accuracy Review
**Time Estimate:** 5 hours

**Deliverables:**
- Verify all technical accuracy
- Test all workflows in 9Boxer application
- Ensure filter guidance matches actual UI
- Validate all examples

**Dependencies:** All content written

**Acceptance Criteria:**
- [ ] All workflows tested and verified
- [ ] Filter names match actual application
- [ ] Screenshots placeholders marked correctly
- [ ] Examples are realistic and helpful
- [ ] No contradictions between documents

---

#### Task 4.3: Completeness Check
**Time Estimate:** 3 hours

**Deliverables:**
- Verify all content from org-health review incorporated
- Check that all initial review gaps addressed
- Ensure no duplicate content
- Validate all cross-references

**Dependencies:** All content written

**Acceptance Criteria:**
- [ ] All org-health review insights incorporated
- [ ] All initial review gaps filled
- [ ] No content duplicated across docs
- [ ] All internal links work
- [ ] All references to other docs are accurate

---

#### Task 4.4: User Journey Testing
**Time Estimate:** 3 hours

**Deliverables:**
- Test new user path (philosophy → quick → complete)
- Test experienced user path (complete → appendix)
- Test facilitator path (philosophy → complete → scenarios → safety)
- Document any navigation issues

**Dependencies:** Task 3.1-3.3 (navigation complete)

**Acceptance Criteria:**
- [ ] New user can find getting started easily
- [ ] Experienced user can skip philosophy
- [ ] Facilitator can find scripts and tactics
- [ ] No dead ends in navigation
- [ ] "What's next" links are logical

---

#### Task 4.5: Final Proofreading
**Time Estimate:** 3 hours

**Deliverables:**
- Spell check all documents
- Grammar check all documents
- Check markdown formatting
- Verify all lists, tables, code blocks render correctly

**Dependencies:** All content finalized

**Acceptance Criteria:**
- [ ] No spelling errors
- [ ] No grammar errors
- [ ] All markdown renders correctly
- [ ] All admonitions, tabs, and formatting work
- [ ] Document ready for screenshot integration

---

### Phase 5: Screenshot Planning (Week 7)

**Priority:** LOWER - Visual enhancement (done after content finalized)

#### Task 5.1: Identify Screenshot Locations
**Time Estimate:** 2 hours

**Deliverables:**
- Mark all locations needing screenshots with placeholders
- Specify what each screenshot should show
- Prioritize critical vs. nice-to-have screenshots

**Dependencies:** All content written and reviewed

**Acceptance Criteria:**
- [ ] Every key action has screenshot placeholder
- [ ] Screenshot descriptions are specific
- [ ] Priority levels assigned (critical/nice-to-have)

---

#### Task 5.2: Create Screenshot Generation Plan
**Time Estimate:** 2 hours

**Deliverables:**
- List of all screenshots needed
- Playwright automation requirements
- Annotation specifications
- File naming conventions

**Dependencies:** Task 5.1 (locations identified)

**Acceptance Criteria:**
- [ ] Complete screenshot list created
- [ ] Playwright script requirements documented
- [ ] Ready to hand off to screenshot generation workflow

---

## 5. Phase Summary

### Phase 1: Foundation & Critical Corrections (Week 1-2)
**Total Time:** 33 hours
**Key Deliverable:** Correct filtering guidance, philosophy added, content merged

**Tasks:**
1. Expand new-to-9box.md with philosophy (8h)
2. Rewrite getting-started.md filtering (6h)
3. Rewrite best-practices.md filtering (8h)
4. Merge talent-calibration.md into best-practices.md (5h)
5. Tone transformation - critical sections (6h)

**Dependencies:** None
**Risk:** Low (content is well-defined from reviews)
**Blocker Potential:** High (all other work depends on this)

---

### Phase 2: Reference Appendix Creation (Week 3-4)
**Total Time:** 41 hours
**Key Deliverable:** 7 deep-dive reference documents

**Tasks:**
1. Create power-dynamics-and-politics.md (6h)
2. Create psychological-safety.md (5h)
3. Create difficult-scenarios.md (8h)
4. Create post-calibration-conversations.md (6h)
5. Create cultural-calibration.md (5h)
6. Create filtering-decision-tree.md (7h)
7. Create multi-year-tracking.md (4h)

**Dependencies:** Phase 1 complete (establishes context)
**Risk:** Low (content sources clear from org-health review)
**Blocker Potential:** Medium (needed for complete cross-linking)

---

### Phase 3: Cross-Linking & Integration (Week 5)
**Total Time:** 7 hours
**Key Deliverable:** Cohesive navigation between all documents

**Tasks:**
1. Add cross-links between main documents (3h)
2. Create navigation summary in each document (2h)
3. Update MkDocs navigation structure (2h)

**Dependencies:** Phases 1-2 complete (all content exists)
**Risk:** Low (straightforward integration work)
**Blocker Potential:** Low (doesn't block other work)

---

### Phase 4: Quality Assurance & Polish (Week 6)
**Total Time:** 18 hours
**Key Deliverable:** Publication-ready documentation

**Tasks:**
1. Tone consistency review (4h)
2. Content accuracy review (5h)
3. Completeness check (3h)
4. User journey testing (3h)
5. Final proofreading (3h)

**Dependencies:** Phases 1-3 complete (all content written and linked)
**Risk:** Low (quality checks, not new content)
**Blocker Potential:** Low (final polish before publication)

---

### Phase 5: Screenshot Planning (Week 7)
**Total Time:** 4 hours
**Key Deliverable:** Screenshot requirements ready for generation

**Tasks:**
1. Identify screenshot locations (2h)
2. Create screenshot generation plan (2h)

**Dependencies:** Phase 4 complete (content finalized)
**Risk:** Low (planning only, not execution)
**Blocker Potential:** None (screenshots are enhancement, not blocker)

---

## 6. Critical Path & Dependencies

### Critical Path (Minimum Viable Restructuring)

```
Task 1.1 (Philosophy)
    ↓
Task 1.2 (Getting Started Filtering)
    ↓
Task 1.3 (Best Practices Filtering)
    ↓
Task 1.4 (Merge Content)
    ↓
Task 1.5 (Tone Transformation)
    ↓
Task 4.1 (Tone Review)
    ↓
Task 4.2 (Accuracy Review)
    ↓
Publication
```

**Critical Path Duration:** 35 hours minimum
**Can be completed by:** 1 person in 1 week (if focused)

### Parallel Work Opportunities

**Week 1-2 (Phase 1):**
- Tasks 1.1, 1.2, 1.3 can be done sequentially (build on each other)
- Task 1.4 requires 1.3 complete
- Task 1.5 requires 1.1-1.4 complete

**Week 3-4 (Phase 2):**
- All appendix documents can be created in parallel (no dependencies between them)
- Task 2.6 (filtering-decision-tree.md) should follow Task 1.3 (filtering guidance)
- Tasks 2.1-2.5, 2.7 can proceed simultaneously

**Week 5 (Phase 3):**
- Tasks 3.1 and 3.2 sequential
- Task 3.3 after 3.1-3.2

**Week 6 (Phase 4):**
- Tasks 4.1-4.5 best done sequentially for thoroughness

**Week 7 (Phase 5):**
- Can be done anytime after Phase 4
- Not blocking for publication

---

## 7. Risk Assessment & Mitigation

### Risk 1: Scope Creep in Appendix Documents
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Strict line count targets for each appendix doc
- Focus on practical guidance over theory
- If content expands, create additional appendix docs rather than bloating existing ones

### Risk 2: Tone Transformation Too Informal
**Probability:** Low
**Impact:** Low
**Mitigation:**
- Follow voice-and-tone-guide.md standards
- Maintain professional vocabulary while being conversational
- Review tone against other successfully toned documents (filters.md, etc.)

### Risk 3: Cross-Link Maintenance Burden
**Probability:** Medium
**Impact:** Low
**Mitigation:**
- Use descriptive link text so links make sense even if targets move
- Document all cross-references in Task 3.1 for easy updating
- Test all links before publication (Task 4.3)

### Risk 4: Duplicate Content in Appendix vs. Main Docs
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Main docs provide overview + link to appendix for deep dive
- Appendix docs provide depth not found in main docs
- Review for duplication in Task 4.3

### Risk 5: User Confusion with New Structure
**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Clear navigation guidance at top of each document
- "Choose your path" sections for different user types
- Test user journeys in Task 4.4

---

## 8. Success Metrics

### Content Quality Metrics
- [ ] Zero instances of manager-by-manager as primary filtering approach
- [ ] Level-based filtering mentioned as primary in all three main docs
- [ ] All judgmental language replaced with collaborative language
- [ ] All paragraphs 2-3 sentences maximum
- [ ] Zero passive voice constructions in how-to sections
- [ ] 100% of key concepts have "why this matters" context

### Completeness Metrics
- [ ] All 18 scenarios from org-health review documented
- [ ] All 6 mindset shifts from org-health review included
- [ ] All 5 psychological safety tactics documented
- [ ] All missing content from initial review added
- [ ] Zero content duplication between documents

### Navigation Metrics
- [ ] New user can find philosophy → quick workflow → complete guide in <3 clicks
- [ ] Facilitator can find scenario scripts in <2 clicks from any main doc
- [ ] Every main doc links to at least 3 relevant appendix docs
- [ ] Zero broken internal links

### Tone Metrics
- [ ] 100% second person ("you") in instructions
- [ ] 100% active voice in how-to steps
- [ ] Zero instances of "utilize", "facilitate", "enable" (replace with plain language)
- [ ] All documents pass "read aloud" test (natural, conversational)

---

## 9. Rollout Plan

### Pre-Publication Checklist
- [ ] All Phase 1-4 tasks complete
- [ ] All cross-links tested
- [ ] All user journeys tested
- [ ] Tone review complete
- [ ] Accuracy review complete
- [ ] Proofreading complete
- [ ] MkDocs navigation updated
- [ ] Screenshot placeholders marked

### Publication
1. Merge all changes to documentation branch
2. Build MkDocs site locally and verify
3. Test all navigation flows
4. Deploy to documentation site
5. Update any external links pointing to old structure

### Post-Publication
1. Monitor for user feedback
2. Track which appendix docs are most accessed
3. Identify gaps based on usage patterns
4. Plan screenshot generation (Phase 5)

### Communication
- Announce restructuring to documentation users
- Highlight key changes (level-based filtering, philosophy section, appendix resources)
- Provide migration guide if URLs changed
- Solicit feedback on new structure

---

## 10. Appendix: Content Mapping Tables

### Table 1: Org-Health Review → Document Mapping

| Org-Health Review Content | Line Numbers | Target Document | Task |
|---------------------------|--------------|-----------------|------|
| Philosophy assessment | 19-91 | new-to-9box.md | 1.1 |
| Power dynamics | 26-42 | reference/power-dynamics-and-politics.md | 2.1 |
| Psychological safety | 45-91 | reference/psychological-safety.md | 2.2 |
| Scenarios (11 total) | 97-173 | reference/difficult-scenarios.md | 2.3 |
| Org health connection | 176-196 | new-to-9box.md | 1.1 |
| Making it human | 243-276 | new-to-9box.md, best-practices.md | 1.5 |
| Safety tactics | 277-301 | reference/psychological-safety.md | 2.2 |
| After calibration | 315-325 | reference/post-calibration-conversations.md | 2.4 |
| Multi-year patterns | 327-334 | reference/multi-year-tracking.md | 2.7 |
| Cultural calibration | 343-348 | reference/cultural-calibration.md | 2.5 |
| What I would add | 360-401 | reference/difficult-scenarios.md | 2.3 |

### Table 2: Initial Review → Document Mapping

| Initial Review Content | Line Numbers | Target Document | Task |
|------------------------|--------------|-----------------|------|
| Level-based methodology | 297-304 | getting-started.md, best-practices.md | 1.2, 1.3 |
| Filter decision tree | 647-678 | reference/filtering-decision-tree.md | 2.6 |
| Calibration philosophy | 421-499 | new-to-9box.md | 1.1 |
| Proposed filter sections | 1000-1127 | getting-started.md, best-practices.md | 1.2, 1.3 |
| Tone examples | 1593-1888 | All documents | 1.5, 4.1 |
| Language transformations | 207-214 | All documents | 1.5 |

### Table 3: Content to Remove/Replace

| Current Document | Lines to Remove | Reason | Replacement Task |
|------------------|----------------|--------|------------------|
| getting-started.md | 165-172 | Manager-by-manager filtering | 1.2 |
| getting-started.md | 133-175 | Wrong filtering guidance | 1.2 |
| best-practices.md | 210-260 | Manager filtering as equal option | 1.3 |
| best-practices.md | 264-294 | Judgmental statistics language | 1.5 |
| talent-calibration.md | Entire file | Merge into best-practices.md | 1.4 |

---

## 11. Quick Reference: What Changes Where

### new-to-9box.md Changes
**Action:** EXPAND
**New Content:** ~270 lines added
**Changes:**
- Add 4 new sections on calibration philosophy
- Enhance existing sections with mindset guidance
- Add cross-links to other docs
**Tone:** Warm, acknowledges difficulty, sets proper mindset

### getting-started.md Changes
**Action:** MAJOR REWRITE
**New Content:** Complete restructure, ~450 lines total
**Changes:**
- Remove manager filtering as primary approach
- Add level-based filtering guidance
- Correct Donut Mode timing
- Position Intelligence as final sweep
- Add session planning by org size
**Tone:** Practical, encouraging, direct

### best-practices.md Changes
**Action:** EXPAND & MERGE
**New Content:** ~400 lines added (total ~1200 lines)
**Changes:**
- Merge all content from talent-calibration.md
- Complete rewrite of filtering section with decision tree
- Add facilitation principles section
- Add handling disagreements section
- Reframe statistics language
- Add cross-links to all appendix docs
**Tone:** Experienced peer, practical wisdom

### talent-calibration.md Changes
**Action:** DELETE
**Reason:** Content merged into best-practices.md
**Migration:** All valuable content moved to best-practices.md

### 7 New Appendix Documents
**Action:** CREATE
**Purpose:** Deep dives on specific topics
**Content:** ~3150 total new lines
**Changes:** All new content, heavily sourced from org-health review

---

## 12. Timeline Summary

| Week | Phase | Hours | Key Deliverables |
|------|-------|-------|------------------|
| 1-2 | Phase 1 | 33 | Corrected filtering, philosophy added, content merged |
| 3-4 | Phase 2 | 41 | 7 appendix documents created |
| 5 | Phase 3 | 7 | Cross-linking complete, navigation cohesive |
| 6 | Phase 4 | 18 | Quality assured, publication ready |
| 7 | Phase 5 | 4 | Screenshot planning complete |
| **Total** | | **103 hours** | **Complete restructured documentation** |

**Effort:** ~2.5 weeks for 1 person working full-time, or 5-6 weeks at 20h/week

**Critical Path:** 35 hours minimum (Phase 1 + critical QA)

**Recommended:** Execute Phases 1-4 before publication, Phase 5 after

---

## Conclusion

This implementation plan provides a detailed roadmap for restructuring the calibration documentation. The dual-track WHY/HOW approach with reference appendix addresses all issues identified in the initial review and org-health review while maintaining accessibility and preventing overwhelm.

**Key Principles Maintained:**
- User-centric organization (philosophy before mechanics)
- Progressive disclosure (quick → complete → deep dives)
- Authentic tone (peer guidance, not corporate speak)
- Correct methodology (level-based filtering as primary)
- Organizational health focus (alignment, not gotcha)

**Ready to Begin:** Tasks are small (1-8 hours), well-defined, with clear acceptance criteria and dependencies mapped.
