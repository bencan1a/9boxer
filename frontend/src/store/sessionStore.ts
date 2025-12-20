/**
 * Session store using Zustand
 */

import { create } from "zustand";
import { apiClient } from "../services/api";
import { Employee } from "../types/employee";
import { EmployeeMove } from "../types/session";
import { extractErrorMessage } from "../types/errors";
import { logger } from "../utils/logger";

interface SessionState {
  sessionId: string | null;
  employees: Employee[];
  originalEmployees: Employee[];
  changes: EmployeeMove[];
  filename: string | null;
  filePath: string | null;
  isLoading: boolean;
  error: string | null;
  selectedEmployeeId: number | null;

  // Donut Mode state
  donutModeActive: boolean;
  donutChanges: EmployeeMove[];

  // Actions
  uploadFile: (file: File, filePath?: string) => Promise<void>;
  clearSession: () => Promise<void>;
  loadEmployees: () => Promise<void>;
  moveEmployee: (
    employeeId: number,
    performance: string,
    potential: string
  ) => Promise<void>;
  updateEmployee: (employeeId: number, updates: Partial<Employee>) => Promise<void>;
  updateChangeNotes: (employeeId: number, notes: string) => Promise<void>;
  updateDonutChangeNotes: (employeeId: number, notes: string) => Promise<void>;
  selectEmployee: (employeeId: number | null) => void;
  clearError: () => void;
  restoreSession: () => Promise<boolean>;

  // Donut Mode actions
  toggleDonutMode: (enabled: boolean) => Promise<void>;
  moveEmployeeDonut: (
    employeeId: number,
    performance: string,
    potential: string,
    notes?: string
  ) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  employees: [],
  originalEmployees: [],
  changes: [],
  filename: null,
  filePath: null,
  isLoading: false,
  error: null,
  selectedEmployeeId: null,

  // Donut Mode state
  donutModeActive: false,
  donutChanges: [],

