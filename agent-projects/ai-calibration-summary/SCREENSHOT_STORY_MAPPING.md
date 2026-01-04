# Screenshot-to-Story Mapping

## Documentation Screenshot Requirements vs. Existing Stories

Based on research of existing Storybook stories and the SCREENSHOT_REQUIREMENTS.md, here's the mapping of required screenshots to stories:

---

## ✅ SCREENSHOTS WITH EXISTING STORIES (3/8)

### 1. insight-card-detail.png
**Required Story:** ✅ EXISTS
**Story File:** `frontend/src/components/intelligence/InsightCard.stories.tsx`
**Story to Use:** `HighPrioritySelected`
**Story ID:** `app-right-panel-intelligence-insightcard--high-priority-selected`
**What It Shows:**
- Single insight card with HIGH priority badge (red)
- Level category icon (groups)
- Title: "MT3 driving center box inflation"
- Description: 2-3 sentences
- Affected count: "45 employees affected"
- Cluster badge: "MT3 Level Requires Deep Review"

**Action Required:** Add screenshot metadata to existing story

---

### 2. data-overview-cards.png
**Required Story:** ✅ EXISTS
**Story File:** `frontend/src/components/intelligence/IntelligenceSummary.stories.tsx`
**Story to Use:** `Default` or `GoodQuality`
**Story ID:** `app-right-panel-intelligence-intelligencesummary--default`
**What It Shows:**
- Three summary cards horizontally:
  - Quality Score: 87 (Good)
  - Anomaly Count: 2 red, 5 yellow, 3 green chips
  - Org Overview: Employees, performance distribution

**Action Required:** Add screenshot metadata to existing story

---

### 3. ai-summary-generate-button.png
**Required Story:** ✅ EXISTS
**Story File:** `frontend/src/components/intelligence/CalibrationSummarySection.stories.tsx`
**Story to Use:** `Default` (before AI summary generated)
**Story ID:** `app-right-panel-intelligence-calibrationsummarysection--default`
**What It Shows:**
- CalibrationSummarySection component
- "Generate AI Summary" button prominently visible
- Data overview cards at top
- No AI summary text yet

**Action Required:** Verify story shows button state correctly, add screenshot metadata

---

## ❌ SCREENSHOTS REQUIRING NEW STORIES (5/8)

### 4. ai-summary-expanded.png
**Required Story:** ❌ MISSING - Need to create
**Story File to Create:** `frontend/src/components/intelligence/AISummaryDisplay.stories.tsx`
**Story to Create:** `ExpandedWithSummary`
**What It Needs:**
- AISummaryDisplay component with full 2-3 paragraph AI summary
- "Powered by Claude" badge visible
- "Show Less" and "Refresh" buttons
- Expanded state (not collapsed)

**Mock Data Required:**
```typescript
const mockLongSummary = `Your calibration data shows a clear pattern: MT3 level is driving your center box inflation, with 64% of employees rated in the middle vs. 35% expected. Within MT3, new hires (< 1 year tenure) are particularly concentrated in the center box at 80% vs. 41% company average.

This pattern suggests recent hiring growth at MT3 may be creating rating conservatism. New managers may be reluctant to differentiate their new team members, or insufficient performance data may be limiting confident assessments.

For your calibration meeting, allocate 45 minutes to deep-dive MT3 ratings. Focus discussion on: (1) whether new hire conservatism is justified, (2) if tenured MT3s show better differentiation, and (3) whether you need adjusted expectations for new hire assessment timelines.`;
```

**Component:** AISummaryDisplay.tsx
**Priority:** HIGH

---

### 5. ai-summary-preview.png (OPTIONAL)
**Required Story:** ❌ MISSING - Need to create
**Story File to Create:** `frontend/src/components/intelligence/AISummaryDisplay.stories.tsx`
**Story to Create:** `CollapsedPreview`
**What It Needs:**
- AISummaryDisplay component with summary text truncated to 3 lines
- "Show More" button visible
- Collapsed state

**Mock Data Required:** Same as above, but displayed in collapsed state

**Component:** AISummaryDisplay.tsx
**Priority:** LOW (nice to have, but can skip if needed)

---

### 6. calibration-insights-section.png
**Required Story:** ❌ MISSING - Need to create
**Story File to Create:** `frontend/src/components/intelligence/MeetingInsightsSection.stories.tsx`
**Story to Create:** `WithMultiplePriorities`
**What It Needs:**
- MeetingInsightsSection component showing full insights list
- Priority filter buttons visible (All, High, Medium, Low)
- "Select All" / "Deselect All" buttons visible
- Mix of HIGH, MEDIUM, LOW priority insights (6-8 total)
- Some insights selected (checkboxes checked)
- Multiple cluster badges visible

