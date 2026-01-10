/**
 * Design Tokens for 9Boxer
 *
 * This file contains all design constants used throughout the application.
 * Centralizing these values ensures consistency and makes theme changes easier.
 *
 * Usage:
 *   import { tokens } from '@/theme/tokens';
 *   <Box sx={{ padding: tokens.spacing.md }} />
 *
 * For colors, use theme.palette.* which references these tokens.
 * For other values, import tokens directly.
 */

/* eslint-disable no-restricted-syntax */
// This is the design system source of truth - hardcoded colors are required here
// All other files should reference theme.palette.* or theme.tokens.colors.*

/**
 * Color values for light and dark modes
 * These are referenced by the theme configuration
 */
export const colors = {
  // Primary colors (Blue)
  primary: {
    light: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    dark: {
      main: "#90caf9",
      light: "#b3d9f7",
      dark: "#6ba6d6",
    },
  },

  // Secondary colors (Orange)
  secondary: {
    light: {
      main: "#ff9800",
      light: "#ffb74d",
      dark: "#f57c00",
    },
    dark: {
      main: "#ffb74d",
      light: "#ffd180",
      dark: "#ff9800",
    },
  },

  // Background colors
  background: {
    light: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    dark: {
      default: "#121212", // Material Design 3 standard
      paper: "#1e1e1e",
    },
  },

  // Text colors (follows MUI accessibility standards)
  text: {
    light: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.60)",
      disabled: "rgba(0, 0, 0, 0.38)",
    },
    dark: {
      primary: "rgba(255, 255, 255, 0.87)",
      secondary: "rgba(255, 255, 255, 0.60)",
      disabled: "rgba(255, 255, 255, 0.38)",
    },
  },

  // Semantic colors for status indicators (traffic lights)
  // Used for alerts, notifications, and data visualization
  semantic: {
    success: "#4caf50", // Green - positive outcomes
    warning: "#ff9800", // Orange - caution/attention needed
    error: "#f44336", // Red - errors/issues
    info: "#1976d2", // Blue - informational
    donutMode: "#9c27b0", // Purple - donut mode modification indicator
  },

  // Selection colors for UI state indication
  selection: {
    light: {
      outline: "#1976d2", // Blue - selected employee indicator (primary.main)
      outlineWidth: 3, // Width of selection outline/glow in pixels
    },
    dark: {
      outline: "#90caf9", // Lighter blue for dark mode (primary.main in dark)
      outlineWidth: 3,
    },
  },

  // Grid box colors (9-box grid positions)
  gridBox: {
    light: {
      highPerformer: "#d4c4e8", // Purple tones
      needsAttention: "#ffc9c9", // Red tones
      solidPerformer: "#c4e5d0", // Green tones
      development: "#fff0c0", // Yellow-brown tones
    },
    dark: {
      highPerformer: "#4a3a5c", // High contrast purple
      needsAttention: "#5c3a3a", // High contrast red
      solidPerformer: "#3a5c4a", // High contrast green
      development: "#5c5a3a", // High contrast yellow-brown
    },
  },

  // Chart-specific colors (Recharts integration)
  charts: {
    light: {
      background: "#ffffff",
      gridLines: "#e0e0e0",
      tooltip: "#ffffff",
    },
    dark: {
      background: "#1e1e1e",
      gridLines: "rgba(255, 255, 255, 0.12)",
      tooltip: "#2c2c2c",
    },
  },

  // Scrollbar colors
  scrollbar: {
    light: {
      thumb: "#bdbdbd",
      thumbHover: "#9e9e9e",
      track: "#f5f5f5",
    },
    dark: {
      thumb: "#424242",
      thumbHover: "#616161",
      track: "#1e1e1e",
    },
  },
} as const;

/**
 * Spacing scale (8px base grid)
 * Use these instead of hardcoded pixel values
 *
 * Examples:
 *   xs: 4px  - Tight spacing between related elements
 *   sm: 8px  - Small gaps, list item padding
 *   md: 16px - Standard component padding
 *   lg: 24px - Section separation
 *   xl: 32px - Large section separation
 *   xxl: 48px - Page-level margins
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Component-specific dimensions
 * Extracted from components to ensure consistency
 */
