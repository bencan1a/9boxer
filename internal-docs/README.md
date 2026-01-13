# Internal Developer Documentation

This directory contains **internal developer and AI agent documentation** for the 9Boxer codebase.

## Documentation Map

Quick navigation to all documentation categories:

### Core Entry Points

- **[CLAUDE_INDEX.md](../CLAUDE_INDEX.md)** - Primary Claude Code entry point (quick start index with task-based navigation)
- **[AGENTS.md](../AGENTS.md)** - Development workflow guide (command cheatsheet and workflows)
- **[GITHUB_AGENT.md](../GITHUB_AGENT.md)** - GitHub Copilot onboarding guide
- **[README.md](../README.md)** - Project overview
- **[architecture/build-process.md](architecture/build-process.md)**, **[architecture/deployment.md](architecture/deployment.md)** - Build and deployment guides

### Documentation Categories

#### Architecture & System Design

- **[architecture/](architecture/)** - System architecture, design decisions, patterns
  - [README.md](architecture/README.md) - Architecture overview
  - [SYSTEM_ARCHITECTURE.md](architecture/SYSTEM_ARCHITECTURE.md) - Complete system design

#### Design System & UI Guidelines

- **[design-system/](design-system/)** - UI components, design tokens, patterns ✅ EXEMPLARY
  - [README.md](design-system/README.md) - Design system overview
  - [design-tokens.md](design-system/design-tokens.md) - All design constants
  - [component-inventory.md](design-system/component-inventory.md) - 32 components cataloged
  - [component-guidelines.md](design-system/component-guidelines.md) - Component patterns
  - [accessibility-standards.md](design-system/accessibility-standards.md) - WCAG 2.1 Level AA
  - [layout-patterns.md](design-system/layout-patterns.md) - UI zones and layout
  - [interaction-patterns.md](design-system/interaction-patterns.md) - Animations, drag-drop
  - [color-palette.md](design-system/color-palette.md) - Color system
  - [design-principles.md](design-system/design-principles.md) - Design philosophy
  - [linting-rules.md](design-system/linting-rules.md) - ESLint configuration

#### Testing

- **[testing/](testing/)** - Test strategies, patterns, best practices
  - [README.md](testing/README.md) - Testing overview
  - [test-principles.md](testing/test-principles.md) - Core testing philosophy
  - [quick-reference.md](testing/quick-reference.md) - Fast command lookup
  - [testing-checklist.md](testing/testing-checklist.md) - Pre-commit checklist
  - [test-suites.md](testing/test-suites.md) - Test suite organization
  - [playwright-architecture-review.md](testing/playwright-architecture-review.md) - Playwright E2E architecture
  - [playwright-best-practices-checklist.md](testing/playwright-best-practices-checklist.md) - E2E best practices
  - [visual-regression-testing.md](testing/visual-regression-testing.md) - Visual testing strategies
  - [SUITE_SUMMARY.md](testing/SUITE_SUMMARY.md) - Test suite metrics
  - [PLAYWRIGHT_REVIEW_SUMMARY.md](testing/PLAYWRIGHT_REVIEW_SUMMARY.md) - Playwright implementation review
  - [templates/](testing/templates/) - Test templates (backend, component, E2E)

#### CI/CD & Reliability

See **[testing/README.md](testing/README.md)** - CI/CD Integration section for Makefile architecture, adding checks, and troubleshooting

#### Internationalization (i18n)

- **[i18n/](i18n/)** - Translation patterns, glossary, testing
  - [README.md](i18n/README.md) - i18n overview
  - [glossary.md](i18n/glossary.md) - Translation terms
  - [migration-patterns.md](i18n/migration-patterns.md) - i18n implementation patterns

#### Contributing & Documentation Writing

