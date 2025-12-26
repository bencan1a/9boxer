/**
 * Management Chain visualization component
 * Displays the reporting hierarchy from employee to VP
 */

import React from "react";
import { Box, Typography, Paper, ButtonBase } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useTranslation } from "react-i18next";
import { Employee } from "../../types/employee";
import { useFilters } from "../../hooks/useFilters";

interface ManagementChainProps {
  employee: Employee;
}

export const ManagementChain: React.FC<ManagementChainProps> = ({
  employee,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setReportingChainFilter, reportingChainFilter } = useFilters();

  // Build the management chain from bottom to top
  const chain: Array<{ name: string; level: string }> = [];

  // Add the employee themselves
  chain.push({
    name: employee.name,
    level: t("panel.detailsTab.managementChain.employee"),
  });

  // Add direct manager
  if (employee.manager) {
    chain.push({
      name: employee.manager,
      level: t("panel.detailsTab.managementChain.manager"),
    });
  }

  // Add management chain levels (01-06)
  // According to requirements, the lowest non-empty level is manager's manager
  // Skip any chain level that duplicates the direct manager or any previous chain entry
  const chainLevels = [
    {
      value: employee.management_chain_01,
      label: t("panel.detailsTab.managementChain.level01"),
    },
    {
      value: employee.management_chain_02,
      label: t("panel.detailsTab.managementChain.level02"),
    },
    {
      value: employee.management_chain_03,
      label: t("panel.detailsTab.managementChain.level03"),
    },
    {
      value: employee.management_chain_04,
      label: t("panel.detailsTab.managementChain.level04"),
    },
    {
      value: employee.management_chain_05,
      label: t("panel.detailsTab.managementChain.level05"),
    },
    {
      value: employee.management_chain_06,
      label: t("panel.detailsTab.managementChain.level06"),
    },
  ];

  // Track names we've already added to prevent duplicates
  const addedNames = new Set<string>(chain.map((p) => p.name.toLowerCase()));

  chainLevels.forEach((level) => {
    if (level.value && !addedNames.has(level.value.toLowerCase())) {
      chain.push({
        name: level.value,
        level: level.label,
      });
      addedNames.add(level.value.toLowerCase());
    }
  });

  if (chain.length === 1) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("panel.detailsTab.managementChain.noData")}
      </Typography>
    );
  }

  const handleManagerClick = (managerName: string) => {
    setReportingChainFilter(managerName);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      {chain.map((person, index) => {
        const isEmployee = index === 0;
        const isClickable = !isEmployee;
        const isActiveFilter =
          reportingChainFilter?.toLowerCase() === person.name.toLowerCase();

        return (
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
            {isClickable ? (
              <ButtonBase
                onClick={() => handleManagerClick(person.name)}
                data-testid={`manager-chain-button-${index}`}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  borderRadius: 1,
                  transition: "transform 0.15s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 0.75,
                    width: "100%",
                    backgroundColor: isActiveFilter
                      ? alpha(theme.palette.success.main, 0.12)
                      : theme.palette.background.paper,
                    borderColor: isActiveFilter
                      ? theme.palette.success.main
                      : theme.palette.divider,
                    borderWidth: isActiveFilter ? 2 : 1,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: isActiveFilter
                        ? alpha(theme.palette.success.main, 0.18)
                        : alpha(theme.palette.primary.main, 0.04),
                      borderColor: isActiveFilter
                        ? theme.palette.success.main
                        : theme.palette.primary.main,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontSize="0.813rem"
                    fontWeight="medium"
                    sx={{
                      color: isActiveFilter ? "success.main" : "text.primary",
                      lineHeight: 1.3,
                      textDecoration: isActiveFilter ? "underline" : "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {person.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontSize="0.688rem"
                    color="text.secondary"
                  >
                    {person.level}
                  </Typography>
                </Paper>
              </ButtonBase>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 0.75,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                }}
              >
                <Typography
                  variant="body2"
                  fontSize="0.813rem"
                  fontWeight="bold"
                  sx={{
                    color: "primary.main",
                    lineHeight: 1.3,
                  }}
                >
                  {person.name}
                </Typography>
                <Typography
                  variant="caption"
                  fontSize="0.688rem"
                  color="text.secondary"
                >
                  {person.level}
                </Typography>
              </Paper>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};
