# Self-Managing Documentation System - Implementation Order

**Project:** Self-Managing Documentation System
**Created:** 2025-12-26
**Status:** Ready for Implementation

---

## Overview

This document outlines the complete implementation order for the self-managing documentation system, breaking the work into discrete GitHub issues with clear dependencies and priorities.

**Total Issues:** 12
**Total Effort:** ~10-12 days focused work (or ~10 weeks part-time)
**Expected ROI:** 2-3 months payback period

---

## Implementation Sequence

### 🎯 Phase 1: Componentization (4-6 days)

**Goal:** Extract key components as pure presentational components to enable Storybook-based screenshots

**Priority:** HIGH - This unlocks 11-14 screenshots (21-27% of total) to use fast, reliable Storybook approach

#### Issue #62: Extract NineBoxGrid Component
**Status:** Open
**Effort:** 2-3 days
**Impact:** 7-8 screenshots (15%)
**Dependencies:** None
**Order:** 1st (START HERE)

**Deliverables:**
- Pure `NineBoxGrid` component with props
- `NineBoxGridContainer` that connects to app state
- 6+ Storybook stories (Normal, Populated, Donut, WithGhosting, etc.)
- Screenshot functions in `storybook-components.ts`
- Config updated for 7-8 screenshots

**Why First:**
- Highest ROI (most screenshots unlocked)
- Validates the componentization pattern
- Establishes baseline for other components
- No dependencies

**Testing:**
```bash
npm run storybook # Verify stories
npm run screenshots:generate grid-normal quickstart-grid-populated
npm run test:visual
npm run test:e2e:pw
```

---

#### Issue #51: Extract AppBar States Component
**Status:** Open
**Effort:** 1 day
**Impact:** 3-4 screenshots (6%)
**Dependencies:** #62 (pattern validation)
**Order:** 2nd

**Deliverables:**
- Refactored `AppBar` with props (fileName, changeCount, callbacks)
- `AppBarContainer` for state connection
- 4+ Storybook stories (EmptyState, WithFile, WithChanges, FileMenuOpen)
- Screenshots migrated to Storybook

**Why Second:**
- Quick win after validating pattern
- Moderate impact
- Builds momentum

---

#### Issue #52: Extract IntelligencePanel Component
**Status:** Open
**Effort:** 1-2 days
**Impact:** 1-2 screenshots (2%)
**Dependencies:** #62, #51 (pattern established)
**Order:** 3rd

**Deliverables:**
- `IntelligencePanel` component with props (anomalies, insights)
- Mock AI data helpers
- 3+ Storybook stories
- Screenshots migrated

**Why Third:**
- Completes Phase 1
- Lower impact but rounds out componentization
- Demonstrates pattern works for complex components

---

### 🤖 Phase 2: Self-Managing System Foundation (2 weeks)

**Goal:** Build automated change detection and selective screenshot regeneration

**Priority:** MEDIUM - Enables automation but requires Phase 1 components

#### Issue #53: Component-Screenshot Metadata System
**Status:** Open
**Effort:** 0.5 day
**Dependencies:** #62 (components to annotate)
**Order:** 4th

**Deliverables:**
- JSDoc `@screenshots` annotations on all components
- `.github/scripts/extract-screenshot-metadata.js`
- `.github/component-screenshot-map.json` (generated)
- CI integration

**Why Fourth:**
- Foundation for automation
- Quick implementation
- Unblocks change detection

---

#### Issue #54: Build Change Detection GitHub Action
**Status:** Open
**Effort:** 1 day
**Dependencies:** #53 (needs metadata)
**Order:** 5th

**Deliverables:**
- `.github/workflows/docs-auto-update.yml`
- `.github/scripts/detect-doc-impact.js`
- PR comment integration
- Affected screenshots identification

**Why Fifth:**
- Core automation workflow
- Enables selective regeneration
- Foundation for visual regression

---

#### Issue #55: Implement Selective Screenshot Regeneration
**Status:** Open
**Effort:** 0.5 day
**Dependencies:** #54 (needs detection)
**Order:** 6th

**Deliverables:**
- `frontend/scripts/regenerate-affected-screenshots.js`
- Package.json script: `screenshots:generate:affected`
- GitHub Action integration

**Why Sixth:**
- Completes Phase 2 foundation
- Makes automation actually useful
- Much faster than full regeneration

---

### 👁️ Phase 3: Visual Regression (1 week)

**Goal:** Validate screenshot quality automatically with visual regression tests

**Priority:** MEDIUM - Quality assurance for automated screenshots

#### Issue #61: Extend Playwright Visual Tests
**Status:** Open
**Effort:** 1 day
**Dependencies:** #54, #55 (automation in place)
**Order:** 7th

