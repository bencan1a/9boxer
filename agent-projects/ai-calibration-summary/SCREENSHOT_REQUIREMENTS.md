# AI Calibration Intelligence - Screenshot Requirements

**Purpose:** Detailed specifications for capturing 8 screenshots documenting the AI-powered calibration intelligence feature.

**Documentation Phase:** Phase 4 from DOCUMENTATION_PLAN.md

**Target Location:** `resources/user-guide/docs/images/screenshots/intelligence/`

**Screenshot Automation:** All screenshots should be generated using the Playwright automation system. See `frontend/playwright/screenshots/HOWTO.md` for the automation workflow.

---

## Overview

The AI calibration intelligence feature requires 8 new screenshots to document:
- AI summary generation and display
- Calibration insights section with filtering and selection
- Insight cards with priority badges and cluster grouping
- Data overview cards showing quality metrics

**Quality Standards:**
- **Dark mode only** - All screenshots must use dark theme
- **Adaptive viewport** - Size to content (wide for horizontal layouts, narrow for vertical panels)
- **Minimal whitespace** - Crop closely to intended object with 10px padding
- **Focused framing** - Show only what's necessary for understanding the feature
- **Clear captions** - Every screenshot needs descriptive purpose documentation

---

## Screenshot Checklist

### 1. ai-summary-generate-button.png

- [ ] **Status:** Not captured
- [ ] **Priority:** HIGH (required for getting-started.md Step 2)

**What to show:**
- Intelligence tab view with "Generate AI Summary" button prominently visible
- Button should be in default/enabled state (not disabled)
- Data overview cards visible at top
- No summary generated yet (empty state or placeholder)

**UI State Requirements:**
- Calibration session loaded with employee data
- Intelligence tab opened
- AI summary NOT yet generated (initial state)
- "Generate AI Summary" button visible and enabled

**Key Elements to Highlight:**
- Generate AI Summary button (primary focus)
- Intelligence tab in right panel
- Data overview cards showing context

**Recommended Composition:**
- Cropping: `panel` strategy - capture right panel area showing Intelligence tab
- Width: 800-1200px (panel width)
- Focus on Intelligence tab content with Generate button prominent

**Sample Data Requirements:**
- Session with 40-100 employees loaded
- Quality score visible (e.g., 82 - "Good")
- Anomaly count visible (e.g., "7 anomalies: 2 red, 3 yellow, 2 green")

**Playwright Automation Notes:**
- Story: Intelligence tab initial state (no summary generated)
- Selector: Button with text "Generate AI Summary"
- Ensure button is in enabled state (LLM features available)

---

### 2. ai-summary-expanded.png

- [ ] **Status:** Not captured
- [ ] **Priority:** HIGH (required for intelligence.md AI section)

**What to show:**
- Complete AI-generated executive summary fully expanded
- 2-3 paragraph conversational analysis visible
- "Powered by Claude" badge displayed
- "Show Less" and "Refresh" buttons visible
- Actual summary text with specific insights

**UI State Requirements:**
- AI summary successfully generated
- Summary in expanded state (not collapsed to 3 lines)
- Real summary content visible (not placeholder)
- Action buttons (Show Less, Refresh) visible

**Key Elements to Highlight:**
- Full summary text (2-3 paragraphs)
- "Powered by Claude" branding
- "Show Less" and "Refresh" action buttons
- Specific insights mentioned in text (e.g., "MT3 level driving center box inflation")

**Recommended Composition:**
- Cropping: `container` strategy - capture AI summary container with full text
- Width: 800-1200px
- Height: Adaptive to show all 2-3 paragraphs without scrolling

**Sample Data Requirements:**
- Summary should reference realistic patterns:
  - Specific percentages (e.g., "64% vs. 35% expected")
  - Employee counts (e.g., "45 employees affected")
  - Specific categories (e.g., "MT3 level", "Engineering department", "New hires")
  - Meeting recommendations (e.g., "Allocate 45 minutes to MT3 deep dive")

**Playwright Automation Notes:**
- Story: AI summary expanded view
- Mock LLM response with realistic calibration summary
- Ensure "Show Less" button is visible (summary is expanded)
- Include "Powered by Claude" badge at bottom

