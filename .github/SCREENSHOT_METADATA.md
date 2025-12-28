# Component-Screenshot Metadata System

**Issue:** #53
**Status:** ✅ Implemented
**Purpose:** Enable automated change detection for documentation screenshots

## Overview

The Component-Screenshot Metadata System creates a bidirectional mapping between React components and documentation screenshots. When a component changes, we can automatically identify which screenshots need to be regenerated.

## Architecture

### 1. Component Annotations

Components are annotated with JSDoc `@screenshots` tags that list all screenshots they affect:

```typescript
/**
 * NineBoxGrid Component
 *
 * Main talent grid visualization component that displays employees
 * organized by performance and potential levels.
 *
 * @component
 * @screenshots
 *   - grid-normal: Standard 9-box grid with employee tiles
 *   - quickstart-grid-populated: Populated grid after successful file upload
 *   - hero-grid-sample: Hero image showing full grid with sample data
 *   - donut-mode-active-layout: Active donut mode layout with concentric circles
 */
export const NineBoxGrid: React.FC = () => {
  // ...
};
```

### 2. Extraction Script

The extraction script (`.github/scripts/extract-screenshot-metadata.js`) scans all component files and parses the `@screenshots` annotations to generate a mapping file.

**Location:** `.github/scripts/extract-screenshot-metadata.js`

**How it works:**
1. Recursively scans `frontend/src/` for all `.ts` and `.tsx` files
2. Parses JSDoc comments looking for `@screenshots` annotations
3. Extracts screenshot names from each annotation
4. Generates `.github/component-screenshot-map.json` with the mapping

### 3. Mapping File

The generated mapping file provides a quick lookup of which screenshots are affected by which components:

**Location:** `.github/component-screenshot-map.json`

**Format:**
```json
{
  "componentToScreenshots": {
    "components/grid/NineBoxGrid.tsx": {
      "component": "NineBoxGrid",
      "screenshots": [
        "grid-normal",
        "quickstart-grid-populated",
        "hero-grid-sample",
        "donut-mode-active-layout"
      ]
    }
  },
  "screenshotToComponents": {
    "grid-normal": ["components/grid/NineBoxGrid.tsx"],
    "quickstart-grid-populated": ["components/grid/NineBoxGrid.tsx"]
  },
  "metadata": {
    "generatedAt": "2025-12-27T07:42:46.046Z",
    "generatedBy": "extract-screenshot-metadata.js",
    "version": "1.0.0",
    "totalComponents": 7,
    "totalScreenshots": 34,
    "totalMappings": 34
  }
}
```

**Features:**
- **Bidirectional mapping**: Both component→screenshots and screenshot→components lookups
- **Metadata tracking**: Timestamp, version, and statistics
- **Validation**: All screenshot names are validated against `config.ts` during extraction

## Usage

### Adding Annotations to Components

When creating or modifying a component that appears in screenshots:

1. **Identify affected screenshots** - Check `frontend/playwright/screenshots/config.ts` for screenshot names
2. **Add JSDoc annotation** - Add `@screenshots` tag to the component's JSDoc comment
3. **List screenshot names** - Each line should be: `  - screenshot-name: Description`

**Example:**
```typescript
/**
 * EmployeeTile Component
 *
 * Individual employee card shown within grid boxes.
 *
 * @component
 * @screenshots
 *   - employee-tile-normal: Individual employee tile showing name and role
 *   - changes-orange-border: Employee tile with orange modified border
 *   - details-flag-badges: Employee tiles showing flag count badges
 */
export const EmployeeTile: React.FC<EmployeeTileProps> = ({ ... }) => {
  // ...
};
```

### Regenerating the Mapping

After adding or updating `@screenshots` annotations:

```bash
# From frontend directory
cd frontend
npm run screenshots:metadata

# Or from project root
node .github/scripts/extract-screenshot-metadata.js

# With strict validation (fail on invalid references)
node .github/scripts/extract-screenshot-metadata.js --strict
```