export const dimensions = {
  // Grid box sizing (from GridBox.tsx)
  gridBox: {
    collapsedMin: 60,
    collapsedMax: 80,
    normalMin: 150,
    normalMax: 400,
    expandedMin: 200,
    expandedViewportOffset: 250, // Space for headers, margins, other collapsed boxes
  },

  // Panel dimensions (right panel)
  panel: {
    minWidth: 320,
    maxWidth: 600,
    defaultWidth: 400,
  },

  // Error boundary dimensions
  errorBoundary: {
    maxWidth: 600, // Error display max width
    iconSize: 60, // Error icon size
  },

  // Employee tile (draggable cards)
  employeeTile: {
    height: 56,
    spacing: 8,
  },

  // Scrollbar styling
  scrollbar: {
    width: 12, // Scrollbar width
    height: 12, // Scrollbar height
    borderRadius: 4, // Rounded scrollbar to match box corners
    thumbBorderRadius: 6, // Thumb border radius
    thumbBorderWidth: 3, // Thumb border width
  },

  // Grid zoom levels (5 discrete levels)
  // Base tile size: 250px-370px (reduced by 30px from original 280px-400px)
  // Level 0: Compact (50%) - Maximum information density
  // Level 1: Medium (75%) - Dense view
  // Level 2: Normal (100%) - Default view
  // Level 3: Comfortable (125%) - Slightly larger than normal
  // Level 4: Presentation (150%) - Maximum visibility from distance
  gridZoom: {
    // Zoom level 0: Compact (50% label) - Smallest size
    level0: {
      tile: {
        minWidth: 120, // 250 * 0.48 (legacy - use narrowWidth)
        maxWidth: 178, // 370 * 0.48 (legacy - use wideWidth)
        wideWidth: 170, // Fixed width for single-column layout
        narrowWidth: 120, // Fixed width for multi-column layout
        columnThreshold: 300, // Container width threshold for column switching
        paddingY: 4, // Vertical padding (top/bottom)
        paddingX: 6, // Horizontal padding (left, between drag handle and content)
        dragHandleWidth: 16, // Compact drag handle
      },
      font: {
        name: "0.7rem", // Very small for ultra compact
        titleLevel: "0.55rem", // Very small title
        metadata: "0.55rem", // Very small metadata
      },
      icon: {
        dragHandle: 10, // Very small icons
        flag: 10,
        history: 9,
      },
      spacing: {
        gap: 12, // Horizontal spacing between tiles (column gap)
        rowGap: 1, // Vertical spacing between tiles (row gap)
        flagGap: 2,
        boxPadding: 4, // Minimal padding inside grid boxes
      },
    },

    // Zoom level 1: Medium (75% label)
    level1: {
      tile: {
        minWidth: 150, // 250 * 0.6 (legacy - use narrowWidth)
        maxWidth: 222, // 370 * 0.6 (legacy - use wideWidth)
        wideWidth: 210, // Fixed width for single-column layout
        narrowWidth: 150, // Fixed width for multi-column layout
        columnThreshold: 360, // Container width threshold for column switching
        paddingY: 5, // Vertical padding (top/bottom)
        paddingX: 7, // Horizontal padding (left, between drag handle and content)
        dragHandleWidth: 18, // Compact drag handle
      },
      font: {
        name: "0.8rem",
        titleLevel: "0.6rem",
        metadata: "0.6rem",
      },
      icon: {
        dragHandle: 12,
        flag: 12,
        history: 10,
      },
      spacing: {
        gap: 16, // Horizontal spacing between tiles (column gap)
        rowGap: 1, // Vertical spacing between tiles (row gap)
        flagGap: 3,
        boxPadding: 6, // Compact padding inside grid boxes
      },
    },

    // Zoom level 2: Normal (100% label - baseline/default)
    level2: {
      tile: {
        minWidth: 200, // 250 * 0.8 (legacy - use narrowWidth)
        maxWidth: 296, // 370 * 0.8 (legacy - use wideWidth)
        wideWidth: 280, // Fixed width for single-column layout
        narrowWidth: 200, // Fixed width for multi-column layout
        columnThreshold: 450, // Container width threshold for column switching
        paddingY: 6, // Vertical padding (top/bottom)
        paddingX: 8, // Horizontal padding (left, between drag handle and content)
        dragHandleWidth: 20, // Normal drag handle
      },
      font: {
        name: "0.95rem",
        titleLevel: "0.65rem",
        metadata: "0.65rem",
      },
      icon: {
        dragHandle: 14,
        flag: 14,
        history: 11,
      },
      spacing: {
        gap: 18, // Horizontal spacing between tiles (column gap) - increased by 10px
        rowGap: 2, // Vertical spacing between tiles (row gap) - reduced significantly
        flagGap: 3,
        boxPadding: 8, // Normal padding inside grid boxes
      },
    },

    // Zoom level 3: Comfortable (125% label)
    level3: {
      tile: {
        minWidth: 313, // 250 * 1.25 (legacy - use narrowWidth)
        maxWidth: 463, // 370 * 1.25 (legacy - use wideWidth)
        wideWidth: 440, // Fixed width for single-column layout
        narrowWidth: 313, // Fixed width for multi-column layout
        columnThreshold: 680, // Container width threshold for column switching
        paddingY: 10, // Vertical padding (top/bottom)
        paddingX: 12, // Horizontal padding (left, between drag handle and content)
        dragHandleWidth: 24, // Comfortable drag handle
      },
      font: {
        name: "1.25rem",
        titleLevel: "0.95rem",
        metadata: "0.95rem",
      },
      icon: {
        dragHandle: 20,
        flag: 20,
        history: 15,
      },
      spacing: {
        gap: 22, // Horizontal spacing between tiles (column gap)
        rowGap: 3, // Vertical spacing between tiles (row gap)
        flagGap: 5,
        boxPadding: 12, // Comfortable padding inside grid boxes
      },
    },

    // Zoom level 4: Presentation (150% label)
    level4: {
      tile: {
        minWidth: 375, // 250 * 1.5 (legacy - use narrowWidth)
        maxWidth: 555, // 370 * 1.5 (legacy - use wideWidth)
        wideWidth: 520, // Fixed width for single-column layout
        narrowWidth: 375, // Fixed width for multi-column layout
        columnThreshold: 820, // Container width threshold for column switching
        paddingY: 14, // Vertical padding (top/bottom)
        paddingX: 16, // Horizontal padding (left, between drag handle and content)
        dragHandleWidth: 28, // Presentation drag handle
      },
      font: {
        name: "1.5rem",
        titleLevel: "1.125rem",
        metadata: "1.125rem",
      },
      icon: {
        dragHandle: 24,
        flag: 24,
        history: 18,
      },
      spacing: {
        gap: 26, // Horizontal spacing between tiles (column gap)
        rowGap: 4, // Vertical spacing between tiles (row gap)
        flagGap: 6,
        boxPadding: 16, // Presentation padding inside grid boxes
      },
    },
  },

  // Drawer dimensions (left sidebar filter drawer)
  drawer: {
    width: 420, // Filter drawer width (1.5x wider to accommodate org tree)
  },

  // AppBar dimensions
  appBar: {
    height: 48, // AppBar height (reduced by 25% from 64px)
    logoSize: 28, // App logo icon size
  },

  // Grid container dimensions
  gridContainer: {
    padding: 16, // Container padding (p: 2)
    collapsedBoxSize: 80, // Size of collapsed boxes in expanded mode
  },

  // Axis dimensions
  axis: {
    verticalWidth: 45, // Width of vertical axis label (reduced by 30% from 64px)
  },

  // Box header (fixed sizing, does not scale with zoom)
  boxHeader: {
    marginBottom: 8, // mb: 1
    gap: 16, // gap: 2 (16px)
    gapCollapsed: 4, // gap: 0.5 (4px)
    iconMargin: 8, // ml: 1 (8px)
    badgeFontSize: "0.65rem",
    badgeHeight: 16,
  },

  // Progress bar dimensions (used in ColoredPercentageBar)
  progressBar: {
    height: 8, // Standard progress bar height
    labelMinWidth: 45, // Minimum width for percentage label alignment
  },

  // Distribution table / statistics (used in GroupingIndicator)
  distributionTable: {
    groupingColumnWidth: 120, // Width of grouping indicator column
    groupingBorderWidth: 4, // Border width for grouping indicators
  },

  // Menu item dimensions (used in tree nodes, list items, etc.)
  menuItem: {
    minHeight: 32, // Compact menu item height
    paddingY: 0, // No additional vertical padding (minHeight provides spacing)
  },
} as const;

