/**
 * Material-UI theme configuration with light and dark mode support
 * Follows Material Design 3 guidelines for dark theme
 */

import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";

// Extend MUI theme types to include custom palette properties
declare module "@mui/material/styles" {
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
    palette: {
      mode,
      // Primary colors: Blue in light mode, desaturated blue (200 shade) in dark mode
      primary: {
        main: isLight ? "#1976d2" : "#90caf9",
        light: isLight ? "#42a5f5" : "#b3d9f7",
        dark: isLight ? "#1565c0" : "#6ba6d6",
      },
      // Secondary colors: Orange in light mode, desaturated orange (300 shade) in dark mode
      secondary: {
        main: isLight ? "#ff9800" : "#ffb74d",
        light: isLight ? "#ffb74d" : "#ffd180",
        dark: isLight ? "#f57c00" : "#ff9800",
      },
      // Surface colors: MD3 standard for dark mode (#121212), warm light for light mode
      background: {
        default: isLight ? "#fafafa" : "#121212",
        paper: isLight ? "#ffffff" : "#1e1e1e",
      },
      // Text colors follow MUI standards for accessibility
      text: {
        primary: isLight
          ? "rgba(0, 0, 0, 0.87)"
          : "rgba(255, 255, 255, 0.87)",
        secondary: isLight
          ? "rgba(0, 0, 0, 0.60)"
          : "rgba(255, 255, 255, 0.60)",
        disabled: isLight
          ? "rgba(0, 0, 0, 0.38)"
          : "rgba(255, 255, 255, 0.38)",
      },
      // Custom semantic colors for 9-box grid boxes
      // High contrast versions for dark mode to maintain WCAG AA compliance
      gridBox: {
        highPerformer: isLight ? "#d4c4e8" : "#4a3a5c", // Purple tones for high performers
        needsAttention: isLight ? "#ffc9c9" : "#5c3a3a", // Red tones for needs attention
        solidPerformer: isLight ? "#c4e5d0" : "#3a5c4a", // Green tones for solid performers
        development: isLight ? "#fff0c0" : "#5c5a3a", // Yellow-brown tones for development areas
      },
      // Custom colors for chart components (Recharts)
      charts: {
        background: isLight ? "#ffffff" : "#1e1e1e",
        gridLines: isLight ? "#e0e0e0" : "rgba(255, 255, 255, 0.12)",
        tooltip: isLight ? "#ffffff" : "#2c2c2c",
      },
    },
    typography: {
      fontFamily: [
        "Roboto",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Arial",
        "sans-serif",
      ].join(","),
      h1: {
        fontSize: "2.5rem",
        fontWeight: 500,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 500,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 500,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 500,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 500,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Custom scrollbar styling
            scrollbarColor: isLight
              ? "#bdbdbd #f5f5f5" // thumb track (light mode)
              : "#424242 #1e1e1e", // thumb track (dark mode)
            "&::-webkit-scrollbar": {
              width: "12px",
              height: "12px",
            },
            "&::-webkit-scrollbar-track": {
              background: isLight ? "#f5f5f5" : "#1e1e1e",
            },
            "&::-webkit-scrollbar-thumb": {
              background: isLight ? "#bdbdbd" : "#424242",
              borderRadius: "6px",
              border: isLight
                ? "3px solid #f5f5f5"
                : "3px solid #1e1e1e",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: isLight ? "#9e9e9e" : "#616161",
            },
            // Apply to all scrollable elements
            "& *": {
              scrollbarColor: isLight
                ? "#bdbdbd #f5f5f5"
                : "#424242 #1e1e1e",
              "&::-webkit-scrollbar": {
                width: "12px",
                height: "12px",
              },
              "&::-webkit-scrollbar-track": {
                background: isLight ? "#f5f5f5" : "#1e1e1e",
              },
              "&::-webkit-scrollbar-thumb": {
                background: isLight ? "#bdbdbd" : "#424242",
                borderRadius: "6px",
                border: isLight
                  ? "3px solid #f5f5f5"
                  : "3px solid #1e1e1e",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: isLight ? "#9e9e9e" : "#616161",
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none", // Don't uppercase button text
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            // Use lighter shadow in dark mode to avoid harsh contrast
            boxShadow: isLight
              ? "0 2px 8px rgba(0,0,0,0.1)"
              : "0 2px 8px rgba(0,0,0,0.3)",
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

// Export default theme for backward compatibility (light mode)
export const theme = getTheme("light");
