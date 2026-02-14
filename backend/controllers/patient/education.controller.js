import EducationContent from "../../models/educationContent.model.js";
import Patient from "../../models/patient.model.js";

const SUPPORTED_TOPICS = [
  "nutrition",
  "ncd-management",
  "exercises",
  "disability-prevention",
];

export const getEducationContentByTopic = async (req, res) => {
  try {
    const { topic } = req.query;

    if (!topic || !SUPPORTED_TOPICS.includes(topic)) {
      return res.status(400).json({
        message: "Invalid topic. Use one of: " + SUPPORTED_TOPICS.join(", "),
      });
    }

    const content = await EducationContent.find({
      topic,
      isPublished: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      status: "success",
      count: content.length,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching education content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const saveEducationContent = async (req, res) => {
  try {
    const { contentId } = req.body;
    const patientId = req.user._id;

    if (!contentId) {
      return res.status(400).json({ message: "Content ID is required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const isSaved = patient.savedEducationContents.includes(contentId);
    
    if (isSaved) {
      // Remove from saved
      patient.savedEducationContents = patient.savedEducationContents.filter(
        (id) => id !== contentId
      );
    } else {
      // Add to saved
      patient.savedEducationContents.push(contentId);
    }

    await patient.save();

    res.status(200).json({
      status: "success",
      message: isSaved ? "Content removed from saved" : "Content saved",
      savedContents: patient.savedEducationContents,
    });
  } catch (error) {
    console.error("Error saving education content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSavedEducationContent = async (req, res) => {
  try {
    const patientId = req.user._id;

    const patient = await Patient.findById(patientId).select(
      "savedEducationContents"
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (patient.savedEducationContents.length === 0) {
      return res.status(200).json({
        status: "success",
        count: 0,
        data: [],
      });
    }

    // Fetch all saved content
    const content = await EducationContent.find({
      _id: { $in: patient.savedEducationContents },
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      status: "success",
      count: content.length,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching saved education content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