  uploadFile: async (file: File, filePath?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.upload(file);

      // Load employees after upload
      const employeesResponse = await apiClient.getEmployees();

      // Persist session ID and file path to localStorage
      localStorage.setItem("session_id", response.session_id);
      if (filePath) {
        localStorage.setItem("last_file_path", filePath);
      }

      set({
        sessionId: response.session_id,
        filename: response.filename,
        filePath: filePath || null,
        employees: employeesResponse.employees,
        originalEmployees: employeesResponse.employees,
        changes: [],
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to upload file', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  clearSession: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.clearSession();

      // Clear session ID and file path from localStorage
      localStorage.removeItem("session_id");
      localStorage.removeItem("last_file_path");

      set({
        sessionId: null,
        employees: [],
        originalEmployees: [],
        changes: [],
        filename: null,
        filePath: null,
        isLoading: false,
        error: null,
        selectedEmployeeId: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to clear session', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  loadEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getEmployees();
      set({
        employees: response.employees,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to load employees', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  moveEmployee: async (
    employeeId: number,
    performance: string,
    potential: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.moveEmployee(
        employeeId,
        performance,
        potential
      );

      // Update employee in list
      const employees = get().employees;
      const updatedEmployees = employees.map((emp) =>
        emp.employee_id === employeeId ? response.employee : emp
      );

      // Update change history based on whether employee is modified
      let changes = get().changes;
      if (!response.employee.modified_in_session) {
        // Employee moved back to original position - remove change entry
        changes = changes.filter((c) => c.employee_id !== employeeId);
      } else {
        // Employee is modified - update or add change entry
        const existingChangeIndex = changes.findIndex((c) => c.employee_id === employeeId);
        if (existingChangeIndex >= 0) {
          // Update existing change entry
          changes = [...changes];
          changes[existingChangeIndex] = response.change;
        } else {
          // Add new change entry
          changes = [...changes, response.change];
        }
      }

      set({
        employees: updatedEmployees,
        changes,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to move employee', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateEmployee: async (employeeId: number, updates: Partial<Employee>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateEmployee(employeeId, updates);

      // Update employee in list
      const employees = get().employees;
      const updatedEmployees = employees.map((emp) =>
        emp.employee_id === employeeId ? response.employee : emp
      );

      set({
        employees: updatedEmployees,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to update employee', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateChangeNotes: async (employeeId: number, notes: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedChange = await apiClient.updateChangeNotes(employeeId, notes);

      // Update change in history
      const changes = get().changes.map((change) =>
        change.employee_id === employeeId ? updatedChange : change
      );

      set({
        changes,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to update change notes', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateDonutChangeNotes: async (employeeId: number, notes: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedChange = await apiClient.updateDonutChangeNotes(employeeId, notes);

      // Update donut change in history
      const donutChanges = get().donutChanges.map((change) =>
        change.employee_id === employeeId ? updatedChange : change
      );

      set({
        donutChanges,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to update donut change notes', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  selectEmployee: (employeeId: number | null) => {
    set({ selectedEmployeeId: employeeId });
  },

  clearError: () => {
    set({ error: null });
  },

  restoreSession: async () => {
    const cachedSessionId = localStorage.getItem("session_id");
    const cachedFilePath = localStorage.getItem("last_file_path");

    if (!cachedSessionId && !cachedFilePath) {
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      // Try to restore from existing backend session first
      if (cachedSessionId) {
        try {
          const sessionStatus = await apiClient.getSessionStatus();
          const employeesResponse = await apiClient.getEmployees();

          set({
            sessionId: sessionStatus.session_id,
            filename: sessionStatus.uploaded_filename,
            filePath: cachedFilePath,
            employees: employeesResponse.employees,
            originalEmployees: employeesResponse.employees,
            changes: sessionStatus.changes,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          // Session no longer exists, fall through to auto-reload
          logger.debug("Session expired, attempting to reload file from disk");
          localStorage.removeItem("session_id");
        }
      }

      // If session doesn't exist but we have a file path, try to auto-reload
      if (cachedFilePath && window.electronAPI?.readFile) {
        logger.debug("Auto-reloading file from:", cachedFilePath);
        const fileResult = await window.electronAPI.readFile(cachedFilePath);

        if (fileResult.success && fileResult.buffer && fileResult.fileName) {
          // Convert buffer array back to Uint8Array and create a File object
          const uint8Array = new Uint8Array(fileResult.buffer);
          const blob = new Blob([uint8Array], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const file = new File([blob], fileResult.fileName, {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          // Re-upload the file
          await get().uploadFile(file, cachedFilePath);
          logger.debug("File auto-reloaded successfully");
          return true;
        } else {
          logger.error("Failed to read file", fileResult.error);
          // File no longer exists or can't be read, clear the path
          localStorage.removeItem("last_file_path");
        }
      }

      set({
        sessionId: null,
        isLoading: false,
        error: null,
      });
      return false;
    } catch (error: unknown) {
      logger.error('Failed to restore session', error);
      set({
        sessionId: null,
        isLoading: false,
        error: null,
      });
      return false;
    }
  },

  // ==================== Donut Mode Actions ====================

  toggleDonutMode: async (enabled: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.toggleDonutMode(enabled);

      set({
        donutModeActive: response.donut_mode_active,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to toggle donut mode', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  moveEmployeeDonut: async (
    employeeId: number,
    performance: string,
    potential: string,
    notes?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.moveEmployeeDonut(
        employeeId,
        performance,
        potential,
        notes
      );

      // Update employee in list
      const employees = get().employees;
      const updatedEmployees = employees.map((emp) =>
        emp.employee_id === employeeId ? response.employee : emp
      );

      // Update donut change history based on whether employee is modified
      let donutChanges = get().donutChanges;
      if (!response.employee.donut_modified) {
        // Employee moved back to original position - remove change entry
        donutChanges = donutChanges.filter((c) => c.employee_id !== employeeId);
      } else {
        // Employee is modified - update or add change entry
        const existingChangeIndex = donutChanges.findIndex((c) => c.employee_id === employeeId);
        if (existingChangeIndex >= 0) {
          // Update existing change entry
          donutChanges = [...donutChanges];
          donutChanges[existingChangeIndex] = response.change;
        } else {
          // Add new change entry
          donutChanges = [...donutChanges, response.change];
        }
      }

      set({
        employees: updatedEmployees,
        donutChanges,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error('Failed to move employee in donut mode', error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },
}));
