import { ErrorBox, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealth } from "@/hooks/useHealth";
import { API_BASE } from "@/lib/constants";

export function HealthPage() {
  const { data, error, loading, refresh } = useHealth();
  const health = data?.health ?? null;
  const ready = data?.ready ?? null;

  return (
    <div>
      <PageHeader title="Backend health" description={`Probing ${API_BASE} - no auth required.`} />
      <div className="mb-4">
        <Button onClick={() => void refresh()} disabled={loading}>
          {loading ? "Checking…" : "Re-check"}
        </Button>
      </div>
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
    </div>
  );
}
