import * as React from "react";

import { cn } from "@/lib/utils";

/* Circular gauge ported from the AnimatedCircularProgressBar reference
 * (CSS-var driven SVG ring; transition on stroke-dashoffset, no extra lib).
 * Gauge colors default to theme tokens so light/dark both work. */

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  showValue?: boolean;
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularProgress({
  value,
  min = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  gaugePrimaryColor = "var(--color-chart-1)",
  gaugeSecondaryColor = "var(--color-muted)",
  showValue = true,
  className,
  ...props
}: CircularProgressProps) {
  const clamped = Math.min(max, Math.max(min, value));
  const percent = max === min ? 0 : Math.round(((clamped - min) / (max - min)) * 100);
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  return (
    <div
      role="progressbar"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(clamped)}
      aria-valuetext={`${percent} percent`}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={gaugeSecondaryColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={gaugePrimaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className="transition-[stroke-dashoffset] duration-200 ease-out"
        />
      </svg>
      {showValue && (
        <span className="absolute font-mono text-xl font-semibold tabular-nums">{percent}%</span>
      )}
    </div>
  );
}