---

### 3. ai-summary-preview.png

- [ ] **Status:** Not captured (OPTIONAL - May not be needed)
- [ ] **Priority:** LOW (nice-to-have for demonstrating collapsed state)

**What to show:**
- AI summary in collapsed/preview state
- Only first ~3 lines visible with ellipsis
- "Show More" button visible
- Demonstrates truncated summary view

**UI State Requirements:**
- AI summary generated and collapsed
- Text truncated with ellipsis
- "Show More" button visible and clickable

**Key Elements to Highlight:**
- Truncated summary text (3 lines)
- "Show More" button
- Ellipsis indicating more content

**Recommended Composition:**
- Cropping: `container` strategy - capture collapsed summary container
- Width: 800-1200px
- Minimal height (collapsed state)

**Sample Data Requirements:**
- Same summary as ai-summary-expanded.png but in collapsed state

**Playwright Automation Notes:**
- Story: AI summary collapsed view
- Ensure "Show More" button is visible (summary is collapsed)
- May be combined with ai-summary-expanded.png as before/after

**NOTE:** This screenshot may be optional if the collapsed state is not prominently documented. Focus on ai-summary-expanded.png first.

---

### 4. calibration-insights-section.png

- [ ] **Status:** Not captured
- [ ] **Priority:** HIGH (required for intelligence.md and getting-started.md)

**What to show:**
- Full calibration insights section with multiple insight cards
- Priority filter buttons visible (All, High, Medium, Low)
- "Select All" and "Deselect All" buttons visible
- Mix of HIGH, MEDIUM, LOW priority insights displayed
- At least 2-3 insights selected (checkboxes checked)
- Section header showing total insight count

**UI State Requirements:**
- AI summary generated (insights visible below summary)
- Priority filter set to "All" (showing all insights)
- Multiple insights visible (at least 5-8 cards)
- Some insights selected (2-3 with checkboxes checked)
- Mix of priorities and categories

**Key Elements to Highlight:**
- Priority filter pills (All/High/Medium/Low)
- "Select All" / "Deselect All" action buttons
- Insight cards showing variety of priorities (RED/YELLOW/GREEN badges)
- Selected state (checked checkboxes on some cards)
- Insight count header (e.g., "12 insights")

**Recommended Composition:**
- Cropping: `container` strategy - capture insights section container
- Width: 800-1200px
- Height: Tall (show 5-8 insight cards without requiring scroll)

**Sample Data Requirements:**
- 8-12 total insights generated
- Distribution:
  - 2-3 HIGH priority (red badges)
  - 3-5 MEDIUM priority (yellow badges)
  - 2-3 LOW priority (green badges)
- Categories: Mix of Location, Function, Level, Tenure, Distribution, Time
- Types: Mix of Anomaly, Focus Area, Recommendation, Time Allocation
- Cluster badges on at least 2-3 related insights

**Playwright Automation Notes:**
- Story: Calibration insights section with multiple insights
- Mock insights response with variety of priorities and types
- Ensure 2-3 insights have `selected: true` state
- Show filter pills and action buttons

---

### 5. insight-card-detail.png

- [ ] **Status:** Not captured
- [ ] **Priority:** HIGH (required for intelligence.md insight explanation)

**What to show:**
- Single insight card showing ALL key elements in detail:
  - Priority badge (HIGH in red - most visually prominent)
  - Category icon (e.g., level groups icon, location pin, etc.)
  - Bold title (e.g., "MT3 driving center box inflation")
  - 2-3 sentence description explaining the finding
  - Affected count (e.g., "45 employees affected")
  - Cluster badge if applicable (e.g., "MT3 Level Requires Deep Review")
  - Selection checkbox

**UI State Requirements:**
- Single insight card in unselected state (checkbox unchecked)
- HIGH priority for maximum visual impact
- Cluster badge visible
- All text readable and not truncated

**Key Elements to Highlight:**
- Priority badge (HIGH - red, top-left corner)
- Category icon (distinctive icon visible)
- Title text (bold, prominent)
- Description text (2-3 sentences, full content visible)
- Affected count with icon (e.g., "👤 45 employees")
- Cluster badge (bottom of card)
- Selection checkbox (unchecked state)

