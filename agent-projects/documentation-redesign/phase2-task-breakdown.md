# Phase 2: Task-Based Guides - Task Breakdown

**Timeline:** Weeks 3-4
**Goal:** Help users accomplish real-world goals with workflow guides
**Estimated Effort:** 25-35 hours

---

## Agent Instructions: Documentation Guidelines

All agents working on Phase 2 tasks MUST follow the same guidelines established in Phase 1:

### Voice & Tone Standards

**DO:**
- ✅ Use "you" and "your" (second person, direct address)
- ✅ Use contractions ("you'll" not "you will")
- ✅ Use active voice ("Click Upload" not "Upload should be clicked")
- ✅ Keep paragraphs short (2-3 sentences max)
- ✅ Use bulleted lists for scannable content
- ✅ Be encouraging and friendly ("Great! You've completed...")
- ✅ Use simple words ("use" not "utilize", "help" not "facilitate")

**DON'T:**
- ❌ Use jargon without explanation
- ❌ Be condescending ("simply", "just", "obviously")
- ❌ Be vague ("several" → specify the number)
- ❌ Write walls of text (break into chunks)
- ❌ Use passive voice
- ❌ Use filler words ("basically", "actually")

### Content Structure

Every guide page must include:
1. **Time estimate** (e.g., "⏱️ Time: 30 minutes")
2. **Learning objectives** (e.g., "What you'll accomplish:")
3. **Prerequisites** (if any)
4. **Numbered steps** with clear actions
5. **Success indicators** (e.g., "✅ Success! You should see...")
6. **What's next** (logical progression)

### Screenshot Requirements

When identifying screenshot needs:
- Specify exact UI state to capture
- Note required annotations (red boxes, arrows, callouts)
- Provide descriptive alt text
- Reference screenshot-specifications.md for standards

### Validation Requirements

**CRITICAL:** All documentation must be validated against the actual application:
- Verify UI elements exist and are labeled correctly
- Check data-testid attributes match (use Playwright to inspect)
- Test actual workflows to ensure steps work
- Validate that success indicators accurately reflect app behavior

---

## Task 2.0: Fix Phase 1 Issues (from FIX-CHECKLIST.md)

**Agent:** general-purpose
**Priority:** ⭐ CRITICAL (must complete before other Phase 2 tasks)
**Time:** 1-2 hours
**Dependencies:** None

### Objective
Fix the 3 important issues identified in the Phase 1 comprehensive review to ensure production-ready documentation.

### Requirements

**Issues to Fix:**

1. **Export Terminology Mismatch**
   - **Issue:** Documentation says "Apply button" but UI shows "File menu → Apply X Changes to Excel"
   - **Files to update:**
     - docs/getting-started.md
     - Search for all instances of "Apply button" or "Export button"
   - **Fix:** Update to accurately reflect the File menu workflow
   - **Verification:** Check against actual UI in running app

2. **Anchor Link: Skip to Step 2**
   - **Issue:** Link in getting-started.md doesn't jump correctly
   - **File:** docs/getting-started.md
   - **Fix:** Correct anchor name to match actual heading ID
   - **Verification:** Test link in rendered MkDocs

3. **Common Tasks Link**
   - **Issue:** index.md links to non-existent anchor
   - **File:** docs/index.md
   - **Fix:** Remove link or create proper section/anchor
   - **Verification:** Ensure no broken links remain

### Validation Steps

1. **Start servers and test workflows:**
   ```bash
   # Backend
   cd backend && ../.venv/Scripts/python.exe -m uvicorn ninebox.main:app --reload

   # Frontend (separate terminal)
   cd frontend && npm run dev
   ```

2. **Verify each fix:**
   - Test export workflow follows File menu path
   - Click anchor links in getting-started.md
   - Click all links in index.md

3. **Build and check:**
   ```bash
   mkdocs build --strict
   ```

### Deliverables

1. **Fixed files:**
   - docs/getting-started.md
   - docs/index.md

2. **Validation report:**
   - Create `agent-projects/documentation-redesign/phase1-fixes-validation.md`
   - Document each fix made
   - Confirm all links work
   - Confirm workflows match actual UI

### Success Criteria

