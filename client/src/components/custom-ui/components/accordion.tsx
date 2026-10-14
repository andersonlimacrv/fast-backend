/* Accordion built on OUR Collapsible (`custom-ui/components/collapsible.tsx`,
 * radix + AnimatePresence), not on the untouched shadcn base in
 * `components/ui/` (CLIENT-STRUCTURE rule: pages consume `/custom-ui`).
 *
 * Why here: the base `ui/accordion` unmounts the panel on close (only the
 * opening animates). The sidebar groups solved that by vendoring the animate-ui
 * radix collapsible, which animates BOTH ways — this component reuses it, so
 * accordions behave exactly like the sidebar disclosures the owner approved.
 *
 * API: `Accordion` (single by default, `multiple` optional, controlled via
 * `value`/`onValueChange` or uncontrolled via `defaultValue`), `AccordionItem`
 * (`value`), `AccordionTrigger`, `AccordionContent` (`keepRendered`). */

import * as React from "react";
import type { Transition } from "motion/react";

import { ChevronDown } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { Collapsible, CollapsibleContent, CollapsibleTrigger, type CollapsibleReveal } from "./collapsible";

/** Panel spring, same default as the upstream animate-ui base accordion component. */
const PANEL_SPRING: Transition = { type: "spring", stiffness: 150, damping: 22 };

type AccordionContextValue = {
  multiple: boolean;
  onHover: boolean;
  openValues: string[];
  setItemOpen: (value: string, open: boolean) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext(): AccordionContextValue {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("Accordion* must be used within <Accordion>");
  return context;
}

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Allow sibling panels to stay open together (default: one at a time). */
  multiple?: boolean;
  /** Open the item under the pointer (default false). Click/keyboard keep working. */
  onHover?: boolean;
  /** Uncontrolled initial open values. */
  defaultValue?: string[];
  /** Controlled open values. */
  value?: string[];
  onValueChange?: (value: string[]) => void;
}

function Accordion({
  multiple = false,
  onHover = false,
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? []);
  const openValues = value ?? uncontrolled;

  const setOpenValues = React.useCallback(
    (next: string[]) => {
      if (value === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  const setItemOpen = React.useCallback(
    (itemValue: string, open: boolean) => {
      const without = openValues.filter((v) => v !== itemValue);
      if (!open) return setOpenValues(without);
      setOpenValues(multiple ? [...without, itemValue] : [itemValue]);
    },
    [openValues, multiple, setOpenValues],
  );

  const context = React.useMemo(
    () => ({ multiple, onHover, openValues, setItemOpen }),
    [multiple, onHover, openValues, setItemOpen],
  );

  return (
    <AccordionContext.Provider value={context}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const { openValues, setItemOpen, onHover } = useAccordionContext();
  const isOpen = openValues.includes(value);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(next: boolean) => setItemOpen(value, next)}
      onHover={onHover}
      className={cn("border-b border-border", className)}
      {...props}
    >
      {children}
    </Collapsible>
  );
}

type AccordionTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>;

function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-medium outline-none",
        "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}

export interface AccordionContentProps extends React.ComponentProps<typeof CollapsibleContent> {
  /** Keep the panel mounted while closed (no exit animation, state preserved). */
  keepRendered?: boolean;
  /** Panel reveal: `mask` (default — curtain reveal from the upstream accordion), `depth` or `slide`. */
  reveal?: CollapsibleReveal;
}

function AccordionContent({
  className,
  children,
  keepRendered,
  reveal = "mask",
  transition = PANEL_SPRING,
  ...props
}: AccordionContentProps) {
  return (
    <CollapsibleContent
      reveal={reveal}
      keepRendered={keepRendered}
      transition={transition}
      className={cn("text-sm", className)}
      {...props}
    >
      <div className="pb-3 text-muted-foreground">{children}</div>
    </CollapsibleContent>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
