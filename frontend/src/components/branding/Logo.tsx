/**
 * Logo component for 9Boxer application
 * Provides multiple design variants for the 9-box grid logo
 */

import React from "react";
import { useTheme } from "@mui/material/styles";

/**
 * Logo design variants
 */
export type LogoVariant =
  | "gradient-center-focus"
  | "solid-primary"
  | "outlined"
  | "gradient-diagonal"
  | "rounded-modern"
  | "minimal-center"
  | "split-tone"
  | "neon-accent"
  | "depth-shadow"
  | "geometric-bold"
  | "gradient-bordered"; // Combines gradient boxes with clear borders

/**
 * Props for the Logo component
 */
export interface LogoProps {
  /** Logo variant to display */
  variant: LogoVariant;
  /** Size in pixels */
  size?: number;
  /** Optional className for styling */
  className?: string;
}

/**
 * Logo component
 *
 * Displays the 9Boxer logo in various design styles.
 * All variants use the 9-box grid concept aligned with the app's color palette.
 *
 * @example
 * ```tsx
 * <Logo variant="gradient-center-focus" size={64} />
 * ```
 */
export const Logo: React.FC<LogoProps> = ({
  variant,
  size = 32,
  className,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Color palette from theme
  const primary = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const primaryDark = theme.palette.primary.dark;
  const secondary = theme.palette.secondary.main;
  const background = theme.palette.background.paper;
  const text = theme.palette.text.primary;

  // Gradient colors from splash screen
  const gradientStart = "#1e3c72";
  const gradientMid = "#2a5298";
  const gradientEnd = "#7e22ce";

  const gap = size * 0.05; // 5% gap between boxes
  const boxSize = (size - gap * 2) / 3; // Size of each box in the 3x3 grid
  const cornerRadius = size * 0.04; // 4% corner radius

  // Common SVG wrapper
  const SvgWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="9Boxer logo"
      role="img"
    >
      {children}
    </svg>
  );

  // Grid box positions
  const positions = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 1, col: 0 },
    { row: 1, col: 1 }, // Center
    { row: 1, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ];

  const getBoxPosition = (row: number, col: number) => ({
    x: col * (boxSize + gap),
    y: row * (boxSize + gap),
  });

  // Variant 1: Gradient Center Focus (inspired by splash screen)
  if (variant === "gradient-center-focus") {
    return (
      <SvgWrapper>
        <defs>
          <linearGradient id="grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="50%" stopColor={gradientMid} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          width={size}
          height={size}
          rx={cornerRadius}
          fill="url(#grad-bg)"
        />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const isCenter = i === 4;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill={
                isCenter
                  ? "rgba(255, 255, 255, 0.4)"
                  : "rgba(255, 255, 255, 0.2)"
              }
              filter={isCenter ? "url(#glow)" : undefined}
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 2: Solid Primary (clean, professional)
  if (variant === "solid-primary") {
    return (
      <SvgWrapper>
        <rect width={size} height={size} rx={cornerRadius} fill={primary} />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill="rgba(255, 255, 255, 0.9)"
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 3: Outlined (minimal, modern)
  if (variant === "outlined") {
    const strokeWidth = size * 0.08;
    return (
      <SvgWrapper>
        <rect
          width={size}
          height={size}
          rx={cornerRadius}
          fill={background}
          stroke={primary}
          strokeWidth={strokeWidth}
        />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const isCenter = i === 4;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill={isCenter ? primary : "none"}
              stroke={primary}
              strokeWidth={strokeWidth / 2}
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 4: Gradient Diagonal (dynamic)
  if (variant === "gradient-diagonal") {
    return (
      <SvgWrapper>
        <defs>
          <linearGradient id="grad-diag" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        </defs>
        <rect
          width={size}
          height={size}
          rx={cornerRadius}
          fill="url(#grad-diag)"
        />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const opacity = 0.2 + (i / positions.length) * 0.6; // Gradual opacity
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill={`rgba(255, 255, 255, ${opacity})`}
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 5: Rounded Modern (soft, approachable)
  if (variant === "rounded-modern") {
    const largeRadius = cornerRadius * 3;
    return (
      <SvgWrapper>
        <rect width={size} height={size} rx={largeRadius} fill={primaryLight} />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={largeRadius / 2}
              fill={isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.8)"}
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 6: Minimal Center (emphasis on core)
  if (variant === "minimal-center") {
    return (
      <SvgWrapper>
        <rect width={size} height={size} rx={cornerRadius} fill={background} />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const isCenter = i === 4;
          if (!isCenter) return null; // Only show center box
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill={primary}
            />
          );
        })}
        {/* Grid outline */}
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const isCenter = i === 4;
          return (
            <rect
              key={`outline-${i}`}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill="none"
              stroke={isCenter ? "none" : primary}
              strokeWidth={size * 0.02}
              opacity={0.3}
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 7: Split Tone (blue + orange)
  if (variant === "split-tone") {
    return (
      <SvgWrapper>
        <defs>
          <linearGradient id="grad-split" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        </defs>
        <rect
          width={size}
          height={size}
          rx={cornerRadius}
          fill="url(#grad-split)"
        />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          // Left boxes: white, Right boxes: darker
          const fillColor =
            pos.col < 1.5
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(255, 255, 255, 0.3)";
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill={fillColor}
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 8: Neon Accent (modern, tech-forward)
  if (variant === "neon-accent") {
    return (
      <SvgWrapper>
        <defs>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          width={size}
          height={size}
          rx={cornerRadius}
          fill={isDark ? "#0a0a0a" : "#1a1a2e"}
        />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const isCenter = i === 4;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill={isCenter ? "#00d4ff" : "rgba(0, 212, 255, 0.2)"}
              filter={isCenter ? "url(#neon-glow)" : undefined}
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 9: Depth Shadow (3D effect)
  if (variant === "depth-shadow") {
    const shadowOffset = size * 0.04;
    return (
      <SvgWrapper>
        <defs>
          <filter id="shadow">
            <feDropShadow
              dx={shadowOffset / 2}
              dy={shadowOffset / 2}
              stdDeviation={shadowOffset / 4}
              floodOpacity="0.3"
            />
          </filter>
        </defs>
        <rect width={size} height={size} rx={cornerRadius} fill={primary} />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const isCenter = i === 4;
          return (
            <g key={i}>
              {/* Shadow */}
              <rect
                x={x + shadowOffset}
                y={y + shadowOffset}
                width={boxSize}
                height={boxSize}
                rx={cornerRadius / 2}
                fill="rgba(0, 0, 0, 0.2)"
              />
              {/* Box */}
              <rect
                x={x}
                y={y}
                width={boxSize}
                height={boxSize}
                rx={cornerRadius / 2}
                fill={isCenter ? secondary : "rgba(255, 255, 255, 0.9)"}
                filter="url(#shadow)"
              />
            </g>
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 10: Geometric Bold (high contrast)
  if (variant === "geometric-bold") {
    return (
      <SvgWrapper>
        <rect width={size} height={size} rx={0} fill={primary} />
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const isCenter = i === 4;
          const isCorner =
            (pos.row === 0 || pos.row === 2) &&
            (pos.col === 0 || pos.col === 2);
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={0}
              fill={
                isCenter
                  ? secondary
                  : isCorner
                    ? primaryLight
                    : "rgba(255, 255, 255, 0.95)"
              }
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Variant 11: Gradient Bordered (gradient boxes with clear borders and transparent gaps)
  if (variant === "gradient-bordered") {
    const strokeWidth = size * 0.03; // Border width for clear definition
    // Always use light borders since the gradient background is always dark
    const borderColor = "rgba(255, 255, 255, 0.4)";

    return (
      <SvgWrapper>
        <defs>
          {/* Same gradient as gradient-center-focus */}
          <linearGradient
            id="grad-box-fill"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="50%" stopColor={gradientMid} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
          <filter id="glow-bordered">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Gradient background spanning all boxes */}
        <rect
          width={size}
          height={size}
          rx={cornerRadius}
          fill="url(#grad-box-fill)"
        />
        {/* Boxes with clear borders and center solid */}
        {positions.map((pos, i) => {
          const { x, y } = getBoxPosition(pos.row, pos.col);
          const isCenter = i === 4;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={boxSize}
              height={boxSize}
              rx={cornerRadius / 2}
              fill={
                isCenter
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(255, 255, 255, 0.2)"
              }
              stroke={borderColor}
              strokeWidth={strokeWidth}
              filter={isCenter ? "url(#glow-bordered)" : undefined}
            />
          );
        })}
      </SvgWrapper>
    );
  }

  // Default fallback
  return (
    <SvgWrapper>
      <rect width={size} height={size} fill={primary} />
    </SvgWrapper>
  );
};
