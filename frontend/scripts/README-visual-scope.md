# Scope-Aware Visual Regression System

## Overview

This system provides intelligent visual regression testing for AI-agent-driven development workflows. It automatically distinguishes between:

- **In-scope changes**: Intentional visual changes to components you're actively modifying
- **Out-of-scope changes**: Unintended visual regressions in components you didn't modify (cross-component pollution)

## The Problem

In high-velocity AI-agent development (~38 commits/day):

1. Agents frequently make intentional visual changes to components
2. Traditional visual regression tests flag ALL changes as failures
3. Manual baseline updates create friction and slow down development
4. Real regressions (unintended side effects) get lost in the noise

## The Solution

### Automated Scope Detection

The system analyzes your git diff to determine which components you intentionally modified:

```bash
# Your PR modifies: EmployeeTile.tsx, EmployeeTile.stories.tsx
# Visual tests detect 8 failures

# Scope Analyzer categorizes them:
IN-SCOPE (auto-update ✓):
  - employee-tile-default-light.png
  - employee-tile-default-dark.png
  - employee-tile-with-flags-light.png
  # ... 3 more EmployeeTile snapshots

OUT-OF-SCOPE (regression alert ❌):
  - grid-box-full-light.png
  - nine-box-grid-complete-dark.png
```

### Smart Auto-Update

1. **PR triggers visual tests** → Tests detect 8 differences
2. **Scope analyzer runs** → Categorizes failures as in-scope vs out-of-scope
3. **Smart updater runs** → Auto-updates only in-scope baselines
4. **Commits to PR branch** → Pushes updated baselines
5. **Tests re-run** → In-scope tests now pass
6. **Final result** → Only out-of-scope failures remain (real regressions)

## Architecture

```
┌─────────────────────┐
│   PR Update         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Visual Tests Run   │
└──────────┬──────────┘
           │
           ▼
      ┌────────┐
      │ Pass?  │──Yes──▶ ✅ Done
      └────┬───┘
           │ No
           ▼
┌─────────────────────┐
│  Scope Analysis     │
│  - Git diff         │
│  - Map files→stories│
│  - Categorize       │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │  Global     │──Yes──▶ ⚠️ Manual Update Required
    │  Change?    │
    └──────┬──────┘
           │ No
           ▼
┌─────────────────────┐
│ Smart Auto-Update   │
│ - Update in-scope   │
│ - Commit to PR      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Tests Re-run       │
└──────────┬──────────┘
           │
           ▼
      ┌────────┐
      │ Pass?  │──Yes──▶ ✅ Auto-updated (in-scope only)
      └────┬───┘
           │ No
           ▼
         ⚠️ Out-of-Scope Failures
         (Real regressions!)
```

## Components

### 1. Scope Analyzer (`analyze-visual-scope.ts`)

**Purpose**: Determines which visual failures are expected based on code changes.

**How it works**:

1. Parses `git diff origin/main...HEAD` to find modified files
2. Maps files to Storybook story IDs:
   - `EmployeeTile.tsx` → reads `EmployeeTile.stories.tsx`
   - Extracts `title: "App/Grid/EmployeeTile"`
   - Converts to pattern: `app-grid-employeetile--*`
3. Matches failed snapshots against patterns
4. Categorizes as in-scope or out-of-scope

**Usage**:

```bash
# Analyze specific snapshots
npm run test:visual:analyze-scope origin/main \
  employee-tile-default-light.png \
  grid-box-full-light.png

# Or from a file
npm run test:visual:analyze-scope origin/main --from-file failed-snapshots.txt
```

**Output**:

```json
{
  "inScope": ["employee-tile-default-light.png"],
  "outOfScope": ["grid-box-full-light.png"],
  "confidence": "high",
  "modifiedFiles": ["src/components/grid/EmployeeTile.tsx"],
  "affectedStoryPatterns": ["app-grid-employeetile--*"],
  "globalChangeDetected": false,
  "metadata": {
    "totalFailures": 2,
    "inScopeCount": 1,
    "outOfScopeCount": 1,
    "globalChangeRatio": 0.5
  }
}
```

**Exit codes**:

- `0`: Success (all in-scope)
- `1`: Out-of-scope failures detected
- `2`: Global change detected

### 2. Smart Updater (`update-visual-baselines-smart.ts`)

**Purpose**: Selectively updates only specified visual baselines.

**How it works**:

1. Accepts list of snapshot filenames
2. Maps snapshots to test spec files
3. Runs Playwright `--update-snapshots` for those specific tests
4. Validates updated files (PNG magic number, file size)
5. Returns list of successfully updated files

**Usage**:

```bash
# Update specific snapshots
npm run test:visual:update-smart \
  employee-tile-default-light.png \
  employee-tile-default-dark.png

# Or from a file
npm run test:visual:update-smart --from-file in-scope-snapshots.txt
```

