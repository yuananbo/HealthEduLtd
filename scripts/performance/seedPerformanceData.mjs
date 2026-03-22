import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Admin from "../../backend/models/admin.model.js";
import Appointment from "../../backend/models/appointment.model.js";
import DailyCheckIn from "../../backend/models/dailyCheckIn.model.js";
import Patient from "../../backend/models/patient.model.js";
import Payment from "../../backend/models/payment.model.js";
import Therapist from "../../backend/models/therapist.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

const PERF_PASSWORD = "Perf123!";

const perfUsers = {
  admin: {
    email: "perf.admin@mobirehab.com",
    password: PERF_PASSWORD,
    firstName: "Perf",
    lastName: "Admin",
  },
  patient: {
    email: "perf.patient@mobirehab.com",
    password: PERF_PASSWORD,
    firstName: "Perf",
    lastName: "Patient",
  },
  therapist: {
    email: "perf.therapist@mobirehab.com",
    password: PERF_PASSWORD,
    firstName: "Perf",
    lastName: "Therapist",
  },
};

async function upsertAdmin() {
  let admin = await Admin.findOne({ email: perfUsers.admin.email });
  if (!admin) {
    admin = new Admin({
      firstName: perfUsers.admin.firstName,
      lastName: perfUsers.admin.lastName,
      email: perfUsers.admin.email,
      phoneNumber: "+250788900001",
      password: perfUsers.admin.password,
      role: "super-admin",
      isActive: true,
    });
  } else {
    admin.firstName = perfUsers.admin.firstName;
    admin.lastName = perfUsers.admin.lastName;
    admin.phoneNumber = "+250788900001";
    admin.password = perfUsers.admin.password;
    admin.role = "super-admin";
    admin.isActive = true;
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
  }

  await admin.save();
  return admin;
}

async function upsertPatient() {
  const hashedPassword = await bcrypt.hash(perfUsers.patient.password, 10);
  let patient = await Patient.findOne({ email: perfUsers.patient.email });

  const payload = {
    firstName: perfUsers.patient.firstName,
    lastName: perfUsers.patient.lastName,
    email: perfUsers.patient.email,
    gender: "Female",
    dateOfBirth: new Date("1990-06-15"),
    age: 35,
    phoneNumber: "+250788900002",
    guardianPhoneNumber: "+250788900099",
    address: {
      country: "Rwanda",
      city: "Kigali",
      district: "Gasabo",
      street: "KG 11 Ave",
    },
    password: hashedPassword,
    userType: "patient",
    isActive: true,
    medicalHistory: [
      { condition: "Hypertension", diagnosedDate: new Date("2023-02-14") },
      { condition: "Lower back pain", diagnosedDate: new Date("2024-01-10") },
    ],
    vitals: [
      { type: "Height", value: "168", unit: "cm" },
      { type: "Weight", value: "70", unit: "kg" },
      { type: "Blood Type", value: "O+", unit: "" },
    ],
    medications: [
      { name: "Amlodipine", dosage: "5 mg", frequency: "Once daily" },
      { name: "Ibuprofen", dosage: "400 mg", frequency: "As needed" },
    ],
    emergencyContact: "Perf Guardian",
    height: 168,
    weight: 70,
    bloodType: "O+",
  };

  if (!patient) {
    patient = new Patient(payload);
  } else {
    Object.assign(patient, payload);
  }

  await patient.save();
  return patient;
}

async function upsertTherapist() {
  let therapist = await Therapist.findOne({ email: perfUsers.therapist.email }).select(
    "+password"
  );

  const payload = {
    firstName: perfUsers.therapist.firstName,
    lastName: perfUsers.therapist.lastName,
    email: perfUsers.therapist.email,
    phoneNumber: "+250788900003",
    gender: "Male",
    address: {
      country: "Rwanda",
      city: "Kigali",
      district: "Gasabo",
      street: "KG 22 Ave",
    },
    profession: "Physical Therapist",
    bio: "Performance testing therapist account.",
    numOfYearsOfExperience: "7",
    specialization: "Physiotherapist",
    licenseNumber: "PERF-THERAPIST-001",
    password: perfUsers.therapist.password,
    isVerified: true,
    active: true,
  };

  if (!therapist) {
    therapist = new Therapist(payload);
  } else {
    Object.assign(therapist, payload);
  }

  await therapist.save();
  return therapist;
}

