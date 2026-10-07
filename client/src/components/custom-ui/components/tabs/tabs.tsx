/* Composed Tabs (change `custom-ui-tabs`): the upstream primitive set with our
 * layout — muted list, bare tabs and the Highlight pill. Selection is painted
 * ONLY by the sliding Highlight; tabs carry no hover fill and no fill of their
 * own (toggle-group lesson, faithful to the doc demo). */

import { cn } from "@/lib/utils";
import {
  Tabs as TabsPrimitive,
  TabsHighlight as TabsHighlightPrimitive,
  TabsHighlightItem as TabsHighlightItemPrimitive,
  TabsList as TabsListPrimitive,
  TabsPanel as TabsPanelPrimitive,
  TabsPanels as TabsPanelsPrimitive,
  TabsTab as TabsTabPrimitive,
  useTabs,
  type TabsHighlightItemProps as TabsHighlightItemPrimitiveProps,
  type TabsHighlightProps as TabsHighlightPrimitiveProps,
  type TabsListProps as TabsListPrimitiveProps,
  type TabsPanelProps as TabsPanelPrimitiveProps,
  type TabsPanelsProps as TabsPanelsPrimitiveProps,
  type TabsProps as TabsPrimitiveProps,
  type TabsTabProps as TabsTabPrimitiveProps,
} from "./primitive";

type TabsProps = TabsPrimitiveProps;

function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive className={cn("w-full", className)} {...props} />;
}

type TabsListProps = TabsListPrimitiveProps;

function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsListPrimitive
      className={cn("relative inline-flex h-10 w-full items-center gap-1 rounded-lg bg-muted p-1", className)}
      {...props}
    />
  );
}

type TabsTabProps = TabsTabPrimitiveProps;

function TabsTab({ className, ...props }: TabsTabProps) {
  return (
    <TabsTabPrimitive
      className={cn(
        "relative z-10 inline-flex h-full w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

type TabsHighlightProps = TabsHighlightPrimitiveProps;

function TabsHighlight({ className, ...props }: TabsHighlightProps) {
  return (
    <TabsHighlightPrimitive
      className={cn("absolute inset-0 z-0 rounded-md bg-background shadow-sm", className)}
      {...props}
    />
  );
}

type TabsHighlightItemProps = TabsHighlightItemPrimitiveProps;

function TabsHighlightItem({ className, ...props }: TabsHighlightItemProps) {
  return <TabsHighlightItemPrimitive className={cn("flex-1", className)} {...props} />;
}

type TabsPanelProps = TabsPanelPrimitiveProps;

function TabsPanel({ className, ...props }: TabsPanelProps) {
  return <TabsPanelPrimitive className={cn("pt-4 outline-none", className)} {...props} />;
}

type TabsPanelsProps = TabsPanelsPrimitiveProps;

function TabsPanels(props: TabsPanelsProps) {
  return <TabsPanelsPrimitive {...props} />;
}

export {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTab,
  TabsPanel,
  TabsPanels,
  useTabs,
  type TabsProps,
  type TabsHighlightProps,
  type TabsHighlightItemProps,
  type TabsListProps,
  type TabsTabProps,
  type TabsPanelProps,
  type TabsPanelsProps,
};