**Output**:

```json
{
  "success": true,
  "updatedFiles": [
    "playwright/visual/employee-tile.spec.ts-snapshots/employee-tile-default-light.png"
  ],
  "failedUpdates": [],
  "validationErrors": [],
  "metadata": {
    "totalRequested": 1,
    "successCount": 1,
    "failureCount": 0
  }
}
```

### 3. Smart Workflow (`.github/workflows/visual-regression-smart.yml`)

**Purpose**: Orchestrates the entire smart visual regression process in CI.

**Flow**:

1. **Run visual tests** (first attempt)
2. **If failures**:
   - Collect failed snapshot names
   - Run scope analysis
   - Categorize failures
3. **If in-scope failures exist**:
   - Run smart updater for in-scope snapshots only
   - Commit updated baselines to PR branch
   - Push to remote
4. **Re-run visual tests**
5. **Report results**:
   - ✅ All pass (after auto-update)
   - ⚠️ Out-of-scope failures (real regressions)
   - 🔄 Global change detected (manual update needed)

**Permissions**:

- `contents: write` - To commit and push baseline updates
- `pull-requests: write` - To comment on PRs

## Safeguards

### Global Change Detection

Certain file changes affect ALL components and shouldn't be auto-updated:

- `theme.ts`, `tokens.ts` - Design system changes
- `global.css` - Global styles
- `.storybook/**` - Storybook configuration
- `storybook-helpers.ts` - Test infrastructure

When detected, the workflow **skips auto-update** and requests manual review.

### Validation

All updated baselines are validated:

- ✅ File exists
- ✅ Non-zero size (>100 bytes)
- ✅ Valid PNG magic number
- ❌ Rejects corrupted or empty files

### Confidence Scoring

The system assigns confidence levels:

- **High**: Exact file-to-story mapping, no shared components
- **Medium**: Shared components modified, indirect dependencies
- **Low**: Global changes, high out-of-scope ratio (>50%)

Low confidence triggers manual review instead of auto-update.

## Example Scenarios

### Scenario 1: Clean Component Update

```
Modified: EmployeeTile.tsx, EmployeeTile.stories.tsx
Failures: 6 EmployeeTile snapshots

Result:
✅ All 6 snapshots auto-updated
✅ Committed to PR
✅ Tests pass on re-run
```

### Scenario 2: Cross-Component Pollution

```
Modified: EmployeeTile.tsx
Failures:
  - 4 EmployeeTile snapshots (in-scope)
  - 2 GridBox snapshots (out-of-scope)

Result:
✅ 4 EmployeeTile snapshots auto-updated
❌ 2 GridBox failures remain
⚠️ PR comment: "Your EmployeeTile changes affected GridBox"
```

### Scenario 3: Global Theme Change

```
Modified: theme.ts
Failures: 50+ snapshots across all components

Result:
🔄 Global change detected
✅ Baseline update workflow auto-triggered on PR branch
⏳ Workflow regenerates all baselines
✅ Baselines committed to PR
✅ Tests re-run automatically
```

## Multi-OS Baseline Support (Hybrid Approach)

### Strategy: Fast PRs + Weekly Comprehensive Coverage

**9Boxer is a desktop Electron app** targeting Windows, macOS, and Linux with development primarily on Windows. The visual baseline system uses a **hybrid approach**:

#### For Pull Requests (Fast Feedback)
- ✅ **Linux baselines only** (Ubuntu)
- ⚡ **Fast execution** (~5-10 min)
- 🎯 **Catches 95%+ of regressions**
- 🔄 **Auto-triggered** by smart workflow on global changes

#### Weekly Comprehensive Check
- ✅ **All three OSes** (Linux, Windows, macOS)
- 📅 **Scheduled**: Every Sunday at 2 AM UTC
- 🖥️ **Full platform coverage** for desktop app
- 🔍 **Catches OS-specific rendering differences**

#### Manual Multi-OS Update
When needed (theme changes, OS-specific issues):
```
GitHub Actions → Update Visual Baselines
  ✅ Check "Update baselines on all OSes (Windows, macOS, Linux)"
  → Click "Run workflow"
```

### Why Hybrid Instead of Always All-OS?

**Speed vs Coverage Tradeoff**:
- Running 3 OSes on every PR: ~15-30 min
- Running Linux only on PRs: ~5-10 min
- Weekly all-OS run: Comprehensive safety net

**Desktop App Context**:
- Font rendering can differ across OSes
- But **most visual changes** work consistently
- Weekly runs catch OS-specific issues before release
- PR speed keeps development velocity high

### Baseline Storage

