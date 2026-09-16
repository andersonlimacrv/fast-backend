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

/* Responsive shell matrix (DESIGN.md §6): drawer <md, rail md–xl, expanded ≥xl.
 * Dropdown anchoring per mode + no-overflow asserts. Snapshots per viewport. */

async function expectNoOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  expect(overflow.scrollW).toBeLessThanOrEqual(overflow.innerW + 1);
}

describeWithApi("sidebar responsive", () => {
  let session: MemberSession;
  let orgId: string;

  test.beforeAll(async () => {
    const owner = await registerMember();
    session = await registerMember();
    orgId = await createOrg(owner.accessToken, `e2e rsp ${Date.now().toString(36)}`);
    await addOrgMember(owner.accessToken, orgId, await meId(session.accessToken), "member");
  });

  test("390px: drawer opens/closes, footer menu layers above sheet", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoAuthed(page, "/~", session, orgId);
    await expect(page.getByRole("complementary", { name: "Primary" })).toBeHidden();
    await page.getByRole("button", { name: /Toggle Sidebar/i }).click();
    const drawer = page.getByRole("dialog", { name: "Sidebar" });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await page.getByRole("button", { name: /Toggle Sidebar/i }).click();
    await page.getByRole("button", { name: /account menu/i }).click();
    const menu = page.getByRole("menu").first();
    await expect(page.getByRole("menuitem", { name: /account/i })).toBeVisible();
    const [menuBox, trigBox] = await Promise.all([
      menu.boundingBox(),
      page.getByRole("button", { name: /account menu/i }).boundingBox(),
    ]);
    expect(menuBox && trigBox ? menuBox.y + menuBox.height <= trigBox.y + 1 : false).toBe(true);
    await expectNoOverflow(page);
    await expectNoSeriousA11y(page);
    // Open menu + sheet spring settle per-run: mask random e2e data (org/email).
    // Menu placement/items are asserted functionally above.
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot("shell-390-drawer.png", {
      mask: [page.locator("text=/e2e rsp /"), page.locator("text=/e2e-rsp-/"), page.locator("text=@example.com"), page.locator("text=/[0-9a-f]{32}/")],
    });
  });

  test("768px: rail icons, tooltip on hover, dropdown anchors right", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await gotoAuthed(page, "/~", session, orgId);
    const sidebar = page.getByRole("complementary", { name: "Primary" });
    await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(sidebar.getByText("Overview", { exact: true })).toBeHidden();
    await page.getByRole("link", { name: "Health" }).hover();
    await expect(page.getByText("Health").last()).toBeVisible();
    const railTrigger = page.getByRole("button", { name: /account menu/i });
    const trigBox = await railTrigger.boundingBox();
    await railTrigger.click();
    const menu = page.getByRole("menu").first();
    await expect(page.getByRole("menuitem", { name: /account/i })).toBeVisible();
    const menuBox = await menu.boundingBox();
    expect(menuBox && trigBox ? menuBox.x >= trigBox.x + trigBox.width - 1 : false).toBe(true);
    await page.keyboard.press("Escape");
    // Rail Projects icon opens the actions menu (New/All/list) to the right.
    const projTrigger = page.getByRole("button", { name: /projects, \d+ total/i });
    const projTrigBox = await projTrigger.boundingBox();
    await projTrigger.click();
    await expect(page.getByRole("menuitem", { name: /new project/i })).toBeVisible();
    const projMenuBox = await page.getByRole("menu").first().boundingBox();
    expect(projMenuBox && projTrigBox ? projMenuBox.x >= projTrigBox.x + projTrigBox.width - 1 : false).toBe(true);
    // Screenshot keeps the Projects menu open (layering proof, like before).
    await expectNoOverflow(page);
    await expectNoSeriousA11y(page);
    // Mask per-run e2e data (org/email); rail/menu placement asserted above.
    // Threshold 0.03: per-run org-name lengths shift unmasked line flow and
    // motion springs (highlight/menu) settle at slightly different phases.
    await expect(page).toHaveScreenshot("shell-768-rail.png", {
      mask: [page.locator("text=/e2e rsp /"), page.locator("text=/e2e-rsp-/"), page.locator("text=@example.com"), page.locator("text=/[0-9a-f]{32}/")],
      maxDiffPixelRatio: 0.03,
    });
  });

  test("1280px: expanded labels, collapse persists via cookie", async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAuthed(page, "/~", session, orgId);
    const sidebar = page.getByRole("complementary", { name: "Primary" });
    await expect(sidebar.getByText("Overview", { exact: true })).toBeVisible();
    await page.keyboard.press("Control+b");
    await expect(sidebar.getByText("Overview", { exact: true })).toBeHidden();
    await page.reload();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Primary" }).getByText("Overview", { exact: true })).toBeHidden();
    const cookies = await context.cookies();
    expect(cookies.some((c) => c.name === "sidebar_state")).toBe(true);
    await expectNoOverflow(page);
    await expect(page).toHaveScreenshot("shell-1280-rail-persist.png");
  });

  test("1536px: expanded by default", async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 864 });
    await gotoAuthed(page, "/~", session, orgId);
    await expect(page.getByRole("complementary", { name: "Primary" }).getByText("Overview", { exact: true })).toBeVisible();
    await expectNoOverflow(page);
    await expect(page).toHaveScreenshot("shell-1536-full.png");
  });
});
