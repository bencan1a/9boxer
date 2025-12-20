# Maintaining the User Guide Documentation

This guide explains how to maintain and update the 9Boxer user documentation system. The documentation uses MkDocs Material to create a professional, multi-page user guide that is bundled with the Electron application.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Documentation Architecture](#documentation-architecture)
- [Editing Documentation](#editing-documentation)
- [Regenerating Screenshots](#regenerating-screenshots)
- [Building Documentation Locally](#building-documentation-locally)
- [Build Integration](#build-integration)
- [MkDocs Features](#mkdocs-features)
- [Troubleshooting](#troubleshooting)
- [Version Control](#version-control)
- [PR Checklist](#pr-checklist)

## Overview

### Why MkDocs Material?

The 9Boxer documentation system uses **MkDocs Material** for several key reasons:

- **Professional Navigation**: Multi-page structure with sidebar navigation and built-in search
- **Visual Documentation**: Supports embedded screenshots for better user understanding
- **Material Design**: Dark theme matching the application's Material-UI aesthetic
- **Offline Search**: Lunr.js-based search works in bundled Electron app without internet
- **Python-Based**: Fits naturally with the existing Python backend toolchain
- **Easy Maintenance**: Simple markdown editing with powerful features

### High-Level Architecture

```
USER_GUIDE.md (deprecated)
       ↓
  docs/*.md (source files)
       ↓
   mkdocs build
       ↓
  docs/site/ (static HTML site)
       ↓
tools/build_user_guide.py
       ↓
resources/user-guide/ (bundled in app)
       ↓
  Electron Builder
       ↓
Platform Installers (Windows/macOS/Linux)
```

The documentation is authored in Markdown, built into a static HTML site by MkDocs, and then bundled into the Electron application as offline documentation.

## Prerequisites

To work with the documentation system, you need:

### Required
- **Python 3.10+** with virtual environment activated
- **mkdocs-material** installed (included in `.[dev]` dependencies)
- **Node.js and npm** (for build integration and screenshot generation)

### Optional (for screenshots)
- **Playwright** (for automated screenshot generation)
- Sample data loaded in the application

### Setup

From the project root:

```bash
# Activate virtual environment
. .venv/bin/activate        # Linux/macOS
# or
.venv\Scripts\activate      # Windows

# Install dependencies (if not already installed)
pip install uv
uv pip install --system -e '.[dev]'

# Verify MkDocs is installed
mkdocs --version
```

## Documentation Architecture

### Directory Structure

```
mkdocs.yml                      # MkDocs configuration (project root)
docs/
├── index.md                    # Welcome page
├── getting-started.md          # Quick tour
├── uploading-data.md           # Upload process
├── understanding-grid.md       # 9-box grid explanation
├── donut-mode.md              # Donut exercise feature
├── working-with-employees.md  # Drag-drop, notes, timeline
├── tracking-changes.md        # Change tracker
├── filters.md                 # Filtering and exclusions
├── statistics.md              # Stats and intelligence
├── exporting.md               # Export functionality
├── settings.md                # Theme and settings
├── tips.md                    # Best practices
├── troubleshooting.md         # Common issues
├── images/
│   └── screenshots/           # Auto-generated screenshots
│       ├── grid-normal.png
│       ├── grid-donut.png
│       ├── settings-dialog.png
│       └── ...
└── site/                      # Build output (git-ignored)
    └── ...

resources/
└── user-guide/                # Bundled in Electron app
    ├── index.html
    ├── assets/
    ├── search/
    └── ...

tools/
├── build_user_guide.py        # Build script (mkdocs build wrapper)
└── generate_docs_screenshots.py  # Screenshot automation
```

### Configuration

The `mkdocs.yml` file (located in the project root) configures:
- **Site metadata**: Title, description, author
- **Navigation structure**: Page hierarchy and ordering
- **Theme settings**: Material Design dark theme, colors, fonts
- **Features**: Search, navigation tabs, instant loading, etc.
- **Extensions**: Admonitions, code highlighting, tables, etc.

## Editing Documentation

### Adding a New Page

To add a new documentation page:

1. **Create the markdown file** in `docs/`:
   ```bash
   # From project root
   touch docs/my-new-page.md
   ```

2. **Add front matter and content**:
   ```markdown
   # My New Feature

   Brief introduction to the feature.

   ## How to Use

   Step-by-step instructions...
   ```

3. **Update navigation** in `mkdocs.yml` (project root):
   ```yaml
   nav:
     - Home: index.md
     - Getting Started: getting-started.md
     - My New Feature: my-new-page.md  # Add here
     - ...
   ```

4. **Update cross-references** in related pages:
   ```markdown
   For more information, see [My New Feature](my-new-page.md).
   ```

5. **Build and test locally**:
   ```bash
   cd docs
   mkdocs serve
   # Open http://localhost:8000
   ```

### Updating Existing Content

To update an existing page:

1. **Edit the relevant `.md` file** in `docs/`
2. **Use MkDocs markdown extensions** (see [MkDocs Features](#mkdocs-features))
3. **Preserve internal links** - Update if page structure changes
4. **Build and verify**:
   ```bash
   cd docs
   mkdocs serve
   ```

### Best Practices for Writing

- **Use descriptive headings**: Clear hierarchy (H1 → H2 → H3)
- **Keep paragraphs short**: 2-4 sentences max for readability
- **Add screenshots**: Visual aids improve understanding
- **Use admonitions**: Highlight tips, warnings, and important info
- **Link related pages**: Help users navigate between topics
- **Test all links**: Ensure internal and external links work
- **Use code blocks**: Show exact commands, filenames, or data formats

## MkDocs Features

MkDocs Material provides powerful markdown extensions:

### Admonitions (Callouts)

Highlight important information:

```markdown
!!! note "Optional Title"
    This is a note admonition.

!!! tip
    This is a tip for the user.

!!! warning "Important"
    This warns the user about something.

!!! danger "Critical"
    This is for critical warnings.

!!! info
    This provides additional information.
```

### Code Blocks with Syntax Highlighting

```markdown
```python
def calculate_score(performance, potential):
    """Calculate 9-box score."""
    return (performance + potential) / 2
```
```

### Tabbed Content

```markdown
=== "Windows"
    ```bash
    .venv\Scripts\activate
    ```

=== "Linux/macOS"
    ```bash
    . .venv/bin/activate
    ```
```

### Keyboard Shortcuts

```markdown
Press ++ctrl+f++ to search, or ++ctrl+shift+p++ to open command palette.
```

### Tables

```markdown
| Column      | Performance | Potential |
|-------------|-------------|-----------|
| High/High   | 4-5         | 4-5       |
| Medium/High | 2-3         | 4-5       |
| Low/High    | 1           | 4-5       |
```

### Images

```markdown
![Grid in normal mode](images/screenshots/grid-normal.png)

*Figure 1: The 9-box grid showing employee distribution*
```

### Internal Links

```markdown
See [Getting Started](getting-started.md) for a quick tour.

Jump to [Donut Mode Exercise](donut-mode.md#starting-donut-mode) for details.
```

## Regenerating Screenshots

### When to Regenerate

Regenerate screenshots when:
- **UI changes** affect documented features
- **New features** are added and need visual documentation
- **Theme or styling** updates change the app's appearance
- **Before major releases** to ensure all visuals are current

### How to Regenerate All Screenshots

The screenshot generation is fully automated using Playwright:

```bash
# From project root
cd frontend
npm run generate:screenshots
```

This will:
1. Start the backend server (FastAPI)
2. Start the frontend dev server (Vite)
3. Load sample employee data
4. Navigate through the application
5. Capture screenshots of key features
6. Save to `docs/images/screenshots/`
7. Optimize images for web

**Expected output:**
```
Generating documentation screenshots...
✓ Backend server started (port 8000)
✓ Frontend server started (port 5173)
✓ Loaded sample data
✓ Captured grid-normal.png
✓ Captured grid-donut.png
✓ Captured settings-dialog.png
✓ Captured filter-drawer.png
✓ Captured employee-tile-states.png
✓ Captured change-tracker-tabs.png
✓ Captured statistics-tab.png
✓ All screenshots saved to docs/images/screenshots/
```

### Selective Regeneration

To regenerate specific screenshots, modify `tools/generate_docs_screenshots.py`:

```python
# Comment out screenshots you don't want to regenerate
screenshots = [
    # {"name": "grid-normal.png", "action": capture_grid_normal},
    {"name": "settings-dialog.png", "action": capture_settings},  # Only this one
]
```

Then run:
```bash
cd frontend
npm run generate:screenshots
```

### Screenshot Best Practices

- **Consistent viewport**: All screenshots use 1400x900 resolution
- **Dark theme enabled**: Matches the app's default theme
- **Sample data loaded**: Use representative data for realistic screenshots
- **Clear focus**: Capture only the relevant UI element/feature
- **Compress for web**: Use WebP format for smaller file sizes (fallback to PNG)
- **Descriptive filenames**: `feature-name-state.png` (e.g., `grid-donut-mode.png`)

### Updating Screenshot Script

If you need to add a new screenshot:

1. **Edit** `tools/generate_docs_screenshots.py`
2. **Add a new capture function**:
   ```python
   async def capture_new_feature(page):
       """Capture the new feature."""
       # Navigate to feature
       await page.click('[data-testid="new-feature-button"]')
       await page.wait_for_selector('[data-testid="new-feature-dialog"]')

       # Take screenshot
       await page.screenshot(path='docs/images/screenshots/new-feature.png')
   ```

3. **Add to screenshot list**:
   ```python
   screenshots = [
       # ... existing screenshots ...
       {"name": "new-feature.png", "action": capture_new_feature},
   ]
   ```

4. **Run the script** to generate

## Building Documentation Locally

### Development Preview (Live Reload)

For active editing with live preview:

```bash
# From project root
cd docs

# Start MkDocs development server
mkdocs serve

# Open browser to http://localhost:8000
```

This provides:
- **Live reload**: Changes appear instantly
- **Search preview**: Test search functionality
- **Navigation testing**: Verify sidebar and links

**Tip**: Keep this running while editing documentation for instant feedback.

### Production Build

To build the final static site:

```bash
# Option 1: Using MkDocs directly
cd docs
mkdocs build
# Output in docs/site/

# Option 2: Using the build script (recommended)
cd frontend
npm run generate:guide
# Output in resources/user-guide/
```

The build script (`npm run generate:guide`):
1. Validates backend executable exists
2. Runs `mkdocs build` with custom output directory
3. Copies static site to `resources/user-guide/`
4. Optimizes assets for bundling

### Testing in Electron

To test the bundled documentation in the Electron app:

```bash
cd frontend

# Run Electron in development mode
npm run electron:dev

# Click the "Help" button in the app to open documentation
```

This verifies:
- Documentation loads correctly
- Offline search works
- All links navigate properly
- Images display correctly
- Theme matches app aesthetic

## Build Integration

### How It Works

The documentation build is integrated into the Electron application build pipeline:

```
npm run electron:build
       ↓
1. npm run generate:guide
       ↓
2. tools/build_user_guide.py
       ↓
   mkdocs build --site-dir ../resources/user-guide
       ↓
3. npm run build (Vite)
       ↓
4. npm run electron:compile (TypeScript)
       ↓
5. electron-builder
       ↓
Platform Installers
```

### Build Pipeline Steps

**Step 1: Generate Documentation**
- Script: `tools/build_user_guide.py`
- Action: Runs `mkdocs build` and outputs to `resources/user-guide/`
- Validates: MkDocs installation, site builds without errors

**Step 2: Validate Backend**
- Script: `frontend/scripts/ensure-backend.cjs`
- Action: Checks that backend executable exists
- Fails: If backend not built (reminds developer to build backend first)

**Step 3: Build Frontend**
- Command: `npm run build`
- Action: Vite builds React app for production
- Output: `frontend/dist/`

**Step 4: Compile Electron**
- Command: `npm run electron:compile`
- Action: TypeScript compiles Electron main/preload processes
- Output: `frontend/dist-electron/`

**Step 5: Package Application**
- Command: `electron-builder`
- Action: Creates platform-specific installers
- Includes: `resources/user-guide/` as extraResources
- Output: `frontend/release/`

### Electron IPC Integration

The Electron main process handles the Help button:

```typescript
// frontend/electron/main/index.ts
ipcMain.handle('open-help', async () => {
  const helpPath = path.join(
    process.resourcesPath,
    'user-guide',
    'index.html'
  );
  shell.openExternal(`file://${helpPath}`);
});
```

This opens the documentation in the user's default browser, providing:
- Full navigation and search
- Proper link handling
- Offline functionality

### Build Scripts

#### `npm run generate:guide`

Defined in `frontend/package.json`:

```json
"scripts": {
  "generate:guide": "node scripts/generate-user-guide.cjs"
}
```

Executes `frontend/scripts/generate-user-guide.cjs`, which calls `tools/build_user_guide.py`.

#### `tools/build_user_guide.py`

**Note**: This script will be created when the MkDocs migration is complete. Currently, the system uses `tools/convert_user_guide.py` to generate a single HTML file. The new script will look like:

```python
#!/usr/bin/env python3
"""
Build MkDocs documentation and copy to resources/user-guide/.
"""

import subprocess
from pathlib import Path

def main():
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "resources" / "user-guide"

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Build documentation (mkdocs.yml is in project root)
    subprocess.run(
        ["mkdocs", "build", "--site-dir", str(output_dir)],
        cwd=project_root,
        check=True
    )

    print(f"[OK] Documentation built to {output_dir}")

if __name__ == "__main__":
    main()
```

The corresponding `frontend/scripts/generate-user-guide.cjs` will be updated to call this new script instead of `convert_user_guide.py`.

## Troubleshooting

### Common Issues

#### MkDocs Build Errors

**Problem**: `mkdocs build` fails with syntax errors

**Symptoms**:
```
Error: Invalid syntax in docs/my-page.md line 42
```

**Solutions**:
1. Check markdown syntax (headings, lists, code blocks)
2. Ensure YAML front matter is valid (if used)
3. Verify code block closures (triple backticks)
4. Check for special characters in headings

#### Broken Internal Links

**Problem**: Links between documentation pages don't work

**Symptoms**:
- 404 errors when clicking links
- Build warnings: "WARNING - Doc file 'page.md' contains a link to 'missing.md'"

**Solutions**:
1. Use relative links: `[Text](other-page.md)` not `[Text](/other-page.md)`
2. Update links when renaming files
3. Use `mkdocs build --strict` to catch link errors
4. Verify anchor links: `[Text](page.md#section)`

#### Images Not Loading

**Problem**: Screenshots don't display in documentation

**Symptoms**:
- Broken image icons
- Alt text shown instead of images

**Solutions**:
1. Verify image path: `![Alt](images/screenshots/file.png)` (relative to markdown file)
2. Check file exists: `ls docs/images/screenshots/file.png`
3. Ensure proper case (filenames are case-sensitive)
4. Regenerate screenshots if missing

#### Search Not Working

**Problem**: Search returns no results or doesn't load

**Symptoms**:
- Search box doesn't appear
- Searching returns "No results"
- Console errors about search index

**Solutions**:
1. Rebuild documentation: `mkdocs build --clean`
2. Check `mkdocs.yml` (project root) has search plugin enabled
3. Verify `search/` directory exists in build output
4. Clear browser cache if testing locally

#### Electron Help Button Doesn't Open Documentation

**Problem**: Clicking Help in the app does nothing or shows error

**Symptoms**:
- No action when clicking Help
- Error: "File not found"
- Documentation doesn't load

**Solutions**:
1. Verify documentation was built: `ls resources/user-guide/index.html`
2. Rebuild Electron app: `npm run electron:build`
3. Check Electron Builder includes extraResources in `electron-builder.json`
4. Verify IPC handler in `frontend/electron/main/index.ts`

#### Build Script Fails

**Problem**: `npm run generate:guide` fails

**Symptoms**:
```
Error: Python virtual environment not found
Error: mkdocs command not found
```

**Solutions**:
1. Activate virtual environment: `. .venv/bin/activate`
2. Install dependencies: `uv pip install --system -e '.[dev]'`
3. Verify MkDocs installed: `mkdocs --version`
4. Check `tools/build_user_guide.py` is executable

### Debugging Tips

**Enable verbose output**:
```bash
mkdocs build --verbose
```

**Strict mode (fail on warnings)**:
```bash
mkdocs build --strict
```

**Clean build (remove cache)**:
```bash
mkdocs build --clean
```

**Validate configuration**:
```bash
mkdocs --version
python -c "import mkdocs; print(mkdocs.__version__)"
```

## Version Control

### What to Commit

**Always commit**:
- `docs/*.md` - Source documentation files
- `mkdocs.yml` - MkDocs configuration (project root)
- `docs/images/screenshots/*.png` - Generated screenshots (important for reproducibility)
- `tools/build_user_guide.py` - Build script (when it exists)
- `tools/generate_docs_screenshots.py` - Screenshot generator

**Never commit** (git-ignored):
- `docs/site/` - Generated static site (build artifact)
- `resources/user-guide/` - Bundled documentation (build artifact)

### .gitignore Entries

Ensure these are in `.gitignore`:

```gitignore
# MkDocs build output
docs/site/

# Bundled documentation (build artifact)
resources/user-guide/
```

### Commit Message Examples

```bash
# Documentation content update
git commit -m "docs: Update donut mode instructions with new UI flow"

# Screenshot update
git commit -m "docs: Regenerate screenshots for dark theme update"

# Configuration change
git commit -m "docs: Add new statistics page to navigation"

# Build script update
git commit -m "build: Improve documentation build error handling"
```

## PR Checklist

When submitting a pull request that includes documentation changes:

### Content Changes

- [ ] Content added/updated in appropriate `.md` files
- [ ] Cross-references updated in related pages
- [ ] Screenshots regenerated if UI changed (`npm run generate:screenshots`)
- [ ] Internal links verified (no broken links)
- [ ] Code examples tested and accurate

### Quality Checks

- [ ] Built locally and previewed (`mkdocs serve`)
- [ ] Tested in Electron app (`npm run electron:dev`)
- [ ] All links work (internal and external)
- [ ] Search finds relevant content
- [ ] Images display correctly (no broken images)
- [ ] Admonitions used appropriately (tips, warnings, notes)

### Build Integration

- [ ] Documentation builds without errors (`mkdocs build`)
- [ ] No warnings in build output (or justified)
- [ ] Bundled correctly in resources/user-guide/
- [ ] Help button opens new documentation

### Version Control

- [ ] Only source files committed (no build artifacts)
- [ ] Screenshots committed if updated
- [ ] Commit messages follow conventions
- [ ] CONTRIBUTING.md updated if workflow changed

### Final Review

- [ ] Spell check and grammar review
- [ ] Consistent formatting and style
- [ ] User-friendly language (no excessive jargon)
- [ ] Clear and actionable instructions

## Additional Resources

- **MkDocs Documentation**: https://www.mkdocs.org/
- **Material for MkDocs**: https://squidfunk.github.io/mkdocs-material/
- **Markdown Guide**: https://www.markdownguide.org/
- **Playwright Documentation**: https://playwright.dev/

## Questions or Issues?

If you encounter issues not covered in this guide:

1. Check existing issues in the repository
2. Review MkDocs Material documentation
3. Consult `docs/WORKFLOWS.md` for general workflows
4. Open an issue with the "documentation" label

---

**Last Updated**: 2024-12-20
