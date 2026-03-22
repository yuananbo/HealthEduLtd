import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 5000,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "RWF",
  },
  status: {
    type: String,
    enum: ["pending", "processing", "success", "failed"],
    default: "pending",
  },
  /** registration = booking fee at booking; consultation = fee after visit */
  purpose: {
    type: String,
    enum: ["registration", "consultation"],
    default: "registration",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
