# Testing Guide: Scope-Aware Visual Regression System

## Overview

This guide walks through testing all components of the scope-aware visual regression system (Issue #275).

## Test Plan

### Phase 1: Local Script Testing (15 minutes)

#### 1.1 Test Scope Analyzer

**Test with no changes (baseline)**:
```bash
cd frontend
npx tsx scripts/analyze-visual-scope.ts origin/main employee-tile-default-light.png grid-box-full-light.png
```

**Expected**: Both snapshots marked as `outOfScope` (no files modified)

**Test with actual changes**:
```bash
# Create a test branch
git checkout -b test/scope-analyzer

# Modify a component
echo "// test comment" >> src/components/grid/EmployeeTile.tsx

# Test analyzer
npx tsx scripts/analyze-visual-scope.ts origin/main employee-tile-default-light.png grid-box-full-light.png
```

**Expected**:
```json
{
  "inScope": ["employee-tile-default-light.png"],
  "outOfScope": ["grid-box-full-light.png"],
  "modifiedFiles": ["src/components/grid/EmployeeTile.tsx"],
  "affectedStoryPatterns": ["app-grid-employeetile--*"]
}
```

**Test global change detection**:
```bash
# Modify theme file
echo "// test" >> src/theme/tokens.ts

# Test analyzer
npx tsx scripts/analyze-visual-scope.ts origin/main test1.png test2.png
```

**Expected**: `"globalChangeDetected": true`

#### 1.2 Test Smart Updater

**Note**: This requires actual baseline files. Skip if no baselines exist yet.

```bash
# List existing baselines
ls playwright/visual/**/*.png

# Test update (dry run - won't actually update)
npx tsx scripts/update-visual-baselines-smart.ts employee-tile-default-light.png
```

**Clean up test branch**:
```bash
git checkout main
git branch -D test/scope-analyzer
```

---

### Phase 2: Workflow Testing (30 minutes)

#### 2.1 Test Baseline Update Workflow (Linux Only)

**Manual trigger test**:

1. Go to **Actions** → **Update Visual Regression Baselines**
2. Click **Run workflow**
3. **Branch**: `main` (or current branch)
4. **Reason**: "Test run - validating workflow"
5. **Update baselines on all OSes**: ❌ Unchecked (Linux only)
6. Click **Run workflow**

**Verify**:
- ✅ Workflow starts
- ✅ "Update Visual Baselines (Linux)" job runs
- ✅ "Update Visual Baselines (Windows)" job skipped
- ✅ "Update Visual Baselines (macOS)" job skipped
- ✅ If baselines changed, commit created
- ✅ Artifact uploaded: `visual-baselines-linux`

#### 2.2 Test Multi-OS Baseline Update

**Manual trigger test**:

1. Go to **Actions** → **Update Visual Regression Baselines**
2. Click **Run workflow**
3. **Branch**: `main`
4. **Reason**: "Test multi-OS baseline update"
5. **Update baselines on all OSes**: ✅ **Checked**
6. Click **Run workflow**

**Verify**:
- ✅ All three jobs run: Linux, Windows, macOS
- ✅ Three separate commits (if baselines differ)
- ✅ Three artifacts uploaded
- ✅ Commit messages include OS name: "(Linux)", "(Windows)", "(macOS)"

**Duration**: ~20-30 minutes (all OSes run in parallel)

---

### Phase 3: PR Workflow Testing (45 minutes)

#### 3.1 Test In-Scope Auto-Update

**Create test PR with component change**:

```bash
# Create feature branch
git checkout -b test/in-scope-update

# Modify a component (make visible change)
# Example: Change a color in EmployeeTile
# Edit: src/components/grid/EmployeeTile.tsx
# Change some inline style or add a test class

# Commit and push
git add .
git commit -m "test: modify EmployeeTile for scope testing"
git push origin test/in-scope-update

# Create PR
gh pr create --title "Test: In-Scope Visual Update" --body "Testing scope-aware visual regression auto-update"
```

**Expected workflow**:
1. Visual regression tests run
2. Detect failures in EmployeeTile snapshots
3. Scope analyzer categorizes as in-scope
4. Smart updater auto-updates EmployeeTile baselines
5. Commit pushed to PR branch
6. Tests re-run
7. Tests pass ✅
8. PR comment: "✅ Visual tests passed (N baselines auto-updated)"

**Verify**:
- ✅ Baseline files updated in git history
- ✅ Commit message: "chore: auto-update visual baselines (in-scope)"
- ✅ PR comment shows auto-updated count
- ✅ Visual tests pass on re-run

#### 3.2 Test Out-of-Scope Detection

**Create test PR with cross-component pollution**:

This is harder to test without actually breaking something. **Skip for now** unless you want to intentionally break a shared component.

Alternative: Modify a shared component like a theme color that affects multiple components.

#### 3.3 Test Global Change Auto-Trigger

**Create test PR with global change**:

```bash
# Create feature branch
git checkout -b test/global-change

# Modify theme file
echo "// Test global change detection" >> src/theme/tokens.ts

# Commit and push
git add .
git commit -m "test: modify theme tokens for global change testing"
git push origin test/global-change

# Create PR
gh pr create --title "Test: Global Change Detection" --body "Testing global change auto-trigger workflow"
```

**Expected workflow**:
1. Visual regression tests run
2. Detect many failures across components
3. Scope analyzer detects global change
4. Smart workflow triggers baseline update workflow
5. PR comment: "🔄 Global change detected - baseline update workflow triggered"
6. Baseline update workflow runs on PR branch (Linux only)
7. Baselines committed to PR branch
8. Visual tests re-run
9. Tests pass ✅

**Verify**:
- ✅ PR comment mentions global change
- ✅ Baseline update workflow triggered (check Actions)
- ✅ Workflow runs on correct branch (not main)
- ✅ Baselines committed to PR
- ✅ Visual tests eventually pass

**Duration**: ~10-15 minutes for full cycle

---

### Phase 4: Scheduled Weekly Run (Optional - Wait for Sunday)

The weekly cron job (`0 2 * * 0`) will run automatically every Sunday at 2 AM UTC.

**To test without waiting**:

1. Modify the cron schedule to run soon:
   ```yaml
   schedule:
     - cron: '*/15 * * * *'  # Every 15 minutes
   ```
2. Commit and wait
3. Verify all three OS jobs run
4. **Revert the cron change immediately after test**

**Or test manually**:
Just trigger with "Update baselines on all OSes" checked (we did this in Phase 2.2)

---

## Quick Smoke Tests (5 minutes)

### Verify Scripts Are Executable

```bash
cd frontend

# Test scope analyzer syntax
npx tsx scripts/analyze-visual-scope.ts --help 2>&1 | head -5

# Test smart updater syntax
npx tsx scripts/update-visual-baselines-smart.ts --help 2>&1 | head -5

# Verify npm scripts exist
npm run test:visual:analyze-scope -- --help 2>&1 | head -5
npm run test:visual:update-smart -- --help 2>&1 | head -5
```

### Verify Workflow Files Are Valid

```bash
# Install actionlint (if not already installed)
# Windows: Use WSL or skip this test
# Linux/macOS:
brew install actionlint  # or download from releases

# Validate workflows
actionlint .github/workflows/visual-regression-smart.yml
actionlint .github/workflows/update-visual-baselines.yml
```

---

## Troubleshooting

### Script Errors

**Error: Cannot find module**
```bash
# Ensure dependencies installed
cd frontend
npm ci --legacy-peer-deps
```

**Error: Git diff failed**
```bash
# Ensure you're in a git repository
git status

# Ensure main branch exists
git fetch origin main
```

### Workflow Errors

**Error: Permission denied (push)**
- Check workflow has `contents: write` permission
- Check `GITHUB_TOKEN` has access to push to branch

**Error: Workflow not found**
- Ensure `.github/workflows/*.yml` files committed to repository
- Check workflow file names match exactly

**Error: Cannot trigger workflow**
- Ensure workflow has `workflow_dispatch` trigger
- Check you have permission to trigger workflows

### Visual Test Errors

**Error: Baselines not found**
```bash
# Generate initial baselines
cd frontend
npm run test:visual:update
git add playwright/visual/**/*.png
git commit -m "chore: add initial visual baselines"
git push
```

**Error: Playwright browser not installed**
```bash
cd frontend
npx playwright install --with-deps chromium
```

---

## Test Checklist

Use this checklist to track testing progress:

### Local Testing
- [ ] Scope analyzer runs without errors
- [ ] Scope analyzer detects in-scope changes
- [ ] Scope analyzer detects global changes
- [ ] Smart updater runs without errors

### Workflow Testing
- [ ] Baseline update workflow (Linux only) runs
- [ ] Baseline update workflow (Multi-OS) runs
- [ ] Baseline commits created correctly
- [ ] Artifacts uploaded successfully

### PR Workflow Testing
- [ ] In-scope changes auto-update baselines
- [ ] Auto-update commits to PR branch
- [ ] Tests re-run after baseline update
- [ ] PR comment shows auto-update summary
- [ ] Global change triggers baseline workflow
- [ ] Global change workflow runs on PR branch

### Integration Testing
- [ ] Full PR cycle (change → test → auto-update → pass)
- [ ] Workflow permissions work correctly
- [ ] Git operations succeed (commit, push)
- [ ] Multiple OS baselines coexist

### Documentation
- [ ] README explains system clearly
- [ ] Examples are accurate
- [ ] Troubleshooting covers common issues

---

## Recommended Test Order

1. **Quick smoke tests** (5 min) - Verify everything is wired up
2. **Local script testing** (15 min) - Test core logic
3. **Baseline update workflow** (5 min) - Test Linux-only update
4. **PR in-scope test** (20 min) - Test auto-update on component change
5. **PR global change test** (20 min) - Test auto-trigger on theme change
6. **Multi-OS workflow** (30 min) - Test all three OSes (optional)

**Total time**: ~1.5 hours for comprehensive testing

---

## Success Criteria

The system is working correctly if:

✅ **Scope analyzer** correctly categorizes snapshots based on file changes
✅ **Smart updater** updates only specified baselines
✅ **In-scope changes** auto-update baselines and commit to PR
✅ **Global changes** trigger baseline update workflow
✅ **PR comments** clearly explain what happened
✅ **Multi-OS workflows** run conditionally (Linux always, others weekly/manual)
✅ **No manual intervention** needed for normal workflow

---

## Rollback Plan

If testing reveals issues:

1. **Disable smart workflow**:
   ```bash
   # Rename to disable
   git mv .github/workflows/visual-regression-smart.yml .github/workflows/visual-regression-smart.yml.disabled
   git commit -m "chore: disable smart workflow for debugging"
   git push
   ```

2. **Fall back to old workflow**:
   - Old workflow still exists: `visual-regression.yml`
   - Will run on PRs and catch visual changes
   - Requires manual baseline updates

3. **Fix issues**:
   - Debug locally
   - Fix scripts or workflows
   - Re-enable smart workflow

4. **Re-test**:
   - Follow this testing guide again
   - Verify fixes work

---

## Next Steps After Testing

Once testing is complete and successful:

1. **Update documentation** with any learnings
2. **Clean up test branches** and PRs
3. **Monitor first few real PRs** for issues
4. **Collect metrics** (noise reduction, time to green)
5. **Consider deprecating old workflow** after 1-2 weeks

---

## Questions?

If you encounter issues not covered here:
1. Check workflow logs in GitHub Actions
2. Check script output for error messages
3. Review documentation in `README-visual-scope.md`
4. Check `GLOBAL-CHANGE-WORKFLOW.md` for multi-OS details
