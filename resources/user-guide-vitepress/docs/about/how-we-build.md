# How We Build 9Boxer: Field Notes from an AI-Driven Development Experiment

**I spent my Christmas break seeing if AI agents could build a real desktop application with professional UX. Turns out they can. Here's what happened.**

---

## Context: What This Experiment Was

**The Setup:**
- One person (me) over Christmas break
- $200/mo Claude Max subscription + $200/mo GitHub Copilot Pro = **$400/mo total cost**
- Building an internal talent management desktop application (Electron-based)
- Goal: Can I build real end-user experiences with professional design, docs, and all the polish?

**My Role:**
- **Product manager**: "Here's what I want to build"
- **Technical advisor**: "Try this approach instead"
- **Manual tester**: "This doesn't work, fix it"
- **What I did NOT do**: Write any code, agent definitions, architecture docs, or user documentation

**What "Zero Human Code" Actually Means:**
- I prompted: "I need an agent that does X, how would you write it?"
- Agents wrote: All code, agent definitions, architecture guides, user documentation—everything
- I decided: What to build, when it was done, whether to keep it
- **Human = strategy and judgment; Agents = all implementation**

**Important Caveat:**
This is an internal desktop application (not SaaS), so I went lighter on multi-tenancy, cloud infrastructure, and some enterprise deployment concerns. But I still needed real UX, professional design, complete documentation, and reliable functionality. This proves agents can build real software, but doesn't prove they can handle every deployment scenario.

---

## What I Learned (TL;DR)

If you're short on time, here are the key findings:

1. **It actually works** - 271 commits in 7 days, 100% agent-written code, real features shipped
2. **Cost: $400/month** - Claude Max ($200) + GitHub Copilot Pro ($200), no other significant costs
3. **Tests are the pain point** - Spend SO MUCH time maintaining tests and fixing pre-commit issues. This slows everything.
4. **Speed is shocking** - The velocity from idea to working feature is hard to describe
5. **Multi-project coordination is MY bottleneck** - Keeping track of 5-10 concurrent agent projects, not agent capability
6. **Everything completed** - Lots of iteration and fixes, but zero abandoned projects (which surprised me)

**The Trade:** You stop writing code and start managing agents. Tests still break constantly. Pre-commit hooks still fail. But the velocity is genuinely mind-blowing.

**Who might find this useful:** Developers/PMs curious about what's actually possible with current AI today, not what might be possible someday.

---

## By The Numbers: One Week of Agent Development

Here's what the last 7 days looked like (Dec 28, 2025 - Jan 4, 2026):

### Velocity Metrics

| Metric | Count | Daily Average |
|--------|-------|---------------|
| **Commits** | 271 | 38.7/day |
| **Lines Changed** | 232,700 | 33,243/day |
| **Lines Added** | 181,000 | 25,857/day |
| **Lines Removed** | 51,000 | 7,286/day |
| **PRs Merged** | 21 | 3/day |
| **Issues Closed** | 100+ | 14+/day |

### Where The Work Goes

Commit breakdown by category (after recategorizing commits without conventional prefixes):

- **Features:** 78 commits (28.8%)
  - Explicit `feat:` prefix: 37 commits
  - "Add X", "Implement X" commits: 41 commits
- **Bug fixes:** 65 commits (24.0%)
  - Explicit `fix:` prefix: 53 commits
  - "Fix X" without colon: 12 commits
- **Documentation:** 45 commits (16.6%)
  - Explicit `docs:` prefix: 31 commits
  - "Initial plan" commits: 10 commits
  - Doc updates: 4 commits
- **Infrastructure:** 42 commits (15.5%)
  - Refactor, chore, CI changes
- **Merge commits:** 35 commits (12.9%)
  - GitHub PR merges (excluded from work type analysis)
- **Testing:** 2 commits (0.7%)
- **Other:** 4 commits (1.5%)
  - Reverts, WIP commits

**The Pattern:** When we recategorize commits that lack conventional prefixes (like "Add FilterToolbar tests" → feature), the "other" category drops from 39% to ~2%.

**Key Insight:** Feature development (29%) and bug fixes (24%) dominate, but infrastructure and documentation (32% combined) represent substantial ongoing investment. Without automated documentation systems and architectural reviews, this percentage would likely be even higher.

### What These Numbers Don't Show

**The Messy Reality Behind the Stats:**
- **Test failures**: Hundreds? Thousands? I honestly lost count. Tests break on almost every feature change.
- **Iterations per feature**: Usually 2-5 attempts before it works correctly
- **Pre-commit hook failures**: Constant. Linting, type checking, translation validation—all fail regularly
- **Time spent coordinating**: Significant effort managing 5-10 concurrent agent projects
- **The one disaster**: Agents reverted a bunch of changes and I spent hours recovering using chat history

**What "Success" Actually Means:**
- ✅ Feature eventually works
- ✅ Tests eventually pass
- ✅ Documentation eventually written
- ❌ The path to get there is messy and iterative

**Honest Comparison:**
I'm a decent developer, but I couldn't sustain 38.7 commits/day writing code myself. Even if I could code this fast, I couldn't also write docs, tests, AND maintain infrastructure. The real comparison is: **one person with agents vs. a small team without agents**.

---

## Five Things I Had to Figure Out

After lots of trial and error, here's what actually made this work:

### 1. Keeping Multiple Agents From Creating a Mess

**The Problem:** When you have multiple agents working at the same time, they create architectural drift, duplicate code, and conflicting patterns. It gets messy fast.

**What I Built:** Automated architectural reviews through CI/CD that catch problems early.

#### Weekly AI Architectural Review

Every week, Claude AI analyzes the week's git diffs looking for:

- Code duplication across modules
- Architectural drift from established patterns
- Pattern violations
- Emerging technical debt

When issues are detected, the system automatically creates GitHub issues with:

