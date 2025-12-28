/**
 * StatisticCard - Reusable summary metric card
 *
 * Displays a single statistic with value, label, and semantic color.
 * Used in StatisticsSummary to show key metrics (total employees, modified, high performers).
 *
 * @component
 * @example
 * ```tsx
 * <StatisticCard
 *   value={125}
 *   label="Total Employees"
 *   color="primary"
 * />
 * ```
 */

import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export interface StatisticCardProps {
  /** The numeric or string value to display prominently */
  value: number | string;
  /** The descriptive label for this statistic */
  label: string;
  /** Semantic color from theme palette */
  color?: "primary" | "warning" | "success" | "error" | "info";
  /** Optional icon to display above the value */
  icon?: React.ReactNode;
  /** Card variant: outlined border or elevated with shadow */
  variant?: "outlined" | "elevation";
  /** Test identifier for automated testing */
  "data-testid"?: string;
}

/**
 * StatisticCard Component
 *
 * A reusable card component for displaying key metrics with consistent styling.
 *
 * **Design Tokens Used:**
 * - `theme.tokens.spacing.md` - Card padding
 * - `theme.palette[color].main` - Value color
 *
 * **Accessibility:**
 * - Semantic HTML structure
 * - Color is not the only indicator (label provides context)
 * - Supports screen readers
 */
export const StatisticCard: React.FC<StatisticCardProps> = ({
  value,
  label,
  color = "primary",
  icon,
  variant = "outlined",
  "data-testid": testId,
}) => {
  const theme = useTheme();

  // Format numeric values with commas for readability
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <Card
      variant={variant}
      sx={{ height: "100%" }}
      data-testid={testId || "statistic-card"}
    >
      <CardContent
        sx={{
          height: "100%",
          minHeight: 120, // Specific to this card type
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: theme.tokens.spacing.md / 8, // Convert 16px to MUI units (2)
        }}
      >
        {icon && (
          <Box
            sx={{
              mb: 1,
              color: theme.palette[color].main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant="h4"
          color={`${color}.main`}
          gutterBottom
          data-testid={`${testId || "statistic-card"}-value`}
        >
          {formattedValue}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          data-testid={`${testId || "statistic-card"}-label`}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};
