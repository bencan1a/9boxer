/**
 * Anomalies section component - displays detected anomalies
 */

import React from "react";
import { Box, Card, CardContent } from "@mui/material";
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
 * Anomalies section component
 *
 * Container for displaying detected anomalies with optional actions.
 *
 * @example
 * ```tsx
 * <AnomaliesSection
 *   anomalies={anomalies}
 *   onAnomalyClick={(a) => console.log('Clicked:', a)}
 *   onAnomalyDismiss={(id) => console.log('Dismissed:', id)}
 *   showActions
 * />
 * ```
 */
export const AnomaliesSection: React.FC<AnomaliesSectionProps> = ({
  anomalies,
  onAnomalyClick,
  onAnomalyDismiss,
  showActions = true,
}) => {
  // Count by severity
  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;
  const warningCount = anomalies.filter((a) => a.severity === "warning").length;
  const infoCount = anomalies.filter((a) => a.severity === "info").length;

  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          title="Anomalies Detected"
          tooltip="Statistical anomalies found in your talent distribution data"
          icon={<ErrorOutlineIcon />}
        />

        {anomalies.length === 0 ? (
          <EmptyState
            title="No Anomalies Detected"
            description="Your talent distribution appears statistically normal with no significant anomalies."
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
                    {criticalCount} Critical
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
                    {warningCount} Warning
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
                    {infoCount} Info
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
