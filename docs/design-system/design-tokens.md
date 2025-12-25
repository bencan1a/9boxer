# Design Tokens Reference

Design tokens are the foundational design decisions of the 9Boxer application, centralized in `frontend/src/theme/tokens.ts`. They ensure visual consistency and make theme changes easier.

## Table of Contents

- [Overview](#overview)
- [Token Categories](#token-categories)
  - [Colors](#colors)
  - [Spacing](#spacing)
  - [Dimensions](#dimensions)
  - [Opacity](#opacity)
  - [Z-Index](#z-index)
  - [Animation](#animation)
  - [Border Radius](#border-radius)
  - [Shadows](#shadows)
  - [Typography](#typography)
  - [Breakpoints](#breakpoints)
- [Usage Guidelines](#usage-guidelines)
- [Migration Guide](#migration-guide)
- [Light/Dark Mode Colors](#lightdark-mode-colors)

---

## Overview

**Design tokens are the single source of truth for design values.**

```typescript
import { tokens } from '@/theme/tokens';
import { useTheme } from '@mui/material/styles';

// Access tokens directly
<Box sx={{ padding: tokens.spacing.md }} />

// Or via theme (includes tokens + MUI palette)
const theme = useTheme();
<Box sx={{ padding: theme.tokens.spacing.md }} />
```

**Benefits:**
- ✅ Centralized design decisions
- ✅ Easy theme customization
- ✅ Consistent light/dark mode support
- ✅ Type-safe token access
- ✅ Searchable and refactorable

---

## Token Categories

### Colors

All color values support both light and dark modes.

#### Primary Colors (Blue)

Brand color for primary actions and highlights.

```typescript
// In theme configuration
theme.palette.primary.main    // #1976d2 (light) / #90caf9 (dark)
theme.palette.primary.light   // #42a5f5 (light) / #b3d9f7 (dark)
theme.palette.primary.dark    // #1565c0 (light) / #6ba6d6 (dark)
```

**Usage:**
- Primary buttons
- Active navigation items
- Links
- Focus states

#### Secondary Colors (Orange)

Accent color for secondary actions.

```typescript
theme.palette.secondary.main  // #ff9800 (light) / #ffb74d (dark)
theme.palette.secondary.light // #ffb74d (light) / #ffd180 (dark)
theme.palette.secondary.dark  // #f57c00 (light) / #ff9800 (dark)
```

**Usage:**
- Secondary buttons
- Accent elements
- Highlights

#### Semantic Colors (Status Indicators)

Traffic light system for status and feedback.

```typescript
tokens.colors.semantic.success  // #4caf50 (Green)
tokens.colors.semantic.warning  // #ff9800 (Orange)
tokens.colors.semantic.error    // #f44336 (Red)
tokens.colors.semantic.info     // #1976d2 (Blue)
```

**Usage:**
- Success messages → Green
- Warnings/caution → Orange
- Errors/critical → Red
- Informational → Blue

**Example:**
```tsx
<Alert severity="success" sx={{ color: tokens.colors.semantic.success }}>
  Employee saved successfully
</Alert>
```

#### Grid Box Colors

Semantic colors for 9-box grid positions.

```typescript
theme.palette.gridBox.highPerformer   // #d4c4e8 (light) / #4a3a5c (dark)
theme.palette.gridBox.needsAttention  // #ffc9c9 (light) / #5c3a3a (dark)
theme.palette.gridBox.solidPerformer  // #c4e5d0 (light) / #3a5c4a (dark)
theme.palette.gridBox.development     // #fff0c0 (light) / #5c5a3a (dark)
```

**Mapping:**
- **High Performer** (Purple): Positions 6, 8, 9 (M-H, H-H, H-M)
- **Needs Attention** (Red): Positions 1, 2, 4 (L-L, M-L, L-M)
- **Solid Performer** (Green): Position 5 (M-M)
- **Development** (Yellow): Positions 3, 7 (H-L, L-H)

#### Chart Colors

Colors for data visualization (Recharts).

```typescript
theme.palette.charts.background  // #ffffff (light) / #1e1e1e (dark)
theme.palette.charts.gridLines   // #e0e0e0 (light) / rgba(255,255,255,0.12) (dark)
theme.palette.charts.tooltip     // #ffffff (light) / #2c2c2c (dark)
```

#### Background & Text Colors

```typescript
theme.palette.background.default  // #fafafa (light) / #121212 (dark)
theme.palette.background.paper    // #ffffff (light) / #1e1e1e (dark)

theme.palette.text.primary   // rgba(0,0,0,0.87) (light) / rgba(255,255,255,0.87) (dark)
theme.palette.text.secondary // rgba(0,0,0,0.60) (light) / rgba(255,255,255,0.60) (dark)
theme.palette.text.disabled  // rgba(0,0,0,0.38) (light) / rgba(255,255,255,0.38) (dark)
```

---

### Spacing

8px base grid for consistent spacing.

| Token | Value | Usage |
|-------|-------|-------|
| `tokens.spacing.xs` | 4px | Tight spacing between related elements |
| `tokens.spacing.sm` | 8px | Small gaps, list item padding |
| `tokens.spacing.md` | 16px | Standard component padding (default) |
| `tokens.spacing.lg` | 24px | Section separation |
| `tokens.spacing.xl` | 32px | Large section separation |
| `tokens.spacing.xxl` | 48px | Page-level margins |

**Example:**
```tsx
// ❌ Wrong - hardcoded values
<Box sx={{ padding: '16px', margin: '24px' }} />

// ✅ Correct - use spacing tokens
<Box sx={{
  padding: tokens.spacing.md,
  margin: tokens.spacing.lg,
}} />

// ✅ Also correct - use MUI spacing function
<Box sx={{
  padding: 2,  // 2 * 8px = 16px (equivalent to tokens.spacing.md)
  margin: 3,   // 3 * 8px = 24px (equivalent to tokens.spacing.lg)
}} />
```

---

### Dimensions

Component-specific size constants.

#### Grid Box Dimensions

```typescript
tokens.dimensions.gridBox.collapsedMin       // 60px
tokens.dimensions.gridBox.collapsedMax       // 80px
tokens.dimensions.gridBox.normalMin          // 150px
tokens.dimensions.gridBox.normalMax          // 400px
tokens.dimensions.gridBox.expandedMin        // 200px
tokens.dimensions.gridBox.expandedViewportOffset  // 250px
```

**Usage in GridBox:**
```tsx
const styles = {
  minHeight: tokens.dimensions.gridBox.collapsedMin,
  maxHeight: tokens.dimensions.gridBox.collapsedMax,
};
```

#### Panel Dimensions

```typescript
tokens.dimensions.panel.minWidth      // 320px
tokens.dimensions.panel.maxWidth      // 600px
tokens.dimensions.panel.defaultWidth  // 400px
```

#### Employee Tile Dimensions

```typescript
tokens.dimensions.employeeTile.height   // 56px
tokens.dimensions.employeeTile.spacing  // 8px
```

#### Scrollbar Dimensions

```typescript
tokens.dimensions.scrollbar.width               // 12px
tokens.dimensions.scrollbar.height              // 12px
tokens.dimensions.scrollbar.thumbBorderRadius   // 6px
tokens.dimensions.scrollbar.thumbBorderWidth    // 3px
```

---

### Opacity

Consistent transparency levels.

| Token | Value | Usage |
|-------|-------|-------|
| `tokens.opacity.disabled` | 0.38 | Disabled elements (MUI standard) |
| `tokens.opacity.inactive` | 0.6 | Inactive/idle interactive elements |
| `tokens.opacity.hover` | 0.7 | Hover states |
| `tokens.opacity.active` | 1 | Active/focused states |

**Grid-specific opacity:**
```typescript
tokens.opacity.gridCollapsedIdle      // 0.7
tokens.opacity.gridCollapsedDragOver  // 1
tokens.opacity.gridExpandButtonIdle   // 0.6
tokens.opacity.gridExpandButtonActive // 1
```

**Example:**
```tsx
<IconButton
  sx={{
    opacity: tokens.opacity.inactive,
    '&:hover': { opacity: tokens.opacity.hover },
  }}
/>
```

---

### Z-Index

Layering hierarchy for overlapping elements.

| Token | Value | Usage |
|-------|-------|-------|
| `tokens.zIndex.base` | 0 | Base layer |
| `tokens.zIndex.dropdown` | 1000 | Dropdown menus |
| `tokens.zIndex.sticky` | 1100 | Sticky headers |
| `tokens.zIndex.modal` | 1300 | Modal dialogs (MUI default) |
| `tokens.zIndex.popover` | 1400 | Popovers |
| `tokens.zIndex.tooltip` | 1500 | Tooltips (highest) |

**Example:**
```tsx
<Box sx={{ position: 'fixed', zIndex: tokens.zIndex.dropdown }} />
```

---

### Animation

Consistent timing for transitions.

#### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `tokens.duration.instant` | 0s | No animation |
| `tokens.duration.fast` | 0.15s | Micro-interactions (hover, focus) |
| `tokens.duration.normal` | 0.3s | Standard transitions (panel slide, modal) |
| `tokens.duration.slow` | 0.5s | Large movements (page transitions) |

#### Easing Functions

```typescript
tokens.easing.easeInOut  // "ease-in-out" (default)
tokens.easing.easeOut    // "ease-out"
tokens.easing.easeIn     // "ease-in"
tokens.easing.linear     // "linear"
```

**Example:**
```tsx
<Box sx={{
  transition: `opacity ${tokens.duration.normal} ${tokens.easing.easeInOut}`,
}} />
```

---

### Border Radius

Consistent corner rounding.

| Token | Value | Usage |
|-------|-------|-------|
| `tokens.radius.none` | 0 | Sharp corners |
| `tokens.radius.sm` | 4px | Subtle rounding |
| `tokens.radius.md` | 8px | Standard (MUI default) |
| `tokens.radius.lg` | 12px | Prominent rounding |
| `tokens.radius.xl` | 16px | Extra rounded |
| `tokens.radius.round` | 50% | Circular (avatars, badges) |

**Example:**
```tsx
<Card sx={{ borderRadius: tokens.radius.md }} />
```

---

### Shadows

Elevation levels for depth perception.

```typescript
tokens.shadows.card      // Subtle elevation (cards, panels)
tokens.shadows.elevated  // Medium elevation (raised elements)
tokens.shadows.dropdown  // High elevation (floating menus)
```

Each shadow has light/dark variants:
```typescript
tokens.shadows.card.light  // "0 2px 8px rgba(0,0,0,0.1)"
tokens.shadows.card.dark   // "0 2px 8px rgba(0,0,0,0.3)"
```

**Example:**
```tsx
const theme = useTheme();
<Box sx={{
  boxShadow: theme.palette.mode === 'light'
    ? tokens.shadows.elevated.light
    : tokens.shadows.elevated.dark
}} />
```

---

### Typography

Font settings for text elements.

#### Font Family

```typescript
tokens.typography.fontFamily
// "Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif"
```

#### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `tokens.typography.fontSize.h1` | 2.5rem (40px) | Page titles |
| `tokens.typography.fontSize.h2` | 2rem (32px) | Section headings |
| `tokens.typography.fontSize.h3` | 1.75rem (28px) | Subsection headings |
| `tokens.typography.fontSize.h4` | 1.5rem (24px) | Component headings |
| `tokens.typography.fontSize.h5` | 1.25rem (20px) | Small headings |
| `tokens.typography.fontSize.h6` | 1rem (16px) | Tiny headings |
| `tokens.typography.fontSize.body1` | 1rem (16px) | Primary text |
| `tokens.typography.fontSize.body2` | 0.875rem (14px) | Secondary text |
| `tokens.typography.fontSize.caption` | 0.75rem (12px) | Captions, hints |

#### Font Weights

```typescript
tokens.typography.fontWeight.light     // 300
tokens.typography.fontWeight.regular   // 400
tokens.typography.fontWeight.medium    // 500
tokens.typography.fontWeight.semiBold  // 600
tokens.typography.fontWeight.bold      // 700
```

#### Line Heights

```typescript
tokens.typography.lineHeight.tight    // 1.2
tokens.typography.lineHeight.normal   // 1.5
tokens.typography.lineHeight.relaxed  // 1.75
```

**Example:**
```tsx
<Typography
  sx={{
    fontSize: tokens.typography.fontSize.h3,
    fontWeight: tokens.typography.fontWeight.medium,
    lineHeight: tokens.typography.lineHeight.normal,
  }}
>
  Heading
</Typography>
```

---

### Breakpoints

Responsive design breakpoints (for future web deployment).

| Token | Value | Device |
|-------|-------|--------|
| `tokens.breakpoints.xs` | 0px | Extra small |
| `tokens.breakpoints.sm` | 600px | Small (mobile) |
| `tokens.breakpoints.md` | 900px | Medium (tablet) |
| `tokens.breakpoints.lg` | 1200px | Large (desktop) |
| `tokens.breakpoints.xl` | 1536px | Extra large |

---

## Usage Guidelines

### General Principles

1. **ALWAYS use tokens instead of hardcoded values**
   ```tsx
   // ❌ Wrong
   <Box sx={{ padding: '16px', color: '#1976d2' }} />

   // ✅ Correct
   <Box sx={{
     padding: tokens.spacing.md,
     color: theme.palette.primary.main,
   }} />
   ```

2. **Access colors via theme.palette, other tokens via theme.tokens**
   ```tsx
   const theme = useTheme();

   // Colors → theme.palette
   theme.palette.primary.main
   theme.palette.gridBox.highPerformer

   // Other tokens → theme.tokens
   theme.tokens.spacing.md
   theme.tokens.duration.normal
   ```

3. **Never use arbitrary values**
   ```tsx
   // ❌ Wrong - arbitrary 13px spacing
   <Box sx={{ padding: '13px' }} />

   // ✅ Correct - use defined spacing scale
   <Box sx={{ padding: tokens.spacing.md }} />  // 16px
   ```

### Component-Specific Patterns

#### Cards & Panels

```tsx
<Card sx={{
  padding: tokens.spacing.lg,
  borderRadius: tokens.radius.md,
  boxShadow: theme.palette.mode === 'light'
    ? tokens.shadows.card.light
    : tokens.shadows.card.dark,
}} />
```

#### Buttons

```tsx
<Button sx={{
  fontWeight: tokens.typography.fontWeight.medium,
  borderRadius: tokens.radius.sm,
  transition: `all ${tokens.duration.fast} ${tokens.easing.easeInOut}`,
}} />
```

#### Animations

```tsx
<Box sx={{
  transition: `opacity ${tokens.duration.normal} ${tokens.easing.easeInOut}`,
  '&:hover': {
    opacity: tokens.opacity.hover,
  },
}} />
```

---

## Migration Guide

### Converting Hardcoded Values to Tokens

**Step 1: Identify hardcoded values**
```bash
# Search for hardcoded colors
grep -r "#[0-9a-fA-F]\{6\}" frontend/src/components/

# Search for hardcoded pixel values
grep -r "[0-9]\+px" frontend/src/components/
```

**Step 2: Replace with tokens**

| Hardcoded Value | Replace With |
|----------------|--------------|
| `#1976d2` | `theme.palette.primary.main` |
| `#4caf50` | `tokens.colors.semantic.success` |
| `4px` | `tokens.spacing.xs` |
| `8px` | `tokens.spacing.sm` |
| `16px` | `tokens.spacing.md` |
| `24px` | `tokens.spacing.lg` |
| `0.3s` | `tokens.duration.normal` |
| `0.6` (opacity) | `tokens.opacity.inactive` |
| `8` (border radius) | `tokens.radius.md` |

**Step 3: Test in both light and dark modes**

```tsx
// Before testing
import { useTheme } from '@mui/material/styles';

// Toggle theme mode in app
const { mode, setMode } = useUIStore();
setMode(mode === 'light' ? 'dark' : 'light');
```

**Step 4: Verify no visual regressions**

---

## Light/Dark Mode Colors

### Primary Colors

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Primary Main | `#1976d2` | `#90caf9` |
| Primary Light | `#42a5f5` | `#b3d9f7` |
| Primary Dark | `#1565c0` | `#6ba6d6` |

### Secondary Colors

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Secondary Main | `#ff9800` | `#ffb74d` |
| Secondary Light | `#ffb74d` | `#ffd180` |
| Secondary Dark | `#f57c00` | `#ff9800` |

### Semantic Colors

| Status | Color | Hex |
|--------|-------|-----|
| Success | Green | `#4caf50` |
| Warning | Orange | `#ff9800` |
| Error | Red | `#f44336` |
| Info | Blue | `#1976d2` |

**Note:** Semantic colors are the same in both modes for consistency.

### Grid Box Colors

| Position Type | Light Mode | Dark Mode |
|--------------|-----------|-----------|
| High Performer (Purple) | `#d4c4e8` | `#4a3a5c` |
| Needs Attention (Red) | `#ffc9c9` | `#5c3a3a` |
| Solid Performer (Green) | `#c4e5d0` | `#3a5c4a` |
| Development (Yellow) | `#fff0c0` | `#5c5a3a` |

### Background & Surface Colors

| Surface | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background Default | `#fafafa` | `#121212` (MD3 standard) |
| Background Paper | `#ffffff` | `#1e1e1e` |

### Text Colors (WCAG AA Compliant)

| Text Type | Light Mode | Dark Mode |
|-----------|-----------|-----------|
| Primary | `rgba(0,0,0,0.87)` | `rgba(255,255,255,0.87)` |
| Secondary | `rgba(0,0,0,0.60)` | `rgba(255,255,255,0.60)` |
| Disabled | `rgba(0,0,0,0.38)` | `rgba(255,255,255,0.38)` |

---

## Related Documentation

- [Design Principles](design-principles.md) - Core UX philosophy
- [Component Guidelines](component-guidelines.md) - Component usage patterns
- [Accessibility Standards](accessibility-standards.md) - WCAG compliance
- [tokens.ts](../../frontend/src/theme/tokens.ts) - Token source code
- [theme.ts](../../frontend/src/theme/theme.ts) - Theme configuration
