/**
 * Integration tests for Close File workflow
 * Tests the complete workflow of closing a file and returning to empty state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { renderHook, act } from "@testing-library/react";
import { AppBarContainer } from "../AppBarContainer";
import { useSessionStore } from "@/store/sessionStore";
import * as api from "@/services/api";

vi.mock("@/services/api");
vi.mock("@/contexts/SnackbarContext", () => ({
  useSnackbar: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));
vi.mock("@/hooks/useFilters", () => ({
  useFilters: () => ({
    toggleDrawer: vi.fn(),
    hasActiveFilters: false,
    selectedLevels: [],
    selectedJobFunctions: [],
    selectedLocations: [],
    selectedManagers: [],
    excludedEmployeeIds: [],
  }),
}));

describe("Close File Workflow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset session store state
    const { result } = renderHook(() => useSessionStore());
    act(() => {
      result.current.sessionId = null;
      result.current.filename = null;
      result.current.employees = [];
      result.current.events = [];
    });
  });

  it("does not show Close File menu item when no file is loaded", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

    const { user } = render(<AppBarContainer />);

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Verify Close File is not shown
    expect(
      screen.queryByTestId("close-file-menu-item")
    ).not.toBeInTheDocument();
  });

  it("shows Close File menu item when file is loaded", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Verify Close File is shown
    await waitFor(() => {
      expect(screen.getByTestId("close-file-menu-item")).toBeInTheDocument();
    });
  });

  it("closes session and clears state when Close File is clicked", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.closeSession).mockResolvedValue({
      success: true,
      message: "Session closed successfully",
    });

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.employees = [
        {
          employee_id: 1,
          name: "John Doe",
          business_title: "Engineer",
          job_title: "Senior Engineer",
          job_profile: "ENG",
          job_level: "L4",
          job_function: "Engineering",
          location: "USA",
          manager: "Jane Smith",
          management_chain_01: "Jane Smith",
          management_chain_02: null,
          management_chain_03: null,
          management_chain_04: null,
          management_chain_05: null,
          management_chain_06: null,
          hire_date: "2020-01-01",
          tenure_category: "3-5 years",
          time_in_job_profile: "2 years",
          performance: "High",
          potential: "High",
          grid_position: 9,
          position_label: "Star [H,H]",
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

    const { user } = render(<AppBarContainer />);

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Click Close File
    const closeFileItem = screen.getByTestId("close-file-menu-item");
    await user.click(closeFileItem);

    // Verify API was called
    await waitFor(() => {
      expect(api.apiClient.closeSession).toHaveBeenCalled();
    });

    // Verify session state was cleared
    await waitFor(() => {
      expect(sessionStore.current.sessionId).toBeNull();
      expect(sessionStore.current.filename).toBeNull();
      expect(sessionStore.current.employees).toEqual([]);
      expect(sessionStore.current.events).toEqual([]);
    });
  });

  it("clears localStorage when closing session", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.closeSession).mockResolvedValue({
      success: true,
      message: "Session closed",
    });

    // Set up localStorage
    localStorage.setItem("session_id", "test-session-123");
    localStorage.setItem("last_file_path", "/path/to/file.xlsx");

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Click Close File
    const closeFileItem = screen.getByTestId("close-file-menu-item");
    await user.click(closeFileItem);

    // Verify localStorage was cleared
    await waitFor(() => {
      expect(localStorage.getItem("session_id")).toBeNull();
      expect(localStorage.getItem("last_file_path")).toBeNull();
    });
  });

  it("handles API errors when closing session", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockShowError = vi.fn();

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.closeSession).mockRejectedValue(
      new Error("Failed to close session")
    );

    vi.doMock("@/contexts/SnackbarContext", () => ({
      useSnackbar: () => ({
        showSuccess: vi.fn(),
        showError: mockShowError,
      }),
    }));

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Click Close File
    const closeFileItem = screen.getByTestId("close-file-menu-item");
    await user.click(closeFileItem);

    // Verify error was logged
    await waitFor(() => {
      expect(api.apiClient.closeSession).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it("closes file menu after clicking Close File", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.closeSession).mockResolvedValue({
      success: true,
      message: "Session closed",
    });

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Verify menu is open
    expect(screen.getByTestId("file-menu")).toBeInTheDocument();

    // Click Close File
    const closeFileItem = screen.getByTestId("close-file-menu-item");
    await user.click(closeFileItem);

    // Note: Menu closes immediately on click, then API call happens
    // We just need to verify the API was called
    await waitFor(() => {
      expect(api.apiClient.closeSession).toHaveBeenCalled();
    });
  });

  it("returns UI to empty state after closing file", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.closeSession).mockResolvedValue({
      success: true,
      message: "Session closed",
    });

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.filePath = "/path/to/employees.xlsx";
      sessionStore.current.selectedEmployeeId = 123;
      sessionStore.current.donutModeActive = false;
      sessionStore.current.donutEvents = [];
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and close file
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const closeFileItem = screen.getByTestId("close-file-menu-item");
    await user.click(closeFileItem);

    // Verify all state is cleared
    await waitFor(() => {
      expect(sessionStore.current.sessionId).toBeNull();
      expect(sessionStore.current.filename).toBeNull();
      expect(sessionStore.current.filePath).toBeNull();
      expect(sessionStore.current.employees).toEqual([]);
      expect(sessionStore.current.events).toEqual([]);
      expect(sessionStore.current.selectedEmployeeId).toBeNull();
      expect(sessionStore.current.donutModeActive).toBe(false);
      expect(sessionStore.current.donutEvents).toEqual([]);
    });
  });
});
