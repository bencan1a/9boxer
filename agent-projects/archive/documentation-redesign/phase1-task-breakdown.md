# Phase 1: Critical Path - Task Breakdown

**Timeline:** Weeks 1-2
**Goal:** Get new users to success in <5 minutes
**Estimated Effort:** 30-40 hours

---

## Agent Instructions: Documentation Guidelines

All agents working on documentation tasks MUST follow these guidelines:

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

Every instructional page must include:
1. **Time estimate** (e.g., "⏱️ Time: 5 minutes")
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

## Task 1.1: Create Quickstart Page

**Agent:** general-purpose
**Priority:** ⭐ HIGHEST
**Time:** 6 hours
**Dependencies:** None

### Objective
Create a brand-new `docs/quickstart.md` that gets users to see their first grid in <2 actual minutes.

### Requirements

1. **Use provided draft** as starting point:
   - File: `agent-projects/documentation-redesign/quickstart-NEW.md`
   - Review and validate all steps against actual app

2. **Validate with Playwright:**
   - Start frontend dev server (http://localhost:5173)
   - Verify each step actually works in the app
   - Check data-testid attributes for accuracy
   - Test with actual sample file upload

3. **Identify 5 critical screenshots:**
   - Sample Excel file with columns highlighted
   - Upload button location (annotated with red box + "1")
   - Empty grid (before upload)
   - Populated grid (after upload, annotated)
   - Success state with checkmarks

   For each screenshot, specify:
   - Exact UI state
   - Required annotations (colors, callouts, labels)
   - Descriptive alt text

4. **Follow voice guidelines:**
   - Conversational, second person
   - Action-oriented ("Click Upload" not "The upload button should be clicked")
   - Encouraging tone

5. **Validate success criteria:**
   - Can a new user actually complete in <2 minutes?
   - Are all steps accurate?
   - Do success indicators match actual app behavior?

### Deliverable
- `docs/quickstart.md` - Production-ready page
- Screenshot specifications document listing 5 required images
- Validation report confirming all steps work

---

## Task 1.2: Revise Getting Started Page

**Agent:** general-purpose
**Priority:** ⭐ HIGH
**Time:** 8 hours
**Dependencies:** None

### Objective
Transform `docs/getting-started.md` from overwhelming 213-line guide to focused 10-minute workflow tutorial.

### Requirements

1. **Use provided draft** as starting point:
   - File: `agent-projects/documentation-redesign/getting-started-REVISED.md`
   - Adapt to actual app UI and workflows

2. **Remove/defer content:**
   - ❌ Remove installation instructions (move to separate install.md if needed)
   - ❌ Remove advanced features (filters, donut mode, themes)
   - ✅ Focus on core workflow: Upload → Review → Change → Document → Export

3. **Validate with Playwright:**
   - Test complete workflow end-to-end
   - Verify drag-and-drop mechanics
   - Check that timeline shows movements correctly
   - Confirm Changes tab accepts notes
   - Test Apply button export process

4. **Identify 8 workflow screenshots:**
   - Grid with axes labeled
   - Statistics tab showing distribution
   - Drag-drop sequence (3 panels: grab, drag, drop)
   - Yellow highlight on changed employee
   - Employee details with timeline
   - Changes tab with note field
   - Apply button with badge count
   - Exported Excel showing new columns

   For each, specify annotations needed.

5. **Add "What's Next" navigation:**
   - Link to task-based guides (calibration, etc.)
   - Link to feature references (filters, donut mode, stats)
   - Link to understanding-grid.md for methodology

### Deliverable
- `docs/getting-started.md` - Revised production page
- Screenshot specifications for 8 images
- Validation report

---

## Task 1.3: Revise Home Page

**Agent:** general-purpose
**Priority:** ⭐ HIGH
**Time:** 4 hours
**Dependencies:** Task 1.1 (needs quickstart.md link)

### Objective
Transform `docs/index.md` to prioritize quick start with clear user paths.

### Requirements

1. **Restructure content:**
   - Add hero section with CTA: "Get Started in 2 Minutes" → quickstart.md
   - Create "Choose Your Path" section:
     - "New to 9Boxer?" → quickstart.md
     - "Preparing for a meeting?" → (future) calibration workflow
     - "Need specific help?" → Task guides section
   - Move 9-box methodology deep-dive to understanding-grid.md
   - Streamline feature list (defer to features section)

2. **Validate links:**
   - Ensure all cross-references work
   - Check that quickstart.md exists before linking
   - Verify navigation paths make sense

3. **Identify 2 screenshots:**
   - Hero image: Grid with sample employees (welcoming, professional)
   - Quick win preview: "Your grid in 2 minutes" visual

4. **Follow voice guidelines:**
   - Friendly, inviting tone
   - Clear value proposition upfront
   - Reduce decision paralysis (fewer options initially)

### Deliverable
- `docs/index.md` - Revised home page
- Screenshot specifications for 2 images
- Link validation report

---

## Task 1.4: Update Navigation Structure

**Agent:** general-purpose
**Priority:** MEDIUM
**Time:** 3 hours
**Dependencies:** Tasks 1.1, 1.2, 1.3 (needs new pages to exist)

### Objective
Reorganize `mkdocs.yml` navigation to be user goal-oriented.

### Requirements

1. **Implement new structure:**
   ```yaml
   nav:
     - Home: index.md
     - Getting Started:
       - 2-Minute Quickstart: quickstart.md
       - Getting Started Guide: getting-started.md
     - Features & Tools:
       - The 9-Box Grid: understanding-grid.md
       - Filtering & Focus: filters.md
       - Donut Mode Validation: donut-mode.md
       - Statistics & Intelligence: statistics.md
       - Change Tracking: tracking-changes.md
       - Working with Employees: working-with-employees.md
       - Exporting Results: exporting.md
       - Settings: settings.md
     - Best Practices:
       - Tips & Best Practices: tips.md
     - Help:
       - Troubleshooting: troubleshooting.md
   ```

2. **Validate structure:**
   - Ensure all referenced files exist
   - Test navigation in MkDocs preview
   - Verify logical grouping makes sense

3. **Document changes:**
   - Note what was moved/reorganized
   - Explain rationale for groupings

### Deliverable
- Updated `mkdocs.yml`
- Navigation change log
- MkDocs build validation (no errors)

---

## Task 1.5: Capture Critical Screenshots

**Agent:** general-purpose
**Priority:** HIGH
**Time:** 6 hours
**Dependencies:** Tasks 1.1, 1.2, 1.3 (needs screenshot specs)

### Objective
Capture and annotate 8 critical screenshots identified in Tasks 1.1-1.3.

### Requirements

1. **Use existing screenshot tool:**
   - Script: `tools/generate_docs_screenshots.py`
   - Extend with new capture functions for each required screenshot
   - Follow screenshot-specifications.md for standards

2. **Capture methodology:**
   - Start backend and frontend servers
   - Upload sample data (use frontend/playwright/fixtures/sample-employees.xlsx)
   - Navigate to required UI states
   - Capture at 2x resolution (2400px width, 144 DPI)
   - Save as PNG with proper naming convention

3. **Annotation requirements:**
   - Use red highlight boxes (3px, #FF0000) for clickable elements
   - Use blue numbered callouts (40px circle, #1976D2) for sequences
   - Use arrows (4px, red) for direction/pointing
   - Add text labels (16px Roboto, white on 60% black)
   - Follow exact specs in screenshot-specifications.md

4. **Required screenshots (from Tasks 1.1-1.3):**
   - quickstart-excel-sample.png
   - quickstart-upload-button.png
   - quickstart-grid-before.png
   - quickstart-grid-populated.png
   - quickstart-success-annotated.png
   - workflow-grid-axes-labeled.png
   - workflow-drag-drop-sequence.png
   - workflow-apply-button.png

5. **Quality standards:**
   - Descriptive alt text for each image
   - Optimized file size (<500KB per image)
   - Proper file naming: [page]-[feature]-[state]-[number].png
   - Stored in docs/images/screenshots/

### Deliverable
- 8 annotated screenshots in docs/images/screenshots/
- Screenshot manifest with alt text
- Validation that images render in MkDocs

---

## Task 1.6: User Testing & Validation

**Agent:** general-purpose
**Priority:** MEDIUM
**Time:** 3 hours
**Dependencies:** All above tasks

### Objective
Validate that new documentation achieves <5 minute time-to-first-success.

### Requirements

1. **Prepare test environment:**
   - Build MkDocs site with new content
   - Ensure all screenshots are in place
   - Start fresh 9Boxer instance

2. **Test scenarios:**
   - **Scenario 1:** Brand new user
     - Start at index.md
     - Click "Get Started in 2 Minutes"
     - Follow quickstart.md
     - Time from start to seeing populated grid
     - Goal: <5 minutes

   - **Scenario 2:** Returning user wants to make changes
     - Start at getting-started.md
     - Follow workflow tutorial
     - Time from start to exporting first change
     - Goal: <15 minutes

   - **Scenario 3:** Navigation clarity
     - Can users find specific topics?
     - Is "Choose Your Path" clear?
     - Are next steps obvious?

3. **Validation checklist:**
   - [ ] All links work (no 404s)
   - [ ] All screenshots render correctly
   - [ ] All code examples are accurate
   - [ ] All data-testid references are correct
   - [ ] All success indicators match actual app
   - [ ] Tone is consistent and engaging
   - [ ] Navigation is logical and clear

4. **Document findings:**
   - Time-to-success metrics
   - Any confusion points
   - Suggested improvements
   - Blockers or errors found

### Deliverable
- User testing report
- Metrics (time-to-success for each scenario)
- Issues log (if any)
- Recommendations for iteration

---

## Success Criteria for Phase 1

Phase 1 is complete when:

- ✅ New `quickstart.md` page exists and is validated
- ✅ Revised `getting-started.md` focuses on core workflow
- ✅ Revised `index.md` prioritizes quick start
- ✅ Navigation restructured and validated
- ✅ 8 critical screenshots captured and annotated
- ✅ User testing shows <5 min time-to-first-success
- ✅ All content follows voice/tone guidelines
- ✅ All steps validated against actual app
- ✅ MkDocs builds without errors

---

## Parallel Execution Plan

These tasks can run in parallel:

**Group 1 (Independent):**
- Task 1.1: Create Quickstart
- Task 1.2: Revise Getting Started

**Group 2 (Depends on Group 1):**
- Task 1.3: Revise Home Page (needs quickstart.md link)
- Task 1.4: Update Navigation (needs new pages)

**Group 3 (Depends on Groups 1-2):**
- Task 1.5: Capture Screenshots (needs screenshot specs from 1.1-1.3)

**Group 4 (Depends on all):**
- Task 1.6: User Testing (needs everything complete)

**Execution Strategy:**
- Spawn Group 1 agents in parallel (2 agents)
- Upon completion, spawn Group 2 agents in parallel (2 agents)
- Upon completion, spawn Group 3 agent (1 agent)
- Upon completion, spawn Group 4 agent (1 agent)

---

## Notes for Agents

### Using Playwright for Validation

```python
# Example validation script
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto('http://localhost:5173')

    # Verify upload button exists
    upload_button = page.locator('[data-testid="upload-button"]')
    assert upload_button.is_visible()

    # Click and verify dialog appears
    upload_button.click()
    dialog = page.locator('[data-testid="file-upload-dialog"]')
    assert dialog.is_visible()

    browser.close()
```

### Checking Actual App State

Before documenting a feature:
1. Start backend: `cd backend && .venv/Scripts/python.exe -m uvicorn ninebox.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Manually test the workflow you're documenting
5. Note exact UI text, button labels, data-testid values
6. Use browser DevTools to inspect elements

### Voice Example Transformations

**Before (technical):**
> "Navigate to the upload interface and select the appropriate Excel file from your file system."

**After (conversational):**
> "Click Upload and choose your Excel file."

**Before (passive):**
> "The employee tile will be highlighted in yellow when a change is made."

**After (active):**
> "The tile turns yellow when you move an employee."

**Before (vague):**
> "Wait for the operation to complete."

**After (specific):**
> "Wait for the green success message (about 2 seconds)."

---

*Task Breakdown v1.0 | Phase 1: Critical Path | December 2024*
