import * as React from "react";

import { cn } from "@/lib/utils";

/* Skeleton placeholder (shadcn pattern). Pair with section-level loading
 * states instead of full-page spinners (DESIGN.md §11). */

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
  ),
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
