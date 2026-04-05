import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Patient from "../models/patient.model.js";
import Therapist from "../models/therapist.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MOCK_BOOKINGS = [
  {
    slug: "ops-payment-follow-up-1",
    status: "Waiting for Payment",
    appointmentType: "in-person",
    service: "Post-Surgery Mobility Review",
    purpose: "Review walking tolerance and pain levels after surgery.",
    time: "08:30",
    dayOffset: 2,
    payment: { amount: 7500, currency: "RWF", status: "pending" },
  },
  {
    slug: "ops-payment-follow-up-2",
    status: "Waiting for Payment",
    appointmentType: "online",
    service: "Remote Rehab Follow-up",
    purpose: "Check adherence to the exercise plan before therapist review.",
    time: "11:00",
    dayOffset: 3,
    payment: { amount: 5000, currency: "RWF", status: "processing" },
  },
  {
    slug: "ops-awaiting-therapist-1",
    status: "Pending",
    appointmentType: "in-person",
    service: "Balance Assessment",
    purpose: "Assess fall risk and gait stability for home exercise planning.",
    time: "13:30",
    dayOffset: 4,
    payment: { amount: 5000, currency: "RWF", status: "success" },
  },
  {
    slug: "ops-awaiting-therapist-2",
    status: "Pending",
    appointmentType: "home-care",
    service: "Home Care Intake",
    purpose: "Evaluate mobility support needs and caregiver setup at home.",
    time: "15:00",
    dayOffset: 5,
    homeAddress: {
      country: "Rwanda",
      city: "Kigali",
      district: "Kicukiro",
      street: "KG 11 Ave",
    },
    payment: { amount: 8500, currency: "RWF", status: "success" },
  },
  {
    slug: "ops-reschedule-review-1",
    status: "Rescheduled",
    appointmentType: "home-care",
    service: "Home Strength Training",
    purpose: "Rescheduled home-care session after caregiver availability changed.",
    time: "10:30",
    dayOffset: 6,
    homeAddress: {
      country: "Rwanda",
      city: "Kigali",
      district: "Gasabo",
      street: "KG 9 Ave",
    },
    payment: { amount: 8000, currency: "RWF", status: "success" },
  },
  {
    slug: "ops-reschedule-review-2",
    status: "Rescheduled",
    appointmentType: "online",
    service: "Virtual Progress Review",
    purpose: "Rescheduled virtual progress review due to therapist conflict.",
    time: "16:00",
    dayOffset: 7,
    payment: { amount: 5000, currency: "RWF", status: "success" },
  },
  {
    slug: "ops-homecare-missing-address",
    status: "Pending",
    appointmentType: "home-care",
    service: "Home Safety Evaluation",
    purpose: "Visit requested but the patient address still needs confirmation.",
    time: "09:30",
    dayOffset: 8,
    homeAddress: {
      country: "",
      city: "",
      district: "",
      street: "",
    },
    payment: { amount: 9000, currency: "RWF", status: "success" },
  },
  {
    slug: "ops-completed-follow-up",
    status: "Completed",
    appointmentType: "in-person",
    service: "Neurological Rehab Review",
    purpose: "Completed session used to compare against open operational items.",
    time: "14:30",
    dayOffset: -3,
    payment: { amount: 7000, currency: "RWF", status: "success" },
  },
];

const buildStatusHistory = (status, patient, therapist, appointmentDate) => [
  {
    status: "Waiting for Payment",
    fromStatus: "",
    changedAt: new Date(appointmentDate.getTime() - 48 * 60 * 60 * 1000),
    source: "booking-created",
    reason: "Mock booking seeded for admin booking operations.",
    changedBy: {
      userId: patient._id,
      userType: "patient",
      name: `${patient.firstName} ${patient.lastName}`,
    },
  },
  ...(status !== "Waiting for Payment"
    ? [
        {
          status,
          fromStatus: "Waiting for Payment",
          changedAt: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000),
          source: "mock-seed",
          reason: "Mock status transition seeded for admin operations review.",
          changedBy: {
            userId: therapist._id,
            userType: "therapist",
            name: `${therapist.firstName} ${therapist.lastName}`,
          },
        },
      ]
    : []),
];

const seedMockBookings = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DBCONNECTION);
    console.log("Connected.\n");

    const patients = await Patient.find({})
      .select("firstName lastName email")
      .limit(10);
    const therapist = await Therapist.findOne({ isVerified: true }).select(
      "firstName lastName email"
    );

    if (patients.length === 0 || !therapist) {
      throw new Error(
        "Need at least one verified therapist and one patient before seeding mock bookings."
      );
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (let index = 0; index < MOCK_BOOKINGS.length; index += 1) {
      const template = MOCK_BOOKINGS[index];
      const patient = patients[index % patients.length];
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + template.dayOffset);
      appointmentDate.setHours(9, 0, 0, 0);

      const notes = `MOCK_BOOKING:${template.slug}`;
      const payload = {
        patient: patient._id,
        therapist: therapist._id,
        date: appointmentDate,
        time: template.time,
        status: template.status,
        appointmentType: template.appointmentType,
        service: template.service,
        purpose: template.purpose,
        notes,
        homeAddress: template.homeAddress || {
          country: "",
          city: "",
          district: "",
          street: "",
        },
        statusHistory: buildStatusHistory(
          template.status,
          patient,
          therapist,
          appointmentDate
        ),
      };

      const existingAppointment = await Appointment.findOne({ notes }).select(
        "_id"
      );

      const appointment = await Appointment.findOneAndUpdate(
        { notes },
        payload,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      await Payment.findOneAndUpdate(
        { appointment: appointment._id },
        {
          appointment: appointment._id,
          amount: template.payment.amount,
          currency: template.payment.currency,
          status: template.payment.status,
          purpose: "registration",
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      if (existingAppointment) {
        updatedCount += 1;
      } else {
        createdCount += 1;
      }
    }

    console.log(`Mock bookings seeded: ${MOCK_BOOKINGS.length}`);
    console.log(`Created: ${createdCount} | Updated: ${updatedCount}`);
    console.log(`Therapist used: ${therapist.email}`);
    console.log(
      `Patients used: ${patients.map((patient) => patient.email).join(", ")}`
    );
    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedMockBookings();
