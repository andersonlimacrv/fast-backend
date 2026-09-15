import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { normalizeEmail } from "@/services/login";

/**
 * Two-step login shared by the `/login` page and the landing modal.
 * Step 1 only validates format and ALWAYS advances for valid emails —
 * existence is never revealed (backend answers generic 401 after a real
 * attempt, with equal Argon2 cost either way).
 */
export function LoginForm({ onDone }: { onDone?: () => void }) {
  const { login, sessionNotice, dismissNotice } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = normalizeEmail(email);
    if (!ok) {
      setError(new Error("Enter a valid email address."));
      return;
    }
    setEmail(ok);
    setPassword("");
    setError(null);
    setStep("password");
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      onDone?.();
      navigate(ROUTES.app);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {sessionNotice && (
        <div className="mb-4 rounded-md border border-border bg-muted p-3 text-sm">
          <p>{sessionNotice}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={dismissNotice}>
            Dismiss
          </Button>
        </div>
      )}
      {step === "email" ? (
        <form onSubmit={submitEmail} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <ErrorBox error={error} />
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => void submitPassword(e)} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Logging in as <span className="font-medium text-foreground">{email}</span>{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
            >
              change
            </button>
          </p>
          <Field label="Password">
            <Input
              type="password"
              required
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </Field>
          <ErrorBox error={error} />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Logging in…" : "Login"}
          </Button>
        </form>
      )}
    </div>
  );
}
