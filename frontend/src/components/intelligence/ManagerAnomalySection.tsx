/**
 * Manager anomaly section component - displays manager rating distribution analysis
 */

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { useTheme, alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useFilterStore } from "../../store/filterStore";
import type { ManagerAnalysis } from "../../types/api";

interface ManagerAnomalySectionProps {
  title: string;
  analysis: ManagerAnalysis;
  chartComponent: React.ReactNode;
}

export const ManagerAnomalySection: React.FC<ManagerAnomalySectionProps> = ({
  title,
  analysis,
  chartComponent,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const { setReportingChainFilter } = useFilterStore();

  const handleManagerClick = (managerName: string) => {
    setReportingChainFilter(managerName);
  };

  // Get status icon and color
  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case "green":
        return <CheckCircleIcon sx={{ color: "success.main" }} />;
      case "yellow":
        return <WarningIcon sx={{ color: "warning.main" }} />;
      case "red":
        return <ErrorIcon sx={{ color: "error.main" }} />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" => {
    switch (status) {
      case "green":
        return "success";
      case "yellow":
        return "warning";
      case "red":
        return "error";
      default:
        return "success";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "green":
        return t("panel.intelligenceTab.anomaly.noIssues");
      case "yellow":
        return t("panel.intelligenceTab.anomaly.moderateAnomaly");
      case "red":
        return t("panel.intelligenceTab.anomaly.severeAnomaly");
      default:
        return t("panel.intelligenceTab.anomaly.unknown");
    }
  };

  // Format p-value
  const formatPValue = (p: number): string => {
    if (p < 0.001) return "<0.001";
    return p.toFixed(3);
  };

  // Format effect size
  const formatEffectSize = (es: number): string => {
    return es.toFixed(3);
  };

  return (
    <Card variant="outlined" data-testid="manager-anomaly-section">
      <CardContent>
        {/* Header with title and status indicator */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" color="primary">
            {title}
          </Typography>
          <Chip
            icon={getStatusIcon(analysis.status)}
            label={getStatusLabel(analysis.status)}
            color={getStatusColor(analysis.status)}
            size="small"
          />
        </Box>

        {/* Statistical Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("panel.intelligenceTab.anomaly.statisticalSummary")}
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("panel.intelligenceTab.anomaly.pValue")}
                <Tooltip
                  title={t("panel.intelligenceTab.anomaly.pValueTooltip")}
                >
                  <InfoIcon
                    sx={{ fontSize: 14, ml: 0.5, verticalAlign: "middle" }}
                  />
                </Tooltip>
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatPValue(analysis.p_value)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("panel.intelligenceTab.anomaly.effectSize")}
                <Tooltip
                  title={t("panel.intelligenceTab.anomaly.effectSizeTooltip")}
                >
                  <InfoIcon
                    sx={{ fontSize: 14, ml: 0.5, verticalAlign: "middle" }}
                  />
                </Tooltip>
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatEffectSize(analysis.effect_size)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("panel.intelligenceTab.anomaly.sampleSize")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {analysis.sample_size}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("panel.intelligenceTab.anomaly.degreesOfFreedom")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {analysis.degrees_of_freedom}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Interpretation */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("panel.intelligenceTab.anomaly.interpretation")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {analysis.interpretation}
          </Typography>
        </Box>

        {/* Chart Component */}
        <Box sx={{ mb: 2 }}>{chartComponent}</Box>

        {/* Collapsible Details Table */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: alpha(theme.palette.text.primary, 0.04),
              },
              borderRadius: 1,
              p: 1,
              mt: 1,
            }}
            onClick={() => setDetailsExpanded(!detailsExpanded)}
          >
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              {t("panel.intelligenceTab.anomaly.detailedDeviations")} (
              {analysis.deviations.length})
            </Typography>
            <IconButton
              size="small"
              sx={{
                transform: detailsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: `transform ${theme.tokens.duration.normal}`,
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          <Collapse in={detailsExpanded}>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {t("panel.intelligenceTab.manager.category")}
                    </TableCell>
                    <TableCell align="right">
                      {t("panel.intelligenceTab.manager.teamSize")}
                    </TableCell>
                    <TableCell align="right">
                      {t("panel.intelligenceTab.manager.high")} %
                    </TableCell>
                    <TableCell align="right">
                      {t("panel.intelligenceTab.manager.medium")} %
                    </TableCell>
                    <TableCell align="right">
                      {t("panel.intelligenceTab.manager.low")} %
                    </TableCell>
                    <TableCell align="right">
                      {t("panel.intelligenceTab.manager.totalDeviation")}
                    </TableCell>
                    <TableCell align="right">
                      {t("panel.intelligenceTab.anomaly.zScore")}
                    </TableCell>
                    <TableCell align="center">
                      {t("panel.intelligenceTab.anomaly.significant")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysis.deviations.map((deviation, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: deviation.is_significant
                          ? alpha(theme.palette.warning.main, 0.08)
                          : "transparent",
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Link
                          component="button"
                          onClick={() => handleManagerClick(deviation.category)}
                          data-testid={`manager-filter-link-${index}`}
                          data-manager-name={deviation.category}
                          sx={{
                            cursor: "pointer",
                            textDecoration: "none",
                            fontWeight: "medium",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          <FilterListIcon sx={{ fontSize: 16 }} />
                          {deviation.category}
                        </Link>
                      </TableCell>
                      <TableCell align="right">{deviation.team_size}</TableCell>
                      <TableCell align="right">
                        {deviation.high_pct.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {deviation.medium_pct.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {deviation.low_pct.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {deviation.total_deviation.toFixed(1)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight:
                            Math.abs(deviation.z_score) > 2 ? "bold" : "normal",
                          color:
                            Math.abs(deviation.z_score) > 3
                              ? "error.main"
                              : "inherit",
                        }}
                      >
                        {deviation.z_score.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {deviation.is_significant ? (
                          <Chip
                            label={t("panel.intelligenceTab.anomaly.yes")}
                            color="warning"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label={t("panel.intelligenceTab.anomaly.no")}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </Box>
      </CardContent>
    </Card>
  );
};
