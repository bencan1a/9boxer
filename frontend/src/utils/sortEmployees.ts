/**
 * Smart three-tier sorting for employees within grid boxes
 *
 * Sorting priority:
 * 1. Tier 1 (Top): Modified employees (modified_in_session: true) - alphabetically sorted
 * 2. Tier 2 (Middle): Employees with flags (flags.length > 0) - alphabetically sorted
 * 3. Tier 3 (Bottom): Everyone else - alphabetically sorted
 *
 * Key rule: Modified status trumps flags (moved + flagged → Tier 1)
 */

import { Employee } from "../types/employee";

export function sortEmployees(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => {
    // Tier 1: Modified employees first
    const aModified = a.modified_in_session ? 0 : 1;
    const bModified = b.modified_in_session ? 0 : 1;
    if (aModified !== bModified) return aModified - bModified;

    // Tier 2: Employees with flags (if not modified)
    const aHasFlags = (a.flags?.length ?? 0) > 0 ? 0 : 1;
    const bHasFlags = (b.flags?.length ?? 0) > 0 ? 0 : 1;
    if (aHasFlags !== bHasFlags) return aHasFlags - bHasFlags;

    // Tier 3: Alphabetical by name (with defensive null handling)
    const aName = a.name ?? "";
    const bName = b.name ?? "";
    return aName.localeCompare(bName, undefined, {
      sensitivity: "base", // Case-insensitive, accent-sensitive
      numeric: true, // Handle "Employee 2" vs "Employee 10" correctly
    });
  });
}
