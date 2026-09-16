import * as React from "react";
import { Link, NavLink, useMatch, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Activity,
  Building2,
  Check,
  ChevronsUpDown,
  FileText,
  FolderOpen,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  ShieldCheck,
  Users,
} from "@/lib/icons";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";

export {
  SidebarInset,
  SidebarTrigger,
};

/* Our content on the upstream animate-ui sidebar shell (radix behaviour,
 * data-slot API, cookie sidebar_state). Brand/data wiring is ours:
 * org switcher, subgroups, recents, user menu, role filtering. */

const SIDEBAR_COOKIE = "sidebar_state";

function readOpenCookie(): boolean | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${SIDEBAR_COOKIE}=(true|false)`));
  if (!match) return null;
  return match[1] === "true";
}

function defaultOpen(): boolean {
  const saved = readOpenCookie();
  if (saved !== null) return saved;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(min-width: 1280px)").matches;
  }
  return true;
}

/** Provider with cookie-persisted open state (upstream writes the cookie). */
export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState<boolean>(() => defaultOpen());
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {children}
    </SidebarProvider>
  );
}

interface NavEntry {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

function SideNavLink({ to, label, icon, end }: NavEntry) {
  const match = useMatch({ path: to, end: end ?? false });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={match !== null} tooltip={label}>
        <NavLink to={to} end={end} aria-label={label}>
          {icon}
          <span>{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

const CONSOLE_NAV: NavEntry[] = [
  { to: ROUTES.app, label: "Overview", icon: <LayoutDashboard aria-hidden="true" />, end: true },
  { to: ROUTES.health, label: "Health", icon: <Activity aria-hidden="true" /> },
  { to: ROUTES.orgs, label: "Organizations", icon: <Building2 aria-hidden="true" /> },
  { to: ROUTES.projects, label: "Projects", icon: <FolderOpen aria-hidden="true" /> },
  { to: ROUTES.grants, label: "Grants", icon: <KeyRound aria-hidden="true" /> },
  { to: ROUTES.audit, label: "Audit", icon: <FileText aria-hidden="true" /> },
  { to: ROUTES.account, label: "Account", icon: <Settings aria-hidden="true" /> },
];

const ADMIN_NAV: NavEntry[] = [
  { to: ROUTES.admin, label: "Admin", icon: <ShieldCheck aria-hidden="true" />, end: true },
  { to: ROUTES.adminUsers, label: "Users", icon: <Users aria-hidden="true" /> },
  { to: ROUTES.adminOrgs, label: "Organizations", icon: <Building2 aria-hidden="true" /> },
  { to: ROUTES.adminAudit, label: "Global audit", icon: <FileText aria-hidden="true" /> },
  { to: ROUTES.gallery, label: "Gallery", icon: <Layers aria-hidden="true" /> },
];

/** Radix dropdowns are modal by default (background aria-hidden + focus trap),
 * which trips axe aria-hidden-focus while open and fights the mobile Sheet.
 * Nav menus are better non-modal (Esc/outside-click still dismiss): always false.
 * (Replaces the earlier mobile-only useMenuModal — desktop modal added nothing.) */

/** Org switcher: dropdown in the sidebar header (⌘1-9 shortcuts). */
function OrgSwitcher() {
  const { orgs, activeOrgId, switchOrg } = useAuth();
  const { isMobile } = useSidebar();
  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? orgs[0] ?? null;

  React.useEffect(() => {
    if (orgs.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
      const n = Number.parseInt(e.key, 10);
      if (Number.isInteger(n) && n >= 1 && n <= Math.min(9, orgs.length)) {
        const target = orgs[n - 1];
        if (target && target.id !== activeOrgId) {
          e.preventDefault();
          void switchOrg(target.id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [orgs, activeOrgId, switchOrg]);

  if (!activeOrg) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled aria-label="No organization">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground" aria-hidden="true">
              F
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Single org: static brand, no switcher (multitenancy mínimo).
  if (orgs.length < 2) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" aria-label={activeOrg.name}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground" aria-hidden="true">
              F
            </span>
            <span className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold">{activeOrg.name}</span>
              <span className="truncate text-xs text-muted-foreground">{activeOrg.slug}</span>
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label={`Switch organization, current ${activeOrg.name}`}
              className="group data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground" aria-hidden="true">
                F
              </span>
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-bold tracking-tight">{activeOrg.name}</span>
<span className="truncate text-xs text-muted-foreground group-hover:text-sidebar-accent-foreground group-data-[state=open]:text-sidebar-accent-foreground">{activeOrg.slug}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" aria-hidden="true" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={24}
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          >
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuGroup>
          {orgs.map((o, i) => (
            <DropdownMenuItem key={o.id} onSelect={() => void switchOrg(o.id)}>
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate">{o.name}</span>
                <span className="truncate text-xs text-muted-foreground">{o.slug}</span>
              </span>
              {o.id === activeOrgId ? (
                <Check className="size-4 shrink-0" aria-hidden="true" />
              ) : (
                i < 9 && <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => undefined}>
          <Link to={ROUTES.orgs} className="flex w-full items-center gap-2">
            <Plus className="size-4" aria-hidden="true" /> All organizations
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** Flat nav: Console items + staff Administration after a separator.
 * Subgroup collapsibles were tried and removed: group labels ("Console")
 * added chrome without value for 7+5 items; icons-always + separator scans
 * better. (Collapsible primitive stays in the catalog for real disclosures.) */

/** Workspaces: orgs as switchable tenant contexts (row click switches,
 * active gets a Check, "..." holds View/Members actions). */
function RecentOrgs() {
  const { orgs, activeOrgId, switchOrg } = useAuth();
  const recents = orgs.slice(0, 3);
  if (recents.length === 0) return null;
  return (
    <SidebarGroup aria-label="Workspaces">
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarMenu>
        {recents.map((o) => {
          const active = o.id === activeOrgId;
          return (
            <SidebarMenuItem key={o.id}>
              <SidebarMenuButton
                tooltip={o.name}
                isActive={active}
                onClick={() => {
                  if (!active) void switchOrg(o.id);
                }}
                aria-label={`Switch to workspace ${o.name}${active ? " (current)" : ""}`}
              >
                <Building2 aria-hidden="true" />
                <span>{o.name}</span>
                {active && <Check className="ml-auto size-4 shrink-0" aria-hidden="true" />}
              </SidebarMenuButton>
              <span
                className={cn(
                  "absolute top-1.5 right-1 z-[1] opacity-0 transition-opacity",
                  "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100",
                  "pointer-events-none group-focus-within/menu-item:pointer-events-auto group-hover/menu-item:pointer-events-auto",
                  "group-data-[collapsible=icon]:hidden",
                )}
              >
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    aria-label={`Actions for ${o.name}`}
                    className={cn(
                      "flex aspect-square w-5 items-center justify-center rounded-md p-0",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                    )}
                  >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => undefined}>
                      <Link to={ROUTES.orgs} className="w-full">View organization</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => undefined}>
                      <Link to={ROUTES.members(o.id)} className="w-full">View members</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/** User dropdown in the footer (Account / Logout / Logout everywhere). */
function UserMenu() {
  const { user, logout, logoutEverywhere } = useAuth();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  if (!user) return null;

  const onLogout = async () => {
    await logout();
    navigate(ROUTES.login);
  };
  const onLogoutEverywhere = async () => {
    await logoutEverywhere();
    navigate(ROUTES.login);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label={`Account menu for ${user.email}`}
              className="group data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar name={user.email} />
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">{user.email}</span>
                <span className="truncate text-xs text-muted-foreground group-hover:text-sidebar-accent-foreground group-data-[state=open]:text-sidebar-accent-foreground">
                  {user.is_superuser ? "root" : user.is_staff ? "staff" : "member"}
                </span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" aria-hidden="true" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={isMobile ? "bottom" : "right"}
        sideOffset={24}
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
      >
        <DropdownMenuLabel>
          <span className="grid leading-tight">
            <span className="truncate text-sm">{user.email}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">Signed in</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => undefined}>
            <Link to={ROUTES.account} className="flex w-full items-center gap-2">
              <Settings className="size-4" aria-hidden="true" /> Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onSelect={() => void onLogout()}>
            <span className="flex w-full items-center gap-2">
              <LogOut className="size-4" aria-hidden="true" /> Logout
            </span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => void onLogoutEverywhere()}>
            <span className="flex w-full items-center gap-2">
              <LogOut className="size-4" aria-hidden="true" /> Logout everywhere
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** The application sidebar: upstream shell + our content. */
export function AppSidebar() {
  const { user } = useAuth();
  const isStaff = user?.is_staff === true || user?.is_superuser === true;
  return (
    <Sidebar collapsible="icon" role="complementary" aria-label="Primary">
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup aria-label="Console">
          <SidebarMenu>
            {CONSOLE_NAV.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {isStaff && (
          <SidebarGroup aria-label="Administration">
            <SidebarSeparator />
            <SidebarMenu>
              {ADMIN_NAV.map((item) => (
                <SideNavLink key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
        <RecentOrgs />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
        {user && (
          <p className="flex items-center gap-1.5 truncate px-2 pb-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {user.is_superuser && <Badge variant="secondary">root</Badge>}
            {user.is_staff && !user.is_superuser && <Badge variant="secondary">staff</Badge>}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
