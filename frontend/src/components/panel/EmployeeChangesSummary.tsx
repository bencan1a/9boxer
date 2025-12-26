/**
 * Employee Changes Summary - displays filtered changes for a specific employee
 */

import React from "react";
import { Box, Typography, Paper, Stack } from "@mui/material";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "../../store/sessionStore";
import { TrackableEvent } from "../../types/events";
import { EventDisplay } from "../events/EventDisplay";
import { logger } from "../../utils/logger";

interface EmployeeChangesSummaryProps {
  employeeId: number;
}

export const EmployeeChangesSummary: React.FC<EmployeeChangesSummaryProps> = ({
  employeeId,
}) => {
  const { t } = useTranslation();
  const events = useSessionStore((state) => state.events);
  const donutEvents = useSessionStore((state) => state.donutEvents);
  const updateChangeNotes = useSessionStore((state) => state.updateChangeNotes);
  const updateDonutChangeNotes = useSessionStore(
    (state) => state.updateDonutChangeNotes
  );

  // Filter events for this employee
  const employeeEvents =
    events?.filter((event) => event.employee_id === employeeId) || [];
  const employeeDonutEvents =
    donutEvents?.filter((event) => event.employee_id === employeeId) || [];

  // Combine and sort by timestamp (most recent first)
  const allEvents: Array<TrackableEvent & { isDonut?: boolean }> = [
    ...employeeEvents.map((e) => ({ ...e, isDonut: false })),
    ...employeeDonutEvents.map((e) => ({ ...e, isDonut: true })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleNotesChange = (eventId: string, notes: string) => {
    // Find the event to determine if it's a donut event
    const isDonut = employeeDonutEvents.some((e) => e.event_id === eventId);
    const updateFn = isDonut ? updateDonutChangeNotes : updateChangeNotes;

    // Fire and forget - don't block UI while saving
    updateFn(employeeId, notes).catch((error) => {
      logger.error("Failed to save notes", error);
    });
  };

  // Empty state
  if (allEvents.length === 0) {
    return (
      <Box
        sx={{
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
        data-testid="employee-changes-empty"
      >
        <TrendingFlatIcon sx={{ fontSize: 20, color: "text.disabled" }} />
        <Typography variant="body2" color="text.secondary">
          {t("panel.changesSummary.noChanges")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box data-testid="employee-changes-summary">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: "block" }}
      >
        {t("panel.changesSummary.recentChanges")} ({allEvents.length})
      </Typography>
      <Stack spacing={1.5}>
        {allEvents.map((event, index) => (
          <Paper
            key={event.event_id}
            variant="outlined"
            sx={{ p: 2 }}
            data-testid={`change-row-${index}`}
          >
            <EventDisplay
              event={event}
              showNotes={true}
              onNotesChange={handleNotesChange}
              notesTestId={`change-notes-${index}`}
            />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};
