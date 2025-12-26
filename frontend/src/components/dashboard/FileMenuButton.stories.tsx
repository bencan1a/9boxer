/**
 * Storybook stories for FileMenuButton component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { FileMenuButton } from "./FileMenuButton";
import { Box } from "@mui/material";

const meta = {
  title: "Dashboard/AppBar/FileMenuButton",
  component: FileMenuButton,
  parameters: {
    layout: "centered",
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
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 2, backgroundColor: "primary.main", color: "white" }}>
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
 * Menu open (controlled)
 */
export const MenuOpen: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 3,
    isOpen: true,
  },
};
