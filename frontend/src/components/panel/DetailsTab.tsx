/**
 * Details tab wrapper - shows employee details and timeline
 */

import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "../../store/sessionStore";
import { EmployeeDetails } from "./EmployeeDetails";
import { RatingsTimeline } from "./RatingsTimeline";
import { ManagementChain } from "./ManagementChain";

export const DetailsTab: React.FC = () => {
  const { t } = useTranslation();
  const selectedEmployeeId = useSessionStore((state) => state.selectedEmployeeId);
  const employees = useSessionStore((state) => state.employees);

  const selectedEmployee = employees.find(
    (emp) => emp.employee_id === selectedEmployeeId
  );

  if (!selectedEmployee) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <PersonOutlineIcon sx={{ fontSize: 64, color: "text.disabled" }} />
        <Typography variant="h6" color="text.secondary">
          {t('panel.detailsTab.selectEmployee')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <EmployeeDetails employee={selectedEmployee} />
      <RatingsTimeline employee={selectedEmployee} />

      {/* Management Chain */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {t('panel.detailsTab.reportingChain')}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <ManagementChain employee={selectedEmployee} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
