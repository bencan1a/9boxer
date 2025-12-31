import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { DndContext } from "@dnd-kit/core";
import { Box } from "@mui/material";
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
 * - Individual flag badges (Treatment 2 - Badge Strip):
 *   - 16px colored circular badges at top-right
 *   - Each flag shows its semantic color
 *   - Tooltip displays flag name on hover
 * - Responsive layout with text truncation
 *
 * **Data Attributes:**
 * - `data-testid="employee-card-{employee_id}"` - Main card container
 * - `data-testid="donut-indicator"` - Donut mode chip
 * - `data-testid="flag-badge-{index}"` - Individual flag badges
 */
const meta: Meta<typeof EmployeeTile> = {
  title: "Grid/EmployeeTile",
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
  args: {
    employee: baseEmployee,
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee tile with modified_in_session flag set.
 * Displays full orange border (2px) to indicate session modification.
 */
export const Modified: Story = {
  args: {
    employee: {
      ...baseEmployee,
      modified_in_session: true,
      last_modified: "2025-12-25T10:30:00Z",
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee in donut mode with a donut position set.
 * Shows full purple border (2px) and "Donut" chip with position label.
 */
export const DonutModified: Story = {
  args: {
    employee: {
      ...baseEmployee,
      donut_position: 6,
      donut_performance: "High" as PerformanceLevel,
      donut_potential: "Medium" as PotentialLevel,
      donut_modified: true,
      donut_last_modified: "2025-12-25T11:00:00Z",
    },
    onSelect: fn(),
    donutModeActive: true,
  },
};

/**
 * Employee with very long name and title.
 * Tests text overflow and truncation behavior.
 */
export const LongName: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: "Dr. Elizabeth Alexandra Montgomery-Winthrop III",
      business_title:
        "Chief Distinguished Principal Senior Staff Software Architect",
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee tile with all fields populated.
 * Includes multiple flags and all metadata.
 */
export const WithAllFields: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: ["high-potential", "flight-risk", "new-hire"],
      modified_in_session: true,
      development_focus: "Technical leadership and architecture",
      development_action: "Lead cross-functional initiatives",
      notes: "Excellent performer with strong team collaboration",
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee tile with minimal data.
 * Only required fields populated, tests sparse data handling.
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
      manager: "Manager",
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
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee with flags only.
 * Shows the flag badge with count and tooltip.
 */
export const WithFlags: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: ["high-potential", "promotion-ready", "key-talent"],
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Low performer in needs attention box.
 * Shows employee at grid position 1 (Low/Low).
 */
export const LowPerformer: Story = {
  args: {
    employee: {
      ...baseEmployee,
      employee_id: 11111,
      name: "Sarah Williams",
      business_title: "Junior Analyst",
      job_level: "MT2",
      performance: "Low" as PerformanceLevel,
      potential: "Low" as PotentialLevel,
      grid_position: 1,
      talent_indicator: "Development Needed",
      flags: ["performance-plan"],
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * ORIGINAL POSITION VARIANTS - Donut Mode
 *
 * These stories showcase different visual designs for displaying where
 * an employee was originally positioned. Useful for showing movement
 * history in both donut mode and normal session modifications.
 *
 * Employee shown: Moved from position 5 (Solid, M/M) to position 9 (Star, H/H) in donut mode
 */

const movedEmployeeDonut: Employee = {
  ...baseEmployee,
  grid_position: 5, // Original position (Medium/Medium)
  performance: "Medium" as PerformanceLevel,
  potential: "Medium" as PotentialLevel,
  donut_position: 9, // Moved to High/High in donut mode
  donut_performance: "High" as PerformanceLevel,
  donut_potential: "High" as PotentialLevel,
  donut_modified: true,
};

/**
 * Variant 1: Chip Badge
 * Small chip showing "Was: <position>" - subtle but clear
 */
export const OriginalPosition_Chip_DonutMode: Story = {
  name: "Original Position: Chip (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "chip",
  },
};

/**
 * Variant 2: Full Text
 * Complete text "Originally: <position>" - most descriptive
 */
export const OriginalPosition_Text_DonutMode: Story = {
  name: "Original Position: Text (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "text",
  },
};

/**
 * Variant 3: Compact Text
 * Minimal text "was <position>" - most space-efficient
 */
export const OriginalPosition_TextCompact_DonutMode: Story = {
  name: "Original Position: Text Compact (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "text-compact",
  },
};

/**
 * Variant 4: Arrow Notation
 * Shows movement with arrow: "Original → Current"
 */
export const OriginalPosition_Arrow_DonutMode: Story = {
  name: "Original Position: Arrow (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "arrow",
  },
};

/**
 * Variant 5: Icon + Text
 * History icon with position label - visual indicator
 */
export const OriginalPosition_IconText_DonutMode: Story = {
  name: "Original Position: Icon+Text (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "icon-text",
  },
};

/**
 * COMPARISON: All Variants Side-by-Side (Donut Mode)
 *
 * Interactive story with controls to switch between all variants.
 * Use the "originalPositionVariant" control in Storybook to compare.
 */
export const OriginalPosition_AllVariants_DonutMode: Story = {
  name: "Original Position: All Variants (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "chip",
  },
  argTypes: {
    originalPositionVariant: {
      control: "select",
      options: ["none", "chip", "text", "text-compact", "arrow", "icon-text"],
      description: "Visual style for showing original position",
    },
  },
};

/**
 * No Original Position Indicator
 * For comparison - employee moved but no indicator shown (current behavior)
 */
export const OriginalPosition_None_DonutMode: Story = {
  name: "Original Position: None (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "none",
  },
};

/**
 * ============================================================================
 * ZOOM LEVEL EXPERIMENTATION
 * ============================================================================
 *
 * These stories allow testing different zoom levels for the grid zoom feature.
 * Use the controls to experiment with scaling strategies and token values.
 *
 * Zoom Levels:
 * - Level 0: Compact (60%) - Maximum information density
 * - Level 1: Comfortable- (80%) - Slightly smaller than normal
 * - Level 2: Normal (100%) - Default view
 * - Level 3: Comfortable+ (125%) - Slightly larger than normal
 * - Level 4: Presentation (150%) - Maximum visibility from distance
 */

/**
 * Get zoom tokens for a specific level
 */
const getZoomTokens = (level: number) => {
  const levelKey = `level${level}` as keyof typeof tokens.dimensions.gridZoom;
  return tokens.dimensions.gridZoom[levelKey];
};

/**
 * Zoom Level Experimentation - Interactive
 *
 * Use this story to experiment with different zoom levels and see how
 * employee tiles scale. Adjust the zoom level control to switch between
 * all 5 levels and compare the visual differences.
 *
 * **How to use:**
 * 1. Use the "zoomLevel" control to select 0-4
 * 2. Observe how tile size, fonts, and icons scale
 * 3. Test with different employee variants using other controls
 */
export const ZoomLevels_Interactive: Story = {
  name: "🔍 Zoom Levels: Interactive",
  render: (args) => {
    // @ts-expect-error - zoomLevel is a custom arg
    const zoomLevel = args.zoomLevel ?? 2;
    const zoomTokens = getZoomTokens(zoomLevel);

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
              flexShrink: 0,
            }}
          >
            <div>
              <strong>Zoom Level {zoomLevel}</strong> -{" "}
              {
                [
                  "Compact (60%)",
                  "Comfortable- (80%)",
                  "Normal (100%)",
                  "Comfortable+ (125%)",
                  "Presentation (150%)",
                ][zoomLevel]
              }
            </div>
            <div>
              Tile Width: {zoomTokens.tile.minWidth}px -{" "}
              {zoomTokens.tile.maxWidth}px
            </div>
            <div>
              Font Sizes: Name={zoomTokens.font.name}, Title=
              {zoomTokens.font.titleLevel}
            </div>
            <div>
              Icon Sizes: Drag={zoomTokens.icon.dragHandle}px, Flag=
              {zoomTokens.icon.flag}px
            </div>
            <div>Gap: {zoomTokens.spacing.gap}px</div>
          </Box>

          {/* Tile Preview with Zoom Applied - Centered */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Box
              sx={{
                width: `${zoomTokens.tile.maxWidth}px`,
                "& .MuiCard-root": {
                  minWidth: `${zoomTokens.tile.minWidth}px`,
                  maxWidth: `${zoomTokens.tile.maxWidth}px`,
                },
                "& .MuiCardContent-root": {
                  padding: `${zoomTokens.tile.padding}px !important`,
                },
                "& .MuiTypography-subtitle2": {
                  fontSize: zoomTokens.font.name,
                },
                "& .MuiTypography-body2": {
                  fontSize: `${zoomTokens.font.titleLevel} !important`,
                },
                "& [data-testid^='flag-badge']": {
                  width: `${zoomTokens.icon.flag}px !important`,
                  height: `${zoomTokens.icon.flag}px !important`,
                },
                "& .MuiSvgIcon-root": {
                  fontSize: `${zoomTokens.icon.dragHandle}px !important`,
                },
              }}
            >
              <EmployeeTile
                employee={args.employee}
                onSelect={args.onSelect || fn()}
                donutModeActive={args.donutModeActive || false}
                originalPositionVariant={
                  args.originalPositionVariant || "icon-text"
                }
              />
            </Box>
          </Box>
        </Box>
      </DndContext>
    );
  },
  args: {
    employee: {
      ...baseEmployee,
      flags: ["high-potential", "promotion-ready"],
      modified_in_session: true,
    },
    zoomLevel: 2,
    onSelect: fn(),
    donutModeActive: false,
    originalPositionVariant: "icon-text",
  },
  argTypes: {
    zoomLevel: {
      control: {
        type: "select",
        labels: {
          0: "Level 0: Compact (60%)",
          1: "Level 1: Comfortable- (80%)",
          2: "Level 2: Normal (100%)",
          3: "Level 3: Comfortable+ (125%)",
          4: "Level 4: Presentation (150%)",
        },
      },
      options: [0, 1, 2, 3, 4],
      description: "Grid zoom level (0=Compact, 2=Normal, 4=Presentation)",
    },
    employee: {
      description: "Employee data (use other controls to customize)",
    },
  },
  parameters: {
    layout: "fullscreen",
  },
};

