# Agent Documentation Contract

**Last updated:** 2026-01-05
**Purpose:** Define the documentation philosophy and audit guidelines for the 9Boxer project

---

## Philosophy: Layered Information Architecture

This project uses a **layered information architecture** designed for AI agent comprehension and efficiency.

### The Pattern

```
┌─────────────────────────────────────┐
│   Navigation Layer                  │
│   (CLAUDE_INDEX.md, AGENTS.md)      │
│   - Quick-start commands            │
│   - Links to detailed docs          │
│   - Target: 14KB, minimal context   │
│   - Purpose: Fast agent orientation │
└──────────────┬──────────────────────┘
               │ Links to
               ▼
┌─────────────────────────────────────┐
│   Reference Layer                   │
│   (internal-docs/)                  │
│   - Deep-dive details               │
│   - Comprehensive troubleshooting   │
│   - Loaded on-demand via links      │
│   - Purpose: Solve specific problems│
└─────────────────────────────────────┘
```

### What This Means

**Navigation Layer** provides:
- Quick environment detection commands
- Brief explanations (1-2 sentences)
- Links to detailed documentation
- Fast orientation for new agent sessions

**Reference Layer** provides:
- Comprehensive guides and troubleshooting
- Detailed examples and edge cases
- Platform-specific instructions
- Deep architectural documentation

### This is NOT Duplication

✅ **VALID Pattern:** Quick command in index + detailed guide in reference doc
❌ **INVALID Duplication:** Same detailed content in 2+ docs without linking

**Example of Correct Pattern:**
- `CLAUDE_INDEX.md` has: "Check Python: `poetry --version` → See ENVIRONMENT_SETUP.md for details"
- `ENVIRONMENT_SETUP.md` has: Comprehensive environment detection with 15+ scenarios, troubleshooting, workarounds
- This is **intentional layering**, NOT harmful duplication

---

## Anti-Proliferation Rules

### When to Consolidate

Consolidate documentation when:

1. **Identical content**: Two docs contain >80% identical detailed content
2. **Same purpose**: Both docs serve the same function (not quick-start vs reference)
3. **No linking**: No intentional navigation → reference relationship
4. **Simplification**: Consolidation makes agent navigation clearer

### When NOT to Consolidate

Keep documentation separate when:

1. **Layered architecture**: Quick-start index + detailed reference = intentional design
2. **Different topics**: Docs cover different but related subjects
   - Example: CI testing infrastructure vs production build process
   - Example: Quick environment check vs comprehensive troubleshooting
3. **Platform-specific**: Platform constraints in dedicated doc, linked from general doc
4. **Navigation bloat**: Consolidation would make navigation docs too large (>20KB)

### Cross-References vs Consolidation

When two docs cover related but distinct topics:
- ✅ **Add cross-references** between complementary docs
- ❌ **Don't consolidate** just because topics are related

**Example:**
- `cicd/CI_RELIABILITY.md` = Continuous integration testing infrastructure
- `architecture/build-process.md` = Production build and packaging
- **Action:** Add cross-references, NOT consolidation (different purposes)

---

## Audit System Guidance

### Before Flagging "Duplication"

When the audit system detects potential duplication, verify:

1. **Is it layered architecture?** Check if one doc is navigation layer (CLAUDE_INDEX.md, AGENTS.md) and the other is reference layer (internal-docs/)
2. **Is it >80% identical?** Measure actual content overlap, not just related topics
3. **Same purpose?** Both docs should serve identical function to qualify for consolidation
4. **Would consolidation help?** Consider agent comprehension impact

### Before Creating Tasks

Validate all claims before generating audit tasks:

1. **Verify commits exist**: Check that referenced commit hashes are valid
2. **Verify content exists**: Confirm claimed sections/files actually exist
3. **Check completion status**: Verify work isn't already done
4. **Assess agent impact**: Consider whether change improves agent understanding

### Consolidation Decision Tree

```
Is content in navigation layer (CLAUDE_INDEX.md/AGENTS.md)?
├─ YES → Is it a quick-start command with link to details?
│  ├─ YES → VALID layered architecture, DO NOT consolidate
│  └─ NO → Evaluate for consolidation
└─ NO → Are both docs in reference layer?
   ├─ YES → Check if >80% identical content
   │  ├─ YES → CONSOLIDATE (same detailed content in multiple places)
   │  └─ NO → Keep separate, add cross-references if related
   └─ NO → One is navigation, one is reference → VALID pattern
```

