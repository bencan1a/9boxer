/**
 * Storybook stories for ExclusionDialog component
 *
 * Modal dialog for managing employee exclusions with:
 * - Quick filter buttons (VPs, Directors+, Managers)
 * - Search functionality
 * - Checkbox list of employees
 * - Select all / Clear all actions
 *
 * @screenshots
 *   - exclusions-dialog: ExclusionDialog showing search, quick filters, and employee list
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect } from "react";
import { ExclusionDialog } from "./ExclusionDialog";
import { useSessionStore } from "../../store/sessionStore";
import { useFilterStore } from "../../store/filterStore";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";
import { fn } from "storybook/test";

/**
 * Create mock employees for the dialog
 */
const createMockEmployees = (): Employee[] => {
  const employees: Employee[] = [];

  const createEmployee = (
    id: number,
    name: string,
    jobLevel: string,
    manager: string,
    businessTitle: string
  ): Employee => ({
    employee_id: id,
    name,
    business_title: businessTitle,
    job_title: businessTitle,
    job_profile: `${jobLevel}-Tech`,
    job_level: jobLevel,
    job_function: "Engineering",
    location: "USA",
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

  // Create diverse employees across job levels
  employees.push(
    createEmployee(1, "Sarah Chen", "MT6", "CEO", "VP of Engineering")
  );
  employees.push(
    createEmployee(2, "Marcus Johnson", "MT6", "CEO", "VP of Product")
  );
  employees.push(
    createEmployee(3, "Elena Rodriguez", "MT5", "Sarah Chen", "Senior Director")
  );
  employees.push(
    createEmployee(4, "David Kim", "MT5", "Marcus Johnson", "Director of PM")
  );
  employees.push(
    createEmployee(5, "Priya Patel", "MT4", "Elena Rodriguez", "Senior Manager")
  );
  employees.push(
    createEmployee(6, "James Wilson", "MT4", "David Kim", "Engineering Manager")
  );
  employees.push(
    createEmployee(7, "Lisa Thompson", "MT3", "Priya Patel", "Team Lead")
  );
  employees.push(
    createEmployee(8, "Michael Brown", "MT3", "James Wilson", "Tech Lead")
  );
  employees.push(
    createEmployee(9, "Emma Davis", "MT2", "Lisa Thompson", "Senior Engineer")
  );
  employees.push(
    createEmployee(
      10,
      "Alex Martinez",
      "MT2",
      "Michael Brown",
      "Senior Engineer"
    )
  );
  employees.push(
    createEmployee(11, "Jennifer Lee", "MT1", "Emma Davis", "Software Engineer")
  );
  employees.push(
    createEmployee(
      12,
      "Robert Taylor",
      "MT1",
      "Alex Martinez",
      "Software Engineer"
    )
  );

  return employees;
};

const mockEmployees = createMockEmployees();

/**
 * Decorator to set up store state for stories
 */
const withStoreState = (
  excludedIds: number[] = []
): ((Story: React.FC) => JSX.Element) => {
  return (Story: React.FC) => {
    useEffect(() => {
      // Set up session store with mock employees
      useSessionStore.setState({
        employees: mockEmployees,
        sessionId: "story-session",
        filename: "story-employees.xlsx",
      });

      // Set up filter store with excluded IDs
      useFilterStore.setState({
        excludedEmployeeIds: excludedIds,
      });

      return () => {
        // Cleanup
        useFilterStore.setState({ excludedEmployeeIds: [] });
      };
    }, []);

    return <Story />;
  };
};

const meta: Meta<typeof ExclusionDialog> = {
  title: "App/Dashboard/ExclusionDialog",
  component: ExclusionDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal dialog for managing employee exclusions from the 9-box grid. " +
          "Provides quick filter buttons for common exclusion patterns (VPs, Directors+, Managers), " +
          "a search field to find specific employees, and a checkbox list with Select All functionality. " +
          "Exclusions are applied on 'Apply' and can be cleared at any time.",
      },
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the dialog is open",
    },
    onClose: {
      action: "closed",
      description: "Callback when dialog is closed",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExclusionDialog>;

/**
 * Default open state showing all employees with no exclusions.
 * Displays quick filter buttons, search field, and full employee list.
 */
export const Default: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "exclusions-dialog" },
    docs: {
      description: {
        story:
          "Default state with no employees excluded. Shows the full employee list " +
          "with quick filter buttons at the top (VPs, Directors+, Managers, Clear All). " +
          "Search field allows filtering by name, title, or job level.",
      },
    },
  },
  decorators: [withStoreState([])],
  args: {
    open: true,
    onClose: fn(),
  },
};

/**
 * With some employees pre-selected for exclusion.
 * Shows the checkbox state and selected count.
 */
export const WithSelections: Story = {
  decorators: [withStoreState([1, 2, 3])],
  args: {
    open: true,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog with 3 employees already selected for exclusion. " +
          "The selected count shows '3 employees selected' at the bottom. " +
          "Checkboxes show the current selection state.",
      },
    },
  },
};

/**
 * VPs excluded - shows result of clicking "Exclude VPs" button.
 */
export const VPsExcluded: Story = {
  decorators: [withStoreState([1, 2])],
  args: {
    open: true,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "State after clicking 'Exclude VPs' quick filter. " +
          "All MT6-level employees (VPs) are selected for exclusion. " +
          "This is a common pattern for focusing on non-executive talent reviews.",
      },
    },
  },
};

/**
 * Directors+ excluded - shows result of clicking "Exclude Directors+" button.
 */
export const DirectorsPlusExcluded: Story = {
  decorators: [withStoreState([1, 2, 3, 4])],
  args: {
    open: true,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "State after clicking 'Exclude Directors+' quick filter. " +
          "All MT5 and MT6 level employees are selected for exclusion. " +
          "Useful for focusing on individual contributor and manager-level reviews.",
      },
    },
  },
};

/**
 * Closed state - dialog not visible.
 */
export const Closed: Story = {
  decorators: [withStoreState([])],
  args: {
    open: false,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Dialog in closed state - not visible on screen.",
      },
    },
  },
};