- ✅ All 3 issues fixed
- ✅ No broken links remain
- ✅ Terminology matches actual UI
- ✅ MkDocs builds with --strict (no warnings)
- ✅ Workflows validated against running app

---

## Task 2.1: Create "Preparing for Talent Calibration" Workflow

**Agent:** general-purpose
**Priority:** ⭐ HIGHEST
**Time:** 8 hours
**Dependencies:** Task 2.0 (fixes complete)

### Objective
Create a comprehensive workflow guide for preparing, conducting, and following up on talent calibration meetings.

### Requirements

1. **Structure the guide in 3 main sections:**
   - **Before the Meeting** (30 minutes of prep work)
   - **During the Meeting** (60-90 minutes)
   - **After the Meeting** (10 minutes of follow-up)

2. **Use draft as starting point:**
   - Reference: `agent-projects/documentation-redesign/documentation-standards-and-assessment.md`
   - Section: "NEW: Task-Based Guide Example - Preparing for a Talent Calibration Meeting"
   - Adapt to actual app workflows

3. **Cover these key workflows:**
   - Uploading current ratings
   - Reviewing distribution for red flags
   - Using Intelligence tab to spot anomalies
   - Using Donut Mode to validate center box
   - Conducting the meeting (screen sharing workflow)
   - Real-time changes and note-taking
   - Exporting final results

4. **Validate with Playwright:**
   - Test each workflow step
   - Verify Statistics tab shows expected data
   - Verify Intelligence tab anomaly detection works
   - Test Donut Mode workflow
   - Confirm export generates correct columns

5. **Identify screenshots needed:**
   - Statistics tab with red flags annotated
   - Intelligence tab showing anomalies
   - Filters panel with calibration-specific selections
   - Donut mode in action
   - Screen share view simulation
   - Before/after distribution comparison

### Deliverables

1. **New workflow guide:**
   - Location: `docs/workflows/talent-calibration.md`
   - Create workflows/ subdirectory if needed

2. **Screenshot specifications:**
   - Create `agent-projects/documentation-redesign/calibration-screenshots.md`
   - List 6-8 required screenshots with specs

3. **Validation report:**
   - Create `agent-projects/documentation-redesign/calibration-validation.md`
   - Document workflow testing
   - Confirm timing estimates

### Success Criteria

- ✅ Complete 3-section workflow guide created
- ✅ Real-world scenarios and use cases included
- ✅ All steps validated against running app
- ✅ Screenshots identified and specified
- ✅ Timing realistic (30 min prep, 60-90 min meeting)

---

## Task 2.2: Create "Making Your First Changes" Task Guide

**Agent:** general-purpose
**Priority:** HIGH
**Time:** 5 hours
**Dependencies:** Task 2.0

### Objective
Create a focused guide on why and how users change ratings, with common scenarios and best practices.

### Requirements

1. **Focus on WHY, not just HOW:**
   - Common reasons for rating changes
   - When to move someone vs. when not to
   - Impact of rating changes
   - Calibration considerations

2. **Include scenarios:**
   - Recent promotion or role change
   - Performance improvement/decline
   - Calibration adjustment
   - Initial error correction
   - New information received

3. **Cover mechanics:**
   - Drag-and-drop workflow (reference getting-started.md)
   - Reviewing timeline to see history
   - Understanding yellow highlight indicator
   - Undo/redo considerations

4. **Add decision framework:**
   - Checklist: "Should I move this person?"
   - Warning signs to watch for
   - When to get second opinions

5. **Validate workflows:**
   - Test drag-and-drop
   - Verify timeline updates correctly
   - Check yellow highlight appears
   - Confirm change tracking works

6. **Identify screenshots:**
   - Drag-and-drop in action (can reuse from getting-started)
   - Employee details before/after change
   - Timeline showing movement history
   - Yellow highlight indicator

### Deliverables

1. **New task guide:**
   - Location: `docs/tasks/making-changes.md`
   - Create tasks/ subdirectory if needed

2. **Screenshot specifications:**
   - Create `agent-projects/documentation-redesign/making-changes-screenshots.md`
   - List 4 required screenshots (may reuse existing)

3. **Validation report:**
   - Create `agent-projects/documentation-redesign/making-changes-validation.md`

### Success Criteria

