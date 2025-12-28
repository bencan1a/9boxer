# Architecture Quick Reference

Fast lookup index for all architecture documentation. Use this to find which architecture doc to consult based on your current task.

**Last Updated:** 2025-12-27

---

## Table of Contents

- [Quick Decision Tree](#quick-decision-tree)
- [Document Index](#document-index)
- [Task-Based Lookup](#task-based-lookup)
- [Pattern Tags Index](#pattern-tags-index)
- [Document Summaries](#document-summaries)

---

## Quick Decision Tree

**Start here:** What are you working on?

```
Are you implementing a feature?
├─ YES → What type of feature?
│  ├─ API endpoint → ERROR_HANDLING.md (#api-endpoint)
│  ├─ Frontend IPC → SECURITY_MODEL.md (#ipc)
│  ├─ Database change → MIGRATIONS.md (#add-column, #data-migration)
│  ├─ Performance optimization → PERFORMANCE.md (#database, #rendering)
│  ├─ Logging/debugging → OBSERVABILITY.md (#debug, #performance)
│  └─ File system access → SECURITY_MODEL.md (#filesystem)
│
└─ NO → Are you reviewing code?
   ├─ YES → What aspect?
   │  ├─ Error handling → ERROR_HANDLING.md (Anti-patterns section)
   │  ├─ Security → SECURITY_MODEL.md (Security Checklist)
   │  ├─ Performance → PERFORMANCE.md (Decision Matrix)
   │  ├─ Database changes → MIGRATIONS.md (Testing Checklist)
   │  └─ Logging → OBSERVABILITY.md (Common Mistakes)
   │
   └─ NO → Are you debugging an issue?
      ├─ Backend not starting → OBSERVABILITY.md (Common Scenarios)
      ├─ Security error → SECURITY_MODEL.md (Threat Model)
      ├─ Performance issue → PERFORMANCE.md (Scale Constraints)
      ├─ Database error → MIGRATIONS.md (Failure Recovery)
      └─ Need context on past decision → decisions/README.md (ADR index)
```

---

## Document Index

Quick reference table of all architecture documentation.

| Document | Purpose | When to Use | Key Sections |
|----------|---------|-------------|--------------|
| **[ERROR_HANDLING.md](ERROR_HANDLING.md)** | Error patterns, HTTP status codes, logging | Implementing API endpoints, services, frontend errors | Quick Rules, Pattern Catalog, HTTP Status Matrix |
| **[SECURITY_MODEL.md](SECURITY_MODEL.md)** | Security boundaries, threat model, IPC patterns | Adding IPC handlers, file access, input validation | Security Boundaries, Threat Model, Pattern Catalog |
| **[PERFORMANCE.md](PERFORMANCE.md)** | Performance targets, scale constraints, optimization | Optimizing code, adding features with performance impact | Performance Targets, Scale Constraints, Decision Matrix |
| **[MIGRATIONS.md](MIGRATIONS.md)** | Database schema evolution, migration patterns | Changing database schema, adding columns/tables | Pattern Catalog, Testing Checklist, Failure Recovery |
| **[OBSERVABILITY.md](OBSERVABILITY.md)** | Logging patterns, debugging tools, log locations | Adding logging, debugging issues, understanding logs | Log Levels Matrix, Debugging Tools, Common Scenarios |
| **[SAMPLE_DATA_GENERATION.md](SAMPLE_DATA_GENERATION.md)** | Sample data generator architecture, bias patterns | Generating test data, tutorials, intelligence validation | Components, Bias Patterns, Extension Guide, Troubleshooting |
| **[decisions/README.md](decisions/README.md)** | ADR index and decision history | Understanding why we made architectural choices | Decision Index, When to Reference |

---

## Task-Based Lookup

Find the right document based on what you're doing.

### Implementing Backend Features

| Task | Document | Section | Pattern Tag |
|------|----------|---------|-------------|
| Creating new API endpoint | [ERROR_HANDLING.md](ERROR_HANDLING.md) | Pattern: API Endpoint Error Handling | `#api-endpoint` |
| Adding service layer logic | [ERROR_HANDLING.md](ERROR_HANDLING.md) | Pattern: Service Layer Error Handling | `#service-layer` |
| Validating input with Pydantic | [ERROR_HANDLING.md](ERROR_HANDLING.md) | Pattern: Pydantic Validation Errors | `#validation` |
| Adding database query | [PERFORMANCE.md](PERFORMANCE.md) | Pattern: Database Indexing | `#database` |
| Background task processing | [ERROR_HANDLING.md](ERROR_HANDLING.md) | Pattern: Retry with Backoff | `#retry` |
| Logging errors with context | [OBSERVABILITY.md](OBSERVABILITY.md) | Pattern: Backend Error Logging | `#error` |
| Changing database schema | [MIGRATIONS.md](MIGRATIONS.md) | Pattern Catalog | `#add-column`, `#rename-column` |
| Validating user input | [SECURITY_MODEL.md](SECURITY_MODEL.md) | Pattern: Input Validation | `#input-validation` |
| Generating test data | [SAMPLE_DATA_GENERATION.md](SAMPLE_DATA_GENERATION.md) | Pattern: Generate Test Data with Seed | `#testing`, `#reproducibility` |

### Implementing Frontend Features

| Task | Document | Section | Pattern Tag |
|------|----------|---------|-------------|
| Handling API errors | [ERROR_HANDLING.md](ERROR_HANDLING.md) | Pattern: Frontend Error Normalization | `#frontend-errors` |
| Optimistic updates with rollback | [ERROR_HANDLING.md](ERROR_HANDLING.md) | Pattern: Optimistic Updates | `#optimistic-update` |
| Adding IPC handler | [SECURITY_MODEL.md](SECURITY_MODEL.md) | Pattern: Safe IPC Handlers | `#ipc` |
| File upload validation | [SECURITY_MODEL.md](SECURITY_MODEL.md) | Pattern: File Upload Validation | `#filesystem` |
| Optimizing React rendering | [PERFORMANCE.md](PERFORMANCE.md) | Pattern: React.memo for Components | `#rendering` |
| Debouncing user input | [PERFORMANCE.md](PERFORMANCE.md) | Pattern: Debounce User Input | `#frontend` |
| Frontend error logging | [OBSERVABILITY.md](OBSERVABILITY.md) | Pattern: Frontend Error Logging | `#frontend` |

### Code Review Tasks

| Task | Document | Section | Pattern Tag |
|------|----------|---------|-------------|
| Reviewing error handling | [ERROR_HANDLING.md](ERROR_HANDLING.md) | Common Mistakes | All |
| Security review | [SECURITY_MODEL.md](SECURITY_MODEL.md) | Security Checklist | All |
| Performance review | [PERFORMANCE.md](PERFORMANCE.md) | Decision Matrix | All |
| Database migration review | [MIGRATIONS.md](MIGRATIONS.md) | Testing Checklist | All |
| Logging review | [OBSERVABILITY.md](OBSERVABILITY.md) | Logging Checklist | All |

### Debugging Tasks

| Task | Document | Section | Pattern Tag |
|------|----------|---------|-------------|
| Backend not starting | [OBSERVABILITY.md](OBSERVABILITY.md) | Common Scenarios: Backend Startup Issues | `#startup` |
| Grid not loading | [OBSERVABILITY.md](OBSERVABILITY.md) | Common Scenarios: Grid Loading | `#rendering` |
| Memory leak investigation | [OBSERVABILITY.md](OBSERVABILITY.md) | Common Scenarios: Memory Leaks | `#memory` |
| Database migration failed | [MIGRATIONS.md](MIGRATIONS.md) | Failure Recovery Table | `#data-migration` |
| Security boundary violated | [SECURITY_MODEL.md](SECURITY_MODEL.md) | Threat Model Matrix | `#ipc`, `#filesystem` |
| Performance degradation | [PERFORMANCE.md](PERFORMANCE.md) | Performance Targets Table | All |

---

## Pattern Tags Index

Quick search by pattern tags used throughout the architecture docs.

### Backend Tags

| Tag | Documents | Description |
|-----|-----------|-------------|
| `#api-endpoint` | ERROR_HANDLING.md | API endpoint error patterns |
| `#service-layer` | ERROR_HANDLING.md | Service layer error patterns |
| `#validation` | ERROR_HANDLING.md, SECURITY_MODEL.md | Input validation patterns |
| `#database` | PERFORMANCE.md, MIGRATIONS.md | Database query and schema patterns |
| `#retry` | ERROR_HANDLING.md | Retry and backoff patterns |
| `#startup` | OBSERVABILITY.md, PERFORMANCE.md | Backend startup optimization |
| `#testing` | SAMPLE_DATA_GENERATION.md | Test data generation patterns |
| `#reproducibility` | SAMPLE_DATA_GENERATION.md | Reproducible test data with seeds |

### Frontend Tags

| Tag | Documents | Description |
|-----|-----------|-------------|
| `#frontend-errors` | ERROR_HANDLING.md | Frontend error normalization |
| `#optimistic-update` | ERROR_HANDLING.md | Optimistic update patterns |
| `#ipc` | SECURITY_MODEL.md | Electron IPC security patterns |
| `#rendering` | PERFORMANCE.md | React rendering optimization |
| `#frontend` | PERFORMANCE.md, OBSERVABILITY.md | General frontend patterns |

### Security Tags

| Tag | Documents | Description |
|-----|-----------|-------------|
| `#ipc` | SECURITY_MODEL.md | IPC handler security |
| `#filesystem` | SECURITY_MODEL.md | File system access security |
| `#input-validation` | SECURITY_MODEL.md | User input validation |
| `#sql-injection` | SECURITY_MODEL.md | SQL injection prevention |

### Database Tags

| Tag | Documents | Description |
|-----|-----------|-------------|
| `#add-column` | MIGRATIONS.md | Adding database columns |
| `#rename-column` | MIGRATIONS.md | Renaming columns with data migration |
| `#data-migration` | MIGRATIONS.md | Transforming existing data |
| `#change-column-type` | MIGRATIONS.md | Changing column types |
| `#add-index` | MIGRATIONS.md, PERFORMANCE.md | Adding database indexes |

### Observability Tags

| Tag | Documents | Description |
|-----|-----------|-------------|
| `#error` | OBSERVABILITY.md | Error logging patterns |
| `#debug` | OBSERVABILITY.md | Debug logging patterns |
| `#performance` | OBSERVABILITY.md, PERFORMANCE.md | Performance logging and measurement |
| `#memory` | OBSERVABILITY.md | Memory tracking patterns |

---

## Document Summaries

### [ERROR_HANDLING.md](ERROR_HANDLING.md)

**Purpose:** Error handling patterns and conventions for backend and frontend.

**Quick Rules (8 rules):**
- API routes raise HTTPException with status code
- Services raise domain exceptions
- Never use bare `except:`
- Always log errors with context
- Frontend normalizes API errors
- Optimistic updates support rollback
- Retry only on transient errors
- Log at ERROR level for user-facing issues

**Key Sections:**
- Pattern Catalog (8 patterns)
- HTTP Status Code Decision Matrix
- Retry vs No Retry Decision Matrix
- Logging Requirements Checklist
- Common Mistakes (6 anti-patterns)
- Testing Error Handling

**When to Use:**
- Implementing API endpoints
- Adding service layer logic
- Frontend error handling
- Deciding HTTP status codes
- Adding retry logic

---

### [SECURITY_MODEL.md](SECURITY_MODEL.md)

**Purpose:** Security boundaries, threat model, and security patterns.

**Security Boundaries (4 processes):**
1. Main Process (Electron) - Trusted, full system access
2. Preload Script - Trusted, limited IPC bridge
3. Renderer Process - Sandboxed, no Node.js access
4. Backend Process - Trusted, localhost only

**Key Sections:**
- Security Boundaries Table
- Threat Model Matrix (in-scope vs out-of-scope)
- Pattern Catalog (5 patterns with exploits)
- Security Checklist for PRs
- Common Vulnerabilities with exploits

**When to Use:**
- Implementing IPC handlers
- File system access
- Input validation
- Understanding security boundaries
- Security code reviews

---

### [PERFORMANCE.md](PERFORMANCE.md)

**Purpose:** Performance targets, scale constraints, and optimization patterns.

**Performance Targets:**
- Backend startup: <10s (target), <15s (acceptable)
- API response: <100ms (target), <500ms (acceptable)
- Grid render: <500ms (target), <2s (acceptable)
- Excel upload: <5s for 1000 employees

**Scale Constraints:**
- Optimize for: ~1,000 employees
- Support up to: ~10,000 employees
- File size limit: 50MB (~15,000 employees)
- Memory budget: <500MB total

**Key Sections:**
- Performance Targets Table (15+ operations)
- Scale Constraints Table
- Accepted Trade-offs Matrix
- Decision Matrix (when to optimize)
- Pattern Catalog (9 patterns)
- Performance Testing Checklist

**When to Use:**
- Optimizing code
- Understanding scale limits
- Deciding when to optimize
- Performance code reviews

---

### [MIGRATIONS.md](MIGRATIONS.md)

**Purpose:** Database schema evolution and migration patterns.

**Quick Rules:**
- Schema version tracked via column detection
- Migrations run automatically on startup
- Must be idempotent and preserve data
- No external tools (no Alembic)

**Key Sections:**
- Pattern Catalog (6 patterns)
- Migration vs Recreate Decision Matrix
- Version Compatibility Matrix
- Testing Checklist (unit, integration, performance)
- Failure Recovery Table
- Common Mistakes (5 anti-patterns)

**When to Use:**
- Adding database columns
- Changing schema
- Migrating data
- Testing migrations

---

### [OBSERVABILITY.md](OBSERVABILITY.md)

**Purpose:** Logging patterns, debugging tools, and log file locations.

**Log Levels:**
- DEBUG: Development troubleshooting
- INFO: Normal operations, milestones
- WARNING: Recoverable issues
- ERROR: User-visible failures
- CRITICAL: System failures

**Log Locations:**
- Windows: `%APPDATA%\9boxer\logs\`
- macOS: `~/Library/Logs/9boxer/`
- Linux: `~/.config/9boxer/logs/`

**Key Sections:**
- Log Levels Decision Matrix
- Log File Locations (OS-specific)
- Debugging Tools Table (8 tools)
- Pattern Catalog (6 patterns)
- Common Debugging Scenarios (8 scenarios)
- Logging Checklist
- Common Mistakes (8 anti-patterns)

**When to Use:**
- Adding logging
- Debugging issues
- Understanding log locations
- Deciding log levels

---

### [SAMPLE_DATA_GENERATION.md](SAMPLE_DATA_GENERATION.md)

**Purpose:** Sample data generator architecture, components, and bias patterns.

**Quick Rules (7 rules):**
- Always use `generate_rich_dataset()` for test data
- Always set seed for reproducible tests
- Enable bias for intelligence testing
- Generate 50-300 employees
- Don't use in production sessions
- Use API endpoint for frontend integration
- Performance: <2s for 300 employees

**Key Sections:**
- Components (5 backend, 3 frontend)
- Bias Patterns (USA +15%, Sales +20%)
- Extension Guide (add patterns, locations, fields)
- Performance Benchmarks (<20ms generation)
- Testing Strategy (96% coverage, 42 tests)
- Troubleshooting (4 common issues)

**When to Use:**
- Generating test data with known characteristics
- Testing intelligence features with ground truth
- Creating tutorial/demo datasets
- Performance benchmarking with realistic data
- Extending generator with new patterns

---

### [decisions/README.md](decisions/README.md)

**Purpose:** Architecture Decision Records (ADRs) documenting key architectural choices.

**ADRs:**
1. **001-electron-desktop-architecture.md** - Why Electron over Tauri/native
2. **002-pyinstaller-backend-bundling.md** - Why PyInstaller over Docker
3. **003-http-ipc-communication.md** - Why HTTP over Electron IPC
4. **004-zustand-state-management.md** - Why Zustand over Redux
5. **005-sqlite-embedded-database.md** - Why SQLite over PostgreSQL

**When to Use:**
- Understanding past architectural decisions
- Deciding whether to change architecture
- Justifying implementation approaches
- Onboarding new team members/agents

---

## How to Use This Guide

### For Implementation Tasks

1. **Start with Decision Tree** - Find your task type
2. **Check Task-Based Lookup** - Get specific document and section
3. **Use Pattern Tags** - Find related patterns quickly
4. **Read Document Summary** - Understand document scope
5. **Consult Full Document** - Get detailed patterns and examples

### For Code Reviews

1. **Identify review type** (error handling, security, performance, etc.)
2. **Use Task-Based Lookup** - Find review checklist
3. **Consult Anti-Patterns** - Check common mistakes
4. **Verify against Patterns** - Ensure code follows established patterns

### For Debugging

1. **Identify symptom** - What's the observable issue?
2. **Use Task-Based Lookup** - Find debugging scenario
3. **Check Common Scenarios** - See if it's a known issue
4. **Use Debugging Tools** - Follow tool recommendations
5. **Check Logs** - Use log locations and patterns

### For Understanding Architecture

1. **Start with ADRs** - Read decisions/README.md
2. **Understand constraints** - Read relevant doc summaries
3. **Learn patterns** - Review pattern catalogs
4. **Study trade-offs** - Understand accepted compromises

---

## Quick Tips for AI Agents

**Before implementing ANY feature:**
1. ✅ Read relevant architecture docs (use Decision Tree)
2. ✅ Follow established patterns (use Pattern Catalogs)
3. ✅ Check constraints (Performance Targets, Scale Constraints, Threat Model)
4. ✅ Use pattern tags for quick search

**During code reviews:**
1. ✅ Use checklists (Security Checklist, Testing Checklist, etc.)
2. ✅ Check anti-patterns (Common Mistakes sections)
3. ✅ Verify decision matrices (HTTP Status, Log Levels, etc.)

**When debugging:**
1. ✅ Check Common Scenarios first
2. ✅ Use correct debugging tool (Debugging Tools Table)
3. ✅ Check log locations (OS-specific paths)
4. ✅ Use appropriate log levels

**When in doubt:**
1. ✅ Consult ADRs to understand past decisions
2. ✅ Use Quick Rules for immediate guidance
3. ✅ Read full document for context

---

## Related Documentation

- **[CLAUDE.md](../../CLAUDE.md)** - Comprehensive Claude Code guidance
- **[AGENTS.md](../../AGENTS.md)** - Development workflow cheatsheet
- **[internal-docs/facts.json](../facts.json)** - Highest authority project truths
- **[internal-docs/testing/](../testing/)** - Testing documentation
- **[DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md)** - UI design system

---

**Last Updated:** 2025-12-28
**Document Count:** 7 core docs + 5 ADRs
**Total Patterns:** 43 documented patterns across all docs (includes 5 from SAMPLE_DATA_GENERATION.md)
**Total Tags:** 27+ searchable pattern tags
