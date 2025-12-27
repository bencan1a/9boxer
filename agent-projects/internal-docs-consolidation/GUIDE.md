# Internal Documentation Consolidation Guide

**Project**: Internal Documentation Consolidation
**Issues**: #63-69
**Timeline**: 2 weeks (5.5 days focused work)
**Goal**: Create single source of truth for internal developer/agent documentation

---

## Vision & Goals

### Why We're Consolidating

Over time, internal developer documentation has drifted as agents created new documents for individual projects rather than updating existing ones. This has resulted in:

- **Duplication**: Multiple "how to" guides for the same topic (4 screenshot generation docs)
- **Conflicts**: Contradictory recommendations across documents
- **Discovery issues**: Agents can't quickly find the right information
- **Context bloat**: Too many overlapping files consume agent context windows

### Success Criteria

By the end of this consolidation:

1. ✅ **Single source of truth** per documentation category
2. ✅ **<5 duplicates** detected by weekly maintenance
3. ✅ **Clear navigation** from entry point → category → detail
4. ✅ **Agent-optimized** for rapid discovery without context bloat
5. ✅ **Current and accurate** - no stale content >30 days old
6. ✅ **Automated maintenance** to prevent future drift

### Key Principle

**Documentation is for AI agents, not humans.** Only agents write code in this repository. Optimize for:
- Quick discovery (clear hierarchy, meaningful filenames)
- Context efficiency (<100KB per entry point)
- Actionable guidance (commands, examples, patterns)
- Current state only (no migration history, no "prior states")

---

## Documentation Domains

### Internal Developer/Agent Documentation (This Project)

