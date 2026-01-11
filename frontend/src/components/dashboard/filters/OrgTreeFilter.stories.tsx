import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState, useMemo } from "react";
import { OrgTreeFilter } from "./OrgTreeFilter";
import {
  ManagerInfo,
  OrgTreeNode,
} from "../../../services/orgHierarchyService";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../../types/employee";
import Box from "@mui/material/Box";

/**
 * Create comprehensive org hierarchy mock data
 * Structure: CEO -> 3 VPs -> Multiple Directors -> Team Leads
 */
const createMockOrgData = (): {
  managers: ManagerInfo[];
  employees: Employee[];
} => {
  const employees: Employee[] = [];
  let employeeId = 1;

  // Helper to create employee
  const createEmployee = (
    name: string,
    jobFunction: string,
    manager: string,
    jobLevel: string
  ): Employee => {
    const emp: Employee = {
      employee_id: employeeId++,
      name,
      business_title: `${jobFunction} ${jobLevel}`,
      job_title: `${jobFunction} ${jobLevel}`,
      job_profile: `${jobFunction}-Tech-USA`,
      job_level: jobLevel,
      job_function: jobFunction,
      location: "USA",
      manager,
      management_chain_01: manager,
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
      hire_date: "2020-01-15",
      tenure_category: "3-5 years",
      time_in_job_profile: "2 years",
      performance: PerformanceLevel.HIGH,
      potential: PotentialLevel.HIGH,
      grid_position: 9,
      talent_indicator: "High Performer",
      ratings_history: [{ year: 2023, rating: "Leading" }],
      development_focus: null,
      development_action: null,
      notes: null,
      promotion_status: null,
      promotion_readiness: null,
      modified_in_session: false,
      last_modified: null,
    };
    return emp;
  };

  // CEO (top level - no manager in org)
  const ceo = createEmployee("Jennifer Williams", "Executive", "", "MT6");
  employees.push(ceo);

  // VP Level (reports to CEO)
  const vpEngineering = createEmployee(
    "Sarah Chen",
    "Engineering",
    "Jennifer Williams",
    "MT6"
  );
  const vpProduct = createEmployee(
    "Marcus Lee",
    "Product",
    "Jennifer Williams",
    "MT6"
  );
  const vpDesign = createEmployee(
    "Peter Miller",
    "Design",
    "Jennifer Williams",
    "MT5"
  );
  employees.push(vpEngineering, vpProduct, vpDesign);

  // Engineering Directors (report to Sarah Chen)
  const dirBackend = createEmployee(
    "David Rodriguez",
    "Engineering",
    "Sarah Chen",
    "MT5"
  );
  const dirFrontend = createEmployee(
    "Emily Zhang",
    "Engineering",
    "Sarah Chen",
    "MT5"
  );
  const dirInfra = createEmployee(
    "Michael Johnson",
    "Engineering",
    "Sarah Chen",
    "MT5"
  );
  employees.push(dirBackend, dirFrontend, dirInfra);

  // Product Directors (report to Marcus Lee)
  const dirProductA = createEmployee(
    "Jessica Taylor",
    "Product",
    "Marcus Lee",
    "MT5"
  );
  const dirProductB = createEmployee(
    "Robert Kim",
    "Product",
    "Marcus Lee",
    "MT4"
  );
  employees.push(dirProductA, dirProductB);

  // Design Directors (report to Peter Miller)
  const dirUX = createEmployee("Amanda White", "Design", "Peter Miller", "MT4");
  const dirVisual = createEmployee(
    "Chris Anderson",
    "Design",
    "Peter Miller",
    "MT4"
  );
  employees.push(dirUX, dirVisual);

  // Backend Team Leads (report to David Rodriguez)
  const tlBackendAPI = createEmployee(
    "James Wilson",
    "Engineering",
    "David Rodriguez",
    "MT4"
  );
  const tlBackendDB = createEmployee(
    "Lisa Martinez",
    "Engineering",
    "David Rodriguez",
    "MT3"
  );
  employees.push(tlBackendAPI, tlBackendDB);

  // Frontend Team Leads (report to Emily Zhang)
  const tlFrontendReact = createEmployee(
    "Kevin Brown",
    "Engineering",
    "Emily Zhang",
    "MT4"
  );
  const tlFrontendMobile = createEmployee(
    "Rachel Green",
    "Engineering",
    "Emily Zhang",
    "MT3"
  );
  employees.push(tlFrontendReact, tlFrontendMobile);

  // Individual Contributors (non-managers - not in manager list)
  // Backend team
  employees.push(
    createEmployee("Alex Thompson", "Engineering", "James Wilson", "MT3")
  );
  employees.push(
    createEmployee("Maria Garcia", "Engineering", "James Wilson", "MT2")
  );
  employees.push(
    createEmployee("Daniel Lee", "Engineering", "James Wilson", "MT2")
  );
  employees.push(
    createEmployee("Sophie Chen", "Engineering", "Lisa Martinez", "MT3")
  );
  employees.push(
    createEmployee("John Davis", "Engineering", "Lisa Martinez", "MT2")
  );

  // Frontend team
  employees.push(
    createEmployee("Emma Wilson", "Engineering", "Kevin Brown", "MT3")
  );
  employees.push(
    createEmployee("Lucas Miller", "Engineering", "Kevin Brown", "MT2")
  );
  employees.push(
    createEmployee("Olivia Taylor", "Engineering", "Rachel Green", "MT3")
  );
  employees.push(
    createEmployee("Noah Anderson", "Engineering", "Rachel Green", "MT2")
  );

  // Infrastructure team
  employees.push(
    createEmployee("Isabella White", "Engineering", "Michael Johnson", "MT3")
  );
  employees.push(
    createEmployee("Ethan Martinez", "Engineering", "Michael Johnson", "MT2")
  );

  // Product teams
  employees.push(
    createEmployee("Sophia Rodriguez", "Product", "Jessica Taylor", "MT3")
  );
  employees.push(
    createEmployee("Benjamin Kim", "Product", "Jessica Taylor", "MT2")
  );
  employees.push(createEmployee("Mia Johnson", "Product", "Robert Kim", "MT3"));

  // Design teams
  employees.push(
    createEmployee("William Zhang", "Design", "Amanda White", "MT3")
  );
  employees.push(
    createEmployee("Charlotte Brown", "Design", "Chris Anderson", "MT2")
  );

  // Create manager info list (only managers with team sizes)
  const managers: ManagerInfo[] = [
    // CEO - total org
    {
      employee_id: ceo.employee_id,
      name: "Jennifer Williams",
      team_size: 32, // Everyone except CEO
    },
    // VPs
    {
      employee_id: vpEngineering.employee_id,
      name: "Sarah Chen",
      team_size: 18, // 3 directors + 4 team leads + 11 ICs
    },
    {
      employee_id: vpProduct.employee_id,
      name: "Marcus Lee",
      team_size: 5, // 2 directors + 3 ICs
    },
    {
      employee_id: vpDesign.employee_id,
      name: "Peter Miller",
      team_size: 4, // 2 directors + 2 ICs
    },
    // Engineering Directors
    {
      employee_id: dirBackend.employee_id,
      name: "David Rodriguez",
      team_size: 7, // 2 team leads + 5 ICs
    },
    {
      employee_id: dirFrontend.employee_id,
      name: "Emily Zhang",
      team_size: 6, // 2 team leads + 4 ICs
    },
    {
      employee_id: dirInfra.employee_id,
      name: "Michael Johnson",
      team_size: 2, // 2 ICs
    },
    // Product Directors
    {
      employee_id: dirProductA.employee_id,
      name: "Jessica Taylor",
      team_size: 2, // 2 ICs
    },
    {
      employee_id: dirProductB.employee_id,
      name: "Robert Kim",
      team_size: 1, // 1 IC
    },
    // Design Directors
    {
      employee_id: dirUX.employee_id,
      name: "Amanda White",
      team_size: 1, // 1 IC
    },
    {
      employee_id: dirVisual.employee_id,
      name: "Chris Anderson",
      team_size: 1, // 1 IC
    },
    // Engineering Team Leads
    {
      employee_id: tlBackendAPI.employee_id,
      name: "James Wilson",
      team_size: 3, // 3 ICs
    },
    {
      employee_id: tlBackendDB.employee_id,
      name: "Lisa Martinez",
      team_size: 2, // 2 ICs
    },
    {
      employee_id: tlFrontendReact.employee_id,
      name: "Kevin Brown",
      team_size: 2, // 2 ICs
    },
    {
      employee_id: tlFrontendMobile.employee_id,
      name: "Rachel Green",
      team_size: 2, // 2 ICs
    },
  ];

  return { managers, employees };
};

