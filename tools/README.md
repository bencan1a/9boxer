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

### `build_user_guide.py`
Converts markdown user guide to standalone HTML with embedded assets.

**Purpose**: Generates `resources/USER_GUIDE.html` from markdown for bundling with Electron app.

**Usage**:
```bash
# From project root
. .venv/bin/activate
python tools/build_user_guide.py

# Or via npm (from frontend directory)
cd frontend
npm run generate:guide
```

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
