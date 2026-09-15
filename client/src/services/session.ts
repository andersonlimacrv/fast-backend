/* Session persistence (browser storage + expiry broadcast). No HTTP here. */

import { SESSION_EVENT, STORAGE_KEYS } from "@/lib/constants";

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function getRefreshToken(): string | null {
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
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  // Switch-organization responses carry `refresh_token: ""` (same family);
  // never clobber the stored refresh token with an empty one.
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.activeOrgId);
}

export function notifySessionExpired(): void {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function onSessionExpired(listener: () => void): () => void {
  window.addEventListener(SESSION_EVENT, listener);
  return () => window.removeEventListener(SESSION_EVENT, listener);
}
