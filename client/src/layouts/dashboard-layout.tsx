import * as React from "react";
import { useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarMobileTrigger,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE, ROUTES } from "@/lib/constants";

/* Dashboard shell (DESIGN.md §6): sidebar + topbar + content.
 * <lg → sidebar is a drawer; lg–xl → rail by default; ≥xl → expanded.
 * The user's rail/full choice persists in a cookie (never auth data). */

const SIDEBAR_COOKIE = "fb.sidebar_state";

function readSidebarCookie(): boolean | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${SIDEBAR_COOKIE}=(collapsed|full)`));
  if (!match) return null;
  return match[1] === "collapsed";
}

function writeSidebarCookie(collapsed: boolean): void {
  document.cookie = `${SIDEBAR_COOKIE}=${collapsed ? "collapsed" : "full"}; path=/; max-age=31536000; samesite=lax`;
}

function defaultCollapsed(): boolean {
  const saved = readSidebarCookie();
  if (saved !== null) return saved;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return !window.matchMedia("(min-width: 1280px)").matches;
  }
  return false;
}

function Topbar() {
  const { user, orgs, activeOrgId, switchOrg, logout, logoutEverywhere } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = React.useState(false);
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
    navigate(ROUTES.login);
  };

  const onLogoutEverywhere = async () => {
    await logoutEverywhere();
    navigate(ROUTES.login);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-4">
      <SidebarMobileTrigger />
      <SidebarTrigger />
      {orgs.length > 0 && (
        <select
          className="h-9 max-w-40 truncate rounded-md border border-input bg-background px-2 text-sm sm:max-w-none"
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
      {activeOrg && (
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {activeOrg.slug}
        </Badge>
      )}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {user && (
          <span className="hidden items-center gap-2 md:inline-flex">
            <Avatar name={user.email} />
            <span className="max-w-44 truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
        )}
        <ThemeToggle />
        {user && (
          <>
            <Button variant="outline" size="sm" onClick={() => void onLogout()}>
              Logout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => void onLogoutEverywhere()}
            >
              Logout everywhere
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState<boolean>(() => defaultCollapsed());

  const onCollapsedChange = React.useCallback((v: boolean) => {
    setCollapsed(v);
    writeSidebarCookie(v);
  }, []);

  return (
    <SidebarProvider collapsed={collapsed} onCollapsedChange={onCollapsedChange}>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4">{children}</main>
          <footer className="mx-auto w-full max-w-6xl px-3 pb-8 text-xs text-muted-foreground sm:px-4">
            API: <code>{API_BASE}</code> — dev visualization only, tokens live in localStorage.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