### Duplication Measurement Guidelines

**>80% identical content means:**
- Same detailed explanations
- Same code examples
- Same troubleshooting steps
- Same comprehensive guides

**NOT >80% identical:**
- Similar topics with different depth (quick-start vs deep-dive)
- Related subjects with different focus (CI testing vs production builds)
- Same commands with different context (quick check vs comprehensive troubleshooting)
- Cross-references between complementary docs

---

## Documentation Audit Checklist

Before generating audit tasks, verify:

- [ ] Commit hashes are valid and exist in git history
- [ ] Referenced files and sections actually exist
- [ ] Claimed duplication is measured at >80% identical content
- [ ] Consolidation won't break layered architecture pattern
- [ ] Work isn't already complete
- [ ] Priority assignment justified by impact on agent comprehension
- [ ] Proposed changes improve (not harm) agent understanding

---

## Agent Context Integration

This contract should be provided in the context of:

1. **Documentation audit agents** - Before generating weekly audit reports
2. **Documentation update agents** - When modifying documentation
3. **New feature agents** - When considering whether to create new docs

### Required Reading

Agents performing documentation audits must read:
1. This file (`internal-docs/AGENT_DOCS_CONTRACT.md`)
2. `CLAUDE_INDEX.md` opening section (explains layered architecture)
3. `AGENTS.md` documentation philosophy section (if exists)

---

## Examples: Valid vs Invalid Consolidation

### Example 1: VALID Layered Architecture (DO NOT consolidate)

**File 1:** `CLAUDE_INDEX.md`
```markdown
## Environment Setup
Check environment: `poetry --version && node --version`
See [ENVIRONMENT_SETUP.md](internal-docs/ENVIRONMENT_SETUP.md) for troubleshooting.
```

**File 2:** `internal-docs/ENVIRONMENT_SETUP.md`
```markdown
# Environment Setup Guide
Comprehensive 15-scenario environment detection guide with troubleshooting,
workarounds, platform-specific instructions, and edge case handling.
```

**Assessment:** ✅ This is correct layered architecture. DO NOT consolidate.

### Example 2: INVALID Duplication (SHOULD consolidate)

**File 1:** `internal-docs/testing/playwright-tips.md`
```markdown
## Screenshot Testing
Detailed guide to visual regression testing with Playwright,
including configuration, best practices, and troubleshooting.
```

**File 2:** `internal-docs/contributing/screenshot-guide.md`
```markdown
## Screenshot Testing
Detailed guide to visual regression testing with Playwright,
including configuration, best practices, and troubleshooting.
[80%+ identical content]
```

**Assessment:** ❌ Harmful duplication. SHOULD consolidate into single doc.

### Example 3: Related but Distinct (Add cross-references, DO NOT consolidate)

**File 1:** `internal-docs/cicd/CI_RELIABILITY.md`
- Focus: Continuous integration testing infrastructure
- Content: pre-commit hooks, make targets, test workflows

**File 2:** `internal-docs/architecture/build-process.md`
- Focus: Production build and packaging
- Content: PyInstaller, Electron, platform installers

**Assessment:** ✅ Different purposes. Add cross-references, do NOT consolidate.

---

## Success Metrics

A well-tuned audit system should:

1. **Low false positive rate**: <10% of generated tasks should be invalid
2. **Preserve architecture**: Never flag intentional layered architecture as duplication
3. **Accurate prioritization**: Critical tasks address real agent-blocking issues
4. **Verified claims**: All commit hashes, files, and sections exist before task creation
5. **Agent-focused**: Tasks improve agent comprehension and navigation

---

## Revision History

| Date       | Change                                    |
|------------|-------------------------------------------|
| 2026-01-05 | Initial creation based on Issue #229 audit review |

---

## Related Documentation

- [CLAUDE_INDEX.md](c:\Git_Repos\9boxer\CLAUDE_INDEX.md) - Main agent navigation
- [AGENTS.md](c:\Git_Repos\9boxer\AGENTS.md) - Development workflow and commands
- [internal-docs/architecture/README.md](c:\Git_Repos\9boxer\internal-docs\architecture\README.md) - Architecture documentation index

---

**Tags for search:** `#documentation-philosophy` `#audit-system` `#layered-architecture` `#anti-proliferation` `#agent-optimization` `#documentation-contract`
