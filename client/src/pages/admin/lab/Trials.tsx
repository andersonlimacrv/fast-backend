import { StatusBadge } from "@/components/catalog-meta";
import { DEMOS, hasDemo } from "@/components/catalog-demos";
import { PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLASS_LABEL, CLASS_ORDER, byClass, nn } from "@/lib/catalog";
import type { CatalogEntry } from "@/lib/catalog";

/* Lab trials: live proofs of the PENDING items (validated ones render in the
 * Gallery from the same registry). Numbering mirrors `lib/catalog`, so trial
 * and gallery always agree on `n`. */

function TrialCard({ entry }: { entry: CatalogEntry }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <span className="font-mono text-xs text-muted-foreground">{nn(entry)}</span>
          <span>{entry.name}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {entry.kind}
          </span>
          <StatusBadge status={entry.status} />
        </CardTitle>
        {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
      </CardHeader>
      <CardContent>
        {hasDemo(entry.slug) ? (
          DEMOS[entry.slug]
        ) : (
          <p className="text-sm text-muted-foreground">
            No live proof yet — {entry.source ? "ported, awaiting a proof" : "not ported"}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function LabTrialsPage() {
  const pending = byClass("component")
    .concat(byClass("block"))
    .filter((e) => e.status === "pending");

  return (
    <RequireStaff title="Lab trials">
      <PageHeader
        title="Lab trials"
        description="Live proofs, one card per pending item. Validating moves the card to the Gallery."
      />
      <div className="grid gap-4">
        {CLASS_ORDER.map((cls) => {
          const entries = pending.filter((e) => e.class === cls);
          if (entries.length === 0) return null;
          return (
            <section key={cls} className="grid gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {CLASS_LABEL[cls]} <span className="font-normal">({entries.length} pending)</span>
              </h2>
              {entries.map((entry) => (
                <TrialCard key={entry.slug} entry={entry} />
              ))}
            </section>
          );
        })}
      </div>
    </RequireStaff>
  );
}