- Specific code locations
- Pattern violations identified
- Recommended fixes
- Priority level

**Why This Helps:** Catches technical debt before it snowballs into something expensive to fix.

#### The `facts.json` File: Single Source of Truth

I maintain a 425-line JSON file that acts as the final arbiter when documentation conflicts. When agents disagree about how to do something, `facts.json` wins.

What's in it:

- Critical architectural decisions
- Deployment workflows
- Common pitfalls and warnings
- Trust hierarchy definitions
- Mandatory patterns

Basically, it's the "constitution" that all agents have to respect.

**Trust hierarchy (from most to least authoritative):**

1. `facts.json` - If it says it here, this is correct
2. Permanent docs in `internal-docs/`
3. Active plans in `agent-projects/`
4. Everything else

#### Architecture Decision Records (ADRs)

Major architectural decisions get documented in ADRs, providing:

- Historical context for why decisions were made
- Trade-offs considered
- Alternatives rejected
- When to revisit decisions

This prevents agents from re-litigating resolved issues.

**Bottom line:** Coherence doesn't happen automatically. You need automated reviews, clear authority hierarchies, and decision history. Otherwise it's chaos.

---

### 2. Making Documentation Update Itself

**The Problem:** Documentation goes stale instantly. Agents forget to update screenshots. Users get confused by outdated visuals.

**What I Built:** Fully automated documentation regeneration that runs on every commit.

#### How It Works

1. **Component Change Detection**
   - Developer (agent) changes `FilterToolbar.tsx`
   - CI workflow detects the change
   - `detect-doc-impact.js` script analyzes the diff

2. **Screenshot Mapping**
   - Script consults `component-screenshot-map.json`:
     ```json
     {
       "FilterToolbar.tsx": [
         "filter-toolbar-expanded.png",
         "filter-toolbar-search-autocomplete.png"
       ]
     }
     ```
   - Identifies which screenshots need regeneration

3. **Automated Regeneration**
   - Launches backend executable
   - Opens Storybook with component stories
   - Playwright captures screenshots in controlled environment
   - Visual regression testing compares against baselines

4. **Visual Regression Analysis**
   - Compares pixel-by-pixel differences
   - Allows 5% tolerance for minor rendering variations
   - Flags breaking visual changes
   - Posts diff artifacts to PR comments

5. **Documentation PR Creation**
   - Creates branch with updated screenshots
   - Generates before/after comparison report
   - Opens PR automatically
   - Auto-tags with `documentation` label

**Result:** Component changes trigger documentation updates automatically. The system knows when its documentation is stale and fixes itself.

#### Screenshot Coverage Tracking

We track documentation health with metrics:

- **Goal:** 40% Storybook coverage
- **Goal:** 50% component story coverage
- Weekly coverage reports committed to repo

**The cool part:** The codebase actually "knows" when its documentation is stale. Only works because of the explicit component-to-doc mapping and automated workflows.

---

### 3. Testing: Still Haven't Figured This Out Completely

**The Situation:** We have extensive test coverage (75,680 lines of test code, 92% backend coverage, 232 test files). Tests exist and provide value, but I haven't "solved" testing by any means.

#### The Maintenance Cost

In our experience, a significant portion of pre-PR engineering time goes to fixing tests broken by code changes. The pattern:

1. Agent makes feature change
2. Tests break (often due to implementation details, not actual bugs)
3. Agent spends time updating tests to match new behavior
4. Tests pass, PR merges

**The question we're still exploring:** What percentage of test failures represent real regressions vs. brittle tests that need updating? In our observation, the rate of tests catching actual bugs is lower than we'd like.

This doesn't mean tests are without value—they document behavior and catch some regressions. But the cost-benefit ratio is still something we're working to optimize.

#### What We Learned About Writing Better Tests

While we haven't solved testing completely, we've identified patterns that help:

**1. State-Based Waits (Not Arbitrary Timeouts)**

```typescript
// ❌ Brittle: Arbitrary waits (guessing how long things take)
await page.waitForTimeout(1000)

// ✅ Better: State-based waits (wait for actual conditions)
await page.waitForSelector('[data-testid="grid-loaded"]')
await expect(employeeTiles).toHaveCount(50)
```

**2. I18n-Aware Testing**

```typescript
// ❌ Brittle: Hardcoded strings (breaks when translations change)
await expect(page.getByText('Save')).toBeVisible()

// ✅ Better: Translation-independent selectors
await expect(page.getByTestId('save-button')).toBeVisible()
```

**3. Visual Regression with Tolerance**

- 5% pixel tolerance for minor rendering variations
- Baseline comparison system
- Helps catch unintended visual changes
- Still requires manual review of diffs

#### Testing Infrastructure Scale

| Metric | Count |
|--------|-------|
| **Total test files** | 232 |
| **Backend tests** | 73 files (30,400 lines) |
| **Frontend tests** | 126 files (25,999 lines) |
| **E2E tests** | 33 files (19,281 lines) |
| **Total test code** | 75,680 lines |
| **Backend coverage** | 92% |

**Test Architecture Principles We Follow:**

1. **Simple** - No conditional logic in tests
2. **Isolated** - Each test independent
3. **Integration-Focused** - Prefer integration over unit tests when practical

#### The Honest Assessment

**What works:**
- State-based waits reduce timing issues
- I18n-aware selectors prevent translation breakage
- High coverage documents expected behavior

**What's still challenging:**
- Test maintenance burden is substantial
- Tests break frequently on implementation changes
- Distinguishing real bugs from brittle tests is hard
- Cost-benefit optimization ongoing

**Status:** Good progress, not done. Testing remains an area of active learning.

---

### 4. Ephemeral Project Folders (Agent "Working Memory")

**The Problem:** Permanent project folders create bloat, stale information, confusion about what's current, and context overload for agents.

**What I Built:** Time-bounded project folders that auto-archive after 21 days.

