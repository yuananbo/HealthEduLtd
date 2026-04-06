// appointment.service.js
import Appointment from "../models/appointment.model.js";
import Therapist from "../models/therapist.model.js";
import Patient from "../models/patient.model.js";
import { sendEmail } from "../utils/sendGridEmail.js";
import { ForbiddenError, NotFoundError } from "../utils/error.js";
import SessionNote from "../models/sessionNotes.model.js";
import AvailabilityService from "./availability.service.js";
import {
  appointmentConfirmationTemplate,
  appointmentStatusUpdate,
} from "../utils/emailTemplates.js";

class AppointmentService {
  static VALID_STATUS_OPTIONS = [
    "Pending",
    "Accepted",
    "Declined",
    "Completed",
    "Cancelled",
    "Rescheduled",
    "Waiting for Payment",
  ];

  // Allowed status transitions: key = current status, value = allowed next statuses
  static VALID_TRANSITIONS = {
    "Waiting for Payment": ["Pending", "Cancelled"],
    "Pending": ["Accepted", "Declined", "Cancelled"],
    "Rescheduled": ["Accepted", "Declined", "Cancelled"],
    "Accepted": ["Completed", "Cancelled"],
    "Declined": [],
    "Completed": [],
    "Cancelled": [],
  };

  static buildActorFromRequest(req) {
    const user = req?.user;

    if (!user) {
      return {
        userId: null,
        userType: "system",
        name: "System",
      };
    }

    return {
      userId: user._id || null,
      userType: user.userType || "system",
      name:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email ||
        user.role ||
        user.userType ||
        "System",
    };
  }

  static appendStatusHistory(
    appointment,
    { status, fromStatus = "", actor, source = "system", reason = "" }
  ) {
    appointment.statusHistory = appointment.statusHistory || [];
    appointment.statusHistory.push({
      status,
      fromStatus,
      changedAt: new Date(),
      source,
      reason,
      changedBy: actor || {
        userId: null,
        userType: "system",
        name: "System",
      },
    });
  }

  static async updateStatusWithHistory(
    appointment,
    { status, actor, source = "system", reason = "" }
  ) {
    const previousStatus = appointment.status;
    appointment.status = status;
    this.appendStatusHistory(appointment, {
      status,
      fromStatus: previousStatus,
      actor,
      source,
      reason,
    });
    await appointment.save();
    return appointment;
  }

  // Create a new appointment
  static async createAppointment({
    therapist,
    date,
    time,
    service,
    purpose,
    payment,
    patientId,
    notes,
    appointmentType,
    homeAddress,
  }) {
    const existingTherapist = await Therapist.findById(therapist);
    if (!existingTherapist) {
      throw new Error("Therapist not found");
    }

    const appointmentData = {
      patient: patientId,
      therapist,
      date,
      time,
      service,
      purpose,
      payment,
      notes: notes || "",
      appointmentType: appointmentType || "in-person",
    };

    if (appointmentType === "home-care" && homeAddress) {
      appointmentData.homeAddress = homeAddress;
    }

    const newAppointment = new Appointment(appointmentData);
    this.appendStatusHistory(newAppointment, {
      status: newAppointment.status,
      actor: {
        userId: patientId,
        userType: "patient",
        name: "Patient",
      },
      source: "booking-created",
      reason: "Appointment created",
    });

    const savedAppointment = await newAppointment.save();

    const patientDetails = await Patient.findById(patientId);
    const therapistDetails = await Therapist.findById(therapist);

    const patientEmailData = this.getPatientEmailData(
      patientDetails,
      therapistDetails,
      savedAppointment
    );
    const therapistEmailData = this.getTherapistEmailData(
      patientDetails,
      therapistDetails,
      savedAppointment
    );

    const patientEmailResponse = await sendEmail(patientEmailData);
    const therapistEmailResponse = await sendEmail(therapistEmailData);

    return {
      appointment: savedAppointment,
      patientEmailResponse,
      therapistEmailResponse,
    };
  }

