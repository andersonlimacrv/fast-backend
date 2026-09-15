import type { ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, PageHeader } from "@/components/feedback";
import { isRoot, isStaff } from "@/services/admin";

/**
 * UX-only gate for `/admin*` routes. Hides nothing from the network: the
 * backend stays the authority and answers 403 (rendered by `ErrorBox` via
 * the page hooks). `requireRoot` narrows to root-only surfaces.
 */
export function RequireStaff({
  requireRoot = false,
  title,
  children,
}: {
  requireRoot?: boolean;
  title: string;
  children: ReactNode;
}) {
  const { user, ready } = useAuth();

  if (!ready) return <p className="p-8 text-sm text-muted-foreground">Loading session…</p>;
  const allowed = requireRoot ? isRoot(user) : isStaff(user);
  if (!allowed) {
    return (
      <div>
        <PageHeader title={title} description="Staff-only area." />
        <ErrorBox
          error={new Error(`Forbidden (403) — this surface requires ${requireRoot ? "root" : "staff"}.`)}
        />
      </div>
    );
  }
  return <>{children}</>;
}
