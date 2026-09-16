import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { AppToaster } from "@/components/ui/toaster";
import { PageHeader } from "@/components/feedback";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { AccountPage } from "@/pages/Account";
import { AdminAuditPage } from "@/pages/AdminAudit";
import { AdminOrgsPage } from "@/pages/AdminOrgs";
import { AdminOverviewPage } from "@/pages/AdminOverview";
import { AdminUsersPage } from "@/pages/AdminUsers";
import { LandingPage } from "@/pages/Landing";
import { LoginPage, RegisterPage } from "@/pages/Auth";
import { AuditPage } from "@/pages/Audit";
import { DashboardPage } from "@/pages/Dashboard";
import { GrantsPage } from "@/pages/Grants";
import { GalleryPage } from "@/pages/Gallery";
import { HealthPage } from "@/pages/Health";
import { MembersPage } from "@/pages/Members";
import { NotFoundPage } from "@/pages/NotFound";
import { OrgsPage } from "@/pages/Orgs";
import { NewProjectPage, ProjectsPage } from "@/pages/Projects";

function Protected() {
  const { user, ready } = useAuth();
  if (!ready) return <p className="p-8 text-sm text-muted-foreground">Loading session…</p>;
  if (!user) return <Navigate to="/" replace />;
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

/* Settings placeholder (future page): the footer avatar menu already covers
 * Account; the gear nav entry reserves this route until real settings land. */
function SettingsPlaceholder() {
  return (
    <div>
      <PageHeader title="Settings" description="Workspace settings will live here." />
      <p className="text-sm text-muted-foreground">Nothing to configure yet — check back soon.</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Protected />}>
        <Route path="~" element={<DashboardPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="orgs" element={<OrgsPage />} />
        <Route path="orgs/:orgId/members" element={<MembersPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<NewProjectPage />} />
        <Route path="grants" element={<GrantsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="admin" element={<AdminOverviewPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/orgs" element={<AdminOrgsPage />} />
        <Route path="admin/audit" element={<AdminAuditPage />} />
        <Route path="admin/gallery" element={<GalleryPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <AppToaster />
    </>
  );
}
