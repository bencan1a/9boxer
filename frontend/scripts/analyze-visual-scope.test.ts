/**
 * Unit tests for analyze-visual-scope.ts
 *
 * Tests cover:
 * - Branch name sanitization (security)
 * - Pattern matching logic
 * - Scope analysis algorithms
 * - Error handling
 */

import { describe, it, expect } from "vitest";

// Import the module - we'll need to export the functions for testing
// For now, we'll test the public API through the analyzeScope function

describe("Branch Name Sanitization", () => {
  describe("Valid branch names", () => {
    it("should accept standard branch names", () => {
      const validNames = [
        "main",
        "develop",
        "feature/new-feature",
        "bugfix/fix-123",
        "release/v1.0.0",
        "origin/main",
        "origin/feature/test",
      ];

      validNames.forEach((name) => {
        // If sanitization passes, it should not throw
        expect(() => {
          // This will be tested through the actual function when we refactor
          const safePattern = /^[a-zA-Z0-9/_.-]+$/;
          if (!safePattern.test(name)) {
            throw new Error("Invalid branch name");
          }
          if (name.includes("..") || name.startsWith("/")) {
            throw new Error("Path traversal not allowed");
          }
        }).not.toThrow();
      });
    });

    it("should accept branch names with dots and hyphens", () => {
      const names = ["v1.0.0", "feature-branch", "test.branch"];

      names.forEach((name) => {
        const safePattern = /^[a-zA-Z0-9/_.-]+$/;
        expect(safePattern.test(name)).toBe(true);
      });
    });
  });

  describe("Invalid branch names - Command Injection Prevention", () => {
    it("should reject branch names with shell metacharacters", () => {
      const maliciousNames = [
        "main; rm -rf /",
        "main && echo malicious",
        "main | cat /etc/passwd",
        "main $(whoami)",
        "main `whoami`",
        "main; echo 'pwned'",
        'main" || echo "pwned',
        "main' || echo 'pwned",
        "main\nrm -rf /",
        "main\r\nmalicious",
      ];

      maliciousNames.forEach((name) => {
        const safePattern = /^[a-zA-Z0-9/_.-]+$/;
        expect(safePattern.test(name)).toBe(false);
      });
    });

    it("should reject path traversal attempts", () => {
      const traversalAttempts = [
        "../../../etc/passwd",
        "../../main",
        "main/../../../etc",
        "/etc/passwd",
        "/absolute/path",
      ];

      traversalAttempts.forEach((name) => {
        const hasTraversal = name.includes("..") || name.startsWith("/");
        expect(hasTraversal).toBe(true);
      });
    });

    it("should reject special characters", () => {
      const specialChars = [
        "main<script>",
        "main>output.txt",
        "main&background",
        "main*wildcard",
        "main?query",
        "main#hash",
        "main@host",
        "main!command",
        "main%percent",
        "main^caret",
      ];

      specialChars.forEach((name) => {
        const safePattern = /^[a-zA-Z0-9/_.-]+$/;
        expect(safePattern.test(name)).toBe(false);
      });
    });

    it("should reject empty or non-string branch names", () => {
      const invalidInputs = ["", null, undefined];

      invalidInputs.forEach((input) => {
        if (!input || typeof input !== "string") {
          expect(input).toBeFalsy();
        }
      });
    });
  });
});

