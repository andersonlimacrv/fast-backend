import { DEMOS, hasDemo } from "@/components/catalog-demos";
import { StatusBadge, UsageList } from "@/components/catalog-meta";
import { EmptyState } from "@/components/error-state";
import { PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLASS_LABEL, CLASS_ORDER, nn, validatedByClass } from "@/lib/catalog";
import type { CatalogEntry } from "@/lib/catalog";

/* Gallery: the VALIDATED catalog, split into Components and Blocks. Each item
 * renders its live proof (same registry as Lab trials) plus where it is used
 * for real — the identification the owner asked for. Items become visible
 * here by flipping `status` to "validated" in `lib/catalog/entries.ts`. */

function GalleryCard({ entry }: { entry: CatalogEntry }) {
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
        <UsageList usedIn={entry.usedIn} />
      </CardHeader>
      <CardContent>
        {hasDemo(entry.slug) ? (
          DEMOS[entry.slug]
        ) : (
          <p className="text-sm text-muted-foreground">{entry.source ?? "not ported"}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function GalleryPage() {
  return (
    <RequireStaff title="Gallery">
      <PageHeader
        title="Gallery"
        description="Validated components and blocks in real use, with the pages that consume them."
      />
      <div className="grid gap-4">
        {CLASS_ORDER.map((cls) => {
          const entries = validatedByClass(cls);
          return (
            <section key={cls} className="grid gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {CLASS_LABEL[cls]} <span className="font-normal">({entries.length} validated)</span>
              </h2>
              {entries.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <EmptyState
                      title={`No validated ${CLASS_LABEL[cls].toLowerCase()} yet`}
                      description="Items appear here as they clear the Lab."
                    />
                  </CardContent>
                </Card>
              ) : (
                entries.map((entry) => <GalleryCard key={entry.slug} entry={entry} />)
              )}
            </section>
          );
        })}
      </div>
    </RequireStaff>
  );
}
