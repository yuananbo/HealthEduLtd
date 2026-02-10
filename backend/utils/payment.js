import Flutterwave from "flutterwave-node-v3";
import dotenv from "dotenv";
dotenv.config();

// Initialize Flutterwave with fallback for missing keys
let flw = null;
try {
  if (process.env.FLW_PUBLIC_KEY && process.env.FLW_SECRET_KEY) {
    flw = new Flutterwave(
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
  const protocol = req.protocol;
  const host = req.get("host");

  const txRef = `appointment-${appointmentId}-${Date.now()}`;
  const redirect_url = `${protocol}://${host}/api/v1/payment-success`;

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
