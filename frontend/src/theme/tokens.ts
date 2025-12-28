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

  // Drawer dimensions (left sidebar filter drawer)
  drawer: {
    width: 280, // Filter drawer width
  },

  // AppBar dimensions
  appBar: {
    height: 64, // Standard AppBar height
    logoSize: 28, // App logo icon size
  },

  // Scrollbar dimensions
  scrollbar: {
    width: 12,
    height: 12,
    thumbBorderRadius: 6,
    thumbBorderWidth: 3,
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
