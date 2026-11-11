import { Link } from "react-router-dom";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";
import { ROUTES } from "@/lib/constants";

export function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      description="Access your workspace, projects and audit trail."
      footer={
        <>
          New to fast-backend?{" "}
          <Link
            to={ROUTES.register}
            className="font-medium text-foreground underline decoration-primary/70 underline-offset-4"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
