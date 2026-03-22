import Therapist from "../models/therapist.model.js";
import TherapistRating from "../models/therapistRating.model.js";

class CommonService {
  static async addTherapistRating(patientId, therapistId, rating, review) {
    try {
      const newRating = new TherapistRating({
        patient: patientId,
        therapist: therapistId,
        rating,
        review,
      });

      await newRating.save();

      await Therapist.findByIdAndUpdate(
        therapistId,
        { $push: { ratings: newRating._id } },
        { new: true } // To return the updated document
      );

      return newRating;
    } catch (error) {
      console.log("Error adding rating", error);
      throw new Error(error.message);
    }
  }

  static async getTherapistRatings(therapistId) {
    try {
      const therapist = await Therapist.findById(therapistId).populate({
        path: "ratings",
        populate: {
          path: "patient",
          select: "firstName lastName patientId",
        },
      });
      if (!therapist) {
        throw new Error("Therapist not found");
      }
      return therapist;
    } catch (error) {
      console.error("Error fetching therapist profile:", error);
      throw error;
    }
  }

  static calculateAverageRating = (ratings) => {
    if (!ratings.length) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return total / ratings.length;
  };

  // login
  // static loginTherapistAccount
}

export default CommonService;
