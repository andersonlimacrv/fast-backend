// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { AppSidebar, AppSidebarProvider } from "@/components/app-sidebar";

/* Regression: footer UserMenu / header OrgSwitcher must open without throwing
 * (Base-UI Menu.GroupLabel outside <Menu.Group> used to unmount the tree). */

const ORGS = [
  { id: "o1", name: "Acme Inc", slug: "acme-inc" },
  { id: "o2", name: "Evil Corp", slug: "evil-corp" },
];

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "verylongemailaddress@example.com", is_staff: false, is_superuser: false },
    orgs: ORGS,
    activeOrgId: "o1",
    ready: true,
    switchOrg: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
    logoutEverywhere: vi.fn(async () => {}),
    refreshUser: vi.fn(async () => {}),
  }),
}));

const PROJECTS = [
  { id: "p1", org_id: "o1", name: "Apollo" },
  { id: "p2", org_id: "o1", name: "Zephyr" },
];

vi.mock("@/hooks/useProjects", () => ({
  useProjects: () => ({
    items: PROJECTS,
    error: null,
    loading: false,
    busy: false,
    reload: vi.fn(async () => {}),
    mutate: vi.fn(async () => null),
    setError: vi.fn(),
    setBusy: vi.fn(),
  }),
}));

function renderSidebar() {
  render(
    <MemoryRouter>
      <AppSidebarProvider>
        <AppSidebar />
      </AppSidebarProvider>
    </MemoryRouter>,
  );
}

// Radix opens on the pointer sequence (real browsers send it natively).
function openMenu(trigger: HTMLElement) {
  fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0 });
  fireEvent.mouseDown(trigger, { button: 0 });
  fireEvent.click(trigger);
}

describe("sidebar user menu", () => {
  afterEach(() => cleanup());

  it("opens the footer menu without unmounting the tree", async () => {
    renderSidebar();
    // Tree intact before opening (radix modal menus hide background while open).
    expect(screen.getByRole("link", { name: "Overview" })).toBeTruthy();
    openMenu(await screen.findByRole("button", { name: /account menu/i }));
    const items = await screen.findAllByRole("menuitem");
    // Account + Logout + Logout everywhere (logout carries a ⇧⌘Q shortcut).
    expect(items).toHaveLength(3);
    expect(screen.getByRole("menuitem", { name: /account/i })).toBeTruthy();
  });

  it("opens the org switcher listing all orgs", async () => {
    renderSidebar();
    openMenu(await screen.findByRole("button", { name: /switch organization/i }));
    expect(await screen.findByRole("menuitem", { name: /evil corp/i })).toBeTruthy();
  });

  it("keeps the projects list minimized with a live count until opened", async () => {
    renderSidebar();
    // Collapsed by default (in-memory useState): sub-links absent.
    expect(screen.queryByRole("link", { name: "All projects" })).toBeNull();
    expect(screen.getByRole("button", { name: "Projects, 2 total" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Projects, 2 total" }));
    expect(await screen.findByRole("link", { name: "All projects" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Apollo" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Zephyr" })).toBeTruthy();
    // Mini avatars carry the derived 4-letter codes.
    expect(screen.getByText("APOL")).toBeTruthy();
    expect(screen.getByText("ZEPH")).toBeTruthy();
    // Actions menu (replaces the old direct + link): New + All projects.
    openMenu(screen.getByRole("button", { name: "Project actions" }));
    const newItem = await screen.findByRole("menuitem", { name: /new project/i });
    expect(newItem.querySelector("a")?.getAttribute("href")).toBe("/projects/new");
    expect(await screen.findByRole("menuitem", { name: /all projects/i })).toBeTruthy();
  });

  it("opens a per-project menu with View project (DEMO row pattern)", async () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Projects, 2 total" }));
    expect(await screen.findByRole("link", { name: "Apollo" })).toBeTruthy();
    openMenu(screen.getByRole("button", { name: /more actions for apollo/i }));
    expect(await screen.findByRole("menuitem", { name: /view project/i })).toBeTruthy();
  });

  it("lists the organization subpaths (All organizations + Members)", async () => {
    renderSidebar();
    expect(screen.queryByRole("link", { name: "All organizations" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Organizations" }));
    expect(await screen.findByRole("link", { name: "All organizations" })).toBeTruthy();
    const members = screen.getByRole("link", { name: "Members" });
    expect(members.getAttribute("href")).toBe("/orgs/o1/members");
  });

  it("reserves Settings for the gear entry and drops the Account nav link", async () => {
    renderSidebar();
    expect(screen.getByRole("link", { name: "Settings" })).toBeTruthy();
    // Account lives in the footer avatar menu now, not in the nav.
    expect(screen.queryByRole("link", { name: "Account" })).toBeNull();
  });
});
