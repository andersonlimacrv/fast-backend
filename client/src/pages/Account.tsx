import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { updatePassword } from "@/services/account";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AccountPage() {
  const { user, logout, logoutEverywhere } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);
    try {
      await updatePassword(currentPassword, newPassword);
      setOk(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="Account" description="GET /auth/me · password change · global logout." />
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span> {user?.email}
          </p>
          <p className="break-all">
            <span className="text-muted-foreground">Id:</span> <code>{user?.id}</code>
          </p>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void change(e)} className="space-y-3">
            <Field label="Current password">
              <Input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </Field>
            <Field label="New password (min 8)">
              <Input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
            <ErrorBox error={error} />
            {ok && <p className="text-sm text-green-600">Password changed.</p>}
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void logout()}>
            Logout this device
          </Button>
          <Button variant="destructive" onClick={() => void logoutEverywhere()}>
            Logout everywhere
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
