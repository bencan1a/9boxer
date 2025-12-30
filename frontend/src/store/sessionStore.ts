/**
 * Session store using Zustand
 */

import { create } from "zustand";
import { apiClient } from "../services/api";
import { Employee } from "../types/employee";
import { TrackableEvent } from "../types/events";
import { extractErrorMessage } from "../types/errors";
import { logger } from "../utils/logger";

/**
 * Process employees to add "big_mover" to flags array when is_big_mover is true.
 * This ensures the computed backend property is reflected in the frontend flag system.
 */
function processEmployeesWithBigMoverFlag(employees: Employee[]): Employee[] {
  return employees.map((emp) => {
    if (emp.is_big_mover) {
      // Add "big_mover" to flags array if not already present
      const flags = emp.flags || [];
      if (!flags.includes("big_mover")) {
        return { ...emp, flags: [...flags, "big_mover"] };
      }
    }
    return emp;
  });
}

interface SessionState {
  sessionId: string | null;
  employees: Employee[];
  originalEmployees: Employee[];
  events: TrackableEvent[];
  filename: string | null;
  filePath: string | null;
  isLoading: boolean;
  error: string | null;
  selectedEmployeeId: number | null;

  // Donut Mode state
  donutModeActive: boolean;
  donutEvents: TrackableEvent[];

  // Actions
  uploadFile: (file: File, filePath?: string) => Promise<void>;
  clearSession: () => Promise<void>;
  closeSession: () => Promise<void>;
  loadEmployees: () => Promise<void>;
  moveEmployee: (
    employeeId: number,
    performance: string,
    potential: string
  ) => Promise<void>;
  updateEmployee: (
    employeeId: number,
    updates: Partial<Employee>
  ) => Promise<void>;
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
  events: [],
  filename: null,
  filePath: null,
  isLoading: false,
  error: null,
  selectedEmployeeId: null,

  // Donut Mode state
  donutModeActive: false,
  donutEvents: [],

