import EducationContent from "../../models/educationContent.model.js";

export const getNutritionEducationContent = async (req, res) => {
  try {
    const content = await EducationContent.find({
      topic: "nutrition",
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
    console.error("Error fetching nutrition education content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
