/**
 * Change Tracker tab - displays movement history with notes
 *
 * Displays chronological list of all employee position changes with
 * visual movement indicators and optional notes.
 *
 * @component
 * @screenshots
 *   - changes-tab: Changes tab with employee movements
 *   - changes-panel-entries: Changes panel with multiple employee movement entries
 *   - notes-changes-tab-field: Changes tab with note field highlighted
 *   - notes-good-example: Changes tab with well-written note example
 */

import React, { useState } from "react";
import { Box, Typography, Paper, Stack, Tabs, Tab } from "@mui/material";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import DonutSmallIcon from "@mui/icons-material/DonutSmall";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "../../store/sessionStore";
import { TrackableEvent } from "../../types/events";
import { EventDisplay } from "../events/EventDisplay";
import { logger } from "../../utils/logger";

export const ChangeTrackerTab: React.FC = () => {
  const { t } = useTranslation();
  const events = useSessionStore((state) => state.events);
  const donutEvents = useSessionStore((state) => state.donutEvents);
  const donutModeActive = useSessionStore((state) => state.donutModeActive);
  const updateChangeNotes = useSessionStore((state) => state.updateChangeNotes);
  const updateDonutChangeNotes = useSessionStore(
    (state) => state.updateDonutChangeNotes
  );
  const [activeTab, setActiveTab] = useState<number>(0);

  // Sort events by most recent first
  const sortedEvents = [...(events || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Sort donut events by most recent first
  const sortedDonutEvents = [...(donutEvents || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleNotesChange = (
    eventId: string,
    notes: string,
    isDonut: boolean
  ) => {
    // Determine which update function to use based on event type
    const updateFn = isDonut ? updateDonutChangeNotes : updateChangeNotes;

    // Find the employee_id from the event
    const eventsList = isDonut ? donutEvents : events;
    const event = eventsList.find((e) => e.event_id === eventId);
    if (!event) return;

    // Fire and forget - don't block UI while saving
    updateFn(event.employee_id, notes).catch((error) => {
      logger.error("Failed to save notes", error);
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Render events list using EventDisplay component
  const renderEventsList = (
    eventsList: TrackableEvent[],
    isDonut: boolean,
    testIdPrefix: string
  ) => {
    if (eventsList.length === 0) {
      return (
        <Box
          sx={{
            py: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
          data-testid={`${testIdPrefix}-empty`}
        >
          {isDonut ? (
            <DonutSmallIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          ) : (
            <TrendingFlatIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          )}
          <Typography variant="body2" color="text.secondary">
            {isDonut
              ? t("panel.changeTrackerTab.noDonutChanges")
              : t("panel.changeTrackerTab.noChanges")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isDonut
              ? t("panel.changeTrackerTab.moveEmployeesDonutHint")
              : t("panel.changeTrackerTab.moveEmployeesHint")}
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={2} sx={{ p: 2 }} data-testid={`${testIdPrefix}-list`}>
        {eventsList.map((event) => (
          <Paper
            key={event.event_id}
            variant="outlined"
            sx={{ p: 2 }}
            data-testid={`${testIdPrefix}-row-${event.employee_id}`}
          >
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                {event.employee_name}
              </Typography>
            </Box>
            <EventDisplay
              event={event}
              showNotes={true}
              onNotesChange={(eventId, notes) =>
                handleNotesChange(eventId, notes, isDonut)
              }
              notesTestId={`${testIdPrefix}-notes-${event.employee_id}`}
            />
          </Paper>
        ))}
      </Stack>
    );
  };

  // Show empty state only when both lists are empty
  if (events.length === 0 && donutEvents.length === 0) {
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
          {t("panel.changeTrackerTab.noChanges")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("panel.changeTrackerTab.moveEmployeesHint")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      data-testid="change-tracker-view"
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Change Tracker
      </Typography>

      {/* Show tabs when donut mode is active or donut events exist */}
      {donutModeActive || donutEvents.length > 0 ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              label={`${t("panel.changeTrackerTab.gridChanges")} (${events.length})`}
              data-testid="regular-changes-tab"
            />
            <Tab
              label={`${t("panel.changeTrackerTab.donutChanges")} (${donutEvents.length})`}
              data-testid="donut-changes-tab"
              icon={<DonutSmallIcon fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>
          <Box sx={{ flex: 1, overflowX: "auto", overflowY: "auto", mt: 2 }}>
            {activeTab === 0 && renderEventsList(sortedEvents, false, "change")}
            {activeTab === 1 &&
              renderEventsList(sortedDonutEvents, true, "donut-change")}
          </Box>
        </Box>
      ) : (
        /* Show only regular events when donut mode is not active */
        <Box sx={{ overflowX: "auto", overflowY: "auto" }}>
          {renderEventsList(sortedEvents, false, "change")}
        </Box>
      )}
    </Box>
  );
};
