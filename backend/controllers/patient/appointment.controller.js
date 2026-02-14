import { asyncHandler } from "../../middleware/asyncHandler.js";
import Appointment from "../../models/appointment.model.js";
import Patient from "../../models/patient.model.js";
import Payment from "../../models/payment.model.js";
import Therapist from "../../models/therapist.model.js";
import AppointmentService from "../../services/appointment.service.js";
import {
  appointmentConfirmationTemplate,
  appointmentConfrimationTherapistTemplate,
} from "../../utils/emailTemplates.js";
import processPayment from "../../utils/payment.js";
import { sendEmail } from "../../utils/sendGridEmail.js";

// import paymentGateway from "../utils/paymentGateway.js";

// Create a new appointment
// export const createAppointment = async (req, res) => {
//   try {
//     const { therapist, date, time, service, purpose, payment, email } =
//       req.body;
//     const patientId = req.user._id;

//     // Check if the therapist exists
//     const existingTherapist = await Therapist.findById(therapist);
//     if (!existingTherapist) {
//       return res.status(404).json({ error: "Therapist not found" });
//     }

//     const existingPatient = await Patient.findById(patientId);
//     if (!existingPatient) {
//       return res.status(404).json({ error: "Patient not found" });
//     }

//     // Check if the payment details are provided
//     if (!payment) {
//       return res.status(400).json({ error: "Payment details are required" });
//     }

//     // // Validate the payment
//     const paymentResponse = await processPayment({
//       phoneNumber: existingPatient.phoneNumber,
//       amount: payment.amount,
//       therapistId: therapist,
//       currency: payment.method,
//       email: existingPatient.email,
//     });
//     // Update the payment.status based on the payment response
//     if (paymentResponse.status === "success") {
//       payment.isPaid = true;
//     } else {
//       payment.isPaid = false;
//       return res.status(400).json({ error: "Payment failed" });
//     }

//     // Create a new appointment
//     const newAppointment = new Appointment({
//       patient: patientId,
//       therapist,
//       date,
//       time,
//       service,
//       purpose,
//       payment,
//     });

//     // Save the new appointment to the database
//     const savedAppointment = await newAppointment.save();

//     // Fetch patient and therapist details
//     const patientDetails = await Patient.findById(patientId);
//     const therapistDetails = await Therapist.findById(therapist);

//     // For patient
//     const patientEmailData = {
//       recipientEmail: patientDetails.email,
//       subject: "Appointment Confirmation",
//       template_data: {
//         name: `${patientDetails.firstName} ${patientDetails.lastName}`,
//         therapistName: `${therapistDetails.firstName} ${therapistDetails.lastName}`,
//         date: savedAppointment.date.toDateString(),
//         time: savedAppointment.time,
//         status: savedAppointment.status,
//       },
//       req,
//       emailType: "appointment_patient",
//     };

//     // For therapist
//     const therapistEmailData = {
//       recipientEmail: therapistDetails.email,
//       subject: "New Appointment Notification",
//       template_data: {
//         name: `${therapistDetails.firstName} ${therapistDetails.lastName}`,
//         patientName: `${patientDetails.firstName} ${patientDetails.lastName}`,
//         date: savedAppointment.date.toDateString(),
//          time: savedAppointment.time,
//         service: savedAppointment.service,
//         purpose: savedAppointment.purpose,
//         status: savedAppointment.status,
//       },
//       req,
//       emailType: "appointment_therapist",
//     };

//     const patientEmailResponse = await sendEmail(patientEmailData);
//     const therapistEmailResponse = await sendEmail(therapistEmailData);

//     res.status(201).json({
//       appointment: savedAppointment,
//       patientEmailResponse,
//       therapistEmailResponse,
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

