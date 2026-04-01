import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";

/**
 * Stub Flutterwave keys before loading payment.js so the SDK init path does not console.warn.
 */
describe("isMockPayment", () => {
  let isMockPayment;

  beforeAll(async () => {
    vi.stubEnv("FLW_PUBLIC_KEY", "FLWPUBK_TEST-fake-for-vitest");
    vi.stubEnv("FLW_SECRET_KEY", "FLWSECK_TEST-fake-for-vitest");
    ({ isMockPayment } = await import("./payment.js"));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("FLW_PUBLIC_KEY", "FLWPUBK_TEST-fake-for-vitest");
    vi.stubEnv("FLW_SECRET_KEY", "FLWSECK_TEST-fake-for-vitest");
  });

  it("returns true when not production and USE_REAL_PAYMENT is not true", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("USE_REAL_PAYMENT", "false");
    expect(isMockPayment()).toBe(true);
  });

  it("returns false when USE_REAL_PAYMENT is true", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("USE_REAL_PAYMENT", "true");
    expect(isMockPayment()).toBe(false);
  });

  it("returns false in production regardless of USE_REAL_PAYMENT", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_REAL_PAYMENT", "false");
    expect(isMockPayment()).toBe(false);
  });
});
