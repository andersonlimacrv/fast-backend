/* Authenticated routes: axe on every member page, snapshots on key ones.
 * Snapshots are per-platform ({platform} template): update only YOUR
 * platform dir, seed new platforms via the baselines dispatch workflow.
 */

import { expect, test } from "@playwright/test";

import { expectNoSeriousA11y } from "./a11y";
import {
  addOrgMember,
  createOrg,
  describeWithApi,
  gotoAuthed,
  meId,
  registerMember,
  type MemberSession,
} from "./helpers";

describeWithApi("member console", () => {
  let session: MemberSession;
  let orgId: string;

  test.beforeAll(async () => {
    // Owner creates the org; the user under test joins as plain member,
    // so org-admin surfaces (audit, grants) answer a real backend 403.
    const owner = await registerMember();
    session = await registerMember();
    orgId = await createOrg(owner.accessToken, `e2e org ${Date.now().toString(36)}`);
    await addOrgMember(owner.accessToken, orgId, await meId(session.accessToken), "member");
  });

  const pages = ["/~", "/orgs", "/projects", "/account", "/health"] as const;

  for (const path of pages) {
    test(`axe clean on ${path}`, async ({ page }) => {
      await gotoAuthed(page, path, session);
      await expect(page.locator("main")).toBeVisible();
      await expectNoSeriousA11y(page);
    });
  }

  test("member sees the backend 403 as UI on /audit and /admin/*", async ({ page }) => {
    // /audit with an org triggers the real backend 403 (member, not admin).
    await gotoAuthed(page, "/audit", session, orgId);
    await expect(page.getByText(/forbidden|403/i).first()).toBeVisible();
    await expectNoSeriousA11y(page);
    for (const path of ["/admin/users", "/admin/audit"]) {
      await gotoAuthed(page, path, session, orgId);
      await expect(page.getByText(/forbidden|403/i).first()).toBeVisible();
      await expectNoSeriousA11y(page);
    }
  });

  test("snapshots: home and admin gate", async ({ page }) => {
    await gotoAuthed(page, "/~", session);
    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveScreenshot("home-member.png");

    await gotoAuthed(page, "/admin/users", session);
    await expect(page.getByText(/forbidden|403/i).first()).toBeVisible();
    await expect(page).toHaveScreenshot("admin-users-forbidden.png");
  });
});
