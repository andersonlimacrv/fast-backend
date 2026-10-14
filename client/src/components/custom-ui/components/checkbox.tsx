import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import {
  motion,
  useReducedMotion,
  type SVGMotionProps,
  type Transition,
} from "motion/react";
import * as React from "react";

import { useControlledState } from "@/hooks/use-controlled-state";
import { getStrictContext } from "@/lib/get-strict-context";
import { cn } from "@/lib/utils";

/* Checkbox — composed port of the upstream `components-base-checkbox` over its
 * `primitives-base-checkbox` (change custom-ui-checkbox; debt §14 converged,
 * this file instead of `components/ui`).
 *
 * Aesthetics copied from the site (cva): `size-5` box with `rounded-sm` and
 * progressively rounder sm/lg, checked/indeterminate fill with `bg-primary` +
 * `text-primary-foreground`, `transition-colors duration-500`, and the
 * `accent` variant as a filled `bg-input` box. The indicator is rendered by
 * this component (children first), so `<Checkbox aria-label="…" />` alone is
 * the normal usage — the primitive stays available for custom composition.
 *
 * Behaviour copied from the primitive: context + Root as a `motion.button`
 * (tap 0.95) and the check drawn with `pathLength` (0.2s, +0.2s delay when
 * checking) or a line for `indeterminate`. The primitive also grows the box on
 * hover — deliberately dropped here (owner): the hover scale felt noisy.
 *
 * Local deltas: focus ring `ring-2` per DESIGN.md §8 (the site uses 3px +
 * offset), theme tokens, and `prefers-reduced-motion` collapsing the scales
 * and the draw. Contrast rim (change `design-contrast-borders`, owner): the
 * checked/indeterminate fill gets a `border-primary-foreground/80` contour —
 * before it kept the neutral `--border`, which blended into the lime — and the
 * light `--border`/`--ring` tokens were darkened (3.12:1 / 4.92:1). */

export type CheckboxSize = "default" | "sm" | "lg";

type CheckboxContextType = {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  isIndeterminate: boolean | undefined;
};

const [CheckboxProvider, useCheckbox] = getStrictContext<CheckboxContextType>("CheckboxContext");

const checkboxVariants = cva(
  [
    "peer shrink-0 flex items-center justify-center outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-colors duration-500",
    "[&[data-checked],&[data-indeterminate]]:border [&[data-checked],&[data-indeterminate]]:bg-primary [&[data-checked],&[data-indeterminate]]:text-primary-foreground",
    "[&[data-checked],&[data-indeterminate]]:border-primary-foreground/80",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-background border",
        accent: "bg-input",
      },
      size: {
        default: "size-5 rounded-sm",
        sm: "size-4.5 rounded-[5px]",
        lg: "size-6 rounded-[7px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const checkboxIndicatorVariants = cva("", {
  variants: {
    size: {
      default: "size-3.5",
      sm: "size-3",
      lg: "size-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface CheckboxProps
  extends Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "render" | "children">,
    VariantProps<typeof checkboxVariants> {
  children?: React.ReactNode;
  /** Spring for the hover/tap scales. */
  transition?: Transition;
}

function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  indeterminate,
  variant,
  size,
  className,
  children,
  transition,
  ...props
}: CheckboxProps) {
  const reduceMotion = useReducedMotion();
  const [isChecked, setIsChecked] = useControlledState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange as ((value: boolean) => void) | undefined,
  });

  return (
    <CheckboxProvider value={{ isChecked, setIsChecked, isIndeterminate: indeterminate }}>
      <CheckboxPrimitive.Root
        {...props}
        checked={checked}
        defaultChecked={defaultChecked}
        indeterminate={indeterminate}
        onCheckedChange={(next: boolean) => setIsChecked(next)}
        className={cn(checkboxVariants({ variant, size }), className)}
        render={
          <motion.button
            data-slot="checkbox"
            /* No `whileHover` scale (owner, 2026-09-19): growing on hover read
             * as noisy — the box only reacts on press. */
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            transition={transition}
          />
        }
      >
        {children}
        <CheckboxIndicator className={cn(checkboxIndicatorVariants({ size }))} />
      </CheckboxPrimitive.Root>
    </CheckboxProvider>
  );
}

export type CheckboxIndicatorProps = SVGMotionProps<SVGSVGElement>;

function CheckboxIndicator({ className, ...props }: CheckboxIndicatorProps) {
  const { isChecked, isIndeterminate } = useCheckbox();
  const reduceMotion = useReducedMotion();

  return (
    <CheckboxPrimitive.Indicator
      keepMounted
      className={cn("flex items-center justify-center text-current", className)}
      render={
        <motion.svg
          data-slot="checkbox-indicator"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="3.5"
          stroke="currentColor"
          aria-hidden="true"
          initial="unchecked"
          animate={isChecked ? "checked" : "unchecked"}
          {...props}
        >
          {isIndeterminate ? (
            <motion.line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 1,
                transition: { duration: reduceMotion ? 0 : 0.2 },
              }}
            />
          ) : (
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              variants={{
                checked: {
                  pathLength: 1,
                  opacity: 1,
                  transition: { duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : 0.2 },
                },
                unchecked: {
                  pathLength: 0,
                  opacity: 0,
                  transition: { duration: reduceMotion ? 0 : 0.2 },
                },
              }}
            />
          )}
        </motion.svg>
      }
    />
  );
}

export { Checkbox, CheckboxIndicator };
