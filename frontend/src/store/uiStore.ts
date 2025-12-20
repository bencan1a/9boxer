/**
 * UI store using Zustand for managing UI state
 * Uses persist middleware to sync with localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Theme type definitions
export type Theme = "light" | "dark";
export type ThemeMode = "light" | "dark" | "auto";

interface UiState {
  // Right panel state
  isRightPanelCollapsed: boolean;
  rightPanelSize: number; // Percentage size of the panel
  wasAutoCollapsed: boolean; // Track if panel was auto-collapsed due to window size

  // Theme state
  themeMode: ThemeMode; // User's preference
  effectiveTheme: Theme; // Computed actual theme to apply
  systemTheme: Theme; // OS theme (from Electron API)

  // Actions
  toggleRightPanel: () => void;
  setRightPanelCollapsed: (collapsed: boolean, isAutoCollapse?: boolean) => void;
  setRightPanelSize: (size: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSystemTheme: (theme: Theme) => void;
}

/**
 * Helper function to compute the effective theme based on mode and system theme
 */
const computeEffectiveTheme = (mode: ThemeMode, systemTheme: Theme): Theme => {
  if (mode === "auto") {
    return systemTheme;
  }
  return mode;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // Initial state - panel open by default
      isRightPanelCollapsed: false,
      rightPanelSize: 35, // Default 35%
      wasAutoCollapsed: false,

      // Initial theme state
      themeMode: "auto", // Default to follow system
      systemTheme: "dark", // Fallback if OS detection fails
      effectiveTheme: "dark", // Will be computed on first render

      // Actions
      toggleRightPanel: () => {
        set((state) => ({
          isRightPanelCollapsed: !state.isRightPanelCollapsed,
          wasAutoCollapsed: false, // Manual toggle clears auto-collapse flag
        }));
      },

      setRightPanelCollapsed: (collapsed: boolean, isAutoCollapse = false) => {
        set({
          isRightPanelCollapsed: collapsed,
          wasAutoCollapsed: isAutoCollapse,
        });
      },

      setRightPanelSize: (size: number) => {
        set({ rightPanelSize: size });
      },

      setThemeMode: (mode: ThemeMode) => {
        set((state) => ({
          themeMode: mode,
          effectiveTheme: computeEffectiveTheme(mode, state.systemTheme),
        }));
      },

      setSystemTheme: (theme: Theme) => {
        set((state) => ({
          systemTheme: theme,
          effectiveTheme: computeEffectiveTheme(state.themeMode, theme),
        }));
      },
    }),
    {
      name: "9boxer-ui-state", // localStorage key
      // Only persist user preferences, not runtime values
      partialize: (state) => ({
        isRightPanelCollapsed: state.isRightPanelCollapsed,
        rightPanelSize: state.rightPanelSize,
        wasAutoCollapsed: state.wasAutoCollapsed,
        themeMode: state.themeMode,
        // Do NOT persist effectiveTheme or systemTheme - these are runtime values
      }),
    }
  )
);
