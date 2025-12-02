/**
 * Modal dialog for employee exclusion with quick filters
 */

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  IconButton,
  Divider,
  ButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useSession } from "../../hooks/useSession";
import { useFilters } from "../../hooks/useFilters";

interface ExclusionDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ExclusionDialog: React.FC<ExclusionDialogProps> = ({
  open,
  onClose,
}) => {
  const { employees } = useSession();
  const { excludedEmployeeIds, setExcludedIds } = useFilters();

  // Local state for selections (only applied on "Apply")
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize selected IDs when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedIds(excludedEmployeeIds);
      setSearchTerm("");
    }
  }, [open, excludedEmployeeIds]);

  // Filter employees by search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;

    const searchLower = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.business_title.toLowerCase().includes(searchLower) ||
        emp.job_level.toLowerCase().includes(searchLower)
    );
  }, [employees, searchTerm]);

  // Quick filter functions
  const excludeVPs = () => {
    const vpIds = employees
      .filter((emp) => emp.job_level.includes("MT6"))
      .map((emp) => emp.employee_id);
    setSelectedIds(vpIds);
  };

  const excludeDirectorsPlus = () => {
    const directorPlusIds = employees
      .filter(
        (emp) =>
          emp.job_level.includes("MT5") || emp.job_level.includes("MT6")
      )
      .map((emp) => emp.employee_id);
    setSelectedIds(directorPlusIds);
  };

  const excludeManagers = () => {
    const managerIds = employees
      .filter(
        (emp) =>
          emp.job_level.includes("MT2") || emp.job_level.includes("MT4")
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
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      {/* Header */}
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Exclude Employees
          </Typography>
          <IconButton size="small" onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Quick Filters */}
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Quick Filters
        </Typography>
        <ButtonGroup variant="outlined" size="small" sx={{ mb: 2, flexWrap: "wrap" }}>
          <Button onClick={excludeVPs}>Exclude VPs</Button>
          <Button onClick={excludeDirectorsPlus}>Exclude Directors+</Button>
          <Button onClick={excludeManagers}>Exclude Managers</Button>
          <Button onClick={clearSelections} color="secondary">
            Clear All
          </Button>
        </ButtonGroup>

        <Divider sx={{ mb: 2 }} />

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{ mb: 2 }}
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
            />
          }
          label={
            <Typography variant="body2" fontWeight="bold">
              Select All ({filteredEmployees.length} employees)
            </Typography>
          }
        />

        <Divider sx={{ my: 1 }} />

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
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{emp.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {emp.job_level} • {emp.manager}
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
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {selectedIds.length} selected
        </Typography>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleApply}>
          Apply Exclusions
        </Button>
      </DialogActions>
    </Dialog>
  );
};
