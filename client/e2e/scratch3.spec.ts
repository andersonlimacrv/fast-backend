import { expect, test } from "@playwright/test";
import { addOrgMember, createOrg, describeWithApi, gotoAuthed, meId, registerMember, type MemberSession } from "./helpers";

describeWithApi("scratch drawer menu", () => {
  let session: MemberSession;
  let orgId: string;
  test.beforeAll(async () => {
    const owner = await registerMember();
    session = await registerMember();
    orgId = await createOrg(owner.accessToken, `e2e dm ${Date.now().toString(36)}`);
    await addOrgMember(owner.accessToken, orgId, await meId(session.accessToken), "member");
  });
  test("menu inside drawer", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message.slice(0, 250)));
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAuthed(page, "/~", session, orgId);
    await page.getByRole("button", { name: /toggle sidebar/i }).click();
    await expect(page.getByRole("dialog", { name: "Sidebar" })).toBeVisible();
    await page.getByRole("button", { name: /account menu/i }).click();
    await page.waitForTimeout(1200);
    const info = await page.evaluate(() => ({
      menus: document.querySelectorAll('[role="menu"]').length,
      overlays: document.querySelectorAll('[data-slot="dropdown-menu-content"]').length,
      portals: document.body.children.length,
    }));
    console.log(`DRAWERINFO=${JSON.stringify(info)} ERRORS=${JSON.stringify(errors.slice(0, 3))}`);
    expect(info.menus).toBeGreaterThan(0);
  });
});
