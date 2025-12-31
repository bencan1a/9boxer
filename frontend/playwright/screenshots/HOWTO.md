# How to Generate Documentation Screenshots

**Instructions for AI agents and developers on generating documentation screenshots for 9Boxer.**

## Two Methods for Screenshot Generation

You have **two tools** for generating screenshots:

1. **Storybook** - For isolated component screenshots
2. **Full Application** - For workflow and integration screenshots

Choose the right tool based on what you're screenshotting.

---

## Method 1: Storybook Screenshots (Preferred for Components)

### When to Use Storybook

Use Storybook screenshots when capturing:
- ✅ Individual UI components in isolation
- ✅ Component states (loading, error, modified, selected)
- ✅ UI elements without complex app context
- ✅ Design system documentation

**Why?** Storybook screenshots are **10x faster** and **100% reliable** compared to full-app screenshots.

### How to Generate Storybook Screenshots

#### Step 1: Ensure Story Exists

Check if a Storybook story exists for the component:

```bash
# Look for existing story
ls frontend/src/components/**/ComponentName.stories.tsx
```

If no story exists, create one:

```typescript
// frontend/src/components/path/ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    // Component props
  },
};
```

#### Step 2: Create Screenshot Function

Add function to [workflows/storybook-components.ts](./workflows/storybook-components.ts):

```typescript
import { Page } from '@playwright/test';
import { captureStorybookScreenshot } from '../storybook-screenshot';

/**
 * Generate [description] screenshot
 *
 * Story: category-componentname--story-name
 */
export async function generateComponentName(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: 'category-componentname--story-name',
    outputPath,
    theme: 'light',
    waitTime: 500,  // Adjust if component has animations
  });
}
```

**Story ID format**: `category-componentname--storyname` (all lowercase, hyphens)
- Find it in Storybook URL: `http://localhost:6006/?path=/story/category-componentname--storyname`

#### Step 3: Add Config Entry

Add entry to [config.ts](./config.ts):

```typescript
'screenshot-name': {
  source: 'storybook',
  workflow: 'storybook-components',
  function: 'generateComponentName',
  path: 'resources/user-guide/docs/images/screenshots/screenshot-name.png',
  description: 'Clear description of what this screenshot shows',
  storyId: 'category-componentname--story-name',
},
```

#### Step 4: Generate and Verify

```bash
npm run screenshots:generate screenshot-name
```

---

## Method 2: Full-App Screenshots (For Workflows)

### When to Use Full-App

Use full-app screenshots when capturing:
- ✅ Multi-component interactions
- ✅ Complete user workflows (upload → grid → export)
- ✅ Features requiring app navigation or state setup
- ✅ Full-page layouts with context

**Why?** Full-app screenshots show how features work together in real usage scenarios.

### How to Generate Full-App Screenshots

#### Step 1: Create Workflow Function

Create or update a workflow module in `workflows/`:

```typescript
// workflows/workflow-name.ts
import { Page } from '@playwright/test';
import { loadSampleData } from '../../helpers/fixtures';
import { closeAllDialogsAndOverlays, waitForUiSettle } from '../../helpers/ui';

/**
 * Generate [description] screenshot
 *
 * Workflow: [brief description of steps]
 */
export async function generateWorkflowName(
  page: Page,
  outputPath: string
): Promise<void> {
  // 1. Load sample data
  await loadSampleData(page);

  // 2. Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // 3. Navigate or manipulate UI
  await page.locator('[data-testid="button"]').click();
  await waitForUiSettle(page, 0.5);

  // 4. Capture screenshot
  const element = page.locator('[data-testid="target"]');
  await element.screenshot({ path: outputPath });
}
```

#### Step 2: Add Config Entry

Add entry to [config.ts](./config.ts):

```typescript
'screenshot-name': {
  source: 'full-app',
  workflow: 'workflow-name',
  function: 'generateWorkflowName',
  path: 'resources/user-guide/docs/images/screenshots/screenshot-name.png',
  description: 'Clear description of what this screenshot shows',
  cropping: 'element' | 'panel' | 'grid' | 'full-page',
},
```

#### Step 3: Generate and Verify

```bash
npm run screenshots:generate screenshot-name
```

---

## Available Helper Functions

### Storybook Helpers

Located in [storybook-screenshot.ts](./storybook-screenshot.ts):

```typescript
// Basic screenshot
await captureStorybookScreenshot(page, {
  storyId: 'grid-employeetile--modified',
  outputPath,
  theme: 'light',
  waitTime: 500,
});

// Capture both light and dark themes
await captureStorybookScreenshotBothThemes(
  page,
  'grid-employeetile--modified',
  '/path/to/output.png'  // Creates -light.png and -dark.png
);

// Custom selector or full page
await captureStorybookScreenshot(page, {
  storyId: 'settings-settingsdialog--default',
  outputPath,
  fullPage: true,  // Capture full viewport instead of just component
  selector: '#custom-selector',  // Override default #storybook-root
});
```

### Full-App Helpers

Located in `frontend/playwright/helpers/`:

