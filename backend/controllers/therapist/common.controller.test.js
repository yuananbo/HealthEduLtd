import { beforeEach, describe, expect, it, vi } from "vitest";

const getTherapistRatingsMock = vi.fn();
const calculateAverageRatingMock = vi.fn();
const addTherapistRatingMock = vi.fn();

vi.mock("../../services/common.service.js", () => ({
  default: {
    getTherapistRatings: getTherapistRatingsMock,
    calculateAverageRating: calculateAverageRatingMock,
    addTherapistRating: addTherapistRatingMock,
  },
}));

describe("therapist common controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getTherapistRatings returns therapist ratings and average using req.params.id", async () => {
    const therapist = { _id: "t-1", ratings: [{ rating: 5 }] };
    getTherapistRatingsMock.mockResolvedValue(therapist);
    calculateAverageRatingMock.mockReturnValue(5);

    const { getTherapistRatings } = await import("./common.controller.js");

    const req = { params: { id: "t-1" } };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await getTherapistRatings(req, res);

    expect(getTherapistRatingsMock).toHaveBeenCalledWith("t-1");
    expect(calculateAverageRatingMock).toHaveBeenCalledWith(therapist.ratings);
    expect(res.json).toHaveBeenCalledWith({ therapist, averageRating: 5 });
  });

  it("getTherapistRatings returns 500 on service failure", async () => {
    getTherapistRatingsMock.mockRejectedValue(new Error("boom"));

    const { getTherapistRatings } = await import("./common.controller.js");

    const req = { params: { id: "t-1" } };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await getTherapistRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("addRating creates a new rating for the authenticated patient", async () => {
    const created = { _id: "r-1", rating: 4, review: "Helpful" };
    addTherapistRatingMock.mockResolvedValue(created);

    const { addRating } = await import("./common.controller.js");

    const req = {
      params: { id: "therapist-1" },
      user: { _id: "patient-1" },
      body: { appointmentId: "appointment-1", rating: 4, review: "Helpful" },
    };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await addRating(req, res);

    expect(addTherapistRatingMock).toHaveBeenCalledWith(
      "patient-1",
      "therapist-1",
      "appointment-1",
      4,
      "Helpful"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: "success", rating: created });
  });

  it("addRating returns 500 when rating creation fails", async () => {
    addTherapistRatingMock.mockRejectedValue(new Error("save failed"));

    const { addRating } = await import("./common.controller.js");

    const req = {
      params: { id: "therapist-1" },
      user: { _id: "patient-1" },
      body: { appointmentId: "appointment-1", rating: 4, review: "Helpful" },
    };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await addRating(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("addRating returns the business validation status from the service", async () => {
    const error = new Error("This appointment has already been rated");
    error.statusCode = 409;
    addTherapistRatingMock.mockRejectedValue(error);

    const { addRating } = await import("./common.controller.js");

    const req = {
      params: { id: "therapist-1" },
      user: { _id: "patient-1" },
      body: { appointmentId: "appointment-1", rating: 4, review: "Helpful" },
    };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await addRating(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "This appointment has already been rated",
    });
  });

  it("getTherapistProfileWithRatings returns the authenticated therapist profile", async () => {
    const therapist = { _id: "t-99", ratings: [{ rating: 4 }, { rating: 5 }] };
    getTherapistRatingsMock.mockResolvedValue(therapist);
    calculateAverageRatingMock.mockReturnValue(4.5);

    const { getTherapistProfileWithRatings } = await import("./common.controller.js");

    const req = { user: { _id: "t-99" } };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await getTherapistProfileWithRatings(req, res);

    expect(getTherapistRatingsMock).toHaveBeenCalledWith("t-99");
    expect(calculateAverageRatingMock).toHaveBeenCalledWith(therapist.ratings);
    expect(res.json).toHaveBeenCalledWith({ therapist, averageRating: 4.5 });
  });
});
