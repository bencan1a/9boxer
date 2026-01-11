# Global Change Workflow - Automatic Baseline Update Trigger

## Summary

When the smart visual regression system detects a **global change** (theme, tokens, global styles), it now **automatically triggers** the baseline update workflow on the PR branch instead of requiring manual intervention.

## What Changed

### Before (Manual)
```
Global Change Detected
    ↓
❌ PR Comment: "Run npm run test:visual:update manually"
    ↓
🧑 Developer runs command manually
    ↓
🧑 Developer commits and pushes
    ↓
✅ Tests pass
```

### After (Automatic)
```
Global Change Detected
    ↓
✅ Auto-trigger baseline update workflow on PR branch
    ↓
⏳ Workflow regenerates all baselines
    ↓
✅ Workflow commits baselines to PR
    ↓
✅ Visual tests re-run automatically
    ↓
✅ Tests pass
```

## How It Works

### 1. Global Change Detection

The scope analyzer detects global changes when these files are modified:
- `theme.ts`, `tokens.ts` - Design system files
- `global.css` - Global styles
- `.storybook/**` - Storybook configuration
- `storybook-helpers.ts` - Test infrastructure

### 2. Workflow Trigger

When a global change is detected, the smart workflow:
1. Uses `actions/github-script` to call the GitHub API
2. Triggers `update-visual-baselines.yml` workflow
3. Passes the PR branch as the target
4. Provides a descriptive reason

```javascript
await github.rest.actions.createWorkflowDispatch({
  owner: context.repo.owner,
  repo: context.repo.repo,
  workflow_id: 'update-visual-baselines.yml',
  ref: context.payload.pull_request.head.ref,  // PR branch
  inputs: {
    reason: `Global change detected in PR #${context.issue.number}`
  }
});
```

### 3. Baseline Update Workflow

The baseline update workflow was enhanced with:
- `workflow_call` trigger support (in addition to `workflow_dispatch`)
- Branch input parameter (defaults to `main` if not specified)
- Checkout step uses `ref: ${{ inputs.branch || github.ref }}`

### 4. PR Comments

The PR receives a detailed comment explaining:
- What was detected (global change)
- What action was taken (workflow triggered)
- What happens next (baselines regenerated, tests re-run)
- Alternative manual approach (if preferred)

## Multi-OS Baseline Support (Hybrid Approach)

### Current Strategy: Fast PR Feedback + Weekly Comprehensive Check

**For PRs (Fast Feedback)**:
- ✅ Linux baselines only (Ubuntu)
- ⚡ Fast execution (single OS)
- 🎯 Good for catching most regressions
- 🔄 Auto-triggered by smart workflow on global changes

**Weekly/On-Demand (Comprehensive)**:
- ✅ All three OSes (Linux, Windows, macOS)
- 📅 Scheduled: Every Sunday at 2 AM UTC
- 🎛️ Manual trigger available with `multi_os` checkbox
- 🖥️ Desktop app needs all platforms

### Why This Hybrid Approach?

This is a **desktop Electron app** that runs on Windows, macOS, and Linux:
- Development primarily happens on **Windows**
- Linux baseline generation ensures CI consistency
- Different OSes can have font rendering differences
- Hybrid approach balances **speed** (PR checks) with **coverage** (weekly checks)

### How It Works

**1. PR Workflow (Linux Only)**
```yaml
# Triggered automatically on global changes
workflow_call:
  inputs:
    multi_os: false  # Default: Linux only for speed
```

**2. Weekly Schedule (All OSes)**
```yaml
schedule:
  - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
  # Automatically runs on all three OSes
```

**3. Manual Override (All OSes)**
```
Actions → Update Visual Baselines
  ✅ Check "Update baselines on all OSes"
  → Click "Run workflow"
```

### Workflow Structure

Three separate jobs that run conditionally:

```yaml
jobs:
  update-baselines-linux:
    runs-on: ubuntu-latest
    # Always runs

  update-baselines-windows:
    runs-on: windows-latest
    if: inputs.multi_os == true || github.event_name == 'schedule'
    # Only runs weekly or when explicitly requested

  update-baselines-macos:
    runs-on: macos-latest
    if: inputs.multi_os == true || github.event_name == 'schedule'
    # Only runs weekly or when explicitly requested
