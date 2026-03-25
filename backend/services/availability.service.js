/**
 * Design Pattern: Service Layer / Facade
 *
 * Why used in this module:
 * - Availability and time-slot rules (create, query, reserve, release, normalize) are shared by
 *   multiple HTTP controllers and should live in one domain-focused place.
 *
 * What problem it solves:
 * - Prevents duplicated/contradictory logic across controllers (date-only handling, slot toggling,
 *   conflict checks).
 * - Reduces coupling between the HTTP layer and MongoDB/Mongoose persistence details.
 *
 * How it improves extensibility/maintainability:
 * - New scheduling rules (buffers, max bookings/day, expiry, provider policies) can be added here
 *   without modifying many controllers.
 * - Makes booking/cancellation behavior easier to test and reason about.
 */
import moment from "moment";
import Availability from "../models/availability.model.js";

class AvailabilityService {
  static async createAvailability(therapistId, dates, availabilityName) {
    const existingAvailabilityName = await Availability.findOne({
      availabilityName: availabilityName,
    });

    if (existingAvailabilityName) {
      throw new Error("The availability name must be unique.");
    }

    const availability = new Availability({
      therapist: therapistId,
      availabilities: dates.map((date) => ({
        date: moment.utc(date.date).startOf("day").toDate(),
        times: date.times.map((time) => ({ time, isActive: true })),
      })),
      availabilityName: availabilityName,
    });

    await availability.save();
    return availability;
  }

  static async getAvailability(therapistId, date) {
    // Convert the input date to the start of the day in UTC
    const searchDateStart = moment.utc(date).startOf("day").toDate();

    // console.log("Therapist ID:", therapistId);
    // console.log("Search Date Start:", searchDateStart);
    // console.log("Query Conditions:", {
    //   therapist: therapistId,
    //   "availabilities.date": {
    //     $gte: searchDateStart,
    //     $lt: moment.utc(searchDateStart).add(1, "days").toDate(),
    //   },
    // });

    const availability = await Availability.findOne({
      therapist: therapistId,
      "availabilities.date": {
        $gte: searchDateStart,
        $lt: moment.utc(searchDateStart).add(1, "days").toDate(),
      },
    });

    if (!availability) {
      return null;
    }

    const therapistAvailability = availability.availabilities.find((a) =>
      moment.utc(a.date).isSame(searchDateStart, "day")
    );

    if (therapistAvailability) {
      return {
        name: availability.availabilityName,
        ...therapistAvailability.toObject(),
      };
    }

    return null;
  }

  // Get all availabilities for a therapist
  static async getAllAvailabilities(therapistId) {
    if (!therapistId) {
      throw new Error("Therapist ID is required");
    }

    try {
      const availabilities = await Availability.find({
        therapist: therapistId,
      });

      if (!availabilities || availabilities.length === 0) {
        return [];
      }

      return availabilities.map((availability) => ({
        id: availability._id,
        name: availability.availabilityName,
        isActive: availability.isActive,
        dates: availability.availabilities.map((a) => ({
          date: a.date,
          times: a.times,
        })),
      }));
    } catch (error) {
      throw new Error("Error fetching availabilities: " + error.message);
    }
  }

  // Update availability time slot status to false (not available) after booking an appointment
  static async updateAvailability(therapistId, date, time) {
    const searchDate = moment.utc(date).startOf("day").toDate();

    const availability = await Availability.findOne({
      therapist: therapistId,
      isActive: true,
      "availabilities.date": {
        $gte: searchDate,
        $lt: moment(searchDate).endOf("day").toDate(),
      },
    });

    if (availability) {
      const index = availability.availabilities.findIndex(
        (a) =>
          moment(a.date).format("YYYY-MM-DD") ===
          moment(searchDate).format("YYYY-MM-DD")
      );

      if (index !== -1) {
        // Update the specific time slot
        availability.availabilities[index].times = availability.availabilities[
          index
        ].times.map((t) => {
          if (t.time === time) {
            return { time, isActive: false };
          }
          return t;
        });

        // Check if all time slots for this date are now false
        const allSlotsFalse = availability.availabilities[index].times.every(
          (t) => t.isActive === false
        );

        await availability.save();

        return {
          updated: true,
          allSlotsBooked: allSlotsFalse,
        };
      }
    }

    return { updated: false };
  }

