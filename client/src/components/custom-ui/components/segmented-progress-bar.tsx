/* SegmentedProgressBar — the credit-usage bar extracted from the
 * CreditUsageCard (change `segmented-usage-bar`) so the block and future
 * usages share one implementation. Purely presentational and controlled:
 * `value` in, segments out — no internal state.
 *
 * The extraction also fixed the uneven rhythm the owner spotted in the lab:
 * the filled cells carried a 1px border while the empty ones had none, so
 * equal fractions still painted as different boxes, and `flex-1` rounded the
 * fractional widths per cell. Now every cell is the same box (`min-w-0
 * rounded-sm border`, empty ones with `border-transparent`) over a grid of
 * equal `minmax(0, 1fr)` columns. Height comes from `heightPx` (default 14,
 * matching the validated `h-3.5`) via inline style — dynamic classes would
 * not survive the Tailwind build.
 *
 * Colours follow the validated calibration (DESIGN.md §4.5): filled cells are
 * the full-strength `bg-primary` with the fine-element rim
 * `border-primary-foreground/60`, empty ones `bg-muted-foreground/70` in both
 * themes; the doc's per-cell fade (`1 - i * 0.004`) is preserved on purpose
 * (owner). */

import { cn } from "@/lib/utils";

export interface SegmentedProgressBarProps {
  /** Current value; clamped to `0..max`. */
  value: number;
  /** Scale top (default 100). */
  max?: number;
  /** Number of cells in the track (default 75, as in the doc). */
  segments?: number;
  /** Track height in px (default 14). */
  heightPx?: number;
  /** Accessible name of the `progressbar`. */
  label?: string;
  /** Number announced by `aria-valuenow` when it differs from the painted
   * `value` — e.g. a mount fill paints 0→target while aria must report the
   * real value (the CircularProgress pattern). Defaults to `value`. */
  ariaValueNow?: number;
  className?: string;
}

function SegmentedProgressBar({
  value,
  max = 100,
  segments = 75,
  heightPx = 14,
  label = "Credits used",
  ariaValueNow,
  className,
}: SegmentedProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(safeMax, Math.max(0, value));
  const filledCount = (clamped / safeMax) * segments;
  const announced = Math.min(safeMax, Math.max(0, ariaValueNow ?? clamped));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={announced}
      aria-label={label}
      style={{ height: heightPx, gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}
      className={cn("grid gap-px bg-muted/50", className)}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const filled = i < filledCount;
        return (
          <div
            key={i}
            data-slot="segmented-progress-cell"
            style={filled ? { opacity: 1 - i * 0.004 } : undefined}
            className={cn(
              "min-w-0 rounded-sm border transition-all duration-700 motion-reduce:transition-none",
              filled
                ? "border-primary-foreground/60 bg-primary"
                : "border-transparent bg-muted-foreground/70",
            )}
          />
        );
      })}
    </div>
  );
}

export { SegmentedProgressBar };
