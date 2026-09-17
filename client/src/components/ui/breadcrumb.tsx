import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

/* Breadcrumb: pure CSS trail (no primitive needed). Overflow collapses to
 * first + current on small screens via hidden sm:inline-flex. */

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb({ trail, className }: { trail: Crumb[]; className?: string }) {
  if (trail.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          const hideable = trail.length > 2 && i > 0 && !last;
          return (
            <li
              key={`${crumb.label}-${i}`}
              className={cn("flex min-w-0 items-center gap-1.5", hideable && "hidden sm:flex")}
            >
              {i > 0 && (
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
              )}
              {last || !crumb.to ? (
                <span aria-current={last ? "page" : undefined} className={last ? "truncate font-medium" : "truncate text-muted-foreground"}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className="truncate text-muted-foreground hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
