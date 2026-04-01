import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const dateAvailabilitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    times: [timeSlotSchema],
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Therapist",
    required: true,
  },
  availabilities: {
    type: [dateAvailabilitySchema],
    validate: [arrayLimit, "{PATH} exceeds the limit of 7"],
  },
  availabilityName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

function arrayLimit(val) {
  return val.length <= 7;
}

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
