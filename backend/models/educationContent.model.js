import mongoose from "mongoose";

const educationContentSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      enum: [
        "ncd-management",
        "exercises",
        "nutrition",
        "disability-prevention",
      ],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["article", "video"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    sourceName: {
      type: String,
      required: true,
      trim: true,
    },
    sourceUrl: {
      type: String,
      required: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const EducationContent = mongoose.model(
  "EducationContent",
  educationContentSchema
);

export default EducationContent;
