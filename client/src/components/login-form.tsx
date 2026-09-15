import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import {
  loginEmailSchema,
  loginPasswordSchema,
  type LoginEmailInput,
  type LoginPasswordInput,
} from "@/services/login";

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
  const [serverError, setServerError] = useState<unknown>(null);

  const emailForm = useForm<LoginEmailInput>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<LoginPasswordInput>({
    resolver: zodResolver(loginPasswordSchema),
    defaultValues: { password: "" },
  });

  const submitEmail = (input: LoginEmailInput) => {
    setEmail(input.email);
    passwordForm.reset({ password: "" });
    setServerError(null);
    setStep("password");
  };

  const submitPassword = async (input: LoginPasswordInput) => {
    setServerError(null);
    try {
      await login(email, input.password);
      onDone?.();
      navigate(ROUTES.app);
    } catch (err) {
      setServerError(err);
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
        <form onSubmit={(e) => void emailForm.handleSubmit(submitEmail)(e)} className="space-y-4" noValidate>
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              autoFocus
              aria-invalid={!!emailForm.formState.errors.email}
              {...emailForm.register("email")}
            />
          </Field>
          {emailForm.formState.errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {emailForm.formState.errors.email.message}
            </p>
          )}
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => void passwordForm.handleSubmit(submitPassword)(e)} className="space-y-4" noValidate>
          <p className="text-sm text-muted-foreground">
            Logging in as <span className="font-medium text-foreground">{email}</span>{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => {
                setStep("email");
                setServerError(null);
              }}
            >
              change
            </button>
          </p>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              autoFocus
              aria-invalid={!!passwordForm.formState.errors.password}
              {...passwordForm.register("password")}
            />
          </Field>
          {passwordForm.formState.errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {passwordForm.formState.errors.password.message}
            </p>
          )}
          <ErrorBox error={serverError} />
          <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Logging in…" : "Login"}
          </Button>
        </form>
      )}
    </div>
  );
}
