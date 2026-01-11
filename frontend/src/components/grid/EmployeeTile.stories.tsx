import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DndContext } from "@dnd-kit/core";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { GridZoomProvider } from "../../contexts/GridZoomContext";
import { EmployeeTile } from "./EmployeeTile";
import type {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";
import { tokens } from "../../theme/tokens";

/**
 * EmployeeTile is the core draggable employee card component displayed within grid boxes.
 * It shows employee information including name, title, job level, and various status indicators.
 *
 * **Key Features:**
 * - Drag handle for drag-and-drop functionality
 * - Consistent full border for movement highlighting:
 *   - Session Modified: Full orange border (2px)
 *   - Donut Mode: Full purple border (2px)
 * - Selection highlighting:
 *   - Selected: Blue outer glow (3px box-shadow)
 *   - Can combine with movement borders
 * - Individual flag badges (Treatment 2 - Badge Strip):
 *   - 16px colored circular badges at top-right
 *   - Each flag shows its semantic color
 *   - Tooltip displays flag name on hover
 * - Responsive layout with text truncation
 * - Zoom level support (5 levels: 0-4)
 *
 * **Data Attributes:**
 * - `data-testid="employee-card-{employee_id}"` - Main card container
 * - `data-selected="true|false"` - Selection state
 * - `data-testid="donut-indicator"` - Donut mode chip
 * - `data-testid="flag-badge-{index}"` - Individual flag badges
 */
const meta: Meta<typeof EmployeeTile> = {
  title: "App/Grid/EmployeeTile",
  component: EmployeeTile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <GridZoomProvider>
        <DndContext>
          <div style={{ width: 350 }}>
            <Story />
          </div>
        </DndContext>
      </GridZoomProvider>
    ),
  ],
  argTypes: {
    employee: {
      description: "Employee data object with all employee information",
    },
    onSelect: {
      description: "Callback fired when employee tile is clicked",
      action: "selected",
    },
    isSelected: {
      control: "boolean",
      description:
        "Whether this employee is currently selected (shows blue glow)",
    },
    donutModeActive: {
      control: "boolean",
      description:
        "Whether donut mode is currently active (shows donut position indicators)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmployeeTile>;

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
  management_chain_01: "Carol White",
  management_chain_02: "David Brown",
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2020-03-15",
  tenure_category: "3-5 years",
  time_in_job_profile: "2 years",
  performance: "High" as PerformanceLevel,
  potential: "High" as PotentialLevel,
  grid_position: 9,
  talent_indicator: "Star",
  ratings_history: [
    { year: 2024, rating: "Strong" },
    { year: 2023, rating: "Leading" },
  ],
  development_focus: "Leadership skills",
  development_action: "Mentor junior engineers",
  notes: null,
  promotion_status: "Ready",
  promotion_readiness: true,
  modified_in_session: false,
  last_modified: null,
  flags: [],
};

/**
 * Default employee tile with complete data.
 * Shows standard appearance with all key information.
 */
export const Default: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "employee-tile-normal" },
  },
  args: {
    employee: baseEmployee,
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Selected Employee
 *
 * Employee tile in selected state.
 * Displays blue outer glow (3px box-shadow) to indicate selection.
 * Selection state is independent of modification state.
 */
export const Selected: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "employee-tile-selected" },
  },
  args: {
    employee: baseEmployee,
    onSelect: fn(),
    isSelected: true,
    donutModeActive: false,
  },
};

/**
 * Selected and Modified
 *
 * Employee tile that is both selected and modified.
 * Combines orange border (modification) with blue glow (selection).
 * Demonstrates that both states can coexist visually.
 */
export const SelectedAndModified: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "employee-tile-selected-modified" },
  },
  args: {
    employee: {
      ...baseEmployee,
      grid_position: 9,
      original_grid_position: 5,
      modified_in_session: true,
      last_modified: "2025-12-31T10:30:00Z",
    },
    onSelect: fn(),
    isSelected: true,
    donutModeActive: false,
  },
};

/**
 * Modified - Normal Mode
 *
 * Employee tile with modified_in_session flag set.
 * Displays full orange border (2px) to indicate session modification.
 * Shows "Originally: <position>" text when employee has been moved.
 */
