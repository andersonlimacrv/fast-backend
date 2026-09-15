import { useCallback, useEffect, useState } from "react";

import { ErrorBox, PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE, getHealthz, getReadyz } from "@/lib/api";

export function HealthPage() {
  const [health, setHealth] = useState<{ status: string } | null>(null);
  const [ready, setReady] = useState<{ status: string; db: string; redis: string } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, r] = await Promise.all([getHealthz(), getReadyz()]);
      setHealth(h);
      setReady(r);
    } catch (err) {
      setError(err);
      setHealth(null);
      setReady(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return (
    <div>
      <PageHeader title="Backend health" description={`Probing ${API_BASE} — no auth required.`} />
      <div className="mb-4">
        <Button onClick={() => void check()} disabled={loading}>
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
