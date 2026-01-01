import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect } from "react";
import { FilterDrawer } from "./FilterDrawer";
import Box from "@mui/material/Box";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";

// Import zustand store to control state
import { useFilterStore } from "../../store/filterStore";
import { useSessionStore } from "../../store/sessionStore";

/**
 * Create mock employees with various flags and attributes
 */
const createMockEmployees = (): Employee[] => {
  const employees: Employee[] = [];

  // Helper to create employee
  const createEmployee = (
    id: number,
    name: string,
    jobFunction: string,
    location: string,
    manager: string,
    jobLevel: string,
    flags: string[] = []
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
    flags,
  });

  // Create diverse employee set
  employees.push(
    createEmployee(
      1,
      "Alice Johnson",
      "Engineering",
      "USA",
      "Jane Smith",
      "MT4",
      ["promotion_ready", "succession_candidate"]
    )
  );
  employees.push(
    createEmployee(2, "Bob Smith", "Engineering", "USA", "Jane Smith", "MT3", [
      "new_hire",
    ])
  );
  employees.push(
    createEmployee(3, "Carol White", "Product", "Europe", "John Doe", "MT5", [
      "high_retention_priority",
      "promotion_ready",
    ])
  );
  employees.push(
    createEmployee(4, "David Brown", "Product", "Europe", "John Doe", "MT4", [
      "flight_risk",
      "flagged_for_discussion",
    ])
  );
  employees.push(
    createEmployee(5, "Eve Davis", "Design", "Australia", "Sarah Lee", "MT3", [
      "ready_for_lateral_move",
    ])
  );
  employees.push(
    createEmployee(
      6,
      "Frank Wilson",
      "Engineering",
      "USA",
      "Jane Smith",
      "MT2",
      ["pip"]
    )
  );
  employees.push(
    createEmployee(7, "Grace Martinez", "Product", "India", "John Doe", "MT4", [
      "succession_candidate",
    ])
  );
  employees.push(
    createEmployee(8, "Henry Taylor", "Design", "Canada", "Sarah Lee", "MT5", [
      "promotion_ready",
    ])
  );
  employees.push(
    createEmployee(
      9,
      "Iris Chen",
      "Engineering",
      "India",
      "Mike Zhang",
      "MT6",
      ["high_retention_priority", "succession_candidate"]
    )
  );
  employees.push(
    createEmployee(10, "Jack Anderson", "Product", "USA", "Jane Smith", "MT4", [
      "flight_risk",
    ])
  );
  employees.push(
    createEmployee(11, "Karen Lee", "Design", "Europe", "Sarah Lee", "MT3", [
      "new_hire",
    ])
  );
  employees.push(
    createEmployee(
      12,
      "Leo Thompson",
      "Engineering",
      "Australia",
      "Mike Zhang",
      "MT4",
      ["flagged_for_discussion"]
    )
  );

  return employees;
};

const mockEmployees = createMockEmployees();

/**
 * Story decorator that sets up store state
 */
const withStoreState = (
  storeUpdater: (employees: Employee[]) => void
): ((Story: React.FC) => JSX.Element) => {
  return (Story: React.FC) => {
    useEffect(() => {
      // Reset store state
      const filterStore = useFilterStore.getState();
      filterStore.clearAllFilters();

      // Set employees in session store using Zustand's set function
      useSessionStore.setState({
        employees: mockEmployees,
        sessionId: "story-session",
        filename: "story-employees.xlsx",
      });

      // Apply custom state
      storeUpdater(mockEmployees);

      // Open the drawer directly (avoid toggle which causes flicker with multiple stories on docs page)
      useFilterStore.setState({ isDrawerOpen: true });

      // Cleanup: close drawer on unmount
      return () => {
        useFilterStore.setState({ isDrawerOpen: false });
      };
    }, []);

    return (
      <Box sx={{ position: "relative", height: "100vh", width: "100vw" }}>
        <Story />
      </Box>
    );
  };
};

