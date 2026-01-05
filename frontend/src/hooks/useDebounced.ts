/**
 * useDebounced Hook
 *
 * Debounces a value to reduce the frequency of updates.
 * Useful for search inputs to avoid excessive re-renders and API calls.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounced(searchQuery, 300);
 *
 * useEffect(() => {
 *   // This only runs 300ms after user stops typing
 *   performSearch(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 */

import { useState, useEffect } from "react";

export function useDebounced<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timeout if value changes before delay completes
    // This ensures we only update after user stops typing
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
