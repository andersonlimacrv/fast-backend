/* Vendored from @animate-ui/primitives-base-tabs (registry, 2026-09-30).
 * Local adaptations: 'use client' removed (Vite); Base UI imported from
 * `@base-ui/react/tabs` (installed 1.8.0 — same API, `render` + `keepMounted`
 * verified in its .d.ts) instead of `@base-ui-components/react/tabs`;
 * `TabsPanels` auto-height uses our ResizeObserver mold (the repo has no
 * `AutoHeight` effect — design decision 3) keyed by the context value, which
 * fixes the old `/ui` limitation; reduced-motion collapses the panel blur and
 * the height animation (DESIGN.md §7). Re-fetch from
 * https://animate-ui.com/r/primitives-base-tabs.json to update. */

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps, type Transition } from "motion/react";

import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/components/custom-ui/effects/highlight";
import { getStrictContext } from "@/lib/get-strict-context";
import { useControlledState } from "@/hooks/use-controlled-state";
import { cn } from "@/lib/utils";

type TabsContextType = {
  value: string | undefined;
  setValue: TabsProps["onValueChange"];
};

const [TabsProvider, useTabs] = getStrictContext<TabsContextType>("TabsContext");

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;

function Tabs(props: TabsProps) {
  const [value, setValue] = useControlledState({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  });

  return (
    <TabsProvider value={{ value, setValue }}>
      <TabsPrimitive.Root data-slot="tabs" {...props} onValueChange={setValue} />
    </TabsProvider>
  );
}

type TabsHighlightProps = Omit<HighlightProps, "controlledItems" | "value">;

function TabsHighlight({
  transition = { type: "spring", stiffness: 200, damping: 25 },
  ...props
}: TabsHighlightProps) {
  const { value } = useTabs();

  return (
    <Highlight
      data-slot="tabs-highlight"
      controlledItems
      value={value}
      transition={transition}
      click={false}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;

function TabsList(props: TabsListProps) {
  return <TabsPrimitive.List data-slot="tabs-list" {...props} />;
}

type TabsHighlightItemProps = HighlightItemProps & {
  value: string;
};

function TabsHighlightItem(props: TabsHighlightItemProps) {
  return <HighlightItem data-slot="tabs-highlight-item" {...props} />;
}

type TabsTabProps = React.ComponentProps<typeof TabsPrimitive.Tab>;

function TabsTab(props: TabsTabProps) {
  return <TabsPrimitive.Tab data-slot="tabs-tab" {...props} />;
}

type TabsPanelProps = React.ComponentProps<typeof TabsPrimitive.Panel> &
  HTMLMotionProps<"div">;

function TabsPanel({
  value,
  keepMounted,
  transition = { duration: 0.5, ease: "easeInOut" },
  ...props
}: TabsPanelProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <TabsPrimitive.Panel data-slot="tabs-panel" keepMounted={keepMounted} value={value} {...props} />;
  }
  return (
    <AnimatePresence mode="wait">
      <TabsPrimitive.Panel
        render={
          <motion.div
            data-slot="tabs-panel"
            layout
            layoutDependency={value}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={transition}
            {...props}
          />
        }
        keepMounted={keepMounted}
        value={value}
      />
    </AnimatePresence>
  );
}

type TabsPanelsAutoProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & {
  mode?: "auto-height";
  children: React.ReactNode;
  transition?: Transition;
};

type TabsPanelsLayoutProps = Omit<HTMLMotionProps<"div">, "children"> & {
  mode: "layout";
  children: React.ReactNode;
  transition?: Transition;
};

type TabsPanelsProps = TabsPanelsAutoProps | TabsPanelsLayoutProps;

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
};

function isAutoMode(props: TabsPanelsProps): props is TabsPanelsAutoProps {
  return !props.mode || props.mode === "auto-height";
}

function TabsPanels(props: TabsPanelsProps) {
  const { value } = useTabs();
  const reduceMotion = useReducedMotion();

  if (isAutoMode(props)) {
    const { children, transition = defaultTransition, className, ...rest } = props;

    if (reduceMotion || typeof ResizeObserver === "undefined") {
      return (
        <div data-slot="tabs-panels" className={cn("overflow-hidden", className)} {...rest}>
          <React.Fragment key={value}>{children}</React.Fragment>
        </div>
      );
    }

    return (
      <AutoHeightMold
        data-slot="tabs-panels"
        heightDeps={[value]}
        transition={transition}
        className={className}
        {...rest}
      >
        <React.Fragment key={value}>{children}</React.Fragment>
      </AutoHeightMold>
    );
  }

  const { children, style, transition = defaultTransition, ...layoutProps } = props;

  return (
    <motion.div
      data-slot="tabs-panels"
      layout="size"
      layoutDependency={value}
      transition={{ layout: reduceMotion ? { duration: 0 } : transition }}
      style={{ overflow: "hidden", ...style }}
      {...layoutProps}
    >
      <React.Fragment key={value}>{children}</React.Fragment>
    </motion.div>
  );
}

/* Our ResizeObserver mold (previously in `/ui/tabs.tsx`): Base UI hides
 * inactive panels, so measuring the inner content tracks the visible height.
 * Keyed by the context value (via `heightDeps`), unlike the old version. */
function AutoHeightMold({
  children,
  heightDeps,
  transition,
  className,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & {
  heightDeps: React.DependencyList;
  transition?: Transition;
}) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | "auto">("auto");

  React.useEffect(() => {
    const el = innerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const h = el.offsetHeight;
      setHeight((prev) => (prev === h ? prev : h));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, heightDeps);

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={{ height }}
      transition={transition}
      {...props}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  );
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
