import { Collapsible } from "@base-ui/react/collapsible";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Collapsible: thin Base-UI wrapper for nav subgroups and disclosures.
 * (Accordion is for content panels; semantics differ.) Chevron rotation is
 * left to the trigger content via data-[panel-open]. */

const CollapsibleRoot = Collapsible.Root;
const CollapsibleTrigger = Collapsible.Trigger;

const CollapsiblePanel = React.forwardRef<
  React.ElementRef<typeof Collapsible.Panel>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Panel>
>(({ className, children, ...props }, ref) => (
  <Collapsible.Panel ref={ref} className={cn("overflow-hidden", className)} {...props}>
    <CollapsibleReveal>{children}</CollapsibleReveal>
  </Collapsible.Panel>
));
CollapsiblePanel.displayName = "CollapsiblePanel";

function CollapsibleReveal({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

export { CollapsibleRoot as Collapsible, CollapsibleTrigger, CollapsiblePanel };