**Deliverables:**
- `frontend/playwright/visual-regression/screenshot-validation.spec.ts`
- Baseline screenshots
- 5% diff tolerance configuration
- CI integration

**Why Seventh:**
- Validates automated screenshot quality
- Prevents regressions
- Foundation for diff reports

---

#### Issue #56: Build Visual Diff Report Generation
**Status:** Open
**Effort:** 0.5 day
**Dependencies:** #61 (needs visual tests)
**Order:** 8th

**Deliverables:**
- `.github/scripts/generate-visual-diff-report.js`
- HTML diff report template
- PR comment with visual comparisons

**Why Eighth:**
- Makes visual changes reviewable
- Completes Phase 3
- Improves PR review process

---

### 🧠 Phase 4: AI Audit System (1-2 weeks)

**Goal:** Proactively detect stale documentation with weekly AI audits

**Priority:** LOW - Nice to have, not critical for core functionality

#### Issue #57: Build AI Documentation Audit Script
**Status:** Open
**Effort:** 1.5 days
**Dependencies:** #54 (needs change detection pattern)
**Order:** 9th

**Deliverables:**
- `.github/scripts/ai-docs-audit.js`
- Anthropic API integration
- Audit report format (JSON + Markdown)
- Test with sample data

**Why Ninth:**
- Optional enhancement
- Requires API key setup
- Can be delayed if needed

---

#### Issue #58: Set Up Weekly Audit GitHub Action
**Status:** Open
**Effort:** 0.5 day
**Dependencies:** #57 (needs audit script)
**Order:** 10th

**Deliverables:**
- `.github/workflows/docs-audit.yml`
- Weekly schedule (Monday 2 AM UTC)
- Issue creation for findings
- Secret `ANTHROPIC_API_KEY` configuration

**Why Tenth:**
- Completes AI audit system
- Low priority, can be skipped initially
- Adds ongoing value

---

### 📊 Phase 5: Coverage & Enforcement (1 week)

**Goal:** Track documentation health and remind developers

**Priority:** LOW - Quality of life improvements

#### Issue #59: Build Screenshot Coverage Dashboard
**Status:** Open
**Effort:** 1 day
**Dependencies:** None (independent)
**Order:** 11th

**Deliverables:**
- `.github/scripts/screenshot-coverage.js`
- Coverage report (Markdown + JSON)
- Weekly coverage workflow
- Coverage badge for README

**Why Eleventh:**
- Optional monitoring
- Helps track progress
- Can be built anytime

---

#### Issue #60: Implement PR Documentation Reminders
**Status:** Open
**Effort:** 0.5 day
**Dependencies:** None (independent)
**Order:** 12th (LAST)

**Deliverables:**
- `.github/workflows/pr-docs-check.yml`
- `.github/scripts/detect-new-features.js`
- PR comment template with checklist

**Why Last:**
- Nice to have
- Optional developer UX improvement
- No blocking dependencies

---

## Recommended Implementation Paths

### Path 1: Full Implementation (Recommended)

Complete all 12 issues in order for maximum benefit.

**Timeline:** 10 weeks part-time or 12 days focused
**Outcome:** Fully self-managing documentation system

```
Week 1-2: #62 (NineBoxGrid)
Week 3: #51 (AppBar)
Week 4: #52 (IntelligencePanel)
Week 5: #53, #54 (Metadata + Change Detection)
Week 6: #55, #61 (Selective Regen + Visual Tests)
Week 7: #56, #57 (Visual Diff + AI Audit)
Week 8: #58 (Weekly Audit)
Week 9: #59 (Coverage Dashboard)
Week 10: #60 (PR Reminders)
```

---

### Path 2: MVP (Minimum Viable Product)

