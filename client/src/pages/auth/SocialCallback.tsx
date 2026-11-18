import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AuthShell } from "@/components/auth/auth-shell";
import { ErrorBox } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";
import { LoaderCircle } from "@/lib/icons";
import { socialErrorMessage } from "@/services/social";

/**
 * Landing point of the backend callback (`?code=<one-time grant>`). Exchanges
 * the grant for the standard session, then enters the app. Errors are
 * allowlisted codes (`social_error`) plus transport/API failures.
 */
export function SocialCallbackPage() {
  const [params] = useSearchParams();
  const code = params.get("code");
  const socialError = params.get("social_error");
  const { loginWithSocialCode } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [failure, setFailure] = useState<unknown>(null);
  const [working, setWorking] = useState(Boolean(code));

  useEffect(() => {
    // StrictMode mounts effects twice in dev: the grant is single-use.
    if (started.current) return;
    started.current = true;
    if (!code) {
      setWorking(false);
      return;
    }
    void loginWithSocialCode(code)
      .then(() => navigate(ROUTES.app, { replace: true }))
      .catch((err: unknown) => {
        setFailure(err);
        setWorking(false);
      });
  }, [code, loginWithSocialCode, navigate]);

  const mapped = socialErrorMessage(socialError);
  const missing = !code && !socialError ? "This sign-in link is missing its one-time code." : null;

  return (
    <AuthShell
      title={working ? "Signing you in" : "Sign-in incomplete"}
      description={
        working ? "Verifying the response from your identity provider." : "We could not finish the social sign-in."
      }
      footer={
        <>
          Need another method?{" "}
          <Link
            to={ROUTES.login}
            className="font-medium text-foreground underline decoration-primary/70 underline-offset-4"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      {working ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Exchanging the one-time code…
        </div>
      ) : (
        <div className="space-y-4">
          {(mapped || missing) && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <p className="font-semibold text-destructive">Could not complete sign-in</p>
              <p className="mt-1 break-words text-muted-foreground">{mapped ?? missing}</p>
            </div>
          )}
          <ErrorBox error={failure} />
          <Button asChild className="w-full">
            <Link to={ROUTES.login}>Back to sign in</Link>
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
