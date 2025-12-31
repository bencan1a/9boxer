/**
 * UI store using Zustand for managing UI state
 * Uses persist middleware to sync with localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, RecentFile } from "../services/api";

// Theme type definitions
export type Theme = "light" | "dark";
export type ThemeMode = "light" | "dark" | "auto";

// Re-export for convenience
export type { RecentFile };

interface UiState {
  // Right panel state
  isRightPanelCollapsed: boolean;
  rightPanelSize: number; // Percentage size of the panel
  wasAutoCollapsed: boolean; // Track if panel was auto-collapsed due to window size

  // Theme state
  themeMode: ThemeMode; // User's preference
  effectiveTheme: Theme; // Computed actual theme to apply
  systemTheme: Theme; // OS theme (from Electron API)

  // Recent files state
  recentFiles: RecentFile[];

  // Actions
  toggleRightPanel: () => void;
  setRightPanelCollapsed: (
    collapsed: boolean,
    isAutoCollapse?: boolean
  ) => void;
  setRightPanelSize: (size: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSystemTheme: (theme: Theme) => void;
  loadRecentFiles: () => Promise<void>;
  addRecentFile: (path: string, name: string) => Promise<void>;
  clearRecentFiles: () => Promise<void>;
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
    (set, get) => ({
      // Initial state - panel open by default
      isRightPanelCollapsed: false,
      rightPanelSize: 35, // Default 35%
      wasAutoCollapsed: false,

      // Initial theme state
      themeMode: "auto", // Default to follow system
      systemTheme: "dark", // Fallback if OS detection fails
      effectiveTheme: "dark", // Will be computed on first render

      // Initial recent files state
      recentFiles: [],

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

      // Recent files actions
      loadRecentFiles: async () => {
        try {
          const files = await apiClient.getRecentFiles();
          set({ recentFiles: files });
        } catch (error) {
          console.error("Failed to load recent files:", error);
          set({ recentFiles: [] });
        }
      },

      addRecentFile: async (path: string, name: string) => {
        try {
          // Check if this file already exists (prevent duplicates)
          const existingFiles = get().recentFiles;
          const alreadyExists = existingFiles.some((f) => f.path === path);

          if (alreadyExists) {
            return;
          }

          await apiClient.addRecentFile(path, name);
          // Reload recent files to get updated list
          await get().loadRecentFiles();
        } catch (error) {
          console.error("Failed to add recent file:", error);
        }
      },

      clearRecentFiles: async () => {
        try {
          await apiClient.clearRecentFiles();
          // Clear local state
          set({ recentFiles: [] });
        } catch (error) {
          console.error("Failed to clear recent files:", error);
        }
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
        recentFiles: state.recentFiles,
        // Do NOT persist effectiveTheme or systemTheme - these are runtime values
      }),
    }
  )
);

// ==================== Reusable Selectors ====================
// These selectors help components subscribe only to specific parts of the store,
// reducing unnecessary re-renders when unrelated state changes.
// Usage: const themeMode = useUiStore(selectThemeMode)

export const selectIsRightPanelCollapsed = (state: UiState) =>
  state.isRightPanelCollapsed;
export const selectRightPanelSize = (state: UiState) => state.rightPanelSize;
export const selectWasAutoCollapsed = (state: UiState) =>
  state.wasAutoCollapsed;
export const selectThemeMode = (state: UiState) => state.themeMode;
export const selectEffectiveTheme = (state: UiState) => state.effectiveTheme;
export const selectSystemTheme = (state: UiState) => state.systemTheme;
export const selectRecentFiles = (state: UiState) => state.recentFiles;

// Action selectors
export const selectToggleRightPanel = (state: UiState) =>
  state.toggleRightPanel;
export const selectSetRightPanelCollapsed = (state: UiState) =>
  state.setRightPanelCollapsed;
export const selectSetRightPanelSize = (state: UiState) =>
  state.setRightPanelSize;
export const selectSetThemeMode = (state: UiState) => state.setThemeMode;
export const selectSetSystemTheme = (state: UiState) => state.setSystemTheme;
export const selectLoadRecentFiles = (state: UiState) => state.loadRecentFiles;
export const selectAddRecentFile = (state: UiState) => state.addRecentFile;
export const selectClearRecentFiles = (state: UiState) =>
  state.clearRecentFiles;