**Location**: `internal-docs/` → `internal-internal-docs/` (after Issue #67)
**Audience**: AI agents (Claude Code, GitHub Copilot)
**Purpose**: How to develop, test, build, and maintain the codebase
**Categories**: Agent instructions, architecture, design system, testing, i18n, contributing

### User-Facing Documentation (Separate Project)

**Location**: `resources/user-guide/internal-docs/`
**Audience**: End users of the 9Boxer application
**Purpose**: How to use the application, upload data, export reports
**Project**: Self-Managing Docs System (Issues #51-#62)
**DO NOT**: Duplicate or interfere with user documentation

### Clear Separation

| Aspect | Internal Docs | User Docs |
|--------|--------------|-----------|
| **Location** | `internal-internal-docs/` | `resources/user-guide/internal-docs/` |
| **Audience** | Agents | End users |
| **Topics** | Code, architecture, testing | Features, workflows, UI |
| **Screenshots** | Visual regression tests | UI screenshots |
| **Maintenance** | This project | Self-managing system |

---

## Target Documentation Structure

### Root Level (Agent Entry Points)

```
Root:
├── CLAUDE.md              ← Primary agent entry (<100KB)
│   - Comprehensive reference
│   - Links to all categories
│   - Common commands
│   - Critical warnings (Windows, venv, etc.)
│
├── AGENTS.md              ← Quick reference (<10KB)
│   - Command cheatsheet
│   - Fast lookup
│   - Common workflows
│
├── GITHUB_AGENT.md        ← GitHub Copilot onboarding
│   - Copilot-specific setup
│   - Environment configuration
│   - Quick start for GitHub agents
│
├── README.md              ← Project overview
│   - For humans and agents
│   - Features, tech stack
│   - Installation
│
└── BUILD.md, DEPLOYMENT.md ← Build guides
    - Keep in root (widely referenced)
```

**Principles**:
- **<5 root-level .md files** for agent instructions
- **No duplicates** - remove QUICK_REFERENCE.md, QUICKSTART.md from root
- **Clear hierarchy** - CLAUDE.md links to categories, not vice versa

---

### internal-internal-docs/ (After Rename)

```
internal-internal-docs/
├── README.md              ← Documentation map
│   - Overview of all categories
│   - Quick navigation links
│   - How to find what you need
│
├── QUICK_REFERENCE.md     ← Command cheatsheet (THE authoritative version)
│
├── architecture/          ← System design
│   ├── README.md          - Architecture overview
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── GUIDELINES.md
│   └── metrics.md
│
├── design-system/         ← UI guidelines ✅ EXEMPLARY
│   ├── README.md          - Design system overview
│   ├── design-tokens.md   - All design constants
│   ├── component-inventory.md - 32 components
│   ├── component-guidelines.md
│   ├── layout-patterns.md
│   ├── interaction-patterns.md
│   ├── accessibility-standards.md
│   └── linting-rules.md
│
├── testing/               ← Test strategies
│   ├── README.md          - Testing overview
│   ├── test-principles.md - Core philosophy
│   ├── quick-reference.md - Fast lookup
│   ├── testing-checklist.md
│   ├── playwright-architecture-review.md
│   ├── playwright-best-practices-checklist.md
│   ├── visual-regression-testing.md ← Visual tests for app
│   └── test-suites.md
│
├── i18n/                  ← Internationalization
│   ├── README.md          - i18n overview
│   ├── glossary.md        - Translation terms
│   ├── migration-patterns.md
│   ├── adding-new-strings.md
│   └── testing-guide.md
│
├── contributing/          ← Documentation writing
│   ├── README.md          - Contributing overview
│   ├── documentation-writing-guide.md - Comprehensive guide
│   ├── voice-and-tone-guide.md - Style reference
│   └── screenshot-guide.md - Technical standards for user docs
│
└── _generated/            ← Auto-generated (DO NOT EDIT)
    ├── api/               - API docs from pdoc3
    └── plans_index.md     - Active plans summary
```

**Principles**:
- **Category folders** group related docs
- **README.md per category** provides overview and navigation
- **No root-level duplicates** - one authoritative location per topic
- **_generated/ is sacred** - never manually edit

---

## Success Criteria Per Category

### 1. Agent Instructions (Issue #63)

**Files**: CLAUDE.md, AGENTS.md, GITHUB_AGENT.md

**Success Criteria**:
- ✅ CLAUDE.md <100KB, comprehensive, links to all categories
- ✅ AGENTS.md <10KB, quick reference only
- ✅ GITHUB_AGENT.md focused on Copilot-specific setup
- ✅ No duplicate QUICK_REFERENCE.md in root
- ✅ No duplicate QUICKSTART.md in root
- ✅ Stale files removed: IMPLEMENTATION_*.md, WORKFLOW_ENHANCEMENTS.md
- ✅ Clear navigation: Entry point → Category → Detail

**Quality Checklist**:
- [ ] CLAUDE.md has "Read this first" section with category links
- [ ] All file paths use forward slashes (cross-platform)
- [ ] Virtual environment activation prominently featured
- [ ] Windows-specific warnings preserved (Bash tool, reserved names)
- [ ] Recent commits referenced (verify currency)

**Red Flags**:
- ❌ Duplicate content between CLAUDE.md and AGENTS.md
- ❌ Outdated examples that don't match current code
- ❌ Broken links to category docs

---

### 2. Architecture & Build (Issue #64)

**Files**: internal-internal-docs/architecture/*, BUILD.md, DEPLOYMENT.md, frontend/BUILD.md

**Success Criteria**:
- ✅ Architecture docs verified current (check recent commits)
- ✅ BUILD.md and DEPLOYMENT.md remain in root (widely referenced)
- ✅ frontend/BUILD.md remains in place (frontend-specific)
- ✅ Workflow docs consolidated (WORKFLOWS.md, .github/workflows/README.md)
- ✅ No contradictory build instructions

**Quality Checklist**:
- [ ] Architecture reflects current system (verify against codebase)
- [ ] ADRs (if used) follow consistent format
- [ ] Build instructions tested on Windows
- [ ] No references to legacy Docker deployment (dormant)
- [ ] PyInstaller config matches actual ninebox.spec

**Red Flags**:
- ❌ Stale architecture diagrams (>6 months old)
- ❌ Build steps that don't work
- ❌ References to removed features

---

### 3. Design System & Testing (Issue #65)

**Files**: internal-internal-docs/design-system/*, internal-internal-docs/testing/*

**Success Criteria**:

**Design System** (already excellent):
- ✅ Verify completeness (11 files, all current)
- ✅ Component inventory reflects actual components (32 components)
- ✅ Design tokens match frontend/src/theme/tokens.ts
- ✅ No changes needed - maintain quality

**Testing**:
- ✅ Remove internal-docs/playwright-best-practices.md (use internal-internal-docs/testing/ versions)
- ✅ Archive stale files: FINAL_SUMMARY.md, OPTION_C_REDESIGN_PLAN.md, PLAYWRIGHT_FIXES_STATUS.md
- ✅ Verify backend/README_TESTS.md aligns with internal-internal-docs/testing/
- ✅ Visual regression docs in internal-internal-docs/testing/ (NOT user doc screenshots)

**Quality Checklist - Design System**:
- [ ] Component inventory count matches actual components (verify with glob)
- [ ] Design tokens examples use `theme.tokens.*` syntax
- [ ] Accessibility standards reference WCAG 2.1 Level AA
- [ ] Linting rules match frontend/.eslintrc.cjs

**Quality Checklist - Testing**:
- [ ] Test suite counts match actual test counts (verify with pytest)
- [ ] Playwright patterns reflect current helpers (frontend/playwright/helpers/)
- [ ] Visual regression docs separate from user doc screenshots
- [ ] All test commands work (pytest, npm test, npm run test:e2e:pw)

**Red Flags**:
- ❌ Component count mismatch (inventory vs actual)
- ❌ Duplicate Playwright docs in multiple locations
- ❌ Testing docs referencing removed Cypress (replaced by Playwright)

---

### 4. i18n, Contributing & Screenshot Standards (Issue #66)

**Files**: internal-internal-docs/i18n/*, internal-internal-docs/contributing/*, internal-docs/contributing/screenshot-guide.md

**Success Criteria**:

**i18n**:
- ✅ Verify internal-internal-docs/i18n/* complete (7 files)
- ✅ Glossary current and comprehensive
- ✅ Migration patterns reflect actual i18n implementation

**Contributing**:
- ✅ Consolidate contributing guidelines
- ✅ Optimize for agents (not humans - no human contributors)
- ✅ Voice/tone guide for agent-generated docs

**Screenshot Standards** (CRITICAL - separation of concerns):
- ✅ Keep internal-docs/contributing/screenshot-guide.md (technical standards for user docs)
- ✅ **Acknowledge** self-managing system (Issues #51-62) handles user doc screenshot automation
- ✅ Remove internal-docs/screenshots-readme.md (outdated)
- ✅ **DO NOT duplicate** frontend/playwright/screenshots/ docs (managed by self-managing system)
- ✅ Clear separation: user doc automation vs. technical standards

**Quality Checklist - i18n**:
- [ ] Glossary covers all common UI terms
- [ ] Migration patterns match actual translation files
- [ ] Testing guide references actual i18n tests

**Quality Checklist - Contributing**:
- [ ] Writing guide optimized for agents (clear, actionable)
- [ ] Screenshot guide covers technical specs only (resolution, format, annotations)
- [ ] Voice/tone examples use actual project language

**Quality Checklist - Screenshot Separation**:
- [ ] No duplication of frontend/playwright/screenshots/HOWTO.md content
- [ ] Clear note: "User doc screenshots managed by Issues #51-62"
- [ ] Only technical standards remain (not automation workflows)

**Red Flags**:
- ❌ Duplicate screenshot generation instructions (conflicts with #51-62)
- ❌ Outdated i18n patterns (don't match current implementation)
- ❌ Human-focused language (should be agent-optimized)

---

### 5. Rename internal-docs/ → internal-internal-docs/ (Issue #67)

**Success Criteria**:
- ✅ Directory renamed using `git mv docs internal-docs`
- ✅ All references updated in:
  - CLAUDE.md
  - AGENTS.md
  - GITHUB_AGENT.md
  - README.md
  - CONTRIBUTING.md (if kept)
  - pyproject.toml
  - .github/workflows/docs.yml
  - tools/build_context.py
- ✅ .gitignore updated if needed
- ✅ All documentation links work
- ✅ CI/CD passes

**Quality Checklist**:
- [ ] Search codebase for `internal-docs/` references (grep -r "internal-docs/" --include="*.md" --include="*.toml" --include="*.yml" --include="*.py")
- [ ] Test build_context.py runs successfully
- [ ] Test documentation builds (if using MkDocs or similar)
- [ ] Verify no broken links (check all README.md files)
- [ ] CI/CD workflows pass

**Red Flags**:
- ❌ Broken links after rename
- ❌ build_context.py fails
- ❌ CI/CD failures

---

### 6. Weekly Maintenance Workflow (Issue #68)

**Success Criteria**:
- ✅ GitHub Actions workflow created/updated (.github/workflows/docs.yml)
- ✅ Weekly schedule configured (Monday 2 AM UTC)
- ✅ Manual trigger available (workflow_dispatch)
- ✅ Agent task template created (.github/agent-tasks/internal-docs-maintenance.md)
- ✅ Marker file mechanism works (.github/.internal-docs-maintenance-marker)
- ✅ Tested with manual run

**Agent Task Template Requirements**:

The template should instruct agents to:
1. **Inventory**: Find all .md files in internal-internal-docs/ modified since last run
2. **Detect duplications**: Similar filenames, overlapping content
3. **Consolidate**: Merge into canonical sources (prefer newer, descending date order)
4. **Ask user**: For guidance on conflicting recommendations
5. **Archive**: Move superseded docs → internal-internal-docs/archive/YYYY-MM-DD/
6. **Update**: Run tools/build_context.py
7. **Report**: Create PR with changes + maintenance report

**Quality Checklist**:
- [ ] Workflow triggers on schedule and manual dispatch
- [ ] Marker file updates with current timestamp
- [ ] Issue creation includes context (files changed, last run date)
- [ ] Agent template is clear and actionable
- [ ] Tested with manual workflow_dispatch trigger

**Red Flags**:
- ❌ Workflow doesn't trigger on schedule
- ❌ Marker file not updating
- ❌ Agent template too vague

---

### 7. AI Audit Integration (Issue #69)

**Success Criteria**:
- ✅ Extends .github/scripts/ai-docs-audit.js from Issue #57
- ✅ Analyzes internal-internal-docs/ for drift, conflicts, staleness
- ✅ Creates separate issues for user docs vs. internal docs
- ✅ Weekly audit covers both documentation domains
- ✅ Cost remains ~$2-4/month (single audit run)

**Internal Docs Analysis Should Check**:
- Conflicting recommendations in internal docs
- New features not documented in CLAUDE.md
- Outdated agent instructions
- Testing docs not reflecting current patterns
- Stale examples (>30 days without verification)

**Quality Checklist**:
- [ ] AI prompt includes internal-internal-docs/ analysis
- [ ] Separate issue labels: user-documentation vs. internal-documentation
- [ ] Single weekly audit (combined user + internal)
- [ ] Test with sample internal docs changes
- [ ] Cost monitoring (Anthropic API usage)

**Red Flags**:
- ❌ Duplicate audits (should be single run)
- ❌ Cost exceeds budget ($2-4/month)
- ❌ Too many false positives

---

## Decision-Making Framework

### When Consolidating Documents

**Prefer newer over older** (descending date order):
```bash
# Check file creation/modification dates
git log --follow --format=%ai --reverse -- file.md | head -1  # Creation
git log -1 --format=%ai -- file.md                            # Last modified
```

**Prefer established locations**:
- ✅ `internal-internal-docs/testing/` over root `internal-docs/`
- ✅ Category README.md over scattered files
- ✅ Comprehensive guides over partial coverage

**Prefer agent-optimized language**:
- ✅ "Run `pytest backend/tests/`" (actionable)
- ❌ "You might want to consider running tests" (vague)
- ✅ Present tense, active voice
- ❌ Passive voice, conditional language

### When in Doubt

**Ask the user** for guidance on:
- Conflicting recommendations
- Which version to keep when dates are similar
- Whether to delete or archive

**Archive rather than delete**:
```bash
# Move to archive with date
mkdir -p internal-internal-docs/archive/2025-12-26
git mv old-file.md internal-internal-docs/archive/2025-12-26/
```

**Document your decision**:
- In PR description: "Consolidated X into Y because..."
- In maintenance report: "Archived Z due to..."

### Red Flags to Avoid

**❌ Don't create these problems**:
- Hardcoded absolute paths (use relative paths)
- Contradictory recommendations between docs
- Duplicate content in multiple locations
- Stale examples that don't match current code
- References to removed features
- Broken links after consolidation

**✅ Do create these solutions**:
- Clear navigation hierarchy
- Single source of truth per topic
- Current examples (tested within 30 days)
- Cross-references to related docs
- Archive folder with dates for superseded content

---

## Quality Standards

Every category should have:

### 1. README.md
- Overview of the category
- File index with descriptions
- Links to related categories
- Last updated date

### 2. Single Source of Truth
- One authoritative file per topic
- No conflicting versions
- Clear "see also" references if related

### 3. Currency
- Updated within last 30 days OR
- Verified current (note in doc: "Verified current: YYYY-MM-DD")
- Examples that work today

### 4. Agent-Optimized
- Clear, concise, actionable
- Commands copy-pasteable
- Examples with actual file paths
- No unnecessary prose

### 5. Examples
- Real code snippets from the codebase
- Working commands (tested)
- Actual file paths (verified exist)

### 6. Cross-References
- Links to related internal docs
- References to external resources
- Clear dependency chains

---

## Integration Points

### Self-Managing Docs System (Issues #51-62)

**What it handles**:
- User documentation screenshots (resources/user-guide/internal-docs/)
- Storybook componentization for screenshot generation
- Automated screenshot regeneration on UI changes
- AI audit for user documentation staleness

**How we integrate**:
- Issue #66: Acknowledge their system, don't duplicate
- Issue #69: Extend their AI audit (#57) for internal docs
- Weekly schedule: Both use Monday 2 AM UTC

**What we DON'T touch**:
- ❌ frontend/playwright/screenshots/ automation docs
- ❌ resources/user-guide/internal-docs/ content
- ❌ User-facing screenshot generation workflows

### Weekly Automation (Issue #68)

**Complements self-managing system**:
- Self-managing: User docs (screenshots, components)
- This project: Internal docs (agent instructions, architecture)
- Shared schedule: Monday 2 AM UTC
- Shared infrastructure: GitHub Actions, marker files

### AI Audit (Issue #69)

**Extends Issue #57**:
- Issue #57 creates AI audit script for user docs
- Issue #69 extends it for internal docs
- Single weekly run analyzes both domains
- Separate issue creation (user-documentation vs. internal-documentation labels)
- Cost: ~$2-4/month combined

---

## Examples of Good Documentation

### ✅ Exemplary: internal-internal-docs/design-system/

**Why it's excellent**:
- Comprehensive (11 files covering all aspects)
- Well-organized (clear hierarchy, logical grouping)
- Current (verified against codebase)
- Actionable (real examples from theme/tokens.ts)
- Single source of truth (no duplicates)

**File structure**:
```
design-system/
├── README.md                      ← Overview + navigation
├── design-tokens.md               ← THE source of truth for constants
├── component-inventory.md         ← 32 components cataloged
├── component-guidelines.md        ← Patterns and best practices
├── layout-patterns.md             ← UI zones and layout
├── interaction-patterns.md        ← Animations, drag-drop
├── accessibility-standards.md     ← WCAG 2.1 Level AA
├── linting-rules.md               ← ESLint enforcement
├── color-palette.md               ← Color system
├── design-principles.md           ← Philosophy
└── migration-summary.md           ← Current status
```

**Use this as the gold standard** for organizing other categories.

---

### ✅ Good: internal-internal-docs/testing/quick-reference.md

**Why it's good**:
- Fast lookup (commands only, minimal prose)
- Organized by task (run tests, debug, coverage)
- Current (commands work)
- Cross-references detailed guides

**Pattern to follow**:
```markdown
# Quick Reference: Testing

## Run All Tests
```bash
pytest
```

## Run Specific Suite
```bash
pytest backend/tests/unit/          # Fast
pytest backend/tests/integration/   # Medium
pytest backend/tests/e2e/           # Slow
```

See [test-principles.md](test-principles.md) for philosophy.
```

---

### ❌ Bad: Multiple "How to Create Screenshots" Docs

**Before consolidation** (4 competing sources):
- `frontend/playwright/screenshots/HOWTO.md`
- `frontend/playwright/screenshots/SCREENSHOT_GENERATION_GUIDE.md`
- `internal-docs/screenshots-readme.md` (outdated)
- `agent-projects/screenshot-generation-overhaul/maintenance.md` (archived project)

**Why it's bad**:
- Duplication (same info in 4 places)
- Conflicts (different instructions)
- Confusion (which one is authoritative?)
- Context bloat (agents read all 4)

**After consolidation** (clear separation):
- `internal-internal-docs/contributing/screenshot-guide.md` - Technical standards only
- `frontend/playwright/screenshots/*` - Managed by self-managing system (#51-62)
- User doc screenshots automated, internal docs have standards

---

## Common Scenarios

### Scenario 1: Found Duplicate Content

**Question**: Found same content in `internal-docs/quick-reference.md` and root `QUICK_REFERENCE.md`. Which to keep?

**Answer**:
1. Check file dates: `git log --follow --format=%ai -- <file>`
2. Prefer established location: `internal-internal-docs/QUICK_REFERENCE.md` (after rename)
3. Archive root version:
   ```bash
   git mv QUICK_REFERENCE.md internal-internal-docs/archive/2025-12-26/
   ```
4. Document in PR: "Removed duplicate root QUICK_REFERENCE.md, kept internal-internal-docs/ version"

---

### Scenario 2: Conflicting Recommendations

**Question**: File A says "use pytest -v", File B says "use pytest --verbose". Both recent.

**Answer**:
1. Check current practice: `grep -r "pytest" .github/workflows/`
2. Ask user: "Found conflicting pytest recommendations. Which is preferred?"
3. Consolidate based on answer
4. Archive losing version with note

---

### Scenario 3: Stale Content

**Question**: Found guide with examples from 6 months ago. Code has changed. What to do?

**Answer**:
1. Verify if core concept still valid
2. Update examples to current code
3. Test examples work
4. Add verification note: "Verified current: 2025-12-26"
5. If fundamentally obsolete → archive

---

### Scenario 4: Should This Be Archived or Deleted?

**Archive** (move to `internal-internal-docs/archive/YYYY-MM-DD/`) if:
- ✅ Historically useful (shows evolution)
- ✅ Might be referenced later
- ✅ Contains unique information worth preserving
- ✅ When in doubt

**Delete** (git rm) if:
- ✅ Purely duplicate (exact copy elsewhere)
- ✅ Generated file (can be regenerated)
- ✅ Truly useless (random notes, TODO lists)

**When in doubt → Archive**

---

## Verification Checklist

After completing each issue, verify:

### All Issues
- [ ] No duplicate content in multiple locations
- [ ] All file paths use forward slashes (cross-platform)
- [ ] All links work (no 404s)
- [ ] Examples use actual files from codebase
- [ ] No references to removed features
- [ ] Git history preserved (used `git mv` for renames)

### Issue #63 (Agent Instructions)
- [ ] CLAUDE.md <100KB
- [ ] AGENTS.md <10KB
- [ ] No root-level QUICK_REFERENCE.md or QUICKSTART.md
- [ ] Clear navigation from CLAUDE.md to categories

### Issue #64 (Architecture & Build)
- [ ] Architecture verified against recent commits
- [ ] Build commands work on Windows
- [ ] Workflow docs consolidated

### Issue #65 (Design & Testing)
- [ ] Design system component count matches actual (verify with glob)
- [ ] No internal-docs/playwright-best-practices.md
- [ ] Stale testing files archived

### Issue #66 (i18n & Contributing)
- [ ] Screenshot separation clear (user docs vs. standards)
- [ ] No duplication with frontend/playwright/screenshots/
- [ ] i18n patterns match actual implementation

### Issue #67 (Rename)
- [ ] All `internal-docs/` references updated to `internal-internal-docs/`
- [ ] build_context.py runs successfully
- [ ] CI/CD passes

### Issue #68 (Weekly Maintenance)
- [ ] Workflow triggers on schedule
- [ ] Manual trigger works
- [ ] Marker file updates

### Issue #69 (AI Audit)
- [ ] Extends script from Issue #57
- [ ] Separate issue labels work
- [ ] Cost within budget

---

## Success Metrics

Track these to measure effectiveness:

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Duplicate files | ~25 | <5 | Weekly maintenance reports |
| Root-level docs | ~15 | <7 | `ls *.md | wc -l` in root |
| Context per entry | N/A | <100KB | `wc -c CLAUDE.md` |
| Broken links | Unknown | 0 | Link checker in CI |
| Stale docs (>30d) | Unknown | <3 | Weekly AI audit |
| Categories with README | 6/10 | 10/10 | Manual check |

---

## Questions & Escalation

### When to Ask the User

**MUST ask**:
- Conflicting recommendations (which is correct?)
- Delete vs. archive decision for important files
- New structure that differs from existing patterns
- Breaking changes to documentation hierarchy

**CAN proceed**:
- Archiving clearly superseded files
- Removing obvious duplicates
- Updating stale examples to current code
- Consolidating similar content (prefer newer)

### How to Ask

**Good**:
> "Found conflicting pytest recommendations in `internal-docs/testing/quick-reference.md` (says `pytest -v`) and `backend/README_TESTS.md` (says `pytest --verbose`). Both files modified within last month. Which is the preferred standard?"

**Bad**:
> "There's some conflict in the testing docs. What should I do?"

---

## Final Checklist

Before marking consolidation complete:

- [ ] All 7 issues (#63-69) completed
- [ ] Single source of truth per category
- [ ] No duplicates (verified with search)
- [ ] All links work (no broken references)
- [ ] CI/CD passes
- [ ] build_context.py runs successfully
- [ ] Weekly maintenance workflow tested
- [ ] AI audit integration tested
- [ ] Documentation verified current (<30 days or noted)
- [ ] This guide archived to internal-internal-docs/ for future reference

---

## Related Documents

- **Project Plan**: `agent-projects/internal-docs-consolidation/plan.md`
- **GitHub Issues**: [#63](https://github.com/bencan1a/9boxer/issues/63) - [#69](https://github.com/bencan1a/9boxer/issues/69)
- **Milestones**: [Phase 1-4](https://github.com/bencan1a/9boxer/milestones)
- **Project Board**: [Internal Documentation Consolidation](https://github.com/users/bencan1a/projects/2)
- **Self-Managing Docs**: `agent-projects/self-managing-docs-system/` (Issues #51-62)

---

**Last Updated**: 2025-12-26
**Status**: Active
**Owner**: Development Team
