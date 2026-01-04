/**
 * Modal dialog for employee exclusion with quick filters
 */

import React, { useState, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ButtonGroup from "@mui/material/ButtonGroup";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useSession } from "../../hooks/useSession";
import { useFilters } from "../../hooks/useFilters";
import { useEmployeeSearch } from "../../hooks/useEmployeeSearch";
import { SearchHighlight } from "../common/SearchHighlight";
import { useDebounced } from "../../hooks/useDebounced";

interface ExclusionDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ExclusionDialog: React.FC<ExclusionDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { employees } = useSession();
  const { excludedEmployeeIds, setExcludedIds } = useFilters();

  // Local state for selections (only applied on "Apply")
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize employee search with fuzzy matching
  // Note: Searches ALL employees (not filteredEmployees) because exclusion
  // is independent of current filter state - users should be able to exclude
  // anyone in the organization, not just currently visible employees
  const { search, isReady, error } = useEmployeeSearch({
    employees,
    threshold: 0.3,
    resultLimit: 100, // Higher limit for checkbox list (vs 10 for autocomplete)
  });

  // Initialize selected IDs when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedIds(excludedEmployeeIds);
      setSearchTerm("");
    }
  }, [open, excludedEmployeeIds]);

  // Debounce search input to prevent excessive search operations
  const debouncedSearchTerm = useDebounced(searchTerm, 300);

  // Filter employees by search term using fuzzy search
  const filteredEmployees = useMemo(() => {
    if (!debouncedSearchTerm || !isReady) return employees;

    // Use fuzzy search instead of basic string matching
    return search(debouncedSearchTerm);
  }, [employees, debouncedSearchTerm, search, isReady]);

  // Quick filter functions
  const excludeVPs = () => {
    const vpIds = employees
      .filter(
        (emp) =>
          emp.job_level.includes("MT6") ||
          emp.job_level.toLowerCase().includes("vp") ||
          emp.job_level.toLowerCase().includes("vice president")
      )
      .map((emp) => emp.employee_id);
    setSelectedIds(vpIds);
  };

  const excludeDirectorsPlus = () => {
    const directorPlusIds = employees
      .filter(
        (emp) =>
          emp.job_level.includes("MT5") ||
          emp.job_level.includes("MT6") ||
          emp.job_level.toLowerCase().includes("director") ||
          emp.job_level.toLowerCase().includes("vp") ||
          emp.job_level.toLowerCase().includes("vice president")
      )
      .map((emp) => emp.employee_id);
    setSelectedIds(directorPlusIds);
  };

  const excludeManagers = () => {
    const managerIds = employees
      .filter(
        (emp) =>
          emp.job_level.includes("MT2") ||
          emp.job_level.includes("MT4") ||
          emp.job_level.toLowerCase().includes("manager") ||
          emp.job_level.toLowerCase() === "mgr"
      )
      .map((emp) => emp.employee_id);
    setSelectedIds(managerIds);
  };

  const clearSelections = () => {
    setSelectedIds([]);
  };

  // Toggle individual employee
  const toggleEmployee = (employeeId: number) => {
    setSelectedIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Toggle all visible employees
  const toggleSelectAll = () => {
    const visibleIds = filteredEmployees.map((emp) => emp.employee_id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Deselect all visible
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      setSelectedIds((prev) => {
        const newIds = [...prev];
        visibleIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  // Check if all visible employees are selected
  const allVisibleSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => selectedIds.includes(emp.employee_id));

  // Handle apply
  const handleApply = () => {
    setExcludedIds(selectedIds);
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      data-testid="exclusion-dialog"
    >
      {/* Header */}
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("dashboard.exclusionDialog.title")}
          </Typography>
          <IconButton
            size="small"
            onClick={handleCancel}
            data-testid="exclusion-dialog-close-button"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Quick Filters */}
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {t("dashboard.exclusionDialog.quickFilters")}
        </Typography>
        <ButtonGroup
          variant="outlined"
          size="small"
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          <Button onClick={excludeVPs} data-testid="exclude-vps-button">
            {t("dashboard.exclusionDialog.excludeVPs")}
          </Button>
          <Button
            onClick={excludeDirectorsPlus}
            data-testid="exclude-directors-plus-button"
          >
            {t("dashboard.exclusionDialog.excludeDirectorsPlus")}
          </Button>
          <Button
            onClick={excludeManagers}
            data-testid="exclude-managers-button"
          >
            {t("dashboard.exclusionDialog.excludeManagers")}
          </Button>
          <Button
            onClick={clearSelections}
            color="secondary"
            data-testid="clear-selections-button"
          >
            {t("dashboard.exclusionDialog.clearAll")}
          </Button>
        </ButtonGroup>

        <Divider sx={{ mb: 2 }} />

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder={t("dashboard.exclusionDialog.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
          sx={{ mb: 2 }}
          data-testid="exclusion-search-field"
        />

        {/* Select All */}
        <FormControlLabel
          control={
            <Checkbox
              checked={allVisibleSelected}
              indeterminate={
                selectedIds.length > 0 &&
                !allVisibleSelected &&
                filteredEmployees.some((emp) =>
                  selectedIds.includes(emp.employee_id)
                )
              }
              onChange={toggleSelectAll}
              data-testid="exclusion-select-all-checkbox"
            />
          }
          label={
            <Typography variant="body2" fontWeight="bold">
              {t("dashboard.exclusionDialog.selectAll", {
                count: filteredEmployees.length,
              })}
            </Typography>
          }
        />

        <Divider sx={{ my: 1 }} />

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            data-testid="exclusion-search-error"
          >
            {t("filters.searchUnavailable", "Search unavailable")}:{" "}
            {error.message}
          </Alert>
        )}

        {/* Employee List */}
        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          <FormGroup>
            {filteredEmployees.map((emp) => (
              <FormControlLabel
                key={emp.employee_id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(emp.employee_id)}
                    onChange={() => toggleEmployee(emp.employee_id)}
                    size="small"
                    data-testid={`exclusion-checkbox-${emp.employee_id}`}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      <SearchHighlight text={emp.name} query={searchTerm} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <SearchHighlight
                        text={emp.job_level}
                        query={searchTerm}
                      />{" "}
                      •{" "}
                      <SearchHighlight text={emp.manager} query={searchTerm} />
                    </Typography>
                  </Box>
                }
                sx={{ mb: 1 }}
              />
            ))}
          </FormGroup>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ flexGrow: 1 }}
          data-testid="selected-count"
        >
          {t("dashboard.exclusionDialog.selectedCount", {
            count: selectedIds.length,
          })}
        </Typography>
        <Button onClick={handleCancel} data-testid="exclusion-cancel-button">
          {t("dashboard.exclusionDialog.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          data-testid="apply-exclusions-button"
        >
          {t("dashboard.exclusionDialog.applyExclusions")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
