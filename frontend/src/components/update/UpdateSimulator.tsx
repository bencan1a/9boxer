import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";
import Chip from "@mui/material/Chip";
import BugReportIcon from "@mui/icons-material/BugReport";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { NotificationBanner } from "../notifications/NotificationBanner";
import CloudDownload from "@mui/icons-material/CloudDownload";
import { isDevelopment } from "../../config";

/**
 * Floating debug panel for testing update notifications
 * Only visible in development mode
 */
export const UpdateSimulator: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  // Only render in development mode
  if (!isDevelopment || !visible) {
    return null;
  }

  const handleRestartNow = () => {
    console.log("[UpdateSimulator] Restart Now clicked");
    setShowBanner(false);
  };

  const handleLater = () => {
    console.log("[UpdateSimulator] Later clicked");
    setShowBanner(false);
  };

  return (
    <>
      {/* Simulated floating banner */}
      {showBanner && (
        <NotificationBanner
          variant="success"
          title="Update 1.0.2 is ready"
          description="Restart to install and enjoy the latest features"
          icon={<CloudDownload />}
          floating={true}
          actions={[
            {
              label: "Restart Now",
              onClick: handleRestartNow,
              variant: "contained",
              color: "primary",
            },
          ]}
          closable={true}
          onClose={handleLater}
        />
      )}

      {/* Floating debug panel */}
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 16,
          left: 16,
          zIndex: 9998,
          maxWidth: 320,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            px: 2,
            py: 1,
            backgroundColor: "action.hover",
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <BugReportIcon fontSize="small" color="action" />
          <Typography variant="caption" sx={{ flex: 1, fontWeight: 500 }}>
            Update Simulator
          </Typography>
          <Chip label="DEV" size="small" color="default" sx={{ height: 18 }} />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setVisible(false);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Expandable content */}
        <Collapse in={expanded}>
          <Stack spacing={1.5} sx={{ p: 2 }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => setShowBanner(true)}
              disabled={showBanner}
            >
              Show Update Banner
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => setShowBanner(false)}
              disabled={!showBanner}
            >
              Hide Banner
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ pt: 0.5 }}
            >
              Status: {showBanner ? "Visible" : "Hidden"}
            </Typography>
          </Stack>
        </Collapse>
      </Paper>
    </>
  );
};
