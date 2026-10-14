/* Small shared bits for the catalog pages (Lab + Gallery): status badge and
 * the "used in" list. Kept here (not in pages/) because both pages import it
 * — pages never import from other pages (ADR 0013). */

import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import type { CatalogStatus, CatalogUsage } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<CatalogStatus, "default" | "secondary" | "destructive"> = {
  validated: "default",
  pending: "secondary",
  dropped: "destructive",
};

export function StatusBadge({ status }: { status: CatalogStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}

const SCOPE_LABEL: Record<CatalogUsage["scope"], string> = {
  app: "app",
  admin: "admin",
  shell: "shell",
};

export function UsageList({ usedIn, className }: { usedIn: CatalogUsage[]; className?: string }) {
  if (usedIn.length === 0) {
    return <span className={cn("text-xs text-muted-foreground", className)}>not used yet</span>;
  }
  return (
    <span className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground", className)}>
      <span className="font-medium">Used in</span>
      {usedIn.map((u) => (
        <span key={`${u.label}-${u.to ?? ""}`} className="inline-flex items-center gap-1">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
            {SCOPE_LABEL[u.scope]}
          </span>
          {u.to ? (
            <Link to={u.to} className="text-foreground underline decoration-primary/70 underline-offset-4">
              {u.label}
            </Link>
          ) : (
            <span>{u.label}</span>
          )}
        </span>
      ))}
    </span>
  );
}
