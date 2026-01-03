/**
 * Calibration summary data hook - fetches meeting preparation data
 *
 * Provides data overview, time allocation, and selectable insights
 * to help calibration managers prepare for calibration meetings.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "../services/api";
import type { CalibrationSummaryData, Insight } from "../types/api";
import { useSessionStore } from "../store/sessionStore";

/**
 * Selection state for insights
 */
export type InsightSelection = Record<string, boolean>;

/**
 * Options for useCalibrationSummary hook
 */
export interface UseCalibrationSummaryOptions {
  /** Whether to use AI agent for summary generation (default: true) */
  useAgent?: boolean;
}

/**
 * Hook return type
 */
export interface UseCalibrationSummaryResult {
  /** Calibration summary data from the API */
  data: CalibrationSummaryData | null;
  /** Whether data is currently being fetched */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Refetch the data */
  refetch: () => Promise<void>;
  /** AI-generated summary text */
  summary: string | null;
  /** Current selection state for each insight */
  selectedInsights: InsightSelection;
  /** Toggle selection for a single insight */
  toggleInsight: (insightId: string) => void;
  /** Select all insights */
  selectAll: () => void;
  /** Deselect all insights */
  deselectAll: () => void;
  /** Get list of currently selected insight IDs */
  getSelectedIds: () => string[];
  /** Number of selected insights */
  selectedCount: number;
}

/**
 * Custom hook for fetching calibration summary data
 *
 * Automatically fetches calibration summary data on mount and when employee data changes.
 * Provides loading and error states, plus insight selection management.
 *
 * @param options - Configuration options for the hook
 * @param options.useAgent - Whether to use AI agent for summary generation (default: true)
 * @returns Calibration summary data, loading state, error state, selection controls
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   error,
 *   summary,
 *   selectedInsights,
 *   toggleInsight,
 *   selectAll,
 *   deselectAll,
 *   getSelectedIds,
 *   selectedCount
 * } = useCalibrationSummary({ useAgent: true });
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!data) return null;
 *
 * return (
 *   <div>
 *     <h2>Total Employees: {data.data_overview.total_employees}</h2>
 *     {summary && <p>{summary}</p>}
 *     {data.insights.map(insight => (
 *       <InsightCard
 *         key={insight.id}
 *         insight={insight}
 *         selected={selectedInsights[insight.id]}
 *         onToggle={() => toggleInsight(insight.id)}
 *       />
 *     ))}
 *     <button onClick={() => generateSummary(getSelectedIds())}>
 *       Generate AI Summary ({selectedCount} selected)
 *     </button>
 *   </div>
 * );
 * ```
 */
export const useCalibrationSummary = (
  options: UseCalibrationSummaryOptions = {}
): UseCalibrationSummaryResult => {
  const { useAgent = true } = options;
  const [data, setData] = useState<CalibrationSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedInsights, setSelectedInsights] = useState<InsightSelection>(
    {}
  );
  const { employees } = useSessionStore(); // Trigger refetch when employees change

  /**
   * Fetches calibration summary data from the API
   */
  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.getCalibrationSummary({ useAgent });
      setData(result);

      // Initialize all insights as selected when data loads
      const initialSelection: InsightSelection = {};
      result.insights.forEach((insight: Insight) => {
        initialSelection[insight.id] = true;
      });
      setSelectedInsights(initialSelection);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [useAgent]);

  // Fetch on mount and when employees array changes (real-time updates)
  useEffect(() => {
    refetch();
  }, [employees, refetch]);

  /**
   * Toggle selection for a single insight
   */
  const toggleInsight = useCallback((insightId: string) => {
    setSelectedInsights((prev) => ({
      ...prev,
      [insightId]: !prev[insightId],
    }));
  }, []);

  /**
   * Select all insights
   */
  const selectAll = useCallback(() => {
    if (!data) return;
    const allSelected: InsightSelection = {};
    data.insights.forEach((insight) => {
      allSelected[insight.id] = true;
    });
    setSelectedInsights(allSelected);
  }, [data]);

  /**
   * Deselect all insights
   */
  const deselectAll = useCallback(() => {
    if (!data) return;
    const allDeselected: InsightSelection = {};
    data.insights.forEach((insight) => {
      allDeselected[insight.id] = false;
    });
    setSelectedInsights(allDeselected);
  }, [data]);

  /**
   * Get list of currently selected insight IDs
   */
  const getSelectedIds = useCallback((): string[] => {
    return Object.entries(selectedInsights)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
  }, [selectedInsights]);

  /**
   * Count of selected insights
   */
  const selectedCount = useMemo(() => {
    return Object.values(selectedInsights).filter(Boolean).length;
  }, [selectedInsights]);

  return {
    data,
    isLoading,
    error,
    refetch,
    summary: data?.summary ?? null,
    selectedInsights,
    toggleInsight,
    selectAll,
    deselectAll,
    getSelectedIds,
    selectedCount,
  };
};
