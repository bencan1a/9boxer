/**
 * Anomalies section component - displays detected anomalies
 */

import React from "react";
import { Box, Card, CardContent } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../atoms/SectionHeader";
import { AnomalyCard } from "../atoms/AnomalyCard";
import { EmptyState } from "../../common/EmptyState";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import type { Anomaly } from "../../../types/intelligence";

export interface AnomaliesSectionProps {
  /**
   * List of anomalies to display
   */
  anomalies: Anomaly[];

  /**
   * Callback when an anomaly is clicked
   */
  onAnomalyClick?: (anomaly: Anomaly) => void;

  /**
   * Callback when an anomaly is dismissed
   */
  onAnomalyDismiss?: (anomalyId: string) => void;

  /**
   * Whether to show action buttons on anomaly cards
   */
  showActions?: boolean;
}

/**
 * Container section for displaying detected statistical anomalies.
 *
 * Shows a summary of anomalies by severity (critical/warning/info) with color-coded
 * badges, followed by individual anomaly cards. Displays an empty state when no
 * anomalies are detected. Provides callbacks for clicking and dismissing anomalies.
 *
 * @component
 * @example
 * ```tsx
 * <AnomaliesSection
 *   anomalies={[
 *     {
 *       id: 'anomaly-1',
 *       type: 'distribution',
 *       severity: 'warning',
 *       title: 'Uneven distribution detected',
 *       description: 'Position 1 has 15% more employees than ideal',
 *       affectedEmployees: ['emp-1', 'emp-2'],
 *       suggestion: 'Consider reviewing calibration',
 *       confidence: 0.85
 *     },
 *     // ... more anomalies
 *   ]}
 *   onAnomalyClick={handleAnomalyClick}
 *   onAnomalyDismiss={handleAnomalyDismiss}
 *   showActions={true}
 * />
 * ```
 *
 * @param {AnomaliesSectionProps} props - Component props
 * @param {Anomaly[]} props.anomalies - List of anomalies to display
 * @param {function} [props.onAnomalyClick] - Callback when an anomaly card is clicked
 * @param {function} [props.onAnomalyDismiss] - Callback when an anomaly is dismissed
 * @param {boolean} [props.showActions=true] - Whether to show action buttons on cards
 *
 * @accessibility
 * - Severity badges use color and text labels
 * - Empty state provides meaningful feedback
 * - All interactive elements keyboard accessible
 * - ARIA labels provided by child components
 *
 * @i18n
 * - intelligence.anomalies.title - Section title
 * - intelligence.anomalies.tooltip - Section explanatory tooltip
 * - intelligence.anomalies.empty - Empty state title
 * - intelligence.anomalies.emptyDescription - Empty state description
 * - intelligence.anomalies.criticalCount - Critical severity count with pluralization
 * - intelligence.anomalies.warningCount - Warning severity count with pluralization
 * - intelligence.anomalies.infoCount - Info severity count with pluralization
 *
 * @see AnomalyCard
 * @see SectionHeader
 * @see EmptyState
 */
export const AnomaliesSection: React.FC<AnomaliesSectionProps> = ({
  anomalies,
  onAnomalyClick,
  onAnomalyDismiss,
  showActions = true,
}) => {
  const { t } = useTranslation();

  // Count by severity - memoized to avoid recalculation on every render
  const { criticalCount, warningCount, infoCount } = React.useMemo(
    () => ({
      criticalCount: anomalies.filter((a) => a.severity === "critical").length,
      warningCount: anomalies.filter((a) => a.severity === "warning").length,
      infoCount: anomalies.filter((a) => a.severity === "info").length,
    }),
    [anomalies]
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          title={t("intelligence.anomalies.title")}
          tooltip={t("intelligence.anomalies.tooltip")}
          icon={<ErrorOutlineIcon />}
        />

        {anomalies.length === 0 ? (
          <EmptyState
            title={t("intelligence.anomalies.empty")}
            description={t("intelligence.anomalies.emptyDescription")}
            iconSize="small"
          />
        ) : (
          <>
            {/* Summary badges */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              {criticalCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "error.main",
                    }}
                  />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {t("intelligence.anomalies.criticalCount", {
                      count: criticalCount,
                    })}
                  </Box>
                </Box>
              )}
              {warningCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                    }}
                  />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {t("intelligence.anomalies.warningCount", {
                      count: warningCount,
                    })}
                  </Box>
                </Box>
              )}
              {infoCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "info.main",
                    }}
                  />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {t("intelligence.anomalies.infoCount", {
                      count: infoCount,
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Anomaly cards */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {anomalies.map((anomaly) => (
                <AnomalyCard
                  key={anomaly.id}
                  anomaly={anomaly}
                  onClick={onAnomalyClick}
                  onDismiss={onAnomalyDismiss}
                  showActions={showActions}
                />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
