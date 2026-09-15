import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminOrgs } from "@/hooks/useAdmin";
import { ROLES } from "@/lib/constants";
import {
  adminMembershipSchema,
  normalizeReason,
  removeMembership,
  setMembership,
  type AdminMembershipInput,
} from "@/services/admin";
import { notify } from "@/services/notify";

export function AdminOrgsPage() {
  const { items: orgs, error, loading, busy, mutate, setError } = useAdminOrgs();
  const {
    register: field,
    handleSubmit,
    reset: resetMembership,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdminMembershipInput>({
    resolver: zodResolver(adminMembershipSchema),
    defaultValues: { orgId: "", userId: "", role: "member", reason: "" },
  });
  const orgId = watch("orgId");
  const userId = watch("userId");

  const takeReason = (): string | null => {
    const ok = normalizeReason(watch("reason"));
    if (!ok) setError(new Error(`Reason required (min 8 chars) — it is audited with every action.`));
    return ok;
  };

  const save = async (input: AdminMembershipInput) => {
    const done = await mutate(() => setMembership(input.orgId, input.userId, input.role, input.reason));
    if (done !== null) {
      setValue("userId", "");
      notify.success("Membership set", `${input.userId} → ${input.role}`);
    }
  };

  const remove = async () => {
    const ok = takeReason();
    const uid = watch("userId").trim();
    if (!ok || !orgId || !uid) return;
    const done = await mutate(() => removeMembership(orgId, uid, ok));
    if (done !== null) {
      resetMembership();
      notify.success("Membership removed", uid.slice(0, 8));
    }
  };

  return (
    <RequireStaff title="Admin organizations">
      <PageHeader title="Admin organizations" description="GET /admin/organizations + membership actions (staff+; cross-org, audited)" />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void handleSubmit(save)(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end" noValidate>
            <div className="flex-1">
              <Field label="Organization">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  aria-label="Organization"
                  aria-invalid={!!errors.orgId}
                  {...field("orgId")}
                >
                  <option value="">Pick…</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </Field>
              {errors.orgId && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.orgId.message}
                </p>
              )}
            </div>
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
                aria-invalid={!!errors.role}
                {...field("role")}
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
                <Input aria-invalid={!!errors.reason} placeholder="why is this needed?" {...field("reason")} />
              </Field>
              {errors.reason && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.reason.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={busy}>
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
        <Button variant="destructive" size="sm" disabled={busy || !orgId || !userId.trim()} onClick={() => void remove()}>
          Remove membership
        </Button>
      </div>
    </RequireStaff>
  );
}
