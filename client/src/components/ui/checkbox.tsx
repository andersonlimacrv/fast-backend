import { Checkbox } from "@base-ui/react/checkbox";
import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Checkbox on Base UI primitives with a motion check draw. */

const UICheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox.Root>,
  React.ComponentPropsWithoutRef<typeof Checkbox.Root>
>(({ className, ...props }, ref) => (
  <Checkbox.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-input bg-background shadow-sm outline-none",
      "focus-visible:ring-1 focus-visible:ring-ring",
      "data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground",
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
        className="h-3 w-3"
        aria-hidden="true"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
      >
        <motion.path d="M20 6 9 17l-5-5" pathLength={1} />
      </motion.svg>
    </Checkbox.Indicator>
  </Checkbox.Root>
));
UICheckbox.displayName = "Checkbox";

export { UICheckbox as Checkbox };