/**
 * Opacity values
 * Use these for consistent transparency across the app
 */
export const opacity = {
  // Standard opacity levels
  disabled: 0.38, // MUI standard for disabled elements
  inactive: 0.6, // Inactive/idle interactive elements
  hover: 0.7, // Hover states
  active: 1, // Active/focused states

  // Grid box specific (from GridBox.tsx)
  gridCollapsedIdle: 0.7,
  gridCollapsedDragOver: 1,
  gridExpandButtonIdle: 0.6,
  gridExpandButtonActive: 1,
} as const;

/**
 * Z-index scale
 * Ensures proper layering of UI elements
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300, // MUI default
  popover: 1400,
  tooltip: 1500,
} as const;

/**
 * Animation durations
 * Use these for consistent timing across the app
 */
export const duration = {
  instant: "0s",
  fast: "0.15s", // Micro-interactions (hover, focus)
  normal: "0.3s", // Standard transitions (panel slide, modal)
  slow: "0.5s", // Large movements (page transitions)
} as const;

/**
 * Animation easing functions
 */
export const easing = {
  easeInOut: "ease-in-out",
  easeOut: "ease-out",
  easeIn: "ease-in",
  linear: "linear",
} as const;

/**
 * Border radius scale
 */
export const radius = {
  none: 0,
  sm: 4,
  md: 8, // Default MUI shape.borderRadius
  lg: 12,
  xl: 16,
  round: "50%",
} as const;

