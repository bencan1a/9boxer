/**
 * Anomaly section component - displays analysis for a single dimension
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import type { DimensionAnalysis } from "../../types/api";

interface AnomalySectionProps {
  title: string;
  analysis: DimensionAnalysis;
  chartComponent: React.ReactNode;
}

export const AnomalySection: React.FC<AnomalySectionProps> = ({
  title,
  analysis,
  chartComponent,
}) => {
  const theme = useTheme();
  const [detailsExpanded, setDetailsExpanded] = useState(false);

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
        return "No Issues";
      case "yellow":
        return "Moderate Anomaly";
      case "red":
        return "Severe Anomaly";
      default:
        return "Unknown";
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
    <Card variant="outlined">
      <CardContent>
        {/* Header with title and status indicator */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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
            Statistical Summary
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                P-value
                <Tooltip title="Probability that observed differences are due to chance. p < 0.05 indicates significant deviation.">
                  <InfoIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: "middle" }} />
                </Tooltip>
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatPValue(analysis.p_value)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Effect Size (Cramér's V)
                <Tooltip title="Strength of association (0-1 scale). 0.1=small, 0.3=medium, 0.5=large">
                  <InfoIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: "middle" }} />
                </Tooltip>
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatEffectSize(analysis.effect_size)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Sample Size
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {analysis.sample_size}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Degrees of Freedom
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
            Interpretation
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
              "&:hover": { backgroundColor: alpha(theme.palette.text.primary, 0.04) },
              borderRadius: 1,
              p: 1,
              mt: 1,
            }}
            onClick={() => setDetailsExpanded(!detailsExpanded)}
          >
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              Detailed Deviations ({analysis.deviations.length})
            </Typography>
            <IconButton
              size="small"
              sx={{
                transform: detailsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
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
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Observed %</TableCell>
                    <TableCell align="right">Expected %</TableCell>
                    <TableCell align="right">Z-Score</TableCell>
                    <TableCell align="right">Sample Size</TableCell>
                    <TableCell align="center">Significant?</TableCell>
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
                        {deviation.category}
                      </TableCell>
                      <TableCell align="right">
                        {deviation.observed_high_pct.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {deviation.expected_high_pct.toFixed(1)}%
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: Math.abs(deviation.z_score) > 2 ? "bold" : "normal",
                          color: Math.abs(deviation.z_score) > 3 ? "error.main" : "inherit",
                        }}
                      >
                        {deviation.z_score.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">{deviation.sample_size}</TableCell>
                      <TableCell align="center">
                        {deviation.is_significant ? (
                          <Chip label="Yes" color="warning" size="small" />
                        ) : (
                          <Chip label="No" color="success" size="small" variant="outlined" />
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
