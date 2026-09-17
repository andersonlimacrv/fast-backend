import { Link } from "react-router-dom";

import { ErrorBox, PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/custom-ui/components/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiGrid } from "@/components/kpi-grid";
import { useAdminOverview } from "@/hooks/useAdmin";
import { ROUTES } from "@/lib/constants";

export function AdminOverviewPage() {
  const { data: overview, error, loading, reload } = useAdminOverview();

  return (
    <RequireStaff title="Admin">
      <PageHeader
        title="Admin overview"
        description="GET /admin/overview (staff+). Cross-project control plane."
        actions={
          <Button variant="outline" onClick={() => void reload()} disabled={loading}>
            {loading ? "Loading…" : "Reload"}
          </Button>
        }
      />
      <ErrorBox error={error} className="mb-4" />
      {loading && !overview && (
        <KpiGrid loading label="Loading overview">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16" />
              </CardContent>
            </Card>
          ))}
        </KpiGrid>
      )}
      {!loading && overview && (
        <KpiGrid>
          <KpiCard
            label="Users"
            value={String(overview.users)}
            footer={
              <Link to={ROUTES.adminUsers} className="text-foreground underline decoration-primary/70 underline-offset-4">
                Manage users
              </Link>
            }
          />
          <KpiCard
            label="Organizations"
            value={String(overview.organizations)}
            footer={
              <Link to={ROUTES.adminOrgs} className="text-foreground underline decoration-primary/70 underline-offset-4">
                Manage orgs
              </Link>
            }
          />
          <KpiCard
            label="Projects"
            value={String(overview.projects)}
            footer={
              <Link to={ROUTES.adminAudit} className="text-foreground underline decoration-primary/70 underline-offset-4">
                Global audit (root)
              </Link>
            }
          />
        </KpiGrid>
      )}
    </RequireStaff>
  );
}
