import mongoose from "mongoose";

const sessionNotesSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SessionNote = mongoose.model("SessionNote", sessionNotesSchema);

export default SessionNote;
