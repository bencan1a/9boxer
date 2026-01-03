/**
 * LLM Summary hook - generates AI-powered calibration summaries
 *
 * Provides on-demand LLM summary generation from selected insights.
 * Checks availability before allowing generation.
 */

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../services/api";
import type { LLMAvailability, LLMSummaryResult } from "../types/api";

/**
 * Hook return type
 */
interface UseLLMSummaryResult {
  /** Generated summary data, null if not generated yet */
  data: LLMSummaryResult | null;
  /** Whether summary is currently being generated */
  isLoading: boolean;
  /** Error if generation failed */
  error: Error | null;
  /** Whether LLM service is available */
  isAvailable: boolean;
  /** Reason if LLM is not available */
  unavailableReason: string | null;
  /** Whether availability has been checked */
  availabilityChecked: boolean;
  /** Generate summary from selected insight IDs */
  generate: (selectedInsightIds: string[]) => Promise<void>;
  /** Clear the current summary */
  clear: () => void;
}

/**
 * Custom hook for generating LLM-powered calibration summaries
 *
 * Checks LLM availability on mount and provides on-demand summary generation.
 * Only anonymized data is sent to the LLM - no employee PII.
 *
 * @deprecated Use useCalibrationSummary with summary field instead.
 * This hook will be removed in the next major version.
 *
 * @returns LLM summary data, availability status, generation function
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   error,
 *   isAvailable,
 *   unavailableReason,
 *   generate,
 *   clear
 * } = useLLMSummary();
 *
 * return (
 *   <div>
 *     {!isAvailable && (
 *       <Alert severity="info">
 *         AI Summary not available: {unavailableReason}
 *       </Alert>
 *     )}
 *
 *     <Button
 *       onClick={() => generate(selectedInsightIds)}
 *       disabled={!isAvailable || isLoading || selectedInsightIds.length === 0}
 *     >
 *       {isLoading ? "Generating..." : "Generate AI Summary"}
 *     </Button>
 *
 *     {error && <Alert severity="error">{error.message}</Alert>}
 *
 *     {data && (
 *       <div>
 *         <Typography>{data.summary}</Typography>
 *         <ul>
 *           {data.key_recommendations.map((rec, i) => (
 *             <li key={i}>{rec}</li>
 *           ))}
 *         </ul>
 *       </div>
 *     )}
 *   </div>
 * );
 * ```
 */
export const useLLMSummary = (): UseLLMSummaryResult => {
  // Add deprecation warning
  useEffect(() => {
    console.warn(
      '[DEPRECATED] useLLMSummary is deprecated. Use useCalibrationSummary with summary field instead. ' +
      'This hook will be removed in the next major version.'
    );
  }, []);
  const [data, setData] = useState<LLMSummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [availability, setAvailability] = useState<LLMAvailability | null>(
    null
  );
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  /**
   * Check LLM availability on mount
   */
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const result = await apiClient.checkLLMAvailability();
        setAvailability(result);
      } catch (err) {
        // If we can't check availability, assume unavailable
        setAvailability({
          available: false,
          reason: "Failed to check LLM availability",
        });
      } finally {
        setAvailabilityChecked(true);
      }
    };

    checkAvailability();
  }, []);

  /**
   * Generate summary from selected insights
   */
  const generate = useCallback(async (selectedInsightIds: string[]) => {
    if (selectedInsightIds.length === 0) {
      setError(new Error("At least one insight must be selected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.generateLLMSummary(selectedInsightIds);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear the current summary
   */
  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    isAvailable: availability?.available ?? false,
    unavailableReason: availability?.reason ?? null,
    availabilityChecked,
    generate,
    clear,
  };
};
