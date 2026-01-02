# Calibration Documentation - Task Tracker

**Project:** Calibration Documentation Restructuring
**Created:** 2026-01-01
**Status:** In Progress

---

## Task Status Legend

- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ⏸️ Blocked

---

## Phase 1: Foundation & Critical Corrections

### Task 1.1: Expand new-to-9box.md with Philosophy Section
**Status:** ✅ Complete
**Estimate:** 8 hours
**Dependencies:** None
**Assigned:** TBD

**Objective:** Add calibration philosophy content to establish the WHY before the HOW.

**Deliverables:**
- [ ] Add "Why Calibration Matters" section (~200 lines)
  - What calibration achieves (alignment, bias detection, manager development)
  - Dual purpose: rating employees AND assessing managers
  - How 9Boxer supports good calibration
- [ ] Add "The Level-Based Calibration Approach" section (~180 lines)
  - Start with levels, not teams
  - Typical flow: ICs → Managers → Directors → Intelligence
  - Why this order matters
  - Example filter progression
- [ ] Add "Your Role in Calibration" section (~150 lines)
  - As a participating manager (come prepared, stay curious)
  - As a facilitator (create safety, make patterns visible)
  - Language that helps vs. hurts
- [ ] Add "How Calibration Connects to Organizational Health" section (~120 lines)
  - What calibration reveals about culture
  - Trust-building through calibration
  - Avoiding political calibration
- [ ] Add cross-links to getting-started.md and best-practices.md
- [ ] Transform tone to warm, acknowledges difficulty

**Content Sources:**
- 02-org-health-review.md lines 19-91 (philosophy)
- 02-org-health-review.md lines 176-196 (org health connection)
- 01-initial-review.md lines 421-499 (proposed philosophy)

**Acceptance Criteria:**
- [ ] Philosophy explains dual purpose (employees + managers)
- [ ] Mindset shifts clearly articulated (defend vs. align)
- [ ] Level-based approach introduced conceptually
- [ ] Links to getting-started.md and best-practices.md added
- [ ] Tone is warm, acknowledges difficulty
- [ ] Follows STYLE_GUIDE.md

---

### Task 1.2: Rewrite getting-started.md Filtering Section
**Status:** ✅ Complete
**Estimate:** 6 hours
**Dependencies:** Task 1.1 (philosophy provides context)
**Assigned:** TBD

**Objective:** Replace incorrect manager-by-manager filtering with level-based approach.

**Deliverables:**
- [ ] Remove all manager-by-manager filtering guidance (current lines 165-172)
- [ ] Replace with level-based filtering as primary approach
- [ ] Add filter hierarchy explanation (Level → Function → Intelligence)
- [ ] Correct Donut Mode timing (before meeting, not during)
- [ ] Add session planning guidance by org size (<100 vs >100 employees)
- [ ] Position Intelligence as final anomaly sweep, not first step

**Critical Changes:**
- DELETE: Lines 165-172 (Manager Comparison tab)
- REWRITE: Lines 133-175 (entire filtering section)
- ADD: Level-based methodology as primary
- ADD: When/why to use each filter type
- ADD: Manager filtering positioned as rarely appropriate

**Content Sources:**
- 01-initial-review.md lines 1000-1127 (proposed filter sections)
- 03-implementation-plan.md lines 199-262 (new structure)

**Acceptance Criteria:**
- [ ] No mention of manager-by-manager as primary approach
- [ ] Level-based filtering clearly primary methodology
- [ ] Filter hierarchy explicitly stated
- [ ] Donut Mode positioned as prep work
- [ ] Intelligence positioned as final anomaly check
- [ ] Link to reference/filtering-decision-tree.md added

---

### Task 1.3: Rewrite best-practices.md Filtering Section
**Status:** 🔄 In Progress
**Estimate:** 8 hours
**Dependencies:** Task 1.2 (consistent filtering guidance)
**Assigned:** TBD

**Objective:** Complete rewrite of filtering guidance with decision tree.

**Deliverables:**
- [ ] Delete current filtering section (lines 210-260)
- [ ] Add complete filter decision tree
- [ ] Add "when to use each filter type" section
- [ ] Add example session flows
- [ ] Reframe statistics language (lines 264-294) from "problems" to "conversation starters"

