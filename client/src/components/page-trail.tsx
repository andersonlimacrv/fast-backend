import { useLocation } from "react-router-dom";

import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";

/* Route breadcrumb trail (static map + sensible fallback). */

const TRAIL: [RegExp, Crumb[]][] = [
  [/^\/~$/, [{ label: "Overview" }]],
  [/^\/health$/, [{ label: "Health" }]],
  [/^\/orgs\/[^/]+\/members$/, [{ label: "Organizations", to: "/orgs" }, { label: "Members" }]],
  [/^\/orgs$/, [{ label: "Organizations" }]],
  [/^\/projects$/, [{ label: "Projects" }]],
  [/^\/projects\/new$/, [{ label: "Projects", to: "/projects" }, { label: "New project" }]],
  [/^\/grants$/, [{ label: "Grants" }]],
  [/^\/audit$/, [{ label: "Audit" }]],
  [/^\/account$/, [{ label: "Account" }]],
  [/^\/settings$/, [{ label: "Settings" }]],
  [/^\/admin\/users$/, [{ label: "Admin", to: "/admin" }, { label: "Users" }]],
  [/^\/admin\/orgs$/, [{ label: "Admin", to: "/admin" }, { label: "Organizations" }]],
  [/^\/admin\/audit$/, [{ label: "Admin", to: "/admin" }, { label: "Global audit" }]],
  [/^\/admin\/gallery$/, [{ label: "Admin", to: "/admin" }, { label: "Gallery" }]],
  [/^\/admin$/, [{ label: "Admin" }]],
];

export function trailFor(pathname: string): Crumb[] {
  for (const [re, trail] of TRAIL) {
    if (re.test(pathname)) return trail;
  }
  const last = pathname.split("/").filter(Boolean).pop();
  return last ? [{ label: last.replace(/-/g, " ") }] : [{ label: "Overview" }];
}

export function PageTrail({ className }: { className?: string }) {
  const { pathname } = useLocation();
  return <Breadcrumb trail={trailFor(pathname)} className={className} />;
}
