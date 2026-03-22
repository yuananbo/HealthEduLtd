/**
 * Env helpers for Flutterwave redirects when API and SPA run on different origins
 * (typical local dev: API :8000, Vite :5173) or API is behind ngrok.
 */

export function getFrontendBaseUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  );
}

/** Browser URL after payment redirect handler verifies the charge. */
export function getFrontendPaymentSuccessUrl() {
  return `${getFrontendBaseUrl()}/patient/payment-success-page`;
}

/**
 * Base URL Flutterwave can reach for redirect + webhook (must be HTTPS public URL when testing real payments locally — use ngrok).
 * If unset, uses the incoming request (only works if API is already public).
 */
export function getPublicBackendBaseUrl(req) {
  const fromEnv = process.env.PUBLIC_BACKEND_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const proto = req.protocol;
  const host = req.get("host");
  return `${proto}://${host}`;
}