/**
 * Zoom Level Comparison - All 5 Levels Side-by-Side
 *
 * Shows all zoom levels simultaneously for easy comparison.
 * Helps visualize the scaling progression from compact to presentation mode.
 */
export const ZoomLevels_Comparison: Story = {
  name: "🔍 Zoom Levels: All 5 Side-by-Side",
  render: () => {
    const levels = [0, 1, 2, 3, 4];
    const levelNames = [
      "Compact (60%)",
      "Comfortable- (80%)",
      "Normal (100%)",
      "Comfortable+ (125%)",
      "Presentation (150%)",
    ];

    return (
      <DndContext>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            gap: 3,
            p: 3,
            overflowX: "auto",
            alignItems: "flex-start", // Prevent stretching
          }}
        >
          {levels.map((level) => {
            const zoomTokens = getZoomTokens(level);
            return (
              <Box
                key={level}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  minWidth: "fit-content",
                  flexShrink: 0, // Prevent shrinking
                }}
              >
                {/* Level Header */}
                <Box
                  sx={{
                    p: 1,
                    bgcolor: level === 2 ? "primary.main" : "background.paper",
                    color: level === 2 ? "white" : "text.primary",
                    borderRadius: 1,
                    textAlign: "center",
                    border: 1,
                    borderColor: "divider",
                    fontWeight: level === 2 ? "bold" : "normal",
                    width: `${zoomTokens.tile.maxWidth}px`,
                  }}
                >
                  <div style={{ fontSize: "0.875rem", fontWeight: "bold" }}>
                    Level {level}
                  </div>
                  <div style={{ fontSize: "0.75rem" }}>{levelNames[level]}</div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      marginTop: "4px",
                      opacity: 0.8,
                    }}
                  >
                    {zoomTokens.tile.minWidth}-{zoomTokens.tile.maxWidth}px
                  </div>
                </Box>

                {/* Tile with Zoom Applied */}
                <Box
                  sx={{
                    width: `${zoomTokens.tile.maxWidth}px`,
                    "& .MuiCard-root": {
                      minWidth: `${zoomTokens.tile.minWidth}px`,
                      maxWidth: `${zoomTokens.tile.maxWidth}px`,
                    },
                    "& .MuiCardContent-root": {
                      padding: `${zoomTokens.tile.padding}px !important`,
                    },
                    "& .MuiTypography-subtitle2": {
                      fontSize: zoomTokens.font.name,
                    },
                    "& .MuiTypography-body2": {
                      fontSize: `${zoomTokens.font.titleLevel} !important`,
                    },
                    "& [data-testid^='flag-badge']": {
                      width: `${zoomTokens.icon.flag}px !important`,
                      height: `${zoomTokens.icon.flag}px !important`,
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: `${zoomTokens.icon.dragHandle}px !important`,
                    },
                  }}
                >
                  <EmployeeTile
                    employee={{
                      ...baseEmployee,
                      flags: ["high-potential", "promotion-ready"],
                      modified_in_session: true,
                    }}
                    onSelect={fn()}
                    donutModeActive={false}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </DndContext>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

/**
 * Zoom Level: Density Test
 *
 * Shows multiple tiles at different zoom levels to test information density.
 * Helps understand how many tiles fit in a given space at each level.
 */
export const ZoomLevels_DensityTest: Story = {
  name: "🔍 Zoom Levels: Density Test",
  render: (args) => {
    // @ts-expect-error - zoomLevel is a custom arg
    const zoomLevel = args.zoomLevel ?? 2;
    const zoomTokens = getZoomTokens(zoomLevel);

    // Create sample employees
    const employees: Employee[] = [
      {
        ...baseEmployee,
        employee_id: 1,
        name: "Alice Johnson",
        grid_position: 9,
      },
      {
        ...baseEmployee,
        employee_id: 2,
        name: "Bob Smith",
        grid_position: 8,
        modified_in_session: true,
      },
      {
        ...baseEmployee,
        employee_id: 3,
        name: "Carol White",
        grid_position: 7,
        flags: ["high-potential"],
      },
      {
        ...baseEmployee,
        employee_id: 4,
        name: "David Brown",
        grid_position: 6,
        flags: ["promotion-ready", "key-talent"],
      },
      { ...baseEmployee, employee_id: 5, name: "Eve Davis", grid_position: 5 },
      {
        ...baseEmployee,
        employee_id: 6,
        name: "Frank Wilson",
        grid_position: 4,
        modified_in_session: true,
      },
    ];

    return (
      <DndContext>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
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
            }}
          >
            <div>
              <strong>Zoom Level {zoomLevel}</strong> - Testing information
              density with 6 tiles
            </div>
            <div>Gap between tiles: {zoomTokens.spacing.gap}px</div>
          </Box>

          {/* Tiles in responsive grid with Zoom Applied */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(${zoomTokens.tile.minWidth}px, ${zoomTokens.tile.maxWidth}px))`,
              gap: `${zoomTokens.spacing.gap}px`,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
              "& .MuiCard-root": {
                minWidth: `${zoomTokens.tile.minWidth}px`,
                maxWidth: `${zoomTokens.tile.maxWidth}px`,
              },
              "& .MuiCardContent-root": {
                padding: `${zoomTokens.tile.padding}px !important`,
              },
              "& .MuiTypography-subtitle2": {
                fontSize: zoomTokens.font.name,
              },
              "& .MuiTypography-body2": {
                fontSize: `${zoomTokens.font.titleLevel} !important`,
              },
              "& [data-testid^='flag-badge']": {
                width: `${zoomTokens.icon.flag}px !important`,
                height: `${zoomTokens.icon.flag}px !important`,
              },
              "& .MuiSvgIcon-root": {
                fontSize: `${zoomTokens.icon.dragHandle}px !important`,
              },
            }}
          >
            {employees.map((employee) => (
              <EmployeeTile
                key={employee.employee_id}
                employee={employee}
                onSelect={fn()}
                donutModeActive={false}
              />
            ))}
          </Box>
        </Box>
      </DndContext>
    );
  },
  args: {
    zoomLevel: 2,
  },
  argTypes: {
    zoomLevel: {
      control: {
        type: "select",
        labels: {
          0: "Level 0: Compact (60%)",
          1: "Level 1: Comfortable- (80%)",
          2: "Level 2: Normal (100%)",
          3: "Level 3: Comfortable+ (125%)",
          4: "Level 4: Presentation (150%)",
        },
      },
      options: [0, 1, 2, 3, 4],
      description: "Grid zoom level to test",
    },
  },
  parameters: {
    layout: "fullscreen",
  },
};