export const createAppointment = asyncHandler(async (req, res) => {
  try {
    const {
      therapist,
      date,
      time,
      service,
      purpose,
      paymentDetails,
      notes,
      appointmentType,
      homeAddress,
    } = req.body;
    const patientId = req.user._id;

    // Check if the therapist exists
    const existingTherapist = await Therapist.findById(therapist);
    if (!existingTherapist) {
      return res.status(404).json({ error: "Therapist not found" });
    }

    const existingPatient = await Patient.findById(patientId);
    if (!existingPatient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if the payment details are provided
    if (!paymentDetails) {
      return res.status(400).json({ error: "Payment details are required" });
    }

    // For home-care appointments, validate that home address is provided
    if (appointmentType === "home-care") {
      const addr = homeAddress || {};
      if (!addr.country || !addr.city) {
        return res
          .status(400)
          .json({ error: "Home address (country and city) is required for home care appointments" });
      }
    }

    // Create a new appointment
    const appointmentData = {
      patient: patientId,
      therapist,
      date,
      time,
      service,
      purpose,
      notes: notes || "",
      appointmentType: appointmentType || "in-person",
    };

    if (appointmentType === "home-care" && homeAddress) {
      appointmentData.homeAddress = homeAddress;
    }

    const newAppointment = new Appointment(appointmentData);

    // Save the new appointment to the database
    const savedAppointment = await newAppointment.save();

    // Create a new payment
    const newPayment = new Payment({
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      status: "pending",
      appointment: savedAppointment._id,
    });

    // Save the payment to the database
    await newPayment.save();

    const paymentResponse = await processPayment({
      phoneNumber: existingPatient.phoneNumber,
      fullName: `${existingPatient.firstName} ${existingPatient.lastName}`,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      appointmentId: savedAppointment._id,
      email: existingPatient.email,
      req: req,
    });

    //     // Fetch patient and therapist details
    const patientDetails = await Patient.findById(patientId);
    const therapistDetails = await Therapist.findById(therapist);

    const baseURL = `${req.protocol}://${req.get("host")}`;
    const appointmentLinkPatient = `${baseURL}/patient/appointments/${savedAppointment._id}`;

    // For patient
    const patientEmailData = {
      recipientEmail: patientDetails.email,
      subject: "Appointment Booking Details",
      template_data: {},
      htmlContent: appointmentConfirmationTemplate({
        appointment: {
          subject: "Appointment Booking Details",
          name: `${patientDetails.firstName} ${patientDetails.lastName}`,
          therapistName: `${therapistDetails.firstName} ${therapistDetails.lastName}`,
          date: savedAppointment.date.toDateString(),
          time: savedAppointment.time,
          status: savedAppointment.status,
          link: appointmentLinkPatient,
        },
      }),
    };

    const appointmentLinkTherapist = `${baseURL}/therapist/appointments/${savedAppointment._id}`;
    // For therapist
    const therapistEmailData = {
      recipientEmail: therapistDetails.email,
      subject: "New Appointment Notification",
      template_data: {},
      htmlContent: appointmentConfrimationTherapistTemplate({
        template_data: {
          subject: "New Appointment Notification",
          name: `${therapistDetails.firstName} ${therapistDetails.lastName}`,
          patientName: `${patientDetails.firstName} ${patientDetails.lastName}`,
          date: savedAppointment.date.toDateString(),
          time: savedAppointment.time,
          service: savedAppointment.service,
          purpose: savedAppointment.purpose,
          status: savedAppointment.status,
          link: appointmentLinkTherapist,
        },
      }),
    };

    const patientEmailResponse = await sendEmail(patientEmailData);
    const therapistEmailResponse = await sendEmail(therapistEmailData);

    res.status(201).json({
      appointment: savedAppointment,
      patientEmailResponse,
      therapistEmailResponse,
      paymentResponse,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// red

// Get all appointments

// Get all appointments for the current user
export const getAppointments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const patientId = req.user._id;

  const {
    appointments,
    total,
    page: currentPage,
    limit: currentLimit,
  } = await AppointmentService.findAppointmentsByPatient(patientId, {
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    count: appointments.length,
    total,
    page: currentPage,
    limit: currentLimit,
    data: appointments,
  });
});

// Patient rescheduling an appointment with a therapist. This function is to allow patient to reschedule an appointment with a therapist by updating the appointment details.
// This is valid on for 48 hours after appointment have been booked...after 48 hours appointment can't be rescheduled.

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    const appointmentId = req.params._id;
    const appointment = await AppointmentService.rescheduleAppointment(
      appointmentId,
      newDate,
      newTime
    );
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error in rescheduleAppointment controller:", error);
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Invalid data provided for rescheduling",
        error: error.message,
      });
    } else if (error.message === "Appointment not found") {
      res.status(404).json({ success: false, message: error.message });
    } else if (
      error.message === "Appointment cannot be rescheduled after 48 hours"
    ) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to reschedule appointment",
        error: error.message,
      });
    }
  }
});

// Cancel appointment with therapist
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  const result = await AppointmentService.cancelAppointment(appointmentId, req);

  res.status(200).json({
    success: true,
    data: result.appointment,
  });
});
