/**
 * FilterToolbar Storybook Stories
 *
 * Demonstrates different variants and states of the FilterToolbar component.
 * Includes comprehensive stories for screenshot generation covering:
 * - Expanded default state
 * - Active filters state
 * - Search with results
 * - Collapsed state
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import { FilterToolbar, ActiveFilter } from "./FilterToolbar";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";

const meta: Meta<typeof FilterToolbar> = {
  title: "App/Common/FilterToolbar",
  component: FilterToolbar,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Filtering toolbar positioned to the left of the 9-box grid axis. " +
          "Provides filter button with badge, employee count display, active filters info, and search functionality. " +
          "Supports multiple display variants for different UX approaches.",
      },
      tags: ["autodocs"],
    },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: "100%",
          height: "400px",
          position: "relative",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterToolbar>;

// Sample active filters data
const sampleFilters: ActiveFilter[] = [
  {
    type: "level",
    label: "Level",
    values: ["IC5", "IC6"],
  },
  {
    type: "location",
    label: "Location",
    values: ["USA", "Europe"],
  },
];

const manyFilters: ActiveFilter[] = [
  {
    type: "level",
    label: "Job Level",
    values: ["MT2", "MT3", "MT4", "MT5"],
  },
  {
    type: "location",
    label: "Location",
    values: ["USA", "Europe", "Asia"],
  },
  {
    type: "function",
    label: "Function",
    values: ["Engineering", "Product", "Design"],
  },
  {
    type: "manager",
    label: "Manager",
    values: ["John Smith", "Jane Doe"],
  },
];

/**
 * Create mock employee data for search autocomplete
 */
const createMockEmployee = (
  id: number,
  name: string,
  jobLevel: string,
  manager: string,
  jobFunction: string,
  location: string
): Employee => ({
  employee_id: id,
  name,
  business_title: `${jobFunction} ${jobLevel}`,
  job_title: `${jobFunction} ${jobLevel}`,
  job_profile: `${jobFunction}-Tech-${location}`,
  job_level: jobLevel,
  job_function: jobFunction,
  location,
  manager,
  management_chain_01: manager,
  management_chain_02: "CEO",
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2020-01-15",
  tenure_category: "3-5 years",
  time_in_job_profile: "2 years",
  performance: PerformanceLevel.HIGH,
  potential: PotentialLevel.HIGH,
  grid_position: 9,
  talent_indicator: "High Performer",
  ratings_history: [{ year: 2023, rating: "Leading" }],
  development_focus: "Leadership skills",
  development_action: "Attend leadership training",
  notes: null,
  promotion_status: "Ready",
  promotion_readiness: true,
  modified_in_session: false,
  last_modified: null,
  flags: [],
});

// Mock employee data for search stories
const mockEmployees: Employee[] = [
  createMockEmployee(
    1,
    "Sarah Chen",
    "IC5",
    "Mike Johnson",
    "Engineering",
    "USA"
  ),
  createMockEmployee(
    2,
    "Sarah Williams",
    "IC6",
    "Jane Smith",
    "Product",
    "Europe"
  ),
  createMockEmployee(3, "Sarah Martinez", "IC4", "John Doe", "Design", "USA"),
  createMockEmployee(
    4,
    "David Thompson",
    "IC5",
    "Mike Johnson",
    "Engineering",
    "USA"
  ),
  createMockEmployee(
    5,
    "Emily Parker",
    "IC6",
    "Jane Smith",
    "Engineering",
    "Europe"
  ),
  createMockEmployee(6, "Michael Brown", "IC4", "John Doe", "Product", "USA"),
  createMockEmployee(
    7,
    "Jessica Davis",
    "IC5",
    "Mike Johnson",
    "Design",
    "USA"
  ),
  createMockEmployee(
    8,
    "Robert Wilson",
    "IC6",
    "Jane Smith",
    "Engineering",
    "Europe"
  ),
  createMockEmployee(9, "Amanda Garcia", "IC4", "John Doe", "Product", "USA"),
  createMockEmployee(
    10,
    "Christopher Lee",
    "IC5",
    "Mike Johnson",
    "Engineering",
    "USA"
  ),
];

/**
 * ========================================================================
 * SCREENSHOT STORIES - For Documentation
 * ========================================================================
 * These stories are specifically designed for screenshot generation
 * to support user guide documentation.
 */

/**
 * Story 1: Expanded Default State
 * FilterToolbar in expanded state with no active filters
 * Shows: Filter button, employee count (200 employees), search box
 */
