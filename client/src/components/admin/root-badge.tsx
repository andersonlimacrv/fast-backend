/* Root mode badge (change `root-mode`, owner 2026-10-01): the "Modo Root" card
 * — crown, title, objective subtitle, chevron, accent edge — plus a compact
 * pill for tight spaces. Doubles as the footer user-menu trigger for root
 * (forwardRef + props passthrough for Radix `asChild`); text hides in the
 * icon rail, keeping the crown. */

import * as React from "react";

import { Crown } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface RootBadgeProps extends React.ComponentPropsWithoutRef<"div"> {
  compact?: boolean;
}

const RootBadge = React.forwardRef<HTMLDivElement, RootBadgeProps>(
  ({ className, compact = false, ...props }, ref) => {
    if (compact) {
      return (
        <span
          data-slot="root-badge"
          className={cn(
            "inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground",
            className,
          )}
        >
          <Crown className="size-3.5" aria-hidden="true" />
          Root
        </span>
      );
    }
    return (
      <div
        ref={ref}
        data-slot="root-badge"
        className={cn(
          "flex items-center gap-2.5 rounded-lg border border-border/60 border-l-4 border-l-chart-3 bg-card px-3 py-2",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        <Crown className="size-5 shrink-0 text-chart-3" aria-hidden="true" />
        <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-bold">Root Mode</span>
          <span className="truncate text-xs text-muted-foreground">Full system access</span>
        </span>
      </div>
    );
  },
);
RootBadge.displayName = "RootBadge";

export { RootBadge };
