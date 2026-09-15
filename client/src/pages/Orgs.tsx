import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrgs } from "@/hooks/useOrgs";
import { ROUTES } from "@/lib/constants";
import { createOrganization } from "@/services/orgs";
import { notify } from "@/services/notify";

export function OrgsPage() {
  const { switchOrg, activeOrgId, refreshUser } = useAuth();
  const { items: orgs, error, loading, busy, mutate } = useOrgs();
  const [name, setName] = useState("");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = name;
    const org = await mutate(async () => {
      const created = await createOrganization(value);
      setName("");
      await refreshUser();
      return created;
    });
    if (org) {
      notify.confirm("Organization created", value, {
        label: "Switch",
        onClick: () => void switchOrg(org.id),
      });
    }
  };

  const switchTo = async (orgId: string) => {
    await switchOrg(orgId);
  };

  return (
    <div>
      <PageHeader title="Organizations" description="GET/POST /organizations — switch sets the tenant context." />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void create(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="New organization name (min 2)">
                <Input value={name} minLength={2} maxLength={120} required onChange={(e) => setName(e.target.value)} />
              </Field>
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create"}
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
              <TableHead>Context</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{o.slug}</Badge>
                </TableCell>
                <TableCell className="max-w-48 truncate font-mono text-xs">{o.id}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {o.id === activeOrgId ? (
                      <Badge>active</Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => void switchTo(o.id)}>
                        Switch
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={ROUTES.members(o.id)}>Members</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
