import { describe, it, expect, vi } from "vitest";
import { traverseTree } from "../useOrgHierarchy";
import { OrgTreeNode } from "../../services/orgHierarchyService";

describe("traverseTree", () => {
  describe("circular reference detection", () => {
    it("should detect and skip circular references", () => {
      // Spy on console.warn to verify warning is logged
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Create a tree with circular reference
      const nodeA: OrgTreeNode = {
        employee_id: 1,
        name: "Alice",
        job_title: "Manager",
        team_size: 2,
        direct_reports: [],
      };

      const nodeB: OrgTreeNode = {
        employee_id: 2,
        name: "Bob",
        job_title: "Lead",
        team_size: 1,
        direct_reports: [],
      };

      // Create circular reference: A -> B -> A
      nodeA.direct_reports = [nodeB];
      nodeB.direct_reports = [nodeA];

      const visited = new Set<number>();
      const result = traverseTree([nodeA], 1, visited);

      // Should collect both IDs but stop at circular reference
      expect(result).toEqual([1, 2]);

      // Should have logged a warning
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Circular reference detected")
      );
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Alice"));

      warnSpy.mockRestore();
    });

    it("should traverse a normal tree without issues", () => {
      const tree: OrgTreeNode[] = [
        {
          employee_id: 1,
          name: "Manager",
          job_title: "CEO",
          team_size: 3,
          direct_reports: [
            {
              employee_id: 2,
              name: "Lead A",
              job_title: "Team Lead",
              team_size: 1,
              direct_reports: [
                {
                  employee_id: 3,
                  name: "Dev A",
                  job_title: "Developer",
                  team_size: 0,
                  direct_reports: [],
                },
              ],
            },
            {
              employee_id: 4,
              name: "Lead B",
              job_title: "Team Lead",
              team_size: 0,
              direct_reports: [],
            },
          ],
        },
      ];

      const visited = new Set<number>();
      const result = traverseTree(tree, 1, visited);

      // Should collect all IDs in traversal order
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should handle empty tree", () => {
      const visited = new Set<number>();
      const result = traverseTree([], 1, visited);

      expect(result).toEqual([]);
    });

    it("should share visited set across calls", () => {
      const nodeA: OrgTreeNode = {
        employee_id: 1,
        name: "Alice",
        job_title: "Manager",
        team_size: 0,
        direct_reports: [],
      };

      const nodeB: OrgTreeNode = {
        employee_id: 1, // Same ID as nodeA
        name: "Alice Clone",
        job_title: "Manager",
        team_size: 0,
        direct_reports: [],
      };

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const visited = new Set<number>();

      // First traversal adds node 1
      const result1 = traverseTree([nodeA], 1, visited);
      expect(result1).toEqual([1]);

      // Second traversal with same visited set should skip node 1
      const result2 = traverseTree([nodeB], 1, visited);
      expect(result2).toEqual([]); // Should be empty because 1 is already visited

      // Should have logged warning
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Circular reference detected")
      );

      warnSpy.mockRestore();
    });
  });
});