- ✅ Guide focuses on decision-making, not just mechanics
- ✅ 5+ real-world scenarios included
- ✅ Decision framework/checklist provided
- ✅ All workflows validated
- ✅ Clear cross-references to related pages

---

## Task 2.3: Create "Adding Notes & Documentation" Task Guide

**Agent:** general-purpose
**Priority:** MEDIUM
**Time:** 4 hours
**Dependencies:** Task 2.0

### Objective
Create a guide focused on documenting decisions through the notes system.

### Requirements

1. **Explain WHY notes matter:**
   - Audit trail for HR compliance
   - Calibration meeting justifications
   - Future reference (6 months later)
   - Sharing context with stakeholders

2. **Show HOW to add notes:**
   - Opening Changes tab
   - Typing notes for specific employees
   - Auto-save behavior
   - Best practices for note-taking

3. **Provide note templates:**
   - Promotion: "Promoted to [role] in [quarter], [key achievements]"
   - Performance improvement: "Performance improved in [areas], [evidence]"
   - Calibration: "Calibrated with peers - [reasoning]"
   - Decline: "Performance declined due to [reasons], [support provided]"

4. **Show note examples:**
   - ✅ Good notes (specific, objective, helpful)
   - ❌ Bad notes (vague, subjective, unhelpful)

5. **Cover export integration:**
   - How notes appear in Excel export
   - "9Boxer Change Notes" column
   - Sharing exported notes with others

6. **Validate workflows:**
   - Test Changes tab opens correctly
   - Verify notes save automatically
   - Test note export to Excel
   - Check column appears in export

7. **Identify screenshots:**
   - Changes tab with note field
   - Good note example
   - Exported Excel showing notes column

### Deliverables

1. **New task guide:**
   - Location: `docs/tasks/adding-notes.md`

2. **Screenshot specifications:**
   - Create `agent-projects/documentation-redesign/adding-notes-screenshots.md`
   - List 3 required screenshots

3. **Note templates document:**
   - Include in the guide or as sidebar
   - 5-10 common scenarios with templates

4. **Validation report:**
   - Create `agent-projects/documentation-redesign/adding-notes-validation.md`

### Success Criteria

- ✅ Clear explanation of why notes matter
- ✅ 5+ note templates provided
- ✅ Good vs. bad examples shown
- ✅ Export integration explained
- ✅ All workflows validated

---

## Task 2.4: Add "When to Use This" Sections to Feature Pages

**Agent:** general-purpose
**Priority:** MEDIUM
**Time:** 6 hours
**Dependencies:** Task 2.0

### Objective
Enhance existing feature pages with contextual "When to Use This" sections and real-world use cases.

### Requirements

1. **Pages to update:**
   - docs/filters.md
   - docs/donut-mode.md
   - docs/statistics.md
   - docs/working-with-employees.md
   - docs/tracking-changes.md
   - docs/understanding-grid.md

2. **Add to each page:**

   **A. "When to Use This" section (at top):**
   ```markdown
   ## When to Use [Feature]

   Use [feature] when you need to:
   - Scenario 1 (specific use case)
   - Scenario 2 (specific use case)
   - Scenario 3 (specific use case)

   **Common situations:**
   - Preparing for calibration meetings
   - Reviewing specific departments
   - Identifying high-performers for succession planning
   ```

   **B. Real-world use case examples:**
   - 3-5 specific scenarios per feature
   - Use tabbed format for multiple scenarios
   - Include "before" and "after" states

   **C. "Related Workflows" section (at bottom):**
   - Link to task-based guides
   - Link to related features
   - Link to best practices

3. **Specific additions per page:**

   **filters.md:**
   - When: Large datasets, calibration meetings, focusing on specific teams
   - Use cases: Review by department, review by job level, identify all high performers
   - Related: Calibration workflow, statistics

   **donut-mode.md:**
   - When: Validating center box, before calibration, quality checking ratings
   - Use cases: Finding hidden stars, identifying mis-placements, calibration prep
   - Related: Calibration workflow, understanding-grid

   **statistics.md:**
   - When: Checking distribution health, identifying bias, preparing reports
   - Use cases: Quarterly reviews, calibration prep, stakeholder presentations
   - Related: Intelligence tab, calibration workflow

   **working-with-employees.md:**
   - When: Reviewing individual performance, making rating changes, checking history
   - Use cases: One-on-one reviews, timeline analysis, detail verification
   - Related: Making changes guide, tracking changes

   **tracking-changes.md:**
   - When: Documenting decisions, creating audit trail, preparing for meetings
   - Use cases: Note-taking during calibration, compliance documentation
   - Related: Adding notes guide, exporting

   **understanding-grid.md:**
   - When: First-time users, explaining to stakeholders, training others
   - Use cases: Learning 9-box methodology, interpreting distributions
   - Related: Getting started, statistics

