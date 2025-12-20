/**
 * Management Chain visualization component
 * Displays the reporting hierarchy from employee to VP
 */

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Employee } from "../../types/employee";

interface ManagementChainProps {
  employee: Employee;
}

export const ManagementChain: React.FC<ManagementChainProps> = ({ employee }) => {
  const theme = useTheme();

  // Build the management chain from bottom to top
  const chain: Array<{ name: string; level: string }> = [];

  // Add the employee themselves
  chain.push({
    name: employee.name,
    level: "Employee",
  });

  // Add direct manager
  if (employee.manager) {
    chain.push({
      name: employee.manager,
      level: "Manager",
    });
  }

  // Add management chain levels (01-06)
  // According to requirements, the lowest non-empty level is manager's manager
  const chainLevels = [
    { value: employee.management_chain_01, label: "Level 01" },
    { value: employee.management_chain_02, label: "Level 02" },
    { value: employee.management_chain_03, label: "Level 03" },
    { value: employee.management_chain_04, label: "Level 04 (VP)" },
    { value: employee.management_chain_05, label: "Level 05" },
    { value: employee.management_chain_06, label: "Level 06" },
  ];

  chainLevels.forEach((level) => {
    if (level.value) {
      chain.push({
        name: level.value,
        level: level.label,
      });
    }
  });

  if (chain.length === 1) {
    return (
      <Typography variant="body2" color="text.secondary">
        No management chain data available
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      {chain.map((person, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "12px",
              }}
            >
              <ArrowUpwardIcon
                sx={{
                  fontSize: 14,
                  color: "text.disabled",
                }}
              />
            </Box>
          )}
          <Paper
            variant="outlined"
            sx={{
              p: 0.75,
              backgroundColor: index === 0 ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper,
              borderColor: index === 0 ? theme.palette.primary.main : theme.palette.divider,
              borderWidth: index === 0 ? 2 : 1,
            }}
          >
            <Typography
              variant="body2"
              fontSize="0.813rem"
              fontWeight={index === 0 ? "bold" : "medium"}
              sx={{
                color: index === 0 ? "primary.main" : "text.primary",
                lineHeight: 1.3,
              }}
            >
              {person.name}
            </Typography>
            <Typography variant="caption" fontSize="0.688rem" color="text.secondary">
              {person.level}
            </Typography>
          </Paper>
        </React.Fragment>
      ))}
    </Box>
  );
};
