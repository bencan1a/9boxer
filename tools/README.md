# Tools Directory

This directory contains build and utility scripts for the 9Boxer project.

## Active Tools

### `build_context.py`
Generates comprehensive project documentation for AI agents.

**Purpose**: Automatically builds `docs/CONTEXT.md` from various sources including API docs, project plans, and stable facts.

**Usage**:
```bash
# From project root
. .venv/bin/activate
python tools/build_context.py
```

**Automation**: Runs automatically via GitHub Actions on push and nightly at 2 AM UTC.

**Outputs**:
- `docs/CONTEXT.md` - Main AI agent context
- `docs/SUMMARY.md` - Quick index
- `docs/_generated/api/` - API documentation
- `docs/_generated/plans_index.md` - Active plans summary
- Updates `CHANGELOG.md` with generation timestamp

See [AGENT_DOCS_CONTRACT.md](../AGENT_DOCS_CONTRACT.md) for complete documentation system rules.

### `build_user_guide.py` (Deprecated - Archived)
**Status**: This MkDocs-based build script has been replaced by VitePress.
**Archive Location**: `archive/mkdocs-legacy/build_user_guide.py`

The user guide is now built using VitePress (TypeScript/Node-based):

**New Build Process**:
```bash
# From frontend directory
cd frontend
npm run generate:guide:vitepress
```

**VitePress Documentation**: See [resources/user-guide-vitepress/README.md](../resources/user-guide-vitepress/README.md)

**Automation**: Runs automatically during Electron build process (`npm run electron:build`).

### `anonymize_dataset.py`
Anonymizes employee data for testing and demo purposes.

**Purpose**: Replaces real employee names and IDs with fictional data while preserving ratings and structure.

**Usage**:
```bash
. .venv/bin/activate
python tools/anonymize_dataset.py input.xlsx output.xlsx
```

### `generate_icon.py`
Generates application icons from source SVG.

**Purpose**: Creates platform-specific icon files for Electron app.

**Usage**:
```bash
. .venv/bin/activate
python tools/generate_icon.py
```

### `validate-translations.py`
Validates i18n translation JSON files for consistency and correctness.

**Purpose**: Pre-commit hook that catches translation file errors before they reach the codebase.

**Validations**:
- JSON syntax correctness
- Key parity between language files (no missing translations)
- Structure consistency (nested objects match)
- Placeholder consistency (e.g., `{{count}}`, `{{name}}`)

**Usage**:
```bash
# Validate specific files
python tools/validate-translations.py en/translation.json es/translation.json

# Validate all translation files
python tools/validate-translations.py frontend/src/i18n/locales/*/translation.json

# Runs automatically via pre-commit hook when translation files are changed
git commit -m "Update translations"
```

**Exit codes**:
- `0`: All validations passed
- `1`: Validation errors found (with detailed error messages)

**Integration**: Configured as a pre-commit hook in `.pre-commit-config.yaml` to run automatically on staged translation files.

**Testing**:
- Comprehensive unit tests: `backend/tests/unit/tools/test_validate_translations.py` (requires pytest)
- Standalone test runner: `tools/test_validation.py` (can run without pytest)
  ```bash
  # Run standalone tests
  python tools/test_validation.py

  # Run with pytest (requires dev dependencies)
  pytest backend/tests/unit/tools/test_validate_translations.py -v
  ```

### `generate-docs-tokens-hook.sh`
Auto-generates documentation design tokens when design system changes.

**Purpose**: Pre-commit hook that regenerates CSS design tokens for documentation whenever `frontend/src/theme/tokens.ts` is modified. This ensures the documentation design system stays perfectly synchronized with the application.

**How it works**:
1. Detects changes to `frontend/src/theme/tokens.ts`
2. Runs `npm run generate:docs-tokens` (executes `frontend/scripts/generate-docs-tokens.ts`)
3. Stages the generated `resources/user-guide/docs/stylesheets/design-tokens.css` for commit

**Automation**: Runs automatically via pre-commit hook when tokens are changed.

**Manual Usage**:
```bash
# Test the hook manually
bash tools/generate-docs-tokens-hook.sh

# Or regenerate tokens directly
cd frontend
npm run generate:docs-tokens
```

