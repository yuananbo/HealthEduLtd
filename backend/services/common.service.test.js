import { beforeEach, describe, expect, it, vi } from "vitest";

const findByIdMock = vi.fn();
const populateMock = vi.fn();
const findByIdAndUpdateMock = vi.fn();
const saveMock = vi.fn();
const TherapistRatingMock = vi.fn();

vi.mock("../models/therapist.model.js", () => ({
  default: {
    findById: findByIdMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
  },
}));

vi.mock("../models/therapistRating.model.js", () => ({
  default: TherapistRatingMock,
}));

describe("CommonService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    populateMock.mockReset();
    findByIdMock.mockReset();
    findByIdAndUpdateMock.mockReset();
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
    const therapist = { _id: "therapist-1", ratings: [{ rating: 5 }] };
    populateMock.mockResolvedValue(therapist);
    findByIdMock.mockReturnValue({
      populate: populateMock,
    });

    const { default: CommonService } = await import("./common.service.js");
    const result = await CommonService.getTherapistRatings("therapist-1");

    expect(findByIdMock).toHaveBeenCalledWith("therapist-1");
    expect(populateMock).toHaveBeenCalledWith({
      path: "ratings",
      populate: {
        path: "patient",
        select: "firstName lastName patientId",
      },
    });
    expect(result).toEqual(therapist);
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
    const { default: CommonService } = await import("./common.service.js");

    const created = await CommonService.addTherapistRating(
      "patient-1",
      "therapist-1",
      5,
      "Excellent care"
    );

    expect(TherapistRatingMock).toHaveBeenCalledWith({
      patient: "patient-1",
      therapist: "therapist-1",
      rating: 5,
      review: "Excellent care",
    });
    expect(saveMock).toHaveBeenCalled();
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      "therapist-1",
      { $push: { ratings: "rating-1" } },
      { new: true }
    );
    expect(created).toMatchObject({
      _id: "rating-1",
      patient: "patient-1",
      therapist: "therapist-1",
      rating: 5,
      review: "Excellent care",
    });
  });
});
