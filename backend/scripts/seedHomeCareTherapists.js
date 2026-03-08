/**
 * Seed 6 mock "Assisted Home Care" therapists (verified) + active availabilities.
 *
 * Run from project root:
 *   node backend/scripts/seedHomeCareTherapists.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import moment from "moment";
import path from "path";
import { fileURLToPath } from "url";

import Therapist from "../models/therapist.model.js";
import Availability from "../models/availability.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const DEFAULT_PASSWORD = "Test123!";
const DEFAULT_ADDRESS = {
  country: "Rwanda",
  city: "Kigali",
  district: "Gasabo",
  street: "KG 123 St",
};

const TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00"];

const SEED_THERAPISTS = [
  {
    firstName: "Aline",
    lastName: "Mukamana",
    email: "homecare.physio@mobirehab.com",
    phoneNumber: "+250788100001",
    gender: "Female",
    profession: "Physical Therapist",
    specialization: "Physiotherapist",
    licenseNumber: "HC-PT-001",
    bio: "Home-based physical rehabilitation focused on mobility and strength.",
    numOfYearsOfExperience: "6",
  },
  {
    firstName: "Jean",
    lastName: "Ndayishimiye",
    email: "homecare.ot@mobirehab.com",
    phoneNumber: "+250788100002",
    gender: "Male",
    profession: "Occupational Therapist",
    specialization: "Occupational Therapist",
    licenseNumber: "HC-OT-001",
    bio: "Daily living support and functional rehabilitation in your home.",
    numOfYearsOfExperience: "5",
  },
  {
    firstName: "Chantal",
    lastName: "Uwamahoro",
    email: "homecare.po@mobirehab.com",
    phoneNumber: "+250788100003",
    gender: "Female",
    profession: "Prosthetics & Orthotics Specialist",
    specialization: "Prosthetist and Orthotist",
    licenseNumber: "HC-PO-001",
    bio: "Device fitting, comfort checks, and long-term orthotics care.",
    numOfYearsOfExperience: "7",
  },
  {
    firstName: "Eric",
    lastName: "Habimana",
    email: "homecare.md@mobirehab.com",
    phoneNumber: "+250788100004",
    gender: "Male",
    profession: "Family Medicine Doctor",
    specialization: "Medical Doctor",
    licenseNumber: "HC-MD-001",
    bio: "Comprehensive chronic care plans and home-based monitoring.",
    numOfYearsOfExperience: "9",
  },
  {
    firstName: "Grace",
    lastName: "Nyiraneza",
    email: "homecare.counselor@mobirehab.com",
    phoneNumber: "+250788100005",
    gender: "Female",
    profession: "Mental Health Counselor",
    specialization: "Counsellor",
    licenseNumber: "HC-MH-001",
    bio: "Confidential counseling for stress, depression, and addiction support.",
    numOfYearsOfExperience: "4",
  },
  {
    firstName: "Patrick",
    lastName: "Bizimana",
    email: "homecare.nutrition@mobirehab.com",
    phoneNumber: "+250788100006",
    gender: "Male",
    profession: "Nutritionist",
    specialization: "Nutritionist",
    licenseNumber: "HC-NU-001",
    bio: "Lifestyle-based nutrition coaching for weight and blood pressure goals.",
    numOfYearsOfExperience: "5",
  },
];

function buildNext7DaysAvailabilities() {
  // Store availability dates as UTC date-only (00:00Z) to avoid timezone shifts in UI.
  const start = moment.utc().add(1, "day").startOf("day");
  return Array.from({ length: 7 }).map((_, i) => ({
    date: start.clone().add(i, "day").toDate(),
    times: TIMES.map((t) => ({ time: t, isActive: true })),
  }));
}

async function upsertTherapist(seed) {
  const data = {
    ...seed,
    address: DEFAULT_ADDRESS,
    password: DEFAULT_PASSWORD,
    isVerified: true,
    active: true,
  };

  const existing = await Therapist.findOne({ email: data.email });
  if (existing) {
    Object.assign(existing, data);
    await existing.save();
    return existing;
  }

  const therapist = new Therapist(data);
  await therapist.save();
  return therapist;
}

async function ensureActiveAvailability(therapist) {
  const availabilityName = `seed-homecare-${therapist.specialization}`;

  const existing = await Availability.findOne({
    therapist: therapist._id,
    availabilityName,
  });

  const availabilities = buildNext7DaysAvailabilities();

  if (existing) {
    existing.isActive = true;
    existing.availabilities = availabilities;
    await existing.save();
    return existing;
  }

  const availability = new Availability({
    therapist: therapist._id,
    availabilityName,
    isActive: true,
    availabilities,
  });
  await availability.save();
  return availability;
}

async function main() {
  if (!process.env.DBCONNECTION) {
    throw new Error(
      "Missing DBCONNECTION. Ensure backend/.env contains DBCONNECTION=..."
    );
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.DBCONNECTION);
  console.log("Connected.\n");

  const results = [];
  for (const seed of SEED_THERAPISTS) {
    const therapist = await upsertTherapist(seed);
    const availability = await ensureActiveAvailability(therapist);
    results.push({ therapist, availability });
  }

  console.log("Seeded Home Care therapists:");
  results.forEach(({ therapist, availability }) => {
    console.log(
      `- ${therapist.firstName} ${therapist.lastName} | ${therapist.specialization} | ${therapist.email} | availability: ${availability.availabilityName}`
    );
  });
  console.log(`\nPassword for all seeded therapists: ${DEFAULT_PASSWORD}`);
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });

