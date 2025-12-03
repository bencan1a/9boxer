/**
 * Filter store using Zustand for managing filter state
 */

import { create } from "zustand";

interface FilterState {
  // Filter selections
  selectedLevels: string[];
  selectedJobFunctions: string[];
  selectedLocations: string[];
  selectedManagers: string[];
  excludedEmployeeIds: number[];

  // UI state
  isDrawerOpen: boolean;

  // Actions
  toggleLevel: (level: string) => void;
  toggleJobFunction: (jobFunction: string) => void;
  toggleLocation: (location: string) => void;
  toggleManager: (manager: string) => void;
  setExcludedIds: (ids: number[]) => void;
  clearAllFilters: () => void;
  toggleDrawer: () => void;

  // Derived state
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  // Initial state
  selectedLevels: [],
  selectedJobFunctions: [],
  selectedLocations: [],
  selectedManagers: [],
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

  toggleJobFunction: (jobFunction: string) => {
    set((state) => {
      const isSelected = state.selectedJobFunctions.includes(jobFunction);
      return {
        selectedJobFunctions: isSelected
          ? state.selectedJobFunctions.filter((jf) => jf !== jobFunction)
          : [...state.selectedJobFunctions, jobFunction],
      };
    });
  },

  toggleLocation: (location: string) => {
    set((state) => {
      const isSelected = state.selectedLocations.includes(location);
      return {
        selectedLocations: isSelected
          ? state.selectedLocations.filter((l) => l !== location)
          : [...state.selectedLocations, location],
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

  setExcludedIds: (ids: number[]) => {
    set({ excludedEmployeeIds: ids });
  },

  clearAllFilters: () => {
    set({
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
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
      state.selectedJobFunctions.length > 0 ||
      state.selectedLocations.length > 0 ||
      state.selectedManagers.length > 0 ||
      state.excludedEmployeeIds.length > 0
    );
  },
}));
