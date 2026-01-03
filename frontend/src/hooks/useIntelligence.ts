/**
 * Intelligence data hook - fetches statistical anomaly analysis
 */

import { useEffect, useRef, useState } from "react";
import { apiClient } from "../services/api";
import type { IntelligenceData } from "../types/api";
import { useSessionStore } from "../store/sessionStore";

/**
 * Hook return type
 */
interface UseIntelligenceResult {
  data: IntelligenceData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching intelligence data
 *
 * Automatically fetches intelligence/anomaly analysis on mount and when employee data changes.
 * Prevents duplicate requests if already loading. Data is cached between fetches.
 * Provides loading and error states, plus a manual refetch function.
 *
 * @returns Intelligence data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useIntelligence();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!data) return null;
 *
 * return (
 *   <div>
 *     <div>Quality Score: {data.quality_score}</div>
 *     <button onClick={refetch}>Refresh</button>
 *   </div>
 * );
 * ```
 */
export const useIntelligence = (): UseIntelligenceResult => {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { employees } = useSessionStore();

  // Track if a fetch is currently in progress to prevent duplicates
  const fetchInProgressRef = useRef(false);

  /**
   * Fetches intelligence data from the API
   */
  const refetch = async () => {
    // Prevent duplicate requests
    if (fetchInProgressRef.current) {
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      setError(null);
      const result = await apiClient.getIntelligence();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  // Auto-fetch on mount and when employees change
  useEffect(() => {
    refetch();
  }, [employees]);

  return { data, isLoading, error, refetch };
};
