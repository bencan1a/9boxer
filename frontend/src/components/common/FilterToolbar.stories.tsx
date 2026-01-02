/**
 * FilterToolbar Storybook Stories
 *
 * Demonstrates different variants and states of the FilterToolbar component.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import { FilterToolbar, ActiveFilter } from "./FilterToolbar";

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
          height: "200px",
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
    label: "Job Level",
    values: ["MT3", "MT4"],
  },
  {
    type: "location",
    label: "Location",
    values: ["USA", "Europe"],
  },
  {
    type: "function",
    label: "Function",
    values: ["Engineering"],
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
    activeFilterCount: 0,
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 3,
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 3,
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 0,
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 0,
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 4,
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 12,
    activeFilters: manyFilters,
    filteredCount: 23,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 0,
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 3,
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 0,
    activeFilters: [],
    filteredCount: 200,
    totalCount: 200,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 3,
    activeFilters: sampleFilters,
    filteredCount: 45,
    totalCount: 200,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 0,
    activeFilters: [],
    filteredCount: 0,
    totalCount: 0,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
    disabled: true,
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
    activeFilterCount: 0,
    activeFilters: [],
    filteredCount: 1,
    totalCount: 1,
    hasActiveFilters: false,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
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
    activeFilterCount: 5,
    activeFilters: manyFilters,
    filteredCount: 3,
    totalCount: 500,
    hasActiveFilters: true,
    onFilterClick: () => console.log("Filter clicked"),
    onSearchChange: (value) => console.log("Search:", value),
  },
};
