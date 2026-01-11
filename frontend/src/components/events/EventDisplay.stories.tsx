import type { Meta, StoryObj } from "@storybook/react";
import { EventDisplay } from "./EventDisplay";
import {
  GridMoveEvent,
  DonutMoveEvent,
  FlagAddEvent,
  FlagRemoveEvent,
} from "../../types/events";
import { fn } from "storybook/test";

const meta = {
  title: "App/Right Panel/Changes/EventDisplay",
  component: EventDisplay,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    event: {
      description:
        "The trackable event to display (GridMove, DonutMove, FlagAdd, FlagRemove)",
    },
    showNotes: {
      control: "boolean",
      description: "Whether to show the notes editing field",
    },
    onNotesChange: {
      description: "Callback when notes are edited",
    },
    notesTestId: {
      control: "text",
      description: "Test ID for the notes field",
    },
  },
} satisfies Meta<typeof EventDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample events
const gridMoveEvent: GridMoveEvent = {
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
  notes: null,
};

const donutMoveEvent: DonutMoveEvent = {
  event_id: "donut-move-1",
  event_type: "donut_move",
  employee_id: 102,
  employee_name: "Bob Smith",
  timestamp: "2025-12-24T11:45:00Z",
  old_position: 9,
  new_position: 6,
  old_performance: "High",
  new_performance: "High",
  old_potential: "High",
  new_potential: "Medium",
  notes: null,
};

const flagAddEvent: FlagAddEvent = {
  event_id: "flag-add-1",
  event_type: "flag_add",
  employee_id: 103,
  employee_name: "Charlie Brown",
  timestamp: "2025-12-24T14:20:00Z",
  flag: "promotion_ready",
  notes: null,
};

const flagRemoveEvent: FlagRemoveEvent = {
  event_id: "flag-remove-1",
  event_type: "flag_remove",
  employee_id: 104,
  employee_name: "Diana Prince",
  timestamp: "2025-12-24T16:10:00Z",
  flag: "flight_risk",
  notes: null,
};

/**
 * Default grid movement event showing employee moving from low performer to core talent position.
 */
export const GridMovement: Story = {
  args: {
    event: gridMoveEvent,
    showNotes: false,
  },
};

/**
 * Grid movement with notes field enabled for documentation.
 */
export const GridMovementWithNotes: Story = {
  args: {
    event: {
      ...gridMoveEvent,
      notes:
        "Promoted based on improved quarterly performance and successful project delivery.",
    },
    showNotes: true,
    onNotesChange: fn(),
    notesTestId: "grid-move-notes",
  },
};

/**
 * Grid movement showing a significant promotion (low to high performer).
 */
export const GridMovementSignificantPromotion: Story = {
  args: {
    event: {
      event_id: "grid-move-2",
      event_type: "grid_move",
      employee_id: 105,
      employee_name: "Emma Watson",
      timestamp: "2025-12-23T09:00:00Z",
      old_position: 1,
      new_position: 9,
      old_performance: "Low",
      new_performance: "High",
      old_potential: "Low",
      new_potential: "High",
      notes: "Exceptional turnaround after leadership training program.",
    },
    showNotes: true,
    onNotesChange: fn(),
  },
};

/**
 * Donut movement event showing temporary position adjustment within the same box.
 */
export const DonutMovement: Story = {
  args: {
    event: donutMoveEvent,
    showNotes: false,
  },
};

/**
 * Donut movement with notes explaining the temporary adjustment.
 */
export const DonutMovementWithNotes: Story = {
  args: {
    event: {
      ...donutMoveEvent,
      notes:
        "Temporary adjustment during quarterly review process. Re-evaluation scheduled for Q2.",
    },
    showNotes: true,
    onNotesChange: fn(),
    notesTestId: "donut-move-notes",
  },
};

/**
 * Flag added event showing promotion readiness flag.
 */
export const FlagAdded: Story = {
  args: {
    event: flagAddEvent,
    showNotes: false,
  },
};

/**
 * Flag added with notes documenting the reason.
 */
export const FlagAddedWithNotes: Story = {
  args: {
    event: {
      ...flagAddEvent,
      notes:
        "Identified as promotion candidate after successful completion of management training.",
    },
    showNotes: true,
    onNotesChange: fn(),
    notesTestId: "flag-add-notes",
  },
};

/**
 * Flag removed event showing flight risk flag being cleared.
 */
export const FlagRemoved: Story = {
  args: {
    event: flagRemoveEvent,
    showNotes: false,
  },
};

/**
 * Flag removed with notes explaining the resolution.
 */
export const FlagRemovedWithNotes: Story = {
  args: {
    event: {
      ...flagRemoveEvent,
      notes:
        "Flight risk concern resolved after compensation adjustment and role clarification.",
    },
    showNotes: true,
    onNotesChange: fn(),
    notesTestId: "flag-remove-notes",
  },
};

/**
 * Empty notes field ready for user input.
 */
export const EditableNotesEmpty: Story = {
  args: {
    event: gridMoveEvent,
    showNotes: true,
    onNotesChange: fn(),
    notesTestId: "editable-notes",
  },
};

/**
 * Multiple event types shown together for visual comparison.
 */
export const AllEventTypes: Story = {
  args: {
    event: gridMoveEvent,
    showNotes: false,
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3>Grid Movement</h3>
        <EventDisplay
          event={gridMoveEvent}
          showNotes={true}
          onNotesChange={fn()}
        />
      </div>
      <div>
        <h3>Donut Movement</h3>
        <EventDisplay
          event={donutMoveEvent}
          showNotes={true}
          onNotesChange={fn()}
        />
      </div>
      <div>
        <h3>Flag Added</h3>
        <EventDisplay
          event={flagAddEvent}
          showNotes={true}
          onNotesChange={fn()}
        />
      </div>
      <div>
        <h3>Flag Removed</h3>
        <EventDisplay
          event={flagRemoveEvent}
          showNotes={true}
          onNotesChange={fn()}
        />
      </div>
    </div>
  ),
};
