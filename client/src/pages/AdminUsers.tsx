import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminUsers } from "@/hooks/useAdmin";
import {
  createUser,
  createUserSchema,
  disableUser,
  enableUser,
  forceUserPasswordReset,
  grantUserStaff,
  isRoot,
  normalizeReason,
  revokeUserSessions,
  revokeUserStaff,
  type CreateUserInput,
} from "@/services/admin";
import { notify } from "@/services/notify";

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const { items: users, error, loading, busy, mutate, setError } = useAdminUsers();
  const [reason, setReason] = useState("");
  const {
    register: field,
    handleSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", password: "", reason: "" },
  });

  const takeReason = (): string | null => {
    const ok = normalizeReason(reason);
    if (!ok) setError(new Error(`Reason required (min 8 chars) — it is audited with every action.`));
    return ok;
  };

  const create = async (input: CreateUserInput) => {
    const created = await mutate(() => createUser(input.email, input.password, input.reason));
    if (created) {
      resetCreate();
      notify.success("User created", created.email);
    }
  };

  const run = async (label: string, userId: string, fn: (r: string) => Promise<unknown>) => {
    const ok = takeReason();
    if (!ok) return;
    const done = await mutate(() => fn(ok));
    if (done !== null) notify.success(label, userId.slice(0, 8));
  };

  const confirmRun = (title: string, description: string, label: string, userId: string, fn: (r: string) => Promise<unknown>) => {
    const ok = takeReason();
    if (!ok) return;
    notify.confirm(title, description, { label: "Confirm", onClick: () => void run(label, userId, fn) });
  };

  return (
    <RequireStaff title="Admin users">
      <PageHeader title="Admin users" description="GET/POST /admin/users + action endpoints (staff+; staff grant/revoke are root-only)" />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void handleSubmit(create)(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end" noValidate>
            <div className="flex-1">
              <Field label="Email">
                <Input type="email" autoComplete="off" aria-invalid={!!createErrors.email} {...field("email")} />
              </Field>
              {createErrors.email && (
                <p className="text-xs text-destructive" role="alert">
                  {createErrors.email.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Field label="Password">
                <Input
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!createErrors.password}
                  {...field("password")}
                />
              </Field>
              {createErrors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {createErrors.password.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Field label="Reason (audited)">
                <Input
                  aria-invalid={!!createErrors.reason}
                  placeholder="why is this needed?"
                  {...field("reason")}
                />
              </Field>
              {createErrors.reason && (
                <p className="text-xs text-destructive" role="alert">
                  {createErrors.reason.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create user"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ErrorBox error={error} className="mb-4" />
      <div className="mb-4 flex max-w-md flex-col gap-2">
        <Field label="Reason for row actions (audited)">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="why is this needed? (min 8 chars)"
          />
        </Field>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <span className="text-sm">{u.email}</span>{" "}
                  <span className="font-mono text-xs text-muted-foreground">{u.id.slice(0, 8)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={u.is_active ? "default" : "destructive"}>{u.is_active ? "active" : "disabled"}</Badge>
                    {u.is_superuser && <Badge variant="secondary">root</Badge>}
                    {u.is_staff && !u.is_superuser && <Badge variant="secondary">staff</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.is_active ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        onClick={() =>
                          confirmRun("Disable user", `${u.email} will not be able to log in.`, "User disabled", u.id, (r) =>
                            disableUser(u.id, r),
                          )
                        }
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void run("User enabled", u.id, (r) => enableUser(u.id, r))}>
                        Enable
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        confirmRun("Revoke sessions", `All refresh families of ${u.email} die now.`, "Sessions revoked", u.id, (r) =>
                          revokeUserSessions(u.id, r),
                        )
                      }
                    >
                      Revoke sessions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        confirmRun(
                          "Force password reset",
                          `A reset email is queued for ${u.email}. No secret is shown here.`,
                          "Reset queued",
                          u.id,
                          (r) => forceUserPasswordReset(u.id, r),
                        )
                      }
                    >
                      Force reset
                    </Button>
                    {isRoot(me) &&
                      (u.is_staff ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            confirmRun("Revoke staff", `${u.email} loses global admin.`, "Staff revoked", u.id, (r) =>
                              revokeUserStaff(u.id, r),
                            )
                          }
                        >
                          Revoke staff
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            confirmRun("Grant staff", `${u.email} gains global admin.`, "Staff granted", u.id, (r) =>
                              grantUserStaff(u.id, r),
                            )
                          }
                        >
                          Grant staff
                        </Button>
                      ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </RequireStaff>
  );
}
