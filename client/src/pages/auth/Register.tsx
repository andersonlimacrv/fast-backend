import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <div className="mx-auto max-w-md">
      <PageHeader title="Register" description="POST /auth/register then auto-login (min 8 chars)." />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={(e) => void handleSubmit(submit)(e)} className="space-y-4" noValidate>
            <Field label="Email">
              <Input type="email" autoComplete="email" aria-invalid={!!errors.email} {...field("email")} />
            </Field>
            {errors.email && (
              <p className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
            <Field label="Password (min 8)">
              <Input
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...field("password")}
              />
            </Field>
            {errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
            <ErrorBox error={serverError} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering…" : "Register"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Have an account? <Link to="/login" className="text-foreground underline decoration-primary/70 underline-offset-4">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
