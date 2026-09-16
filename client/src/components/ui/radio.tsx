import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { motion, useReducedMotion, type Transition } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Radio group on Base UI primitives (group owns the value).
 * Upstream shape: motion transition override on the dot; DEMO labels stay
 * plain <label>. `render` stays unsupported. */

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseRadioGroup>
>(({ className, ...props }, ref) => (
  <BaseRadioGroup ref={ref} className={cn("grid gap-2", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export interface RadioItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Radio.Root>, "render"> {
  transition?: Transition;
}

const RadioItem = React.forwardRef<HTMLSpanElement, RadioItemProps>(
  ({ className, transition, ...props }, ref) => {
    const reduceMotion = useReducedMotion();
    return (
      <Radio.Root
        ref={ref}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-input bg-background shadow-sm outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "data-[checked]:border-primary",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          className,
        )}
        {...props}
      >
        <Radio.Indicator className="flex h-full w-full items-center justify-center">
          <motion.span
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={transition ?? { type: "spring", stiffness: 600, damping: 30 }}
            className="h-2 w-2 rounded-full bg-primary"
            aria-hidden="true"
          />
        </Radio.Indicator>
      </Radio.Root>
    );
  },
);
RadioItem.displayName = "RadioItem";

export { RadioGroup, RadioGroup as Radio, RadioItem };
