import { useState } from "react";

import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminOrgs } from "@/hooks/useAdmin";
import { ROLES } from "@/lib/constants";
import { normalizeReason, removeMembership, setMembership } from "@/services/admin";
import { notify } from "@/services/notify";

export function AdminOrgsPage() {
  const { items: orgs, error, loading, busy, mutate, setError } = useAdminOrgs();
  const [orgId, setOrgId] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string>("member");
  const [reason, setReason] = useState("");

  const takeReason = (): string | null => {
    const ok = normalizeReason(reason);
    if (!ok) setError(new Error(`Reason required (min 8 chars) — it is audited with every action.`));
    return ok;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = takeReason();
    if (!ok || !orgId) return;
    const done = await mutate(() => setMembership(orgId, userId, role, ok));
    if (done !== null) {
      setUserId("");
      notify.success("Membership set", `${userId} → ${role}`);
    }
  };

  const remove = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = takeReason();
    if (!ok || !orgId || !userId.trim()) return;
    const done = await mutate(() => removeMembership(orgId, userId, ok));
    if (done !== null) {
      setUserId("");
      notify.success("Membership removed", userId.slice(0, 8));
    }
  };

  return (
    <RequireStaff title="Admin organizations">
      <PageHeader title="Admin organizations" description="GET /admin/organizations + membership actions (staff+; cross-org, audited)" />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void save(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Organization">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  aria-label="Organization"
                >
                  <option value="">Pick…</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex-1">
              <Field label="User id">
                <Input required value={userId} onChange={(e) => setUserId(e.target.value)} />
              </Field>
            </div>
            <Field label="Role">
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex-1">
              <Field label="Reason (audited)">
                <Input required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="why is this needed?" />
              </Field>
            </div>
            <Button type="submit" disabled={busy || !orgId}>
              {busy ? "Saving…" : "Set membership"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ErrorBox error={error} className="mb-4" />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Id</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{o.slug}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{o.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Removing the last owner is refused (409) — backend rule. The same reason field above is audited with the removal.
      </p>
      <div className="mt-2">
        <Button variant="destructive" size="sm" disabled={busy || !orgId || !userId.trim()} onClick={(e) => void remove(e)}>
          Remove membership
        </Button>
      </div>
    </RequireStaff>
  );
}
