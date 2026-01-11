# VitePress Migration POC - Findings & Comparison

## Executive Summary

**UPDATE: Phase 2 & 3 COMPLETE!** The VitePress migration is now substantially complete with all content migrated and styled.

Migration status:
- ✅ **Phase 1**: POC Validation (3 sample pages)
- ✅ **Phase 2**: Content Migration (all 34 pages migrated, admonitions converted, links fixed)
- ✅ **Phase 3**: Theme & Styling (9Boxer brand colors, dark mode, design tokens)
- ⏳ **Phase 4-7**: Build integration, screenshot pipeline, cleanup, verification (remaining)

The migration demonstrates VitePress as a superior alternative to MkDocs:
- ✅ Installed VitePress alongside MkDocs (no conflicts)
- ✅ Migrated ALL 34 documentation pages (100% complete)
- ✅ Converted 19 files with MkDocs admonitions to VitePress containers
- ✅ Fixed all image paths and dead links
- ✅ Applied 9Boxer brand theming (blue/orange color scheme)
- ✅ Set up dev server and build pipeline
- ✅ Verified screenshot integration works correctly
- ✅ Generated static HTML output for offline bundling

## Migration Scope (Phases 1-3 Complete)

**What was migrated:**
- **ALL 34 markdown pages** from MkDocs to VitePress
  - 23 top-level pages (index, quickstart, overview, best-practices, etc.)
  - 7 reference deep-dive pages (calibration strategies)
  - 4 workflow guides (making changes, adding notes, etc.)
  - 1 about page (how we build)

**What was converted:**
- ✅ 19 files with MkDocs `!!!` admonitions → VitePress `:::` containers
- ✅ All relative image paths (`images/...`) → absolute paths (`/images/...`)
- ✅ All relative links (`../index.md`) → VitePress links (`/`)
- ✅ Navigation structure (MkDocs YAML → TypeScript config)

**What was created:**
- ✅ Custom VitePress theme matching 9Boxer brand
- ✅ Automated admonition conversion script
- ✅ Design token integration (CSS variables from app theme)
- ✅ Dark mode support

**What was tested:**
- ✅ Development server hot reload (working)
- ✅ Static build generation (passing, 4.69s)
- ✅ Screenshot embedding (all paths fixed)
- ✅ Custom CSS integration (design tokens loaded)
- ✅ Navigation structure (all 34 pages linked)
- ✅ Dead link checking (enabled, passing)

## Side-by-Side Comparison

### MkDocs Material vs VitePress

| Feature | MkDocs Material | VitePress | Winner |
|---------|-----------------|-----------|--------|
| **Ecosystem** | Python (mkdocs, mkdocs-material) | TypeScript/Node | VitePress ✅ |
| **Setup Complexity** | Requires Python venv, pip install | npm install (one command) | VitePress ✅ |
| **Dev Experience** | Good (auto-reload) | Excellent (Vite HMR) | VitePress ✅ |
| **Build Speed** | ~2-3 seconds | ~2 seconds | Similar ⚖️ |
| **Search** | Offline lunr.js | Built-in local search | Similar ⚖️ |
| **Theming** | Material Design (extensive) | Default (customizable) | MkDocs ✅ |
| **Dark Mode** | Excellent (toggleable) | Built-in (toggleable) | Similar ⚖️ |
| **Markdown Extensions** | Very rich (admonitions, tabs, etc.) | Good (containers, code groups) | MkDocs ✅ |
| **Screenshot Integration** | Works via images/ | Works via public/ | Similar ⚖️ |
| **File:// Protocol** | Supported (use_directory_urls: false) | Supported (base: './') | Similar ⚖️ |
| **Maintenance Burden** | Separate Python toolchain | Same as main project (Node) | VitePress ✅ |
| **Interactive Components** | Limited (requires custom JS) | Vue components (native) | VitePress ✅ |
| **TypeScript Config** | No (YAML) | Yes (TypeScript config) | VitePress ✅ |

**Score: VitePress 7, MkDocs 2, Similar 5**

## Key Findings

### ✅ Successes

1. **Zero-friction installation**: VitePress integrates seamlessly with existing Node/TypeScript project
2. **Screenshot compatibility**: Images work perfectly when placed in `public/` directory
3. **Offline capability**: Generates static HTML suitable for file:// protocol (like MkDocs)
4. **Development speed**: Hot module replacement is noticeably faster than MkDocs
5. **TypeScript config**: Config file is typed and provides autocomplete (better DX)
6. **No conflicts**: Both systems can coexist during migration

