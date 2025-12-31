/**
 * ExclusionList Component
 *
 * Displays a compact list of excluded employees with the ability to remove individual
 * exclusions or clear all at once. Part of the FilterDrawer refactoring.
 *
 * Features:
 * - Compact list of excluded employees with remove buttons
 * - "Clear All" button at bottom
 * - Empty state when no exclusions
 * - Scrollable list with max height
 * - Full design system compliance
 */

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";

export interface ExclusionListProps {
  /**
   * Array of excluded employees with id and name
   */
  excludedEmployees: Array<{ id: number; name: string }>;

  /**
   * Callback when removing a single exclusion
   * @param employeeId - ID of employee to remove from exclusion list
   */
  onRemoveExclusion: (employeeId: number) => void;

  /**
   * Callback when clearing all exclusions
   */
  onClearAll: () => void;
}

/**
 * ExclusionList Component
 *
 * Displays excluded employees in a compact, scrollable list with individual
 * remove buttons and a "Clear All" action.
 */
export const ExclusionList: React.FC<ExclusionListProps> = ({
  excludedEmployees,
  onRemoveExclusion,
  onClearAll,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Empty state - no exclusions
  if (excludedEmployees.length === 0) {
    return (
      <Box
        data-testid="exclusion-list-empty"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.tokens.spacing.lg,
          color: theme.palette.text.secondary,
          textAlign: "center",
        }}
      >
        <InfoOutlinedIcon
          sx={{
            fontSize: 48,
            mb: theme.tokens.spacing.sm,
            opacity: theme.tokens.opacity.inactive,
          }}
        />
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {t("dashboard.filterDrawer.noExclusions")}
        </Typography>
      </Box>
    );
  }

  // List of exclusions
  return (
    <Box
      data-testid="exclusion-list"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: theme.tokens.spacing.sm,
      }}
    >
      {/* Scrollable list of excluded employees */}
      <List
        dense
        sx={{
          maxHeight: 240,
          overflow: "auto",
          padding: 0,
          // Custom scrollbar styling
          "&::-webkit-scrollbar": {
            width: theme.tokens.dimensions.scrollbar.width,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor:
              theme.tokens.colors.scrollbar[theme.palette.mode].track,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              theme.tokens.colors.scrollbar[theme.palette.mode].thumb,
            borderRadius: theme.tokens.dimensions.scrollbar.thumbBorderRadius,
            border: `${theme.tokens.dimensions.scrollbar.thumbBorderWidth}px solid ${theme.tokens.colors.scrollbar[theme.palette.mode].track}`,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor:
              theme.tokens.colors.scrollbar[theme.palette.mode].thumbHover,
          },
        }}
      >
        {excludedEmployees.map((employee) => (
          <ListItem
            key={employee.id}
            data-testid={`exclusion-item-${employee.id}`}
            sx={{
              paddingLeft: theme.tokens.spacing.sm,
              paddingRight: theme.tokens.spacing.sm,
              paddingTop: theme.tokens.spacing.xs,
              paddingBottom: theme.tokens.spacing.xs,
              borderRadius: theme.tokens.radius.sm,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label={t("dashboard.filterDrawer.removeExclusion", {
                  name: employee.name,
                })}
                onClick={() => onRemoveExclusion(employee.id)}
                size="small"
                data-testid={`remove-exclusion-${employee.id}`}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemText
              primary={employee.name}
              secondary={`ID: ${employee.id}`}
              primaryTypographyProps={{
                variant: "body2",
                sx: { fontSize: theme.tokens.typography.fontSize.body2 },
              }}
              secondaryTypographyProps={{
                variant: "caption",
                sx: {
                  fontSize: theme.tokens.typography.fontSize.caption,
                  color: theme.palette.text.secondary,
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Clear All Button */}
      <Button
        variant="outlined"
        size="small"
        color="warning"
        fullWidth
        onClick={onClearAll}
        data-testid="clear-all-exclusions"
        aria-label={t("dashboard.filterDrawer.clearAllExclusions")}
        sx={{
          marginTop: theme.tokens.spacing.xs,
        }}
      >
        {t("dashboard.filterDrawer.clearAllExclusions")}
      </Button>
    </Box>
  );
};
