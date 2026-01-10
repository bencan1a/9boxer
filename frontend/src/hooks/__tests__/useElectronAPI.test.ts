import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useElectronAPI } from "../useElectronAPI";
import type { ElectronAPI } from "../../types/electron";

// Mock update API for testing
const mockUpdateAPI = {
  checkForUpdates: vi.fn(),
  downloadUpdate: vi.fn(),
  installAndRestart: vi.fn(),
  getStatus: vi.fn(),
  onUpdateAvailable: vi.fn(),
  onDownloadProgress: vi.fn(),
  onUpdateDownloaded: vi.fn(),
  onUpdateError: vi.fn(),
};

describe("useElectronAPI", () => {
  let originalElectronAPI: ElectronAPI | undefined;

  beforeEach(() => {
    // Store original state
    originalElectronAPI = window.electronAPI;
  });

  afterEach(() => {
    // Restore original state
    if (originalElectronAPI) {
      window.electronAPI = originalElectronAPI;
    } else {
      delete window.electronAPI;
    }
  });

  describe("Feature Detection", () => {
    it("detects Electron environment when electronAPI is present", () => {
      // Mock Electron environment
      window.electronAPI = {
        platform: "darwin",
        version: "1.0.0",
        openFileDialog: vi.fn(),
        saveFileDialog: vi.fn(),
        readFile: vi.fn(),
        openUserGuide: vi.fn(),
        notifySessionRestored: vi.fn(),
        theme: {
          getSystemTheme: vi.fn(),
          onSystemThemeChange: vi.fn(),
        },
        backend: {
          getPort: vi.fn(),
          getUrl: vi.fn(),
          onConnectionStatusChange: vi.fn(),
        },
        update: mockUpdateAPI,
      };

      const { result } = renderHook(() => useElectronAPI());

      expect(result.current.isElectron).toBe(true);
    });

    it("detects web environment when electronAPI is undefined", () => {
      // Mock web environment
      delete window.electronAPI;

      const { result } = renderHook(() => useElectronAPI());

      expect(result.current.isElectron).toBe(false);
    });
  });

  describe("File Dialog Methods - Electron Environment", () => {
    beforeEach(() => {
      // Mock Electron environment for these tests
      window.electronAPI = {
        platform: "darwin",
        version: "1.0.0",
        openFileDialog: vi.fn(),
        saveFileDialog: vi.fn(),
        readFile: vi.fn(),
        openUserGuide: vi.fn(),
        notifySessionRestored: vi.fn(),
        theme: {
          getSystemTheme: vi.fn(),
          onSystemThemeChange: vi.fn(),
        },
        backend: {
          getPort: vi.fn(),
          getUrl: vi.fn(),
          onConnectionStatusChange: vi.fn(),
        },
        update: mockUpdateAPI,
      };
    });

    it("calls saveFileDialog when API is available and returns path", async () => {
      const mockPath = "/path/to/file.xlsx";
      (
        window.electronAPI!.saveFileDialog as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockPath);

      const { result } = renderHook(() => useElectronAPI());
      const path = await result.current.saveFileDialog("test.xlsx");

      expect(window.electronAPI!.saveFileDialog).toHaveBeenCalledWith(
        "test.xlsx"
      );
      expect(path).toBe(mockPath);
    });

    it("calls saveFileDialog when API is available and returns null on cancel", async () => {
      (
        window.electronAPI!.saveFileDialog as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      const { result } = renderHook(() => useElectronAPI());
      const path = await result.current.saveFileDialog("test.xlsx");

      expect(window.electronAPI!.saveFileDialog).toHaveBeenCalledWith(
        "test.xlsx"
      );
      expect(path).toBeNull();
    });

    it("calls openFileDialog when API is available and returns path", async () => {
      const mockPath = "/path/to/file.xlsx";
      (
        window.electronAPI!.openFileDialog as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockPath);

      const { result } = renderHook(() => useElectronAPI());
      const path = await result.current.openFileDialog();

      expect(window.electronAPI!.openFileDialog).toHaveBeenCalled();
      expect(path).toBe(mockPath);
    });

    it("calls openFileDialog when API is available and returns null on cancel", async () => {
      (
        window.electronAPI!.openFileDialog as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      const { result } = renderHook(() => useElectronAPI());
      const path = await result.current.openFileDialog();

      expect(window.electronAPI!.openFileDialog).toHaveBeenCalled();
      expect(path).toBeNull();
    });

    it("calls readFile when API is available and returns file data", async () => {
      const mockData = {
        buffer: [1, 2, 3],
        fileName: "test.xlsx",
        success: true,
      };
      (
        window.electronAPI!.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockData);

      const { result } = renderHook(() => useElectronAPI());
      const data = await result.current.readFile("/path/to/file.xlsx");

      expect(window.electronAPI!.readFile).toHaveBeenCalledWith(
        "/path/to/file.xlsx"
      );
      expect(data).toEqual(mockData);
    });

    it("calls readFile when API is available and handles errors", async () => {
      const mockError = {
        success: false,
        error: "File not found",
      };
      (
        window.electronAPI!.readFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockError);

      const { result } = renderHook(() => useElectronAPI());
      const data = await result.current.readFile("/path/to/nonexistent.xlsx");

      expect(window.electronAPI!.readFile).toHaveBeenCalledWith(
        "/path/to/nonexistent.xlsx"
      );
      expect(data).toEqual(mockError);
    });
  });

  describe("File Dialog Methods - Web Environment", () => {
    beforeEach(() => {
      // Mock web environment for these tests
      delete window.electronAPI;
    });

    it("throws descriptive error when saveFileDialog called in web mode", async () => {
      const { result } = renderHook(() => useElectronAPI());

      await expect(result.current.saveFileDialog("test.xlsx")).rejects.toThrow(
        "Save dialog is not available in web mode"
      );
    });

    it("throws descriptive error when openFileDialog called in web mode", async () => {
      const { result } = renderHook(() => useElectronAPI());

      await expect(result.current.openFileDialog()).rejects.toThrow(
        "Open file dialog is not available in web mode"
      );
    });

    it("throws descriptive error when readFile called in web mode", async () => {
      const { result } = renderHook(() => useElectronAPI());

      await expect(
        result.current.readFile("/path/to/file.xlsx")
      ).rejects.toThrow("File system access is not available in web mode");
    });
  });

  describe("Other Electron APIs - Electron Environment", () => {
    beforeEach(() => {
      // Mock Electron environment
      window.electronAPI = {
        platform: "darwin",
        version: "1.0.0",
        openFileDialog: vi.fn(),
        saveFileDialog: vi.fn(),
        readFile: vi.fn(),
        openUserGuide: vi.fn(),
        notifySessionRestored: vi.fn(),
        theme: {
          getSystemTheme: vi.fn(),
          onSystemThemeChange: vi.fn(),
        },
        backend: {
          getPort: vi.fn(),
          getUrl: vi.fn(),
          onConnectionStatusChange: vi.fn(),
        },
        update: mockUpdateAPI,
      };
    });

    it("calls openUserGuide when API is available", async () => {
      const mockResult = { success: true };
      (
        window.electronAPI!.openUserGuide as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useElectronAPI());
      const response = await result.current.openUserGuide();

      expect(window.electronAPI!.openUserGuide).toHaveBeenCalled();
      expect(response).toEqual(mockResult);
    });

    it("calls getSystemTheme when API is available", async () => {
      const mockTheme = "dark";
      (
        window.electronAPI!.theme.getSystemTheme as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockTheme);

      const { result } = renderHook(() => useElectronAPI());
      const theme = await result.current.getSystemTheme();

      expect(window.electronAPI!.theme.getSystemTheme).toHaveBeenCalled();
      expect(theme).toBe(mockTheme);
    });

    it("calls getBackendUrl when API is available", async () => {
      const mockUrl = "http://localhost:38000";
      (
        window.electronAPI!.backend.getUrl as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockUrl);

      const { result } = renderHook(() => useElectronAPI());
      const url = await result.current.getBackendUrl();

      expect(window.electronAPI!.backend.getUrl).toHaveBeenCalled();
      expect(url).toBe(mockUrl);
    });

    it("calls getBackendPort when API is available", async () => {
      const mockPort = 38000;
      (
        window.electronAPI!.backend.getPort as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockPort);

      const { result } = renderHook(() => useElectronAPI());
      const port = await result.current.getBackendPort();

      expect(window.electronAPI!.backend.getPort).toHaveBeenCalled();
      expect(port).toBe(mockPort);
    });
  });

  describe("Other Electron APIs - Web Environment", () => {
    beforeEach(() => {
      // Mock web environment
      delete window.electronAPI;
    });

    it("throws descriptive error when openUserGuide called in web mode", async () => {
      const { result } = renderHook(() => useElectronAPI());

      await expect(result.current.openUserGuide()).rejects.toThrow(
        "User guide is not available in web mode"
      );
    });

    it("throws descriptive error when getSystemTheme called in web mode", async () => {
      const { result } = renderHook(() => useElectronAPI());

      await expect(result.current.getSystemTheme()).rejects.toThrow(
        "System theme detection is not available in web mode"
      );
    });

    it("throws descriptive error when getBackendUrl called in web mode", async () => {
      const { result } = renderHook(() => useElectronAPI());

      await expect(result.current.getBackendUrl()).rejects.toThrow(
        "Backend URL is not available in web mode"
      );
    });

    it("throws descriptive error when getBackendPort called in web mode", async () => {
      const { result } = renderHook(() => useElectronAPI());

      await expect(result.current.getBackendPort()).rejects.toThrow(
        "Backend port is not available in web mode"
      );
    });
  });

  describe("Hook Stability", () => {
    beforeEach(() => {
      // Mock Electron environment
      window.electronAPI = {
        platform: "darwin",
        version: "1.0.0",
        openFileDialog: vi.fn(),
        saveFileDialog: vi.fn(),
        readFile: vi.fn(),
        openUserGuide: vi.fn(),
        notifySessionRestored: vi.fn(),
        theme: {
          getSystemTheme: vi.fn(),
          onSystemThemeChange: vi.fn(),
        },
        backend: {
          getPort: vi.fn(),
          getUrl: vi.fn(),
          onConnectionStatusChange: vi.fn(),
        },
        update: mockUpdateAPI,
      };
    });

    it("returns stable function references across re-renders", () => {
      const { result, rerender } = renderHook(() => useElectronAPI());

      const firstRenderFunctions = {
        saveFileDialog: result.current.saveFileDialog,
        openFileDialog: result.current.openFileDialog,
        readFile: result.current.readFile,
        openUserGuide: result.current.openUserGuide,
        getSystemTheme: result.current.getSystemTheme,
        getBackendUrl: result.current.getBackendUrl,
        getBackendPort: result.current.getBackendPort,
      };

      rerender();

      expect(result.current.saveFileDialog).toBe(
        firstRenderFunctions.saveFileDialog
      );
      expect(result.current.openFileDialog).toBe(
        firstRenderFunctions.openFileDialog
      );
      expect(result.current.readFile).toBe(firstRenderFunctions.readFile);
      expect(result.current.openUserGuide).toBe(
        firstRenderFunctions.openUserGuide
      );
      expect(result.current.getSystemTheme).toBe(
        firstRenderFunctions.getSystemTheme
      );
      expect(result.current.getBackendUrl).toBe(
        firstRenderFunctions.getBackendUrl
      );
      expect(result.current.getBackendPort).toBe(
        firstRenderFunctions.getBackendPort
      );
    });
  });
});