Implement core automation only (Issues #62, #51, #53-#56).

**Timeline:** 4-5 weeks part-time or 6-7 days focused
**Outcome:** Automated screenshot regeneration on component changes

```
Week 1-2: #62 (NineBoxGrid) - Validate approach
Week 3: #51 (AppBar) - Quick win
Week 4: #53, #54, #55 (Metadata + Change Detection + Selective Regen)
Week 5: #61, #56 (Visual Tests + Diff Reports)
```

**Skip for MVP:** #52 (IntelligencePanel), #57-#60 (AI Audit, Coverage, PR Reminders)

---

### Path 3: Quick Win (Fastest)

Implement only NineBoxGrid componentization (#62).

**Timeline:** 2-3 days
**Outcome:** 7-8 screenshots using Storybook (15% improvement)

**Benefit:** Validates approach before committing to full implementation.

---

## Critical Dependencies

### Must Be Done In Order

1. **#62 → #51, #52** - NineBoxGrid validates pattern before other components
2. **#53 → #54** - Metadata system required for change detection
3. **#54 → #55** - Change detection required for selective regeneration
4. **#61 → #56** - Visual tests required for diff reports
5. **#57 → #58** - Audit script required for workflow

### Can Be Done In Parallel

- **#51 and #52** (after #62) - AppBar and IntelligencePanel can be developed concurrently
- **#59 and #60** - Coverage dashboard and PR reminders are independent

### Can Be Skipped

- **#52** - IntelligencePanel (low impact, 1-2 screenshots)
- **#57, #58** - AI Audit system (optional enhancement)
- **#59** - Coverage dashboard (nice to have)
- **#60** - PR reminders (developer UX)

---

## Success Milestones

### Milestone 1: Componentization Complete
**Issues:** #62, #51, #52
**Outcome:** 40-46% Storybook screenshot coverage (vs 19% current)
**Benefits:** Faster, more reliable screenshot generation

### Milestone 2: Automation Foundation
**Issues:** #53, #54, #55
**Outcome:** Automated screenshot regeneration on component changes
**Benefits:** Documentation stays fresh automatically

### Milestone 3: Quality Assurance
**Issues:** #61, #56
**Outcome:** Visual regression tests and diff reports
**Benefits:** Automated quality validation

### Milestone 4: Proactive Monitoring
**Issues:** #57, #58
**Outcome:** Weekly AI audits catching stale docs
**Benefits:** Proactive documentation health

### Milestone 5: Complete System
**Issues:** #59, #60
**Outcome:** Full self-managing documentation system
**Benefits:** Comprehensive monitoring and enforcement

---

## Risk Mitigation

### Risk: Componentization Breaks Functionality
**Mitigation:** Incremental approach, comprehensive testing, feature flags
**Order Impact:** Start with #62 to validate pattern

### Risk: Change Detection False Positives
**Mitigation:** Tune detection logic, manual review before merge
**Order Impact:** Deploy #54 in silent monitoring mode first

### Risk: Visual Regression Noise
**Mitigation:** 5% diff tolerance, manual baseline review
**Order Impact:** Test #61 thoroughly before production

### Risk: AI Audit Costs
**Mitigation:** Monitor costs, adjust frequency if needed
**Order Impact:** Make #57, #58 optional (can skip)

---

## Next Steps

1. ✅ **Review this implementation order** with team
2. ✅ **Assign Issue #62** (NineBoxGrid) to developer
3. ⏳ **Start implementation** with Phase 1
4. ⏳ **Validate approach** after #62 before proceeding
5. ⏳ **Continue with remaining issues** based on chosen path

---

## Progress Tracking

Use this checklist to track progress:

### Phase 1: Componentization
- [ ] #62 - NineBoxGrid component
- [ ] #51 - AppBar states
- [ ] #52 - IntelligencePanel

### Phase 2: Foundation
- [ ] #53 - Metadata system
- [ ] #54 - Change detection
- [ ] #55 - Selective regeneration

### Phase 3: Visual Regression
- [ ] #61 - Visual tests
- [ ] #56 - Diff reports

### Phase 4: AI Audit
- [ ] #57 - Audit script
- [ ] #58 - Weekly workflow

### Phase 5: Coverage
- [ ] #59 - Coverage dashboard
- [ ] #60 - PR reminders

---

## Issue Links

- **Phase 1:**
  - #62 - NineBoxGrid: https://github.com/bencan1a/9boxer/issues/62
  - #51 - AppBar: https://github.com/bencan1a/9boxer/issues/51
  - #52 - IntelligencePanel: https://github.com/bencan1a/9boxer/issues/52

- **Phase 2:**
  - #53 - Metadata: https://github.com/bencan1a/9boxer/issues/53
  - #54 - Change Detection: https://github.com/bencan1a/9boxer/issues/54
  - #55 - Selective Regen: https://github.com/bencan1a/9boxer/issues/55

- **Phase 3:**
  - #61 - Visual Tests: https://github.com/bencan1a/9boxer/issues/61
  - #56 - Diff Reports: https://github.com/bencan1a/9boxer/issues/56

- **Phase 4:**
  - #57 - AI Audit: https://github.com/bencan1a/9boxer/issues/57
  - #58 - Weekly Workflow: https://github.com/bencan1a/9boxer/issues/58

- **Phase 5:**
  - #59 - Coverage: https://github.com/bencan1a/9boxer/issues/59
  - #60 - PR Reminders: https://github.com/bencan1a/9boxer/issues/60

---

## References

See `agent-projects/self-managing-docs-system/` for complete documentation:
- **EXECUTIVE_SUMMARY.md** - Project overview and ROI
- **componentization-strategy.md** - Detailed componentization approach
- **self-managing-docs-system.md** - Complete automation system design
- **screenshot-storybook-migration-plan.md** - Migration action plan
- **plan.md** - Project plan with metadata