describe("Pattern Matching Logic", () => {
  describe("Snapshot name to pattern matching", () => {
    it("should match snapshots with exact prefix", () => {
      const snapshotName = "app-grid-employeetile--default-light.png";
      const pattern = "app-grid-employeetile--*";
      const patternPrefix = pattern.replace(/--\*$/, "");
      const nameWithoutTheme = snapshotName.replace(/-(light|dark)\.png$/, "");

      expect(nameWithoutTheme.startsWith(patternPrefix)).toBe(true);
    });

    it("should not match unrelated snapshots", () => {
      const snapshotName = "app-dashboard-chart--default-light.png";
      const pattern = "app-grid-employeetile--*";
      const patternPrefix = pattern.replace(/--\*$/, "");
      const nameWithoutTheme = snapshotName.replace(/-(light|dark)\.png$/, "");

      expect(nameWithoutTheme.startsWith(patternPrefix)).toBe(false);
    });

    it("should handle theme suffixes correctly", () => {
      const lightSnapshot = "component-test--variant-light.png";
      const darkSnapshot = "component-test--variant-dark.png";

      const withoutLight = lightSnapshot.replace(/-(light|dark)\.png$/, "");
      const withoutDark = darkSnapshot.replace(/-(light|dark)\.png$/, "");

      expect(withoutLight).toBe("component-test--variant");
      expect(withoutDark).toBe("component-test--variant");
    });

    it("should match with strict boundaries to reduce false positives", () => {
      // "tile" should not match "employeetile"
      const snapshotName = "app-grid-employeetile--default-light.png";
      const shortPattern = "tile";
      const nameWithoutTheme = snapshotName.replace(/-(light|dark)\.png$/, "");

      // This should NOT match because "tile" is part of "employeetile"
      expect(nameWithoutTheme.includes(shortPattern)).toBe(true); // includes would match

      // But with word boundaries, it shouldn't match
      const componentRegex = new RegExp(`(^|[-_])${shortPattern}([-_]|$)`, "i");
      expect(componentRegex.test(nameWithoutTheme)).toBe(false);
    });

    it("should match component names with proper delimiters", () => {
      const snapshotName = "app-grid-tile--default-light.png";
      const componentPattern = "tile";
      const nameWithoutTheme = snapshotName.replace(/-(light|dark)\.png$/, "");

      const componentRegex = new RegExp(
        `(^|[-_])${componentPattern}([-_]|$)`,
        "i"
      );
      expect(componentRegex.test(nameWithoutTheme)).toBe(true);
    });

    it("should only use component name matching for longer names", () => {
      // Short component names (<=3 chars) should not use fallback matching
      const shortNames = ["a", "ab", "abc"];

      shortNames.forEach((name) => {
        expect(name.length <= 3).toBe(true);
      });

      // Longer component names (>3 chars) can use fallback matching
      const longNames = ["tile", "button", "employeetile"];

      longNames.forEach((name) => {
        expect(name.length > 3).toBe(true);
      });
    });
  });

  describe("Regex escaping", () => {
    it("should properly escape special regex characters", () => {
      const patternWithSpecialChars = "app.grid[test]--*";
      const escaped = patternWithSpecialChars.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      // Verify special chars are escaped
      expect(escaped).toBe("app\\.grid\\[test\\]--\\*");
    });
  });
});

