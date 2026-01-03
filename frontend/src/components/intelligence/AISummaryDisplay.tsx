import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { useTheme, alpha } from "@mui/material/styles";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface AISummaryDisplayProps {
  summary: string;
}

export const AISummaryDisplay: React.FC<AISummaryDisplayProps> = ({
  summary,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Split by double newlines for paragraphs
  const paragraphs = summary.split("\n\n").filter((p) => p.trim());

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor:
          theme.palette.mode === "light"
            ? alpha(theme.palette.primary.main, 0.04)
            : alpha(theme.palette.primary.main, 0.08),
        borderLeft: `4px solid ${theme.palette.primary.main}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "primary.main" }} />
          <Typography variant="h6" color="primary">
            AI-Generated Summary
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ minWidth: 120 }}
        >
          {isExpanded ? "Show less" : "Read full"}
        </Button>
      </Box>

      <Collapse in={isExpanded} collapsedSize={100}>
        <Box
          sx={{
            maxHeight: isExpanded ? 600 : 100,
            overflowY: isExpanded ? "auto" : "hidden",
            pr: isExpanded ? 1 : 0,
            position: "relative",
          }}
        >
          {paragraphs.map((paragraph, index) => (
            <Typography
              key={index}
              variant="body1"
              color="text.primary"
              sx={{
                mb: index < paragraphs.length - 1 ? 2 : 0,
                lineHeight: 1.6,
              }}
            >
              {paragraph}
            </Typography>
          ))}
          {!isExpanded && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
                background:
                  theme.palette.mode === "light"
                    ? `linear-gradient(transparent, ${alpha(theme.palette.primary.main, 0.04)})`
                    : `linear-gradient(transparent, ${alpha(theme.palette.primary.main, 0.08)})`,
                pointerEvents: "none",
              }}
            />
          )}
        </Box>
      </Collapse>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 2 }}
      >
        Powered by Claude
      </Typography>
    </Paper>
  );
};
