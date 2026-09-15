import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout";
import { AccountPage } from "@/pages/Account";
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
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Protected />}>
        <Route index element={<DashboardPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="orgs" element={<OrgsPage />} />
        <Route path="orgs/:orgId/members" element={<MembersPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="grants" element={<GrantsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
