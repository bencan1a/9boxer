import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { FileUploadDialog } from "./FileUploadDialog";
import { SnackbarProvider } from "../../contexts/SnackbarContext";

/**
 * FileUploadDialog provides the Excel file import interface.
 *
 * **Key Features:**
 * - File selection via browser input or Electron native dialog
 * - File validation (type, size limits)
 * - Upload progress indicator
 * - Success/error feedback
 *
 * **Dependencies:**
 * - Uses sessionStore (Zustand) for upload state management
 * - Uses SnackbarContext for notifications
 * - Uses Electron API for native file dialogs (when available)
 *
 * **File Requirements:**
 * - Format: .xlsx or .xls
 * - Max size: 10MB
 */
const meta: Meta<typeof FileUploadDialog> = {
  title: "Common/FileUploadDialog",
  component: FileUploadDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
      </SnackbarProvider>
    ),
  ],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controls whether the dialog is open or closed",
    },
    onClose: {
      description: "Callback function called when the dialog is closed",
    },
  },
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FileUploadDialog>;

/**
 * Open and idle state - ready to select a file.
 * Shows the initial state when users first open the dialog.
 */
export const Open: Story = {
  args: {
    open: true,
  },
};

/**
 * Dialog with file selected.
 * Note: This story requires manual interaction to select a file in Storybook.
 * In the actual app, users can select .xlsx or .xls files.
 */
export const WithFile: Story = {
  args: {
    open: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'After clicking "Select File", users can choose an Excel file (.xlsx or .xls). ' +
          "The selected filename will be displayed in the dialog. " +
          "Files must be under 10MB to pass validation.",
      },
    },
  },
};

/**
 * Uploading state with loading spinner.
 * Note: This state is transient in the actual app and appears during file upload.
 * The dialog shows a loading spinner while the file is being processed.
 */
export const Uploading: Story = {
  args: {
    open: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When the Import button is clicked, the dialog shows a loading spinner " +
          "and disables controls while the file is being uploaded and processed.",
      },
    },
  },
};

/**
 * Error state with red alert message.
 * Shows validation or upload errors to the user.
 */
export const Error: Story = {
  args: {
    open: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Error states include: file too large (>10MB), invalid file type (not .xlsx/.xls), " +
          "or server-side errors during upload. The error message is displayed in a red alert.",
      },
    },
  },
};
