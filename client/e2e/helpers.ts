/* Shared e2e helpers: API-gated auth (real backend, no session mocks).
 *
 * Authed suites probe `E2E_API_URL` (default http://127.0.0.1:8000, same as
 * `scripts/e2e_spa_flow.py`) and SKIP when unreachable, so `make web-e2e`
 * stays green offline (anonymous routes) and goes full with the stack up
 * (`make db-up && make migrate && make api`).
 */

import { test as base, type Page } from "@playwright/test";

export const API_BASE = process.env.E2E_API_URL ?? "http://127.0.0.1:8000";

// Mirrors STORAGE_KEYS in client/src/lib/constants.ts (no @/ alias in e2e).
const ACCESS_KEY = "fb.access_token";
const REFRESH_KEY = "fb.refresh_token";
const ORG_KEY = "fb.active_org_id";

export async function apiUp(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_BASE}/healthz`, { signal: AbortSignal.timeout(3000) });
    return resp.ok;
  } catch {
    return false;
  }
}

export interface MemberSession {
  email: string;
  accessToken: string;
  refreshToken: string;
}

export async function registerMember(): Promise<MemberSession> {
  const email = `e2e-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const password = "Str0ng!Passw0rd";
  const reg = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!reg.ok) throw new Error(`register failed: ${reg.status}`);
  const login = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok) throw new Error(`login failed: ${login.status}`);
  const pair = (await login.json()) as { access_token: string; refresh_token: string };
  return { email, accessToken: pair.access_token, refreshToken: pair.refresh_token };
}

export async function gotoAuthed(
  page: Page,
  path: string,
  session: MemberSession,
  activeOrgId?: string,
): Promise<void> {
  await page.goto("/");
  await page.evaluate(
    ([aKey, rKey, oKey, sessionArg, orgId]) => {
      localStorage.setItem(aKey, sessionArg.accessToken);
      localStorage.setItem(rKey, sessionArg.refreshToken);
      if (orgId) localStorage.setItem(oKey, orgId);
    },
    [ACCESS_KEY, REFRESH_KEY, ORG_KEY, session, activeOrgId ?? null] as const,
  );
  await page.goto(path);
  await page.waitForURL(path === "/" ? "/" : path, { timeout: 10_000 });
}

export async function createOrg(accessToken: string, name: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/organizations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ name }),
  });
  if (!resp.ok) throw new Error(`create org failed: ${resp.status}`);
  return ((await resp.json()) as { id: string }).id;
}

export async function meId(accessToken: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) throw new Error(`me failed: ${resp.status}`);
  return ((await resp.json()) as { id: string }).id;
}

export async function addOrgMember(ownerToken: string, orgId: string, userId: string, role: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/organizations/${orgId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ user_id: userId, role }),
  });
  if (!resp.ok) throw new Error(`add member failed: ${resp.status}`);
}

/** Skip the whole file when the API is down (anonymous coverage still runs). */
export function describeWithApi(title: string, fn: () => void): void {
  base.describe(title, () => {
    // eslint-disable-next-line no-empty-pattern -- Playwright requires object destructuring here
    base.beforeAll(async ({}, testInfo) => {
      if (!(await apiUp())) testInfo.skip(true, "needs API: make db-up && make migrate && make api");
    });
    fn();
  });
}
