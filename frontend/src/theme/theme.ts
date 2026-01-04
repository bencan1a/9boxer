/**
 * Material-UI theme configuration with light and dark mode support
 * Follows Material Design 3 guidelines for dark theme
 */

import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { tokens } from "./tokens";

// Extend MUI theme types to include custom palette properties and design tokens
declare module "@mui/material/styles" {
  interface Theme {
    tokens: typeof tokens;
  }
  interface ThemeOptions {
    tokens?: typeof tokens;
  }
  interface Palette {
    gridBox: {
      highPerformer: string;
      needsAttention: string;
      solidPerformer: string;
      development: string;
    };
    charts: {
      background: string;
      gridLines: string;
      tooltip: string;
    };
  }
  interface PaletteOptions {
    gridBox?: {
      highPerformer?: string;
      needsAttention?: string;
      solidPerformer?: string;
      development?: string;
    };
    charts?: {
      background?: string;
      gridLines?: string;
      tooltip?: string;
    };
  }
}

/**
 * Creates a theme configuration for the specified mode
 * @param mode - 'light' or 'dark'
 * @returns Complete MUI theme object
 */
export const getTheme = (mode: "light" | "dark"): Theme => {
  const isLight = mode === "light";

  const themeOptions: ThemeOptions = {
    // Include design tokens in theme for easy access
    tokens,
    palette: {
      mode,
      // Primary colors: Blue in light mode, desaturated blue (200 shade) in dark mode
      primary: isLight
        ? tokens.colors.primary.light
        : tokens.colors.primary.dark,
      // Secondary colors: Orange in light mode, desaturated orange (300 shade) in dark mode
      secondary: isLight
        ? tokens.colors.secondary.light
        : tokens.colors.secondary.dark,
      // Surface colors: MD3 standard for dark mode (#121212), warm light for light mode
      background: isLight
        ? tokens.colors.background.light
        : tokens.colors.background.dark,
      // Text colors follow MUI standards for accessibility
      text: isLight ? tokens.colors.text.light : tokens.colors.text.dark,
      // Custom semantic colors for 9-box grid boxes
      // High contrast versions for dark mode to maintain WCAG AA compliance
      gridBox: isLight
        ? tokens.colors.gridBox.light
        : tokens.colors.gridBox.dark,
      // Custom colors for chart components (Recharts)
      charts: isLight ? tokens.colors.charts.light : tokens.colors.charts.dark,
    },
    typography: {
      fontFamily: tokens.typography.fontFamily,
      h1: {
        fontSize: tokens.typography.fontSize.h1,
        fontWeight: tokens.typography.fontWeight.medium,
      },
      h2: {
        fontSize: tokens.typography.fontSize.h2,
        fontWeight: tokens.typography.fontWeight.medium,
      },
      h3: {
        fontSize: tokens.typography.fontSize.h3,
        fontWeight: tokens.typography.fontWeight.medium,
      },
      h4: {
        fontSize: tokens.typography.fontSize.h4,
        fontWeight: tokens.typography.fontWeight.medium,
      },
      h5: {
        fontSize: tokens.typography.fontSize.h5,
        fontWeight: tokens.typography.fontWeight.medium,
      },
      h6: {
        fontSize: tokens.typography.fontSize.h6,
        fontWeight: tokens.typography.fontWeight.medium,
      },
    },
    shape: {
      borderRadius: tokens.radius.md,
    },
    components: {
      // Configure Modal (Dialog) to use dedicated portal container
      MuiModal: {
        defaultProps: {
          container: () => document.getElementById("modal-root"),
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: `${tokens.dimensions.appBar.height}px !important`,
            "@media (min-width: 600px)": {
              minHeight: `${tokens.dimensions.appBar.height}px !important`,
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Custom scrollbar styling using design tokens
            scrollbarColor: isLight
              ? `${tokens.colors.scrollbar.light.thumb} ${tokens.colors.scrollbar.light.track}`
              : `${tokens.colors.scrollbar.dark.thumb} ${tokens.colors.scrollbar.dark.track}`,
            "&::-webkit-scrollbar": {
              width: `${tokens.dimensions.scrollbar.width}px`,
              height: `${tokens.dimensions.scrollbar.height}px`,
            },
            "&::-webkit-scrollbar-track": {
              background: isLight
                ? tokens.colors.scrollbar.light.track
                : tokens.colors.scrollbar.dark.track,
            },
            "&::-webkit-scrollbar-thumb": {
              background: isLight
                ? tokens.colors.scrollbar.light.thumb
                : tokens.colors.scrollbar.dark.thumb,
              borderRadius: `${tokens.dimensions.scrollbar.thumbBorderRadius}px`,
              border: isLight
                ? `${tokens.dimensions.scrollbar.thumbBorderWidth}px solid ${tokens.colors.scrollbar.light.track}`
                : `${tokens.dimensions.scrollbar.thumbBorderWidth}px solid ${tokens.colors.scrollbar.dark.track}`,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: isLight
                ? tokens.colors.scrollbar.light.thumbHover
                : tokens.colors.scrollbar.dark.thumbHover,
            },
            // Apply to all scrollable elements
            "& *": {
              scrollbarColor: isLight
                ? `${tokens.colors.scrollbar.light.thumb} ${tokens.colors.scrollbar.light.track}`
                : `${tokens.colors.scrollbar.dark.thumb} ${tokens.colors.scrollbar.dark.track}`,
              "&::-webkit-scrollbar": {
                width: `${tokens.dimensions.scrollbar.width}px`,
                height: `${tokens.dimensions.scrollbar.height}px`,
              },
              "&::-webkit-scrollbar-track": {
                background: isLight
                  ? tokens.colors.scrollbar.light.track
                  : tokens.colors.scrollbar.dark.track,
              },
              "&::-webkit-scrollbar-thumb": {
                background: isLight
                  ? tokens.colors.scrollbar.light.thumb
                  : tokens.colors.scrollbar.dark.thumb,
                borderRadius: `${tokens.dimensions.scrollbar.thumbBorderRadius}px`,
                border: isLight
                  ? `${tokens.dimensions.scrollbar.thumbBorderWidth}px solid ${tokens.colors.scrollbar.light.track}`
                  : `${tokens.dimensions.scrollbar.thumbBorderWidth}px solid ${tokens.colors.scrollbar.dark.track}`,
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: isLight
                  ? tokens.colors.scrollbar.light.thumbHover
                  : tokens.colors.scrollbar.dark.thumbHover,
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none", // Don't uppercase button text
            fontWeight: tokens.typography.fontWeight.medium,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            // Use lighter shadow in dark mode to avoid harsh contrast
            boxShadow: isLight
              ? tokens.shadows.card.light
              : tokens.shadows.card.dark,
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

// Export default theme for backward compatibility (light mode)
export const theme = getTheme("light");
