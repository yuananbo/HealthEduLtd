import assert from "node:assert/strict";
import test from "node:test";
import Admin from "../../models/admin.model.js";
import Appointment from "../../models/appointment.model.js";
import AdminService from "../../services/admin.service.js";
import AppointmentService from "../../services/appointment.service.js";
import AvailabilityService from "../../services/availability.service.js";

const originalAdminFindById = Admin.findById;
const originalAppointmentFindById = Appointment.findById;
const originalReleaseTimeSlot = AvailabilityService.releaseTimeSlot;

const createAppointmentDouble = (overrides = {}) => ({
  _id: "appointment-1",
  patient: "patient-1",
  therapist: "therapist-1",
  status: "Pending",
  statusHistory: [],
  date: new Date("2026-03-21T00:00:00.000Z"),
  time: "10:00 AM",
  createdAt: new Date("2026-03-19T10:00:00.000Z"),
  updatedAt: new Date("2026-03-19T10:00:00.000Z"),
  saveCalls: 0,
  async save() {
    this.saveCalls += 1;
    this.updatedAt = new Date();
    return this;
  },
  ...overrides,
});

test.afterEach(() => {
  Admin.findById = originalAdminFindById;
  Appointment.findById = originalAppointmentFindById;
  AvailabilityService.releaseTimeSlot = originalReleaseTimeSlot;
});

test("appendStatusHistory stores actor, source, and reason", () => {
  const appointment = createAppointmentDouble();

  AppointmentService.appendStatusHistory(appointment, {
    status: "Waiting for Payment",
    actor: {
      userId: "patient-1",
      userType: "patient",
      name: "Patient One",
    },
    source: "booking-created",
    reason: "Appointment created",
  });

  assert.equal(appointment.statusHistory.length, 1);
  assert.equal(appointment.statusHistory[0].status, "Waiting for Payment");
  assert.equal(appointment.statusHistory[0].changedBy.name, "Patient One");
  assert.equal(appointment.statusHistory[0].source, "booking-created");
});

test("updateAppointmentStatus rejects completing a non-accepted appointment", async () => {
  const appointment = createAppointmentDouble({ status: "Pending" });
  Appointment.findById = async () => appointment;

  await assert.rejects(
    () =>
      AppointmentService.updateAppointmentStatus("appointment-1", "Completed", {
        user: { _id: "therapist-1", userType: "therapist" },
        body: {},
      }),
    (error) => {
      assert.equal(error.status, 400);
      assert.match(
        error.message,
        /Cannot transition appointment from "Pending" to "Completed"/
      );
      return true;
    }
  );
});

test("updateAppointmentStatus cancels appointment, appends history, and releases slot", async () => {
  let releaseCalls = 0;
  const appointment = createAppointmentDouble({ status: "Accepted" });
  Appointment.findById = async () => appointment;
  AvailabilityService.releaseTimeSlot = async () => {
    releaseCalls += 1;
    return { updated: true };
  };

  const result = await AppointmentService.updateAppointmentStatus(
    "appointment-1",
    "Cancelled",
    {
      user: {
        _id: "admin-1",
        userType: "admin",
        firstName: "Admin",
        lastName: "User",
      },
      body: {
        reason: "Admin cancelled duplicate booking",
      },
    }
  );

  assert.equal(result.appointment.status, "Cancelled");
  assert.equal(releaseCalls, 1);
  assert.equal(result.appointment.statusHistory.length, 1);
  assert.equal(result.appointment.statusHistory[0].source, "admin-action");
  assert.equal(
    result.appointment.statusHistory[0].reason,
    "Admin cancelled duplicate booking"
  );
});

test("updateAppointmentStatus does not save when status is unchanged", async () => {
  const appointment = createAppointmentDouble({ status: "Cancelled" });
  Appointment.findById = async () => appointment;

  const result = await AppointmentService.updateAppointmentStatus(
    "appointment-1",
    "Cancelled",
    {
      user: { _id: "admin-1", userType: "admin" },
      body: {},
    }
  );

  assert.equal(result.appointment.status, "Cancelled");
  assert.equal(appointment.saveCalls, 0);
});

test("getAdminBookingById synthesizes legacy history when record has none", async () => {
  Admin.findById = async () => ({
    _id: "admin-1",
    role: "admin",
    userType: "admin",
  });
  Appointment.findById = () => ({
    populate() {
      return this;
    },
    lean: async () => ({
      _id: "appointment-legacy",
      status: "Pending",
      createdAt: new Date("2026-03-18T10:00:00.000Z"),
      patient: {
        _id: "patient-1",
        firstName: "Legacy",
        lastName: "Patient",
        email: "legacy@example.com",
      },
      therapist: {
        _id: "therapist-1",
        firstName: "Legacy",
        lastName: "Therapist",
        email: "therapist@example.com",
      },
    }),
  });

  const booking = await AdminService.getAdminBookingById(
    "admin-1",
    "appointment-legacy"
  );

  assert.equal(booking.statusHistory.length, 1);
  assert.equal(booking.statusHistory[0].source, "legacy-record");
  assert.equal(booking.statusHistory[0].status, "Pending");
});