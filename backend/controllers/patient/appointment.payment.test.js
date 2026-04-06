import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../utils/sendGridEmail.js", () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../utils/emailTemplates.js", () => ({
  appointmentConfirmationTemplate: vi.fn(() => "<html/>"),
  appointmentConfrimationTherapistTemplate: vi.fn(() => "<html/>"),
}));

vi.mock("../../services/availability.service.js", () => ({
  default: { reserveTimeSlot: vi.fn() },
}));

vi.mock("../../services/appointment.service.js", () => ({
  default: {
    findAppointmentsByPatient: vi.fn(),
    rescheduleAppointment: vi.fn(),
    cancelAppointment: vi.fn(),
    getAppointmentById: vi.fn(),
    updateStatusWithHistory: vi.fn(async (appointment, update) => {
      appointment.status = update.status;
      return appointment;
    }),
  },
}));

const hoisted = vi.hoisted(() => ({
  findById: vi.fn(),
}));

vi.mock("../../models/appointment.model.js", () => ({
  default: { findById: hoisted.findById },
}));

const paymentMocks = vi.hoisted(() => {
  const findOne = vi.fn();
  function Payment(data) {
    Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(this);
  }
  Payment.findOne = findOne;
  return { Payment, findOne };
});

vi.mock("../../models/payment.model.js", () => ({
  default: paymentMocks.Payment,
}));

vi.mock("../../models/patient.model.js", () => ({
  default: { findById: vi.fn() },
}));

vi.mock("../../models/therapist.model.js", () => ({
  default: {},
}));

const paymentUtilMocks = vi.hoisted(() => ({
  processPayment: vi.fn(),
  isMockPayment: vi.fn(() => true),
}));

vi.mock("../../utils/payment.js", () => ({
  default: (...args) => paymentUtilMocks.processPayment(...args),
  isMockPayment: () => paymentUtilMocks.isMockPayment(),
}));

import Patient from "../../models/patient.model.js";
import { initiateAppointmentPayment } from "./appointment.controller.js";

describe("initiateAppointmentPayment", () => {
  const patientId = "507f1f77bcf86cd799439011";
  const appointmentId = "507f1f77bcf86cd799439012";

  const createRes = () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    return res;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    paymentUtilMocks.processPayment.mockReset();
    paymentUtilMocks.isMockPayment.mockReturnValue(true);
    hoisted.findById.mockReset();
    paymentMocks.findOne.mockReset();
    Patient.findById.mockReset();
  });

  it("returns 404 when appointment not found", async () => {
    hoisted.findById.mockResolvedValueOnce(null);
    const req = {
      params: { _id: appointmentId },
      user: { _id: patientId },
      body: {},
    };
    const res = createRes();
    await initiateAppointmentPayment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Appointment not found" });
  });

  it("returns 403 when patient does not own the appointment", async () => {
    hoisted.findById.mockResolvedValueOnce({
      _id: appointmentId,
      patient: { toString: () => "other-patient" },
      status: "Waiting for Payment",
    });
    const req = {
      params: { _id: appointmentId },
      user: { _id: patientId },
      body: {},
    };
    const res = createRes();
    await initiateAppointmentPayment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Not authorized to pay for this appointment",
    });
  });

  it("returns 400 when status is not Waiting for Payment", async () => {
    hoisted.findById.mockResolvedValueOnce({
      _id: appointmentId,
      patient: { toString: () => patientId },
      status: "Pending",
    });
    const req = {
      params: { _id: appointmentId },
      user: { _id: patientId },
      body: {},
    };
    const res = createRes();
    await initiateAppointmentPayment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Payment is only available for appointments awaiting payment",
    });
  });

  it("returns 400 when payment already successful", async () => {
    hoisted.findById.mockResolvedValue({
      _id: appointmentId,
      patient: { toString: () => patientId },
      status: "Waiting for Payment",
    });
    paymentMocks.findOne.mockResolvedValue({
      status: "success",
    });
    const req = {
      params: { _id: appointmentId },
      user: { _id: patientId },
      body: {},
    };
    const res = createRes();
    await initiateAppointmentPayment(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "This appointment is already paid",
    });
  });

  it("returns 200 and invokes processPayment on happy path (no redirect)", async () => {
    const appointmentDoc = {
      _id: appointmentId,
      patient: { toString: () => patientId },
      status: "Waiting for Payment",
      save: vi.fn().mockResolvedValue(true),
    };
    hoisted.findById
      .mockResolvedValueOnce(appointmentDoc)
      .mockResolvedValueOnce({
        ...appointmentDoc,
        status: "Pending",
      });

    paymentMocks.findOne.mockResolvedValue(null);

    Patient.findById.mockResolvedValue({
      phoneNumber: "+250700000000",
      firstName: "Pat",
      lastName: "Ient",
      email: "p@test.com",
    });

    paymentUtilMocks.processPayment.mockResolvedValue({
      meta: { authorization: {} },
    });

    const req = {
      params: { _id: appointmentId },
      user: { _id: patientId },
      body: { amount: 5000, currency: "RWF" },
      protocol: "http",
      get: () => "localhost:8000",
    };
    const res = createRes();
    await initiateAppointmentPayment(req, res, vi.fn());

    expect(paymentUtilMocks.processPayment).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.paymentResponse).toBeDefined();
  });
});
