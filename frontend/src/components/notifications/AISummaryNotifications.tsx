/**
 * AI Summary Notification Monitor
 *
 * Monitors AI summary generation and shows toast notifications when:
 * - Generation starts: Brief info toast
 * - Generation completes: Success toast with "View" action (only if intelligence panel is not visible)
 * - Generation fails: Error toast with "Retry" action
 *
 * This component should be placed at the app level to monitor across all views.
 */

import { useEffect, useRef } from "react";
import { useCalibrationSummary } from "../../hooks/useCalibrationSummary";
import { useNotifications } from "../../contexts/NotificationContext";
import {
  useUiStore,
  selectActiveTab,
  selectIsRightPanelCollapsed,
  selectSetActiveTab,
  selectSetRightPanelCollapsed,
} from "../../store/uiStore";

const INTELLIGENCE_TAB_INDEX = 3;

export const AISummaryNotifications: React.FC = () => {
  const { isGeneratingAI, error, summary } = useCalibrationSummary();
  const { showToast, showSuccessToast, showErrorToast } = useNotifications();

  // UI state to check if intelligence panel is visible
  const activeTab = useUiStore(selectActiveTab);
  const isRightPanelCollapsed = useUiStore(selectIsRightPanelCollapsed);
  const setActiveTab = useUiStore(selectSetActiveTab);
  const setRightPanelCollapsed = useUiStore(selectSetRightPanelCollapsed);

  // Track previous state to detect changes
  const prevGenerating = useRef(isGeneratingAI);
  const prevSummary = useRef(summary);
  const prevError = useRef(error);

  // Check if intelligence panel is currently visible
  const isIntelligencePanelVisible =
    activeTab === INTELLIGENCE_TAB_INDEX && !isRightPanelCollapsed;

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
      // Only show toast if user is NOT already viewing the intelligence panel
      if (!isIntelligencePanelVisible) {
        showSuccessToast("LLM summary completed", {
          label: "View",
          onClick: () => {
            // Open the intelligence panel and switch to intelligence tab
            setActiveTab(INTELLIGENCE_TAB_INDEX);
            if (isRightPanelCollapsed) {
              setRightPanelCollapsed(false);
            }
          },
        });
      }
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
          // Retry by reloading the page (simple approach)
          // A better approach would be to call generateAISummary() directly
          // but we'd need to pass that function or access it from the hook
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
    isIntelligencePanelVisible,
    showToast,
    showSuccessToast,
    showErrorToast,
    setActiveTab,
    setRightPanelCollapsed,
    isRightPanelCollapsed,
  ]);

  // This component doesn't render anything
  return null;
};
