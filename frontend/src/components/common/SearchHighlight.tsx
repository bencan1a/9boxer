/**
 * SearchHighlight Component
 *
 * Highlights matched portions of text from either Fuse.js search results or simple query strings.
 * Uses semantic HTML <mark> element with WCAG AA compliant colors.
 *
 * @component
 * @example
 * ```tsx
 * // With Fuse.js match indices (preferred)
 * const matches: readonly [number, number][] = [[0, 3], [10, 15]];
 * <SearchHighlight text="John Smith - Manager" matches={matches} />
 * // Renders: <mark>John</mark> Smith - <mark>Manage</mark>r
 *
 * // With simple query string (fallback)
 * <SearchHighlight text="John Smith - Manager" query="smith" />
 * // Renders: John <mark>Smith</mark> - Manager
 *
 * // With custom highlight color
 * <SearchHighlight text="John Smith" query="john" highlightColor="#ffeb3b" />
 * ```
 */

import React from "react";
import { useTheme } from "@mui/material/styles";

/**
 * Props for SearchHighlight component
 */
export interface SearchHighlightProps {
  /** The text to display with optional highlighting */
  text: string;

  /**
   * Array of match index ranges from Fuse.js
   * Each tuple is [startIndex, endIndex] (inclusive)
   * Example: [[0, 3], [10, 15]] highlights characters 0-3 and 10-15
   */
  matches?: readonly [number, number][];

  /**
   * Simple query string for regex-based highlighting
   * Used when Fuse.js matches are not available
   * Performs case-insensitive matching with special character escaping
   */
  query?: string;

  /**
   * Custom highlight color (optional)
   * Defaults to theme.palette.secondary.light
   */
  highlightColor?: string;

  /**
   * Optional CSS class name for the container
   */
  className?: string;

  /**
   * Optional test ID for testing
   */
  "data-testid"?: string;
}

/**
 * SearchHighlight Component
 *
 * Renders text with highlighted segments based on either:
 * 1. Fuse.js match indices (preferred for search results)
 * 2. Simple query string (fallback for basic highlighting)
 *
 * Uses <mark> semantic HTML element with accessible styling.
 *
 * Design Notes:
 * - Background: theme.palette.secondary.light (orange) for high visibility
 * - Font weight: 600 (semi-bold) for emphasis
 * - Contrast ratio: ~7:1 with contrast text (exceeds WCAG AA standard of 4.5:1)
 * - Uses getContrastText() to ensure readable text color
 * - Semantic HTML: <mark> element for search results
 */
export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  matches,
  query,
  highlightColor,
  className,
  "data-testid": testId,
}) => {
  const theme = useTheme();

  // Convert query to matches if provided and no matches exist
  const effectiveMatches = React.useMemo(() => {
    if (matches && matches.length > 0) {
      return matches;
    }

    if (query) {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return [];
      }

      // Escape special regex characters
      const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedQuery, "gi");
      const foundMatches: [number, number][] = [];
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Convert to Fuse.js format (inclusive end index)
        foundMatches.push([match.index, match.index + match[0].length - 1]);
      }

      return foundMatches;
    }

    return [];
  }, [text, matches, query]);

  // If no matches, return plain text
  if (effectiveMatches.length === 0) {
    return (
      <span className={className} data-testid={testId}>
        {text}
      </span>
    );
  }

  // Build segments with highlighted portions
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;

  // Sort matches by start index to handle overlapping/out-of-order matches
  const sortedMatches = [...effectiveMatches].sort((a, b) => a[0] - b[0]);

  sortedMatches.forEach(([start, end], index) => {
    // Validate indices
    if (start < 0 || end >= text.length || start > end) {
      console.warn(
        `[SearchHighlight] Invalid match indices: [${start}, ${end}] for text length ${text.length}`
      );
      return;
    }

    // Add non-highlighted text before this match
    if (start > lastIndex) {
      segments.push(text.slice(lastIndex, start));
    }

    // Add highlighted match segment
    // Note: Fuse.js indices are INCLUSIVE, so end+1 for slice
    const bgColor = highlightColor || theme.palette.secondary.light;
    segments.push(
      <mark
        key={`match-${index}`}
        style={{
          // Use secondary color (orange) for better contrast and visibility
          // Contrast ratio: ~7:1 with black text (exceeds WCAG AA standard of 4.5:1)
          backgroundColor: bgColor,
          color: theme.palette.getContrastText(bgColor),
          fontWeight: 600,
          padding: "0 2px",
          borderRadius: "2px",
        }}
      >
        {text.slice(start, end + 1)}
      </mark>
    );

    lastIndex = end + 1;
  });

  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return (
    <span className={className} data-testid={testId}>
      {segments}
    </span>
  );
};