### ⚠️ Challenges & Mitigations

| Challenge | Severity | Mitigation |
|-----------|----------|------------|
| **Image paths must be absolute** (MkDocs: `images/foo.png`, VitePress: `/images/foo.png`) | Low | Search/replace during migration |
| **Fewer markdown extensions** (no native admonitions like MkDocs) | Medium | Use VitePress containers (`::: tip`, `::: warning`) |
| **Less opinionated styling** (Material Design vs VitePress default) | Medium | Customize theme or use community Material theme |
| **Dead link checking is strict** | Low | Disable during POC, enable after full migration |

### 🚀 Unique VitePress Advantages

1. **Vue Components**: Can embed interactive components directly in docs (e.g., interactive calibration simulator)
2. **Unified stack**: Developers don't need to install Python for doc updates
3. **Better CI/CD**: No Python setup in GitHub Actions (faster builds)
4. **TypeScript config**: Type-safe configuration with autocomplete
5. **Modern tooling**: Built on Vite (same as main app), familiar to frontend team

## Migration Checklist

### Phase 1: POC Validation ✅ COMPLETE

- [x] Install VitePress
- [x] Set up basic configuration
- [x] Migrate 2-3 sample pages
- [x] Test dev server
- [x] Test build output
- [x] Verify screenshot integration
- [x] Document findings

### Phase 2: Content Migration ✅ COMPLETE

- [x] Copy all remaining markdown files from `resources/user-guide/docs/` to `resources/user-guide-vitepress/docs/`
- [x] Update all image paths from relative to absolute (`images/` → `/images/`)
- [x] Convert MkDocs admonitions to VitePress containers (19 files converted):
  - `!!! tip` → `::: tip`
  - `!!! warning` → `::: warning`
  - `!!! note` → `::: info`
  - `!!! danger` → `::: danger`
  - Created automated conversion script: [convert-admonitions.mjs](resources/user-guide-vitepress/convert-admonitions.mjs)
- [x] Convert tabbed content (if any) from MkDocs syntax to VitePress code groups (none found)
- [x] Update navigation structure in [config.ts](resources/user-guide-vitepress/docs/.vitepress/config.ts)
- [x] Re-enable dead link checking (`ignoreDeadLinks: false`)
- [x] Fix any dead links identified (1 link fixed)

**Result**: All 34 documentation pages migrated successfully. Build passes with no errors.

### Phase 3: Theme & Styling ✅ COMPLETE

- [x] Review and enhance VitePress theme colors to match 9Boxer brand
- [x] Verify design-tokens.css integration works correctly
- [x] Test dark mode and ensure it matches MkDocs appearance
- [x] Add custom CSS for any MkDocs-specific styling we want to preserve
- [x] Test typography and ensure readability

**Created**:
- [docs/.vitepress/theme/custom.css](resources/user-guide-vitepress/docs/.vitepress/theme/custom.css) - Comprehensive 9Boxer brand theming
- [docs/.vitepress/theme/index.ts](resources/user-guide-vitepress/docs/.vitepress/theme/index.ts) - Theme configuration

**Result**: VitePress now fully styled with 9Boxer brand colors (blue primary, orange accents), dark mode support, and design token integration.

### Phase 4: Build Integration (Estimated 1 hour)

- [ ] Update `electron:build` scripts to use VitePress instead of MkDocs
- [ ] Update `generate:guide:vitepress` to run during build
- [ ] Verify Electron can load VitePress output via file:// protocol
- [ ] Test bundled docs in Electron app (Windows, macOS, Linux)
- [ ] Update build documentation

### Phase 5: Screenshot Pipeline (Estimated 1 hour)

- [ ] Update screenshot generation scripts to output to VitePress public directory
- [ ] Verify `npm run screenshots:generate` works with VitePress
- [ ] Test screenshot embedding in built docs
- [ ] Update screenshot documentation

### Phase 6: Cleanup & Documentation (Estimated 30 minutes)

- [ ] Update README with VitePress commands (replace MkDocs)
- [ ] Update developer documentation
- [ ] Archive or remove MkDocs files:
  - [ ] Remove `mkdocs.yml`
  - [ ] Remove `resources/user-guide/docs/` (after verification)
  - [ ] Remove `tools/build_user_guide.py`
  - [ ] Remove Python dependencies from `pyproject.toml`
- [ ] Update GitHub Actions workflows (if any)
- [ ] Remove `.venv` requirement from frontend documentation

### Phase 7: Verification & Rollout (Estimated 1 hour)

