/**
 * Change indicator badge component
 * Displays the count of unsaved changes with visual severity indicators
 */

import React from "react";
import { Badge, BadgeProps } from "@mui/material";

/**
 * Props for the ChangeIndicator component
 */
export interface ChangeIndicatorProps {
  /** Number of unsaved changes to display */
  count: number;
  /** Whether the badge should be visible */
  invisible?: boolean;
  /** Optional click handler */
  onClick?: () => void;
  /** Children to wrap with the badge */
  children: React.ReactNode;
  /** Custom styling */
  sx?: BadgeProps["sx"];
}

/**
 * ChangeIndicator component
 * 
 * A badge that displays the count of unsaved changes.
 * 
 * @example
 * ```tsx
 * <ChangeIndicator count={5}>
 *   <Button>File Menu</Button>
 * </ChangeIndicator>
 * ```
 */
export const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({
  count,
  invisible = false,
  onClick,
  children,
  sx = {},
}) => {
  return (
    <Badge
      badgeContent={count > 0 ? `${count}` : 0}
      color="success"
      invisible={invisible || count === 0}
      onClick={onClick}
      data-testid="change-indicator-badge"
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "0.7rem",
        },
        ...sx,
      }}
    >
      {children}
    </Badge>
  );
};
