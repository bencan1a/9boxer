import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface AISummaryDisplayProps {
  summary: string;
}

export const AISummaryDisplay: React.FC<AISummaryDisplayProps> = ({ summary }) => {
  // Split by double newlines for paragraphs
  const paragraphs = summary.split('\n\n').filter(p => p.trim());

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6">AI-Generated Summary</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        {paragraphs.map((paragraph, index) => (
          <Typography
            key={index}
            variant="body1"
            sx={{ mb: index < paragraphs.length - 1 ? 2 : 0, lineHeight: 1.6 }}
          >
            {paragraph}
          </Typography>
        ))}
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Powered by Claude
      </Typography>
    </Paper>
  );
};
