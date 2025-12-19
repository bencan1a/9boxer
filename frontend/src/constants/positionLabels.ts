/**
 * Position labels and HR best practices guidance for the 9-box talent grid
 */

export interface PositionInfo {
  name: string;
  shortLabel: string;
  fullLabel: string;
  guidance: string;
}

/**
 * Position labels mapping based on grid position (1-9)
 * Grid layout:
 * [7=L,H] [8=M,H] [9=H,H]  (High Potential)
 * [4=L,M] [5=M,M] [6=H,M]  (Medium Potential)
 * [1=L,L] [2=M,L] [3=H,L]  (Low Potential)
 */
export const POSITION_LABELS: Record<number, PositionInfo> = {
  1: {
    name: "Underperformer",
    shortLabel: "[L,L]",
    fullLabel: "Underperformer [L,L]",
    guidance:
      "Low performance, low potential. Employees struggling to meet expectations with limited growth capacity. May require performance improvement plans, additional support, or role reassignment.",
  },
  2: {
    name: "Effective Pro",
    shortLabel: "[M,L]",
    fullLabel: "Effective Pro [M,L]",
    guidance:
      "Solid performance in current role but limited advancement potential. Reliable contributors who excel at their current level. Focus on recognition, engagement, and retention in current role.",
  },
  3: {
    name: "Workhorse",
    shortLabel: "[H,L]",
    fullLabel: "Workhorse [H,L]",
    guidance:
      "High performers with limited advancement potential. Highly valuable in their current role, delivering consistent excellent results. Invest in engagement strategies, recognition, and retention to keep them motivated.",
  },
  4: {
    name: "Inconsistent",
    shortLabel: "[L,M]",
    fullLabel: "Inconsistent [L,M]",
    guidance:
      "Underperforming but showing potential for growth. May be in wrong role, need development, or facing obstacles. Provide coaching, mentoring, clear performance expectations, and consider role adjustment.",
  },
  5: {
    name: "Core Talent",
    shortLabel: "[M,M]",
    fullLabel: "Core Talent [M,M]",
    guidance:
      "Solid performers with moderate growth potential. The backbone of the organization delivering consistent results. Invest in development opportunities, lateral growth, and skill enhancement.",
  },
  6: {
    name: "High Impact",
    shortLabel: "[H,M]",
    fullLabel: "High Impact [H,M]",
    guidance:
      "High performers with moderate advancement potential. Valuable contributors who excel and can take on increased responsibility. Focus on stretch assignments, skill development, and subject matter expertise.",
  },
  7: {
    name: "Enigma",
    shortLabel: "[L,H]",
    fullLabel: "Enigma [L,H]",
    guidance:
      "High potential but currently underperforming. May be new to role, misaligned, or facing challenges. Requires immediate attention through coaching, role adjustment, or targeted development plans to unlock potential.",
  },
  8: {
    name: "Growth",
    shortLabel: "[M,H]",
    fullLabel: "Growth [M,H]",
    guidance:
      "Solid performers with high potential for advancement. Future leaders in development. Provide mentoring, leadership training, career path planning, and opportunities for increased responsibility.",
  },
  9: {
    name: "Star",
    shortLabel: "[H,H]",
    fullLabel: "Star [H,H]",
    guidance:
      "Top performers with high potential. Critical talent to retain and develop for leadership roles. Focus on retention, succession planning, executive development, and challenging assignments.",
  },
};

/**
 * Get position information by position number
 */
export function getPositionInfo(position: number): PositionInfo {
  return (
    POSITION_LABELS[position] || {
      name: "Unknown",
      shortLabel: "",
      fullLabel: "Unknown",
      guidance: "",
    }
  );
}

/**
 * Get full position label (name + short label)
 */
export function getPositionLabel(position: number): string {
  return getPositionInfo(position).fullLabel;
}

/**
 * Get short position label ([X,Y] format)
 */
export function getShortPositionLabel(position: number): string {
  return getPositionInfo(position).shortLabel;
}

/**
 * Get position name only
 */
export function getPositionName(position: number): string {
  return getPositionInfo(position).name;
}

/**
 * Get HR guidance for position
 */
export function getPositionGuidance(position: number): string {
  return getPositionInfo(position).guidance;
}