  static getPatientEmailData(patientDetails, therapistDetails, appointment) {
    return {
      recipientEmail: patientDetails.email,
      subject: "Appointment Confirmation",
      htmlContent: appointmentConfirmationTemplate({
        appointment: {
          name: `${patientDetails.firstName}`,
          therapistName: `Dr. ${therapistDetails.firstName}`,
          date: appointment.date.toDateString(),
          time: appointment.time,
          status: appointment.status,
        },
      }),
    };
  }

  static getTherapistEmailData(patientDetails, therapistDetails, appointment) {
    return {
      recipientEmail: therapistDetails.email,
      subject: "New Appointment Notification",
      template_data: {
        name: `${therapistDetails.firstName} ${therapistDetails.lastName}`,
        patientName: `${patientDetails.firstName} ${patientDetails.lastName}`,
        date: appointment.date.toDateString(),
        time: appointment.time,
        service: appointment.service,
        purpose: appointment.purpose,
        status: appointment.status,
      },
      emailType: "appointment_therapist",
    };
  }

  // Find appointments for a patient
  static async findAppointmentsByPatient(
    patientId,
    { page = 1, limit = 10 } = {}
  ) {
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
      throw new NotFoundError("Patient not found");
    }

    const skip = (page - 1) * limit;
    const appointments = await Appointment.find({ patient: patientId })
      .sort({ date: -1, createdAt: -1 })
      .populate(
        "therapist",
        "firstName lastName specialization profilePicture address"
      )
      .limit(limit)
      .skip(skip);
    const total = await Appointment.countDocuments({ patient: patientId });

