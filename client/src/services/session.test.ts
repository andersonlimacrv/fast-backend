// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSession,
  configureSession,
  getAccessToken,
  getActiveOrgId,
  getCsrfToken,
  getRefreshToken,
  isCookieMode,
  notifySessionExpired,
  onSessionExpired,
  setActiveOrgId,
  storeTokenPair,
} from "@/services/session";
import { SESSION_EVENT } from "@/lib/constants";

beforeEach(() => {
  localStorage.clear();
  configureSession({ cookieMode: null });
});

describe("session service", () => {
  it("round-trips tokens and the active org", () => {
    storeTokenPair("access", "refresh");
    setActiveOrgId("org-1");
    expect(getAccessToken()).toBe("access");
    expect(getActiveOrgId()).toBe("org-1");
    clearSession();
    expect(getAccessToken()).toBeNull();
    expect(getActiveOrgId()).toBeNull();
  });

  it("never clobbers a stored refresh token with an empty one", () => {
    storeTokenPair("a1", "r1");
    storeTokenPair("a2", "");
    expect(getAccessToken()).toBe("a2");
    expect(localStorage.getItem("fb.refresh_token")).toBe("r1");
  });

  it("broadcasts and listens for session expiry", () => {
    const listener = vi.fn();
    const off = onSessionExpired(listener);
    notifySessionExpired();
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    notifySessionExpired();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("uses the documented event name", () => {
    expect(SESSION_EVENT).toBe("fb:session-expired");
  });
});

describe("session service in cookie mode", () => {
  beforeEach(() => {
    configureSession({ cookieMode: true });
  });

  it("is off by default (header mode keeps localStorage)", () => {
    configureSession({ cookieMode: null });
    expect(isCookieMode()).toBe(false);
  });

  it("keeps tokens out of localStorage, access in memory only", () => {
    storeTokenPair("access", "refresh");
    expect(getAccessToken()).toBe("access");
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem("fb.access_token")).toBeNull();
    expect(localStorage.getItem("fb.refresh_token")).toBeNull();
    setActiveOrgId("org-1");
    expect(getActiveOrgId()).toBe("org-1");
    clearSession();
    expect(getAccessToken()).toBeNull();
    expect(getActiveOrgId()).toBeNull();
  });

  it("reads the CSRF synchronizer from the readable cookie", () => {
    document.cookie = "csrf_token=abc123";
    expect(getCsrfToken()).toBe("abc123");
    document.cookie = "csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    expect(getCsrfToken()).toBeNull();
  });
});
