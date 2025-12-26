/**
 * Intelligence data hook - fetches statistical anomaly analysis
 */

import { useEffect, useState } from "react";
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
 * Automatically fetches intelligence data on mount and when employee data changes.
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
 * return <div>Quality Score: {data.quality_score}</div>;
 * ```
 */
export const useIntelligence = (): UseIntelligenceResult => {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { employees } = useSessionStore(); // Trigger refetch when employees change

  /**
   * Fetches intelligence data from the API
   */
  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.getIntelligence();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when employees array changes (real-time updates)
  useEffect(() => {
    refetch();
  }, [employees, refetch]);

  return { data, isLoading, error, refetch };
};