export const ExpandedDefault: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-expanded-default" },
    docs: {
      description: {
        story:
          "FilterToolbar in expanded state with no active filters. " +
          "Shows filter button (not highlighted), total employee count '200 employees', " +
          "and search input field. This is the default state when filters are not applied.",
      },
    },
  },
  decorators: [
    (Story) => {
      // Ensure toolbar is expanded (not collapsed)
      useEffect(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("filterToolbarCollapsed", "false");
        }
      }, []);
      return (
        <Box
          sx={{
            width: "100%",
            height: "400px",
            position: "relative",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Story />
        </Box>
      );
    },
  ],
  args: {
    variant: "compact",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

/**
 * Story 2: With Active Filters
 * FilterToolbar with active filters applied
 * Shows: Highlighted filter button, reduced employee count, filter summary
 */
export const WithActiveFilters: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-active-filters" },
    docs: {
      description: {
        story:
          "FilterToolbar with active filters applied. " +
          "Filter button is highlighted in secondary/orange color. " +
          "Employee count shows '75 of 200 employees' indicating filtered results. " +
          "Active filter summary displays 'Level: IC5, IC6 • Location: USA, Europe'. " +
          "Hover over the filter summary to see full filter details in a tooltip.",
      },
    },
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("filterToolbarCollapsed", "false");
        }
      }, []);
      return (
        <Box
          sx={{
            width: "100%",
            height: "400px",
            position: "relative",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Story />
        </Box>
      );
    },
  ],
  args: {
    variant: "compact",
    activeFilters: sampleFilters,
    filteredCount: 75,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

/**
 * Story 3: With Search Results
 * FilterToolbar with search query showing autocomplete dropdown
 * Shows: Search input with text, dropdown with multiple results, highlighted matches
 * NOTE: This story requires manual interaction in Storybook
 */
export const WithSearchResults: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-search-results" },
    docs: {
      description: {
        story:
          "FilterToolbar with search functionality active. " +
          "Search input contains 'sarah' and displays autocomplete dropdown with matching results. " +
          "Results show employee name, job level, and manager. " +
          "Matched text is highlighted in results. " +
          "Up to 10 search results are displayed. " +
          "NOTE: To capture this state, manually type 'sarah' in the search box in Storybook.",
      },
    },
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("filterToolbarCollapsed", "false");
        }
      }, []);
      return (
        <Box
          sx={{
            width: "100%",
            height: "400px",
            position: "relative",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Story />
        </Box>
      );
    },
  ],
  args: {
    variant: "compact",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    onEmployeeSelect: (id) => console.log("Employee selected:", id),
    employees: mockEmployees,
  },
};

/**
 * Story 4: Collapsed State
 * FilterToolbar in collapsed state showing only filter button
 * Shows: Filter button with toggle, collapsed content hidden
 */
