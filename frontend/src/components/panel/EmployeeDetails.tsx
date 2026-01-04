/**
 * Employee information display component
 *
 * Displays comprehensive employee information including current assessment,
 * performance history, reporting chain, and flags.
 *
 * @component
 * @screenshots
 *   - changes-employee-details: Employee details panel showing updated ratings
 *   - employee-details-panel-expanded: Expanded employee details panel with all information
 *   - details-current-assessment: Enhanced Current Assessment section with color-coded chips
 *   - details-flags-ui: Flags section with Add Flag picker and colored flag chips
 *   - details-reporting-chain-clickable: Reporting Chain section with clickable manager names
 */

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import { useTranslation } from "react-i18next";
import { Employee, PotentialLevel } from "../../types/employee";
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
        <Box sx={{ mb: 3 }} data-testid="current-assessment-section">
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {t("panel.detailsTab.currentAssessment")}
          </Typography>
          <Box sx={{ mt: 1 }}>
            {/* Box Name and Coordinates */}
            <Box sx={{ mb: 2 }} data-testid="box-position-label">
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
                    ) as "success" | "warning" | "error" | "default"
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
                  color={
                    getPotentialColor(employee.potential) as
                      | "success"
                      | "warning"
                      | "error"
                      | "default"
                  }
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
