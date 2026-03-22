import mongoose from "mongoose";

const dailyCheckInSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    // Date-only key in YYYY-MM-DD (stored as string to avoid timezone drift)
    date: {
      type: String,
      required: true,
      index: true,
    },
    painLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    mood: {
      type: String,
      enum: ["Very bad", "Bad", "Okay", "Good", "Great"],
      default: "Okay",
    },
    exerciseCompleted: {
      type: Boolean,
      default: false,
    },
    adlIndependence: {
      type: String,
      enum: ["Independent", "Needs some help", "Needs full assistance"],
      default: "Independent",
    },
    weightKg: {
      type: Number,
      min: 0,
      default: null,
    },
    bloodPressure: {
      systolic: { type: Number, min: 0, default: null },
      diastolic: { type: Number, min: 0, default: null },
    },
    heartRateBpm: {
      type: Number,
      min: 0,
      default: null,
    },
    bloodSugar: {
      value: { type: Number, min: 0, default: null },
      unit: {
        type: String,
        enum: ["mmol/L", "mg/dL"],
        default: "mmol/L",
      },
    },
    notes: {
      type: String,
      default: "",
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

dailyCheckInSchema.index({ patient: 1, date: 1 }, { unique: true });

const DailyCheckIn = mongoose.model("DailyCheckIn", dailyCheckInSchema);

export default DailyCheckIn;

