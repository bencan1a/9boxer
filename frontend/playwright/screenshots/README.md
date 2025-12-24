# Screenshot Generator

TypeScript-based screenshot generator for 9Boxer documentation. This tool uses Playwright to automatically capture UI screenshots, reusing the same helpers as E2E tests for consistency and maintainability.

## Overview

This screenshot generator replaces the legacy Python tool (`tools/generate_docs_screenshots.py`) with a TypeScript implementation that:

- ✅ Shares helpers with E2E tests (zero code duplication)
- ✅ Uses the same browser automation as tests (Playwright)
- ✅ Provides type safety across the entire pipeline
- ✅ Eliminates Python/TypeScript context switching
- ✅ Ensures documentation screenshots match tested behavior

## Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Generate all automated screenshots
npm run screenshots:generate

# Generate specific screenshots
npm run screenshots:generate grid-normal quickstart-file-menu-button

# Run in headed mode (show browser)
HEADLESS=false npm run screenshots:generate
```

## Architecture

### Directory Structure

```
frontend/playwright/screenshots/
├── generate.ts              # Main CLI entry point
├── config.ts                # Screenshot registry and metadata
├── workflows/               # Screenshot workflow modules (to be created)
│   ├── quickstart.ts        # Quickstart screenshots
│   ├── calibration.ts       # Calibration workflow screenshots
│   ├── changes.ts           # Changes and drag-drop screenshots
│   ├── notes.ts             # Notes screenshots
│   ├── filters.ts           # Filter screenshots
│   ├── statistics.ts        # Statistics screenshots
│   ├── donut.ts             # Donut mode screenshots
│   ├── timeline.ts          # Timeline screenshots
│   ├── employees.ts         # Employee details screenshots
│   ├── exporting.ts         # Export screenshots
│   ├── grid.ts              # Grid and basic UI screenshots
│   └── hero.ts              # Hero and index images
└── README.md                # This file
```

### How It Works

1. **Server Startup**: Automatically starts backend (FastAPI) and frontend (Vite) servers
2. **Browser Launch**: Launches Chromium with consistent viewport (1400x900)
3. **Screenshot Generation**: For each screenshot:
   - Calls workflow function (e.g., `generateFileMenuButton()`)
   - Workflow sets up UI state using shared helpers
   - Captures screenshot to specified path
4. **Result Tracking**: Tracks successful, failed, skipped, and manual screenshots
5. **Summary Report**: Prints detailed summary with success/failure counts

## Configuration

All screenshots are defined in `config.ts` with metadata:

```typescript
export const screenshotConfig: Record<string, ScreenshotMetadata> = {
  'grid-normal': {
    workflow: 'grid',              // Workflow module name
    function: 'generateGridNormal', // Function to call
    path: 'resources/user-guide/docs/images/screenshots/grid-normal.png',
    description: 'Standard 9-box grid with employee tiles',
  },
  // ... more screenshots
};
```

### Screenshot Metadata

- **workflow**: Which workflow module contains the generation function (e.g., `'quickstart'`)
- **function**: Function name to call (e.g., `'generateFileMenuButton'`)
- **path**: Output file path relative to project root
- **description**: Human-readable description of what the screenshot shows
- **manual**: (Optional) Set to `true` if screenshot requires manual capture/annotation

## Adding New Screenshots

### Step 1: Add Configuration Entry

Add entry to `config.ts`:

```typescript
'my-new-screenshot': {
  workflow: 'myWorkflow',
  function: 'generateMyScreenshot',
  path: 'resources/user-guide/docs/images/screenshots/my-new-screenshot.png',
  description: 'Description of what this shows',
}
```

### Step 2: Create Workflow Function

Create or update workflow module in `workflows/`:

```typescript
// frontend/playwright/screenshots/workflows/myWorkflow.ts
import { Page } from '@playwright/test';
import { loadSampleData, clickTabAndWait } from '../../helpers';

/**
 * Generate screenshot: My new screenshot
 */