4. **Validate consistency:**
   - Ensure tone matches Phase 1 guidelines
   - Verify cross-references work
   - Check all links resolve

### Deliverables

1. **Updated feature pages:**
   - docs/filters.md
   - docs/donut-mode.md
   - docs/statistics.md
   - docs/working-with-employees.md
   - docs/tracking-changes.md
   - docs/understanding-grid.md

2. **Content audit report:**
   - Create `agent-projects/documentation-redesign/feature-pages-update-report.md`
   - Document changes made to each page
   - List cross-references added
   - Note any issues found

3. **Link validation:**
   - Verify all new cross-references work
   - Check "Related Workflows" links

### Success Criteria

- ✅ All 6 pages updated with "When to Use" sections
- ✅ 3-5 use cases per feature
- ✅ Cross-references to task guides added
- ✅ Tone consistent with Phase 1
- ✅ All links validated

---

## Task 2.5: Create Decision Trees & Comparison Tables

**Agent:** general-purpose
**Priority:** MEDIUM
**Time:** 4 hours
**Dependencies:** Tasks 2.1-2.4 (need content to reference)

### Objective
Create visual decision trees and comparison tables to help users choose between features and workflows.

### Requirements

1. **Create "Feature Selection Guide":**
   - Location: `docs/guides/feature-guide.md`
   - Decision tree: "Which feature should I use?"
   - Comparison tables: Feature vs. Feature

2. **Decision tree structure:**
   ```
   START: What do you need to do?

   ├─ Focus on specific group
   │  ├─ By department/manager? → Filters
   │  ├─ By performance level? → Filters
   │  └─ Temporarily hide some? → Exclusions
   │
   ├─ Validate ratings
   │  ├─ Check center box? → Donut Mode
   │  ├─ Check distribution? → Statistics
   │  └─ Find anomalies? → Intelligence
   │
   ├─ Make changes
   │  ├─ Move employees? → Drag-and-drop
   │  ├─ Document why? → Notes/Changes tab
   │  └─ Save work? → Export/Apply
   │
   └─ Prepare for meeting
      ├─ Calibration session? → Calibration workflow
      ├─ Performance review? → Making changes guide
      └─ Succession planning? → Filters + Statistics
   ```

3. **Comparison tables to create:**

   **A. Filters vs. Exclusions vs. Donut Mode:**
   ```markdown
   | Feature | Purpose | When to Use | Reversible? |
   |---------|---------|-------------|-------------|
   | Filters | Focus view | Review specific groups | Yes, toggle on/off |
   | Exclusions | Hide specific people | Remove from calibration | Yes, uncheck |
   | Donut Mode | Validate ratings | Quality check center box | Yes, toggle mode |
   ```

   **B. Regular Changes vs. Donut Changes:**
   ```markdown
   | Aspect | Regular Changes | Donut Changes |
   |--------|----------------|---------------|
   | Purpose | Update actual ratings | Explore "what-if" |
   | Data impact | Changes ratings | No impact on ratings |
   | Export | Updates Performance/Potential | Separate columns |
   ```

   **C. When to Use Which View:**
   ```markdown
   | Goal | Best Feature | Why |
   |------|-------------|-----|
   | Review one department | Filters | Focus on specific org unit |
   | Identify all stars | Filters (Performance: High) | Quick filtering |
   | Validate center box | Donut Mode | Dedicated validation tool |
   | Check for rating bias | Intelligence | Statistical analysis |
   ```

4. **Create visual flowchart:**
   - Use Mermaid diagrams (supported by MkDocs)
   - Show common user journeys
   - Link to relevant guides

