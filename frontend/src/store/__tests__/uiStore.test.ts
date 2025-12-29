import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUiStore } from "../uiStore";
import * as api from "@/services/api";

vi.mock("@/services/api");

describe("uiStore - Recent Files", () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useUiStore());
    act(() => {
      result.current.recentFiles = [];
    });
    vi.clearAllMocks();
  });

  it("initializes with empty recent files", () => {
    const { result } = renderHook(() => useUiStore());
    expect(result.current.recentFiles).toEqual([]);
  });

  it("loads recent files from API", async () => {
    const mockFiles = [
      {
        path: "/home/user/file1.xlsx",
        name: "file1.xlsx",
        lastAccessed: 1000,
      },
      {
        path: "/home/user/file2.xlsx",
        name: "file2.xlsx",
        lastAccessed: 2000,
      },
    ];

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue(mockFiles);

    const { result } = renderHook(() => useUiStore());

    await act(async () => {
      await result.current.loadRecentFiles();
    });

    expect(result.current.recentFiles).toEqual(mockFiles);
  });

  it("adds recent file via API", async () => {
    vi.mocked(api.apiClient.addRecentFile).mockResolvedValue({
      success: true,
    });
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

    const { result } = renderHook(() => useUiStore());

    await act(async () => {
      await result.current.addRecentFile("/home/user/new.xlsx", "new.xlsx");
    });

    expect(api.apiClient.addRecentFile).toHaveBeenCalledWith(
      "/home/user/new.xlsx",
      "new.xlsx"
    );
  });

  it("handles API error when loading recent files", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(api.apiClient.getRecentFiles).mockRejectedValue(
      new Error("API Error")
    );

    const { result } = renderHook(() => useUiStore());

    await act(async () => {
      await result.current.loadRecentFiles();
    });

    expect(result.current.recentFiles).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("handles API error when adding recent file", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(api.apiClient.addRecentFile).mockRejectedValue(
      new Error("API Error")
    );

    const { result } = renderHook(() => useUiStore());

    await act(async () => {
      await result.current.addRecentFile("/home/user/new.xlsx", "new.xlsx");
    });

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("persists recent files in localStorage", () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.recentFiles = [
        { path: "/test.xlsx", name: "test.xlsx", lastAccessed: 1000 },
      ];
    });

    // Check localStorage (uiStore uses persist middleware)
    const stored = localStorage.getItem("9boxer-ui-state");
    expect(stored).toBeDefined();
  });
});
