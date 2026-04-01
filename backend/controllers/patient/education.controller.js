import EducationContent from "../../models/educationContent.model.js";
import Patient from "../../models/patient.model.js";
import QuestionnaireResult from "../../models/questionnaireResult.model.js";

const SUPPORTED_TOPICS = [
  "nutrition",
  "ncd-management",
  "exercises",
  "disability-prevention",
  "child-disability-detection",
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

export const submitQuestionnaire = async (req, res) => {
  try {
    const { topic, answers } = req.body;
    const patientId = req.user._id;

    if (!topic || !answers) {
      return res.status(400).json({
        message: "Topic and answers are required",
      });
    }

    // Calculate score based on answers
    // Scoring: Always=0, Often=1, Sometimes=2, Rarely/Never=3
    const scoreMap = {
      // Standard options
      Always: 0,
      Often: 1,
      Sometimes: 2,
      "Rarely/Never": 3,
      "Rarely or never": 3,
      Never: 3,
      Rarely: 3,
      // Question 2: Social interaction
      "Very well, enjoys playing with others": 0,
      "Moderately, sometimes plays alone": 1,
      "Prefers to play alone": 2,
      "Avoids interaction": 3,
      // Question 4: Routine changes
      "Adapts easily": 0,
      "Some difficulty but manages": 1,
      "Significant distress": 2,
      "Extreme difficulty": 3,
      // Question 5: Interest in activities
      "Yes, very interested": 0,
      "Moderately interested": 1,
      "Limited interest": 2,
      "No interest": 3,
    };

    let totalScore = 0;
    const answerMap = new Map();
    
    Object.keys(answers).forEach((key) => {
      const answer = answers[key];
      answerMap.set(key, answer);
      const score = scoreMap[answer] || 0;
      totalScore += score;
    });

    // Determine risk level
    let riskLevel;
    if (totalScore >= 0 && totalScore <= 4) {
      riskLevel = "Low Risk";
    } else if (totalScore >= 5 && totalScore <= 9) {
      riskLevel = "Moderate Risk";
    } else if (totalScore >= 10 && totalScore <= 15) {
      riskLevel = "High Risk";
    } else {
      riskLevel = "High Risk"; // Default for scores above 15
    }

    // Save questionnaire result
    const questionnaireResult = new QuestionnaireResult({
      patient: patientId,
      topic,
      answers: answerMap,
      score: totalScore,
      riskLevel,
    });

    await questionnaireResult.save();

    res.status(200).json({
      status: "success",
      message: "Questionnaire submitted successfully",
      data: {
        score: totalScore,
        riskLevel,
        resultId: questionnaireResult._id,
      },
    });
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
