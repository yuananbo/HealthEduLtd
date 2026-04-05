const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

const deriveAzureBackendUrl = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const { origin, protocol, hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:8000`;
  }

  // Azure frontend is deployed as c01mobirehab-<stamp>.azurewebsites.net
  // while the paired backend uses the same stamp with the Mobirehab prefix.
  if (hostname.endsWith(".azurewebsites.net") && hostname.startsWith("c01mobirehab-")) {
    return `${protocol}//${hostname.replace(/^c01mobirehab-/i, "mobirehab-")}`;
  }

  if (hostname.endsWith(".azurewebsites.net")) {
    return origin;
  }

  return null;
};

export const getApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (envBaseUrl) {
    return stripTrailingSlash(envBaseUrl);
  }

  const derivedUrl = deriveAzureBackendUrl();
  if (derivedUrl) {
    return stripTrailingSlash(derivedUrl);
  }

  return "http://localhost:8000";
};
