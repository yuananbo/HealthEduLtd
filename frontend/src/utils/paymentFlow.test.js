import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getPaymentRedirectUrl,
  followPaymentResponse,
} from "./paymentFlow.js";

describe("paymentFlow", () => {
  describe("getPaymentRedirectUrl", () => {
    it("returns null for missing response", () => {
      expect(getPaymentRedirectUrl(null)).toBeNull();
      expect(getPaymentRedirectUrl(undefined)).toBeNull();
    });

    it("reads redirect from meta.authorization.redirect", () => {
      const pr = {
        meta: { authorization: { redirect: "https://pay.example/r" } },
      };
      expect(getPaymentRedirectUrl(pr)).toBe("https://pay.example/r");
    });

    it("reads redirect from data.meta when top-level meta absent", () => {
      const pr = {
        data: {
          meta: { authorization: { redirect: "https://flutterwave.example/x" } },
        },
      };
      expect(getPaymentRedirectUrl(pr)).toBe("https://flutterwave.example/x");
    });

    it("prefers top-level meta over nested data", () => {
      const pr = {
        meta: { authorization: { redirect: "https://a" } },
        data: { meta: { authorization: { redirect: "https://b" } } },
      };
      expect(getPaymentRedirectUrl(pr)).toBe("https://a");
    });
  });

  describe("followPaymentResponse", () => {
    beforeEach(() => {
      delete window.location;
      window.location = { href: "" };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("assigns window.location when redirect exists", () => {
      const pr = {
        meta: { authorization: { redirect: "https://checkout.example" } },
      };
      const navigate = vi.fn();
      const ok = followPaymentResponse(pr, navigate);
      expect(ok).toBe(true);
      expect(window.location.href).toBe("https://checkout.example");
      expect(navigate).not.toHaveBeenCalled();
    });

    it("calls navigate when no redirect URL", () => {
      const navigate = vi.fn();
      const ok = followPaymentResponse({ meta: { authorization: {} } }, navigate);
      expect(ok).toBe(false);
      expect(navigate).toHaveBeenCalledWith("/patient/payment-success-page");
    });
  });
});
