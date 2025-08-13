export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  SUPERADMIN_API_BASE_URL: import.meta.env.VITE_SUPERADMIN_API_BASE_URL || "http://localhost:8000/api",
} as const;