const meta: Meta<typeof FilterDrawer> = {
  title: "App/Dashboard/FilterDrawer",
  component: FilterDrawer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Left sidebar filter panel for the 9Boxer dashboard. " +
          "Provides comprehensive filtering options including job levels, job functions, " +
          "locations, managers, flags, reporting chain, and exclusions. " +
          "Features collapsible sections with count badges and full accessibility support. " +
          "Supports both light and dark themes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterDrawer>;

/**
 * Empty state - drawer open with no filters applied
 * All sections collapsed by default
 */
export const EmptyState: Story = {
  decorators: [
    withStoreState(() => {
      // No filters applied, just set drawer open
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Empty state with no filters applied. " +
          "All filter sections are available and collapsible. " +
          "Shows the 'Clear All Filters' button at the bottom even when no filters are active.",
      },
    },
  },
};

/**
 * Job function filters - multiple job functions selected
 */
export const JobFunctionFilters: Story = {
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.toggleJobFunction("Engineering");
      store.toggleJobFunction("Product");
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Job function filtering with Engineering and Product selected. " +
          "Count badge shows 2 active filters in the Job Functions section. " +
          "Only employees in Engineering or Product roles would be shown in the grid.",
      },
    },
  },
};

/**
 * Location filters - multiple locations selected
 */
export const LocationFilters: Story = {
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.toggleLocation("USA");
      store.toggleLocation("Europe");
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Location filtering with USA and Europe selected. " +
          "Count badge shows 2 active filters in the Locations section. " +
          "Only employees in USA or Europe would be shown in the grid.",
      },
    },
  },
};

/**
 * Flags section expanded - show all 8 flags with counts
 * CRITICAL for documentation screenshots ⭐
 */
export const FlagsSectionExpanded: Story = {
  decorators: [
    withStoreState(() => {
      // Flags section is collapsed by default, but we can't control
      // individual section state from outside. The user will need to
      // manually expand in Storybook UI or we need to pass expanded state
      // This story demonstrates what it looks like when a user expands the flags section
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Flags section expanded showing all 8 flag types with employee counts. " +
          "Displays: Promotion Ready (3), New Hire (2), Flight Risk (2), " +
          "Succession Candidate (3), High Retention Priority (2), " +
          "Flagged for Discussion (2), Ready for Lateral Move (1), and PIP (1). " +
          "IMPORTANT: Manually expand the Flags section in Storybook to view. " +
          "⭐ CRITICAL for documentation screenshots.",
      },
    },
  },
};

/**
 * Flags active - 2-3 flags selected with chips
 * CRITICAL for documentation screenshots ⭐
 */
export const FlagsActive: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filters-flags-section" },
    docs: {
      description: {
        story:
          "Multiple flags selected for retention and succession planning. " +
          "Shows Promotion Ready, Succession Candidate, and High Retention Priority. " +
          "Count badge shows 3 active flag filters. " +
          "Only employees with ALL three flags would be shown (intersection, not union). " +
          "⭐ CRITICAL for documentation screenshots.",
      },
    },
  },
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.toggleFlag("promotion_ready");
      store.toggleFlag("succession_candidate");
      store.toggleFlag("high_retention_priority");
    }),
  ],
};

/**
 * Reporting chain active - manager filter chip displayed
 * CRITICAL for documentation screenshots ⭐
 */
export const ReportingChainActive: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filters-reporting-chain" },
    docs: {
      description: {
        story:
          "Reporting chain filter active for 'Jane Smith'. " +
          "Shows green chip with manager icon in the Reporting Chain section. " +
          "Only employees who report to Jane Smith (directly or indirectly) are shown. " +
          "Chip can be dismissed by clicking the X button. " +
          "⭐ CRITICAL for documentation screenshots.",
      },
    },
  },
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.setReportingChainFilter("Jane Smith");
    }),
  ],
};

/**
 * Multiple filters active - combination of different filter types
 */
export const MultipleFiltersActive: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filters-multiple-active" },
    docs: {
      description: {
        story:
          "Complex filtering scenario with multiple filter types active simultaneously. " +
          "Combines: 2 job functions (Engineering, Product), 1 location (USA), " +
          "2 flags (Promotion Ready, Succession Candidate), and reporting chain (Jane Smith). " +
          "All filters are applied as AND conditions. " +
          "Count badges show active filters in each section.",
      },
    },
  },
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      // Job functions
      store.toggleJobFunction("Engineering");
      store.toggleJobFunction("Product");
      // Locations
      store.toggleLocation("USA");
      // Flags
      store.toggleFlag("promotion_ready");
      store.toggleFlag("succession_candidate");
      // Reporting chain
      store.setReportingChainFilter("Jane Smith");
    }),
  ],
};

