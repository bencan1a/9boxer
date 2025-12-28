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
  - [ninebox-grid-states.md](components/ninebox-grid-states.md) - Grid state management

### Reference Documentation

- **[CONTEXT.md](CONTEXT.md)** - Comprehensive project context for AI agents (~150KB)
- **[SUMMARY.md](SUMMARY.md)** - Quick index of all documentation components
- **[facts.json](facts.json)** - Stable project truths (highest authority)
- **[WORKFLOWS.md](WORKFLOWS.md)** - GitHub Actions workflows
- **[COPILOT_SETUP.md](COPILOT_SETUP.md)** - GitHub Copilot environment setup
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
→ See [WORKFLOWS.md](WORKFLOWS.md)

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

## Related Documentation

- **[AGENT_DOCS_CONTRACT.md](../AGENT_DOCS_CONTRACT.md)** - Documentation system rules
- **[CLAUDE.md](../CLAUDE.md)** - Main agent entry point
- **[AGENTS.md](../AGENTS.md)** - Quick reference
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines

---

**Last Updated**: Auto-generated by tools/build_context.py
**Status**: Active
**Owner**: Development Team