    return { appointments, total, page, limit };
  }

  // Find appointments for a therapist
  static async findAppointmentsByTherapist(
    therapistId,
    { page = 1, limit = 10 } = {}
  ) {
    const therapistExists = await Therapist.findById(therapistId);
    if (!therapistExists) {
      throw new NotFoundError("Therapist not found");
    }

    const skip = (page - 1) * limit;
    const appointments = await Appointment.find({ therapist: therapistId })
      .populate("patient", "firstName lastName")
      .limit(limit)
      .skip(skip);
    const total = await Appointment.countDocuments({ therapist: therapistId });

    return { appointments, total, page, limit };
  }

  // Fetch appointment by ID
  static async getAppointmentById(appointmentId) {
    const appointment = await Appointment.findById(appointmentId).populate(
      "sessionNotes"
    );

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    return appointment;
  }

  // Update appointment status
  // static async updateAppointmentStatus(appointmentId, status) {
  //   const appointment = await Appointment.findById(appointmentId);
  //   if (!appointment) {
  //     throw new NotFoundError("Appointment not found");
  //   }
  //   const validStatuses = [
  //     "Pending",
  //     "Accepted",
  //     "Declined",
  //     "Done",
  //     "Cancelled",
  //   ];

  //   if (!validStatuses.includes(status)) {
  //     throw new Error("Invalid status");
  //   }

  //   appointment.status = status;
  //   await appointment.save();

  // // send email to patient after appointment status is updated
  //   const patientDetails = await Patient.findById(appointment.patient);
  //   const therapistDetails = await Therapist.findById(appointment.therapist);

  //   const patientEmailData = {
  //     recipientEmail: patientDetails.email,
  //     subject: "Appointment Status Update",
  //     template_data: {
  //       name: `${patientDetails.firstName} ${patientDetails.lastName}`,
  //       therapistName: `${therapistDetails.firstName} ${therapistDetails.lastName}`,
  //       date: appointment.date.toDateString(),
  //       time: appointment.time,
  //       status: appointment.status,
  //       appointmentId: appointment._id,
  //     },
  //     emailType: "appointment_status_update",
  //   };

  //   const patientEmailResponse = await sendEmail(patientEmailData);

  //   return { appointment, patientEmailResponse };

  // }

  static async updateAppointmentStatus(appointmentId, status, req) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    if (!this.VALID_STATUS_OPTIONS.includes(status)) {
      throw new Error("Invalid status");
    }

    if (appointment.status === status) {
      return { appointment };
    }

    const allowedTransitions = this.VALID_TRANSITIONS[appointment.status] || [];
    if (!allowedTransitions.includes(status)) {
      const transitionError = new Error(
        `Cannot transition appointment from "${appointment.status}" to "${status}"`
      );
      transitionError.status = 400;
      throw transitionError;
    }

    await this.updateStatusWithHistory(appointment, {
      status,
      actor: this.buildActorFromRequest(req),
      source: req?.user?.userType === "admin" ? "admin-action" : "user-action",
      reason: req?.body?.reason || "",
    });

    if (status === "Cancelled") {
      await AvailabilityService.releaseTimeSlot(
        appointment.therapist,
        appointment.date,
        appointment.time
      );
    }

    // Slot reservation is handled during booking; acceptance shouldn't re-lock slots.

    // Only notify patient on Declined; no email when status becomes Accepted (therapist or admin).
    if (status === "Declined") {
      const baseURL =
        req?.protocol && typeof req?.get === "function"
          ? `${req.protocol}://${req.get("host")}`
          : "";
      const appointmentLinkPatient = baseURL
        ? `${baseURL}/patient/appointments/${appointment._id}`
        : "";
      const patientDetails = await Patient.findById(appointment.patient);
      const therapistDetails = await Therapist.findById(appointment.therapist);

      const patientEmailData = {
        recipientEmail: patientDetails.email,
        subject: `Appointment ${status} by: ${therapistDetails.firstName} ${therapistDetails.lastName}`,
        htmlContent: appointmentStatusUpdate({
          template_data: {
            subject: `Appointment ${status}: ${therapistDetails.firstName} ${therapistDetails.lastName}`,
            name: `${patientDetails.firstName} ${patientDetails.lastName}`,
            therapistName: `${therapistDetails.firstName} ${therapistDetails.lastName}`,
            date: appointment.date.toDateString(),
            time: appointment.time,
            status: status,
            link: appointmentLinkPatient,
            message:
              status === "Accepted"
                ? "Your appointment has been accepted by the therapist."
                : "Unfortunately, your appointment has been declined by the therapist.",
          },
        }),
        req,
      };

      const patientEmailResponse = await sendEmail(patientEmailData);
      return { appointment, patientEmailResponse };
    }

    return { appointment };
  }

  // Delete appointment
  static async deleteAppointment(appointmentId) {
    const appointment = await Appointment.findByIdAndDelete(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }
    return appointment;
  }

  // Patient rescheduling an appointment with a therapist. This function is to allow patient to reschedule an appointment with a therapist by updating the appointment details.
  // This is valid on for 48 hours after appointment have been booked...after 48 hours appointment can't be rescheduled.
  static async rescheduleAppointment(appointmentId, newDate, newTime) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    const currentDate = new Date();
    const appointmentDate = new Date(appointment.date);
    const timeDifference = currentDate - appointmentDate;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > 48) {
      throw new Error("Appointment cannot be rescheduled after 48 hours");
    }

    appointment.date = newDate;
    appointment.time = newTime;
    this.appendStatusHistory(appointment, {
      status: "Rescheduled",
      fromStatus: appointment.status,
      actor: {
        userId: appointment.patient,
        userType: "patient",
        name: "Patient",
      },
      source: "reschedule",
      reason: "Appointment date or time updated",
    });
    appointment.status = "Rescheduled";

    try {
      await appointment.save();
      return appointment;
    } catch (error) {
      console.error("Error saving appointment:", error);
      throw new Error("Failed to save rescheduled appointment");
    }
  }

  // Cancel an appointment. An apppointment can either be cancelled by patient or therapist.

  // Getting upcoming appointments for a therapist || patient
  static async upcomingAppointments(userId, userType) {
    const query =
      userType === "patient" ? { patient: userId } : { therapist: userId };

    // Appointment dates are stored without time-of-day; compare against start of today
    // so that "today" appointments aren't incorrectly treated as past.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      ...query,
      date: { $gte: startOfToday },
      status: { $in: ["Pending", "Accepted", "Rescheduled"] },
    })
      .sort({ date: 1 })
      .populate("patient", "firstName lastName")
      .populate("therapist", "firstName lastName specialization");

    return appointments;
  }

  // Add appointment notes during an appointment. This function is to allow therapist to add notes during an appointment with a patient.
  static async addAppointmentNotes(appointmentId, notes) {
    // console.log("notes", notes);

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    const sessionNotes = new SessionNote({
      appointment: appointmentId,
      reason: notes.reason,
      note: notes.note,
    });

    await sessionNotes.save();

    appointment.sessionNotes.push(sessionNotes._id);

    await appointment.save();

    return Appointment.findById(appointmentId).populate("sessionNotes");
  }

  // Patients and therapist cancel an appointment. This can be possible if a patient wants to cancel an appointment with a therapist only if the appointments is still pending and if its not 48 hours to the appointment date.
  static async cancelAppointment(appointmentId, req) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Authorization: only the patient or therapist on the appointment can cancel
    const userId = req?.user?._id;
    const userType = req?.user?.userType;
    if (userType === "patient") {
      if (appointment.patient.toString() !== userId.toString()) {
        throw new ForbiddenError("You do not have permission to cancel this appointment");
      }
    } else if (userType === "therapist") {
      if (appointment.therapist.toString() !== userId.toString()) {
        throw new ForbiddenError("You do not have permission to cancel this appointment");
      }
    } else {
      throw new ForbiddenError("You do not have permission to cancel this appointment");
    }

    const currentDate = new Date();
    const appointmentDate = new Date(appointment.date);

    // Only allow cancelling future appointments more than 48 hours away
    const hoursUntilAppointment =
      (appointmentDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

    const cancellableStatuses = [
      "Waiting for Payment",
      "Pending",
      "Accepted",
      "Rescheduled",
    ];
    if (!cancellableStatuses.includes(appointment.status)) {
      throw new Error("This appointment cannot be cancelled in its current status.");
    }
    if (hoursUntilAppointment < 48) {
      throw new Error("Appointments cannot be cancelled within 48 hours of the appointment date.");
    }

    await this.updateStatusWithHistory(appointment, {
      status: "Cancelled",
      actor: this.buildActorFromRequest(req),
      source: "cancellation",
      reason: req?.body?.reason || "Appointment cancelled",
    });

    try {
      // Release the slot back to availability.
      await AvailabilityService.releaseTimeSlot(
        appointment.therapist,
        appointment.date,
        appointment.time
      );

      const baseURL = `${req.protocol}://${req.get("host")}`;
      const appointmentLinkPatient = `${baseURL}/patient/appointments/${appointment._id}`;

      const patientDetails = await Patient.findById(appointment.patient);
      const therapistDetails = await Therapist.findById(appointment.therapist);
      const patientEmailData = {
        recipientEmail: patientDetails.email,
        subject: `Appointment Cancelled: ${therapistDetails.firstName} ${therapistDetails.lastName}`,
        htmlContent: appointmentStatusUpdate({
          template_data: {
            name: `${patientDetails.firstName} ${patientDetails.lastName}`,
            therapistName: `${therapistDetails.firstName} ${therapistDetails.lastName}`,
            date: appointment.date.toDateString(),
            time: appointment.time,
            status: appointment.status,
            link: appointmentLinkPatient,
            message:
              req?.user?.userType === "patient"
                ? "Your appointment has been cancelled by the patient."
                : "Your appointment has been cancelled by the therapist.",
          },
        }),
        req,
      };

      const therapistEmailData = {
        recipientEmail: therapistDetails.email,
        subject: `Appointment Cancelled: ${patientDetails.firstName} ${patientDetails.lastName}`,
        htmlContent: appointmentStatusUpdate({
          template_data: {
            name: therapistDetails.firstName,
            therapistName: therapistDetails.firstName,
            date: appointment.date.toDateString(),
            time: appointment.time,
            status: appointment.status,
            link: appointmentLinkPatient,
            message: "An appointment has been cancelled by the patient.",
          },
        }),
        req,
      };

      const patientEmailResponse = await sendEmail(patientEmailData);
      const therapistEmailResponse = await sendEmail(therapistEmailData);
      return { appointment, patientEmailResponse, therapistEmailResponse };
    } catch (error) {
      console.error("Error saving appointment:", error);
      throw new Error("Failed to cancel appointment");
    }
  }
}

export default AppointmentService;
