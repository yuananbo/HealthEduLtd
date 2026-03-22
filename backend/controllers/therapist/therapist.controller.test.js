import { beforeEach, describe, expect, it, vi } from "vitest";

const patientFindByIdMock = vi.fn();
const dailyCheckInFindOneMock = vi.fn();
const dailyCheckInFindMock = vi.fn();

vi.mock("../../utils/generateToken.js", () => ({
  default: vi.fn(),
}));

vi.mock("../../models/therapist.model.js", () => ({
  default: {},
}));

vi.mock("../../utils/cloudinary.js", () => ({
  uploadFilesToCloudinary: vi.fn(),
}));

vi.mock("../../utils/sendGridEmail.js", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("../../models/patient.model.js", () => ({
  default: {
    findById: patientFindByIdMock,
  },
}));

vi.mock("../../middleware/asyncHandler.js", () => ({
  asyncHandler: (fn) => fn,
}));

vi.mock("../../utils/emailTemplates.js", () => ({
  signUpTemplate: vi.fn(),
}));

vi.mock("../../models/therapistRating.model.js", () => ({
  default: {},
}));

vi.mock("../../models/appointment.model.js", () => ({
  default: {},
}));

vi.mock("../../models/payment.model.js", () => ({
  default: {},
}));

vi.mock("../../models/dailyCheckIn.model.js", () => ({
  default: {
    findOne: dailyCheckInFindOneMock,
    find: dailyCheckInFindMock,
  },
}));

vi.mock("mongoose", () => ({
  default: {},
}));

const createFindOneChain = (result) => ({
  sort: vi.fn().mockReturnValue({
    lean: vi.fn().mockResolvedValue(result),
  }),
});

const createFindChain = (result) => ({
  sort: vi.fn().mockReturnValue({
    limit: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(result),
    }),
  }),
});

describe("therapist controller patient details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns patient details with mapped recent health history", async () => {
    const patientDoc = {
      toObject: () => ({
        _id: "patient-1",
        firstName: "Mia",
        lastName: "Wang",
      }),
    };
    const latestDailyCheckIn = {
      _id: "checkin-2",
      date: "2026-03-21",
      bloodPressure: { systolic: 120, diastolic: 80 },
    };
    const recentDailyCheckIns = [
      {
        _id: "checkin-2",
        date: "2026-03-21",
        painLevel: 2,
        exerciseCompleted: true,
        adlIndependence: "Independent",
        bloodPressure: { systolic: 120, diastolic: 80 },
        heartRateBpm: 72,
        bloodSugar: { value: 5.6, unit: "mmol/L" },
        weightKg: 70,
        mood: "Okay",
        notes: "Felt steady",
      },
      {
        _id: "checkin-1",
        date: "2026-03-20",
        painLevel: undefined,
        exerciseCompleted: undefined,
        adlIndependence: "",
        bloodPressure: null,
        heartRateBpm: undefined,
        bloodSugar: { unit: "mmol/L" },
        weightKg: undefined,
        mood: "",
        notes: undefined,
      },
    ];

    patientFindByIdMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(patientDoc),
    });
    dailyCheckInFindOneMock.mockReturnValue(createFindOneChain(latestDailyCheckIn));
    dailyCheckInFindMock.mockReturnValue(createFindChain(recentDailyCheckIns));

    const { getPatientDetails } = await import("./therapist.controller.js");

    const req = { params: { id: "patient-1" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await getPatientDetails(req, res);

    expect(patientFindByIdMock).toHaveBeenCalledWith("patient-1");
    expect(dailyCheckInFindOneMock).toHaveBeenCalledWith({ patient: "patient-1" });
    expect(dailyCheckInFindMock).toHaveBeenCalledWith({ patient: "patient-1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: "success",
      data: {
        _id: "patient-1",
        firstName: "Mia",
        lastName: "Wang",
        latestDailyCheckIn,
        healthIndicators: {
          bloodPressure: { systolic: 120, diastolic: 80 },
          bloodPressureDate: "2026-03-21",
          recentHistory: [
            {
              _id: "checkin-2",
              date: "2026-03-21",
              painLevel: 2,
              exerciseCompleted: true,
              adlIndependence: "Independent",
              bloodPressure: { systolic: 120, diastolic: 80 },
              heartRateBpm: 72,
              bloodSugar: { value: 5.6, unit: "mmol/L" },
              weightKg: 70,
              mood: "Okay",
              notes: "Felt steady",
            },
            {
              _id: "checkin-1",
              date: "2026-03-20",
              painLevel: null,
              exerciseCompleted: null,
              adlIndependence: null,
              bloodPressure: null,
              heartRateBpm: null,
              bloodSugar: null,
              weightKg: null,
              mood: null,
              notes: "",
            },
          ],
        },
      },
    });
  });

  it("returns 404 when the patient does not exist", async () => {
    patientFindByIdMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const { getPatientDetails } = await import("./therapist.controller.js");

    const req = { params: { id: "missing-patient" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await getPatientDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Patient not found" });
  });

  it("returns 500 when patient lookup fails", async () => {
    patientFindByIdMock.mockImplementation(() => {
      throw new Error("database failed");
    });

    const { getPatientDetails } = await import("./therapist.controller.js");

    const req = { params: { id: "patient-1" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await getPatientDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      error: expect.any(Error),
    });
  });
});
