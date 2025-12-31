import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import {
  Box,
  ButtonGroup,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GridViewIcon from "@mui/icons-material/GridView";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { useSessionStore } from "../../store/sessionStore";

/**
 * ViewControlsMock: A simplified version of ViewControls for Storybook
 * that accepts zoom props instead of reading from zoomService.
 *
 * This allows us to demonstrate different zoom states without mocking ES modules.
 */
interface ViewControlsMockProps {
  donutMode: boolean;
  zoomPercentage: string;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isDefaultZoom: boolean;
  hasSession: boolean;
}

function ViewControlsMock({
  donutMode,
  zoomPercentage,
  canZoomIn,
  canZoomOut,
  isDefaultZoom,
  hasSession,
}: ViewControlsMockProps) {
  const theme = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [localDonutMode, setLocalDonutMode] = useState(donutMode);

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: string | null
  ) => {
    if (newMode !== null) {
      setLocalDonutMode(newMode === "donut");
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 0.5,
      }}
      data-testid="view-controls"
    >
      {/* View Mode Toggle */}
      <ToggleButtonGroup
        value={localDonutMode ? "donut" : "grid"}
        exclusive
        onChange={handleViewModeChange}
        disabled={!hasSession}
        size="small"
        data-testid="view-mode-toggle"
        sx={{
          "& .MuiToggleButton-root": {
            "&.Mui-selected": {
              backgroundColor: "secondary.main",
              color: "secondary.contrastText",
              "&:hover": {
                backgroundColor: "secondary.dark",
              },
            },
          },
        }}
      >
        <ToggleButton value="grid" data-testid="grid-mode-button">
          <GridViewIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="donut" data-testid="donut-mode-button">
          <DonutLargeIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Divider */}
      <Box sx={{ width: 1, height: 32, backgroundColor: "divider" }} />

      {/* Zoom Controls */}
      <ButtonGroup size="small" disabled={!hasSession}>
        <Tooltip title="Zoom Out">
          <span>
            <IconButton
              size="small"
              disabled={!hasSession || !canZoomOut}
              data-testid="zoom-out-button"
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Zoom In">
          <span>
            <IconButton
              size="small"
              disabled={!hasSession || !canZoomIn}
              data-testid="zoom-in-button"
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Reset Zoom">
          <span>
            <IconButton
              size="small"
              disabled={!hasSession || isDefaultZoom}
              data-testid="zoom-reset-button"
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </ButtonGroup>

      {/* Zoom Percentage Display */}
      <Typography
        variant="body2"
        sx={{
          minWidth: 45,
          textAlign: "center",
          color: hasSession ? "text.primary" : "text.disabled",
        }}
        data-testid="zoom-percentage"
      >
        {zoomPercentage}
      </Typography>

      {/* Divider */}
      <Box sx={{ width: 1, height: 32, backgroundColor: "divider" }} />

      {/* Fullscreen Toggle */}
      <Tooltip title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
        <span>
          <IconButton
            size="small"
            onClick={handleFullscreenToggle}
            disabled={!hasSession}
            data-testid="fullscreen-button"
          >
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

const meta: Meta<typeof ViewControlsMock> = {
  title: "Common/ViewControls",
  component: ViewControlsMock,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Floating toolbar providing view mode toggle (Grid/Donut), zoom controls, and fullscreen toggle. " +
          "Positioned absolutely at top-right of the application.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewControlsMock>;

/**
 * Helper to set up Zustand store state for stories
 */
function createMockDecorator(hasSession: boolean = true) {
  return (Story: React.ComponentType) => {
    useEffect(() => {
      useSessionStore.setState({
        sessionId: hasSession ? "mock-session-id" : undefined,
      });
    }, []);

    return <Story />;
  };
}

/**
 * Default state: Grid view active, 100% zoom
 */
export const GridViewActive: Story = {
  decorators: [createMockDecorator()],
  args: {
    donutMode: false,
    zoomPercentage: "100%",
    canZoomIn: true,
    canZoomOut: true,
    isDefaultZoom: true,
    hasSession: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default view with Grid mode active (toggle on left side) and standard 100% zoom level.",
      },
    },
  },
};

/**
 * Donut view active: Shows toggle in donut mode state
 */
export const DonutViewActive: Story = {
  decorators: [createMockDecorator()],
  args: {
    donutMode: true,
    zoomPercentage: "100%",
    canZoomIn: true,
    canZoomOut: true,
    isDefaultZoom: true,
    hasSession: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Donut mode active, showing the view mode toggle switched to the right position.",
      },
    },
  },
};

/**
 * Zoomed in to 150%: Shows zoom controls with increased zoom level
 */
export const ZoomedIn: Story = {
  decorators: [createMockDecorator()],
  args: {
    donutMode: false,
    zoomPercentage: "150%",
    canZoomIn: true,
    canZoomOut: true,
    isDefaultZoom: false,
    hasSession: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Grid view with zoom level at 150%, showing zoom percentage display between controls.",
      },
    },
  },
};

/**
 * Zoomed in to maximum (200%): Zoom in button should be disabled
 */
export const ZoomedInMax: Story = {
  decorators: [createMockDecorator()],
  args: {
    donutMode: false,
    zoomPercentage: "200%",
    canZoomIn: false,
    canZoomOut: true,
    isDefaultZoom: false,
    hasSession: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Maximum zoom level (200%) - zoom in button is disabled, only zoom out and reset available.",
      },
    },
  },
};

/**
 * Zoomed out to minimum (50%): Zoom out button should be disabled
 */
export const ZoomedOutMin: Story = {
  decorators: [createMockDecorator()],
  args: {
    donutMode: false,
    zoomPercentage: "50%",
    canZoomIn: true,
    canZoomOut: false,
    isDefaultZoom: false,
    hasSession: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Minimum zoom level (50%) - zoom out button is disabled, only zoom in and reset available.",
      },
    },
  },
};

/**
 * Disabled state: No active session
 */
export const Disabled: Story = {
  decorators: [createMockDecorator(false)],
  args: {
    donutMode: false,
    zoomPercentage: "100%",
    canZoomIn: true,
    canZoomOut: true,
    isDefaultZoom: true,
    hasSession: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "All controls disabled when no active session (no file loaded). Shows visual disabled state.",
      },
    },
  },
};

/**
 * Donut mode with custom zoom: Combines donut view with non-standard zoom
 */
export const DonutModeZoomed: Story = {
  decorators: [createMockDecorator()],
  args: {
    donutMode: true,
    zoomPercentage: "125%",
    canZoomIn: true,
    canZoomOut: true,
    isDefaultZoom: false,
    hasSession: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Donut mode active with 125% zoom level, demonstrating that zoom controls work in both view modes.",
      },
    },
  },
};
