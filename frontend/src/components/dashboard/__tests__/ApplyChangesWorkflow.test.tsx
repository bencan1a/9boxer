/**
 * Integration tests for Apply Changes workflow
 * Tests the complete workflow of applying changes to Excel file via ApplyChangesDialog
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { renderHook, act } from "@testing-library/react";
import { AppBarContainer } from "../AppBarContainer";
import { useSessionStore } from "@/store/sessionStore";
import * as api from "@/services/api";

// Mock window.electronAPI
const mockSaveFileDialog = vi.fn();
global.window.electronAPI = {
  saveFileDialog: mockSaveFileDialog,
} as any;

vi.mock("@/services/api");

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock("@/contexts/SnackbarContext", () => ({
  useSnackbar: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
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

describe("Apply Changes Workflow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockShowSuccess.mockClear();
    mockShowError.mockClear();

    // Reset session store state
    const { result } = renderHook(() => useSessionStore());
    act(() => {
      result.current.sessionId = null;
      result.current.filename = null;
      result.current.employees = [];
      result.current.events = [];
    });
  });

  it("shows error when trying to export with no session", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

    // Set up state with changes but no session
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = null;
      sessionStore.current.filename = null;
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Click Export
    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Verify error was shown and dialog not opened
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalled();
    });
    expect(
      screen.queryByTestId("apply-changes-dialog")
    ).not.toBeInTheDocument();
  });

  it("shows ApplyChangesDialog when export is clicked with active session", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Click Export
    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Verify dialog is shown
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });
  });

  it("calls API correctly when applying changes in update_original mode", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.exportSession).mockResolvedValue({
      success: true,
      message: "Changes applied successfully",
      file_path: "/path/to/employees.xlsx",
    });
    vi.mocked(api.apiClient.getSessionStatus).mockResolvedValue({
      session_id: "test-session-123",
      active: true,
      uploaded_filename: "employees.xlsx",
      events: [],
      employee_count: 100,
      changes_count: 0,
      created_at: "2024-01-01T00:00:00Z",
    });

    localStorage.setItem("last_file_path", "/path/to/employees.xlsx");

    // Mock loadEmployees
    const mockLoadEmployees = vi.fn().mockResolvedValue(undefined);

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
      sessionStore.current.loadEmployees = mockLoadEmployees;
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and export
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });

    // Click Apply without checking "save as new"
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    // Verify API was called with correct mode
    await waitFor(() => {
      expect(api.apiClient.exportSession).toHaveBeenCalledWith({
        mode: "update_original",
      });
    });
  });

  it("calls API correctly when applying changes in save_new mode", async () => {
    const newPath = "/path/to/new_file.xlsx";
    mockSaveFileDialog.mockResolvedValue(newPath);

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.exportSession).mockResolvedValue({
      success: true,
      message: "Changes saved to new file",
      file_path: newPath,
    });
    vi.mocked(api.apiClient.getSessionStatus).mockResolvedValue({
      session_id: "test-session-123",
      active: true,
      uploaded_filename: "new_file.xlsx",
      events: [],
      employee_count: 100,
      changes_count: 0,
      created_at: "2024-01-01T00:00:00Z",
    });

    // Mock loadEmployees
    const mockLoadEmployees = vi.fn().mockResolvedValue(undefined);

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
      sessionStore.current.loadEmployees = mockLoadEmployees;
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and export
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });

    // Check "save as new" checkbox
    const saveAsNewCheckbox = screen.getByTestId("save-as-new-checkbox");
    await user.click(saveAsNewCheckbox);

    // Click Apply
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    // Verify file dialog was shown
    await waitFor(() => {
      expect(mockSaveFileDialog).toHaveBeenCalledWith("employees.xlsx");
    });

    // Verify API was called with correct mode and path
    await waitFor(() => {
      expect(api.apiClient.exportSession).toHaveBeenCalledWith({
        mode: "save_new",
        new_path: newPath,
      });
    });
  });

  it("shows success message and closes dialog on successful apply", async () => {
    const filePath = "/path/to/employees.xlsx";
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.exportSession).mockResolvedValue({
      success: true,
      message: "Changes applied successfully",
      file_path: filePath,
    });
    vi.mocked(api.apiClient.getSessionStatus).mockResolvedValue({
      session_id: "test-session-123",
      active: true,
      uploaded_filename: "employees.xlsx",
      events: [],
      employee_count: 100,
      changes_count: 0,
      created_at: "2024-01-01T00:00:00Z",
    });

    localStorage.setItem("last_file_path", filePath);

    // Mock loadEmployees
    const mockLoadEmployees = vi.fn().mockResolvedValue(undefined);

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
      sessionStore.current.loadEmployees = mockLoadEmployees;
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and export
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });

    // Click Apply
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    // Verify success message was shown
    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        expect.stringContaining("successfully")
      );
    });

    // Verify dialog was closed
    await waitFor(() => {
      expect(
        screen.queryByTestId("apply-changes-dialog")
      ).not.toBeInTheDocument();
    });
  });

  it("shows error in dialog and keeps dialog open on apply failure", async () => {
    const errorMessage = "Failed to write to file";
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.exportSession).mockResolvedValue({
      success: false,
      message: errorMessage,
      file_path: "",
    });

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and export
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });

    // Click Apply
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    // Verify error is shown in dialog
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify dialog is still open
    expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();

    // Verify no success message
    expect(mockShowSuccess).not.toHaveBeenCalled();
  });

  it("handles API exception and shows error in dialog", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const errorMessage = "Network error";

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.exportSession).mockRejectedValue(
      new Error(errorMessage)
    );

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and export
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });

    // Click Apply
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    // Verify error is shown in dialog
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify dialog is still open
    expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it("closes dialog without calling API when cancel is clicked", async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and export
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });

    // Click Cancel
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // Verify dialog is closed
    await waitFor(() => {
      expect(
        screen.queryByTestId("apply-changes-dialog")
      ).not.toBeInTheDocument();
    });

    // Verify API was not called
    expect(api.apiClient.exportSession).not.toHaveBeenCalled();
  });

  it("shows loading state while applying changes", async () => {
    let resolveExport: (value: any) => void;
    const exportPromise = new Promise((resolve) => {
      resolveExport = resolve;
    });

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
    vi.mocked(api.apiClient.exportSession).mockReturnValue(
      exportPromise as any
    );

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and export
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });

    // Click Apply
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    // Verify loading state is shown
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /applying/i })
      ).toBeInTheDocument();
    });

    // Verify buttons are disabled during loading
    expect(screen.getByRole("button", { name: /applying/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();

    // Resolve the promise
    resolveExport!({
      success: true,
      message: "Success",
      file_path: "/path/to/file.xlsx",
    });
  });

  it("does not call save file dialog when user cancels in save_new mode", async () => {
    mockSaveFileDialog.mockResolvedValue(undefined); // User cancelled

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

    // Set up initial state with loaded file
    const { result: sessionStore } = renderHook(() => useSessionStore());
    act(() => {
      sessionStore.current.sessionId = "test-session-123";
      sessionStore.current.filename = "employees.xlsx";
      sessionStore.current.events = [
        {
          event_id: "1",
          employee_id: 1,
          employee_name: "Test Employee",
          event_type: "grid_move",
          timestamp: "2024-01-01T00:00:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: null,
        },
      ];
    });

    const { user } = render(<AppBarContainer />);

    // Open file menu and export
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    const exportButton = screen.getByTestId("export-changes-menu-item");
    await user.click(exportButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
    });

    // Check "save as new" checkbox
    const saveAsNewCheckbox = screen.getByTestId("save-as-new-checkbox");
    await user.click(saveAsNewCheckbox);

    // Click Apply
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    // Verify file dialog was shown
    await waitFor(() => {
      expect(mockSaveFileDialog).toHaveBeenCalled();
    });

    // Verify API was NOT called since user cancelled
    expect(api.apiClient.exportSession).not.toHaveBeenCalled();
  });
});