5. **Add to navigation:**
   - Update mkdocs.yml to include guides/feature-guide.md
   - Link from index.md under "Need specific help?"

### Deliverables

1. **Feature selection guide:**
   - Location: `docs/guides/feature-guide.md`
   - Decision tree with clear paths
   - 3+ comparison tables
   - Mermaid flowchart

2. **Updated navigation:**
   - mkdocs.yml with guides/ section
   - index.md linking to guide

3. **Validation report:**
   - Create `agent-projects/documentation-redesign/decision-trees-validation.md`
   - Test all decision paths
   - Verify all links work

### Success Criteria

- ✅ Decision tree covers all major use cases
- ✅ 3+ comparison tables created
- ✅ Visual flowchart included
- ✅ Integrated into navigation
- ✅ All paths tested and validated

---

## Task 2.6: Complete Remaining Screenshots

**Agent:** general-purpose
**Priority:** MEDIUM
**Time:** 6-8 hours
**Dependencies:** Tasks 2.1-2.3 (need screenshot specs)

### Objective
Capture, annotate, and integrate remaining screenshots from Phase 1 and new screenshots from Phase 2 task guides.

### Requirements

1. **Complete Phase 1 screenshots (12 remaining):**

   **Recapture with fixes (9):**
   - quickstart-file-menu-button.png
   - workflow-statistics-tab.png
   - workflow-changes-tab.png
   - workflow-apply-button.png
   - workflow-drag-drop-sequence-1.png
   - workflow-drag-drop-sequence-3.png
   - workflow-employee-modified.png
   - workflow-employee-timeline.png
   - workflow-export-excel-1.png

   **Manual capture (2):**
   - quickstart-excel-sample.png (Excel file)
   - workflow-export-excel-2.png (Exported Excel)

   **Not yet captured (1):**
   - Any remaining from Phase 1 specs

2. **Capture Phase 2 screenshots:**
   - From calibration-screenshots.md (6-8 images)
   - From making-changes-screenshots.md (4 images, may reuse)
   - From adding-notes-screenshots.md (3 images)

3. **Annotation workflow:**
   - Capture base screenshots using extended tool
   - Follow annotation-requirements.md for manual annotation
   - Or enhance tool to add annotations programmatically
   - Use screenshot-specifications.md for standards

4. **Integration:**
   - Update markdown files with correct image paths
   - Add descriptive alt text
   - Verify images render in MkDocs
   - Optimize file sizes (<500KB per image)

5. **Tools and methods:**
   - Use `tools/generate_docs_screenshots.py` for automated capture
   - Use Snagit/Greenshot/GIMP for manual annotation
   - Use TinyPNG for optimization

### Deliverables

1. **All screenshots captured:**
   - Phase 1 remaining: 12 images
   - Phase 2 new: 10-15 images
   - Total: ~22-27 images

2. **All screenshots annotated:**
   - Follow screenshot-specifications.md standards
   - Red boxes, blue callouts, arrows, labels
   - Consistent styling throughout

3. **All screenshots integrated:**
   - Markdown files updated with image paths
   - Alt text added for accessibility
   - Verified rendering in MkDocs

4. **Screenshot completion report:**
   - Create `agent-projects/documentation-redesign/screenshots-phase2-completion.md`
   - List all screenshots with status
   - File sizes and optimization results
   - Rendering validation

### Success Criteria

- ✅ 100% of required screenshots captured
- ✅ 100% of screenshots annotated per standards
- ✅ All images integrated into documentation
- ✅ All images render correctly in MkDocs
- ✅ All file sizes optimized (<500KB)
- ✅ All alt text added for accessibility

---

## Task 2.7: Phase 2 Comprehensive Review

**Agent:** general-purpose
**Priority:** HIGH
**Time:** 6 hours
**Dependencies:** All Tasks 2.0-2.6

### Objective
Conduct thorough review of Phase 2 deliverables to ensure quality, consistency, and readiness for Phase 3.

### Requirements

1. **Review scope:**
   - All Phase 1 fixes (Task 2.0)
   - All new workflow/task guides (Tasks 2.1-2.3)
   - All updated feature pages (Task 2.4)
   - Decision trees and guides (Task 2.5)
   - All screenshots (Task 2.6)

