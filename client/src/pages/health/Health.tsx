import { ErrorBox, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GooeyMenu, type GooeyMenuData } from "@/components/custom-ui/components/gooey-menu";
import { useHealth } from "@/hooks/useHealth";
import { API_BASE } from "@/lib/constants";

export function HealthPage() {
  const { data, error, loading, refresh } = useHealth();
  const health = data?.health ?? null;
  const ready = data?.ready ?? null;

  const inspector: GooeyMenuData[] = [
    {
      key: "client",
      label: "Client",
      value: "design-unification",
      labelClass: "text-sm font-medium text-muted-foreground",
      valueClass: "text-sm text-muted-foreground",
    },
    {
      key: "api",
      label: "API",
      value: API_BASE,
      labelClass: "text-sm font-medium",
      valueClass: "font-mono text-sm text-muted-foreground",
    },
    {
      key: "ready",
      label: "Ready",
      value: ready?.status ?? "—",
      labelClass: "text-sm font-medium",
      valueClass: "font-mono text-sm text-muted-foreground",
    },
    {
      key: "errors",
      label: "Errors",
      value: error ? "1" : "0",
      labelClass: "text-sm font-medium",
      valueClass:
        "flex items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 px-2 py-0.5 font-mono text-sm text-destructive",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Backend health"
        description={`Probing ${API_BASE} - no auth required.`}
        actions={
          <Button onClick={() => void refresh()} disabled={loading}>
            {loading ? "Checking…" : "Re-check"}
          </Button>
        }
      />
      <ErrorBox error={error} className="mb-4" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>GET /healthz</CardTitle>
          </CardHeader>
          <CardContent>
            {health ? (
              <Badge variant={health.status === "ok" ? "default" : "destructive"}>{health.status}</Badge>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>GET /readyz</CardTitle>
          </CardHeader>
          <CardContent>
            {ready ? (
              <div className="flex flex-wrap gap-2">
                <Badge variant={ready.status === "ready" ? "default" : "destructive"}>{ready.status}</Badge>
                <Badge variant={ready.db === "ok" ? "secondary" : "destructive"}>db: {ready.db}</Badge>
                <Badge variant={ready.redis === "ok" ? "secondary" : "destructive"}>redis: {ready.redis}</Badge>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Runtime inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-muted-foreground">
            Debug overlay only — hover or focus the button to expand.
          </p>
          <GooeyMenu data={inspector} />
        </CardContent>
      </Card>
    </div>
  );
}
