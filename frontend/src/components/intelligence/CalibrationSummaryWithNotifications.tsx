/**
 * Enhanced CalibrationSummarySection with toast notifications
 *
 * This wrapper adds toast notifications for LLM completion:
 * - Start: Brief "Generating summary..." toast
 * - Success: "Summary ready" with "View" action
 * - Error: Persistent error toast with "Retry" action
 *
 * This is an EXAMPLE implementation showing how to integrate
 * the notification system with LLM processing.
 */

import React, { useEffect, useRef } from "react";
import { CalibrationSummarySection } from "./CalibrationSummarySection";
import { useCalibrationSummary } from "../../hooks/useCalibrationSummary";
import { useNotifications } from "../../contexts/NotificationContext";

interface CalibrationSummaryWithNotificationsProps {
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
}

/**
 * Wrapper component that adds toast notifications to CalibrationSummarySection
 *
 * Usage:
 * ```tsx
 * // Replace:
 * <CalibrationSummarySection />
 *
 * // With:
 * <CalibrationSummaryWithNotifications />
 * ```
 */
export const CalibrationSummaryWithNotifications: React.FC<
  CalibrationSummaryWithNotificationsProps
> = ({ defaultExpanded = true }) => {
  const { isGeneratingAI, error, summary } = useCalibrationSummary();
  const { showToast, showSuccessToast, showErrorToast } = useNotifications();

  // Track previous state to detect changes
  const prevGenerating = useRef(isGeneratingAI);
  const prevSummary = useRef(summary);
  const prevError = useRef(error);

  useEffect(() => {
    // LLM generation started
    if (isGeneratingAI && !prevGenerating.current) {
      showToast({
        variant: "info",
        message: "Generating LLM summary...",
        duration: 2000,
      });
    }

    // LLM generation completed successfully
    if (
      !isGeneratingAI &&
      prevGenerating.current &&
      summary &&
      summary !== prevSummary.current &&
      !error
    ) {
      showSuccessToast("LLM summary completed", {
        label: "View",
        onClick: () => {
          // Scroll to summary section
          const summaryElement = document.querySelector(
            "[data-testid='calibration-summary-section']"
          );
          summaryElement?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        },
      });
    }

    // LLM generation failed
    if (
      !isGeneratingAI &&
      prevGenerating.current &&
      error &&
      !prevError.current
    ) {
      showErrorToast("LLM summary generation failed", {
        label: "Retry",
        onClick: () => {
          // Retry would need to be implemented in parent component
          // or passed as prop
          window.location.reload();
        },
      });
    }

    // Update refs for next render
    prevGenerating.current = isGeneratingAI;
    prevSummary.current = summary;
    prevError.current = error;
  }, [
    isGeneratingAI,
    summary,
    error,
    showToast,
    showSuccessToast,
    showErrorToast,
  ]);

  // Render the original component
  return <CalibrationSummarySection defaultExpanded={defaultExpanded} />;
};