export const ModifiedNormalMode: Story = {
  name: "Modified - Normal Mode",
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "changes-orange-border" },
  },
  args: {
    employee: {
      ...baseEmployee,
      grid_position: 9, // Current position
      original_grid_position: 5, // Moved from position 5
      modified_in_session: true,
      last_modified: "2025-12-31T10:30:00Z",
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Modified - Donut Mode
 *
 * Employee in donut mode with a donut position set.
 * Shows full purple border (2px) and "Donut" chip with position label.
 * Indicates the employee has been repositioned in the donut calibration view.
 */
export const ModifiedDonutMode: Story = {
  name: "Modified - Donut Mode",
  args: {
    employee: {
      ...baseEmployee,
      grid_position: 9, // Original grid position
      donut_position: 6, // Moved to position 6 in donut mode
      donut_performance: "High" as PerformanceLevel,
      donut_potential: "Medium" as PotentialLevel,
      donut_modified: true,
      donut_last_modified: "2025-12-31T11:00:00Z",
    },
    onSelect: fn(),
    donutModeActive: true,
  },
};

/**
 * With Flags
 *
 * Employee with multiple flags applied.
 * Shows the flag badge system with semantic colors and tooltips.
 * Flags appear as colored circular badges at the top-right of the tile.
 */
export const WithFlags: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "details-flag-badges" },
  },
  args: {
    employee: {
      ...baseEmployee,
      flags: ["high_potential", "promotion_ready", "key_talent"],
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Donut Mode
 *
 * Employee tile in donut mode with purple border and original position indicator.
 * Shows how the tile appears when placed in the donut (center box) during calibration.
 * Used for donut-mode-employee-tile-purple screenshot.
 */
export const DonutMode: Story = {
  name: "Donut Mode",
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "donut-mode-employee-tile-purple" },
  },
  args: {
    employee: {
      ...baseEmployee,
      grid_position: 5, // Original position (center box in donut mode)
      donut_position: 8, // Moved to position 8 in donut mode
      donut_performance: "Medium" as PerformanceLevel,
      donut_potential: "High" as PotentialLevel,
      donut_modified: true,
      donut_last_modified: "2025-12-31T11:00:00Z",
    },
    onSelect: fn(),
    donutModeActive: true,
  },
};

/**
 * All Tile States Composite
 *
 * Shows all 4 employee tile states side by side for documentation:
 * 1. Default (blue) - Standard employee tile
 * 2. Modified (orange border) - Employee modified in current session
 * 3. Donut Mode (purple border) - Employee repositioned in calibration mode
 * 4. With Flags - Employee with flag chips displayed
 *
 * Used for grid-employee-tile-states screenshot.
 */
