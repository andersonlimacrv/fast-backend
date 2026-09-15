import { Link, Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReleaseInfo } from "@/hooks/useMeta";
import { ROUTES } from "@/lib/constants";
import { normalizeMeta } from "@/services/meta";

export function LandingPage() {
  const { user, ready } = useAuth();
  const { data: info, error, loading } = useReleaseInfo();

  if (ready && user) return <Navigate to={ROUTES.app} replace />;

  const cards = normalizeMeta(info?.meta ?? { app: "fast-backend", version: "unknown", modules: [] });
  const version = info?.meta.version ?? "unknown";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-4 text-sm font-bold tracking-tight">
            fast-backend<span className="text-muted-foreground"> docs & console</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={info?.backendUp ? "default" : "destructive"}>
              {loading ? "checking backend…" : info?.backendUp ? "backend up" : "backend offline"}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.register}>Create account</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={ROUTES.login}>Login</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section aria-labelledby="hero" className="mb-10">
          <h1 id="hero" className="text-3xl font-bold tracking-tight">
            fast-backend <Badge variant="secondary">release {version}</Badge>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Modular monolith SaaS kernel (async FastAPI): auth with rotation, organizations, tenancy, entitlements
            and an admin control plane — visualized here over HTTP, no business logic in this SPA.
          </p>
        </section>
        <section aria-labelledby="modules" className="mb-10">
          <h2 id="modules" className="mb-4 text-xl font-bold tracking-tight">
            Modules
          </h2>
          <ErrorBox error={error} className="mb-4" />
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading release info…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => (
                <Card key={c.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      {c.title}
                      <Badge variant={c.enabled ? "default" : "secondary"}>
                        {c.enabled === null ? "unknown" : c.enabled ? "enabled" : "disabled"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{c.blurb}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
        <section aria-labelledby="release" className="mb-10">
          <h2 id="release" className="mb-4 text-xl font-bold tracking-tight">
            Release
          </h2>
          <Card>
            <CardContent className="space-y-2 pt-6 text-sm">
              <p>
                <span className="text-muted-foreground">Version:</span> <code>{version}</code>
              </p>
              <p>
                <span className="text-muted-foreground">Source:</span>{" "}
                {info?.backendUp ? (
                  <>
                    live <code>GET /meta</code>
                  </>
                ) : (
                  "static fallback — start the backend to see live flags"
                )}
              </p>
              <p className="text-muted-foreground">
                Disabled modules are flag-gated in the backend (e.g. billing); the UI never shows secrets, hosts or
                personal data here.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground">
        fast-backend visualization SPA — no trackers, no third-party requests.
      </footer>
    </div>
  );
}
