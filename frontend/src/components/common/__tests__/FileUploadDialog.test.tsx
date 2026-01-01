import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/utils";
import { FileUploadDialog } from "../FileUploadDialog";
import userEvent from "@testing-library/user-event";
import { useSessionStore } from "../../../store/sessionStore";

// Mock the session store
const mockUploadFile = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn(),
  selectUploadFile: vi.fn((state) => state.uploadFile),
  selectIsLoading: vi.fn((state) => state.isLoading),
}));

vi.mock("../../../contexts/SnackbarContext", () => ({
  useSnackbar: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

describe("FileUploadDialog", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.electronAPI as undefined (web mode)
    delete (window as any).electronAPI;

    // Mock useSessionStore to work with selectors
    (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => {
        const mockState = {
          uploadFile: mockUploadFile,
          isLoading: false,
        };
        return selector ? selector(mockState) : mockState;
      }
    );
  });

  it("renders dialog with title and description when open", () => {
    render(<FileUploadDialog open={true} onClose={mockOnClose} />);

    expect(screen.getByText("Import Excel File")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Import a 9-Box talent mapping Excel file (.xlsx or .xls)"
      )
    ).toBeInTheDocument();
  });

  it("shows file input with correct accept attribute in web mode", () => {
    render(<FileUploadDialog open={true} onClose={mockOnClose} />);

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput?.accept).toBe(".xlsx,.xls");
  });

  it("disables upload button when no file is selected", () => {
    render(<FileUploadDialog open={true} onClose={mockOnClose} />);

    const uploadButton = screen.getByRole("button", { name: /import/i });
    expect(uploadButton).toBeDisabled();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<FileUploadDialog open={true} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("displays selected file name when file is selected", async () => {
    const user = userEvent.setup();
    render(<FileUploadDialog open={true} onClose={mockOnClose} />);

    const file = new File(["content"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/test.xlsx/i)).toBeInTheDocument();
    });
  });

  it("shows error when file size exceeds 10MB", async () => {
    const user = userEvent.setup();
    render(<FileUploadDialog open={true} onClose={mockOnClose} />);

    // Create a file larger than 10MB (mock size)
    const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(
        screen.getByText("File size must be less than 10MB")
      ).toBeInTheDocument();
    });
  });

  it("shows error when file type is not Excel", async () => {
    const user = userEvent.setup();
    render(<FileUploadDialog open={true} onClose={mockOnClose} />);

    // File with wrong extension but correct MIME type to bypass input[accept]
    const textFile = new File(["content"], "test.doc", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    if (fileInput) {
      // Remove accept attribute for testing
      fileInput.removeAttribute("accept");
      await user.upload(fileInput, textFile);

      await waitFor(
        () => {
          expect(
            screen.getByText("Please select an Excel file (.xlsx or .xls)")
          ).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    }
  });
});
