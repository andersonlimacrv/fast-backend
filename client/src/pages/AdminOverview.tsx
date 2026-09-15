import { Link } from "react-router-dom";

import { ErrorBox, PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOverview } from "@/hooks/useAdmin";
import { ROUTES } from "@/lib/constants";

export function AdminOverviewPage() {
  const { data: overview, error, loading, reload } = useAdminOverview();

  return (
    <RequireStaff title="Admin">
      <PageHeader title="Admin overview" description="GET /admin/overview (staff+). Cross-project control plane." />
      <div className="mb-4">
        <Button variant="outline" onClick={() => void reload()} disabled={loading}>
          {loading ? "Loading…" : "Reload"}
        </Button>
      </div>
      <ErrorBox error={error} className="mb-4" />
      {loading && !overview && (
        <div className="grid gap-4 sm:grid-cols-3" aria-label="Loading overview">
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
        </div>
      )}
      {!loading && overview && (
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Users"
            value={String(overview.users)}
            footer={
              <Link to={ROUTES.adminUsers} className="text-primary underline">
                Manage users
              </Link>
            }
          />
          <KpiCard
            label="Organizations"
            value={String(overview.organizations)}
            footer={
              <Link to={ROUTES.adminOrgs} className="text-primary underline">
                Manage orgs
              </Link>
            }
          />
          <KpiCard
            label="Projects"
            value={String(overview.projects)}
            footer={
              <Link to={ROUTES.adminAudit} className="text-primary underline">
                Global audit (root)
              </Link>
            }
          />
        </div>
      )}
    </RequireStaff>
  );
}
