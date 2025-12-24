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
  Tabs,
  Tab,
} from "@mui/material";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import DonutSmallIcon from "@mui/icons-material/DonutSmall";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "../../store/sessionStore";
import { getPositionName, getShortPositionLabel } from "../../constants/positionLabels";
import { logger } from "../../utils/logger";

export const ChangeTrackerTab: React.FC = () => {
  const { t } = useTranslation();
  const changes = useSessionStore((state) => state.changes);
  const donutChanges = useSessionStore((state) => state.donutChanges);
  const donutModeActive = useSessionStore((state) => state.donutModeActive);
  const updateChangeNotes = useSessionStore((state) => state.updateChangeNotes);
  const updateDonutChangeNotes = useSessionStore((state) => state.updateDonutChangeNotes);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);

  // Sort changes by most recent first
  const sortedChanges = [...changes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Sort donut changes by most recent first
  const sortedDonutChanges = [...donutChanges].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleNotesFocus = (employeeId: number, currentNotes: string | null | undefined) => {
    setEditingId(employeeId);
    setNotesValue(currentNotes || "");
  };

  const handleNotesBlur = (employeeId: number, isDonut: boolean) => {
    setEditingId(null);
    // Fire and forget - don't block UI while saving
    const updateFn = isDonut ? updateDonutChangeNotes : updateChangeNotes;
    updateFn(employeeId, notesValue).catch((error) => {
      logger.error('Failed to save notes', error);
    });
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotesValue(event.target.value);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Render a table for changes (regular or donut)
  const renderChangesTable = (changesList: typeof changes, isDonut: boolean, testIdPrefix: string) => {
    if (changesList.length === 0) {
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
            {isDonut ? t('panel.changeTrackerTab.noDonutChanges') : t('panel.changeTrackerTab.noChanges')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isDonut ? t('panel.changeTrackerTab.moveEmployeesDonutHint') : t('panel.changeTrackerTab.moveEmployeesHint')}
          </Typography>
        </Box>
      );
    }

    return (
      <Table size="small" data-testid={`${testIdPrefix}-table`}>
        <TableHead>
          <TableRow>
            <TableCell>{t('panel.changeTrackerTab.employee')}</TableCell>
            <TableCell>Movement</TableCell>
            <TableCell>{t('panel.changeTrackerTab.notes')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {changesList.map((change) => (
            <TableRow
              key={`${change.employee_id}-${change.timestamp}`}
              hover
              data-testid={`${testIdPrefix}-row-${change.employee_id}`}
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
                    color={isDonut ? "secondary" : "primary"}
                  />
                </Stack>
              </TableCell>
              <TableCell sx={{ minWidth: 200 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('panel.changeTrackerTab.addNotesPlaceholder')}
                  value={editingId === change.employee_id ? notesValue : (change.notes || "")}
                  onFocus={() => handleNotesFocus(change.employee_id, change.notes)}
                  onChange={handleNotesChange}
                  onBlur={() => handleNotesBlur(change.employee_id, isDonut)}
                  multiline
                  maxRows={3}
                  data-testid={`${testIdPrefix}-notes-${change.employee_id}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Show empty state only when both lists are empty
  if (changes.length === 0 && donutChanges.length === 0) {
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
          {t('panel.changeTrackerTab.noChanges')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('panel.changeTrackerTab.moveEmployeesHint')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }} data-testid="change-tracker-view">
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Change Tracker
      </Typography>

      {/* Show tabs when donut mode is active or donut changes exist */}
      {(donutModeActive || donutChanges.length > 0) ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tab
              label={`${t('panel.changeTrackerTab.gridChanges')} (${changes.length})`}
              data-testid="regular-changes-tab"
            />
            <Tab
              label={`${t('panel.changeTrackerTab.donutChanges')} (${donutChanges.length})`}
              data-testid="donut-changes-tab"
              icon={<DonutSmallIcon fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>
          <Box sx={{ flex: 1, overflow: "auto", mt: 2 }}>
            <Paper variant="outlined">
              {activeTab === 0 && renderChangesTable(sortedChanges, false, "change")}
              {activeTab === 1 && renderChangesTable(sortedDonutChanges, true, "donut-change")}
            </Paper>
          </Box>
        </Box>
      ) : (
        /* Show only regular changes when donut mode is not active */
        <Box sx={{ overflow: "auto" }}>
          <Paper variant="outlined">
            {renderChangesTable(sortedChanges, false, "change")}
          </Paper>
        </Box>
      )}
    </Box>
  );
};
