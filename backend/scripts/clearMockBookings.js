import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const clearMockBookings = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DBCONNECTION);
    console.log("Connected.\n");

    const mockAppointments = await Appointment.find({
      notes: { $regex: /^MOCK_BOOKING:/ },
    }).select("_id");

    const appointmentIds = mockAppointments.map((item) => item._id);

    const paymentResult = await Payment.deleteMany({
      appointment: { $in: appointmentIds },
    });
    const appointmentResult = await Appointment.deleteMany({
      _id: { $in: appointmentIds },
    });

    console.log(`Deleted ${appointmentResult.deletedCount} mock appointments.`);
    console.log(`Deleted ${paymentResult.deletedCount} mock payments.`);
    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

clearMockBookings();
