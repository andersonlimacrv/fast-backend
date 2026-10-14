import * as React from "react";
import { animate, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/* Faithful port of magicui's AnimatedCircularProgressBar (registry item +
 * references/components_to_use/AnimatedCircularProgressBar.md): two SVG circles
 * driven by CSS vars, a 5% gap at the top (the secondary ring is flipped with
 * `scaleY(-1)` and rotated the other way) and `stroke-dasharray` in
 * `calc(var(--stroke-percent) * var(--percent-to-px))`.
 *
 * Local deltas, all deliberate:
 * - `animateOnMount` (default true): the gauge fills from `min` to `value`
 *   every time it mounts and the counter climbs with it. Implemented with
 *   motion's `animate` using CSS `ease` [0.25, 0.1, 0.25, 1] — the same curve
 *   as the upstream CSS transition — because one driver keeps the ring and the
 *   number in sync (a CSS transition plus a JS counter drift apart).
 * - `prefers-reduced-motion` (or `transitionLength <= 0`) lands on the final
 *   value instantly.
 * - Accessibility the upstream lacks: `role="progressbar"` + aria values on
 *   the wrapper (aria reflects the real value, not the animation frame) and
 *   `aria-hidden` on the decorative SVG/label.
 * - Theme-token default colors, configurable `size`/`strokeWidth`, optional
 *   `showValue` (with the `%` sign, our convention) instead of the hardcoded
 *   `size-40` and required color props.
 * - The number keeps tabular figures (DESIGN.md §4.3) so it does not jitter
 *   while counting.
 *
 * Defaults are the COMPLETE variant (owner, 2026-09-19): fill-from-zero on
 * mount + value label + full 5% gap ring, with no extra props. Every other
 * combination is an explicit opt-out (`animateOnMount={false}`,
 * `showValue={false}`, `strokeWidth`, `transitionLength`). */

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
  /** Rendered diameter in px (upstream hardcodes a 160px square). */
  size?: number;
  strokeWidth?: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  showValue?: boolean;
  /** Fill from `min` to `value` on mount (default true; the upstream demo loops). */
  animateOnMount?: boolean;
  /** Fill/counter duration in ms (upstream CSS: 1s). */
  transitionLength?: number;
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PERCENT_TO_PX = `${CIRCUMFERENCE / 100}px`;
const GAP_PERCENT = 5;
const PERCENT_TO_DEG = "3.6deg";
/* CSS `ease` — the curve the upstream transition uses. */
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

function percentOf(value: number, min: number, max: number): number {
  if (max === min) return 0;
  const clamped = Math.min(max, Math.max(min, value));
  return Math.round(((clamped - min) / (max - min)) * 100);
}

export function CircularProgress({
  value,
  min = 0,
  max = 100,
  size = 160,
  strokeWidth = 10,
  gaugePrimaryColor = "var(--color-chart-1)",
  gaugeSecondaryColor = "var(--color-muted)",
  showValue = true,
  animateOnMount = true,
  transitionLength = 1000,
  className,
  ...props
}: CircularProgressProps) {
  const reduceMotion = useReducedMotion();
  const target = percentOf(value, min, max);
  const clampedValue = Math.min(max, Math.max(min, value));
  // Derived, not stored: jumping is a render-time decision (no setState in an
  // effect), so reduced motion / no duration / animateOnMount=false never
  // schedule a frame they do not need.
  const jumpsToTarget = !animateOnMount || transitionLength <= 0 || reduceMotion === true;

  const [displayed, setDisplayed] = React.useState(() => (jumpsToTarget ? target : 0));
  const displayedRef = React.useRef(displayed);

  React.useEffect(() => {
    if (jumpsToTarget || displayedRef.current === target) return;
    const controls = animate(displayedRef.current, target, {
      duration: transitionLength / 1000,
      ease: EASE,
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        displayedRef.current = rounded;
        setDisplayed(rounded);
      },
    });
    return () => controls.stop();
  }, [target, transitionLength, jumpsToTarget]);

  const painted = jumpsToTarget ? target : displayed;

  return (
    <div
      role="progressbar"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(clampedValue)}
      aria-valuetext={`${target} percent`}
      data-current-value={painted}
      className={cn("relative inline-flex items-center justify-center text-2xl font-semibold", className)}
      style={
        {
          width: size,
          height: size,
          "--circle-size": "100px",
          "--circumference": CIRCUMFERENCE,
          "--percent-to-px": PERCENT_TO_PX,
          "--gap-percent": GAP_PERCENT,
          "--offset-factor": 0,
          "--percent-to-deg": PERCENT_TO_DEG,
          transform: "translateZ(0)",
        } as React.CSSProperties
      }
      {...props}
    >
      <svg fill="none" className="size-full" viewBox="0 0 100 100" aria-hidden="true">
        {painted <= 90 && painted >= 0 && (
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            strokeWidth={strokeWidth}
            strokeDashoffset="0"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              {
                stroke: gaugeSecondaryColor,
                "--stroke-percent": 90 - painted,
                "--offset-factor-secondary": "calc(1 - var(--offset-factor))",
                strokeDasharray:
                  "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
                transform:
                  "rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)",
                transformOrigin: "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
              } as React.CSSProperties
            }
          />
        )}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          strokeWidth={strokeWidth}
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            {
              stroke: gaugePrimaryColor,
              "--stroke-percent": painted,
              strokeDasharray:
                "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
              transform:
                "rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))",
              transformOrigin: "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
            } as React.CSSProperties
          }
        />
      </svg>
      {showValue && (
        <span aria-hidden="true" className="absolute inset-0 m-auto size-fit font-mono tabular-nums">
          {painted}%
        </span>
      )}
    </div>
  );
}
