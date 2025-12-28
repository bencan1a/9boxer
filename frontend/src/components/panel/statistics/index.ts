/**
 * Statistics Panel Components
 *
 * Reusable components for displaying employee distribution statistics.
 *
 * @module components/panel/statistics
 */

// Atoms (smallest components)
export { StatisticCard } from "./StatisticCard";
export type { StatisticCardProps } from "./StatisticCard";

export { GroupingIndicator } from "./GroupingIndicator";
export type { GroupingIndicatorProps } from "./GroupingIndicator";

export { ColoredPercentageBar } from "./ColoredPercentageBar";
export type { ColoredPercentageBarProps } from "./ColoredPercentageBar";

// Molecules (composed of atoms)
export { StatisticsSummary } from "./StatisticsSummary";
export type { StatisticsSummaryProps } from "./StatisticsSummary";

export { DistributionRow } from "./DistributionRow";
export type { DistributionRowProps } from "./DistributionRow";

// Organisms (complex components)
export { DistributionTable } from "./DistributionTable";
export type { DistributionTableProps } from "./DistributionTable";
