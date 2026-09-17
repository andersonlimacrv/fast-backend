import * as React from "react";

import { AppSidebar, AppSidebarProvider, SidebarInset, SidebarTrigger } from "@/components/app-sidebar";
import { PageTrail } from "@/components/page-trail";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { API_BASE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* Dashboard shell: upstream animate-ui sidebar (drawer mobile, rail/icon
 * collapse desktop, ⌘B toggle, cookie sidebar_state) + full-bleed topbar +
 * content. Org switching + user menu live in the sidebar; the topbar keeps
 * the sidebar trigger, the route breadcrumb and the theme toggle only
 * (the org slug badge was redundant with the sidebar header switcher). */

/* Full-bleed sticky topbar (never inside the content max-width). */
function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <PageTrail className="min-w-0 flex-1" />
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}

/* Single source of the dashboard content width: full inset width with
 * standard responsive gutters, capped at 1600px on ultra-wide screens
 * (unbounded content hurts readability there). Pages must not set their own
 * page-level width; form-only narrow containers inside pages (e.g. Account)
 * are the intentional exception. */
function ContentWidth({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1600px] px-3 sm:px-4", className)}>{children}</div>;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <ContentWidth className="flex-1 py-4">{children}</ContentWidth>
        <div className="mx-auto w-full max-w-6xl px-3 pb-8 text-xs text-muted-foreground sm:px-4">
          API: <code>{API_BASE}</code> — dev visualization only, tokens live in localStorage.
        </div>
      </SidebarInset>
    </AppSidebarProvider>
  );
}
