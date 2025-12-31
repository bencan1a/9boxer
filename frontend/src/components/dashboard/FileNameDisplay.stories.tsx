/**
 * Storybook stories for FileNameDisplay component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { FileNameDisplay } from "./FileNameDisplay";
import Box from "@mui/material/Box";

const meta = {
  title: "Dashboard/AppBar/FileNameDisplay",
  component: FileNameDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    fileName: {
      control: "text",
      description: "File name to display",
    },
    hasUnsavedChanges: {
      control: "boolean",
      description: "Whether there are unsaved changes",
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 2, backgroundColor: "background.paper" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FileNameDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No file selected
 */
export const NoFile: Story = {
  args: {
    fileName: undefined,
    hasUnsavedChanges: false,
  },
};

/**
 * File loaded, no changes
 */
export const WithFile: Story = {
  args: {
    fileName: "employees.xlsx",
    hasUnsavedChanges: false,
  },
};

/**
 * File with unsaved changes
 */
export const UnsavedChanges: Story = {
  args: {
    fileName: "employees.xlsx",
    hasUnsavedChanges: true,
  },
};

/**
 * Long file name
 */
export const LongFileName: Story = {
  args: {
    fileName:
      "Q4_2024_Performance_Review_and_Talent_Assessment_Master_File_v3.xlsx",
    hasUnsavedChanges: false,
  },
};

/**
 * Long file name with changes
 */
export const LongFileNameWithChanges: Story = {
  args: {
    fileName:
      "Q4_2024_Performance_Review_and_Talent_Assessment_Master_File_v3.xlsx",
    hasUnsavedChanges: true,
  },
};