```typescript
// Data loading
import { loadSampleData, loadCalibrationData } from '../helpers/fixtures';
await loadSampleData(page);

// UI helpers
import { closeAllDialogsAndOverlays, waitForUiSettle } from '../helpers/ui';
await closeAllDialogsAndOverlays(page);
await waitForUiSettle(page, 0.5);

// Navigation helpers
import { clickTab, openFileMenu, openFilterDrawer } from '../helpers/navigation';
await clickTab(page, 'changes');
await openFileMenu(page);

// Element capture
await page.locator('[data-testid="element"]').screenshot({ path: outputPath });
await page.screenshot({ path: outputPath, fullPage: true });
```

---

## Decision Tree: Which Method Should I Use?

```
Is this a single isolated component?
├─ YES → Can it be shown in Storybook without app context?
│   ├─ YES → Use Storybook ✓ (Method 1)
│   └─ NO  → Use Full-App (Method 2)
└─ NO → Does it involve multiple components or workflows?
    └─ YES → Use Full-App (Method 2)
```

### Examples

| Screenshot Type | Method | Reason |
|-----------------|--------|--------|
| Employee tile | Storybook | Single component, isolated |
| Zoom controls | Storybook | Single component, no context needed |
| Employee details panel | Storybook | Single component, can show in isolation |
| Upload → Grid workflow | Full-App | Multi-step process, needs app state |
| Filter drawer + Grid | Full-App | Multiple components working together |
| Calibration workflow | Full-App | Complex multi-step process |

---

## Running Screenshots

```bash
# Generate all automated screenshots
npm run screenshots:generate

# Generate specific screenshot
npm run screenshots:generate employee-tile-normal

# Generate multiple screenshots
npm run screenshots:generate changes-orange-border changes-tab zoom-controls

# Run in headed mode (show browser)
HEADLESS=false npm run screenshots:generate
```

---

## Configuration Reference

### Screenshot Metadata

Each entry in `config.ts` includes:

```typescript
{
  // Required fields
  source: 'storybook' | 'full-app',  // Which method to use
  workflow: 'module-name',           // Module in workflows/ directory
  function: 'functionName',          // Function to call
  path: 'relative/path.png',         // Output path from project root
  description: 'Clear description',  // What this shows

  // Optional fields
  storyId: 'category-component--story',  // For Storybook screenshots
  manual: true,                          // Requires manual creation
  cropping: 'element' | 'panel' | 'grid' | 'full-page',
  dimensions: {
    minWidth: 300,
    maxWidth: 500,
    minHeight: 200,
    maxHeight: 400,
  },
}
```

### Cropping Strategies

- **element** - Capture specific UI element only (button, card, field)
- **container** - Capture container with multiple elements (drawer, panel, dialog)
- **panel** - Capture right/left panel area
- **grid** - Capture the 9-box grid area
- **full-page** - Capture entire viewport

---

## Troubleshooting

### Storybook Server Not Starting

```bash
# Verify Storybook works locally first
npm run storybook
# Should open http://localhost:6006
```

### Story ID Not Found

```
Error: Story not found: grid-employeetile--modified
```

**Solution**: Check story ID format in Storybook URL. Format is `category-component--story` (all lowercase, hyphens).

### Screenshot Appears Empty

```typescript
// Increase wait time for animated components
await captureStorybookScreenshot(page, {
  storyId: 'component--story',
  outputPath,
  waitTime: 1000,  // Increase from 500ms
});
```

### Backend Not Starting

The screenshot generator uses Python + uvicorn (same as E2E tests), not the built executable.

Ensure your Python virtual environment is set up:

```bash
# From project root
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

---

## Manual Screenshots

Some screenshots require manual creation:
- Excel file views (requires Excel/LibreOffice)
- Multi-panel compositions (requires image editing)
- Annotations and callouts (requires image editing)

Mark these in config:

```typescript
'screenshot-name': {
  source: 'full-app',
  workflow: 'workflow-name',
  function: 'generateScreenshot',
  path: '...',
  description: '...',
  manual: true,  // Will be tracked but not auto-generated
},
```

See [MANUAL_SCREENSHOTS.md](./MANUAL_SCREENSHOTS.md) for complete instructions.

---

## Best Practices

1. **Prefer Storybook** for component screenshots - it's faster and more reliable
2. **Use full-app** only when you need app context or multi-component interactions
3. **Reuse helpers** from `frontend/playwright/helpers/` - don't duplicate code
4. **Add clear descriptions** in config - helps future maintainers understand intent
5. **Test locally** before committing - run `npm run screenshots:generate screenshot-name`
6. **Keep wait times minimal** - only increase if component has animations

---

## File Organization

```
frontend/playwright/screenshots/
├── config.ts                     # Screenshot registry
├── generate.ts                   # Main CLI
├── storybook-screenshot.ts       # Storybook utilities
├── workflows/
│   ├── storybook-components.ts   # Component screenshots (Storybook)
│   ├── quickstart.ts             # Quickstart workflow (Full-app)
│   ├── calibration.ts            # Calibration workflow (Full-app)
│   └── ...                       # Other workflows
├── HOWTO.md                      # This file
├── README.md                     # Overview
└── MANUAL_SCREENSHOTS.md         # Manual screenshot instructions
```

---

## Related Files

- **Config**: [config.ts](./config.ts)
- **Storybook Utilities**: [storybook-screenshot.ts](./storybook-screenshot.ts)
- **Component Workflows**: [workflows/storybook-components.ts](./workflows/storybook-components.ts)
- **Full-App Helpers**: `frontend/playwright/helpers/`
- **Storybook Stories**: `frontend/src/components/**/*.stories.tsx`