/**
 * All sections expanded - full drawer anatomy
 */
export const AllSectionsExpanded: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filters-panel-expanded" },
    docs: {
      description: {
        story:
          "Full drawer anatomy with all filter sections visible. " +
          "IMPORTANT: Manually expand all sections in Storybook to view. " +
          "Shows: Job Levels (MT1-MT6), Job Functions, Locations, Managers, " +
          "Flags (8 types), Reporting Chain, and Exclusions. " +
          "Some filters are selected to demonstrate count badges.",
      },
    },
  },
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      // Add some filters to show counts
      store.toggleJobFunction("Engineering");
      store.toggleLocation("USA");
      store.toggleFlag("promotion_ready");
    }),
  ],
};

/**
 * With exclusions - 3 employees excluded, shown in list
 */
export const WithExclusions: Story = {
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      // Exclude 3 employees
      store.setExcludedIds([1, 2, 3]);
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Exclusions section with 3 employees excluded from the grid. " +
          "Count badge shows 3 in the Exclusions section. " +
          "IMPORTANT: Expand the Exclusions section in Storybook to view the excluded employee list. " +
          "Clicking 'Exclude Employees' button opens a dialog to manage exclusions.",
      },
    },
  },
};

/**
 * Job levels selected - multiple job levels filtered
 */
export const JobLevelsSelected: Story = {
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.toggleLevel("MT4");
      store.toggleLevel("MT5");
      store.toggleLevel("MT6");
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Senior job levels selected (MT4, MT5, MT6). " +
          "Count badge shows 3 active filters in the Job Levels section. " +
          "Useful for reviewing senior talent and succession planning. " +
          "IMPORTANT: Expand the Job Levels section in Storybook to view selections.",
      },
    },
  },
};

/**
 * Managers selected - filtering by manager
 */
export const ManagersSelected: Story = {
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.toggleManager("Jane Smith");
      store.toggleManager("John Doe");
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Manager filtering with two managers selected (Jane Smith and John Doe). " +
          "Count badge shows 2 active filters in the Managers section. " +
          "Shows only direct reports to these managers (not full reporting chain). " +
          "IMPORTANT: Expand the Managers section in Storybook to view selections.",
      },
    },
  },
};

/**
 * Critical flags selected - focus on risk and performance issues
 */
export const CriticalFlagsSelected: Story = {
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.toggleFlag("flight_risk");
      store.toggleFlag("pip");
      store.toggleFlag("flagged_for_discussion");
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Critical flags selected for risk management. " +
          "Shows Flight Risk, Performance Improvement Plan, and Flagged for Discussion. " +
          "Count badge shows 3 active flag filters. " +
          "Useful for identifying employees needing immediate attention. " +
          "IMPORTANT: Expand the Flags section in Storybook to view selections.",
      },
    },
  },
};

/**
 * Dark theme - key states in dark mode
 */
export const DarkTheme: Story = {
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.toggleJobFunction("Engineering");
      store.toggleLocation("USA");
      store.toggleFlag("promotion_ready");
      store.setReportingChainFilter("Jane Smith");
    }),
  ],
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "FilterDrawer in dark theme with multiple filters active. " +
          "All colors adapt to dark mode using theme tokens. " +
          "Shows job function, location, flag, and reporting chain filters. " +
          "Text remains readable and checkboxes maintain proper contrast.",
      },
    },
  },
};

/**
 * Light theme - key states in light mode
 */
export const LightTheme: Story = {
  decorators: [
    withStoreState(() => {
      const store = useFilterStore.getState();
      store.toggleJobFunction("Product");
      store.toggleLocation("Europe");
      store.toggleFlag("succession_candidate");
      store.toggleFlag("high_retention_priority");
    }),
  ],
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "FilterDrawer in light theme with succession planning filters. " +
          "Shows Product job function, Europe location, and succession-focused flags. " +
          "All colors use theme tokens and adapt to light mode. " +
          "Provides excellent readability and proper contrast ratios.",
      },
    },
  },
};