  uploadFile: async (file: File, filePath?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Pass filePath to backend so it knows the real file location
      const response = await apiClient.upload(file, filePath);

      // Load employees after upload
      const employeesResponse = await apiClient.getEmployees();

      // Persist session ID and file path to localStorage
      localStorage.setItem("session_id", response.session_id);
      if (filePath) {
        localStorage.setItem("last_file_path", filePath);
      }

      // Auto-select first employee in box 5 when uploading a new file
      let selectedEmployeeId: number | null = null;
      const box5Employees = employeesResponse.employees.filter(
        (emp) => emp.grid_position === 5
      );
      if (box5Employees.length > 0) {
        selectedEmployeeId = box5Employees[0].employee_id;
      }

      const processedEmployees = processEmployeesWithBigMoverFlag(
        employeesResponse.employees
      );

      set({
        sessionId: response.session_id,
        filename: response.filename,
        filePath: filePath || null,
        employees: processedEmployees,
        originalEmployees: processedEmployees,
        events: [],
        donutEvents: [],
        selectedEmployeeId,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to upload file", error);
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
        events: [],
        donutEvents: [],
        filename: null,
        filePath: null,
        isLoading: false,
        error: null,
        selectedEmployeeId: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to clear session", error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  closeSession: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.closeSession();

      // Clear all session state
      set({
        sessionId: null,
        employees: [],
        originalEmployees: [],
        events: [],
        filename: null,
        filePath: null,
        selectedEmployeeId: null,
        donutModeActive: false,
        donutEvents: [],
        isLoading: false,
        error: null,
      });

      // Clear localStorage
      localStorage.removeItem("session_id");
      localStorage.removeItem("last_file_path");

      logger.info("Session closed successfully");
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to close session:", errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  loadEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getEmployees();

      // Get session ID from localStorage if not already in store
      const currentSessionId = get().sessionId;
      const cachedSessionId = localStorage.getItem("session_id");

      // Auto-select first employee in box 5 if no employee is currently selected
      const currentSelectedId = get().selectedEmployeeId;
      let selectedEmployeeId = currentSelectedId;

      if (!currentSelectedId) {
        const box5Employees = response.employees.filter(
          (emp) => emp.grid_position === 5
        );
        if (box5Employees.length > 0) {
          selectedEmployeeId = box5Employees[0].employee_id;
        }
      }

      const processedEmployees = processEmployeesWithBigMoverFlag(
        response.employees
      );

      set({
        employees: processedEmployees,
        originalEmployees: processedEmployees,
        sessionId: currentSessionId || cachedSessionId,
        selectedEmployeeId,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to load employees", error);
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
      const updatedEmployees = processEmployeesWithBigMoverFlag(
        employees.map((emp) =>
          emp.employee_id === employeeId ? response.employee : emp
        )
      );

      // Update event history based on whether employee is modified
      let events = get().events;
      if (!response.employee.modified_in_session) {
        // Employee moved back to original position - remove event entry
        events = events.filter((e) => e.employee_id !== employeeId);
      } else {
        // Employee is modified - update or add event entry
        const existingEventIndex = events.findIndex(
          (e) =>
            e.employee_id === employeeId &&
            e.event_type === response.change.event_type
        );
        if (existingEventIndex >= 0) {
          // Update existing event entry
          events = [...events];
          events[existingEventIndex] = response.change;
        } else {
          // Add new event entry
          events = [...events, response.change];
        }
      }

      set({
        employees: updatedEmployees,
        events,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to move employee", error);
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
      const updatedEmployees = processEmployeesWithBigMoverFlag(
        employees.map((emp) =>
          emp.employee_id === employeeId ? response.employee : emp
        )
      );

      // Reload session status to get updated events from backend
      // Backend now handles flag event tracking
      const sessionStatus = await apiClient.getSessionStatus();

      set({
        employees: updatedEmployees,
        events: sessionStatus.events,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to update employee", error);
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
      const updatedEvent = await apiClient.updateChangeNotes(employeeId, notes);

      // Update event in history
      const events = get().events.map((event) =>
        event.employee_id === employeeId ? updatedEvent : event
      );

      set({
        events,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to update event notes", error);
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
      const updatedEvent = await apiClient.updateDonutChangeNotes(
        employeeId,
        notes
      );

      // Update donut event in history
      const donutEvents = get().donutEvents.map((event) =>
        event.employee_id === employeeId ? updatedEvent : event
      );

      set({
        donutEvents,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to update donut event notes", error);
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
        const sessionStatus = await apiClient.getSessionStatus();

        // Check if session is actually active
        if (sessionStatus.active) {
          const employeesResponse = await apiClient.getEmployees();

          // Auto-select first employee in box 5 if no employee is selected
          const currentSelectedId = get().selectedEmployeeId;
          let selectedEmployeeId = currentSelectedId;

          if (!currentSelectedId) {
            const box5Employees = employeesResponse.employees.filter(
              (emp) => emp.grid_position === 5
            );
            if (box5Employees.length > 0) {
              selectedEmployeeId = box5Employees[0].employee_id;
            }
          }

          const processedEmployees = processEmployeesWithBigMoverFlag(
            employeesResponse.employees
          );

          set({
            sessionId: sessionStatus.session_id,
            filename: sessionStatus.uploaded_filename,
            filePath: cachedFilePath,
            employees: processedEmployees,
            originalEmployees: processedEmployees,
            events: sessionStatus.events,
            donutEvents: [],
            selectedEmployeeId,
            isLoading: false,
            error: null,
          });

          return true;
        } else {
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
        employees: [],
        originalEmployees: [],
        events: [],
        donutEvents: [],
        isLoading: false,
        error: null,
      });
      return false;
    } catch (error: unknown) {
      logger.error("Failed to restore session", error);
      set({
        sessionId: null,
        employees: [],
        originalEmployees: [],
        events: [],
        donutEvents: [],
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
      logger.error("Failed to toggle donut mode", error);
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
      const updatedEmployees = processEmployeesWithBigMoverFlag(
        employees.map((emp) =>
          emp.employee_id === employeeId ? response.employee : emp
        )
      );

      // Update donut event history based on whether employee is modified
      let donutEvents = get().donutEvents;
      if (!response.employee.donut_modified) {
        // Employee moved back to original position - remove event entry
        donutEvents = donutEvents.filter((e) => e.employee_id !== employeeId);
      } else {
        // Employee is modified - update or add event entry
        const existingEventIndex = donutEvents.findIndex(
          (e) =>
            e.employee_id === employeeId &&
            e.event_type === response.change.event_type
        );
        if (existingEventIndex >= 0) {
          // Update existing event entry
          donutEvents = [...donutEvents];
          donutEvents[existingEventIndex] = response.change;
        } else {
          // Add new event entry
          donutEvents = [...donutEvents, response.change];
        }
      }

      set({
        employees: updatedEmployees,
        donutEvents,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to move employee in donut mode", error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },
}));