  static normalizeTime(time) {
    if (!time) return "";
    const t = String(time).trim();
    // Normalize "9:00" -> "09:00" for consistency with stored slots.
    if (/^\d:\d{2}$/.test(t)) return `0${t}`;
    return t;
  }

  /**
   * Reserve a specific time slot (set isActive=false) for a therapist on a date.
   * Returns { updated: boolean, allSlotsBooked?: boolean, reason?: string }
   */
  static async reserveTimeSlot(therapistId, date, time) {
    const normalizedTime = this.normalizeTime(time);
    const start = moment.utc(date).startOf("day").toDate();
    const end = moment.utc(date).endOf("day").toDate();

    // Atomic reserve: only one request can flip isActive=true -> false.
    const result = await Availability.updateOne(
      {
        therapist: therapistId,
        isActive: true,
        availabilities: {
          $elemMatch: {
            date: { $gte: start, $lt: end },
            times: { $elemMatch: { time: normalizedTime, isActive: true } },
          },
        },
      },
      { $set: { "availabilities.$[d].times.$[t].isActive": false } },
      {
        arrayFilters: [
          { "d.date": { $gte: start, $lt: end } },
          { "t.time": normalizedTime, "t.isActive": true },
        ],
      }
    );

    if (result.modifiedCount === 0) {
      // Determine a best-effort reason for UI.
      const hasDate = await Availability.exists({
        therapist: therapistId,
        isActive: true,
        "availabilities.date": { $gte: start, $lt: end },
      });
      if (!hasDate) return { updated: false, reason: "date_not_found" };

      const hasTime = await Availability.exists({
        therapist: therapistId,
        isActive: true,
        availabilities: {
          $elemMatch: {
            date: { $gte: start, $lt: end },
            "times.time": normalizedTime,
          },
        },
      });
      if (!hasTime) return { updated: false, reason: "time_not_found" };

      return { updated: false, reason: "slot_already_reserved" };
    }

    // Compute whether the date is now fully booked (best-effort).
    const availability = await Availability.findOne({
      therapist: therapistId,
      isActive: true,
      "availabilities.date": { $gte: start, $lt: end },
    });
    const day = availability?.availabilities?.find((a) =>
      moment.utc(a.date).isSame(moment.utc(start), "day")
    );
    const allSlotsBooked =
      (day?.times || []).length > 0 &&
      (day?.times || []).every((t) => t.isActive === false);

    return { updated: true, allSlotsBooked };
  }

  /**
   * Release a reserved time slot (set isActive=true).
   * Returns { updated: boolean, reason?: string }
   */
  static async releaseTimeSlot(therapistId, date, time) {
    const normalizedTime = this.normalizeTime(time);
    const start = moment.utc(date).startOf("day").toDate();
    const end = moment.utc(date).endOf("day").toDate();

    const result = await Availability.updateOne(
      {
        therapist: therapistId,
        availabilities: {
          $elemMatch: {
            date: { $gte: start, $lt: end },
            times: { $elemMatch: { time: normalizedTime, isActive: false } },
          },
        },
      },
      {
        // Only release the slot itself; do not touch the schedule-level isActive
        // flag so that a therapist's intentional deactivation is not overridden.
        $set: { "availabilities.$[d].times.$[t].isActive": true },
      },
      {
        arrayFilters: [
          { "d.date": { $gte: start, $lt: end } },
          { "t.time": normalizedTime, "t.isActive": false },
        ],
      }
    );

    if (result.modifiedCount === 0) {
      return { updated: false, reason: "slot_not_reserved" };
    }

    return { updated: true };
  }