/**
 * Shadow definitions (elevation)
 */
export const shadows = {
  card: {
    light: "0 2px 8px rgba(0,0,0,0.1)",
    dark: "0 2px 8px rgba(0,0,0,0.3)",
  },
  elevated: {
    light: "0 4px 12px rgba(0,0,0,0.15)",
    dark: "0 4px 12px rgba(0,0,0,0.4)",
  },
  dropdown: {
    light: "0 8px 16px rgba(0,0,0,0.12)",
    dark: "0 8px 16px rgba(0,0,0,0.5)",
  },
} as const;

/**
 * Typography scale
 * Font sizes and weights for text elements
 */
export const typography = {
  fontFamily: [
    "Roboto",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Arial",
    "sans-serif",
  ].join(","),

  // Font sizes (rem units)
  fontSize: {
    h1: "2.5rem", // 40px
    h2: "2rem", // 32px
    h3: "1.75rem", // 28px
    h4: "1.5rem", // 24px
    h5: "1.25rem", // 20px
    h6: "1rem", // 16px
    body1: "1rem", // 16px
    body2: "0.875rem", // 14px
    caption: "0.75rem", // 12px
    overline: "0.75rem", // 12px
  },

  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Breakpoints for responsive design
 * (Future use when web deployment is active)
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

/**
 * Combined tokens object
 * Use this for easy access to all tokens
 */
export const tokens = {
  colors,
  spacing,
  dimensions,
  opacity,
  zIndex,
  duration,
  easing,
  radius,
  shadows,
  typography,
  breakpoints,
} as const;

/**
 * Type exports for TypeScript support
 */
export type Spacing = keyof typeof spacing;
export type Duration = keyof typeof duration;
export type Radius = keyof typeof radius;
export type ZIndex = keyof typeof zIndex;
export type Opacity = keyof typeof opacity;