- **[contributing/](contributing/)** - Documentation writing standards, style guides (5 files)
  - [README.md](contributing/README.md) - Contributing overview
  - [documentation-writing-guide.md](contributing/documentation-writing-guide.md) - Comprehensive writing guide
  - [voice-and-tone-guide.md](contributing/voice-and-tone-guide.md) - Style reference (DO's and DON'Ts)
  - [screenshot-guide.md](contributing/screenshot-guide.md) - Technical screenshot standards
  - [user-personas.md](contributing/user-personas.md) - User personas for documentation

### Reference Documentation

- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - Environment detection and adaptive setup
- **[PLATFORM_CONSTRAINTS.md](PLATFORM_CONSTRAINTS.md)** - Platform-specific constraints (Windows, Linux, macOS)
- **[CONTEXT.md](CONTEXT.md)** - Comprehensive project context for AI agents (~150KB)
- **[SUMMARY.md](SUMMARY.md)** - Quick index of all documentation components
- **[facts.json](facts.json)** - Stable project truths (highest authority)

### Auto-Generated Documentation

- **[_generated/](_generated/)** - Auto-generated docs (DO NOT EDIT MANUALLY)
  - [api/](_generated/api/) - API documentation from Python docstrings (via pdoc3)
  - [plans_index.md](_generated/plans_index.md) - Active project plans summary

### Archive

- **[archive/](archive/)** - Superseded documentation (organized by date)

### Documentation History

The 9Boxer documentation has evolved through several consolidation phases to improve clarity and reduce duplication:

**[archive/2025-12-29/](archive/2025-12-29/)** - CLAUDE.md optimization
- **Reason:** Performance optimization (43.5 KB → 14 KB, 72% reduction)
- **Changes:** Replaced monolithic CLAUDE.md with layered CLAUDE_INDEX.md + specialized docs
- **Result:** Better navigation, 0% duplication, environment detection

**[archive/2026-01-02/](archive/2026-01-02/)** - Root-level documentation consolidation
- **Reason:** Establish internal-docs/ as canonical source of truth
- **Changes:** Moved BUILD.MD, DEPLOYMENT.MD, DESIGN_SYSTEM.MD into internal-docs/
- **Result:** Single source of truth, reduced 70% overlap, clearer structure

**Current consolidations (2026-01-12):**
- Merged CI/CD documentation (internal-docs/cicd/) into testing/README.md
- Consolidated screenshot coverage tracking into contributing/screenshot-guide.md

See archive READMEs for complete consolidation history and rationale.

---

## How to Find What You Need

### I want to...

**...understand the codebase architecture**
→ Start with [architecture/SYSTEM_ARCHITECTURE.md](architecture/SYSTEM_ARCHITECTURE.md) or [CLAUDE_INDEX.md](../CLAUDE_INDEX.md)

**...create or modify UI components**
→ Read [design-system/README.md](design-system/README.md) first (MANDATORY)

**...write tests**
→ See [testing/test-principles.md](testing/test-principles.md) and [testing/quick-reference.md](testing/quick-reference.md)

**...add translations**
→ Follow [i18n/migration-patterns.md](i18n/migration-patterns.md)

**...write user documentation**
→ Follow [contributing/voice-and-tone-guide.md](contributing/voice-and-tone-guide.md) and [contributing/documentation-writing-guide.md](contributing/documentation-writing-guide.md)

**...understand GitHub Actions workflows**
→ See [testing/README.md](testing/README.md) (CI/CD Integration section)

**...add a new code quality check**
→ Follow [testing/README.md](testing/README.md) (CI/CD Integration section) and [AGENTS.md](../AGENTS.md)

**...troubleshoot CI failures**
→ See [testing/README.md](testing/README.md) (CI/CD Integration → Troubleshooting CI Failures)

**...understand agent documentation system**
→ Read [AGENT_DOCS_CONTRACT.md](AGENT_DOCS_CONTRACT.md)

**...find quick command references**
→ See [AGENTS.md](../AGENTS.md)

---

## Documentation Principles

This documentation is **optimized for AI agents**, not humans. Only agents write code in this repository.

### Key Principles