async function upsertAppointment({ slug, patientId, therapistId, date, time, status, appointmentType }) {
  let appointment = await Appointment.findOne({ notes: `perf-seed:${slug}` });
  const payload = {
    patient: patientId,
    therapist: therapistId,
    date,
    time,
    status,
    appointmentType,
    service: "revisit",
    purpose: `Performance seed appointment ${slug}`,
    notes: `perf-seed:${slug}`,
    homeAddress:
      appointmentType === "home-care"
        ? {
            country: "Rwanda",
            city: "Kigali",
            district: "Gasabo",
            street: "KG 11 Ave",
          }
        : {},
  };

  if (!appointment) {
    appointment = new Appointment(payload);
  } else {
    Object.assign(appointment, payload);
  }

  await appointment.save();
  return appointment;
}

async function upsertPayment({ appointmentId, purpose, status, amount }) {
  let payment = await Payment.findOne({ appointment: appointmentId });
  if (!payment) {
    payment = new Payment({
      appointment: appointmentId,
      purpose,
      status,
      amount,
      currency: "RWF",
    });
  } else {
    payment.status = status;
    payment.amount = amount;
    payment.currency = "RWF";
  }

  await payment.save();
  return payment;
}

async function upsertDailyCheckIn({ patientId, date, painLevel, systolic, diastolic, heartRateBpm, weightKg, sugar, mood, notes }) {
  const existing = await DailyCheckIn.findOne({ patient: patientId, date });
  const payload = {
    patient: patientId,
    date,
    painLevel,
    exerciseCompleted: true,
    adlIndependence: "Independent",
    bloodPressure: { systolic, diastolic },
    heartRateBpm,
    weightKg,
    bloodSugar: { value: sugar, unit: "mmol/L" },
    mood,
    notes,
  };

  if (!existing) {
    await DailyCheckIn.create(payload);
    return;
  }

  Object.assign(existing, payload);
  await existing.save();
}

export async function seedPerformanceData() {
  await mongoose.connect(process.env.DBCONNECTION);

  try {
    const admin = await upsertAdmin();
    const patient = await upsertPatient();
    const therapist = await upsertTherapist();

    const now = new Date();
    const completedAppointment = await upsertAppointment({
      slug: "completed",
      patientId: patient._id,
      therapistId: therapist._id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 10, 0, 0),
      time: "10:00",
      status: "Completed",
      appointmentType: "in-person",
    });

    const acceptedAppointment = await upsertAppointment({
      slug: "accepted",
      patientId: patient._id,
      therapistId: therapist._id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0, 0),
      time: "11:00",
      status: "Accepted",
      appointmentType: "home-care",
    });

    const pendingAppointment = await upsertAppointment({
      slug: "pending",
      patientId: patient._id,
      therapistId: therapist._id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 9, 0, 0),
      time: "09:00",
      status: "Pending",
      appointmentType: "online",
    });

    await upsertPayment({
      appointmentId: completedAppointment._id,
      purpose: "consultation",
      status: "success",
      amount: 15000,
    });
    await upsertPayment({
      appointmentId: acceptedAppointment._id,
      purpose: "registration",
      status: "success",
      amount: 5000,
    });

    await upsertDailyCheckIn({
      patientId: patient._id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString().slice(0, 10),
      painLevel: 4,
      systolic: 122,
      diastolic: 80,
      heartRateBpm: 73,
      weightKg: 70,
      sugar: 5.6,
      mood: "Okay",
      notes: "Steady recovery",
    });
    await upsertDailyCheckIn({
      patientId: patient._id,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().slice(0, 10),
      painLevel: 3,
      systolic: 120,
      diastolic: 78,
      heartRateBpm: 72,
      weightKg: 69.8,
      sugar: 5.4,
      mood: "Good",
      notes: "Pain reduced after exercise",
    });
    await upsertDailyCheckIn({
      patientId: patient._id,
      date: now.toISOString().slice(0, 10),
      painLevel: 2,
      systolic: 118,
      diastolic: 77,
      heartRateBpm: 70,
      weightKg: 69.5,
      sugar: 5.3,
      mood: "Good",
      notes: "Ready for next session",
    });

    return {
      users: perfUsers,
      ids: {
        adminId: String(admin._id),
        patientId: String(patient._id),
        therapistId: String(therapist._id),
        completedAppointmentId: String(completedAppointment._id),
        acceptedAppointmentId: String(acceptedAppointment._id),
        pendingAppointmentId: String(pendingAppointment._id),
      },
    };
  } finally {
    await mongoose.disconnect();
  }
}