  // Therapist can update their availability by adding new time slots, or removing existing ones or changing the availability name, or changing the date
  static async updateMyAvailability(req, id, dates, availabilityName) {
    try {
      const therapistId = req.user._id;

      let availability = await Availability.findOne({
        _id: id,
        therapist: therapistId,
      });

      if (!availability) {
        throw new Error("Availability not found or not authorized");
      }

      if (availabilityName) {
        availability.availabilityName = availabilityName;
      }

      if (dates) {
        availability.availabilities = dates.map((date) => ({
          date: moment.utc(date.date).startOf("day").toDate(),
          times: date.times.map((time) => ({
            time: time.time,
            isActive: time.isActive,
          })),
        }));
      }

      await availability.save();
      return availability;
    } catch (error) {
      console.error("Error updating availability:", error);
      throw error;
    }
  }

  // Update one time slot status within a therapist availability
  static async updateTimeSlotStatus(
    therapistId,
    availabilityId,
    date,
    time,
    isActive
  ) {
    const availability = await Availability.findOne({
      _id: availabilityId,
      therapist: therapistId,
    });

    if (!availability) {
      throw new Error("Availability not found or not authorized");
    }

    const targetDate = moment.utc(date).startOf("day");
    const dateEntry = availability.availabilities.find((item) =>
      moment.utc(item.date).isSame(targetDate, "day")
    );

    if (!dateEntry) {
      throw new Error("Date not found in this availability");
    }

    const timeEntry = dateEntry.times.find((item) => item.time === time);
    if (!timeEntry) {
      throw new Error("Time slot not found in this availability");
    }

    timeEntry.isActive = Boolean(isActive);

    // Schedule-level isActive (patient visibility) is managed independently via
    // setAvailabilityActive / setAvailabilityInactive and is not derived from
    // slot states, so we do not touch it here.

    await availability.save();

    return availability;
  }

  // Set availability to active
  static async setAvailabilityActive(therapistId, availabilityId) {
    const updatedAvailability = await Availability.findOne({
      _id: availabilityId,
      therapist: therapistId,
    });

    if (!updatedAvailability) {
      throw new Error("Availability not found or not authorized");
    }

    // Only toggle the schedule-level visibility flag.
    // Individual slot states (reserved vs. available) are preserved.
    updatedAvailability.isActive = true;

    await updatedAvailability.save();

    return updatedAvailability;
  }

  // Set one availability to inactive
  static async setAvailabilityInactive(therapistId, availabilityId) {
    const updatedAvailability = await Availability.findOne({
      _id: availabilityId,
      therapist: therapistId,
    });

    if (!updatedAvailability) {
      throw new Error("Availability not found or not authorized");
    }

    // Only toggle the schedule-level visibility flag.
    // Individual slot states (reserved vs. available) are preserved.
    updatedAvailability.isActive = false;

    await updatedAvailability.save();

    return updatedAvailability;
  }

  static async getActiveAvailability(therapistId) {
    const activeAvailabilities = await Availability.find({
      therapist: therapistId,
      isActive: true,
    });

    if (!activeAvailabilities || activeAvailabilities.length === 0) {
      return null;
    }

    // Merge all active availability documents into one payload expected by frontend.
    const mergedAvailabilities = activeAvailabilities.flatMap(
      (item) => item.availabilities || []
    );

    return {
      therapist: therapistId,
      isActive: true,
      availabilityIds: activeAvailabilities.map((item) => item._id),
      availabilities: mergedAvailabilities,
    };
  }

  // Delete availability by ID
  static async deleteAvailability(therapistId, availabilityId) {
    const availability = await Availability.findOneAndDelete({
      _id: availabilityId,
      therapist: therapistId,
    });

    if (!availability) {
      throw new Error("Availability not found or not authorized");
    }

    return availability;
  }
}

export default AvailabilityService;