const mockData = createMockOrgData();

/**
 * Build org tree from employee data
 * Converts flat employee list into hierarchical OrgTreeNode structure
 */
const buildOrgTree = (
  employees: Employee[],
  managers: ManagerInfo[]
): OrgTreeNode[] => {
  // Create a map of manager names to their info
  const managerMap = new Map(managers.map((m) => [m.name, m]));

  // Create a map to hold nodes by employee_id
  const nodeMap = new Map<number, OrgTreeNode>();

  // Initialize all manager nodes
  managers.forEach((manager) => {
    nodeMap.set(manager.employee_id, {
      employee_id: manager.employee_id,
      name: manager.name,
      team_size: manager.team_size,
      direct_reports: [],
    });
  });

  // Build parent-child relationships
  managers.forEach((manager) => {
    // Find this manager's manager in the employee list
    const managerEmployee = employees.find((e) => e.name === manager.name);
    if (managerEmployee && managerEmployee.manager) {
      const parentManager = managerMap.get(managerEmployee.manager);
      if (parentManager) {
        const parentNode = nodeMap.get(parentManager.employee_id);
        const currentNode = nodeMap.get(manager.employee_id);
        if (parentNode && currentNode) {
          parentNode.direct_reports.push(currentNode);
        }
      }
    }
  });

  // Find root nodes (managers with no manager or manager not in list)
  const roots: OrgTreeNode[] = [];
  managers.forEach((manager) => {
    const managerEmployee = employees.find((e) => e.name === manager.name);
    const hasParentInTree =
      managerEmployee?.manager && managerMap.has(managerEmployee.manager);

    if (!hasParentInTree) {
      const node = nodeMap.get(manager.employee_id);
      if (node) {
        roots.push(node);
      }
    }
  });

  // Sort roots by team size (descending) then name
  roots.sort(
    (a, b) => b.team_size - a.team_size || a.name.localeCompare(b.name)
  );

  // Recursively sort all children
  const sortChildren = (node: OrgTreeNode) => {
    node.direct_reports.sort(
      (a, b) => b.team_size - a.team_size || a.name.localeCompare(b.name)
    );
    node.direct_reports.forEach(sortChildren);
  };
  roots.forEach(sortChildren);

  return roots;
};

