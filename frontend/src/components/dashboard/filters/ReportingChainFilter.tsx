import React from "react";
import { Chip, Badge } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

/**
 * Props for the ReportingChainFilter component
 */
export interface ReportingChainFilterProps {
  /** Name of the manager whose reporting chain is being filtered */
  managerName: string;
  /** Number of employees in the reporting chain (optional) */
  employeeCount?: number;
  /** Callback function when the filter is cleared */
  onClear: () => void;
}

/**
 * ReportingChainFilter Component
 *
 * Displays an active reporting chain filter as a dismissible chip with optional employee count badge.
 * Used in the FilterDrawer to show which manager's reporting chain is currently being filtered.
 *
 * Features:
 * - Manager icon for visual identification
 * - Delete button to clear the filter
 * - Optional badge showing employee count
 * - Accessible with ARIA labels
 * - Supports light and dark themes via design tokens
 *
 * @example
 * ```tsx
 * <ReportingChainFilter
 *   managerName="John Smith"
 *   employeeCount={12}
 *   onClear={() => console.log('Filter cleared')}
 * />
 * ```
 */
export const ReportingChainFilter: React.FC<ReportingChainFilterProps> = ({
  managerName,
  employeeCount,
  onClear,
}) => {
  const theme = useTheme();

  const chipContent = (
    <Chip
      icon={<AccountTreeIcon />}
      label={`Reporting to: ${managerName}`}
      onDelete={onClear}
      color="success"
      data-testid="reporting-chain-filter-chip"
      sx={{
        width: "100%",
        // Use design tokens for spacing
        paddingLeft: theme.tokens.spacing.sm,
        paddingRight: theme.tokens.spacing.sm,
      }}
      aria-label={`Reporting chain filter for ${managerName}. Click delete to remove filter.`}
    />
  );

  // If employeeCount is provided, wrap in badge
  if (employeeCount !== undefined) {
    return (
      <Badge
        badgeContent={employeeCount}
        color="primary"
        sx={{
          width: "100%",
          "& .MuiBadge-badge": {
            right: theme.tokens.spacing.md,
            top: theme.tokens.spacing.sm,
          },
        }}
        data-testid="reporting-chain-filter-badge"
      >
        {chipContent}
      </Badge>
    );
  }

  return chipContent;
};