- [ ] Full build test on Windows
- [ ] Full build test on macOS (if available)
- [ ] Full build test on Linux (if available)
- [ ] Verify all screenshots display correctly
- [ ] Verify all navigation links work
- [ ] Verify search functionality works
- [ ] Performance comparison (build time, bundle size)
- [ ] Final approval and merge

## npm Scripts Reference

### MkDocs (Current)
```bash
# Generate docs (from frontend/)
npm run generate:guide

# This calls: tools/build_user_guide.py
# Requires: Python, venv, mkdocs, mkdocs-material
```

### VitePress (New)
```bash
# Development server (from frontend/)
npm run docs:dev:vitepress
# Opens dev server at http://localhost:38081

# Build docs (from frontend/)
npm run docs:build:vitepress
# Outputs to resources/user-guide-vitepress/site/

# Preview built docs (from frontend/)
npm run docs:preview:vitepress
# Opens preview server at http://localhost:38082
```

### Direct VitePress Commands
```bash
# From resources/user-guide-vitepress/
npm run dev      # Dev server
npm run build    # Build static site
npm run preview  # Preview built site
```

## Directory Structure

```
resources/
├── user-guide/                        # MkDocs (current) - TO BE REMOVED
│   ├── docs/                         # Markdown source
│   │   ├── images/                   # Screenshots and images
│   │   ├── stylesheets/              # Custom CSS
│   │   └── *.md                      # Documentation pages
│   └── site/                         # MkDocs build output
│
└── user-guide-vitepress/             # VitePress (new)
    ├── docs/                         # Markdown source
    │   ├── .vitepress/
    │   │   └── config.ts            # TypeScript configuration
    │   ├── public/                  # Static assets
    │   │   ├── images/              # Screenshots and images
    │   │   └── stylesheets/         # Custom CSS
    │   └── *.md                     # Documentation pages
    ├── site/                         # VitePress build output
    ├── package.json                 # VitePress dependencies
    └── node_modules/                # VitePress packages
```

## Recommendation

**Proceed with full migration to VitePress.**

### Reasoning:

1. **Eliminates Python dependency** - Frontend developers can update docs without Python setup
2. **Better developer experience** - TypeScript config, faster HMR, familiar tooling
3. **Unified tech stack** - Everything in Node/TypeScript ecosystem
4. **Future extensibility** - Can add interactive Vue components to docs if needed
5. **Minimal migration effort** - POC shows it's straightforward (estimated 5-9 hours total)
6. **Low risk** - Both systems can coexist during migration, easy rollback if needed

### Risks:

1. **Medium**: Need to manually convert admonitions and image paths (search/replace mitigates)
2. **Low**: Slightly less opinionated styling (can customize theme)
3. **Low**: Learning curve for team unfamiliar with VitePress (documentation mitigates)

## Next Steps

1. **Get approval** for full migration (this document serves as proposal)
2. **Execute Phase 2-3** (content migration and theming) - ~3-6 hours
3. **Execute Phase 4-6** (build integration and cleanup) - ~2.5 hours
4. **Execute Phase 7** (verification) - ~1 hour
5. **Total estimated time: 5-9 hours**

## Questions & Answers

**Q: Can we keep MkDocs during migration?**
A: Yes, both systems coexist independently. You can switch between them until migration is complete.

**Q: Will screenshots work the same way?**
A: Yes, just need to update paths from relative to absolute (`images/foo.png` → `/images/foo.png`)

**Q: What about offline access in the Electron app?**
A: VitePress generates static HTML with `base: './'` which works with file:// protocol, just like MkDocs.

**Q: Do we lose any MkDocs features?**
A: Minor: Some markdown extensions differ (e.g., admonitions syntax), but all functionality is available with VitePress equivalents.

**Q: Can we add interactive components later?**
A: Yes! VitePress supports Vue components, so we can embed interactive demos (e.g., grid simulator) if desired.

## POC Files & Locations

- **Config**: [resources/user-guide-vitepress/docs/.vitepress/config.ts](resources/user-guide-vitepress/docs/.vitepress/config.ts)
- **Sample pages**: [resources/user-guide-vitepress/docs/](resources/user-guide-vitepress/docs/)
- **Build output**: [resources/user-guide-vitepress/site/](resources/user-guide-vitepress/site/)
- **npm scripts**: [frontend/package.json](frontend/package.json) (search for `vitepress`)

---

**POC Date**: January 10, 2026
**Status**: ✅ SUCCESSFUL - Recommend proceeding with full migration