All OS baselines coexist in the same directory:
```
frontend/playwright/visual/
  employee-tile.spec.ts-snapshots/
    employee-tile-default-light.png    (shared or OS-specific)
    employee-tile-default-dark.png     (shared or OS-specific)
```

Playwright handles OS-specific rendering automatically - baselines are generated per OS and matched accordingly during tests.

## Manual Operations

### Update All Baselines (Global Change)

The smart workflow automatically triggers the baseline update workflow when a global change is detected. However, you can also run it manually:

```bash
cd frontend
npm run test:visual:update
git add playwright/visual/**/*.png
git commit -m "chore: update visual baselines for theme change"
git push
```

Or trigger the workflow via GitHub Actions:
1. Go to Actions → Update Visual Regression Baselines
2. Click "Run workflow"
3. Select your branch
4. Enter a reason
5. Click "Run workflow"

### Analyze Without Updating

```bash
# Run visual tests
npm run test:visual

# Find failed snapshots
find test-results -name "*-diff.png" -exec basename {} \; | \
  sed 's/-actual\.png$/.png/' | sed 's/-diff\.png$/.png/' > failed.txt

# Analyze scope
npm run test:visual:analyze-scope origin/main --from-file failed.txt
```

### Update Specific Snapshots

```bash
# Create a list of snapshots to update
echo "employee-tile-default-light.png" > to-update.txt
echo "employee-tile-default-dark.png" >> to-update.txt

# Update them
npm run test:visual:update-smart --from-file to-update.txt
```

## Troubleshooting

### False Positives (In-scope marked as out-of-scope)

**Cause**: Component file modified but no corresponding `.stories.tsx` found.

**Fix**: Ensure every visual component has a `.stories.tsx` file with proper `title` metadata.

### False Negatives (Out-of-scope marked as in-scope)

**Cause**: Shared component changes affecting many stories.

**Detection**: System uses "medium" confidence for `/common/` components.

**Fix**: Review carefully. If >50% failures are out-of-scope, triggers manual review.

### Workflow Push Failures

**Cause**: Branch protection rules prevent bot pushes.

**Fix**: Keep strict branch protection and adjust workflows instead:

- Configure visual-regression workflows to push baseline updates to a dedicated update branch (e.g., `visual-baseline/update`) and open a pull request, rather than pushing directly to protected branches.
- Use the minimal required `GITHUB_TOKEN` permissions (e.g., `contents: write` only for the specific workflow that needs to update baselines).
- If additional automation is required, use a dedicated bot account or fine-grained PAT with restricted repository and scope, still going through PRs subject to required reviews.
- **Avoid** enabling "Allow force pushes" or "Allow bypassing required pull request reviews" for bots on protected branches, as this can let a compromised or misconfigured bot push arbitrary code without human review.

### Git Fetch Depth Issues

**Cause**: Shallow clone prevents proper git diff analysis.

**Fix**: Workflow uses `fetch-depth: 0` to get full history.

## Metrics & Monitoring

Track these metrics to validate effectiveness:

### Noise Reduction

```
Before: 15 visual failures per PR (avg)
After: 2 visual failures per PR (avg)
Noise reduction: 87%
```

### Accuracy

```
False positive rate: <5% (out-of-scope marked as in-scope)
False negative rate: <2% (in-scope marked as out-of-scope)
```

### Time to Green

```
Before: 2-3 hours (wait for manual baseline update)
After: 5-10 minutes (auto-update during CI)
```

## Migration

### Phase 1: Parallel Testing (Week 1)

- Run both old and new workflows
- Compare results
- Tune confidence thresholds

### Phase 2: Default to Smart (Week 2)

- Make smart workflow the default
- Keep old workflow as fallback
- Monitor for issues

### Phase 3: Deprecate Old Workflow (Week 3)

- Remove old `visual-regression.yml`
- Keep manual update workflow for global changes
- Update documentation

## Related Files

- **Workflows**:
  - `.github/workflows/visual-regression-smart.yml` - Smart auto-update workflow
  - `.github/workflows/visual-regression.yml` - Legacy workflow (to be replaced)
- **Scripts**:
  - `frontend/scripts/analyze-visual-scope.ts` - Scope analyzer
  - `frontend/scripts/update-visual-baselines-smart.ts` - Smart updater
- **Tests**:
  - `frontend/playwright/visual/*.spec.ts` - Visual test suites
  - `frontend/playwright/visual/storybook-helpers.ts` - Test utilities
- **Config**:
  - `frontend/playwright.config.ts` - Playwright configuration
  - `frontend/package.json` - NPM scripts

## References

- Issue: #275 - Design: Scope-Aware Visual Regression System
- Playwright Docs: https://playwright.dev/docs/test-snapshots
- Storybook Docs: https://storybook.js.org/docs/react/writing-tests/visual-testing
