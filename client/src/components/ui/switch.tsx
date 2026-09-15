import { Switch } from "@base-ui/react/switch";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Switch on Base UI primitives (slide via CSS transition on data attrs). */

const UISwitch = React.forwardRef<
  React.ElementRef<typeof Switch.Root>,
  React.ComponentPropsWithoutRef<typeof Switch.Root>
>(({ className, ...props }, ref) => (
  <Switch.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent",
      "bg-input shadow-sm outline-none transition-colors",
      "focus-visible:ring-1 focus-visible:ring-ring",
      "data-[checked]:bg-primary",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <Switch.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow ring-0",
        "transition-transform data-[checked]:translate-x-4 data-[unchecked]:translate-x-0",
      )}
    />
  </Switch.Root>
));
UISwitch.displayName = "Switch";

export { UISwitch as Switch };
