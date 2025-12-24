# Screenshot Generation Tool - Maintenance Guide

**Tool Location:** `tools/generate_docs_screenshots.py`
**Last Updated:** 2025-12-23
**Status:** Production-ready (A- grade, 92% Playwright compliance)

---

## Quick Start

### Generating All Screenshots

```bash
# From project root, with venv activated
.venv/Scripts/activate  # Windows
# or
. .venv/bin/activate    # Linux/macOS

# Generate all screenshots (recommended)
python tools/generate_docs_screenshots.py

# Output: resources/user-guide/docs/images/screenshots/
```

### Generating Specific Screenshots

```bash
# Generate only quickstart screenshots
python tools/generate_docs_screenshots.py --screenshots quickstart-file-menu-button,quickstart-grid-populated

# See all options
python tools/generate_docs_screenshots.py --help
```

### Expected Results

**Successful run:**
```
✅ Successful: 33/34 automated screenshots
📋 Manual: 8 (Excel files, compositions)
❌ Failed: 0
```

If failures occur, see [Troubleshooting](#troubleshooting) below.

---

## Architecture Overview

### Key Components

1. **ServerManager** - Manages backend (FastAPI) and frontend (Vite) server lifecycle
2. **ScreenshotGenerator** - Core screenshot capture logic with 40+ screenshot methods
3. **Helper Methods** - 6 reusable methods for common operations
4. **Screenshot Registry** - Dictionary mapping screenshot names to capture methods

### Data Flow

```
main()
  ↓
Start servers (backend + frontend)
  ↓
Launch Playwright browser
  ↓
Load sample data (initial)
  ↓
For each screenshot:
  ├─ Check if data needed → Reload if necessary
  ├─ Set up UI state (clicks, drags, selections)
  ├─ Wait for animations/network to settle
  ├─ Verify expected state with expect() assertions
  └─ Capture screenshot
  ↓
Shut down servers and browser
```

### State Management

**Critical Pattern:** Each screenshot is **self-sufficient** and reloads data if needed.

```python
# Pattern used in most screenshots
employee_cards = self.page.locator('[data-testid^="employee-card-"]')
if await employee_cards.count() == 0:
    await self.upload_sample_data()
```

This ensures screenshots can run in any order without breaking.

---

## Adding New Screenshots

### Step 1: Create Screenshot Method

Add a new method to the `ScreenshotGenerator` class:

```python
async def capture_my_new_screenshot(self) -> Path | None:
    """Capture <description of what this screenshot shows>

    <Explain the UI state being captured>
    <Note any prerequisites or manual post-processing>
    """
    # Ensure data is loaded (if needed)
    employee_cards = self.page.locator('[data-testid^="employee-card-"]')
    if await employee_cards.count() == 0:
        await self.upload_sample_data()

    await self.close_dialogs()

    # Set up UI state
    # ... your screenshot-specific logic ...

    # Wait for state to settle
    await self.wait_for_ui_settle(0.5)

    # Verify expected state
    element = self.page.locator('[data-testid="my-element"]')
    await expect(element).to_be_visible(timeout=5000)

    # Capture screenshot
    return await self.capture_screenshot(
        "category/my-screenshot-name",
        element_selector='[data-testid="my-element"]',  # or None for full page
    )
```

### Step 2: Register in main()

Add to the `all_screenshots` dictionary in `main()`:

```python
all_screenshots = {
    # ... existing screenshots ...

    # My New Feature Screenshots
    "my-new-screenshot": generator.capture_my_new_screenshot,
}
```

### Step 3: Test

```bash
# Test just your new screenshot
python tools/generate_docs_screenshots.py --screenshots my-new-screenshot

# If successful, test full generation
python tools/generate_docs_screenshots.py
```

---

## Helper Methods Reference

Use these helpers to reduce code duplication:

### 1. `wait_for_ui_settle(duration: float = 0.5)`

Combines `waitForLoadState('networkidle')` + `asyncio.sleep()`.

**When to use:**
- After page navigation
- After data upload
- After any operation that triggers network requests

```python
await self.wait_for_ui_settle(0.5)  # Standard 500ms settle
await self.wait_for_ui_settle(0.3)  # Quick animations
await self.wait_for_ui_settle(1.0)  # Complex operations (drags with API calls)
```

### 2. `perform_employee_drag(source_box_index, target_box_index, wait_after)`

Standardized employee drag-and-drop operation.

```python
# Drag any employee to box 1
await self.perform_employee_drag(target_box_index=1)

# Drag from box 5 to box 9
await self.perform_employee_drag(source_box_index=5, target_box_index=9)

# Drag with custom wait time
await self.perform_employee_drag(target_box_index=3, wait_after=1.0)
```

### 3. `click_tab_and_wait(tab_selector, wait_duration)`

Click tab and wait for content to load.

```python
# Click Changes tab
await self.click_tab_and_wait('[data-testid="changes-tab"]')

# Click with custom wait
await self.click_tab_and_wait('[data-testid="statistics-tab"]', wait_duration=0.8)
```

### 4. `select_filter_by_text(filter_text, wait_after)`

Select filter option by visible text.

```python
# Select "High" performance filter
await self.select_filter_by_text("High")

# Select multiple filters
await self.select_filter_by_text("High", wait_after=0.2)
await self.select_filter_by_text("Medium", wait_after=0.2)
```

### 5. `ensure_changes_exist(min_changes: int = 1)`

Ensures minimum changes exist, creates via drags if needed.

```python
# Ensure at least 1 change exists
await self.ensure_changes_exist()

# Ensure 3 changes for populated screenshot
await self.ensure_changes_exist(min_changes=3)
```

### 6. `activate_donut_mode()`

Activate donut mode and verify it's active.

```python
# Activate donut mode (idempotent)
await self.activate_donut_mode()
```

---

## Timing Guidelines

### Material-UI Animation Timings

```python
asyncio.sleep(0.2)  # Brief animations, hover effects
asyncio.sleep(0.3)  # Menu animations (Material-UI Popover ~300ms)
asyncio.sleep(0.5)  # Grid re-renders, drawer animations, stabilization
asyncio.sleep(1.0)  # Complex multi-step: API call + React update + CSS transition
```

### Network Waits

```python
await self.wait_for_ui_settle(0.5)  # Standard: networkidle + 500ms settle
```

**When to use each:**
- **0.2s:** Pure CSS animations with no state change
- **0.3s:** Material-UI component animations
- **0.5s:** After data loading, grid updates, most operations
- **1.0s:** After drag-drop operations that trigger API calls

**Rule of thumb:** If unsure, use `wait_for_ui_settle(0.5)` after operations.

---

## Playwright Best Practices

### Selectors (Priority Order)

1. **data-testid** (preferred - most stable)
   ```python
   self.page.locator('[data-testid="filter-button"]')
   ```

2. **Accessibility roles** (good for semantic elements)
   ```python
   self.page.get_by_role("button", name="Apply")
   ```

3. **Text content** (use when data-testid unavailable)
   ```python
   self.page.locator('text="High"').first
   ```

4. **CSS selectors** (last resort - brittle)
   ```python
   self.page.locator('.MuiButton-root')  # Avoid if possible
   ```

### Assertions (Auto-Retry)

**Prefer:**
```python
await expect(element).to_be_visible(timeout=5000)
await expect(element).to_be_enabled(timeout=5000)
```

**Avoid:**
```python
if await element.count() > 0:  # No auto-retry!
```

### Waiting Patterns

**Good:**
```python
await self.page.wait_for_load_state('networkidle')  # Wait for network
await expect(element).to_be_visible(timeout=5000)   # Wait for element
await asyncio.sleep(0.5)  # Wait for animations (with comment explaining why)
```

**Bad:**
```python
await self.page.wait_for_timeout(5000)  # Arbitrary timeout - AVOID
```

---

## Troubleshooting

### Common Failures

#### 1. "Locator expected to be visible" - Employee cards not found

**Cause:** Data not loaded (previous screenshot cleared state)

**Fix:** Add data loading check:
```python
employee_cards = self.page.locator('[data-testid^="employee-card-"]')
if await employee_cards.count() == 0:
    await self.upload_sample_data()
```

#### 2. "element is not enabled" - Filter button disabled

**Cause:** Filter button disabled when no data loaded

**Fix:** Add data loading + wait for enabled:
```python
employee_cards = self.page.locator('[data-testid^="employee-card-"]')
if await employee_cards.count() == 0:
    await self.upload_sample_data()

await expect(filters_button).to_be_enabled(timeout=5000)
```

#### 3. Screenshot shows empty state instead of populated

**Cause:** Screenshot captured before data rendered

**Fix:** Use `expect()` to verify data visible:
```python
await expect(employee_cards.first).to_be_visible(timeout=5000)
```

#### 4. Visual indicators missing (orange borders, badges)

**Cause:** Screenshot captured before animations completed

**Fix:** Wait longer after state changes:
```python
await self.perform_employee_drag(...)
await self.wait_for_ui_settle(0.5)  # Or 1.0 for drags
```

#### 5. Servers fail to start

**Cause:** Ports already in use (8000, 5173)

**Fix:** Kill existing processes:
```bash
# Windows
taskkill /F /IM python.exe
taskkill /F /IM node.exe

# Linux/macOS
pkill -f "uvicorn"
pkill -f "vite"
```

### Debugging Tips

1. **Run specific screenshot** to isolate issue:
   ```bash
   python tools/generate_docs_screenshots.py --screenshots failing-screenshot
   ```

2. **Check screenshot output** - Open generated image to see what state was captured

3. **Add temporary print statements** for debugging:
   ```python
   print(f"Employee count: {await employee_cards.count()}")
   ```

4. **Run with headed browser** (modify code temporarily):
   ```python
   browser = await playwright.chromium.launch(headless=False)  # See browser
   ```

5. **Check server logs** - Look for backend/frontend errors in console output

---

## File Organization

### Screenshot Output Structure

```
resources/user-guide/docs/images/screenshots/
├── grid-normal.png
├── employee-tile-normal.png
├── quickstart/
│   ├── quickstart-file-menu-button.png
│   ├── quickstart-upload-dialog.png
│   ├── quickstart-grid-populated.png
│   └── quickstart-success-annotated.png
├── workflow/
│   ├── calibration-*.png
│   ├── making-changes-*.png
│   └── workflow-*.png
├── filters/
├── statistics/
├── donut-mode/
├── tracking-changes/
├── working-with-employees/
├── index/
└── exporting/
```

### Naming Conventions

- Use descriptive names: `calibration-filters-panel.png` not `filters.png`
- Group by feature: `quickstart/`, `workflow/`, `filters/`
- Prefix by purpose: `calibration-*`, `making-changes-*`, `notes-*`

---

## Manual Screenshots

These require external tools and cannot be automated:

### Excel Screenshots (5)

**Tools needed:** Microsoft Excel or LibreOffice Calc

1. `quickstart-excel-sample.png` - Column highlighting in Excel
2. `workflow-export-excel-2.png` - Excel output example
3. `calibration-export-results.png` - Excel with calibration results
4. `export-excel-notes-column.png` - Excel notes column
5. `excel-file-new-columns.png` - Excel showing added columns

**Process:**
1. Open exported Excel file from 9Boxer
2. Screenshot relevant columns with highlighting
3. Save to appropriate screenshots folder
4. Crop to show only relevant data

### Multi-Panel Compositions (3)

**Tools needed:** Image editor (Photoshop, GIMP, Figma)

1. `changes-drag-sequence.png` - 3-panel: hover → dragging → dropped
2. `filters-before-after.png` - 2-panel: before/after comparison
3. `donut-mode-toggle-comparison.png` - 2-panel: normal vs donut

**Process:**
1. Generate base screenshots (tool creates them)
2. Combine in image editor with clean spacing
3. Add panel numbers/labels if needed
4. Export as PNG

---

## Maintenance Checklist

### When UI Changes

- [ ] Identify which screenshots are affected
- [ ] Update `data-testid` selectors if UI structure changed
- [ ] Regenerate affected screenshots
- [ ] Verify screenshots match new UI state

### When Adding New Features

- [ ] Create screenshot capture method
- [ ] Add to `all_screenshots` registry
- [ ] Test screenshot generation
- [ ] Update documentation to reference new screenshot

### When Documentation Changes

- [ ] Verify screenshot still matches description
- [ ] Regenerate if mismatch found
- [ ] Update screenshot if feature description changed

### Quarterly Maintenance

- [ ] Run full screenshot generation
- [ ] Review all screenshots for accuracy
- [ ] Update outdated screenshots
- [ ] Check Playwright version for updates
- [ ] Review and update timing constants if Material-UI updated

---

## Performance Optimization

### Current Performance

- **Full generation:** ~2-3 minutes for 33 screenshots
- **Per screenshot:** ~3-5 seconds average
- **Bottlenecks:** Server startup (~30s), data loading, waits

### Tips for Faster Generation

1. **Generate subsets** when testing changes:
   ```bash
   python tools/generate_docs_screenshots.py --screenshots quickstart-file-menu-button,quickstart-grid-populated
   ```

2. **Keep servers running** during development (manual mode - modify code)

3. **Skip unnecessary waits** - But only after verifying screenshots are stable

4. **Use WebP format** for smaller file sizes (optional):
   ```bash
   python tools/generate_docs_screenshots.py --format webp --quality 85
   ```

---

## Code Quality Standards

### Before Committing Changes

- [ ] All existing screenshots still generate successfully
- [ ] New screenshots follow naming conventions
- [ ] Helper methods used to avoid duplication
- [ ] Comprehensive docstrings with examples
- [ ] Inline comments explain all `asyncio.sleep()` calls
- [ ] Playwright best practices followed (data-testid selectors, expect() assertions)

### Code Review Checklist

- [ ] Uses `data-testid` selectors (not CSS classes)
- [ ] Uses `expect().toBeVisible()` instead of `count() > 0`
- [ ] Uses `waitForLoadState('networkidle')` not `waitForTimeout()`
- [ ] All waits have comments explaining duration
- [ ] Helper methods used where applicable
- [ ] Self-sufficient (loads data if needed)

---

## Related Documentation

- [Playwright Best Practices Checklist](../../docs/testing/playwright-best-practices-checklist.md)
- [Screenshot Validation Report](../../agent-tmp/screenshot-validation-final.md)
- [Code Review Report](../../agent-tmp/screenshot-tool-code-review.md)
- [Project Plan](plan.md)

---

## Support

### Questions?

- Review code comments in `tools/generate_docs_screenshots.py` (150+ comments)
- Check Playwright documentation: https://playwright.dev/python/
- Review existing screenshot methods for patterns

### Issues?

- Check [Troubleshooting](#troubleshooting) section first
- Review tool output for error messages
- Run specific failing screenshot to isolate issue

---

**Last Updated:** 2025-12-23
**Tool Version:** Production (Post-Overhaul)
**Maintainer:** Development Team
