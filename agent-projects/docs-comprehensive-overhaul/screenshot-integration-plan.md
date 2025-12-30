# Screenshot Integration Plan: Using 51 Orphaned Screenshots

**Version:** 1.0
**Date:** December 30, 2024
**Current State:** 36 of 87 screenshots in use (41%)
**Target State:** 78+ of 87 screenshots in use (90%+)
**Orphaned Screenshots:** 51

---

## Executive Summary

9Boxer has **excellent screenshot infrastructure** with 87 high-quality PNG files generated via automated Storybook workflows. However, **59% of screenshots (51 files) are not referenced in documentation**, creating a critical gap in visual guidance.

This plan provides specific, actionable steps to integrate the 51 orphaned screenshots into user documentation, transforming documentation from moderate visual coverage to excellent visual coverage.

**Before/After Impact:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Screenshot usage rate | 41% (36/87) | 90%+ (78+/87) | +49% |
| statistics.md screenshots | 1 | 10 | +900% |
| donut-mode.md screenshots | 0 (has TODOs) | 3 | N/A |
| exporting.md screenshots | 1 | 3 | +200% |
| settings.md screenshots | 0 | 2 | N/A |
| Pages with 0 screenshots | 5 pages | 0 pages | -100% |

---

## Current Screenshot Inventory

### Used Screenshots (36)

**quickstart.md (13 screenshots):** ✅ Well-illustrated
- Quickstart tour steps
- Sample data loading
- Grid exploration
- Employee details
- Statistics and Intelligence tabs
- Filter application

**filters.md (5 screenshots):** ✅ Good coverage
- Filter panel expanded
- Active filter chips
- Filter combinations
- Clear all filters
- Before/after filtered views

**workflows/talent-calibration.md (8 screenshots):** ✅ Well-illustrated
- Calibration preparation
- Statistics red flags
- Intelligence insights
- Filter panel
- Donut mode grid
- File import
- Discussion topics

**workflows/making-changes.md (5 screenshots):** ✅ Good coverage
- Drag-drop sequence (3 screenshots)
- Employee details
- Changes tab
- Orange border indicator
- Timeline view

**tracking-changes.md (2 screenshots):** Adequate
- Changes panel entries
- Timeline employee history

**statistics.md (1 screenshot):** ⚠️ Under-illustrated (9 more available)

**exporting.md (1 screenshot):** ⚠️ Under-illustrated (2 more available)

**index.md (1 screenshot):** Adequate
- Hero grid sample

---

### Orphaned Screenshots (51)

#### Priority 1: CRITICAL (9 screenshots)
**Target:** statistics.md

These screenshots document Intelligence and Statistics features currently under-explained.

| Filename | What It Shows | Where to Add | Priority |
|----------|---------------|--------------|----------|
| `intelligence-summary-anomalies.png` | Intelligence tab with 2 anomalies highlighted | statistics.md - Intelligence section | CRITICAL |
| `intelligence-anomaly-details.png` | Detailed anomaly card with metrics | statistics.md - Anomaly types section | CRITICAL |
| `intelligence-anomaly-red.png` | Critical severity anomaly example | statistics.md - Severity levels section | CRITICAL |
| `intelligence-anomaly-green.png` | Minor severity anomaly example | statistics.md - Severity levels section | CRITICAL |
| `intelligence-summary-excellent.png` | Intelligence with no anomalies (healthy state) | statistics.md - Healthy distribution section | HIGH |
| `intelligence-summary-needs-attention.png` | Intelligence with critical anomalies | statistics.md - Red flags section | HIGH |
| `statistics-grouping-indicators.png` | Statistics grouping options | statistics.md - Grouping section | MEDIUM |
| `statistics-trend-indicators.png` | Trend indicators in statistics | statistics.md - Trends section | MEDIUM |
| `intelligence-deviation-chart.png` | Deviation chart visualization | statistics.md - Deviation section | HIGH |
| `intelligence-level-distribution.png` | Level distribution chart | statistics.md - Level analysis section | HIGH |

**Impact:** Transforms statistics.md from 1 screenshot to 10+ screenshots, providing comprehensive visual guidance for Intelligence feature.

