/* Session persistence (browser storage + expiry broadcast). No HTTP here.
 *
 * Two modes (change auth-cookies-http-only):
 * - header mode (default, `VITE_AUTH_COOKIES !== "true"`): tokens in
 *   localStorage, Bearer header per request. Dev/test convenience.
 * - cookie mode: access token lives only in module memory, the refresh token
 *   never touches JS (HttpOnly cookie), CSRF synchronizer read from the
 *   readable `csrf_token` cookie. `active_org_id` stays in localStorage in
 *   both modes (context, not a credential).
 */

import { SESSION_EVENT, STORAGE_KEYS } from "@/lib/constants";

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

let cookieModeOverride: boolean | null = null;

/** Test seam (mirrors `configureTransport`): forces a mode regardless of env. */
export function configureSession(options: { cookieMode?: boolean | null }): void {
  cookieModeOverride = options.cookieMode ?? null;
}

/** True when session cookies carry the tokens instead of localStorage. */
export function isCookieMode(): boolean {
  if (cookieModeOverride !== null) return cookieModeOverride;
  return (import.meta.env.VITE_AUTH_COOKIES as string | undefined) === "true";
}

let memoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  if (isCookieMode()) return memoryAccessToken;
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  if (isCookieMode()) return null;
  return localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function getActiveOrgId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.activeOrgId);
}

export function setActiveOrgId(orgId: string | null): void {
  if (orgId) localStorage.setItem(STORAGE_KEYS.activeOrgId, orgId);
  else localStorage.removeItem(STORAGE_KEYS.activeOrgId);
}

export function storeTokenPair(accessToken: string, refreshToken: string): void {
  if (isCookieMode()) {
    // Cookies already carry both tokens (Set-Cookie on the response);
    // keep the access token in memory only, never persist the refresh.
    memoryAccessToken = accessToken || null;
    return;
  }
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  // Switch-organization responses carry `refresh_token: ""` (same family);
  // never clobber the stored refresh token with an empty one.
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
}

export function clearSession(): void {
  memoryAccessToken = null;
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.activeOrgId);
}

/** Read the CSRF synchronizer token (readable cookie, minted at login). */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === CSRF_COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function notifySessionExpired(): void {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function onSessionExpired(listener: () => void): () => void {
  window.addEventListener(SESSION_EVENT, listener);
  return () => window.removeEventListener(SESSION_EVENT, listener);
}
