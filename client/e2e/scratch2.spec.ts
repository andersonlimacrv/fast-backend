import { expect, test } from "@playwright/test";
import { addOrgMember, createOrg, describeWithApi, gotoAuthed, meId, registerMember, type MemberSession } from "./helpers";

describeWithApi("scratch tooltip", () => {
  let session: MemberSession;
  let orgId: string;
  test.beforeAll(async () => {
    const owner = await registerMember();
    session = await registerMember();
    orgId = await createOrg(owner.accessToken, `e2e tip ${Date.now().toString(36)}`);
    await addOrgMember(owner.accessToken, orgId, await meId(session.accessToken), "member");
  });
  test("rail tooltip", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message.slice(0, 200)));
    await gotoAuthed(page, "/~", session, orgId);
    await page.getByRole("link", { name: "Health" }).hover({ trial: false });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const overlays = Array.from(document.querySelectorAll('[data-slot="tooltip-overlay"]'));
      const trig = document.querySelector('[data-slot="sidebar-menu-button"]');
      return {
        overlays: overlays.length,
        trigState: trig?.getAttribute("data-state"),
        portals: document.querySelectorAll("[data-radix-portal], [data-floating-ui-portal]").length,
      };
    });
    console.log(`TIPINFO=${JSON.stringify(info)} ERRORS=${JSON.stringify(errors.slice(0, 3))}`);
    expect(info.overlays).toBeGreaterThan(0);
  });
});
