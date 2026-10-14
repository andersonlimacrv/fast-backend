import { motion, useReducedMotion, type HTMLMotionProps, type Transition } from "motion/react";
import * as React from "react";

import { useControlledState } from "@/hooks/use-controlled-state";
import { cn } from "@/lib/utils";

/* Switch — reusable pill switch extracted from the `SwitchModeToggle` reference
 * (our `theme-toggle` port), change `custom-ui-switch`.
 *
 * Mechanics from the reference: a rounded track, a knob that slides between the
 * two halves with a spring, and content pinned to each half — the side the knob
 * sits on reads as ACTIVE while the other stays muted.
 *
 * Colours now follow the validated **Checkbox** language (owner, 2026-09-19):
 * active = solid `bg-primary` track with the knob reading as the light mark and
 * the contents coloured by what sits beneath them (active over the knob,
 * inactive over the green track), so `primary-foreground`-on-`primary` keeps the
 * same 9.11:1 the Checkbox has. Inactive = `bg-background` + border, like the
 * unchecked box. `transition-colors duration-500` matches the Checkbox.
 * The fill stays at full strength (owner, 2026-09-23): the softness lives in the
 * BORDERS, never in the fill.
 *
 * Contrast rim (change `design-contrast-borders`, light-first): every coloured
 * fill gains a contour in the content tone — base rule `border-*-foreground/80`
 * (3.87:1 against white) for the Checkbox and the CreditUsageCard segments.
 * On the Switch the owner calibrated the alphas himself while validating
 * (2026-09-23) and kept both rims equal per state: ON
 * `border-primary-foreground/30` (track over the full-strength `bg-primary`,
 * knob over its light mark) and OFF `border-border/50` — deliberately softer
 * than the 3:1 general guideline, an aesthetic call (2.06:1 and 1.51:1 vs
 * white). Tokens: light `--border`/`--input` darkened to 3.12:1 and `--ring` to
 * `--chart-3` (4.92:1).
 *
 * API: controlled (`checked`/`onCheckedChange`) or uncontrolled
 * (`defaultChecked`), `width`/`height`, `startContent`/`endContent` slots,
 * `knobClassName`/`trackClassName`, `transition`, plus motion button props
 * (`aria-label`, `className`, `disabled`…). */

export interface SwitchProps extends Omit<HTMLMotionProps<"button">, "onChange" | "children"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Track size in px (the reference exposes exactly these two). */
  width?: number;
  height?: number;
  /** Content pinned to the left half (e.g. a sun icon). */
  startContent?: React.ReactNode;
  /** Content pinned to the right half (e.g. a moon icon). */
  endContent?: React.ReactNode;
  /** Extra classes for the sliding knob. */
  knobClassName?: string;
  /** Extra classes for the track (merged with the width/height style). */
  trackClassName?: string;
  /** Spring for the knob slide. */
  transition?: Transition;
}

function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  width = 56,
  height = 28,
  startContent,
  endContent,
  knobClassName,
  trackClassName,
  transition,
  className,
  disabled,
  onClick,
  ...props
}: SwitchProps) {
  const reduceMotion = useReducedMotion();
  const [isChecked, setIsChecked] = useControlledState({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={(event) => {
        setIsChecked(!isChecked);
        onClick?.(event);
      }}
      style={{ width, height }}
      className={cn(
        "relative flex items-center rounded-full border transition-colors duration-500",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        isChecked ? "border-primary-foreground/30 bg-primary" : "border-border/50 bg-background",
        trackClassName,
        className,
      )}
      {...props}
    >
      <motion.span
        aria-hidden="true"
        layout={!reduceMotion}
        transition={transition ?? { type: "spring", stiffness: 500, damping: 32 }}
        style={{
          width: height - 4,
          height: height - 4,
          left: isChecked ? undefined : 2,
          right: isChecked ? 2 : undefined,
        }}
        className={cn(
          "absolute z-10 rounded-full border shadow-sm transition-colors duration-500",
          isChecked ? "border-primary-foreground/30 bg-background" : "border-border/50 bg-muted",
          knobClassName,
        )}
      />
      {startContent !== undefined && (
        <span
          aria-hidden="true"
          className={cn(
            "relative z-20 flex items-center justify-center transition-colors duration-500",
            isChecked ? "text-primary-foreground" : "text-foreground",
          )}
          style={{ width: height, height: height - 4 }}
        >
          {startContent}
        </span>
      )}
      {endContent !== undefined && (
        <span
          aria-hidden="true"
          className={cn(
            "relative z-20 flex items-center justify-center transition-colors duration-500",
            isChecked ? "text-foreground" : "text-muted-foreground",
          )}
          style={{ width: height, height: height - 4 }}
        >
          {endContent}
        </span>
      )}
    </motion.button>
  );
}

export { Switch };
