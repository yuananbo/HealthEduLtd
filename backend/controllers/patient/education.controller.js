import EducationContent from "../../models/educationContent.model.js";

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
