// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { AppSidebar, AppSidebarProvider, OrgSwitcher } from "@/components/app-sidebar";
import { DEMOS } from "@/components/catalog-demos";
import { Highlight } from "@/components/custom-ui/effects/highlight";

/* Regression: footer UserMenu / header OrgSwitcher must open without throwing
 * (Base-UI Menu.GroupLabel outside <Menu.Group> used to unmount the tree). */

// Mutable org list for long-name cases (vi.hoisted: the factory cannot see
// module-scope consts, so the default rows live inline here too).
const mocks = vi.hoisted(() => ({
  orgs: [
    { id: "o1", name: "Acme Inc", slug: "acme-inc" },
    { id: "o2", name: "Evil Corp", slug: "evil-corp" },
  ],
  user: { email: "verylongemailaddress@example.com", is_staff: false, is_superuser: false },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mocks.user,
    orgs: mocks.orgs,
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

function renderSidebar({ expanded = true }: { expanded?: boolean } = {}) {
  // Pin the sidebar open state via cookie (defaultOpen reads it first);
  // jsdom matchMedia never matches, so without this every test runs railed.
  document.cookie = `sidebar_state=${expanded ? "true" : "false"}; path=/`;
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
  afterEach(() => {
    cleanup();
    document.cookie = "sidebar_state=; path=/; max-age=0";
  });

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

  it("root menu shows the Modo Root card and root actions; others see none", async () => {
    const prev = mocks.user;
    mocks.user = { email: "root@example.com", is_staff: true, is_superuser: true };
    try {
      renderSidebar();
      // Full card stacked above the (unchanged) user button.
      expect(await screen.findByText("Root Mode")).toBeTruthy();
      expect(screen.getByText("Full system access")).toBeTruthy();
      openMenu(screen.getByRole("button", { name: /account menu/i }));
      expect(screen.getByRole("menuitem", { name: /grant staff/i })).toBeTruthy();
      expect(screen.getByRole("menuitem", { name: /revoke staff/i })).toBeTruthy();
      // Single dividers throughout (no doubled separator after the root group).
      const menu = screen.getByRole("menu");
      expect(within(menu).getAllByRole("separator")).toHaveLength(3);
    } finally {
      mocks.user = prev;
    }
    cleanup();
    renderSidebar();
    openMenu(await screen.findByRole("button", { name: /account menu/i }));
    expect(screen.queryByText("Root Mode")).toBeNull();
    expect(screen.queryByRole("menuitem", { name: /grant staff/i })).toBeNull();
  });

  it("marks staff-gated nav items with a subtle crown", async () => {
    const prev = mocks.user;
    mocks.user = { email: "root@example.com", is_staff: true, is_superuser: true };
    try {
      renderSidebar();
      const users = await screen.findByRole("link", { name: "Users" });
      expect(users.querySelector('svg[aria-label="visible for your access level"]')).toBeTruthy();
      const overview = await screen.findByRole("link", { name: "Overview" });
      expect(overview.querySelector('svg[aria-label="visible for your access level"]')).toBeNull();
    } finally {
      mocks.user = prev;
    }
  });

  it("RULES §12: injected overrides drive the switcher without auth", async () => {
    const onSwitchOrg = vi.fn();
    render(
      <MemoryRouter>
        <AppSidebarProvider>
          <Highlight>
            <OrgSwitcher
              orgs={[
                {
                  name: "Acme Incorporated International Holdings Ltd Division",
                  slug: "acme-inc",
                  id: "o-long",
                },
                { id: "o2", name: "Evil Corp", slug: "evil-corp" },
              ]}
              activeOrgId="o-long"
              onSwitchOrg={onSwitchOrg}
            />
          </Highlight>
        </AppSidebarProvider>
      </MemoryRouter>,
    );
    openMenu(await screen.findByRole("button", { name: /switch organization/i }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /evil corp/i }));
    expect(onSwitchOrg).toHaveBeenCalledWith("o2");
  });

  it("RULES §12: the item-17 trials proof renders the long-name switcher", async () => {    render(
      <MemoryRouter>
        <AppSidebarProvider>
          {DEMOS["sidebar"]}
        </AppSidebarProvider>
      </MemoryRouter>,
    );
    const trigger = await screen.findByRole("button", { name: /switch organization/i });
    expect(trigger.querySelector(".truncate")?.getAttribute("title")).toContain("Holdings");
    openMenu(trigger);
    expect(await screen.findByRole("menuitem", { name: /acme incorporated/i })).toBeTruthy();
  });

  it("RULES §12: the item-17 rail proof opens right-anchored menus", async () => {
    render(
      <MemoryRouter>
        <AppSidebarProvider>
          {DEMOS["sidebar"]}
        </AppSidebarProvider>
      </MemoryRouter>,
    );
    // Rail row exists in the proof (Organizations + Projects icons).
    openMenu(await screen.findByRole("button", { name: "Organizations" }));
    expect(await screen.findByRole("menuitem", { name: /all organizations/i })).toBeTruthy();
  });

  it("S7.2: long org names truncate with full titles and keep the tree mounted", async () => {
    const longName = "Acme Incorporated International Holdings Ltd Division";
    const longSlug = "acme-incorporated-international-holdings";
    const prev = mocks.orgs;
    mocks.orgs = [
      { id: "o1", name: longName, slug: longSlug },
      { id: "o2", name: "Evil Corp", slug: "evil-corp" },
    ];
    try {
      renderSidebar();
      const trigger = await screen.findByRole("button", { name: /switch organization/i });
      // Header truncates but exposes the full name/slug natively.
      const titles = [...trigger.querySelectorAll(".truncate")].map((el) =>
        el.getAttribute("title"),
      );
      expect(titles).toContain(longName);
      expect(titles).toContain(longSlug);
      // Menu opens (tree intact) with the same treatment per item.
      openMenu(trigger);
      const item = await screen.findByRole("menuitem", { name: /acme incorporated/i });
      expect(item.querySelector(".truncate")?.getAttribute("title")).toBe(longName);
    } finally {
      mocks.orgs = prev;
    }
  });

  it("keeps the projects list minimized with a count badge until opened", async () => {
    renderSidebar();
    // Collapsed by default (in-memory useState): project rows absent.
    expect(screen.queryByRole("link", { name: "Apollo" })).toBeNull();
    expect(screen.getByRole("button", { name: "Projects, 2 total" })).toBeTruthy();
    // Count lives on the actions button badge now, not in the trigger row.
    expect(screen.getByRole("button", { name: "Project actions, 2 projects" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Projects, 2 total" }));
    expect(await screen.findByRole("link", { name: "Apollo" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Zephyr" })).toBeTruthy();
    // Mini avatars carry the derived 4-letter codes.
    expect(screen.getByText("APOL")).toBeTruthy();
    expect(screen.getByText("ZEPH")).toBeTruthy();
    // "All projects" row is gone (page reached via the actions menu instead).
    expect(screen.queryByRole("link", { name: "All projects" })).toBeNull();
    // Actions menu: New + All projects with the right targets.
    openMenu(screen.getByRole("button", { name: "Project actions, 2 projects" }));
    const newItem = await screen.findByRole("menuitem", { name: /new project/i });
    expect(newItem.querySelector("a")?.getAttribute("href")).toBe("/projects/new");
    const allItem = await screen.findByRole("menuitem", { name: /all projects/i });
    expect(allItem.querySelector("a")?.getAttribute("href")).toBe("/projects");
  });

  it("opens a per-project menu with View project (DEMO row pattern)", async () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Projects, 2 total" }));
    expect(await screen.findByRole("link", { name: "Apollo" })).toBeTruthy();
    openMenu(screen.getByRole("button", { name: /more actions for apollo/i }));
    expect(await screen.findByRole("menuitem", { name: /view project/i })).toBeTruthy();
  });

  it("rail: clicking Organizations opens the child pages menu", async () => {
    renderSidebar({ expanded: false });
    // No collapsible panel in rail: sub-links never render as links.
    expect(screen.queryByRole("link", { name: "All organizations" })).toBeNull();
    openMenu(screen.getByRole("button", { name: "Organizations" }));
    const allItem = await screen.findByRole("menuitem", { name: /all organizations/i });
    expect(allItem.querySelector("a")?.getAttribute("href")).toBe("/orgs");
    const membersItem = await screen.findByRole("menuitem", { name: /^members$/i });
    expect(membersItem.querySelector("a")?.getAttribute("href")).toBe("/orgs/o1/members");
  });

  it("rail: clicking Projects opens the actions menu with New/All/list", async () => {
    renderSidebar({ expanded: false });
    // No collapsible panel in rail: rows never render as links.
    expect(screen.queryByRole("link", { name: "Apollo" })).toBeNull();
    openMenu(screen.getByRole("button", { name: "Projects, 2 total" }));
    const newItem = await screen.findByRole("menuitem", { name: /new project/i });
    expect(newItem.querySelector("a")?.getAttribute("href")).toBe("/projects/new");
    const allItem = await screen.findByRole("menuitem", { name: /all projects/i });
    expect(allItem.querySelector("a")?.getAttribute("href")).toBe("/projects");
    expect(screen.getByRole("menuitem", { name: /apollo/i })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /zephyr/i })).toBeTruthy();
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
