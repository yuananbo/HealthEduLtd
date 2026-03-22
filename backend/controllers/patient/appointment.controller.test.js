import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../utils/sendGridEmail.js", () => ({
  sendEmail: vi.fn().mockResolvedValue({ sent: true }),
}));

vi.mock("../../utils/emailTemplates.js", () => ({
  appointmentConfirmationTemplate: vi.fn(() => "<html>patient</html>"),
  appointmentConfrimationTherapistTemplate: vi.fn(() => "<html>therapist</html>"),
}));

const reserveTimeSlotMock = vi.fn();

vi.mock("../../services/availability.service.js", () => ({
  default: { reserveTimeSlot: (...args) => reserveTimeSlotMock(...args) },
}));

const appointmentServiceMocks = vi.hoisted(() => ({
  findAppointmentsByPatient: vi.fn(),
  rescheduleAppointment: vi.fn(),
  cancelAppointment: vi.fn(),
}));

vi.mock("../../services/appointment.service.js", () => ({
  default: appointmentServiceMocks,
}));

const paymentSaveMock = vi.fn();

const paymentModelMocks = vi.hoisted(() => {
  function Payment(data) {
    Object.assign(this, data);
    this.save = paymentSaveMock;
  }
  Payment.findOne = vi.fn();
  return { Payment };
});

vi.mock("../../models/payment.model.js", () => ({
  default: paymentModelMocks.Payment,
}));

const appointmentModelMocks = vi.hoisted(() => {
  const deleteOne = vi.fn().mockResolvedValue({});
  function Appointment(data) {
    Object.assign(this, data);
    this._id = "507f1f77bcf86cd799439099";
    this.date = data.date ? new Date(data.date) : new Date("2026-03-10");
    this.time = data.time ?? "10:00";
    this.status = data.status ?? "Pending";
    this.service = data.service ?? "PT";
    this.purpose = data.purpose ?? "checkup";
    this.notes = data.notes ?? "";
    this.appointmentType = data.appointmentType ?? "in-person";
    this.save = vi.fn().mockResolvedValue(this);
  }
  Appointment.deleteOne = deleteOne;
  return { Appointment, deleteOne };
});

const appointmentDeleteOneMock = appointmentModelMocks.deleteOne;

vi.mock("../../models/appointment.model.js", () => ({
  default: appointmentModelMocks.Appointment,
}));

const therapistFindByIdMock = vi.fn();
const patientFindByIdMock = vi.fn();

vi.mock("../../models/patient.model.js", () => ({
  default: { findById: (...args) => patientFindByIdMock(...args) },
}));

vi.mock("../../models/therapist.model.js", () => ({
  default: { findById: (...args) => therapistFindByIdMock(...args) },
}));

const processPaymentMock = vi.fn();
const isMockPaymentMock = vi.fn(() => true);

vi.mock("../../utils/payment.js", () => ({
  default: (...args) => processPaymentMock(...args),
  isMockPayment: () => isMockPaymentMock(),
}));

import { sendEmail } from "../../utils/sendGridEmail.js";
import {
  createAppointment,
  getAppointments,
  rescheduleAppointment,
  cancelAppointment,
} from "./appointment.controller.js";

const patientId = "507f1f77bcf86cd799439011";
const therapistId = "507f1f77bcf86cd799439012";

const createRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
});

const baseReq = () => ({
  user: { _id: patientId },
  protocol: "http",
  get: vi.fn((h) => (h === "host" ? "localhost:8000" : "")),
  body: {},
});

describe("createAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reserveTimeSlotMock.mockResolvedValue({ updated: true });
    appointmentDeleteOneMock.mockResolvedValue({});
    paymentSaveMock.mockResolvedValue({});
    therapistFindByIdMock.mockResolvedValue({ _id: therapistId });
    patientFindByIdMock.mockResolvedValue({
      firstName: "Pat",
      lastName: "Ient",
      email: "p@test.com",
      phoneNumber: "+250700000000",
    });
    processPaymentMock.mockResolvedValue({
      meta: { authorization: {} },
    });
    isMockPaymentMock.mockReturnValue(true);
  });

  it("returns 404 when therapist is not found", async () => {
    therapistFindByIdMock.mockResolvedValueOnce(null);
    const req = {
      ...baseReq(),
      body: {
        therapist: therapistId,
        date: "2026-03-10",
        time: "10:00",
        service: "PT",
        purpose: "Pain",
      },
    };
    const res = createRes();
    await createAppointment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Therapist not found" });
    expect(reserveTimeSlotMock).not.toHaveBeenCalled();
  });

  it("returns 404 when patient is not found", async () => {
    patientFindByIdMock.mockResolvedValueOnce(null);
    const req = {
      ...baseReq(),
      body: {
        therapist: therapistId,
        date: "2026-03-10",
        time: "10:00",
        service: "PT",
        purpose: "Pain",
      },
    };
    const res = createRes();
    await createAppointment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Patient not found" });
  });

  it("returns 400 when home-care appointment lacks country or city", async () => {
    const req = {
      ...baseReq(),
      body: {
        therapist: therapistId,
        date: "2026-03-10",
        time: "10:00",
        service: "Home",
        purpose: "Visit",
        appointmentType: "home-care",
        homeAddress: { country: "", city: "Kigali" },
      },
    };
    const res = createRes();
    await createAppointment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Home address (country and city) is required for home care appointments",
    });
  });

  it("returns 409 and deletes appointment when slot cannot be reserved", async () => {
    reserveTimeSlotMock.mockResolvedValueOnce({
      updated: false,
      reason: "slot_already_reserved",
    });

    const req = {
      ...baseReq(),
      body: {
        therapist: therapistId,
        date: "2026-03-10",
        time: "10:00",
        service: "PT",
        purpose: "Pain",
      },
    };
    const res = createRes();
    await createAppointment(req, res, vi.fn());

    expect(appointmentDeleteOneMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "This time slot has just been booked. Please choose another.",
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 409 with generic message when slot unavailable (non double-book reason)", async () => {
    reserveTimeSlotMock.mockResolvedValueOnce({
      updated: false,
      reason: "no_availability",
    });

    const req = {
      ...baseReq(),
      body: {
        therapist: therapistId,
        date: "2026-03-10",
        time: "10:00",
        service: "PT",
        purpose: "Pain",
      },
    };
    const res = createRes();
    await createAppointment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Selected time slot is not available. Please choose another.",
    });
  });

  it("returns 201 without paymentDetails: Waiting for Payment, emails sent, no processPayment", async () => {
    const req = {
      ...baseReq(),
      body: {
        therapist: therapistId,
        date: "2026-03-10",
        time: "10:00",
        service: "PT",
        purpose: "Pain",
        notes: "n1",
      },
    };
    const res = createRes();
    await createAppointment(req, res, vi.fn());

    expect(processPaymentMock).not.toHaveBeenCalled();
    expect(paymentSaveMock).not.toHaveBeenCalled();
    expect(reserveTimeSlotMock).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.appointment).toBeDefined();
    expect(payload.paymentResponse).toBeNull();
    expect(payload.appointment.status).toBe("Waiting for Payment");
  });

  it("returns 201 with paymentDetails: calls processPayment and returns paymentResponse", async () => {
    const req = {
      ...baseReq(),
      body: {
        therapist: therapistId,
        date: "2026-03-10",
        time: "10:00",
        service: "PT",
        purpose: "Pain",
        paymentDetails: { amount: 5000, currency: "RWF" },
      },
    };
    const res = createRes();
    await createAppointment(req, res, vi.fn());

    expect(paymentSaveMock).toHaveBeenCalled();
    expect(processPaymentMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.paymentResponse).toBeDefined();
  });
});