---

#### Priority 2: HIGH (3 screenshots)
**Target:** donut-mode.md

These screenshots replace "Screenshot to be added" TODO placeholders.

| Filename | What It Shows | Where to Add | Priority |
|----------|---------------|--------------|----------|
| `view-controls-donut.png` | Donut Mode button highlighted in view controls | donut-mode.md - Activation section | HIGH |
| `donut-mode-grid-normal.png` | Grid showing only position 5 employees in donut mode | donut-mode.md - Grid layout section | HIGH |
| `workflow/workflow-donut-notes-example.png` | Good note example in donut mode changes tab | donut-mode.md - Documentation section | HIGH |

**Impact:** Removes all TODO placeholders from donut-mode.md, provides visual guidance for specialized feature.

---

#### Priority 3: MEDIUM (4 screenshots)
**Target:** exporting.md (2), settings.md (2)

| Filename | What It Shows | Where to Add | Priority |
|----------|---------------|--------------|----------|
| `apply-changes-dialog-default.png` | Export dialog in default state | exporting.md - Export process section | MEDIUM |
| `apply-changes-dialog-save-as.png` | Export dialog with Save As option | exporting.md - Save As section | MEDIUM |
| `settings-dialog.png` | Settings dialog showing theme options | settings.md - Theme settings section | MEDIUM |
| `fullscreen-mode.png` | Fullscreen mode example | settings.md - View modes section | MEDIUM |

**Impact:** exporting.md goes from 1 to 3 screenshots, settings.md goes from 0 to 2 screenshots.

---

#### Priority 4: MEDIUM (10 screenshots)
**Target:** working-with-employees.md

| Filename | What It Shows | Where to Add | Priority |
|----------|---------------|--------------|----------|
| `employee-tile-normal.png` | Normal employee tile (not modified) | working-with-employees.md - Tile states section | MEDIUM |
| `employee-details-panel-expanded.png` | Full details panel view with all tabs | working-with-employees.md - Details panel section | MEDIUM |
| `workflow/workflow-employee-modified.png` | Employee tile with orange border (modified state) | working-with-employees.md - Modified state section | MEDIUM |
| `workflow/workflow-employee-timeline.png` | Timeline view showing employee history | working-with-employees.md - Timeline section | MEDIUM |
| `workflow/workflow-changes-tab.png` | Changes tab overview | working-with-employees.md - Changes tab section | LOW |
| `workflow/workflow-changes-add-note.png` | Adding note to employee changes | working-with-employees.md - Adding notes section | LOW |
| `workflow/workflow-changes-good-note.png` | Example of well-written note | working-with-employees.md - Good notes section | LOW |
| `workflow/workflow-note-good-example.png` | Another good note example | working-with-employees.md - Notes examples section | LOW |
| `workflow/making-changes-employee-details.png` | Employee details during change workflow | working-with-employees.md - Details tab section | LOW |
| `workflow/making-changes-changes-tab.png` | Changes tab during workflow | working-with-employees.md - Changes tab section | LOW |

**Impact:** working-with-employees.md goes from ~2 screenshots to 10+ screenshots with comprehensive visual guidance.

---

#### Priority 5: LOW (10 screenshots)
**Target:** best-practices.md, troubleshooting.md, tips.md

| Filename | What It Shows | Where to Add | Priority |
|----------|---------------|--------------|----------|
| `zoom-controls.png` | Zoom controls in view menu | best-practices.md - View tips section | LOW |
| `fullscreen-mode.png` | Fullscreen mode toggle | best-practices.md - Screen space tips | LOW |
| `file-menu-recent-files.png` | Recent files in file menu | best-practices.md - File management | LOW |
| `file-error-fallback.png` | Error state when file loading fails | troubleshooting.md - Upload errors section | MEDIUM |
| `distribution-chart-ideal.png` | Ideal distribution chart example | best-practices.md - Healthy distribution | MEDIUM |
| `workflow/calibration-file-import.png` | File import dialog during calibration | workflows/talent-calibration.md - Preparation | LOW |
| `workflow/calibration-statistics-red-flags.png` | Statistics showing red flags | workflows/talent-calibration.md - Review | MEDIUM |
| `workflow/calibration-filters-panel.png` | Filters panel during calibration | workflows/talent-calibration.md - Focus | LOW |
| `workflow/calibration-donut-mode-grid.png` | Donut mode grid in calibration workflow | workflows/talent-calibration.md - Validation | LOW |
| `workflow/workflow-statistics-tab.png` | Statistics tab in workflow context | workflows/talent-calibration.md - Analysis | LOW |

