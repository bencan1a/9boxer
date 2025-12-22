# Documentation Screenshots

This directory contains automatically generated screenshots for the 9Boxer user guide documentation.

## Purpose

Screenshots provide visual context for users learning how to use 9Boxer. All screenshots are:
- **Automatically generated** using Playwright automation
- **Consistent** - Same viewport size (1400x900), dark theme, sample data
- **Up-to-date** - Regenerated when UI changes
- **Optimized** - WebP format for smaller file sizes (PNG fallback)

## Screenshot Inventory

### Current Screenshots

| Filename | Purpose | Section | Last Updated |
|----------|---------|---------|--------------|
| `grid-normal.png` | Grid in standard view mode | Understanding the Grid | TBD |
| `grid-donut.png` | Grid in donut mode (ghostly tiles) | Donut Mode Exercise | TBD |
| `grid-expanded.png` | Grid in expanded view | Understanding the Grid | TBD |
| `settings-dialog.png` | Theme settings dialog | Settings | TBD |
| `settings-theme-options.png` | Theme options expanded | Settings | TBD |
| `filter-drawer.png` | Filter panel with active filters | Filtering & Exclusions | TBD |
| `filter-active.png` | Grid with active filters | Filtering & Exclusions | TBD |
| `employee-tile-normal.png` | Employee tile in normal state | Working with Employees | TBD |
| `employee-tile-excluded.png` | Employee tile when excluded | Filtering & Exclusions | TBD |
| `employee-tile-ghosted.png` | Employee tile in donut mode | Donut Mode Exercise | TBD |
| `change-tracker-summary.png` | Change tracker summary tab | Tracking Changes | TBD |
| `change-tracker-timeline.png` | Change tracker timeline tab | Tracking Changes | TBD |
| `statistics-tab.png` | Statistics panel view | Statistics & Intelligence | TBD |
| `intelligence-tab.png` | Intelligence insights panel | Statistics & Intelligence | TBD |
| `export-excel-sample.png` | Sample exported Excel output | Exporting | TBD |
| `upload-button.png` | Upload button in app bar | Uploading Data | TBD |

**Note**: "Last Updated" column will be maintained manually or via automation metadata.

## Regenerating Screenshots

### When to Regenerate

Regenerate screenshots in these situations:

1. **UI Changes**: Any changes to the application's visual design, layout, or styling
2. **New Features**: When adding new features that need visual documentation
3. **Theme Updates**: After changing the theme or color palette
4. **Before Releases**: As part of the pre-release checklist to ensure accuracy
5. **Bug Fixes**: If a bug fix changes how a feature looks

### How to Regenerate All Screenshots

From the project root:

```bash
cd frontend
npm run generate:screenshots
```

This automated script will:
1. Start the FastAPI backend server
2. Start the Vite frontend development server
3. Load sample employee data from `resources/Sample_People_List.xlsx`
4. Navigate through each feature in the application
5. Capture screenshots at key points
6. Save optimized images to `docs/images/screenshots/`
7. Clean up (stop servers)

**Expected runtime**: 2-3 minutes

### Regenerating Specific Screenshots

To regenerate only certain screenshots:

1. **Edit** `tools/generate_docs_screenshots.py`
2. **Comment out** screenshots you don't want to regenerate:

```python
screenshots = [
    # {"name": "grid-normal.png", "action": capture_grid_normal},  # Skip this
    {"name": "settings-dialog.png", "action": capture_settings},     # Only this one
    # {"name": "filter-drawer.png", "action": capture_filters},     # Skip this
]
```

3. **Run** the script:

```bash
cd frontend
npm run generate:screenshots
```

### Screenshot Capture Functions

Each screenshot has a corresponding capture function in `tools/generate_docs_screenshots.py`:

```python
async def capture_grid_normal(page):
    """Capture the 9-box grid in normal view."""
    await page.goto('http://localhost:5173')
    await page.wait_for_selector('[data-testid="nine-box-grid"]')
    await page.screenshot(path='docs/images/screenshots/grid-normal.png')

async def capture_settings_dialog(page):
    """Capture the settings dialog."""
    await page.click('[data-testid="settings-button"]')
    await page.wait_for_selector('[data-testid="settings-dialog"]')
    await page.screenshot(path='docs/images/screenshots/settings-dialog.png')
```

## Adding New Screenshots

To add a new screenshot:

### 1. Create Capture Function

Add a new function in `tools/generate_docs_screenshots.py`:

```python
async def capture_my_new_feature(page):
    """
    Capture my new feature.

    Shows the new feature dialog with settings expanded.
    """
    # Navigate to feature
    await page.click('[data-testid="new-feature-button"]')

    # Wait for element to load
    await page.wait_for_selector('[data-testid="new-feature-dialog"]')

    # Optional: Interact with elements
    await page.click('[data-testid="expand-options"]')
    await page.wait_for_timeout(500)  # Allow animation

    # Capture screenshot
    await page.screenshot(
        path='docs/images/screenshots/my-new-feature.png',
        full_page=False  # Only capture viewport
    )
```

### 2. Add to Screenshot List

In the same file, add to the `screenshots` list:

```python
screenshots = [
    # ... existing screenshots ...
    {"name": "my-new-feature.png", "action": capture_my_new_feature},
]
```

### 3. Update This README

Add the new screenshot to the inventory table above:

```markdown
| `my-new-feature.png` | New feature dialog | My Feature Section | 2024-12-20 |
```

### 4. Generate and Verify

```bash
cd frontend
npm run generate:screenshots
```

Verify the screenshot looks correct:
```bash
# View the image
open docs/images/screenshots/my-new-feature.png  # macOS
# or
start docs/images/screenshots/my-new-feature.png  # Windows
```

### 5. Use in Documentation

Reference the screenshot in the relevant documentation page:

```markdown
## My New Feature

This feature allows you to do amazing things.

![My New Feature Dialog](images/screenshots/my-new-feature.png)

*Figure 1: The new feature dialog with options expanded*
```

## Screenshot Best Practices

### Technical Standards

- **Viewport Size**: Always use 1400x900 (consistent across all screenshots)
- **Format**: WebP for smaller size, PNG for compatibility
- **Theme**: Dark theme enabled (matches app default)
- **Sample Data**: Use `resources/Sample_People_List.xlsx`
- **File Size**: Aim for <200KB per screenshot (use compression)

### Visual Standards

- **Focus**: Capture only the relevant UI element or feature
- **Clarity**: Ensure text is readable at documentation display size
- **Context**: Include enough surrounding UI for user orientation
- **State**: Show realistic, representative data (not empty states)
- **Consistency**: Use same data set across related screenshots

### Naming Conventions

Use descriptive, kebab-case filenames:

- `feature-name.png` - Main view of a feature
- `feature-name-state.png` - Specific state (e.g., `grid-donut.png`)
- `feature-name-dialog.png` - Dialog or modal
- `feature-name-options.png` - Options or settings expanded

### Capture Tips

**Do**:
- Wait for animations to complete (`await page.wait_for_timeout(500)`)
- Use `data-testid` selectors for reliability
- Verify elements are visible before capturing
- Use full_page=False for dialogs/modals
- Include representative data

**Don't**:
- Capture with loading spinners visible
- Include personal or sensitive data
- Use random data (use consistent sample data)
- Capture at different viewport sizes
- Include browser chrome or window decorations

## Troubleshooting

### Screenshots Are Blank

**Problem**: Screenshot files are created but contain blank/white images

**Solutions**:
1. Increase wait times: `await page.wait_for_timeout(1000)`
2. Verify element is visible: `await page.wait_for_selector('[data-testid="element"]', state='visible')`
3. Check that backend and frontend servers are running
4. Ensure sample data is loaded

### Screenshots Don't Match Current UI

**Problem**: Screenshots show old UI or outdated styling

**Solutions**:
1. Regenerate all screenshots: `npm run generate:screenshots`
2. Clear browser cache if testing locally
3. Verify you're running the latest frontend code
4. Check theme settings in capture functions

### Script Fails with "Element Not Found"

**Problem**: Playwright can't find elements

**Solutions**:
1. Verify `data-testid` attributes exist in components
2. Check that features are enabled (not behind feature flags)
3. Ensure backend is running with correct data
4. Add longer wait times for slow-loading elements

### File Size Too Large

**Problem**: Screenshots are >500KB

**Solutions**:
1. Use WebP format instead of PNG
2. Reduce viewport size if appropriate
3. Compress images using tools like `imagemin`
4. Capture specific elements instead of full page

## Automation Details

### Script Location

`tools/generate_docs_screenshots.py`

### Dependencies

- **Playwright**: Automated browser control
- **Python 3.10+**: Script runtime
- **Backend server**: FastAPI (must be running)
- **Frontend server**: Vite dev server (must be running)

### Script Structure

```python
async def main():
    """Main screenshot generation workflow."""
    # 1. Start servers
    backend_process = start_backend()
    frontend_process = start_frontend()

    # 2. Initialize Playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1400, 'height': 900})

        # 3. Load sample data
        await load_sample_data(page)

        # 4. Capture each screenshot
        for screenshot in screenshots:
            await screenshot['action'](page)

        # 5. Cleanup
        await browser.close()

    # 6. Stop servers
    stop_servers(backend_process, frontend_process)
```

## Version Control

### Commit Screenshots

**Do commit**:
- All generated screenshots (`*.png`, `*.webp`)
- This README file
- Screenshot generation script (`tools/generate_docs_screenshots.py`)

**Rationale**: Screenshots are documentation assets, not build artifacts.

### When to Update

Commit updated screenshots:
- When UI changes affect documented features
- When adding new features to documentation
- When fixing bugs that change visuals
- Before major releases

### Commit Message Example

```bash
git add docs/images/screenshots/
git commit -m "docs: Regenerate screenshots for dark theme update"
```

## Maintenance Schedule

### Regular Updates

- **After UI changes**: Regenerate affected screenshots immediately
- **Before releases**: Regenerate all screenshots as part of release checklist
- **Quarterly review**: Verify all screenshots are current and relevant

### Screenshot Audit

Periodically review:
1. Are all screenshots still referenced in documentation?
2. Do screenshots accurately represent current UI?
3. Are there new features missing screenshots?
4. Can any screenshots be improved or replaced?

## Additional Resources

- **MkDocs Material - Images**: https://squidfunk.github.io/mkdocs-material/reference/images/
- **Playwright Screenshots**: https://playwright.dev/docs/screenshots
- **Main Maintenance Guide**: [../maintaining-user-guide.md](../maintaining-user-guide.md)
- **Contributing Guide**: [../../CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Last Updated**: 2024-12-20
