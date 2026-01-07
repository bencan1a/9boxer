/**
 * Org Tree Filter Component
 *
 * Displays managers in a hierarchical tree structure showing the reporting
 * relationships. Each node shows the manager name and team size, with
 * expand/collapse functionality and checkbox selection.
 *
 * Features:
 * - Searchable tree with text highlighting
 * - Auto-expand matching nodes during search
 * - Uses backend org tree API for accurate hierarchy
 */

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { OrgTreeNode } from "../../../services/orgHierarchyService";
import { SearchableTreeNode } from "./SearchableTreeNode";
import { useDebounced } from "../../../hooks/useDebounced";

interface OrgTreeFilterProps {
  orgTree: OrgTreeNode[];
  selectedManagers: string[];
  onToggleManager: (manager: string) => void;
}

/**
 * Filter tree nodes based on search query
 * Returns nodes that match the query or have matching descendants
 */
const filterTree = (
  nodes: OrgTreeNode[],
  query: string
): { filteredNodes: OrgTreeNode[]; matchingIds: Set<number> } => {
  if (!query.trim()) {
    return { filteredNodes: nodes, matchingIds: new Set() };
  }

  const matchingIds = new Set<number>();
  const lowerQuery = query.toLowerCase();

  const filterNode = (node: OrgTreeNode): OrgTreeNode | null => {
    const nameMatches = node.name.toLowerCase().includes(lowerQuery);
    const filteredChildren = node.direct_reports
      .map(filterNode)
      .filter((n): n is OrgTreeNode => n !== null);

    // Include node if it matches or has matching descendants
    if (nameMatches || filteredChildren.length > 0) {
      if (nameMatches) {
        matchingIds.add(node.employee_id);
      }
      return {
        ...node,
        direct_reports: filteredChildren,
      };
    }

    return null;
  };

  const filteredNodes = nodes
    .map(filterNode)
    .filter((n): n is OrgTreeNode => n !== null);

  return { filteredNodes, matchingIds };
};

/**
 * Main OrgTreeFilter component with search
 */
export const OrgTreeFilter: React.FC<OrgTreeFilterProps> = ({
  orgTree,
  selectedManagers,
  onToggleManager,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounced(searchQuery, 300);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Filter tree and get matching node IDs
  const { filteredNodes } = useMemo(
    () => filterTree(orgTree, debouncedQuery),
    [orgTree, debouncedQuery]
  );

  // Auto-expand nodes when searching
  const effectiveExpandedNodes = useMemo(() => {
    if (debouncedQuery.trim()) {
      // When searching, expand all nodes to show matches
      const allIds = new Set<number>();
      const collectIds = (nodes: OrgTreeNode[]) => {
        nodes.forEach((node) => {
          allIds.add(node.employee_id);
          collectIds(node.direct_reports);
        });
      };
      collectIds(filteredNodes);
      return allIds;
    }
    // When not searching, use user-controlled expansion
    // Auto-expand top level by default
    if (expandedNodes.size === 0 && orgTree.length > 0) {
      return new Set(orgTree.map((node) => node.employee_id));
    }
    return expandedNodes;
  }, [debouncedQuery, expandedNodes, filteredNodes, orgTree]);

  const handleToggleExpand = (nodeId: number) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  if (orgTree.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No managers found
      </Typography>
    );
  }

  return (
    <Box data-testid="org-tree-filter">
      {/* Search input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search managers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                aria-label="Clear search"
                edge="end"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          backgroundColor: theme.palette.background.default,
        }}
      />

      {/* Tree nodes */}
      {filteredNodes.length > 0 ? (
        filteredNodes.map((node) => (
          <SearchableTreeNode
            key={node.employee_id}
            node={node}
            selectedManagers={selectedManagers}
            onToggleManager={onToggleManager}
            level={0}
            searchQuery={debouncedQuery}
            expandedNodes={effectiveExpandedNodes}
            onToggleExpand={handleToggleExpand}
          />
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No managers found matching &quot;{debouncedQuery}&quot;
        </Typography>
      )}
    </Box>
  );
};
