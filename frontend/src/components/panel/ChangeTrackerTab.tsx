/**
 * Change Tracker tab - displays movement history with notes
 */

import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { useSessionStore } from "../../store/sessionStore";
import { getPositionName, getShortPositionLabel } from "../../constants/positionLabels";

export const ChangeTrackerTab: React.FC = () => {
  const changes = useSessionStore((state) => state.changes);
  const updateChangeNotes = useSessionStore((state) => state.updateChangeNotes);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState<string>("");

  // Sort changes by most recent first
  const sortedChanges = [...changes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleNotesFocus = (employeeId: number, currentNotes: string | null | undefined) => {
    setEditingId(employeeId);
    setNotesValue(currentNotes || "");
  };

  const handleNotesBlur = (employeeId: number) => {
    setEditingId(null);
    // Fire and forget - don't block UI while saving
    updateChangeNotes(employeeId, notesValue).catch((error) => {
      console.error("Failed to save notes:", error);
    });
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotesValue(event.target.value);
  };

  if (changes.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
        data-testid="change-tracker-empty"
      >
        <TrendingFlatIcon sx={{ fontSize: 64, color: "text.disabled" }} />
        <Typography variant="h6" color="text.secondary">
          No changes yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Move employees to track changes here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto" }} data-testid="change-tracker-view">
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Change Tracker
      </Typography>
      <Paper variant="outlined">
        <Table size="small" data-testid="change-tracker-table">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Movement</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedChanges.map((change) => (
              <TableRow
                key={`${change.employee_id}-${change.timestamp}`}
                hover
                data-testid={`change-row-${change.employee_id}`}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {change.employee_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`${getPositionName(change.old_position)} ${getShortPositionLabel(change.old_position)}`}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                    <TrendingFlatIcon fontSize="small" color="action" />
                    <Chip
                      label={`${getPositionName(change.new_position)} ${getShortPositionLabel(change.new_position)}`}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                </TableCell>
                <TableCell sx={{ minWidth: 200 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add notes..."
                    value={editingId === change.employee_id ? notesValue : (change.notes || "")}
                    onFocus={() => handleNotesFocus(change.employee_id, change.notes)}
                    onChange={handleNotesChange}
                    onBlur={() => handleNotesBlur(change.employee_id)}
                    multiline
                    maxRows={3}
                    data-testid={`change-notes-${change.employee_id}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
