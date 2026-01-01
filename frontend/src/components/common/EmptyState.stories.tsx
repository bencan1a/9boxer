/**
 * Storybook stories for EmptyState component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

const meta = {
  title: "App/Common/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A reusable empty state component for displaying consistent empty states with icon, message, and optional action button.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    iconSize: {
      control: "select",
      options: ["small", "medium", "large"],
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic empty state with just an icon and title
 */
export const Basic: Story = {
  args: {
    icon: <PersonOutlineIcon />,
    title: "No selection",
  },
};

/**
 * Empty state with description
 */
export const WithDescription: Story = {
  args: {
    icon: <SearchIcon />,
    title: "No results found",
    description: "Try adjusting your search or filter criteria",
    iconSize: "medium",
  },
};

/**
 * Empty state with action button
 */
export const WithAction: Story = {
  args: {
    icon: <UploadFileIcon />,
    title: "No data loaded",
    description: "Upload an Excel file to get started with your 9-box analysis",
    action: {
      label: "Upload File",
      onClick: () => alert("Upload clicked"),
      icon: <CloudUploadIcon />,
    },
    hint: "Supported formats: .xlsx, .xls",
    iconSize: "large",
  },
};

/**
 * Empty state with outlined action button
 */
export const WithOutlinedAction: Story = {
  args: {
    icon: <FolderOpenIcon />,
    title: "No recent files",
    description: "You haven't opened any files recently",
    action: {
      label: "Open File",
      onClick: () => alert("Open clicked"),
      variant: "outlined",
    },
  },
};

/**
 * Small variant for inline use
 */
export const Small: Story = {
  args: {
    icon: <PersonOutlineIcon />,
    title: "Select an employee",
    description: "Click on an employee tile to view details",
    iconSize: "small",
  },
};

/**
 * Empty state without icon
 */
export const NoIcon: Story = {
  args: {
    title: "No data available",
    description: "Data will appear here once loaded",
  },
};

/**
 * Usage example: Details panel empty state
 */
export const DetailsPanel: Story = {
  args: {
    icon: <PersonOutlineIcon />,
    title: "Select an employee",
    iconSize: "medium",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example usage in the Details panel when no employee is selected",
      },
    },
  },
};

/**
 * Usage example: Intelligence tab empty state
 */
export const IntelligenceTab: Story = {
  args: {
    icon: <SearchIcon />,
    title: "No intelligence data",
    description: "Intelligence analysis will appear here once data is loaded",
    iconSize: "medium",
  },
  parameters: {
    docs: {
      description: {
        story: "Example usage in the Intelligence tab when data is unavailable",
      },
    },
  },
};
