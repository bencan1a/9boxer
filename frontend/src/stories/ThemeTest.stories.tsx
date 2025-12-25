import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Button, Paper } from '@mui/material';

/**
 * A simple test component to verify theme integration
 */
const ThemeTest = () => {
  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h3" gutterBottom>
        Theme Test Component
      </Typography>
      <Typography variant="body1" paragraph>
        This is a test component to verify that the Material-UI theme is working correctly in Storybook.
        Try switching between light and dark mode using the theme toggle in the toolbar.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="contained" color="primary">
          Primary Button
        </Button>
        <Button variant="contained" color="secondary">
          Secondary Button
        </Button>
        <Button variant="outlined">
          Outlined Button
        </Button>
      </Box>
    </Paper>
  );
};

const meta = {
  title: 'Test/ThemeTest',
  component: ThemeTest,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
