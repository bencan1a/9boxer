/**
 * Position labels and HR best practices guidance for the 9-box talent grid
 *
 * Note: This file now uses i18n for localization. The labels are stored in
 * translation files under grid.positions.{position}.{field}
 */

import { i18n } from "../i18n";

export interface PositionInfo {
  name: string;
  shortLabel: string;
  fullLabel: string;
  guidance: string;
}

/**
 * Get position information by position number
 * @param position - Grid position (1-9)
 * @returns PositionInfo object with localized labels
 */
export function getPositionInfo(position: number): PositionInfo {
  // Validate position is in range
  if (position < 1 || position > 9) {
    return {
      name: i18n.t("grid.positions.unknown", "Unknown"),
      shortLabel: "",
      fullLabel: i18n.t("grid.positions.unknown", "Unknown"),
      guidance: "",
    };
  }

  return {
    name: i18n.t(`grid.positions.${position}.name`),
    shortLabel: i18n.t(`grid.positions.${position}.shortLabel`),
    fullLabel: i18n.t(`grid.positions.${position}.fullLabel`),
    guidance: i18n.t(`grid.positions.${position}.guidance`),
  };
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

/**
 * Total steps moved across the performance and potential axes between two
 * grid positions. Mirrors get_axis_distance in the backend employee service:
 * the grid is a 3x3 of Low/Medium/High per axis, so a diagonal move counts as
 * one step on each axis rather than one move overall.
 *
 * @returns Combined axis steps (0-4), or 0 if either position is out of range
 */
export function getAxisDistance(
  fromPosition: number,
  toPosition: number
): number {
  const inRange = (p: number) => Number.isInteger(p) && p >= 1 && p <= 9;
  if (!inRange(fromPosition) || !inRange(toPosition)) return 0;

  const fromPerformance = (fromPosition - 1) % 3;
  const fromPotential = Math.floor((fromPosition - 1) / 3);
  const toPerformance = (toPosition - 1) % 3;
  const toPotential = Math.floor((toPosition - 1) / 3);

  return (
    Math.abs(toPerformance - fromPerformance) +
    Math.abs(toPotential - fromPotential)
  );
}
