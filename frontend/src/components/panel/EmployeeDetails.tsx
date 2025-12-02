/**
 * Employee information display component
 */

import React from "react";
import { Box, Typography, Card, CardContent, Divider, Grid, Chip } from "@mui/material";
import { Employee, PerformanceLevel, PotentialLevel } from "../../types/employee";

interface EmployeeDetailsProps {
  employee: Employee;
}

const getPerformanceColor = (level: PerformanceLevel): string => {
  switch (level) {
    case PerformanceLevel.HIGH:
      return "success";
    case PerformanceLevel.MEDIUM:
      return "warning";
    case PerformanceLevel.LOW:
      return "error";
    default:
      return "default";
  }
};

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

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee }) => {
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
            Employee Information
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <InfoRow label="Job Level" value={employee.job_level} />
            <InfoRow label="Manager" value={employee.manager} />
            <InfoRow label="Chain Level 04" value={employee.management_chain_04} />
            <InfoRow label="Chain Level 05" value={employee.management_chain_05} />
            <InfoRow label="Chain Level 06" value={employee.management_chain_06} />
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Current Assessment */}
        <Box>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Current Assessment
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Performance:
                </Typography>
                <Chip
                  label={employee.performance}
                  color={getPerformanceColor(employee.performance) as any}
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Potential:
                </Typography>
                <Chip
                  label={employee.potential}
                  color={getPotentialColor(employee.potential) as any}
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Position:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employee.position_label}
                </Typography>
              </Box>
              {employee.modified_in_session && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label="Modified in Session"
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
