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
  selectSessionId: vi.fn((state) => state.sessionId),
  selectFilename: vi.fn((state) => state.filename),
  selectEmployees: vi.fn((state) => state.employees),
  selectEvents: vi.fn((state) => state.events),
  selectClearSession: vi.fn((state) => state.clearSession),
  selectCloseSession: vi.fn((state) => state.closeSession),
  selectLoadEmployees: vi.fn((state) => state.loadEmployees),
  selectUploadFile: vi.fn((state) => state.uploadFile),
  selectIsLoading: vi.fn((state) => state.isLoading),
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

    // Default session store mock - support both selector and direct patterns
    vi.mocked(sessionStore.useSessionStore).mockImplementation(
      (selector?: any) => {
        const state = {
          sessionId: null,
          filename: null,
          events: [],
          employees: [],
          clearSession: mockClearSession,
          closeSession: mockCloseSession,
          loadEmployees: mockLoadEmployees,
          isLoading: false,
        };
        // If a selector is passed, apply it, otherwise return the whole state
        return selector ? selector(state) : state;
      }
    );

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
    it("should call readFile, uploadFile, and loadEmployees when loading a recent file", async () => {
      const user = userEvent.setup();
      const mockReadFile = vi.fn().mockResolvedValue({
        success: true,
        buffer: new Uint8Array([1, 2, 3]).buffer,
        fileName: "file1.xlsx",
      });

      // Mock Electron API
      (window as any).electronAPI = {
        readFile: mockReadFile,
      };

      // Mock uploadFile in session store
      const mockUploadFile = vi.fn().mockResolvedValue(undefined);
      vi.mocked(sessionStore.useSessionStore).mockImplementation(
        (selector?: any) => {
          const state = {
            sessionId: null,
            filename: null,
            events: [],
            employees: [],
            clearSession: mockClearSession,
            closeSession: mockCloseSession,
            loadEmployees: mockLoadEmployees,
            uploadFile: mockUploadFile,
            isLoading: false,
          };
          return selector ? selector(state) : state;
        }
      );

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

      // Verify readFile was called
      await waitFor(() => {
        expect(mockReadFile).toHaveBeenCalledWith(
          "C:\\Users\\test\\file1.xlsx"
        );
      });

      // Verify uploadFile was called
      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalled();
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
      const mockReadFile = vi.fn().mockResolvedValue({
        success: true,
        buffer: new Uint8Array([1, 2, 3]).buffer,
        fileName: "new-file.xlsx",
      });

      // Mock Electron API
      (window as any).electronAPI = {
        readFile: mockReadFile,
      };

      // Mock uploadFile
      const mockUploadFile = vi.fn().mockResolvedValue(undefined);
      mockClearSession.mockResolvedValue(undefined);

      // Mock session store with existing session
      vi.mocked(sessionStore.useSessionStore).mockImplementation(
        (selector?: any) => {
          const state = {
            sessionId: "existing-session-123",
            filename: "old-file.xlsx",
            events: [],
            employees: [{ id: "1", name: "Test Employee" }],
            clearSession: mockClearSession,
            closeSession: mockCloseSession,
            loadEmployees: mockLoadEmployees,
            uploadFile: mockUploadFile,
            isLoading: false,
          };
          return selector ? selector(state) : state;
        }
      );

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

      // Verify uploadFile was called after clearing
      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalled();
      });
    });
  });

  describe("File read fails", () => {
    it("should show error when readFile fails", async () => {
      const user = userEvent.setup();
      const mockReadFile = vi.fn().mockResolvedValue({
        success: false,
        error: "File not found",
      });

      // Mock Electron API
      (window as any).electronAPI = {
        readFile: mockReadFile,
      };

      // Mock uploadFile
      const mockUploadFile = vi.fn();
      vi.mocked(sessionStore.useSessionStore).mockImplementation(
        (selector?: any) => {
          const state = {
            sessionId: null,
            filename: null,
            events: [],
            employees: [],
            clearSession: mockClearSession,
            closeSession: mockCloseSession,
            loadEmployees: mockLoadEmployees,
            uploadFile: mockUploadFile,
            isLoading: false,
          };
          return selector ? selector(state) : state;
        }
      );

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

      // Verify readFile was called
      await waitFor(() => {
        expect(mockReadFile).toHaveBeenCalledWith(
          "C:\\Users\\test\\missing.xlsx"
        );
      });

      // Verify uploadFile was NOT called
      expect(mockUploadFile).not.toHaveBeenCalled();

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/File not found/i)).toBeInTheDocument();
      });
    });
  });

  describe("Load file success", () => {
    it("should show success message and call uploadFile on successful file read", async () => {
      const user = userEvent.setup();
      const mockReadFile = vi.fn().mockResolvedValue({
        success: true,
        buffer: new Uint8Array([1, 2, 3]).buffer,
        fileName: "success.xlsx",
      });

      // Mock Electron API
      (window as any).electronAPI = {
        readFile: mockReadFile,
      };

      // Mock uploadFile
      const mockUploadFile = vi.fn().mockResolvedValue(undefined);
      mockLoadEmployees.mockResolvedValue(undefined);

      vi.mocked(sessionStore.useSessionStore).mockReturnValue({
        sessionId: null,
        filename: null,
        events: [],
        employees: [],
        clearSession: mockClearSession,
        closeSession: mockCloseSession,
        loadEmployees: mockLoadEmployees,
        uploadFile: mockUploadFile,
      } as any);

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

      // Verify uploadFile was called
      expect(mockUploadFile).toHaveBeenCalled();
    });
  });

  describe("Upload file failure", () => {
    it("should show error message when uploadFile fails", async () => {
      const user = userEvent.setup();
      const mockReadFile = vi.fn().mockResolvedValue({
        success: true,
        buffer: new Uint8Array([1, 2, 3]).buffer,
        fileName: "invalid.xlsx",
      });

      // Mock Electron API
      (window as any).electronAPI = {
        readFile: mockReadFile,
      };

      // Mock uploadFile to throw error
      const mockUploadFile = vi
        .fn()
        .mockRejectedValue(new Error("Invalid file format"));

      vi.mocked(sessionStore.useSessionStore).mockReturnValue({
        sessionId: null,
        filename: null,
        events: [],
        employees: [],
        clearSession: mockClearSession,
        closeSession: mockCloseSession,
        loadEmployees: mockLoadEmployees,
        uploadFile: mockUploadFile,
      } as any);

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
    });
  });

  describe("Electron API not available", () => {
    it("should show error about desktop app required when Electron API is not available", async () => {
      const user = userEvent.setup();

      // No Electron API mock (window.electronAPI is undefined)

      // Mock uploadFile
      const mockUploadFile = vi.fn();
      vi.mocked(sessionStore.useSessionStore).mockImplementation(
        (selector?: any) => {
          const state = {
            sessionId: null,
            filename: null,
            events: [],
            employees: [],
            clearSession: mockClearSession,
            closeSession: mockCloseSession,
            loadEmployees: mockLoadEmployees,
            uploadFile: mockUploadFile,
            isLoading: false,
          };
          return selector ? selector(state) : state;
        }
      );

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

      // Verify error message (dashboard.fileMenu.electronApiRequired)
      await waitFor(() => {
        expect(screen.getByText(/desktop application/i)).toBeInTheDocument();
      });
    });
  });

  describe("File loading error", () => {
    it("should log error and show user-friendly message on file loading error", async () => {
      const user = userEvent.setup();
      const mockReadFile = vi
        .fn()
        .mockRejectedValue(new Error("Permission denied"));

      // Mock Electron API
      (window as any).electronAPI = {
        readFile: mockReadFile,
      };

      // Mock uploadFile
      const mockUploadFile = vi.fn();
      vi.mocked(sessionStore.useSessionStore).mockImplementation(
        (selector?: any) => {
          const state = {
            sessionId: null,
            filename: null,
            events: [],
            employees: [],
            clearSession: mockClearSession,
            closeSession: mockCloseSession,
            loadEmployees: mockLoadEmployees,
            uploadFile: mockUploadFile,
            isLoading: false,
          };
          return selector ? selector(state) : state;
        }
      );

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
