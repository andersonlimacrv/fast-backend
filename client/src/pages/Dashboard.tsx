import { Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardPage() {
  const { user, orgs, activeOrgId } = useAuth();
  const active = orgs.find((o) => o.id === activeOrgId) ?? null;

  return (
    <div>
      <PageHeader title="Overview" description="What the backend sees for your session." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">User:</span> {user?.email}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Active:</span>
              <Badge variant={user?.is_active ? "default" : "destructive"}>
                {user?.is_active ? "active" : "inactive"}
              </Badge>
              {user?.is_superuser && <Badge variant="secondary">superuser</Badge>}
            </p>
            <p className="break-all">
              <span className="text-muted-foreground">User id:</span> <code>{user?.id}</code>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tenant context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {active ? (
              <>
                <p>
                  <span className="text-muted-foreground">Org:</span> {active.name}{" "}
                  <Badge variant="secondary">{active.slug}</Badge>
                </p>
                <p className="break-all">
                  <span className="text-muted-foreground">active_org_id:</span> <code>{active.id}</code>
                </p>
                <p>
                  Memberships: <Link to="/orgs" className="text-foreground underline decoration-primary/70 underline-offset-4">{orgs.length}</Link>
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No organization yet — <Link to="/orgs" className="text-foreground underline decoration-primary/70 underline-offset-4">create one</Link>.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
