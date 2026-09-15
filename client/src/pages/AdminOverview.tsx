import { Link } from "react-router-dom";

import { ErrorBox, PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      {!loading && overview && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{overview.users}</p>
              <Link to={ROUTES.adminUsers} className="text-sm text-primary underline">
                Manage users
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{overview.organizations}</p>
              <Link to={ROUTES.adminOrgs} className="text-sm text-primary underline">
                Manage orgs
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{overview.projects}</p>
              <Link to={ROUTES.adminAudit} className="text-sm text-primary underline">
                Global audit (root)
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </RequireStaff>
  );
}
