/**
 * Integration tests for Store interactions
 * Tests how sessionStore and uiStore work together
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSessionStore } from "../sessionStore";
import { useUiStore } from "../uiStore";
import { PerformanceLevel, PotentialLevel } from "@/types/employee";
import * as api from "@/services/api";

vi.mock("@/services/api");

// Mock Electron API
global.window.electronAPI = {
  readFile: vi.fn(),
} as any;

describe("Store Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset stores
    const { result: sessionStore } = renderHook(() => useSessionStore());
    const { result: uiStore } = renderHook(() => useUiStore());

    act(() => {
      sessionStore.current.sessionId = null;
      sessionStore.current.filename = null;
      sessionStore.current.filePath = null;
      sessionStore.current.employees = [];
      sessionStore.current.events = [];
      uiStore.current.recentFiles = [];
    });
  });

  it("session upload workflow integrates with recent files", async () => {
    const mockSessionId = "session-123";
    const mockFilename = "employees.xlsx";
    const mockFilePath = "/path/to/employees.xlsx";

    vi.mocked(api.apiClient.upload).mockResolvedValue({
      session_id: mockSessionId,
      filename: mockFilename,
      employee_count: 10,
      uploaded_at: new Date().toISOString(),
    });

    vi.mocked(api.apiClient.getEmployees).mockResolvedValue({
      employees: [],
      total: 0,
      filtered: 0,
    });

    vi.mocked(api.apiClient.addRecentFile).mockResolvedValue({ success: true });
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([
      { path: mockFilePath, name: mockFilename, lastAccessed: Date.now() },
    ]);

    const { result: sessionStore } = renderHook(() => useSessionStore());
    const { result: uiStore } = renderHook(() => useUiStore());

    // Upload file
    const file = new File(["content"], mockFilename, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await act(async () => {
      await sessionStore.current.uploadFile(file, mockFilePath);
    });

    // Verify session was created
    expect(sessionStore.current.sessionId).toBe(mockSessionId);
    expect(sessionStore.current.filename).toBe(mockFilename);
    expect(sessionStore.current.filePath).toBe(mockFilePath);

    // Verify localStorage was updated
    expect(localStorage.getItem("session_id")).toBe(mockSessionId);
    expect(localStorage.getItem("last_file_path")).toBe(mockFilePath);

    // Add to recent files and reload
    await act(async () => {
      await uiStore.current.addRecentFile(mockFilePath, mockFilename);
    });

    // Verify recent file was added
    expect(api.apiClient.addRecentFile).toHaveBeenCalledWith(
      mockFilePath,
      mockFilename
    );
    expect(api.apiClient.getRecentFiles).toHaveBeenCalled();
    expect(uiStore.current.recentFiles).toHaveLength(1);
    expect(uiStore.current.recentFiles[0].name).toBe(mockFilename);
  });

  it("session clear workflow clears both session and localStorage", async () => {
    // Set up initial state
    const mockSessionId = "session-123";
    localStorage.setItem("session_id", mockSessionId);
    localStorage.setItem("last_file_path", "/path/to/file.xlsx");

    vi.mocked(api.apiClient.clearSession).mockResolvedValue({
      success: true,
    });

    const { result: sessionStore } = renderHook(() => useSessionStore());

    // Set initial session state
    act(() => {
      sessionStore.current.sessionId = mockSessionId;
      sessionStore.current.filename = "test.xlsx";
      sessionStore.current.employees = [
        {
          employee_id: 1,
          name: "Test Employee",
          business_title: "Engineer",
          job_title: "Senior Engineer",
          job_profile: "ENG",
          job_level: "L4",
          job_function: "Engineering",
          location: "USA",
          manager: "Manager",
          management_chain_01: "Manager",
          management_chain_02: null,
          management_chain_03: null,
          management_chain_04: null,
          management_chain_05: null,
          management_chain_06: null,
          hire_date: "2020-01-01",
          tenure_category: "3-5 years",
          time_in_job_profile: "2 years",
          performance: PerformanceLevel.HIGH,
          potential: PotentialLevel.HIGH,
          grid_position: 9,
          talent_indicator: "High Performer",
          ratings_history: [],
          development_focus: null,
          development_action: null,
          notes: null,
          promotion_status: null,
          promotion_readiness: false,
          modified_in_session: false,
          last_modified: null,
        },
      ];
    });

    // Clear session
    await act(async () => {
      await sessionStore.current.clearSession();
    });

    // Verify session state cleared
    expect(sessionStore.current.sessionId).toBeNull();
    expect(sessionStore.current.filename).toBeNull();
    expect(sessionStore.current.employees).toEqual([]);

    // Verify localStorage cleared
    expect(localStorage.getItem("session_id")).toBeNull();
    expect(localStorage.getItem("last_file_path")).toBeNull();
  });

  it("session restore integrates with UI state", async () => {
    const mockSessionId = "session-123";
    const mockFilePath = "/path/to/file.xlsx";

    // Set up localStorage
    localStorage.setItem("session_id", mockSessionId);
    localStorage.setItem("last_file_path", mockFilePath);

    vi.mocked(api.apiClient.getSessionStatus).mockResolvedValue({
      session_id: mockSessionId,
      active: true,
      employee_count: 5,
      changes_count: 2,
      events: [],
      uploaded_filename: "employees.xlsx",
      created_at: new Date().toISOString(),
    });

    vi.mocked(api.apiClient.getEmployees).mockResolvedValue({
      employees: [],
      total: 0,
      filtered: 0,
    });

    const { result: sessionStore } = renderHook(() => useSessionStore());

    // Restore session
    let restored = false;
    await act(async () => {
      restored = await sessionStore.current.restoreSession();
    });

    // Verify session was restored
    expect(restored).toBe(true);
    expect(sessionStore.current.sessionId).toBe(mockSessionId);
    expect(sessionStore.current.filename).toBe("employees.xlsx");
    expect(sessionStore.current.filePath).toBe(mockFilePath);
  });

  it("handles session expiration and file reload", async () => {
    const mockFilePath = "/path/to/file.xlsx";
    const mockFileName = "employees.xlsx";

    // Set up localStorage with expired session
    localStorage.setItem("session_id", "expired-session");
    localStorage.setItem("last_file_path", mockFilePath);

    // Session is expired (not active)
    vi.mocked(api.apiClient.getSessionStatus).mockResolvedValue({
      session_id: null,
      active: false,
      employee_count: 0,
      changes_count: 0,
      events: [],
      uploaded_filename: null,
      created_at: null,
    });

    // Mock file read from Electron API
    const mockFileContent = new Uint8Array([1, 2, 3, 4, 5]);
    if (window.electronAPI) {
      vi.mocked(window.electronAPI.readFile).mockResolvedValue({
        success: true,
        buffer: Array.from(mockFileContent),
        fileName: mockFileName,
      });
    }

    // Mock upload after file read
    vi.mocked(api.apiClient.upload).mockResolvedValue({
      session_id: "new-session-123",
      filename: mockFileName,
      employee_count: 10,
      uploaded_at: new Date().toISOString(),
    });

    vi.mocked(api.apiClient.getEmployees).mockResolvedValue({
      employees: [],
      total: 0,
      filtered: 0,
    });

    const { result: sessionStore } = renderHook(() => useSessionStore());

    // Restore session (should trigger file reload)
    let restored = false;
    await act(async () => {
      restored = await sessionStore.current.restoreSession();
    });

    // Verify file was reloaded
    await waitFor(() => {
      if (window.electronAPI) {
        expect(window.electronAPI.readFile).toHaveBeenCalledWith(mockFilePath);
      }
      expect(api.apiClient.upload).toHaveBeenCalled();
      expect(restored).toBe(true);
      expect(sessionStore.current.sessionId).toBe("new-session-123");
    });
  });

  it("recent files persist across UI store resets", async () => {
    const mockRecentFiles = [
      { path: "/file1.xlsx", name: "file1.xlsx", lastAccessed: 1000 },
      { path: "/file2.xlsx", name: "file2.xlsx", lastAccessed: 2000 },
    ];

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue(mockRecentFiles);

    const { result: uiStore } = renderHook(() => useUiStore());

    // Load recent files
    await act(async () => {
      await uiStore.current.loadRecentFiles();
    });

    // Verify files loaded
    expect(uiStore.current.recentFiles).toEqual(mockRecentFiles);

    // Create new hook instance (simulates component unmount/remount)
    const { result: newUiStore } = renderHook(() => useUiStore());

    // Recent files should still be available (from persist middleware)
    expect(newUiStore.current.recentFiles).toEqual(mockRecentFiles);
  });

  it("theme changes persist across UI store resets", () => {
    const { result: uiStore } = renderHook(() => useUiStore());

    // Change theme mode
    act(() => {
      uiStore.current.setThemeMode("dark");
    });

    expect(uiStore.current.themeMode).toBe("dark");
    expect(uiStore.current.effectiveTheme).toBe("dark");

    // Create new hook instance (simulates component unmount/remount)
    const { result: newUiStore } = renderHook(() => useUiStore());

    // Theme preference should persist
    expect(newUiStore.current.themeMode).toBe("dark");
  });

  it("session close workflow clears all related state", async () => {
    const mockSessionId = "session-123";

    vi.mocked(api.apiClient.closeSession).mockResolvedValue({
      success: true,
      message: "Session closed",
    });

    const { result: sessionStore } = renderHook(() => useSessionStore());

    // Set up initial state
    act(() => {
      sessionStore.current.sessionId = mockSessionId;
      sessionStore.current.filename = "test.xlsx";
      sessionStore.current.filePath = "/path/to/test.xlsx";
      sessionStore.current.selectedEmployeeId = 123;
      sessionStore.current.donutModeActive = true;
    });

    localStorage.setItem("session_id", mockSessionId);
    localStorage.setItem("last_file_path", "/path/to/test.xlsx");

    // Close session
    await act(async () => {
      await sessionStore.current.closeSession();
    });

    // Verify all state cleared
    expect(sessionStore.current.sessionId).toBeNull();
    expect(sessionStore.current.filename).toBeNull();
    expect(sessionStore.current.filePath).toBeNull();
    expect(sessionStore.current.employees).toEqual([]);
    expect(sessionStore.current.events).toEqual([]);
    expect(sessionStore.current.selectedEmployeeId).toBeNull();
    expect(sessionStore.current.donutModeActive).toBe(false);
    expect(sessionStore.current.donutEvents).toEqual([]);

    // Verify localStorage cleared
    expect(localStorage.getItem("session_id")).toBeNull();
    expect(localStorage.getItem("last_file_path")).toBeNull();
  });

  it("handles API errors gracefully in store operations", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(api.apiClient.getRecentFiles).mockRejectedValue(
      new Error("API Error")
    );

    const { result: uiStore } = renderHook(() => useUiStore());

    // Attempt to load recent files
    await act(async () => {
      await uiStore.current.loadRecentFiles();
    });

    // Should not throw, should set empty array
    expect(uiStore.current.recentFiles).toEqual([]);

    consoleError.mockRestore();
  });
});
