import * as React from "react";
import { Link, NavLink, useLocation, useMatch, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/radix/collapsible";
import {
  Activity,
  Building2,
  Check,
  ChevronRight,
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
import { useProjects } from "@/hooks/useProjects";
import type { ProjectRead } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { projectCode } from "@/lib/utils";
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
          {/* truncate keeps the rail collapse working: without it the span
            keeps a min-content box and leaks out of the icon rail (the
            upstream span:last-child selector no longer matches with a
            trailing chevron). */}
          <span className="truncate">{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

const CONSOLE_NAV: NavEntry[] = [
  { to: ROUTES.app, label: "Overview", icon: <LayoutDashboard aria-hidden="true" />, end: true },
  { to: ROUTES.health, label: "Health", icon: <Activity aria-hidden="true" /> },
];

const MANAGE_NAV: NavEntry[] = [
  { to: ROUTES.grants, label: "Grants", icon: <KeyRound aria-hidden="true" /> },
  { to: ROUTES.audit, label: "Audit", icon: <FileText aria-hidden="true" /> },
  // Footer avatar already covers Account; the gear entry reserves Settings
  // (placeholder page, future implementation).
  { to: ROUTES.settings, label: "Settings", icon: <Settings aria-hidden="true" /> },
];

function SideNavSubLink({ to, label, end, trackActive = true }: { to: string; label: string; end?: boolean; trackActive?: boolean }) {
  const match = useMatch({ path: to, end: end ?? false });
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={trackActive && match !== null}>
        <NavLink to={to} end={end} aria-label={label}>
          <span>{label}</span>
        </NavLink>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

/** Organizations: collapsible with the two subpaths (list + active-org
 * members), following the upstream animate-ui sidebar DEMO verbatim
 * (references/components_to_use/AnimateUi/Sidebar.md). */
function OrganizationsGroup() {
  const { activeOrgId } = useAuth();
  const { pathname } = useLocation();
  const orgsActive = pathname === ROUTES.orgs || pathname.startsWith("/orgs/");
  const [open, setOpen] = React.useState(orgsActive);
  return (
    <SidebarGroup aria-label="Organizations">
      <SidebarGroupLabel>Organizations</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild open={open} onOpenChange={setOpen} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip="Organizations"
                isActive={orgsActive}
                aria-label="Organizations"
                  className="data-[state=open]:text-sidebar-accent-foreground"
              >
                <Building2 aria-hidden="true" />
                <span className="truncate">Organizations</span>
                <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" aria-hidden="true" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SideNavSubLink to={ROUTES.orgs} label="All organizations" end />
                {activeOrgId && (
                  <SideNavSubLink to={ROUTES.members(activeOrgId)} label="Members" />
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}

/** Rail-mode Projects: the icon opens the same actions menu as the expanded
 * "+" button (New project, All projects, divider, project list). */
function ProjectsRailMenuItem({
  projects,
  loading,
  projectsActive,
}: {
  projects: ProjectRead[];
  loading: boolean;
  projectsActive: boolean;
}) {
  const label = projects.length > 0 ? `Projects (${projects.length})` : "Projects";
  return (
    <SidebarMenuItem>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={label}
            isActive={projectsActive}
            aria-label={`Projects, ${projects.length} total`}
          >
            <FolderOpen aria-hidden="true" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-56 rounded-lg">
          <DropdownMenuItem onSelect={() => undefined}>
            <Link to={ROUTES.projectNew} className="flex w-full items-center gap-2">
              <Plus className="size-4" aria-hidden="true" /> New project
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => undefined}>
            <Link to={ROUTES.projects} className="flex w-full items-center gap-2">
              <FolderOpen className="size-4" aria-hidden="true" /> All projects
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {projects.map((p) => (
            <DropdownMenuItem key={p.id} onSelect={() => undefined}>
              <Link to={ROUTES.projects} title={p.name} className="flex w-full items-center gap-2">
                <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary px-1 text-[10px] font-extrabold tracking-wider text-sidebar-primary-foreground" aria-hidden="true">
                  {projectCode(p.name)}
                </span>
                <span className="truncate">{p.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          {projects.length === 0 && (
            <DropdownMenuItem disabled>
              <span>{loading ? "Loading…" : "No projects yet"}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

/** Projects of the active org: collapsible flat list (the old Workspaces look)
 * with live count + actions menu (New project -> dedicated page, All
 * projects, future slot). Minimized by default; open state lives in memory
 * (useState) while the sidebar stays mounted. Each row shows a mini avatar
 * with the derived 4-letter project code + a DEMO "..." menu (View project);
 * rows link to the management page (per-project detail routes are future).
 * Tenant-scoped: useProjects refetches whenever activeOrgId changes, so
 * switching orgs swaps the list. Flat rows hide in rail mode. */
function ProjectsGroup() {
  const { activeOrgId } = useAuth();
  const { state, isMobile } = useSidebar();
  const { pathname } = useLocation();
  const projectsActive = pathname === ROUTES.projects || pathname.startsWith("/projects/");
  const [open, setOpen] = React.useState(projectsActive);
  const { items: projects, loading } = useProjects(activeOrgId);
  const rail = state === "collapsed" && !isMobile;
  if (rail) {
    return (
      <SidebarGroup aria-label="Projects">
        <SidebarMenu>
          <ProjectsRailMenuItem projects={projects} loading={loading} projectsActive={projectsActive} />
        </SidebarMenu>
      </SidebarGroup>
    );
  }
  return (
    <SidebarGroup aria-label="Projects">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild open={open} onOpenChange={setOpen} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={projects.length > 0 ? `Projects (${projects.length})` : "Projects"}
                isActive={projectsActive}
                  aria-label={`Projects, ${projects.length} total`}
                  className="group data-[state=open]:text-sidebar-accent-foreground"
                >
                  <FolderOpen aria-hidden="true" />
                  <span className="truncate">Projects</span>
                <span className="shrink-0 rounded-md bg-muted/30 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground group-data-[active=true]:bg-transparent group-data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden" aria-hidden="true">
                  {loading ? "…" : projects.length}
                </span>
                <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 group-data-[state=open]/collapsible:text-sidebar-accent-foreground" aria-hidden="true" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
              <SidebarMenu>
                {projects.map((p) => (
                  <SidebarMenuItem key={p.id}>
                    <SidebarMenuButton asChild tooltip={p.name}>
                      <Link to={ROUTES.projects} title={p.name}>
                        <span className="flex h-6 min-w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary px-1 text-[10px] font-extrabold tracking-wider text-sidebar-primary-foreground" aria-hidden="true">
                          {projectCode(p.name)}
                        </span>
                        <span className="truncate">{p.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover aria-label={`More actions for ${p.name}`}>
                          <MoreHorizontal aria-hidden="true" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                        className="w-48 rounded-lg"
                      >
                        <DropdownMenuItem onSelect={() => undefined}>
                          <Link to={ROUTES.projects} className="flex w-full items-center gap-2">
                            <FolderOpen className="size-4" aria-hidden="true" /> View project
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
                {projects.length === 0 && !loading && (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <span>No projects yet</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </CollapsibleContent>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction
                aria-label={`Project actions, ${projects.length} projects`}
                title="Project actions"
                className="border border-sidebar-border bg-muted/50 shadow-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Plus aria-hidden="true" />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
              className="w-56 rounded-lg"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => undefined}>
                  <Link to={ROUTES.projectNew} className="flex w-full items-center gap-2">
                    <Plus className="size-4" aria-hidden="true" /> New project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => undefined}>
                  <Link to={ROUTES.projects} className="flex w-full items-center gap-2">
                    <FolderOpen className="size-4" aria-hidden="true" /> All projects
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {/* Future project actions slot (rename/transfer/archive live here). */}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}

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
<span className="truncate text-xs text-muted-foreground group-data-[state=open]:text-sidebar-accent-foreground">{activeOrg.slug}</span>
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
 * The Organizations/Projects sections below are collapsibles (upstream
 * animate-ui pattern); Workspaces was removed as duplicative of the header
 * org switcher. (Collapsible primitive stays in the catalog for disclosures.) */

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
                <span className="truncate text-xs text-muted-foreground group-data-[state=open]:text-sidebar-accent-foreground">
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
          <SidebarGroupLabel>Console</SidebarGroupLabel>
          <SidebarMenu>
            {CONSOLE_NAV.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <OrganizationsGroup />
        <ProjectsGroup />
        <SidebarGroup aria-label="Manage">
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarMenu>
            {MANAGE_NAV.map((item) => (
              <SideNavLink key={item.to} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {isStaff && (
          <SidebarGroup aria-label="Administration">
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarSeparator />
            <SidebarMenu>
              {ADMIN_NAV.map((item) => (
                <SideNavLink key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
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