1. **Agent-Optimized Language**
   - Present tense, active voice
   - Actionable commands (not suggestions)
   - No unnecessary prose
   - Examples with actual file paths

2. **Current State Only**
   - Document "how it works now", not "changed from X to Y"
   - No migration history in permanent docs
   - Agents have no memory of past implementations

3. **Single Source of Truth**
   - One authoritative location per topic
   - No conflicting versions
   - Clear cross-references if related

4. **Context Efficiency**
   - <100KB per main entry point (CLAUDE.md, CONTEXT.md)
   - Category folders group related docs
   - Quick navigation with clear hierarchy

5. **Anti-Proliferation**
   - Update existing docs, don't create new ones
   - Use `agent-tmp/` for temporary work (auto-deleted after 7 days)
   - Use `agent-projects/<project>/` for ephemeral plans (<21 days)

6. **Documentation Consolidation**
   - Group related documentation into category folders
   - Archive superseded documentation (don't delete)
   - Remove migration history from permanent docs
   - Consolidate overlapping content into single authoritative files
   - See [Documentation Consolidation](#documentation-consolidation-approach) below

### Trust Hierarchy (when information conflicts)

1. **[facts.json](facts.json)** - Highest authority, hand-maintained
2. **Permanent content in `internal-docs/`** - Established documentation
3. **Active plans summaries** - Hints only, not authoritative

---

## Maintenance

### Automated Maintenance

Documentation is automatically maintained via:

- **tools/build_context.py** - Regenerates CONTEXT.md, SUMMARY.md, API docs, cleans agent-tmp/
- **GitHub Actions** - Runs on push and nightly at 2 AM UTC
- **Weekly audit** - AI-powered documentation audit (Mondays 2 AM UTC)

### Documentation Automation System

The project includes an AI-powered documentation audit system that automatically identifies documentation issues and creates consolidated GitHub issues.

#### Overview

**Script:** `.github/scripts/ai-docs-audit.js`
**Workflow:** `.github/workflows/docs-audit.yml`
**Schedule:** Every Monday at 2 AM UTC (manual trigger available)

The audit system performs **two separate analyses** using Claude API:

1. **Internal Documentation Audit** (for AI agents)
   - Reviews: CLAUDE.md, internal-docs/, agent instructions
   - Detects: outdated guidance, missing features, conflicts, consolidation opportunities
   - Output: Consolidated GitHub issue with `internal-documentation` label

2. **User Documentation Audit** (for end users)
   - Reviews: resources/user-guide/ (with full content for cross-reference analysis)
   - Detects: outdated instructions, missing features, incorrect info, screenshot needs, accessibility issues
   - Output: Consolidated GitHub issue with `user-documentation` label

#### Key Features

- **Active Consolidation**: Identifies new internal docs created in last 30 days and recommends merging into core docs
- **Separate Analysis**: Internal and user docs analyzed with different contexts and criteria
- **Priority Indicators**: Visual priority markers (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low)
- **Full Context**: User docs analyzed with full content to identify cross-references
- **Consolidated Issues**: One issue per documentation type with tasks grouped by priority

#### Issue Types

**Internal Docs:**
- `outdated` - Agent instructions that no longer match current code
- `missing` - New features not in CLAUDE.md or internal docs
- `conflict` - Contradictory guidance in different docs
- `consolidation` - New docs that should be merged into core docs
- `stale-example` - Code examples >30 days old without verification

**User Docs:**
- `outdated` - Documentation that no longer reflects current UI/features
- `missing` - New user-visible features not documented
- `incorrect` - Instructions that don't match actual behavior
- `screenshot-needed` - Screenshots that may be outdated
- `accessibility` - Missing alt text, poor heading hierarchy
- `localization` - Idioms or complex language that won't translate well

#### Usage

**Manual Trigger:**
```bash
# Via GitHub CLI
gh workflow run docs-audit.yml
gh workflow run docs-audit.yml -f days=14 -f dry_run=true

# Via GitHub UI: Actions → AI Documentation Audit → Run workflow
```

**Local Testing:**
```bash
# Set up environment
export ANTHROPIC_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"

# Run audit (dry run mode)
node .github/scripts/ai-docs-audit.js --dry-run

# Run audit for last 14 days
node .github/scripts/ai-docs-audit.js --days=14
```

#### Cost Estimation

- **Model:** `claude-sonnet-4-5-20250929`
- **Internal docs audit:** ~$0.30-0.50 per run (15K-25K input tokens)
- **User docs audit:** ~$0.40-0.80 per run (20K-40K input tokens, full content)
- **Total per audit:** ~$0.70-1.30
- **Monthly cost:** ~$2.80-5.20 (4 weekly runs)

#### Integration with Documentation Ecosystem

The audit system is part of the larger self-managing documentation system:

1. **Screenshot generation** - Automated screenshot capture (weekly)
2. **Change detection** - Detects component changes affecting docs
3. **Visual regression** - Compares screenshots for differences
4. **AI audit** - Identifies documentation issues (weekly) ✓
5. **Auto-remediation** - (Future) Automated doc fixes

#### Configuration

**Required GitHub Secrets:**
- `ANTHROPIC_API_KEY` - API key from https://console.anthropic.com/

**Workflow Inputs:**
- `days` - Number of days to look back for changes (default: 7)
- `dry_run` - Run without creating GitHub issues (default: false)

**Outputs:**
- Two consolidated GitHub issues (internal + user docs)
- Comprehensive audit report (workflow artifact)
- Summary comment with statistics

See `.github/scripts/ai-docs-audit.js` for implementation details and `.github/scripts/__tests__/ai-docs-audit.test.js` for test suite.

### Manual Maintenance

**When creating project plans:**
- Use `agent-projects/<project-name>/plan.md` with required metadata
- Mark as `done` when complete (archived after 21 days)

**When doing temporary work:**
- Use `agent-tmp/` for all scratch work
- Files auto-deleted after 7 days

**When updating permanent docs:**
- Update files in `internal-docs/` directly
- Never manually edit `_generated/` (auto-regenerated)
- Follow agent-optimized language principles

---

## Documentation Consolidation Approach

The 9Boxer documentation follows a **consolidation-first approach** to prevent documentation sprawl and maintain clarity for AI agents.

### Core Principle: Anti-Proliferation

**ALWAYS update existing documentation rather than creating new files.** Documentation proliferation creates:
- Conflicting information across multiple files
- Unclear trust hierarchy (which version is correct?)
- Context bloat (AI agents must read more to find answers)
- Maintenance burden (updates required in multiple places)

### When to Consolidate vs. Create New Files

#### ✅ CONSOLIDATE (Update Existing) When:
- Information already exists in a related document
- Adding new patterns to an existing category (e.g., new error handling pattern → ERROR_HANDLING.md)
- Documenting a feature enhancement (e.g., new component variant → component-inventory.md)
- Recording progress on an existing initiative (e.g., update plan status in agent-projects/)
- Fixing outdated information (e.g., update SYSTEM_ARCHITECTURE.md)

#### ✅ CREATE NEW FILE When:
- Introducing a new category folder (e.g., `architecture/`, `testing/`, `design-system/`)
- Documenting a completely new subsystem (e.g., new ADR in `architecture/decisions/`)
- Adding a new specialized guide with no existing home (rare - check thoroughly first)
- Creating temporary work in `agent-tmp/` or `agent-projects/` (ephemeral, not permanent)

### Consolidation Workflow

When consolidating documentation:

1. **Identify Target Document**
   - Search `internal-docs/` for related content
   - Check category folder READMEs for guidance
   - Follow "I want to..." guide in this README

2. **Merge Content**
   - Copy relevant sections to target document
   - Remove redundant information
   - Update cross-references
   - Ensure consistent formatting and voice

3. **Archive Superseded Docs**
   - Move old files to `internal-docs/archive/YYYY-MM-DD/`
   - Preserve history (never delete)
   - Update links to point to new location

4. **Update References**
   - Search for links to old document: `git grep "old-file.md"`
   - Update all references in CLAUDE.md, AGENTS.md, README files
   - Verify links work: `npm run docs:check` (if available)

### Category Folder Structure

Documentation is organized into category folders, each with:
- **README.md** - Overview and navigation guide
- **Specialized files** - Focused on specific subtopics
- **Clear naming** - Descriptive, not generic (e.g., `ERROR_HANDLING.md`, not `patterns.md`)

**Current Categories:**
- `architecture/` - System design, ADRs, technical patterns
- `design-system/` - UI components, design tokens, accessibility
- `testing/` - Test strategies, templates, best practices, CI/CD integration
- `i18n/` - Internationalization patterns and glossary
- `contributing/` - Documentation writing standards
- `components/` - Component-specific documentation
- `_generated/` - Auto-generated docs (DO NOT EDIT)
- `archive/` - Superseded documentation (organized by date)

### Archive Policy

**Never delete documentation.** Instead:
- Move to `internal-docs/archive/YYYY-MM-DD/`
- Preserve original structure and content
- Add README.md in archive folder explaining what was archived and why
- Update links to point to new consolidated location

**What to Archive:**
- Migration progress documents (e.g., `PROGRESS.md`, `migration-summary.md`)
- Superseded guides replaced by consolidated versions
- Deprecated patterns or approaches
- Historical context no longer relevant to current state

**What NOT to Archive:**
- Active plans in `agent-projects/` (use status: done instead)
- Temporary files in `agent-tmp/` (auto-deleted after 7 days)
- Current documentation (update in place)

### Example: Recent Consolidation (2025-12-27)

**What was consolidated:**
- Created `architecture/` folder with 9 comprehensive guides
- Moved i18n progress docs to `archive/2025-12-27/`
- Moved design system migration summary to `archive/2025-12-27/`
- Updated internal-docs/README.md with category structure

**Result:**
- Single source of truth for architecture (architecture/SYSTEM_ARCHITECTURE.md)
- Clear navigation via category folders
- Historical context preserved in archive
- Reduced context size for AI agents

### Red Flags (Avoid These Patterns)

❌ **Multiple files with similar names** (e.g., `guide.md`, `guide-v2.md`, `guide-final.md`)
❌ **Numbered versions** (e.g., `api-docs-v1.md`, `api-docs-v2.md`) - Update in place instead
❌ **"WIP" or "DRAFT" files** - Use `agent-tmp/` or `agent-projects/` for work in progress
❌ **Duplicate information** - Consolidate into single authoritative file
❌ **Orphaned files** - No incoming links, no clear purpose - Consolidate or archive

### Guidelines for AI Agents

When asked to create documentation:

1. **FIRST**: Search for existing related documentation
   ```bash
   # Search for related content
   find internal-docs -name "*.md" -type f | xargs grep -l "keyword"
   ```

2. **THEN**: Determine if consolidation is appropriate
   - Does a category folder exist? → Update file in that folder
   - Is this a new category? → Create folder with README.md
   - Is this temporary? → Use `agent-tmp/` or `agent-projects/`

3. **FINALLY**: Update cross-references
   - Update this README's "I want to..." section if adding new category
   - Update CLAUDE.md if adding agent-critical information
   - Update AGENTS.md if adding new command or workflow

---

## Related Documentation

- **[AGENT_DOCS_CONTRACT.md](AGENT_DOCS_CONTRACT.md)** - Documentation system rules
- **[CLAUDE_INDEX.md](../CLAUDE_INDEX.md)** - Main agent entry point
- **[AGENTS.md](../AGENTS.md)** - Quick reference
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines

---

**Last Updated**: Auto-generated by tools/build_context.py
**Status**: Active
**Owner**: Development Team
