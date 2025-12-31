import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useIntelligence } from "../useIntelligence";
import { apiClient } from "../../services/api";
import { useSessionStore } from "../../store/sessionStore";
import type { IntelligenceData } from "../../types/api";

// Mock the API client
vi.mock("../../services/api", () => ({
  apiClient: {
    getIntelligence: vi.fn(),
  },
}));

// Mock the session store
vi.mock("../../store/sessionStore", () => ({
  useSessionStore: vi.fn(),
}));

const mockIntelligenceData: IntelligenceData = {
  anomalies: [
    {
      grid_position: 9,
      observed_count: 5,
      expected_range: [2, 4],
      severity: "medium",
      message: "Position 9 has more employees than expected",
      deviation_type: "over",
      z_score: 2.5,
      p_value: 0.012,
    },
  ],
  insights: [
    {
      category: "distribution",
      message: "High concentration in medium performance",
      severity: "info",
      affected_positions: [4, 5, 6],
      recommendation: "Consider performance calibration",
    },
  ],
  quality_score: 75.5,
  total_employees: 100,
  positions_analyzed: 9,
};

describe("useIntelligence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useSessionStore
    (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      employees: [],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial data fetching", () => {
    it("fetches intelligence data on mount", async () => {
      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockIntelligenceData
      );

      const { result } = renderHook(() => useIntelligence());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockIntelligenceData);
      expect(result.current.error).toBeNull();
      expect(apiClient.getIntelligence).toHaveBeenCalledTimes(1);
    });

    it("sets loading state correctly during fetch", async () => {
      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockIntelligenceData
      );

      const { result } = renderHook(() => useIntelligence());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Error handling", () => {
    it("handles API errors gracefully", async () => {
      const errorMessage = "Failed to fetch intelligence data";
      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useIntelligence());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.data).toBeNull();
    });

    it("handles non-Error exceptions", async () => {
      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockRejectedValue(
        "String error"
      );

      const { result } = renderHook(() => useIntelligence());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Unknown error");
    });

    it("clears previous error on successful refetch", async () => {
      const errorMessage = "Network error";
      (apiClient.getIntelligence as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error(errorMessage))
        .mockResolvedValueOnce(mockIntelligenceData);

      const { result } = renderHook(() => useIntelligence());

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });

      expect(result.current.error?.message).toBe(errorMessage);

      // Trigger refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.data).toEqual(mockIntelligenceData);
    });
  });

  describe("Manual refetch", () => {
    it("refetches data when refetch is called", async () => {
      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockIntelligenceData
      );

      const { result } = renderHook(() => useIntelligence());

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(apiClient.getIntelligence).toHaveBeenCalledTimes(1);

      // Trigger manual refetch
      await result.current.refetch();

      expect(apiClient.getIntelligence).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual(mockIntelligenceData);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Reactive updates on employee changes", () => {
    it("refetches when employees array changes", async () => {
      const mockEmployees = [{ employee_id: 1 }, { employee_id: 2 }];

      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockIntelligenceData
      );

      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
      });

      const { rerender } = renderHook(() => useIntelligence());

      // Wait for initial fetch
      await waitFor(() => {
        expect(apiClient.getIntelligence).toHaveBeenCalledTimes(1);
      });

      // Update employees in store
      (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: mockEmployees,
      });

      // Trigger rerender to simulate employees change
      rerender();

      // Should refetch when employees change
      await waitFor(() => {
        expect(apiClient.getIntelligence).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Data structure", () => {
    it("returns correct data structure", async () => {
      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockIntelligenceData
      );

      const { result } = renderHook(() => useIntelligence());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("refetch");
    });

    it("returns null data when no data has been fetched", () => {
      (
        apiClient.getIntelligence as ReturnType<typeof vi.fn>
      ).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useIntelligence());

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("handles empty intelligence data", async () => {
      const emptyData: IntelligenceData = {
        anomalies: [],
        insights: [],
        quality_score: 0,
        total_employees: 0,
        positions_analyzed: 0,
      };

      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockResolvedValue(
        emptyData
      );

      const { result } = renderHook(() => useIntelligence());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(emptyData);
      expect(result.current.error).toBeNull();
    });

    it("handles rapid consecutive refetch calls", async () => {
      (apiClient.getIntelligence as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockIntelligenceData
      );

      const { result } = renderHook(() => useIntelligence());

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger multiple refetches rapidly
      const refetch1 = result.current.refetch();
      const refetch2 = result.current.refetch();
      const refetch3 = result.current.refetch();

      await Promise.all([refetch1, refetch2, refetch3]);

      // Should handle all refetches without errors
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockIntelligenceData);
    });
  });
});
