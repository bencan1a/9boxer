# Storybook Organization Guide

## Overview

This document describes how Storybook stories are organized, tagged, and maintained in the 9Boxer project.

## Story Categories

Stories are organized into three main categories using a combination of **file-level tags** and **story-level tags**:

### 1. Screenshot Stories (`"screenshot"` tag)

Stories used for **documentation screenshot generation**.

- **Tag location**: Story-level only (not file-level)
- **Purpose**: Generate screenshots for user documentation
- **Identification**: Look for `tags: ["screenshot"]` on individual stories
- **Metadata**: Include `parameters: { screenshot: { enabled: true, id: 'screenshot-name' } }`

**Example:**
```typescript
export const Default: Story = {
  tags: ["screenshot"],  // Story-level tag
  parameters: {
    screenshot: { enabled: true, id: 'employee-tile-normal' },
  },
  args: { /* ... */ },
};
```

**Related files:**
- Screenshot config: [`playwright/screenshots/config.ts`](playwright/screenshots/config.ts)
- Validation script: [`scripts/validate-screenshot-tags.ts`](scripts/validate-screenshot-tags.ts)

### 2. Production Stories

Regular component documentation stories.

- **Tag location**: File-level `tags: ["autodocs"]`
- **Purpose**: Document component props, variants, and usage
- **Identification**: All stories without "screenshot" or "experimental" tags
- **Best practices**: Include JSDoc comments, comprehensive argTypes

### 3. Design System Stories

Foundation stories (colors, typography, spacing).

- **Location**: `src/stories/ThemeTest.stories.tsx`
- **Purpose**: Reference for designers and developers
- **Scope**: Tokens, theme configuration, design foundations

## Story Metadata System

### File-Level Tags (in `meta` object)

Applied to **all stories** in the file:

```typescript
const meta = {
  title: "Grid/EmployeeTile",
  tags: ["autodocs"],  // Applies to ALL stories in this file
  // ...
};
```

**Common file-level tags:**
- `["autodocs"]` - Enable automatic documentation generation

### Story-Level Tags (in individual stories)

Applied to **specific stories**:

```typescript
export const MyStory: Story = {
  tags: ["screenshot"],  // Applies ONLY to this story
  // ...
};
```

**Common story-level tags:**
- `["screenshot"]` - Used for screenshot generation (49 stories total)

### Story Parameters

Additional metadata for individual stories:

```typescript
export const MyStory: Story = {
  parameters: {
    screenshot: { enabled: true, id: 'unique-screenshot-id' },
    layout: "centered" | "fullscreen" | "padded",
    docs: {
      description: {
        story: "Detailed description of this specific story",
      },
    },
  },
};
```

## File Organization

Stories follow the component hierarchy:

```
src/components/
├── common/                    → Common/ComponentName
│   ├── EmptyState.tsx
│   └── EmptyState.stories.tsx → Story title: "Common/EmptyState"
│
├── grid/                      → Grid/ComponentName
│   ├── EmployeeTile.tsx
│   └── EmployeeTile.stories.tsx → Story title: "Grid/EmployeeTile"
│
├── dashboard/
│   ├── filters/               → Dashboard/Filters/ComponentName
│   │   └── FilterSection.stories.tsx → "Dashboard/Filters/FilterSection"
│   └── PureAppBar.stories.tsx → "Dashboard/PureAppBar"
│
└── ...
```

**Naming convention:**
- Title format: `"Category/Subcategory/ComponentName"` or `"Category/ComponentName"`
- Matches file path structure for easy navigation
- Story IDs auto-generated: `category-componentname--storyname`

## Story Naming Best Practices

### Story Export Names (PascalCase)

```typescript
export const Default: Story = { /* ... */ };
export const ModifiedNormalMode: Story = { /* ... */ };
export const WithFlags: Story = { /* ... */ };
```

### Story Display Names (optional override)

```typescript
export const ModifiedNormalMode: Story = {
  name: "Modified - Normal Mode",  // Override display name
  // ...
};
```

### Story Descriptions (JSDoc)

```typescript
/**
 * Default employee tile with complete data.
 * Shows standard appearance with all key information.
 */
export const Default: Story = { /* ... */ };
```

## Zoom Stories (Production Feature)

Zoom functionality is **production-ready** and requires validation stories in:

1. **EmployeeTile** - [`Grid/EmployeeTile → Zoom Levels`](src/components/grid/EmployeeTile.stories.tsx)
2. **GridBox** - Grid box with zoom testing
3. **NineBoxGrid** - Full grid zoom validation

