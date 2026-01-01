/**
 * Employee flags component for tagging and categorizing employees
 *
 * Shows color-coded flag chips with add/remove functionality for
 * tracking employee attributes and special considerations.
 *
 * @component
 * @screenshots
 *   - details-flags-ui: Flags section with Add Flag picker and colored flag chips
 */

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { Employee } from "../../types/employee";
import { useSessionStore } from "../../store/sessionStore";
import {
  getAllFlags,
  getFlagDisplayName,
  getFlagColor,
} from "../../constants/flags";

interface EmployeeFlagsProps {
  employee: Employee;
}

export const EmployeeFlags: React.FC<EmployeeFlagsProps> = ({ employee }) => {
  const { t } = useTranslation();
  const updateEmployee = useSessionStore((state) => state.updateEmployee);
  const [inputValue, setInputValue] = useState("");

  // Get current flags (default to empty array)
  const currentFlags = employee.flags || [];

  // Get available flags (flags not already set)
  const allFlags = getAllFlags();
  const availableFlags = allFlags.filter(
    (flag) => !currentFlags.includes(flag.key)
  );

  const handleAddFlag = async (
    _event: React.SyntheticEvent,
    flagKey: string | null
  ) => {
    if (!flagKey) return;

    // Add flag to employee
    const updatedFlags = [...currentFlags, flagKey];
    await updateEmployee(employee.employee_id, {
      flags: updatedFlags,
    });

    // Clear input
    setInputValue("");
  };

  const handleRemoveFlag = async (flagKey: string) => {
    // Remove flag from employee
    const updatedFlags = currentFlags.filter((f) => f !== flagKey);
    await updateEmployee(employee.employee_id, {
      flags: updatedFlags,
    });
  };

  return (
    <Box>
      {/* Display set flags */}
      {currentFlags.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {currentFlags.map((flagKey) => (
            <Chip
              key={flagKey}
              label={getFlagDisplayName(flagKey)}
              onDelete={() => handleRemoveFlag(flagKey)}
              sx={{
                backgroundColor: getFlagColor(flagKey),
                color: "white",
                fontWeight: "medium",
                "& .MuiChip-deleteIcon": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    color: "white",
                  },
                },
              }}
              data-testid={`flag-chip-${flagKey}`}
            />
          ))}
        </Box>
      )}

      {/* Add flag picker */}
      {availableFlags.length > 0 && (
        <Autocomplete
          options={availableFlags.map((flag) => flag.key)}
          getOptionLabel={(option) => getFlagDisplayName(option)}
          onChange={handleAddFlag}
          value={null}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder={t("panel.detailsTab.addFlag")}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <AddIcon sx={{ mr: 0.5, color: "action.active" }} />
                ),
              }}
              data-testid="flag-picker"
            />
          )}
          renderOption={(props, option) => (
            <li {...props} data-testid={`flag-option-${option}`}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: getFlagColor(option),
                  }}
                />
                <Typography variant="body2">
                  {getFlagDisplayName(option)}
                </Typography>
              </Box>
            </li>
          )}
          sx={{ maxWidth: 300 }}
        />
      )}

      {/* Empty state (all flags used) */}
      {availableFlags.length === 0 && currentFlags.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {t("panel.detailsTab.noFlagsAvailable")}
        </Typography>
      )}
    </Box>
  );
};