**Mock Data Required:**
```typescript
const mockInsights: Insight[] = [
  {
    id: "ins-1",
    type: "anomaly",
    priority: "high",
    category: "level",
    title: "MT3 driving center box inflation",
    description: "MT3 level has 64% in center box vs. 35% expected (p<0.001, z-score 3.2). This represents 45 employees and is statistically significant. Consider deep-dive discussion on MT3 rating patterns.",
    affectedCount: 45,
    cluster: "MT3 Level Requires Deep Review",
    sourceData: { /* ... */ }
  },
  {
    id: "ins-2",
    type: "anomaly",
    priority: "medium",
    category: "tenure",
    title: "New hires driving MT3 center box pattern",
    description: "New hires (< 1 year) at MT3 are 80% in center box vs. 41% company average (p<0.01). This affects 28 employees. New manager conservatism may be contributing.",
    affectedCount: 28,
    cluster: "MT3 Level Requires Deep Review",
    sourceData: { /* ... */ }
  },
  {
    id: "ins-3",
    type: "recommendation",
    priority: "high",
    category: "distribution",
    title: "Run Donut Mode to increase differentiation",
    description: "Current distribution shows 52% in center box, above 45% threshold. Donut Mode exercise can help managers differentiate. Run for 10-15 minutes before level-specific discussions.",
    affectedCount: 0,
    cluster: null,
    sourceData: { /* ... */ }
  },
  {
    id: "ins-4",
    type: "time",
    priority: "low",
    category: "time",
    title: "Allocate 45 minutes for MT3 deep dive",
    description: "Based on 45 affected employees and complexity of tenure patterns, recommend 45-minute focused discussion. Schedule after IC calibration for context.",
    affectedCount: 45,
    cluster: "MT3 Level Requires Deep Review",
    sourceData: { /* ... */ }
  },
  // Add 2-4 more insights for visual richness
];
```

**Component:** MeetingInsightsSection.tsx
**Priority:** HIGH

---

### 7. insight-cluster-example.png
**Required Story:** ❌ MISSING - Could enhance existing story
**Story File to Enhance:** `frontend/src/components/intelligence/InsightCard.stories.tsx`
**Story to Create:** `InsightListWithClusters`
**What It Needs:**
- Multiple InsightCard components (2-3) rendered in a list
- All cards have the SAME cluster badge ("MT3 Level Requires Deep Review")
- Different priorities (HIGH, MEDIUM, LOW)
- Shows how clustering groups related issues

**Alternative Approach:**
Could also be covered by the MeetingInsightsSection story if it shows cluster grouping clearly enough.

**Priority:** MEDIUM (can potentially reuse MeetingInsightsSection story)

---

### 8. intelligence-tab-overview.png
**Required Story:** ❌ MISSING - Complex full-tab view
**Story File to Create (Option A):** `frontend/src/components/panel/IntelligenceTab.stories.tsx`
**Story to Create:** `WithAISummary`
**What It Needs:**
- Full IntelligenceTab component showing complete layout:
  - Data overview cards at top
  - AI summary section (expanded)
  - Calibration insights section below summary
  - Statistical analyses (location/function/level/tenure) at bottom
- This is a TALL screenshot, may need scrolling/composite

**Alternative (Option B):** Use full-app screenshot approach
- Simpler: Use existing `intelligence.ts` workflow
- Slower: Requires full app startup
- May be more realistic: Shows actual tab in context

**Recommended:** Create IntelligenceTab.stories.tsx for long-term maintainability, but use full-app approach for this initial screenshot if time-constrained.

**Priority:** MEDIUM (can use full-app workflow as fallback)

---

## 📦 SUPPORTING COMPONENT: ClusterBadge

### ClusterBadge.stories.tsx
**Required Story:** ❌ MISSING - Nice to have
**Story File to Create:** `frontend/src/components/intelligence/ClusterBadge.stories.tsx`
**Stories to Create:**
- `Default` - Standard cluster badge
- `LongTitle` - Edge case with long cluster name
- `NoIcon` - Without icon (if supported)

**What It Needs:**
```typescript
export const Default: Story = {
  args: {
    cluster: "MT3 Level Requires Deep Review"
  }
};

export const LongTitle: Story = {
  args: {
    cluster: "New Hire Performance Assessment Timeline and Expectations Review"
  }
};
```

**Priority:** LOW (ClusterBadge is small component shown in context of InsightCard, not standalone screenshot)

---

## 📋 SUMMARY

### Story Creation Priority

**High Priority (Must Create):**
1. ✅ **AISummaryDisplay.stories.tsx** - Required for 2 screenshots
   - `ExpandedWithSummary` story
   - `CollapsedPreview` story (optional)

