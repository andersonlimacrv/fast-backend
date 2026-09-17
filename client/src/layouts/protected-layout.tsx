import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/layouts/dashboard-layout";

/* Protected route group gate: waits for the session, bounces anonymous
 * users to the landing page, otherwise renders the dashboard shell. */
export function Protected() {
  const { user, ready } = useAuth();
  if (!ready) return <p className="p-8 text-sm text-muted-foreground">Loading session…</p>;
  if (!user) return <Navigate to="/" replace />;
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
