import { ENV } from "../config/env";

export type AuthKind = "company" | "superadmin";

const TOKEN_KEYS = {
  company: "company_token",
  superadmin: "superadmin_token",
} as const;

export function getToken(kind: AuthKind): string | null {
  return localStorage.getItem(TOKEN_KEYS[kind]);
}

export function setToken(kind: AuthKind, token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEYS[kind], token);
  } else {
    localStorage.removeItem(TOKEN_KEYS[kind]);
  }
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}, kind: AuthKind = "company"): Promise<T> {
  const base = kind === "superadmin" ? ENV.SUPERADMIN_API_BASE_URL : ENV.API_BASE_URL;
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");

  const token = getToken(kind);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof payload === "object" && payload && "message" in payload ? (payload as any).message : res.statusText;
    const error = new Error(message || "Request failed");
    (error as any).status = res.status;
    (error as any).payload = payload;
    throw error;
  }

  return payload as T;
}
