/**
 * Session store using Zustand
 */

import { create } from "zustand";
import { apiClient } from "../services/api";
import { Employee } from "../types/employee";
import { EmployeeMove } from "../types/session";

interface SessionState {
  sessionId: string | null;
  employees: Employee[];
  originalEmployees: Employee[];
  changes: EmployeeMove[];
  filename: string | null;
  isLoading: boolean;
  error: string | null;
  selectedEmployeeId: number | null;

  // Actions
  uploadFile: (file: File) => Promise<void>;
  clearSession: () => Promise<void>;
  loadEmployees: () => Promise<void>;
  moveEmployee: (
    employeeId: number,
    performance: string,
    potential: string
  ) => Promise<void>;
  selectEmployee: (employeeId: number | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  employees: [],
  originalEmployees: [],
  changes: [],
  filename: null,
  isLoading: false,
  error: null,
  selectedEmployeeId: null,

  uploadFile: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.upload(file);

      // Load employees after upload
      const employeesResponse = await apiClient.getEmployees();

      set({
        sessionId: response.session_id,
        filename: response.filename,
        employees: employeesResponse.employees,
        originalEmployees: employeesResponse.employees,
        changes: [],
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to upload file";
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
      set({
        sessionId: null,
        employees: [],
        originalEmployees: [],
        changes: [],
        filename: null,
        isLoading: false,
        error: null,
        selectedEmployeeId: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to clear session";
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
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to load employees";
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

      // Add change to history
      const changes = [...get().changes, response.change];

      set({
        employees: updatedEmployees,
        changes,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to move employee";
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
}));
