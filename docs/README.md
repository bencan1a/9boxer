# Documentation

This directory contains **persistent project documentation** that has long-term value.

## Contents

### User Guide (MkDocs Material)

The main user guide is built with **MkDocs Material** and bundled with the Electron application:

- **Source files**: `docs/*.md` (index.md, getting-started.md, etc.)
- **Configuration**: `mkdocs.yml` (project root)
- **Screenshots**: `docs/images/screenshots/`
- **Build output**: `/site` (project root, git-ignored)
- **Bundled version**: `resources/user-guide/` (git-ignored)

**Quick start**:
```bash
# Preview documentation locally
cd docs
mkdocs serve
# Open http://localhost:38000

# Build for production
cd frontend
npm run generate:guide
```

For detailed maintenance instructions, see [maintaining-user-guide.md](maintaining-user-guide.md).

### Developer Documentation

- **CONTEXT.md** - Comprehensive project context for AI agents
- **SUMMARY.md** - Quick index of all documentation
- **facts.json** - Stable project truths (highest authority)
- **testing/** - Testing guides and best practices
- **playwright-best-practices.md** - E2E testing patterns
- **WORKFLOWS.md** - Development workflows

### Auto-Generated Documentation

- **_generated/api/** - API documentation from Python docstrings (via pdoc3)
- **_generated/plans_index.md** - Active project plans summary

## User Guide Structure

```
docs/
├── mkdocs.yml              # MkDocs configuration
├── index.md                # Welcome page
├── getting-started.md      # Quick 5-minute tour
├── uploading-data.md       # Upload process
├── understanding-grid.md   # 9-box grid explanation
├── donut-mode.md          # Donut exercise feature
├── working-with-employees.md
├── tracking-changes.md
├── filters.md
├── statistics.md
├── exporting.md
├── settings.md            # Theme and settings
├── tips.md
├── troubleshooting.md
└── images/
    └── screenshots/       # Auto-generated screenshots
        ├── grid-normal.png
        ├── grid-donut.png
        └── ...
```

## Building Documentation

### Local Development

```bash
# Live preview with auto-reload
cd docs
mkdocs serve
```

### Production Build

```bash
# Build and bundle for Electron app
cd frontend
npm run generate:guide
```

### Screenshot Generation

```bash
# Regenerate all screenshots
cd frontend
npm run generate:screenshots
```

## Documentation Standards

### Format
- Use Markdown for all documentation
- Include table of contents for longer documents
- Use clear headings and subheadings
- Include code examples and screenshots
- Use MkDocs admonitions for tips/warnings/notes

### MkDocs Features

Available markdown extensions:
- **Admonitions**: `!!! note`, `!!! tip`, `!!! warning`, `!!! danger`
- **Code blocks**: With syntax highlighting
- **Tabbed content**: `=== "Tab 1"` / `=== "Tab 2"`
- **Keyboard shortcuts**: `++ctrl+f++`
- **Tables**: GitHub-flavored markdown tables

### API Documentation
- Document all public APIs with docstrings
- Include request/response examples
- Specify error codes and handling
- Keep in sync with code changes
- Auto-generated via pdoc3 in CI/CD

## Maintenance

### Regular Updates
- Review documentation when features change
- Update screenshots after UI changes
- Keep cross-references accurate
- Test links and navigation

### Regenerating Documentation

```bash
# Auto-generate API docs, update CONTEXT.md, clean agent-tmp/
python tools/build_context.py
```

This happens automatically:
- On push to main (if docs/ or src/ changed)
- Nightly at 2 AM UTC

### Migration from agent-projects

When a project in `agent-projects/` is complete:

1. Review the documentation
2. Extract permanent, valuable information
3. Organize it appropriately in `docs/`
4. Update cross-references
5. Delete the temporary project folder

## Version Control

**Commit**:
- `docs/*.md` - Documentation source files
- `mkdocs.yml` - MkDocs configuration (project root)
- `docs/images/screenshots/*.png` - Screenshots
- `tools/generate_docs_screenshots.py` - Screenshot generator
- `frontend/scripts/generate-user-guide.cjs` - Build wrapper script

**Don't commit** (git-ignored):
- `/site` - MkDocs build output (project root)
- `resources/user-guide/` - Bundled documentation (will be created when MkDocs build is implemented)

## Additional Resources

- **Maintaining User Guide**: [maintaining-user-guide.md](maintaining-user-guide.md)
- **Contributing**: [../CONTRIBUTING.md](../CONTRIBUTING.md)
- **MkDocs Material**: https://squidfunk.github.io/mkdocs-material/
- **Testing Docs**: [testing/README.md](testing/README.md)
