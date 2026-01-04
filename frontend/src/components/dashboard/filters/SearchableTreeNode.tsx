import React from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { OrgTreeNode } from "../../../services/orgHierarchyService";
import { SearchHighlight } from "../../common/SearchHighlight";

export interface SearchableTreeNodeProps {
  node: OrgTreeNode;
  selectedManagers: string[];
  onToggleManager: (manager: string) => void;
  level: number;
  searchQuery: string;
  expandedNodes: Set<number>;
  onToggleExpand: (nodeId: number) => void;
}

export const SearchableTreeNode: React.FC<SearchableTreeNodeProps> = ({
  node,
  selectedManagers,
  onToggleManager,
  level,
  searchQuery,
  expandedNodes,
  onToggleExpand,
}) => {
  const theme = useTheme();
  const hasChildren = node.direct_reports.length > 0;
  const isSelected = selectedManagers.includes(node.name);
  const isExpanded = expandedNodes.has(node.employee_id);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          pl: level * 3, // Increased indentation for better hierarchy
          minHeight: theme.tokens.dimensions.menuItem.minHeight,
          py: `${theme.tokens.dimensions.menuItem.paddingY}px`,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {/* Expand/collapse button */}
        {hasChildren ? (
          <IconButton
            size="medium"
            onClick={() => onToggleExpand(node.employee_id)}
            sx={{ p: 1, mr: 0.5 }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        {/* Checkbox and label */}
        <FormControlLabel
          sx={{ flex: 1, m: 0 }}
          control={
            <Checkbox
              checked={isSelected}
              onChange={() => onToggleManager(node.name)}
              size="small"
              data-testid={`manager-checkbox-${node.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                <SearchHighlight text={node.name} query={searchQuery} />
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                }}
              >
                ({node.team_size})
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Child nodes */}
      {isExpanded && hasChildren && (
        <Box>
          {node.direct_reports.map((child) => (
            <SearchableTreeNode
              key={child.employee_id}
              node={child}
              selectedManagers={selectedManagers}
              onToggleManager={onToggleManager}
              level={level + 1}
              searchQuery={searchQuery}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
