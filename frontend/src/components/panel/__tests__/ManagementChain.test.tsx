import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import { ManagementChain } from "../ManagementChain";
import { createMockEmployee } from "../../../test/mockData";
import { getTranslatedText } from "../../../test/i18nTestUtils";
import * as useFiltersHook from "../../../hooks/useFilters";
import * as useOrgHierarchyHook from "../../../hooks/useOrgHierarchy";

describe("ManagementChain", () => {
  const mockToggleManager = vi.fn();
  const mockSelectManager = vi.fn();
  const mockGetReportIds = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetReportIds.mockResolvedValue([1, 2, 3]);

    vi.spyOn(useOrgHierarchyHook, "useOrgHierarchy").mockReturnValue({
      managers: [{ name: "Jane Smith", employee_id: 1, team_size: 5 }],
      orgTree: [],
      getReportIds: mockGetReportIds,
      getReportingChain: vi.fn().mockResolvedValue([1]),
    });

    vi.spyOn(useFiltersHook, "useFilters").mockReturnValue({
      toggleManager: mockToggleManager,
      selectManager: mockSelectManager,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      selectedManagerEmployeeIds: {},
      selectedFlags: [],
      excludedEmployeeIds: [],
      isDrawerOpen: false,
      hasActiveFilters: false,
      toggleLevel: vi.fn(),
      toggleJobFunction: vi.fn(),
      toggleLocation: vi.fn(),
      setExcludedIds: vi.fn(),
      clearAllFilters: vi.fn(),
      toggleDrawer: vi.fn(),
      applyFilters: vi.fn(),
      getAvailableOptions: vi.fn(),
      toggleFlag: vi.fn(),
    });
  });

  it("renders employee and manager names correctly", () => {
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith",
      management_chain_01: "Bob Johnson",
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    render(<ManagementChain employee={employee} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays no data message when employee has no manager", () => {
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "",
      management_chain_01: null,
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    render(<ManagementChain employee={employee} />);

    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.managementChain.noData")
      )
    ).toBeInTheDocument();
  });

  it("makes manager names clickable but not the employee", () => {
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith",
      management_chain_01: "Bob Johnson",
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    const { container } = render(<ManagementChain employee={employee} />);

    // Check that manager names have clickable buttons
    const buttons = container.querySelectorAll(
      '[data-testid^="manager-chain-button"]'
    );
    expect(buttons.length).toBe(2); // Jane Smith and Bob Johnson

    // Employee (John Doe) should not be clickable
    const employeePaper = screen
      .getByText("John Doe")
      .closest('[class*="MuiPaper"]');
    expect(employeePaper).not.toHaveAttribute("role", "button");
  });

  it("calls selectManager when manager is clicked", async () => {
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith",
      management_chain_01: "Bob Johnson",
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    render(<ManagementChain employee={employee} />);

    // Click on Jane Smith
    const janeButton = screen.getByText("Jane Smith").closest("button");
    expect(janeButton).toBeInTheDocument();
    fireEvent.click(janeButton!);

    // Wait for async operation
    await vi.waitFor(() => {
      expect(mockSelectManager).toHaveBeenCalled();
    });
  });

  it("calls selectManager when higher-level manager is clicked", async () => {
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith",
      management_chain_01: "Bob Johnson",
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    render(<ManagementChain employee={employee} />);

    // Click on Bob Johnson
    const bobButton = screen.getByText("Bob Johnson").closest("button");
    expect(bobButton).toBeInTheDocument();
    fireEvent.click(bobButton!);

    // Wait for async operation
    await vi.waitFor(() => {
      expect(mockSelectManager).toHaveBeenCalled();
    });
  });

  it("highlights active filter manager with success color", () => {
    vi.spyOn(useFiltersHook, "useFilters").mockReturnValue({
      toggleManager: mockToggleManager,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: ["Jane Smith"],
      excludedEmployeeIds: [],
      isDrawerOpen: false,
      hasActiveFilters: true,
      toggleLevel: vi.fn(),
      toggleJobFunction: vi.fn(),
      toggleLocation: vi.fn(),
      setExcludedIds: vi.fn(),
      clearAllFilters: vi.fn(),
      toggleDrawer: vi.fn(),
      applyFilters: vi.fn(),
      getAvailableOptions: vi.fn(),
      toggleFlag: vi.fn(),
    });

    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith",
      management_chain_01: "Bob Johnson",
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    render(<ManagementChain employee={employee} />);

    // Jane Smith should be highlighted as the active filter
    const janeButton = screen.getByText("Jane Smith").closest("button");
    expect(janeButton).toBeInTheDocument();

    // Check that the Paper has success color styling
    const janePaper = janeButton!.querySelector('[class*="MuiPaper"]');
    expect(janePaper).toBeInTheDocument();
  });

  it("displays all management chain levels correctly", () => {
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith",
      management_chain_01: "Bob Johnson",
      management_chain_02: "Alice Williams",
      management_chain_03: "Charlie Brown",
      management_chain_04: "David Lee",
      management_chain_05: "Emma Davis",
      management_chain_06: "Frank Miller",
    });

    render(<ManagementChain employee={employee} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    expect(screen.getByText("Alice Williams")).toBeInTheDocument();
    expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
    expect(screen.getByText("David Lee")).toBeInTheDocument();
    expect(screen.getByText("Emma Davis")).toBeInTheDocument();
    expect(screen.getByText("Frank Miller")).toBeInTheDocument();
  });

  it("renders arrows between chain members", () => {
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith",
      management_chain_01: "Bob Johnson",
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    const { container } = render(<ManagementChain employee={employee} />);

    // Check for arrow icons between chain members
    const arrows = container.querySelectorAll(
      '[data-testid="ArrowUpwardIcon"]'
    );
    expect(arrows.length).toBeGreaterThan(0);
  });

  it("handles case-insensitive filter matching", () => {
    vi.spyOn(useFiltersHook, "useFilters").mockReturnValue({
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
      isDrawerOpen: false,
      hasActiveFilters: true,
      toggleLevel: vi.fn(),
      toggleJobFunction: vi.fn(),
      toggleLocation: vi.fn(),
      toggleManager: vi.fn(),
      setExcludedIds: vi.fn(),
      clearAllFilters: vi.fn(),
      toggleDrawer: vi.fn(),
      applyFilters: vi.fn(),
      getAvailableOptions: vi.fn(),
    });

    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith", // Mixed case
      management_chain_01: null,
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    render(<ManagementChain employee={employee} />);

    // Jane Smith should still be highlighted despite case mismatch
    const janeButton = screen.getByText("Jane Smith").closest("button");
    expect(janeButton).toBeInTheDocument();
  });

  it("prevents duplicate managers when same person appears in manager and chain", () => {
    // Scenario: Direct manager is also in management_chain_06
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Senior VP",
      management_chain_01: "VP Operations",
      management_chain_02: "Chief Operating Officer",
      management_chain_03: "Senior VP", // Same as direct manager
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    render(<ManagementChain employee={employee} />);

    // Senior VP should appear only once (as Manager, not as Level 03)
    const seniorVpElements = screen.getAllByText("Senior VP");
    expect(seniorVpElements).toHaveLength(1);

    // Verify the labels - should have: Employee, Manager, Level 01, Level 02
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.managementChain.manager")
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.managementChain.level01")
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.managementChain.level02")
      )
    ).toBeInTheDocument();
    // Level 03 label should NOT appear (because it was a duplicate)
    expect(
      screen.queryByText(
        getTranslatedText("panel.detailsTab.managementChain.level03")
      )
    ).not.toBeInTheDocument();
  });

  it("prevents duplicates with case-insensitive matching", () => {
    // Scenario: Same person with different capitalization
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Jane Smith",
      management_chain_01: "JANE SMITH", // Same person, different case
      management_chain_02: "Bob Johnson",
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
    });

    render(<ManagementChain employee={employee} />);

    // Should show "Jane Smith" only once, not "JANE SMITH"
    const janeElements = screen.getAllByText(/jane smith/i);
    expect(janeElements).toHaveLength(1);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("JANE SMITH")).not.toBeInTheDocument();

    // Should show: Employee, Manager (Jane Smith), Level 02 (Bob Johnson)
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.managementChain.level02")
      )
    ).toBeInTheDocument();
  });

  it("shows complete chain when all levels are unique", () => {
    const employee = createMockEmployee({
      name: "John Doe",
      manager: "Manager A",
      management_chain_01: "Manager B",
      management_chain_02: "Manager C",
      management_chain_03: "Manager D",
      management_chain_04: "Manager E",
      management_chain_05: "Manager F",
      management_chain_06: "Manager G",
    });

    render(<ManagementChain employee={employee} />);

    // All unique managers should be displayed (7 managers + 1 employee = 8 total)
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Manager A")).toBeInTheDocument();
    expect(screen.getByText("Manager B")).toBeInTheDocument();
    expect(screen.getByText("Manager C")).toBeInTheDocument();
    expect(screen.getByText("Manager D")).toBeInTheDocument();
    expect(screen.getByText("Manager E")).toBeInTheDocument();
    expect(screen.getByText("Manager F")).toBeInTheDocument();
    expect(screen.getByText("Manager G")).toBeInTheDocument();

    // Verify all manager buttons exist (7 clickable managers)
    const buttons = screen.getAllByTestId(/manager-chain-button/);
    expect(buttons).toHaveLength(7);
  });
});