**Impact:** Adds visual guidance to supporting pages (best practices, troubleshooting).

---

#### Priority 6: SPECIALIZED (15 screenshots)
**Target:** Workflow variations, advanced features, future documentation

These screenshots are available for:
- Workflow variations (making-changes variations)
- Advanced feature documentation (when expanded)
- Future guides (if created)
- Visual regression testing (test baselines, not for docs)

**Strategy:** Keep available for future use, don't force integration if not contextually appropriate.

| Filename | What It Shows | Potential Use |
|----------|---------------|---------------|
| `workflow/making-changes-drag-sequence-base.png` | Drag sequence baseline | Already covered by making-changes.md |
| `workflow/workflow-drag-drop-sequence-1.png` | Drag sequence step 1 | Duplicate of existing |
| `workflow/workflow-drag-drop-sequence-3.png` | Drag sequence step 3 | Duplicate of existing |
| `workflow/workflow-apply-button.png` | Apply button with changes badge | Already covered by exporting.md |
| `workflow/making-changes-orange-border.png` | Orange border on modified tile | Already covered by making-changes.md |
| `workflow/making-changes-timeline.png` | Timeline during changes workflow | Already covered by making-changes.md |
| `view-controls-grid.png` | View controls in normal mode | Future: view-controls.md (if created) |
| `view-controls-donut.png` | View controls in donut mode | ✅ Use in donut-mode.md |
| `filters-panel-expanded.png` | Filter panel fully expanded | Check if already in filters.md |
| `filters-active-chips.png` | Active filter chips display | Check if already in filters.md |
| `filters-before-state.png` | Grid before filters applied | Use for before/after comparison |
| `filters-clear-all-button.png` | Clear all filters button | Check if already in filters.md |
| `changes-panel-entries.png` | Changes panel with multiple entries | Check if already in tracking-changes.md |
| `changes-orange-border.png` | Employee tile with orange border | Check if already in tracking-changes.md |
| `file-menu-apply-changes.png` | File menu with Apply button | Check if already in exporting.md |

**Strategy:** Audit for duplicates, use unique screenshots, keep remainder as test baselines or future reserves.

---

## Implementation Plan

### Week 1: Priority 1 (CRITICAL)

**Goal:** Add 9 screenshots to statistics.md

**Task:** Add screenshots to statistics.md Intelligence section

**Process:**
1. Read through statistics.md to understand structure
2. Identify where Intelligence content is currently located
3. Create outline for expanded Intelligence section:
   - What Intelligence Does
   - Types of Anomalies Detected
   - Severity Levels (Red/Yellow/Green)
   - Interpreting Anomalies
   - Recommended Actions
4. Add screenshots at appropriate locations
5. Write alt text for each screenshot
6. Write 1-2 sentences before/after each screenshot
7. Test rendering in MkDocs
8. Technical review by developer

**Screenshots to Add:**
1. `intelligence-summary-anomalies.png` → "Intelligence Tab Overview" section
2. `intelligence-anomaly-details.png` → "Understanding Anomaly Cards" section
3. `intelligence-anomaly-red.png` → "Critical Severity (Red)" subsection
4. `intelligence-anomaly-green.png` → "Minor Severity (Green)" subsection
5. `intelligence-summary-excellent.png` → "Healthy Distribution Example" section
6. `intelligence-summary-needs-attention.png` → "Red Flags to Watch" section
7. `statistics-grouping-indicators.png` → "Grouping Options" section
8. `statistics-trend-indicators.png` → "Trend Analysis" section
9. `intelligence-deviation-chart.png` → "Deviation Charts" section
10. `intelligence-level-distribution.png` → "Level Distribution Analysis" section