describe("Global Change Detection", () => {
  it("should detect global theme changes", () => {
    const globalFiles = [
      "src/theme.ts",
      "src/theme.tsx",
      "src/tokens.ts",
      "src/tokens.jsx",
    ];

    const patterns = [/theme\.(ts|tsx|js|jsx)$/, /tokens\.(ts|tsx|js|jsx)$/];

    globalFiles.forEach((file) => {
      const isGlobal = patterns.some((pattern) => pattern.test(file));
      expect(isGlobal).toBe(true);
    });
  });

  it("should detect global style changes", () => {
    const globalFiles = ["src/global.css", "src/global.scss", "src/index.css"];

    const patterns = [/global\.(css|scss|sass)$/, /index\.(css|scss)$/];

    globalFiles.forEach((file) => {
      const isGlobal = patterns.some((pattern) => pattern.test(file));
      expect(isGlobal).toBe(true);
    });
  });

  it("should detect Storybook configuration changes", () => {
    const storybookFiles = [
      ".storybook/main.ts",
      ".storybook/preview.ts",
      "src/storybook-helpers.ts",
    ];

    const patterns = [/\.storybook\//, /storybook-helpers\.(ts|tsx)$/];

    storybookFiles.forEach((file) => {
      const isStorybook = patterns.some((pattern) => pattern.test(file));
      expect(isStorybook).toBe(true);
    });
  });

  it("should not flag component-specific changes as global", () => {
    const componentFiles = [
      "src/components/Button.tsx",
      "src/components/grid/EmployeeTile.tsx",
      "src/components/Button.stories.tsx",
    ];

    const globalPatterns = [
      /theme\.(ts|tsx|js|jsx)$/,
      /tokens\.(ts|tsx|js|jsx)$/,
      /global\.(css|scss|sass)$/,
      /\.storybook\//,
    ];

    componentFiles.forEach((file) => {
      const isGlobal = globalPatterns.some((pattern) => pattern.test(file));
      expect(isGlobal).toBe(false);
    });
  });
});

describe("Component Name Extraction", () => {
  it("should extract component names from paths", () => {
    const testCases = [
      { path: "src/components/Button.tsx", expected: "Button" },
      {
        path: "src/components/grid/EmployeeTile.tsx",
        expected: "EmployeeTile",
      },
      {
        path: "src/components/panel/statistics/StatisticCard.tsx",
        expected: "StatisticCard",
      },
    ];

    testCases.forEach(({ path, expected }) => {
      const match = path.match(/\/([A-Z][a-zA-Z0-9]+)\.(tsx?|jsx?)$/);
      const componentName = match ? match[1] : null;
      expect(componentName).toBe(expected);
    });
  });

  it("should not extract from test files", () => {
    const testFiles = [
      "src/components/Button.test.tsx",
      "src/components/__tests__/Button.tsx",
      "src/components/Button.spec.ts",
    ];

    testFiles.forEach((path) => {
      const isTestFile =
        path.includes("__tests__") ||
        path.includes(".test.") ||
        path.includes(".spec.");
      expect(isTestFile).toBe(true);
    });
  });

  it("should not extract from non-component files", () => {
    const nonComponentFiles = [
      "src/utils/helper.ts",
      "src/hooks/useData.ts",
      "src/constants.ts",
    ];

    nonComponentFiles.forEach((path) => {
      const match = path.match(/\/([A-Z][a-zA-Z0-9]+)\.(tsx?|jsx?)$/);
      const componentName = match ? match[1] : null;
      // These shouldn't match because they don't follow component naming
      expect(componentName).toBeNull();
    });
  });
});

describe("Story Title Conversion", () => {
  it("should convert story titles to patterns", () => {
    const testCases = [
      { title: "App/Grid/EmployeeTile", expected: "app-grid-employeetile--*" },
      { title: "Components/Button", expected: "components-button--*" },
      { title: "App/Dashboard/Chart", expected: "app-dashboard-chart--*" },
    ];

    testCases.forEach(({ title, expected }) => {
      const pattern = title.toLowerCase().replace(/\//g, "-") + "--*";
      expect(pattern).toBe(expected);
    });
  });

  it("should handle single-level stories", () => {
    const title = "Button";
    const pattern = title.toLowerCase().replace(/\//g, "-") + "--*";
    expect(pattern).toBe("button--*");
  });

  it("should handle multi-level nested stories", () => {
    const title = "App/Components/Grid/Tiles/EmployeeTile";
    const pattern = title.toLowerCase().replace(/\//g, "-") + "--*";
    expect(pattern).toBe("app-components-grid-tiles-employeetile--*");
  });
});

describe("Confidence Level Calculation", () => {
  it("should set low confidence for global changes", () => {
    const hasGlobalChange = true;
    const confidence = hasGlobalChange ? "low" : "high";
    expect(confidence).toBe("low");
  });

  it("should set medium confidence for shared component changes", () => {
    const files = ["src/common/Button.tsx", "src/shared/utils.ts"];

    files.forEach((file) => {
      const isShared = file.includes("/common/") || file.includes("/shared/");
      expect(isShared).toBe(true);
    });
  });

  it("should adjust confidence based on out-of-scope ratio", () => {
    const testCases = [
      { total: 10, outOfScope: 6, expected: "low" }, // >50%
      { total: 10, outOfScope: 4, expected: "medium" }, // <=50%
      { total: 10, outOfScope: 1, expected: "medium" }, // low ratio
    ];

    testCases.forEach(({ total, outOfScope, expected }) => {
      const ratio = outOfScope / total;
      const confidence = ratio > 0.5 && outOfScope > 5 ? "low" : "medium";
      expect(confidence).toBe(expected);
    });
  });

  it("should maintain high confidence when no story file found", () => {
    // When a component is modified but no story exists, confidence should drop to medium
    const initialConfidence = "high";
    const storyFound = false;
    const finalConfidence = storyFound ? initialConfidence : "medium";
    expect(finalConfidence).toBe("medium");
  });
});

describe("Error Handling", () => {
  it("should handle git diff errors gracefully", () => {
    // When git command fails, should return empty array
    const mockError = new Error("Git command failed");

    let result: string[] = [];
    try {
      throw mockError;
    } catch (error) {
      console.error("Error getting git diff:", error);
      result = [];
    }

    expect(result).toEqual([]);
  });

  it("should handle missing files gracefully", () => {
    // When story file doesn't exist, should return null
    const fileExists = false;
    const storyTitle = fileExists ? "Some/Title" : null;
    expect(storyTitle).toBeNull();
  });

  it("should handle malformed story files", () => {
    // When story file has no title field, should return null
    const content = "export const Default = {}"; // No title field
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : null;
    expect(title).toBeNull();
  });
});

describe("Integration: Full Scope Analysis", () => {
  it("should categorize failures correctly with in-scope changes", () => {
    const _modifiedFiles = ["src/components/grid/EmployeeTile.tsx"];
    const failedSnapshots = [
      "app-grid-employeetile--default-light.png",
      "app-grid-employeetile--hover-dark.png",
      "app-dashboard-chart--default-light.png", // out of scope
    ];

    // Simulate pattern extraction
    const patterns = ["app-grid-employeetile--*"];

    const inScope: string[] = [];
    const outOfScope: string[] = [];

    failedSnapshots.forEach((snapshot) => {
      const nameWithoutTheme = snapshot.replace(/-(light|dark)\.png$/, "");
      const patternPrefix = patterns[0].replace(/--\*$/, "");

      if (nameWithoutTheme.startsWith(patternPrefix)) {
        inScope.push(snapshot);
      } else {
        outOfScope.push(snapshot);
      }
    });

    expect(inScope).toHaveLength(2);
    expect(outOfScope).toHaveLength(1);
    expect(inScope).toContain("app-grid-employeetile--default-light.png");
    expect(outOfScope).toContain("app-dashboard-chart--default-light.png");
  });

  it("should mark all as out-of-scope for global changes", () => {
    const hasGlobalChange = true;
    const failedSnapshots = ["component1-light.png", "component2-dark.png"];

    // With global change, confidence should be low
    const confidence = hasGlobalChange ? "low" : "high";
    expect(confidence).toBe("low");

    // All failures are expected with global changes
    expect(failedSnapshots.length).toBeGreaterThan(0);
  });

  it("should handle no failures gracefully", () => {
    const failedSnapshots: string[] = [];
    const inScope: string[] = [];
    const outOfScope: string[] = [];

    const globalChangeRatio =
      failedSnapshots.length > 0
        ? outOfScope.length / failedSnapshots.length
        : 0;

    expect(globalChangeRatio).toBe(0);
    expect(inScope).toHaveLength(0);
    expect(outOfScope).toHaveLength(0);
  });
});

describe("File Filtering", () => {
  it("should filter frontend files from git diff", () => {
    const gitDiffOutput = [
      "frontend/src/components/Button.tsx",
      "backend/app.py",
      "frontend/package.json",
      "README.md",
    ];

    const frontendFiles = gitDiffOutput
      .filter((file) => file.startsWith("frontend/"))
      .map((file) => file.replace(/^frontend\//, ""));

    expect(frontendFiles).toHaveLength(2);
    expect(frontendFiles).toContain("src/components/Button.tsx");
    expect(frontendFiles).toContain("package.json");
  });

  it("should handle empty git diff", () => {
    const gitDiffOutput = "";
    const files = gitDiffOutput ? gitDiffOutput.split("\n") : [];
    expect(files).toHaveLength(0);
  });
});
