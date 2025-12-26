/**
 * Employee tile component (draggable)
 */

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  useTheme,
  Tooltip,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useTranslation } from "react-i18next";
import { Employee } from "../../types/employee";
import { logger } from "../../utils/logger";
import { getPositionLabel } from "../../constants/positionLabels";
import { getFlagDisplayName } from "../../constants/flags";

interface EmployeeTileProps {
  employee: Employee;
  onSelect: (employeeId: number) => void;
  donutModeActive?: boolean;
}

export const EmployeeTile: React.FC<EmployeeTileProps> = ({
  employee,
  onSelect,
  donutModeActive = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: `employee-${employee.employee_id}`,
      data: { employee },
    });

  const handleCardClick = () => {
    logger.debug(
      "Card clicked - selecting employee:",
      employee.employee_id,
      employee.name
    );
    onSelect(employee.employee_id);
  };

  // Determine if employee has been modified in donut mode
  const isDonutModified = donutModeActive && employee.donut_modified;

  // Determine which position label to show
  const displayLabel =
    donutModeActive && employee.donut_position
      ? getPositionLabel(employee.donut_position)
      : getPositionLabel(employee.grid_position);

  // Get flags count and display names
  const flags = employee.flags || [];
  const flagCount = flags.length;
  const flagTooltip =
    flags.length > 0
      ? flags.map((flag) => getFlagDisplayName(flag)).join(", ")
      : "";

  return (
    <Card
      ref={setNodeRef}
      onClick={handleCardClick}
      sx={{
        mb: 1,
        minWidth: 280, // Minimum width for multi-column grid layout
        maxWidth: 400, // Maximum width for readability
        borderLeft: employee.modified_in_session ? 4 : 0,
        borderLeftColor: "secondary.main",
        cursor: "pointer",
        display: "flex",
        opacity: isDragging ? 0.5 : isDonutModified ? 0.7 : 1,
        userSelect: "none",
        border: isDonutModified ? 2 : 0,
        borderStyle: isDonutModified ? "solid" : "none",
        borderColor: isDonutModified
          ? theme.tokens.colors.semantic.donutMode
          : undefined,
        boxShadow: isDonutModified ? 2 : 1,
        "&:hover": {
          boxShadow: 3,
        },
      }}
      data-testid={`employee-card-${employee.employee_id}`}
      data-position={employee.grid_position}
      data-donut-position={employee.donut_position || ""}
    >
      {/* Drag Handle */}
      <Box
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        sx={{
          width: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          borderRight: 1,
          borderColor: "divider",
          backgroundColor: "action.hover",
          "&:active": {
            cursor: "grabbing",
          },
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to card
      >
        <DragIndicatorIcon sx={{ fontSize: 16, color: "action.active" }} />
      </Box>

      {/* Card Content */}
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flex: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {employee.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
          {employee.business_title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mt: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Chip label={employee.job_level} size="small" sx={{ height: 18 }} />
          {employee.modified_in_session && (
            <Chip
              label={t("grid.employeeTile.modified")}
              size="small"
              color="secondary"
              sx={{ height: 18 }}
              data-testid="modified-indicator"
            />
          )}
          {isDonutModified && (
            <Chip
              label={t("grid.employeeTile.donut")}
              size="small"
              sx={{
                height: 18,
                backgroundColor: theme.tokens.colors.semantic.donutMode,
                color: "white",
                fontWeight: "bold",
              }}
              data-testid="donut-indicator"
            />
          )}
          {flagCount > 0 && (
            <Tooltip title={flagTooltip} arrow>
              <Chip
                icon={<LocalOfferIcon />}
                label={flagCount}
                size="small"
                sx={{
                  height: 18,
                  backgroundColor: theme.palette.info.main,
                  color: "white",
                  fontWeight: "medium",
                  display: "flex",
                  alignItems: "center",
                  "& .MuiChip-icon": {
                    color: "white",
                    fontSize: theme.tokens.typography.fontSize.body2,
                    marginLeft: theme.tokens.spacing.xs,
                    marginTop: 0,
                    marginBottom: 0,
                    paddingLeft: theme.tokens.spacing.xs,
                    paddingRight: theme.tokens.spacing.xs,
                  },
                  "& .MuiChip-label": {
                    paddingLeft: theme.tokens.spacing.xs,
                    paddingRight: theme.tokens.spacing.sm,
                  },
                }}
                data-testid="flag-badge"
              />
            </Tooltip>
          )}
        </Box>
        {isDonutModified && employee.donut_position && (
          <Typography
            variant="caption"
            color="text.secondary"
            fontSize={theme.tokens.typography.fontSize.caption}
            sx={{ mt: 0.5, display: "block", fontStyle: "italic" }}
          >
            {t("grid.employeeTile.donutLabel")} {displayLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
