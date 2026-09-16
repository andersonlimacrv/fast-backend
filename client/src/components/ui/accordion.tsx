import { Accordion } from "@base-ui/react/accordion";
import { motion } from "motion/react";
import * as React from "react";

import { ChevronDown } from "@/lib/icons";

import { cn } from "@/lib/utils";

/* Accordion on Base UI primitives with a motion height reveal on open.
 * (Panel unmounts on close, so only the opening transition animates.) */

const AccordionRoot = Accordion.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof Accordion.Item>,
  React.ComponentPropsWithoutRef<typeof Accordion.Item>
>(({ className, ...props }, ref) => (
  <Accordion.Item ref={ref} className={cn("border-b border-border", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Accordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof Accordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <Accordion.Header>
    <Accordion.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between py-3 text-left text-sm font-medium outline-none",
        "hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 data-[panel-open]:rotate-180"
        aria-hidden="true"
      />
    </Accordion.Trigger>
  </Accordion.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof Accordion.Panel>,
  React.ComponentPropsWithoutRef<typeof Accordion.Panel>
>(({ className, children, ...props }, ref) => (
  <Accordion.Panel ref={ref} className={cn("overflow-hidden text-sm", className)} {...props}>
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="pb-3 text-muted-foreground"
    >
      {children}
    </motion.div>
  </Accordion.Panel>
));
AccordionContent.displayName = "AccordionContent";

export {
  AccordionRoot as Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
