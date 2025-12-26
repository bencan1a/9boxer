import React from "react";
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Flag filter option with count
 */
export interface FlagOption {
  key: string;
  displayName: string;
  count: number;
}

/**
 * Props for FlagFilters component
 */
export interface FlagFiltersProps {
  /**
   * Currently selected flag keys
   */
  selectedFlags: string[];
  /**
   * Available flag options with employee counts
   */
  flagOptions: FlagOption[];
  /**
   * Callback when a flag is toggled
   */
  onFlagToggle: (flag: string) => void;
}

/**
 * Sanitize string for use in data-testid attribute
 */
const sanitizeTestId = (value: string): string => {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

/**
 * FlagFilters Component
 *
 * Displays flag checkboxes for filtering employees by flags.
 * Each flag shows its employee count and can be toggled on/off.
 *
 * Features:
 * - Checkbox list of all flag types
 * - Employee count display next to each flag
 * - Flag emoji 🏷️ in section
 * - Full accessibility support
 * - Light and dark theme support
 * - Design system token compliance
 */
export const FlagFilters: React.FC<FlagFiltersProps> = ({
  selectedFlags,
  flagOptions,
  onFlagToggle,
}) => {
  const theme = useTheme();

  return (
    <Box data-testid="flag-filters-container">
      <FormGroup>
        {flagOptions.map((flag) => (
          <FormControlLabel
            key={flag.key}
            control={
              <Checkbox
                checked={selectedFlags.includes(flag.key)}
                onChange={() => onFlagToggle(flag.key)}
                size="small"
                data-testid={`filter-checkbox-flags-${sanitizeTestId(flag.key)}`}
                inputProps={{
                  "aria-label": `Filter by ${flag.displayName}, ${flag.count} employees`,
                }}
                sx={{
                  color: theme.palette.text.secondary,
                  "&.Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{
                  fontSize: theme.tokens.typography.fontSize.body2,
                  color: theme.palette.text.primary,
                }}
              >
                {flag.displayName} ({flag.count})
              </Typography>
            }
            sx={{
              marginLeft: 0,
              marginRight: 0,
              paddingY: theme.tokens.spacing.xs / 8, // Convert px to theme spacing units
            }}
          />
        ))}
      </FormGroup>
    </Box>
  );
};