```

### Baseline Storage

Playwright stores OS-specific baselines automatically:
- Same directory structure for all OSes
- Font rendering differences captured per OS
- Committed to same branch (Linux, Windows, macOS baselines coexist)

### When to Use Multi-OS Update

**Use Linux Only (default)**:
- Regular PR workflow
- Fast feedback needed
- Most visual changes

**Use All OSes**:
- Manual trigger: Check "Update baselines on all OSes"
- Weekly: Runs automatically every Sunday
- After major theme/design changes
- When OS-specific rendering issues found

## Files Modified

### `.github/workflows/update-visual-baselines.yml`
- ✅ Added `workflow_call` trigger
- ✅ Added `branch` input parameter
- ✅ Updated checkout to use `ref: ${{ inputs.branch || github.ref }}`

### `.github/workflows/visual-regression-smart.yml`
- ✅ Added workflow trigger on global change detection
- ✅ Updated PR comment to explain auto-trigger
- ✅ Changed final status to exit 0 (success) when workflow triggered

### `frontend/scripts/README-visual-scope.md`
- ✅ Updated Scenario 3 (global change) to reflect auto-trigger
- ✅ Added "Multi-OS Baseline Support" section
- ✅ Documented when and how to add multi-OS support

## Benefits

### For Developers
- ✅ No manual baseline update commands
- ✅ No waiting for manual intervention
- ✅ Tests eventually pass automatically
- ✅ Baseline changes visible in PR for review

### For CI/CD
- ✅ Fully automated workflow
- ✅ Consistent baseline generation
- ✅ Reproducible across environments
- ✅ Faster time to green

### For Project Quality
- ✅ Global changes don't block PRs indefinitely
- ✅ Baseline changes are tracked in git history
- ✅ Reviewers can see what changed visually
- ✅ Reduces friction for design system updates

## Example Flow

### PR #123: Update Theme Colors

```
1. Developer modifies theme.ts (primary color: blue → green)
2. Commits and pushes to PR
3. Visual tests run → 50 failures detected
4. Scope analyzer detects global change (theme.ts modified)
5. Smart workflow auto-triggers baseline update workflow
6. PR comment: "🔄 Global change detected - baseline update triggered"
7. Baseline update workflow starts on PR branch
8. Workflow regenerates all 50 baselines with new green color
9. Workflow commits: "chore: update visual baselines (global change)"
10. Visual tests re-run automatically
11. All tests pass ✅
12. PR is ready for review with baseline changes visible
```

## Rollback Plan

If auto-triggering causes issues, you can:

1. **Disable auto-trigger**: Comment out the trigger step in `visual-regression-smart.yml`
2. **Revert to manual**: Use the old PR comment instructing manual update
3. **Adjust thresholds**: Tune global change detection to be more conservative

## Future Enhancements

1. **Multi-OS Support**: Generate baselines on Windows, macOS, Linux
2. **Baseline Diff Viewer**: Show before/after comparisons in PR
3. **Approval Gate**: Require manual approval before baseline update runs
4. **Smart Scheduling**: Batch multiple global changes within X hours
5. **Baseline History**: Track baseline changes over time in separate branch

## Testing

### Test the Auto-Trigger

1. Create a test PR
2. Modify `theme.ts` (e.g., change a color)
3. Commit and push
4. Verify visual tests fail
5. Verify scope analyzer detects global change
6. Verify baseline update workflow is triggered
7. Verify workflow runs on PR branch
8. Verify baselines are committed to PR
9. Verify tests re-run and pass

### Verify Multi-Branch Support

1. Create PR on branch `feature/theme-update`
2. Trigger should use `feature/theme-update`, not `main`
3. Baseline commits should appear on `feature/theme-update`

## Conclusion

The global change workflow now provides a **fully automated** path from detection to resolution:
- **No manual intervention** required
- **Baselines updated** on the PR branch
- **Tests pass** automatically
- **Changes reviewable** in PR diff

This eliminates a major friction point in the visual regression testing workflow while maintaining safety through:
- Clear PR comments explaining what happened
- Baseline changes visible in git history
- Manual override option still available
- Exit with success (not failure) when workflow triggered
