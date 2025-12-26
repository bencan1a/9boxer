import type { Meta, StoryObj } from "@storybook/react-vite";
import { ManagementChain } from "./ManagementChain";
import type {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "@/types/employee";

/**
 * ManagementChain displays the reporting hierarchy from an employee up to VP level.
 * Shows a vertical chain with the employee at the bottom and higher-level managers above.
 *
 * **Key Features:**
 * - Vertical layout with arrow indicators showing reporting direction
 * - Employee card highlighted in blue (non-clickable)
 * - Manager cards clickable to filter by reporting chain
 * - Active filter indicator (green border when manager is filtered)
 * - Hover effects on manager cards
 * - Deduplication of manager names
 * - Empty state when no manager data available
 *
 * **Hierarchy Levels:**
 * - Employee (bottom, highlighted)
 * - Direct Manager
 * - Management Chain 01-06 (higher levels)
 *
 * **Interactions:**
 * - Click manager card to filter grid by that reporting chain
 * - Active filter shown with green border and underlined text
 *
 * **Data Attributes:**
 * - `data-testid="manager-chain-button-{index}"` - Manager card buttons
 */
const meta: Meta<typeof ManagementChain> = {
  title: "Panel/ManagementChain",
  component: ManagementChain,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    employee: {
      description:
        "Employee data object with manager and management chain information",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ManagementChain>;

// Base employee template
const baseEmployee: Employee = {
  employee_id: 12345,
  name: "Alice Johnson",
  business_title: "Senior Software Engineer",
  job_title: "Software Engineer III",
  job_profile: "Engineering-USA",
  job_level: "MT5",
  job_function: "Engineering",
  location: "USA",
  manager: "Bob Smith",
  management_chain_01: null,
  management_chain_02: null,
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2020-01-15",
  tenure_category: "3-5 years",
  time_in_job_profile: "2 years",
  performance: "High" as PerformanceLevel,
  potential: "High" as PotentialLevel,
  grid_position: 9,
  talent_indicator: "Star",
  ratings_history: [],
  development_focus: null,
  development_action: null,
  notes: null,
  promotion_status: null,
  promotion_readiness: null,
  modified_in_session: false,
  last_modified: null,
  flags: [],
};

/**
 * Employee with complete management chain.
 * Shows full hierarchy from individual contributor to VP level.
 * Demonstrates typical organization structure.
 */
export const WithManager: Story = {
  args: {
    employee: {
      ...baseEmployee,
      manager: "Bob Smith",
      management_chain_01: "Carol White",
      management_chain_02: "David Brown",
      management_chain_03: "Eve Davis",
      management_chain_04: "Frank Miller",
      management_chain_05: "Grace Wilson",
      management_chain_06: null,
    },
  },
};

/**
 * Top-level employee with no manager.
 * Shows CEO, VP, or other executive with no reporting structure above them.
 * Displays empty state message.
 */
export const NoManager: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: "Sarah Williams",
      business_title: "Chief Executive Officer",
      job_level: "MT10",
      manager: "",
      management_chain_01: null,
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    },
  },
};

/**
 * Deep hierarchy with all chain levels populated.
 * Shows employee with 6+ levels of management above them.
 * Tests layout with maximum depth.
 */
export const DeepHierarchy: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: "Junior Employee",
      business_title: "Associate Engineer",
      job_level: "MT2",
      manager: "Team Lead",
      management_chain_01: "Engineering Manager",
      management_chain_02: "Senior Engineering Manager",
      management_chain_03: "Director of Engineering",
      management_chain_04: "Senior Director",
      management_chain_05: "VP of Engineering",
      management_chain_06: "SVP of Technology",
    },
  },
};

/**
 * Shallow hierarchy with only direct manager.
 * Shows employee reporting to a VP or senior leader with no intermediate levels.
 * Common in flat organizations.
 */
export const ShallowHierarchy: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: "Senior Individual Contributor",
      business_title: "Principal Engineer",
      job_level: "MT8",
      manager: "VP of Engineering",
      management_chain_01: null,
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    },
  },
};

/**
 * Management chain with duplicate names removed.
 * Tests deduplication logic when manager appears in both manager field and chain levels.
 * Only unique names should appear in the chain.
 */
export const WithDuplicates: Story = {
  args: {
    employee: {
      ...baseEmployee,
      manager: "Bob Smith",
      management_chain_01: "Bob Smith", // Duplicate - should be filtered out
      management_chain_02: "Carol White",
      management_chain_03: "David Brown",
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    },
  },
};

/**
 * Mid-level manager's reporting chain.
 * Shows a manager with several levels above them.
 * Common view for team leads and directors.
 */
export const ManagerChain: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: "Emily Rodriguez",
      business_title: "Engineering Manager",
      job_level: "MT7",
      manager: "Director of Engineering",
      management_chain_01: "VP of Engineering",
      management_chain_02: "SVP of Technology",
      management_chain_03: "CTO",
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    },
  },
};

/**
 * New hire with minimal chain data.
 * Shows recently hired employee with only manager assigned.
 * Chain levels may be populated later as org structure is finalized.
 */
export const NewHire: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: "Chris Taylor",
      business_title: "Junior Developer",
      job_level: "MT2",
      hire_date: "2024-11-01",
      tenure_category: "0-1 years",
      manager: "Tech Lead",
      management_chain_01: null,
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    },
  },
};
