import mongoose from "mongoose";

const therapistRatingSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

therapistRatingSchema.index({ therapist: 1, appointment: 1 });
therapistRatingSchema.index({ patient: 1, appointment: 1 });

const TherapistRating = mongoose.model("TherapistRating", therapistRatingSchema);

export default TherapistRating;
