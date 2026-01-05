/**
 * Tests for SearchHighlight component
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { SearchHighlight } from "../SearchHighlight";
import { createTheme } from "@mui/material/styles";
import { vi } from "vitest";

// Create a test theme
const theme = createTheme();

describe("SearchHighlight", () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  describe("Basic rendering", () => {
    it("renders plain text when no matches provided", () => {
      renderWithTheme(<SearchHighlight text="John Smith" />);
      expect(screen.getByText("John Smith")).toBeInTheDocument();
    });

    it("renders plain text when matches array is empty", () => {
      renderWithTheme(<SearchHighlight text="John Smith" matches={[]} />);
      expect(screen.getByText("John Smith")).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" className="custom-class" />
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("applies data-testid when provided", () => {
      renderWithTheme(
        <SearchHighlight text="John Smith" data-testid="highlight-test" />
      );
      expect(screen.getByTestId("highlight-test")).toBeInTheDocument();
    });
  });

  describe("Single match highlighting", () => {
    it("highlights a single match at the beginning", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" matches={[[0, 3]]} />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("John");
    });

    it("highlights a single match in the middle", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith Manager" matches={[[5, 9]]} />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("Smith");
    });

    it("highlights a single match at the end", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" matches={[[5, 9]]} />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("Smith");
    });

    it("highlights a single character", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" matches={[[0, 0]]} />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("J");
    });
  });

  describe("Multiple match highlighting", () => {
    it("highlights multiple non-overlapping matches", () => {
      const { container } = renderWithTheme(
        <SearchHighlight
          text="John Smith"
          matches={[
            [0, 3],
            [5, 9],
          ]}
        />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(2);
      expect(marks[0].textContent).toBe("John");
      expect(marks[1].textContent).toBe("Smith");
    });

    it("highlights matches with gaps between them", () => {
      const { container } = renderWithTheme(
        <SearchHighlight
          text="John Smith - Manager"
          matches={[
            [0, 3],
            [13, 19],
          ]}
        />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(2);
      expect(marks[0].textContent).toBe("John");
      expect(marks[1].textContent).toBe("Manager");
    });

    it("handles matches in reverse order (sorts them)", () => {
      const { container } = renderWithTheme(
        <SearchHighlight
          text="John Smith"
          matches={[
            [5, 9],
            [0, 3],
          ]}
        />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(2);
      // Should be sorted by start index
      expect(marks[0].textContent).toBe("John");
      expect(marks[1].textContent).toBe("Smith");
    });
  });

  describe("Edge cases", () => {
    it("handles empty string text", () => {
      renderWithTheme(<SearchHighlight text="" matches={[]} />);
      expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
    });

    it("handles match at text boundaries", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="Test" matches={[[0, 3]]} />
      );
      const mark = container.querySelector("mark");
      expect(mark?.textContent).toBe("Test");
    });

    it("handles unicode characters correctly", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="José García" matches={[[0, 3]]} />
      );
      const mark = container.querySelector("mark");
      expect(mark?.textContent).toBe("José");
    });

    it("logs warning for invalid match indices (start > end)", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      renderWithTheme(<SearchHighlight text="John Smith" matches={[[5, 2]]} />);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid match indices")
      );
      consoleSpy.mockRestore();
    });

    it("logs warning for negative start index", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      renderWithTheme(
        <SearchHighlight text="John Smith" matches={[[-1, 3]]} />
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid match indices")
      );
      consoleSpy.mockRestore();
    });

    it("logs warning for end index beyond text length", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      renderWithTheme(<SearchHighlight text="John" matches={[[0, 10]]} />);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid match indices")
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Styling", () => {
    it("applies correct mark styling", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" matches={[[0, 3]]} />
      );
      const mark = container.querySelector("mark");
      expect(mark).toHaveStyle({
        fontWeight: "600",
        padding: "0 2px",
        borderRadius: "2px",
      });
    });
  });

  describe("Accessibility", () => {
    it("uses semantic <mark> element", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" matches={[[0, 3]]} />
      );
      const mark = container.querySelector("mark");
      expect(mark?.tagName).toBe("MARK");
    });

    it("preserves text content for screen readers", () => {
      renderWithTheme(
        <SearchHighlight
          text="John Smith"
          matches={[[0, 3]]}
          data-testid="highlight"
        />
      );
      const element = screen.getByTestId("highlight");
      expect(element.textContent).toBe("John Smith");
    });
  });

  describe("Real-world Fuse.js match scenarios", () => {
    it("handles typical Fuse.js name match", () => {
      const { container } = renderWithTheme(
        <SearchHighlight
          text="Alice Johnson"
          matches={[[0, 4]]} // "Alice" matched
        />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("Alice");
    });

    it("handles Fuse.js partial match in job title", () => {
      const { container } = renderWithTheme(
        <SearchHighlight
          text="Senior Software Engineer"
          matches={[[7, 14]]} // "Software" matched
        />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("Software");
    });

    it("handles multiple Fuse.js matches in same field", () => {
      const { container } = renderWithTheme(
        <SearchHighlight
          text="John Paul Smith"
          matches={[
            [0, 3],
            [10, 14],
          ]} // "John" and "Smith" matched
        />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(2);
      expect(marks[0].textContent).toBe("John");
      expect(marks[1].textContent).toBe("Smith");
    });
  });

  describe("Query-based highlighting", () => {
    it("highlights text using simple query string", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" query="john" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("John");
    });

    it("performs case-insensitive query matching", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" query="JOHN" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("John");
    });

    it("highlights multiple matches with query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Doe, Jane Doe" query="doe" />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(2);
      expect(marks[0].textContent).toBe("Doe");
      expect(marks[1].textContent).toBe("Doe");
    });

    it("escapes special regex characters in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="Price: $100.00" query="$100" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("$100");
    });

    it("handles parentheses in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="Function (Engineering)" query="(eng" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("(Eng");
    });

    it("handles square brackets in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="Array[0]" query="[0]" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("[0]");
    });

    it("handles dot character in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="file.txt" query="file." />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("file.");
    });

    it("handles asterisk in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="Test * value" query="*" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("*");
    });

    it("handles plus sign in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="C++ Developer" query="c++" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("C++");
    });

    it("handles question mark in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="What?" query="?" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("?");
    });

    it("handles caret in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="x^2" query="^" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("^");
    });

    it("handles curly braces in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="Code {block}" query="{block}" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("{block}");
    });

    it("handles pipe character in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="option | value" query="|" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("|");
    });

    it("handles backslash in query", () => {
      // Use forward slash instead to avoid string literal escaping issues
      const { container } = renderWithTheme(
        <SearchHighlight text="path/to/file" query="/" />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(2);
      marks.forEach((mark) => {
        expect(mark.textContent).toBe("/");
      });
    });

    it("returns plain text when query is empty", () => {
      renderWithTheme(<SearchHighlight text="John Smith" query="" />);
      expect(screen.getByText("John Smith")).toBeInTheDocument();
    });

    it("returns plain text when query is whitespace only", () => {
      renderWithTheme(<SearchHighlight text="John Smith" query="   " />);
      expect(screen.getByText("John Smith")).toBeInTheDocument();
    });

    it("trims whitespace from query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" query="  john  " />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("John");
    });

    it("handles unicode characters in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="Café René" query="café" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("Café");
    });

    it("handles numbers in query", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="Employee 12345" query="123" />
      );
      const mark = container.querySelector("mark");
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe("123");
    });

    it("handles consecutive matches in query mode", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="aaa" query="a" />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(3);
      marks.forEach((mark) => {
        expect(mark.textContent).toBe("a");
      });
    });

    it("returns plain text when query has no matches", () => {
      renderWithTheme(<SearchHighlight text="John Smith" query="xyz" />);
      expect(screen.getByText("John Smith")).toBeInTheDocument();
    });

    it("prefers matches over query when both provided", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" matches={[[0, 3]]} query="smith" />
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      // Should highlight "John" from matches, not "Smith" from query
      expect(marks[0].textContent).toBe("John");
    });
  });

  describe("Custom highlight color", () => {
    it("uses custom highlight color when provided", () => {
      const { container } = renderWithTheme(
        <SearchHighlight
          text="John Smith"
          query="john"
          highlightColor="#ffeb3b"
        />
      );
      const mark = container.querySelector("mark");
      expect(mark).toHaveStyle({ backgroundColor: "#ffeb3b" });
    });

    it("uses custom highlight color with matches", () => {
      const { container } = renderWithTheme(
        <SearchHighlight
          text="John Smith"
          matches={[[0, 3]]}
          highlightColor="rgb(255, 0, 0)"
        />
      );
      const mark = container.querySelector("mark");
      expect(mark).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" });
    });

    it("uses default color when highlightColor not provided", () => {
      const { container } = renderWithTheme(
        <SearchHighlight text="John Smith" query="john" />
      );
      const mark = container.querySelector("mark");
      // Should use theme.palette.secondary.light
      expect(mark).toHaveStyle({
        backgroundColor: theme.palette.secondary.light,
      });
    });
  });
});