**Integration**: Configured in `.pre-commit-config.yaml` under local hooks.

**Generated Tokens**:
- Colors (light/dark mode): primary, secondary, background, text, semantic, grid box, scrollbar
- Typography: font family, sizes (h1-h6, body, caption), weights, line heights
- Spacing: 6 scales (xs to xxl) based on 8px grid
- Border radius: 6 scales (none to round)
- Shadows: card, elevated, dropdown (light/dark variants)
- Animation: duration and easing curves
- Dimensions: scrollbar sizing
- Opacity & z-index scales

**Benefits**:
- ✅ Single source of truth for design system
- ✅ Automatic synchronization on every commit
- ✅ No manual duplication of design values
- ✅ Type-safe design tokens from TypeScript

**Related Files**:
- Source: `frontend/src/theme/tokens.ts` (TypeScript design tokens)
- Generator: `frontend/scripts/generate-docs-tokens.ts` (TypeScript → CSS converter)
- Output: `resources/user-guide/docs/stylesheets/design-tokens.css` (generated CSS)
- Usage: `resources/user-guide/docs/stylesheets/extra.css` (uses CSS custom properties)

## Deprecated Tools

### ~~`generate_docs_screenshots.py`~~ (DELETED)

**Status**: Deleted December 2024, replaced by TypeScript screenshot generator

**Replacement**: `frontend/playwright/screenshots/generate.ts`

**Why Deleted**:
- Required Python/TypeScript context switching
- Duplicated browser automation logic with E2E tests
- Less type-safe than TypeScript implementation
- Harder to maintain separate codebase

**Migration Guide**:

**Old workflow (Python)**:
```bash
. .venv/bin/activate
python tools/generate_docs_screenshots.py
```

**New workflow (TypeScript)**:
```bash
cd frontend
npm run screenshots:generate
```

**Key Differences**:
| Aspect | Python Tool | TypeScript Tool |
|--------|-------------|-----------------|
| Location | `tools/generate_docs_screenshots.py` | `frontend/playwright/screenshots/` |
| Dependencies | Playwright Python + separate helpers | Playwright TypeScript + shared E2E helpers |
| Configuration | Python dictionaries | TypeScript config with types |
| Automation | Manual execution | GitHub Actions weekly + manual trigger |
| Helpers | Duplicated logic | Reuses E2E test helpers (zero duplication) |
| Type Safety | Runtime errors | Compile-time type checking |

**New Features**:
- 31 automated screenshots + 8 manual screenshots documented
- Shares 12 helper functions with E2E tests (zero duplication)
- Workflow-based organization (quickstart, calibration, changes, etc.)
- Automated weekly regeneration via GitHub Actions
- Better error handling and progress reporting
- Summary output showing successful/failed/manual screenshots

**For More Information**:
- Implementation: `frontend/playwright/screenshots/README.md`
- Manual screenshots: `frontend/playwright/screenshots/MANUAL_SCREENSHOTS.md`
- CI/CD workflow: `.github/workflows/screenshots.yml`
- CLAUDE.md section: "Documentation Screenshot Generation"

## Adding New Tools

When adding new tools to this directory:

1. **Choose the right language**:
   - Python: For backend-related tasks, data processing, or build automation
   - TypeScript: For frontend-related tasks, UI automation, or when sharing code with E2E tests
   - Shell scripts: For simple file operations or platform-specific commands

2. **Document in this README**:
   - Add entry to "Active Tools" section
   - Include purpose, usage, and automation details
   - Provide examples

3. **Follow conventions**:
   - Use meaningful names (verb_noun.py pattern)
   - Add docstrings/comments explaining purpose
   - Handle errors gracefully with clear messages
   - Support command-line arguments if applicable

4. **Integration**:
   - Add to package.json scripts if user-facing (frontend tools)
   - Add to Makefile if backend-related
   - Document in CLAUDE.md if relevant for AI agents
   - Create GitHub Actions workflow if needs automation

## Related Documentation

- [AGENTS.md](../AGENTS.md) - Development workflow guidance
- [CLAUDE.md](../CLAUDE.md) - AI agent development guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [docs/CONTEXT.md](../docs/CONTEXT.md) - AI agent context (auto-generated)
