/**
 * Verifies backend/.env has what you need for local real Flutterwave testing.
 * Run from repo root: npm run payment:check
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env");

if (!fs.existsSync(envPath)) {
  console.error("Missing backend/.env — run: npm run env:init-payment");
  process.exit(1);
}

dotenv.config({ path: envPath });

const issues = [];

if (process.env.USE_REAL_PAYMENT !== "true") {
  issues.push("USE_REAL_PAYMENT should be \"true\" for real gateway (not mock).");
}
if (!process.env.FLW_PUBLIC_KEY?.trim()) {
  issues.push("FLW_PUBLIC_KEY is empty.");
}
if (!process.env.FLW_SECRET_KEY?.trim()) {
  issues.push("FLW_SECRET_KEY is empty.");
}
if (!process.env.FLW_SECRET_HASH?.trim()) {
  issues.push("FLW_SECRET_HASH is empty (must match Flutterwave webhook secret hash).");
}

const pub = process.env.PUBLIC_BACKEND_URL?.trim().replace(/\/$/, "");
if (
  !pub ||
  pub.includes("REPLACE") ||
  pub.includes("YOUR-ID")
) {
  issues.push(
    "PUBLIC_BACKEND_URL must be your real ngrok https URL (no trailing slash), e.g. https://abc.ngrok-free.app"
  );
}

if (issues.length) {
  console.log("Payment env check: needs attention\n");
  issues.forEach((m) => console.log("  •", m));
  console.log("\nSee docs/LOCAL_FLUTTERWAVE_PAYMENT.md");
  process.exit(1);
}

const webhook = `${pub}/api/v1/payment/webhook`;
const payReturn = `${pub}/api/v1/payment-success`;
const frontendOk =
  process.env.FRONTEND_URL?.trim() || "http://localhost:5173";

console.log("Payment env check: OK\n");
console.log("Paste this into Flutterwave → Webhooks → URL:\n");
console.log(" ", webhook);
console.log("\nPayment return URL (Flutterwave redirect) is built as:\n");
console.log(" ", payReturn);
console.log("\nAfter success, users go to:\n");
console.log(" ", `${frontendOk.replace(/\/$/, "")}/patient/payment-success-page`);
console.log(
  "\nTRUST_PROXY:",
  process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true"
    ? "on (good for ngrok)"
    : "off (set TRUST_PROXY=1 behind ngrok)"
);
