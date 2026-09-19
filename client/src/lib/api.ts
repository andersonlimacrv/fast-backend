/* HTTP transport for the fast-backend API. Pure fetch: no window, no
 * localStorage (see services/session.ts). Session side-effects enter through
 * the injected `onUnauthorized` callback.
 *
 * Auth: Bearer access JWT (10-15 min) + opaque Postgres refresh with mandatory
 * rotation. On 401 the request refreshes once and retries; refresh failure or
 * reuse invokes `onUnauthorized` so the app can force logout — expected
 * backend behavior, see client/README.md.
 * Cookie mode (`VITE_AUTH_COOKIES=true`): tokens travel in HttpOnly cookies
 * (`credentials: "include"`), access lives in memory, mutations carry the
 * `x-csrf-token` synchronizer; header mode stays byte-identical.
 */

import { API_BASE } from "@/lib/constants";
import {
  CSRF_HEADER_NAME,
  clearSession,
  getAccessToken,
  getCsrfToken,
  getRefreshToken,
  isCookieMode,
  notifySessionExpired,
  setActiveOrgId as persistActiveOrgId,
  storeTokenPair,
} from "@/services/session";

export { API_BASE };
export { clearSession, getAccessToken, getActiveOrgId, setActiveOrgId } from "@/services/session";

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
  is_staff?: boolean;
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

export interface AdminUserRead {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  created_at: string;
}

export interface AdminOverview {
  users: number;
  organizations: number;
  projects: number;
}

export interface AdminOrgRead {
  id: string;
  name: string;
  slug: string;
}

export interface AdminAuditRead {
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

export interface StatusAccepted {
  status: string;
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
    // `credentials: "include"` is a no-op in header mode and carries the
    // HttpOnly session cookies in cookie mode (same-eTLD API).
    resp = await fetch(`${API_BASE}${path}`, { ...init, credentials: "include" });
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

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

async function authed<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const token = getAccessToken();
  const cookieMode = isCookieMode();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (cookieMode && !SAFE_METHODS.has((init?.method ?? "GET").toUpperCase())) {
    // Mutations authenticated by cookie require the synchronizer token.
    const csrf = getCsrfToken();
    if (csrf) headers.set(CSRF_HEADER_NAME, csrf);
  }
  try {
    return await raw<T>(path, { ...init, headers });
  } catch (err) {
    // In cookie mode there may be no in-memory token (e.g. after a reload):
    // the HttpOnly cookies still authenticate the silent refresh.
    if (err instanceof ApiError && err.status === 401 && !retried && (token || cookieMode)) {
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
      // In cookie mode there is no stored refresh token: the HttpOnly cookie
      // authenticates the rotation (empty body, backend reads the cookie).
      if (!refreshToken && !isCookieMode()) onUnauthorized();
      try {
        const headers = new Headers({ "Content-Type": "application/json" });
        if (isCookieMode()) {
          const csrf = getCsrfToken();
          if (csrf) headers.set(CSRF_HEADER_NAME, csrf);
        }
        const pair = await raw<TokenPair>("/auth/refresh", {
          method: "POST",
          headers,
          body: JSON.stringify({ refresh_token: refreshToken ?? "" }),
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
    // In cookie mode the HttpOnly cookie identifies the session even with an
    // empty body (and the response clears the cookies server-side).
    if (refreshToken || isCookieMode()) {
      const headers = new Headers({ "Content-Type": "application/json" });
      if (isCookieMode()) {
        const csrf = getCsrfToken();
        if (csrf) headers.set(CSRF_HEADER_NAME, csrf);
      }
      await raw("/auth/logout", {
        method: "POST",
        headers,
        body: JSON.stringify({ refresh_token: refreshToken ?? "" }),
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

/* ---------- admin control plane (staff+; root-only where noted) ---------- */

export async function getAdminOverview(): Promise<AdminOverview> {
  return authed<AdminOverview>("/admin/overview");
}

export async function listAdminUsers(limit = 100, offset = 0): Promise<AdminUserRead[]> {
  return authed<AdminUserRead[]>(`/admin/users?limit=${limit}&offset=${offset}`);
}

export async function getAdminUser(userId: string): Promise<AdminUserRead> {
  return authed<AdminUserRead>(`/admin/users/${userId}`);
}

export async function createAdminUser(email: string, password: string, reason: string): Promise<AdminUserRead> {
  return json<AdminUserRead>("/admin/users", "POST", { email, password, reason });
}

export async function disableAdminUser(userId: string, reason: string): Promise<AdminUserRead> {
  return json<AdminUserRead>(`/admin/users/${userId}/disable`, "POST", { reason });
}

export async function enableAdminUser(userId: string, reason: string): Promise<AdminUserRead> {
  return json<AdminUserRead>(`/admin/users/${userId}/enable`, "POST", { reason });
}

export async function revokeAdminSessions(userId: string, reason: string): Promise<StatusAccepted> {
  return json<StatusAccepted>(`/admin/users/${userId}/revoke-sessions`, "POST", { reason });
}

export async function forceAdminPasswordReset(userId: string, reason: string): Promise<StatusAccepted> {
  return json<StatusAccepted>(`/admin/users/${userId}/force-password-reset`, "POST", { reason });
}

export async function grantStaff(userId: string, reason: string): Promise<AdminUserRead> {
  return json<AdminUserRead>(`/admin/staff/${userId}/grant`, "POST", { reason });
}

export async function revokeStaff(userId: string, reason: string): Promise<AdminUserRead> {
  return json<AdminUserRead>(`/admin/staff/${userId}/revoke`, "POST", { reason });
}

export async function listAdminOrgs(limit = 100, offset = 0): Promise<AdminOrgRead[]> {
  return authed<AdminOrgRead[]>(`/admin/organizations?limit=${limit}&offset=${offset}`);
}

export async function setAdminMembership(
  orgId: string,
  userId: string,
  role: string,
  reason: string,
): Promise<StatusAccepted> {
  return json<StatusAccepted>("/admin/memberships", "POST", { org_id: orgId, user_id: userId, role, reason });
}

export async function removeAdminMembership(orgId: string, userId: string, reason: string): Promise<StatusAccepted> {
  return authed<StatusAccepted>(`/admin/memberships/${orgId}/${userId}`, {
    method: "DELETE",
    body: JSON.stringify({ reason }),
  });
}

export async function listAdminAudit(limit = 100): Promise<AdminAuditRead[]> {
  return authed<AdminAuditRead[]>(`/admin/audit?limit=${limit}`);
}

export async function getHealthz(): Promise<{ status: string }> {
  return raw<{ status: string }>("/healthz");
}

export interface MetaModule {
  key: string;
  enabled: boolean;
}

export interface MetaRead {
  app: string;
  version: string;
  modules: MetaModule[];
}

export async function getMeta(): Promise<MetaRead> {
  return raw<MetaRead>("/meta");
}

export interface ReadyzRead {
  status: string;
  db: string;
  redis: string;
}

export async function getReadyz(): Promise<ReadyzRead> {
  return raw<ReadyzRead>("/readyz");
}