**Alt Text Examples:**
```markdown
![Intelligence tab showing two anomalies highlighted: "Location Bias" with red "Needs Attention" badge affecting 23 employees, and "Function Bias" with yellow "Review Recommended" badge affecting 15 employees](images/screenshots/workflow/intelligence-summary-anomalies.png)

![Detailed anomaly card for "Location Bias" showing severity indicator (red), affected employees count (23), expected percentage (33%) vs actual percentage (48%), deviation of +15%, and "View Details" button](images/screenshots/workflow/intelligence-anomaly-details.png)

![Example of critical severity anomaly (red) showing "Manager Leniency" with 45% deviation from expected distribution and "Needs Attention" badge](images/screenshots/workflow/intelligence-anomaly-red.png)
```

**Deliverable:**
- statistics.md with 10 screenshots (up from 1)
- Comprehensive Intelligence documentation (~1,800 words)
- All screenshots have descriptive alt text

**Effort:** 6 hours (4 hours integration + 2 hours writing)

---

### Week 1: Priority 2 (HIGH)

**Goal:** Add 3 screenshots to donut-mode.md

**Task:** Replace "Screenshot to be added" placeholders

**Process:**
1. Search donut-mode.md for TODO comments
2. Replace each TODO with appropriate screenshot
3. Write alt text
4. Add contextual explanation
5. Test rendering

**Screenshots to Add:**
1. `view-controls-donut.png` → "Activating Donut Mode" section (replace TODO)
2. `donut-mode-grid-normal.png` → "What You'll See" section (replace TODO)
3. `workflow/workflow-donut-notes-example.png` → "Adding Notes in Donut Mode" section (replace TODO)

**Alt Text Examples:**
```markdown
![View controls toolbar with Donut Mode button highlighted in red box, showing toggle switch icon and "Donut Mode" label](images/screenshots/view-controls-donut.png)

![Grid in Donut Mode showing only 18 employees from position 5 (center box) with ghostly appearance, all other grid positions empty and dimmed](images/screenshots/donut-mode-grid-normal.png)

![Changes tab in Donut Mode showing good note example: "Moved to Stars during donut exercise - consistently high performance + demonstrated leadership in Q4 project"](images/screenshots/workflow/workflow-donut-notes-example.png)
```

**Deliverable:**
- donut-mode.md with all 3 screenshots integrated
- All TODO placeholders removed
- Clear visual guidance for donut mode activation and usage

**Effort:** 2 hours

---

### Week 1: Priority 3 (MEDIUM)

**Goal:** Add 4 screenshots to exporting.md (2) and settings.md (2)

**Task:** Add visual guidance to under-illustrated pages

**Screenshots for exporting.md:**
1. `apply-changes-dialog-default.png` → "Exporting Your Changes" section
2. `apply-changes-dialog-save-as.png` → "Save As Option" section

**Alt Text:**
```markdown
![Apply Changes dialog showing default filename "modified_sample-data.xlsx", export options checkboxes for "Include change notes" and "Include donut placements", and Apply/Cancel buttons](images/screenshots/apply-changes-dialog-default.png)

![Apply Changes dialog with Save As option highlighted, showing file browser for choosing export location and custom filename entry field](images/screenshots/apply-changes-dialog-save-as.png)
```

**Screenshots for settings.md:**
1. `settings-dialog.png` → "Theme Settings" section
2. `fullscreen-mode.png` → "Fullscreen Mode" section

**Alt Text:**
```markdown
![Settings dialog showing three theme options: Light, Dark, and System (auto), with System currently selected, and Save/Cancel buttons at bottom](images/screenshots/settings-dialog.png)

![9Boxer application in fullscreen mode with maximized grid view, toolbar at top, and no browser chrome visible, showing F11 key indicator in corner](images/screenshots/fullscreen-mode.png)
```

**Deliverable:**
- exporting.md with 3 screenshots (up from 1)
- settings.md with 2 screenshots (up from 0)
- No pages with 0 screenshots in core documentation

**Effort:** 2 hours (1 hour per page)

---

### Week 2: Priority 4 (MEDIUM)

**Goal:** Add 10 screenshots to working-with-employees.md

**Task:** Comprehensive visual guidance for employee interactions

