import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAudit } from "@/hooks/useAudit";

export function AuditPage() {
  const { activeOrgId } = useAuth();
  const { items: rows, error, loading, reload } = useAudit(activeOrgId);

  if (!activeOrgId) {
    return (
      <div>
        <PageHeader title="Audit" description="Pick an active organization first." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Audit trail"
        description={`Admin-only GET /organizations/${activeOrgId}/audit (append-only)`}
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
              <TableHead>Resource</TableHead>
              <TableHead>Actor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {new Date(r.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{r.action}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {r.resource_type ?? "—"}
                  {r.resource_id ? `:${r.resource_id.slice(0, 8)}` : ""}
                </TableCell>
                <TableCell className="max-w-40 truncate font-mono text-xs">
                  {r.actor_user_id?.slice(0, 8) ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