/**
 * Interactive wrapper with state management
 */
const OrgTreeFilterWrapper: React.FC<{
  initialSelectedManagers?: string[];
  employees?: Employee[];
}> = ({ initialSelectedManagers = [], employees = mockData.employees }) => {
  const [selectedManagers, setSelectedManagers] = useState<string[]>(
    initialSelectedManagers
  );

  // Build org tree from mock data instead of using the hook
  const orgTree = useMemo(() => {
    // Find which employees in our list are managers
    const managersInData = mockData.managers.filter((m) =>
      employees.some((e) => e.name === m.name)
    );
    return buildOrgTree(employees, managersInData);
  }, [employees]);

  const handleToggleManager = (managerName: string) => {
    setSelectedManagers((prev) =>
      prev.includes(managerName)
        ? prev.filter((m) => m !== managerName)
        : [...prev, managerName]
    );
  };

  return (
    <Box sx={{ width: 320, p: 2, backgroundColor: "background.paper" }}>
      <OrgTreeFilter
        orgTree={orgTree}
        selectedManagers={selectedManagers}
        onToggleManager={handleToggleManager}
      />
    </Box>
  );
};

const meta: Meta<typeof OrgTreeFilter> = {
  title: "App/Dashboard/Filters/OrgTreeFilter",
  component: OrgTreeFilter,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hierarchical organization tree filter component that displays managers in a tree structure " +
          "with expand/collapse functionality, checkboxes for multi-select, and team size indicators. " +
          "Used in the FilterDrawer to enable filtering by manager hierarchy. " +
          "Automatically builds the tree from a flat list of managers and employees.",
      },
    },
  },
  argTypes: {
    orgTree: {
      description:
        "Hierarchical organization tree with manager nodes and team sizes",
    },
    selectedManagers: {
      description: "Array of manager names that are currently selected",
    },
    onToggleManager: {
      description: "Callback fired when a manager is selected/deselected",
      action: "manager toggled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof OrgTreeFilter>;

/**
 * Story 1: Tree Expanded - Full organizational hierarchy
 * Shows 3-4 levels of the org tree with expand/collapse icons,
 * checkboxes, and team size badges. Top level auto-expanded.
 */
export const TreeExpanded: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "org-tree-filter-expanded" },
    docs: {
      description: {
        story:
          "Full organizational hierarchy showing multiple levels of management. " +
          "The tree displays manager names with team size badges (e.g., 'Sarah Chen (18)'). " +
          "Top-level managers are auto-expanded, with expand/collapse icons for nodes with children. " +
          "Each manager has a checkbox for selection. No managers are currently selected. " +
          "Tree is sorted by team size (descending) then alphabetically.",
      },
    },
  },
  render: () => <OrgTreeFilterWrapper />,
};

