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
        backgroundColor: hasActiveFilters
          ? alpha(theme.palette.primary.main, 0.04)
          : "transparent",
        "&:before": { display: "none" },
        // Always have the border to prevent jitter - just change its color
        borderLeft: `4px solid ${hasActiveFilters ? theme.palette.primary.main : "transparent"}`,
        borderRadius: 0, // Force square corners
        pl: 1.5,
        my: 0.5,
        transition: `all ${theme.tokens.duration.fast} ${theme.tokens.easing.easeInOut}`,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${testId}-content`}
        id={`${testId}-header`}
        data-testid={`${testId}-header`}
        sx={{
          minHeight: theme.tokens.dimensions.menuItem.minHeight,
          borderRadius: 0, // Force square corners on summary
          "&.Mui-expanded": {
            minHeight: theme.tokens.dimensions.menuItem.minHeight,
          },
          "& .MuiAccordionSummary-content": {
            my: 1.5,
            alignItems: "center", // Vertically center content to prevent height changes
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
            display: "flex",
            alignItems: "center",
          }}
        >
          {title}
          {/* Always render chip to prevent vertical jitter, but hide when count is 0 */}
          <Chip
            label={count || 0}
            size="small"
            color="primary"
            data-testid={`${testId}-count-badge`}
            sx={{
              ml: 1,
              height: "20px", // Compact height to match text
              "& .MuiChip-label": {
                px: 0.75,
                py: 0,
                fontSize: "0.75rem",
                lineHeight: "20px",
              },
              fontWeight: theme.tokens.typography.fontWeight.semiBold,
              visibility: hasActiveFilters ? "visible" : "hidden",
              opacity: hasActiveFilters ? 1 : 0,
              transition: `opacity ${theme.tokens.duration.fast} ${theme.tokens.easing.easeInOut}`,
            }}
          />
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
