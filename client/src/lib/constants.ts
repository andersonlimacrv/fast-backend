/* Shared constants: single place for magic strings (routes, storage, roles). */

export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

export const STORAGE_KEYS = {
  accessToken: "fb.access_token",
  refreshToken: "fb.refresh_token",
  activeOrgId: "fb.active_org_id",
} as const;

export const SESSION_EVENT = "fb:session-expired";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  health: "/health",
  orgs: "/orgs",
  members: (orgId: string) => `/orgs/${orgId}/members`,
  projects: "/projects",
  grants: "/grants",
  audit: "/audit",
  account: "/account",
} as const;

export const ROLES = ["owner", "admin", "member"] as const;

export const AUDIT_LIMIT = 100;