/**
 * Story 2: With Search Active (Note: Search not in base OrgTreeFilter)
 * This story shows the expected behavior if search were integrated.
 * Since the current OrgTreeFilter doesn't have search built-in,
 * we demonstrate the tree structure that would be visible after filtering.
 */
export const SearchResults: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "org-tree-filter-search-active" },
    docs: {
      description: {
        story:
          "Tree showing search results for 'chen'. " +
          "When search is active, matching managers are highlighted and their " +
          "ancestors are auto-expanded to show the match in context. " +
          "In this example, 'Sarah Chen' would be highlighted. " +
          "NOTE: Current OrgTreeFilter doesn't include search - this shows the pattern " +
          "for when search is added at the FilterDrawer level.",
      },
    },
  },
  render: () => {
    // Filter employees to simulate search for "chen"
    const filteredEmployees = mockData.employees.filter(
      (e) =>
        e.name.toLowerCase().includes("chen") ||
        e.manager.toLowerCase().includes("chen")
    );
    return <OrgTreeFilterWrapper employees={filteredEmployees} />;
  },
};

/**
 * Story 3: Multi-Select - Multiple managers selected at different levels
 * Shows checkboxes in checked state for 2-3 managers across the hierarchy
 */
export const MultiSelect: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "org-tree-filter-multi-select" },
    docs: {
      description: {
        story:
          "Multiple managers selected across different hierarchy levels. " +
          "Shows 3 managers checked: Sarah Chen (VP Engineering), " +
          "Marcus Lee (VP Product), and David Rodriguez (Director Backend). " +
          "Demonstrates multi-select capability where users can filter by " +
          "multiple teams simultaneously. Selected managers show checked checkboxes. " +
          "The filter would show employees reporting to ANY of the selected managers (OR logic).",
      },
    },
  },
  render: () => (
    <OrgTreeFilterWrapper
      initialSelectedManagers={["Sarah Chen", "Marcus Lee", "David Rodriguez"]}
    />
  ),
};

/**
 * Story 4: Empty State - No managers available
 * Shows what happens when there are no managers to display
 */
export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Empty state displayed when no managers are available. " +
          "Shows a 'No managers found' message in muted text. " +
          "This could occur if the org hierarchy hasn't loaded yet, " +
          "or if all managers are filtered out by search criteria.",
      },
    },
  },
  render: () => <OrgTreeFilterWrapper employees={[]} />,
};

/**
 * Story 5: Small Team - Single manager with small team
 * Useful for testing minimal hierarchy cases
 */
export const SmallTeam: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Minimal org structure with a single manager and small team. " +
          "Shows a team lead with only 2 direct reports. " +
          "No expand/collapse icon since there are no sub-managers. " +
          "Demonstrates the tree behavior for flat organizational structures.",
      },
    },
  },
  render: () => {
    // Create a small org with just Kevin Brown and his reports
    const smallOrgEmployees = mockData.employees.filter(
      (e) => e.manager === "Kevin Brown" || e.name === "Kevin Brown"
    );
    return <OrgTreeFilterWrapper employees={smallOrgEmployees} />;
  },
};

/**
 * Story 6: Deep Hierarchy - 4 levels deep
 * Shows full hierarchy from CEO down to team leads
 */
