import mongoose from "mongoose";

const appointmentNotesSchema = new mongoose.Schema(
  {
    note: {
      type: String,
    },
  },
  { timestamps: true, _id: false }
);

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Therapist",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Accepted",
      "Declined",
      "Completed",
      "Cancelled",
      "Rescheduled",
      "Waiting for Payment",
    ],
    default: "Waiting for Payment",
  },
  appointmentType: {
    type: String,
    enum: ["in-person", "home-care"],
    default: "in-person",
  },
  service: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
    // maxlength: 1000,
  },
  notes: {
    type: String,
    default: "",
  },
  homeAddress: {
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    street: { type: String, default: "" },
  },
  sessionNotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionNote",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
