import Flutterwave from "flutterwave-node-v3";
import dotenv from "dotenv";
import Payment from "../models/payment.model.js";
import Appointment from "../models/appointment.model.js";
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
    console.warn("⚠️  Flutterwave API keys not configured in webhook controller.");
  }
} catch (error) {
  console.warn("⚠️  Failed to initialize Flutterwave in webhook:", error.message);
}

export const handleFlutterwaveWebhook = async (req, res) => {
  console.log("Received webhook call:", req.body);

  if (!flw) {
    return res.status(503).json({ error: "Payment service not configured" });
  }

  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers["verif-hash"];

  // Verify signature
  if (!signature || signature !== secretHash) {
    return res.status(401).end();
  }

  const { event, data } = req.body;

  if (event === "charge.completed" && data.status === "successful") {
    const { tx_ref, amount, currency, id } = data;
    const appointmentId = tx_ref.split("-")[1];

    try {
      // Verify transaction
      const response = await flw.Transaction.verify({ id });
      if (
        response.data.status === "successful" &&
        response.data.amount >= amount &&
        response.data.currency === currency &&
        response.data.tx_ref === tx_ref
      ) {
        const payment = await Payment.findOne({ appointment: appointmentId });
        if (payment) {
          payment.status = "success";
          payment.amount = amount;
          payment.currency = currency;
          await payment.save();

          const appointment = await Appointment.findById(appointmentId);
          if (appointment) {
            appointment.status = "Pending";
            await appointment.save();

            // Send confirmation emails if needed

            return res
              .status(200)
              .json({ message: "Payment confirmed and appointment updated" });
          } else {
            return res.status(404).json({ error: "Appointment not found" });
          }
        } else {
          return res.status(404).json({ error: "Payment record not found" });
        }
      } else {
        return res
          .status(400)
          .json({ error: "Transaction verification failed" });
      }
    } catch (error) {
      console.error("Error in webhook handling:", error);
      return res
        .status(500)
        .json({ error: "An error occurred", details: error.message });
    }
  }

  res.status(400).json({ error: "Invalid event type or payment status" });
};

export const handleFlutterwaveRedirect = async (req, res) => {
  const { resp } = req.query;

  console.log("Redirect query parameters:", req.query);

  if (!flw) {
    return res.status(503).json({ error: "Payment service not configured" });
  }

  try {
    const response = JSON.parse(decodeURIComponent(resp));

    console.log("Parsed response:", response);

    if (
      response.status === "success" &&
      response.data.status === "successful"
    ) {
      const { id, amount, currency, txRef } = response.data;

      console.log("Transaction details:", { id, amount, currency, txRef });

      // Verify transaction
      const flwResponse = await flw.Transaction.verify({ id });

      console.log("Verification response:", flwResponse);

      // Ensure tx_ref is correctly set and compared
      const verifiedTxRef = flwResponse.data.tx_ref;
      console.log("Verified tx_ref:", verifiedTxRef);

      if (
        flwResponse.data.status === "successful" &&
        flwResponse.data.amount === amount &&
        flwResponse.data.currency === currency &&
        verifiedTxRef === txRef
      ) {
        const appointmentId = txRef.split("-")[1];
        console.log(`Appointment ID: ${appointmentId}`);
        const payment = await Payment.findOne({ appointment: appointmentId });
        if (payment) {
          payment.status = "success";
          payment.amount = amount;
          payment.currency = currency;
          await payment.save();

          const appointment = await Appointment.findById(appointmentId);
          if (appointment) {
            appointment.status = "Pending";
            await appointment.save();

            // Redirect to a success page
            return res.redirect("/patient/payment-success-page"); // Adjust this path as needed
          } else {
            return res.status(404).json({ error: "Appointment not found" });
          }
        } else {
          return res.status(404).json({ error: "Payment record not found" });
        }
      } else {
        console.log("Verification failed", {
          responseStatus: flwResponse.data.status,
          responseAmount: flwResponse.data.amount,
          responseCurrency: flwResponse.data.currency,
          responseTxRef: verifiedTxRef,
          expectedTxRef: txRef,
        });
        return res
          .status(400)
          .json({ error: "Transaction verification failed" });
      }
    } else {
      return res.status(400).json({ error: "Invalid payment status" });
    }
  } catch (error) {
    console.error("Redirect handling error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
};
