# Architecture Decision Records (ADRs)

Agent-optimized ADRs documenting key architectural decisions for the 9Boxer desktop application.

## 🚀 Backend Refactoring Plan

A comprehensive **[Backend Refactoring Plan](../BACKEND_REFACTORING_PLAN.md)** documents how to safely implement ADR-006 through ADR-010. This plan:

- **Sequences work** to minimize risk and ensure each phase builds on previous foundations
- **Provides timelines** with 4-phase approach spanning 12-16 weeks
- **Includes safety measures** with feature flags, parallel run validation, and rollback procedures
- **Tracks dependencies** showing which issues must be completed before others can start

📖 **See:** [BACKEND_REFACTORING_PLAN.md](../BACKEND_REFACTORING_PLAN.md)
📊 **GitHub Milestone:** [backend-arch-review](https://github.com/bencan1a/9boxer/milestone/16)

## Quick Reference

| ADR | Decision | Status | When to Reference |
|-----|----------|--------|-------------------|
| [001](001-electron-desktop-architecture.md) | Use Electron for desktop framework | ✅ Accepted | Before changing desktop framework, evaluating alternatives |
| [002](002-pyinstaller-backend-bundling.md) | Bundle backend with PyInstaller | ✅ Accepted | Before changing backend deployment, packaging strategy |
| [003](003-http-ipc-communication.md) | Use HTTP for backend-frontend communication | ✅ Accepted | Before adding IPC channels, changing communication protocol |
| [004](004-zustand-state-management.md) | Use Zustand for frontend state | ✅ Accepted | Before adding state management library, refactoring state |
| [005](005-sqlite-embedded-database.md) | Use SQLite for local persistence | ✅ Accepted | Before changing database, adding persistence layer |
| [006](006-dependency-injection-pattern.md) | Use Dependency Injection for database access | ✅ Accepted | Before creating services, refactoring data access, writing tests |
| [007](007-repository-pattern.md) | Implement Repository Pattern for data access | ✅ Accepted | Before adding queries, refactoring services, accessing database |
| [008](008-single-responsibility-principle.md) | Enforce Single Responsibility for services | ✅ Accepted | Before creating services, refactoring large classes |
| [009](009-configuration-management.md) | Centralize business rules in configuration | ✅ Accepted | Before adding thresholds, limits, or business rules |
| [010](010-error-handling-standards.md) | Standardize error handling with exceptions | ✅ Accepted | Before implementing endpoints, handling errors |

## When to Create a New ADR

Create an ADR when making decisions about:
- **Architecture**: Framework changes, major technology choices
- **Infrastructure**: Deployment, packaging, build pipeline
- **Patterns**: State management, communication protocols, data flow
- **Dependencies**: Adding/removing major libraries
- **Trade-offs**: Performance vs simplicity, size vs features

**Don't create ADRs for:**
- Implementation details (use code comments)
- Feature specifications (use requirements docs)
- Bug fixes (use GitHub issues)
- Style preferences (use linting config)

## ADR Template

```markdown
# ADR-XXX: [Short Title]

**Status:** ✅ Accepted | ⏳ Proposed | ⛔ Rejected | 🔄 Superseded by ADR-YYY
**Date:** YYYY-MM-DD
**Tags:** #backend | #frontend | #deployment | #performance | #state

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| [One sentence: what we decided] | [One sentence: why we needed to decide] | [One sentence: main consequence] |

## When to Reference This ADR

- Before [action that would contradict this decision]
- When [scenario where this context matters]
- If considering [alternative approach]

## Alternatives Comparison

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **[Chosen Option]** | [Key benefits] | [Accepted trade-offs] | ✅ Chosen |
| [Alternative 1] | [Benefits] | [Deal-breakers] | ❌ Rejected |
| [Alternative 2] | [Benefits] | [Deal-breakers] | ❌ Rejected |

## Decision Criteria Matrix

| Criterion | Weight | Winner | Rationale |
|-----------|--------|--------|-----------|
| [Criterion 1] | High | [Option] | [Why this matters] |
| [Criterion 2] | Medium | [Option] | [Why this matters] |
| [Criterion 3] | Low | [Option] | [Why this matters] |

**Final Score:** [Chosen option wins X/Y weighted criteria]

## Implementation Details

### Key Constraints
- [Constraint 1: what this decision forces us to do/not do]
- [Constraint 2: what this decision forces us to do/not do]

### Configuration
```
[Code snippet showing how this decision is implemented]
```

### Related Files
- `[file/path]` - [How this file relates to decision]
- `[file/path]` - [How this file relates to decision]

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| [Trade-off 1] | [Benefit 1] | [How we handle downside] |
| [Trade-off 2] | [Benefit 2] | [How we handle downside] |

## Related Decisions

- See [ADR-XXX](XXX-title.md) for [related context]
- Supersedes [ADR-XXX](XXX-title.md) (if applicable)
- Superseded by [ADR-XXX](XXX-title.md) (if applicable)

## References

- [Link to discussion, RFC, benchmark, documentation]
```

## Decision Tree: Which ADR to Read?

```
START: Agent assigned task
  ↓
  Task involves DESKTOP FRAMEWORK (Electron, Tauri, etc.)?
    YES → Read ADR-001 (Electron Desktop Architecture)
    NO ↓

  Task involves BACKEND DEPLOYMENT/BUNDLING?
    YES → Read ADR-002 (PyInstaller Backend Bundling)
    NO ↓

  Task involves BACKEND-FRONTEND COMMUNICATION?
    YES → Read ADR-003 (HTTP vs IPC Communication)
    NO ↓

  Task involves FRONTEND STATE MANAGEMENT?
    YES → Read ADR-004 (Zustand State Management)
    NO ↓

  Task involves DATABASE/PERSISTENCE?
    YES → Read ADR-005 (SQLite Embedded Database)
    NO ↓

  Task involves DEPENDENCY INJECTION or SERVICE ARCHITECTURE?
    YES → Read ADR-006 (Dependency Injection)
    NO ↓

  Task involves DATA ACCESS or SQL QUERIES?
    YES → Read ADR-007 (Repository Pattern)
    NO ↓

  Task involves CREATING or REFACTORING SERVICES?
    YES → Read ADR-008 (Single Responsibility Principle)
    NO ↓

  Task involves BUSINESS RULES, THRESHOLDS, or CONFIGURATION?
    YES → Read ADR-009 (Configuration Management)
    NO ↓

  Task involves ERROR HANDLING or API RESPONSES?
    YES → Read ADR-010 (Error Handling Standards)
    NO ↓

  READ: GUIDELINES.md for general architecture patterns
```

## Contextual Tags

Use these tags to find relevant ADRs:

- `#deployment` → ADR-001, ADR-002
- `#electron` → ADR-001, ADR-003
- `#backend` → ADR-002, ADR-003, ADR-005, ADR-006, ADR-007, ADR-008, ADR-009, ADR-010
- `#frontend` → ADR-001, ADR-004
- `#state-management` → ADR-004
- `#persistence` → ADR-005
- `#communication` → ADR-003
- `#bundling` → ADR-002
- `#desktop` → ADR-001
- `#database` → ADR-005, ADR-007
- `#architecture` → ADR-006, ADR-007, ADR-008, ADR-010
- `#patterns` → ADR-006, ADR-007, ADR-008
- `#testing` → ADR-006, ADR-007, ADR-008
- `#configuration` → ADR-009
- `#error-handling` → ADR-010
- `#maintainability` → ADR-008, ADR-009
- `#solid` → ADR-008

## ADR Status Definitions

- **✅ Accepted**: Active decision, currently implemented
- **⏳ Proposed**: Under discussion, not yet implemented
- **⛔ Rejected**: Considered but not chosen (documented for posterity)
- **🔄 Superseded**: Replaced by a newer decision (see link to successor)

## Format Principles

These ADRs are optimized for AI agent consumption:

1. **Tables over prose**: Quick scanning, easy comparison
2. **Decision matrices**: Quantitative comparison of options
3. **Clear triggers**: "When to reference" section tells agents when to read
4. **Code examples**: Show implementation, not just theory
5. **Trade-offs explicit**: What we gave up, not just what we gained
6. **Constraints listed**: What this decision forces us to do/not do

## Updating ADRs

ADRs are **immutable** once accepted. If a decision changes:

1. Create a new ADR superseding the old one
2. Update the old ADR's status to `🔄 Superseded by ADR-XXX`
3. Link both ADRs in their "Related Decisions" sections

**Exception**: Minor clarifications, typo fixes, and link updates are allowed without creating a new ADR.

## Related Documentation

- [SYSTEM_ARCHITECTURE.md](../SYSTEM_ARCHITECTURE.md) - Current architecture overview
- [GUIDELINES.md](../GUIDELINES.md) - Architectural patterns and principles
- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) - UI/UX design decisions
- [facts.json](../../facts.json) - Immutable project truths (highest authority)
