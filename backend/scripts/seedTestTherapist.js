/**
 * Seed a test therapist with isVerified: true (bypasses email verification).
 * Run from project root: node backend/scripts/seedTestTherapist.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Therapist from "../models/therapist.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const TEST_THERAPIST = {
  firstName: "Test",
  lastName: "Therapist",
  email: "test.therapist@mobirehab.com",
  phoneNumber: "+250788000000",
  gender: "Male",
  address: {
    country: "Rwanda",
    city: "Kigali",
    district: "Gasabo",
    street: "KN 1 St",
  },
  profession: "Physiotherapy",
  bio: "Test therapist account for development.",
  numOfYearsOfExperience: "5",
  specialization: "Physiotherapist",
  licenseNumber: "TEST-LIC-001",
  password: "Test123!",
  isVerified: true,
  active: true,
};

const TEST_THERAPIST_2 = {
  firstName: "Lao",
  lastName: "Zhongyi",
  email: "laozhongyi@gmail.com",
  phoneNumber: "+250788123456",
  gender: "Male",
  address: {
    country: "Rwanda",
    city: "Kigali",
    district: "Gasabo",
    street: "Nyabugogo",
  },
  profession: "Physiotherapy",
  bio: "I am a physiotherapist with 5 years of experience. I specialize in physiotherapy and rehabilitation.",
  numOfYearsOfExperience: "5",
  specialization: "Medical Doctor",
  licenseNumber: "123456",
  password: "Test123!",
  isVerified: true,
  active: true,
};

const seedTestTherapist = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DBCONNECTION);
    console.log("Connected.\n");

    const existing = await Therapist.findOne({ email: TEST_THERAPIST_2.email });
    if (existing) {
      console.log("Test therapist already exists. Updating to verified...");
      existing.isVerified = true;
      existing.active = true;
      await existing.save();
      console.log("Updated:", existing.email, "| isVerified:", existing.isVerified);
    } else {
      const therapist = new Therapist(TEST_THERAPIST_2);
      await therapist.save();
      console.log("Created test therapist:");
      console.log("  Email:", therapist.email);
      console.log("  Password: Test123!");
      console.log("  isVerified:", therapist.isVerified);
    }

    console.log("\nDone.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedTestTherapist();
