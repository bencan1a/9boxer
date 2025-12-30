# Archived Documentation - 2025-12-29

## Files Archived

- **CLAUDE-v1.md** - Original comprehensive CLAUDE.md (43.5 KB)

## Reason for Archival

CLAUDE.md was 43.5 KB, causing performance warnings in Claude Code (recommended max: 20 KB for optimal performance).

The file suffered from:
- **Size bloat**: 43.5 KB vs recommended <20 KB
- **Duplication**: ~40% of content duplicated across CLAUDE.md, AGENTS.md, and facts.json
- **Embedded content**: Detailed content embedded instead of referenced
- **Platform assumptions**: 20 KB of Windows warnings instead of environment detection

## Replacement Structure

Replaced with **layered context architecture**:

### New Entry Point
- **CLAUDE_INDEX.md** (~14 KB) - Lightweight entry point with task-based navigation

### New Documentation
- **internal-docs/ENVIRONMENT_SETUP.md** - Environment detection and adaptive setup
- **internal-docs/PLATFORM_CONSTRAINTS.md** - Platform-specific rules (loaded only when needed)
- **Enhanced facts.json** - Added task_navigation, critical_warnings, environment_detection

### Results
- **72% reduction** in entry point size (43.5 KB → 14 KB)
- **0% duplication** (single source of truth)
- **Better navigation** (task-based index, 2 clicks max)
- **More robust** (environment detection prevents common errors)

## Migration Details

**See documentation in:**
- `agent-tmp/context-optimization-proposal.md` - Complete technical proposal
- `agent-tmp/context-optimization-summary.md` - Executive summary with visuals
- `agent-tmp/IMPLEMENTATION_PLAN_REVISED.md` - Step-by-step implementation plan

## Content Preservation

All content from CLAUDE-v1.md has been preserved and reorganized:

- **Critical warnings** → CLAUDE_INDEX.md (top 5 only) + internal-docs/ENVIRONMENT_SETUP.md
- **Windows constraints** → internal-docs/PLATFORM_CONSTRAINTS.md
- **Common commands** → CLAUDE_INDEX.md (quick ref) + AGENTS.md (full)
- **Architecture overview** → Links to internal-docs/architecture/
- **Testing guidance** → Links to internal-docs/testing/
- **Documentation system** → Links to internal-docs/
- **GitHub Actions** → Links to .github/workflows/

**Nothing was lost—just reorganized for better performance and navigation.**

## Rollback (if needed)

To restore original CLAUDE.md:

```bash
# Copy archived version back to root
cp internal-docs/archive/2025-12-29/CLAUDE-v1.md CLAUDE.md

# Remove new files
rm CLAUDE_INDEX.md
rm internal-docs/ENVIRONMENT_SETUP.md
rm internal-docs/PLATFORM_CONSTRAINTS.md

# Restore git
git checkout internal-docs/facts.json
git checkout GITHUB_AGENT.md
```

**Note:** Rollback not recommended—new structure is more efficient and maintainable.

---

**Date Archived:** 2025-12-29
**Reason:** Performance optimization and context management
**Status:** Superseded by CLAUDE_INDEX.md + layered documentation
