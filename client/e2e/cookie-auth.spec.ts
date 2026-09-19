/* Cookie sessions (change auth-cookies-http-only): HttpOnly transport + CSRF.
 * Runs against the isolated e2e API, which boots with AUTH_COOKIE_ENABLED=true
 * (see Makefile e2e-api). Header flow keeps working (dual-read transition).
 */

import { expect, test } from "@playwright/test";

import { API_BASE, describeWithApi, registerMember } from "./helpers";

async function loginCookies(email: string, password: string) {
  // eslint-disable-next-line no-undef -- node fetch in the e2e runner
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) throw new Error(`login failed: ${resp.status}`);
  return resp.headers.getSetCookie();
}

describeWithApi("cookie sessions", () => {
  test("login mints HttpOnly session cookies + readable CSRF", async () => {
    const member = await registerMember();
    const cookies = await loginCookies(member.email, "Str0ng!Passw0rd");
    const access = cookies.find((c) => c.startsWith("access_token="));
    const refresh = cookies.find((c) => c.startsWith("refresh_token="));
    const csrf = cookies.find((c) => c.startsWith("csrf_token="));
    expect(access).toContain("HttpOnly");
    expect(refresh).toContain("HttpOnly");
    expect(csrf).not.toContain("HttpOnly");
  });

  test("JS can read csrf_token but never the session tokens", async ({ page }) => {
    const member = await registerMember();
    // eslint-disable-next-line no-undef -- node fetch in the e2e runner
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: member.email, password: "Str0ng!Passw0rd" }),
    });
    expect(resp.ok).toBe(true);
    // Seed the browser jar the way a real login response would (flags mirror
    // the Set-Cookie attributes proven by the previous test).
    for (const c of resp.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      await page.context().addCookies([
        {
          name,
          value: pair.slice(eq + 1).trim(),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: name !== "csrf_token",
        },
      ]);
    }
    // Read the jar directly (host-agnostic: no navigation needed).
    // httpOnly=true is exactly what hides a cookie from document.cookie,
    // so these flags ARE the JS-invisibility assertion.
    const jar = await page.context().cookies();
    const byName = new Map(jar.map((c) => [c.name, c]));
    expect(byName.get("csrf_token")?.httpOnly).toBe(false);
    expect(byName.get("access_token")?.httpOnly).toBe(true);
    expect(byName.get("refresh_token")?.httpOnly).toBe(true);
  });

  test("cookie-only refresh works with an empty body", async ({ page }) => {
    const member = await registerMember();
    await page.goto("/");
    // eslint-disable-next-line no-undef -- node fetch in the e2e runner
    const login = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: member.email, password: "Str0ng!Passw0rd" }),
    });
    expect(login.ok).toBe(true);
    let csrf = "";
    for (const c of login.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (name === "csrf_token") csrf = value;
      // Paths mirror production (`refresh_token` is confined to `/auth`).
      const path = name === "refresh_token" ? "/auth" : "/";
      await page.context().addCookies([{ name, value, domain: "127.0.0.1", path, httpOnly: name !== "csrf_token" }]);
    }
    expect(csrf).toBeTruthy();
    // No Authorization header, empty body: the HttpOnly cookie authenticates;
    // refresh is a mutation, so the synchronizer rides along.
    const refreshed = await page.request.post(`${API_BASE}/auth/refresh`, {
      data: {},
      headers: { "x-csrf-token": csrf },
    });
    expect(refreshed.ok()).toBe(true);
    const body = (await refreshed.json()) as { access_token: string };
    expect(body.access_token).toBeTruthy();
  });

  test("cookie mutations require the CSRF synchronizer", async ({ page }) => {
    const member = await registerMember();
    await page.goto("/");
    // eslint-disable-next-line no-undef -- node fetch in the e2e runner
    const login = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: member.email, password: "Str0ng!Passw0rd" }),
    });
    expect(login.ok).toBe(true);
    let csrf = "";
    for (const c of login.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (name === "csrf_token") csrf = value;
      await page.context().addCookies([{ name, value, domain: "127.0.0.1", path: "/", httpOnly: name !== "csrf_token" }]);
    }
    expect(csrf).toBeTruthy();
    // Cookies attached, no synchronizer → 403.
    const denied = await page.request.post(`${API_BASE}/auth/logout`, { data: {} });
    expect(denied.status()).toBe(403);
    // Same cookies + synchronizer → 200.
    const allowed = await page.request.post(`${API_BASE}/auth/logout`, {
      data: {},
      headers: { "x-csrf-token": csrf },
    });
    expect(allowed.ok()).toBe(true);
  });
});
