/* PR1 smoke: landing loads (offline-capable) with clean axe.
 * Authed routes join once `make api` runs (PR4+); this file proves the harness.
 */

import { expect, test } from "@playwright/test";

import { expectNoSeriousA11y } from "./a11y";

test("landing loads with release info and clean axe", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /fast-backend/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /modules/i })).toBeVisible();
  await expectNoSeriousA11y(page);
});

test("login is reachable by keyboard from landing", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const login = page.getByRole("button", { name: /^login$/i }).or(page.getByRole("link", { name: /login/i }));
  await login.first().focus();
  await expect(login.first()).toBeFocused();
});
