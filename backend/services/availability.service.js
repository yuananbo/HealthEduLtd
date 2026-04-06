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
import Therapist from "../models/therapist.model.js";

class AvailabilityService {
  /**
   * When a therapist has completed onboarding documents and has saved at least one
   * calendar time slot, treat them as approved: same bar as admin approve (docs +
   * schedule), without sending email here.
   */
  static async maybeActivateScheduledTherapist(therapistId) {
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return;

    if (therapist.isVerified) return;

    if (
      !therapist.cv ||
      !therapist.licenseDocument ||
      !therapist.profilePicture
    ) {
      return;
    }

    const hasSlots = await Availability.exists({
      therapist: therapistId,
      "availabilities.times.0": { $exists: true },
    });
    if (!hasSlots) return;

    therapist.active = true;
    therapist.isVerified = true;
    await therapist.save();
  }

  /**
   * Calendar-day availability (no timezone drift). Prefer client "YYYY-MM-DD".
   */
  static normalizeAvailabilityDayInput(value) {
    if (value === undefined || value === null) {
      throw new Error("Availability date is required");
    }
    if (typeof value === "string") {
      const s = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const m = moment.utc(s, "YYYY-MM-DD", true);
        if (!m.isValid()) throw new Error("Invalid availability date");
        return m.startOf("day").toDate();
      }
    }
    const legacy = moment.utc(value);
    if (!legacy.isValid()) throw new Error("Invalid availability date");
    return legacy.startOf("day").toDate();
  }

  static async createAvailability(therapistId, dates, availabilityName) {
    const existingAvailabilityName = await Availability.findOne({
      availabilityName: availabilityName,
    });

    if (existingAvailabilityName) {
      throw new Error("The availability name must be unique.");
    }

    // Schedule-level isActive: patients only see slots in getActiveAvailability when
    // this is true. Default schema is false, which forced "Activate All" after every
    // create; new schedules should be bookable as soon as they are saved.
    const availability = new Availability({
      therapist: therapistId,
      availabilities: dates.map((date) => ({
        date: this.normalizeAvailabilityDayInput(date.date),
        times: date.times.map((time) => ({ time, isActive: true })),
      })),
      availabilityName: availabilityName,
      isActive: true,
    });

    await availability.save();
    await this.maybeActivateScheduledTherapist(therapistId);
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
          date: this.normalizeAvailabilityDayInput(date.date),
          times: (date.times || []).map((time) => {
            if (typeof time === "string") {
              return { time, isActive: true };
            }
            return {
              time: time?.time,
              isActive: time?.isActive !== false,
            };
          }),
        }));

        const hasSlots = availability.availabilities.some((d) =>
          (d.times || []).some(
            (t) => t?.time && String(t.time).trim() !== ""
          )
        );
        if (hasSlots) {
          availability.isActive = true;
        }
      }

      await availability.save();
      await this.maybeActivateScheduledTherapist(therapistId);
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
    await this.maybeActivateScheduledTherapist(therapistId);

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

  /**
   * Multiple schedule docs flatMap to several rows per calendar day. The patient
   * calendar can mark a day green from one row while TimeSlots used .find() and
   * picked another row with empty or fully-booked slots — dates lit up but no times.
   */
  static mergeAvailabilityDaysByUtcDate(dayRows) {
    const byYmd = new Map();
    for (const row of dayRows || []) {
      if (!row?.date) continue;
      const ymd = moment.utc(row.date).format("YYYY-MM-DD");
      if (!byYmd.has(ymd)) {
        byYmd.set(ymd, []);
      }
      byYmd.get(ymd).push(...(row.times || []));
    }

    const result = [];
    for (const [ymd, allTimes] of byYmd) {
      const slotMap = new Map();
      for (const t of allTimes) {
        const timeStr =
          typeof t === "string"
            ? this.normalizeTime(t)
            : this.normalizeTime(t?.time);
        if (!timeStr) continue;
        const open =
          typeof t === "string" ? true : t?.isActive !== false;
        if (!slotMap.has(timeStr)) {
          slotMap.set(timeStr, { time: timeStr, isActive: open });
        } else {
          const cur = slotMap.get(timeStr);
          cur.isActive = cur.isActive || open;
        }
      }
      result.push({
        date: moment.utc(ymd, "YYYY-MM-DD", true).startOf("day").toDate(),
        times: Array.from(slotMap.values()),
      });
    }

    result.sort(
      (a, b) => moment.utc(a.date).valueOf() - moment.utc(b.date).valueOf()
    );
    return result;
  }

  static async getActiveAvailability(therapistId) {
    const activeAvailabilities = await Availability.find({
      therapist: therapistId,
      isActive: true,
    });

    if (!activeAvailabilities || activeAvailabilities.length === 0) {
      return null;
    }

    const mergedDayRows = activeAvailabilities.flatMap(
      (item) => item.availabilities || []
    );
    const availabilities =
      this.mergeAvailabilityDaysByUtcDate(mergedDayRows);

    return {
      therapist: therapistId,
      isActive: true,
      availabilityIds: activeAvailabilities.map((item) => item._id),
      availabilities,
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
