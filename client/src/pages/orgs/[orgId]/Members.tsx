import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMembers } from "@/hooks/useMembers";
import { ChevronRight } from "@/lib/icons";
import { ROLES } from "@/lib/constants";
import { inviteMember, kickMember, updateMemberRole } from "@/services/members";
import { inviteMemberSchema, type InviteMemberInput } from "@/services/members";
import { notify } from "@/services/notify";

export function MembersPage() {
  const { activeOrgId } = useAuth();
  const { items: members, error, loading, busy, mutate } = useMembers(activeOrgId);
  const [openId, setOpenId] = useState<string | null>(null);
  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { userId: "", role: "member" },
  });

  if (!activeOrgId) {
    return (
      <div>
        <PageHeader title="Members" description="Pick an active organization first." />
      </div>
    );
  }

  const add = async (input: InviteMemberInput) => {
    const added = await mutate(() => inviteMember(activeOrgId, input.userId, input.role));
    if (added) {
      reset();
      notify.success("Member added", input.userId);
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
          <form onSubmit={(e) => void handleSubmit(add)(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end" noValidate>
            <div className="flex-1">
              <Field label="User id">
                <Input aria-invalid={!!errors.userId} {...field("userId")} />
              </Field>
              {errors.userId && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.userId.message}
                </p>
              )}
            </div>
            <Field label="Role">
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                {...field("role")}
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
              <TableHead className="hidden sm:table-cell">User id</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead className="w-10 sm:hidden">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <Fragment key={m.user_id}>
              <TableRow>
                <TableCell className="hidden font-mono text-xs sm:table-cell">{m.user_id}</TableCell>
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
                  <TableCell className="sm:hidden">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-expanded={openId === m.user_id}
                      aria-label={`Details for ${m.user_id.slice(0, 8)}`}
                      onClick={() => setOpenId(openId === m.user_id ? null : m.user_id)}
                    >
                      <ChevronRight className={`size-4 transition-transform ${openId === m.user_id ? "rotate-90" : ""}`} aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
                {openId === m.user_id && (
                  <TableRow key={`${m.user_id}-detail`} className="sm:hidden">
                    <TableCell colSpan={3}>
                      <dl className="grid gap-1 text-xs">
                        <div className="flex gap-2">
                          <dt className="shrink-0 text-muted-foreground">User id</dt>
                          <dd className="break-all font-mono">{m.user_id}</dd>
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
