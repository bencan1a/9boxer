/**
 * ViewModeToggle component
 *
 * A compact toggle button group for switching between Grid and Donut visualization modes.
 * Supports keyboard shortcut (D) for quick toggling.
 */

import React, { useEffect } from "react";
import {
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import { useSessionStore } from "../../store/sessionStore";

export const ViewModeToggle: React.FC = () => {
  const { sessionId, donutModeActive, toggleDonutMode } = useSessionStore();

  const handleViewModeChange = async (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'grid' | 'donut' | null
  ) => {
    // Prevent deselecting both buttons (null value)
    if (newMode === null) return;

    // Toggle donut mode based on selection
    const shouldEnableDonut = newMode === 'donut';
    if (shouldEnableDonut !== donutModeActive) {
      try {
        await toggleDonutMode(shouldEnableDonut);
      } catch (error) {
        // Error handling is managed by the store and AppBar
        console.error('Failed to toggle view mode:', error);
      }
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only toggle if:
      // 1. A session exists (file is loaded)
      // 2. The 'D' key is pressed (case insensitive)
      // 3. No modifier keys are pressed (Ctrl, Alt, Shift, Meta)
      // 4. Not typing in an input field
      if (
        sessionId &&
        event.key.toLowerCase() === 'd' &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.metaKey
      ) {
        // Check if focus is on an input element
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement?.getAttribute('contenteditable') === 'true';

        if (!isInputFocused) {
          event.preventDefault();
          toggleDonutMode(!donutModeActive);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [sessionId, donutModeActive, toggleDonutMode]);

  // Determine current view mode
  const currentMode: 'grid' | 'donut' = donutModeActive ? 'donut' : 'grid';

  return (
    <Tooltip
      title="Toggle between Grid and Donut visualization (D)"
      placement="top"
    >
      <span>
        <ToggleButtonGroup
          value={currentMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          disabled={!sessionId}
          data-testid="view-mode-toggle"
          aria-label="View mode toggle"
          sx={{
            '& .MuiToggleButton-root': {
              '&.Mui-selected': {
                backgroundColor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
              },
            },
          }}
        >
          <ToggleButton
            value="grid"
            aria-label="Grid view"
            aria-pressed={!donutModeActive}
            data-testid="grid-view-button"
          >
            <GridViewIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="donut"
            aria-label="Donut view"
            aria-pressed={donutModeActive}
            data-testid="donut-view-button"
          >
            <DonutLargeIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </span>
    </Tooltip>
  );
};