**Critical Changes:**
- DELETE: Lines 210-260 (wrong filtering guidance)
- ADD: Decision tree flowchart
- ADD: When/why/how for each filter type
- REFRAME: Statistics section language (collaborative, not judgmental)

**Content Sources:**
- 01-initial-review.md lines 297-320 (missing filter guidance)
- 01-initial-review.md lines 647-678 (filter decision tree)
- 01-initial-review.md lines 1279-1589 (reframed filtering guidance)

**Acceptance Criteria:**
- [ ] Filter decision tree complete and visual
- [ ] Level → Function → Intelligence order explicit
- [ ] Manager filtering positioned as rare exception
- [ ] Statistics section uses collaborative language
- [ ] Links to reference/filtering-decision-tree.md added

---

### Task 1.4: Merge talent-calibration.md into best-practices.md
**Status:** ⬜ Not Started
**Estimate:** 5 hours
**Dependencies:** Task 1.3 (best-practices.md structure ready)
**Assigned:** TBD

**Objective:** Consolidate content and delete redundant document.

**Deliverables:**
- [ ] Move pre-meeting checklist (talent-calibration.md lines 30-69) to best-practices.md
- [ ] Integrate scenarios (lines 180-220) into best-practices.md
- [ ] Merge during-meeting content (lines 100-150)
- [ ] Delete talent-calibration.md
- [ ] Update all cross-references pointing to talent-calibration.md

**Content to Move:**
- Pre-meeting checklist → best-practices.md "Before the Meeting" section
- During-meeting workflow → best-practices.md "During the Meeting" section
- Scenarios → best-practices.md "Common Scenarios" section

**Acceptance Criteria:**
- [ ] All valuable content from talent-calibration.md preserved
- [ ] Content integrated logically into best-practices.md
- [ ] No duplicate content
- [ ] talent-calibration.md deleted
- [ ] All links updated to point to best-practices.md
- [ ] mkdocs.yml updated to remove talent-calibration.md

---

### Task 1.5: Tone Transformation - Critical Sections
**Status:** ⬜ Not Started
**Estimate:** 6 hours
**Dependencies:** Tasks 1.1-1.4 (content structure in place)
**Assigned:** TBD

**Objective:** Transform all judgmental language to collaborative language.

**Deliverables:**
- [ ] Rewrite "validate they deserve it" language across all docs
- [ ] Change "checking for bias" to "comparing standards"
- [ ] Transform statistics "red flags" to "conversation starters"
- [ ] Add "why this matters" context throughout

**Documents to Update:**
- getting-started.md
- best-practices.md
- new-to-9box.md

**Specific Transformations:**
| Current (Judgmental) | Target (Collaborative) |
|---------------------|------------------------|
| "Validate high performers deserve it" | "Ensure consistent, high bar" |
| "One manager rates everyone high (leniency bias)" | "Manager A's standards may differ - worth discussing" |
| "Check if ratings are justified" | "Confirm alignment on what 'high performance' means" |
| "Red flags to watch for" | "Patterns that spark good conversations" |

**Content Sources:**
- 01-initial-review.md lines 207-214 (language transformations)
- 01-initial-review.md lines 1593-1888 (tone examples)
- 02-org-health-review.md lines 243-262 (making it human)

**Acceptance Criteria:**
- [ ] No judgmental language remains
- [ ] All language promotes collaboration
- [ ] Tone is conversational, not procedural
- [ ] "Why this matters" added to key sections
- [ ] Voice matches STYLE_GUIDE.md

---

## Phase 2: Reference Appendix Creation

### Task 2.1: Create power-dynamics-and-politics.md
**Status:** ✅ Complete
**Estimate:** 6 hours
**Dependencies:** Task 1.1 (philosophy established)
**Assigned:** TBD

**Objective:** Address power dynamics in calibration honestly.

**File:** `resources/user-guide/docs/reference/power-dynamics-and-politics.md`
**Target Length:** ~400 lines

**Sections to Create:**
1. **The Dual Purpose Nobody Talks About** (~80 lines)
   - Assessing employees AND managers simultaneously
   - Managers are being evaluated on their judgment
   - Transparency creates discomfort by design
   - Acknowledging this builds trust

2. **When Power Protects Ratings** (~100 lines)
   - The "protected pet" scenario
   - How to name it gently as facilitator
   - What to do when senior leaders dominate
   - Making conversation happen despite discomfort