**Process:**
1. Create outline for enhanced working-with-employees.md:
   - Employee Tile States (Normal, Modified, Selected)
   - Details Panel Overview
   - Timeline View
   - Changes Tab
   - Adding Good Notes
2. Add screenshots to each section
3. Write alt text and contextual explanations
4. Test rendering

**Screenshots to Add:**
1. `employee-tile-normal.png` → "Normal Employee Tile" section
2. `employee-details-panel-expanded.png` → "Details Panel Overview" section
3. `workflow/workflow-employee-modified.png` → "Modified State (Orange Border)" section
4. `workflow/workflow-employee-timeline.png` → "Timeline View" section
5. `workflow/workflow-changes-tab.png` → "Changes Tab Overview" section
6. `workflow/workflow-changes-add-note.png` → "Adding Notes" section
7. `workflow/workflow-changes-good-note.png` → "Good Note Example 1" section
8. `workflow/workflow-note-good-example.png` → "Good Note Example 2" section
9. `workflow/making-changes-employee-details.png` → "Details Tab" section
10. `workflow/making-changes-changes-tab.png` → "Changes Tab During Workflow" section

**Deliverable:**
- working-with-employees.md with 10+ screenshots
- Comprehensive visual guidance for all employee interactions
- Examples of good notes with screenshots

**Effort:** 3 hours

---

### Week 2: Priority 5 (LOW)

**Goal:** Add 10 screenshots to supporting pages

**Task:** Add visual guidance to best-practices.md, troubleshooting.md, workflows

**Screenshots to Add:**

**best-practices.md (3):**
1. `zoom-controls.png` → "Managing Screen Space" section
2. `distribution-chart-ideal.png` → "Healthy Distribution" section
3. `file-menu-recent-files.png` → "File Management Tips" section

**troubleshooting.md (1):**
1. `file-error-fallback.png` → "Upload Errors" section

**workflows/talent-calibration.md (6):**
1. `workflow/calibration-file-import.png` → "Step 1: Upload Data" section
2. `workflow/calibration-statistics-red-flags.png` → "Step 2: Review Distribution" section
3. `workflow/calibration-filters-panel.png` → "Step 4: Focus on Borderline Cases" section
4. `workflow/calibration-donut-mode-grid.png` → "Step 5: Validate Center Box" section
5. `workflow/workflow-statistics-tab.png` → "Statistics Review" section
6. `workflow/intelligence-summary-needs-attention.png` → "Intelligence Check" section

**Deliverable:**
- best-practices.md with visual examples
- troubleshooting.md with error screenshots
- Enhanced workflow screenshots

**Effort:** 3 hours

---

### Week 3: Audit & Cleanup

**Goal:** Audit for duplicates, verify all screenshots used appropriately

**Task:** Review remaining 15 specialized screenshots

**Process:**
1. Compare "specialized" screenshots to already-used screenshots
2. Identify true duplicates vs unique perspectives
3. Determine if any unique screenshots should be integrated
4. Document remaining screenshots as "test baselines" or "future reserve"
5. Update screenshot inventory spreadsheet
6. Final audit: 78+ of 87 screenshots in use

**Deliverable:**
- Screenshot inventory updated
- Duplicate analysis complete
- 90%+ screenshot usage achieved

**Effort:** 2 hours

---

## Alt Text Standards

### Format
```markdown
![What is shown + Where in UI + Annotations described](path/to/screenshot.png)
```

### Minimum Length
- Simple screenshots: 15-20 words
- Complex screenshots: 25-40 words
- Annotated screenshots: 30-50 words (describe annotations)

### Good Examples

**Simple UI Element:**
```markdown
![Upload button in top-left corner of toolbar, represented by blue folder icon with up arrow](images/screenshots/quickstart/upload-button.png)
```

**Complex Interface:**
```markdown
![9-box grid showing 87 employees distributed across nine positions, with performance axis (Low/Medium/High) horizontal and potential axis (Low/Medium/High) vertical, each box labeled with position number 1-9](images/screenshots/quickstart/grid-populated.png)
```

