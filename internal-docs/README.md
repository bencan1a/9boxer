# Internal Developer Documentation

This directory contains **internal developer and AI agent documentation** for the 9Boxer codebase.

## Documentation Map

Quick navigation to all documentation categories:

### Core Entry Points

- **[CLAUDE.md](../CLAUDE.md)** - Primary agent entry point (comprehensive guidance)
- **[AGENTS.md](../AGENTS.md)** - Quick reference (command cheatsheet and workflows)
- **[GITHUB_AGENT.md](../GITHUB_AGENT.md)** - GitHub Copilot onboarding guide
- **[README.md](../README.md)** - Project overview
- **[BUILD.md](../BUILD.md)**, **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Build and deployment guides

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
  - [migration-summary.md](design-system/migration-summary.md) - Design system migration history

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

#### Internationalization (i18n)

- **[i18n/](i18n/)** - Translation patterns, glossary, testing (5 files)
  - [README.md](i18n/README.md) - i18n overview
  - [glossary.md](i18n/glossary.md) - Translation terms
  - [migration-patterns.md](i18n/migration-patterns.md) - i18n implementation patterns
  - [i18n-migration-summary.md](i18n/i18n-migration-summary.md) - i18n migration history
  - [PROGRESS.md](i18n/PROGRESS.md) - i18n implementation progress

#### Contributing & Documentation Writing

- **[contributing/](contributing/)** - Documentation writing standards, style guides (5 files)
  - [README.md](contributing/README.md) - Contributing overview
  - [documentation-writing-guide.md](contributing/documentation-writing-guide.md) - Comprehensive writing guide
  - [voice-and-tone-guide.md](contributing/voice-and-tone-guide.md) - Style reference (DO's and DON'Ts)
  - [screenshot-guide.md](contributing/screenshot-guide.md) - Technical screenshot standards
  - [user-personas.md](contributing/user-personas.md) - User personas for documentation

#### Components

