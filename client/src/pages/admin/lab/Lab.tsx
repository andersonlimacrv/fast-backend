import { Link } from "react-router-dom";

import { StatusBadge } from "@/components/catalog-meta";
import { PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLASS_LABEL, CLASS_ORDER, byClass, nn } from "@/lib/catalog";
import { ROUTES } from "@/lib/constants";

/* Lab: the adoption list. One row per catalog entry, split into Components and
 * Blocks, with its stable number and status. Approving an item 1-by-1 means
 * flipping `status` in `lib/catalog/entries.ts` (pending → validated), which
 * moves its proof from Trials to the Gallery. */

export function LabPage() {
  return (
    <RequireStaff title="Lab">
      <PageHeader
        title="Lab"
        description="Adoption list: every item starts pending here and is validated 1-by-1; validated ones move to the Gallery."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Live proofs of the pending items (neutral data, keyboard reachable).
          </p>
          <Link to={ROUTES.adminLabTrials} className="text-foreground underline decoration-primary/70 underline-offset-4">
            Open trials
          </Link>
        </CardContent>
      </Card>
      <div className="mt-4 grid gap-4">
        {CLASS_ORDER.map((cls) => {
          const entries = byClass(cls);
          return (
            <Card key={cls}>
              <CardHeader>
                <CardTitle className="text-base">
                  {CLASS_LABEL[cls]} <span className="text-muted-foreground">({entries.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2">
                  {entries.map((entry) => (
                    <li key={entry.slug} className="grid gap-1 border-b border-border pb-2 last:border-b-0 last:pb-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">{nn(entry)}</span>
                        <span className="font-mono text-xs font-medium">{entry.name}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                          {entry.kind}
                        </span>
                        <StatusBadge status={entry.status} />
                        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                          {entry.source ?? "not ported"}
                        </span>
                      </div>
                      {entry.note && <p className="pl-8 text-xs text-muted-foreground">{entry.note}</p>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </RequireStaff>
  );
}