2. **Review criteria:**

   **A. Voice & Tone Consistency:**
   - Check all new pages match Phase 1 guidelines
   - Verify second person, contractions, active voice
   - Ensure short paragraphs and scannable format
   - Confirm encouraging, friendly tone

   **B. Content Quality:**
   - Verify task guides are actionable and clear
   - Check workflows make sense and are complete
   - Ensure use cases are realistic and helpful
   - Confirm decision trees cover all scenarios

   **C. Technical Accuracy:**
   - Validate all workflows against running app
   - Test all links and cross-references
   - Verify screenshots match documented steps
   - Confirm MkDocs builds without errors

   **D. User Experience:**
   - Test navigation flow
   - Verify "What's Next" links are helpful
   - Check that guides answer real user questions
   - Ensure no gaps in coverage

3. **Testing procedures:**
   - Start servers and test each workflow
   - Follow each guide step-by-step
   - Click all links to verify they work
   - Build MkDocs with --strict flag

4. **Issues tracking:**
   - Categorize: Critical, Important, Minor, Enhancement
   - Create issues log with recommendations
   - Prioritize fixes needed before Phase 3

### Deliverables

1. **Comprehensive review document:**
   - Create `agent-projects/documentation-redesign/phase2-comprehensive-review.md`
   - Executive summary
   - Voice & tone analysis
   - Content quality assessment
   - Technical validation results
   - User experience evaluation
   - Issues log with priorities
   - Recommendations
   - Sign-off for Phase 3

2. **Phase 2 completion report:**
   - Create `agent-projects/documentation-redesign/PHASE2-COMPLETE.md`
   - Summary of all deliverables
   - Metrics and impact assessment
   - Known issues and next steps
   - Ready for Phase 3 decision

### Success Criteria

- ✅ All Phase 2 pages reviewed thoroughly
- ✅ Voice/tone consistency verified (>90%)
- ✅ All workflows validated against app
- ✅ All links and cross-references working
- ✅ MkDocs builds successfully
- ✅ Issues log created with priorities
- ✅ Recommendations for Phase 3
- ✅ Sign-off decision made (ready/needs-work)

---

## Parallel Execution Plan

These tasks can run in specific groups:

**Group 1 (Sequential - Must Complete First):**
- Task 2.0: Fix Phase 1 Issues (BLOCKING - must complete before all others)

**Group 2 (Parallel - After fixes):**
- Task 2.1: Calibration Workflow Guide
- Task 2.2: Making Changes Guide
- Task 2.3: Adding Notes Guide

**Group 3 (Parallel - After Group 2):**
- Task 2.4: Update Feature Pages
- Task 2.5: Decision Trees & Tables

**Group 4 (After Groups 2-3):**
- Task 2.6: Complete Screenshots (needs specs from 2.1-2.3)

**Group 5 (Final - After all):**
- Task 2.7: Phase 2 Review

**Execution Strategy:**
1. Complete Task 2.0 first (critical fixes)
2. Spawn Group 2 agents in parallel (3 agents)
3. Upon completion, spawn Group 3 in parallel (2 agents)
4. Upon completion, spawn Group 4 agent (1 agent)
5. Upon completion, spawn Group 5 agent (1 agent)

---

## Success Criteria for Phase 2

Phase 2 is complete when:

- ✅ All Phase 1 issues fixed
- ✅ 3 task-based workflow guides created and validated
- ✅ 6 feature pages updated with "When to Use" sections
- ✅ Decision trees and comparison tables created
- ✅ All remaining screenshots captured and annotated
- ✅ Comprehensive review completed
- ✅ All content follows voice/tone guidelines
- ✅ All workflows validated against actual app
- ✅ MkDocs builds without errors
- ✅ Ready for Phase 3 (polish & engagement)

---

## Notes for Agents

### Using Playwright for Validation

Same as Phase 1 - test all workflows against running app.

### Checking Actual App State

Same as Phase 1 - start servers and manually verify.

### Voice Example Transformations

Same standards as Phase 1 - conversational, active, friendly.

### Cross-References

Ensure all new guides link appropriately:
- Task guides ↔ Feature pages
- Workflows ↔ Best practices
- Decision trees ↔ All relevant content

---

*Task Breakdown v1.0 | Phase 2: Task-Based Guides | December 2024*
