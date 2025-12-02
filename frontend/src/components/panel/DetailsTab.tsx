/**
 * Details tab wrapper - shows employee details and timeline
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useSessionStore } from "../../store/sessionStore";
import { EmployeeDetails } from "./EmployeeDetails";
import { RatingsTimeline } from "./RatingsTimeline";

export const DetailsTab: React.FC = () => {
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
          Select an employee to view details
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
        height: "100%",
        overflow: "auto",
      }}
    >
      <EmployeeDetails employee={selectedEmployee} />
      <RatingsTimeline employee={selectedEmployee} />
    </Box>
  );
};
