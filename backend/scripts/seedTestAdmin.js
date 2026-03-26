import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Admin from "../models/admin.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const TEST_ADMIN = {
  email: "test.admin@mobirehab.com",
  phoneNumber: "+3659962696",
  password: "Test123!",
  role: "super-admin",
  isActive: true,
  lastLogin: new Date(),
  createdBy: null,
  loginAttempts: 0,
  lockUntil: null,
  twoFactorSecret: null,
  isTwoFactorEnabled: false,
};

const seedTestAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DBCONNECTION);
    console.log("Connected.\n");

    const existing = await Admin.findOne({ email: TEST_ADMIN.email });
    if (existing) {
      console.log("Test admin already exists. Updating...");
      existing.phoneNumber = TEST_ADMIN.phoneNumber;
      existing.role = TEST_ADMIN.role;
      existing.isActive = true;
      existing.lastLogin = TEST_ADMIN.lastLogin;
      existing.loginAttempts = 0;
      existing.lockUntil = null;
      existing.isTwoFactorEnabled = false;
      existing.twoFactorSecret = null;
      await existing.save();
      console.log("Updated:", existing.email, "| role:", existing.role);
    } else {
      const admin = new Admin(TEST_ADMIN);
      await admin.save();
      console.log("Created test admin:");
      console.log("  Email:", admin.email);
      console.log("  Password: Test123!");
      console.log("  role:", admin.role);
    }

    console.log("\nDone.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedTestAdmin();
  