**Recommended Composition:**
- Cropping: `element` strategy - capture single insight card tightly
- Width: 600-800px (full card width)
- Height: Adaptive to card height (all content visible)
- 10px padding around card

**Sample Data Requirements:**
- Priority: HIGH (for visual prominence)
- Category: LEVEL (level groups icon)
- Title: "MT3 level driving center box inflation"
- Description: "MT3 level has 64% of employees rated in the center box (positions 4-6), compared to 35% expected for this organizational level. This pattern suggests either genuine clustering or potential under-differentiation. Review individual MT3 employees to validate placements."
- Affected count: 45 employees
- Cluster: "MT3 Level Requires Deep Review"
- Type: Anomaly

**Playwright Automation Notes:**
- Story: Single insight card - HIGH priority anomaly
- Ensure all text is readable
- Show cluster badge at bottom
- Checkbox in unchecked state (to show UI element)

---

### 6. insight-cluster-example.png

- [ ] **Status:** Not captured
- [ ] **Priority:** MEDIUM (required for intelligence.md cluster explanation)

**What to show:**
- Multiple insight cards (2-3 minimum) with SAME cluster badge
- Shows how related insights are grouped together
- Different priorities within the same cluster
- Cluster badge clearly visible on each card

**UI State Requirements:**
- 2-3 insight cards visible
- All cards have same cluster badge (e.g., "MT3 Level Requires Deep Review")
- Different priorities shown:
  - Card 1: HIGH priority (red)
  - Card 2: MEDIUM priority (yellow)
  - Card 3: LOW priority (green) - optional
- Mix of different types (Anomaly, Focus Area, Time Allocation)

**Key Elements to Highlight:**
- Cluster badge (same on all cards - visually connects them)
- Different priority badges (shows variety within cluster)
- Different categories (Location, Level, Time, etc.)
- Thematic connection in titles/descriptions

**Recommended Composition:**
- Cropping: `container` strategy - capture section showing 2-3 clustered cards
- Width: 800-1200px
- Height: Tall enough to show 2-3 full cards vertically

**Sample Data Requirements:**
- Cluster: "MT3 Level Requires Deep Review" (shared across all cards)
- Card 1 (HIGH - Anomaly - Level):
  - "MT3 driving center box inflation"
  - "64% vs. 35% expected..."
- Card 2 (MEDIUM - Focus Area - Tenure):
  - "New hires driving MT3 center box pattern"
  - "80% of MT3 employees with <1 year tenure..."
- Card 3 (LOW - Time Allocation - Time):
  - "Allocate 45 minutes for MT3 deep dive"
  - "Based on 45 affected employees..."

**Playwright Automation Notes:**
- Story: Clustered insights view
- Mock 2-3 insights with same cluster name
- Ensure cluster badges are visually identical
- Show priority variety (HIGH, MEDIUM, LOW)

---

### 7. data-overview-cards.png

- [ ] **Status:** Not captured
- [ ] **Priority:** HIGH (required for intelligence.md data overview section)

**What to show:**
- Three summary cards at top of Intelligence tab:
  1. **Quality Score card** - Score (e.g., 87), rating label (e.g., "Good"), health indicator
  2. **Anomaly Count card** - Total count with breakdown by severity (colored chips: 2 red, 5 yellow, 3 green)
  3. **Org Overview card** - Total employees, performance distribution, flagged employees, locations, levels

**UI State Requirements:**
- All three cards visible horizontally
- Cards showing realistic data
- Sufficient data to make cards informative

**Key Elements to Highlight:**
- Quality Score: Large number (e.g., 87) with rating label ("Good")
- Anomaly Count: Total number with colored severity chips (red/yellow/green)
- Org Overview: Multiple metrics displayed (employees, distribution, locations, levels)

**Recommended Composition:**
- Cropping: `container` strategy - capture all three cards in horizontal layout
- Width: 1200-1600px (wide enough for all three cards)
- Height: Single card height (~150-200px)

**Sample Data Requirements:**
- Quality Score: 87 (Good rating)
- Anomaly Count: 10 total (2 red critical, 5 yellow moderate, 3 green minor)
- Org Overview:
  - Total employees: 87
  - Performance distribution: High 12%, Medium 65%, Low 23%
  - Flagged employees: 5
  - Locations: 3
  - Job levels: 5

