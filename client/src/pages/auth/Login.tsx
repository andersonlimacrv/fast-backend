import { Link } from "react-router-dom";

import { LoginForm } from "@/components/login-form";
import { PageHeader } from "@/components/feedback";
import { Card, CardContent } from "@/components/ui/card";

export function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Login" description="Email first — POST /auth/login against the running backend." />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <LoginForm />
          <p className="text-sm text-muted-foreground">
            No account? <Link to="/register" className="text-foreground underline decoration-primary/70 underline-offset-4">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
