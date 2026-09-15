import { Tabs } from "@base-ui/react/tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Tabs on Base UI primitives. The sliding pill is the built-in
 * Tabs.Indicator tracking the active tab (no layout library needed). */

const TabsRoot = Tabs.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof Tabs.List>,
  React.ComponentPropsWithoutRef<typeof Tabs.List>
>(({ className, ...props }, ref) => (
  <Tabs.List
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-start gap-1 rounded-lg bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTab = React.forwardRef<
  React.ElementRef<typeof Tabs.Tab>,
  React.ComponentPropsWithoutRef<typeof Tabs.Tab>
>(({ className, ...props }, ref) => (
  <Tabs.Tab
    ref={ref}
    className={cn(
      "z-10 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors",
      "hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring",
      "data-[selected]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTab.displayName = "TabsTab";

const TabsIndicator = React.forwardRef<
  React.ElementRef<typeof Tabs.Indicator>,
  React.ComponentPropsWithoutRef<typeof Tabs.Indicator>
>(({ className, ...props }, ref) => (
  <Tabs.Indicator
    ref={ref}
    className={cn("rounded-md bg-background shadow-sm transition-all duration-150", className)}
    {...props}
  />
));
TabsIndicator.displayName = "TabsIndicator";

const TabsPanel = React.forwardRef<
  React.ElementRef<typeof Tabs.Panel>,
  React.ComponentPropsWithoutRef<typeof Tabs.Panel>
>(({ className, ...props }, ref) => (
  <Tabs.Panel ref={ref} className={cn("pt-4 outline-none", className)} {...props} />
));
TabsPanel.displayName = "TabsPanel";

export { TabsRoot as Tabs, TabsList, TabsTab as TabsTrigger, TabsIndicator, TabsPanel as TabsContent };