**Playwright Automation Notes:**
- Story: Intelligence summary cards
- Mock realistic calibration data
- Ensure all three cards visible in viewport
- Use colored chips for anomaly severity

---

### 8. intelligence-tab-overview.png

- [ ] **Status:** Not captured
- [ ] **Priority:** MEDIUM (required for intelligence.md complete layout reference)

**What to show:**
- Full Intelligence tab showing complete vertical layout:
  1. Data overview cards at top (3 cards horizontal)
  2. AI summary section below cards (Generate button OR expanded summary)
  3. Calibration insights section below summary (multiple insight cards)
  4. Statistical analyses sections at bottom (Location/Function/Level/Tenure accordion or sections)

**UI State Requirements:**
- Complete Intelligence tab view
- All major sections visible (may require tall screenshot or scrolling composite)
- Enough content to show hierarchy and organization
- AI summary either in "ready to generate" state OR expanded state

**Key Elements to Highlight:**
- Hierarchical layout (top to bottom):
  - Overview cards
  - AI summary
  - Insights
  - Statistical analyses
- Visual separation between sections
- Complete vertical flow of the tab

**Recommended Composition:**
- Cropping: `panel` or `full-page` strategy - capture entire Intelligence tab
- Width: 800-1200px (panel width)
- Height: TALL (1600-2400px or composite) - show all major sections
- May require scrolling capture or composite of multiple screenshots

**Sample Data Requirements:**
- All sections populated with realistic data
- AI summary generated (or ready to generate)
- 5-8 insights visible
- Statistical sections collapsed or showing summary

**Playwright Automation Notes:**
- Story: Intelligence tab complete view
- May require scroll capture or viewport height increase
- Ensure all major sections visible in single image
- Alternative: Create composite from multiple captures

**NOTE:** This screenshot is challenging due to vertical height. Consider:
1. Tall viewport screenshot (2400px height)
2. Composite image stitching multiple sections
3. Two separate screenshots: "Top half" and "Bottom half"

---

## Technical Specifications

**File Format:**
- PNG with alpha channel
- 24-bit RGB color depth
- Optimized compression (< 500KB per image if possible)

**Resolution:**
- 144 DPI (2x for retina displays)
- Adaptive viewport sizing based on content
- Minimum 10px padding on all sides

**Theme:**
- Dark mode ONLY
- Consistent with existing 9Boxer dark theme

**Naming Convention:**
- Use descriptive kebab-case names
- Format: `[feature]-[state]-[detail].png`
- Examples match the names above

**Storage Location:**
- `resources/user-guide/docs/images/screenshots/intelligence/`
- Create subdirectory if it doesn't exist

---

## Accessibility Requirements

Every screenshot MUST include descriptive alt text when referenced in documentation:

**Format:**
```markdown
![Descriptive alt text explaining what's shown](path/to/screenshot.png)
```

**Alt text guidelines:**
- Describe what's visible (not just "screenshot")
- Include key information shown in the image
- Mention annotations or highlights if added
- Keep under 150 characters when possible

**Examples:**
```markdown
![Intelligence tab with Generate AI Summary button prominently displayed, showing data overview cards at top](images/screenshots/intelligence/ai-summary-generate-button.png)

![Expanded AI summary showing 2-3 paragraphs of analysis with Powered by Claude badge and Show Less/Refresh buttons](images/screenshots/intelligence/ai-summary-expanded.png)

![Calibration insights section displaying multiple insight cards with priority filter pills, Select All button, and mix of HIGH/MEDIUM/LOW priority badges](images/screenshots/intelligence/calibration-insights-section.png)
```

---

## Screenshot Automation Workflow

**Prerequisites:**
1. Read `frontend/playwright/screenshots/HOWTO.md` for complete automation guide
2. Review `frontend/playwright/screenshots/config.ts` for screenshot registry
3. Ensure Storybook stories are tagged correctly with `tags: ["screenshot"]`

**Steps:**

### 1. Create Storybook Stories (if needed)

