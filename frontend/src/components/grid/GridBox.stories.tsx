import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DndContext } from '@dnd-kit/core';
import { GridBox } from './GridBox';
import type { Employee, PerformanceLevel, PotentialLevel } from '@/types/employee';

/**
 * GridBox is a droppable container representing one of the 9 positions in the nine-box grid.
 * It can display in three states: normal, expanded, or collapsed.
 *
 * **Key Features:**
 * - Droppable zone for drag-and-drop employee placement
 * - Three display states: normal, expanded (full height), collapsed (minimal height)
 * - Position-based background colors (high performer, needs attention, solid, development)
 * - Employee count badge
 * - Expand/collapse controls
 * - Multi-column grid layout when expanded
 *
 * **Position Color Coding:**
 * - High Performers (6, 8, 9): Green tint
 * - Needs Attention (1, 2, 4): Red/pink tint
 * - Solid Performer (5): Blue tint
 * - Development (3, 7): Yellow tint
 *
 * **Data Attributes:**
 * - `data-testid="grid-box-{position}"` - Main container
 * - `data-testid="grid-box-{position}-count"` - Employee count badge
 */
const meta: Meta<typeof GridBox> = {
  title: 'Grid/GridBox',
  component: GridBox,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <DndContext>
        <div style={{ width: 600, maxHeight: 500 }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
  argTypes: {
    position: {
      control: { type: 'number', min: 1, max: 9 },
      description: 'Grid position (1-9), determines color and label',
    },
    employees: {
      description: 'Array of employees in this box',
    },
    shortLabel: {
      control: 'text',
      description: 'Short label for the position (e.g., "L,H")',
    },
    onSelectEmployee: {
      description: 'Callback fired when an employee is selected',
      action: 'employee-selected',
    },
    isExpanded: {
      control: 'boolean',
      description: 'Whether the box is in expanded state (full height)',
    },
    isCollapsed: {
      control: 'boolean',
      description: 'Whether the box is in collapsed state (minimal height)',
    },
    onExpand: {
      description: 'Callback fired when expand button is clicked',
      action: 'expand',
    },
    onCollapse: {
      description: 'Callback fired when collapse button is clicked',
      action: 'collapse',
    },
    donutModeActive: {
      control: 'boolean',
      description: 'Whether donut mode is active',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GridBox>;

// Mock employees helper
const createEmployee = (id: number, name: string, title: string): Employee => ({
  employee_id: id,
  name,
  business_title: title,
  job_title: title,
  job_profile: 'Engineering-USA',
  job_level: 'MT5',
  job_function: 'Engineering',
  location: 'USA',
  manager: 'Manager Name',
  management_chain_01: null,
  management_chain_02: null,
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: '2020-01-01',
  tenure_category: '3-5 years',
  time_in_job_profile: '2 years',
  performance: 'High' as PerformanceLevel,
  potential: 'High' as PotentialLevel,
  grid_position: 9,
  talent_indicator: 'Star',
  ratings_history: [],
  development_focus: null,
  development_action: null,
  notes: null,
  promotion_status: null,
  promotion_readiness: null,
  modified_in_session: false,
  last_modified: null,
  flags: [],
});

const threeEmployees: Employee[] = [
  createEmployee(1, 'Alice Johnson', 'Senior Software Engineer'),
  createEmployee(2, 'Bob Smith', 'Product Manager'),
  createEmployee(3, 'Carol White', 'Data Scientist'),
];

const manyEmployees: Employee[] = Array.from({ length: 12 }, (_, i) =>
  createEmployee(i + 1, `Employee ${i + 1}`, `Job Title ${i + 1}`)
);

/**
 * Empty grid box at position 5 (Solid Performer - Medium/Medium).
 * Shows the blue tint background with no employees.
 */
export const Empty: Story = {
  args: {
    position: 5,
    employees: [],
    shortLabel: 'M,M',
    onSelectEmployee: fn(),
    isExpanded: false,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    donutModeActive: false,
  },
};

/**
 * Grid box with 3-5 employees in normal state.
 * Shows standard list layout with all employees visible.
 */
export const WithEmployees: Story = {
  args: {
    position: 9,
    employees: threeEmployees,
    shortLabel: 'H,H',
    onSelectEmployee: fn(),
    isExpanded: false,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    donutModeActive: false,
  },
};

/**
 * Collapsed grid box showing minimal height state.
 * Displays centered position label and expand button, hides employee list.
 */
export const Collapsed: Story = {
  args: {
    position: 6,
    employees: threeEmployees,
    shortLabel: 'H,M',
    onSelectEmployee: fn(),
    isExpanded: false,
    isCollapsed: true,
    onExpand: fn(),
    onCollapse: fn(),
    donutModeActive: false,
  },
};

/**
 * Expanded grid box showing full height state.
 * Uses multi-column grid layout for better space utilization with many employees.
 */
export const Expanded: Story = {
  args: {
    position: 8,
    employees: manyEmployees,
    shortLabel: 'M,H',
    onSelectEmployee: fn(),
    isExpanded: true,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    donutModeActive: false,
  },
};

/**
 * Grid box with many employees (10+) showing scrollable content.
 * Tests overflow behavior and multi-column layout in expanded state.
 */
export const ManyEmployees: Story = {
  args: {
    position: 9,
    employees: manyEmployees,
    shortLabel: 'H,H',
    onSelectEmployee: fn(),
    isExpanded: true,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    donutModeActive: false,
  },
};

/**
 * Needs Attention box (position 1) with employees.
 * Shows red/pink tint indicating low performance/potential.
 */
export const NeedsAttention: Story = {
  args: {
    position: 1,
    employees: [
      {
        ...threeEmployees[0],
        performance: 'Low' as PerformanceLevel,
        potential: 'Low' as PotentialLevel,
        grid_position: 1,
        flags: ['performance-plan'],
      },
      {
        ...threeEmployees[1],
        performance: 'Low' as PerformanceLevel,
        potential: 'Low' as PotentialLevel,
        grid_position: 1,
      },
    ],
    shortLabel: 'L,L',
    onSelectEmployee: fn(),
    isExpanded: false,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    donutModeActive: false,
  },
};

/**
 * Development box (position 7) with high potential, low performance.
 * Shows yellow tint indicating development opportunities.
 */
export const Development: Story = {
  args: {
    position: 7,
    employees: [
      {
        ...threeEmployees[0],
        performance: 'Low' as PerformanceLevel,
        potential: 'High' as PotentialLevel,
        grid_position: 7,
        talent_indicator: 'Develop',
      },
    ],
    shortLabel: 'L,H',
    onSelectEmployee: fn(),
    isExpanded: false,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    donutModeActive: false,
  },
};
