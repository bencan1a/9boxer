# MkDocs Material Documentation System

**status**: done
**owner**: Claude
**created**: 2025-12-19
**completed**: 2025-12-21

## Summary
- Migrate from single-page USER_GUIDE.md to professional multi-page MkDocs Material documentation
- Implement automated Playwright screenshot system for visual documentation
- Integrate build pipeline with Electron application
- Create maintainable documentation system with offline search

## Completion Notes
MkDocs Material system fully implemented. Directory structure created at
resources/user-guide/ with docs/ and site/ directories. Configuration file
mkdocs.yml with Material theme. Screenshot generation tool implemented at
tools/generate_docs_screenshots.py. Git commit shows documentation system
overhaul complete.

## Background

Current documentation state:
- Single USER_GUIDE.md file (1,106 lines)
- Converted to single HTML (43KB) via custom Python script
- Text-only, no screenshots
- Missing Settings/Theme documentation
- Good content (8.5/10) but navigation and discoverability could improve

## Goals

1. **Better User Experience**: Multi-page navigation with sidebar, offline search, better discoverability
2. **Visual Documentation**: 10-15 automated screenshots showing key features
3. **Complete Coverage**: Add missing Settings/Theme documentation
4. **Maintainability**: Easy to update, automated screenshot regeneration
5. **Professional Polish**: Material Design dark theme matching app aesthetic

## Technical Approach

### MkDocs Material Selection

Chosen because:
- Python-based (fits existing toolchain)
- Material Design theme (matches app's Material-UI)
- Excellent offline search (lunr.js built-in)
- Professional navigation
- Easy maintenance

### Content Structure

Split into logical pages:
- `index.md` - Welcome & overview
- `getting-started.md` - Quick 5-minute tour
- `uploading-data.md` - Upload process
- `understanding-grid.md` - 9-box grid explained
- `donut-mode.md` - Donut exercise (comprehensive)
- `working-with-employees.md` - Drag-drop, notes, timeline
- `tracking-changes.md` - Change tracker
- `filters.md` - Filtering and exclusions
- `statistics.md` - Stats and Intelligence
- `exporting.md` - Export process
- `settings.md` - **NEW: Theme settings**
- `tips.md` - Best practices
- `troubleshooting.md` - Common issues

### Screenshot System

Automated Playwright script to capture:
- Grid in normal mode
- Grid in donut mode (ghostly tiles)
- Settings dialog (theme options)
- Filter drawer with active filters
- Employee tile states
- Change tracker tabs
- Statistics/Intelligence tabs
- Export Excel sample

## Implementation Plan

### Phase 1: MkDocs Setup (Agent 1)
- Install mkdocs-material
- Create docs/ directory structure
- Configure mkdocs.yml with dark theme
- Set up navigation, search, features

### Phase 2: Content Migration (Agents 2-4, Parallel)
**Agent 2**: Core pages (index, getting-started, uploading-data, understanding-grid)
**Agent 3**: Advanced features (donut-mode, working-with-employees, tracking-changes, settings)
**Agent 4**: Reference pages (filters, statistics, exporting, tips, troubleshooting)

All agents:
- Split content from USER_GUIDE.md
- Update cross-references
- Add MkDocs admonitions

### Phase 3: Screenshot System (Agent 5, Parallel)
- Create tools/generate_docs_screenshots.py
- Automated Playwright screenshot capture
- Image optimization
- Save to docs/images/screenshots/

### Phase 4: Build Integration (Agent 6)
- Create tools/build_user_guide.py
- Update package.json scripts
- Update electron-builder.json
- Update Electron IPC handler

### Phase 5: Documentation (Agent 7, Parallel)
- Create docs/maintaining-user-guide.md
- Update CONTRIBUTING.md
- Screenshot regeneration guide

### Phase 6: Code Review (Final Agent)
- Comprehensive review of all changes
- Verify build integration
- Test bundled docs in Electron
- Ensure offline search works

## Parallelization Strategy

**Wave 1** (can run simultaneously):
- Agent 1: MkDocs setup
- Agent 5: Screenshot system (independent)
- Agent 7: Documentation guides (independent)

**Wave 2** (depends on Wave 1 completion):
- Agents 2-4: Content migration (parallel, all depend on Agent 1 setup)

**Wave 3** (depends on Wave 2):
- Agent 6: Build integration (needs content ready)

**Wave 4** (final):
- Code Review Agent (needs everything complete)

## Success Criteria

- ✅ MkDocs Material documentation builds successfully
- ✅ All content from USER_GUIDE.md migrated
- ✅ 10-15 screenshots integrated
- ✅ Settings/Theme section added
- ✅ Offline search works
- ✅ Bundled in Electron app correctly
- ✅ Help button opens new docs
- ✅ Build pipeline integrated
- ✅ Maintenance documentation complete

## Dependencies

**New**:
- mkdocs-material (Python package)

**Existing**:
- Python 3.10+ (already required)
- Playwright (already installed for E2E tests)

## Bundle Size Impact

- Current: 43KB (single HTML)
- New: ~500KB (MkDocs Material static site)
- Impact: Acceptable for desktop application

## Timeline Estimate

- Sequential: 8 days
- Parallel (with agents): 3-4 hours
- Code review: 1 hour
- **Total: 4-5 hours**

## Risks & Mitigation

**Risk**: Bundle size too large
**Mitigation**: 500KB acceptable for desktop, can minify further if needed

**Risk**: Screenshot maintenance burden
**Mitigation**: Automated Playwright script makes regeneration easy

**Risk**: Build integration issues
**Mitigation**: Thorough testing across platforms, code review

**Risk**: Content migration errors
**Mitigation**: Parallel agents + code review, verify all cross-references

## Future Enhancements

- GitHub Pages hosting (hybrid approach)
- Video walkthroughs
- Interactive in-app tutorial
- Analytics on section usage (if hosted online)

## Notes

- Existing USER_GUIDE.md will be deprecated (content migrated)
- tools/convert_user_guide.py will be replaced by tools/build_user_guide.py
- All changes will be code reviewed before finalization