**Annotated Screenshot:**
```markdown
![Intelligence tab with three anomaly cards highlighted: "Location Bias" in red showing 23 affected employees, "Function Bias" in yellow showing 15 employees, and "Healthy Distribution" in green, with numbered callouts 1-3 pointing to severity badges](images/screenshots/workflow/intelligence-summary-annotated.png)
```

**Before/After Comparison:**
```markdown
![Two-panel comparison: Left panel shows full grid with 87 employees across all 9 boxes, right panel shows filtered grid with only 12 employees in Engineering department, demonstrating filter effect](images/screenshots/filters/before-after-comparison.png)
```

---

## Success Metrics

### Quantitative Metrics

**Before:**
- Screenshot usage: 36/87 (41%)
- Pages with 0 screenshots: 5 pages
- statistics.md: 1 screenshot
- donut-mode.md: 0 screenshots (has TODOs)
- exporting.md: 1 screenshot
- settings.md: 0 screenshots

**After:**
- Screenshot usage: 78+/87 (90%+)
- Pages with 0 screenshots: 0 pages
- statistics.md: 10 screenshots
- donut-mode.md: 3 screenshots
- exporting.md: 3 screenshots
- settings.md: 2 screenshots

**Overall Improvement:**
- +42 screenshots integrated
- +49% usage rate increase
- 100% TODO placeholder removal
- 100% core pages have visual guidance

### Qualitative Metrics

**User Impact:**
- Visual learners (40-50% of users) can now follow documentation
- Statistics/Intelligence features become discoverable
- Donut mode activation is clear (no more placeholders)
- Export process has visual confirmation
- Settings are visually documented

**Documentation Quality:**
- No pages lack screenshots
- Comprehensive visual guidance throughout
- Professional appearance (no TODO placeholders)
- Accessibility improved (all alt text added)

---

## Risk Mitigation

### Risk 1: Screenshots Outdated
**Probability:** Low
**Mitigation:** Screenshot automation regenerates on UI changes, visual regression testing validates

### Risk 2: Alt Text Takes Longer Than Expected
**Probability:** Medium
**Mitigation:** Use alt text templates, accept 20-word minimum for simple screenshots

### Risk 3: Too Many Screenshots Clutter Pages
**Probability:** Low
**Mitigation:** Only add screenshots where visual guidance adds value, not just for the sake of using them

### Risk 4: Duplicate Screenshots Discovered
**Probability:** Medium
**Mitigation:** Week 3 audit process identifies duplicates, use best version, document others as backups

---

## Checklist

### Week 1 Checklist
- [ ] Add 9 screenshots to statistics.md (Priority 1)
- [ ] Write 9 alt text descriptions for statistics.md
- [ ] Add 3 screenshots to donut-mode.md (Priority 2)
- [ ] Write 3 alt text descriptions for donut-mode.md
- [ ] Remove all TODO placeholders
- [ ] Add 2 screenshots to exporting.md (Priority 3)
- [ ] Add 2 screenshots to settings.md (Priority 3)
- [ ] Write 4 alt text descriptions for exporting/settings
- [ ] Test all screenshots render correctly in MkDocs

### Week 2 Checklist
- [ ] Add 10 screenshots to working-with-employees.md (Priority 4)
- [ ] Write 10 alt text descriptions for working-with-employees.md
- [ ] Add 3 screenshots to best-practices.md (Priority 5)
- [ ] Add 1 screenshot to troubleshooting.md (Priority 5)
- [ ] Add 6 screenshots to workflows/talent-calibration.md (Priority 5)
- [ ] Write alt text for all Priority 5 screenshots
- [ ] Test all screenshots render correctly

### Week 3 Checklist
- [ ] Audit remaining 15 specialized screenshots
- [ ] Identify duplicates vs unique screenshots
- [ ] Update screenshot inventory spreadsheet
- [ ] Verify 78+ of 87 screenshots in use (90%+)
- [ ] Document remaining screenshots as test baselines
- [ ] Final QA: All screenshots have alt text
- [ ] Final QA: All screenshots render correctly
- [ ] Final QA: No TODO placeholders remain

---

**Document Version:** 1.0
**Last Updated:** December 30, 2024
**Next Review:** After Week 1 completion
**Owner:** Technical Writer
