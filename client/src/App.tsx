import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout";
import { AppToaster } from "@/components/ui/toaster";
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
import { HealthPage } from "@/pages/Health";
import { MembersPage } from "@/pages/Members";
import { OrgsPage } from "@/pages/Orgs";
import { ProjectsPage } from "@/pages/Projects";

function Protected() {
  const { user, ready } = useAuth();
  if (!ready) return <p className="p-8 text-sm text-muted-foreground">Loading session…</p>;
  if (!user) return <Navigate to="/" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
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
        <Route path="grants" element={<GrantsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="admin" element={<AdminOverviewPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/orgs" element={<AdminOrgsPage />} />
        <Route path="admin/audit" element={<AdminAuditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AppToaster />
    </>
  );
}