#### How It Works

**Agent Project Structure:**

- Each project gets a dedicated folder in `agent-projects/`
- Contains markdown planning files (status, phases, integration guides)
- Serves as "working memory" for active development

**21-Day Lifecycle:**

- Projects older than 21 days automatically archived
- Archive preserves history without cluttering workspace
- Forces documentation to consolidate into permanent locations

**Current State:**

- 49 completed projects (all successfully finished)
- 200 markdown planning documents
- Average project lifecycle: <21 days
- Projects auto-archived after 21 days to prevent bloat

#### Project Breakdown by Category

| Category | Projects | Percentage |
|----------|----------|------------|
| Feature Development | 9 | 31% |
| Infrastructure/Testing | 8 | 28% |
| Documentation | 6 | 21% |
| Design System | 6 | 21% |

**Notable Projects:**

- `ai-calibration-summary` - AI-powered calibration reports
- `self-managing-docs-system` - Documentation auto-regeneration pipeline
- `backend-robustness` - Multi-phase 2.5hr agent collaboration
- `performance-optimization` - E2E performance testing infrastructure
- `docs-comprehensive-overhaul` - 3-phase documentation excellence initiative

#### Example: Multi-Agent Collaboration

The `backend-robustness` project demonstrates how agents hand off work:

**How It Starts (The Human's Role):**

I type `/new-feature` and provide a paragraph or two of requirements:
> "I need to improve backend performance for org hierarchy queries. Currently taking 200ms+ per request. Goal is <100ms."

The agent (via the `/new-feature` command) asks exploratory questions:
- What's the current bottleneck?
- How frequently is this called?
- Can we cache results?
- What's acceptable staleness?

After ~5 minutes of Q&A, the agent produces the detailed architectural plan and implementation phases below. **I didn't write any of this - the agent created all the planning docs.**

**Phase 1: Architecture Planning (45 min)**

- Agent analyzes requirements (based on our Q&A)
- Creates detailed implementation plan
- Identifies integration points
- Documents hand-off requirements

**Phase 2: Implementation (60 min)**

- Backend agent implements core logic
- Creates `OrgService` with hierarchy caching
- Builds API endpoints
- Documents integration guide

**Phase 3: Testing (45 min)**

- Test agent reads integration guide
- Writes unit tests for caching logic
- Creates integration tests for API endpoints
- Adds performance benchmarks (<100ms requirement)

**Result:** 2.5 hours across 6 phases with clean hand-offs between specialized agents.

**What I learned:** Ephemeral project folders work like "working memory" for agents - detailed enough for active work, automatically archived to prevent bloat. Kind of like human memory: detailed short-term, summarized long-term.

---

### 5. Writing Docs That Agents Can Actually Use

**The Problem:** Traditional narrative documentation is hard for agents to parse - it's buried in prose, difficult to search, and ambiguous.

**What I Built:** Agent-optimized documentation format using pattern catalogs.

#### Pattern Catalog Format

Instead of narrative prose like:

> "When creating API endpoints, you should use dependency injection for database sessions. This ensures proper transaction handling and makes testing easier. It's generally a good practice to validate input at the endpoint level..."

We use **pattern catalogs**:

```markdown
## API Endpoint Pattern (#api-endpoint)

**When:** Implementing a new API endpoint

**Template:**
```python
@router.get("/items")
def get_items(
    session: SessionDep,  # Dependency injection
    skip: int = 0,
    limit: int = 100
) -> List[ItemResponse]:
    items = db.query(Item).offset(skip).limit(limit).all()
    return items
```

**ALWAYS:**
- Use SessionDep for database access
- Return typed response models
- Validate with Pydantic models

**NEVER:**
- ❌ Validate session in endpoint (use dependency)
- ❌ Return raw database objects
- ❌ Use string literals for queries
```

#### Format Elements

- **Quick Rules:** ALWAYS/NEVER statements (no ambiguity)
- **Pattern Catalogs:** Copy-paste ready code
- **Decision Matrices:** If/then tables for quick decisions
- **Anti-patterns:** Explicitly shown with ❌
- **Pattern Tags:** Searchable identifiers (`#api-endpoint`)
- **Contextual Triggers:** "When implementing X, use pattern Y"

#### Documentation Infrastructure

| Type | Count | Size |
|------|-------|------|
| **Agent profiles** | 13 | 3,480 lines |
| **Internal docs** | 66 files | 38,159 lines |
| **Total markdown** | 550+ files | - |
| **CONTEXT.md** | 1 file | ~150KB |
| **facts.json** | 1 file | 425 lines |

#### Specialized Agent Profiles

- `architecture.md` - System design and patterns
- `debug.md` - Debugging specialist
- `documentation.md` - Technical writing
- `feature-development.md` - Feature implementation
- `user-documentation-expert.md` - User guide specialist
- `test-architect.md` - Testing strategy
- `backend-expert.md` - Backend development
- `frontend-expert.md` - Frontend development
- `e2e-expert.md` - End-to-end testing
- `principal-engineer.md` - Code review and tech debt
- `react-performance-analyst.md` - Performance optimization

**Key Insight:** Agents need structured, scannable, unambiguous documentation. Pattern catalogs beat narrative prose every time.

---

## The Technical Implementation

### Tech Stack: What 9Boxer Is Built On

**Backend:**
- **FastAPI** (Python) - Modern async web framework
- **SQLite** - Embedded database (no server required)
- **PyInstaller** - Bundles Python app into ~225MB standalone executable
- **Pydantic** - Data validation and serialization
- **pytest** - Testing framework (73 test files, 30,400 lines)

**Frontend:**
- **React 18** + **TypeScript** - UI framework with strict typing
- **Material-UI (MUI)** - Component library for consistent design
- **Zustand** - Lightweight state management
- **Vite** - Build tool (fast dev server and production builds)
- **Electron** - Desktop wrapper (cross-platform distribution)
- **React Router** - Client-side routing

**Testing:**
- **Backend**: pytest (unit, integration, E2E, performance tests)
- **Frontend**: Vitest + React Testing Library (component tests)
- **E2E**: Playwright (33 test files, 19,281 lines)
- **Visual Regression**: Playwright screenshot comparison

**Documentation:**
- **MkDocs Material** - Static site generator (this site!)
- **Storybook** - Component documentation and development
- **Markdown** - Documentation format

**Infrastructure:**
- **GitHub Actions** - CI/CD (17 workflows)
- **Pre-commit hooks** - Quality gates (ruff, mypy, pyright, ESLint, Prettier)
- **GitHub Copilot** - AI agent for automation workflows

**Architecture:**
- **Desktop-first**: Electron app with embedded backend
- **Offline-capable**: Runs entirely locally, no cloud dependencies
- **Single executable**: Backend bundles into ~225MB Windows/Mac/Linux executable
- **File-based sessions**: Import Excel → Calibrate → Export Excel

---

**Important Context: This is a Desktop Application, Not SaaS**

Because this is a desktop app (Electron) that handles sensitive HR data locally, I went lighter on some cloud/SaaS concerns:

**What I Simplified:**
- **Cloud infrastructure**: No servers, hosting, or deployment pipelines
- **Multi-tenancy**: Runs locally with file-based data storage
- **User authentication**: Desktop app runs on user's own machine
- **Scalability planning**: No concurrent users (single-user desktop app)
- **API design**: No REST APIs or backend services needed

**What I Still Built:**
- **Real user experience**: People actually use this daily
- **Professional design system**: Can't look janky even internally
- **Complete documentation**: Users need to learn the tool
- **Reliable functionality**: Can't be buggy or lose data
- **Cross-platform packaging**: Windows/Mac builds with PyInstaller + Electron

**Why This Matters:**
- Proves agents can build real end-user experiences with polish
- Desktop apps simplify some concerns (no cloud, no auth) but add others (packaging, cross-platform)
- Your mileage may vary if you need SaaS deployment, cloud infrastructure, or enterprise auth

---

### UX Design: Storybook-Driven Component Development

**The Challenge:** How do you build a consistent, high-quality UI when agents are writing the code?

**The Solution:** Component-driven development with Storybook as the design workbench.

#### How Storybook Enables Iterative Design

**1. Component Isolation**

Each React component gets its own Storybook story showing all states:

```typescript
// FilterToolbar.stories.tsx
export const Default: Story = {
  args: {
    activeFilters: 0,
    onFiltersClick: fn()
  }
}

export const WithActiveFilters: Story = {
  args: {
    activeFilters: 5,
    onFiltersClick: fn()
  }
}

export const Expanded: Story = {
  args: {
    expanded: true,
    searchTerm: "Engineering"
  }
}
```

**Benefits:**
- Agents can see all component states visually
- Design iterations happen in isolation (no app context needed)
- Visual regression tests use these stories as baselines

**2. Design System and Tokens**

**The Problem:** Hardcoded colors and spacing lead to visual drift and inconsistency.

**The Solution:** Centralized design tokens in `frontend/src/theme/tokens.ts`

```typescript
export const tokens = {
  colors: {
    primary: '#3f51b5',      // Material-UI indigo
    secondary: '#ff9800',    // Orange accents
    background: '#121212',   // Dark mode default
    // ... 40+ color definitions
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem'
    }
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
}
```

**Design Token Auto-Generation:**

The system automatically generates CSS from tokens:

```bash
npm run generate:docs-tokens  # Generates design-tokens.css
```

This CSS is used in **both** the app and the documentation site (the one you're reading right now), ensuring perfect visual consistency.

**Benefits:**
- **No hardcoded values**: Agents reference tokens, not magic numbers
- **Consistent theming**: Dark/light mode switching works automatically
- **Documentation matches app**: Design tokens ensure visual parity
- **Easy refactoring**: Change one token, update entire app

**3. Component Coverage Tracking**

We track which components have Storybook stories:

- **Current coverage**: 40% of components have stories
- **Goal**: 50% component story coverage
- **Tracked weekly**: `screenshot-coverage.yml` workflow

**Missing stories flagged automatically** - agents know which components need documentation.

#### The Storybook Workflow

1. **Agent builds component** → React component in `src/components/`
2. **Agent creates story** → `.stories.tsx` file showing all states
3. **Visual review** → Screenshots generated automatically
4. **Integration** → Component used in app
5. **Regression testing** → Story becomes visual test baseline

**Result:** High-quality, consistent UI despite zero human designers.

### User Documentation: The System That Documents Itself

**Meta-moment:** The documentation you're reading right now was generated by the same automated system we're describing. This is documentation documenting itself.

#### The Documentation Stack

**MkDocs Material Configuration:**
- **Source**: `resources/user-guide/docs/` (Markdown files)
- **Build**: `mkdocs build` → Static HTML site
- **Theme**: Material for MkDocs (matches app design tokens)
- **Deployment**: Bundled with Electron app for offline access
- **Navigation**: 40+ pages organized in `mkdocs.yml`

**Key Features:**
- **Offline-first**: No internet required (bundled with app)
- **Search**: Lunr.js offline search
- **Code highlighting**: Pygments syntax highlighting
- **Dark mode**: Matches app theme (default dark)
- **Responsive**: Works on all screen sizes

#### Screenshot Automation Pipeline

**The Problem:** When components change, screenshots go stale. Agents forget to update them.

**The Solution:** Automated screenshot regeneration triggered by code changes.

**Step-by-Step Flow:**

1. **Component Change Detected**
   ```yaml
   # docs-auto-update.yml workflow
   on:
     push:
       paths:
         - 'frontend/src/components/**/*.tsx'
   ```

2. **Impact Analysis**
   ```javascript
   // detect-doc-impact.js
   const changedFiles = getGitDiff()
   const affectedScreenshots = componentScreenshotMap.get(changedFiles)
   // Returns: ["filter-toolbar-expanded.png", "filter-toolbar-search.png"]
   ```

3. **Selective Regeneration**
   ```typescript
   // Playwright screenshot generation
   await page.goto('http://localhost:6006/?path=/story/filtertoolbar--expanded')
   await page.screenshot({
     path: 'resources/user-guide/docs/images/screenshots/toolbar/filter-toolbar-expanded.png'
   })
   ```

4. **Visual Regression Test**
   ```typescript
   // Compare new vs baseline
   const diff = await compareImages(newScreenshot, baseline)
   if (diff > 0.05) { // 5% tolerance
     await generateDiffReport(newScreenshot, baseline, diff)
   }
   ```

5. **Documentation PR Created**
   - Branch: `docs/auto-update-YYYY-MM-DD`
   - Files: Updated screenshots
   - Description: "Auto-update screenshots for FilterToolbar changes"
   - Visual diff report attached

#### Storybook as Screenshot Source

**Why Storybook for screenshots (not the full app)?**

1. **Isolation**: Component shown in clean state (no app chrome, menus, etc.)
2. **Consistency**: Same viewport, same data, every time
3. **States**: Can screenshot all component states (loading, error, empty, etc.)
4. **Fast**: No app startup time, direct to component
5. **Reproducible**: Same story = same screenshot

**Example Screenshot Workflow:**

```typescript
// 1. Component in Storybook
export const FilterToolbarExpanded: Story = {
  args: {
    expanded: true,
    activeFilters: 3,
    searchTerm: "Engineering"
  }
}

// 2. Mapped in component-screenshot-map.json
{
  "FilterToolbar.tsx": [
    "filter-toolbar-expanded.png",
    "filter-toolbar-collapsed.png",
    "filter-toolbar-search-autocomplete.png"
  ]
}

// 3. Screenshot generated via Playwright
await page.goto('http://localhost:6006/?path=/story/toolbar--expanded')
await page.screenshot({ path: '...filter-toolbar-expanded.png' })

// 4. Used in documentation
![Filter toolbar expanded](/images/screenshots/toolbar/filter-toolbar-expanded.png)
```

#### Documentation Coverage Metrics

We track documentation health automatically:

**Weekly Reports** (`screenshot-coverage.yml`):
- **Screenshot inventory**: 80+ screenshots tracked
- **Component coverage**: 40% of components documented
- **Stale screenshots**: Flagged if >30 days old without code changes
- **Missing screenshots**: Components without stories identified

**Coverage Goals:**
- 40% Storybook coverage (components with stories)
- 50% component story coverage (stories per component)
- 90% screenshots updated within 7 days of code changes

**The Self-Documenting Loop:**

```
Code change → Detect impact → Regenerate screenshots →
Visual regression test → Create PR → Merge → Docs updated
```

**Result:** Documentation that stays current automatically. The system you're reading about maintains itself.

---

## The Infrastructure Paradox

**Observation:** Nearly 50% of agent work goes to infrastructure, documentation, and testing - not features.

Is this waste? Absolutely not. It's **investment**.

### The Hidden ROI of Infrastructure

**Scenario 1: No Infrastructure Investment**

- Manual screenshot updates (agents forget)
- Documentation goes stale
- Tests become flaky
- Architectural drift accelerates
- Debugging gets harder
- Velocity decreases over time

**Scenario 2: Heavy Infrastructure Investment (9Boxer)**

- Screenshots auto-regenerate
- Documentation stays current
- Tests use state-based waits (reduced brittleness)
- Architecture stays coherent through reviews
- Debugging is systematic
- Velocity remains more consistent

### Infrastructure as Code Volume

| Infrastructure Type | Lines of Code |
|---------------------|---------------|
| **CI/CD Workflows** | 4,051 lines |
| **Automation Scripts** | 6,032 lines |
| **Agent Profiles** | 3,480 lines |
| **Internal Docs** | 38,159 lines |
| **Test Code** | 75,680 lines |
| **Total Infrastructure** | 127,402 lines |

That's **127K lines** of infrastructure code - comparable in size to the application itself!

### Key Workflows

**1. AI Architectural Review** (`arch-review.yml`)

- Weekly automated reviews using Claude AI
- Detects code duplication, drift, violations
- Creates GitHub issues automatically
- 90-day report retention

**2. Documentation Auto-Update** (`docs-auto-update.yml`)

- Detects component changes affecting screenshots
- Regenerates affected screenshots
- Creates documentation PRs
- ~400 lines of sophisticated change detection logic

**3. Screenshot Generation** (`screenshots.yml`)

- Weekly automated screenshot regeneration
- Integrated with Storybook for component isolation
- Visual regression testing

**4. Visual Regression Tests** (`visual-regression.yml`)

- Runs on PRs affecting frontend
- 5% pixel tolerance
- Posts diff artifacts to PRs

**5. Screenshot Coverage Report** (`screenshot-coverage.yml`)

- Tracks documentation screenshot coverage
- Goals: 40% Storybook, 50% component stories
- Weekly trend analysis

**Key Insight:** Infrastructure investment enables sustained velocity. Without it, agent-driven development would collapse under its own technical debt.

---

## Inside an Agent Project: How Work Actually Gets Done

**The Reality:** Our 49 completed projects follow remarkably consistent patterns. Understanding how agents break down work, coordinate across phases, and produce documentation artifacts reveals what makes agent-driven development work in practice.

### Project Lifecycle Overview

**Typical Structure:**
- **Duration:** 2 hours to 2 weeks depending on complexity
- **Phases:** 3-7 phases per project
- **Documentation produced:** 8-22 markdown files per project
- **Total across 49 projects:** 200 planning documents

### Example 1: AI Calibration Summary (Complex Feature)

**Duration:** 3 days | **Phases:** 5 | **Artifacts:** 22 files

This project added AI-powered calibration report generation with LLM integration—a complex feature touching backend, frontend, testing, and documentation.

#### Artifacts Produced

**Planning & Architecture (3 files):**
- `plan.md` (1,056 lines) - Comprehensive 5-phase architecture
- System architecture diagrams (ASCII art)
- Security & privacy design (no PII to LLM)

**Implementation Guides (4 files):**
- `DEVELOPER_GUIDE.md` - How to work with the codebase
- `DEPLOYMENT.md` - Production deployment process
- `MIGRATION.md` - Migration from old system
- `DATA_PACKAGING_SERVICE_SUMMARY.md` - Service layer docs

**Phase Summaries (2 files):**
- `PHASE_4_5_COMPLETION_SUMMARY.md` - Mid-project hand-off
- `FINAL_COMPLETION_SUMMARY.md` (388 lines) - Complete deliverables:
  - ✅ 7 screenshots generated
  - ✅ 3 documentation files updated
  - ✅ 6 Storybook story files created
  - ✅ Build validation passed

**Testing Documentation (4 files):**
- `TEST_SUMMARY.md` - Coverage and results
- `INTEGRATION_TEST_SUMMARY.md` - Integration test details
- `README_TESTS.md` - How to run tests
- Test examples: `test_llm_agent_architecture.py`, `test_structured_outputs.py`

**Quality Artifacts (4 files):**
- `ARCHITECTURAL_REVIEW.md` - Post-implementation review
- `SCREENSHOT_REQUIREMENTS.md` - Screenshot specifications
- `SCREENSHOT_STORY_MAPPING.md` - Story-to-screenshot mapping
- `user-guide-integration.md` - User docs integration plan

**Demo Materials (2 files):**
- `demo_data_packaging.py` - Runnable example
- `demo_package_output.json` - Sample output

#### Phase Structure

1. **Phase 1: Backend Services** - CalibrationSummaryService implementation
2. **Phase 2: LLM Integration** - Privacy-first Claude API integration
3. **Phase 3: Frontend Components** - React hooks and UI
4. **Phase 4: Storybook Stories** - Component documentation
5. **Phase 5: Documentation** - User guide integration

#### Architect Guidance Example

From the upfront `plan.md`:

```markdown
## Privacy & Security Considerations

### 1. No PII Sent to LLM
**What is NEVER sent to Claude:**
- Employee names
- Employee IDs
- Manager names

**What IS sent:**
- Anonymized role labels ("Employee A", "Employee B")
- Performance levels (aggregated)
- Distribution statistics

### 2. Prompt Injection Prevention
**Defense Mechanism:**
[Specific code implementation provided]
```

This architectural guidance was defined **before any implementation began**, ensuring all downstream work respected security constraints.

---

### Example 2: Backend Robustness (Multi-Agent Infrastructure)

**Duration:** 5 days | **Agents:** 5 (with dependencies) | **Artifacts:** 6 files

This project added dynamic port selection and IPC robustness—requiring careful coordination across multiple agents with explicit dependencies.

#### Agent Dependency Graph

```
Agent 1: Backend Port Selection (sequential)
   ↓
Agent 2: Electron Port Discovery (depends on Agent 1)
   ↓
Agent 3: Dynamic API Client (depends on Agent 2)
   ↓
Agents 4 & 5: Monitoring + UX (parallel after Agent 3)
```

#### The 542-Line Integration Guide

The key coordination artifact was `agent-2-integration-guide.md` (542 lines), which documented:

**For Agent 3: Dynamic API Client**
```markdown
### Your Objectives
1. Initialize API client with dynamic backend URL
2. Call IPC handlers during app startup
3. Handle connection failures gracefully

### Implementation Pattern
[Complete TypeScript code example provided]

### Global Variables Available
- `window.electron.getBackendPort()` → Promise<number>
- `window.electron.onPortChange(callback)` → void

### Success Criteria
✅ API client initializes without hardcoded ports
✅ Tests pass in both Electron and web modes
✅ Graceful degradation if backend unreachable
```

**For Agents 4 & 5 (Parallel Work):**
- Agent 4: Connection monitoring UI
- Agent 5: Error recovery UX
- Both receive integration guide after Agent 3 completes
- No dependencies between them (can run simultaneously)

**The Result:** Agent 3 could start immediately after Agent 2 without context-switching or coordination overhead. Agents 4 and 5 worked in parallel, maximizing efficiency.

---

### Example 3: Self-Managing Docs System (Meta-Infrastructure)

**Duration:** Ongoing (phased rollout) | **Phases:** 5 (3 complete, 2 optional) | **Artifacts:** 12 files

This project created the documentation automation system described earlier in this article—a meta-infrastructure project that helps all future projects.

#### Artifacts Produced

**Executive Planning (3 files):**
- `plan.md` (167 lines) - Project overview and timeline
- `EXECUTIVE_SUMMARY.md` - ROI analysis and business case
- `IMPLEMENTATION_ORDER.md` - Phased rollout sequence

**Strategy Documents (4 files):**
- `componentization-strategy.md` - Detailed refactoring roadmap
- `self-managing-docs-system.md` - Automation system design
- `screenshot-storybook-migration-plan.md` - Migration approach
- `screenshot-storybook-migration-analysis.md` - Current state analysis

**Implementation Artifacts (3 files):**
- `screenshot-inventory-summary.md` - Complete screenshot inventory
- `PHASE_2_2_IMPLEMENTATION.md` - Phase 2.2 deliverables
- `PHASE_3_1_IMPLEMENTATION.md` - Phase 3.1 deliverables

#### Iterative Phased Approach

- **Phase 1:** Componentization (optional, deferred)
- **Phase 2:** Self-managing foundation ✅ **Complete**
  - Component-screenshot metadata system
  - Change detection GitHub Action
  - Selective screenshot regeneration
- **Phase 3:** Visual regression ✅ **Complete**
  - 80 visual regression tests
  - HTML diff reports
  - CI integration
- **Phase 4:** AI audit system (optional, deferred)
  - Weekly Claude API audits
  - Automated issue creation
- **Phase 5:** Coverage & enforcement ✅ **Complete**
  - Coverage dashboard (19% → 40% target)
  - PR documentation reminders

**Key Pattern:** System deployed incrementally. Core functionality operational before optional enhancements attempted.

---

### The Role of Architect Agents

In multi-phase projects, architect agents provide guidance at critical junctures:

**1. Upfront Planning**
- System architecture before coding begins
- API contracts defined in advance
- Component responsibilities documented
- Risk assessment with mitigations

**2. Phase Boundaries**
- Reviews previous phase completion
- Validates integration points work as designed
- Provides guidance for next phase
- Ensures coherence across agent work

**3. Integration Checkpoints**

Example from Backend Robustness:
```markdown
## Integration Checkpoint: Before Agent 3 Starts

**Prerequisites:**
✅ Agent 1: Backend port selection merged
✅ Agent 2: IPC handlers implemented
✅ Integration tests passing
✅ Type definitions exported

**Validation:**
Run: npm test -- ipc-port-discovery
Expected: All tests green

**If tests fail:** Do not proceed. Alert architecture agent.
```

This prevents downstream agents from building on broken foundations.

---

### Common Patterns Across All Projects

**Every Project Produces:**

1. **Planning Documents (1-3 files)**
   - Metadata block (status, owner, dates)
   - Phase breakdown with time estimates
   - Success criteria and metrics

2. **Phase Summaries (3-7 files)**
   - What was accomplished
   - Integration points for next phase
   - Testing validation performed
   - Completion checklist

3. **Integration Guides (1-3 files for multi-agent)**
   - Code examples for downstream agents
   - TypeScript type definitions
   - Success criteria per agent
   - Testing recommendations

4. **Testing Documentation (2-4 files)**
   - Test plans and coverage
   - Integration test results
   - Manual testing checklists
   - Performance benchmarks

5. **Completion Reports (1-2 files)**
   - Files created/modified summary
   - Lines of code metrics
   - Time invested
   - Artifact inventory

### The Self-Documenting Pattern

Projects document themselves as they progress:

```
Planning docs → Implementation guides → Phase summaries → Completion reports
```

Each phase documents what the next phase needs. The final summary shows the complete artifact inventory. This creates an audit trail of how the project evolved.

**The Pattern:** Documentation is a byproduct of the work, not an afterthought. Agents document for other agents, creating a coordination mechanism that scales.

---

## Real Frustrations & Surprises

### The Biggest Frustrations

#### 1. Test Suite Maintenance Hell

**The Pain:** This is my #1 frustration. We spend SO MUCH time maintaining tests and dealing with pre-commit/push issues.

**What This Looks Like:**
- Tests break on almost every feature change (sometimes 10-20 tests at once)
- Pre-commit hooks fail constantly: linting, type checking, translation validation
- Fixing the tests often takes longer than implementing the feature
- The tests themselves are brittle and need constant updating

**Rate of Change Makes It Worse:**
Here's the real kicker: when I'm spinning up 10+ agent projects simultaneously (which is entirely possible with this workflow), keeping all the tests aligned becomes exponentially harder. One change breaks tests in 3 other areas. Fixing those breaks tests elsewhere. It cascades.

**Is It Worth It?**
Probably. The tests do catch bugs and document behavior. But the maintenance cost is real and substantial. This absolutely slows velocity.

**Current Status:** Ongoing pain point. Not solved, still learning how to do this better.

#### 2. Managing Multiple Concurrent Agent Projects

**The Surprise:** My biggest bottleneck isn't agent capability—it's ME keeping track of what's happening.

**What This Looks Like:**
- 5-10 agent projects active at once
- Each in different stages: planning, implementation, testing, documentation
- Agents can stomp on each other's changes if I'm not careful
- I spend significant mental energy on coordination: "Wait for Project A to finish before starting Project B"

**Why It's Hard:**
- Agents don't know about each other unless I tell them
- Each agent project lives in its own context (chat session or GitHub workflow)
- I'm the only one who sees the whole picture

**What Helps:**
- Explicit dependency graphs in project plans
- Phase-based work (finish phase 1 completely before phase 2)
- Integration guides (Agent A documents what it built for Agent B)
- 21-day auto-archival forces me to finish or abandon

**Honest Assessment:** This is still hard. I make mistakes. Agents occasionally conflict. It's getting better with practice but remains a challenge.

#### 3. The One Time Everything Broke

**What Happened:**
Agents somehow got confused and reverted a ton of changes they had made earlier. I'm still not entirely sure how it happened—maybe context confusion, maybe I gave conflicting instructions.

**The Recovery:**
- Spent several hours manually cleaning up the mess
- Chat history saved me: I could go back to previous sessions and say "reapply this change intelligently"
- Claude would read the old chat, understand what was intended, and reimplement it correctly

**The Insight:**
Chat history is kind of an amazing new form of source control. It's not just code history—it's *intent* history. I could recover not just what was changed, but why and how it was supposed to work.

**Frequency:** This happened once in ~6 weeks. Not common, but when it happens, it's painful.

### What Actually Worked

#### 1. Infrastructure-First Investment

**The Pattern:** ~50% of commits go to infrastructure, docs, and testing (not features).

**Why It Works:**
- Automated docs stay current instead of going stale
- Weekly arch reviews catch drift before it compounds
- Pattern catalogs eliminate ambiguity for agents

**The Payoff:** Sustained velocity over time. Without this infrastructure, I'd be drowning in technical debt by now.

#### 2. Pattern Catalogs Over Prose

**What Changed:** Replaced narrative documentation with structured ALWAYS/NEVER patterns.

**Example:**
```markdown
❌ DON'T: Write "typically we validate user input before processing"
✅ DO: Write "ALWAYS validate user input. NEVER process unvalidated data."
```

**Result:** Agents make far fewer interpretation mistakes. When they do mess up, it's usually because the pattern catalog didn't cover the case.

#### 3. Ephemeral Project Folders (21-Day Auto-Archive)

**The System:** Projects older than 21 days automatically get archived.

**Why It Works:**
- Forces knowledge consolidation into permanent docs
- Prevents agents from reading stale planning documents
- Keeps workspace clean and context clear

**Unexpected Benefit:** Forces me to finish or abandon projects. No lingering half-done work.

#### 4. Two AI Systems Collaborating

**What's Happening:**
- ~70% of commits from Claude Code (VSCode agent)
- ~30% from GitHub Copilot (GitHub Actions agent)
- They don't directly communicate, but they work on the same codebase

**Why It's Interesting:**
This is two different AI systems, from different companies, running on different platforms, collaborating through shared code and documentation. Neither knows the other exists.

**The Insight:** The infrastructure (facts.json, pattern catalogs, integration guides) is what enables collaboration. It's not agent-to-agent communication—it's agent-to-infrastructure-to-agent.

### Surprises That Made Me Update My Mental Model

#### 1. Speed is Mind-Blowing (Even After Accounting for Problems)

**The Experience:** Idea → working feature happens faster than I can describe.

**Example:** "I want users to search employees by name with autocomplete" became a working feature with tests and docs in about 2 hours, including all the test maintenance and pre-commit fixing.

**Comparison:** Solo, this would have taken me a day or two of focused work. The agent did it while I was coordinating other projects.

#### 2. Everything Actually Completed

**The Surprise:** I genuinely can't think of a project that didn't complete.

**The Caveat:** Lots of iterations, lots of test fixes, lots of "try again differently." But nothing abandoned.

**Why This Surprised Me:** I expected more failures. Maybe I'm good at scoping? Maybe agents are more capable than expected? Maybe my success criteria are too loose? Not sure.

#### 3. Tests are Extensive but Maintenance-Heavy

**The Numbers:** 75,680 lines of test code. 232 test files. 92% backend coverage.

**The Reality:** Tests break constantly. Maintenance is a significant time sink.

**The Question I'm Still Pondering:** Is this a solvable problem, or is test maintenance just the new cost of doing business with agents?

### What I Still Don't Know

**Open Questions:**
- How does this scale beyond one person coordinating?
- Does test maintenance get better or worse as the codebase grows?
- What's the long-term maintenance burden (6 months? 1 year from now)?
- Would this work for highly regulated industries (healthcare, finance)?
- Can agents handle complex algorithmic work, or just CRUD + UI?

**Areas for Future Exploration:**
- Better multi-agent coordination mechanisms
- Reducing test brittleness systematically
- Understanding which types of work agents excel at vs. struggle with

---


## The Automation Flywheel

Here's how the pieces fit together:

```
1. Agent makes code change
   ↓
2. CI detects change type (component, docs, test)
   ↓
3. Smart workflows trigger:
   - Documentation regeneration
   - Visual regression testing
   - Affected test selection
   - Screenshot coverage updates
   ↓
4. Automated reviews run:
   - AI architectural review
   - Documentation audit
   - Performance benchmarks
   ↓
5. Issues auto-created for problems
   ↓
6. Agents read issues and fix problems
   ↓
7. Cycle repeats (sustained velocity)
```

**The Flywheel Effect:** Each automation makes the next one more valuable. Documentation automation enables visual regression testing. Visual regression testing enables component mapping. Component mapping enables impact analysis. Impact analysis enables smart test selection.

The system becomes more automated and efficient over time.

---

## Key Metrics Summary

### Development Velocity (Last 7 Days)

- 271 commits (38.7/day)
- 232,700 lines changed
- 21 PRs merged
- 100+ issues closed

### Infrastructure Investment

- 49 agent projects (31% feature, 49% infra+docs)
- 17 CI/CD workflows (4,051 lines)
- 6,032 lines automation scripts
- 13 agent profiles (3,480 lines)
- 38,159 lines internal docs

### Testing Investment

- 232 test files (75,680 lines)
- 92% backend coverage
- State-based waits and i18n-aware patterns
- Ongoing test maintenance required

### Codebase Scale

- 219 React components
- 46 backend modules
- 550+ markdown files
- 100% agent-written code (Claude Code + GitHub Copilot)

---

## Closing Thoughts

**What I Proved to Myself:**

- Agents can build real software with real UX, not just MVPs
- $400/mo is surprisingly affordable for this capability
- Test maintenance is still a major pain point that needs solving
- Speed from idea to working feature is genuinely shocking

**What I Still Don't Know:**

- How this scales beyond one person coordinating everything
- Whether test maintenance gets better or worse over time
- If this works for enterprise-scale concerns (security, multi-tenancy, compliance)
- What the long-term maintenance burden looks like (6 months? 1 year?)
- Whether the infrastructure investment stays at 50% or changes

**What I'm Happy to Share:**

- Agent definitions and prompting strategies that worked
- Architecture patterns and infrastructure setups
- Mistakes I made and how I recovered from them
- Project planning templates and coordination approaches
- The test maintenance challenges I haven't solved yet

**Reach Out:**

If you're experimenting with agent-driven development, I'd love to compare notes. What worked for you? What didn't? What am I missing? What have you figured out that I haven't?

**This isn't "the future of software development"** - it's field notes from one person's Christmas break experiment. Take what's useful, skip what's not, and let me know what you learn.

---

*Last updated: January 4, 2026*