2. ✅ **MeetingInsightsSection.stories.tsx** - Required for 2 screenshots
   - `WithMultiplePriorities` story (covers #4 and possibly #7)

**Medium Priority (Recommended):**
3. ⚠️ **IntelligenceTab.stories.tsx** - Required for full-tab overview
   - `WithAISummary` story
   - Alternative: Use full-app screenshot workflow

**Low Priority (Nice to Have):**
4. ℹ️ **ClusterBadge.stories.tsx** - Small component, shown in context
   - `Default` story
   - `LongTitle` story

### Screenshot Metadata Updates

**Existing Stories to Tag:**
1. `InsightCard.stories.tsx` → Add `tags: ["screenshot"]` to `HighPrioritySelected`
2. `IntelligenceSummary.stories.tsx` → Add screenshot metadata to `Default` or `GoodQuality`
3. `CalibrationSummarySection.stories.tsx` → Add screenshot metadata to `Default`

**New Stories to Create with Screenshot Tags:**
1. `AISummaryDisplay.stories.tsx` → All stories tagged for screenshots
2. `MeetingInsightsSection.stories.tsx` → Primary story tagged
3. `IntelligenceTab.stories.tsx` (optional) → Tagged if created

---

## 🎯 IMPLEMENTATION PLAN

### Step 1: Create Missing Story Files (3 files)
1. Create `AISummaryDisplay.stories.tsx` with 2 stories
2. Create `MeetingInsightsSection.stories.tsx` with 1-2 stories
3. (Optional) Create `ClusterBadge.stories.tsx` with 2 stories

### Step 2: Add Screenshot Metadata to Existing Stories (3 stories)
1. Update `InsightCard.stories.tsx` → `HighPrioritySelected`
2. Update `IntelligenceSummary.stories.tsx` → `Default`
3. Update `CalibrationSummarySection.stories.tsx` → `Default`

### Step 3: Update Screenshot Configuration
1. Edit `frontend/playwright/screenshots/config.ts`
2. Add 8 new screenshot entries with metadata:
   - `source: "storybook"`
   - `workflow: "intelligence-storybook"`
   - `storyId: "app-right-panel-intelligence-componentname--storyname"`
   - `path: "intelligence/screenshot-name.png"`
   - `cropping: "element"` or `"container"`

### Step 4: Create Workflow Functions (if needed)
1. Edit `frontend/playwright/screenshots/workflows/intelligence-storybook.ts`
2. Add capture functions for new screenshots
3. Follow existing pattern (biasDetectorLocation, etc.)

### Step 5: Generate Screenshots
```bash
npm run storybook                          # Start Storybook server
npm run screenshots:generate               # Generate all screenshots
# or specific ones:
npm run screenshots:generate ai-summary-expanded calibration-insights-section
```

### Step 6: Validation
1. Check output in `resources/user-guide/docs/images/screenshots/intelligence/`
2. Verify image quality and cropping
3. Update documentation placeholders with actual filenames
4. Run `npm run screenshots:metadata` to update component map

---

## 🗂️ FILE LOCATIONS REFERENCE

```
frontend/
├── src/components/intelligence/
│   ├── AISummaryDisplay.tsx (component exists)
│   ├── AISummaryDisplay.stories.tsx (❌ CREATE)
│   ├── MeetingInsightsSection.tsx (component exists)
│   ├── MeetingInsightsSection.stories.tsx (❌ CREATE)
│   ├── ClusterBadge.tsx (component exists)
│   ├── ClusterBadge.stories.tsx (❌ CREATE - optional)
│   ├── InsightCard.stories.tsx (✅ UPDATE)
│   ├── IntelligenceSummary.stories.tsx (✅ UPDATE)
│   └── CalibrationSummarySection.stories.tsx (✅ UPDATE)
├── src/components/panel/
│   ├── IntelligenceTab.tsx (component exists)
│   └── IntelligenceTab.stories.tsx (❌ CREATE - optional)
├── playwright/screenshots/
│   ├── config.ts (✅ UPDATE with new screenshot metadata)
│   └── workflows/
│       └── intelligence-storybook.ts (✅ UPDATE if needed)
└── src/mocks/
    └── mockIntelligence.ts (✅ may need to add mock data)
```

---

## ✅ NEXT STEPS

1. **Create mock data** for AI summaries and insights (if not in mockIntelligence.ts)
2. **Create 2 story files** (AISummaryDisplay, MeetingInsightsSection)
3. **Update 3 existing stories** with screenshot tags
4. **Update config.ts** with 8 screenshot entries
5. **Generate screenshots** via npm run
6. **Verify output** and update documentation

**Estimated Time:**
- Story creation: 30-45 minutes
- Screenshot config: 15 minutes
- Generation + validation: 15-20 minutes
- **Total: ~1-1.5 hours**
