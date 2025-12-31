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
  /** Show a dot badge instead of count (for sample data) */
  showDot?: boolean;
  /** Optional click handler */
  onClick?: () => void;
  /** Children to wrap with the badge */
  children: React.ReactNode;
  /** Custom styling */
  sx?: BadgeProps["sx"];
  /** Custom test id for the badge */
  testId?: string;
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
  showDot = false,
  onClick,
  children,
  sx = {},
  testId = "change-indicator-badge",
}) => {
  // Determine badge content: dot for sample data, count for changes
  const badgeContent = showDot ? "•" : count > 0 ? `${count}` : 0;
  const shouldShow = showDot || count > 0;

  return (
    <Badge
      badgeContent={badgeContent}
      color="success"
      invisible={invisible || !shouldShow}
      onClick={onClick}
      data-testid={testId}
      sx={{
        "& .MuiBadge-badge": {
          fontSize: showDot ? "1.2rem" : "0.7rem",
        },
        ...sx,
      }}
    >
      {children}
    </Badge>
  );
};
