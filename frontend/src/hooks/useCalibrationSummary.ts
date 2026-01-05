/**
 * Calibration summary data hook - fetches meeting preparation data
 *
 * Provides data overview, time allocation, and selectable insights
 * to help calibration managers prepare for calibration meetings.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "../services/api";
import type { CalibrationSummaryData, Insight } from "../types/api";
import {
  useSessionStore,
  selectCalibrationSummary,
  selectSetCalibrationSummary,
  selectEmployees,
} from "../store/sessionStore";

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
  /** Whether initial data is currently being fetched */
  isLoading: boolean;
  /** Whether AI summary is currently being generated */
  isGeneratingAI: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Refetch the data */
  refetch: () => Promise<void>;
  /** Generate AI summary (with LLM) */
  generateAISummary: () => Promise<void>;
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
 * Automatically fetches data overview and basic insights (no LLM) on mount.
 * Provides a separate function to generate AI summary (with LLM) on demand.
 * Data is cached and persists across tab switches.
 *
 * @param options - Configuration options for the hook
 * @param options.useAgent - Whether to use AI agent for initial load (default: false for auto-load)
 * @returns Calibration summary data, loading state, error state, selection controls
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   isGeneratingAI,
 *   error,
 *   refetch,
 *   generateAISummary,
 *   summary,
 *   selectedInsights,
 *   toggleInsight,
 *   selectAll,
 *   deselectAll,
 *   getSelectedIds,
 *   selectedCount
 * } = useCalibrationSummary();
 *
 * // Data overview loads automatically
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!data) return null;
 *
 * return (
 *   <div>
 *     <h2>Total Employees: {data.data_overview.total_employees}</h2>
 *     {summary && <p>{summary}</p>}
 *     <button onClick={generateAISummary} disabled={isGeneratingAI}>
 *       Generate AI Summary
 *     </button>
 *   </div>
 * );
 * ```
 */
export const useCalibrationSummary = (
  options: UseCalibrationSummaryOptions = {}
): UseCalibrationSummaryResult => {
  const { useAgent = false } = options; // Default to false for auto-load without LLM

  // Get data from session store for persistence across tab switches
  const data = useSessionStore(selectCalibrationSummary);
  const setData = useSessionStore(selectSetCalibrationSummary);
  const employees = useSessionStore(selectEmployees);

  // Loading and error state are local (not persisted)
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Insight selection state is local UI state (not persisted across tabs)
  const [selectedInsights, setSelectedInsights] = useState<InsightSelection>(
    {}
  );

  /**
   * Fetches calibration summary data from the API
   */
  const refetch = useCallback(
    async (withAgent: boolean = useAgent) => {
      // Clear any previous errors when starting a new request
      setError(null);

      try {
        if (withAgent) {
          setIsGeneratingAI(true);
        } else {
          setIsLoading(true);
        }
        const result = await apiClient.getCalibrationSummary({
          useAgent: withAgent,
        });

        // When refreshing base data (without LLM), preserve existing AI summary if we have one
        // Only override summary if we're explicitly generating AI summary (withAgent=true)
        if (!withAgent && data?.summary) {
          result.summary = data.summary;
        }

        // Store in session store for persistence across tab switches
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
        setIsGeneratingAI(false);
      }
    },
    [useAgent, data?.summary, setData]
  );

  /**
   * Generate AI summary (calls LLM)
   */
  const generateAISummary = useCallback(async () => {
    await refetch(true); // Fetch with useAgent=true
  }, [refetch]);

  // Auto-fetch data overview (without LLM) on mount and when employees change
  // BUT: only if we don't already have data (to preserve cached data on tab switch)
  useEffect(() => {
    if (!data) {
      refetch(false); // Fetch without LLM
    } else {
      // We have cached data, just initialize insight selection from it
      const initialSelection: InsightSelection = {};
      data.insights.forEach((insight: Insight) => {
        initialSelection[insight.id] = true;
      });
      setSelectedInsights(initialSelection);
    }
    // Only run on mount or when employees change, not when data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

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
    isGeneratingAI,
    error,
    refetch: () => refetch(false),
    generateAISummary,
    summary: data?.summary ?? null,
    selectedInsights,
    toggleInsight,
    selectAll,
    deselectAll,
    getSelectedIds,
    selectedCount,
  };
};