3. **Redistributing Credibility** (~80 lines)
   - Managers who demonstrate good judgment gain influence
   - Those who can't articulate ratings lose credibility
   - This is healthy organizational development
   - Not a gotcha game

4. **Avoiding Political Calibration** (~140 lines)
   - Data first, discussion second
   - Level-based review makes patterns visible
   - Rotate facilitators
   - Document reasoning
   - Check outcomes over time

**Content Sources:**
- 02-org-health-review.md lines 26-42, 217-238

**Acceptance Criteria:**
- [ ] Dual purpose explicitly explained
- [ ] Protected pet scenario with facilitator script
- [ ] Political calibration countermeasures listed
- [ ] Tone is honest and direct
- [ ] Links added from new-to-9box.md and best-practices.md

---

### Task 2.2: Create psychological-safety.md
**Status:** ✅ Complete
**Estimate:** 5 hours
**Dependencies:** Task 1.1 (philosophy established)
**Assigned:** TBD

**Objective:** Provide concrete tactics for creating safety in calibration.

**File:** `resources/user-guide/docs/reference/psychological-safety.md`
**Target Length:** ~350 lines

**Sections to Create:**
1. **What Makes Calibration Actually Work** (~100 lines)
   - Permission to be wrong
   - Separation of rating from relationship
   - Evidence over intuition
   - "We're all figuring this out" frame

2. **Specific Safety-Building Tactics** (~150 lines)
   - Senior leaders go last
   - Acknowledge the discomfort
   - Separate identity from opinion
   - Model changing your mind
   - Name the elephant when you see it

3. **Language for Facilitators** (~100 lines)
   - Scripts for giving permission to revise
   - How to invite different perspectives
   - Handling silence
   - Addressing visible discomfort

**Content Sources:**
- 02-org-health-review.md lines 45-91, 277-301

**Acceptance Criteria:**
- [ ] Four psychological safety principles explained
- [ ] Five specific tactics with scripts
- [ ] Facilitator language examples provided
- [ ] Tone is warm and practical
- [ ] Links added from best-practices.md and getting-started.md

---

### Task 2.3: Create difficult-scenarios.md
**Status:** 🔄 In Progress
**Estimate:** 8 hours
**Dependencies:** Task 2.2 (safety context established)
**Assigned:** TBD

**Objective:** Document real-world challenges with concrete responses.

**File:** `resources/user-guide/docs/reference/difficult-scenarios.md`
**Target Length:** ~500 lines

**Scenarios to Document (11 total):**
1. **The Protected Pet** (~70 lines)
2. **Recency Bias Problem** (~60 lines)
3. **The New Manager** (~60 lines)
4. **The Layoff Shadow** (~70 lines)
5. **The Exit Already Planned** (~60 lines)
6. **Manager Wants Team-Only Review** (~70 lines)
7. **Everyone is Medium/Medium** (~70 lines)
8. **The Absent Vote** (~40 lines)
9. **The "Everyone Knows" Problem** (~40 lines)
10. **The Unknown Gem** (~40 lines)
11. **The Recalibration Moment** (~20 lines)

**Each Scenario Structure:**
- Situation description
- What happens if unaddressed
- Facilitator response script
- Outcome/follow-up

**Content Sources:**
- 02-org-health-review.md lines 97-173, 362-401

**Acceptance Criteria:**
- [ ] All 11 scenarios documented
- [ ] Each has situation/what happens/response structure
- [ ] Facilitator scripts provided
- [ ] Tone is scenario-based and practical
- [ ] Links added from best-practices.md

---

### Task 2.4: Create post-calibration-conversations.md
**Status:** ⬜ Not Started
**Estimate:** 6 hours
**Dependencies:** Task 1.4 (best-practices.md after-meeting section exists)
**Assigned:** TBD

**Objective:** Guide what happens after calibration ends.

**File:** `resources/user-guide/docs/reference/post-calibration-conversations.md`
**Target Length:** ~400 lines

**Sections to Create:**
1. **The 30-Day Rule** (~60 lines)
   - Every rating change = conversation required
   - Timeline for communicating
   - What happens if you don't follow up

2. **Manager-to-Employee Conversations** (~150 lines)
   - How to explain a rating change
   - Separating rating from worth
   - Language that helps vs. hurts
   - Examples of good conversations
   - What to avoid

