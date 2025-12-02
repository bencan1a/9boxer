/**
 * Statistics data hook
 */

import { useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { StatisticsResponse } from "../types/api";
import { useSessionStore } from "../store/sessionStore";

interface UseStatisticsResult {
  statistics: StatisticsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStatistics = (): UseStatisticsResult => {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watch for changes in employees to trigger refetch
  const employees = useSessionStore((state) => state.employees);
  const sessionId = useSessionStore((state) => state.sessionId);

  const fetchStatistics = async () => {
    if (!sessionId) {
      setStatistics(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getStatistics();
      setStatistics(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || "Failed to load statistics";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when employees change
  useEffect(() => {
    fetchStatistics();
  }, [employees.length, sessionId]);

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics,
  };
};
