/**
 * Storybook stories for FileMenuButton component
 */

/* eslint-disable no-restricted-syntax */
// This file contains demo data for Storybook documentation
// Hardcoded colors are intentional for visual examples

import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "storybook/test";
import { FileMenuButton } from "./FileMenuButton";
import Box from "@mui/material/Box";

const meta = {
  title: "App/Dashboard/FileMenuButton",
  component: FileMenuButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    fileName: {
      control: "text",
      description: "Current file name",
    },
    changeCount: {
      control: { type: "number", min: 0, max: 20 },
      description: "Number of unsaved changes",
    },
    disabled: {
      control: "boolean",
      description: "Whether button is disabled",
    },
    isExporting: {
      control: "boolean",
      description: "Whether export is in progress",
    },
  },
  args: {
    onImportClick: fn(),
    onExportClick: fn(),
    onLoadSampleClick: fn(),
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          p: 1,
          backgroundColor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FileMenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No file selected
 */
export const NoFile: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "quickstart-file-menu-button" },
  },
  args: {
    fileName: undefined,
    changeCount: 0,
  },
};

/**
 * File loaded, no changes
 */
export const FileLoadedNoChanges: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 0,
  },
};

/**
 * File loaded with changes
 */
export const WithChanges: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 3,
  },
};

/**
 * File loaded with changes - for screenshot
 * Uses dark themed container with proper padding for documentation screenshots.
 */
export const WithChangesBadge: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "apply-button-with-badge" },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          p: 3,
          backgroundColor: "#1a1a2e",
          borderRadius: 1,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <Story />
      </Box>
    ),
  ],
  args: {
    fileName: "employees.xlsx",
    changeCount: 5,
  },
};

/**
 * Many changes
 */
export const ManyChanges: Story = {
  args: {
    fileName: "team_review_2024.xlsx",
    changeCount: 15,
  },
};

/**
 * Long file name
 */
export const LongFileName: Story = {
  args: {
    fileName:
      "Q4_2024_Performance_Review_and_Talent_Assessment_Master_File.xlsx",
    changeCount: 5,
  },
};

/**
 * Exporting state
 */
export const Exporting: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 8,
    isExporting: true,
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 3,
    disabled: true,
  },
};

/**
 * Menu open state - uses play function to click button so anchorEl is properly set
 */
export const MenuOpen: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "file-menu-apply-changes" },
  },
  args: {
    fileName: "employees.xlsx",
    changeCount: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("file-menu-button");
    await userEvent.click(button);
  },
};

/**
 * Menu open with recent files - shows the Recent Files section
 */
export const MenuOpenWithRecentFiles: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "file-menu-recent-files" },
  },
  args: {
    fileName: "employees.xlsx",
    changeCount: 0,
    recentFiles: [
      {
        path: "/Users/demo/Documents/Q4_Review_2024.xlsx",
        name: "Q4_Review_2024.xlsx",
        lastAccessed: Date.now() - 3600000,
      },
      {
        path: "/Users/demo/Documents/Team_Calibration.xlsx",
        name: "Team_Calibration.xlsx",
        lastAccessed: Date.now() - 86400000,
      },
      {
        path: "/Users/demo/Documents/Annual_Review_2023.xlsx",
        name: "Annual_Review_2023.xlsx",
        lastAccessed: Date.now() - 172800000,
      },
    ],
    onRecentFileClick: fn(),
    onClearRecentFiles: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("file-menu-button");
    await userEvent.click(button);
  },
};
