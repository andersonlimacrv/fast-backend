import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMembers } from "@/hooks/useMembers";
import { ROLES } from "@/lib/constants";
import { inviteMember, kickMember, updateMemberRole } from "@/services/members";
import { notify } from "@/services/notify";

export function MembersPage() {
  const { activeOrgId } = useAuth();
  const { items: members, error, loading, busy, mutate } = useMembers(activeOrgId);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string>("member");

  if (!activeOrgId) {
    return (
      <div>
        <PageHeader title="Members" description="Pick an active organization first." />
      </div>
    );
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = userId;
    const added = await mutate(() => inviteMember(activeOrgId, uid, role));
    if (added) {
      setUserId("");
      notify.success("Member added", uid);
    }
  };

  const changeRole = async (uid: string, next: string) => {
    const updated = await mutate(() => updateMemberRole(activeOrgId, uid, next));
    if (updated) notify.success("Role updated", `${uid} → ${next}`);
  };

  const remove = async (uid: string) => {
    const done = await mutate(() => kickMember(activeOrgId, uid));
    if (done !== null) notify.success("Member removed", uid);
  };

  return (
    <div>
      <PageHeader
        title="Members"
        description={`GET/POST/PATCH/DELETE /organizations/${activeOrgId}/members`}
      />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void add(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end">
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
            <Button type="submit" disabled={busy}>
              {busy ? "Adding…" : "Add member"}
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
              <TableHead>User id</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.user_id}>
                <TableCell className="font-mono text-xs">{m.user_id}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{m.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {ROLES.filter((r) => r !== m.role).map((r) => (
                      <Button key={r} size="sm" variant="outline" onClick={() => void changeRole(m.user_id, r)}>
                        → {r}
                      </Button>
                    ))}
                    <Button size="sm" variant="destructive" onClick={() => void remove(m.user_id)}>
                      Remove
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
