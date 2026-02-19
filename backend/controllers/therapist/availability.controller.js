import { asyncHandler } from "../../middleware/asyncHandler.js";
import AvailabilityService from "../../services/availability.service.js";

export const createAvailabilityController = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const userType = req.user.userType;

    if (userType !== "therapist") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { dates, availabilityName } = req.body;

    if (!dates || !availabilityName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const availability = await AvailabilityService.createAvailability(
      therapistId,
      dates,
      availabilityName
    );

    return res
      .status(201)
      .json({ status: "success", availability: availability });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating availability", error: error.message });
  }
};

export const getAvailabilityController = async (req, res) => {
  const { therapistId, date } = req.query;

  // Validation
  if (!therapistId || !date) {
    return res
      .status(400)
      .json({ error: "Missing therapistId or date in query parameters." });
  }

  try {
    const availability = await AvailabilityService.getAvailability(
      therapistId,
      date
    );

    return res.status(200).json({ status: "success", availability });
  } catch (error) {
    if (error.type === "NotFoundError") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const getAllAvailabilitiesController = async (req, res) => {
  // Use the 'id' parameter from the route
  const therapistId = req.params.id;

  try {
    const activeAvailability = await AvailabilityService.getActiveAvailability(
      therapistId
    );

    if (
      !activeAvailability ||
      !activeAvailability.availabilities ||
      activeAvailability.availabilities.length === 0
    ) {
      return res
        .status(404)
        .json({ message: "No active availability found for this therapist" });
    }

    return res.status(200).json({
      status: "success",
      activeAvailability: activeAvailability,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching active availability",
      error: error.message,
    });
  }
};

// get my availabilities
export const getMyAvailabilities = asyncHandler(async (req, res) => {
  try {
    if (req.user.userType !== "therapist") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const therapistId = req.user._id;

    const availabilities = await AvailabilityService.getAllAvailabilities(
      therapistId
    );

    res.status(200).json({
      success: true,
      data: availabilities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update my availability
export const updateMyAvailability = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.userType !== "therapist") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { availabilityName, dates } = req.body;

    if (!availabilityName && !dates) {
      return res.status(400).json({
        message:
          "At least one field (availabilityName or dates) is required for update",
      });
    }

    const updatedAvailability = await AvailabilityService.updateMyAvailability(
      req,
      id,
      dates,
      availabilityName
    );

    res.status(200).json({
      message: "Availability updated successfully",
      availability: updatedAvailability,
    });
  } catch (error) {
    console.error("Error in updateAvailability controller:", error);
    if (error.message === "Availability not found or not authorized") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to update availability" });
    }
  }
});

// Update date andtime availability for therapist when a patient books an appointment, change time slot status to false and if all times are booked, show no availability
export const updateAvailabilityTimeSlot = async (req, res) => {
  try {
    const { id } = req.params; // This is the therapist ID
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    const result = await AvailabilityService.updateAvailability(id, date, time);

    if (result.updated) {
      const message = result.allSlotsBooked
        ? "Time slot updated. All slots for this date are now booked."
        : "Time slot updated successfully.";

      res.status(200).json({ message, allSlotsBooked: result.allSlotsBooked });
    } else {
      res
        .status(404)
        .json({ message: "Availability not found for the given date" });
    }
  } catch (error) {
    console.error("Error updating availability:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating availability" });
  }
};

export const updateMyAvailabilityTimeSlotStatus = asyncHandler(
  async (req, res) => {
    try {
      if (req.user.userType !== "therapist") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const therapistId = req.user._id;
      const { id } = req.params;
      const { date, time, isActive } = req.body;

      if (!date || !time || typeof isActive !== "boolean") {
        return res.status(400).json({
          message: "date, time and isActive(boolean) are required",
        });
      }

      const updatedAvailability = await AvailabilityService.updateTimeSlotStatus(
        therapistId,
        id,
        date,
        time,
        isActive
      );

      res.status(200).json({
        message: "Time slot status updated successfully",
        availability: updatedAvailability,
      });
    } catch (error) {
      console.error("Error in updateMyAvailabilityTimeSlotStatus:", error);
      if (
        error.message === "Availability not found or not authorized" ||
        error.message === "Date not found in this availability" ||
        error.message === "Time slot not found in this availability"
      ) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({
        message: "Failed to update time slot status",
        error: error.message,
      });
    }
  }
);

export const setAvailabilityActive = asyncHandler(async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    if (req.user.userType !== "therapist") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const therapistId = req.user._id;
    const { availabilityId } = req.params;

    const activeAvailability = await AvailabilityService.setAvailabilityActive(
      therapistId,
      availabilityId
    );

    res.status(200).json({
      message: "Availability set as active successfully",
      availability: activeAvailability,
    });
  } catch (error) {
    console.error("Error in setAvailabilityActive:", error);
    res.status(500).json({
      message: "Failed to set availability as active",
      error: error.message,
    });
  }
});

export const setAvailabilityInactive = asyncHandler(async (req, res) => {
  try {
    if (req.user.userType !== "therapist") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const therapistId = req.user._id;
    const { availabilityId } = req.params;

    const updatedAvailability = await AvailabilityService.setAvailabilityInactive(
      therapistId,
      availabilityId
    );

    res.status(200).json({
      message: "Availability set as inactive successfully",
      availability: updatedAvailability,
    });
  } catch (error) {
    console.error("Error in setAvailabilityInactive:", error);
    if (error.message === "Availability not found or not authorized") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({
      message: "Failed to set availability as inactive",
      error: error.message,
    });
  }
});

// Delete availability
export const deleteAvailability = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.userType !== "therapist") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const therapistId = req.user._id;

    const deletedAvailability = await AvailabilityService.deleteAvailability(
      therapistId,
      id
    );

    res.status(200).json({
      message: "Availability deleted successfully",
      availability: deletedAvailability,
    });
  } catch (error) {
    console.error("Error in deleteAvailability controller:", error);
    if (error.message === "Availability not found or not authorized") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to delete availability" });
    }
  }
});
