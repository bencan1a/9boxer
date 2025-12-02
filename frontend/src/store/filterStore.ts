/**
 * Filter store using Zustand for managing filter state
 */

import { create } from "zustand";

interface FilterState {
  // Filter selections
  selectedLevels: string[];
  selectedManagers: string[];
  selectedChainLevels: string[];
  excludedEmployeeIds: number[];

  // UI state
  isDrawerOpen: boolean;

  // Actions
  toggleLevel: (level: string) => void;
  toggleManager: (manager: string) => void;
  toggleChainLevel: (level: string) => void;
  setExcludedIds: (ids: number[]) => void;
  clearAllFilters: () => void;
  toggleDrawer: () => void;

  // Derived state
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  // Initial state
  selectedLevels: [],
  selectedManagers: [],
  selectedChainLevels: [],
  excludedEmployeeIds: [],
  isDrawerOpen: false,

  // Actions
  toggleLevel: (level: string) => {
    set((state) => {
      const isSelected = state.selectedLevels.includes(level);
      return {
        selectedLevels: isSelected
          ? state.selectedLevels.filter((l) => l !== level)
          : [...state.selectedLevels, level],
      };
    });
  },

  toggleManager: (manager: string) => {
    set((state) => {
      const isSelected = state.selectedManagers.includes(manager);
      return {
        selectedManagers: isSelected
          ? state.selectedManagers.filter((m) => m !== manager)
          : [...state.selectedManagers, manager],
      };
    });
  },

  toggleChainLevel: (level: string) => {
    set((state) => {
      const isSelected = state.selectedChainLevels.includes(level);
      return {
        selectedChainLevels: isSelected
          ? state.selectedChainLevels.filter((l) => l !== level)
          : [...state.selectedChainLevels, level],
      };
    });
  },

  setExcludedIds: (ids: number[]) => {
    set({ excludedEmployeeIds: ids });
  },

  clearAllFilters: () => {
    set({
      selectedLevels: [],
      selectedManagers: [],
      selectedChainLevels: [],
      excludedEmployeeIds: [],
    });
  },

  toggleDrawer: () => {
    set((state) => ({ isDrawerOpen: !state.isDrawerOpen }));
  },

  // Derived state
  hasActiveFilters: () => {
    const state = get();
    return (
      state.selectedLevels.length > 0 ||
      state.selectedManagers.length > 0 ||
      state.selectedChainLevels.length > 0 ||
      state.excludedEmployeeIds.length > 0
    );
  },
}));
