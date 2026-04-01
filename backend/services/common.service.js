import Therapist from "../models/therapist.model.js";
import TherapistRating from "../models/therapistRating.model.js";
import Appointment from "../models/appointment.model.js";

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class CommonService {
  static async addTherapistRating(
    patientId,
    therapistId,
    appointmentId,
    rating,
    review,
    isAnonymous = false
  ) {
    try {
      const appointment = await Appointment.findById(appointmentId).select(
        "patient therapist status"
      );

      if (!appointment) {
        throw createServiceError("Appointment not found", 404);
      }

      if (String(appointment.patient) !== String(patientId)) {
        throw createServiceError(
          "You can only rate your own completed appointments",
          403
        );
      }

      if (String(appointment.therapist) !== String(therapistId)) {
        throw createServiceError(
          "This appointment does not belong to the selected therapist",
          400
        );
      }

      if (appointment.status !== "Completed") {
        throw createServiceError(
          "Only completed appointments can be rated",
          400
        );
      }

      const existingRating = await TherapistRating.findOne({
        appointment: appointmentId,
      });

      if (existingRating) {
        throw createServiceError(
          "This appointment has already been rated",
          409
        );
      }

      const newRating = new TherapistRating({
        appointment: appointmentId,
        patient: patientId,
        therapist: therapistId,
        rating,
        review,
        isAnonymous: Boolean(isAnonymous),
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
      throw error;
    }
  }

  static async getTherapistRatings(therapistId) {
    try {
      const therapist = await Therapist.findById(therapistId).populate({
        path: "ratings",
        populate: [
          {
            path: "patient",
            select: "firstName lastName patientId",
          },
          {
            path: "appointment",
            select: "_id status date service",
          },
        ],
      });
      if (!therapist) {
        throw new Error("Therapist not found");
      }
      const plain = therapist.toObject();
      plain.ratings = (plain.ratings || []).map((r) => {
        if (r.isAnonymous) {
          return { ...r, patient: null };
        }
        return r;
      });
      return plain;
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
