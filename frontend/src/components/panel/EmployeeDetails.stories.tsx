import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmployeeDetails } from "./EmployeeDetails";
import type {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";
import { useSessionStore } from "../../store/sessionStore";
import type { GridMoveEvent } from "../../types/events";

/**
 * EmployeeDetails displays comprehensive employee information in the right panel Details tab.
 *
 * **Key Sections:**
 * - Header: Employee name and business title
 * - Employee Information: Job function, location, level, tenure, time in level
 * - Flags: Employee tags and status indicators
 * - Current Assessment: Grid position, performance/potential ratings, session modifications
 * - Changes Summary: Summary of movements within the current session
 *
 * **Features:**
 * - Color-coded performance/potential chips (green=high, yellow=medium, red=low)
 * - Grid position background color matching grid box colors
 * - Modified in session indicator
 * - Interactive flag display with tooltips
 *
 * **Dependencies:**
 * - Uses EmployeeFlags sub-component for flag display
 * - Uses EmployeeChangesSummary sub-component for session changes
 * - Requires session store context for changes tracking
 */
const meta: Meta<typeof EmployeeDetails> = {
  title: "Panel/EmployeeDetails",
  component: EmployeeDetails,
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
      description: "Employee data object with all employee information",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmployeeDetails>;

// Base employee template
const fullEmployee: Employee = {
  employee_id: 12345,
  name: "Alice Johnson",
  business_title: "Senior Product Manager",
  job_title: "Product Manager III",
  job_profile: "Product-USA",
  job_level: "MT6",
  job_function: "Product Management",
  location: "USA",
  manager: "Bob Smith",
  management_chain_01: "Carol White",
  management_chain_02: "David Brown",
  management_chain_03: "Eve Davis",
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2018-03-15",
  tenure_category: "5-10 years",
  time_in_job_profile: "3 years",
  performance: "High" as PerformanceLevel,
  potential: "High" as PotentialLevel,
  grid_position: 9,
  talent_indicator: "Star",
  ratings_history: [
    { year: 2024, rating: "Strong" },
    { year: 2023, rating: "Leading" },
    { year: 2022, rating: "Strong" },
  ],
  development_focus: "Strategic leadership and product vision",
  development_action: "Lead cross-functional product initiatives",
  notes: "Exceptional product leader with strong strategic thinking",
  promotion_status: "Ready",
  promotion_readiness: true,
  modified_in_session: false,
  last_modified: null,
  flags: ["high-potential", "promotion-ready", "key-talent"],
};

/**
 * Default employee details view with complete data.
 * Shows all sections populated with realistic employee information.
 */
export const Default: Story = {
  args: {
    employee: fullEmployee,
  },
};

/**
 * Employee with minimal data.
 * Only required fields populated, optional fields null or empty.
 * Tests graceful handling of sparse data.
 */
export const MinimalData: Story = {
  args: {
    employee: {
      employee_id: 99999,
      name: "John Doe",
      business_title: "Engineer",
      job_title: "Engineer",
      job_profile: "Engineering-USA",
      job_level: "MT3",
      job_function: "Engineering",
      location: "USA",
      manager: "Manager Name",
      management_chain_01: null,
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
      hire_date: "2024-01-01",
      tenure_category: "0-1 years",
      time_in_job_profile: "< 1 year",
      performance: "Medium" as PerformanceLevel,
      potential: "Medium" as PotentialLevel,
      grid_position: 5,
      talent_indicator: "Solid",
      ratings_history: [],
      development_focus: null,
      development_action: null,
      notes: null,
      promotion_status: null,
      promotion_readiness: null,
      modified_in_session: false,
      last_modified: null,
      flags: [],
    },
  },
};

/**
 * Employee without a manager.
 * Shows top-level employee (CEO, VP, etc.) with no direct manager.
 */
export const NoManager: Story = {
  args: {
    employee: {
      ...fullEmployee,
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
 * Employee with very long field values.
 * Tests text overflow, truncation, and layout with lengthy names and titles.
 */
export const LongFields: Story = {
  args: {
    employee: {
      ...fullEmployee,
      name: "Dr. Elizabeth Alexandra Montgomery-Winthrop III, Esq.",
      business_title:
        "Chief Distinguished Principal Senior Staff Software Architect and Technical Fellow",
      job_function: "Advanced Research and Development Engineering",
      location: "United Kingdom",
      development_focus:
        "Technical leadership, architecture governance, strategic technology planning, and cross-organizational collaboration",
      development_action:
        "Lead enterprise-wide architectural initiatives, establish technical standards, mentor senior staff, and drive innovation programs",
      notes:
        "Exceptional technical leader with deep expertise across multiple domains. Consistently delivers high-impact architectural solutions. Strong mentor and thought leader within the organization.",
    },
  },
};

/**
 * Modified employee with session changes.
 * Shows modified indicator and highlights recent session changes.
 */
export const ModifiedInSession: Story = {
  args: {
    employee: {
      ...fullEmployee,
      name: "Michael Chen",
      business_title: "Senior Data Scientist",
      performance: "High" as PerformanceLevel,
      potential: "Medium" as PotentialLevel,
      grid_position: 6,
      modified_in_session: true,
      last_modified: "2025-12-25T10:30:00Z",
      flags: ["recently-promoted"],
    },
  },
};

/**
 * Employee with visible changes in the changes summary.
 * Shows the Current Assessment section with recent grid movements.
 * Used for documentation screenshot: changes-employee-details
 */
export const WithChanges: Story = {
  args: {
    employee: {
      ...fullEmployee,
      modified_in_session: true,
      last_modified: "2025-12-24T10:30:00Z",
    },
  },
  decorators: [
    (Story) => {
      // Set up session store with events for this employee before rendering
      const gridEvents: GridMoveEvent[] = [
        {
          event_id: "grid-1",
          event_type: "grid_move",
          employee_id: 12345,
          employee_name: "Alice Johnson",
          timestamp: "2025-12-24T10:30:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: "Promoted based on exceptional Q4 performance and leadership.",
        },
      ];

      useSessionStore.setState({
        events: gridEvents,
        donutEvents: [],
        donutModeActive: false,
      });

      return <Story />;
    },
  ],
};

/**
 * Low performer needing attention.
 * Shows employee at position 1 (Low/Low) with performance plan flag.
 */
export const LowPerformer: Story = {
  args: {
    employee: {
      ...fullEmployee,
      employee_id: 11111,
      name: "Tom Anderson",
      business_title: "Junior Analyst",
      job_level: "MT2",
      performance: "Low" as PerformanceLevel,
      potential: "Low" as PotentialLevel,
      grid_position: 1,
      talent_indicator: "Development Needed",
      tenure_category: "0-1 years",
      time_in_job_profile: "6 months",
      flags: ["performance-plan", "new-hire"],
      development_focus: "Core job skills and performance improvement",
      development_action:
        "Weekly coaching sessions and structured development plan",
      ratings_history: [],
    },
  },
};

/**
 * High potential development candidate.
 * Shows employee at position 7 (Low performance, High potential) - development opportunity.
 */
export const HighPotentialDevelopment: Story = {
  args: {
    employee: {
      ...fullEmployee,
      employee_id: 22222,
      name: "Jennifer Martinez",
      business_title: "Associate Product Manager",
      job_level: "MT4",
      performance: "Low" as PerformanceLevel,
      potential: "High" as PotentialLevel,
      grid_position: 7,
      talent_indicator: "Develop",
      tenure_category: "1-3 years",
      flags: ["high-potential", "stretch-assignment"],
      development_focus: "Product strategy and stakeholder management",
      development_action: "Assign to high-visibility product launch",
      ratings_history: [{ year: 2024, rating: "Developing" }],
    },
  },
};

/**
 * Default view with exterior padding for screenshots.
 * Same as Default but with extra padding to match app appearance.
 * Used for documentation screenshot: details-current-assessment
 */
export const DefaultWithPadding: Story = {
  args: {
    employee: fullEmployee,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, padding: "24px" }}>
        <Story />
      </div>
    ),
  ],
};
