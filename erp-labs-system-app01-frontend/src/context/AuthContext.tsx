import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, AuthKind, setToken, getToken } from "../lib/apiClient";

export type Permission = { action: string; module: string };
export type Role = { id: number; code?: string; nom_role?: string };

export type AuthUser = {
  id: number;
  username?: string;
  email?: string;
  company_id?: number | null;
  must_change_password?: boolean;
  [k: string]: any;
};

export type AuthState = {
  kind: AuthKind | null;
  token: string | null;
  user: AuthUser | null;
  company: any | null;
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
};

const AuthContext = createContext<{
  state: AuthState;
  loginCompany: (input: { company_code: number | string; login: string; password: string }) => Promise<void>;
  loginSuperAdmin: (input: { login: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (action: string, module: string) => boolean;
  refreshMe: () => Promise<void>;
} | null>(null);

const initialState: AuthState = {
  kind: null,
  token: null,
  user: null,
  company: null,
  roles: [],
  permissions: [],
  loading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  const bootstrap = useCallback(async () => {
    const companyToken = getToken("company");
    const superToken = getToken("superadmin");
    try {
      if (companyToken) {
        const me = await apiFetch<any>("/v1/auth/me", { method: "GET" }, "company");
        setState((s) => ({ ...s, kind: "company", token: companyToken, user: me.data.user, company: me.data.company, roles: me.data.roles ?? [], permissions: me.data.permissions ?? [], loading: false }));
        return;
      }
      if (superToken) {
        const me = await apiFetch<any>("/v1/superadmin/me", { method: "GET" }, "superadmin");
        setState((s) => ({ ...s, kind: "superadmin", token: superToken, user: me.data, company: null, roles: [], permissions: [], loading: false }));
        return;
      }
    } catch (e) {
      // Token invalide
    }
    setState((s) => ({ ...s, loading: false }));
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const loginCompany = useCallback(async (input: { company_code: number | string; login: string; password: string }) => {
    const res = await apiFetch<any>("/v1/auth/login", { method: "POST", body: JSON.stringify(input) }, "company");
    const token: string = res.data.token;
    setToken("company", token);
    const me = await apiFetch<any>("/v1/auth/me", { method: "GET" }, "company");
    setState({ kind: "company", token, user: me.data.user, company: me.data.company, roles: me.data.roles ?? [], permissions: me.data.permissions ?? [], loading: false });
  }, []);

  const loginSuperAdmin = useCallback(async (input: { login: string; password: string }) => {
    const res = await apiFetch<any>("/v1/superadmin/login", { method: "POST", body: JSON.stringify(input) }, "superadmin");
    const token: string = res.data.token ?? res.data?.token ?? res.token ?? res.data; // couverture large
    setToken("superadmin", token);
    const me = await apiFetch<any>("/v1/superadmin/me", { method: "GET" }, "superadmin");
    setState({ kind: "superadmin", token, user: me.data ?? me, company: null, roles: [], permissions: [], loading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.kind === "company") {
        await apiFetch("/v1/auth/logout", { method: "POST" }, "company");
      } else if (state.kind === "superadmin") {
        await apiFetch("/v1/superadmin/logout", { method: "POST" }, "superadmin");
      }
    } catch {}
    setToken("company", null);
    setToken("superadmin", null);
    setState({ ...initialState, loading: false });
  }, [state.kind]);

  const hasPermission = useCallback(
    (action: string, module: string) => {
      if (state.kind === "superadmin") return true;
      const a = action.toUpperCase();
      const m = module.toUpperCase();
      return state.permissions.some((p) => p.action?.toUpperCase() === a && p.module?.toUpperCase() === m);
    },
    [state.permissions, state.kind]
  );

  const refreshMe = useCallback(async () => {
    if (state.kind === "company" && state.token) {
      const me = await apiFetch<any>("/v1/auth/me", { method: "GET" }, "company");
      setState((s) => ({ ...s, user: me.data.user, company: me.data.company, roles: me.data.roles ?? [], permissions: me.data.permissions ?? [] }));
      return;
    }
    if (state.kind === "superadmin" && state.token) {
      const me = await apiFetch<any>("/v1/superadmin/me", { method: "GET" }, "superadmin");
      setState((s) => ({ ...s, user: me.data ?? me, company: null, roles: [], permissions: [] }));
      return;
    }
  }, [state.kind, state.token]);

  const value = useMemo(() => ({ state, loginCompany, loginSuperAdmin, logout, hasPermission, refreshMe }), [state, loginCompany, loginSuperAdmin, logout, hasPermission, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
