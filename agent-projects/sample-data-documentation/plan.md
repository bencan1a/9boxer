# Sample Data Documentation Update (Issue #104)

```yaml
status: active
owner: claude
created: 2025-12-29
summary:
  - Transform quickstart into 5-7 minute guided tour using sample data
  - Restructure getting-started.md to make sample data the primary path
  - Add missing screenshots for sample data workflows
  - Create SAMPLE_DATA_GENERATION.md architecture documentation
  - Update all feature docs to reference sample data
```

## Problem Statement

**Issue:** [#104 - Update documentation to leverage sample data feature](https://github.com/bencan1a/9boxer/issues/104)

Current documentation treats Excel upload as the primary path for new users, despite having a rich sample data generator that provides:
- 200 realistic employees
- Complete organizational hierarchy (6 levels)
- 3 years of performance history
- All 8 flag types
- Deliberate bias patterns for Intelligence panel to detect (USA +15%, Sales +20%)

**User Impact:**
- New users must create an Excel file before exploring features
- Sample data is hidden as an "optional" alternative
- Quickstart is generic "upload and look" instead of engaging product tour
- Intelligence panel's bias detection capabilities are not showcased

## Solution Approach

### Phase 1: Quickstart Transformation (High Priority)

**Transform `quickstart.md` into Guided Tour:**

Current approach: "Upload file in 2 minutes"
New approach: "5-7 minute guided tour showcasing all features"

**Tour Structure:**
1. **Load Sample Data** (1 min) - One-click to 200 employees
2. **Explore Employee Details** (1 min) - Flags, reporting chain, job info
3. **View Performance History** (1 min) - 3-year timeline
4. **Check Distribution Statistics** (1 min) - See healthy patterns
5. **Discover Intelligence Insights** (1-2 min) - USA/Sales bias detection demo
6. **Try Making a Change** (1 min) - Drag, add note, see orange border
7. **Try Filters** (30 sec) - Filter by location/function

**Key Value:** Instead of "see a grid," users experience the full product value in 5-7 minutes.

**Restructure `getting-started.md`:**
- Make Step 1 present two clear options:
  - Option 1: Load Sample Data (Recommended for Learning) - PRIMARY
  - Option 2: Upload Your Excel File (For Production Use) - ALTERNATIVE
- Keep all existing comprehensive sample data details
- Cross-reference to quickstart tour

**Update `index.md`:**
- Change "2-Minute Quickstart" → "5-Minute Guided Tour"
- Strengthen sample data call-to-action
- Explain sample data advantages (bias patterns, complete history, etc.)

### Phase 2: Screenshot Infrastructure (High Priority)

**Add Missing Screenshots to `config.ts`:**

1. `quickstart-empty-state-sample-button` - EmptyState with sample button
2. `quickstart-sample-grid-populated` - Grid with sample data (can reuse existing)
3. `quickstart-employee-details-with-history` - Details panel with flags, history
4. `quickstart-timeline-history` - Timeline tab (3-year history)
5. `quickstart-intelligence-bias-detected` - Intelligence panel showing bias patterns
6. `quickstart-load-sample-dialog` - LoadSampleDialog

**Reuse existing screenshots:**
- Statistics: `statistics-panel-distribution.png`
- Filters: `filters-panel-expanded.png`
- Changes: Existing changes screenshots

**Create workflow functions:**
- `frontend/playwright/screenshots/workflows/quickstart-tour.ts` (if needed beyond Storybook)

**Generate screenshots:**
- Run `npm run screenshots:generate`

### Phase 3: Feature Documentation Updates (Medium Priority)

**Update feature guides to reference sample data and tour:**

**`filters.md`:**
- Add tip: "In the quickstart tour, you filtered by USA location. Try other filters!"
- Example: "Sample data has 8 locations and 8 functions"

**`statistics.md`:**
- Add example: "Load sample data to see realistic distribution patterns"
- Reference tour: "Remember the distribution chart from the tour?"

**`intelligence.md` (or related docs):**
- **Prominent note:** "Sample data includes deliberate bias patterns (USA +15%, Sales +20%) - perfect for learning!"
- Tutorial: "Follow the quickstart tour to see Intelligence in action"

**`donut-mode.md`:**
- Add workflow example using sample data

**`troubleshooting.md`:**
- Add section: "Not sure if it's a bug? Load sample data to test"

**`tracking-changes.md`:**
- Reference quickstart tour Step 6

**`uploading-data.md`:**
- Add header tip: "Want to explore first? [Take the guided tour →](quickstart.md)"

### Phase 4: Architecture Documentation (Medium Priority)

**Create `internal-docs/architecture/SAMPLE_DATA_GENERATION.md`:**

**Structure (agent-optimized format):**

#### Overview
- Purpose: Realistic sample datasets for tutorials, testing, exploration
- Default: 200 employees with complete organizational context

#### Architecture Components
1. **RichDatasetConfig** - Configuration (size, bias, seed, locations, functions)
2. **ManagementChainBuilder** - 6-level hierarchy with validation
3. **PerformanceHistoryGenerator** - 3-year history with variance
4. **RichEmployeeGenerator** - Main orchestrator, all 28 columns

#### Data Characteristics
- 200 employees by default
- 8 locations, 8 functions, 6 job levels
- All 9 grid positions covered
- All 8 flag types distributed
- Management chain: CEO → VP → Director → Manager → Senior IC → IC

#### Bias Patterns (Intelligence Testing)
- **USA Location:** +15% high performers
- **Sales Function:** +20% high performers
- **Purpose:** Enable Intelligence panel to demonstrate bias detection
- **Rationale:** Educational + realistic (real datasets often have bias)

#### API Endpoint
- `POST /api/employees/generate-sample`
- Performance: <2s for 300 employees

#### Extension Guide
- How to add new patterns
- How to customize distributions
- How to add new flag types

**Update `ARCHITECTURE_QUICK_REFERENCE.md`:**
- Add entry linking to SAMPLE_DATA_GENERATION.md

## Implementation Phases

### Phase 1: Core Documentation (Agents 1-3)
**Agent 1 (documentation specialist):** Redesign `quickstart.md` as guided tour
**Agent 2 (documentation specialist):** Restructure `getting-started.md`
**Agent 3 (documentation specialist):** Update `index.md`

### Phase 2: Screenshots (Agent 4)
**Agent 4 (Explore agent):** Add screenshot config entries, create workflows if needed, generate screenshots

### Phase 3: Architecture Docs (Agent 5)
**Agent 5 (documentation specialist):** Create SAMPLE_DATA_GENERATION.md

### Phase 4: Feature Docs (Agent 6)
**Agent 6 (documentation specialist):** Update all feature documentation files (filters.md, statistics.md, intelligence.md, etc.)

### Phase 5: Validation (Agent 7)
**Agent 7 (documentation specialist):** Cross-reference validation, voice & tone check, accessibility check, screenshot validation

## Success Criteria

✅ New users can load sample data in <1 minute
✅ New users complete guided tour in 5-7 minutes and understand core features
✅ All tutorials work with sample data (no Excel file required)
✅ Documentation clearly shows sample data as recommended starting point
✅ Architecture docs explain how sample data generation works
✅ Users understand Intelligence panel's value (bias detection demo)
✅ Voice & Tone compliance: 95%+
✅ Technical accuracy: 95%+
✅ Accessibility: WCAG 2.1 Level AA

## Files to Modify

**User Documentation (10 files):**
- `resources/user-guide/docs/quickstart.md` (complete redesign)
- `resources/user-guide/docs/getting-started.md` (restructure)
- `resources/user-guide/docs/index.md` (update)
- `resources/user-guide/docs/filters.md`
- `resources/user-guide/docs/statistics.md`
- `resources/user-guide/docs/intelligence.md` (or related)
- `resources/user-guide/docs/donut-mode.md`
- `resources/user-guide/docs/troubleshooting.md`
- `resources/user-guide/docs/uploading-data.md`
- `resources/user-guide/docs/tracking-changes.md`

**Screenshot Infrastructure (2 files):**
- `frontend/playwright/screenshots/config.ts`
- `frontend/playwright/screenshots/workflows/quickstart-tour.ts` (create new)

**Architecture Documentation (2 files):**
- `internal-docs/architecture/SAMPLE_DATA_GENERATION.md` (create new)
- `internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md`

## Dependencies

- Existing sample data generator (`backend/src/ninebox/services/sample_data_generator.py`)
- Existing Storybook stories (EmptyState, LoadSampleDialog)
- Existing screenshots that can be reused

## Estimated Effort

- Phase 1 (Core Docs): 2-3 hours
- Phase 2 (Screenshots): 1-1.5 hours
- Phase 3 (Architecture): 1.5-2 hours
- Phase 4 (Feature Docs): 1-1.5 hours
- Phase 5 (Validation): 30-45 min
**Total: 6-8.5 hours**

## Key Value Proposition

**Before:** "Upload a file and see a grid"

**After:** "Take a 5-minute tour and discover:
- Performance tracking over 3 years
- Organizational hierarchy visualization
- AI-powered bias detection (see it find USA and Sales patterns!)
- Distribution analytics
- Complete talent management workflow"

This transforms the quickstart from a mechanical task into an engaging product demo that shows the true value of 9Boxer.

## Related

- Issue: [#104](https://github.com/bencan1a/9boxer/issues/104)
- Implementation: `agent-projects/rich-sample-data-generator/plan.md`
- Voice & Tone Guide: `internal-docs/contributing/voice-and-tone-guide.md`
- Documentation Guide: `internal-docs/contributing/documentation-writing-guide.md`
- Screenshot Guide: `internal-docs/contributing/screenshot-guide.md`