- **[components/](components/)** - Component-specific documentation
  - State management patterns now in [design-system/component-guidelines.md](design-system/component-guidelines.md#component-state-management)

### Reference Documentation

- **[CONTEXT.md](CONTEXT.md)** - Comprehensive project context for AI agents (~150KB)
- **[SUMMARY.md](SUMMARY.md)** - Quick index of all documentation components
- **[facts.json](facts.json)** - Stable project truths (highest authority)
- **[CHANGELOG.md](CHANGELOG.md)** - Documentation change history
- **[ai-documentation-audit.md](ai-documentation-audit.md)** - AI audit findings

### Auto-Generated Documentation

- **[_generated/](_generated/)** - Auto-generated docs (DO NOT EDIT MANUALLY)
  - [api/](_generated/api/) - API documentation from Python docstrings (via pdoc3)
  - [plans_index.md](_generated/plans_index.md) - Active project plans summary

### Archive

- **[archive/](archive/)** - Superseded documentation (organized by date)

---

## How to Find What You Need

### I want to...

**...understand the codebase architecture**
→ Start with [architecture/SYSTEM_ARCHITECTURE.md](architecture/SYSTEM_ARCHITECTURE.md) or [CLAUDE.md](../CLAUDE.md)

**...create or modify UI components**
→ Read [design-system/README.md](design-system/README.md) first (MANDATORY)

**...write tests**
→ See [testing/test-principles.md](testing/test-principles.md) and [testing/quick-reference.md](testing/quick-reference.md)

**...add translations**
→ Follow [i18n/migration-patterns.md](i18n/migration-patterns.md)

**...write user documentation**
→ Follow [contributing/voice-and-tone-guide.md](contributing/voice-and-tone-guide.md) and [contributing/documentation-writing-guide.md](contributing/documentation-writing-guide.md)

**...understand GitHub Actions workflows**
→ See CI/CD Pipeline section in [CLAUDE.md](../CLAUDE.md)

**...understand agent documentation system**
→ Read [../AGENT_DOCS_CONTRACT.md](../AGENT_DOCS_CONTRACT.md)

**...find quick command references**
→ See [AGENTS.md](../AGENTS.md) (includes quick command reference section)

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

### Documentation Consolidation Approach

To prevent documentation fragmentation and duplication, we follow a **consolidation-first approach**:

**Core Documentation Files** (update these, don't duplicate):
- **[CLAUDE.md](../CLAUDE.md)** - Comprehensive technical guidance and architecture
- **[AGENTS.md](../AGENTS.md)** - Workflow guide, best practices, and command reference
- **[GITHUB_AGENT.md](../GITHUB_AGENT.md)** - GitHub Copilot/Agent onboarding and automated setup

**When New Docs Are Created:**
1. **Review**: Check if content belongs in existing core docs
2. **Extract**: Pull valuable, non-redundant information
3. **Consolidate**: Update the appropriate core doc
4. **Delete**: Remove the new doc after consolidation
5. **Verify**: Auto-generated docs (SUMMARY.md, CONTEXT.md) update automatically

**Category-Specific Docs:**
- Architecture: `architecture/`
- Design system: `design-system/`
- Testing: `testing/`
- i18n: `i18n/`
- Contributing: `contributing/`

These category docs are kept when they provide **deep domain expertise** that would make core docs too large.

**What Gets Consolidated:**
- Command quick references → AGENTS.md
- CI/CD workflow docs → CLAUDE.md (CI/CD Pipeline section)
- Setup instructions → GITHUB_AGENT.md (Automated Setup section)
- High-level overviews of specialized systems → README.md

**Why This Matters:**
- **Single source of truth**: No conflicting guidance
- **Efficient context**: Agents find info in predictable locations
- **Reduced maintenance**: Update one place, not three
- **No documentation drift**: Changes propagate to dependent docs

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

## Documentation Automation

### AI Documentation Audit System

The repository uses an automated AI-powered documentation audit system to detect drift, conflicts, and consolidation opportunities.

**What It Does:**
- **Analyzes code changes**: Reviews commits from last 7 days (configurable)
- **Separate analyses**: Internal docs (agents) vs User docs (end users) evaluated independently
- **Active consolidation**: Detects new internal docs, recommends merging into core docs
- **Creates GitHub issues**: One consolidated issue per documentation type with prioritized tasks
- **Weekly schedule**: Runs automatically every Monday at 2 AM UTC

**Key Components:**

**1. Audit Script** (`.github/scripts/ai-docs-audit.js`):
- Uses Anthropic Claude Sonnet 4.5
- Analyzes internal docs for conflicts, staleness, consolidation needs
- Analyzes user docs for accuracy, screenshots, accessibility
- Cost: ~$2-4/month

**2. GitHub Actions Workflow** (`.github/workflows/docs-audit.yml`):
- Automated weekly execution
- Manual trigger with configurable lookback period
- Dry run mode for testing

**3. Issue Types Detected:**

**Internal Docs:**
- `outdated` - Agent instructions no longer match code
- `missing` - New features not documented
- `conflict` - Contradictory guidance
- `consolidation` - New docs that should merge into core docs
- `stale-example` - Code examples >30 days old

**User Docs:**
- `outdated` - UI/features changed
- `missing` - New features undocumented
- `incorrect` - Instructions don't match behavior
- `screenshot-needed` - Outdated screenshots
- `accessibility` - Missing alt text, poor hierarchy
- `localization` - Non-translatable language

**Manual Trigger:**
1. Go to Actions tab → "AI Documentation Audit"
2. Click "Run workflow"
3. Set days to look back (default: 7)
4. Enable dry run for testing (optional)
5. Click "Run workflow"

**Local Testing:**
```bash
cd .github/scripts
export ANTHROPIC_API_KEY="your-key"
node ai-docs-audit.js --days=7 --dry-run
```

**Configuration:**
- Requires `ANTHROPIC_API_KEY` secret in GitHub
- Customizable lookback period
- Dry run mode prevents issue creation

See [ai-documentation-audit.md](ai-documentation-audit.md) for complete technical details.

---

## Related Documentation

- **[AGENT_DOCS_CONTRACT.md](../AGENT_DOCS_CONTRACT.md)** - Documentation system rules
- **[CLAUDE.md](../CLAUDE.md)** - Main agent entry point
- **[AGENTS.md](../AGENTS.md)** - Quick reference
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines

---

**Last Updated**: Auto-generated by tools/build_context.py
**Status**: Active
**Owner**: Development Team
