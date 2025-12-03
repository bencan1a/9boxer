/**
 * Statistics data hook - calculates from filtered employees
 */

import { useMemo } from "react";
import { Employee, PerformanceLevel } from "../types/employee";
import { PositionDistribution } from "../types/api";

interface StatisticsData {
  total_employees: number;
  modified_employees: number;
  high_performers: number;
  distribution: PositionDistribution[];
  groupedStats?: {
    highPerformers: { positions: number[]; count: number; percentage: number };
    lowPerformers: { positions: number[]; count: number; percentage: number };
  };
}

interface UseStatisticsResult {
  statistics: StatisticsData | null;
  isLoading: boolean;
  error: string | null;
}

const getBoxLabel = (position: number): string => {
  const labels: Record<number, string> = {
    9: "Top Talent [H,H]",
    8: "High Impact Talent [H,M]",
    7: "High/Low [H,L]",
    6: "Growth Talent [M,H]",
    5: "Core Talent [M,M]",
    4: "Med/Low [M,L]",
    3: "Emerging Talent [L,H]",
    2: "Inconsistent Talent [L,M]",
    1: "Low/Low [L,L]",
  };
  return labels[position] || `Position ${position}`;
};

export const useStatistics = (employees: Employee[]): UseStatisticsResult => {
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
      distributionDict[i] = { count: 0, percentage: 0, label: getBoxLabel(i) };
    }

    // Count employees in each box
    employees.forEach((emp) => {
      const pos = emp.grid_position;
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
    const modifiedCount = employees.filter(
      (e) => e.modified_in_session
    ).length;

    // Count high performers (High performance)
    const highPerformers = employees.filter(
      (e) => e.performance === PerformanceLevel.HIGH
    ).length;

    // Calculate grouped statistics
    // Group 1: Boxes 6, 8, 9 (high performers)
    const highPerformerPositions = [6, 8, 9];
    const highPerformerCount = highPerformerPositions.reduce(
      (sum, pos) => sum + distributionDict[pos].count,
      0
    );
    const highPerformerPercentage =
      total > 0 ? (highPerformerCount / total) * 100 : 0;

    // Group 2: Boxes 1, 2, 4 (low performers)
    const lowPerformerPositions = [1, 2, 4];
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
        lowPerformers: {
          positions: lowPerformerPositions,
          count: lowPerformerCount,
          percentage: lowPerformerPercentage,
        },
      },
    };
  }, [employees]);

  return {
    statistics,
    isLoading: false,
    error: null,
  };
};
