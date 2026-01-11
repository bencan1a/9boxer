# Issue #275: Scope-Aware Visual Regression System

## Overview

This directory contains documentation for the scope-aware visual regression testing system designed for AI-agent-driven development workflows.

## Documentation

### 📋 [IMPLEMENTATION-SUMMARY-275.md](./IMPLEMENTATION-SUMMARY-275.md)
Complete implementation summary including:
- What was built (4 scripts, 2 workflows)
- How it works (architecture diagrams)
- Files created/modified
- Multi-OS baseline support
- Success metrics
- Migration strategy

**Read this first** for a complete overview of the implementation.

### 🔄 [GLOBAL-CHANGE-WORKFLOW.md](./GLOBAL-CHANGE-WORKFLOW.md)
Detailed documentation on the global change detection and auto-trigger system:
- How global changes are detected
- Automatic baseline update workflow trigger
- Multi-OS hybrid approach (Linux for PRs, all OSes weekly)
- Workflow structure and conditional execution
- When to use multi-OS updates

**Read this** to understand how the system handles theme/design changes.

### 🧪 [TESTING-GUIDE-275.md](./TESTING-GUIDE-275.md)
Comprehensive testing guide:
- Local script testing (15 min)
- Workflow testing (30 min)
- PR workflow testing (45 min)
- Quick smoke tests (5 min)
- Troubleshooting
- Test checklist

**Use this** to test the implementation and verify it works correctly.

### 📚 Additional Documentation

Located in the codebase:

- **[frontend/scripts/README-visual-scope.md](../../frontend/scripts/README-visual-scope.md)** - Complete user guide for the visual scope system
- **[frontend/scripts/analyze-visual-scope.ts](../../frontend/scripts/analyze-visual-scope.ts)** - Scope analyzer script
- **[frontend/scripts/update-visual-baselines-smart.ts](../../frontend/scripts/update-visual-baselines-smart.ts)** - Smart updater script

## Quick Links

### Workflows
- [.github/workflows/visual-regression-smart.yml](../../.github/workflows/visual-regression-smart.yml) - Smart PR workflow
- [.github/workflows/update-visual-baselines.yml](../../.github/workflows/update-visual-baselines.yml) - Baseline update workflow

### Key Scripts
- Scope analyzer: `npm run test:visual:analyze-scope`
- Smart updater: `npm run test:visual:update-smart`

## Quick Start

### Test the System
```bash
# 1. Test scope analyzer locally (2 min)
cd frontend
npx tsx scripts/analyze-visual-scope.ts origin/main test.png

# 2. Trigger baseline update workflow (5 min)
# Go to Actions → Update Visual Baselines → Run workflow

# 3. Create test PR with component change (15 min)
# Watch auto-update workflow in action
```

See [TESTING-GUIDE-275.md](./TESTING-GUIDE-275.md) for detailed testing instructions.

## System Architecture

```
PR with Component Change
    ↓
Visual Tests Run
    ↓
Failures Detected?
    ↓
Scope Analyzer Runs
    ↓
┌─────────────────┴─────────────────┐
│                                   │
▼                                   ▼
IN-SCOPE                    OUT-OF-SCOPE
(Auto-update)              (Flag as regression)
    ↓                                   ↓
Smart Updater              PR Comment: Warning
    ↓                                   ↓
Commit to PR               Test Fails ❌
    ↓
Tests Re-run
    ↓
Pass ✅
```

### Global Change Detection

```
PR with Theme Change
    ↓
Visual Tests Fail (many)
    ↓
Scope Analyzer: Global Change
    ↓
Auto-Trigger Baseline Update
    ↓
Workflow Runs (Linux only)
    ↓
Baselines Committed
    ↓
Tests Re-run
    ↓
Pass ✅
```

## Key Features

✅ **Automatic scope detection** - Git diff analysis maps changes to affected components
✅ **Smart auto-update** - In-scope failures updated automatically
✅ **Global change handling** - Auto-triggers baseline workflow for theme changes
✅ **Multi-OS support** - Hybrid approach (Linux for PRs, all OSes weekly)
✅ **PR comments** - Clear explanations of what happened and why
✅ **No manual intervention** - Fully automated workflow

## Files Created

1. **Scripts** (in `frontend/scripts/`):
   - `analyze-visual-scope.ts` - Scope detection
   - `update-visual-baselines-smart.ts` - Smart updater
   - `README-visual-scope.md` - User documentation

2. **Workflows** (in `.github/workflows/`):
   - `visual-regression-smart.yml` - Smart PR workflow
   - Enhanced: `update-visual-baselines.yml` - Multi-OS baseline updates

3. **Documentation** (in `agent-projects/issue-275/`):
   - `IMPLEMENTATION-SUMMARY-275.md` - Complete summary
   - `GLOBAL-CHANGE-WORKFLOW.md` - Global change details
   - `TESTING-GUIDE-275.md` - Testing instructions
   - `README.md` - This file

4. **Package Scripts** (in `frontend/package.json`):
   - `test:visual:analyze-scope` - Run scope analyzer
   - `test:visual:update-smart` - Run smart updater

## Success Metrics

Track these after deployment:

| Metric | Target | Status |
|--------|--------|--------|
| Noise reduction | >80% | ⏳ Pending |
| False positive rate | <5% | ⏳ Pending |
| False negative rate | <2% | ⏳ Pending |
| Time to green | <10 min | ⏳ Pending |

## Next Steps

1. ✅ **Implementation complete**
2. ⏳ **Test with real PRs** - Follow [TESTING-GUIDE-275.md](./TESTING-GUIDE-275.md)
3. ⏳ **Monitor for 1-2 weeks** - Collect metrics
4. ⏳ **Make default workflow** - Replace old visual regression workflow
5. ⏳ **Deprecate old workflow** - Remove manual update friction

## Related Issues

- Original issue: [#275](https://github.com/bencan1a/9boxer/issues/275)
- High commit velocity: ~38 commits/day average
- AI-agent driven development workflow

## Contact

For questions or issues:
1. Check documentation in this directory
2. Review workflow logs in GitHub Actions
3. Check script output for debugging
