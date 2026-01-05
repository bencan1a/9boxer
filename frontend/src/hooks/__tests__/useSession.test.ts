import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSession } from "../useSession";
import { useSessionStore } from "../../store/sessionStore";

// Mock the session store
vi.mock("../../store/sessionStore");

describe("useSession", () => {
  const mockUploadFile = vi.fn();
  const mockClearSession = vi.fn();
  const mockLoadEmployees = vi.fn();
  const mockMoveEmployee = vi.fn();
  const mockUpdateChangeNotes = vi.fn();
  const mockSelectEmployee = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sessionId: null,
      employees: [],
      originalEmployees: [],
      changes: [],
      filename: null,
      isLoading: false,
      error: null,
      uploadFile: mockUploadFile,
      clearSession: mockClearSession,
      loadEmployees: mockLoadEmployees,
      moveEmployee: mockMoveEmployee,
      updateChangeNotes: mockUpdateChangeNotes,
      selectedEmployeeId: null,
      selectEmployee: mockSelectEmployee,
    });
  });

  describe("State delegation", () => {
    it("returns sessionId from store", () => {
      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        sessionId: "test-session-123",
        employees: [],
        originalEmployees: [],
        filename: null,
        isLoading: false,
        error: null,
        uploadFile: mockUploadFile,
        clearSession: mockClearSession,
        loadEmployees: mockLoadEmployees,
        moveEmployee: mockMoveEmployee,
        updateChangeNotes: mockUpdateChangeNotes,
        selectedEmployeeId: null,
        selectEmployee: mockSelectEmployee,
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.sessionId).toBe("test-session-123");
    });

    it("returns employees from store", () => {
      const mockEmployees = [
        { employee_id: 1, name: "Employee 1" },
        { employee_id: 2, name: "Employee 2" },
      ];

      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        sessionId: null,
        employees: mockEmployees,
        originalEmployees: [],
        filename: null,
        isLoading: false,
        error: null,
        uploadFile: mockUploadFile,
        clearSession: mockClearSession,
        loadEmployees: mockLoadEmployees,
        moveEmployee: mockMoveEmployee,
        updateChangeNotes: mockUpdateChangeNotes,
        selectedEmployeeId: null,
        selectEmployee: mockSelectEmployee,
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.employees).toEqual(mockEmployees);
    });

    it("returns originalEmployees from store", () => {
      const mockOriginalEmployees = [
        { employee_id: 1, name: "Original Employee 1" },
      ];

      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        sessionId: null,
        employees: [],
        originalEmployees: mockOriginalEmployees,
        filename: null,
        isLoading: false,
        error: null,
        uploadFile: mockUploadFile,
        clearSession: mockClearSession,
        loadEmployees: mockLoadEmployees,
        moveEmployee: mockMoveEmployee,
        updateChangeNotes: mockUpdateChangeNotes,
        selectedEmployeeId: null,
        selectEmployee: mockSelectEmployee,
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.originalEmployees).toEqual(mockOriginalEmployees);
    });

    it("returns filename from store", () => {
      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        sessionId: null,
        employees: [],
        originalEmployees: [],
        filename: "test-file.xlsx",
        isLoading: false,
        error: null,
        uploadFile: mockUploadFile,
        clearSession: mockClearSession,
        loadEmployees: mockLoadEmployees,
        moveEmployee: mockMoveEmployee,
        updateChangeNotes: mockUpdateChangeNotes,
        selectedEmployeeId: null,
        selectEmployee: mockSelectEmployee,
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.filename).toBe("test-file.xlsx");
    });

    it("returns isLoading from store", () => {
      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        sessionId: null,
        employees: [],
        originalEmployees: [],
        filename: null,
        isLoading: true,
        error: null,
        uploadFile: mockUploadFile,
        clearSession: mockClearSession,
        loadEmployees: mockLoadEmployees,
        moveEmployee: mockMoveEmployee,
        updateChangeNotes: mockUpdateChangeNotes,
        selectedEmployeeId: null,
        selectEmployee: mockSelectEmployee,
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.isLoading).toBe(true);
    });

    it("returns error from store", () => {
      const mockError = new Error("Test error");

      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        sessionId: null,
        employees: [],
        originalEmployees: [],
        filename: null,
        isLoading: false,
        error: mockError,
        uploadFile: mockUploadFile,
        clearSession: mockClearSession,
        loadEmployees: mockLoadEmployees,
        moveEmployee: mockMoveEmployee,
        updateChangeNotes: mockUpdateChangeNotes,
        selectedEmployeeId: null,
        selectEmployee: mockSelectEmployee,
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.error).toBe(mockError);
    });

    it("returns selectedEmployeeId from store", () => {
      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        sessionId: null,
        employees: [],
        originalEmployees: [],
        filename: null,
        isLoading: false,
        error: null,
        uploadFile: mockUploadFile,
        clearSession: mockClearSession,
        loadEmployees: mockLoadEmployees,
        moveEmployee: mockMoveEmployee,
        updateChangeNotes: mockUpdateChangeNotes,
        selectedEmployeeId: 456,
        selectEmployee: mockSelectEmployee,
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.selectedEmployeeId).toBe(456);
    });
  });

  describe("Action delegation", () => {
    it("delegates uploadFile to store", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.uploadFile).toBe(mockUploadFile);
    });

    it("delegates clearSession to store", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.clearSession).toBe(mockClearSession);
    });

    it("delegates loadEmployees to store", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.loadEmployees).toBe(mockLoadEmployees);
    });

    it("delegates moveEmployee to store", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.moveEmployee).toBe(mockMoveEmployee);
    });

    it("delegates updateChangeNotes to store", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.updateChangeNotes).toBe(mockUpdateChangeNotes);
    });

    it("delegates selectEmployee to store", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.selectEmployee).toBe(mockSelectEmployee);
    });
  });

  describe("Hook stability", () => {
    it("returns stable function references across re-renders", () => {
      const { result, rerender } = renderHook(() => useSession());

      const firstRenderFunctions = {
        uploadFile: result.current.uploadFile,
        clearSession: result.current.clearSession,
        loadEmployees: result.current.loadEmployees,
        moveEmployee: result.current.moveEmployee,
        updateChangeNotes: result.current.updateChangeNotes,
        selectEmployee: result.current.selectEmployee,
      };

      rerender();

      expect(result.current.uploadFile).toBe(firstRenderFunctions.uploadFile);
      expect(result.current.clearSession).toBe(
        firstRenderFunctions.clearSession
      );
      expect(result.current.loadEmployees).toBe(
        firstRenderFunctions.loadEmployees
      );
      expect(result.current.moveEmployee).toBe(
        firstRenderFunctions.moveEmployee
      );
      expect(result.current.updateChangeNotes).toBe(
        firstRenderFunctions.updateChangeNotes
      );
      expect(result.current.selectEmployee).toBe(
        firstRenderFunctions.selectEmployee
      );
    });
  });

  describe("Complete return object", () => {
    it("returns all expected properties", () => {
      const { result } = renderHook(() => useSession());

      expect(result.current).toHaveProperty("sessionId");
      expect(result.current).toHaveProperty("employees");
      expect(result.current).toHaveProperty("originalEmployees");
      expect(result.current).toHaveProperty("filename");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("uploadFile");
      expect(result.current).toHaveProperty("clearSession");
      expect(result.current).toHaveProperty("loadEmployees");
      expect(result.current).toHaveProperty("moveEmployee");
      expect(result.current).toHaveProperty("updateChangeNotes");
      expect(result.current).toHaveProperty("selectedEmployeeId");
      expect(result.current).toHaveProperty("selectEmployee");
    });
  });
});
