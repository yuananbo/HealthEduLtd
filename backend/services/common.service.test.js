import { beforeEach, describe, expect, it, vi } from "vitest";

const findByIdMock = vi.fn();
const populateMock = vi.fn();
const findByIdAndUpdateMock = vi.fn();
const findOneRatingMock = vi.fn();
const findByIdAppointmentMock = vi.fn();
const saveMock = vi.fn();
const TherapistRatingMock = vi.fn();

vi.mock("../models/therapist.model.js", () => ({
  default: {
    findById: findByIdMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
  },
}));

vi.mock("../models/appointment.model.js", () => ({
  default: {
    findById: findByIdAppointmentMock,
  },
}));

vi.mock("../models/therapistRating.model.js", () => ({
  default: Object.assign(TherapistRatingMock, {
    findOne: findOneRatingMock,
  }),
}));

describe("CommonService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    populateMock.mockReset();
    findByIdMock.mockReset();
    findByIdAndUpdateMock.mockReset();
    findOneRatingMock.mockReset();
    findByIdAppointmentMock.mockReset();
    saveMock.mockReset();
    TherapistRatingMock.mockReset();
    TherapistRatingMock.mockImplementation(function MockTherapistRating(data) {
      Object.assign(this, data, { _id: "rating-1", save: saveMock });
    });
  });

  it("calculateAverageRating returns 0 for an empty rating list", async () => {
    const { default: CommonService } = await import("./common.service.js");

    expect(CommonService.calculateAverageRating([])).toBe(0);
  });

  it("calculateAverageRating returns the expected average", async () => {
    const { default: CommonService } = await import("./common.service.js");

    expect(
      CommonService.calculateAverageRating([
        { rating: 5 },
        { rating: 3 },
        { rating: 4 },
      ])
    ).toBe(4);
  });

  it("getTherapistRatings populates ratings and nested patient info", async () => {
    const plain = {
      _id: "therapist-1",
      ratings: [
        {
          rating: 5,
          isAnonymous: false,
          patient: { firstName: "A", lastName: "B", patientId: "P1" },
        },
      ],
    };
    populateMock.mockResolvedValue({
      toObject: () => plain,
    });
    findByIdMock.mockReturnValue({
      populate: populateMock,
    });

    const { default: CommonService } = await import("./common.service.js");
    const result = await CommonService.getTherapistRatings("therapist-1");

    expect(findByIdMock).toHaveBeenCalledWith("therapist-1");
    expect(populateMock).toHaveBeenCalledWith({
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
    expect(result).toEqual(plain);
  });

  it("getTherapistRatings strips patient details for anonymous ratings", async () => {
    const plain = {
      _id: "therapist-1",
      ratings: [
        {
          rating: 4,
          isAnonymous: true,
          patient: { firstName: "Secret", lastName: "User", patientId: "PX" },
        },
      ],
    };
    populateMock.mockResolvedValue({
      toObject: () => plain,
    });
    findByIdMock.mockReturnValue({
      populate: populateMock,
    });

    const { default: CommonService } = await import("./common.service.js");
    const result = await CommonService.getTherapistRatings("therapist-1");

    expect(result.ratings[0].patient).toBeNull();
    expect(result.ratings[0].isAnonymous).toBe(true);
  });

  it("getTherapistRatings throws when the therapist does not exist", async () => {
    populateMock.mockResolvedValue(null);
    findByIdMock.mockReturnValue({
      populate: populateMock,
    });

    const { default: CommonService } = await import("./common.service.js");

    await expect(CommonService.getTherapistRatings("missing-id")).rejects.toThrow(
      "Therapist not found"
    );
  });

  it("addTherapistRating saves the rating and links it to the therapist", async () => {
    findByIdAppointmentMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        patient: "patient-1",
        therapist: "therapist-1",
        status: "Completed",
      }),
    });
    findOneRatingMock.mockResolvedValue(null);

    const { default: CommonService } = await import("./common.service.js");

    const created = await CommonService.addTherapistRating(
      "patient-1",
      "therapist-1",
      "appointment-1",
      5,
      "Excellent care"
    );

    expect(TherapistRatingMock).toHaveBeenCalledWith({
      appointment: "appointment-1",
      patient: "patient-1",
      therapist: "therapist-1",
      rating: 5,
      review: "Excellent care",
      isAnonymous: false,
    });
    expect(saveMock).toHaveBeenCalled();
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      "therapist-1",
      { $push: { ratings: "rating-1" } },
      { new: true }
    );
    expect(created).toMatchObject({
      _id: "rating-1",
      appointment: "appointment-1",
      patient: "patient-1",
      therapist: "therapist-1",
      rating: 5,
      review: "Excellent care",
    });
  });

  it("addTherapistRating rejects duplicate ratings for the same appointment", async () => {
    findByIdAppointmentMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        patient: "patient-1",
        therapist: "therapist-1",
        status: "Completed",
      }),
    });
    findOneRatingMock.mockResolvedValue({ _id: "rating-existing" });

    const { default: CommonService } = await import("./common.service.js");

    await expect(
      CommonService.addTherapistRating(
        "patient-1",
        "therapist-1",
        "appointment-1",
        5,
        "Excellent care"
      )
    ).rejects.toMatchObject({
      message: "This appointment has already been rated",
      statusCode: 409,
    });
  });

  it("addTherapistRating rejects when the appointment does not exist", async () => {
    findByIdAppointmentMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const { default: CommonService } = await import("./common.service.js");

    await expect(
      CommonService.addTherapistRating(
        "patient-1",
        "therapist-1",
        "appointment-missing",
        5,
        "Excellent care"
      )
    ).rejects.toMatchObject({
      message: "Appointment not found",
      statusCode: 404,
    });
  });

  it("addTherapistRating rejects when a patient tries to rate another patient's appointment", async () => {
    findByIdAppointmentMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        patient: "patient-2",
        therapist: "therapist-1",
        status: "Completed",
      }),
    });

    const { default: CommonService } = await import("./common.service.js");

    await expect(
      CommonService.addTherapistRating(
        "patient-1",
        "therapist-1",
        "appointment-1",
        5,
        "Excellent care"
      )
    ).rejects.toMatchObject({
      message: "You can only rate your own completed appointments",
      statusCode: 403,
    });
  });

  it("addTherapistRating rejects when the appointment belongs to a different therapist", async () => {
    findByIdAppointmentMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        patient: "patient-1",
        therapist: "therapist-2",
        status: "Completed",
      }),
    });

    const { default: CommonService } = await import("./common.service.js");

    await expect(
      CommonService.addTherapistRating(
        "patient-1",
        "therapist-1",
        "appointment-1",
        5,
        "Excellent care"
      )
    ).rejects.toMatchObject({
      message: "This appointment does not belong to the selected therapist",
      statusCode: 400,
    });
  });

  it("addTherapistRating rejects when the appointment is not completed", async () => {
    findByIdAppointmentMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        patient: "patient-1",
        therapist: "therapist-1",
        status: "Accepted",
      }),
    });

    const { default: CommonService } = await import("./common.service.js");

    await expect(
      CommonService.addTherapistRating(
        "patient-1",
        "therapist-1",
        "appointment-1",
        5,
        "Excellent care"
      )
    ).rejects.toMatchObject({
      message: "Only completed appointments can be rated",
      statusCode: 400,
    });
  });
});
