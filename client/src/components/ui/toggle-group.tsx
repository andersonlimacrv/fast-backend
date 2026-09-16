import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Toggle group on Base UI primitives (shared state for filter/view switches).
 * Variants mirror the reference: default | outline, default | sm | lg | icon.
 * Group-level variant/size propagate to items via context, so the upstream
 * DEMO (Bold/Italic/Underline, single + multiple) works verbatim. */

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap" +
    " transition-colors outline-none hover:bg-accent hover:text-accent-foreground" +
    " focus-visible:ring-2 focus-visible:ring-ring" +
    " data-[pressed]:bg-accent data-[pressed]:text-accent-foreground" +
    " data-[disabled]:pointer-events-none data-[disabled]:opacity-50" +
    " [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-background shadow-sm hover:bg-accent",
      },
      size: {
        default: "h-9 min-w-9 px-3",
        sm: "h-8 min-w-8 px-2.5 text-xs",
        lg: "h-10 min-w-10 px-4",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

interface ToggleGroupContextValue {
  variant: NonNullable<VariantProps<typeof toggleVariants>["variant"]>;
  size: NonNullable<VariantProps<typeof toggleVariants>["size"]>;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: "default",
  size: "default",
});

export interface ToggleGroupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseToggleGroup>, "multiple">,
    VariantProps<typeof toggleVariants> {
  multiple?: boolean;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, multiple = false, variant, size, ...props }, ref) => (
    <ToggleGroupContext.Provider value={{ variant: variant ?? "default", size: size ?? "default" }}>
      <BaseToggleGroup
        ref={ref}
        multiple={multiple}
        className={cn("inline-flex items-center justify-center gap-1", className)}
        {...props}
      />
    </ToggleGroupContext.Provider>
  ),
);
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof Toggle>,
    VariantProps<typeof toggleVariants> {}

const ToggleItem = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, ...props }, ref) => {
    const ctx = React.useContext(ToggleGroupContext);
    return (
      <Toggle
        ref={ref}
        className={cn(
          toggleVariants({ variant: variant ?? ctx.variant, size: size ?? ctx.size, className }),
        )}
        {...props}
      />
    );
  },
);
ToggleItem.displayName = "ToggleItem";

export { ToggleGroup, ToggleItem, ToggleItem as Toggle, toggleVariants };
