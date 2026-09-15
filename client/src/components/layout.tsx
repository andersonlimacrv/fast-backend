import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}

const NAV = [
  { to: "/health", label: "Health" },
  { to: "/orgs", label: "Orgs" },
  { to: "/projects", label: "Projects" },
  { to: "/grants", label: "Grants" },
  { to: "/audit", label: "Audit" },
  { to: "/account", label: "Account" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, orgs, activeOrgId, switchOrg, logout, logoutEverywhere } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? null;

  const onSwitch = async (orgId: string) => {
    setSwitching(true);
    try {
      await switchOrg(orgId);
    } finally {
      setSwitching(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const onLogoutEverywhere = async () => {
    await logoutEverywhere();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-4 text-sm font-bold tracking-tight">
            fast-backend<span className="text-muted-foreground"> /client</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {orgs.length > 0 && (
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={activeOrgId ?? ""}
                disabled={switching}
                onChange={(e) => void onSwitch(e.target.value)}
                aria-label="Active organization"
              >
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
            {activeOrg && <Badge variant="secondary">{activeOrg.slug}</Badge>}
            {user && <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>}
            <ThemeToggle />
            {user && (
              <>
                <Button variant="outline" size="sm" onClick={() => void onLogout()}>
                  Logout
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void onLogoutEverywhere()}>
                  Logout everywhere
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground">
        API: <code>{API_BASE}</code> · dev visualization only — tokens live in localStorage.
      </footer>
    </div>
  );
}
