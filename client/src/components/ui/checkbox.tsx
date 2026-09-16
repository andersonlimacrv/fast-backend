import { Checkbox } from "@base-ui/react/checkbox";
import { motion, useReducedMotion, type Transition } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Checkbox on Base UI primitives with a motion check draw.
 * Upstream shape: variant/size + motion transition override; DEMO labels
 * stay plain <label> (no Label primitive). `render` stays unsupported. */

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Checkbox.Root>, "render"> {
  variant?: "default" | "accent";
  size?: "default" | "sm" | "lg";
  transition?: Transition;
}

const rootSize = { sm: "h-3.5 w-3.5", default: "h-4 w-4", lg: "h-5 w-5" } as const;

const iconSize = { sm: "h-2.5 w-2.5", default: "h-3 w-3", lg: "h-3.5 w-3.5" } as const;

const UICheckbox = React.forwardRef<React.ElementRef<typeof Checkbox.Root>, CheckboxProps>(
  ({ className, variant = "default", size = "default", transition, ...props }, ref) => {
    const reduceMotion = useReducedMotion();
    return (
      <Checkbox.Root
        ref={ref}
        className={cn(
          "peer shrink-0 rounded-sm border border-input bg-background shadow-sm outline-none",
          rootSize[size],
          "focus-visible:ring-2 focus-visible:ring-ring",
          variant === "accent"
            ? "data-[checked]:border-accent data-[checked]:bg-accent data-[checked]:text-accent-foreground"
            : "data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          className,
        )}
        {...props}
      >
        <Checkbox.Indicator className="flex items-center justify-center text-current">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconSize[size]}
            aria-hidden="true"
            initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={transition ?? { duration: 0.12, ease: "easeOut" }}
          >
            <motion.path d="M20 6 9 17l-5-5" pathLength={1} />
          </motion.svg>
        </Checkbox.Indicator>
      </Checkbox.Root>
    );
  },
);
UICheckbox.displayName = "Checkbox";

export { UICheckbox as Checkbox };