**Zoom levels:**
- Level 0: Compact (60%)
- Level 1: Comfortable- (80%)
- Level 2: Normal (100%) - default
- Level 3: Comfortable+ (125%)
- Level 4: Presentation (150%)

## Screenshot Generation Workflow

1. **Stories are tagged** with `tags: ["screenshot"]` and `parameters.screenshot`
2. **Config references stories** in [`playwright/screenshots/config.ts`](playwright/screenshots/config.ts)
3. **Generator captures screenshots** via `npm run screenshots:generate`
4. **Screenshots saved** to `resources/user-guide/docs/images/screenshots/`

**Validation:**
```bash
npx tsx scripts/validate-screenshot-tags.ts
```

## Maintenance Scripts

### Analysis & Validation

- **`scripts/analyze-stories.ts`** - Identify incomplete/experimental stories
- **`scripts/validate-screenshot-tags.ts`** - Verify screenshot story tags
- **`scripts/add-screenshot-metadata.ts`** - Add metadata to screenshot stories

### Cleanup

- **`scripts/cleanup-duplicate-screenshot-params.ts`** - Remove duplicate metadata
- **`scripts/fix-screenshot-tags.ts`** - Move tags from file-level to story-level

## Component Story Requirements

### Minimal Story Requirements

Every production component should have:

1. **Default story** - Standard usage with typical props
2. **Screenshot story** (if used for docs) - Tagged and configured
3. **JSDoc documentation** - Describe what each story demonstrates
4. **Comprehensive argTypes** - Document all props with descriptions

### Example: EmployeeTile Stories

✅ **Current structure (5 stories):**

1. `Default` - Standard tile appearance
2. `ModifiedNormalMode` - Shows session modification + original location
3. `ModifiedDonutMode` - Shows donut mode modification
4. `WithFlags` - Demonstrates flag badge system
5. `ZoomLevels` - Interactive zoom testing (production feature)

**File size:** 332 lines (down from 900+)
**Stories:** 5 (down from 18)

## Story Cleanup History

### Phase 1: Metadata Organization
- ✅ Removed duplicate EmptyState components
- ✅ Added story-level `"screenshot"` tags (49 stories)
- ✅ Added `parameters.screenshot` metadata with IDs
- ✅ Enhanced screenshot config with documentation

### Phase 2: Experimental Story Cleanup
- ✅ Removed 7 OriginalPosition UI variant stories (design decision made)
- ✅ Removed experimental stories: LongName, WithAllFields, MinimalData, etc.
- ✅ Consolidated zoom stories (kept production-ready versions)
- ✅ Created clean EmployeeTile.stories.tsx (18 → 5 stories)

## Quick Reference

### Filter Stories in Storybook UI

1. Open Storybook: `npm run storybook`
2. Click filter dropdown
3. Select tag:
   - **screenshot** (49 stories) - Used for documentation screenshots
   - **autodocs** (all stories) - Has auto-generated documentation

### Find Screenshot Stories

```bash
# Search for screenshot tags
grep -r "tags:.*screenshot" src/**/*.stories.tsx

# Count screenshot stories
grep -r "screenshot: { enabled: true" src/**/*.stories.tsx | wc -l
```

### Verify Story Organization

```bash
# Run analysis script
npx tsx scripts/analyze-stories.ts

# Output: story-analysis-report.md
```

## Best Practices

### ✅ DO:
- Use story-level tags for screenshots (not file-level)
- Include JSDoc comments for all stories
- Keep story files co-located with components
- Use semantic story names (Default, WithFlags, ModifiedNormalMode)
- Add `parameters.screenshot` for all screenshot stories

### ❌ DON'T:
- Don't add `"screenshot"` to file-level tags (inflates filter count)
- Don't create temporary test stories without JSDoc
- Don't duplicate stories across files
- Don't use emoji in production story names (experimental only)

## References

- **Storybook Docs**: https://storybook.js.org/docs
- **Screenshot Config**: [`playwright/screenshots/config.ts`](playwright/screenshots/config.ts)
- **Story Analysis Report**: `story-analysis-report.md` (generated)
- **Scripts Directory**: [`frontend/scripts/`](scripts/)

---

**Last Updated:** 2025-12-31
**Total Stories:** ~438 across 57 files
**Screenshot Stories:** 49
**Production-Ready Zoom Stories:** 3 (EmployeeTile, GridBox, NineBoxGrid)
