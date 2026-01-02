# Documentation Archive - 2026-01-02

## Archived Files

This directory contains documentation that was consolidated from the project root into the canonical `internal-docs/` structure.

### Files Archived

1. **BUILD.MD** → Consolidated into [internal-docs/architecture/build-process.md](../../architecture/build-process.md)
2. **DEPLOYMENT.MD** → Consolidated into [internal-docs/architecture/deployment.md](../../architecture/deployment.md)
3. **DESIGN_SYSTEM.MD** → Merged into [internal-docs/design-system/](../../design-system/)
   - "Before Creating Any UI Component" section → [component-guidelines.md](../../design-system/component-guidelines.md)
   - Component Development Checklist → [component-guidelines.md](../../design-system/component-guidelines.md)
   - Intelligence Panel patterns → [component-guidelines.md](../../design-system/component-guidelines.md)
   - UI zones content verified in → [layout-patterns.md](../../design-system/layout-patterns.md)

## Reason for Consolidation

The project established `internal-docs/` as the canonical source of truth for all project documentation. These root-level files violated this standard and created confusion about which version was authoritative.

**Benefits of consolidation:**
- Single source of truth
- Reduced duplication (70% overlap in DESIGN_SYSTEM.MD)
- Better organization (architecture docs together, design docs together)
- Clearer navigation via internal-docs structure
- Reduced context size for AI agents

## Migration Date

January 2, 2026

## References

- [internal-docs/README.md](../../README.md) - Main documentation index
- [internal-docs/architecture/README.md](../../architecture/README.md) - Architecture docs index
- [internal-docs/design-system/README.md](../../design-system/README.md) - Design system index
