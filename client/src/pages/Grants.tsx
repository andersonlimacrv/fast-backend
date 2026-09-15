import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGrants } from "@/hooks/useGrants";
import { saveGrant } from "@/services/grants";
import { notify } from "@/services/notify";

export function GrantsPage() {
  const { activeOrgId } = useAuth();
  const { items: grants, error, loading, busy, mutate } = useGrants(activeOrgId);
  const [key, setKey] = useState("projects.max");
  const [limit, setLimit] = useState("10");
  const [enabled, setEnabled] = useState(true);

  if (!activeOrgId) {
    return (
      <div>
        <PageHeader title="Grants" description="Pick an active organization first." />
      </div>
    );
  }

  const upsert = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await mutate(() => saveGrant(activeOrgId, key, limit, enabled));
    if (saved) notify.success("Grant saved", key);
  };

  return (
    <div>
      <PageHeader
        title="Grants"
        description={`Admin-only PUT/GET /organizations/${activeOrgId}/grants`}
      />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void upsert(e)} className="flex flex-col gap-2 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Field label="Key (e.g. projects.max, ai.enabled)">
                <Input required value={key} onChange={(e) => setKey(e.target.value)} />
              </Field>
            </div>
            <Field label="Limit (empty = null)">
              <Input value={limit} inputMode="numeric" onChange={(e) => setLimit(e.target.value)} />
            </Field>
            <Field label="Enabled">
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={enabled ? "true" : "false"}
                onChange={(e) => setEnabled(e.target.value === "true")}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Upsert"}
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
              <TableHead>Key</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grants.map((g) => (
              <TableRow key={g.key}>
                <TableCell className="font-medium">{g.key}</TableCell>
                <TableCell>{g.limit ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={g.enabled ? "default" : "destructive"}>{String(g.enabled)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
