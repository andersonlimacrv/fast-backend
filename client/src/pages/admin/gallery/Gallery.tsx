import { DEMOS, hasDemo } from "@/components/catalog-demos";
import { UsageList } from "@/components/catalog-meta";
import { EmptyState } from "@/components/error-state";
import { PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLASS_LABEL, CLASS_ORDER, nn, validatedByClass } from "@/lib/catalog";
import type { CatalogEntry } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/* Gallery: the VALIDATED catalog, split into Components and Blocks. Each item
 * renders its live proof (same registry as Lab trials) plus where it is used
 * for real — the identification the owner asked for. Items become visible
 * here by flipping `status` to "validated" in `lib/catalog/entries.ts`.
 *
 * Layout (change `gallery-bento`, owner 2026-10-13): responsive bento grid —
 * sections are container-query scopes (the shell drawer/rail/expanded changes
 * the content width, so viewport breakpoints alone misfire); 1 → 2 → 3
 * columns by container width with dense flow (fills gaps, DOM/keyboard order
 * untouched). Wide demos span 2 columns; tall-narrow ones stay single. */

/* Slugs whose proofs are intrinsically wide (two-up internal grids, capped
 * max-w-* blocks, page-size blocks). Everything else is single-column. */
const WIDE_TILES = new Set([
  "accordion",
  "collapsible",
  "credit-usage-card",
  "expand-details",
  "tabs",
  "animated-circular-progress-bar",
  "subsription-calendar",
  "404-page-not-found",
]);

/* Proofs with a max-w-* root hug the left edge in a wide tile — center them. */
const CENTERED_TILES = new Set(["credit-usage-card", "tabs", "inputs", "sidebar"]);

function GalleryCard({ entry }: { entry: CatalogEntry }) {
  return (
    <Card className={cn("flex h-full flex-col", WIDE_TILES.has(entry.slug) && "@[44rem]:col-span-2")}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono text-xs text-muted-foreground">{nn(entry)}</span>
          <span>{entry.name}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {entry.kind}
          </span>
        </CardTitle>
        <UsageList usedIn={entry.usedIn} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center p-4 pt-0">
        {hasDemo(entry.slug) ? (
          <div className={cn("min-w-0", CENTERED_TILES.has(entry.slug) && "grid justify-items-center")}>
            {DEMOS[entry.slug]}
          </div>
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
      <div className="grid gap-8">
        {CLASS_ORDER.map((cls) => {
          const entries = validatedByClass(cls);
          return (
            <section key={cls} className="@container grid gap-3">
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
                <div className="grid grid-cols-1 items-stretch gap-4 grid-flow-dense @[44rem]:grid-cols-2 @[76rem]:grid-cols-3">
                  {entries.map((entry) => (
                    <GalleryCard key={entry.slug} entry={entry} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </RequireStaff>
  );
}