**Output:**
```
Scanning component files for @screenshots annotations...

✅ components/grid/NineBoxGrid.tsx
   Component: NineBoxGrid
   Screenshots: grid-normal, quickstart-grid-populated, hero-grid-sample

✅ All screenshot references are valid

────────────────────────────────────────────────────────────
Summary:
  Total components scanned: 152
  Components with @screenshots: 7
  Total screenshot mappings: 34
  Valid screenshots in config.ts: 57
  Output: .github/component-screenshot-map.json
────────────────────────────────────────────────────────────
```

**Options:**
- `--strict` - Fail if validation errors are found (used in CI)

**Validation:**
The script automatically validates all screenshot names against `frontend/playwright/screenshots/config.ts` to ensure:
- All referenced screenshots exist in the config
- Screenshot names follow kebab-case naming convention
- No typos or broken references

### Using the Mapping for Change Detection

The bidirectional mapping enables efficient change detection in CI/CD:

```javascript
// Example: Detect which screenshots are affected by changed components
import fs from 'fs';

const mapping = JSON.parse(
  fs.readFileSync('.github/component-screenshot-map.json', 'utf-8')
);

// Get changed files from git diff
const changedFiles = execSync('git diff --name-only HEAD~1', { encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean);

// Find affected screenshots using component→screenshots mapping
const affectedScreenshots = new Set();
for (const file of changedFiles) {
  const relativePath = file.replace('frontend/src/', '');
  const componentData = mapping.componentToScreenshots[relativePath];
  if (componentData) {
    componentData.screenshots.forEach(s => affectedScreenshots.add(s));
  }
}

console.log('Affected screenshots:', Array.from(affectedScreenshots));

// Or find which components affect a screenshot using screenshot→components mapping
const componentsForScreenshot = mapping.screenshotToComponents['grid-normal'];
console.log('Components affecting grid-normal:', componentsForScreenshot);
```

**CI Integration:**
The metadata is automatically validated in CI through the `validate-screenshot-metadata` job:
- Runs on every push that changes frontend files
- Regenerates the mapping from component annotations
- Compares with committed version
- Fails if mapping is out of sync
- Uses `--strict` mode to catch invalid screenshot references

## Current Status

### Annotated Components (7)

| Component | Path | Screenshots |
|-----------|------|-------------|
| **NineBoxGrid** | `components/grid/NineBoxGrid.tsx` | 8 screenshots |
| **EmployeeTile** | `components/grid/EmployeeTile.tsx` | 3 screenshots |
| **PureAppBar** | `components/dashboard/PureAppBar.tsx` | 4 screenshots |
| **FilterDrawer** | `components/dashboard/FilterDrawer.tsx` | 9 screenshots |
| **EmployeeDetails** | `components/panel/EmployeeDetails.tsx` | 5 screenshots |
| **ZoomControls** | `components/common/ZoomControls.tsx` | 1 screenshot |
| **ChangeTrackerTab** | `components/panel/ChangeTrackerTab.tsx` | 4 screenshots |

**Total: 34 screenshot mappings**

### Components Pending Annotation

Based on `frontend/playwright/screenshots/config.ts`, these components should be annotated:

- [ ] `RatingsTimeline` - changes-timeline-view
- [ ] `IntelligencePanel` - calibration-intelligence-anomalies, distribution-chart-ideal
- [ ] `SettingsDialog` - view-controls-settings-dialog
- [ ] `ViewControls` - view-controls-grid-view, view-controls-donut-view
- [ ] `EmployeeFlags` - details-flags-ui
- [ ] `ManagementChain` - details-reporting-chain-clickable
- [ ] `UploadDialog` - quickstart-upload-dialog
- [ ] `StatisticsPanel` - statistics-panel-distribution, statistics-trend-indicators

## Best Practices

### 1. Keep Annotations Up to Date

When you:
- **Add a new component** → Add `@screenshots` annotation if it appears in screenshots
- **Modify a component** → Update annotation if screenshot list changes
- **Remove screenshots** → Remove corresponding entries from annotation

### 2. Screenshot Naming

Screenshot names in annotations should match exactly the IDs in `frontend/playwright/screenshots/config.ts`:

```typescript
// config.ts
export const screenshotConfig: Record<string, ScreenshotMetadata> = {
  "grid-normal": { ... },  // ← Use this exact name
};

// NineBoxGrid.tsx
/**
 * @screenshots
 *   - grid-normal: Description  // ← Same name
 */
```

