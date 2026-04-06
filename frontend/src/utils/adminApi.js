const defaultOrigin =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:8000";
const apiBaseOrigin =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || defaultOrigin;

export const adminBaseURL = `${apiBaseOrigin}/api/admin`;
