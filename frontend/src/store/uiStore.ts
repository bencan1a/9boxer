/**
 * UI store using Zustand for managing UI state
 * Uses persist middleware to sync with localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  // Right panel state
  isRightPanelCollapsed: boolean;
  rightPanelSize: number; // Percentage size of the panel
  wasAutoCollapsed: boolean; // Track if panel was auto-collapsed due to window size

  // Actions
  toggleRightPanel: () => void;
  setRightPanelCollapsed: (collapsed: boolean, isAutoCollapse?: boolean) => void;
  setRightPanelSize: (size: number) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // Initial state - panel open by default
      isRightPanelCollapsed: false,
      rightPanelSize: 35, // Default 35%
      wasAutoCollapsed: false,

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
    }),
    {
      name: "9boxer-ui-state", // localStorage key
    }
  )
);
