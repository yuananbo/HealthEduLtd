/**
 * Design Pattern: Strategy (runtime policy selection)
 *
 * Why used in this module:
 * - Payment behavior differs by environment:
 *   - Production: real payment provider integration (Flutterwave)
 *   - Development/Demo: skip external provider to keep core booking flows stable
 *
 * What problem it solves:
 * - Prevents missing credentials/provider downtime from breaking appointment booking during dev/demo.
 *
 * How it improves extensibility/maintainability:
 * - New providers (or a stubbed/no-op provider) can be introduced as alternative strategies without
 *   rewriting appointment creation logic.
 */
import dotenv from "dotenv";
import FlutterwaveClient from "./flutterwaveClient.js";
import { getPublicBackendBaseUrl } from "./paymentEnv.js";
dotenv.config();

/**
 * Local/demo: skip Flutterwave and mark payment as OK (see processPayment).
 * Set USE_REAL_PAYMENT=true in .env to call Flutterwave while NODE_ENV is development
 * (you must configure FLW_PUBLIC_KEY and FLW_SECRET_KEY).
 */
export function isMockPayment() {
  if (process.env.USE_REAL_PAYMENT === "true") return false;
  return process.env.NODE_ENV !== "production";
}

/**
 * Post-visit consultation fee is mocked by default so it still works when
 * USE_REAL_PAYMENT=true (booking) or NODE_ENV=production without a working FLW flow.
 * Set MOCK_CONSULTATION_PAYMENT=false and configure FLW to charge consultation for real.
 */
export function isConsultationPaymentMocked() {
  if (process.env.MOCK_CONSULTATION_PAYMENT === "true") return true;

  if (process.env.MOCK_CONSULTATION_PAYMENT === "false") {
    const flwConfigured = Boolean(
      String(process.env.FLW_PUBLIC_KEY || "").trim() &&
        String(process.env.FLW_SECRET_KEY || "").trim()
    );
    if (!flwConfigured) return true;
    return isMockPayment();
  }

  return true;
}

// Initialize Flutterwave with fallback for missing keys
let flw = null;
try {
  if (process.env.FLW_PUBLIC_KEY && process.env.FLW_SECRET_KEY) {
    flw = new FlutterwaveClient(
      process.env.FLW_PUBLIC_KEY,
      process.env.FLW_SECRET_KEY
    );
  } else {
    console.warn("⚠️  Flutterwave API keys not configured. Payment features will be disabled.");
  }
} catch (error) {
  console.warn("⚠️  Failed to initialize Flutterwave:", error.message);
}
async function processPayment({
  phoneNumber,
  amount,
  currency,
  appointmentId,
  email,
  req,
}) {
  if (isMockPayment()) {
    return {
      status: "success",
      message: "Payment disabled in non-production environment",
      meta: { authorization: {} },
    };
  }

  const txRef = `appointment-${appointmentId}-${Date.now()}`;
  const backendBase = getPublicBackendBaseUrl(req);
  const redirect_url = `${backendBase}/api/v1/payment-success`;

  console.log("Redirect URL:", redirect_url);

  const payload = {
    tx_ref: txRef,
    amount,
    currency,
    redirect_url: redirect_url,
    phone_number: phoneNumber,
    email: email,
    order_id: appointmentId.toString(),
  };

  if (!flw) {
    throw new Error("Payment service not configured. Please set FLW_PUBLIC_KEY and FLW_SECRET_KEY in .env file");
  }

  try {
    const response = await flw.MobileMoney.rwanda(payload);
    console.log("Payment initiation response:", response);
    return response;
  } catch (error) {
    console.error("Payment initiation error:", error);
    throw new Error("Payment initiation failed");
  }
}

export default processPayment;
