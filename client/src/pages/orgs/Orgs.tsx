import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrgs } from "@/hooks/useOrgs";
import { ChevronRight } from "@/lib/icons";
import { ROUTES } from "@/lib/constants";
import { createOrganization } from "@/services/orgs";
import { notify } from "@/services/notify";

export function OrgsPage() {
  const { switchOrg, activeOrgId, refreshUser } = useAuth();
  const { items: orgs, error, loading, busy, mutate } = useOrgs();
  const [name, setName] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

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
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="hidden sm:table-cell">Id</TableHead>
              <TableHead>Context</TableHead>
              <TableHead className="w-10 sm:hidden">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((o) => (
              <Fragment key={o.id}>
              <TableRow>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary">{o.slug}</Badge>
                </TableCell>
                <TableCell className="hidden max-w-48 truncate font-mono text-xs sm:table-cell">{o.id}</TableCell>
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
                  <TableCell className="sm:hidden">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-expanded={openId === o.id}
                      aria-label={`Details for ${o.name}`}
                      onClick={() => setOpenId(openId === o.id ? null : o.id)}
                    >
                      <ChevronRight className={`size-4 transition-transform ${openId === o.id ? "rotate-90" : ""}`} aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
                {openId === o.id && (
                  <TableRow key={`${o.id}-detail`} className="sm:hidden">
                    <TableCell colSpan={3}>
                      <dl className="grid gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <dt className="shrink-0 text-muted-foreground">Slug</dt>
                          <dd>
                            <Badge variant="secondary">{o.slug}</Badge>
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="shrink-0 text-muted-foreground">Id</dt>
                          <dd className="break-all font-mono">{o.id}</dd>
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
    </div>
  );
}
