const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

const deriveAzureBackendUrl = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const { protocol, hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:8000`;
  }

  // Same Azure Web App serves API + static build — use this origin (HTTPS).
  // Do not return ""; it is falsy and would fall through to http://localhost:8000
  // (mixed content: Safari/Chrome block HTTPS pages from calling http://localhost).
  if (hostname.endsWith(".azurewebsites.net")) {
    return `${protocol}//${hostname}`;
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
