/**
 * Employee information display component
 */

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Employee, PotentialLevel } from "../../types/employee";
import { useSessionStore } from "../../store/sessionStore";
import {
  getPositionName,
  getShortPositionLabel,
} from "../../constants/positionLabels";
import { EmployeeFlags } from "./EmployeeFlags";
import { EmployeeChangesSummary } from "./EmployeeChangesSummary";

interface EmployeeDetailsProps {
  employee: Employee;
}

const getPotentialColor = (level: PotentialLevel): string => {
  switch (level) {
    case PotentialLevel.HIGH:
      return "success";
    case PotentialLevel.MEDIUM:
      return "warning";
    case PotentialLevel.LOW:
      return "error";
    default:
      return "default";
  }
};

// Get background color for performance/potential chips based on grid position
const getBoxColor = (position: number, theme: any): string => {
  // High Performers: positions 6, 8, 9
  if ([6, 8, 9].includes(position)) {
    return theme.palette.gridBox.highPerformer;
  }
  // Needs Attention: positions 1, 2, 4
  if ([1, 2, 4].includes(position)) {
    return theme.palette.gridBox.needsAttention;
  }
  // Solid Performer: position 5
  if (position === 5) {
    return theme.palette.gridBox.solidPerformer;
  }
  // Development: positions 3, 7
  if ([3, 7].includes(position)) {
    return theme.palette.gridBox.development;
  }
  return theme.palette.background.paper;
};

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  if (!value) return null;

  return (
    <>
      <Grid item xs={5}>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          {label}
        </Typography>
      </Grid>
      <Grid item xs={7}>
        <Typography variant="body2">{value}</Typography>
      </Grid>
    </>
  );
};

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({
  employee,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const boxColor = getBoxColor(employee.grid_position, theme);

  return (
    <Card variant="outlined">
      <CardContent>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {employee.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee.business_title}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Employee Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {t("panel.detailsTab.employeeInformation")}
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <InfoRow
              label={t("panel.detailsTab.jobFunction")}
              value={employee.job_function}
            />
            <InfoRow
              label={t("panel.detailsTab.location")}
              value={employee.location}
            />
            <InfoRow
              label={t("panel.detailsTab.jobLevel")}
              value={employee.job_level}
            />
            <InfoRow
              label={t("panel.detailsTab.tenure")}
              value={employee.tenure_category}
            />
            <InfoRow
              label={t("panel.detailsTab.timeInLevel")}
              value={employee.time_in_job_profile}
            />
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Flags */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            🏷️ {t("panel.detailsTab.flags")}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <EmployeeFlags employee={employee} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Current Assessment */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {t("panel.detailsTab.currentAssessment")}
          </Typography>
          <Box sx={{ mt: 1 }}>
            {/* Box Name and Coordinates */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="medium">
                {t("panel.detailsTab.box")}:{" "}
                {getPositionName(employee.grid_position)}{" "}
                {getShortPositionLabel(employee.grid_position)}
              </Typography>
            </Box>

            {/* Performance and Potential Chips */}
            <Box
              sx={{ display: "flex", gap: 2, mb: 2, alignItems: "flex-end" }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 0.5 }}
                >
                  {t("panel.detailsTab.performance")}
                </Typography>
                <Chip
                  label={employee.performance}
                  size="small"
                  color={
                    getPotentialColor(
                      employee.performance as PotentialLevel
                    ) as any
                  }
                  sx={{
                    fontWeight: "medium",
                    width: "100%",
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 0.5 }}
                >
                  {t("panel.detailsTab.potential")}
                </Typography>
                <Chip
                  label={employee.potential}
                  size="small"
                  color={getPotentialColor(employee.potential) as any}
                  sx={{
                    fontWeight: "medium",
                    width: "100%",
                  }}
                />
              </Box>
              {employee.modified_in_session && (
                <Chip
                  label={t("panel.detailsTab.modifiedInSession")}
                  color="warning"
                  size="small"
                  variant="outlined"
                  sx={{ mb: 0.25 }}
                />
              )}
            </Box>

            {/* Changes Summary */}
            <Divider sx={{ my: 2 }} />
            <EmployeeChangesSummary employeeId={employee.employee_id} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
