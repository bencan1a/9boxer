/**
 * Type definitions for Intelligence Panel components
 */

/**
 * Box position type (1-9)
 */
export type BoxPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Anomaly severity levels
 */
export type AnomalySeverity = "info" | "warning" | "critical";

/**
 * Anomaly types
 */
export type AnomalyType = "location" | "function" | "distribution" | "outlier";

/**
 * Anomaly data structure
 */
export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  title: string;
  description: string;
  affectedEmployees: string[]; // employee IDs
  suggestion?: string;
  confidence: number; // 0-1
}

/**
 * Insight types
 */
export type InsightType = "recommendation" | "observation" | "warning";

/**
 * Insight data structure
 */
export interface Insight {
  id: string;
  type: InsightType;
  text: string;
  confidence: number; // 0-1
  actionLabel?: string; // e.g., "View employees", "Export list"
  metadata?: {
    employeeCount?: number;
    affectedBoxes?: BoxPosition[];
  };
}

/**
 * Distribution segment data
 */
export interface DistributionSegment {
  position: BoxPosition;
  count: number;
  percentage: number;
  label: string;
}

/**
 * Distribution data structure
 */
export interface DistributionData {
  segments: DistributionSegment[];
  total: number;
  idealPercentages: { [key: string]: number }; // expected distribution
}

/**
 * Intelligence panel component props
 */
export interface IntelligencePanelProps {
  anomalies: Anomaly[];
  insights: Insight[];
  distribution: DistributionData;
  isLoading: boolean;
  error?: string;
  onAnomalyClick?: (anomaly: Anomaly) => void;
  onAnomalyDismiss?: (anomalyId: string) => void;
  onInsightAction?: (insightId: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

/**
 * Anomaly card component props
 */
export interface AnomalyCardProps {
  anomaly: Anomaly;
  onDismiss?: (id: string) => void;
  onClick?: (anomaly: Anomaly) => void;
  showActions?: boolean;
}

/**
 * Insight card component props
 */
export interface InsightCardProps {
  insight: Insight;
  onAction?: (id: string) => void;
  showConfidence?: boolean;
}

/**
 * Distribution chart component props
 */
export interface DistributionChartProps {
  data: DistributionData;
  showLabels?: boolean;
  interactive?: boolean;
  onSegmentClick?: (position: BoxPosition) => void;
}
