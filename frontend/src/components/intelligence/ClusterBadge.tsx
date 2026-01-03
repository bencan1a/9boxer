import React from "react";
import { Chip, alpha, useTheme } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";

interface ClusterBadgeProps {
  clusterId: string;
  clusterTitle: string;
}

export const ClusterBadge: React.FC<ClusterBadgeProps> = ({ clusterTitle }) => {
  const theme = useTheme();

  return (
    <Chip
      icon={<LinkIcon />}
      label={clusterTitle}
      size="small"
      sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: "primary.main",
        fontWeight: 500,
        "& .MuiChip-icon": {
          color: "primary.main",
        },
      }}
      title={`Part of cluster: ${clusterTitle}`}
    />
  );
};
