/**
 * Integration tests for Recent Files workflow
 * Tests the complete workflow of loading, displaying, and clicking recent files
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { renderHook, act } from "@testing-library/react";
import { AppBarContainer } from "../AppBarContainer";
import { useUiStore } from "@/store/uiStore";
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

describe("Recent Files Workflow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset UI store state
    const { result } = renderHook(() => useUiStore());
    act(() => {
      result.current.recentFiles = [];
    });
  });

  it("loads recent files from API on mount", async () => {
    const mockRecentFiles = [
      { path: "/test1.xlsx", name: "test1.xlsx", lastAccessed: 1000 },
      { path: "/test2.xlsx", name: "test2.xlsx", lastAccessed: 2000 },
    ];

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue(mockRecentFiles);

    render(<AppBarContainer />);

    await waitFor(() => {
      expect(api.apiClient.getRecentFiles).toHaveBeenCalled();
    });
  });

  it("displays recent files in the file menu", async () => {
    const mockRecentFiles = [
      {
        path: "/path/to/employees.xlsx",
        name: "employees.xlsx",
        lastAccessed: Date.now(),
      },
      {
        path: "/path/to/data.xlsx",
        name: "data.xlsx",
        lastAccessed: Date.now() - 1000,
      },
    ];

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue(mockRecentFiles);

    const { user } = render(<AppBarContainer />);

    // Wait for recent files to load
    await waitFor(() => {
      expect(api.apiClient.getRecentFiles).toHaveBeenCalled();
    });

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Verify recent files are displayed
    await waitFor(() => {
      expect(
        screen.getByTestId("recent-file-employees.xlsx")
      ).toBeInTheDocument();
      expect(screen.getByTestId("recent-file-data.xlsx")).toBeInTheDocument();
    });
  });

  it('shows "No recent files" message when list is empty', async () => {
    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue([]);

    const { user } = render(<AppBarContainer />);

    // Wait for recent files to load
    await waitFor(() => {
      expect(api.apiClient.getRecentFiles).toHaveBeenCalled();
    });

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Verify "No recent files" message is displayed
    await waitFor(() => {
      expect(screen.getByText(/no recent files/i)).toBeInTheDocument();
    });
  });

  it("limits display to 5 most recent files", async () => {
    const mockRecentFiles = Array.from({ length: 10 }, (_, i) => ({
      path: `/path/to/file${i}.xlsx`,
      name: `file${i}.xlsx`,
      lastAccessed: Date.now() - i * 1000,
    }));

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue(mockRecentFiles);

    const { user } = render(<AppBarContainer />);

    // Wait for recent files to load
    await waitFor(() => {
      expect(api.apiClient.getRecentFiles).toHaveBeenCalled();
    });

    // Open file menu
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Verify only 5 files are displayed
    await waitFor(() => {
      for (let i = 0; i < 5; i++) {
        expect(
          screen.getByTestId(`recent-file-file${i}.xlsx`)
        ).toBeInTheDocument();
      }
      // Files 5-9 should not be displayed
      for (let i = 5; i < 10; i++) {
        expect(
          screen.queryByTestId(`recent-file-file${i}.xlsx`)
        ).not.toBeInTheDocument();
      }
    });
  });

  it("handles API errors gracefully when loading recent files", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(api.apiClient.getRecentFiles).mockRejectedValue(
      new Error("API Error")
    );

    const { user } = render(<AppBarContainer />);

    // Wait for failed API call
    await waitFor(() => {
      expect(api.apiClient.getRecentFiles).toHaveBeenCalled();
    });

    // Open file menu - should still work
    const fileButton = screen.getByTestId("file-menu-button");
    await user.click(fileButton);

    // Verify "No recent files" message is shown
    await waitFor(() => {
      expect(screen.getByText(/no recent files/i)).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  it("updates recent files in UI store when API loads successfully", async () => {
    const mockRecentFiles = [
      { path: "/test1.xlsx", name: "test1.xlsx", lastAccessed: 1000 },
      { path: "/test2.xlsx", name: "test2.xlsx", lastAccessed: 2000 },
    ];

    vi.mocked(api.apiClient.getRecentFiles).mockResolvedValue(mockRecentFiles);

    render(<AppBarContainer />);

    await waitFor(() => {
      expect(api.apiClient.getRecentFiles).toHaveBeenCalled();
    });

    // Verify UI store was updated
    const { result } = renderHook(() => useUiStore());
    await waitFor(() => {
      expect(result.current.recentFiles).toEqual(mockRecentFiles);
    });
  });
});