export const AllStatesComposite: Story = {
  name: "All States Composite",
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "grid-employee-tile-states" },
    layout: "padded",
  },
  decorators: [
    () => (
      <GridZoomProvider>
        <DndContext>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 3,
              p: 2,
              backgroundColor: "background.default",
              borderRadius: 1,
              maxWidth: 720,
            }}
          >
            {/* Default Blue */}
            <Box>
              <Typography
                variant="caption"
                sx={{ mb: 1, display: "block", color: "text.secondary" }}
              >
                Default
              </Typography>
              <EmployeeTile
                employee={baseEmployee}
                onSelect={fn()}
                donutModeActive={false}
              />
            </Box>

            {/* Modified Orange Border */}
            <Box>
              <Typography
                variant="caption"
                sx={{ mb: 1, display: "block", color: "text.secondary" }}
              >
                Modified (Orange Border)
              </Typography>
              <EmployeeTile
                employee={{
                  ...baseEmployee,
                  employee_id: 12346,
                  name: "Bob Smith",
                  business_title: "Product Manager",
                  grid_position: 9,
                  original_grid_position: 5,
                  modified_in_session: true,
                  last_modified: "2025-12-31T10:30:00Z",
                }}
                onSelect={fn()}
                donutModeActive={false}
              />
            </Box>

            {/* Donut Mode Purple Border */}
            <Box>
              <Typography
                variant="caption"
                sx={{ mb: 1, display: "block", color: "text.secondary" }}
              >
                Donut Mode (Purple Border)
              </Typography>
              <EmployeeTile
                employee={{
                  ...baseEmployee,
                  employee_id: 12347,
                  name: "Carol White",
                  business_title: "Data Scientist",
                  grid_position: 5,
                  donut_position: 8,
                  donut_performance: "Medium" as PerformanceLevel,
                  donut_potential: "High" as PotentialLevel,
                  donut_modified: true,
                }}
                onSelect={fn()}
                donutModeActive={true}
              />
            </Box>

            {/* With Flags */}
            <Box>
              <Typography
                variant="caption"
                sx={{ mb: 1, display: "block", color: "text.secondary" }}
              >
                With Flags
              </Typography>
              <EmployeeTile
                employee={{
                  ...baseEmployee,
                  employee_id: 12348,
                  name: "David Lee",
                  business_title: "Engineering Manager",
                  flags: ["high_potential", "promotion_ready", "big_mover"],
                }}
                onSelect={fn()}
                donutModeActive={false}
              />
            </Box>
          </Box>
        </DndContext>
      </GridZoomProvider>
    ),
  ],
  args: {
    employee: baseEmployee,
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Zoom Levels
 *
 * Interactive story for testing different zoom levels (0-4).
 * Use the zoomLevel control to see how the tile adapts to different scales:
 * - Level 0: Compact (60%) - Maximum information density
 * - Level 1: Comfortable- (80%) - Slightly smaller
 * - Level 2: Normal (100%) - Default size
 * - Level 3: Comfortable+ (125%) - Larger for easier reading
 * - Level 4: Presentation (150%) - Maximum readability
 *
 * This validates spacing, text truncation, and layout at different zoom levels.
 */
export const ZoomLevels: Story = {
  name: "Zoom Levels",
  render: (args) => {
    // @ts-expect-error - zoomLevel is a custom arg
    const zoomLevel = args.zoomLevel ?? 2;

    // Zoom token calculator (matches GridZoomContext logic)
    const getZoomTokens = (level: number) => {
      const scales = [0.6, 0.8, 1.0, 1.25, 1.5];
      const scale = scales[level] || 1.0;

      // Convert rem to px (assuming 1rem = 16px)
      const remToPx = (rem: string) => parseFloat(rem) * 16;

      return {
        fontSize: {
          sm: remToPx(tokens.typography.fontSize.body2) * scale,
          base: remToPx(tokens.typography.fontSize.body1) * scale,
          lg: remToPx(tokens.typography.fontSize.h6) * scale,
        },
        spacing: {
          xs: tokens.spacing.xs * scale,
          sm: tokens.spacing.sm * scale,
          md: tokens.spacing.md * scale,
          lg: tokens.spacing.lg * scale,
        },
        gap: tokens.spacing.sm * scale,
      };
    };

    const zoomTokens = getZoomTokens(zoomLevel);
    const levelNames = [
      "Compact",
      "Comfortable-",
      "Normal",
      "Comfortable+",
      "Presentation",
    ];

    return (
      <DndContext>
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
          {/* Info Banner */}
          <Box
            sx={{
              p: 2,
              bgcolor: "info.main",
              color: "white",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              mb: 3,
            }}
          >
            <div>
              <strong>Zoom Level {zoomLevel}:</strong> {levelNames[zoomLevel]} (
              {(
                (getZoomTokens(zoomLevel).fontSize.base /
                  (parseFloat(tokens.typography.fontSize.body1) * 16)) *
                100
              ).toFixed(0)}
              %)
            </div>
            <div style={{ marginTop: 8 }}>
              Font sizes: {zoomTokens.fontSize.sm}px /{" "}
              {zoomTokens.fontSize.base}px / {zoomTokens.fontSize.lg}px
            </div>
            <div>
              Spacing: {zoomTokens.spacing.xs}px / {zoomTokens.spacing.sm}px /{" "}
              {zoomTokens.spacing.md}px / {zoomTokens.spacing.lg}px
            </div>
          </Box>

          {/* Tile Container */}
          <Box
            sx={{
              width: 350,
              mx: "auto",
            }}
          >
            <EmployeeTile
              {...args}
              // @ts-expect-error - passing zoom tokens for testing
              __zoomTokens={zoomTokens}
            />
          </Box>

          {/* Usage Note */}
          <Typography
            variant="caption"
            sx={{
              mt: 3,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            Use the <strong>zoomLevel</strong> control below to test different
            zoom levels
          </Typography>
        </Box>
      </DndContext>
    );
  },
  args: {
    employee: {
      ...baseEmployee,
      flags: ["high_potential"],
      modified_in_session: true,
    },
    onSelect: fn(),
    donutModeActive: false,
  },
  parameters: {
    layout: "fullscreen",
  },
};
