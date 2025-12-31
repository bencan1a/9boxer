/**
 * Storybook stories for Panel Toggle Button design variations
 *
 * This story showcases 5 different design options for the panel expand/collapse button
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

/**
 * Demo container that simulates the panel layout
 */
const PanelToggleDemo = ({
  variant,
}: {
  variant: "option1" | "option2" | "option3" | "option4" | "option5";
}) => {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(3); // Start on Intelligence tab
  const panelWidth = isCollapsed ? 0 : 400;

  const togglePanel = () => setIsCollapsed(!isCollapsed);

  // Render toggle button based on variant
  const renderToggleButton = () => {
    switch (variant) {
      case "option1":
        // Left Edge Arrow (Current Implementation)
        return (
          <Tooltip
            title={isCollapsed ? "Show Panel" : "Hide Panel"}
            placement="left"
          >
            <IconButton
              onClick={togglePanel}
              data-testid="panel-toggle-button"
              sx={{
                position: "absolute",
                right: isCollapsed ? 16 : `${panelWidth + 4}px`,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 32,
                height: 48,
                borderRadius: isCollapsed
                  ? `${theme.tokens.radius.md}px`
                  : `${theme.tokens.radius.md}px 0 0 ${theme.tokens.radius.md}px`,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: 2,
                transition: `all ${theme.tokens.duration.normal}`,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {isCollapsed ? (
                <ChevronLeftIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        );

      case "option2":
        // Circular Floating Button (Bottom Right, Not Overlapping Tabs)
        return (
          <Tooltip
            title={isCollapsed ? "Show Panel" : "Hide Panel"}
            placement="left"
          >
            <IconButton
              onClick={togglePanel}
              data-testid="panel-toggle-button"
              sx={{
                position: "absolute",
                right: isCollapsed ? 16 : `${panelWidth + 16}px`,
                bottom: 24,
                zIndex: 10,
                width: 56,
                height: 56,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                boxShadow: 4,
                transition: `all ${theme.tokens.duration.normal}`,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 6,
                },
              }}
            >
              {isCollapsed ? (
                <KeyboardDoubleArrowLeftIcon />
              ) : (
                <KeyboardDoubleArrowRightIcon />
              )}
            </IconButton>
          </Tooltip>
        );

      case "option3":
        // Minimal Edge Tab (Vertical Tab on Panel Edge)
        return (
          <Tooltip
            title={isCollapsed ? "Show Panel" : "Hide Panel"}
            placement="left"
          >
            <Box
              onClick={togglePanel}
              data-testid="panel-toggle-button"
              sx={{
                position: "absolute",
                right: isCollapsed ? 0 : `${panelWidth}px`,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 24,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderRadius: `${theme.tokens.radius.md}px 0 0 ${theme.tokens.radius.md}px`,
                cursor: "pointer",
                boxShadow: 2,
                transition: `all ${theme.tokens.duration.normal}`,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                  width: 28,
                },
              }}
            >
              {isCollapsed ? (
                <ChevronLeftIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </Box>
          </Tooltip>
        );

      case "option4":
        // Icon-Enhanced Resize Handle
        return (
          <Tooltip
            title={isCollapsed ? "Show Panel" : "Hide Panel"}
            placement="left"
          >
            <Box
              onClick={togglePanel}
              data-testid="panel-toggle-button"
              sx={{
                position: "absolute",
                right: isCollapsed ? 16 : `${panelWidth + 8}px`,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 8,
                height: 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                backgroundColor: theme.palette.divider,
                borderRadius: `${theme.tokens.radius.sm}px`,
                cursor: "col-resize",
                transition: `all ${theme.tokens.duration.normal}`,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                  width: 12,
                  "& .toggle-icon": {
                    opacity: 1,
                  },
                },
              }}
            >
              {/* Grip dots */}
              <Box
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.background.paper,
                }}
              />
              <Box
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.background.paper,
                }}
              />
              <Box
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.background.paper,
                }}
              />
              {/* Icon appears on hover */}
              <Box
                className="toggle-icon"
                sx={{
                  position: "absolute",
                  opacity: 0,
                  transition: `opacity ${theme.tokens.duration.fast}`,
                  color: theme.palette.background.paper,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                {isCollapsed ? (
                  <UnfoldMoreIcon fontSize="inherit" />
                ) : (
                  <UnfoldLessIcon fontSize="inherit" />
                )}
              </Box>
            </Box>
          </Tooltip>
        );

      case "option5":
        // Integrated Into Tab Bar (Extra Tab-Like Button)
        return null; // This one is rendered differently, inside the panel
    }
  };

  return (
    <Box
      sx={{
        width: 800,
        height: 500,
        position: "relative",
        backgroundColor: theme.palette.background.default,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${theme.tokens.radius.md}px`,
      }}
    >
      {/* Main Content Area */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          right: isCollapsed ? 0 : `${panelWidth}px`,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.palette.background.paper,
          transition: `all ${theme.tokens.duration.normal}`,
        }}
      >
        <Box sx={{ textAlign: "center", color: theme.palette.text.secondary }}>
          <Box sx={{ fontSize: 48, mb: 2 }}>📊</Box>
          <Box>Main Grid Area</Box>
        </Box>
      </Box>

      {/* Right Panel */}
      <Box
        sx={{
          position: "absolute",
          right: 0,
          top: 0,
          width: isCollapsed ? 0 : `${panelWidth}px`,
          height: "100%",
          overflow: "hidden",
          transition: `all ${theme.tokens.duration.normal}`,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
            opacity: isCollapsed ? 0 : 1,
            transition: `opacity ${theme.tokens.duration.normal}`,
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: theme.palette.divider,
              position: "relative",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": {
                  color: theme.palette.text.secondary,
                  minHeight: 48,
                  fontSize: "0.75rem",
                },
                "& .Mui-selected": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              <Tab label="DETAILS" />
              <Tab label="CHANGES" />
              <Tab label="STATISTICS" />
              <Tab label="INTELLIGENCE" />
              {variant === "option5" && (
                <Tab
                  icon={
                    isCollapsed ? (
                      <ChevronLeftIcon fontSize="small" />
                    ) : (
                      <ChevronRightIcon fontSize="small" />
                    )
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePanel();
                  }}
                  sx={{
                    minWidth: 48,
                    maxWidth: 48,
                    p: 0,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                />
              )}
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
            <Box
              sx={{
                color: theme.palette.text.secondary,
                textAlign: "center",
                mt: 4,
              }}
            >
              Tab content appears here
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Render toggle button (except for option5 which is integrated) */}
      {variant !== "option5" && renderToggleButton()}
    </Box>
  );
};

const meta = {
  title: "Dashboard/Panel Toggle Options",
  component: PanelToggleDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Explore 5 different design options for the panel expand/collapse toggle button.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PanelToggleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Option 1: Left Edge Arrow (Current Implementation)**
 *
 * - Vertically centered on the left edge of the panel
 * - Rectangular shape (32×48px) that blends with panel
 * - Border radius adapts: fully rounded when collapsed, left-rounded when expanded
 * - Subtle border with hover highlight
 * - Smooth position transitions
 *
 * **Pros:** Clear affordance, doesn't overlap content, visually tied to panel
 * **Cons:** May be less discoverable for first-time users
 */
export const Option1_LeftEdgeArrow: Story = {
  args: {
    variant: "option1",
  },
};

/**
 * **Option 2: Circular Floating Button (Bottom Right)**
 *
 * - Large circular FAB-style button (56×56px)
 * - Primary color for high visibility
 * - Positioned at bottom right, clear of tabs
 * - Double arrow icons for emphasis
 * - Material Design elevation shadow
 *
 * **Pros:** Highly visible, familiar pattern (FAB), clear action
 * **Cons:** Takes up more visual space, may feel disconnected from panel
 */
export const Option2_CircularFloatingButton: Story = {
  args: {
    variant: "option2",
  },
};

/**
 * **Option 3: Minimal Edge Tab**
 *
 * - Slim vertical tab (24×80px) on panel left edge
 * - Primary color for visibility
 * - Expands slightly on hover (24→28px)
 * - Minimal visual footprint
 * - Clear directional arrow
 *
 * **Pros:** Clean, minimal, visually tied to panel, doesn't overlap
 * **Cons:** Smaller click target, may be less discoverable
 */
export const Option3_MinimalEdgeTab: Story = {
  args: {
    variant: "option3",
  },
};

/**
 * **Option 4: Icon-Enhanced Resize Handle**
 *
 * - Slim vertical handle (8×120px) with grip dots
 * - Dual purpose: resize handle + toggle button
 * - Icon appears on hover
 * - Expands on hover (8→12px)
 * - Subtle, unobtrusive design
 *
 * **Pros:** Space-efficient, dual functionality, clean aesthetic
 * **Cons:** Less discoverable, icon only visible on hover, may confuse resize vs toggle
 */
export const Option4_ResizeHandleWithIcon: Story = {
  args: {
    variant: "option4",
  },
};

/**
 * **Option 5: Integrated Into Tab Bar**
 *
 * - Extra button integrated as rightmost "tab"
 * - Same height as tabs (48px)
 * - Minimal width (48px), bordered separation
 * - Arrow icon that flips direction
 * - Familiar tab-like interaction
 *
 * **Pros:** Highly discoverable, integrated design, no additional UI elements
 * **Cons:** May be confused with a tab, adds visual weight to tab bar
 */
export const Option5_IntegratedTabButton: Story = {
  args: {
    variant: "option5",
  },
};