If stories don't exist for these UI states, create them:
- `IntelligenceSummary.stories.tsx` - Data overview cards
- `AISummaryDisplay.stories.tsx` - AI summary states
- `CalibrationInsightsSection.stories.tsx` - Insights section
- `InsightCard.stories.tsx` - Individual insight card

Each story must include:
```typescript
export const StoryName: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: 'unique-id' },
  },
  args: { /* story data */ },
};
```

### 2. Register Screenshots in config.ts

Add entries to `frontend/playwright/screenshots/config.ts`:

```typescript
{
  id: 'ai-summary-generate-button',
  source: { type: 'storybook', storyId: 'intelligence-summary-initial' },
  workflow: 'intelligence-tab',
  cropping: 'panel',
  dimensions: { minWidth: 800, maxWidth: 1200 },
  output: 'intelligence/ai-summary-generate-button.png',
  caption: 'Intelligence tab with Generate AI Summary button',
  quality: 'needs-capture',
},
// ... repeat for all 8 screenshots
```

### 3. Generate Screenshots

```bash
cd frontend
npm run screenshots:generate intelligence-tab
```

### 4. Validate Quality

Check generated screenshots meet standards:
- [ ] Dark mode theme applied
- [ ] Adaptive viewport (not excessive whitespace)
- [ ] 10px padding on all sides
- [ ] Focused framing (only necessary content)
- [ ] Clear, readable text
- [ ] File size optimized (< 500KB)

### 5. Visual Regression Baseline

After approving screenshots:
```bash
npm run test:docs-visual:update
```

This creates baselines for automated quality validation.

---

## Quality Checklist

Before marking a screenshot as complete:

- [ ] **Dark mode** - Screenshot uses dark theme
- [ ] **Adaptive sizing** - Width/height fit content (not excessive whitespace)
- [ ] **Padding** - 10px padding on all sides
- [ ] **Focus** - Shows only necessary content for understanding
- [ ] **Clarity** - Text is readable, UI elements are clear
- [ ] **Caption** - Descriptive purpose documented in config.ts
- [ ] **Sample data** - Uses realistic but anonymized data
- [ ] **File format** - PNG with alpha channel, 24-bit RGB
- [ ] **File size** - Optimized (< 500KB if possible)
- [ ] **Alt text** - Descriptive alt text prepared for documentation
- [ ] **Automation** - Generated via Playwright (not manual capture)
- [ ] **Baseline** - Visual regression baseline created

---

## Screenshot Status Summary

| # | Filename | Priority | Status | Notes |
|---|----------|----------|--------|-------|
| 1 | ai-summary-generate-button.png | HIGH | ⏳ Not captured | Initial state, button prominent |
| 2 | ai-summary-expanded.png | HIGH | ⏳ Not captured | Full summary with 2-3 paragraphs |
| 3 | ai-summary-preview.png | LOW | ⏳ Optional | Collapsed state (may skip) |
| 4 | calibration-insights-section.png | HIGH | ⏳ Not captured | Multiple insights with filters |
| 5 | insight-card-detail.png | HIGH | ⏳ Not captured | Single card showing all elements |
| 6 | insight-cluster-example.png | MEDIUM | ⏳ Not captured | 2-3 cards with same cluster |
| 7 | data-overview-cards.png | HIGH | ⏳ Not captured | 3 summary cards horizontal |
| 8 | intelligence-tab-overview.png | MEDIUM | ⏳ Not captured | Complete vertical layout (tall) |

**Progress:** 0 of 8 captured (0 of 7 if skipping #3)

---

## Next Steps

1. **Create Storybook stories** for any missing UI states
2. **Tag stories** with `tags: ["screenshot"]` and screenshot parameters
3. **Register in config.ts** with cropping strategies and dimensions
4. **Generate screenshots** using Playwright automation
5. **Validate quality** against standards in this document
6. **Update baselines** for visual regression testing
7. **Reference in documentation** with descriptive alt text

---

**Document created:** 2026-01-03
**Feature:** AI Calibration Intelligence
**Documentation phase:** Phase 4 (Screenshots)
**Automation guide:** `frontend/playwright/screenshots/HOWTO.md`
**Screenshot config:** `frontend/playwright/screenshots/config.ts`
