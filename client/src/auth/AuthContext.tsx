import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  clearSession,
  fetchMe,
  getAccessToken,
  getActiveOrgId,
  listOrgs,
  login as apiLogin,
  logout as apiLogout,
  logoutEverywhere as apiLogoutEverywhere,
  register as apiRegister,
  setActiveOrgId,
  switchOrganization,
} from "@/lib/api";
import type { OrganizationRead, UserRead } from "@/lib/api";

interface AuthState {
  user: UserRead | null;
  orgs: OrganizationRead[];
  activeOrgId: string | null;
  ready: boolean;
  sessionNotice: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  dismissNotice: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null);
  const [orgs, setOrgs] = useState<OrganizationRead[]>([]);
  const [activeOrgId, setActiveOrg] = useState<string | null>(() => getActiveOrgId());
  const [ready, setReady] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setOrgs([]);
      setReady(true);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
      const owned = await listOrgs();
      setOrgs(owned);
      const current = getActiveOrgId();
      if (!current && owned.length > 0) {
        setActiveOrgId(owned[0].id);
        setActiveOrg(owned[0].id);
      } else {
        setActiveOrg(current);
      }
    } catch {
      clearSession();
      setUser(null);
      setOrgs([]);
      setActiveOrg(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void loadSession();
    const onExpired = () => {
      setUser(null);
      setOrgs([]);
      setActiveOrg(null);
      setSessionNotice("Session invalidated (refresh reuse or expiry). Please log in again.");
    };
    window.addEventListener("fb:session-expired", onExpired);
    return () => window.removeEventListener("fb:session-expired", onExpired);
  }, [loadSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      await apiLogin(email, password);
      setSessionNotice(null);
      await loadSession();
    },
    [loadSession],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      await apiRegister(email, password);
      await apiLogin(email, password);
      setSessionNotice(null);
      await loadSession();
    },
    [loadSession],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setOrgs([]);
    setActiveOrg(null);
  }, []);

  const logoutEverywhere = useCallback(async () => {
    await apiLogoutEverywhere();
    setUser(null);
    setOrgs([]);
    setActiveOrg(null);
  }, []);

  const switchOrg = useCallback(async (orgId: string) => {
    await switchOrganization(orgId);
    setActiveOrg(orgId);
  }, []);

  const dismissNotice = useCallback(() => setSessionNotice(null), []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      orgs,
      activeOrgId,
      ready,
      sessionNotice,
      login,
      register,
      logout,
      logoutEverywhere,
      switchOrg,
      refreshUser: loadSession,
      dismissNotice,
    }),
    [user, orgs, activeOrgId, ready, sessionNotice, login, register, logout, logoutEverywhere, switchOrg, loadSession, dismissNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
