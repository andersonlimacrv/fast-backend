import { Tooltip } from "@base-ui/react/tooltip";
import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Tooltip on Base UI primitives with a motion fade/scale on open.
 * Trigger stays a plain child (asChild via render) so any element qualifies. */

const TooltipRoot = Tooltip.Root;

const TooltipTrigger = Tooltip.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Tooltip.Popup>,
  React.ComponentPropsWithoutRef<typeof Tooltip.Popup> & { sideOffset?: number }
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <Tooltip.Portal>
    <Tooltip.Positioner sideOffset={sideOffset}>
      <Tooltip.Popup
        ref={ref}
        className={cn(
          "z-50 max-w-xs rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md",
          "data-[starting-style]:opacity-0",
          className,
        )}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { TooltipRoot as Tooltip, TooltipTrigger, TooltipContent };
