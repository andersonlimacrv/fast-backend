import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import * as React from "react";
import { NavLink } from "react-router-dom";

import {
  Activity,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FolderOpen,
  KeyRound,
  Layers,
  LayoutDashboard,
  PanelLeft,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "@/lib/icons";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* Composable sidebar (shadcn Sidebar API shape, reimplemented on plain
 * React + motion instead of radix/animate-ui — see design-unification
 * design.md decision 1). Collapsed mode IS the icon rail
 * (DESIGN.md §6: drawer <lg, rail lg–xl, expanded ≥xl). */

/* Upstream animate-ui motion patterns only (Sidebar track is radix-based,
 * not vendored): drawer x-slide spring. Desktop width stays a CSS
 * transition — a motion width spring is incompatible with the w-16/w-64
 * class switch without restructuring the layout. */
const DRAWER_TRANSITION: Transition = { type: "spring", stiffness: 150, damping: 22 };
const OVERLAY_TRANSITION: Transition = { duration: 0.15 };

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}

export function SidebarProvider({
  collapsed,
  onCollapsedChange,
  children,
}: {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const value = React.useMemo(
    () => ({ collapsed, setCollapsed: onCollapsedChange, mobileOpen, setMobileOpen }),
    [collapsed, onCollapsedChange, mobileOpen],
  );
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-14 items-center gap-2 px-3", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <div
      className={cn("px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase", className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />;
}

export interface SidebarMenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

export function SidebarMenuItem({ to, icon, label, end }: SidebarMenuItemProps) {
  const { collapsed, setMobileOpen } = useSidebar();
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        title={collapsed ? label : undefined}
        aria-label={label}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground",
            "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
            isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
            collapsed && "justify-center px-0",
          )
        }
      >
        <span className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-4" aria-hidden="true">
          {icon}
        </span>
        {!collapsed && <span className="truncate">{label}</span>}
      </NavLink>
    </li>
  );
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-sidebar-border p-3", className)} {...props} />;
}

/** Collapse/expand trigger for desktop (rail ↔ full). */
export function SidebarTrigger({ className }: { className?: string }) {
  const { collapsed, setCollapsed } = useSidebar();
  const Icon = collapsed ? ChevronsRight : ChevronsLeft;
  return (
    <button
      type="button"
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      className={cn(
        "hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:block",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

/** Hamburger trigger for mobile (opens the drawer). */
export function SidebarMobileTrigger({ className }: { className?: string }) {
  const { setMobileOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      aria-label="Open navigation"
      className={cn(
        "rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:hidden",
        className,
      )}
    >
      <PanelLeft className="size-4" aria-hidden="true" />
    </button>
  );
}

/** Mobile close button rendered inside the drawer. */
function SidebarDrawerClose() {
  const { setMobileOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setMobileOpen(false)}
      aria-label="Close navigation"
      className={cn(
        "rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:hidden",
      )}
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  );
}

const CONSOLE_NAV: SidebarMenuItemProps[] = [
  { to: ROUTES.app, label: "Overview", icon: <LayoutDashboard aria-hidden="true" />, end: true },
  { to: ROUTES.health, label: "Health", icon: <Activity aria-hidden="true" /> },
  { to: ROUTES.orgs, label: "Organizations", icon: <Building2 aria-hidden="true" /> },
  { to: ROUTES.projects, label: "Projects", icon: <FolderOpen aria-hidden="true" /> },
  { to: ROUTES.grants, label: "Grants", icon: <KeyRound aria-hidden="true" /> },
  { to: ROUTES.audit, label: "Audit", icon: <FileText aria-hidden="true" /> },
  { to: ROUTES.account, label: "Account", icon: <Settings aria-hidden="true" /> },
];

const ADMIN_NAV: SidebarMenuItemProps[] = [
  { to: ROUTES.admin, label: "Admin", icon: <ShieldCheck aria-hidden="true" />, end: true },
  { to: ROUTES.adminUsers, label: "Users", icon: <Users aria-hidden="true" /> },
  { to: ROUTES.adminOrgs, label: "Organizations", icon: <Building2 aria-hidden="true" /> },
  { to: ROUTES.adminAudit, label: "Global audit", icon: <FileText aria-hidden="true" /> },
  { to: ROUTES.gallery, label: "Gallery", icon: <Layers aria-hidden="true" /> },
];

function SidebarBody() {
  const { user } = useAuth();
  const isStaff = user?.is_staff === true || user?.is_superuser === true;
  const { collapsed } = useSidebar();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <SidebarHeader>
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground"
          aria-hidden="true"
        >
          F
        </span>
        {!collapsed && (
          <span className="truncate text-sm font-bold tracking-tight">
            fast-backend<span className="text-muted-foreground"> /client</span>
          </span>
        )}
        {!collapsed && (
          <span className="ml-auto">
            <SidebarDrawerClose />
          </span>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup aria-label="Console">
          <SidebarGroupLabel>Console</SidebarGroupLabel>
          <SidebarMenu>
            {CONSOLE_NAV.map((item) => (
              <SidebarMenuItem key={item.to} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {isStaff && (
          <SidebarGroup aria-label="Administration">
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {ADMIN_NAV.map((item) => (
                <SidebarMenuItem key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        {user && !collapsed ? (
          <p className="truncate text-xs text-muted-foreground" title={user.email}>
            {user.email}
          </p>
        ) : (
          <span className="sr-only">Navigation footer</span>
        )}
      </SidebarFooter>
    </div>
  );
}

export function Sidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const reduceMotion = useReducedMotion();
  return (
    <>
      {/* Desktop: static rail/full sidebar */}
      <aside
        aria-label="Primary"
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border md:block",
          "transition-[width] duration-200 ease-out",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarBody />
      </aside>
      {/* Mobile: drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : OVERLAY_TRANSITION}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Primary"
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? { x: 0 } : { x: "-100%" }}
              transition={reduceMotion ? { duration: 0 } : DRAWER_TRANSITION}
              className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border"
            >
              <SidebarBody />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
