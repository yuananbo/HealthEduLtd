import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import all models
import Admin from "../models/admin.model.js";
import Patient from "../models/patient.model.js";
import Therapist from "../models/therapist.model.js";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Availability from "../models/availability.model.js";
import SessionNote from "../models/sessionNotes.model.js";
import TherapistRating from "../models/therapistRating.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const initDatabase = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log(`Connection String: ${process.env.DBCONNECTION}`);

    await mongoose.connect(process.env.DBCONNECTION);

    console.log("✅ Connected to MongoDB successfully!");

    // Get database instance
    const db = mongoose.connection.db;

    console.log("\n📊 Database Information:");
    console.log(`Database Name: ${db.databaseName}`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\nExisting Collections (${collections.length}):`);
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });

    // Create indexes for better performance
    console.log("\n🔧 Setting up indexes...");

    // Admin indexes
    await Admin.collection.createIndex({ email: 1 }, { unique: true });
    await Admin.collection.createIndex({ admindId: 1 });
    console.log("  ✓ Admin indexes created");

    // Patient indexes
    await Patient.collection.createIndex({ email: 1 });
    await Patient.collection.createIndex({ patientId: 1 });
    await Patient.collection.createIndex({ phoneNumber: 1 });
    console.log("  ✓ Patient indexes created");

    // Therapist indexes
    await Therapist.collection.createIndex({ email: 1 }, { unique: true });
    await Therapist.collection.createIndex({ therapistId: 1 });
    await Therapist.collection.createIndex({ specialization: 1 });
    await Therapist.collection.createIndex({ isVerified: 1 });
    await Therapist.collection.createIndex({ active: 1 });
    console.log("  ✓ Therapist indexes created");

    // Appointment indexes
    await Appointment.collection.createIndex({ patient: 1 });
    await Appointment.collection.createIndex({ therapist: 1 });
    await Appointment.collection.createIndex({ date: 1 });
    await Appointment.collection.createIndex({ status: 1 });
    await Appointment.collection.createIndex({ patient: 1, therapist: 1, date: 1 });
    console.log("  ✓ Appointment indexes created");

    // Payment indexes
    await Payment.collection.createIndex({ appointment: 1 }, { unique: true });
    await Payment.collection.createIndex({ status: 1 });
    console.log("  ✓ Payment indexes created");

    // Availability indexes
    await Availability.collection.createIndex({ therapist: 1 });
    await Availability.collection.createIndex({ isActive: 1 });
    console.log("  ✓ Availability indexes created");

    // SessionNote indexes
    await SessionNote.collection.createIndex({ appointment: 1 });
    console.log("  ✓ SessionNote indexes created");

    // TherapistRating indexes
    await TherapistRating.collection.createIndex({ therapist: 1 });
    await TherapistRating.collection.createIndex({ patient: 1 });
    await TherapistRating.collection.createIndex({ patient: 1, therapist: 1 });
    console.log("  ✓ TherapistRating indexes created");

    // Get collection stats
    console.log("\n📈 Collection Statistics:");
    const collectionNames = [
      "admins",
      "patients",
      "therapists",
      "appointments",
      "payments",
      "availabilities",
      "sessionnotes",
      "therapistratings",
    ];

    for (const name of collectionNames) {
      try {
        const count = await db.collection(name).countDocuments();
        console.log(`  - ${name}: ${count} documents`);
      } catch (error) {
        console.log(`  - ${name}: Collection doesn't exist yet`);
      }
    }

    console.log("\n✨ Database initialization completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("  1. Your local MongoDB is running at: mongodb://localhost:27017");
    console.log("  2. Database name: mobirehab");
    console.log("  3. You can start your backend server now");
    console.log("  4. Use MongoDB Compass to view your data: mongodb://localhost:27017/mobirehab");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error initializing database:", error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the initialization
initDatabase();
