import mongoose from "mongoose";

const questionnaireResultSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      enum: ["child-disability-detection"],
    },
    answers: {
      type: Map,
      of: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low Risk", "Moderate Risk", "High Risk"],
      required: true,
    },
  },
  { timestamps: true }
);

const QuestionnaireResult = mongoose.model(
  "QuestionnaireResult",
  questionnaireResultSchema
);

export default QuestionnaireResult;
