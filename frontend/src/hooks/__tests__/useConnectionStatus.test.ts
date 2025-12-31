import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConnectionStatus } from "../useConnectionStatus";
import * as config from "../../config";
import { apiClient } from "../../services/api";

// Mock the config module
vi.mock("../../config", () => ({
  isElectron: vi.fn(),
}));

// Mock the API client
vi.mock("../../services/api", () => ({
  apiClient: {
    updateBaseUrl: vi.fn(),
  },
}));

describe("useConnectionStatus", () => {
  let mockCleanup: ReturnType<typeof vi.fn>;
  let mockOnConnectionStatusChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCleanup = vi.fn();
    mockOnConnectionStatusChange = vi.fn(() => mockCleanup);

    // Reset window.electronAPI
    delete (window as any).electronAPI;

    // Default to web mode
    (config.isElectron as ReturnType<typeof vi.fn>).mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Web mode (isElectron = false)", () => {
    it("returns connected status in web mode", () => {
      (config.isElectron as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { result } = renderHook(() => useConnectionStatus());

      expect(result.current.status).toBe("connected");
      expect(result.current.retryCount).toBe(0);
    });

    it("does not set up IPC listener in web mode", () => {
      (config.isElectron as ReturnType<typeof vi.fn>).mockReturnValue(false);

      renderHook(() => useConnectionStatus());

      expect(mockOnConnectionStatusChange).not.toHaveBeenCalled();
    });

    it("provides manualRetry function in return object", () => {
      (config.isElectron as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { result } = renderHook(() => useConnectionStatus());

      expect(result.current.manualRetry).toBeDefined();
      expect(typeof result.current.manualRetry).toBe("function");
    });
  });

  describe("Electron mode (isElectron = true)", () => {
    beforeEach(() => {
      (config.isElectron as ReturnType<typeof vi.fn>).mockReturnValue(true);

      // Mock Electron API
      (window as any).electronAPI = {
        backend: {
          onConnectionStatusChange: mockOnConnectionStatusChange,
        },
      };
    });

    it("sets up IPC listener in Electron mode", () => {
      renderHook(() => useConnectionStatus());

      expect(mockOnConnectionStatusChange).toHaveBeenCalled();
    });

    it("updates status when connection status changes to connected", () => {
      let statusCallback: ((data: any) => void) | null = null;

      mockOnConnectionStatusChange.mockImplementation((callback) => {
        statusCallback = callback;
        return mockCleanup;
      });

      const { result } = renderHook(() => useConnectionStatus());

      expect(result.current.status).toBe("connected");

      // Simulate status change to reconnecting
      act(() => {
        statusCallback?.({ status: "reconnecting" });
      });

      expect(result.current.status).toBe("reconnecting");

      // Simulate status change back to connected
      act(() => {
        statusCallback?.({ status: "connected" });
      });

      expect(result.current.status).toBe("connected");
    });

    it("increments retry count when status changes to reconnecting", () => {
      let statusCallback: ((data: any) => void) | null = null;

      mockOnConnectionStatusChange.mockImplementation((callback) => {
        statusCallback = callback;
        return mockCleanup;
      });

      const { result } = renderHook(() => useConnectionStatus());

      expect(result.current.retryCount).toBe(0);

      // First reconnection attempt
      act(() => {
        statusCallback?.({ status: "reconnecting" });
      });

      expect(result.current.retryCount).toBe(1);

      // Second reconnection attempt
      act(() => {
        statusCallback?.({ status: "reconnecting" });
      });

      expect(result.current.retryCount).toBe(2);
    });

    it("resets retry count when status changes to connected", () => {
      let statusCallback: ((data: any) => void) | null = null;

      mockOnConnectionStatusChange.mockImplementation((callback) => {
        statusCallback = callback;
        return mockCleanup;
      });

      const { result } = renderHook(() => useConnectionStatus());

      // Simulate multiple reconnection attempts
      act(() => {
        statusCallback?.({ status: "reconnecting" });
      });
      act(() => {
        statusCallback?.({ status: "reconnecting" });
      });

      expect(result.current.retryCount).toBe(2);

      // Reconnect successfully
      act(() => {
        statusCallback?.({ status: "connected", port: 38000 });
      });

      expect(result.current.retryCount).toBe(0);
    });

    it("updates API client base URL when port changes on connection", () => {
      let statusCallback: ((data: any) => void) | null = null;

      mockOnConnectionStatusChange.mockImplementation((callback) => {
        statusCallback = callback;
        return mockCleanup;
      });

      renderHook(() => useConnectionStatus());

      // Simulate connection with new port
      act(() => {
        statusCallback?.({ status: "connected", port: 38001 });
      });

      expect(apiClient.updateBaseUrl).toHaveBeenCalledWith(
        "http://localhost:38001"
      );
    });

    it("does not update API client base URL when port is not provided", () => {
      let statusCallback: ((data: any) => void) | null = null;

      mockOnConnectionStatusChange.mockImplementation((callback) => {
        statusCallback = callback;
        return mockCleanup;
      });

      renderHook(() => useConnectionStatus());

      // Simulate connection without port
      act(() => {
        statusCallback?.({ status: "connected" });
      });

      expect(apiClient.updateBaseUrl).not.toHaveBeenCalled();
    });

    it("handles disconnected status", () => {
      let statusCallback: ((data: any) => void) | null = null;

      mockOnConnectionStatusChange.mockImplementation((callback) => {
        statusCallback = callback;
        return mockCleanup;
      });

      const { result } = renderHook(() => useConnectionStatus());

      act(() => {
        statusCallback?.({ status: "disconnected" });
      });

      expect(result.current.status).toBe("disconnected");
    });

    it("cleans up IPC listener on unmount", () => {
      const { unmount } = renderHook(() => useConnectionStatus());

      expect(mockOnConnectionStatusChange).toHaveBeenCalled();

      unmount();

      expect(mockCleanup).toHaveBeenCalled();
    });

    it("warns when Electron API is not available", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      delete (window as any).electronAPI;

      renderHook(() => useConnectionStatus());

      expect(consoleSpy).toHaveBeenCalledWith(
        "[useConnectionStatus] Electron API not available"
      );

      consoleSpy.mockRestore();
    });

    it("warns when backend.onConnectionStatusChange is not available", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      (window as any).electronAPI = {
        backend: {},
      };

      renderHook(() => useConnectionStatus());

      expect(consoleSpy).toHaveBeenCalledWith(
        "[useConnectionStatus] Electron API not available"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("manualRetry", () => {
    it("returns stable function reference across re-renders", () => {
      const { result, rerender } = renderHook(() => useConnectionStatus());

      const firstRetry = result.current.manualRetry;

      rerender();

      expect(result.current.manualRetry).toBe(firstRetry);
    });

    it("is defined and callable", () => {
      const { result } = renderHook(() => useConnectionStatus());

      expect(result.current.manualRetry).toBeDefined();
      expect(typeof result.current.manualRetry).toBe("function");
    });
  });

  describe("Edge cases", () => {
    it("handles rapid status changes", () => {
      let statusCallback: ((data: any) => void) | null = null;

      (config.isElectron as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (window as any).electronAPI = {
        backend: {
          onConnectionStatusChange: (callback: any) => {
            statusCallback = callback;
            return mockCleanup;
          },
        },
      };

      const { result } = renderHook(() => useConnectionStatus());

      // Rapid status changes
      act(() => {
        statusCallback?.({ status: "reconnecting" });
        statusCallback?.({ status: "connected", port: 38000 });
        statusCallback?.({ status: "reconnecting" });
        statusCallback?.({ status: "disconnected" });
      });

      expect(result.current.status).toBe("disconnected");
    });

    it("handles multiple hook instances", () => {
      (config.isElectron as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (window as any).electronAPI = {
        backend: {
          onConnectionStatusChange: mockOnConnectionStatusChange,
        },
      };

      const { result: result1 } = renderHook(() => useConnectionStatus());
      const { result: result2 } = renderHook(() => useConnectionStatus());

      expect(result1.current.status).toBe("connected");
      expect(result2.current.status).toBe("connected");

      // Both hooks should set up listeners
      expect(mockOnConnectionStatusChange).toHaveBeenCalledTimes(2);
    });
  });
});
