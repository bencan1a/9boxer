/**
 * Management Chain visualization component
 * Displays the reporting hierarchy from employee to VP
 *
 * Shows employee's reporting chain with clickable manager names
 * that navigate to manager details.
 *
 * @component
 * @screenshots
 *   - details-reporting-chain-clickable: Reporting Chain section with clickable manager names
 */

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme, alpha } from "@mui/material/styles";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useTranslation } from "react-i18next";
import { Employee } from "../../types/employee";
import { useFilters } from "../../hooks/useFilters";
import { useOrgHierarchy } from "../../hooks/useOrgHierarchy";

interface ManagementChainProps {
  employee: Employee;
}

export const ManagementChain: React.FC<ManagementChainProps> = ({
  employee,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { selectManager, selectedManagers } = useFilters();
  const { managers, getReportIds } = useOrgHierarchy();
  const [loadingManager, setLoadingManager] = useState<string | null>(null);

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

  const handleManagerClick = async (managerName: string) => {
    // Find the manager in the org managers list to get their employee ID
    const manager = managers.find((m) => m.name === managerName);
    if (!manager) {
      console.warn(`Manager "${managerName}" not found in org hierarchy`);
      selectManager(managerName, []);
      return;
    }

    setLoadingManager(managerName);
    try {
      // Fetch employee IDs from org service
      const employeeIds = await getReportIds(manager.employee_id);
      selectManager(managerName, employeeIds);
    } catch (error) {
      console.error(
        `Failed to fetch employee IDs for manager ${managerName}:`,
        error
      );
      // Fallback to empty array on error
      selectManager(managerName, []);
    } finally {
      setLoadingManager(null);
    }
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
        const isActiveFilter = selectedManagers.includes(person.name);
        const isLoading = loadingManager === person.name;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: `${theme.tokens.spacing.sm + theme.tokens.spacing.xs}px`,
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
                  transition: `transform ${theme.tokens.duration.fast} ${theme.tokens.easing.easeInOut}`,
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        fontSize="0.813rem"
                        fontWeight="medium"
                        sx={{
                          color: isActiveFilter
                            ? "success.main"
                            : "text.primary",
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
                    </Box>
                    {isLoading && (
                      <CircularProgress
                        size={16}
                        sx={{ color: "primary.main" }}
                      />
                    )}
                  </Box>
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
