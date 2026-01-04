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
  selectedManagerEmployeeIds: Record<string, number[]>; // Map of manager name to their employee IDs
  selectedFlags: string[];
  excludedEmployeeIds: number[];
  reportingChainFilter: string | null; // Manager name for display
  reportingChainEmployeeIds: number[]; // All employee IDs under the selected manager

  // UI state
  isDrawerOpen: boolean;

  // Actions
  toggleLevel: (level: string) => void;
  toggleJobFunction: (jobFunction: string) => void;
  toggleLocation: (location: string) => void;
  toggleManager: (manager: string, employeeIds: number[]) => void;
  toggleFlag: (flag: string) => void;
  setExcludedIds: (ids: number[]) => void;
  setReportingChainFilter: (
    managerName: string | null,
    employeeIds: number[]
  ) => void;
  clearReportingChainFilter: () => void;
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
  selectedManagerEmployeeIds: {},
  selectedFlags: [],
  excludedEmployeeIds: [],
  reportingChainFilter: null,
  reportingChainEmployeeIds: [],
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

  toggleManager: (manager: string, employeeIds: number[]) => {
    set((state) => {
      const isSelected = state.selectedManagers.includes(manager);
      const newSelectedManagers = isSelected
        ? state.selectedManagers.filter((m) => m !== manager)
        : [...state.selectedManagers, manager];

      // Update employee IDs record
      let newEmployeeIdsRecord: Record<string, number[]>;
      if (isSelected) {
        // Remove manager from record
        const { [manager]: _, ...rest } = state.selectedManagerEmployeeIds;
        newEmployeeIdsRecord = rest;
      } else {
        // Add manager and their employee IDs to record
        newEmployeeIdsRecord = {
          ...state.selectedManagerEmployeeIds,
          [manager]: employeeIds,
        };
      }

      return {
        selectedManagers: newSelectedManagers,
        selectedManagerEmployeeIds: newEmployeeIdsRecord,
      };
    });
  },

  toggleFlag: (flag: string) => {
    set((state) => {
      const isSelected = state.selectedFlags.includes(flag);
      return {
        selectedFlags: isSelected
          ? state.selectedFlags.filter((f) => f !== flag)
          : [...state.selectedFlags, flag],
      };
    });
  },

  setExcludedIds: (ids: number[]) => {
    set({ excludedEmployeeIds: ids });
  },

  setReportingChainFilter: (
    managerName: string | null,
    employeeIds: number[]
  ) => {
    set({
      reportingChainFilter: managerName,
      reportingChainEmployeeIds: employeeIds,
    });
  },

  clearReportingChainFilter: () => {
    set({ reportingChainFilter: null, reportingChainEmployeeIds: [] });
  },

  clearAllFilters: () => {
    set({
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      selectedManagerEmployeeIds: {},
      selectedFlags: [],
      excludedEmployeeIds: [],
      reportingChainFilter: null,
      reportingChainEmployeeIds: [],
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
      state.selectedFlags.length > 0 ||
      state.excludedEmployeeIds.length > 0 ||
      state.reportingChainFilter !== null
    );
  },
}));
