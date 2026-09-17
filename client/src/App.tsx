import { Route, Routes } from "react-router-dom";

import { AppToaster } from "@/components/ui/toaster";
import { Protected } from "@/layouts/protected-layout";
import { AccountPage } from "@/pages/account/Account";
import { AdminAuditPage } from "@/pages/admin/Audit";
import { AdminOrgsPage } from "@/pages/admin/Orgs";
import { AdminOverviewPage } from "@/pages/admin/Overview";
import { AdminUsersPage } from "@/pages/admin/Users";
import { LandingPage } from "@/pages/landing/Landing";
import { LoginPage } from "@/pages/auth/Login";
import { RegisterPage } from "@/pages/auth/Register";
import { AuditPage } from "@/pages/audit/Audit";
import { DashboardPage } from "@/pages/overview/Dashboard";
import { GrantsPage } from "@/pages/grants/Grants";
import { GalleryPage } from "@/pages/admin/Gallery";
import { HealthPage } from "@/pages/health/Health";
import { MembersPage } from "@/pages/orgs/[orgId]/Members";
import { NotFoundPage } from "@/pages/not-found/NotFound";
import { OrgsPage } from "@/pages/orgs/Orgs";
import { NewProjectPage, ProjectsPage } from "@/pages/projects/Projects";
import { SettingsPage } from "@/pages/settings/Settings";

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
        <Route path="settings" element={<SettingsPage />} />
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
