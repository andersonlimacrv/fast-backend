/* HTTP transport for the fast-backend API. Pure fetch: no window, no
 * localStorage (see services/session.ts). Session side-effects enter through
 * the injected `onUnauthorized` callback.
 *
 * Auth: Bearer access JWT (10-15 min) + opaque Postgres refresh with mandatory
 * rotation. On 401 the request refreshes once and retries; refresh failure or
 * reuse invokes `onUnauthorized` so the app can force logout — expected
 * backend behavior, see client/README.md.
 */

import { API_BASE } from "@/lib/constants";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  notifySessionExpired,
  setActiveOrgId as persistActiveOrgId,
  storeTokenPair,
} from "@/services/session";

export { API_BASE };
export {
  clearSession,
  getAccessToken,
  getActiveOrgId,
  setActiveOrgId as setActiveOrgId,
} from "@/services/session";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type UnauthorizedHandler = () => never;

let onUnauthorized: UnauthorizedHandler = () => {
  clearSession();
  notifySessionExpired();
  throw new ApiError(401, "Session expired. Please log in again.");
};

/** Override the session-expiry side-effect (tests, embedding). */
export function configureTransport(handler: { onUnauthorized: UnauthorizedHandler }): void {
  onUnauthorized = handler.onUnauthorized;
}

/* ---------- wire types (mirror backend Pydantic schemas) ---------- */

export interface UserRead {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface OrganizationRead {
  id: string;
  name: string;
  slug: string;
}

export interface MembershipRead {
  user_id: string;
  org_id: string;
  role: string;
}

export interface ProjectRead {
  id: string;
  org_id: string;
  name: string;
}

export interface GrantRead {
  org_id: string;
  key: string;
  limit: number | null;
  enabled: boolean;
  from_default?: boolean;
}

export interface AuditRead {
  id: string;
  tenant_id: string | null;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata?: Record<string, unknown>;
  audit_metadata?: Record<string, unknown>;
  ip: string | null;
  created_at: string;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/* ---------- core request ---------- */

function friendlyMessage(status: number, payload: unknown): string {
  if (typeof payload === "string" && payload) return payload;
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const first = detail[0] as { loc?: unknown[]; msg?: unknown } | undefined;
      if (first && typeof first.msg === "string") {
        const loc = Array.isArray(first.loc) ? first.loc.join(".") : "";
        return loc ? `${loc}: ${first.msg}` : first.msg;
      }
      try {
        return JSON.stringify(detail).slice(0, 300);
      } catch {
        return `Request failed (${status})`;
      }
    }
  }
  return `Request failed (${status})`;
}

async function raw<T>(path: string, init?: RequestInit): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError(0, "Cannot reach backend. Is the API running?");
  }
  if (resp.status === 204) return undefined as T;
  let payload: unknown = null;
  try {
    payload = await resp.json();
  } catch {
    payload = null;
  }
  if (!resp.ok) throw new ApiError(resp.status, friendlyMessage(resp.status, payload));
  return payload as T;
}

async function authed<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  try {
    return await raw<T>(path, { ...init, headers });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !retried && token) {
      await refreshOnce();
      return authed<T>(path, init, true);
    }
    throw err;
  }
}

let refreshPromise: Promise<void> | null = null;

async function refreshOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) onUnauthorized();
      try {
        const pair = await raw<TokenPair>("/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        storeTokenPair(pair.access_token, pair.refresh_token);
      } catch {
        onUnauthorized();
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function json<T>(path: string, method: string, body?: unknown): Promise<T> {
  return authed<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/* ---------- public API ---------- */

export async function register(email: string, password: string): Promise<UserRead> {
  return raw<UserRead>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<void> {
  const pair = await raw<TokenPair>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  storeTokenPair(pair.access_token, pair.refresh_token);
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await raw("/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } finally {
    clearSession();
  }
}

export async function logoutEverywhere(): Promise<void> {
  try {
    await authed("/auth/logout-everywhere", { method: "POST" });
  } finally {
    clearSession();
  }
}

export async function fetchMe(): Promise<UserRead> {
  return authed<UserRead>("/auth/me");
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await authed("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function switchOrganization(orgId: string): Promise<void> {
  const pair = await authed<TokenPair>("/auth/switch-organization", {
    method: "POST",
    body: JSON.stringify({ org_id: orgId }),
  });
  storeTokenPair(pair.access_token, pair.refresh_token);
  persistActiveOrgId(orgId);
}

export async function listOrgs(): Promise<OrganizationRead[]> {
  return authed<OrganizationRead[]>("/organizations");
}

export async function createOrg(name: string): Promise<OrganizationRead> {
  return json<OrganizationRead>("/organizations", "POST", { name });
}

export async function listMembers(orgId: string): Promise<MembershipRead[]> {
  return authed<MembershipRead[]>(`/organizations/${orgId}/members`);
}

export async function addMember(orgId: string, userId: string, role: string): Promise<MembershipRead> {
  return json<MembershipRead>(`/organizations/${orgId}/members`, "POST", {
    user_id: userId,
    role,
  });
}

export async function changeMemberRole(orgId: string, userId: string, role: string): Promise<MembershipRead> {
  return json<MembershipRead>(`/organizations/${orgId}/members/${userId}`, "PATCH", { role });
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  await authed(`/organizations/${orgId}/members/${userId}`, { method: "DELETE" });
}

export async function listProjects(): Promise<ProjectRead[]> {
  return authed<ProjectRead[]>("/projects");
}

export async function createProject(name: string): Promise<ProjectRead> {
  return json<ProjectRead>("/projects", "POST", { name });
}

export async function renameProject(projectId: string, name: string): Promise<ProjectRead> {
  return json<ProjectRead>(`/projects/${projectId}`, "PATCH", { name });
}

export async function deleteProject(projectId: string): Promise<void> {
  await authed(`/projects/${projectId}`, { method: "DELETE" });
}

export async function listGrants(orgId: string): Promise<GrantRead[]> {
  return authed<GrantRead[]>(`/organizations/${orgId}/grants`);
}

export async function upsertGrant(
  orgId: string,
  key: string,
  limit: number | null,
  enabled: boolean,
): Promise<GrantRead> {
  return json<GrantRead>(`/organizations/${orgId}/grants`, "PUT", { key, limit, enabled });
}

export async function listAudit(orgId: string): Promise<AuditRead[]> {
  return authed(`/organizations/${orgId}/audit`);
}

export async function getHealthz(): Promise<{ status: string }> {
  return raw<{ status: string }>("/healthz");
}

export interface ReadyzRead {
  status: string;
  db: string;
  redis: string;
}

export async function getReadyz(): Promise<ReadyzRead> {
  return raw<ReadyzRead>("/readyz");
}
