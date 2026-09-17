import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGrants } from "@/hooks/useGrants";
import { grantSchema, saveGrant, type GrantInput } from "@/services/grants";
import { notify } from "@/services/notify";

export function GrantsPage() {
  const { activeOrgId } = useAuth();
  const { items: grants, error, loading, busy, mutate } = useGrants(activeOrgId);
  const {
    register: field,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GrantInput>({
    resolver: zodResolver(grantSchema),
    defaultValues: { key: "projects.max", limitInput: "10", enabled: true },
  });

  if (!activeOrgId) {
    return (
      <div>
        <PageHeader title="Grants" description="Pick an active organization first." />
      </div>
    );
  }

  const upsert = async (input: GrantInput) => {
    const saved = await mutate(() => saveGrant(activeOrgId, input.key, input.limitInput, input.enabled));
    if (saved) notify.success("Grant saved", input.key);
  };

  return (
    <div>
      <PageHeader
        title="Grants"
        description={`Admin-only PUT/GET /organizations/${activeOrgId}/grants`}
      />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void handleSubmit(upsert)(e)} className="flex flex-col gap-2 lg:flex-row lg:items-end" noValidate>
            <div className="flex-1">
              <Field label="Key (e.g. projects.max, ai.enabled)">
                <Input aria-invalid={!!errors.key} {...field("key")} />
              </Field>
              {errors.key && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.key.message}
                </p>
              )}
            </div>
            <Field label="Limit (empty = null)">
              <Input inputMode="numeric" {...field("limitInput")} />
            </Field>
            <Field label="Enabled">
              <Controller
                control={control}
                name="enabled"
                render={({ field: enabledField }) => (
                  <Switch
                    aria-label="Enabled"
                    checked={enabledField.value}
                    onCheckedChange={enabledField.onChange}
                  />
                )}
              />
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
