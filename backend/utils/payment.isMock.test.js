import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";

/**
 * Stub Flutterwave keys before loading payment.js so the SDK init path does not console.warn.
 */
describe("isMockPayment", () => {
  let isMockPayment;
  let isConsultationPaymentMocked;

  beforeAll(async () => {
    vi.stubEnv("FLW_PUBLIC_KEY", "FLWPUBK_TEST-fake-for-vitest");
    vi.stubEnv("FLW_SECRET_KEY", "FLWSECK_TEST-fake-for-vitest");
    ({ isMockPayment, isConsultationPaymentMocked } = await import("./payment.js"));
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

  it("isConsultationPaymentMocked is true in production when MOCK_CONSULTATION_PAYMENT is true", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_REAL_PAYMENT", "false");
    vi.stubEnv("MOCK_CONSULTATION_PAYMENT", "true");
    expect(isConsultationPaymentMocked()).toBe(true);
  });

  it("isConsultationPaymentMocked is true when MOCK is unset even in production with FLW keys", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_REAL_PAYMENT", "false");
    vi.stubEnv("FLW_PUBLIC_KEY", "FLWPUBK_TEST-fake-for-vitest");
    vi.stubEnv("FLW_SECRET_KEY", "FLWSECK_TEST-fake-for-vitest");
    expect(isConsultationPaymentMocked()).toBe(true);
  });

  it("isConsultationPaymentMocked follows isMockPayment when MOCK is false and FLW keys exist", () => {
    vi.stubEnv("MOCK_CONSULTATION_PAYMENT", "false");
    vi.stubEnv("FLW_PUBLIC_KEY", "FLWPUBK_TEST-fake-for-vitest");
    vi.stubEnv("FLW_SECRET_KEY", "FLWSECK_TEST-fake-for-vitest");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_REAL_PAYMENT", "false");
    expect(isConsultationPaymentMocked()).toBe(false);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("USE_REAL_PAYMENT", "false");
    expect(isConsultationPaymentMocked()).toBe(true);
  });

  it("isConsultationPaymentMocked is true in production when Flutterwave keys are missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_REAL_PAYMENT", "false");
    vi.stubEnv("FLW_PUBLIC_KEY", "");
    vi.stubEnv("FLW_SECRET_KEY", "");
    expect(isConsultationPaymentMocked()).toBe(true);
  });

  it("isConsultationPaymentMocked stays true when MOCK is false but FLW keys are missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MOCK_CONSULTATION_PAYMENT", "false");
    vi.stubEnv("FLW_PUBLIC_KEY", "");
    vi.stubEnv("FLW_SECRET_KEY", "");
    expect(isConsultationPaymentMocked()).toBe(true);
  });
});
