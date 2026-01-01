/**
 * EventDisplay component - Polymorphic renderer for TrackableEvent types
 *
 * This component renders any TrackableEvent (GridMove, DonutMove, FlagAdd, FlagRemove)
 * with appropriate styling and layout. It supports notes editing and timestamp display.
 */

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DonutSmallIcon from "@mui/icons-material/DonutSmall";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  TrackableEvent,
  isGridMoveEvent,
  isDonutMoveEvent,
  isFlagAddEvent,
  isFlagRemoveEvent,
} from "../../types/events";
import {
  getPositionName,
  getShortPositionLabel,
} from "../../constants/positionLabels";
import { getFlagDisplayName } from "../../constants/flags";

interface EventDisplayProps {
  event: TrackableEvent;
  showNotes?: boolean;
  onNotesChange?: (eventId: string, notes: string) => void;
  notesTestId?: string;
}

export const EventDisplay: React.FC<EventDisplayProps> = ({
  event,
  showNotes = false,
  onNotesChange,
  notesTestId,
}) => {
  const [notesValue, setNotesValue] = React.useState(event.notes || "");

  const handleNotesBlur = () => {
    if (onNotesChange && notesValue !== event.notes) {
      onNotesChange(event.event_id, notesValue);
    }
  };

  return (
    <Box>
      {/* Event Type Rendering - All inline with clock icon */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          {isGridMoveEvent(event) && (
            <>
              <Typography variant="body2" fontWeight="medium">
                Grid Movement
              </Typography>
              <Chip
                label={`${getPositionName(event.old_position)} ${getShortPositionLabel(event.old_position)}`}
                size="small"
                variant="outlined"
              />
              <TrendingFlatIcon fontSize="small" />
              <Chip
                label={`${getPositionName(event.new_position)} ${getShortPositionLabel(event.new_position)}`}
                size="small"
                color="primary"
              />
            </>
          )}

          {isDonutMoveEvent(event) && (
            <>
              <DonutSmallIcon fontSize="small" color="secondary" />
              <Typography variant="body2" fontWeight="medium">
                Donut Movement
              </Typography>
              <Chip
                label={`${getPositionName(event.old_position)} ${getShortPositionLabel(event.old_position)}`}
                size="small"
                variant="outlined"
              />
              <TrendingFlatIcon fontSize="small" />
              <Chip
                label={`${getPositionName(event.new_position)} ${getShortPositionLabel(event.new_position)}`}
                size="small"
                color="secondary"
              />
            </>
          )}

          {isFlagAddEvent(event) && (
            <>
              <AddIcon fontSize="small" sx={{ color: "success.main" }} />
              <Typography variant="body2" fontWeight="medium">
                Flag Added
              </Typography>
              <Chip
                label={getFlagDisplayName(event.flag)}
                size="small"
                color="success"
              />
            </>
          )}

          {isFlagRemoveEvent(event) && (
            <>
              <RemoveIcon fontSize="small" sx={{ color: "warning.main" }} />
              <Typography variant="body2" fontWeight="medium">
                Flag Removed
              </Typography>
              <Chip
                label={getFlagDisplayName(event.flag)}
                size="small"
                color="warning"
              />
            </>
          )}
        </Stack>

        {/* Timestamp Icon with Tooltip */}
        <Tooltip title={new Date(event.timestamp).toLocaleString()} arrow>
          <IconButton size="small" sx={{ p: 0.5 }}>
            <AccessTimeIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Notes */}
      {showNotes && (
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add note..."
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={handleNotesBlur}
            multiline
            maxRows={3}
            inputProps={{
              "data-testid": notesTestId,
            }}
          />
        </Box>
      )}
    </Box>
  );
};