export const CollapsedState: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-collapsed" },
    docs: {
      description: {
        story:
          "FilterToolbar in collapsed state. " +
          "Only the filter button and expand toggle (chevron) are visible. " +
          "Employee count, filter info, and search box are hidden. " +
          "Click the chevron button to expand and reveal full toolbar. " +
          "Collapsed state is persisted in localStorage.",
      },
    },
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("filterToolbarCollapsed", "true");
        }
      }, []);
      return (
        <Box
          sx={{
            width: "100%",
            height: "400px",
            position: "relative",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Story />
        </Box>
      );
    },
  ],
  args: {
    variant: "compact",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

/**
 * ========================================================================
 * EXISTING VARIANT STORIES
 * ========================================================================
 * Original stories demonstrating different toolbar variants
 */

/**
 * Variant 1: Compact - All elements inline (default)
 * All controls displayed in a single horizontal toolbar
 */
export const CompactNoFilters: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-compact-no-filters" },
    docs: {
      description: {
        story:
          "Compact variant with no active filters. Shows filter button, employee count, and search box in a single row.",
      },
    },
  },
  args: {
    variant: "compact",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

export const CompactWithFilters: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-compact-filters" },
    docs: {
      description: {
        story:
          "Compact variant with active filters. Shows filter badge, reduced employee count, and truncated filter info.",
      },
    },
  },
  args: {
    variant: "compact",
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

/**
 * Variant 2: Expandable - Info display shows/hides based on filters
 * Filter details can be expanded/collapsed to save space
 */
export const ExpandableCollapsed: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-expandable-collapsed" },
    docs: {
      description: {
        story:
          "Expandable variant in collapsed state. Shows expand button when filters are active, allowing users to see details on demand.",
      },
    },
  },
  args: {
    variant: "expandable",
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

export const ExpandableNoFilters: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Expandable variant with no active filters. No expand button is shown.",
      },
    },
  },
  args: {
    variant: "expandable",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

/**
 * Variant 3: Chips - Active filters shown as dismissible chips
 * Each filter value displayed as an individual chip below the main toolbar
 */
export const ChipsNoFilters: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Chip-based variant with no active filters. Toolbar collapses to single row.",
      },
    },
  },
  args: {
    variant: "chips",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

export const ChipsWithFilters: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-chips-filters" },
    docs: {
      description: {
        story:
          "Chip-based variant with active filters. Each filter value shown as a dismissible chip, providing clear visibility and easy removal.",
      },
    },
  },
  args: {
    variant: "chips",
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

export const ChipsManyFilters: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-chips-many" },
    docs: {
      description: {
        story:
          "Chip-based variant with many active filters. Shows how chips wrap to multiple rows when many filters are applied.",
      },
    },
  },
  args: {
    variant: "chips",
    activeFilters: manyFilters,
    filteredCount: 23,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

/**
 * Variant 4: Dropdown - Active filters in a dropdown menu
 * Filter details accessed via info button that opens a menu
 */
export const DropdownNoFilters: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dropdown variant with no active filters. Info button is hidden when no filters are active.",
      },
    },
  },
  args: {
    variant: "dropdown",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

export const DropdownWithFilters: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-dropdown-filters" },
    docs: {
      description: {
        story:
          "Dropdown variant with active filters. Shows info button that opens a menu with filter details. Most space-efficient for many filters.",
      },
    },
  },
  args: {
    variant: "dropdown",
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

/**
 * Variant 5: Split - Filter button and count separate from search and info
 * Two separate toolbar groups for better visual organization
 */
export const SplitNoFilters: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Split variant with no active filters. Filter controls and search are in separate toolbar groups.",
      },
    },
  },
  args: {
    variant: "split",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

export const SplitWithFilters: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-split-filters" },
    docs: {
      description: {
        story:
          "Split variant with active filters. Left group shows filter button, count, and truncated info. Right group has search box.",
      },
    },
  },
  args: {
    variant: "split",
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

/**
 * Additional states
 */
export const DisabledState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All variants support a disabled state when no session is active.",
      },
    },
  },
  args: {
    variant: "compact",
    activeFilters: [],
    filteredCount: 0,
    totalCount: 0,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    disabled: true,
    employees: [],
  },
};

export const SingleEmployee: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Shows singular employee text when only one employee is in the dataset.",
      },
    },
  },
  args: {
    variant: "compact",
    activeFilters: [],
    filteredCount: 1,
    totalCount: 1,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: [mockEmployees[0]],
  },
};

export const HeavilyFiltered: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Shows behavior when filters dramatically reduce the employee count.",
      },
    },
  },
  args: {
    variant: "compact",
    activeFilters: manyFilters,
    filteredCount: 3,
    totalCount: 500,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees.slice(0, 3),
  },
};

/**
 * Collapse/Expand Feature (Compact Variant)
 */
export const CompactCollapsed: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filter-toolbar-compact-collapsed" },
    docs: {
      description: {
        story:
          "Compact toolbar in collapsed state. Shows only filter button with badge and toggle button. " +
          "Click the chevron to expand and reveal employee count, filter info, and search box.",
      },
    },
  },
  decorators: [
    (Story) => {
      // Set collapsed state in localStorage before rendering
      if (typeof window !== "undefined") {
        localStorage.setItem("filterToolbarCollapsed", "true");
      }
      return (
        <Box
          sx={{
            width: "100%",
            height: "200px",
            position: "relative",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Story />
        </Box>
      );
    },
  ],
  args: {
    variant: "compact",
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};

export const CompactCollapsedNoFilters: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Compact toolbar collapsed with no active filters. Shows minimal state with just filter button.",
      },
    },
  },
  decorators: [
    (Story) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("filterToolbarCollapsed", "true");
      }
      return (
        <Box
          sx={{
            width: "100%",
            height: "200px",
            position: "relative",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Story />
        </Box>
      );
    },
  ],
  args: {
    variant: "compact",
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    employees: mockEmployees,
  },
};
