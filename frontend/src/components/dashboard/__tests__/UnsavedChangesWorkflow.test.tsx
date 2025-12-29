/**
 * Integration tests for Unsaved Changes Workflow
 * Tests that unsaved changes are properly detected and UnsavedChangesDialog is shown
 * before destructive operations (import, load sample, close file, recent file)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { renderHook, act } from "@testing-library/react";
import { AppBarContainer } from "../AppBarContainer";
import { useSessionStore } from "@/store/sessionStore";
import * as api from "@/services/api";

// Create mock functions that we can track
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock("@/services/api");
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

describe("Unsaved Changes Workflow", () => {
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

  describe("Import File with unsaved changes", () => {
    it("does not show unsaved changes dialog when no unsaved changes exist", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

      // Set up session with NO events (no unsaved changes)
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = []; // No unsaved changes
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);

      // Click Import
      const importButton = screen.getByTestId("import-data-menu-item");
      await user.click(importButton);

      // Verify unsaved changes dialog is NOT shown
      expect(
        screen.queryByTestId("unsaved-changes-dialog")
      ).not.toBeInTheDocument();

      // Verify upload dialog is shown directly
      await waitFor(() => {
        expect(screen.getByTestId("file-upload-dialog")).toBeInTheDocument();
      });
    });

    it("shows unsaved changes dialog when unsaved changes exist", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

      // Set up session with events (unsaved changes)
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
          {
            event_id: 2,
            employee_id: 2,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Low",
            from_potential: "Medium",
            to_performance: "Medium",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);

      // Click Import
      const importButton = screen.getByTestId("import-data-menu-item");
      await user.click(importButton);

      // Verify unsaved changes dialog IS shown
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });

      // Verify correct change count is shown (2 changes)
      expect(
        screen.getByText(/You have 2 unsaved changes/i)
      ).toBeInTheDocument();

      // Verify upload dialog is NOT shown yet
      expect(
        screen.queryByTestId("file-upload-dialog")
      ).not.toBeInTheDocument();
    });

    it("opens upload dialog after discarding changes", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

      // Set up session with events
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu and click Import
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);
      const importButton = screen.getByTestId("import-data-menu-item");
      await user.click(importButton);

      // Wait for unsaved changes dialog
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });

      // Click Discard Changes
      const discardButton = screen.getByTestId("discard-button");
      await user.click(discardButton);

      // Verify unsaved changes dialog is closed
      await waitFor(() => {
        expect(
          screen.queryByTestId("unsaved-changes-dialog")
        ).not.toBeInTheDocument();
      });

      // Verify upload dialog is now shown
      await waitFor(() => {
        expect(screen.getByTestId("file-upload-dialog")).toBeInTheDocument();
      });
    });

    it("stays on current screen when canceling unsaved changes dialog", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

      // Set up session with events
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu and click Import
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);
      const importButton = screen.getByTestId("import-data-menu-item");
      await user.click(importButton);

      // Wait for unsaved changes dialog
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });

      // Click Cancel
      const cancelButton = screen.getByTestId("cancel-button");
      await user.click(cancelButton);

      // Verify unsaved changes dialog is closed
      await waitFor(() => {
        expect(
          screen.queryByTestId("unsaved-changes-dialog")
        ).not.toBeInTheDocument();
      });

      // Verify upload dialog is NOT shown
      expect(
        screen.queryByTestId("file-upload-dialog")
      ).not.toBeInTheDocument();

      // Verify session state is unchanged
      expect(sessionStore.current.sessionId).toBe("test-session-123");
      expect(sessionStore.current.filename).toBe("employees.xlsx");
      expect(sessionStore.current.events.length).toBe(1);
    });
  });

  describe("Load Sample Data with unsaved changes", () => {
    it("shows unsaved changes dialog when unsaved changes exist", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

      // Set up session with events
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);

      // Click Load Sample
      const loadSampleButton = screen.getByTestId("load-sample-menu-item");
      await user.click(loadSampleButton);

      // Verify unsaved changes dialog IS shown
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });

      // Verify load sample dialog is NOT shown yet
      expect(
        screen.queryByTestId("load-sample-dialog")
      ).not.toBeInTheDocument();
    });

    it("opens load sample dialog after discarding changes", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

      // Set up session with events
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu and click Load Sample
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);
      const loadSampleButton = screen.getByTestId("load-sample-menu-item");
      await user.click(loadSampleButton);

      // Wait for unsaved changes dialog
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });

      // Click Discard Changes
      const discardButton = screen.getByTestId("discard-button");
      await user.click(discardButton);

      // Verify load sample dialog is now shown
      await waitFor(() => {
        expect(screen.getByTestId("load-sample-dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Close File with unsaved changes", () => {
    it("shows unsaved changes dialog when unsaved changes exist", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

      // Set up session with events
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);

      // Click Close File
      const closeFileButton = screen.getByTestId("close-file-menu-item");
      await user.click(closeFileButton);

      // Verify unsaved changes dialog IS shown
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });
    });

    it("closes session after discarding changes", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);
      vi.mocked(api.apiClient.closeSession).mockResolvedValue({
        success: true,
        message: "Session closed",
      });

      // Set up session with events
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu and click Close File
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);
      const closeFileButton = screen.getByTestId("close-file-menu-item");
      await user.click(closeFileButton);

      // Wait for unsaved changes dialog
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });

      // Click Discard Changes
      const discardButton = screen.getByTestId("discard-button");
      await user.click(discardButton);

      // Verify closeSession was called
      await waitFor(() => {
        expect(api.apiClient.closeSession).toHaveBeenCalled();
      });

      // Verify session was cleared
      await waitFor(() => {
        expect(sessionStore.current.sessionId).toBeNull();
        expect(sessionStore.current.filename).toBeNull();
      });
    });
  });

  describe("Recent File with unsaved changes", () => {
    it("shows unsaved changes dialog when unsaved changes exist", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([
        {
          path: "/path/to/recent.xlsx",
          name: "recent.xlsx",
          lastAccessed: Date.now(),
        },
      ]);

      // Set up session with events
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);

      // Wait for recent files to load
      await waitFor(() => {
        expect(
          screen.getByTestId("recent-file-recent.xlsx")
        ).toBeInTheDocument();
      });

      // Click recent file
      const recentFileButton = screen.getByTestId("recent-file-recent.xlsx");
      await user.click(recentFileButton);

      // Verify unsaved changes dialog IS shown
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });
    });

    it("loads recent file after discarding changes", async () => {
      // Mock Electron API for file reading
      const mockFileBuffer = new ArrayBuffer(8);
      (window as any).electronAPI = {
        readFile: vi.fn().mockResolvedValue({
          success: true,
          buffer: mockFileBuffer,
          fileName: "recent.xlsx",
        }),
      };

      // Mock API responses
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([
        {
          path: "/path/to/recent.xlsx",
          name: "recent.xlsx",
          lastAccessed: Date.now(),
        },
      ]);
      vi.mocked(api.apiClient.upload).mockResolvedValue({
        session_id: "new-session-456",
        message: "File uploaded successfully",
        filename: "recent.xlsx",
      });
      vi.mocked(api.apiClient.getEmployees).mockResolvedValue({
        employees: [],
      });

      // Set up session with events (unsaved changes)
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);

      // Wait for recent files to load
      await waitFor(() => {
        expect(
          screen.getByTestId("recent-file-recent.xlsx")
        ).toBeInTheDocument();
      });

      // Click recent file
      const recentFileButton = screen.getByTestId("recent-file-recent.xlsx");
      await user.click(recentFileButton);

      // Wait for unsaved changes dialog
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });

      // Click Discard Changes
      const discardButton = screen.getByTestId("discard-button");
      await user.click(discardButton);

      // Verify unsaved changes dialog closes
      await waitFor(() => {
        expect(
          screen.queryByTestId("unsaved-changes-dialog")
        ).not.toBeInTheDocument();
      });

      // Verify file was read via Electron API
      await waitFor(() => {
        expect((window as any).electronAPI.readFile).toHaveBeenCalledWith(
          "/path/to/recent.xlsx"
        );
      });

      // Verify file was uploaded
      await waitFor(() => {
        expect(api.apiClient.upload).toHaveBeenCalled();
      });

      // Verify success message is shown
      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          expect.stringContaining("recent.xlsx")
        );
      });

      // Clean up
      delete (window as any).electronAPI;
    });
  });

  describe("Apply Changes button (placeholder for Chunk 3B)", () => {
    it("shows placeholder message when Apply Changes is clicked", async () => {
      vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

      // Set up session with events
      const { result: sessionStore } = renderHook(() => useSessionStore());
      act(() => {
        sessionStore.current.sessionId = "test-session-123";
        sessionStore.current.filename = "employees.xlsx";
        sessionStore.current.events = [
          {
            event_id: 1,
            employee_id: 1,
            event_type: "position_change",
            timestamp: "2024-01-01T00:00:00Z",
            from_performance: "Medium",
            from_potential: "Medium",
            to_performance: "High",
            to_potential: "High",
            notes: null,
          },
        ];
      });

      const { user } = render(<AppBarContainer />);

      // Open file menu and click Import
      const fileButton = screen.getByTestId("file-menu-button");
      await user.click(fileButton);
      const importButton = screen.getByTestId("import-data-menu-item");
      await user.click(importButton);

      // Wait for unsaved changes dialog
      await waitFor(() => {
        expect(
          screen.getByTestId("unsaved-changes-dialog")
        ).toBeInTheDocument();
      });

      // Click Apply Changes
      const applyButton = screen.getByTestId("apply-button");
      await user.click(applyButton);

      // Verify ApplyChangesDialog opens (Issue #114 fixed)
      await waitFor(() => {
        expect(screen.getByTestId("apply-changes-dialog")).toBeInTheDocument();
      });

      // Verify unsaved changes dialog is closed
      await waitFor(() => {
        expect(
          screen.queryByTestId("unsaved-changes-dialog")
        ).not.toBeInTheDocument();
      });
    });
  });
});
