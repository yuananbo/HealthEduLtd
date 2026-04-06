import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AvailabilityService from "./availability.service.js";
import Availability from "../models/availability.model.js";

vi.mock("../models/availability.model.js", () => ({
  default: {
    updateOne: vi.fn(),
    findOne: vi.fn(),
  },
}));

describe("AvailabilityService", () => {
  const originalNormalizeTime = AvailabilityService.normalizeTime;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    AvailabilityService.normalizeTime = originalNormalizeTime;
  });

  it("releaseTimeSlot only updates the nested slot and not the schedule isActive flag", async () => {
    Availability.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await AvailabilityService.releaseTimeSlot(
      "therapist-1",
      "2026-03-25",
      "09:00"
    );

    expect(result).toEqual({ updated: true });
    expect(Availability.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: { "availabilities.$[d].times.$[t].isActive": true },
      },
      expect.any(Object)
    );
    const [, update] = Availability.updateOne.mock.calls[0];
    expect(update.$set.isActive).toBeUndefined();
  });

  it("setAvailabilityInactive preserves existing slot state while hiding the schedule", async () => {
    const save = vi.fn().mockResolvedValue(true);
    const availabilityDoc = {
      _id: "availability-1",
      isActive: true,
      availabilities: [
        {
          date: new Date("2026-03-25"),
          times: [
            { time: "09:00", isActive: false },
            { time: "10:00", isActive: true },
          ],
        },
      ],
      save,
    };

    Availability.findOne.mockResolvedValue(availabilityDoc);

    const result = await AvailabilityService.setAvailabilityInactive(
      "therapist-1",
      "availability-1"
    );

    expect(result.isActive).toBe(false);
    expect(result.availabilities[0].times).toEqual([
      { time: "09:00", isActive: false },
      { time: "10:00", isActive: true },
    ]);
    expect(save).toHaveBeenCalled();
  });

  it("updateTimeSlotStatus does not recompute the parent availability visibility", async () => {
    const save = vi.fn().mockResolvedValue(true);
    const availabilityDoc = {
      _id: "availability-1",
      therapist: "therapist-1",
      isActive: false,
      availabilities: [
        {
          date: new Date("2026-03-25T00:00:00.000Z"),
          times: [{ time: "09:00", isActive: false }],
        },
      ],
      save,
    };

    Availability.findOne.mockResolvedValue(availabilityDoc);

    const result = await AvailabilityService.updateTimeSlotStatus(
      "therapist-1",
      "availability-1",
      "2026-03-25",
      "09:00",
      true
    );

    expect(result.isActive).toBe(false);
    expect(result.availabilities[0].times[0].isActive).toBe(true);
    expect(save).toHaveBeenCalled();
  });
});