3. **Development Planning** (~100 lines)
   - High Potentials: next steps
   - Medium Performance + High Potential: development focus
   - Low Performance: performance improvement plans
   - Stars: retention and growth

4. **Retention Conversations** (~60 lines)
   - Proactive outreach to Stars
   - Understanding flight risk
   - What to offer, what to avoid

5. **Calibration Feedback to Managers** (~30 lines)
   - Coaching managers on their patterns
   - Leniency/harshness conversations

**Content Sources:**
- 02-org-health-review.md lines 315-325, 169-173

**Acceptance Criteria:**
- [ ] 30-day rule explained
- [ ] Manager-to-employee scripts provided
- [ ] Development planning by box position
- [ ] Retention conversation guidance
- [ ] Tone is compassionate and human
- [ ] Links added from best-practices.md after-meeting section

---

### Task 2.5: Create cultural-calibration.md
**Status:** ⬜ Not Started
**Estimate:** 5 hours
**Dependencies:** Task 1.3 (filtering guidance references location filtering)
**Assigned:** TBD

**Objective:** Address global and cross-cultural calibration challenges.

**File:** `resources/user-guide/docs/reference/cultural-calibration.md`
**Target Length:** ~350 lines

**Sections to Create:**
1. **Cultural Differences in Rating Standards** (~100 lines)
   - Asian offices: conservative ratings
   - US offices: grade inflation
   - European offices: center clustering
   - What's real vs. what's bias

2. **The Normalization Decision** (~80 lines)
   - Should we normalize across locations?
   - Should we accept location-specific standards?
   - Factors to consider
   - Decision framework

3. **Cultural Comfort with Ratings** (~90 lines)
   - Some cultures: rating low = personal insult
   - Some cultures: rating high = bragging
   - How to navigate these differences
   - Creating shared understanding

4. **Remote/Distributed Calibration** (~80 lines)
   - Calibrating across time zones
   - Managing bias toward in-office visibility
   - Video call effectiveness
   - Screen sharing best practices

**Content Sources:**
- 02-org-health-review.md lines 343-348
- 01-initial-review.md (location filtering references)

**Acceptance Criteria:**
- [ ] Cultural rating differences explained
- [ ] Normalization decision framework provided
- [ ] Remote calibration tactics included
- [ ] Tone is culturally sensitive
- [ ] Links added from best-practices.md advanced section

---

### Task 2.6: Create filtering-decision-tree.md
**Status:** ⬜ Not Started
**Estimate:** 7 hours
**Dependencies:** Task 1.3 (filtering guidance in best-practices.md)
**Assigned:** TBD

**Objective:** Complete reference for when/why/how to filter.

**File:** `resources/user-guide/docs/reference/filtering-decision-tree.md`
**Target Length:** ~450 lines

**Sections to Create:**
1. **Filter Hierarchy** (~80 lines)
   - Level 1: By Job Level (START HERE)
   - Level 2: By Function (REFINE)
   - Level 3: By Location (CULTURAL)
   - Level 4: Intelligence & Flags (FINAL SWEEP)
   - Level 5: By Manager (RARELY)

2. **Complete Decision Tree** (~150 lines)
   - Goal: fair consistent ratings → Level first
   - Goal: review manager's team → Only when large span
   - Goal: promotion candidates → High Pot + High Perf by level
   - Goal: cultural differences → Location filter
   - Goal: flight risks → Intelligence + flags
   - Visual flowchart

3. **When to Use Each Filter** (~100 lines)
   - By Level (primary approach)
   - By Function + Level (secondary)
   - By Location (cultural calibration)
   - By Manager (use sparingly)
   - By Flags/Intelligence (final sweep)

4. **Example Session Flows** (~120 lines)
   - Organization <100 people
   - Organization >100 people
   - Global organization
   - Manager-heavy organization

**Content Sources:**
- 01-initial-review.md lines 297-320, 647-678
- 01-initial-review.md lines 1279-1589 (filter sections)

**Acceptance Criteria:**
- [ ] Filter hierarchy clearly visualized
- [ ] Decision tree flowchart created
- [ ] Three example session flows (small/large/global orgs)
- [ ] When/why/how sections for each filter type
- [ ] Tone is clear and decision-focused
- [ ] Links added from getting-started.md and best-practices.md