describe("getAppointments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with paginated data from service", async () => {
    const mockList = [{ _id: "a1" }, { _id: "a2" }];
    appointmentServiceMocks.findAppointmentsByPatient.mockResolvedValue({
      appointments: mockList,
      total: 2,
      page: 1,
      limit: 10,
    });

    const req = {
      user: { _id: patientId },
      query: { page: "1", limit: "10" },
    };
    const res = createRes();
    await getAppointments(req, res, vi.fn());

    expect(appointmentServiceMocks.findAppointmentsByPatient).toHaveBeenCalledWith(
      patientId,
      { page: "1", limit: "10" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      total: 2,
      page: 1,
      limit: 10,
      data: mockList,
    });
  });
});

describe("rescheduleAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when reschedule succeeds", async () => {
    const updated = { _id: "x", date: new Date(), time: "14:00" };
    appointmentServiceMocks.rescheduleAppointment.mockResolvedValue(updated);

    const req = {
      params: { _id: "507f1f77bcf86cd799439020" },
      body: { newDate: "2026-03-15", newTime: "14:00" },
    };
    const res = createRes();
    await rescheduleAppointment(req, res, vi.fn());

    expect(appointmentServiceMocks.rescheduleAppointment).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439020",
      "2026-03-15",
      "14:00"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: updated,
    });
  });

  it("returns 404 when appointment not found", async () => {
    appointmentServiceMocks.rescheduleAppointment.mockRejectedValue(
      new Error("Appointment not found")
    );

    const req = {
      params: { _id: "missing" },
      body: { newDate: "2026-03-15", newTime: "14:00" },
    };
    const res = createRes();
    await rescheduleAppointment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Appointment not found",
    });
  });

  it("returns 400 when past 48h window", async () => {
    appointmentServiceMocks.rescheduleAppointment.mockRejectedValue(
      new Error("Appointment cannot be rescheduled after 48 hours")
    );

    const req = {
      params: { _id: "507f1f77bcf86cd799439020" },
      body: { newDate: "2026-03-15", newTime: "14:00" },
    };
    const res = createRes();
    await rescheduleAppointment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Appointment cannot be rescheduled after 48 hours",
    });
  });

  it("returns 400 on validation error", async () => {
    const err = new Error("bad");
    err.name = "ValidationError";
    appointmentServiceMocks.rescheduleAppointment.mockRejectedValue(err);

    const req = {
      params: { _id: "507f1f77bcf86cd799439020" },
      body: {},
    };
    const res = createRes();
    await rescheduleAppointment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid data provided for rescheduling",
      })
    );
  });

  it("returns 500 on unexpected errors", async () => {
    appointmentServiceMocks.rescheduleAppointment.mockRejectedValue(
      new Error("database exploded")
    );

    const req = {
      params: { _id: "507f1f77bcf86cd799439020" },
      body: { newDate: "2026-03-15", newTime: "14:00" },
    };
    const res = createRes();
    await rescheduleAppointment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Failed to reschedule appointment",
      })
    );
  });
});

describe("cancelAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with cancelled appointment data", async () => {
    const appt = { _id: "507f1f77bcf86cd799439030", status: "Cancelled" };
    appointmentServiceMocks.cancelAppointment.mockResolvedValue({
      appointment: appt,
    });

    const req = {
      params: { _id: "507f1f77bcf86cd799439030" },
    };
    const res = createRes();
    await cancelAppointment(req, res, vi.fn());

    expect(appointmentServiceMocks.cancelAppointment).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439030",
      req
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: appt,
    });
  });
});
