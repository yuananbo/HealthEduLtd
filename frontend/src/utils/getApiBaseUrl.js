const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

/**
 * API base origin (no path).
 *
 * - Local dev: browser on localhost → backend at :8000.
 * - Deployed (build + Azure/custom domain): same origin only — `/api` is proxied by nginx.
 *   Never falls back to localhost:8000 after deploy.
 */
export const getApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envBaseUrl) {
    return stripTrailingSlash(envBaseUrl);
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:8000`;
    }

    return stripTrailingSlash(`${protocol}//${hostname}`);
  }

  // No window (tests/SSR): production build must not assume localhost
  if (import.meta.env.PROD) {
    return "";
  }

  return "http://localhost:8000";
};