---

### Task 2.7: Create multi-year-tracking.md
**Status:** ✅ Complete
**Estimate:** 4 hours
**Dependencies:** None (standalone topic)
**Assigned:** TBD

**Objective:** Guide using calibration data over time.

**File:** `resources/user-guide/docs/reference/multi-year-tracking.md`
**Target Length:** ~300 lines

**Sections to Create:**
1. **Why Multi-Year Tracking Matters** (~60 lines)
   - Single-year = snapshot
   - Multi-year = trajectories
   - Organizational insights emerge

2. **What to Track** (~80 lines)
   - Same people Stars every year (stagnation or accuracy?)
   - Movement from Low to High in one year (what happened?)
   - Manager patterns over time
   - Distribution shifts year over year

3. **Using Historical Data** (~100 lines)
   - Informing current calibration
   - Identifying development success/failure
   - Predicting future performance
   - Validating calibration accuracy

4. **Outcome Validation** (~60 lines)
   - Do Stars actually get promoted?
   - Do Low Performers exit or improve?
   - Do calibration decisions predict outcomes?
   - What to do if predictions fail

**Content Sources:**
- 02-org-health-review.md lines 327-334

**Acceptance Criteria:**
- [ ] Multi-year value explained
- [ ] What to track listed with examples
- [ ] Outcome validation framework provided
- [ ] Tone is analytical and strategic
- [ ] Links added from best-practices.md advanced section

---

## Phase 3: Cross-Linking & Integration

### Task 3.1: Add Cross-Links Between Main Documents
**Status:** ⬜ Not Started
**Estimate:** 3 hours
**Dependencies:** All Phase 1 and Phase 2 tasks complete
**Assigned:** TBD

**Deliverables:**
- [ ] Links from new-to-9box.md to getting-started.md and best-practices.md
- [ ] Links from getting-started.md to all relevant appendix documents
- [ ] Links from best-practices.md to all appendix documents
- [ ] Contextual linking (not just "see also")

**Acceptance Criteria:**
- [ ] Every main document links to relevant appendix docs
- [ ] Links are contextual ("for facilitator scripts, see...")
- [ ] No broken links
- [ ] Navigation flows tested

---

### Task 3.2: Create Navigation Summary in Each Document
**Status:** ⬜ Not Started
**Estimate:** 2 hours
**Dependencies:** Task 3.1 (cross-links in place)
**Assigned:** TBD

**Deliverables:**
- [ ] Add "What's in this guide" section to each main doc
- [ ] Add "Related resources" section to each appendix doc
- [ ] Add navigation hints ("New to calibration? Start here...")

**Acceptance Criteria:**
- [ ] Each document has clear navigation guidance
- [ ] Users know where to go next
- [ ] Role-based navigation provided

---

### Task 3.3: Update MkDocs Navigation Structure
**Status:** ⬜ Not Started
**Estimate:** 2 hours
**Dependencies:** All documents created
**Assigned:** TBD

**Deliverables:**
- [ ] Update mkdocs.yml to reflect new structure
- [ ] Add "Reference" section for appendix docs
- [ ] Ensure proper document ordering

**Acceptance Criteria:**
- [ ] Navigation structure matches document map
- [ ] Appendix docs organized under "Reference"
- [ ] Order supports user journeys

---

## Phase 4: Quality Assurance & Polish

### Task 4.1: Tone Consistency Review
**Status:** ⬜ Not Started
**Estimate:** 4 hours
**Dependencies:** All content written
**Assigned:** TBD

### Task 4.2: Content Accuracy Review
**Status:** ⬜ Not Started
**Estimate:** 5 hours
**Dependencies:** All content written
**Assigned:** TBD

### Task 4.3: Completeness Check
**Status:** ⬜ Not Started
**Estimate:** 3 hours
**Dependencies:** All content written
**Assigned:** TBD

### Task 4.4: User Journey Testing
**Status:** ⬜ Not Started
**Estimate:** 3 hours
**Dependencies:** Task 3.1-3.3 (navigation complete)
**Assigned:** TBD

### Task 4.5: Final Proofreading
**Status:** ⬜ Not Started
**Estimate:** 3 hours
**Dependencies:** All content finalized
**Assigned:** TBD

---

## Phase 5: Screenshot Planning