### 3. Annotation Format

**Correct:**
```typescript
/**
 * @screenshots
 *   - screenshot-name: Description of what screenshot shows
 *   - another-screenshot: Another description
 */
```

**Incorrect:**
```typescript
// Missing colon after screenshot name
/**
 * @screenshots
 *   - screenshot-name Description
 */

// Wrong indentation
/**
 * @screenshots
 * - screenshot-name: Description
 */

// Missing dash
/**
 * @screenshots
 *   screenshot-name: Description
 */
```

### 4. Documentation Descriptions

Provide clear descriptions for each screenshot to help developers understand what visual output the component produces:

**Good:**
```typescript
/**
 * @screenshots
 *   - grid-normal: Standard 9-box grid with employee tiles
 *   - donut-mode-active-layout: Active donut mode with concentric circles
 */
```

**Less helpful:**
```typescript
/**
 * @screenshots
 *   - grid-normal: Grid
 *   - donut-mode-active-layout: Donut mode
 */
```

## Integration with CI/CD

This metadata system is the foundation for automated documentation updates:

**Phase 2 - Change Detection (Issue #54):**
- GitHub Action monitors component changes
- Uses mapping to identify affected screenshots
- Triggers selective screenshot regeneration

**Phase 3 - Visual Regression (Issue #61):**
- Automated visual diff testing
- Validates screenshot quality
- Generates visual comparison reports

## Troubleshooting

### No components found with annotations

**Problem:** Running the extraction script shows `Components with @screenshots: 0`

**Solution:**
1. Check annotation format matches the examples above
2. Ensure component files are in `frontend/src/`
3. Verify JSDoc comment has proper `/** ... */` format
4. Check for syntax errors in the annotation

### Screenshot names not extracted

**Problem:** Component is found but screenshot count is 0 or less than expected

**Solution:**
1. Ensure each screenshot line has format: ` *   - name: description`
2. Check for proper spacing (space-asterisk-space-dash)
3. Verify colon (`:`) is present after screenshot name
4. Make sure annotation is before closing `*/`

### Script errors or crashes

**Problem:** Node.js errors when running the extraction script

**Solution:**
1. Ensure you're using Node.js 20+ (`node --version`)
2. Run from project root or frontend directory
3. Check file permissions on `.github/scripts/extract-screenshot-metadata.js`
4. Verify no syntax errors in the script

## Files Reference

| File | Purpose | Git Tracked |
|------|---------|-------------|
| `.github/scripts/extract-screenshot-metadata.js` | Extraction script | ✅ Yes |
| `.github/component-screenshot-map.json` | Generated mapping | ✅ Yes (auto-generated) |
| `.github/SCREENSHOT_METADATA.md` | This documentation | ✅ Yes |
| `frontend/playwright/screenshots/config.ts` | Screenshot registry | ✅ Yes |

## Next Steps

1. **Annotate remaining components** - Add `@screenshots` to all components that appear in screenshots
2. **Implement Issue #54** - Build GitHub Action for automated change detection
3. **Implement Issue #55** - Create selective screenshot regeneration workflow
4. **Integrate with CI** - Add metadata extraction to CI pipeline

## Questions?

- **Q: Do all components need `@screenshots` annotations?**
  A: No, only components that appear in documentation screenshots.

- **Q: How often should I regenerate the mapping?**
  A: After adding/updating any `@screenshots` annotations. It's fast and safe to run frequently.

- **Q: What if a screenshot uses multiple components?**
  A: Each component should list all screenshots it appears in. The same screenshot can appear in multiple component annotations.

- **Q: Should I commit the generated mapping file?**
  A: Yes! The `.github/component-screenshot-map.json` file should be committed to the repository.

## Related Documentation

- **Implementation Plan:** [agent-projects/self-managing-docs-system/](/workspaces/9boxer/agent-projects/self-managing-docs-system/)
- **Screenshot System:** [frontend/playwright/screenshots/](/workspaces/9boxer/frontend/playwright/screenshots/)
- **Screenshot Config:** [frontend/playwright/screenshots/config.ts](/workspaces/9boxer/frontend/playwright/screenshots/config.ts)
