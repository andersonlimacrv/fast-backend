import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialButtons } from "@/components/auth/social-buttons";
import { ErrorBox } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";
import { registerSchema, type RegisterInput } from "@/services/login";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<unknown>(null);
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { email: "", password: "" } });

  const submit = async (input: RegisterInput) => {
    setServerError(null);
    try {
      await register(input.email, input.password);
      navigate(ROUTES.app);
    } catch (err) {
      setServerError(err);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Start with email and password. You can link single sign-on later."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={ROUTES.login}
            className="font-medium text-foreground underline decoration-primary/70 underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <SocialButtons />
        <form onSubmit={(e) => void handleSubmit(submit)(e)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              {...field("email")}
            />
            {errors.email && (
              <p id="register-email-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="register-password" className="mb-1 block text-sm font-medium">
              Password (min 8)
            </label>
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "register-password-error" : undefined}
              {...field("password")}
            />
            {errors.password && (
              <p id="register-password-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
          <ErrorBox error={serverError} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
