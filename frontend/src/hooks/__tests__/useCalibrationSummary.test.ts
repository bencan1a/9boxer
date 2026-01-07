/**
 * Unit tests for useCalibrationSummary hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCalibrationSummary } from "../useCalibrationSummary";
import { apiClient } from "../../services/api";
import { useSessionStore } from "../../store/sessionStore";
import type { CalibrationSummaryData } from "../../types/api";

// Mock the API client
vi.mock("../../services/api", () => ({
  apiClient: {
    getCalibrationSummary: vi.fn(),
  },
}));

// Mock the session store
vi.mock("../../store/sessionStore", () => ({
  useSessionStore: vi.fn(),
  selectCalibrationSummary: vi.fn((state) => state.calibrationSummary),
  selectSetCalibrationSummary: vi.fn((state) => state.setCalibrationSummary),
  selectEmployees: vi.fn((state) => state.employees),
  selectIsGeneratingAISummary: vi.fn((state) => state.isGeneratingAISummary),
  selectSetIsGeneratingAISummary: vi.fn(
    (state) => state.setIsGeneratingAISummary
  ),
}));

describe("useCalibrationSummary", () => {
  let mockStoreState: {
    calibrationSummary: CalibrationSummaryData | null;
    setCalibrationSummary: (data: CalibrationSummaryData | null) => void;
    employees: unknown[];
    isGeneratingAISummary: boolean;
    setIsGeneratingAISummary: (isGenerating: boolean) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a stateful mock store
    mockStoreState = {
      calibrationSummary: null,
      setCalibrationSummary: vi.fn((data) => {
        mockStoreState.calibrationSummary = data;
      }),
      employees: [],
      isGeneratingAISummary: false,
      setIsGeneratingAISummary: vi.fn((isGenerating) => {
        mockStoreState.isGeneratingAISummary = isGenerating;
      }),
    };

    // Default mock for useSessionStore with selector support
    (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => {
        return selector ? selector(mockStoreState) : mockStoreState;
      }
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns summary from API response", async () => {
    const mockData: CalibrationSummaryData = {
      data_overview: {
        total_employees: 100,
        stars_count: 20,
        stars_percentage: 20,
        center_box_count: 50,
        center_box_percentage: 50,
        lower_performers_count: 10,
        lower_performers_percentage: 10,
        by_level: { MT1: 10, MT2: 20, MT3: 15 },
        by_function: { Engineering: 30, Sales: 15 },
        by_location: { USA: 25, UK: 20 },
        high_performers_count: 20,
        high_performers_percentage: 20,
      },
      time_allocation: {
        estimated_duration_minutes: 120,
        suggested_sequence: ["Stars", "Center Box", "Lower Performers"],
        breakdown_by_level: [
          { level: "MT1", employee_count: 10, minutes: 60, percentage: 20 },
        ],
      },
      insights: [],
      summary: "AI summary text",
    };

    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCalibrationSummary());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.summary).toBe("AI summary text");
  });

  it("handles null summary gracefully", async () => {
    const mockData: CalibrationSummaryData = {
      data_overview: {
        total_employees: 100,
        stars_count: 20,
        stars_percentage: 20,
        center_box_count: 50,
        center_box_percentage: 50,
        lower_performers_count: 10,
        lower_performers_percentage: 10,
        by_level: { MT1: 10, MT2: 20, MT3: 15 },
        by_function: { Engineering: 30, Sales: 15 },
        by_location: { USA: 25, UK: 20 },
        high_performers_count: 20,
        high_performers_percentage: 20,
      },
      time_allocation: {
        estimated_duration_minutes: 120,
        suggested_sequence: ["Stars", "Center Box", "Lower Performers"],
        breakdown_by_level: [
          { level: "MT1", employee_count: 10, minutes: 60, percentage: 20 },
        ],
      },
      insights: [],
      summary: null,
    };

    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCalibrationSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.summary).toBeNull();
  });

  it("initializes with loading state", () => {
    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCalibrationSummary());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("handles API errors correctly", async () => {
    const errorMessage = "Failed to fetch calibration summary";
    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCalibrationSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.data).toBeNull();
  });

  it("initializes all insights as selected", async () => {
    const mockData: CalibrationSummaryData = {
      data_overview: {
        total_employees: 100,
        stars_count: 20,
        stars_percentage: 20,
        center_box_count: 50,
        center_box_percentage: 50,
        lower_performers_count: 10,
        lower_performers_percentage: 10,
        by_level: { MT1: 10, MT2: 20, MT3: 15 },
        by_function: { Engineering: 30, Sales: 15 },
        by_location: { USA: 25, UK: 20 },
        high_performers_count: 20,
        high_performers_percentage: 20,
      },
      time_allocation: {
        estimated_duration_minutes: 120,
        suggested_sequence: ["Stars", "Center Box", "Lower Performers"],
        breakdown_by_level: [
          { level: "MT1", employee_count: 10, minutes: 60, percentage: 20 },
        ],
      },
      insights: [
        {
          id: "insight-1",
          type: "anomaly",
          category: "level",
          priority: "high",
          title: "Test Insight 1",
          description: "Test description 1",
          affected_count: 10,
          source_data: {},
        },
        {
          id: "insight-2",
          type: "focus_area",
          category: "distribution",
          priority: "medium",
          title: "Test Insight 2",
          description: "Test description 2",
          affected_count: 20,
          source_data: {},
        },
      ],
      summary: null,
    };

    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCalibrationSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedInsights["insight-1"]).toBe(true);
    expect(result.current.selectedInsights["insight-2"]).toBe(true);
    expect(result.current.selectedCount).toBe(2);
  });

  it("toggles insight selection", async () => {
    const mockData: CalibrationSummaryData = {
      data_overview: {
        total_employees: 100,
        stars_count: 20,
        stars_percentage: 20,
        center_box_count: 50,
        center_box_percentage: 50,
        lower_performers_count: 10,
        lower_performers_percentage: 10,
        by_level: { MT1: 10, MT2: 20, MT3: 15 },
        by_function: { Engineering: 30, Sales: 15 },
        by_location: { USA: 25, UK: 20 },
        high_performers_count: 20,
        high_performers_percentage: 20,
      },
      time_allocation: {
        estimated_duration_minutes: 120,
        suggested_sequence: ["Stars", "Center Box", "Lower Performers"],
        breakdown_by_level: [
          { level: "MT1", employee_count: 10, minutes: 60, percentage: 20 },
        ],
      },
      insights: [
        {
          id: "insight-1",
          type: "anomaly",
          category: "level",
          priority: "high",
          title: "Test Insight 1",
          description: "Test description 1",
          affected_count: 10,
          source_data: {},
        },
      ],
      summary: null,
    };

    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCalibrationSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedInsights["insight-1"]).toBe(true);

    // Toggle off
    result.current.toggleInsight("insight-1");
    await waitFor(() => {
      expect(result.current.selectedInsights["insight-1"]).toBe(false);
    });

    // Toggle on
    result.current.toggleInsight("insight-1");
    await waitFor(() => {
      expect(result.current.selectedInsights["insight-1"]).toBe(true);
    });
  });

  it("selects all insights", async () => {
    const mockData: CalibrationSummaryData = {
      data_overview: {
        total_employees: 100,
        stars_count: 20,
        stars_percentage: 20,
        center_box_count: 50,
        center_box_percentage: 50,
        lower_performers_count: 10,
        lower_performers_percentage: 10,
        by_level: { MT1: 10, MT2: 20, MT3: 15 },
        by_function: { Engineering: 30, Sales: 15 },
        by_location: { USA: 25, UK: 20 },
        high_performers_count: 20,
        high_performers_percentage: 20,
      },
      time_allocation: {
        estimated_duration_minutes: 120,
        suggested_sequence: ["Stars", "Center Box", "Lower Performers"],
        breakdown_by_level: [
          { level: "MT1", employee_count: 10, minutes: 60, percentage: 20 },
        ],
      },
      insights: [
        {
          id: "insight-1",
          type: "anomaly",
          category: "level",
          priority: "high",
          title: "Test Insight 1",
          description: "Test description 1",
          affected_count: 10,
          source_data: {},
        },
        {
          id: "insight-2",
          type: "focus_area",
          category: "distribution",
          priority: "medium",
          title: "Test Insight 2",
          description: "Test description 2",
          affected_count: 20,
          source_data: {},
        },
      ],
      summary: null,
    };

    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCalibrationSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Deselect one
    result.current.toggleInsight("insight-1");
    await waitFor(() => {
      expect(result.current.selectedCount).toBe(1);
    });

    // Select all
    result.current.selectAll();
    await waitFor(() => {
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.selectedInsights["insight-1"]).toBe(true);
      expect(result.current.selectedInsights["insight-2"]).toBe(true);
    });
  });

  it("deselects all insights", async () => {
    const mockData: CalibrationSummaryData = {
      data_overview: {
        total_employees: 100,
        stars_count: 20,
        stars_percentage: 20,
        center_box_count: 50,
        center_box_percentage: 50,
        lower_performers_count: 10,
        lower_performers_percentage: 10,
        by_level: { MT1: 10, MT2: 20, MT3: 15 },
        by_function: { Engineering: 30, Sales: 15 },
        by_location: { USA: 25, UK: 20 },
        high_performers_count: 20,
        high_performers_percentage: 20,
      },
      time_allocation: {
        estimated_duration_minutes: 120,
        suggested_sequence: ["Stars", "Center Box", "Lower Performers"],
        breakdown_by_level: [
          { level: "MT1", employee_count: 10, minutes: 60, percentage: 20 },
        ],
      },
      insights: [
        {
          id: "insight-1",
          type: "anomaly",
          category: "level",
          priority: "high",
          title: "Test Insight 1",
          description: "Test description 1",
          affected_count: 10,
          source_data: {},
        },
        {
          id: "insight-2",
          type: "focus_area",
          category: "distribution",
          priority: "medium",
          title: "Test Insight 2",
          description: "Test description 2",
          affected_count: 20,
          source_data: {},
        },
      ],
      summary: null,
    };

    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCalibrationSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedCount).toBe(2);

    // Deselect all
    result.current.deselectAll();
    await waitFor(() => {
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.selectedInsights["insight-1"]).toBe(false);
      expect(result.current.selectedInsights["insight-2"]).toBe(false);
    });
  });

  it("returns selected insight IDs", async () => {
    const mockData: CalibrationSummaryData = {
      data_overview: {
        total_employees: 100,
        stars_count: 20,
        stars_percentage: 20,
        center_box_count: 50,
        center_box_percentage: 50,
        lower_performers_count: 10,
        lower_performers_percentage: 10,
        by_level: { MT1: 10, MT2: 20, MT3: 15 },
        by_function: { Engineering: 30, Sales: 15 },
        by_location: { USA: 25, UK: 20 },
        high_performers_count: 20,
        high_performers_percentage: 20,
      },
      time_allocation: {
        estimated_duration_minutes: 120,
        suggested_sequence: ["Stars", "Center Box", "Lower Performers"],
        breakdown_by_level: [
          { level: "MT1", employee_count: 10, minutes: 60, percentage: 20 },
        ],
      },
      insights: [
        {
          id: "insight-1",
          type: "anomaly",
          category: "level",
          priority: "high",
          title: "Test Insight 1",
          description: "Test description 1",
          affected_count: 10,
          source_data: {},
        },
        {
          id: "insight-2",
          type: "focus_area",
          category: "distribution",
          priority: "medium",
          title: "Test Insight 2",
          description: "Test description 2",
          affected_count: 20,
          source_data: {},
        },
      ],
      summary: null,
    };

    (
      apiClient.getCalibrationSummary as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCalibrationSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Toggle one off
    result.current.toggleInsight("insight-2");
    await waitFor(() => {
      const selectedIds = result.current.getSelectedIds();
      expect(selectedIds).toEqual(["insight-1"]);
    });
  });
});
