/**
 * FilterSection - Reusable expandable/collapsible filter section
 *
 * A wrapper component for filter groups in the FilterDrawer that provides:
 * - Expandable/collapsible accordion behavior
 * - Optional count badge for active filters
 * - Consistent styling and accessibility
 * - Light and dark theme support
 *
 * Used for organizing filter options (job levels, locations, managers, etc.)
 */

import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useTheme, alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface FilterSectionProps {
  /**
   * Section title displayed in the header
   */
  title: string;

  /**
   * Number of active filters in this section
   * If > 0, displays a count badge
   */
  count?: number;

  /**
   * Whether the section is currently expanded
   */
  expanded: boolean;

  /**
   * Callback when the section is toggled (expand/collapse)
   */
  onToggle: () => void;

  /**
   * Filter options and content to display when expanded
   */
  children: React.ReactNode;

  /**
   * Optional test ID for testing
   * @default "filter-section"
   */
  testId?: string;
}

/**
 * FilterSection Component
 *
 * A reusable accordion-based filter section with optional count badge.
 *
 * @example
 * ```tsx
 * const [expanded, setExpanded] = useState(true);
 * const selectedLevels = ['Senior', 'Mid'];
 *
 * <FilterSection
 *   title="Job Levels"
 *   count={selectedLevels.length}
 *   expanded={expanded}
 *   onToggle={() => setExpanded(!expanded)}
 * >
 *   <FormGroup>
 *     {levels.map(level => (
 *       <FormControlLabel
 *         key={level}
 *         control={<Checkbox checked={selectedLevels.includes(level)} />}
 *         label={level}
 *       />
 *     ))}
 *   </FormGroup>
 * </FilterSection>
 * ```
 */
export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  count,
  expanded,
  onToggle,
  children,
  testId = "filter-section",
}) => {
  const theme = useTheme();
  const hasActiveFilters = count !== undefined && count > 0;

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      elevation={0}
      data-testid={testId}
      sx={{
        backgroundColor: "transparent",
        "&:before": { display: "none" },
        // Active state styling when filters are selected
        ...(hasActiveFilters && {
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          pl: 1.5,
          my: 0.5,
          transition: `all ${theme.tokens.duration.fast} ${theme.tokens.easing.easeInOut}`,
        }),
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${testId}-content`}
        id={`${testId}-header`}
        data-testid={`${testId}-header`}
        sx={{
          minHeight: theme.tokens.dimensions.menuItem.minHeight,
          "&.Mui-expanded": {
            minHeight: theme.tokens.dimensions.menuItem.minHeight,
          },
          "& .MuiAccordionSummary-content": {
            my: 1.5,
          },
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{
            color: hasActiveFilters
              ? theme.palette.primary.main
              : theme.palette.text.primary,
          }}
        >
          {title}
          {hasActiveFilters && (
            <Chip
              label={count}
              size="small"
              color="primary"
              data-testid={`${testId}-count-badge`}
              sx={{
                ml: 1,
                fontWeight: theme.tokens.typography.fontWeight.semiBold,
              }}
            />
          )}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          pt: 0,
          pb: 2,
        }}
        data-testid={`${testId}-content`}
        id={`${testId}-content`}
        role="region"
        aria-labelledby={`${testId}-header`}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
