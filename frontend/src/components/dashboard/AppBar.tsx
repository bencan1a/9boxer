/**
 * Application bar component
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Badge,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FilterListIcon from "@mui/icons-material/FilterList";
import LogoutIcon from "@mui/icons-material/Logout";
import DownloadIcon from "@mui/icons-material/Download";
import { useAuthStore } from "../../store/authStore";
import { useSessionStore } from "../../store/sessionStore";
import { useFilters } from "../../hooks/useFilters";
import { FileUploadDialog } from "../common/FileUploadDialog";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { apiClient } from "../../services/api";

export const AppBar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { sessionId, employees, filename, changes } = useSessionStore();
  const { toggleDrawer, hasActiveFilters, applyFilters } = useFilters();
  const { showSuccess, showError } = useSnackbar();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExport = async () => {
    if (!sessionId) return;

    setIsExporting(true);
    try {
      const blob = await apiClient.exportSession();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `modified_${filename || "employees.xlsx"}`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess(`Successfully exported ${changes.length} change(s) to ${filename}`);
    } catch (error: any) {
      console.error("Export failed:", error);
      const errorMessage = error.response?.data?.detail || "Failed to export file";
      showError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Get filtered employee count
  const filteredEmployees = applyFilters(employees);
  const displayedCount = filteredEmployees.length;

  // Check if there are modifications to export
  const hasModifications = changes.length > 0;

  return (
    <>
      <MuiAppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            9-Box Performance Review
          </Typography>

          {/* Session Info */}
          {sessionId && (
            <Box sx={{ display: "flex", alignItems: "center", mr: 2, gap: 1 }}>
              <Chip
                label={filename || "Session Active"}
                color="secondary"
                size="small"
                variant="outlined"
                sx={{ color: "white", borderColor: "white" }}
              />
              <Chip
                label={`${displayedCount} of ${employees.length} employees`}
                color="secondary"
                size="small"
                sx={{ color: "white" }}
              />
            </Box>
          )}

          {/* Action Buttons */}
          <Button
            color="inherit"
            startIcon={<UploadFileIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Upload
          </Button>

          <Badge
            variant="dot"
            color="secondary"
            invisible={!hasActiveFilters}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#ffa726",
              },
            }}
          >
            <Button
              color="inherit"
              startIcon={<FilterListIcon />}
              disabled={!sessionId}
              onClick={toggleDrawer}
              sx={{ mr: 1 }}
            >
              Filters
            </Button>
          </Badge>

          <Badge
            badgeContent={hasModifications ? changes.length : 0}
            color="secondary"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#4caf50",
              },
            }}
          >
            <Button
              color="inherit"
              startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              disabled={!sessionId || !hasModifications || isExporting}
              onClick={handleExport}
              sx={{ mr: 2 }}
            >
              {isExporting ? "Exporting..." : "Apply"}
            </Button>
          </Badge>

          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </MuiAppBar>

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </>
  );
};
