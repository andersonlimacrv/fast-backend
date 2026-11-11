import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { PasswordInput } from "@/components/auth/password-input";
import { SocialButtons } from "@/components/auth/social-buttons";
import { ErrorBox } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { forgotPassword } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { ChevronLeft } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  loginEmailSchema,
  loginPasswordSchema,
  type LoginEmailInput,
  type LoginPasswordInput,
} from "@/services/login";

type ForgotState = "idle" | "sending" | "sent";

function StepProgress({ step }: { step: "email" | "password" }) {
  return (
    <div className="mb-6 flex gap-1.5" aria-hidden="true">
      <span className="h-1 flex-1 rounded-full bg-chart-3" />
      <span
        className={cn("h-1 flex-1 rounded-full transition-colors", step === "password" ? "bg-chart-3" : "bg-muted")}
      />
    </div>
  );
}

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
  const [forgot, setForgot] = useState<ForgotState>("idle");
  const [forgotError, setForgotError] = useState<unknown>(null);

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
    setForgot("idle");
    setForgotError(null);
    setStep("password");
  };

  const backToEmail = () => {
    setStep("email");
    setServerError(null);
    setForgot("idle");
    setForgotError(null);
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

  const sendReset = async () => {
    setForgotError(null);
    setForgot("sending");
    try {
      await forgotPassword(email);
      setForgot("sent");
    } catch (err) {
      setForgot("idle");
      setForgotError(err);
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
        <div className="space-y-6">
          <SocialButtons />
          <div>
            <StepProgress step={step} />
            <form onSubmit={(e) => void emailForm.handleSubmit(submitEmail)(e)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  aria-invalid={!!emailForm.formState.errors.email}
                  aria-describedby={emailForm.formState.errors.email ? "login-email-error" : undefined}
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p id="login-email-error" className="mt-1 text-xs text-destructive" role="alert">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You&apos;ll enter your password on the next step.
              </p>
            </form>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => void passwordForm.handleSubmit(submitPassword)(e)} className="space-y-4" noValidate>
          <StepProgress step={step} />
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={backToEmail}
              aria-label="Use a different email"
              className={cn(
                "-ml-1 mt-0.5 rounded-md p-1 text-muted-foreground transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Signing in as</p>
              <p className="truncate text-sm font-medium">{email}</p>
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              autoFocus
              aria-invalid={!!passwordForm.formState.errors.password}
              aria-describedby={passwordForm.formState.errors.password ? "login-password-error" : undefined}
              {...passwordForm.register("password")}
            />
            {passwordForm.formState.errors.password && (
              <p id="login-password-error" className="mt-1 text-xs text-destructive" role="alert">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0"
              onClick={() => void sendReset()}
              disabled={forgot === "sending" || forgot === "sent"}
            >
              {forgot === "sent" ? "Reset link sent" : forgot === "sending" ? "Sending…" : "Forgot password?"}
            </Button>
          </div>
          {forgot === "sent" && (
            <p role="status" className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
              If this account exists, a reset link is on its way.
            </p>
          )}
          <ErrorBox error={forgotError} />
          <ErrorBox error={serverError} />
          <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Signing in…" : "Login"}
          </Button>
        </form>
      )}
    </div>
  );
}
