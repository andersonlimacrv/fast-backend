// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSession,
  getAccessToken,
  getActiveOrgId,
  notifySessionExpired,
  onSessionExpired,
  setActiveOrgId,
  storeTokenPair,
} from "@/services/session";
import { SESSION_EVENT } from "@/lib/constants";

beforeEach(() => {
  localStorage.clear();
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