export async function generateMyScreenshot(page: Page, outputPath: string) {
  // Use shared helpers (same as E2E tests!)
  await loadSampleData(page);
  await clickTabAndWait(page, 'my-tab');

  // Capture screenshot
  await page.locator('[data-testid="my-element"]').screenshot({
    path: outputPath,
  });
}
```

### Step 3: Test Your Screenshot

```bash
npm run screenshots:generate my-new-screenshot
```

## Workflow Modules

Workflow modules contain screenshot generation functions. Each function:

1. **Accepts two parameters**:
   - `page: Page` - Playwright page object
   - `outputPath: string` - Where to save the screenshot

2. **Sets up UI state** using shared helpers from `frontend/playwright/helpers/`:
   - `loadSampleData(page)` - Load sample employee data
   - `loadCalibrationData(page)` - Load calibration sample data
   - `clickTabAndWait(page, tabId)` - Switch tabs
   - `toggleDonutMode(page, enabled)` - Toggle donut mode
   - `openFileMenu(page)` - Open file menu
   - `openFilterDrawer(page)` - Open filter drawer
   - ... and more (see `frontend/playwright/helpers/`)

3. **Captures screenshot** using Playwright's screenshot API:
   ```typescript
   await page.screenshot({ path: outputPath });                    // Full page
   await page.locator('[data-testid="element"]').screenshot({ path: outputPath }); // Element
   ```

### Example Workflow Module

```typescript
// frontend/playwright/screenshots/workflows/quickstart.ts
import { Page } from '@playwright/test';
import { openFileMenu, waitForUiSettle } from '../../helpers';

/**
 * Generate screenshot: File menu button
 */
export async function generateFileMenuButton(page: Page, outputPath: string) {
  await waitForUiSettle(page);

  // Capture toolbar with file menu button highlighted
  await page.locator('[data-testid="toolbar"]').screenshot({
    path: outputPath,
  });
}

/**
 * Generate screenshot: Upload dialog
 */
export async function generateUploadDialog(page: Page, outputPath: string) {
  await openFileMenu(page);
  await page.locator('[data-testid="upload-item"]').click();
  await waitForUiSettle(page, 0.3);

  // Capture upload dialog
  await page.locator('[data-testid="upload-dialog"]').screenshot({
    path: outputPath,
  });
}
```

## Manual Screenshots

Some screenshots require manual capture or post-processing (annotations, multi-panel compositions, Excel file views). These are marked with `manual: true` in config:

```typescript
'quickstart-excel-sample': {
  workflow: 'quickstart',
  function: 'generateExcelSample',
  path: 'resources/user-guide/docs/images/screenshots/quickstart/quickstart-excel-sample.png',
  description: 'Sample Excel file format',
  manual: true,  // Requires manual creation
}
```

Manual screenshots are tracked and reported but not generated automatically.

### Current Manual Screenshots (8 total)

1. `quickstart-excel-sample` - Excel file view
2. `calibration-export-results` - Excel export view
3. `changes-drag-sequence` - Three-panel drag animation composition
4. `notes-export-excel` - Notes column in Excel
5. `filters-before-after` - Before/after comparison composition
6. `donut-mode-toggle-comparison` - Side-by-side mode comparison
7. `excel-file-new-columns` - Excel with new columns

## CI/CD Integration

TODO: Add GitHub Actions workflow to automatically regenerate screenshots on schedule or manual trigger.

Example workflow:

```yaml
name: Generate Documentation Screenshots

on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday at 2 AM

jobs:
  generate-screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Build backend
        run: |
          cd backend
          ./scripts/build_executable.sh

      - name: Generate screenshots
        run: |
          cd frontend
          npm run screenshots:generate

      - name: Commit updated screenshots
        run: |
          git config user.name "Screenshot Bot"
          git config user.email "bot@9boxer.com"
          git add resources/user-guide/docs/images/screenshots/
          git commit -m "docs: regenerate screenshots [skip ci]" || true
          git push
```

## Troubleshooting

### Backend not found error

```
Error: Backend executable not found at backend/dist/ninebox/ninebox.exe
```

**Solution**: Build the backend first:

```bash
cd backend
./scripts/build_executable.sh  # Linux/macOS
# or
.\scripts\build_executable.bat  # Windows
```

### Frontend server timeout

```
Error: Server at http://localhost:5173 did not become ready within 60000ms
```

**Solution**: Check if port 5173 is already in use. Stop any existing Vite dev servers.

### Screenshot function not found

```
Error: Screenshot function generateMyScreenshot not found in myWorkflow
```

**Solution**: Ensure the workflow module exports the function:

```typescript
export async function generateMyScreenshot(page: Page, outputPath: string) {
  // ...
}
```

## Implementation Status

- ✅ Infrastructure created (config, generate, README)
- ✅ Workflow modules created (12 workflows covering 31 automated screenshots)
- ✅ CI/CD integration (GitHub Actions workflow for weekly regeneration)

## Related Documentation

- E2E Test Helpers: `frontend/playwright/helpers/`
- Test Documentation: `docs/testing/`
- User Guide: `resources/user-guide/`
