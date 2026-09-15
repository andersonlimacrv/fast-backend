import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginPage() {
  const { login, sessionNotice, dismissNotice } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Login" description="POST /auth/login against the running backend." />
      {sessionNotice && (
        <div className="mb-4 rounded-md border border-border bg-muted p-3 text-sm">
          <p>{sessionNotice}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={dismissNotice}>
            Dismiss
          </Button>
        </div>
      )}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <Field label="Email">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <ErrorBox error={error} />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Logging in…" : "Login"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            No account? <Link to="/register" className="text-primary underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(email, password);
      navigate("/");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Register" description="POST /auth/register then auto-login (min 8 chars)." />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <Field label="Email">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password (min 8)">
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <ErrorBox error={error} />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Registering…" : "Register"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Have an account? <Link to="/login" className="text-primary underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
