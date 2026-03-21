import Therapist from "../../models/therapist.model.js";
import CommonService from "../../services/common.service.js";

export const getTherapistRatings = async (req, res) => {
  const therapistId = req.params.id;

  try {
    const therapist = await CommonService.getTherapistRatings(therapistId);
    const averageRating = CommonService.calculateAverageRating(therapist.ratings);

    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    res.json({ therapist, averageRating });
  } catch (error) {
    console.error("Error fetching therapist with ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addRating = async (req, res) => {
  const { rating, review } = req.body;
  const therapistId = req.params.id;
  const patientId = req.user._id;

  try {
    const newRating = await CommonService.addTherapistRating(
      patientId,
      therapistId,
      rating,
      review
    );
    res.status(201).json({ success: "success", rating: newRating });
  } catch (err) {
    console.log("Error adding rating:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// get ratings
export const getTherapistProfileWithRatings = async (req, res) => {
  const therapistId = req.user._id;

  try {
    const therapist = await CommonService.getTherapistRatings(therapistId);
    const averageRating = CommonService.calculateAverageRating(therapist.ratings);

    res.json({ therapist, averageRating });
  } catch (err) {
    console.error("Error fetching therapist profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};
