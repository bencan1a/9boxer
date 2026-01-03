import React from 'react';
import { Chip } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

interface ClusterBadgeProps {
  clusterId: string;
  clusterTitle: string;
}

export const ClusterBadge: React.FC<ClusterBadgeProps> = ({ clusterTitle }) => {
  return (
    <Chip
      icon={<LinkIcon />}
      label={clusterTitle}
      size="small"
      sx={{
        backgroundColor: '#e7f3ff',
        color: '#0066cc',
        fontWeight: 500,
      }}
      title={`Part of cluster: ${clusterTitle}`}
    />
  );
};
