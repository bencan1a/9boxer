---
status: active
owner: Development Team
created: 2025-12-26
summary:
  - Build self-managing documentation system with automated screenshot updates
  - Componentize key React components (NineBoxGrid, AppBar, IntelligencePanel) for Storybook
  - Implement AI-powered documentation audits and change detection
  - Achieve 40-46% Storybook screenshot coverage (vs 19% current)
---

# Self-Managing Documentation System

## Project Overview

Transform the documentation screenshot system from manual/semi-automated to fully self-managing through:
1. **Strategic componentization** of key React components to enable Storybook-based screenshots
2. **Automated change detection** that regenerates affected screenshots when components change
3. **AI-powered documentation audits** that proactively identify stale documentation
4. **Coverage tracking** to monitor documentation health over time

## Goals

- **40-46% Storybook screenshot coverage** (currently 19%)
- **Automated documentation updates** triggered by code changes
- **AI-powered weekly audits** to catch stale documentation
- **Minimal maintenance burden** (1-2 hours/week)
- **Documentation that never goes stale**

## Related Documents

- **[IMPLEMENTATION_ORDER.md](IMPLEMENTATION_ORDER.md)** ⭐ **START HERE** - Complete implementation sequence and order
- **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** - Complete overview, timeline, costs, ROI
- **[componentization-strategy.md](componentization-strategy.md)** - Detailed componentization roadmap
- **[self-managing-docs-system.md](self-managing-docs-system.md)** - Complete automation system design
- **[screenshot-storybook-migration-analysis.md](screenshot-storybook-migration-analysis.md)** - Original analysis
- **[screenshot-storybook-migration-plan.md](screenshot-storybook-migration-plan.md)** - Migration action plan
- **[screenshot-inventory-summary.md](screenshot-inventory-summary.md)** - Screenshot inventory table

## Implementation Phases

### Phase 1: Componentization (4-6 days)
- Extract NineBoxGrid as pure component (2-3 days, unlocks 7-8 screenshots)
- Extract AppBar states (1 day, unlocks 3-4 screenshots)
- Extract IntelligencePanel (1-2 days, unlocks 1-2 screenshots)

### Phase 2: Self-Managing System Foundation (2 weeks)
- Component-screenshot metadata system (JSDoc annotations)
- Change detection GitHub Action (analyzes git diff)
- Selective screenshot regeneration (only affected screenshots)

### Phase 3: Visual Regression (1 week)
- Extend Playwright visual tests for documentation
- Visual diff report generation (HTML reports)
- PR integration with visual comparisons

### Phase 4: AI Audit System (1-2 weeks)
- Weekly AI documentation audit script (Claude API)
- Automated GitHub issue creation for findings
- Stale documentation detection

### Phase 5: Coverage & Enforcement (1 week)
- Screenshot coverage dashboard and reports
- PR documentation reminder bot
- New feature detection heuristics

## Success Metrics

- **Storybook Coverage:** >40% (currently 19%)
- **Component Story Coverage:** >50% (currently ~30%)
- **Docs Updated Within 7 Days:** >90% (currently manual)
- **Auto-Generated Doc PRs:** >70% (currently 0%)
- **Stale Docs Detected/Week:** <5 (currently unknown)

## GitHub Issues

See [IMPLEMENTATION_ORDER.md](IMPLEMENTATION_ORDER.md) for complete implementation sequence.

**Phase 1: Componentization** (Start here!)
- [#62](https://github.com/bencan1a/9boxer/issues/62) - Extract NineBoxGrid component (2-3 days, 7-8 screenshots) ⭐ **START**
- [#51](https://github.com/bencan1a/9boxer/issues/51) - Extract AppBar states component (1 day, 3-4 screenshots)
- [#52](https://github.com/bencan1a/9boxer/issues/52) - Extract IntelligencePanel component (1-2 days, 1-2 screenshots)

**Phase 2: Foundation** ✅ **COMPLETE**
- [#53](https://github.com/bencan1a/9boxer/issues/53) - ✅ Set up component-screenshot metadata system (0.5 day)
- [#54](https://github.com/bencan1a/9boxer/issues/54) - ✅ Build change detection GitHub Action (1 day)
- [#55](https://github.com/bencan1a/9boxer/issues/55) - ✅ Implement selective screenshot regeneration (0.5 day)

**Phase 3: Visual Regression** ✅ **COMPLETE**
- [#61](https://github.com/bencan1a/9boxer/issues/61) - ✅ Extend Playwright visual tests for docs (1 day)
- [#56](https://github.com/bencan1a/9boxer/issues/56) - ✅ Build visual diff report generation (0.5 day)

**Phase 4: AI Audit** (Optional)
- [#57](https://github.com/bencan1a/9boxer/issues/57) - Build AI documentation audit script (1.5 days)
- [#58](https://github.com/bencan1a/9boxer/issues/58) - Set up weekly audit GitHub Action (0.5 day)

**Phase 5: Coverage & Enforcement** (Optional)
- [#59](https://github.com/bencan1a/9boxer/issues/59) - Build screenshot coverage dashboard (1 day)
- [#60](https://github.com/bencan1a/9boxer/issues/60) - Implement PR documentation reminders (0.5 day)

## Timeline

**Week 1-2:** Phase 1 - NineBoxGrid componentization (highest ROI)
**Week 3:** Phase 1 - AppBar componentization (quick win)
**Week 4-5:** Phase 2 - Change detection system
**Week 6-7:** Phase 3 - Visual regression system
**Week 8-9:** Phase 4 - AI audit system
**Week 10:** Phase 5 - Coverage & enforcement

**Total Duration:** ~10 weeks (part-time) or ~12 days focused work

## Cost Estimate

**Development Time:** 10-12 days focused work
**Ongoing Costs:**
- GitHub Actions: ~300-400 min/month (within free tier)
- Anthropic API: ~$2-4/month (weekly AI audits)
- Maintenance: 1-2 hours/week (reviewing auto-generated PRs)

**ROI:** 2-3 months payback period

## Current Status

- [x] Analysis and planning complete
- [x] Documents created and organized
- [x] GitHub issues created (#51-#62)
- [x] Implementation order defined
- [x] **Phase 2 Foundation Complete** (#53, #54, #55)
  - [x] Component-screenshot metadata system operational
  - [x] Change detection GitHub Action working
  - [x] Selective screenshot regeneration functional
- [x] **Phase 3 Visual Regression Complete** (#61, #56)
  - [x] Visual regression test suite operational (80 tests)
  - [x] CI integration with documentation PR workflow
  - [x] 5% tolerance configured for visual diffs
  - [x] Visual diff HTML reports with side-by-side comparisons
  - [x] JSON summary export for automation
- [ ] **NEXT:** Optional Phase 4 - AI Audit System (or Phase 5 Coverage)
- [ ] Validation of componentization approach
- [ ] AI audit system deployed (optional)
- [ ] Coverage tracking system (optional)
- [ ] Full self-managing system operational

## Next Steps

1. ✅ Review [IMPLEMENTATION_ORDER.md](IMPLEMENTATION_ORDER.md)
2. ✅ **Phase 2 Foundation Complete** - Change detection & selective regeneration operational
3. ✅ **Phase 3 Visual Regression Complete** - Testing & diff reports operational
4. ⏳ **Optional:** Phase 4 AI audit system (#57, #58)
5. ⏳ **Optional:** Phase 5 Coverage & enforcement (#59, #60)
6. ℹ️ **Note:** Phase 1 (Componentization) can be done anytime to increase Storybook coverage
