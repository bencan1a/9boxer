import type { Meta, StoryObj } from "@storybook/react";
import { ChangeTrackerTab } from "./ChangeTrackerTab";
import { useSessionStore } from "../../store/sessionStore";
import {
  GridMoveEvent,
  DonutMoveEvent,
  FlagAddEvent,
  FlagRemoveEvent,
} from "../../types/events";

const meta = {
  title: "App/Right Panel/Changes/ChangeTrackerTab",
  component: ChangeTrackerTab,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: "600px", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChangeTrackerTab>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample grid events for multiple employees
const gridEvents: GridMoveEvent[] = [
  {
    event_id: "grid-1",
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
    event_id: "grid-2",
    event_type: "grid_move",
    employee_id: 102,
    employee_name: "Bob Smith",
    timestamp: "2025-12-24T09:15:00Z",
    old_position: 5,
    new_position: 8,
    old_performance: "Medium",
    new_performance: "High",
    old_potential: "Medium",
    new_potential: "Medium",
    notes: null,
  },
  {
    event_id: "grid-3",
    event_type: "grid_move",
    employee_id: 103,
    employee_name: "Charlie Brown",
    timestamp: "2025-12-23T14:20:00Z",
    old_position: 4,
    new_position: 7,
    old_performance: "Low",
    new_performance: "Medium",
    old_potential: "Medium",
    new_potential: "High",
    notes: "Showing strong potential after training program.",
  },
];

const donutEvents: DonutMoveEvent[] = [
  {
    event_id: "donut-1",
    event_type: "donut_move",
    employee_id: 104,
    employee_name: "Diana Prince",
    timestamp: "2025-12-24T11:45:00Z",
    old_position: 9,
    new_position: 6,
    old_performance: "High",
    new_performance: "High",
    old_potential: "High",
    new_potential: "Medium",
    notes: "Temporary adjustment during review process.",
  },
  {
    event_id: "donut-2",
    event_type: "donut_move",
    employee_id: 105,
    employee_name: "Emma Watson",
    timestamp: "2025-12-23T16:10:00Z",
    old_position: 8,
    new_position: 5,
    old_performance: "High",
    new_performance: "Medium",
    old_potential: "Medium",
    new_potential: "Medium",
    notes: null,
  },
];

const flagEvents: (FlagAddEvent | FlagRemoveEvent)[] = [
  {
    event_id: "flag-1",
    event_type: "flag_add",
    employee_id: 106,
    employee_name: "Frank Miller",
    timestamp: "2025-12-24T08:00:00Z",
    flag: "promotion_ready",
    notes: "Ready for next level position.",
  },
  {
    event_id: "flag-2",
    event_type: "flag_remove",
    employee_id: 107,
    employee_name: "Grace Hopper",
    timestamp: "2025-12-23T10:30:00Z",
    flag: "flight_risk",
    notes: "Retention concerns addressed.",
  },
];

/**
 * Empty state when no changes have been made yet.
 */
export const NoChanges: Story = {
  render: () => {
    useSessionStore.setState({
      events: [],
      donutEvents: [],
      donutModeActive: false,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Change tracker with only grid movements (no donut mode).
 */
export const GridChangesOnly: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notes-changes-tab-field" },
  },
  render: () => {
    useSessionStore.setState({
      events: gridEvents,
      donutEvents: [],
      donutModeActive: false,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Grid movements with mixed change types (movements and flags).
 */
export const MixedGridChanges: Story = {
  render: () => {
    useSessionStore.setState({
      events: [...gridEvents, ...flagEvents],
      donutEvents: [],
      donutModeActive: false,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Change tracker with both grid and donut tabs visible.
 * Shows the tab toggle interface for switching between Regular Changes and Donut Changes.
 * Used for donut-mode-changes-tabs-toggle screenshot.
 */
export const WithDonutMode: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "donut-mode-changes-tabs-toggle" },
  },
  render: () => {
    useSessionStore.setState({
      events: gridEvents,
      donutEvents: donutEvents,
      donutModeActive: true,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Donut mode active with extensive changes on both tabs.
 */
export const ExtensiveChanges: Story = {
  render: () => {
    const moreGridEvents: GridMoveEvent[] = [
      ...gridEvents,
      {
        event_id: "grid-4",
        event_type: "grid_move",
        employee_id: 108,
        employee_name: "Henry Ford",
        timestamp: "2025-12-22T11:00:00Z",
        old_position: 3,
        new_position: 6,
        old_performance: "Low",
        new_performance: "High",
        old_potential: "High",
        new_potential: "Medium",
        notes: "Exceptional improvement after mentorship program.",
      },
      {
        event_id: "grid-5",
        event_type: "grid_move",
        employee_id: 109,
        employee_name: "Iris West",
        timestamp: "2025-12-21T09:30:00Z",
        old_position: 7,
        new_position: 9,
        old_performance: "Medium",
        new_performance: "High",
        old_potential: "High",
        new_potential: "High",
        notes: "Promoted to star performer.",
      },
    ];

    const moreDonutEvents: DonutMoveEvent[] = [
      ...donutEvents,
      {
        event_id: "donut-3",
        event_type: "donut_move",
        employee_id: 110,
        employee_name: "Jack Ryan",
        timestamp: "2025-12-22T14:45:00Z",
        old_position: 6,
        new_position: 8,
        old_performance: "High",
        new_performance: "High",
        old_potential: "Medium",
        new_potential: "Medium",
        notes: "Temporary high performer adjustment.",
      },
    ];

    useSessionStore.setState({
      events: moreGridEvents,
      donutEvents: moreDonutEvents,
      donutModeActive: true,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Only donut changes, no grid changes.
 */
export const DonutChangesOnly: Story = {
  render: () => {
    useSessionStore.setState({
      events: [],
      donutEvents: donutEvents,
      donutModeActive: true,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Donut changes with descriptive calibration notes.
 * Used for workflow-donut-notes-example screenshot showing donut mode tracking.
 */
export const DonutChanges: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "workflow-donut-notes-example" },
  },
  render: () => {
    const calibrationDonutEvents: DonutMoveEvent[] = [
      {
        event_id: "donut-cal-1",
        event_type: "donut_move",
        employee_id: 201,
        employee_name: "Sarah Chen",
        timestamp: "2025-12-24T10:00:00Z",
        old_position: 5,
        new_position: 9,
        old_performance: "Medium",
        new_performance: "High",
        old_potential: "Medium",
        new_potential: "High",
        notes:
          "Confirmed star performer after calibration discussion. Strong Q4 results and leadership potential.",
      },
      {
        event_id: "donut-cal-2",
        event_type: "donut_move",
        employee_id: 202,
        employee_name: "Michael Park",
        timestamp: "2025-12-24T10:15:00Z",
        old_position: 8,
        new_position: 5,
        old_performance: "High",
        new_performance: "Medium",
        old_potential: "Medium",
        new_potential: "Medium",
        notes:
          "Adjusted after peer comparison. Strong performer but potential rating was too high.",
      },
      {
        event_id: "donut-cal-3",
        event_type: "donut_move",
        employee_id: 203,
        employee_name: "Jennifer Lopez",
        timestamp: "2025-12-24T10:30:00Z",
        old_position: 4,
        new_position: 7,
        old_performance: "Low",
        new_performance: "Medium",
        old_potential: "Medium",
        new_potential: "High",
        notes: "Upward adjustment based on recent project leadership success.",
      },
    ];

    useSessionStore.setState({
      events: [],
      donutEvents: calibrationDonutEvents,
      donutModeActive: true,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Single change for quick review.
 */
export const SingleChange: Story = {
  render: () => {
    useSessionStore.setState({
      events: [gridEvents[0]],
      donutEvents: [],
      donutModeActive: false,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Changes with detailed notes for documentation.
 */
export const WithDetailedNotes: Story = {
  render: () => {
    const eventsWithNotes: GridMoveEvent[] = gridEvents.map((event, index) => ({
      ...event,
      notes:
        index === 0
          ? "Employee demonstrated exceptional performance in Q4. Successfully led the Phoenix project, mentored 3 junior developers, and received positive feedback from stakeholders. Recommended for promotion to senior role."
          : event.notes,
    }));

    useSessionStore.setState({
      events: eventsWithNotes,
      donutEvents: [],
      donutModeActive: false,
    });
    return <ChangeTrackerTab />;
  },
};

/**
 * Recent changes from the last few hours.
 */
export const RecentChanges: Story = {
  render: () => {
    const now = new Date();
    const recentEvents: GridMoveEvent[] = [
      {
        event_id: "recent-1",
        event_type: "grid_move",
        employee_id: 101,
        employee_name: "Alice Johnson",
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
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
        employee_id: 102,
        employee_name: "Bob Smith",
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
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
      donutModeActive: false,
    });
    return <ChangeTrackerTab />;
  },
};
