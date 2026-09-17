import { Fragment, useState } from "react";

import { ErrorBox, PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminAudit } from "@/hooks/useAdmin";
import { ChevronRight } from "@/lib/icons";
import { AUDIT_LIMIT } from "@/lib/constants";

export function AdminAuditPage() {
  const { items: rows, error, loading, reload } = useAdminAudit();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <RequireStaff title="Admin audit" requireRoot>
      <PageHeader
        title="Global audit"
        description={`Root-only GET /admin/audit (latest ${AUDIT_LIMIT}; privileged reads, reason+success in metadata)`}
      />
      <div className="mb-4">
        <Button variant="outline" onClick={() => void reload()} disabled={loading}>
          {loading ? "Loading…" : "Reload"}
        </Button>
      </div>
      <ErrorBox error={error} className="mb-4" />
      {!loading && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden sm:table-cell">Resource</TableHead>
              <TableHead className="hidden sm:table-cell">Reason</TableHead>
              <TableHead className="hidden sm:table-cell">Actor</TableHead>
              <TableHead className="w-10 sm:hidden">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <Fragment key={r.id}>
              <TableRow>
                <TableCell className="whitespace-nowrap text-xs">
                  {new Date(r.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{r.action}</Badge>
                </TableCell>
                <TableCell className="hidden font-mono text-xs sm:table-cell">
                  {r.resource_type ?? "—"}
                  {r.resource_id ? `:${r.resource_id.slice(0, 8)}` : ""}
                </TableCell>
                <TableCell className="hidden max-w-60 truncate text-xs sm:table-cell">
                  {String(r.metadata?.reason ?? "—")}
                </TableCell>
                <TableCell className="hidden max-w-40 truncate font-mono text-xs sm:table-cell">
                  {r.actor_user_id?.slice(0, 8) ?? "—"}
                </TableCell>
                <TableCell className="sm:hidden">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-expanded={openId === r.id}
                    aria-label={`Details for ${r.action}`}
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  >
                    <ChevronRight className={`size-4 transition-transform ${openId === r.id ? "rotate-90" : ""}`} aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
              {openId === r.id && (
                <TableRow key={`${r.id}-detail`} className="sm:hidden">
                  <TableCell colSpan={3}>
                    <dl className="grid gap-1 text-xs">
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-muted-foreground">Resource</dt>
                        <dd className="break-all font-mono">
                          {r.resource_type ?? "—"}
                          {r.resource_id ? `:${r.resource_id.slice(0, 8)}` : ""}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-muted-foreground">Reason</dt>
                        <dd className="break-words">{String(r.metadata?.reason ?? "—")}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-muted-foreground">Actor</dt>
                        <dd className="break-all font-mono">{r.actor_user_id?.slice(0, 8) ?? "—"}</dd>
                      </div>
                    </dl>
                  </TableCell>
                </TableRow>
              )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </RequireStaff>
  );
}
