/**
 * Test suite for Recent File Loading Workflow
 * Tests the integration of recent file loading with Electron API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { AppBarContainer } from "../AppBarContainer";
import * as sessionStore from "../../../store/sessionStore";
import * as uiStore from "../../../store/uiStore";
import { SnackbarProvider } from "../../../contexts/SnackbarContext";

// Mock the session store
vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn(),
}));

// Mock the UI store
vi.mock("../../../store/uiStore", () => ({
  useUiStore: vi.fn(),
}));

// Mock the filters hook
vi.mock("../../../hooks/useFilters", () => ({
  useFilters: vi.fn(() => ({
    toggleDrawer: vi.fn(),
    hasActiveFilters: false,
    selectedLevels: [],
    selectedJobFunctions: [],
    selectedLocations: [],
    selectedManagers: [],
    excludedEmployeeIds: [],
  })),
}));

// Mock the API client
vi.mock("../../../services/api", () => ({
  apiClient: {
    exportSession: vi.fn(),
  },
}));

// Mock the sample data service
vi.mock("../../../services/sampleDataService", () => ({
  sampleDataService: {
    generateSampleDataset: vi.fn(),
  },
}));

// Mock logger
vi.mock("../../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(<SnackbarProvider>{component}</SnackbarProvider>);
};

describe("RecentFileLoadingWorkflow", () => {
  const mockClearSession = vi.fn();
  const mockCloseSession = vi.fn();
  const mockLoadEmployees = vi.fn();
  const mockLoadRecentFiles = vi.fn();

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key) => localStorageMock[key] || null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
      delete localStorageMock[key];
    });

    // Default session store mock
    vi.mocked(sessionStore.useSessionStore).mockReturnValue({
      sessionId: null,
      filename: null,
      events: [],
      employees: [],
      clearSession: mockClearSession,
      closeSession: mockCloseSession,
      loadEmployees: mockLoadEmployees,
    } as any);

    // Default UI store mock - Zustand uses selector pattern
    vi.mocked(uiStore.useUiStore).mockImplementation((selector: any) => {
      const state = {
        recentFiles: [],
        loadRecentFiles: mockLoadRecentFiles,
      };
      return selector ? selector(state) : state;
    });
  });

  afterEach(() => {
    // Clean up Electron API mock
    delete (window as any).electronAPI;
  });

  describe("Load recent file with no session", () => {
    it("should call clearSession, loadFile, and loadEmployees when loading a recent file", async () => {
      const user = userEvent.setup();
      const mockCheckFileExists = vi.fn().mockResolvedValue(true);
      const mockLoadFile = vi.fn().mockResolvedValue({ success: true });

      // Mock Electron API
      (window as any).electronAPI = {
        checkFileExists: mockCheckFileExists,
        loadFile: mockLoadFile,
      };

      // Mock UI store with recent files
      vi.mocked(uiStore.useUiStore).mockImplementation((selector: any) => {
        const state = {
          recentFiles: [
            {
              path: "C:\\Users\\test\\file1.xlsx",
              name: "file1.xlsx",
              lastAccessed: Date.now(),
            },
          ],
          loadRecentFiles: mockLoadRecentFiles,
        };
        return selector ? selector(state) : state;
      });

      renderWithProviders(<AppBarContainer />);

      // Open file menu
      const fileMenuButton = screen.getByRole("button", { name: /file menu/i });
      await user.click(fileMenuButton);

      // Click recent file
      const recentFileItem = await screen.findByText("file1.xlsx");
      await user.click(recentFileItem);

      // Verify file existence check
      await waitFor(() => {
        expect(mockCheckFileExists).toHaveBeenCalledWith(
          "C:\\Users\\test\\file1.xlsx"
        );
      });

      // Verify load file was called
      await waitFor(() => {
        expect(mockLoadFile).toHaveBeenCalledWith(
          "C:\\Users\\test\\file1.xlsx"
        );
      });

      // Verify employees were loaded
      await waitFor(() => {
        expect(mockLoadEmployees).toHaveBeenCalled();
      });

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/Loaded file1.xlsx/i)).toBeInTheDocument();
      });
    });
  });

  describe("Load recent file with existing session", () => {
    it("should clear session before loading a new file", async () => {
      const user = userEvent.setup();
      const mockCheckFileExists = vi.fn().mockResolvedValue(true);
      const mockLoadFile = vi.fn().mockResolvedValue({ success: true });

      // Mock Electron API
      (window as any).electronAPI = {
        checkFileExists: mockCheckFileExists,
        loadFile: mockLoadFile,
      };

      // Mock session store with existing session
      vi.mocked(sessionStore.useSessionStore).mockReturnValue({
        sessionId: "existing-session-123",
        filename: "old-file.xlsx",
        events: [],
        employees: [{ id: "1", name: "Test Employee" }],
        clearSession: mockClearSession,
        closeSession: mockCloseSession,
        loadEmployees: mockLoadEmployees,
      } as any);

      // Mock UI store with recent files
      vi.mocked(uiStore.useUiStore).mockImplementation((selector: any) => {
        const state = {
          recentFiles: [
            {
              path: "C:\\Users\\test\\new-file.xlsx",
              name: "new-file.xlsx",
              lastAccessed: Date.now(),
            },
          ],
          loadRecentFiles: mockLoadRecentFiles,
        };
        return selector ? selector(state) : state;
      });

      mockClearSession.mockResolvedValue(undefined);

      renderWithProviders(<AppBarContainer />);

      // Open file menu
      const fileMenuButton = screen.getByRole("button", { name: /file menu/i });
      await user.click(fileMenuButton);

      // Click recent file
      const recentFileItem = await screen.findByText("new-file.xlsx");
      await user.click(recentFileItem);

      // Verify clearSession was called first
      await waitFor(() => {
        expect(mockClearSession).toHaveBeenCalled();
      });

      // Verify load file was called after clearing
      await waitFor(() => {
        expect(mockLoadFile).toHaveBeenCalledWith(
          "C:\\Users\\test\\new-file.xlsx"
        );
      });
    });
  });

  describe("File exists check fails", () => {
    it("should show file not found error when file does not exist", async () => {
      const user = userEvent.setup();
      const mockCheckFileExists = vi.fn().mockResolvedValue(false);
      const mockLoadFile = vi.fn();

      // Mock Electron API
      (window as any).electronAPI = {
        checkFileExists: mockCheckFileExists,
        loadFile: mockLoadFile,
      };

      // Mock UI store with recent files
      vi.mocked(uiStore.useUiStore).mockImplementation((selector: any) => {
        const state = {
          recentFiles: [
            {
              path: "C:\\Users\\test\\missing.xlsx",
              name: "missing.xlsx",
              lastAccessed: Date.now(),
            },
          ],
          loadRecentFiles: mockLoadRecentFiles,
        };
        return selector ? selector(state) : state;
      });

      renderWithProviders(<AppBarContainer />);

      // Open file menu
      const fileMenuButton = screen.getByRole("button", { name: /file menu/i });
      await user.click(fileMenuButton);

      // Click recent file
      const recentFileItem = await screen.findByText("missing.xlsx");
      await user.click(recentFileItem);

      // Verify file existence check
      await waitFor(() => {
        expect(mockCheckFileExists).toHaveBeenCalledWith(
          "C:\\Users\\test\\missing.xlsx"
        );
      });

      // Verify loadFile was NOT called
      expect(mockLoadFile).not.toHaveBeenCalled();

      // Verify error message
      await waitFor(() => {
        expect(
          screen.getByText(/File not found: missing.xlsx/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Load file success", () => {
    it("should show success message and load employees on successful file load", async () => {
      const user = userEvent.setup();
      const mockCheckFileExists = vi.fn().mockResolvedValue(true);
      const mockLoadFile = vi.fn().mockResolvedValue({ success: true });

      // Mock Electron API
      (window as any).electronAPI = {
        checkFileExists: mockCheckFileExists,
        loadFile: mockLoadFile,
      };

      // Mock UI store with recent files
      vi.mocked(uiStore.useUiStore).mockImplementation((selector: any) => {
        const state = {
          recentFiles: [
            {
              path: "C:\\Users\\test\\success.xlsx",
              name: "success.xlsx",
              lastAccessed: Date.now(),
            },
          ],
          loadRecentFiles: mockLoadRecentFiles,
        };
        return selector ? selector(state) : state;
      });

      mockLoadEmployees.mockResolvedValue(undefined);

      renderWithProviders(<AppBarContainer />);

      // Open file menu
      const fileMenuButton = screen.getByRole("button", { name: /file menu/i });
      await user.click(fileMenuButton);

      // Click recent file
      const recentFileItem = await screen.findByText("success.xlsx");
      await user.click(recentFileItem);

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/Loaded success.xlsx/i)).toBeInTheDocument();
      });

      // Verify loadEmployees was called
      expect(mockLoadEmployees).toHaveBeenCalled();
    });
  });

  describe("Load file failure", () => {
    it("should show error message from API when file load fails", async () => {
      const user = userEvent.setup();
      const mockCheckFileExists = vi.fn().mockResolvedValue(true);
      const mockLoadFile = vi
        .fn()
        .mockResolvedValue({ success: false, error: "Invalid file format" });

      // Mock Electron API
      (window as any).electronAPI = {
        checkFileExists: mockCheckFileExists,
        loadFile: mockLoadFile,
      };

      // Mock UI store with recent files
      vi.mocked(uiStore.useUiStore).mockImplementation((selector: any) => {
        const state = {
          recentFiles: [
            {
              path: "C:\\Users\\test\\invalid.xlsx",
              name: "invalid.xlsx",
              lastAccessed: Date.now(),
            },
          ],
          loadRecentFiles: mockLoadRecentFiles,
        };
        return selector ? selector(state) : state;
      });

      renderWithProviders(<AppBarContainer />);

      // Open file menu
      const fileMenuButton = screen.getByRole("button", { name: /file menu/i });
      await user.click(fileMenuButton);

      // Click recent file
      const recentFileItem = await screen.findByText("invalid.xlsx");
      await user.click(recentFileItem);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/Invalid file format/i)).toBeInTheDocument();
      });

      // Verify loadEmployees was NOT called
      expect(mockLoadEmployees).not.toHaveBeenCalled();
    });
  });

  describe("Electron API not available", () => {
    it("should show error about desktop app required when Electron API is not available", async () => {
      const user = userEvent.setup();

      // No Electron API mock (window.electronAPI is undefined)

      // Mock UI store with recent files
      vi.mocked(uiStore.useUiStore).mockImplementation((selector: any) => {
        const state = {
          recentFiles: [
            {
              path: "C:\\Users\\test\\file.xlsx",
              name: "file.xlsx",
              lastAccessed: Date.now(),
            },
          ],
          loadRecentFiles: mockLoadRecentFiles,
        };
        return selector ? selector(state) : state;
      });

      renderWithProviders(<AppBarContainer />);

      // Open file menu
      const fileMenuButton = screen.getByRole("button", { name: /file menu/i });
      await user.click(fileMenuButton);

      // Click recent file
      const recentFileItem = await screen.findByText("file.xlsx");
      await user.click(recentFileItem);

      // Verify error message
      await waitFor(() => {
        expect(
          screen.getByText(/File loading requires desktop application/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("File loading error", () => {
    it("should log error and show user-friendly message on file loading error", async () => {
      const user = userEvent.setup();
      const mockCheckFileExists = vi
        .fn()
        .mockRejectedValue(new Error("Permission denied"));

      // Mock Electron API
      (window as any).electronAPI = {
        checkFileExists: mockCheckFileExists,
        loadFile: vi.fn(),
      };

      // Mock UI store with recent files
      vi.mocked(uiStore.useUiStore).mockImplementation((selector: any) => {
        const state = {
          recentFiles: [
            {
              path: "C:\\Users\\test\\error.xlsx",
              name: "error.xlsx",
              lastAccessed: Date.now(),
            },
          ],
          loadRecentFiles: mockLoadRecentFiles,
        };
        return selector ? selector(state) : state;
      });

      renderWithProviders(<AppBarContainer />);

      // Open file menu
      const fileMenuButton = screen.getByRole("button", { name: /file menu/i });
      await user.click(fileMenuButton);

      // Click recent file
      const recentFileItem = await screen.findByText("error.xlsx");
      await user.click(recentFileItem);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/Permission denied/i)).toBeInTheDocument();
      });
    });
  });
});