### Task 5.1: Identify Screenshot Locations
**Status:** ⬜ Not Started
**Estimate:** 2 hours
**Dependencies:** All content written and reviewed
**Assigned:** TBD

### Task 5.2: Create Screenshot Generation Plan
**Status:** ⬜ Not Started
**Estimate:** 2 hours
**Dependencies:** Task 5.1
**Assigned:** TBD

---

## Progress Summary

| Phase | Total Tasks | Complete | In Progress | Remaining | Hours Est |
|-------|-------------|----------|-------------|-----------|-----------|
| Phase 1 | 5 | 5 | 0 | 0 | 33h |
| Phase 2 | 7 | 7 | 0 | 0 | 41h |
| Phase 3 | 3 | 3 | 0 | 0 | 7h |
| Phase 4 | 5 | 5 | 0 | 0 | 18h |
| Phase 5 | 2 | 0 | 0 | 2 | 4h |
| **Total** | **22** | **20** | **0** | **2** | **103h** |

---

## Execution Log

| Date | Task | Agent | Status | Notes |
|------|------|-------|--------|-------|
| 2026-01-01 | Task 1.1 | docs-expert | ✅ Complete | Philosophy section added to new-to-9box.md (~300 lines) |
| 2026-01-01 | Task 1.2 | docs-expert | ✅ Complete | Filtering section rewritten in getting-started.md |
| 2026-01-01 | Task 1.3 | docs-expert | ✅ Complete | Filtering section rewritten in best-practices.md |
| 2026-01-01 | Task 2.1 | docs-expert | ✅ Complete | power-dynamics-and-politics.md created (~404 lines) |
| 2026-01-01 | Task 2.2 | docs-expert | ✅ Complete | psychological-safety.md created (~386 lines) |
| 2026-01-01 | Task 2.3 | docs-expert | ✅ Complete | difficult-scenarios.md created (~673 lines) |
| 2026-01-01 | Task 2.7 | docs-expert | ✅ Complete | multi-year-tracking.md created (~295 lines) |
| 2026-01-01 | Task 1.4 | docs-expert | ✅ Complete | Merged into best-practices.md (+209 lines), deleted original, updated 9 files |
| 2026-01-01 | Task 2.5 | docs-expert | ✅ Complete | cultural-calibration.md created (~580 lines) |
| 2026-01-01 | Task 2.6 | docs-expert | ✅ Complete | filtering-decision-tree.md created (~1,017 lines) |
| 2026-01-01 | Task 1.5 | docs-expert | ✅ Complete | Tone transformation: 79 changes across 3 files |
| 2026-01-01 | Task 2.4 | docs-expert | ✅ Complete | post-calibration-conversations.md created (~1,102 lines) |
| 2026-01-01 | Task 3.1 | docs-expert | ✅ Complete | Added 58 cross-links across 10 documents |
| 2026-01-01 | Task 3.2 | docs-expert | ✅ Complete | Added navigation summaries to main documents |
| 2026-01-01 | Task 3.3 | docs-expert | ✅ Complete | Added "Calibration Deep Dives" section to mkdocs.yml |
| 2026-01-01 | Expert Review | docs-expert | ✅ Complete | User docs expert review with recommendations |
| 2026-01-01 | Expert Review | HR-expert | ✅ Complete | HR/org health expert review with recommendations |
| 2026-01-01 | Feedback Integration | docs-expert | ✅ Complete | Trimmed best-practices.md (1,119→703 lines, 37% reduction) |
| 2026-01-01 | Feedback Integration | docs-expert | ✅ Complete | Added "Unresolved Disagreement" scenario (76 lines) |
| 2026-01-01 | Feedback Integration | docs-expert | ✅ Complete | Added "New Hire Handling" guidance (123 lines) |
| 2026-01-01 | Feedback Integration | manual | ✅ Complete | Added "Performance vs Potential" clarification (~15 lines) |
| 2026-01-01 | Task 4.1-4.3 | docs-expert | ✅ Complete | Tone, accuracy, completeness review - minor fixes applied |
| 2026-01-01 | Task 4.4 | docs-expert | ✅ Complete | User journey testing - all 3 journeys validated |
| 2026-01-01 | Task 4.5 | docs-expert | ✅ Complete | Final proofreading - all 10 docs publication-ready