export const DeepHierarchy: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "org-tree-filter-deep-hierarchy" },
    docs: {
      description: {
        story:
          "Complete 4-level organizational hierarchy from CEO to team leads. " +
          "Demonstrates: Jennifer Williams (CEO) → Sarah Chen (VP Engineering) → " +
          "David Rodriguez (Director Backend) → James Wilson (Team Lead). " +
          "Each level is indented further to show hierarchy depth. " +
          "Expand/collapse icons allow users to navigate the tree efficiently. " +
          "Great for large organizations with multiple management layers.",
      },
    },
  },
  render: () => <OrgTreeFilterWrapper />,
};

/**
 * Story 7: Single Selection - One manager selected
 * Common use case for filtering by a single team
 */
export const SingleSelection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Single manager selected for team filtering. " +
          "Sarah Chen (VP Engineering) is selected, which would filter " +
          "the grid to show only her 18 direct and indirect reports. " +
          "This is a common use case for reviewing a specific team's performance.",
      },
    },
  },
  render: () => (
    <OrgTreeFilterWrapper initialSelectedManagers={["Sarah Chen"]} />
  ),
};

/**
 * Story 8: Team Leads Only - Filtering to show only team leads
 * Shows a subset focused on front-line managers
 */
export const TeamLeadsOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Filtered view showing only team leads (front-line managers). " +
          "Displays managers like James Wilson, Lisa Martinez, Kevin Brown, and Rachel Green. " +
          "Each has a small team size (2-3 employees). " +
          "Useful for reviewing performance at the team lead level. " +
          "NOTE: This filtering would typically be done at the backend/store level.",
      },
    },
  },
  render: () => {
    // Filter to show only team leads and their reports
    const teamLeadNames = [
      "James Wilson",
      "Lisa Martinez",
      "Kevin Brown",
      "Rachel Green",
    ];
    const teamLeadEmployees = mockData.employees.filter(
      (e) => teamLeadNames.includes(e.name) || teamLeadNames.includes(e.manager)
    );
    return <OrgTreeFilterWrapper employees={teamLeadEmployees} />;
  },
};

/**
 * Story 9: Interactive - Fully interactive for testing
 * Allows clicking and selecting managers in Storybook
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive tree allowing you to expand/collapse nodes " +
          "and select/deselect managers. Try clicking expand icons to navigate " +
          "the hierarchy and checkboxes to select managers. " +
          "Selected managers are tracked in component state.",
      },
    },
  },
  render: () => <OrgTreeFilterWrapper />,
};

/**
 * Story 10: Large Organization - Many managers
 * Stress test with extensive hierarchy
 */
export const LargeOrganization: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Full organizational view with all 15 managers across the company. " +
          "Demonstrates performance and usability with a realistic org structure. " +
          "Includes multiple levels and branches. " +
          "Tree remains performant and navigable even with many nodes. " +
          "Sorted by team size to show largest teams first.",
      },
    },
  },
  render: () => <OrgTreeFilterWrapper />,
};

/**
 * Story 11: Within FilterDrawer Context - Shows component in actual usage
 * Simulates how it appears within the FilterDrawer with proper styling
 */
export const WithinFilterDrawer: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "org-tree-filter-in-drawer" },
    docs: {
      description: {
        story:
          "OrgTreeFilter as it appears within the FilterDrawer context. " +
          "Shows proper spacing, width constraints (280px drawer width), " +
          "and integration with FilterSection component. " +
          "This is how users will actually see and interact with the tree " +
          "when using the Managers filter section.",
      },
    },
  },
  render: () => (
    <Box
      sx={{
        width: 280,
        backgroundColor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ p: 1 }}>
        <OrgTreeFilterWrapper />
      </Box>
    </Box>
  ),
};

/**
 * Story 12: Selected Across Branches - Multiple managers from different branches
 * Shows selection across different parts of the org
 */
export const SelectedAcrossBranches: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "org-tree-filter-multiple-branches" },
    docs: {
      description: {
        story:
          "Managers selected from different organizational branches. " +
          "Sarah Chen (Engineering), Marcus Lee (Product), and Peter Miller (Design) are selected. " +
          "This demonstrates cross-functional filtering where you might want to " +
          "review employees across multiple departments simultaneously. " +
          "Each department head's team would be included in the filtered results.",
      },
    },
  },
  render: () => (
    <OrgTreeFilterWrapper
      initialSelectedManagers={["Sarah Chen", "Marcus Lee", "Peter Miller"]}
    />
  ),
};
