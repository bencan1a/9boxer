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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Employee, PotentialLevel } from "../../types/employee";
import { useSessionStore } from "../../store/sessionStore";
import { getPositionLabel } from "../../constants/positionLabels";

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

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee }) => {
  const { t } = useTranslation();
  const updateEmployee = useSessionStore((state) => state.updateEmployee);

  const handlePromotionReadinessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateEmployee(employee.employee_id, {
      promotion_readiness: event.target.checked,
    });
  };

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
            {t('panel.detailsTab.employeeInformation')}
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <InfoRow label={t('panel.detailsTab.jobFunction')} value={employee.job_function} />
            <InfoRow label={t('panel.detailsTab.location')} value={employee.location} />
            <InfoRow label={t('panel.detailsTab.jobLevel')} value={employee.job_level} />
            <InfoRow label={t('panel.detailsTab.tenure')} value={employee.tenure_category} />
            <InfoRow label={t('panel.detailsTab.timeInLevel')} value={employee.time_in_job_profile} />
          </Grid>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={employee.promotion_readiness ?? false}
                  onChange={handlePromotionReadinessChange}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  {t('panel.detailsTab.promotionReady')}
                </Typography>
              }
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Current Assessment */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {t('panel.detailsTab.currentAssessment')}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('panel.detailsTab.potential')}
                </Typography>
                <Chip
                  label={employee.potential}
                  color={getPotentialColor(employee.potential) as any}
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('panel.detailsTab.position')}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {getPositionLabel(employee.grid_position)}
                </Typography>
              </Box>
              {employee.modified_in_session && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={t('panel.detailsTab.modifiedInSession')}
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
