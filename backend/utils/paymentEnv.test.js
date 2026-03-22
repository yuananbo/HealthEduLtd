import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getFrontendBaseUrl,
  getFrontendPaymentSuccessUrl,
  getPublicBackendBaseUrl,
} from "./paymentEnv.js";

describe("paymentEnv", () => {
  beforeEach(() => {
    vi.stubEnv("FRONTEND_URL", undefined);
    vi.stubEnv("PUBLIC_BACKEND_URL", undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getFrontendBaseUrl", () => {
    it("defaults to Vite dev URL", () => {
      expect(getFrontendBaseUrl()).toBe("http://localhost:5173");
    });

    it("strips trailing slash from FRONTEND_URL", () => {
      vi.stubEnv("FRONTEND_URL", "http://localhost:3000/");
      expect(getFrontendBaseUrl()).toBe("http://localhost:3000");
    });
  });

  describe("getFrontendPaymentSuccessUrl", () => {
    it("appends patient success path", () => {
      expect(getFrontendPaymentSuccessUrl()).toBe(
        "http://localhost:5173/patient/payment-success-page"
      );
    });
  });

  describe("getPublicBackendBaseUrl", () => {
    it("uses PUBLIC_BACKEND_URL when set", () => {
      vi.stubEnv("PUBLIC_BACKEND_URL", "https://abc.ngrok-free.app/");
      const req = {
        protocol: "http",
        get: () => "localhost:8000",
      };
      expect(getPublicBackendBaseUrl(req)).toBe("https://abc.ngrok-free.app");
    });

    it("falls back to request host when env unset", () => {
      const req = {
        protocol: "https",
        get: (h) => (h === "host" ? "api.example.com" : ""),
      };
      expect(getPublicBackendBaseUrl(req)).toBe("https://api.example.com");
    });
  });
});
