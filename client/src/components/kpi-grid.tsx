import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* KPI grid (DESIGN.md §5.1 + §6): container-query columns, single orchestrated
 * entrance on data load (not one effect per card), polite live region for
 * self-updating values. Children are KpiCard (or skeleton fallbacks). */

export function KpiGrid({
  loading,
  children,
  className,
  label = "Key metrics",
}: {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const reduceMotion = useReducedMotion();
  const items = React.Children.toArray(children);

  return (
    <div className="@container" aria-live="polite" aria-busy={loading === true} aria-label={label}>
      <div className={cn("grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-4", className)}>
        {items.map((child, i) => (
          <motion.div
            key={i}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut", delay: reduceMotion ? 0 : i * 0.05 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
