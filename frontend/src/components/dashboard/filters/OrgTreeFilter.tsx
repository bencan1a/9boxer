/**
 * Org Tree Filter Component
 *
 * Displays managers in a hierarchical tree structure showing the reporting
 * relationships. Each node shows the manager name and team size, with
 * expand/collapse functionality and checkbox selection.
 */

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ManagerInfo } from "../../../services/orgHierarchyService";
import { Employee } from "../../../types/employee";

interface ManagerTreeNode {
  managerInfo: ManagerInfo;
  directReports: ManagerTreeNode[];
  managerData?: Employee; // Full employee data for this manager
}

interface OrgTreeFilterProps {
  managers: ManagerInfo[];
  employees: Employee[];
  selectedManagers: string[];
  onToggleManager: (manager: string) => void;
}

/**
 * Build a hierarchical tree structure from flat manager list
 */
const buildManagerTree = (
  managers: ManagerInfo[],
  employees: Employee[]
): ManagerTreeNode[] => {
  // Create a map of manager names to their ManagerInfo
  const managerMap = new Map(managers.map((m) => [m.name, m]));

  // Create a map of manager names to their employee data
  const managerEmployeeMap = new Map<string, Employee>();
  employees.forEach((emp) => {
    if (managerMap.has(emp.name)) {
      managerEmployeeMap.set(emp.name, emp);
    }
  });

  // Create nodes for all managers
  const nodeMap = new Map<string, ManagerTreeNode>();
  managers.forEach((manager) => {
    nodeMap.set(manager.name, {
      managerInfo: manager,
      directReports: [],
      managerData: managerEmployeeMap.get(manager.name),
    });
  });

  // Build the tree structure by linking managers to their direct reports
  const rootNodes: ManagerTreeNode[] = [];

  managers.forEach((manager) => {
    const node = nodeMap.get(manager.name);
    if (!node) return;

    const managerEmployee = managerEmployeeMap.get(manager.name);
    const reportsTo = managerEmployee?.manager;

    if (reportsTo && nodeMap.has(reportsTo)) {
      // This manager reports to another manager in our list
      const parentNode = nodeMap.get(reportsTo);
      if (parentNode) {
        parentNode.directReports.push(node);
      }
    } else {
      // This is a root node (no manager or manager not in our manager list)
      rootNodes.push(node);
    }
  });

  // Sort nodes at each level by team size (desc) then name
  const sortNodes = (nodes: ManagerTreeNode[]) => {
    nodes.sort((a, b) => {
      const teamDiff = b.managerInfo.team_size - a.managerInfo.team_size;
      if (teamDiff !== 0) return teamDiff;
      return a.managerInfo.name.localeCompare(b.managerInfo.name);
    });
    nodes.forEach((node) => sortNodes(node.directReports));
  };

  sortNodes(rootNodes);

  return rootNodes;
};

/**
 * Recursive tree node component
 */
const TreeNode: React.FC<{
  node: ManagerTreeNode;
  selectedManagers: string[];
  onToggleManager: (manager: string) => void;
  level: number;
}> = ({ node, selectedManagers, onToggleManager, level }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(level === 0); // Auto-expand top level

  const hasChildren = node.directReports.length > 0;
  const isSelected = selectedManagers.includes(node.managerInfo.name);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          pl: level * 2,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {/* Expand/collapse button */}
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ p: 0.5 }}
          >
            {expanded ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
        ) : (
          <Box sx={{ width: 28 }} /> // Spacer for alignment
        )}

        {/* Checkbox and label */}
        <FormControlLabel
          sx={{ flex: 1, m: 0 }}
          control={
            <Checkbox
              checked={isSelected}
              onChange={() => onToggleManager(node.managerInfo.name)}
              size="small"
              data-testid={`manager-checkbox-${node.managerInfo.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                {node.managerInfo.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                }}
              >
                ({node.managerInfo.team_size})
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Child nodes */}
      {expanded && hasChildren && (
        <Box>
          {node.directReports.map((child) => (
            <TreeNode
              key={child.managerInfo.employee_id}
              node={child}
              selectedManagers={selectedManagers}
              onToggleManager={onToggleManager}
              level={level + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

/**
 * Main OrgTreeFilter component
 */
export const OrgTreeFilter: React.FC<OrgTreeFilterProps> = ({
  managers,
  employees,
  selectedManagers,
  onToggleManager,
}) => {
  const tree = useMemo(
    () => buildManagerTree(managers, employees),
    [managers, employees]
  );

  if (managers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No managers found
      </Typography>
    );
  }

  return (
    <Box>
      {tree.map((node) => (
        <TreeNode
          key={node.managerInfo.employee_id}
          node={node}
          selectedManagers={selectedManagers}
          onToggleManager={onToggleManager}
          level={0}
        />
      ))}
    </Box>
  );
};
