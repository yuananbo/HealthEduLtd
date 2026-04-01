import Therapist from "../models/therapist.model.js";

// Get therapist details by ID
export const getTherapistDetails = async (req, res) => {
  try {
    const therapistId = req.params.id;
    const therapist = await Therapist.findById(therapistId).select("-password");
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    res.json({ success: "success", data: therapist });
  } catch (error) {
    console.error("Error fetching therapist details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
