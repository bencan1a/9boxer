import type { Meta, StoryObj } from "@storybook/react";
import { EmployeeChangesSummary } from "./EmployeeChangesSummary";
import { useSessionStore } from "../../store/sessionStore";
import {
  GridMoveEvent,
  DonutMoveEvent,
  FlagAddEvent,
  FlagRemoveEvent,
} from "../../types/events";

const meta = {
  title: "Components/Panel/EmployeeChangesSummary",
  component: EmployeeChangesSummary,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    employeeId: {
      control: "number",
      description: "ID of the employee to show changes for",
    },
  },
} satisfies Meta<typeof EmployeeChangesSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample events for employee 101
const sampleEvents: GridMoveEvent[] = [
  {
    event_id: "grid-move-1",
    event_type: "grid_move",
    employee_id: 101,
    employee_name: "Alice Johnson",
    timestamp: "2025-12-24T10:30:00Z",
    old_position: 1,
    new_position: 5,
    old_performance: "Low",
    new_performance: "Medium",
    old_potential: "Low",
    new_potential: "Medium",
    notes: "Promoted based on improved quarterly performance.",
  },
  {
    event_id: "grid-move-2",
    event_type: "grid_move",
    employee_id: 101,
    employee_name: "Alice Johnson",
    timestamp: "2025-12-20T14:15:00Z",
    old_position: 2,
    new_position: 1,
    old_performance: "Low",
    new_performance: "Low",
    old_potential: "Medium",
    new_potential: "Low",
    notes: null,
  },
];

const sampleDonutEvents: DonutMoveEvent[] = [
  {
    event_id: "donut-move-1",
    event_type: "donut_move",
    employee_id: 101,
    employee_name: "Alice Johnson",
    timestamp: "2025-12-23T11:45:00Z",
    old_position: 5,
    new_position: 8,
    old_performance: "Medium",
    new_performance: "High",
    old_potential: "Medium",
    new_potential: "Medium",
    notes: "Temporary adjustment during review process.",
  },
];

const sampleFlagEvents: (FlagAddEvent | FlagRemoveEvent)[] = [
  {
    event_id: "flag-add-1",
    event_type: "flag_add",
    employee_id: 101,
    employee_name: "Alice Johnson",
    timestamp: "2025-12-22T09:00:00Z",
    flag: "promotion_ready",
    notes: "Ready for next level position.",
  },
];

/**
 * Empty state when employee has no change history.
 */
export const NoChanges: Story = {
  args: {
    employeeId: 999,
  },
  render: (args) => {
    // Clear store events for this employee
    useSessionStore.setState({
      events: [],
      donutEvents: [],
    });
    return <EmployeeChangesSummary {...args} />;
  },
};

/**
 * Employee with a single grid movement change.
 */
export const SingleChange: Story = {
  args: {
    employeeId: 101,
  },
  render: (args) => {
    useSessionStore.setState({
      events: [sampleEvents[0]],
      donutEvents: [],
    });
    return <EmployeeChangesSummary {...args} />;
  },
};

/**
 * Employee with multiple grid movements showing progression over time.
 */
export const MultipleGridChanges: Story = {
  args: {
    employeeId: 101,
  },
  render: (args) => {
    useSessionStore.setState({
      events: sampleEvents,
      donutEvents: [],
    });
    return <EmployeeChangesSummary {...args} />;
  },
};

/**
 * Employee with both grid and donut movements.
 */
export const MixedChanges: Story = {
  args: {
    employeeId: 101,
  },
  render: (args) => {
    useSessionStore.setState({
      events: sampleEvents,
      donutEvents: sampleDonutEvents,
    });
    return <EmployeeChangesSummary {...args} />;
  },
};

/**
 * Employee with grid movements and flag changes.
 */
export const WithFlagChanges: Story = {
  args: {
    employeeId: 101,
  },
  render: (args) => {
    useSessionStore.setState({
      events: [...sampleEvents, ...sampleFlagEvents],
      donutEvents: [],
    });
    return <EmployeeChangesSummary {...args} />;
  },
};

/**
 * Employee with extensive change history (all event types).
 */
export const ExtensiveHistory: Story = {
  args: {
    employeeId: 101,
  },
  render: (args) => {
    const allEvents = [
      ...sampleEvents,
      ...sampleFlagEvents,
      {
        event_id: "flag-remove-1",
        event_type: "flag_remove" as const,
        employee_id: 101,
        employee_name: "Alice Johnson",
        timestamp: "2025-12-21T16:30:00Z",
        flag: "flight_risk",
        notes: "Retention concerns addressed with compensation adjustment.",
      },
    ];

    useSessionStore.setState({
      events: allEvents,
      donutEvents: sampleDonutEvents,
    });
    return <EmployeeChangesSummary {...args} />;
  },
};

/**
 * Employee with changes that have detailed notes.
 */
export const WithDetailedNotes: Story = {
  args: {
    employeeId: 101,
  },
  render: (args) => {
    const eventsWithNotes: GridMoveEvent[] = [
      {
        ...sampleEvents[0],
        notes:
          "Employee demonstrated exceptional performance in Q4. Successfully led the Phoenix project, mentored 3 junior developers, and received positive feedback from stakeholders. Recommended for promotion to senior role.",
      },
    ];

    useSessionStore.setState({
      events: eventsWithNotes,
      donutEvents: [],
    });
    return <EmployeeChangesSummary {...args} />;
  },
};

/**
 * Recent changes (last 24 hours) for quick review.
 */
export const RecentChanges: Story = {
  args: {
    employeeId: 101,
  },
  render: (args) => {
    const now = new Date();
    const recentEvents: GridMoveEvent[] = [
      {
        event_id: "recent-1",
        event_type: "grid_move",
        employee_id: 101,
        employee_name: "Alice Johnson",
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        old_position: 5,
        new_position: 8,
        old_performance: "Medium",
        new_performance: "High",
        old_potential: "Medium",
        new_potential: "Medium",
        notes: "Moved to high performer based on year-end review.",
      },
      {
        event_id: "recent-2",
        event_type: "grid_move",
        employee_id: 101,
        employee_name: "Alice Johnson",
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        old_position: 4,
        new_position: 5,
        old_performance: "Low",
        new_performance: "Medium",
        old_potential: "Medium",
        new_potential: "Medium",
        notes: null,
      },
    ];

    useSessionStore.setState({
      events: recentEvents,
      donutEvents: [],
    });
    return <EmployeeChangesSummary {...args} />;
  },
};
