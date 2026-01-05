/**
 * Statistics data hook - calculates from filtered employees
 */

import { useMemo } from "react";
import { Employee, PerformanceLevel } from "../types/employee";
import { PositionDistribution } from "../types/api";
import { getPositionLabel } from "../constants/positionLabels";
import { PERFORMANCE_BUCKETS } from "../constants/performanceBuckets";

interface StatisticsData {
  total_employees: number;
  modified_employees: number;
  high_performers: number;
  distribution: PositionDistribution[];
  groupedStats?: {
    highPerformers: {
      positions: readonly number[];
      count: number;
      percentage: number;
    };
    middleTier: {
      positions: readonly number[];
      count: number;
      percentage: number;
    };
    lowPerformers: {
      positions: readonly number[];
      count: number;
      percentage: number;
    };
  };
}

interface UseStatisticsResult {
  statistics: StatisticsData | null;
  isLoading: boolean;
  error: string | null;
}

export const useStatistics = (
  employees: Employee[],
  donutModeActive = false
): UseStatisticsResult => {
  const statistics = useMemo(() => {
    if (!employees || employees.length === 0) {
      return null;
    }

    // Initialize counts for all positions
    const distributionDict: Record<
      number,
      { count: number; percentage: number; label: string }
    > = {};
    for (let i = 1; i <= 9; i++) {
      distributionDict[i] = {
        count: 0,
        percentage: 0,
        label: getPositionLabel(i),
      };
    }

    // Count employees in each box
    // In donut mode, use donut_position for donut-modified employees
    employees.forEach((emp) => {
      let pos: number;

      if (donutModeActive && emp.donut_modified && emp.donut_position) {
        pos = emp.donut_position;
      } else {
        pos = emp.grid_position;
      }

      if (pos >= 1 && pos <= 9) {
        distributionDict[pos].count += 1;
      }
    });

    // Calculate percentages
    const total = employees.length;
    Object.values(distributionDict).forEach((box) => {
      box.percentage = total > 0 ? (box.count / total) * 100 : 0;
    });

    // Convert to array format
    const distribution: PositionDistribution[] = Object.entries(
      distributionDict
    ).map(([pos, data]) => ({
      grid_position: parseInt(pos),
      position_label: data.label,
      count: data.count,
      percentage: data.percentage,
    }));

    // Count modified employees
    // In donut mode, count donut-modified employees; otherwise count regular modifications
    const modifiedCount = donutModeActive
      ? employees.filter((e) => e.donut_modified).length
      : employees.filter((e) => e.modified_in_session).length;

    // Count high performers (High performance)
    const highPerformers = employees.filter(
      (e) => e.performance === PerformanceLevel.HIGH
    ).length;

    // Calculate grouped statistics
    // Group 1: Boxes 6, 8, 9 (high performers)
    const highPerformerPositions = PERFORMANCE_BUCKETS.High;
    const highPerformerCount = highPerformerPositions.reduce(
      (sum, pos) => sum + distributionDict[pos].count,
      0
    );
    const highPerformerPercentage =
      total > 0 ? (highPerformerCount / total) * 100 : 0;

    // Group 2: Boxes 3, 5, 7 (middle tier)
    const middleTierPositions = PERFORMANCE_BUCKETS.Medium;
    const middleTierCount = middleTierPositions.reduce(
      (sum, pos) => sum + distributionDict[pos].count,
      0
    );
    const middleTierPercentage =
      total > 0 ? (middleTierCount / total) * 100 : 0;

    // Group 3: Boxes 1, 2, 4 (low performers)
    const lowPerformerPositions = PERFORMANCE_BUCKETS.Low;
    const lowPerformerCount = lowPerformerPositions.reduce(
      (sum, pos) => sum + distributionDict[pos].count,
      0
    );
    const lowPerformerPercentage =
      total > 0 ? (lowPerformerCount / total) * 100 : 0;

    return {
      total_employees: total,
      modified_employees: modifiedCount,
      high_performers: highPerformers,
      distribution,
      groupedStats: {
        highPerformers: {
          positions: highPerformerPositions,
          count: highPerformerCount,
          percentage: highPerformerPercentage,
        },
        middleTier: {
          positions: middleTierPositions,
          count: middleTierCount,
          percentage: middleTierPercentage,
        },
        lowPerformers: {
          positions: lowPerformerPositions,
          count: lowPerformerCount,
          percentage: lowPerformerPercentage,
        },
      },
    };
  }, [employees, donutModeActive]);

  return {
    statistics,
    isLoading: false,
    error: null,
  };
};
